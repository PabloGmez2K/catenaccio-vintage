-- ============================================================
-- CATENACCIO STUDIO — Supabase/Postgres MVP Schema
-- Sesión 019 — 2026-06-27
-- Motor: Claude Code (Sonnet)
-- Estado: DOCUMENTAL — para aplicar al crear el proyecto Supabase real (S021)
-- NO ejecutar contra ninguna base de datos remota en esta sesión.
-- ============================================================

-- ============================================================
-- ENUMS — estados y clasificaciones del negocio
-- ============================================================

-- Pipeline de vida de una camiseta (11 estados de STOCK_OPERATIONS_MODEL.md §2)
CREATE TYPE item_status AS ENUM (
    'comprada',
    'pendiente_fotos',
    'fotos_hechas',
    'pendiente_descripcion',
    'borrador_web',
    'pendiente_web',
    'publicada_web',
    'pendiente_vinted',
    'publicada_vinted',
    'reservada',
    'vendida',
    'archivada'
);

-- Estado de las fotos de la camiseta
CREATE TYPE photo_status AS ENUM (
    'sin_hacer',
    'hechas_local',       -- MVP: fotos en carpeta local del PC de Pablo
    'subidas_studio',     -- FUTURO: Supabase Storage bucket
    'asignadas_wc'        -- subidas a WP Media Library + asignadas al producto WC
);

-- Estado de la sugerencia generada por IA
CREATE TYPE ai_suggestion_status AS ENUM (
    'generando',
    'generado',
    'aprobado',
    'rechazado',
    'editado_aprobado'    -- Pablo editó el texto de Claude y lo aprobó
);

-- Estado de sincronización con WooCommerce
CREATE TYPE wc_sync_status AS ENUM (
    'no_sincronizado',
    'borrador_creado',    -- POST /wc/v3/products con status=draft ejecutado OK
    'publicado',          -- Pablo publicó desde WP Admin
    'error_sync',         -- fallo al crear/actualizar el producto en WC
    'archivado_wc'        -- producto archivado/eliminado en WC
);

-- Estado de publicación en Vinted (siempre manual)
CREATE TYPE vinted_status AS ENUM (
    'no_aplica',
    'pendiente',          -- publicada en web, pendiente de subir a Vinted
    'publicada',
    'vendida_vinted',
    'retirada'
);

-- Canal de venta final
CREATE TYPE sale_channel AS ENUM (
    'web',
    'vinted',
    'otro'
);

-- Quién disparó un evento del ciclo de vida
CREATE TYPE lifecycle_trigger AS ENUM (
    'pablo',
    'agente',
    'sistema'
);

-- ============================================================
-- FUNCIÓN: updated_at automático
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- CAPA GENÉRICA — reutilizable para cualquier negocio de lafabrica
-- ============================================================

