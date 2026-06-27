# STUDIO_WC_BRIDGE_CONTRACT — Catenaccio Studio → WooCommerce

Contrato técnico del puente de publicación Catenaccio Studio → WooCommerce.

**Proyecto:** Catenaccio Vintage  
**Fecha:** 2026-06-27  
**Sesión:** 020 — STUDIO_WC_BRIDGE_CONTRACT  
**Modo:** DOCS_ONLY / CONTRACT_DESIGN / NO_REMOTE_WRITE  
**Agente:** Claude Code (Sonnet)  
**Estado:** APROBADO — APPROVE_READY_FOR_WC_API_WRITE_ACCESS_TEST  
**Depende de:** `DEC-9`, `DEC-13`, `API_READONLY_PROBE_RESULT.md`, `STUDIO_DATA_MODEL.md`, `STUDIO_SUPABASE_SCHEMA_MVP.sql`  
**Siguiente:** `WC_API_WRITE_ACCESS_TEST` → S021 (scaffold)

---

## 1. Resumen

El puente Catenaccio Studio → WooCommerce es el mecanismo por el que Studio (fuente de verdad) crea borradores de producto en WooCommerce (destino de publicación). El puente **nunca publica**: crea siempre `status=draft`. Pablo revisa y publica manualmente desde WP Admin.

El puente es:
- **Unidireccional** — Studio → WooCommerce (nunca WC → Studio)
- **DRAFT_ONLY** — jamás `status=publish` desde el puente
- **Idempotente** — si ya existe `wc_product_id`, no crea duplicado
- **Trazable** — todo resultado queda registrado en Supabase (`wc_*` fields + `item_lifecycle_events`)
- **Sin secretos en repo** — credenciales solo en Vercel server-side env vars

---

## 2. Alcance de S020 (este contrato)

| En scope | Fuera de scope |
|----------|---------------|
| Contrato técnico completo Studio→WC | Implementación de la app Next.js |
| Payload exacto para `POST /wc/v3/products` | Código ejecutable del bridge |
| Mapeo Studio fields → WC fields | Deploy a Vercel |
| Resolución de term IDs | Supabase remoto |
| Plan de test controlado (no ejecutado) | Llamadas reales a WooCommerce |
| Error handling spec | WP Admin, cPanel, servidor |
| DEC-14 si aplica | Productos reales en WC |

---

## 3. No-alcance del puente (guardrails permanentes)

El puente **nunca debe**:
- Publicar un producto (`status=publish` está prohibido en el payload)
- Tocar configuración de WooCommerce (impuestos, envíos, métodos de pago, emails)
- Crear o modificar taxonomías WC (no crear terms nuevos automáticamente)
- Subir imágenes a WP Media Library (diferido post-MVP)
- Eliminar productos WC (DELETE queda fuera; solo STOP o mover a trash manualmente por Pablo)
- Leer o modificar pedidos, clientes, stock de otros productos
- Operar con credenciales en variables `NEXT_PUBLIC_*`
- Actuar sobre un item con `wc_product_id IS NOT NULL` (idempotencia: no crear duplicado)

---

## 4. Arquitectura del puente

```
┌─────────────────────────────────────────────────────────────┐
│                   Catenaccio Studio (Next.js / Vercel)       │
│                                                              │
│  1. Pablo aprueba ai_suggestion                              │
│  2. Pablo pulsa "Crear borrador en WooCommerce"              │
│  3. Server Action (Next.js) recibe request                   │
│  4. Bridge Service lee datos de Supabase:                    │
│     - inventory_items (precio, referencia)                   │
│     - football_shirt_details (atributos, term IDs)           │
│     - ai_suggestions (descripción aprobada, título SEO)      │
│  5. Bridge Service construye payload WC                      │
│  6. Bridge Service llama POST /wc/v3/products                │
│  7. Bridge Service procesa respuesta:                        │
│     - OK → actualiza inventory_items (wc_product_id, etc.)  │
│     - ERROR → registra wc_error + lifecycle event            │
└─────────────────────────────────────────────────────────────┘
                              │
                    HTTPS / Basic Auth
                    Application Password
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 WooCommerce REST API v3                       │
│             https://catenacciovintage.com/wp-json/wc/v3/    │
│                                                              │
│   POST /products → crea borrador (status=draft)              │
│   GET  /products/attributes → descubre attribute IDs         │
│   GET  /products/attributes/{id}/terms → resuelve term IDs   │
│   GET  /products/{id} → verifica borrador creado             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              WP Admin (solo Pablo)                            │
│   - Revisa el borrador creado                                │
│   - Añade imágenes manualmente (MVP)                         │
│   - Corrige cualquier campo si hace falta                    │
│   - Pulsa "Publicar" cuando está OK                          │
│   - El puente NO puede ver ni afectar esta decisión          │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Autenticación

### 5.1 Mecanismo

**WooCommerce REST API v3 / Basic Auth con Application Password (DEC-9).**

El estándar de acceso sin SSH de Catenaccio (DEC-9) define:
- Usuario WP limitado: `catenaccio-studio-agent`
- Rol: `shop_manager`
- Credencial: Application Password (formato `xxxx xxxx xxxx xxxx xxxx xxxx`)
- Transport: HTTPS obligatorio
- Header: `Authorization: Basic base64(user:app_password)`

### 5.2 Variables de entorno requeridas (sin valores)

| Variable | Descripción | Dónde vive |
|----------|-------------|------------|
| `WP_SITE_URL` | URL base del sitio (`https://catenacciovintage.com`) | Vercel env var (server-side) |
| `WP_APP_USER` | Username del agente (`catenaccio-studio-agent`) | Vercel env var (server-side) |
| `WP_APP_PASSWORD` | Application Password del usuario | Vercel env var (server-side) |

