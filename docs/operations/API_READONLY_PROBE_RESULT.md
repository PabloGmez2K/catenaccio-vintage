# API_READONLY_PROBE_RESULT — Catenaccio Vintage

Resultado del probe de solo lectura a la API de WordPress/WooCommerce sin SSH.

**Proyecto:** Catenaccio Vintage  
**Fecha:** 2026-06-13  
**Sesión:** 007  
**Modo:** READ_ONLY — ningún POST, PUT, PATCH ni DELETE ejecutado  
**Agente:** Claude Code (Sonnet)  
**Site URL testada:** `https://catenacciovintage.com`

---

## 1. VEREDICTO

**Acceso parcialmente confirmado.** Los endpoints públicos funcionan y devuelven datos reales. Los endpoints autenticados (WC REST API v3, elementor_library, elementor templates) requieren las credenciales de Application Password.

**Bloqueante actual:** `.env.local` existe pero está vacío — las variables `WP_SITE_URL`, `WP_APP_USER` y `WP_APP_PASSWORD` no están definidas. Pablo debe completarlo (ver §6).

**Con credenciales válidas en `.env.local`, el agente podrá:**
- Leer los 19 items de `elementor_library` con sus datos completos (tipo, widgets usados, estado).
- Leer todos los productos WooCommerce con atributos completos (pa_liga, pa_equipo, etc.).
- Verificar el estado de licencia de Elementor Pro.
- Auditar Track 0 sin intervención manual de Pablo.

---

## 2. ESTADO DE .env.local

| Check | Resultado |
|-------|-----------|
| Archivo existe | ✅ `.env.local` existe |
| Ignorado por Git | ✅ `.gitignore` línea 5: `.env.*` |
| `WP_SITE_URL` definida | ❌ Archivo vacío (0 bytes) |
| `WP_APP_USER` definida | ❌ Archivo vacío (0 bytes) |
| `WP_APP_PASSWORD` definida | ❌ Archivo vacío (0 bytes) |

**Acción requerida:** Pablo completa `.env.local` (ver §6).

---

## 3. RESULTADOS POR ENDPOINT

### 3.1 Endpoints públicos — sin autenticación

| Endpoint | Método | Status | Resultado |
|----------|--------|--------|-----------|
| `/wp-json/` | GET | **200 OK** | Site info + 37 namespaces registrados |
| `/wp-json/wp/v2/types` | GET | **200 OK** | 16 post types visibles incluyendo `elementor_library` y `product` |
| `/wp-json/wc/store/v1/products?per_page=100` | GET | **200 OK** | **28 productos**, precios en EUR cents |
| `/wp-json/wc/store/v1/products/categories` | GET | **200 OK** | 4 categorías |
| `/wp-json/wc/store/v1/products/1792` | GET | **200 OK** | Detalle público (sin atributos WC) |

#### Datos confirmados vía endpoints públicos

**Site:**
```
name: Catenaccio Vintage
url: https://catenacciovintage.com
namespaces activos: 37
```

**Namespaces clave confirmados:**
```
wc/v3              ← WooCommerce REST API v3 disponible
wc/store/v1        ← WC Store API (público)
wp/v2              ← WordPress REST API
elementor/v1       ← Elementor API
elementor-pro/v1   ← Elementor Pro API ← confirma Pro sigue activo en servidor
elementor-one/v1   ← Elementor
```

**Post types accesibles (GET /wp-json/wp/v2/types):**
```
post, page, attachment, nav_menu_item, wp_block, wp_template,
wp_template_part, wp_global_styles, wp_navigation, wp_font_family,
wp_font_face, e-floating-buttons, elementor_library,
elementor_snippet, product, templately_library
```
→ `elementor_library` está registrado y visible como tipo. Sus items requieren auth.

**Productos (28 confirmados, muestra):**
```
id=1792  "2014-15 France Away Shirt - (XXL)"  €45.00
id=1782  "2022-23 Ajax Away Shirt - (XXL)"    €55.00
id=1773  "2022-23 Liverpool Home Shirt - (XXL)" €45.00
```
→ Precios en EUR cents. Store API no expone atributos custom (pa_liga, etc.) — se necesita WC REST API v3 con auth.

