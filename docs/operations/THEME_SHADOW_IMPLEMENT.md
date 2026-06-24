# THEME_SHADOW_IMPLEMENT — Catenaccio Vintage

Reporte técnico de implementación local del tema sombra `catenaccio-a0-child`.

**Proyecto:** Catenaccio Vintage  
**Fecha:** 2026-06-20  
**Sesión:** 013  
**Modo:** LOCAL_CODE_ONLY / IMPLEMENT_SHADOW_THEME / NO_SERVER  
**Agente:** Claude Code (Sonnet)  
**Basado en:** `docs/operations/THEME_SHADOW_SCAFFOLD.md` (Sesión 012)

---

## 1. VEREDICTO

```
APPROVE_READY_FOR_SYNC — para estructura de archivos, templates y layout visual
FIX_BLOCKER_FIRST     — para funciones fiscales y de URL antes de activar en producción
```

El tema sombra está implementado como paquete local listo para sync en Sesión 014.  
**NO activar en producción sin resolver los 4 BLOCKERS** del §3. Las ventas no se bloquean, pero el IVA del envío no se aplicaría.

---

## 2. ÁRBOL DE ARCHIVOS CREADO

```
catenaccio-a0-child/
├── style.css                          ✅ COMPLETO
├── functions.php                      ⚠️ PARCIAL (ver §3 — BLOCKERS)
├── header.php                         ✅ COMPLETO
├── footer.php                         ✅ COMPLETO
├── woocommerce/
│   ├── single-product.php             ✅ COMPLETO
│   ├── archive-product.php            ✅ COMPLETO
│   └── content-product.php            ✅ COMPLETO
└── assets/
    ├── css/
    │   └── cv-a0.css                  ✅ COMPLETO (layout funcional)
    └── js/
        └── cv-a0.js                   ✅ COMPLETO (toggle off-canvas)
```

**Total:** 9 archivos creados. Ningún archivo adicional fuera del árbol aprobado.

---

## 3. GATE DE FUENTE EXACTA — RESULTADO

**Problema detectado en TAREA 1:** El `functions.php` del tema activo (`hello-elementor-child`, 62KB, ~1712 líneas) fue leído en Sesión 010B y analizado, pero **su código fuente NO fue guardado en el repo**. Solo está disponible el análisis en `SERVER_FILESYSTEM_READONLY_DISCOVERY.md`.

**Consecuencia:** Las 4 categorías de funciones que requieren portabilidad exacta no pueden implementarse sin el código fuente real. Se documentan como BLOCKERS.

### 3.1 BLOCKER-A — IVA 21% en envío (CRÍTICO — NO PRODUCCIÓN SIN ESTO)

**Hook:** `add_filter('woocommerce_package_rates', ...)`  
**Riesgo:** Sin este hook, el IVA del 21% no se aplica al coste de envío → error fiscal en pedidos.  
**Estado:** NO IMPLEMENTADO. No inventar lógica fiscal.  
**Acción para desbloquear:** Pablo sube `functions.php` del tema activo al repo (branch o carpeta `reference/`) o pega el fragmento en sesión 013b. Buscar: `woocommerce_package_rates`.

### 3.2 BLOCKER-B — URLs limpias de producto (IMPORTANTE — UX y SEO)

**Hook:** `add_filter('woocommerce_product_post_type_args', ...)` + múltiples `add_rewrite_rule()`  
**Riesgo:** Sin esto, las URLs de producto son `/producto/[slug]/` en lugar de `/[slug]/`. Las páginas cargan (no es 404) pero la URL es diferente al diseño actual → posible impacto SEO.  
**Estado:** NO IMPLEMENTADO. El sistema de rewrite del activo es complejo (reglas top + catch-all + transient).  
**Acción para desbloquear:** Código exacto del functions.php activo.  
**Mitigación temporal:** Las ventas y el carrito funcionan con `/producto/[slug]/`.

### 3.3 BLOCKER-C — Breadcrumbs personalizados (NO BLOQUEANTE DE VENTAS)

**Hook:** `add_filter('woocommerce_get_breadcrumb', ...)` × 2  
**Riesgo:** WooCommerce usa breadcrumbs nativos (funcionales). Solo se pierde la personalización de nodos liga/equipo/selecciones.  
**Estado:** NO IMPLEMENTADO.  
**Acción para desbloquear:** Código exacto. Completar en sesión 013b.

