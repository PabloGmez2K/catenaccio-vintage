# SERVER_FILESYSTEM_READONLY_DISCOVERY — Catenaccio Vintage

Discovery de la estructura real del filesystem del servidor: child theme, plugins custom, overrides Elementor.

**Proyecto:** Catenaccio Vintage  
**Fecha:** 2026-06-14  
**Sesión:** 010A (bloqueado) → **010B (completado)**  
**Modo:** READ_ONLY — UAPI Fileman list_files + get_file_content (sin escritura)  
**Agente:** Claude Code (Sonnet)  
**Método final:** cPanel UAPI Token (Authorization: cpanel user:token)  
**Prerequisito para:** A0_MIGRATION_PLAN

---

## 1. ESTADO GENERAL

```
CPANEL_API_READONLY_DISCOVERY_COMPLETED
```

El acceso cPanel UAPI con token fue exitoso. Se listaron directorios y se leyeron los 4 archivos críticos en modo estrictamente read-only. Ninguna escritura ejecutada en ningún momento.

**Veredicto final:**

```
APPROVE_A0_MIGRATION_PLAN_PREP
```

La migración A0 es más viable de lo esperado:
- Ambos plugins custom sobreviven la desactivación de Elementor Pro.
- No hay template overrides de WooCommerce en el child theme.
- El filtro de productos tiene lógica nativa WC que no depende de Elementor.
- El menú Off-Canvas es un shortcode 100% independiente de Elementor.

---

## 2. HISTORIAL DE ACCESO

### 2.1 Sesión 010A — WebDAV (BLOCKED)

| URL intentada | Resultado |
|---------------|-----------|
| `https://catenacciovintage.com:2078/` | **TIMEOUT** — puerto bloqueado firewall Raiola |
| `http://catenacciovintage.com:2077/` | **TIMEOUT** — puerto bloqueado firewall Raiola |
| `https://webdisk.catenacciovintage.com/` | **ConnectionError** — DNS no resuelve |
| `https://catenacciovintage.com/` (PROPFIND) | **403 Forbidden** — WebDAV no habilitado en 443 |

### 2.2 Sesión 010B — cPanel UAPI Token (ÉXITO)

| Endpoint | Resultado |
|----------|-----------|
| `https://com1014.raiolanetworks.es:2083/execute/Fileman/list_files?dir=public_html/wp-content` | **200 OK** — 11 items listados |
| `Fileman/list_files?dir=public_html/wp-content/plugins` | **200 OK** — 23 items (22 dirs + 1 file) |
| `Fileman/list_files?dir=public_html/wp-content/themes/hello-elementor-child` | **200 OK** — 4 items |
| `Fileman/get_file_content` → `style.css` | **200 OK** — 134 bytes leídos |
| `Fileman/get_file_content` → `functions.php` | **200 OK** — 62.335 chars leídos |
| `Fileman/get_file_content` → `filtro-camisetas.php` | **200 OK** — 38.765 chars leídos |
| `Fileman/get_file_content` → `catenaccio-offcanvas-menu.php` | **200 OK** — 14.376 chars leídos |
| `Fileman/list_files?dir=.../woocommerce` | **UAPI status 0** — directorio no existe (OK, esperado) |
| `Fileman/list_files?dir=public_html/wp-content/mu-plugins` | **200 OK** — 0 items (mu-plugins vacío) |

### 2.3 Read-only verification

```
READ_ONLY_VERIFIED — ningún método de escritura ejecutado.
Solo UAPI list_files y get_file_content (ambos read-only).
Ningún save_file_content, upload, mkdir, delete, rename, move, chmod.
```

---

## 3. INVENTARIO REAL DEL FILESYSTEM

### 3.1 wp-content/ — raíz

| Item | Tipo |
|------|------|
| `debug.log` | FILE — 2468 bytes |
| `index.php` | FILE — 28 bytes (dummy de WP) |
| `languages/` | DIR |
| `litespeed/` | DIR — cache LiteSpeed |
| `mu-plugins/` | DIR — **vacío** (Raiola no instala mu-plugins custom) |
| `object-cache.php` | FILE — 13923 bytes (APCu object cache) |
| `plugins/` | DIR |
| `themes/` | DIR |
| `upgrade/` | DIR |
| `upgrade-temp-backup/` | DIR |
| `uploads/` | DIR — 393216 bytes |

