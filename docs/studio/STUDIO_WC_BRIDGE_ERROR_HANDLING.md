# STUDIO_WC_BRIDGE_ERROR_HANDLING — Manejo de Errores del Bridge

Especificación de errores esperados, cómo registrarlos y cómo responder a ellos.

**Proyecto:** Catenaccio Vintage  
**Fecha:** 2026-06-27  
**Sesión:** 020 — STUDIO_WC_BRIDGE_CONTRACT  
**Modo:** DOCS_ONLY  
**Depende de:** `STUDIO_WC_BRIDGE_CONTRACT.md §8`, `STUDIO_WC_PAYLOAD_SPEC.md §5`

---

## 1. Tabla de errores esperados

### 1.1 Errores de autenticación / red

| Código HTTP | Error WC | Causa probable | Acción |
|-------------|----------|----------------|--------|
| `401` | `rest_not_logged_in` | Credenciales inválidas o expiradas | STOP — Pablo regenera Application Password en WP Admin |
| `403` | `rest_forbidden` | shop_manager no tiene permiso para POST /products | STOP — revisar rol de `catenaccio-studio-agent`; escalar a S007b pattern |
| `0` / timeout | — | Servidor WC caído, firewall Raiola, timeout de red | Reintentar 1 vez tras 5s. Si persiste, STOP |
| `SSL error` | — | TLS handshake fallo | Verificar `WP_SITE_URL` con `https://`. No continuar sin TLS. |

### 1.2 Errores de payload (validación WC)

| Código HTTP | Error WC | Causa probable | Acción |
|-------------|----------|----------------|--------|
| `400` | `woocommerce_rest_product_invalid_type` | `type` no reconocido | Verificar que `type="simple"` — no cambiar sin decisión explícita |
| `400` | `woocommerce_rest_invalid_param` | Campo requerido faltante o inválido | Ver mensaje de error para el campo específico; corregir payload |
| `422` | `woocommerce_rest_product_invalid_id` | `id` en PUT que no existe (no aplica en POST) | No debería ocurrir en POST — investigar si aparece |
| `422` | campo `regular_price` | Precio en formato incorrecto | Verificar que es string numérico positivo sin símbolos de moneda |

### 1.3 Errores de permisos de contenido

| Código HTTP | Error WC | Causa probable | Acción |
|-------------|----------|----------------|--------|
| `403` | `rest_cannot_create` | shop_manager no puede crear productos | STOP — revisar capacidades de WP; escalar |
| `403` | `rest_cannot_edit` | No tiene acceso a `meta_data` write | STOP — posible conflicto con plugin de ACF o permisos personalizados |

### 1.4 Errores de integidad de datos

| Situación | Causa probable | Acción |
|-----------|----------------|--------|
| `meta_data` en response no contiene las claves enviadas | ACF o plugin de configuración rechaza las claves | Verificar con `GET /wc/v3/products/{id}` y comparar |
| `status` en response no es `"draft"` | Bug crítico en el bridge o WC ignoró el campo | STOP CRÍTICO — no continuar, investigar |
| `id` en response es 0 o negativo | Bug de WC o respuesta malformada | Tratar como error — no guardar en Supabase |

### 1.5 Errores de validación de Studio (pre-llamada)

| Error interno | Causa | Acción |
|--------------|-------|--------|
| `IDEMPOTENCY_STOP: draft_already_exists` | `wc_product_id IS NOT NULL` | Mostrar mensaje a Pablo; no llamar a WC API |
| `VALIDATION_ERROR: name_required` | `titulo_seo` vacío o no aprobado | Generar/aprobar AI suggestion primero |
| `VALIDATION_ERROR: price_invalid` | `precio_publicado_web` NULL o ≤ 0 | Pablo ingresa precio antes de publicar |
| `VALIDATION_ERROR: description_required` | `descripcion_larga` vacía | Generar/aprobar AI suggestion primero |
| `VALIDATION_ERROR: equipo_term_id_required` | `equipo` vacío en `football_shirt_details` | Pablo selecciona equipo en el formulario |
| `VALIDATION_ERROR: temporada_term_id_required` | `temporada` vacío | Pablo selecciona temporada en el formulario |
| `VALIDATION_ERROR: talla_required` | `talla` vacía | Pablo completa el campo |
| `VALIDATION_ERROR: term_not_found` | Term ID no existe en WC para el valor seleccionado | Pablo añade el término en WC Admin primero |