-- 1. WORKSPACES — unidad de negocio / tenant
--    En MVP: una sola fila = Catenaccio Vintage.
--    Preparado para multi-tenant (marketplace futuro PEND-2).
CREATE TABLE workspaces (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    metadata    JSONB NOT NULL DEFAULT '{}',     -- extensible sin ALTER TABLE
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_workspaces_updated_at
    BEFORE UPDATE ON workspaces
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 2. INVENTORY_ITEMS — núcleo del PIM, entidad genérica
--    Cada camiseta = 1 fila. Sin variantes (cada camiseta vintage es única).
--    La extensión Catenaccio vive en football_shirt_details (1:1).
CREATE TABLE inventory_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    owner_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,

    -- Identificación interna
    referencia      TEXT NOT NULL,                      -- "Real Madrid Home 2001-02 (L)"
    item_type       TEXT NOT NULL DEFAULT 'football_shirt',  -- extensible a otros tipos de negocio

    -- Pipeline de estados (campo central)
    status          item_status NOT NULL DEFAULT 'comprada',

    -- Adquisición y coste
    fecha_compra    DATE NOT NULL,
    proveedor       TEXT,
    coste           NUMERIC(10,2) NOT NULL CHECK (coste >= 0),
    notas_compra    TEXT,

    -- Precios (margen_esperado y margen_real = computed view, no columnas)
    precio_objetivo             NUMERIC(10,2) CHECK (precio_objetivo >= 0),
    precio_publicado_web        NUMERIC(10,2) CHECK (precio_publicado_web >= 0),
    precio_publicado_vinted     NUMERIC(10,2) CHECK (precio_publicado_vinted >= 0),
    precio_vendido              NUMERIC(10,2) CHECK (precio_vendido >= 0),

    -- Fotos (MVP: Opción A — ruta local; FUTURO: Opción C — Supabase Storage)
    carpeta_local   TEXT,           -- "Stock/Original/Real Madrid 2001-02"
    photo_status    photo_status NOT NULL DEFAULT 'sin_hacer',
    photo_notes     TEXT,

    -- Puente WooCommerce (campos de bridge, no llamadas API aquí)
    wc_product_id           INTEGER UNIQUE,             -- ID producto en WC (post-creación)
    wc_status               wc_sync_status NOT NULL DEFAULT 'no_sincronizado',
    wc_draft_created_at     TIMESTAMPTZ,
    wc_last_sync_at         TIMESTAMPTZ,
    wc_error                TEXT,                       -- mensaje de error del último intento
    wc_payload_snapshot     JSONB,                      -- último payload enviado a WC (debug + audit)

    -- Vinted (tracking manual — Vinted no tiene API pública de publicación)
    vinted_status           vinted_status NOT NULL DEFAULT 'no_aplica',
    vinted_url              TEXT,
    vinted_price            NUMERIC(10,2) CHECK (vinted_price >= 0),
    vinted_published_at     TIMESTAMPTZ,
    vinted_notes            TEXT,

    -- Venta
    canal_venta     sale_channel,
    fecha_venta     DATE,

    -- Operativo interno
    ubicacion_fisica    TEXT,       -- "Caja azul 2ª estantería"
    notas_internas      TEXT,       -- no se publica, uso interno de Pablo

    -- Timestamps de publicación
    fecha_publicacion_web       TIMESTAMPTZ,
    fecha_publicacion_vinted    TIMESTAMPTZ,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3. AI_SUGGESTIONS — sugerencias IA versionadas por ítem
--    Una camiseta puede tener múltiples versiones (rechazo → regeneración).
--    La activa es la de mayor version con status='aprobado' o 'editado_aprobado'.
CREATE TABLE ai_suggestions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id         UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    owner_id        UUID NOT NULL REFERENCES auth.users(id),

    version         INTEGER NOT NULL DEFAULT 1,
    status          ai_suggestion_status NOT NULL DEFAULT 'generando',

    -- Contenido generado
    titulo_seo          TEXT,           -- EN: "2014-15 France Away Shirt (XXL)"
    descripcion_larga   TEXT,           -- ES: descripción completa lista para WC
    precio_sugerido     NUMERIC(10,2),  -- sugerencia de precio del mercado
    notas_tasacion      TEXT,           -- razonamiento del precio (para Pablo)

    -- Metadatos de la llamada IA (para auditoría y mejora de prompts)
    model_used          TEXT NOT NULL,      -- 'claude-sonnet-4-6', 'claude-opus-4-8', etc.
    prompt_version      TEXT,               -- 'v1.0' — versión del prompt de Studio
    input_context       JSONB,              -- qué datos se enviaron al modelo (sin PII sensible)
    model_confidence    TEXT,               -- nota de confianza/razonamiento del modelo

    -- Revisión de Pablo
    reviewed_by         UUID REFERENCES auth.users(id),
    reviewed_at         TIMESTAMPTZ,
    review_notes        TEXT,               -- comentarios de edición de Pablo

    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (item_id, version)
);

-- 4. ITEM_LIFECYCLE_EVENTS — trazabilidad completa (AI-first audit trail)
--    Registro inmutable de cada transición de estado y evento relevante.
--    Es la memoria del sistema: qué pasó, cuándo, quién lo disparó.
CREATE TABLE item_lifecycle_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id         UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    owner_id        UUID NOT NULL REFERENCES auth.users(id),

    -- Tipo de evento (open-ended para extensibilidad sin ALTER TABLE)
    event_type      TEXT NOT NULL,
    -- Valores esperados: 'status_change', 'ai_request', 'ai_approved', 'ai_rejected',
    --                    'wc_sync_ok', 'wc_sync_error', 'photo_update', 'price_change',
    --                    'vinted_published', 'sold', 'archived'

    from_status     item_status,        -- estado anterior (null si es el primer evento)
    to_status       item_status,        -- estado nuevo
    triggered_by    lifecycle_trigger NOT NULL DEFAULT 'pablo',
    payload         JSONB NOT NULL DEFAULT '{}',    -- datos específicos del evento
    notes           TEXT,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    -- Sin updated_at — los eventos son inmutables
);