### 3.2 plugins/ — listado completo (22 plugins activos/inactivos)

| Directorio | Plugin |
|------------|--------|
| `advanced-custom-fields` | ACF FREE v6.7.0 |
| `apcu-manager` | APCu Manager |
| `catenaccio-offcanvas-menu` | **Plugin custom: Off-Canvas Menu v2.2.0** |
| `classic-editor` | Classic Editor |
| `complianz-gdpr` | Complianz GDPR |
| `elementor` | Elementor FREE |
| `elementor-pro` | Elementor Pro (expira ~2026-07-01) |
| `filtro-camisetas` | **Plugin custom: Filtro Camisetas Personalizado Pro v3.0.0** |
| `litespeed-cache` | LiteSpeed Cache |
| `nextend-facebook-connect` | Nextend Social Login |
| `seo-by-rank-math` | RankMath SEO |
| `templately` | Templately |
| `temporary-login` | Temporary Login Without Password |
| `woo-update-manager` | WooCommerce Update Manager |
| `woocommerce` | WooCommerce |
| `woocommerce-payments` | WooPayments |
| `woocommerce-paypal-payments` | PayPal Payments |
| `wp-crontrol` | WP Crontrol |
| `wp-debugging` | WP Debugging |
| `wp-mail-logging` | WP Mail Logging |
| `wp-mail-smtp` | WP Mail SMTP |
| `wps-hide-login` | WPS Hide Login (instalado, ¿activo?) |

**Hallazgo relevante:** El plugin de off-canvas se llama `catenaccio-offcanvas-menu` (no `off-canvas-menu` como se asumía). El de filtro es `filtro-camisetas` (no `filtro-camisetas-pro`). Los nombres de directorio cambian el path real para futuras referencias.

### 3.3 Child theme: hello-elementor-child/

| Item | Tipo | Tamaño |
|------|------|--------|
| `functions.php` | FILE | **62.501 bytes** (código activo extenso) |
| `style.css` | FILE | 134 bytes (header mínimo) |
| `img/` | DIR | (iconos de pago y UI) |
| `js/` | DIR | `cv-search.js` (buscador AJAX) |

**No existe** directorio `woocommerce/` — **sin template overrides de WooCommerce**. Confirmado.

### 3.4 mu-plugins/

**Vacío.** Raiola no instala mu-plugins en este plan. Confirmado.

---

## 4. ANÁLISIS: style.css

```css
/*
Theme Name: Hello Elementor Child
Template: hello-elementor
Version: 1.0.0
*/

@import url("../hello-elementor/style.css");
```

Mínimo. Solo el header obligatorio de tema hijo y el import del padre. **Sin CSS custom en style.css.** El CSS personalizado está en Elementor (inline CSS por template) o en los plugins.

---

## 5. ANÁLISIS: functions.php

**Tamaño real:** 62.501 bytes, ~1.712 líneas. Última revisión en código: 14/03/2026.

### 5.1 Shortcodes definidos en functions.php

| Shortcode | Función | Dep Elementor |
|-----------|---------|---------------|
| `[cv_product_meta]` | Talla, medidas, condición, defectos (ACF fields) | Ninguna |
| `[cv_explorar]` | Links a colecciones relacionadas (equipo/liga/año/talla/jugador) | Ninguna |
| `[cv_archive_title]` | H1 SEO dinámico en archivos de taxonomía | Ninguna |
| `[cv_archive_intro]` | Intro SEO con toggle "Ver más/menos" | Ninguna |
| `[cv_short_description]` | Descripción corta dinámica desde ACF | Ninguna |
| `[cv_search_latest_products]` | Grid de 4 últimos productos para popup de búsqueda | Ninguna |

### 5.2 AJAX handlers

| Acción | Handler |
|--------|---------|
| `wp_ajax_cv_search_products` + `wp_ajax_nopriv_cv_search_products` | Buscador AJAX del header/popup |