### 3.4 BLOCKER-D — Carrusel home solo en stock (NO BLOQUEANTE DE VENTAS)

**Hook:** `add_action('pre_get_posts', ...)` (carrusel home)  
**Riesgo:** El carrusel de la home puede mostrar productos agotados.  
**Estado:** NO IMPLEMENTADO.  
**Acción para desbloquear:** Código exacto. Completar en sesión 013b.

---

## 4. FUNCIONES IMPLEMENTADAS

### 4.1 Completamente implementadas (no requieren código exacto del activo)

| Función | Estado | Archivo |
|---------|--------|---------|
| Enqueue `cv-a0.css` + `cv-a0.js` | ✅ COMPLETO | `functions.php` |
| `register_nav_menus(['primary'])` | ✅ COMPLETO | `functions.php` |
| `[cv_product_meta]` — talla, medidas, condición, defectos via ACF | ✅ MINIMAL | `functions.php` |
| `[cv_short_description]` — fallback a WC short description / excerpt | ✅ MINIMAL | `functions.php` |
| `[cv_explorar]` — links a taxonomías pa_equipo, pa_liga, pa_ano | ✅ MINIMAL | `functions.php` |
| `[cv_archive_title]` — H1 SEO dinámico via `get_queried_object()` | ✅ MINIMAL | `functions.php` |
| `[cv_archive_intro]` — toggle con descripción del término | ✅ MINIMAL | `functions.php` |

**Nota "MINIMAL":** Las implementaciones usan los campos ACF documentados (`talla`, `medida_axila`, `medida_largo`, `condicion`, `defectos`) y las taxonomías conocidas. El output exacto puede diferir del tema activo. La validación visual de Sesión 015 identificará las diferencias.

### 4.2 Shortcodes de plugins (100% funcionan sin modificación)

Estos shortcodes se registran a nivel de plugin — estarán disponibles cuando el tema sombra esté activo sin ningún porte adicional.

| Shortcode | Plugin | Estado |
|-----------|--------|--------|
| `[catenaccio_offcanvas_menu]` | `catenaccio-offcanvas-menu` | ✅ Disponible automáticamente |
| `[filtro_camisetas_ui]` | `filtro-camisetas` | ✅ Disponible automáticamente |
| `[filtro_taxonomico slug="..."]` | `filtro-camisetas` | ✅ Disponible automáticamente |
| `[filtro_contador]` | `filtro-camisetas` | ✅ Disponible automáticamente |

---

## 5. DESCRIPCIÓN DE ARCHIVOS IMPLEMENTADOS

### style.css

Header válido WordPress con `Template: hello-elementor` (hereda del padre, no del child activo). Importa CSS del padre vía `@import url("../hello-elementor/style.css")`. Sin CSS custom en este archivo.

### functions.php

Estrategia APPROVE_MINIMAL_PORT. Solo funciones críticas A0. Guards `!shortcode_exists()` en todos los shortcodes. BLOCKERS documentados con comentarios explícitos. Sin `require_once` del functions.php completo del activo.

### header.php

Reemplaza template 653. Incluye: doctype, `wp_head()`, logo (`the_custom_logo()` con fallback), `wp_nav_menu(['theme_location' => 'primary'])`, mini-cart WC (`woocommerce_mini_cart()`) con guard `class_exists('WooCommerce')`, botón `.cv-offcanvas-toggle`, panel `.cv-offcanvas-panel` con `[catenaccio_offcanvas_menu]` y guard `shortcode_exists()`, backdrop `.cv-offcanvas-backdrop`.

### footer.php

Minimal: `wp_footer()` + cierre `</body></html>`.

### woocommerce/single-product.php

Reemplaza template 100. Componentes en orden: breadcrumbs, galería, H1, precio, `[cv_short_description]`, add-to-cart + variaciones, `[cv_product_meta]`, `[cv_explorar]`, descripción larga.

### woocommerce/archive-product.php

Reemplaza template 129. Componentes: breadcrumbs, `[cv_archive_title]`, `[cv_archive_intro]`, toolbar con `[filtro_camisetas_ui]` + `woocommerce_catalog_ordering()`, sidebar con filtros (pa_liga, pa_equipo, pa_talla, pa_condicion, `[filtro_contador]`), grid nativo WooCommerce, paginación, estado sin productos.

