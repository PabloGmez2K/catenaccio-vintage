# A0_MIGRATION_PLAN — Catenaccio Vintage

Plan técnico de migración A0: eliminación de dependencias críticas de Elementor Pro manteniendo WordPress/WooCommerce.

**Proyecto:** Catenaccio Vintage  
**Fecha:** 2026-06-20  
**Sesión:** 011  
**Modo:** PLAN_ONLY / DOCS_ONLY — ninguna implementación en esta sesión  
**Agente:** Claude Code (Sonnet)  
**Prerequisitos cumplidos:**
- APPROVE_A0_MIGRATION_PLAN_PREP (Sesión 010B — filesystem discovery completado)
- DEC-10 registrada (Sesión 010C — NO_SSH_SHADOW_RELEASE_FLOW)
- Token cPanel API 010B revocado manualmente por Pablo

---

## 1. CONTEXTO Y DRIVER

**Driver:** Elementor Pro 3.35.1 expira ~2026-07-01. Pablo no renueva la suscripción.

**Impacto si no se actúa antes del deadline:**
- Header (template 653): sin navegación, sin mini-cart → sitio inutilizable
- Página de producto (template 100): precio, imagen, botón add-to-cart desaparecen → ventas bloqueadas
- Tienda / categorías / búsqueda (template 129): grid de productos vacío → catálogo invisible

**Ruta de migración aprobada:** A0 — eliminar dependencias Pro manteniendo WP+WC. Sin cambio de stack. Sin headless. Sin Shopify.

**Patrón de release:** NO_SSH_SHADOW_RELEASE_FLOW (DEC-10). Tema sombra `catenaccio-a0-child`. Promoción manual Pablo.

---

## 2. INVENTARIO DE DEPENDENCIAS — RESUMEN EJECUTIVO

Resultado del ELEMENTOR_DEPENDENCY_AUDIT (Sesión 008) + SERVER_FILESYSTEM_READONLY_DISCOVERY (Sesión 010B):

| Bloque | Template | Widgets Pro bloqueantes | Estado shortcodes | Prioridad |
|--------|----------|------------------------|-------------------|-----------|
| Header | 653 | `nav-menu`, `woocommerce-menu-cart`, `off-canvas` toggle | `[catenaccio_offcanvas_menu]` ✅ independiente | **CRÍTICO** |
| Producto individual | 100 | `woocommerce-product-title`, `price`, `images`, `add-to-cart`, `breadcrumb` | `[cv_product_meta]`, `[cv_explorar]`, `[cv_short_description]` ✅ | **CRÍTICO** |
| Archivo / Categorías | 129 | `loop-grid`, `woocommerce-breadcrumb` | `[filtro_camisetas_ui]`, `[filtro_taxonomico]`, `[filtro_contador]`, `[cv_archive_title]`, `[cv_archive_intro]` ✅ | **CRÍTICO** |
| Carrito | pág. 25 | `woocommerce-cart` | `[woocommerce_cart]` ✅ Free | ALTO |
| Mi Cuenta | pág. 27 | `woocommerce-my-account` | `[woocommerce_my_account]` ✅ Free | ALTO |
| Loop items | 878, 354, 720, 892 | `theme-post-featured-image`, `woocommerce-product-*` | — (se resuelven con P1-C) | ALTO → derivado |

**Hallazgos críticos del filesystem (Sesión 010B) que reducen el alcance:**

| Suposición previa | Realidad confirmada | Impacto en A0 |
|-------------------|--------------------|-----------------------|
| Off-Canvas Menu registra widget Elementor Pro | Plugin 100% standalone (`[catenaccio_offcanvas_menu]`). Sin dependencia Elementor. | **Riesgo eliminado** |
| woocommerce/ override directory en child theme | No existe. WooCommerce no tiene overrides. | Templates PHP de WC se pueden crear libremente |
| ACF Pro requerido | Solo ACF FREE. `get_field()` estándar. | Sin bloqueo |
| Filtro Camisetas acoplado a Elementor Loop Grid | Core 100% WC-nativo. Hook `elementor/query/filtro_camisetas` es cosmético. | **Riesgo reducido a BAJO** |
| Mini-cart JS depende de Elementor Pro | `cv_minicart_popup_enhancements()` usa clases Pro — **CONFIRMADO** (L1613-1675 functions.php) | Requiere actualizar selectores al migrar header |

---

## 3. P1-A — HEADER (template 653, GLOBAL)

### 3.1 Situación actual

Template 653 "Cabecera simple" está asignado como header global (include/general). Activo en todas las páginas del sitio. Contiene:

- `nav-menu` (Pro) — menú de navegación principal
- `woocommerce-menu-cart` (Pro) — mini-carrito con contador de ítems
- `off-canvas` toggle (Pro) — botón que abre el panel lateral con `[catenaccio_offcanvas_menu]`

El widget `off-canvas` en el template NO es el plugin `catenaccio-offcanvas-menu/`. Es un widget Pro de Elementor que abre un popup/panel. El contenido de ese panel SÍ incluye `[catenaccio_offcanvas_menu]` como shortcode (independiente).

El mini-carrito tiene mejoras JS en `functions.php` (L1613-1675) que usan selectores de clase Elementor Pro:
```
.elementor-menu-cart__footer-buttons
.elementor-button--view-cart
.elementor-button--checkout
```
Al desactivar Pro, estos selectores no encontrarán elementos → `cv_minicart_popup_enhancements()` queda como no-op. No rompe nada, pero el comportamiento mejorado del carrito desaparece.