### 5.3 Sistema de URL clean (rewrite)

- **Categorías:** URLs `/laliga/`, `/premier-league/` via `add_rewrite_rule('top')` con transient 12h
- **Productos:** URLs `/camiseta-real-madrid-1999/` (sin prefijo /product/) via reglas individuales `top` + catch-all `bottom`
- **Invalidación:** En `transition_post_status` (publicar producto) + `created/edited_product_cat`
- **CDN:** `do_action('litespeed_purge_all')` al publicar producto
- `flush_rewrite_rules_hard` retorna `false` (no regenera `.htaccess`)

**Riesgo A0:** Las rewrite rules son 100% WP nativas. Sobreviven la desactivación de Elementor Pro. El riesgo es que al activar un tema nuevo (si fuese necesario) haya que hacer un flush manual — pero en A0 no se cambia el tema.

### 5.4 Dependencias de Elementor en functions.php

| Línea | Código | Tipo de dependencia |
|-------|--------|---------------------|
| L11 | `class_exists('\Elementor\Plugin')` → encola `frontend-lite.min.css` | CSS enqueue condicional |
| L242 | `elementor/editor/before_enqueue_scripts` → compatibilidad editor | Solo en contexto admin/editor |
| L1613-1675 | `cv_minicart_popup_enhancements()` usa `.elementor-menu-cart__footer-buttons`, `.elementor-button--view-cart`, `.elementor-button--checkout` | **Selectores Pro en JS** |

**Evaluación riesgo A0 (mini-cart):** `cv_minicart_popup_enhancements()` mejora el mini-carrito de Elementor. Cuando se desactive Pro, el widget `woocommerce-menu-cart` del header 653 desaparecerá. Sin ese widget, los selectores JS nunca encontrarán elementos — la función se vuelve un no-op. **No rompe nada, pero deja de funcionar.** La funcionalidad del mini-carrito deberá reimplementarse con el widget WC nativo cuando se migre el header.

### 5.5 Hooks WooCommerce en functions.php

| Hook | Función | A0 status |
|------|---------|-----------|
| `woocommerce_package_rates` | IVA 21% en envío (precio incluido) | **Crítico — mantener** |
| `woocommerce_get_breadcrumb` × 2 | Breadcrumbs con liga/equipo/selecciones | Mantener |
| `woocommerce_product_post_type_args` | Remove `/product/` slug | **Crítico — mantener** |
| `woocommerce_registration_privacy_policy_text` + form hooks | Registro con nombre, contraseña confirmada, newsletter | Mantener |
| `template_redirect` | Redirigir `/mi-cuenta/` a `/acceder/` si no logueado | Mantener |
| `user_register` | Nextend Social Login → Customer role | Mantener |
| `pre_get_posts` | Carrusel home: solo productos en stock | Mantener |

### 5.6 ACF fields referenciados en functions.php

| Field | Función | Tipo dato |
|-------|---------|-----------|
| `talla` | `cv_product_meta`, `cv_short_description` | string |
| `medida_axila` | `cv_product_meta`, `cv_short_description` | numeric |
| `medida_largo` | `cv_product_meta`, `cv_short_description` | numeric |
| `condicion` | `cv_product_meta`, `cv_short_description` | string |
| `defectos` | `cv_product_meta`, `cv_short_description` | string |

Todos son ACF FREE. No hay campos ACF Pro (repeaters, flexible content, etc.).

### 5.7 Taxonomías usadas en functions.php

`pa_equipo`, `pa_liga`, `pa_jugador`, `pa_ano`, `pa_talla`, `pa_marca`, `pa_condicion`

---

## 6. ANÁLISIS: Filtro Camisetas Personalizado Pro v3.0.0

**Directorio real:** `plugins/filtro-camisetas/`  
**Archivo principal:** `filtro-camisetas.php` (38.765 chars)

### 6.1 Shortcodes registrados

| Shortcode | Descripción |
|-----------|-------------|
| `[filtro_taxonomico slug="pa_liga" titulo="Liga"]` | Filtro individual por taxonomía |
| `[filtro_camisetas_ui]` | UI completa: contador + ordenar + filtros activos + "limpiar" |
| `[filtro_contador]` | Solo el contador de productos |