### woocommerce/content-product.php

Reemplaza loop-items 878/354/720/892. Usa `wc_product_class('cv-product-card', $product)` — mantiene clases WooCommerce estándar (`products > li.product`) para compatibilidad con AJAX del plugin `filtro-camisetas`.

### assets/css/cv-a0.css

Estilos: header sticky (flex, logo + nav + actions), submenú hover, off-canvas panel (translateX, transition), backdrop, body lock (`overflow: hidden`), layout producto dos columnas (desktop) / una columna (mobile ≤768px), layout archive (sidebar + grid), tarjeta de producto, paginación, breadcrumbs, responsive completo (960px, 768px, 400px). Variables CSS para fácil personalización en Sesión 015.

### assets/js/cv-a0.js

Toggle off-canvas: open/close por botón, backdrop y ESC. `aria-expanded`, `aria-hidden`, `body.cv-offcanvas-open`. Trampa de foco (accesibilidad). Toggle de `cv-archive-intro` (Ver más / Ver menos). Sin dependencias de Elementor. Defensivo contra elementos DOM ausentes.

---

## 6. AUDITORÍA DE JS Y SELECTORES (TAREA 2)

Basado en documentación de Sesiones 010B y 012:

| Sistema | Análisis | Riesgo A0 |
|---------|---------|-----------|
| `filtro-camisetas` AJAX | Core WC-nativo. `elementor/query/filtro_camisetas` es cosmético — inerte sin Loop Grid. | **BAJO** — usa clases WC estándar (`products`, `li.product`) |
| `catenaccio-offcanvas-menu` JS | 100% autónomo. No depende de `.elementor-popup`. | **ELIMINADO** |
| Mini-cart JS del activo | `cv_minicart_popup_enhancements()` usa `.elementor-menu-cart__footer-buttons` — queda como no-op. | **BAJO** — se reimplementa en `cv-a0.js` con `.cv-mini-cart__footer-buttons` |
| `cv-search.js` (buscador) | No incluido en header A0. Si se necesita, añadir en Sesión 013b. | **DEFER** |
| `cv_archive_intro` toggle | Implementado inline en `cv-a0.js` via `data-target`. | ✅ Resuelto |

---

## 7. CHECKLIST DE VALIDACIÓN LOCAL

- [x] Árbol de 9 archivos creado según §11.1 de THEME_SHADOW_SCAFFOLD.md
- [x] `style.css` tiene `Theme Name: Catenaccio A0 Child` y `Template: hello-elementor`
- [x] `functions.php` no hace `require_once` del activo
- [x] `functions.php` tiene guards `!shortcode_exists()` en todos los shortcodes
- [x] `header.php` incluye todos los componentes de §5.1 del Scaffold
- [x] `woocommerce/single-product.php` incluye todos los componentes de §6.1
- [x] `woocommerce/archive-product.php` incluye todos los componentes de §7.1
- [x] `woocommerce/content-product.php` incluye todos los componentes de §7.4
- [x] `assets/css/cv-a0.css` existe con estilos de layout completos
- [x] `assets/js/cv-a0.js` tiene toggle off-canvas implementado
- [x] No hay secretos, tokens, API keys ni credenciales en ningún archivo
- [x] No se tocó `hello-elementor-child`
- [x] No se tocaron plugins activos
- [x] No se tocó servidor, WordPress ni cPanel
- [ ] BLOCKER-A: IVA 21% en envío → completar en sesión 013b
- [ ] BLOCKER-B: URLs limpias de producto → completar en sesión 013b
- [ ] BLOCKER-C: Breadcrumbs personalizados → completar en sesión 013b
- [ ] BLOCKER-D: Carrusel home en stock → completar en sesión 013b

---

## 8. CHECKLIST VISUAL PARA SESIÓN 015 (Antigravity)