### 3.2 Enfoque técnico probable

**Approach principal:** Crear `header.php` en el tema sombra `catenaccio-a0-child`, reemplazando el template 653 de Elementor. El child theme hereda de `hello-elementor`.

Componentes a implementar en PHP nativo:

**Menú de navegación:**
```php
// Usar WP nativo — sin dependencia Elementor
wp_nav_menu([
    'theme_location' => 'primary',
    'container'      => 'nav',
    'container_class'=> 'cv-nav',
    'depth'          => 2,
]);
```
Requiere registrar `primary` en `functions.php` del tema sombra con `register_nav_menus()`.

**Mini-carrito:**
```php
// Opción A: shortcode WooCommerce (Free, sin Elementor)
echo do_shortcode('[woocommerce_mini_cart]');

// Opción B: función PHP directa de WooCommerce
woocommerce_mini_cart();

// Selector JS actualizado (en el tema sombra):
// .cv-mini-cart__footer-buttons
// .cv-button--view-cart
// .cv-button--checkout
```
Se deberá actualizar `cv_minicart_popup_enhancements()` en el tema sombra para usar las nuevas clases CSS del mini-cart reemplazado.

**Panel off-canvas (menú lateral):**
```php
// El panel contiene el shortcode existente — sin cambios al plugin
echo do_shortcode('[catenaccio_offcanvas_menu show_leagues="yes" show_sizes="yes" show_players="yes"]');
```
El mecanismo de apertura/cierre debe reemplazar los `#elementor-action:xxx` links que usa Elementor Pro por un toggle CSS puro o JS mínimo propio. El plugin `catenaccio-offcanvas-menu` ya tiene sus propios `assets/js/offcanvas-menu.js` y `assets/css/offcanvas-menu.css` — el JS ya maneja el acordeón interno. Solo falta el botón de apertura del panel.

```html
<!-- Botón de apertura — sin dependencia Elementor -->
<button class="cv-offcanvas-toggle" aria-label="Abrir menú" aria-expanded="false">
  ☰
</button>
<div class="cv-offcanvas-panel" id="cv-offcanvas" aria-hidden="true">
  <?php echo do_shortcode('[catenaccio_offcanvas_menu]'); ?>
</div>
```

### 3.3 Shortcodes que se conservan sin cambios

| Shortcode | Estado |
|-----------|--------|
| `[catenaccio_offcanvas_menu]` | ✅ Sin modificar — plugin independiente |

### 3.4 Riesgos identificados P1-A

| Riesgo | Nivel | Mitigación |
|--------|-------|------------|
| Responsive móvil — el header actual tiene breakpoints definidos en Elementor (editor visual). En PHP hay que reproducirlos en CSS. | MEDIO | Inspeccionar header actual con DevTools antes de migrar. Capturar breakpoints. |
| Overlay del off-canvas — `z-index`, `body-lock` (scroll bloqueado al abrir panel), transición CSS de apertura — todo actualmente gestionado por Elementor Pro. | MEDIO | Usar CSS variables del tema `hello-elementor`. Implementar `body.cv-offcanvas-open { overflow: hidden; }` en el tema sombra. |
| JS heredado de Elementor en mini-carrito — selectores `.elementor-menu-cart__*` en `cv_minicart_popup_enhancements()` (L1613-1675 de `functions.php`). | BAJO | Actualizar función en el `functions.php` del tema sombra con los nuevos selectores CSS del mini-cart reemplazado. No tocar `functions.php` del tema activo. |
| Clases JS del menú nav heredadas — si el JS del buscador AJAX (`cv-search.js`) o del off-canvas asume clases generadas por Elementor, hay que revisarlas. | BAJO | Auditar `js/cv-search.js` en el tema sombra antes de activar. |
| El registro del menú `primary` puede no existir aún | BAJO | Registrar en `functions.php` del tema sombra + asignar en WP Admin > Apariencia > Menús (acción Pablo). |

---

## 4. P1-B — PRODUCTO INDIVIDUAL (template 100)

### 4.1 Situación actual

Template 100 "Plantilla producto individual" asignado a `include/product` (todas las páginas de producto). Contiene 5 widgets Pro WooCommerce:

- `woocommerce-product-title` — nombre del producto (H1)
- `woocommerce-product-price` — precio / precio rebajado
- `woocommerce-product-images` — galería de imágenes + thumbnail
- `woocommerce-product-add-to-cart` — botón y selector de variaciones
- `woocommerce-breadcrumb` — migas de pan (breadcrumbs)

El child theme actual (`hello-elementor-child`) **no tiene** directorio `woocommerce/` — confirmado en Sesión 010B. Todos los templates de WooCommerce vienen del core.

Las URLs de producto usan rewrite rules en `functions.php` (L: `woocommerce_product_post_type_args`). Estas son 100% WP-nativas y sobreviven la desactivación de Elementor Pro.

### 4.2 Shortcodes que se conservan sin cambios

| Shortcode | Origen | Dónde se coloca en la plantilla nueva |
|-----------|--------|------------------------------------|
| `[cv_product_meta]` | `functions.php` | Sección de metadatos del producto (talla, medidas, condición, defectos) |
| `[cv_explorar]` | `functions.php` | Debajo de la descripción — links a colecciones relacionadas |
| `[cv_short_description]` | `functions.php` | Excerpt / descripción corta dinámica desde ACF |

Estos shortcodes leen ACF FREE fields (`talla`, `medida_axila`, `medida_largo`, `condicion`, `defectos`) y no tienen ninguna dependencia Elementor.

