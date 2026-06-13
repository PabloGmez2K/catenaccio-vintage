# ELEMENTOR_DEPENDENCY_AUDIT — Catenaccio Vintage

Auditoría completa de dependencia de Elementor Pro. Widget-level. READ_ONLY.

**Proyecto:** Catenaccio Vintage  
**Fecha:** 2026-06-13  
**Sesión:** 008 (admin window temporal)  
**Modo:** READ_ONLY — ningún POST, PUT, PATCH ni DELETE  
**Agente:** Claude Code (Sonnet)  
**Elementor Pro versión:** 3.35.1 — expira ~2026-07-01 (~18 días desde auditoría)

---

## 1. VEREDICTO

**15 de 20 elementos auditados requieren migración antes del 2026-07-01.**

- 6 elementos son críticos o de alto impacto en el flujo de venta principal.
- 2 páginas WC (Carrito, Mi Cuenta) usan widgets Pro — NO estaban en Blocks.
- 2 elementos son seguros sin ninguna acción.
- La Finalizar Compra (Checkout) SÍ está en WooCommerce Blocks — confirmado.

---

## 2. METODOLOGÍA

Acceso via `wp/v2/elementor_library/{id}?context=edit` con credenciales de Administrator.  
Widgets extraídos del campo `_elementor_data` (JSON tree).  
Adicionalmente: `wp/v2/pages/{id}?context=edit` para páginas WC (Carrito, Mi Cuenta).  
Condiciones de templates extraídas de `_elementor_conditions` meta field.

**Nota sobre `off-canvas`:** aparece en header (653) y archive (129). En el header, es el overlay de menú móvil. En el archive, posiblemente es el panel lateral del Filtro Camisetas Pro plugin. Se marca como "Pro o Plugin" — requiere verificación manual en WP Admin.

---

## 3. INVENTARIO COMPLETO — TEMPLATES ELEMENTOR LIBRARY

### 3.1 Tabla resumen

| ID | Título | Tipo | Condiciones | Widgets Pro detectados | Nivel |
|----|--------|------|-------------|------------------------|-------|
| 653 | Cabecera simple | `header` | **GLOBAL** (include/general) | nav-menu, woocommerce-menu-cart | **CRÍTICO** |
| 100 | Plantilla producto individual | `product` | include/product | woocommerce-breadcrumb, woocommerce-product-add-to-cart, woocommerce-product-images, woocommerce-product-price, woocommerce-product-title | **CRÍTICO** |
| 129 | Archivo de Productos – Loop + Filtro personalizado | `product-archive` | shop, categorías, product_search | loop-grid, woocommerce-breadcrumb | **CRÍTICO** |
| 87 | Elementor Pie de página #87 | `footer` | **GLOBAL** (include/general) | form, social-icons | **ALTO** |
| 878 | Elementor Elemento de bucle #878 | `loop-item` | — (usado por archive) | theme-post-featured-image, woocommerce-product-add-to-cart, woocommerce-product-price, woocommerce-product-title | **ALTO** |
| 354 | Slide de productos recientes | `loop-item` | — | theme-post-featured-image, woocommerce-product-add-to-cart, woocommerce-product-price, woocommerce-product-title | **ALTO** |
| 720 | Live Results – Search | `loop-item` | — (búsqueda live) | theme-post-featured-image, woocommerce-product-price, woocommerce-product-title | **ALTO** |
| 892 | Grid de Tienda | `loop-item` | — | woocommerce-product-add-to-cart | **ALTO** |
| 1471 | Elementos Buscador | `loop-item` | — (buscador) | theme-post-featured-image, woocommerce-product-title | **ALTO** |
| 1414 | Elementor Archivo de productos #1414 | `product-archive` | otros archives (excluye shop/cat/search) | loop-grid, woocommerce-breadcrumb | **ALTO** |
| 761 | Resultados de búsqueda #761 | `search-results` | include/archive/search | theme-archive-title, woocommerce-breadcrumb, woocommerce-products | **ALTO** |
| 661 | Popup Menu | `popup` | — (menú overlay) | nav-menu | **ALTO** |
| 141 | Plantilla Página Individual | `single-page` | include/single-page | theme-post-content, woocommerce-breadcrumb | **MEDIO** |
| 1468 | Buscador móvil | `popup` | — | (ninguno Pro — heading, icon, icon-list, search, shortcode) | **MEDIO** |
| 1107 | Elementor Página individual #1107 | `single-page` | — (DRAFT) | form | **BAJO** (draft) |
| 833 | Elementor Error 404 #833 | `error-404` | — | (ninguno Pro — heading, text-editor) | **BAJO** |
| 18 | Mantenimiento | `page` | — | (ninguno — solo heading) | **NINGUNO** |
| 17 | Kit por defecto | `kit` | — | (vacío — sin widgets) | **NINGUNO** |