### 6.2 AJAX handlers

| Acción | Handler |
|--------|---------|
| `wp_ajax_filtro_contar_productos` + `wp_ajax_nopriv_filtro_contar_productos` | Contador vía AJAX |

### 6.3 Hooks de Elementor en el plugin

| Hook | Uso | Riesgo A0 |
|------|-----|-----------|
| `elementor/query/filtro_camisetas` | Integra con Loop Grid custom query de Elementor | Si se reemplaza el Loop Grid, este hook nunca se llama. **Sin efecto.** |
| `did_action('elementor/loaded')` | Warning de dependencia en admin | Solo muestra aviso admin si Elementor no está. No rompe funcionalidad. |

**Conclusión crítica:** La lógica core del filtro (shortcodes, query WC, AJAX) funciona **sin Elementor**. El warning de dependencia es cosmético. El hook de Loop Grid solo se dispara si hay un Loop Grid activo con query `filtro_camisetas` — al reemplazarlo, simplemente deja de usarse.

### 6.4 Taxonomías registradas por el plugin

El plugin hace `register_taxonomy()` para: `pa_talla`, `pa_marca`, `pa_equipo`, `pa_condicion`, `pa_liga`, `pa_jugador`, `pa_ano` (solo si no existen). WooCommerce también las registra como product attributes — no hay riesgo de conflicto ni de perder las taxonomías si el plugin se desactiva.

---

## 7. ANÁLISIS: Catenaccio Off-Canvas Menu v2.2.0

**Directorio real:** `plugins/catenaccio-offcanvas-menu/`  
**Archivo principal:** `catenaccio-offcanvas-menu.php` (14.376 chars)

### 7.1 Shortcode registrado

```
[catenaccio_offcanvas_menu show_leagues="yes" show_sizes="yes" show_players="yes"]
```

Renderiza un menú `<nav>` con:
- Acordeón liga → equipos (solo con stock)
- Lista jugadores (solo con stock)
- Tags de tallas (solo con stock)

Todo via `get_terms()`, `wp_get_object_terms()`, transients (1h).

### 7.2 Dependencias Elementor

```
NINGUNA
```

El plugin es 100% independiente de Elementor. No registra widgets. No usa `Elementor\Widget_Base`. No verifica `did_action('elementor/loaded')`. Solo usa `add_shortcode`, `wp_enqueue_scripts`, hooks WC de stock.

**Conclusión crítica:** El widget `off-canvas` que aparecía en Elementor templates 653 y 129 NO es un widget registrado por este plugin. Es probablemente el toggle de un popup nativo de Elementor que abre un panel que contiene `[catenaccio_offcanvas_menu]` como shortcode. Al migrar esas templates, el menú puede mantenerse via shortcode en cualquier widget de texto/HTML.

### 7.3 Assets propios

- `assets/css/offcanvas-menu.css` — estilos del panel off-canvas
- `assets/js/offcanvas-menu.js` — lógica acordeón + apertura/cierre del panel

Estos assets son autocontenidos. No dependen de Elementor Pro.

---

## 8. RIESGOS A0 — ACTUALIZADOS CON DATOS REALES

| Riesgo | Prob. anterior | Realidad | Riesgo actualizado |
|--------|---------------|----------|-------------------|
| Filtro Camisetas acoplado a Elementor Loop Grid | Media | El core es WC-nativo. Solo hay un hook `elementor/query/filtro_camisetas` que se ignora si no hay Loop | **BAJO** |
| Off-Canvas Menu registra widget Elementor | Media | FALSE — es un shortcode independiente | **ELIMINADO** |
| URL rewrite en functions.php rompe al cambiar tema | Alta | Sobrevive A0 (no cambiamos tema). Solo hay riesgo si se activa tema nuevo | **BAJO (A0)** |
| Mini-cart JS usa clases Elementor Pro | Desconocido | CONFIRMADO — pero cuando Pro se desactive, el widget fuente desaparece. La función queda como no-op | **BAJO** |
| Template overrides WooCommerce en child theme | Desconocido | CONFIRMADO: no existe `woocommerce/` en child theme | **ELIMINADO** |
| ACF Pro dependency | Desconocido | CONFIRMADO: solo ACF FREE. `get_field()` estándar | **ELIMINADO** |
| OPcache lleno interfiere con cambios PHP | Alta (conocido) | Persiste — flush manual de LiteSpeed Cache antes de cualquier cambio | **MEDIO** |
| `flush_rewrite_rules` al activar/desactivar plugins | Alta (patrón WP) | Confirmado necesario. El plugin Filtro Camisetas lo hace en activation/deactivation hooks | **GESTIONADO** |