### 4.3 Enfoque técnico probable

**Approach principal:** Crear `woocommerce/single-product.php` en el tema sombra `catenaccio-a0-child`. WooCommerce tiene un sistema de override de templates: si el archivo existe en el tema activo bajo `woocommerce/`, lo usa en lugar del del plugin.

Estructura del template PHP esperada, usando hooks nativos de WooCommerce:

```php
// woocommerce/single-product.php (en catenaccio-a0-child)
get_header();
?>
<div class="cv-product-page">
  <?php
  // Breadcrumbs — WooCommerce nativo
  woocommerce_breadcrumb();

  // Galería de imágenes (nativa WooCommerce)
  woocommerce_show_product_images();

  // Título del producto
  the_title('<h1 class="cv-product-title">', '</h1>');

  // Precio
  echo '<div class="cv-product-price">';
  woocommerce_template_single_price();
  echo '</div>';

  // Descripción corta / shortcode propio
  echo do_shortcode('[cv_short_description]');

  // Botón add-to-cart + variaciones
  woocommerce_template_single_add_to_cart();

  // Meta del producto (talla, medidas, condición, defectos)
  echo do_shortcode('[cv_product_meta]');

  // Explorar colecciones relacionadas
  echo do_shortcode('[cv_explorar]');

  // Descripción completa del producto
  woocommerce_template_single_description();
  ?>
</div>
<?php
get_footer();
```

**Hooks WooCommerce que ya están en `functions.php` y se deben conservar:**

| Hook | Función | Criticidad |
|------|---------|------------|
| `woocommerce_get_breadcrumb` (×2) | Breadcrumbs con liga/equipo/selecciones | MANTENER |
| `woocommerce_product_post_type_args` | Elimina prefijo `/product/` de URLs | **CRÍTICO — MANTENER** |
| `woocommerce_package_rates` | IVA 21% en envío | **CRÍTICO — MANTENER** |
| `pre_get_posts` | Carrusel home: solo productos en stock | MANTENER |

Estos hooks viven en `functions.php` del child theme activo. En el tema sombra, se heredarán si el tema sombra los re-incluye (o si se organizan como `require_once` desde el padre). No deben duplicarse ni sobreescribirse — el riesgo es doble-aplicación de IVA o doble-redirect.

### 4.4 Qué partes son WooCommerce nativo y qué partes son shortcode propio

| Componente | Método recomendado | Justificación |
|------------|-------------------|---------------|
| Título producto | `the_title()` PHP nativo o `woocommerce_template_single_title()` | WC nativo. Sin dependencia externa. |
| Precio | `woocommerce_template_single_price()` | WC nativo. Respeta variaciones y rebajas. |
| Galería imágenes | `woocommerce_show_product_images()` | WC nativo. Incluye thumbnails y zoom. |
| Variaciones (selector talla, etc.) | `woocommerce_template_single_add_to_cart()` | WC nativo. Incluye selector de variación y botón. |
| Breadcrumbs | `woocommerce_breadcrumb()` | WC nativo, personalizado por hooks existentes en functions.php. |
| Descripción corta (excerpt) | `[cv_short_description]` shortcode | Propio — lee ACF, formato propio Catenaccio. |
| Meta del producto (talla, medidas) | `[cv_product_meta]` shortcode | Propio — lectura ACF FREE. Sin cambios. |
| Links explorar colecciones | `[cv_explorar]` shortcode | Propio — links SEO a taxonomías. Sin cambios. |
| Descripción larga | `woocommerce_template_single_description()` | WC nativo. |
| Stock / disponibilidad | Implícito en `add_to_cart()` | WC nativo. |
| SEO (OpenGraph, meta description) | RankMath hooks ya en functions.php | MANTENER sin cambios. |

### 4.5 Riesgos identificados P1-B

| Riesgo | Nivel | Mitigación |
|--------|-------|------------|
| Galería de imágenes — la galería de WooCommerce Pro añade zoom y lightbox propios. Al usar la galería nativa, el comportamiento puede diferir. | MEDIO | Validar visualmente con Antigravity en el tema sombra. Evaluar si WooCommerce Free gallery es suficiente o si se necesita un plugin de galería. |
| Variaciones de producto — el selector de variaciones de WC nativo puede tener un aspecto diferente al actual Pro. | MEDIO | Capturar apariencia actual con Antigravity antes de migrar. |
| Precio con descuento — el formato `<del>` / `<ins>` de WC nativo puede tener CSS diferente al de Elementor Pro. | BAJO | CSS del tema sombra debe incluir estilos para `.price del` y `.price ins`. |
| Breadcrumbs — los hooks `woocommerce_get_breadcrumb` en functions.php personalizan el separador y los nodos. Si se heredan correctamente en el tema sombra, no hay riesgo. Si el tema sombra no incluye functions.php del activo, se pierden. | MEDIO | Verificar que el tema sombra cargue los hooks del padre o los re-declare explícitamente. |
| Stock visible — `woocommerce_template_single_add_to_cart()` oculta el botón si el producto está agotado. Si hay productos agotados, verificar que se muestre estado correcto (no error 500). | BAJO | Probar con un producto agotado en el tema sombra. |
| SEO / RankMath — los filtros `rank_math/frontend/description` y `rank_math/opengraph/image` están en functions.php. No son dependientes de Elementor ni del template. Sobreviven la migración. | BAJO | Sin acción requerida. |

---

## 5. P1-C — ARCHIVO DE PRODUCTOS / CATEGORÍAS (template 129)