### 1.6 Riesgos documentados (no errores técnicos, sino riesgos operativos)

| Riesgo | Descripción | Guardrail activo |
|--------|-------------|-----------------|
| Creación accidental de producto publicado | Si `status` se filtrara como `publish` | `status=draft` hardcoded + validación server-side |
| Duplicados | Si se llama POST dos veces para el mismo item | Idempotencia: check `wc_product_id IS NULL` |
| Term IDs erróneos | Si un term ID en `football_shirt_details` no existe en WC | Validación `term_not_found` + tabla cache local |
| Precio en formato incorrecto | Decimales, símbolo €, null | Validación `price_invalid` antes de construir payload |
| ACF/meta_data no renderiza en Filtro Pro | Si el Filtro Pro no lee la meta_data del producto nuevo | Verificar manualmente en WP Admin post-test |
| Producto sin imagen | Draft creado sin fotos | Normal en MVP — Pablo añade manualmente |
| Sync unidireccional | Si Pablo edita en WC Admin, Studio no lo sabe | Diseño intencional MVP: Studio es maestro. No hay sync WC→Studio en MVP |
| WC como destino no maestro | Si se trata WC como fuente de verdad | Regla del sistema: Supabase = maestro, WC = destino |
| Emails transaccionales disparados | Si crear un draft dispara algún hook de WC | PATTERN-08 activo; crear draft no dispara emails de venta |

---

## 2. Cómo sanitizar errores antes de registrar

**Nunca registrar en `wc_error` o en logs:**
- El valor de `WP_APP_PASSWORD`
- El header `Authorization`
- Cualquier token o credencial

**Proceso de sanitización:**
1. Capturar el error completo de la respuesta WC.
2. Extraer: `http_status`, `error_code` (campo `code` en la respuesta JSON de WC), `message` (campo `message`).
3. Truncar `message` a 500 caracteres si es muy largo.
4. Eliminar cualquier substring que contenga la password o el username.
5. Guardar el resultado sanitizado en `wc_error`.

**Formato de `wc_error` recomendado:**
```
[HTTP {status}] {code}: {message}
```

Ejemplo:
```
[HTTP 422] woocommerce_rest_invalid_param: El parámetro regular_price no es válido.
```

---

## 3. Cómo registrar en `wc_error`

`wc_error` es un campo TEXT en `inventory_items`. Se actualiza en dos casos:

**Caso error:** actualizar con el mensaje sanitizado (máx 500 chars).
```sql
UPDATE inventory_items
SET wc_error = '[HTTP 422] woocommerce_rest_invalid_param: ...',
    wc_status = 'error_sync',
    wc_last_sync_at = now()
WHERE id = '<uuid>';
```

**Caso éxito:** limpiar el campo (NULL).
```sql
UPDATE inventory_items
SET wc_error = NULL,
    wc_status = 'borrador_creado',
    ...
WHERE id = '<uuid>';
```

---

## 4. Cómo registrar lifecycle events

Cada intento de sync (exitoso o no) genera un evento en `item_lifecycle_events`.

### 4.1 Evento de éxito — `wc_sync_ok`

```json
{
  "item_id": "<uuid>",
  "event_type": "wc_sync_ok",
  "from_status": "pendiente_descripcion",
  "to_status": "borrador_web",
  "triggered_by": "agente",
  "payload": {
    "wc_product_id": 1923,
    "endpoint": "POST /wc/v3/products",
    "http_status": 201,
    "bridge_version": "v1.0"
  },
  "notes": "Borrador creado correctamente en WooCommerce."
}
```