---

## 9. MAPA A0 ACTUALIZADO — CON CÓDIGO REAL

### P1-A Header (template 653) — CRÍTICO

| Elemento | Estrategia A0 | Complejidad |
|----------|--------------|-------------|
| `nav-menu` Pro | WP native `wp_nav_menu()` en template PHP o widget Free | Baja |
| `woocommerce-menu-cart` Pro | Widget Free `woocommerce-menu-cart` (Elementor Free) o snippet PHP | Baja |
| `off-canvas` toggle (panel offcanvas) | Reemplazar por botón + panel PHP con `[catenaccio_offcanvas_menu]` | Media |
| `cv_minicart_popup_enhancements()` | Actualizar selectores CSS en functions.php para el widget nuevo | Baja |
| Iconos pago en mini-carrito | Ya en `/img/payment/` del child theme. Solo actualizar selectores JS | Baja |

**Riesgo residual:** El popup del menú off-canvas usa `#elementor-action:xxx` links para abrirse. Al migrar, hay que reemplazar ese mecanismo con CSS toggle puro o JS mínimo. El contenido del panel (`[catenaccio_offcanvas_menu]`) sobrevive sin cambios.

### P1-B Producto individual (template 100) — CRÍTICO

| Elemento | Estrategia A0 | Complejidad |
|----------|--------------|-------------|
| 5 widgets WC Pro | `do_action('woocommerce_single_product_summary')` hooks en template PHP | Media |
| URL limpia `/producto-slug/` | Ya funciona via rewrite rules en functions.php | **Ninguna** |
| `[cv_product_meta]` | Shortcode propio — 0 dependencia Elementor | **Ninguna** |
| `[cv_explorar]` | Shortcode propio — 0 dependencia Elementor | **Ninguna** |
| `[cv_short_description]` | Shortcode propio — 0 dependencia Elementor | **Ninguna** |
| `[cv_archive_title/intro]` | Solo en archives, no en PDP | N/A |

### P1-C Archivo productos / categorías (template 129) — CRÍTICO

| Elemento | Estrategia A0 | Complejidad |
|----------|--------------|-------------|
| `loop-grid` Pro | `woocommerce_product_loop_start/end` + template PHP nativo o Elementor Free loop | Media |
| `[filtro_camisetas_ui]` | Shortcode nativo — sobrevive sin Elementor | **Ninguna** |
| `[filtro_taxonomico]` | Shortcode nativo | **Ninguna** |
| `[catenaccio_offcanvas_menu]` en panel lateral | Shortcode nativo | **Ninguna** |
| `[cv_archive_title]` | Shortcode nativo | **Ninguna** |
| URL `/camisetas/laliga/` | Ya funciona via rewrite | **Ninguna** |

### P2 Carrito / Mi Cuenta — QUICK WIN DISPONIBLE

- Carrito id=25: `[woocommerce_cart]` shortcode en widget Text de Elementor Free (o Gutenberg block)
- Mi Cuenta id=27: `[woocommerce_my_account]` shortcode
- **Acción Pablo, 10 min en WP Admin. No requiere agente.**

---

## 10. INVENTARIO DE SHORTCODES

Todos los shortcodes custom son 100% propios y no dependen de Elementor:

