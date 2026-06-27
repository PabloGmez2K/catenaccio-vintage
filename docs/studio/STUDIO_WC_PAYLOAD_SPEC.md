# STUDIO_WC_PAYLOAD_SPEC — Payload Catenaccio Studio → WooCommerce

Especificación exacta del payload para crear un producto borrador en WooCommerce desde Catenaccio Studio.

**Proyecto:** Catenaccio Vintage  
**Fecha:** 2026-06-27  
**Sesión:** 020 — STUDIO_WC_BRIDGE_CONTRACT  
**Modo:** DOCS_ONLY  
**Depende de:** `API_READONLY_PROBE_RESULT.md §5`, `STUDIO_DATA_MODEL.md §11`, `STUDIO_WC_BRIDGE_CONTRACT.md`

---

## 1. Endpoint

```
POST https://catenacciovintage.com/wp-json/wc/v3/products
Authorization: Basic base64(WP_APP_USER:WP_APP_PASSWORD)
Content-Type: application/json
```

---

## 2. Payload completo — estructura MVP

```json
{
  "name": "2001-02 Real Madrid Home Shirt (L)",
  "type": "simple",
  "status": "draft",
  "regular_price": "45",
  "description": "<p>Camiseta de la primera equipación del Real Madrid de la temporada 2001-02. Fabricada por Adidas, talla L. Estado excelente, sin desgastes ni manchas visibles. Dorsal 7 de Raúl estampado en el reverso. Pieza imprescindible para cualquier coleccionista del fútbol español de los 2000.</p>",
  "short_description": "",
  "stock_status": "instock",
  "manage_stock": false,
  "meta_data": [
    { "key": "liga",                    "value": "72" },
    { "key": "equipo",                  "value": "999" },
    { "key": "ano_temporada",           "value": "139" },
    { "key": "talla",                   "value": "L" },
    { "key": "condicion",               "value": "Excelente" },
    { "key": "jugador",                 "value": "" },
    { "key": "descripcion_del_producto","value": "<p>Camiseta de la primera equipación del Real Madrid...</p>" }
  ]
}
```

> **NOTA:** los valores numéricos en este ejemplo son **dummies para ilustración** (999 no es un term ID real). Ver `STUDIO_WC_TERM_ID_RESOLUTION_PLAN.md` para IDs confirmados.

---

## 3. Mapeo campo por campo Studio → WooCommerce

### 3.1 Campos de nivel raíz

| Campo WC | Fuente Studio | Tabla Supabase | Campo | Tipo WC | Notas |
|----------|--------------|---------------|-------|---------|-------|
| `name` | ai_suggestions | `ai_suggestions` | `titulo_seo` | STRING | Usar sugerencia activa (`status IN ('aprobado','editado_aprobado')`, `MAX(version)`) |
| `type` | Hardcoded | — | — | `"simple"` | Cada camiseta es única, sin variantes |
| `status` | **Hardcoded** | — | — | `"draft"` | **INMUTABLE. DRAFT_ONLY.** Nunca cambia. |
| `regular_price` | inventory_items | `inventory_items` | `precio_publicado_web` | STRING (EUR entero) | WC espera string. `45.00` → `"45"`. Sin cents por convención del probe. |
| `description` | ai_suggestions | `ai_suggestions` | `descripcion_larga` | STRING HTML | Texto largo con HTML. Puede incluir `<p>`, `<strong>`, `<ul>`. |
| `short_description` | — | — | — | `""` | MVP: vacío. Se puede poblar en S023+ con un resumen de 1-2 líneas. |
| `stock_status` | Hardcoded | — | — | `"instock"` | Cada camiseta es única y disponible al crear el borrador. |
| `manage_stock` | Hardcoded | — | — | `false` | No gestionar stock con cantidad numérica — camiseta vintage = 1 unidad única. |

### 3.2 meta_data (ACF / atributos personalizados)

> **Hallazgo crítico de S007 (probe):** los productos de Catenaccio Vintage usan ACF meta fields, **NO** WooCommerce `attributes[]`. El campo `attributes: []` está vacío en todos los productos existentes. El Filtro Camisetas Pro lee desde `meta_data`. Studio debe escribir en `meta_data` para ser compatible.