**Categorías WooCommerce:**
```
id=149  Leyendas              (14 productos)
id=22   Nuevo                 (16 productos)
id=148  Selecciones Nacionales (9 productos)
id=17   Sin categorizar        (5 productos)
```

---

### 3.2 Endpoints autenticados — requieren Application Password

| Endpoint | Método | Status sin auth | Diagnóstico |
|----------|--------|-----------------|-------------|
| `/wp-json/wp/v2/users/me` | GET | **401** | Requiere auth — confirma usuario |
| `/wp-json/wp/v2/elementor_library?per_page=100` | GET | **401** | Requiere auth — lista los 19 items |
| `/wp-json/elementor/v1/site-editor/templates` | GET | **401** | Requiere auth — templates con estructura completa |
| `/wp-json/elementor-pro/v1/license/get-license-status` | GET | **401** | Requiere auth — estado de licencia Pro |
| `/wp-json/wc/v3/products?per_page=5` | GET | **401** | Requiere auth — productos con atributos completos |
| `/wp-json/wc/v3/products/attributes` | GET | **401** | Requiere auth — lista pa_liga, pa_equipo, etc. |
| `/wp-json/wc/v3/products/categories` | GET | **401** | Requiere auth |

**Todos los 401 son comportamiento correcto** — la API está protegida. No hay endpoints sensibles expuestos públicamente.

---

## 4. DESCUBRIMIENTOS RELEVANTES

### Elementor Pro sigue activo en el servidor

El namespace `elementor-pro/v1` aparece en `/wp-json/` sin auth. Elementor Pro 3.35.1 sigue registrado y activo. La expiración de la licencia (~2026-07-01) afectará al editor y a algunos widgets, pero el runtime sigue activo hoy.

**Implicación para auditoría:** las rutas de Elementor Pro API son accesibles con credenciales. Podremos verificar el estado de licencia directamente vía `GET /wp-json/elementor-pro/v1/license/get-license-status`.

### La auditoría de elementor_library es factible 100% por API

Con Application Password, el agente puede hacer:
```
GET /wp-json/wp/v2/elementor_library?per_page=100&context=edit
```
Esto devuelve todos los items con:
- `id`, `title`, `status`, `type` (page, section, widget, etc.)
- `meta` con el contenido Elementor serializado — permite detectar qué widgets usan
- Sin necesidad de capturas manuales de Pablo

**Alternativa complementaria:** `GET /wp-json/elementor/v1/site-editor/templates` con auth — devuelve los templates con su estructura completa.

### WC Store API expone datos básicos públicamente

28 productos, 4 categorías y precios son accesibles sin auth. **Pero los atributos taxonomómicos** (pa_liga, pa_equipo, pa_talla, pa_marca, pa_condicion, pa_ano, pa_jugador) **no están en el Store API** — solo en WC REST API v3 con auth.

Para Studio, es WC REST API v3 con Application Password. El Store API no es suficiente.

### Permisos necesarios para WC REST API v3

Application Password de un usuario WordPress funciona para WC REST API v3 **solo si el usuario tiene rol con capacidades WooCommerce**. Un `Author` puro puede no tener acceso a `wc/v3`. Las opciones:

| Rol recomendado | Acceso WC REST API v3 | Riesgo |
|----------------|----------------------|--------|
| `Administrator` | Total | Alto — no usar para el agente |
| `Shop Manager` | Total sobre productos, pedidos, etc. | Medio — acceso amplio |
| `Editor` + `manage_woocommerce` capability | Sí (si el rol tiene la cap) | Bajo si bien configurado |
| `Author` puro | No | Insuficiente para WC API |

**Recomendación:** el usuario limitado del agente debe tener rol `Shop Manager` o ser un `Editor` al que se añada la capacidad `manage_woocommerce`. Verificar en §6.

---

## 5. ESTADO DE CADA OBJETIVO DEL PROBE

