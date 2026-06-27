# STUDIO_DATA_MODEL — Catenaccio Studio

Modelo de datos MVP de Catenaccio Studio en Supabase/Postgres.

**Proyecto:** Catenaccio Vintage  
**Fecha:** 2026-06-27  
**Sesión:** 019 — STUDIO_DATA_MODEL  
**Estado:** APROBADO — APPROVE_READY_FOR_S020_WC_BRIDGE_CONTRACT  
**Depende de:** `STOCK_OPERATIONS_MODEL.md`, `CATENACCIO_STUDIO_TARGET.md`, `API_READONLY_PROBE_RESULT.md`  
**SQL canónico:** `docs/studio/STUDIO_SUPABASE_SCHEMA_MVP.sql`

---

## 1. Resumen ejecutivo

El modelo de datos de Catenaccio Studio es un **PIM (Product Information Manager) AI-first** diseñado sobre Supabase/Postgres. Cada camiseta vintage es una entidad central (`inventory_items`) con una extensión específica (`football_shirt_details`), un pipeline de 12 estados, contenido generado por IA versionado (`ai_suggestions`), trazabilidad completa de eventos (`item_lifecycle_events`), y preparación para sincronizar con WooCommerce como destino de publicación.

El modelo tiene **dos capas separadas explícitamente**:
1. **Capa genérica** — reutilizable para cualquier negocio de lafabrica con stock/inventario.
2. **Capa específica Catenaccio** — atributos de camiseta vintage, mapeo a WC meta_data, taxonomías de fútbol.

---

## 2. Principios del modelo

| Principio | Aplicación |
|-----------|-----------|
| **Supabase = fuente de verdad** | Los datos nacen y viven en Studio; WC es destino, no maestro. |
| **owner_id desde el día 1** | Preparado para marketplace sin construirlo. MVP: siempre Pablo. |
| **AI-first** | Los campos de IA son ciudadanos de primera clase: versionados, trazables, revisables. |
| **DRAFT_ONLY hacia WC** | Studio nunca publica directamente; Pablo aprueba. DEC-9. |
| **Sin variantes** | Cada camiseta vintage es única — 1 item = 1 fila, sin variante de talla/color. |
| **Extensible sin ALTER TABLE** | `metadata JSONB` en workspaces; `payload JSONB` en eventos. |
| **Margenes computados** | `margen_esperado` y `margen_real` son vista, no columnas. |
| **Fotos MVP = local** | Opción A (ruta local) en MVP; Opción C (Supabase Storage) en segunda iteración. |

---

## 3. Modelo conceptual