### 5.1 Situación actual

Template 129 "Archivo de Productos – Loop + Filtro personalizado" asignado a: shop, categorías, búsqueda de productos. Es la página que muestra el grid de productos con filtros laterales.

Contiene:
- `loop-grid` (Pro) — widget que renderiza el grid de productos iterando un loop
- `woocommerce-breadcrumb` (Pro) — migas de pan del archivo

Los loop-items (IDs 878, 354, 720, 892, 1471) son subplantillas de `loop-grid`. Al reemplazar `loop-grid` por un template PHP nativo, estos loop-items dejan de ser relevantes — WooCommerce usa su propio `content-product.php` para cada ítem del loop.

### 5.2 Shortcodes que se conservan sin cambios

| Shortcode | Plugin de origen | Función |
|-----------|-----------------|---------|
| `[filtro_camisetas_ui]` | `filtro-camisetas/` | UI completa: contador + ordenar + filtros activos + "limpiar" |
| `[filtro_taxonomico slug="pa_liga" titulo="Liga"]` | `filtro-camisetas/` | Filtro individual por taxonomía (puede usarse múltiples veces) |
| `[filtro_contador]` | `filtro-camisetas/` | Solo el contador de resultados |
| `[cv_archive_title]` | `functions.php` | H1 SEO dinámico en archivos de taxonomía |
| `[cv_archive_intro]` | `functions.php` | Intro SEO con toggle "Ver más/menos" |

**Confirmado en Sesión 010B:** El core de `filtro-camisetas` es WC-nativo. El hook `elementor/query/filtro_camisetas` es cosmético — solo se dispara si hay un Loop Grid con query `filtro_camisetas` activo. Al reemplazar el Loop Grid, este hook queda inerte. La lógica de filtrado, conteo y AJAX es completamente independiente.

### 5.3 Enfoque técnico probable — Grid / Listado

**Approach principal:** Crear `woocommerce/archive-product.php` y `woocommerce/content-product.php` en el tema sombra.

`archive-product.php` — estructura del archivo de productos:
```php
// woocommerce/archive-product.php (en catenaccio-a0-child)
get_header();
woocommerce_breadcrumb();
?>
<div class="cv-archive">
  <div class="cv-archive__header">
    <?php echo do_shortcode('[cv_archive_title]'); ?>
    <?php echo do_shortcode('[cv_archive_intro]'); ?>
    <?php echo do_shortcode('[filtro_camisetas_ui]'); ?>
  </div>
  <div class="cv-archive__body">
    <aside class="cv-archive__sidebar">
      <?php echo do_shortcode('[filtro_taxonomico slug="pa_liga" titulo="Liga"]'); ?>
      <?php echo do_shortcode('[filtro_taxonomico slug="pa_equipo" titulo="Equipo"]'); ?>
      <!-- filtros adicionales según diseño actual -->
    </aside>
    <div class="cv-archive__products">
      <?php if (woocommerce_product_loop()) : ?>
        <?php woocommerce_product_loop_start(); ?>
          <?php while (have_posts()) : the_post(); ?>
            <?php wc_get_template_part('content', 'product'); ?>
          <?php endwhile; ?>
        <?php woocommerce_product_loop_end(); ?>
        <?php woocommerce_pagination(); ?>
      <?php else : ?>
        <?php woocommerce_no_products_found(); ?>
      <?php endif; ?>
    </div>
  </div>
</div>
<?php
get_footer();
```

`content-product.php` — ítem del grid (reemplaza loop-items 878/354/720/892):
```php
// woocommerce/content-product.php (en catenaccio-a0-child)
<li <?php wc_product_class('cv-product-card', $product); ?>>
  <a href="<?php the_permalink(); ?>">
    <?php woocommerce_show_product_loop_sale_flash(); ?>
    <?php woocommerce_template_loop_product_thumbnail(); ?>
    <?php woocommerce_template_loop_product_title(); ?>
    <?php woocommerce_template_loop_price(); ?>
  </a>
  <?php woocommerce_template_loop_add_to_cart(); ?>
</li>
```

### 5.4 Compatibilidad con filtros, paginación y ordenación

| Característica | Mecanismo | A0 status |
|---------------|-----------|-----------|
| Filtrado por taxonomía | Plugin `filtro-camisetas` via shortcodes + AJAX | ✅ Independiente de Elementor |
| Contador de resultados | `[filtro_contador]` + AJAX `filtro_contar_productos` | ✅ Independiente |
| H1 SEO dinámico | `[cv_archive_title]` — detecta taxonomía activa | ✅ Independiente |
| Intro SEO con "ver más" | `[cv_archive_intro]` — toggle JS propio | ✅ Independiente |
| Paginación | `woocommerce_pagination()` WC nativo | ✅ Requiere CSS |
| Ordenación (WooCommerce) | `woocommerce_catalog_ordering()` WC nativo | ✅ Incluir en template |
| Productos agotados visibles | Controlado por `pre_get_posts` en functions.php (carrusel) + ajustes WC | Verificar configuración WC en WP Admin |
| Categorías como URLs limpias | Rewrite rules en functions.php | ✅ Sobreviven la migración |
| Panel off-canvas lateral (filtro) | `[catenaccio_offcanvas_menu]` en el aside del template | ✅ Independiente |

### 5.5 Riesgos identificados P1-C