### 4.2 Evento de error — `wc_sync_error`

```json
{
  "item_id": "<uuid>",
  "event_type": "wc_sync_error",
  "from_status": "pendiente_descripcion",
  "to_status": "pendiente_descripcion",
  "triggered_by": "agente",
  "payload": {
    "endpoint": "POST /wc/v3/products",
    "http_status": 422,
    "wc_error_code": "woocommerce_rest_invalid_param",
    "error_message": "[sanitizado — 500 chars max]",
    "bridge_version": "v1.0"
  },
  "notes": "Fallo al crear borrador. Ver wc_error para detalle."
}
```

### 4.3 Evento de validación fallida — `wc_validation_error`

```json
{
  "item_id": "<uuid>",
  "event_type": "wc_validation_error",
  "from_status": "pendiente_descripcion",
  "to_status": "pendiente_descripcion",
  "triggered_by": "agente",
  "payload": {
    "validation_code": "VALIDATION_ERROR: equipo_term_id_required",
    "bridge_version": "v1.0"
  },
  "notes": "Validación de Studio fallida antes de llamar a WC API."
}
```

---

## 5. Qué requiere intervención de Pablo

| Situación | Acción de Pablo |
|-----------|----------------|
| HTTP 401 — credenciales inválidas | Regenerar Application Password en WP Admin → actualizar `.env.local` / Vercel env var |
| HTTP 403 — permisos insuficientes | Verificar rol de `catenaccio-studio-agent` en WP Admin → Users; puede requerir ajuste de capacidades |
| `VALIDATION_ERROR: term_not_found` | Añadir término nuevo en WP Admin → Productos → Atributos → pa_equipo (o el atributo correspondiente) |
| `VALIDATION_ERROR: price_invalid` | Ingresar precio en el formulario de Studio antes de intentar publicar |
| `VALIDATION_ERROR: name_required` | Aprobar o generar una AI suggestion para el item |
| HTTP 500 persistente | Verificar estado del servidor WC con Raiola o desde WP Admin → Estado del sistema |
| `status=publish` en respuesta WC | STOP CRÍTICO — reportar inmediatamente; revisar el bridge service |

---

## 6. Qué requiere STOP del bridge

| Condición | STOP porque |
|-----------|------------|
| `status` en response WC es `"publish"` | Violación de DRAFT_ONLY. Bug crítico. No continuar. |
| HTTP 403 en POST /products | Posible desconfiguración de permisos. No reintentar sin investigar. |
| Emails transaccionales disparados | PATTERN-08 — investigar y resolver antes de continuar. |
| `wc_product_id` en response es inválido (0, negativo, no entero) | No guardar en Supabase. Investigar respuesta completa. |
| Credenciales en logs o en `wc_error` | STOP — sanitizar inmediatamente. Revocar Application Password si se expuso. |

---

## 7. Qué puede reintentarse automáticamente

El bridge MVP **no reintenta automáticamente**. Todo reintento es manual (Pablo pulsa el botón de nuevo en Studio).

Razón: el reintento automático puede crear duplicados si el primer intento partially succeeded (producto creado pero respuesta perdida por timeout). La idempotencia lo previene solo si `wc_product_id` se guardó correctamente.

**Excepciones donde el reintento es seguro:**
- `VALIDATION_ERROR` de Studio (no se llegó a llamar a WC API)
- `timeout` + confirmación de que `wc_product_id IS NULL` (el producto no se creó)

**En versiones futuras (S023+):** considerar reintento automático con idempotency key, pero requiere análisis adicional.

---

*Sesión 020 — 2026-06-27 — Claude Code (Sonnet). DOCS_ONLY / NO_REMOTE_WRITE.*