```
┌─────────────────────────────────────────────────────────┐
│                    CAPA GENÉRICA                         │
│                                                          │
│  workspaces ────┐                                        │
│                  ├─► inventory_items ──────────────────┐ │
│                  │    │  • status (12 estados)          │ │
│                  │    │  • coste / precios              │ │
│                  │    │  • carpeta_local (fotos MVP)    │ │
│                  │    │  • wc_* (bridge fields)         │ │
│                  │    │  • vinted_* (manual tracking)   │ │
│                  │    │                                 │ │
│                  │    ├──► ai_suggestions (versioned)  │ │
│                  │    ├──► item_lifecycle_events        │ │
│                  │    └──► media_assets                 │ │
│                  │                                      │ │
└──────────────────┼──────────────────────────────────────┘ │
                   │                                         │
┌──────────────────┼─────────────────────────────────────┐  │
│   CAPA ESPECÍFICA CATENACCIO                            │  │
│                  │                                      │  │
│                  └──► football_shirt_details (1:1) ◄───┘  │
│                        • liga / equipo / temporada          │
│                        • talla / marca / condicion          │
│                        • jugador / dorsal / parches         │
│                        • medidas / autenticidad             │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Entidades — capa genérica

### 4.1 `workspaces`

Unidad de negocio / tenant. En MVP: una sola fila = Catenaccio Vintage.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID PK | Identificador del workspace |
| `name` | TEXT | "Catenaccio Vintage" |
| `slug` | TEXT UNIQUE | "catenaccio-vintage" |
| `owner_id` | UUID → auth.users | Propietario del workspace |
| `metadata` | JSONB | Datos extensibles (config, preferencias, etc.) |

### 4.2 `inventory_items`

Entidad central. Cada camiseta = 1 fila. Genérica para cualquier ítem de stock.

**Bloques de campos:**

**Identificación:**
| Campo | Descripción |
|-------|-------------|
| `referencia` | Nombre interno "Real Madrid Home 2001-02 (L)" |
| `item_type` | `'football_shirt'` en Catenaccio; extensible |
| `status` | Estado del pipeline (enum, campo central) |

**Adquisición:**
| Campo | Descripción |
|-------|-------------|
| `fecha_compra` | Fecha de compra |
| `proveedor` | A quién se compró |
| `coste` | Precio de adquisición (€) |
| `notas_compra` | "lote de 3", "condición incierta", etc. |

**Precios:**
| Campo | Descripción |
|-------|-------------|
| `precio_objetivo` | Precio que Pablo tiene en mente antes de publicar |
| `precio_publicado_web` | Precio live en catenacciovintage.com |
| `precio_publicado_vinted` | Precio en Vinted (puede diferir por comisiones) |
| `precio_vendido` | Precio final de venta |
| `margen_esperado` | **Calculado** = precio_objetivo - coste (vista) |
| `margen_real` | **Calculado** = precio_vendido - coste (vista, cuando VENDIDA) |

**Fotos (MVP):**
| Campo | Descripción |
|-------|-------------|
| `carpeta_local` | Ruta: "Stock/Original/Real Madrid 2001-02" |
| `photo_status` | `sin_hacer` → `hechas_local` → `subidas_studio` → `asignadas_wc` |
| `photo_notes` | Notas sobre las fotos (ej: "falta la foto del dorsal") |

**Puente WooCommerce:**
| Campo | Descripción |
|-------|-------------|
| `wc_product_id` | ID del producto en WC (post-creación vía API) |
| `wc_status` | `no_sincronizado` → `borrador_creado` → `publicado` → `error_sync` |
| `wc_draft_created_at` | Cuándo se creó el borrador en WC |
| `wc_last_sync_at` | Último sync OK con WC |
| `wc_error` | Mensaje de error del último intento fallido |
| `wc_payload_snapshot` | JSONB: último payload enviado (debug + auditoría) |

**Vinted (manual):**
| Campo | Descripción |
|-------|-------------|
| `vinted_status` | `no_aplica` / `pendiente` / `publicada` / `vendida_vinted` / `retirada` |
| `vinted_url` | URL del listing en Vinted (manual) |
| `vinted_price` | Precio en Vinted |
| `vinted_published_at` | Cuándo se publicó en Vinted |
| `vinted_notes` | Notas sobre el listing de Vinted |

**Venta:**
| Campo | Descripción |
|-------|-------------|
| `canal_venta` | `web` / `vinted` / `otro` |
| `fecha_venta` | Fecha de venta confirmada |

**Operativo:**
| Campo | Descripción |
|-------|-------------|
| `ubicacion_fisica` | "Caja azul 2ª estantería" |
| `notas_internas` | Cualquier nota interna de Pablo (no se publica) |

### 4.3 `ai_suggestions`

Sugerencias IA versionadas por ítem. Una camiseta puede tener múltiples versiones (Pablo rechaza → Claude regenera).

| Campo | Descripción |
|-------|-------------|
| `version` | Número de versión (1, 2, 3…) |
| `status` | `generando` → `generado` → `aprobado` / `rechazado` / `editado_aprobado` |
| `titulo_seo` | EN: "2014-15 France Away Shirt (XXL)" |
| `descripcion_larga` | ES: descripción completa lista para WooCommerce |
| `precio_sugerido` | Precio de mercado sugerido por Claude |
| `notas_tasacion` | Razonamiento del precio (para Pablo) |
| `model_used` | Modelo usado: `'claude-sonnet-4-6'`, `'claude-opus-4-8'` |
| `prompt_version` | Versión del prompt de Studio: `'v1.0'` |
| `input_context` | JSONB: datos enviados al modelo (trazabilidad) |
| `reviewed_by` / `reviewed_at` | Quién y cuándo revisó |
| `review_notes` | Comentarios de edición de Pablo |

**La sugerencia activa** = `MAX(version)` WHERE `status IN ('aprobado', 'editado_aprobado')`.

### 4.4 `item_lifecycle_events`

Trazabilidad inmutable de todo lo que ocurre con un ítem. Sin `updated_at` (los eventos no se modifican).

| Campo | Descripción |
|-------|-------------|
| `event_type` | String open-ended: `'status_change'`, `'ai_request'`, `'wc_sync_ok'`, `'wc_sync_error'`, `'photo_update'`, `'price_change'`, `'sold'`, `'archived'` |
| `from_status` / `to_status` | Transición de estado |
| `triggered_by` | `pablo` / `agente` / `sistema` |
| `payload` | JSONB con datos específicos del evento |
| `notes` | Nota libre sobre el evento |

### 4.5 `media_assets`

Referencias a fotos. MVP: solo `local_path`. Futuro: Supabase Storage.

| Campo | Descripción |
|-------|-------------|
| `local_path` | "Stock/Original/Real Madrid 2001-02/IMG_001.jpg" |
| `filename` | Nombre del archivo |
| `sort_order` | Orden de presentación |
| `is_primary` | Foto principal del ítem |
| `storage_bucket` / `storage_path` / `public_url` | Supabase Storage (FUTURO) |
| `wc_media_id` | ID en WP Media Library (post-upload) |
| `upload_status` | `'local'` → `'uploading'` → `'uploaded_storage'` → `'wc_assigned'` |

---

## 5. Entidades — capa específica Catenaccio

### 5.1 `football_shirt_details`

Extensión 1:1 de `inventory_items`. Contiene todo lo específico de una camiseta de fútbol vintage.

**Atributos WooCommerce (meta_data mapping):**

Los atributos de taxonomía WC (`pa_liga`, `pa_equipo`, `pa_ano`, `pa_jugador`) se almacenan como **term IDs** (string numérico) en `meta_data` de WC, siguiendo el contrato real de la tienda (ver `API_READONLY_PROBE_RESULT.md §5`). `talla` y `condicion` son strings directos.

| Campo Studio | meta_data WC | Tipo en WC | Ejemplo |
|-------------|-------------|------------|---------|
| `liga` | `liga` | term ID | `""` (selección) / `"72"` (LaLiga) |
| `equipo` | `equipo` | term ID | `"129"` (Francia) |
| `temporada` | `ano_temporada` | term ID | `"139"` |
| `talla` | `talla` | string | `"XXL"` |
| `condicion` | `condicion` | string | `"Excelente"` |
| `jugador` | `jugador` | term ID | `""` |

Campos `*_display` (ej. `liga_display`, `equipo_display`): cache del nombre legible, evitan re-fetch a WC en cada render.

**Metadata vintage:**

| Campo | Descripción |
|-------|-------------|
| `es_match_worn` | ¿Jugada por un jugador real? |
| `es_replica` | ¿Es réplica o versión de aficionado? |
| `tiene_etiquetas` | ¿Conserva etiquetas originales? |
| `tiene_parches` | ¿Tiene parches (liga, copa…)? |
| `parches_descripcion` | Descripción de los parches |
| `numero_dorsal` / `nombre_dorsal` | Nombre/número estampado |
| `largo_cm` / `ancho_cm` | Medidas (opcional) |
| `condicion_notas` | Detalle de estado (manchas, desgastes) |
| `autenticidad` | Notas de autenticidad / verificación |

---

## 6. Pipeline de estados

Los 12 estados del ciclo de vida de una camiseta, alineados con `STOCK_OPERATIONS_MODEL.md §2`:

```
comprada
    ↓