| Riesgo | Nivel | Mitigación |
|--------|-------|------------|
| Layout del grid — el grid de loop-items de Elementor Pro puede tener N columnas responsive con configuración visual. El template PHP debe reproducir ese layout con CSS. | MEDIO | Capturar CSS del grid actual con DevTools. Implementar CSS Grid o Flexbox equivalente en el tema sombra. |
| Filtros AJAX — el plugin `filtro-camisetas` hace requests AJAX que modifican el DOM del grid. Si el grid cambia de estructura (clases CSS, contenedores), el AJAX puede fallar. | MEDIO | Verificar que el JS del plugin (`filtro-camisetas`) usa selectores estables. Auditar el JS antes de implementar. Si usa IDs o clases custom propias, no hay riesgo. |
| Panel lateral off-canvas en archivo — en el template 129, el panel off-canvas se abre de forma diferente que en el header (puede ser un panel lateral inline, no un popup). Hay que reproducir el comportamiento. | BAJO-MEDIO | Auditar cómo se abre el panel en el archive actual con DevTools antes de migrar. |
| Breadcrumbs en archivo — igual que en P1-B, los hooks de breadcrumbs deben heredarse. | BAJO | Ver P1-B §4.5. |
| Paginación CSS — `woocommerce_pagination()` usa clases WC nativas. Si el CSS del tema actual dependía de clases Elementor en los botones de paginación, habrá regresión visual. | BAJO | Auditar CSS de paginación actual. Añadir CSS equivalente en el tema sombra. |
| Compatibilidad con template 1414 (otros archives) — el plan se centra en template 129. El template 1414 aplica a archives no-estándar. Evaluar si se puede unificar en un solo template PHP. | BAJO | Confirmar con Pablo si 1414 está activo (Sesión 008 §7.3 lo marcó como posiblemente inactivo). |

---

## 6. P2 — QUICKWINS (Carrito y Mi Cuenta)

### 6.1 Carrito (página id=25)

**Situación:** La página usa `woocommerce-cart` widget de Elementor Pro.  
**Solución:** Reemplazar el widget Pro por un widget Shortcode (Free) con `[woocommerce_cart]`.

```
Shortcode a usar: [woocommerce_cart]
```

**Método:**
1. Pablo abre WP Admin → Páginas → Carrito → Editar con Elementor.
2. Localiza el widget `woocommerce-cart` Pro.
3. Lo reemplaza por un widget "Shortcode" (Free) con el contenido `[woocommerce_cart]`.
4. Guarda.

**Alternativa:** Migrar a WooCommerce Blocks (Cart Block nativo) — más robusto a largo plazo pero requiere más tiempo.

### 6.2 Mi Cuenta (página id=27)

**Situación:** La página usa `woocommerce-my-account` widget de Elementor Pro.  
**Solución:** Reemplazar por widget Shortcode (Free) con `[woocommerce_my_account]`.

```
Shortcode a usar: [woocommerce_my_account]
```

**Método:** Idéntico al Carrito.

### 6.3 Restricción operativa

**Estas acciones son manuales de Pablo en WP Admin.** No requieren agente. No son tarea de esta sesión ni de las sesiones 012-015. Pueden ejecutarse en cualquier momento antes del deadline 2026-07-01, de forma independiente al shadow release.

Estimación: 10 minutos en WP Admin.

---

## 7. RIESGOS TÉCNICOS CONSOLIDADOS

### 7.1 URL rewrite en functions.php

**Contexto:** `functions.php` del child theme activo contiene rewrite rules para URLs limpias (`/laliga/`, `/premier-league/`, `/camiseta-real-madrid-1999/`). Son 100% WP-nativas.

**Riesgo A0:** Las rewrite rules sobreviven la desactivación de Elementor Pro. El riesgo es **al activar un tema nuevo** — WordPress puede necesitar un flush de rewrite rules para que el nuevo tema las registre correctamente.

**Mitigación:** Pablo ejecuta manualmente "Guardar cambios" en WP Admin → Ajustes → Enlaces permanentes al activar el tema sombra. Esto regenera las rewrite rules sin necesidad de SSH.

**Riesgo adicional:** Si el tema sombra no incluye las mismas rewrite rules que el activo (porque no hereda el `functions.php` completo), las URLs `/laliga/` y `/camiseta-*/` pueden devolver 404 hasta el flush.

### 7.2 Mini-cart JS dependiente de clases Elementor

**Contexto:** `cv_minicart_popup_enhancements()` en `functions.php` L1613-1675 usa:
- `.elementor-menu-cart__footer-buttons`
- `.elementor-button--view-cart`
- `.elementor-button--checkout`

**Riesgo:** Al reemplazar `woocommerce-menu-cart` Pro por alternativa nativa, estas clases no existirán. La función queda como no-op (no rompe nada, pero la experiencia mejorada del mini-carrito desaparece).

**Mitigación:** En el tema sombra, actualizar (o re-declarar) `cv_minicart_popup_enhancements()` con los selectores del nuevo mini-cart. No modificar `functions.php` del tema activo.

### 7.3 LiteSpeed / OPcache

**Contexto:** OPcache está casi lleno (16 bytes libres al momento del audit, Sesión 003). LiteSpeed Cache está activo.

**Riesgo:** Cambios en archivos PHP pueden no tener efecto hasta que OPcache se recargue o expire. Si Pablo activa el tema sombra y los archivos PHP están cacheados en el estado anterior, puede haber comportamiento inconsistente.

**Mitigación:**
1. Pablo ejecuta LiteSpeed Cache → "Vaciar todos los cachés" en WP Admin tras cualquier sync de archivos PHP.
2. Pablo solicita a Raiola aumentar `opcache.memory_consumption` (PROB-09 conocido).
3. En el sync (Sesión 014), incluir instrucción explícita de flush LiteSpeed antes de activar el tema sombra.