**Regla crítica:** Ninguna de estas variables puede ser `NEXT_PUBLIC_*`. Deben ser env vars de servidor exclusivamente. El cliente de Next.js nunca debe acceder a estas credenciales.

### 5.3 Construcción del header

```
Authorization: Basic base64(WP_APP_USER + ":" + WP_APP_PASSWORD)
Content-Type: application/json
```

El password incluye espacios en el formato Application Password de WordPress. `base64()` opera sobre el string completo incluyendo espacios.

### 5.4 Permisos del usuario `catenaccio-studio-agent`

**Confirmados en S007 (probe):**
- ✅ `manage_woocommerce` — confirmada
- ✅ `GET /wc/v3/products` — lectura productos
- ✅ `GET /wc/v3/products/attributes` — lectura atributos
- ✅ `GET /wc/v3/products/attributes/{id}/terms` — lectura terms
- ✅ `POST /wc/v3/products` con `status=draft` — **probable** (a confirmar en WC_API_WRITE_ACCESS_TEST)

**Lo que el agente NO debe poder hacer (por diseño):**
- Publicar productos (`status=publish`)
- Eliminar productos (DELETE)
- Modificar configuración de WooCommerce
- Modificar pedidos o clientes
- Acceder a Elementor templates (403 confirmado)

---

## 6. Endpoints

### 6.1 Endpoints de lectura / preparación

| Método | Endpoint | Uso |
|--------|----------|-----|
| `GET` | `/wp-json/wc/v3/products/attributes` | Descubrir IDs de atributos (pa_liga, pa_equipo, etc.) |
| `GET` | `/wp-json/wc/v3/products/attributes/{id}/terms` | Obtener term IDs para un atributo |
| `GET` | `/wp-json/wc/v3/products/{id}` | Verificar que el borrador existe tras creación |

### 6.2 Endpoint de escritura (S020 test / implementación futura)

| Método | Endpoint | Uso | Guard |
|--------|----------|-----|-------|
| `POST` | `/wp-json/wc/v3/products` | Crear borrador | `status=draft` siempre |

### 6.3 Endpoints diferidos (no usar en MVP)

| Método | Endpoint | Razón de diferimiento |
|--------|----------|-----------------------|
| `PUT` | `/wp-json/wc/v3/products/{id}` | Update de draft existente — diferido a S023+ |
| `DELETE` | `/wp-json/wc/v3/products/{id}` | Cleanup de borradores — solo manual por Pablo |
| `POST` | `/wp-json/wp/v2/media` | Upload de imágenes — diferido post-MVP |

---

## 7. DRAFT_ONLY — reglas absolutas

1. **El campo `status` en el payload siempre es `"draft"`.** Hardcoded en el bridge service. No se acepta ningún valor diferente.
2. **El bridge service debe rechazar cualquier request que no tenga `status=draft`** — validación en el servidor antes de llamar a WC API.
3. **Pablo es el único que puede publicar** — exclusivamente desde WP Admin pulsando "Publicar".
4. **El bridge no tiene ningún mecanismo para forzar publicación** — ni ahora ni en versiones futuras sin decisión explícita documentada en DECISIONS.md.
5. **PATTERN-08 activo:** si una tarea futura requiere modificar configuración de WooCommerce o emails transaccionales → STOP y resolver el email gate (WP Mail SMTP) antes de proceder. El bridge actual no toca nada de esto.