pendiente_fotos      ← Pablo tiene la camiseta, sin fotografiar
    ↓
fotos_hechas         ← Fotos tomadas, carpeta_local registrada
    ↓
pendiente_descripcion ← Claude aún no ha generado descripción/precio
    ↓
borrador_web         ← Borrador creado en WC (status=draft)
    ↓
pendiente_web        ← Pablo revisó el borrador, listo para publicar
    ↓
publicada_web        ← Live en catenacciovintage.com
    ↓
pendiente_vinted     ← Publicada en web, falta subir a Vinted
    ↓
publicada_vinted     ← Live en ambos canales
    ↓
reservada            ← Con comprador, fuera de venta activa
    ↓
vendida              ← Venta completada
    ↓
archivada            ← Retirada del catálogo, historial preservado
```

**Notas:**
- `publicada_web` y `publicada_vinted` son independientes — se puede estar en uno sin el otro.
- `reservada` puede venir de cualquier canal; `canal_venta` registra cuál.
- `archivada` preserva coste/precio/margen para análisis histórico.

---

## 7. Relaciones

```
workspaces (1) ──────► (N) inventory_items
inventory_items (1) ─► (N) ai_suggestions
inventory_items (1) ─► (N) item_lifecycle_events
inventory_items (1) ─► (N) media_assets
inventory_items (1) ──► (1) football_shirt_details
```

Todas las entidades llevan `workspace_id` y `owner_id` para RLS y futuro multi-tenant.

---

## 8. Índices recomendados

| Índice | Patrón de uso |
|--------|--------------|
| `(workspace_id, status)` | Vista de inventario filtrada por estado |
| `(owner_id)` | RLS + queries multi-tenant futuras |
| `(wc_product_id)` | Lookup de sync WC (solo filas con ID) |
| `(vinted_status) WHERE = 'pendiente'` | Alerta "falta publicar en Vinted" |
| `(wc_status) WHERE = 'error_sync'` | Dashboard de errores de sync |
| `(item_id, version DESC)` en ai_suggestions | Sugerencia más reciente |
| `(item_id, is_primary)` en media_assets | Foto principal en lista |
| `(equipo)` en football_shirt_details | Filtro de catálogo por equipo |

---

## 9. RLS (Row Level Security)

MVP: `auth.uid() = owner_id` en todas las tablas.

Ver `STUDIO_RLS_POLICY_PLAN.md` para el threat model completo, políticas por tabla, boundaries de service_role y evolución hacia workspace membership.

---

## 10. Hooks AI-first

Los siguientes campos/eventos están diseñados específicamente para asistencia por agentes:

**Campos de estado para agentes:**
- `status` — el agente sabe en qué etapa está la camiseta y qué acción puede sugerir.
- `photo_status` — el agente sabe si puede pedir descripción o si faltan fotos.
- `wc_status` + `wc_error` — el agente puede diagnosticar fallos de sync sin intervención de Pablo.
- `ai_suggestion_status` — el agente sabe si ya generó, si fue rechazado, si necesita regenerar.

**Eventos para agentes:**
- `item_lifecycle_events.triggered_by = 'agente'` — trazabilidad de qué hizo el agente.
- `item_lifecycle_events.payload` — contexto completo del evento (qué modelo, qué versión de prompt, qué resultado).
- `ai_suggestions.input_context` — qué se le dio al modelo (reproducibilidad + debug de prompts).
- `ai_suggestions.model_used` + `prompt_version` — para A/B de prompts en el futuro.

**Flujo AI-first de una camiseta:**
```
1. Pablo crea item (status: comprada)
2. Pablo registra fotos (status: fotos_hechas)
3. Pablo pulsa "Sugerir con Claude":
   → Studio llama a Claude API con atributos del item
   → Se crea fila en ai_suggestions (version=1, status='generando')
   → Claude responde → status='generado'
   → evento: 'ai_request' en lifecycle_events