- [ ] Header visible y completo en desktop
- [ ] Menú `primary` muestra los items del menú asignado en WP Admin
- [ ] Mini-carrito visible con contador de ítems
- [ ] Toggle off-canvas visible y funcional
- [ ] Panel off-canvas se abre al hacer click en toggle
- [ ] Panel off-canvas se cierra con botón de cierre, backdrop y ESC
- [ ] Body lock activo al abrir off-canvas (sin scroll de fondo)
- [ ] Header móvil en 375px: menú nav oculto, toggle visible
- [ ] Producto individual: breadcrumbs, galería, título, precio, add-to-cart visibles
- [ ] `[cv_product_meta]` con output visible (talla, medidas, condición)
- [ ] `[cv_explorar]` con links a taxonomías
- [ ] `[cv_short_description]` con texto visible
- [ ] Archive: H1 SEO dinámico, filtros, grid de productos visibles
- [ ] Grid de productos: columnas correctas en desktop y mobile
- [ ] Filtros AJAX: click en filtro actualiza grid sin recarga
- [ ] Paginación visible y funcional
- [ ] Breadcrumbs visibles (WC nativos — personalizados en sesión 013b)
- [ ] Precio con rebaja: `<del>` e `<ins>` con formato correcto
- [ ] Badge de oferta (`.onsale`) visible en producto en oferta
- [ ] Galería de producto: thumbnails visibles
- [ ] Sin errores PHP visibles en el frontend
- [ ] Sin clases `.elementor-*` rotas causando layout issues

---

## 9. RIESGOS PENDIENTES PARA SESIONES 014/015

| Riesgo | Probabilidad | Impacto | Plan |
|--------|-------------|---------|------|
| BLOCKER-A: IVA no aplicado en envío | CIERTO si no se resuelve | ALTO — fiscal | Sesión 013b: código exacto de Pablo |
| BLOCKER-B: URLs `/producto/[slug]/` en lugar de `/[slug]/` | CIERTO si no se resuelve | MEDIO — SEO | Sesión 013b: código exacto de Pablo |
| BLOCKER-C: Breadcrumbs genéricos WC | CIERTO | BAJO | Sesión 013b |
| BLOCKER-D: Carrusel con agotados | CIERTO | BAJO | Sesión 013b |
| Buscador AJAX del activo (`cv-search.js`) no presente en header A0 | CIERTO | BAJO | Sesión 013b: evaluar si añadir al header |
| Mini-cart mejorado ausente (UX) | CIERTO | BAJO | Implementado parcialmente en `cv-a0.css` |
| CSS pixel-perfect: diferencias visuales vs Elementor | PROBABLE | MEDIO | Sesión 015: Antigravity identifica regressions |
| Flush de rewrite rules necesario al activar | CIERTO | ALTO | Pablo: WP Admin → Ajustes → Permalinks → Guardar |
| OPcache / LiteSpeed: tema puede no cargar tras sync | POSIBLE | MEDIO | Pablo: LiteSpeed Cache → Vaciar todo tras sync |

---

## 10. INSTRUCCIONES PARA DESBLOQUEAR LOS BLOCKERS (SESIÓN 013b)

Para completar el `functions.php` del tema sombra, Pablo debe:

**Opción A (recomendada):** Subir el `functions.php` del child activo al repo.
- Crear una carpeta `reference/hello-elementor-child/` en el repo (ignorada por .gitignore para seguridad).
- Subir `functions.php` del activo allí.
- En sesión 013b, el agente extrae las funciones exactas con código real.

**Opción B:** Pegar en el chat solo los fragmentos necesarios.
- Fragmento de `woocommerce_package_rates` (~20-30 líneas)
- Fragmento de `woocommerce_product_post_type_args` + rewrite rules (~50-80 líneas)
- Opcional: `woocommerce_get_breadcrumb` (~30 líneas) y `pre_get_posts` (~20 líneas)

**Opción C:** Solicitar un nuevo token cPanel temporal en sesión 013b para re-leer el functions.php del activo.

---

## 11. PRÓXIMOS PASOS

```
SESIÓN 013b — THEME_SHADOW_COMPLETE_BLOCKERS
  Resolver BLOCKER-A, B, C, D con código exacto del functions.php activo.
  No requiere acceso servidor. Solo lectura de código.
  Prerequisito: Pablo aporta el functions.php (Opción A, B o C del §10).

SESIÓN 014 — THEME_SHADOW_SYNC
  Sync controlado de catenaccio-a0-child/ al servidor.
  Requiere nuevo token cPanel API (el de 010B fue revocado).
  Path guardrail: solo public_html/wp-content/themes/catenaccio-a0-child/

SESIÓN 015 — THEME_SHADOW_VISUAL_VALIDATION
  Validación visual con Antigravity sobre tema sombra inactivo.
  Checklist §8 de este documento.
  Sin aprobación de Sesión 015: NO activar en producción.

RELEASE_MANUAL_PABLO
  Solo tras Sesión 015 aprobada.
  Pablo activa catenaccio-a0-child en WP Admin.
  Pablo hace flush de permalinks.
  Pablo limpia LiteSpeed Cache.
  Rollback disponible: reactivar hello-elementor-child en < 2 min.
```