---

## 8. Estados antes y después del bridge

### 8.1 Precondiciones para ejecutar el bridge

El bridge debe validar que se cumplen **todas** estas condiciones antes de llamar a la WC API:

| Condición | Campo a verificar | Valor requerido |
|-----------|------------------|-----------------|
| Item tiene ai_suggestion activa | `ai_suggestions.status` | `'aprobado'` o `'editado_aprobado'` |
| Item tiene precio definido | `inventory_items.precio_publicado_web` | `NOT NULL`, mayor que 0 |
| Item tiene nombre (referencia) | `inventory_items.referencia` | `NOT NULL`, no vacío |
| Item tiene atributos mínimos | `football_shirt_details.equipo` | `NOT NULL`, no vacío |
| Item tiene talla | `football_shirt_details.talla` | `NOT NULL`, no vacío |
| Item no tiene borrador ya creado | `inventory_items.wc_product_id` | `IS NULL` (idempotencia) |
| Item está en estado adecuado | `inventory_items.status` | `'fotos_hechas'` o `'pendiente_descripcion'` |

Si alguna condición falla → el bridge retorna error de validación sin llamar a WC API.

### 8.2 Transición tras éxito (HTTP 201)

| Campo Supabase | Valor nuevo |
|---------------|-------------|
| `inventory_items.wc_product_id` | ID retornado por WC API (integer → TEXT) |
| `inventory_items.wc_status` | `'borrador_creado'` |
| `inventory_items.wc_draft_created_at` | `now()` |
| `inventory_items.wc_last_sync_at` | `now()` |
| `inventory_items.wc_error` | `NULL` |
| `inventory_items.wc_payload_snapshot` | JSON del payload enviado (sin secretos) |
| `inventory_items.status` | `'borrador_web'` |

Evento en `item_lifecycle_events`:
```json
{
  "item_id": "<uuid>",
  "event_type": "wc_sync_ok",
  "from_status": "pendiente_descripcion",
  "to_status": "borrador_web",
  "triggered_by": "agente",
  "payload": {
    "wc_product_id": 1234,
    "endpoint": "POST /wc/v3/products",
    "http_status": 201
  }
}
```

### 8.3 Transición tras error (HTTP 4xx / 5xx / timeout)

| Campo Supabase | Valor nuevo |
|---------------|-------------|
| `inventory_items.wc_status` | `'error_sync'` |
| `inventory_items.wc_error` | Mensaje sanitizado (sin credenciales, sin stack trace completo) |
| `inventory_items.wc_payload_snapshot` | JSON del payload intentado (sin secretos) |
| `inventory_items.wc_last_sync_at` | `now()` |
| `inventory_items.status` | **No cambia** (el item no avanza) |

Evento en `item_lifecycle_events`:
```json
{
  "item_id": "<uuid>",
  "event_type": "wc_sync_error",
  "from_status": "pendiente_descripcion",
  "to_status": "pendiente_descripcion",
  "triggered_by": "agente",
  "payload": {
    "http_status": 422,
    "wc_error_code": "woocommerce_rest_product_invalid_id",
    "error_message": "[sanitizado]",
    "endpoint": "POST /wc/v3/products"
  }
}
```

---

## 9. Idempotencia

El puente es **estrictamente idempotente** en MVP:

1. **Antes de llamar a WC API:** verificar que `inventory_items.wc_product_id IS NULL`.
2. **Si `wc_product_id IS NOT NULL`:** STOP con mensaje `"draft_already_exists: WC product ID {id} already linked"`. No se hace ninguna llamada a WC API.
3. **El bridge no ofrece ningún botón de "re-crear" borrador** en MVP. Si hay que re-crear, Pablo lo borra manualmente en WC Admin y luego pone `wc_product_id = NULL` en Studio (acción manual explícita).
4. **Update de draft existente (PUT):** diferido a S023+. Requiere decisión explícita y guardrails propios.

---

## 10. Seguridad

| Regla | Implementación |
|-------|---------------|
| Credenciales nunca en cliente | `WP_APP_*` solo en Server Actions / Route Handlers de Next.js |
| Credenciales nunca en repo | `.env.local` en `.gitignore`; `.env.*` también ignorado |
| Credenciales nunca en logs | Sanitizar errores antes de registrar en `wc_error` |
| Credenciales nunca en `wc_payload_snapshot` | Strip de cualquier campo de auth antes de guardar |
| `status=draft` hardcoded | Validación server-side antes de construir payload |
| Sin auto-publicación | Ningún flujo automatizado puede llamar a `PUT /products/{id}` con `status=publish` |
| Application Password revocable | Pablo puede revocar desde WP Admin sin afectar al admin principal |

