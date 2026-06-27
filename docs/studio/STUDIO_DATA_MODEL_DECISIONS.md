# STUDIO_DATA_MODEL_DECISIONS — Catenaccio Studio

Registro de decisiones de modelado tomadas en S019, alternativas descartadas, tradeoffs y diferidos.

**Proyecto:** Catenaccio Vintage  
**Fecha:** 2026-06-27  
**Sesión:** 019 — STUDIO_DATA_MODEL

---

## DM-01 — Modelo elegido: extensión 1:1 sobre entidad genérica

**Decisión:** `inventory_items` como entidad genérica + `football_shirt_details` como extensión 1:1 específica de Catenaccio.

**Alternativas descartadas:**

| Alternativa | Por qué no |
|------------|-----------|
| Todo en una sola tabla `shirts` | No genérico. No reutilizable para lafabrica. `item_type` no tiene sentido como columna si la tabla solo puede tener shirts. |
| Herencia PostgreSQL (`INHERITS`) | Feature oscura de Postgres. Mal soporte en ORMs (Prisma, Drizzle). Complejidad sin beneficio en MVP. |
| JSONB para atributos específicos en `inventory_items` | Pierde tipado, validación y búsqueda eficiente. Los atributos de camiseta son conocidos y estables. |

**Tradeoff:** el JOIN entre `inventory_items` y `football_shirt_details` añade una operación extra en cada consulta. Aceptable — el volumen del MVP (decenas de items) es trivial para Postgres.

---

## DM-02 — Sin variantes de producto

**Decisión:** 1 camiseta = 1 fila en `inventory_items`. Sin tabla de variantes.

**Razonamiento:** Cada camiseta vintage es única. No hay "talla L en 5 unidades" — hay 5 camisetas diferentes, cada una con su propia condición, historia y precio. El modelo de variantes (1 product + N variants por talla) es para retail de moda nueva, no para vintage.

**Alternativas descartadas:**
- Tabla `item_variants`: añade complejidad sin caso de uso en Catenaccio. Si Pablo compra 3 camisetas iguales (raro), son 3 filas separadas en `inventory_items` con `referencia` ligeramente diferente.

---

## DM-03 — AI suggestions en tabla separada, no inline

**Decisión:** `ai_suggestions` es una tabla separada con versioning (`version` INTEGER).

**Razonamiento:**
1. Pablo puede rechazar una sugerencia y pedir que Claude regenere. Necesitamos historial.
2. Los metadatos de la IA (`model_used`, `prompt_version`, `input_context`) son ruido en `inventory_items`.
3. Separar permite A/B de prompts en el futuro: comparar v1 vs v2 del prompt con datos reales.

**Alternativas descartadas:**
- Inline en `inventory_items` (columnas `ai_titulo_seo`, `ai_descripcion_larga`, etc.): pierde historial, no hay versionado, mezcla metadatos de IA con datos del negocio.

**Tradeoff:** el query para obtener "la sugerencia activa" requiere `WHERE status IN ('aprobado', 'editado_aprobado') ORDER BY version DESC LIMIT 1`. Leve complejidad, máxima flexibilidad.

---

## DM-04 — Margenes como vista, no como columnas

**Decisión:** `margen_esperado` y `margen_real` se calculan en la vista `inventory_margins`, no se almacenan como columnas.

**Razonamiento:**
- Si se almacenan como columnas, hay que mantenerlos sincronizados con `precio_objetivo`, `precio_vendido` y `coste`. Cualquier UPDATE que no actualice los tres causa inconsistencia.
- Postgres calcula la vista en tiempo de query. Con el volumen del MVP (decenas de items) es instantáneo.

**Alternativas descartadas:**
- Columnas generadas (`GENERATED ALWAYS AS`): válido, pero más difícil de ajustar si la fórmula cambia. La vista es más legible y modificable.
- Trigger que actualiza las columnas: añade complejidad de mantenimiento sin beneficio.

---

## DM-05 — Fotos MVP: Opción A (ruta local)

**Decisión:** `inventory_items.carpeta_local` + `photo_status`. Sin Supabase Storage en MVP. `media_assets` tiene el esquema pero `storage_*` campos son NULL en MVP.

**Razonamiento:** Pablo gestiona fotos en carpetas locales ya. Cambiar eso en MVP añade fricción sin beneficio inmediato. El objetivo del MVP es validar el flujo completo (dar de alta → IA → publicar en WC), no cambiar el workflow de fotos.

**Cuándo activar Opción C (Supabase Storage):** cuando Studio esté en uso real y Pablo quiera publicar sin pasar por WP Admin para subir fotos.