-- 5. MEDIA_ASSETS — fotos y archivos asociados a un ítem
--    MVP: referencia local (local_path + filename).
--    FUTURO: Supabase Storage (storage_bucket + storage_path + public_url).
CREATE TABLE media_assets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id         UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    owner_id        UUID NOT NULL REFERENCES auth.users(id),

    -- Referencia local (MVP)
    local_path      TEXT,               -- "Stock/Original/Real Madrid 2001-02/IMG_001.jpg"
    filename        TEXT NOT NULL,

    -- Ordenación y rol
    sort_order      INTEGER NOT NULL DEFAULT 0,
    is_primary      BOOLEAN NOT NULL DEFAULT FALSE,

    -- Supabase Storage (FUTURO — dejar nulo en MVP)
    storage_bucket  TEXT,               -- 'item-photos'
    storage_path    TEXT,               -- '{workspace_id}/{item_id}/{filename}'
    public_url      TEXT,

    -- WooCommerce Media Library (post-upload)
    wc_media_id     INTEGER,            -- ID en WP Media Library

    -- Estado del archivo
    upload_status   TEXT NOT NULL DEFAULT 'local',
    -- Valores: 'local', 'uploading', 'uploaded_storage', 'wc_assigned'

    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_media_assets_updated_at
    BEFORE UPDATE ON media_assets
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- CAPA ESPECÍFICA CATENACCIO — extensión de inventory_items
-- ============================================================