4. Pablo revisa → aprueba o edita
   → ai_suggestions.status = 'aprobado' / 'editado_aprobado'
   → evento: 'ai_approved' / 'ai_rejected'
   → status del item: pendiente_descripcion → borrador_web
5. Studio llama WC REST API → crea producto draft
   → wc_product_id asignado, wc_status='borrador_creado'
   → evento: 'wc_sync_ok' o 'wc_sync_error' con payload del error
```

---

## 11. Preparación puente WooCommerce (S020)

Los campos de bridge están listos en el schema pero la implementación de llamadas API es S020.

**Campos preparados:**
- `wc_product_id`, `wc_status`, `wc_draft_created_at`, `wc_last_sync_at`, `wc_error`, `wc_payload_snapshot`.
- `football_shirt_details`: `liga`, `equipo`, `temporada`, `talla`, `condicion`, `jugador` + display cache.

**Mapeo meta_data (contrato de S020):**

```json
{
  "name": "{{titulo_seo}}",
  "status": "draft",
  "regular_price": "{{precio_publicado_web}}",
  "description": "{{ai_suggestions.descripcion_larga}}",
  "meta_data": [
    { "key": "liga",           "value": "{{football_shirt_details.liga}}" },
    { "key": "equipo",         "value": "{{football_shirt_details.equipo}}" },
    { "key": "ano_temporada",  "value": "{{football_shirt_details.temporada}}" },
    { "key": "talla",          "value": "{{football_shirt_details.talla}}" },
    { "key": "condicion",      "value": "{{football_shirt_details.condicion}}" },
    { "key": "jugador",        "value": "{{football_shirt_details.jugador}}" },
    { "key": "descripcion_del_producto", "value": "{{ai_suggestions.descripcion_larga}}" }
  ]
}
```

**Prerequisito S020:** `WC_API_WRITE_ACCESS_TEST` — probar `POST /wc/v3/products` con `status=draft` contra 1 producto de prueba antes de operar en real. Ver `CATENACCIO_STUDIO_TARGET.md §3`.

---

## 12. MVP scope — qué entra en el schema

| Entidad | MVP | Nota |
|---------|-----|------|
| `workspaces` | ✅ | 1 fila seed |
| `inventory_items` | ✅ | Tabla central |
| `football_shirt_details` | ✅ | Extensión 1:1 |
| `ai_suggestions` | ✅ | Versioned por ítem |
| `item_lifecycle_events` | ✅ | Audit trail |
| `media_assets` | ✅ (solo local) | storage_* NULL en MVP |
| `publication_channels` | ❌ DEFER | Inline en inventory_items (web + vinted flags) |
| `pricing_snapshots` | ❌ DEFER | Inline precio_objetivo etc. + vista margenes |
| `workspace_members` | ❌ DEFER | Solo Pablo en MVP — owner_id directo |
| Supabase Storage bucket | ❌ DEFER | Opción C = segunda iteración |

---

## 13. Lista de diferidos

| Feature | Razón de diferir |
|---------|-----------------|
| Supabase Storage (fotos remotas) | MVP funciona con carpeta local. Añadir cuando Studio esté en uso real. |
| `workspace_members` (multi-usuario) | Solo Pablo en MVP. Añadir antes de abrir marketplace (PEND-2). |
| `publication_channels` / `channel_publications` | Los dos canales activos (web + Vinted) son manejables inline. |
| `pricing_snapshots` (historial de precios) | No hay necesidad en MVP de un solo vendedor. |
| Variantes de producto | Cada camiseta vintage es única — 1 item = 1 producto. Sin variantes. |
| Importador CSV desde Excel | Primero ver columnas reales de STOCK.xlsx. S025+ |
| App móvil / notificaciones push | Post-MVP. Pablo trabaja desde ordenador. |

---

## 14. Preguntas abiertas

| Pregunta | Impacto | Responder en |
|----------|---------|-------------|
| ¿Columnas reales de STOCK.xlsx de Pablo? | Diseño del importador CSV | Antes de S025 (importación inicial) |
| ¿Ruta exacta de carpetas de fotos en el PC de Pablo? | Campo `carpeta_local` correcto | S021 al configurar Studio |
| ¿Quiere Pablo `largo_cm` / `ancho_cm` en el formulario inicial? | MVP scope | S022 al diseñar el form |
| ¿El precio en WC se sube en cents (4500) o euros (45.00)? | Conversión en el puente | Confirmado en probe: enteros en EUR (45 = €45) |

---

## 15. Criterio de aceptación de S019

- [x] Schema Supabase MVP definido (tablas, enums, índices, triggers, RLS, vista).
- [x] SQL documental creado (`STUDIO_SUPABASE_SCHEMA_MVP.sql`).
- [x] Capa genérica vs. capa Catenaccio separadas y documentadas.
- [x] AI-first hooks documentados (campos, eventos, flujo).
- [x] WooCommerce bridge preparado (campos + mapeo meta_data).
- [x] RLS plan en `STUDIO_RLS_POLICY_PLAN.md`.
- [x] Decisiones de modelado en `STUDIO_DATA_MODEL_DECISIONS.md`.
- [x] DEC-13 confirmada por Pablo en DECISIONS.md.
- [x] BACKLOG.md, CONTEXTO.md, HISTORIAL_SESIONES.md actualizados.

---

## 16. Prerequisites de S020

Antes de implementar el puente Studio → WooCommerce (S020):

1. **Schema aplicado** — Pablo crea proyecto Supabase y ejecuta `STUDIO_SUPABASE_SCHEMA_MVP.sql`.
2. **WC_API_WRITE_ACCESS_TEST** — probar `POST /wc/v3/products status=draft` con 1 producto de prueba.
3. **Term IDs actualizados** — resolver IDs de todos los terms en pa_liga, pa_equipo, pa_ano, pa_jugador desde `GET /wc/v3/products/attributes/{id}/terms` (parcialmente en `API_READONLY_PROBE_RESULT.md §4`).
4. **PATTERN-08** (email gate) — verificar WP Mail SMTP antes de cualquier modificación de config WooCommerce. Ver `LAFABRICA_ADOPTION.md §4`.

---

*Sesión 019 — 2026-06-27 — Claude Code (Sonnet). Modo LOCAL_SCHEMA_DESIGN_ONLY / DOCS_AND_SQL_PLAN / NO_REMOTE_WRITE.*