### 7.4 Flush rewrite rules

**Riesgo:** Al activar el tema sombra o al cambiar cualquier hook de rewrite, WordPress necesita regenerar `.htaccess` / rewrite rules. Si no se hace el flush, las URLs limpias pueden devolver 404.

**Nota técnica:** `flush_rewrite_rules_hard` en el código devuelve `false` (confirma que no regenera `.htaccess` automáticamente). El flush debe ser manual.

**Mitigación:** Pablo va a WP Admin → Ajustes → Enlaces permanentes → Guardar cambios (sin modificar nada). Esto fuerza el flush. Acción posterior a activar el tema sombra.

### 7.5 SEO / Breadcrumbs

**Contexto:** Los filtros `rank_math/frontend/description` y `rank_math/opengraph/image` están en `functions.php`. Los hooks de breadcrumbs (`woocommerce_get_breadcrumb` ×2) también.

**Riesgo:** Si el tema sombra no carga estos hooks (porque no tiene acceso al `functions.php` del tema activo), RankMath puede perder metadatos y los breadcrumbs perder su personalización.

**Mitigación:** El tema sombra debe hacer `require_once` de los hooks críticos o re-declararlos. En la Sesión 013 (THEME_SHADOW_IMPLEMENT) se definirá exactamente qué `functions.php` del tema sombra incluye.

### 7.6 Filtros y AJAX del Filtro Camisetas

**Riesgo:** El plugin `filtro-camisetas` ejecuta AJAX (`filtro_contar_productos`) que modifica el DOM del grid. Si el HTML del grid cambia de estructura al migrar de Loop Grid a PHP nativo, el JS del plugin puede no encontrar los contenedores esperados.

**Mitigación:** Auditar el JS del plugin `filtro-camisetas` en Sesión 012/013 para identificar los selectores CSS que usa para actualizar el DOM. Usar las mismas clases o IDs en el template PHP.

### 7.7 Móvil — responsive del header y archive

**Riesgo:** El diseño actual tiene breakpoints configurados visualmente en Elementor. Estos se generan como CSS inline en `<style>` etiquetas en el HTML. Al migrar a PHP nativo, hay que reproducir ese CSS en un stylesheet propio.

**Mitigación:** Antes de la Sesión 012, hacer capturas del sitio actual en móvil con Antigravity para documentar el layout. Usar esas capturas como referencia durante el desarrollo del tema sombra.

### 7.8 Checkout

**Contexto:** La página "Finalizar compra" (id=1548) ya está en WooCommerce Blocks. **No requiere migración.** Confirmado en Sesión 008.

**Riesgo residual:** Las rewrite rules que afectan a `/finalizar-compra/` o el hook `template_redirect` que redirige `/mi-cuenta/` → `/acceder/` deben sobrevivir intactos.

**Mitigación:** No tocar WooCommerce settings. No tocar pasarelas de pago. No modificar la página 1548.

### 7.9 Caché de plantillas

**Contexto:** LiteSpeed Cache puede tener cacheadas las páginas de producto, shop y categorías.

**Riesgo:** Al activar el tema sombra, LiteSpeed puede servir la versión cacheada del tema viejo durante un tiempo, dando la impresión de que la migración no funciona.

**Mitigación:** Flush de LiteSpeed Cache inmediatamente después de activar el tema sombra (WP Admin → LiteSpeed Cache → Vaciar todo). Verificar con URL con `?nocache=1` o incógnito.

### 7.10 Fallback si Elementor Pro caduca antes de migrar

**Escenario:** El deadline es ~2026-07-01. Si las sesiones 012-015 no se completan antes de esa fecha, Elementor Pro expira y el sitio queda sin header, sin producto y sin archive funcionales.

**Fallback inmediato disponible sin agente (Pablo, ~20 min):**
1. P2-A (Carrito + Mi Cuenta): aplicar `[woocommerce_cart]` y `[woocommerce_my_account]` en Elementor Free (shortcode widget).
2. Header: reemplazar `nav-menu` Pro por un menú en el Custom HTML widget de Elementor Free con HTML estático temporal.
3. Produto y archive: activar el tema `hello-elementor` padre (sin child) como fallback — WooCommerce usará sus templates nativos por defecto, sin styling Elementor.

**Este fallback no es ideal pero mantiene la funcionalidad de venta.** El checkout (WC Blocks) y los pagos siguen funcionando independientemente.

### 7.11 Riesgo de tocar el tema activo

**Restricción absoluta (DEC-10):** El tema activo `hello-elementor-child` no se modifica. Nunca.

El agente trabaja exclusivamente en `catenaccio-a0-child`. Si por error se modifica `hello-elementor-child`, el rollback es: Pablo accede a `functions.php` del tema activo y revierte el cambio, o restaura desde un backup de cPanel.

### 7.12 Riesgos de cambios visuales

**Riesgo:** Los templates PHP generarán un output visual diferente al de Elementor en cuanto a:
- Espaciados y márgenes (Elementor usa padding/margin por widget)
- Tipografía (el Kit de Elementor define globals de tipo)
- Colores (el Kit Elementor define variables de color)
- Efectos hover, animaciones (Elementor Pro añade motion effects)

**Mitigación:** La validación visual con Antigravity (Sesión 015) es el gate obligatorio antes de activar el tema sombra. Sin validación visual aprobada, no se activa.

---