**Riesgo aceptado:** si Pablo está en otro dispositivo, no puede acceder a las fotos locales desde Studio. Aceptable en MVP donde Pablo trabaja siempre desde su PC.

---

## DM-06 — WC bridge: campos inline en inventory_items, no tabla separada

**Decisión:** `wc_product_id`, `wc_status`, `wc_draft_created_at`, `wc_last_sync_at`, `wc_error`, `wc_payload_snapshot` están en `inventory_items`, no en una tabla `wc_publications`.

**Razonamiento:** En MVP, cada camiseta tiene máximo 1 producto WC. No hay multi-channel WC (no hay tiendas adicionales). La complejidad de una tabla de publicaciones no está justificada todavía.

**Cuando refactorizar:** si en el futuro hay 2+ instancias WC (improbable en Catenaccio), extraer a `channel_publications(item_id, channel_id, external_id, status, ...)`.

---

## DM-07 — Vinted: tracking manual, no automatizado

**Decisión:** `vinted_status`, `vinted_url`, `vinted_price`, `vinted_published_at` son campos manuales. Pablo los actualiza; Studio no llama a ninguna API de Vinted.

**Razonamiento:** Vinted no tiene API pública de publicación. Es imposible automatizar. El valor de estos campos es que Studio actúa como recordatorio ("esta camiseta está en publicada_web pero falta en Vinted") y como registro histórico de URLs y precios.

---

## DM-08 — owner_id directo, sin workspace_members en MVP

**Decisión:** RLS usa `auth.uid() = owner_id` directamente. No hay tabla `workspace_members`.

**Razonamiento:** en MVP solo existe Pablo. Añadir una tabla de membresía ahora es YAGNI. `workspace_id` existe para agrupar los datos del negocio, pero la autorización es directa por `owner_id`.

**Cuándo añadir `workspace_members`:** antes de abrir el sistema a colaboradores o vendedores adicionales (Fase 3). La migración es trivial: añadir la tabla y cambiar la política RLS de `owner_id` a membership check.

---

## DM-09 — lifecycle_events: texto libre para event_type

**Decisión:** `event_type` es `TEXT NOT NULL`, no un enum.

**Razonamiento:** los tipos de evento van a crecer conforme Studio evoluciona. Cada sesión de implementación puede añadir nuevos tipos sin una migración de enum. Los valores esperados están documentados en el SQL como comentario, no como constraint en la DB.

**Tradeoff:** sin constraint de enum, es posible insertar tipos de evento con typos. El riesgo es bajo en MVP de 1 usuario; el beneficio de extensibilidad es alto.

---

## DM-10 — Display cache en football_shirt_details

**Decisión:** campos `liga_display`, `equipo_display`, `temporada_display`, `marca_display`, `jugador_display` en `football_shirt_details` para cachear nombres legibles junto a los term IDs.

**Razonamiento:** los term IDs de WooCommerce (`"129"`, `"72"`) no son legibles por Pablo en la UI. Resolver el nombre requiere una llamada a `GET /wc/v3/products/attributes/{id}/terms`. En MVP sin sincronización bidireccional constante, cachear el nombre en el momento de creación es la solución más simple.

**Riesgo:** si Pablo renombra un término en WC, el cache queda stale. Mitigación: el nombre del equipo no cambia; la temporada tampoco. El riesgo real es negligible.

---

## Qué se difiere

| Feature | Estado |
|---------|--------|
| Supabase Storage bucket (fotos remotas) | DEFER — post-MVP, Opción C |
| `workspace_members` (multi-usuario) | DEFER — Fase 3 |
| `publication_channels` / `channel_publications` | DEFER — si hay > 2 canales activos |
| `pricing_snapshots` (historial de precios) | DEFER — post-tracción |
| Importador CSV desde STOCK.xlsx | DEFER — S025+ (primero ver columnas reales) |
| Variantes de producto | DEFER indefinido (no aplica a vintage) |

## Riesgos aceptados

| Riesgo | Mitigación |
|--------|-----------|
| Doble fuente de verdad temporal (Supabase + WC) | Studio es maestro. WC es destino. Sincronización en un solo sentido (Studio→WC). Pablo no modifica atributos directamente en WC. |
| `event_type` sin enum → typos posibles | Valores documentados en SQL + constantes en el código de Studio. Bajo riesgo en MVP de 1 usuario. |
| Display cache de names stale | Los nombres de equipos/ligas son estables. Riesgo negligible. |
| `media_assets` con esquema pero sin uso en MVP | La tabla existe para no romper el schema cuando se active Storage. 0 filas en MVP es válido. |

---

*Sesión 019 — 2026-06-27 — Claude Code (Sonnet). Modo LOCAL_SCHEMA_DESIGN_ONLY / NO_REMOTE_WRITE.*