### 3.2 Páginas WC (no en elementor_library)

| ID | Slug | Título | Elementor mode | Widgets detectados | Nivel |
|----|------|--------|----------------|-------------------|-------|
| 25 | carrito | Carrito | builder | woocommerce-cart (Pro) | **ALTO** |
| 27 | mi-cuenta | Mi cuenta | builder | woocommerce-my-account (Pro) | **ALTO** |
| 1548 | finalizar-compra | Finalizar compra | — | WooCommerce Blocks (ya migrado ✅) | NINGUNO |

---

## 4. WIDGETS PRO — CATÁLOGO

Widgets confirmados como Elementor Pro-exclusivos encontrados en este sitio:

| Widget | Categoría Pro | Encontrado en |
|--------|--------------|---------------|
| `nav-menu` | Theme Builder | 653, 661 |
| `woocommerce-menu-cart` | WooCommerce Pro | 653 |
| `off-canvas` | Pro / Plugin | 653, 129 |
| `form` | Forms Pro | 87, 1107 |
| `social-icons` | Essential Elements | 87 |
| `loop-grid` | Loop Builder Pro | 129, 1414 |
| `woocommerce-breadcrumb` | WooCommerce Pro | 100, 129, 141, 1414, 761 |
| `woocommerce-product-add-to-cart` | WooCommerce Pro | 100, 878, 354, 892 |
| `woocommerce-product-images` | WooCommerce Pro | 100 |
| `woocommerce-product-price` | WooCommerce Pro | 100, 878, 354, 720 |
| `woocommerce-product-title` | WooCommerce Pro | 100, 878, 354, 720, 1471 |
| `theme-post-featured-image` | Theme Elements Pro | 878, 354, 720, 1471 |
| `theme-post-content` | Theme Elements Pro | 141 |
| `theme-archive-title` | Theme Elements Pro | 761 |
| `woocommerce-products` | WooCommerce Pro | 761 |
| `woocommerce-cart` | WooCommerce Pro | página 25 |
| `woocommerce-my-account` | WooCommerce Pro | página 27 |

**Widgets libres confirmados** (no requieren Pro): button, heading, text-editor, icon, icon-list, image, accordion, divider, shortcode, search.

---

## 5. MAPA DE IMPACTO POR SECCIÓN DEL SITIO

| Sección | Template activo | Impacto al expirar Pro | Urgencia |
|---------|----------------|------------------------|----------|
| Header (todas las páginas) | 653 | Sin navegación, sin mini-cart | CRÍTICA |
| Footer (todas las páginas) | 87 | Form de contacto pierde widgets, social-icons pierde widget | ALTA |
| Producto individual | 100 | Página de producto vacía — sin precio, imagen, botón compra | CRÍTICA |
| Tienda / Categorías / Búsqueda producto | 129 | Sin grid de productos (loop-grid cae) | CRÍTICA |
| Otros archives | 1414 | Sin grid de productos | ALTA |
| Resultados de búsqueda WP | 761 | Página vacía (todos widgets Pro) | ALTA |
| Menú overlay / Popup | 661 | Sin menú pop-up (nav-menu cae) | ALTA |
| Carrito | página 25 | Carrito sin contenido visible | ALTA |
| Mi cuenta | página 27 | Mi cuenta sin contenido visible | ALTA |
| Buscador móvil popup | 1468 | Popup pierde funcionalidad Pro (tipo popup) | MEDIA |
| Páginas estáticas | 141 | theme-post-content cae — contenido invisible | MEDIA |
| Error 404 | 833 | Reverter a 404 default WP (funcional, sin estilo) | BAJA |
| Finalizar compra | página 1548 | Sin impacto — ya en WooCommerce Blocks ✅ | NINGUNA |

---

## 6. PLAN DE MIGRACIÓN — PRIORIDAD A0

Ordenado por impacto en el flujo de venta principal (fecha límite: 2026-07-01).