## 8. ESTRATEGIA DE IMPLEMENTACIÓN (respetando DEC-10)

### 8.1 Principios inamovibles

1. **Tema activo intocable:** `hello-elementor-child` no se modifica bajo ningún concepto.
2. **Tema sombra:** Todos los cambios van en `catenaccio-a0-child` (inactivo, aislado).
3. **Sin modificar plugins activos:** Los plugins `filtro-camisetas`, `catenaccio-offcanvas-menu`, `elementor`, `elementor-pro`, `woocommerce`, etc. no se tocan.
4. **Sin tocar wp-config.php, WooCommerce settings, pasarelas de pago.**
5. **Acceso servidor solo cuando sea necesario:** Ventana temporal con token cPanel (nuevo token, no el de 010B que ya fue revocado). Revocación al cerrar la sesión.
6. **Validación visual obligatoria:** Antigravity en el tema sombra inactivo antes de cualquier promoción.
7. **Promoción manual por Pablo:** Pablo activa `catenaccio-a0-child` en WP Admin.
8. **Rollback:** Pablo reactiva `hello-elementor-child`. Sin acción del agente.

### 8.2 Estructura del tema sombra: `catenaccio-a0-child`

```
catenaccio-a0-child/
├── style.css                          # Header con Template: hello-elementor
├── functions.php                      # Re-declaraciones y hooks A0
├── header.php                         # Header nativo (reemplaza template 653)
├── footer.php                         # Footer (opcional, P2-F futura)
├── woocommerce/
│   ├── single-product.php             # Template producto individual (P1-B)
│   ├── archive-product.php            # Template archivo/categorías (P1-C)
│   └── content-product.php            # Ítem del grid de productos
└── assets/
    ├── css/
    │   └── cv-a0.css                  # Estilos del tema sombra
    └── js/
        └── cv-a0.js                   # JS mínimo (toggle off-canvas, etc.)
```

`style.css` del tema sombra:
```css
/*
Theme Name: Catenaccio A0 Child
Template: hello-elementor
Version: 0.1.0-shadow
Description: Tema sombra A0 — sin Elementor Pro
*/
@import url("../hello-elementor/style.css");
```

### 8.3 Relación con el tema activo

- El tema sombra hereda de `hello-elementor` (el padre, no el child activo).
- Los hooks de `functions.php` del child activo **no se heredan automáticamente** — deben re-declararse en el tema sombra los que sean críticos para A0.
- Los shortcodes (`[cv_product_meta]`, etc.) están en `functions.php` del child activo. El agente NO puede depender de esa herencia — debe decidir en Sesión 013 si copiarlos al tema sombra o hacer que el tema sombra los llame vía `require_once` condicional.

---

## 9. PLAN POR SESIONES POSTERIORES

> Ninguna de estas sesiones se ejecuta en Sesión 011. Este plan es la base para las sesiones siguientes.

### Sesión 012 — THEME_SHADOW_SCAFFOLD
**Objetivo:** Diseñar la estructura del tema sombra `catenaccio-a0-child`. Sin implementar código funcional aún.
- Definir estructura de archivos y directorios.
- Definir qué hooks y shortcodes del `functions.php` activo se necesitan en el tema sombra.
- Auditar JS de `filtro-camisetas` para identificar selectores DOM que deben mantenerse.
- Capturar CSS del grid actual y breakpoints del header/archive con DevTools (Antigravity read-only).
- Preparar el template de token cPanel para la Sesión 014 (guardrails de path a `wp-content/themes/catenaccio-a0-child`).
- **No crear carpetas en el servidor. No escribir en servidor.**

### Sesión 013 — THEME_SHADOW_IMPLEMENT
**Objetivo:** Implementar localmente el tema sombra completo.
- Crear `catenaccio-a0-child/` localmente en el repo (carpeta nueva, no en el servidor).
- Implementar `style.css`, `functions.php`, `header.php`.
- Implementar `woocommerce/single-product.php`, `archive-product.php`, `content-product.php`.
- Implementar `assets/css/cv-a0.css` con grid, breakpoints y estilos básicos.
- Implementar `assets/js/cv-a0.js` con toggle off-canvas.
- Actualizar `cv_minicart_popup_enhancements()` para los nuevos selectores.
- **Todo el trabajo es local. Sin sync al servidor en esta sesión.**

### Sesión 014 — THEME_SHADOW_SYNC
**Objetivo:** Sync controlado del tema local al servidor.
- Pablo crea un nuevo token cPanel API (no usar el de 010B — ya revocado).
- El agente usa el token solo para escribir en `public_html/wp-content/themes/catenaccio-a0-child/`.
- Path guardrail estricto: ninguna escritura fuera de `catenaccio-a0-child/`.
- Verificar que el tema sombra aparece en WP Admin → Apariencia → Temas (inactivo).
- Pablo revoca el token al cerrar la sesión.
- **Cero escritura en `hello-elementor-child` o en plugins.**

### Sesión 015 — THEME_SHADOW_VISUAL_VALIDATION
**Objetivo:** Validación visual del tema sombra con Antigravity.
- Pablo activa temporalmente `catenaccio-a0-child` en WP Admin (ventana controlada).
- Antigravity navega: home, producto individual (1-2 productos), shop, categoría, carrito, mi cuenta.
- Capturar screenshots de cada sección.
- Comparar con capturas del tema activo (tomadas en Sesión 012).
- Identificar regresiones visuales y funcionales.
- Verificar: menú nav, mini-carrito, off-canvas, grid de productos, filtros AJAX, breadcrumbs, precio, galería, add-to-cart, variaciones, breadcrumbs.
- Si hay regresiones → Pablo reactiva `hello-elementor-child` → el agente corrige en Sesión 013bis → nuevo sync 014bis → nueva validación.
- **Antigravity solo lee. No edita archivos ni accede a cPanel.**