---

## 12. CONFIRMACIONES DE ESTA SESIÓN (013)

- No se tocó el servidor.
- No se tocó WordPress.
- No se tocó cPanel.
- No se usó ningún token.
- No se leyó `.env.local`.
- No se modificó `hello-elementor-child`.
- No se modificaron plugins activos.
- No se realizó ningún deploy.
- No se activó ningún tema.
- No hay secretos, tokens, credenciales ni API keys en los archivos creados.
- Todos los archivos son locales en `C:\Projects\catenaccio-vintage\catenaccio-a0-child\`.

---

*Documento creado en modo LOCAL_CODE_ONLY / IMPLEMENT_SHADOW_THEME / NO_SERVER.*  
*9 archivos creados. 4 BLOCKERS documentados para sesión 013b.*  
*Fecha: 2026-06-20 — Sesión 013 — Claude Code (Sonnet).*

---

## 13. SESIÓN 013b — BLOCKERS RESUELTOS (2026-06-24)

**Modo:** CPANEL_UAPI_READONLY + LOCAL_PATCH / NO_SERVER_WRITE

**Probe UAPI:**
- Token nuevo creado por Raiola/Pablo: activo.
- `Fileman/list_files` en `public_html/wp-content`: OK.
- `Fileman/get_file_content` en `hello-elementor-child/functions.php`: OK.
- 1711 líneas, 62501 bytes leídos.

**Fragmentos portados:**

| Blocker | Hook/función | Estado |
|---------|-------------|--------|
| BLOCKER-A | `woocommerce_package_rates` — IVA 21% | ✅ Portado |
| BLOCKER-B | URL rewrite system completo (transients + top + catch-all + flush + CDN) | ✅ Portado |
| BLOCKER-C | `cv_woo_breadcrumbs_fix_tax_labels` + `cv_custom_single_product_breadcrumb` | ✅ Portado |
| BLOCKER-D | `pre_get_posts` — carrusel home solo en stock | ✅ Portado |
| EXTRA | `rank_math/frontend/description` + `rank_math/opengraph/image` | ✅ Portado |
| EXTRA | `cv_ajax_search_products` + `cv_search_latest_products` + `cv_enqueue_search_script` | ✅ Portado |

**Funciones helper portadas (BLOCKER-B):**
`get_woocommerce_special_pages`, `custom_remove_category_base`, `custom_rewrite_product_cat_slug`, `cv_invalidate_product_cat_cache`, `remove_product_slug`, `custom_remove_product_slug_rewrite_rules`, `cv_invalidate_product_slugs_cache`, `custom_remove_product_base_from_links`, `ensure_elementor_compatibility`, `custom_flush_rewrite_rules`, `delayed_flush_rewrite_rules`, `transition_post_status` hook, `flush_rewrite_rules_hard` filter.

**Validaciones:**
- `git diff --check`: OK (sin errores de whitespace)
- Solo `catenaccio-a0-child/functions.php` modificado (+538 líneas)
- Sin secretos/tokens en archivos modificados
- PHP CLI no disponible en shell — sintaxis revisada manualmente

**Confirmaciones sesión 013b:**
- No se escribió en el servidor.
- No se tocó WordPress.
- No se tocó `wp-config.php`.
- No se tocó `.htaccess`.
- No se tocó la base de datos.
- No se tocó el tema activo remoto (`hello-elementor-child`).
- No se tocaron plugins activos remotos.
- No se realizó deploy.
- No se activó ningún tema.
- Token/password/.env.local: no impreso, no commiteado.

**Veredicto:** `APPROVE_READY_FOR_SYNC_REAL`

**Siguiente paso:** SESIÓN 014 — THEME_SHADOW_SYNC: subir `catenaccio-a0-child/` al servidor vía Fileman/save_file_content (archivos uno por uno) o vía ZIP upload manual Pablo.