| `meta_data.key` | Fuente Studio | Tabla Supabase | Campo | Tipo valor | Ejemplo real |
|----------------|--------------|---------------|-------|------------|--------------|
| `liga` | football_shirt_details | `football_shirt_details` | `liga` | Term ID (string numérico) o `""` | `"72"` (LaLiga) · `""` (selección nacional sin liga) |
| `equipo` | football_shirt_details | `football_shirt_details` | `equipo` | Term ID (string numérico) | `"129"` (Francia) |
| `ano_temporada` | football_shirt_details | `football_shirt_details` | `temporada` | Term ID (string numérico) | `"139"` |
| `talla` | football_shirt_details | `football_shirt_details` | `talla` | String directo | `"XXL"`, `"L"`, `"M"` |
| `condicion` | football_shirt_details | `football_shirt_details` | `condicion` | String directo | `"Excelente"`, `"Muy buena"` |
| `jugador` | football_shirt_details | `football_shirt_details` | `jugador` | Term ID (string numérico) o `""` | `""` si no aplica |
| `descripcion_del_producto` | ai_suggestions | `ai_suggestions` | `descripcion_larga` | STRING HTML | `<p>...</p>` |

**Regla de tipos confirmada en probe (`API_READONLY_PROBE_RESULT.md §5`):**
- `liga`, `equipo`, `ano_temporada`, `jugador` → **term IDs** (integer almacenado como string en meta)
- `talla`, `condicion` → **strings directos** (no term IDs)
- `descripcion_del_producto` → **string HTML** (duplicado de `description` para compatibilidad con el Filtro Camisetas Pro)

---

## 4. Ejemplo JSON real con valores dummy ilustrativos

```json
{
  "name": "2014-15 France Away Shirt (XXL)",
  "type": "simple",
  "status": "draft",
  "regular_price": "85",
  "description": "<p>Camiseta de la segunda equipación de la selección de Francia de la temporada 2014-15. Fabricada por Nike, talla XXL. Estado excelente, sin desgastes ni manchas. Ideal para coleccionistas de selecciones nacionales europeas.</p>",
  "short_description": "",
  "stock_status": "instock",
  "manage_stock": false,
  "meta_data": [
    { "key": "liga",                    "value": "" },
    { "key": "equipo",                  "value": "129" },
    { "key": "ano_temporada",           "value": "139" },
    { "key": "talla",                   "value": "XXL" },
    { "key": "condicion",               "value": "Excelente" },
    { "key": "jugador",                 "value": "" },
    { "key": "descripcion_del_producto","value": "<p>Camiseta de la segunda equipación de la selección de Francia de la temporada 2014-15. Fabricada por Nike, talla XXL. Estado excelente, sin desgastes ni manchas. Ideal para coleccionistas de selecciones nacionales europeas.</p>" }
  ]
}
```

> Este es el patrón exacto del producto 1792 confirmado en el probe (Francia 2014-15, XXL, `equipo=129`, `ana_temporada=139`, `liga=""`).

---

## 5. Validaciones de tipos antes de enviar

El bridge service debe validar en servidor antes de construir el payload:

| Campo | Validación | Error si falla |
|-------|-----------|---------------|
| `name` | NOT NULL, longitud > 5 chars | `VALIDATION_ERROR: name_required` |
| `status` | Exactamente `"draft"` | `INTERNAL_ERROR: invalid_status_attempt` (bug en el bridge) |
| `regular_price` | Parseable como número positivo, representable como string sin decimals | `VALIDATION_ERROR: price_invalid` |
| `description` | NOT NULL, longitud > 20 chars | `VALIDATION_ERROR: description_required` |
| `meta_data[liga].value` | String numérico o `""` | `VALIDATION_ERROR: liga_term_id_invalid` |
| `meta_data[equipo].value` | String numérico NOT NULL, NOT empty | `VALIDATION_ERROR: equipo_term_id_required` |
| `meta_data[ano_temporada].value` | String numérico NOT NULL, NOT empty | `VALIDATION_ERROR: temporada_term_id_required` |
| `meta_data[talla].value` | NOT NULL, NOT empty | `VALIDATION_ERROR: talla_required` |
| `meta_data[condicion].value` | NOT NULL, NOT empty | `VALIDATION_ERROR: condicion_required` |
| `meta_data[jugador].value` | String numérico o `""` | `VALIDATION_ERROR: jugador_term_id_invalid` |
| `wc_product_id` (precondición) | IS NULL | `IDEMPOTENCY_STOP: draft_already_exists` |