### RELEASE_MANUAL_PABLO
**Objetivo:** Activación definitiva del tema sombra en producción.
- Solo cuando la validación de Sesión 015 sea aprobada sin regresiones bloqueantes.
- Pablo activa `catenaccio-a0-child` en WP Admin → Apariencia → Temas.
- Pablo hace flush de rewrite rules: WP Admin → Ajustes → Enlaces permanentes → Guardar.
- Pablo limpia LiteSpeed Cache: WP Admin → LiteSpeed Cache → Vaciar todo.
- Pablo verifica en producción: home, producto, shop, carrito, checkout.
- Si algo falla: Pablo reactiva `hello-elementor-child` (rollback en < 2 min).
- Pablo notifica al agente el resultado para cerrar A0 en el registro.

---

## 10. CHECKLIST DE ACEPTACIÓN DEL PLAN

Para dar por válido este documento como base para las sesiones 012-015, deben cumplirse:

### Completitud del plan
- [x] P1-A Header (653): widgets Pro identificados, enfoque técnico definido, shortcodes listados, riesgos documentados
- [x] P1-B Producto individual (100): 5 widgets Pro mapeados a equivalentes PHP/WC nativos, shortcodes conservados, hooks críticos identificados
- [x] P1-C Archivo / Categorías (129): loop-grid Pro mapeado a template PHP nativo, todos los shortcodes conservados, compatibilidad con filtros documentada
- [x] P2 Carrito + Mi Cuenta: acción manual Pablo con shortcodes Free identificados
- [x] Riesgos técnicos: URL rewrite, mini-cart JS, LiteSpeed/OPcache, flush rewrite, SEO/breadcrumbs, filtros AJAX, móvil, checkout, caché, fallback, tema activo, cambios visuales — todos documentados
- [x] Estrategia respeta DEC-10: tema sombra, no tocar tema activo, no tocar plugins, validación Antigravity, promoción manual Pablo, rollback definido, revocación de acceso

### Shortcodes — ninguno se pierde en la migración
- [x] `[catenaccio_offcanvas_menu]` — conservado en header.php del tema sombra
- [x] `[cv_product_meta]` — conservado en single-product.php
- [x] `[cv_explorar]` — conservado en single-product.php
- [x] `[cv_short_description]` — conservado en single-product.php
- [x] `[filtro_camisetas_ui]` — conservado en archive-product.php
- [x] `[filtro_taxonomico]` — conservado en archive-product.php
- [x] `[filtro_contador]` — conservado en archive-product.php
- [x] `[cv_archive_title]` — conservado en archive-product.php
- [x] `[cv_archive_intro]` — conservado en archive-product.php
- [x] `[woocommerce_cart]` — P2 Carrito (acción Pablo)
- [x] `[woocommerce_my_account]` — P2 Mi Cuenta (acción Pablo)

### Restricciones verificadas
- [x] No se implementa código en esta sesión (011)
- [x] No se crea carpeta `catenaccio-a0-child` en esta sesión
- [x] No se modifica `hello-elementor-child`
- [x] No se modifica `functions.php` del tema activo
- [x] No se tocan plugins activos
- [x] No se toca WordPress, WooCommerce settings, cPanel, pagos
- [x] No hay secretos, tokens ni credenciales en este documento

### Sesiones posteriores definidas
- [x] Sesión 012 THEME_SHADOW_SCAFFOLD — objetivo definido
- [x] Sesión 013 THEME_SHADOW_IMPLEMENT — objetivo definido
- [x] Sesión 014 THEME_SHADOW_SYNC — objetivo definido
- [x] Sesión 015 THEME_SHADOW_VISUAL_VALIDATION — objetivo definido
- [x] RELEASE_MANUAL_PABLO — procedimiento definido con rollback

### Fallback de emergencia documentado
- [x] Acciones manuales Pablo si Pro expira antes de completar la migración — sección 7.10

---

## 11. ARCHIVOS DE REFERENCIA

| Archivo | Contenido relevante |
|---------|---------------------|
| `docs/operations/ELEMENTOR_DEPENDENCY_AUDIT.md` | Widget-level audit completo. Tabla de widgets Pro por template. |
| `docs/operations/SERVER_FILESYSTEM_READONLY_DISCOVERY.md` | Código real de functions.php, filtro-camisetas, offcanvas-menu. Dependencias confirmadas y desmentidas. |
| `docs/operations/ACCESS_MODEL_NO_SSH.md` | Modelo de acceso. Cómo solicitar acceso cPanel temporal. |
| `DECISIONS.md #DEC-10` | NO_SSH_SHADOW_RELEASE_FLOW. Canal de acceso aprobado. Restricciones absolutas. |
| `DECISIONS.md #DEC-9` | Application Password. DRAFT_ONLY. Revocación. |
| `DECISIONS.md #DEC-8` | Estrategia A0+B1 aprobada. Alternativas descartadas. |

---

*Plan creado en modo PLAN_ONLY / DOCS_ONLY. Ningún archivo PHP, CSS ni JS fue creado. Ningún acceso al servidor. Ninguna modificación al sitio WordPress. Ningún secreto ni credencial en este documento.*  
*Fecha: 2026-06-20 — Sesión 011 — Claude Code (Sonnet).*