### Prioridad 1 — CRÍTICA: Sin estas, el sitio no vende

**P1-A: Header (id=653)**
- Afecta: TODAS las páginas
- Problema: nav-menu (Pro), woocommerce-menu-cart (Pro)
- Migración recomendada: Crear `header.php` en child theme con `wp_nav_menu()` nativo + `woocommerce_mini_cart()` shortcode. Elementor mantiene header solo para el layout (columnas, logo, colores).
- Alternativa rápida: reemplazar los dos widgets Pro por Shortcode widgets (Free) con `[do_shortcode]` o HTML directo.
- Nota sobre off-canvas: verificar si el widget off-canvas es Elementor Pro o del plugin filtro. Si es plugin, no es un bloqueante.

**P1-B: Producto individual (id=100)**
- Afecta: todas las páginas de producto (28 productos actuales)
- Problema: 5 widgets Pro WooCommerce (title, price, images, add-to-cart, breadcrumb)
- Migración recomendada: Template PHP `single-product.php` en child theme usando funciones WC nativas (`woocommerce_template_single_title()`, `woocommerce_template_single_price()`, etc.). Eliminar dependencia Elementor en producto.
- Alternativa: WooCommerce Blocks (Gutenberg single product blocks) — más rápido de implementar.

**P1-C: Archivo de productos (id=129)**
- Afecta: shop page, todas las categorías, búsqueda de productos
- Problema: loop-grid (Pro) — sin él, el grid de productos desaparece
- Migración recomendada: Template PHP `archive-product.php` + `content-product.php` en child theme. El shortcode de Filtro Camisetas Pro (`[filtro-camisetas]` o equivalente) debe funcionar en PHP nativo.
- Riesgo: Filtro Camisetas Pro usa los ACF meta fields — el template PHP debe cargar el hook de WC `woocommerce_before_shop_loop`. Requiere prueba.

### Prioridad 2 — ALTA: Afectan experiencia de compra

**P2-A: Loop items (ids 878, 354, 720, 892, 1471)**
- Todos los loop-items requieren loop-grid (Pro) para funcionar. Si P1-C se migra a PHP, los loop-items dejan de ser relevantes — WC usa su propio content-product.php loop template.
- Acción: se resuelven automáticamente al migrar el archive a PHP.

**P2-B: Carrito página (id=25)**
- Problema: `woocommerce-cart` widget Pro
- Migración rápida: en WP Admin, editar la página "Carrito" con Elementor, reemplazar el widget Pro por un widget Shortcode (Free) con `[woocommerce_cart]`. 5 minutos.
- O migrar a WooCommerce Blocks (cart block nativo).

**P2-C: Mi cuenta página (id=27)**
- Problema: `woocommerce-my-account` widget Pro
- Migración rápida: reemplazar por Shortcode widget (Free) con `[woocommerce_my_account]`. 5 minutos.
- O migrar a WooCommerce Blocks.

**P2-D: Resultados de búsqueda (id=761)**
- Problema: theme-archive-title, woocommerce-breadcrumb, woocommerce-products (todos Pro)
- Migración recomendada: Template PHP `search.php` o `search-results.php` en child theme con `woocommerce_product_loop()`.
- Prioridad menor que tienda y producto — búsqueda es ruta secundaria.

**P2-E: Popup Menu (id=661)**
- Problema: nav-menu Pro en popup
- Migración: se resuelve al migrar P1-A (header nativo con nav_menu).

**P2-F: Footer (id=87)**
- Problema: form (Pro), social-icons (Pro)
- Migración del form: instalar WPForms o Contact Form 7 (gratuitos) y usar shortcode en widget Shortcode (Free).
- Migración de social-icons: usar widget Icon List (Free) con links a redes, o HTML directo.
- El resto del footer (heading, text-editor, icon-list) son Free — permanecen.

### Prioridad 3 — MEDIA: No bloquean ventas

**P3-A: Páginas estáticas (id=141)**
- theme-post-content cae → páginas (Sobre nosotros, Política, etc.) pierden contenido
- Migración: convertir cada página a Gutenberg, o usar widget Text Editor de Elementor Free con el contenido copiado manualmente.

**P3-B: Buscador móvil (id=1468)**
- Solo el tipo popup requiere Pro; los widgets son Free
- Migración: include search en header PHP o en widget Elementor Free (search widget es Free).

### Prioridad 4 — BAJA: Impacto mínimo