---

## 6. Formato de `regular_price`

**Confirmado en probe:** WC REST API v3 en Catenaccio usa enteros en EUR. `45` = €45.00.

Reglas de conversión:
- `precio_publicado_web` en Supabase es `NUMERIC(10,2)` — ej. `45.00`
- Convertir a string sin decimales: `Math.round(precio).toString()` → `"45"`
- Si tiene centavos (ej. `44.99`): usar `(44.99).toFixed(2)` → `"44.99"` — WC lo acepta
- Nunca enviar como integer nativo JSON (WC lo acepta pero string es el formato canónico)

---

## 7. Campos NO incluidos en payload MVP (diferidos)

| Campo WC | Razón de diferimiento |
|----------|----------------------|
| `images` | MVP no sube imágenes. Pablo las añade manualmente desde WP Admin. |
| `categories` | MVP no asigna categorías. Pablo las asigna manualmente. Evita error si category ID no existe. |
| `attributes[]` | No usado en Catenaccio (ACF meta fields en su lugar). Queda `[]` o ausente. |
| `sku` | Diferido. Se puede generar desde `referencia` en S023+. |
| `slug` | WC auto-genera desde `name`. Sobrescribir en S023+ si hace falta. |
| `sale_price` | No aplica en MVP. |
| `weight`, `dimensions` | No aplica para camisetas vintage en MVP. |
| `tags` | Diferido a S023+. |
| `upsell_ids`, `cross_sell_ids` | Diferido. |

---

## 8. Respuesta esperada de WC API (HTTP 201)

```json
{
  "id": 1923,
  "name": "2014-15 France Away Shirt (XXL)",
  "slug": "2014-15-france-away-shirt-xxl",
  "permalink": "https://catenacciovintage.com/producto/2014-15-france-away-shirt-xxl/",
  "status": "draft",
  "type": "simple",
  "regular_price": "85",
  "meta_data": [
    { "id": 5001, "key": "liga",                     "value": "" },
    { "id": 5002, "key": "equipo",                   "value": "129" },
    { "id": 5003, "key": "ano_temporada",            "value": "139" },
    { "id": 5004, "key": "talla",                    "value": "XXL" },
    { "id": 5005, "key": "condicion",                "value": "Excelente" },
    { "id": 5006, "key": "jugador",                  "value": "" },
    { "id": 5007, "key": "descripcion_del_producto", "value": "<p>...</p>" }
  ],
  "date_created": "2026-06-27T20:00:00",
  "date_modified": "2026-06-27T20:00:00",
  "_links": { ... }
}
```

**Campos a extraer de la respuesta:**
- `id` → guardar en `inventory_items.wc_product_id`
- `status` → verificar que es `"draft"` (sanity check)
- `permalink` → opcional, para referencia interna

---

## 9. `wc_payload_snapshot` — qué guardar

El snapshot que se guarda en `inventory_items.wc_payload_snapshot` (JSONB) es el payload **enviado**, sin secretos:

```json
{
  "endpoint": "POST /wc/v3/products",
  "sent_at": "2026-06-27T20:00:00Z",
  "payload": {
    "name": "2014-15 France Away Shirt (XXL)",
    "type": "simple",
    "status": "draft",
    "regular_price": "85",
    "description": "<p>...</p>",
    "meta_data": [ ... ]
  },
  "response_id": 1923,
  "response_status": "draft",
  "http_status": 201
}
```

**Nunca incluir en el snapshot:** `Authorization` header, `WP_APP_PASSWORD`, cualquier token o credencial.

---

*Sesión 020 — 2026-06-27 — Claude Code (Sonnet). DOCS_ONLY / NO_REMOTE_WRITE.*