-- 6. FOOTBALL_SHIRT_DETAILS — atributos específicos de camiseta vintage de fútbol
--    Relación 1:1 con inventory_items.
--    Los atributos WC (liga, equipo, temporada, jugador) se almacenan como term IDs
--    (string), igual que en el contrato meta_data real de la tienda (ver API_READONLY_PROBE_RESULT.md §5).
--    talla y condicion son strings directos (no term IDs en WC).
CREATE TABLE football_shirt_details (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id         UUID NOT NULL UNIQUE REFERENCES inventory_items(id) ON DELETE CASCADE,
    workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    owner_id        UUID NOT NULL REFERENCES auth.users(id),

    -- Atributos WooCommerce — mapeo a meta_data (ver CATENACCIO_STUDIO_TARGET.md §3)
    -- liga, equipo, temporada, jugador → term IDs de pa_* (string numérico o vacío)
    -- talla, condicion → strings directos
    liga                TEXT,               -- pa_liga term ID; vacío para selecciones nacionales
    liga_display        TEXT,               -- nombre legible (cache local, evita re-fetch a WC)
    equipo              TEXT NOT NULL,      -- pa_equipo term ID
    equipo_display      TEXT,
    temporada           TEXT NOT NULL,      -- pa_ano term ID
    temporada_display   TEXT,
    talla               TEXT NOT NULL,      -- 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Única'
    marca               TEXT,              -- pa_marca term ID o string
    marca_display       TEXT,
    condicion           TEXT NOT NULL,      -- 'Mint', 'Excelente', 'Muy buena', 'Buena', 'Aceptable'
    jugador             TEXT,              -- pa_jugador term ID o vacío
    jugador_display     TEXT,

    -- Metadatos vintage
    es_match_worn           BOOLEAN NOT NULL DEFAULT FALSE,
    es_replica              BOOLEAN NOT NULL DEFAULT FALSE,
    tiene_etiquetas         BOOLEAN NOT NULL DEFAULT FALSE,
    tiene_parches           BOOLEAN NOT NULL DEFAULT FALSE,
    parches_descripcion     TEXT,
    numero_dorsal           TEXT,
    nombre_dorsal           TEXT,

    -- Medidas (opcionales — útiles para guías de tallas futuras)
    largo_cm    NUMERIC(5,1),
    ancho_cm    NUMERIC(5,1),

    -- Informe de condición y autenticidad
    condicion_notas     TEXT,   -- manchas, desgastes, detalles específicos
    autenticidad        TEXT,   -- notas de verificación de autenticidad

    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_football_shirt_details_updated_at
    BEFORE UPDATE ON football_shirt_details
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ÍNDICES — patrones de acceso del MVP
-- ============================================================

-- inventory_items: filtros principales de la vista de inventario
CREATE INDEX idx_ii_workspace_status      ON inventory_items(workspace_id, status);
CREATE INDEX idx_ii_owner                 ON inventory_items(owner_id);
CREATE INDEX idx_ii_status                ON inventory_items(status);
CREATE INDEX idx_ii_fecha_compra          ON inventory_items(fecha_compra DESC);
CREATE INDEX idx_ii_wc_product_id         ON inventory_items(wc_product_id) WHERE wc_product_id IS NOT NULL;
CREATE INDEX idx_ii_vinted_pendiente      ON inventory_items(vinted_status) WHERE vinted_status = 'pendiente';
CREATE INDEX idx_ii_wc_error              ON inventory_items(wc_status) WHERE wc_status = 'error_sync';

-- ai_suggestions: consultar la sugerencia más reciente de un ítem
CREATE INDEX idx_ai_item_version          ON ai_suggestions(item_id, version DESC);
CREATE INDEX idx_ai_status                ON ai_suggestions(status);

-- lifecycle_events: timeline de un ítem + auditoría global
CREATE INDEX idx_lce_item_created         ON item_lifecycle_events(item_id, created_at DESC);
CREATE INDEX idx_lce_workspace_created    ON item_lifecycle_events(workspace_id, created_at DESC);
CREATE INDEX idx_lce_event_type           ON item_lifecycle_events(event_type);

-- media_assets: foto principal de un ítem (lookup frecuente en vista de inventario)
CREATE INDEX idx_ma_item_primary          ON media_assets(item_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX idx_ma_item_order            ON media_assets(item_id, sort_order);

-- football_shirt_details: filtros de catálogo
CREATE INDEX idx_fsd_equipo               ON football_shirt_details(equipo);
CREATE INDEX idx_fsd_temporada            ON football_shirt_details(temporada);
CREATE INDEX idx_fsd_liga                 ON football_shirt_details(liga) WHERE liga IS NOT NULL AND liga != '';
CREATE INDEX idx_fsd_condicion            ON football_shirt_details(condicion);

-- ============================================================
-- VISTA CALCULADA — márgenes (margen_esperado y margen_real no se almacenan)
-- ============================================================

CREATE OR REPLACE VIEW inventory_margins AS
SELECT
    i.id,
    i.workspace_id,
    i.owner_id,
    i.referencia,
    i.status,
    i.coste,
    i.precio_objetivo,
    i.precio_vendido,
    ROUND((COALESCE(i.precio_objetivo, 0) - i.coste)::NUMERIC, 2)                       AS margen_esperado,
    CASE
        WHEN i.precio_vendido IS NOT NULL
        THEN ROUND((i.precio_vendido - i.coste)::NUMERIC, 2)
        ELSE NULL
    END                                                                                   AS margen_real,
    CASE
        WHEN i.precio_objetivo > 0
        THEN ROUND(((i.precio_objetivo - i.coste) / i.precio_objetivo * 100)::NUMERIC, 1)
        ELSE NULL
    END                                                                                   AS margen_pct_esperado
FROM inventory_items i;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
-- MVP: single owner (Pablo). auth.uid() = owner_id.
-- FUTURO: workspace membership table + workspace_id check.
-- Ver STUDIO_RLS_POLICY_PLAN.md para el threat model y evolución.

ALTER TABLE workspaces              ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE football_shirt_details  ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_lifecycle_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets            ENABLE ROW LEVEL SECURITY;

-- Política MVP: el propietario ve y opera solo sus propias filas.
-- service_role (backend de Next.js) bypasea RLS por defecto en Supabase — ver RLS_POLICY_PLAN.md.

CREATE POLICY pol_workspaces_owner
    ON workspaces FOR ALL
    USING (auth.uid() = owner_id);

CREATE POLICY pol_inventory_items_owner
    ON inventory_items FOR ALL
    USING (auth.uid() = owner_id);

CREATE POLICY pol_fsd_owner
    ON football_shirt_details FOR ALL
    USING (auth.uid() = owner_id);

CREATE POLICY pol_lifecycle_events_owner
    ON item_lifecycle_events FOR ALL
    USING (auth.uid() = owner_id);

CREATE POLICY pol_ai_suggestions_owner
    ON ai_suggestions FOR ALL
    USING (auth.uid() = owner_id);

CREATE POLICY pol_media_assets_owner
    ON media_assets FOR ALL
    USING (auth.uid() = owner_id);

-- ============================================================
-- STORAGE BUCKET (Supabase Storage — FUTURO, no ejecutar en MVP)
-- ============================================================
-- Descomentar cuando Pablo esté listo para subir fotos desde Studio.
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('item-photos', 'item-photos', FALSE);
--
-- CREATE POLICY pol_storage_owner_upload
--     ON storage.objects FOR INSERT
--     WITH CHECK (auth.uid()::TEXT = (storage.foldername(name))[1]);
--
-- CREATE POLICY pol_storage_owner_read
--     ON storage.objects FOR SELECT
--     USING (auth.uid()::TEXT = (storage.foldername(name))[1]);

-- ============================================================
-- DATOS DE SEED — workspace inicial Catenaccio Vintage
-- ============================================================
-- Ejecutar manualmente tras crear el proyecto Supabase y verificar auth.uid() de Pablo.
-- Reemplazar 'PABLO_AUTH_UID_HERE' con el UUID real del usuario.
--
-- INSERT INTO workspaces (name, slug, owner_id)
-- VALUES ('Catenaccio Vintage', 'catenaccio-vintage', 'PABLO_AUTH_UID_HERE');