| Objetivo | Estado | Notas |
|----------|--------|-------|
| Confirmar site URL real | ✅ | `https://catenacciovintage.com` — 200 OK |
| Confirmar namespaces disponibles | ✅ | 37 namespaces, wc/v3, elementor-pro/v1 activos |
| Confirmar 28 productos | ✅ | X-WP-Total: 28 vía Store API |
| Confirmar elementor_library como tipo accesible | ✅ | Visible en wp/v2/types |
| Leer items de elementor_library | ⏳ | Requiere .env.local completo |
| Leer productos WC con atributos | ⏳ | Requiere .env.local completo |
| Confirmar usuario y permisos del agente | ⏳ | Requiere .env.local completo |
| Verificar licencia Elementor Pro | ⏳ | Requiere .env.local completo |
| Leer atributos WC (pa_liga, etc.) | ⏳ | Requiere .env.local completo |

---

## 6. FORMATO REQUERIDO PARA .env.local

Pablo debe completar `.env.local` con este formato exacto:

```
WP_SITE_URL=https://catenacciovintage.com
WP_APP_USER=nombre-del-usuario-limitado
WP_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
```

**Notas importantes:**
- `WP_APP_PASSWORD` tiene espacios — es el formato nativo de WordPress Application Passwords. No quitar los espacios.
- `WP_APP_USER` es el username (login) del usuario limitado, no el email ni el display name.
- El usuario debe tener rol `Shop Manager` para acceso completo a WC REST API v3.
- Si el usuario fue creado con rol `Author`, cambiarlo a `Shop Manager` en WP Admin → Usuarios → Editar.
- Nunca usar el usuario administrador principal como `WP_APP_USER`.

**Verificación después de completar:**

El agente ejecutará:
```
GET /wp-json/wp/v2/users/me
Authorization: Basic base64(WP_APP_USER:WP_APP_PASSWORD)
```
Si devuelve 200 con los datos del usuario → credenciales correctas.  
Si devuelve 401 → usuario o password incorrectos.  
Si devuelve 403 → usuario existe pero no tiene permisos WC.

---

## 7. CAMINO RECOMENDADO PARA AUDITAR ELEMENTOR

### Opción A — Por API (recomendada, una vez .env.local completo)

```
GET /wp-json/wp/v2/elementor_library?per_page=100&context=edit
Authorization: Basic base64(user:app_password)
```

Devuelve todos los items con título, tipo, status y el JSON de Elementor con los widgets usados. El agente puede parsear el JSON para detectar widgets Pro (Loop Grid, Woo Archive, Pricing Table, etc.) automáticamente.

**Ventaja:** sin intervención de Pablo, resultado 100% automatizable.  
**Requiere:** .env.local completo + usuario con permisos suficientes.

### Opción B — WP Admin supervisado (fallback)

Si la API no da acceso suficiente al JSON de Elementor, Pablo abre WP Admin → Elementor → Templates → Library y el agente inspecciona la pantalla vía captura. Más lento pero siempre funciona.

**Recomendación:** probar Opción A primero. Fallback a B solo si `context=edit` no devuelve el JSON de Elementor completo.

---

## 8. PRÓXIMO PASO

1. **Pablo completa `.env.local`** (§6) — 5 minutos.
2. **Sesión 007b** — Agente ejecuta probe autenticado:
   - `GET /wp-json/wp/v2/users/me` → confirma usuario y rol.
   - `GET /wp-json/wc/v3/products/attributes` → lista pa_liga, pa_equipo, etc.
   - `GET /wp-json/wp/v2/elementor_library?per_page=100&context=edit` → los 19 items con widgets.
   - `GET /wp-json/elementor-pro/v1/license/get-license-status` → estado de licencia Pro.
3. **Sesión 008** — A0_ELEMENTOR_DEPENDENCY_AUDIT con datos reales del API.

---

*Versión 007 — 2026-06-13 — Claude Code Sonnet.*  
*Probe ejecutado en modo estrictamente READ_ONLY. Ninguna escritura al sitio.*