| Shortcode | Origen | Dónde se usa |
|-----------|--------|--------------|
| `[cv_product_meta]` | functions.php | Template producto 100 |
| `[cv_explorar]` | functions.php | Template producto 100 |
| `[cv_archive_title]` | functions.php | Templates archive 129 + categorías |
| `[cv_archive_intro]` | functions.php | Templates archive 129 + categorías |
| `[cv_short_description]` | functions.php | Template producto 100 (excerpt) |
| `[cv_search_latest_products]` | functions.php | Template buscador 1468/1471 |
| `[filtro_camisetas_ui]` | filtro-camisetas plugin | Template 129 (panel filtros) |
| `[filtro_taxonomico slug="..."]` | filtro-camisetas plugin | Template 129 (filtros individuales) |
| `[filtro_contador]` | filtro-camisetas plugin | Template 129 (contador) |
| `[catenaccio_offcanvas_menu]` | catenaccio-offcanvas-menu plugin | Panel off-canvas en header 653 y archive 129 |

---

## 11. DEPENDENCIAS CONFIRMADAS vs. DESMENTIDAS

### Confirmadas

- ACF FREE: `get_field('talla')`, `get_field('medida_axila')`, `get_field('medida_largo')`, `get_field('condicion')`, `get_field('defectos')`
- LiteSpeed Cache: `do_action('litespeed_purge_all')` al publicar producto
- WooCommerce: hooks de IVA, breadcrumbs, rewrite, registro
- Nextend Social Login: hook `user_register` → set Customer role
- RankMath: `rank_math/frontend/description` filter + `rank_math/opengraph/image` filter

### Desmentidas (riesgos eliminados)

| Suposición previa | Realidad |
|-------------------|----------|
| Off-Canvas Menu registra widget Elementor | Plugin standalone con shortcode |
| woocommerce/ override directory en child theme | **No existe** |
| ACF Pro requerido | Solo ACF FREE |
| Filtro Camisetas acoplado a Elementor | Core 100% WC-nativo |
| mu-plugins de Raiola | mu-plugins vacío |

---

## 12. VEREDICTO FINAL

```
CPANEL_API_READONLY_DISCOVERY_COMPLETED
→ APPROVE_A0_MIGRATION_PLAN_PREP
```

**Canal de acceso confirmado:** cPanel UAPI token. Script reutilizable: `scripts/filesystem/cpanel_uapi_probe.py`.

**Siguiente sesión recomendada:** A0_MIGRATION_PLAN — escribir el plan técnico completo con el contexto real del código. Sesión estimada: 45-60 min.

**Prerequisito para A0_MIGRATION_PLAN:** Ninguno nuevo. Pablo puede autorizar la próxima sesión.

**Acción Pablo sin agente disponible:** CARRITO_MICUENTA_QUICKWIN — reemplazar widgets Pro en Carrito (id=25) y Mi Cuenta (id=27) por shortcodes en WP Admin → Elementor. 10 min.

---

## 13. HISTORIAL DE ACCESO

```
2026-06-14 — SESSION 010A
Script: scripts/filesystem/webdav_probe.py
Resultado: BLOCKED_WEBDAV_CONNECTION

2026-06-14 — SESSION 010B
Script: scripts/filesystem/cpanel_uapi_probe.py
Auth: cPanel API Token (Authorization: cpanel {user}:{token})
Endpoint base: com1014.raiolanetworks.es:2083
Resultado: CPANEL_API_READONLY_DISCOVERY_COMPLETED

Archivos leídos:
  - public_html/wp-content/themes/hello-elementor-child/style.css (134 bytes)
  - public_html/wp-content/themes/hello-elementor-child/functions.php (62335 chars)
  - public_html/wp-content/plugins/filtro-camisetas/filtro-camisetas.php (38765 chars)
  - public_html/wp-content/plugins/catenaccio-offcanvas-menu/catenaccio-offcanvas-menu.php (14376 chars)

Directorios listados (read-only):
  - public_html/wp-content/ (11 items)
  - public_html/wp-content/plugins/ (23 items)
  - public_html/wp-content/themes/hello-elementor-child/ (4 items)
  - public_html/wp-content/mu-plugins/ (0 items — vacío)
  - public_html/wp-content/themes/hello-elementor-child/woocommerce/ (no existe)

Ninguna escritura ejecutada. Token no impreso. .env.local no commiteado.
```