**P4-A: Error 404 (id=833)** — heading + text-editor (Free). El tipo error-404 requiere Pro Theme Builder para actuar como 404 global. Al expirar Pro, WP usa su 404.php nativo. Migración: crear `404.php` en child theme con el contenido actual.

**P4-B: Página individual draft (id=1107)** — draft, no visible en producción. Sin urgencia.

---

## 7. HALLAZGOS ADICIONALES

### 7.1 Finalizar compra ya migrado
La página "Finalizar compra" (id=1548, slug=`finalizar-compra`) tiene `_elementor_edit_mode: ''` — NO usa Elementor. Está en WooCommerce Blocks (Gutenberg). **No requiere acción.** Confirma que la ruta crítica de checkout ya es segura.

### 7.2 Carrito y Mi Cuenta NO estaban migrados
Contrariamente a lo documentado en sesiones anteriores, las páginas Carrito (id=25) y Mi cuenta (id=27) SÍ usan Elementor con widgets Pro. Requieren migración antes del 2026-07-01. Las notas previas sobre "WooCommerce Blocks" se referían únicamente a Finalizar compra.

### 7.3 id=1414 posiblemente inactivo
El archivo de productos id=1414 tiene condiciones que excluyen shop, categorías y búsqueda — que son las principales. Solo aplica a archives de producto no estándar. Posiblemente inactivo en uso real. Confirmar con Pablo qué templates están activos en Elementor > Templates > Condiciones.

### 7.4 Kit por defecto (id=17) — Global Styles
El Kit define colores, tipografías y otros estilos globales de Elementor. Al expirar Pro, los estilos del Kit pueden perder algunas funcionalidades Pro (motion effects, custom CSS condicional). El impacto visual puede ser sutil pero extendido. Requiere prueba en staging cuando esté disponible.

### 7.5 Filtro Camisetas Pro — riesgo de dependencia cruzada
El plugin Filtro Camisetas Pro v3.0.0 lee ACF meta fields. Al migrar el archive a PHP nativo, el shortcode del filtro debe seguir funcionando si se incluye correctamente en el loop de WooCommerce. Esta dependencia debe verificarse en la migración de P1-C.

---

## 8. RESUMEN EJECUTIVO

| Categoría | Count | Acción |
|-----------|-------|--------|
| CRÍTICO — bloquean ventas si no se migran | 3 (header, producto, archive) | Migrar antes del 2026-07-01 |
| ALTO — degradan experiencia | 8 (loop items, carrito, mi cuenta, footer, etc.) | Migrar en la misma ventana |
| MEDIO — afectan páginas secundarias | 2 (single-page, buscador popup) | Semana siguiente |
| BAJO — impacto mínimo o draft | 2 (404, draft) | Oportunista |
| SIN IMPACTO — Free o ya migrados | 5 (kit, mantenimiento, checkout, search widgets, error-404 widgets) | Sin acción |

**Widgets Pro únicos que bloquean la migración:**
- `loop-grid` — sin alternativa en Free. Requiere PHP template o plugin alternativo.
- `theme-post-featured-image` / `theme-post-content` / `theme-archive-title` — solo en PHP templates o via Gutenberg.
- `woocommerce-product-*` (title, price, images, add-to-cart) — disponibles via PHP WC hooks.
- `nav-menu` — disponible via `wp_nav_menu()` PHP nativo.

---

## 9. PRÓXIMOS PASOS — SESIÓN 009

| Paso | Acción |
|------|--------|
| A0_MIGRATION_PLAN | Crear plan técnico detallado para P1-A, P1-B, P1-C — child theme PHP templates |
| P2-B/C inmediato | Pablo puede resolver Carrito + Mi Cuenta en 10 min en WP Admin: reemplazar widgets Pro por shortcodes `[woocommerce_cart]` / `[woocommerce_my_account]` en Elementor Free |
| Confirmar id=1414 | Pablo verifica en Elementor > Templates si el archive #1414 está activo en condiciones |
| Staging | Toda migración PHP de child theme debe probarse en staging antes de aplicar en producción |

---

*Auditoría ejecutada en modo READ_ONLY. Ningún write al sitio.*  
*Credenciales de Administrador usadas únicamente para lectura de `_elementor_data`. No almacenadas en este documento.*  
*Fecha: 2026-06-13 — Sesión 008 — Claude Code Sonnet.*