---

## 11. PATTERN-08 — Email Gate

**PATTERN-08: TRANSACTIONAL_EMAIL_PRODUCTION_GATE** está activo en este proyecto (DEC-12).

**Declaración para este puente:**
- El bridge NO toca configuración de WooCommerce.
- El bridge NO modifica emails transaccionales.
- El bridge NO activa notificaciones de producto nuevo.
- Crear un producto con `status=draft` en WooCommerce **no dispara emails transaccionales** de venta ni de confirmación de pedido.

**STOP si:**
- En sesiones futuras, una tarea requiere modificar settings de WC (impuestos, envíos, emails).
- En ese caso: verificar WP Mail SMTP configurado antes de proceder.

---

## 12. Variables futuras (sin valores)

Estas variables son necesarias en la fase de implementación (S021+). Se definen aquí para que Pablo las prepare en Vercel Dashboard antes de S021:

```
WP_SITE_URL         = https://catenacciovintage.com
WP_APP_USER         = catenaccio-studio-agent
WP_APP_PASSWORD     = [Application Password desde WP Admin → Users → catenaccio-studio-agent → Application Passwords]
NEXT_PUBLIC_SUPABASE_URL    = [desde Supabase Dashboard → Settings → API]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [desde Supabase Dashboard → Settings → API]
SUPABASE_SERVICE_ROLE_KEY   = [desde Supabase Dashboard → Settings → API] — NUNCA NEXT_PUBLIC
```

**Nota:** `WP_APP_PASSWORD` tiene espacios en el formato de WordPress Application Password. Incluir el valor completo con espacios en la env var. En Vercel, las env vars pueden contener espacios — no es un problema.

---

## 13. Criterio de aceptación

El contrato se considera completo y listo para `WC_API_WRITE_ACCESS_TEST` cuando:

- [x] Autenticación definida (Application Password, Basic Auth, variables, permisos)
- [x] Endpoints documentados (lectura y escritura)
- [x] Reglas DRAFT_ONLY blindadas (hardcoded, validación server-side, no auto-publicación)
- [x] Payload exacto definido (ver `STUDIO_WC_PAYLOAD_SPEC.md`)
- [x] Mapeo Studio→WC documentado campo por campo
- [x] Term ID resolution plan definido (ver `STUDIO_WC_TERM_ID_RESOLUTION_PLAN.md`)
- [x] Idempotencia definida (check `wc_product_id IS NULL` antes de crear)
- [x] Estados antes/después documentados
- [x] Error handling definido (ver `STUDIO_WC_BRIDGE_ERROR_HANDLING.md`)
- [x] Test plan controlado diseñado (ver `STUDIO_WC_WRITE_ACCESS_TEST_PLAN.md`)
- [x] Cleanup del producto de prueba definido
- [x] PATTERN-08 declarado
- [x] Sin secretos en este documento
- [x] Sin llamadas remotas en esta sesión
- [x] Sin cambios fuera de scope

---

## 14. Siguiente sesión

**Prerequisito inmediato: `WC_API_WRITE_ACCESS_TEST`**

Antes de implementar el bridge real en S021, ejecutar el test controlado definido en `STUDIO_WC_WRITE_ACCESS_TEST_PLAN.md`:
1. Pablo activa el test en local (o primer deploy mínimo a Vercel).
2. Se crea 1 producto de prueba con `status=draft`, nombre identificable, precio dummy.
3. Pablo verifica en WP Admin que el borrador existe y tiene los campos correctos.
4. Pablo elimina manualmente el producto de prueba.
5. Si PASS → S021 desbloqueado.
6. Si FAIL → diagnosticar según `STUDIO_WC_BRIDGE_ERROR_HANDLING.md` y corregir.

**S021 — STUDIO_MVP_SCAFFOLD** (tras test):
- Scaffold Next.js app en Vercel.
- Conexión Supabase (tras aplicar schema de S019).
- Auth de Pablo (magic link o email).
- Vista de inventario mínima.

---

*Sesión 020 — 2026-06-27 — Claude Code (Sonnet). Modo DOCS_ONLY / CONTRACT_DESIGN / NO_REMOTE_WRITE.*
