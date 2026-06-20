# THEME_SHADOW_SCAFFOLD — Catenaccio Vintage

Contrato técnico para la implementación del tema sombra `catenaccio-a0-child`.

**Proyecto:** Catenaccio Vintage  
**Fecha:** 2026-06-20  
**Sesión:** 012  
**Modo:** DOCS_ONLY / SCAFFOLD_PLAN / READ_ONLY  
**Agente:** Claude Code (Sonnet)  
**Prerequisitos cumplidos:**
- A0_MIGRATION_PLAN completado (Sesión 011)
- DEC-10 activa: NO_SSH_SHADOW_RELEASE_FLOW
- Token cPanel API 010B revocado por Pablo
- main/origin/main sincronizados en `15935b6`

---

## 1. OBJETIVO DEL SCAFFOLD

Este documento es el contrato técnico que el agente de Sesión 013 (THEME_SHADOW_IMPLEMENT) debe recibir para implementar el tema sombra correctamente.

**Objetivo primario:**
Diseñar la estructura completa de `catenaccio-a0-child` — el tema sombra que eliminará las dependencias críticas de Elementor Pro en header, producto y archivo — manteniendo intactos WordPress, WooCommerce y todos los plugins y shortcodes existentes.

**Restricciones absolutas de esta sesión (012):**
- NO crear la carpeta `catenaccio-a0-child` (ni localmente ni en servidor)
- NO implementar PHP, CSS ni JS
- NO tocar servidor, WordPress, cPanel, FTP, WebDAV ni API
- NO modificar el tema activo `hello-elementor-child`
- Solo documentar. El scaffold vive aquí.

**Superficies a reemplazar (de A0_MIGRATION_PLAN §2):**

| Template Elementor Pro | Superficie | Reemplazo en tema sombra |
|------------------------|-----------|--------------------------|
| 653 — Cabecera simple | Header global (todas las páginas) | `header.php` |
| 100 — Plantilla producto individual | Single product | `woocommerce/single-product.php` |
| 129 — Archivo de Productos | Shop / categorías / búsqueda | `woocommerce/archive-product.php` + `woocommerce/content-product.php` |

**Qué NO se toca en ninguna sesión de la serie 012-015:**
- Tema activo `hello-elementor-child` y su `functions.php`
- Plugins: `filtro-camisetas`, `catenaccio-offcanvas-menu`, `elementor`, `elementor-pro`, `woocommerce`, `rank-math`, `litespeed-cache`, `woocommerce-payments`, `woocommerce-paypal-payments`
- `wp-config.php`, WooCommerce settings, pasarelas de pago
- Páginas de Carrito, Mi Cuenta, Checkout (id=1548 en Blocks — intocable)
- Cualquier dato de producto, pedido, cliente o sesión de pago

---

## 2. ESTRUCTURA PROPUESTA DEL TEMA SOMBRA

La siguiente estructura es la definición aprobada para que Sesión 013 la implemente. **No crear esta carpeta todavía.**

```
catenaccio-a0-child/
├── style.css                          # Header obligatorio + import padre
├── functions.php                      # Hooks y funciones críticas A0 (ver §4)
├── header.php                         # Header nativo — reemplaza template 653
├── footer.php                         # Footer minimal (get_footer nativo)
├── woocommerce/
│   ├── single-product.php             # Template producto — reemplaza template 100
│   ├── archive-product.php            # Template archivo/categorías — reemplaza template 129
│   └── content-product.php            # Ítem del grid — reemplaza loop-items 878/354/720/892
└── assets/
    ├── css/
    │   └── cv-a0.css                  # Estilos: header, grid, off-canvas, responsive
    └── js/
        └── cv-a0.js                   # Toggle off-canvas, mini-cart selectors actualizados
```

**Anotaciones de archivo:**

| Archivo | Notas para implementación |
|---------|--------------------------|
| `style.css` | Solo header CSS + `@import url("../hello-elementor/style.css")`. Sin CSS custom aquí. |
| `functions.php` | Solo hooks/funciones críticas A0 (ver §4). NO copiar `functions.php` completo del activo. |
| `header.php` | Reemplaza todo el template 653. Debe incluir: nav, mini-cart, off-canvas toggle, offcanvas panel. |
| `footer.php` | Minimal: `wp_footer()` + cierre body/html. Sin dependencias Elementor. |
| `woocommerce/single-product.php` | Template WC override. WooCommerce detecta automáticamente al activar el tema. |
| `woocommerce/archive-product.php` | Template WC override. Reemplaza el Loop Grid Pro. |
| `woocommerce/content-product.php` | Template WC override. Ítem del grid. Reemplaza loop-items. |
| `assets/css/cv-a0.css` | Stylesheet principal del tema sombra. Cargado via `wp_enqueue_style` en `functions.php`. |
| `assets/js/cv-a0.js` | JS mínimo: toggle off-canvas + selector updates para mini-cart. |

**Sobre la herencia del tema padre:**

El tema sombra declara `Template: hello-elementor` en `style.css`, heredando del padre (no del child activo). El child activo (`hello-elementor-child`) tiene `Template: hello-elementor`, por lo que ambos son hijos del mismo padre. Los CSS del padre se importan vía `@import`. Los hooks del child activo NO se heredan automáticamente — esta es la diferencia crítica que §4 resuelve.

---

## 3. INVENTARIO DE FUNCIONES, HOOKS Y SHORTCODES CRÍTICOS A PORTAR

Basado en `SERVER_FILESYSTEM_READONLY_DISCOVERY.md` y `A0_MIGRATION_PLAN.md`. Las siguientes entidades viven en `functions.php` del child activo (62KB, ~1712 líneas) y deben evaluarse para portarse al tema sombra.

### 3.1 Shortcodes: estado en A0

| Shortcode | Plugin/Origen | Dónde usarlo en tema sombra | Depende de Elementor |
|-----------|--------------|----------------------------|---------------------|
| `[catenaccio_offcanvas_menu]` | Plugin `catenaccio-offcanvas-menu` | `header.php` — panel off-canvas | NO — 100% independiente ✅ |
| `[cv_product_meta]` | `functions.php` activo | `woocommerce/single-product.php` | NO ✅ |
| `[cv_explorar]` | `functions.php` activo | `woocommerce/single-product.php` | NO ✅ |
| `[cv_short_description]` | `functions.php` activo | `woocommerce/single-product.php` | NO ✅ |
| `[filtro_camisetas_ui]` | Plugin `filtro-camisetas` | `woocommerce/archive-product.php` | NO — core WC-nativo ✅ |
| `[filtro_taxonomico]` | Plugin `filtro-camisetas` | `woocommerce/archive-product.php` | NO ✅ |
| `[filtro_contador]` | Plugin `filtro-camisetas` | `woocommerce/archive-product.php` | NO ✅ |
| `[cv_archive_title]` | `functions.php` activo | `woocommerce/archive-product.php` | NO ✅ |
| `[cv_archive_intro]` | `functions.php` activo | `woocommerce/archive-product.php` | NO ✅ |
| `[woocommerce_cart]` | WooCommerce FREE | P2 — acción Pablo en WP Admin (sin agente) | NO ✅ |
| `[woocommerce_my_account]` | WooCommerce FREE | P2 — acción Pablo en WP Admin (sin agente) | NO ✅ |

Los shortcodes de los plugins (`catenaccio-offcanvas-menu`, `filtro-camisetas`) se registran a nivel de plugin: estarán disponibles en cualquier tema activo. Los shortcodes `cv_*` se registran en `functions.php` del child activo — el tema sombra debe asegurar que estén disponibles (ver §4).

### 3.2 Hooks críticos: clasificación A0

**CRÍTICO para A0 — PORTAR al functions.php del tema sombra:**

| Hook / Función | Línea ref. | Función | Riesgo si no se porta |
|---------------|------------|---------|----------------------|
| `register_nav_menus()` — localización `primary` | nuevo | Registra el menú `primary` que usa `wp_nav_menu()` en header.php | Sin menú de navegación en header |
| `woocommerce_product_post_type_args` | `functions.php` | Elimina el prefijo `/product/` de las URLs de producto (`/camiseta-real-madrid-1999/`) | URLs de producto devuelven 404 |
| `woocommerce_get_breadcrumb` (×2) | `functions.php` | Personaliza breadcrumbs: separador, nodos liga/equipo/selecciones | Breadcrumbs genéricos de WC (sin personalización) |
| `woocommerce_package_rates` | `functions.php` | IVA 21% sobre envío | Error fiscal en pedidos — **CRÍTICO** |
| `pre_get_posts` (carrusel home: stock) | `functions.php` | Filtra carrusel home a solo productos en stock | Carrusel puede mostrar productos agotados |
| `wp_enqueue_scripts` — estilos/JS del tema sombra | nuevo | Cargar `cv-a0.css` y `cv-a0.js` | Sin estilos ni JS del tema sombra |
| Registro shortcodes: `cv_product_meta`, `cv_explorar`, `cv_short_description`, `cv_archive_title`, `cv_archive_intro` | `functions.php` | Los shortcodes usados en templates | Shortcodes no encontrados → texto literal `[cv_product_meta]` en frontend |

**IMPORTANTE pero no bloqueante para A0 — EVALUAR en Sesión 013:**

| Hook / Función | Función | Evaluación |
|---------------|---------|------------|
| `rank_math/frontend/description` | Personaliza meta description | RankMath funciona sin esto, solo pierde override personalizado de descripción |
| `rank_math/opengraph/image` | Personaliza Open Graph image | Funcionará con imagen de RankMath por defecto sin este hook |
| `cv_minicart_popup_enhancements()` | Mejora UX del mini-cart (botones, contador) | Actualmente usa selectores `.elementor-menu-cart__*` — deben reescribirse para A0 |
| `woocommerce_before_shop_loop` / `woocommerce_after_shop_loop` | Hooks de ordenación/conteo en archive | Revisar si hay personalizaciones adicionales en functions.php del activo |
| Template redirect hooks (login / mi-cuenta) | Redirige `/mi-cuenta/` → `/acceder/` para usuarios no autenticados | Importante para UX pero no bloquea ventas |

**NO PORTAR en A0 — dejar en el child activo o descartar:**

| Hook / Función | Razón para no portar |
|---------------|---------------------|
| Hook `elementor/query/filtro_camisetas` | Cosmético — solo activo si hay Loop Grid. Al reemplazar el Loop Grid, queda inerte. |
| Cualquier filtro de Elementor (`elementor/widget/*/render_content`, etc.) | Específicos de Elementor. Sin efecto en tema nativo. |
| Funciones específicas de Elementor (registro de widgets, etc.) | No aplican fuera del contexto Elementor. |
| CSS de admin / `admin_enqueue_scripts` | No impacta el frontend. |
| Funciones de mantenimiento o utilidades internas no usadas en templates | Reducir scope del porte. |

### 3.3 Decisión sobre la estrategia de shortcodes en functions.php del tema sombra

Los shortcodes `cv_*` se definen en `functions.php` del child activo. Cuando el tema sombra está activo, el child activo **no está activo** — por tanto, esos shortcodes no existen en el sistema.

Opciones:

**Opción A — Re-declarar shortcodes en functions.php del tema sombra** (recomendada)  
Copiar las funciones de registro de shortcodes al `functions.php` del tema sombra. Solo las funciones de los shortcodes usados en templates A0 (`cv_product_meta`, `cv_explorar`, `cv_short_description`, `cv_archive_title`, `cv_archive_intro`).  
Riesgo: doble registro si por algún motivo ambos themes estuvieran activos simultáneamente (no es posible en WP, pero hay que ser consciente).  
Mitigación: usar `if (!shortcode_exists('cv_product_meta'))` antes de `add_shortcode()`.

**Opción B — require_once condicional desde el functions.php del activo**  
Incluir `require_once get_template_directory() . '/../hello-elementor-child/functions.php'` en el tema sombra.  
Riesgo muy alto: cargaría el functions.php completo (62KB, 1712 líneas), incluyendo hooks que pueden duplicarse con los del propio tema sombra. Riesgo de IVA doble, doble redirect, doble registro de menús. **DESCARTADO.**

**Opción C — Mover shortcodes a un plugin auxiliar**  
Crear un microplug con los shortcodes. Activo en ambos temas.  
Demasiado overhead para el alcance A0 actual. DEFER para futuro refactor.

**→ RECOMENDACIÓN: Opción A (re-declarar, minimal port con guard)**

---

## 4. ESTRATEGIA FUNCTIONS.PHP DEL TEMA SOMBRA

### 4.1 Principio rector

El `functions.php` del tema sombra debe contener **solo lo mínimo necesario** para que los tres templates (header, single-product, archive) funcionen correctamente. No es un porte del fichero completo del activo.

### 4.2 Estructura propuesta del functions.php del tema sombra

```php
<?php
/**
 * functions.php — catenaccio-a0-child (tema sombra A0)
 * Solo funciones críticas para A0. NO copiar functions.php completo del activo.
 */

// 1. Enqueue de assets del tema sombra
function cv_a0_enqueue_assets() {
    wp_enqueue_style(
        'cv-a0-style',
        get_stylesheet_directory_uri() . '/assets/css/cv-a0.css',
        [],
        '0.1.0'
    );
    wp_enqueue_script(
        'cv-a0-script',
        get_stylesheet_directory_uri() . '/assets/js/cv-a0.js',
        ['jquery'],
        '0.1.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'cv_a0_enqueue_assets');

// 2. Registro de menú de navegación
function cv_a0_register_menus() {
    register_nav_menus([
        'primary' => __('Menú Principal', 'catenaccio-a0-child'),
    ]);
}
add_action('after_setup_theme', 'cv_a0_register_menus');

// 3. Shortcodes críticos A0 (guard: solo registrar si no existen ya)
if (!shortcode_exists('cv_product_meta')) {
    // [copiar función cv_product_meta_shortcode() del functions.php activo]
    add_shortcode('cv_product_meta', 'cv_product_meta_shortcode');
}
if (!shortcode_exists('cv_explorar')) {
    // [copiar función cv_explorar_shortcode() del functions.php activo]
    add_shortcode('cv_explorar', 'cv_explorar_shortcode');
}
if (!shortcode_exists('cv_short_description')) {
    // [copiar función cv_short_description_shortcode() del functions.php activo]
    add_shortcode('cv_short_description', 'cv_short_description_shortcode');
}
if (!shortcode_exists('cv_archive_title')) {
    // [copiar función cv_archive_title_shortcode() del functions.php activo]
    add_shortcode('cv_archive_title', 'cv_archive_title_shortcode');
}
if (!shortcode_exists('cv_archive_intro')) {
    // [copiar función cv_archive_intro_shortcode() del functions.php activo]
    add_shortcode('cv_archive_intro', 'cv_archive_intro_shortcode');
}

// 4. URLs de producto sin prefijo /product/ (CRÍTICO — rewrite rules)
// [copiar función de woocommerce_product_post_type_args del functions.php activo]
add_filter('woocommerce_product_post_type_args', 'cv_remove_product_prefix');

// 5. Breadcrumbs personalizados (liga/equipo/selecciones)
// [copiar las dos funciones de woocommerce_get_breadcrumb del functions.php activo]
add_filter('woocommerce_get_breadcrumb', 'cv_custom_breadcrumb_nodes', 10, 2);

// 6. IVA 21% en envío (CRÍTICO — nunca duplicar)
// [copiar función de woocommerce_package_rates del functions.php activo]
add_filter('woocommerce_package_rates', 'cv_add_tax_to_shipping', 10, 2);

// 7. Mini-cart selectors actualizados (selectores A0 — sin Elementor)
function cv_a0_minicart_enhancements() {
    // Versión A0 de cv_minicart_popup_enhancements():
    // Usar .cv-mini-cart__footer-buttons en lugar de .elementor-menu-cart__footer-buttons
    // [implementar en Sesión 013 con selectores CSS del tema sombra]
}
add_action('wp_footer', 'cv_a0_minicart_enhancements');
```

### 4.3 Riesgos de la estrategia de functions.php

| Riesgo | Descripción | Mitigación |
|--------|------------|------------|
| Doble IVA en envío | Si el hook `woocommerce_package_rates` se registra dos veces (una en el activo cuando no debería y otra en el sombra) | El child activo no está activo cuando el sombra está activo. No hay doble registro. |
| Doble rewrite rules | Si `woocommerce_product_post_type_args` se aplica con lógica inconsistente | Verificar que la copia sea idéntica a la del activo. Flush rewrite rules al activar. |
| Shortcodes no encontrados | Si la guard `!shortcode_exists()` da false cuando debería ser true | En el contexto de WP con un solo tema activo, los shortcodes del activo no están disponibles. La guard es defensiva. |
| Copiar demasiadas funciones | El functions.php del activo tiene 1712 líneas. Copiar todo introduce riesgo de efectos secundarios. | Solo copiar las 7 categorías listadas en §3.2 columna CRÍTICO. Nada más. |

### 4.4 Veredicto de estrategia

```
APPROVE_MINIMAL_PORT
```

Portar solo las funciones críticas listadas en §3.2 con guards `!shortcode_exists()` y `!has_filter()` donde aplique. No usar `require_once` del functions.php completo del activo. No crear plugin auxiliar en A0.

---

## 5. HEADER SCAFFOLD

### 5.1 Descripción funcional

`header.php` reemplaza el template 653 de Elementor Pro ("Cabecera simple") en el tema sombra. Es el único header del sitio cuando el tema sombra está activo.

**Componentes obligatorios:**

| Componente | Método PHP | Depende de plugin |
|-----------|-----------|-------------------|
| Doctype + `<head>` | `wp_head()` | WP core |
| Logo / marca | `get_custom_logo()` o `bloginfo('name')` | WP core |
| Menú de navegación principal | `wp_nav_menu(['theme_location' => 'primary'])` | WP core (menú asignado en WP Admin por Pablo) |
| Mini-carrito WooCommerce | `woocommerce_mini_cart()` o `do_shortcode('[woocommerce_mini_cart]')` | WooCommerce FREE |
| Botón toggle off-canvas | `<button class="cv-offcanvas-toggle">` con JS propio | Ninguno |
| Panel off-canvas (contenido) | `do_shortcode('[catenaccio_offcanvas_menu]')` | Plugin `catenaccio-offcanvas-menu` ✅ |
| Backdrop / overlay | `<div class="cv-offcanvas-backdrop">` | CSS/JS propio |

### 5.2 Estructura HTML propuesta (referencia para Sesión 013)

```html
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<header class="cv-header" role="banner">
  <div class="cv-header__inner">

    <!-- Logo -->
    <div class="cv-header__logo">
      <?php
      if (function_exists('the_custom_logo') && has_custom_logo()) {
          the_custom_logo();
      } else {
          echo '<a href="' . esc_url(home_url('/')) . '">' . get_bloginfo('name') . '</a>';
      }
      ?>
    </div>

    <!-- Navegación principal (desktop) -->
    <nav class="cv-header__nav" aria-label="Navegación principal">
      <?php
      wp_nav_menu([
          'theme_location' => 'primary',
          'container'      => false,
          'menu_class'     => 'cv-nav__list',
          'depth'          => 2,
          'fallback_cb'    => false,
      ]);
      ?>
    </nav>

    <!-- Acciones del header: mini-cart + toggle off-canvas -->
    <div class="cv-header__actions">

      <!-- Mini-carrito -->
      <div class="cv-mini-cart" id="cv-mini-cart">
        <?php woocommerce_mini_cart(); ?>
      </div>

      <!-- Botón toggle off-canvas -->
      <button
        class="cv-offcanvas-toggle"
        aria-label="<?php esc_attr_e('Abrir menú de categorías', 'catenaccio-a0-child'); ?>"
        aria-expanded="false"
        aria-controls="cv-offcanvas-panel"
        type="button"
      >
        <span class="cv-offcanvas-toggle__icon" aria-hidden="true">&#9776;</span>
      </button>

    </div>
  </div>
</header>

<!-- Panel off-canvas -->
<div class="cv-offcanvas-panel" id="cv-offcanvas-panel" aria-hidden="true" role="dialog" aria-label="Menú de categorías">
  <div class="cv-offcanvas-panel__inner">
    <button class="cv-offcanvas-close" aria-label="Cerrar menú" type="button">&times;</button>
    <?php echo do_shortcode('[catenaccio_offcanvas_menu show_leagues="yes" show_sizes="yes" show_players="yes"]'); ?>
  </div>
</div>

<!-- Backdrop -->
<div class="cv-offcanvas-backdrop" id="cv-offcanvas-backdrop" aria-hidden="true"></div>
```

### 5.3 Clases CSS propuestas para el header

| Clase | Elemento | Descripción |
|-------|---------|-------------|
| `.cv-header` | `<header>` | Contenedor principal del header |
| `.cv-header__inner` | `div` interior | Flex container: logo + nav + actions |
| `.cv-header__logo` | `div` logo | Área del logo |
| `.cv-header__nav` | `<nav>` | Menú de navegación desktop |
| `.cv-nav__list` | `<ul>` del menú | Lista de items del menú |
| `.cv-header__actions` | `div` | Mini-cart + toggle agrupados |
| `.cv-mini-cart` | `div` | Contenedor del mini-carrito |
| `.cv-mini-cart__footer-buttons` | `div` dentro del mini-cart | **Nuevo selector** (reemplaza `.elementor-menu-cart__footer-buttons`) |
| `.cv-button--view-cart` | botón "Ver carrito" | **Nuevo selector** (reemplaza `.elementor-button--view-cart`) |
| `.cv-button--checkout` | botón "Finalizar compra" | **Nuevo selector** (reemplaza `.elementor-button--checkout`) |
| `.cv-offcanvas-toggle` | `<button>` | Botón abrir off-canvas |
| `.cv-offcanvas-panel` | `div` panel lateral | Panel del menú off-canvas |
| `.cv-offcanvas-panel__inner` | `div` | Interior del panel |
| `.cv-offcanvas-close` | `<button>` | Botón cerrar dentro del panel |
| `.cv-offcanvas-backdrop` | `div` overlay | Fondo oscuro detrás del panel |

### 5.4 Estados JS para el off-canvas

| Estado | Qué cambia |
|--------|-----------|
| Panel cerrado (default) | `.cv-offcanvas-panel[aria-hidden="true"]`, `.cv-offcanvas-toggle[aria-expanded="false"]`, `.cv-offcanvas-backdrop` oculto |
| Panel abierto | `body.cv-offcanvas-open`, `.cv-offcanvas-panel[aria-hidden="false"]`, `.cv-offcanvas-toggle[aria-expanded="true"]`, `.cv-offcanvas-backdrop` visible |
| Body lock al abrir | `body.cv-offcanvas-open { overflow: hidden; }` — evita scroll de fondo |
| Cierre por backdrop | Click en `.cv-offcanvas-backdrop` → cierre del panel |
| Cierre por ESC | `keydown Escape` → cierre del panel |

### 5.5 JS mínimo para off-canvas (cv-a0.js)

El plugin `catenaccio-offcanvas-menu` ya tiene su propio JS para el acordeón interno de categorías (`assets/js/offcanvas-menu.js`). Lo que falta es solo el toggle de apertura/cierre del panel contenedor.

```javascript
// cv-a0.js — Toggle off-canvas
(function($) {
    'use strict';
    const panel    = document.getElementById('cv-offcanvas-panel');
    const backdrop = document.getElementById('cv-offcanvas-backdrop');
    const toggle   = document.querySelector('.cv-offcanvas-toggle');
    const closeBtn = document.querySelector('.cv-offcanvas-close');

    function openPanel() {
        panel.setAttribute('aria-hidden', 'false');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('cv-offcanvas-open');
    }

    function closePanel() {
        panel.setAttribute('aria-hidden', 'true');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('cv-offcanvas-open');
    }

    if (toggle)   toggle.addEventListener('click', openPanel);
    if (closeBtn) closeBtn.addEventListener('click', closePanel);
    if (backdrop) backdrop.addEventListener('click', closePanel);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePanel();
    });
})(jQuery);
```

---

## 6. PRODUCTO SCAFFOLD

### 6.1 Descripción funcional

`woocommerce/single-product.php` reemplaza el template 100 de Elementor Pro ("Plantilla producto individual"). WooCommerce detecta automáticamente este archivo cuando el tema activo lo contiene.

**Componentes obligatorios en orden visual (de arriba abajo):**

| Componente | Método | Origen |
|-----------|--------|--------|
| Breadcrumbs | `woocommerce_breadcrumb()` | WC nativo + hooks activos en functions.php del sombra |
| Galería de imágenes | `woocommerce_show_product_images()` | WC nativo |
| Título (H1) | `the_title('<h1 class="cv-product-title">', '</h1>')` | WP core |
| Precio | `woocommerce_template_single_price()` | WC nativo |
| Descripción corta / ACF | `do_shortcode('[cv_short_description]')` | Shortcode propio |
| Botón Add to Cart + variaciones | `woocommerce_template_single_add_to_cart()` | WC nativo |
| Meta del producto (talla, medidas, condición) | `do_shortcode('[cv_product_meta]')` | Shortcode propio |
| Explorar colecciones relacionadas | `do_shortcode('[cv_explorar]')` | Shortcode propio |
| Descripción completa | `woocommerce_template_single_description()` | WC nativo |

### 6.2 Template PHP propuesto (referencia para Sesión 013)

```php
<?php
// woocommerce/single-product.php — catenaccio-a0-child
defined('ABSPATH') || exit;

get_header();
?>
<main class="cv-product-page" id="main">
  <?php while (have_posts()) : the_post(); global $product; ?>

    <div class="cv-product-layout">

      <!-- Columna izquierda: galería -->
      <div class="cv-product-gallery">
        <?php woocommerce_breadcrumb(); ?>
        <?php woocommerce_show_product_images(); ?>
      </div>

      <!-- Columna derecha: info -->
      <div class="cv-product-info">
        <?php the_title('<h1 class="cv-product-title">', '</h1>'); ?>

        <div class="cv-product-price">
          <?php woocommerce_template_single_price(); ?>
        </div>

        <div class="cv-product-short-desc">
          <?php echo do_shortcode('[cv_short_description]'); ?>
        </div>

        <div class="cv-product-add-to-cart">
          <?php woocommerce_template_single_add_to_cart(); ?>
        </div>

        <div class="cv-product-meta">
          <?php echo do_shortcode('[cv_product_meta]'); ?>
        </div>

        <div class="cv-product-explorar">
          <?php echo do_shortcode('[cv_explorar]'); ?>
        </div>
      </div>

    </div><!-- .cv-product-layout -->

    <div class="cv-product-description">
      <?php woocommerce_template_single_description(); ?>
    </div>

  <?php endwhile; ?>
</main>
<?php
get_footer();
```

### 6.3 Clases CSS propuestas para single-product

| Clase | Elemento |
|-------|---------|
| `.cv-product-page` | `<main>` — página de producto |
| `.cv-product-layout` | `div` — layout dos columnas (galería + info) |
| `.cv-product-gallery` | `div` — columna izquierda (galería) |
| `.cv-product-info` | `div` — columna derecha (datos) |
| `.cv-product-title` | `h1` — nombre del producto |
| `.cv-product-price` | `div` — precio (incluye `.price del` y `.price ins` para rebajas) |
| `.cv-product-short-desc` | `div` — descripción corta / ACF |
| `.cv-product-add-to-cart` | `div` — botón + variaciones |
| `.cv-product-meta` | `div` — talla, medidas, condición, defectos |
| `.cv-product-explorar` | `div` — links explorar colecciones |
| `.cv-product-description` | `div` — descripción larga |

---

## 7. ARCHIVE SCAFFOLD

### 7.1 Descripción funcional de archive-product.php

`woocommerce/archive-product.php` reemplaza el template 129 de Elementor Pro ("Archivo de Productos – Loop + Filtro personalizado"). Se aplica a: shop, categorías de producto, resultados de búsqueda de producto.

**Componentes obligatorios en orden visual:**

| Componente | Método | Origen |
|-----------|--------|--------|
| Breadcrumbs | `woocommerce_breadcrumb()` | WC nativo |
| H1 SEO dinámico | `do_shortcode('[cv_archive_title]')` | Shortcode propio |
| Intro SEO con toggle | `do_shortcode('[cv_archive_intro]')` | Shortcode propio |
| UI de filtros (contador + ordenar + limpiar) | `do_shortcode('[filtro_camisetas_ui]')` | Plugin `filtro-camisetas` |
| Filtros laterales por taxonomía | `do_shortcode('[filtro_taxonomico slug="pa_liga"]')` etc. | Plugin `filtro-camisetas` |
| Ordenación WooCommerce | `woocommerce_catalog_ordering()` | WC nativo |
| Loop de productos | `woocommerce_product_loop()` + `wc_get_template_part('content', 'product')` | WC nativo |
| Paginación | `woocommerce_pagination()` | WC nativo |
| Estado "sin productos" | `woocommerce_no_products_found()` | WC nativo |

### 7.2 Template PHP propuesto (referencia para Sesión 013)

```php
<?php
// woocommerce/archive-product.php — catenaccio-a0-child
defined('ABSPATH') || exit;

get_header();
?>
<main class="cv-archive-page" id="main">

  <div class="cv-archive-header">
    <?php woocommerce_breadcrumb(); ?>
    <?php echo do_shortcode('[cv_archive_title]'); ?>
    <?php echo do_shortcode('[cv_archive_intro]'); ?>
  </div>

  <div class="cv-archive-toolbar">
    <?php echo do_shortcode('[filtro_camisetas_ui]'); ?>
    <?php woocommerce_catalog_ordering(); ?>
  </div>

  <div class="cv-archive-layout">

    <!-- Sidebar con filtros -->
    <aside class="cv-archive-sidebar" aria-label="Filtros">
      <?php echo do_shortcode('[filtro_taxonomico slug="pa_liga" titulo="Liga"]'); ?>
      <?php echo do_shortcode('[filtro_taxonomico slug="pa_equipo" titulo="Equipo"]'); ?>
      <?php echo do_shortcode('[filtro_taxonomico slug="pa_temporada" titulo="Temporada"]'); ?>
      <?php echo do_shortcode('[filtro_contador]'); ?>
    </aside>

    <!-- Grid de productos -->
    <div class="cv-archive-products">
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

</main>
<?php
get_footer();
```

### 7.3 Clases CSS propuestas para archive-product

| Clase | Elemento |
|-------|---------|
| `.cv-archive-page` | `<main>` |
| `.cv-archive-header` | Breadcrumbs + H1 + intro |
| `.cv-archive-toolbar` | Filtros UI + ordenación |
| `.cv-archive-layout` | Flex/Grid: sidebar + productos |
| `.cv-archive-sidebar` | `<aside>` — filtros taxonomía |
| `.cv-archive-products` | Contenedor del grid |
| `.cv-archive-grid` | La `<ul>` del loop (generada por `woocommerce_product_loop_start()`) |

**Nota de layout responsive:**
- Desktop: sidebar izquierda (ancho fijo ~280px) + grid productos (flex-grow).
- Mobile: sidebar colapsa o pasa a filtros superiores. Capturar el diseño actual antes de implementar (ver §8 — auditoría DOM).

### 7.4 Descripción funcional de content-product.php

`woocommerce/content-product.php` reemplaza los loop-items 878/354/720/892 de Elementor Pro. Es el template de cada tarjeta de producto en el grid.

**Componentes obligatorios:**

| Componente | Método | Origen |
|-----------|--------|--------|
| Clase de producto | `wc_product_class('cv-product-card', $product)` | WC nativo |
| Enlace al producto | `the_permalink()` | WP core |
| Badge de oferta | `woocommerce_show_product_loop_sale_flash()` | WC nativo |
| Imagen del producto | `woocommerce_template_loop_product_thumbnail()` | WC nativo |
| Título | `woocommerce_template_loop_product_title()` | WC nativo |
| Precio | `woocommerce_template_loop_price()` | WC nativo |
| Botón add-to-cart (rápido) | `woocommerce_template_loop_add_to_cart()` | WC nativo |

### 7.5 Template PHP propuesto para content-product (referencia para Sesión 013)

```php
<?php
// woocommerce/content-product.php — catenaccio-a0-child
defined('ABSPATH') || exit;
global $product;
?>
<li <?php wc_product_class('cv-product-card', $product); ?>>
  <a href="<?php the_permalink(); ?>" class="cv-product-card__link">

    <div class="cv-product-card__image">
      <?php woocommerce_show_product_loop_sale_flash(); ?>
      <?php woocommerce_template_loop_product_thumbnail(); ?>
    </div>

    <div class="cv-product-card__info">
      <?php woocommerce_template_loop_product_title(); ?>
      <?php woocommerce_template_loop_price(); ?>
    </div>

  </a>

  <div class="cv-product-card__actions">
    <?php woocommerce_template_loop_add_to_cart(); ?>
  </div>

</li>
```

### 7.6 Clases CSS propuestas para content-product

| Clase | Elemento |
|-------|---------|
| `.cv-product-card` | `<li>` — ítem del grid |
| `.cv-product-card__link` | `<a>` — enlace completo |
| `.cv-product-card__image` | `div` — imagen + badge oferta |
| `.cv-product-card__info` | `div` — título + precio |
| `.cv-product-card__actions` | `div` — botón add-to-cart |
| `.woocommerce-loop-product__title` | `h2` — generado por WC, debe tener CSS |
| `.price` | `span` — generado por WC, estilos para `del` e `ins` |
| `.onsale` | `span` — badge de oferta, generado por WC |

---

## 8. AUDITORÍA DOM NECESARIA ANTES DE IMPLEMENTAR

Esta checklist define qué capturar en inspección visual/DOM antes de que Sesión 013 implemente el tema sombra. El objetivo es no implementar a ciegas — el tema sombra debe reproducir el layout real del sitio activo.

**Método permitido:** Navegación pública read-only a `catenacciovintage.com` con DevTools. No requiere acceso al servidor ni a WordPress. No se ejecuta si implica loguearse o acceder a áreas admin.

### 8.1 Páginas a inspeccionar

**Home**
- Capturar: estructura del header en homepage (¿algún override específico?)
- Clases del `<body>` en homepage vs. páginas interiores
- Carrusel de productos: selectores del contenedor y de cada ítem
- Ancho máximo del layout y padding lateral
- Screenshot: desktop 1440px

**Header desktop**
- Clases del `<header>` y de cada bloque (logo, nav, actions)
- Clases de los `<li>` del menú y de los submenús
- Clases del mini-carrito (contenedor, icono, contador de ítems)
- Posición del mini-carrito (right del header)
- Clases de `.elementor-menu-cart__*` actuales → anotar para reemplazo
- Comportamiento hover del menú con submenús
- Screenshot: desktop 1440px

**Header móvil (< 768px)**
- ¿El menú de navegación se oculta en móvil? ¿Cómo?
- ¿El toggle off-canvas es visible en móvil?
- Altura del header en móvil
- Clases del body cuando el off-canvas está abierto
- Screenshot: mobile 375px

**Off-canvas abierto**
- Clases del panel lateral (`.elementor-*` actuales)
- Z-index del panel y del backdrop
- Transición de apertura (slide, fade, etc.)
- Comportamiento del scroll del body (¿bloqueado?)
- Screenshot: panel abierto en mobile

**Off-canvas cerrado**
- Estado inicial de `aria-hidden`, `aria-expanded`
- Verificar que no hay visibilidad del panel en estado cerrado

**Producto individual (1-2 productos reales)**
- Orden visual exacto de los componentes (breadcrumbs > galería > título > precio > desc corta > add-to-cart > meta > explorar > desc larga)
- Clases del contenedor de galería y de cada imagen
- Clases del precio (con y sin rebaja)
- Clases del botón add-to-cart y del selector de variaciones (si aplica)
- Breakpoints donde la galería pasa de columna a fila (o viceversa)
- Screenshot: desktop + mobile

**Tienda (shop)**
- Número de columnas del grid: desktop / tablet / mobile
- Clases del contenedor del grid (generadas por Elementor — anotar)
- Clases de cada ítem del grid (generadas por Loop Grid Pro)
- Presencia y posición del sidebar de filtros
- Posición de la ordenación (arriba del grid, a la derecha del toolbar)
- Screenshot: desktop + mobile

**Categoría de producto (ej: /la-liga/)**
- Mismo que tienda (shop) pero verificar si hay diferencias de layout
- Verificar que `[cv_archive_title]` y `[cv_archive_intro]` están visibles
- Verificar posición del contador de resultados
- Screenshot: desktop + mobile

**Carrito (si accesible públicamente)**
- ¿Tiene layout propio o usa el header estándar?
- No modificar nada. Solo observar.

**Mi Cuenta (solo portada, no logueado)**
- ¿Muestra formulario de login o redirige?
- No loguearse.

### 8.2 Qué anotar por breakpoint

Para cada página visual relevante (header, archive, producto), registrar:
- **Desktop** (1440px o 1200px): layout completo
- **Tablet** (~768px): cambios de layout
- **Mobile** (~375px): menú colapsado, off-canvas activo, grid

### 8.3 Selectores críticos a observar con DevTools

```
# Header:
.elementor-menu-cart__footer-buttons   → reemplazar por .cv-mini-cart__footer-buttons
.elementor-button--view-cart           → reemplazar por .cv-button--view-cart
.elementor-button--checkout            → reemplazar por .cv-button--checkout

# Archive grid:
[data-widget_type="loop-grid.product"] → anotar clases del contenedor del loop
.elementor-loop-item                   → anotar clases de cada ítem del loop

# Filtros:
[data-id="filtro_camisetas_ui"]        → verificar si el wrapper tiene clases Elementor
.filtro-camisetas-*                    → selectores nativos del plugin (estos son seguros)

# Off-canvas:
[data-elementor-type="popup"]          → anotar si el panel off-canvas usa este tipo
.elementor-popup-overlay               → backdrop actual (reemplazar por .cv-offcanvas-backdrop)
```

---

## 9. AUDITORÍA DE JS NECESARIA

No modificar ningún JS. Solo identificar qué revisar antes de Sesión 013.

### 9.1 Mini-cart JS (`functions.php` activo — L1613-1675)

**Función:** `cv_minicart_popup_enhancements()`

**Selectores actuales que usan clases Elementor Pro (a reemplazar en cv-a0.js):**
```javascript
// Selector actual (Elementor Pro) → Selector A0 propuesto
'.elementor-menu-cart__footer-buttons' → '.cv-mini-cart__footer-buttons'
'.elementor-button--view-cart'         → '.cv-button--view-cart'
'.elementor-button--checkout'          → '.cv-button--checkout'
```

**Acción en Sesión 013:** Re-implementar la función en `cv-a0.js` con los nuevos selectores. No modificar `functions.php` del activo.

**Verificar también:**
- ¿La función tiene más selectores Elementor no listados aquí?
- ¿El mini-cart AJAX (fragmentos WC) usa selectores específicos de Elementor?
- ¿Hay un evento `wc-fragments-loaded` o similar que dependa de clases Pro?

### 9.2 Off-canvas JS (`catenaccio-offcanvas-menu/assets/js/offcanvas-menu.js`)

**Función:** Acordeón interno de categorías (ligas, equipos, tallas).

**Verificar antes de Sesión 013:**
- ¿El JS del plugin busca un contenedor por clase o ID específico?
- ¿Asume que está dentro de un `.elementor-popup` o similar?
- ¿Tiene listeners en el `body` que dependan del estado de Elementor?
- Si el JS es 100% autónomo (solo busca dentro de su propio output), no hay riesgo.

**Hipótesis basada en Sesión 010B:** El plugin fue catalogado como "100% independiente de Elementor". El JS probablemente usa sus propias clases. Confirmar con lectura del archivo en Sesión 013.

### 9.3 Filtro Camisetas AJAX (`filtro-camisetas/` — JS)

**Función:** Filtrado por taxonomía + contador AJAX.

**Verificar antes de Sesión 013:**
- ¿El JS del plugin busca el grid de productos por una clase o ID específico?
- Si busca `.products` (clase WooCommerce estándar de `<ul>`) → sin riesgo.
- Si busca `.elementor-loop-item` o similar → **riesgo alto** — hay que usar esa clase en el template.
- ¿La función AJAX `filtro_contar_productos` retorna HTML completo o solo datos?
- Si retorna HTML, ¿qué contenedor reemplaza?

**Acción en Sesión 013:** Leer el archivo JS del plugin antes de decidir las clases del `content-product.php`.

### 9.4 Buscador AJAX (`hello-elementor-child/js/cv-search.js`)

**Función:** Buscador AJAX del header.

**Verificar antes de Sesión 013:**
- ¿El script asume un contenedor del buscador con clases Elementor?
- ¿El script se activa por un selector CSS que dejará de existir en el header nativo?
- Si el buscador está en el header actual y el header se reemplaza, ¿el buscador deja de funcionar?

**Nota:** El header del tema sombra no incluye explícitamente un buscador en el scaffold propuesto. Si el buscador debe estar en el header A0, añadirlo al scaffold de Sesión 013.

### 9.5 cv_archive_intro toggle ("Ver más/menos")

**Función:** Shortcode `[cv_archive_intro]` tiene un botón JS de toggle "Ver más/Ver menos".

**Verificar:**
- ¿El JS del toggle está inline en el output del shortcode o en un archivo externo?
- Si está inline → sin riesgo (viaja con el shortcode).
- Si está en un archivo enqueued → verificar que el archivo se carga con el tema sombra.

---

## 10. RIESGOS Y BLOCKERS ANTES DE IMPLEMENTACIÓN

### 10.1 Riesgo: copiar demasiado del functions.php activo

**Descripción:** El `functions.php` activo tiene 1712 líneas. Copiarlo completo introduce hooks de Elementor, hooks de admin, funciones obsoletas y potenciales conflictos.

**Impacto:** Doble aplicación de hooks, errores PHP por funciones duplicadas, comportamiento inesperado.

**Mitigación:** Solo portar las 7 categorías de funciones listadas en §3.2 columna CRÍTICO. Usar guards `!function_exists()` y `!shortcode_exists()`.

**Blocker:** NO proceder a Sesión 013 sin leer las líneas exactas de functions.php que corresponden a las funciones a portar.

### 10.2 Riesgo: pérdida de rewrite rules

**Descripción:** Las URLs limpias `/la-liga/`, `/camiseta-real-madrid-1999/` dependen de rewrite rules en `functions.php`. Si el tema sombra no incluye `woocommerce_product_post_type_args`, las URLs de producto devuelven 404.

**Impacto:** Toda URL de producto es 404. Las ventas son imposibles.

**Mitigación:** Incluir el hook en §4 como CRÍTICO. Al activar el tema sombra, Pablo ejecuta: WP Admin → Ajustes → Enlaces permanentes → Guardar (flush rewrite rules).

**Blocker:** Si el flush no se hace tras activar el tema sombra → URLs rotas hasta que se haga.

### 10.3 Riesgo: doble hook de IVA en envío

**Descripción:** Si por error `woocommerce_package_rates` se registra en el tema sombra Y en algún otro lugar, el IVA se aplica doble.

**Impacto:** Error fiscal en pedidos reales.

**Mitigación:** Verificar que la función se registra UNA sola vez en el tema sombra. Al activar el tema sombra, el child activo no está activo → no hay doble registro. La guard `!has_filter()` es defensiva.

**Blocker:** Antes de activar en producción, Pablo hace una compra de prueba y verifica el IVA del envío.

### 10.4 Riesgo: filtro AJAX del Filtro Camisetas rompiendo por cambio de clases

**Descripción:** El plugin `filtro-camisetas` hace requests AJAX que modifican el DOM del grid. Si el JS del plugin busca un selector como `.elementor-loop-item` que no existe en el template PHP nuevo, el AJAX no actualizará el grid.

**Impacto:** Los filtros de liga/equipo no funcionan → catálogo inutilizable para los usuarios.

**Mitigación:** Leer el JS del plugin antes de decidir las clases del `content-product.php`. Si el JS busca `.products > li` (WC estándar), no hay riesgo. Si busca clases Elementor, usar esas clases en el template.

**Blocker hasta Sesión 013:** Requiere lectura del archivo JS (puede hacerse localmente si el archivo fue leído en 010B — verificar si está en `SERVER_FILESYSTEM_READONLY_DISCOVERY.md`).

### 10.5 Riesgo: mini-cart sin clases Elementor → UX degradada

**Descripción:** `cv_minicart_popup_enhancements()` usa selectores `.elementor-menu-cart__*` que no existirán en el mini-cart nativo.

**Impacto:** El mini-cart funciona (WC nativo) pero sin las mejoras de UX del popup.

**Mitigación:** Re-implementar la función en `cv-a0.js` con los nuevos selectores. No es un blocker de funcionalidad (el carrito sigue funcionando) pero es una regresión de UX.

### 10.6 Riesgo: menú móvil y body lock

**Descripción:** Al abrir el off-canvas en móvil, el body debe bloquearse (`overflow: hidden`) para evitar scroll de fondo.

**Impacto:** Si no se implementa correctamente, el usuario puede hacer scroll detrás del panel off-canvas → UX rota en móvil.

**Mitigación:** `body.cv-offcanvas-open { overflow: hidden; position: fixed; width: 100%; }` — la posición fija evita el "scroll jump" que ocurre solo con `overflow: hidden` en iOS Safari.

### 10.7 Riesgo: LiteSpeed / OPcache

**Descripción:** OPcache casi lleno (16 bytes libres en Sesión 003). LiteSpeed Cache activo.

**Impacto:** Cambios en archivos PHP pueden no reflejarse hasta que OPcache expire. El tema sombra puede parecer no actualizado.

**Mitigación:** Tras el sync de Sesión 014: Pablo limpia LiteSpeed Cache (WP Admin → LiteSpeed Cache → Vaciar todo). Verificar con URL en incógnito.

### 10.8 Riesgo: flush rewrite rules incompleto

**Descripción:** El flush de rewrite rules debe hacerse manualmente después de activar el tema sombra.

**Impacto:** URLs limpias devuelven 404 hasta el flush.

**Mitigación:** Pablo ejecuta WP Admin → Ajustes → Enlaces permanentes → Guardar inmediatamente después de activar el tema sombra. Incluir en checklist de RELEASE_MANUAL_PABLO.

### 10.9 Riesgo: RankMath / breadcrumbs

**Descripción:** Los hooks `rank_math/frontend/description` y `rank_math/opengraph/image` en `functions.php` del activo personalizan los metadatos SEO. Si el tema sombra no los incluye, RankMath usa sus defaults.

**Impacto:** Metadatos SEO ligeramente menos optimizados. No es un blocker funcional.

**Mitigación:** Incluir en el functions.php del tema sombra en Sesión 013 como IMPORTANTE (ver §3.2). No es blocker de A0.

### 10.10 Riesgo: checkout intocable

**Descripción:** La página de Finalizar compra (id=1548) está en WooCommerce Blocks. Es funcional y no requiere migración.

**Restricción absoluta:** No modificar la página 1548, sus shortcodes, sus settings de WooCommerce ni las pasarelas de pago (`woocommerce-payments`, `woocommerce-paypal-payments`).

**Mitigación:** El tema sombra no incluye ningún template de checkout. WooCommerce Blocks se renderiza independientemente del tema activo.

### 10.11 Riesgo: tema sombra no visible en WP Admin tras sync futuro

**Descripción:** Tras el sync de Sesión 014, el tema sombra debe aparecer en WP Admin → Apariencia → Temas como disponible pero inactivo.

**Causa probable si no aparece:** El archivo `style.css` no tiene el header completo (`Theme Name:`, `Template:`) o la carpeta no está en la ubicación correcta.

**Mitigación:** Verificar en Sesión 013 que `style.css` tiene el header correcto. En Sesión 014, tras el sync, pedir a Pablo confirmar que el tema aparece en WP Admin antes de activarlo.

### 10.12 Riesgo: rollback manual

**Descripción:** Si el tema sombra activo provoca un error PHP o una regresión visual inaceptable, Pablo debe poder reactivar `hello-elementor-child` en menos de 2 minutos.

**Procedimiento de rollback (Pablo):**
1. WP Admin → Apariencia → Temas.
2. Activar `Hello Elementor Child`.
3. WP Admin → LiteSpeed Cache → Vaciar todo.
4. Verificar en incógnito que el sitio está restaurado.
5. Notificar al agente para identificar el problema y corregirlo en Sesión 013bis.

**Blocker:** La validación visual de Sesión 015 debe aprobar el tema sombra antes de que Pablo lo active en producción. Sin validación Antigravity aprobada → no activar.

---

## 11. SALIDA ESPERADA PARA SESIÓN 013

El agente de Sesión 013 (THEME_SHADOW_IMPLEMENT) debe recibir:

### 11.1 Árbol de archivos aprobado

```
catenaccio-a0-child/
├── style.css
├── functions.php
├── header.php
├── footer.php
├── woocommerce/
│   ├── single-product.php
│   ├── archive-product.php
│   └── content-product.php
└── assets/
    ├── css/
    │   └── cv-a0.css
    └── js/
        └── cv-a0.js
```

Ningún archivo adicional en A0. Nada de page templates, `front-page.php`, `sidebar.php` o similares que no sean estrictamente necesarios.

### 11.2 Lista de funciones a portar (de §3.2)

CRÍTICO — portar sin falta:
1. `register_nav_menus()` — location `primary`
2. `woocommerce_product_post_type_args` — URLs sin prefijo /product/
3. `woocommerce_get_breadcrumb` (×2) — breadcrumbs personalizados
4. `woocommerce_package_rates` — IVA 21% en envío
5. `pre_get_posts` (carrusel home, stock)
6. `wp_enqueue_scripts` — cv-a0.css y cv-a0.js
7. Registro shortcodes: `cv_product_meta`, `cv_explorar`, `cv_short_description`, `cv_archive_title`, `cv_archive_intro`

### 11.3 Lista de shortcodes obligatorios en templates

| Shortcode | Template |
|-----------|---------|
| `[catenaccio_offcanvas_menu]` | `header.php` |
| `[cv_short_description]` | `woocommerce/single-product.php` |
| `[cv_product_meta]` | `woocommerce/single-product.php` |
| `[cv_explorar]` | `woocommerce/single-product.php` |
| `[cv_archive_title]` | `woocommerce/archive-product.php` |
| `[cv_archive_intro]` | `woocommerce/archive-product.php` |
| `[filtro_camisetas_ui]` | `woocommerce/archive-product.php` |
| `[filtro_taxonomico slug="pa_liga"]` | `woocommerce/archive-product.php` |
| `[filtro_taxonomico slug="pa_equipo"]` | `woocommerce/archive-product.php` |
| `[filtro_contador]` | `woocommerce/archive-product.php` |

### 11.4 Clases CSS/JS objetivo

**Header:**
`.cv-header`, `.cv-header__inner`, `.cv-header__logo`, `.cv-header__nav`, `.cv-nav__list`, `.cv-header__actions`, `.cv-mini-cart`, `.cv-mini-cart__footer-buttons`, `.cv-button--view-cart`, `.cv-button--checkout`, `.cv-offcanvas-toggle`, `.cv-offcanvas-panel`, `.cv-offcanvas-panel__inner`, `.cv-offcanvas-close`, `.cv-offcanvas-backdrop`

**Body states:** `body.cv-offcanvas-open`

**Single product:**
`.cv-product-page`, `.cv-product-layout`, `.cv-product-gallery`, `.cv-product-info`, `.cv-product-title`, `.cv-product-price`, `.cv-product-short-desc`, `.cv-product-add-to-cart`, `.cv-product-meta`, `.cv-product-explorar`, `.cv-product-description`

**Archive:**
`.cv-archive-page`, `.cv-archive-header`, `.cv-archive-toolbar`, `.cv-archive-layout`, `.cv-archive-sidebar`, `.cv-archive-products`

**Content product:**
`.cv-product-card`, `.cv-product-card__link`, `.cv-product-card__image`, `.cv-product-card__info`, `.cv-product-card__actions`

### 11.5 Checklist visual (para Sesión 015 — Antigravity)

- [ ] Header visible y completo en desktop
- [ ] Menú `primary` muestra los items esperados
- [ ] Mini-carrito visible con contador de ítems
- [ ] Toggle off-canvas visible y funcional
- [ ] Panel off-canvas se abre al hacer click en toggle
- [ ] Panel off-canvas se cierra con botón de cierre, backdrop y ESC
- [ ] Body lock activo al abrir off-canvas (sin scroll de fondo)
- [ ] Header móvil en 375px: menú oculto, toggle visible
- [ ] Producto individual: breadcrumbs, galería, título, precio, add-to-cart visibles
- [ ] Shortcodes `[cv_product_meta]`, `[cv_explorar]`, `[cv_short_description]` con output visible
- [ ] Archive: H1 SEO dinámico, intro SEO, filtros, grid de productos visibles
- [ ] Archive grid: N columnas esperadas en desktop / mobile
- [ ] Filtros AJAX: click en filtro actualiza el grid sin recarga de página
- [ ] Contador de resultados actualiza tras filtrar
- [ ] Paginación visible y funcional
- [ ] Breadcrumbs con nodos liga/equipo/selecciones en producto y categoría
- [ ] Precio con rebaja: `<del>` y `<ins>` con formato correcto
- [ ] Galería de producto: thumbnail y zoom funcionales
- [ ] Sin errores PHP visibles en el frontend
- [ ] Sin CSS de Elementor "roto" visible (clases `.elementor-*` sin estilos)

### 11.6 Restricciones absolutas para Sesión 013

1. Todo el trabajo de Sesión 013 es **local** — ningún sync al servidor.
2. La carpeta `catenaccio-a0-child/` se crea en el repo local (`C:\Projects\catenaccio-vintage\`), no en `wp-content/themes/`.
3. NO tocar `hello-elementor-child` ni su `functions.php`.
4. NO modificar plugins activos.
5. NO leer `.env.local` ni usar credenciales.
6. El CSS y JS deben ser funcionales pero no necesariamente perfectos — el objetivo de Sesión 013 es funcionalidad, no pixel-perfect. La validación visual de Sesión 015 identifica regressions CSS.

### 11.7 Criterios de aceptación para implementar localmente (Sesión 013)

El tema sombra se considera "listo para sync" (Sesión 014) cuando:
- Todos los archivos del árbol §11.1 existen.
- `style.css` tiene header con `Theme Name: Catenaccio A0 Child` y `Template: hello-elementor`.
- `functions.php` incluye las 7 categorías de §11.2 sin copiar el functions.php completo.
- `header.php` incluye todos los componentes de §5.1 y genera HTML válido.
- `woocommerce/single-product.php` incluye todos los componentes de §6.1.
- `woocommerce/archive-product.php` incluye todos los componentes de §7.1.
- `woocommerce/content-product.php` incluye todos los componentes de §7.4.
- `assets/css/cv-a0.css` existe y tiene estilos básicos de layout.
- `assets/js/cv-a0.js` tiene el toggle off-canvas implementado.
- `git diff --check` no da errores de whitespace.
- No hay secretos, tokens ni credenciales en ningún archivo.

---

## 12. CRITERIOS DE ACEPTACIÓN DE LA SESIÓN 012

La Sesión 012 queda cerrada y aceptada si:

- [x] `docs/operations/THEME_SHADOW_SCAFFOLD.md` existe.
- [x] No se crea la carpeta `catenaccio-a0-child` (ni localmente ni en servidor).
- [x] No se implementa PHP, CSS ni JS en esta sesión.
- [x] No se toca servidor, WordPress, cPanel, FTP, WebDAV ni API.
- [x] No se modifica `hello-elementor-child`.
- [x] El documento define claramente qué debe implementar Sesión 013.
- [x] El documento respeta DEC-10 (NO_SSH_SHADOW_RELEASE_FLOW).
- [x] CONTEXTO.md appendeado con línea de Sesión 012.
- [x] HISTORIAL_SESIONES.md appendeado con entrada completa.
- [x] BACKLOG.md actualizado: THEME_SHADOW_SCAFFOLD completado, THEME_SHADOW_IMPLEMENT ajustado.
- [x] `agent_events.jsonl` appendeado con evento `theme_shadow_scaffold_complete`.
- [x] Commit local docs-only creado.

---

## 13. ARCHIVOS DE REFERENCIA

| Archivo | Sección relevante |
|---------|-------------------|
| `docs/operations/A0_MIGRATION_PLAN.md` | Plan técnico completo: enfoque por bloque, riesgos, estructura del tema sombra |
| `docs/operations/ELEMENTOR_DEPENDENCY_AUDIT.md` | Widget-level audit: qué widgets Pro deben reemplazarse en cada template |
| `docs/operations/SERVER_FILESYSTEM_READONLY_DISCOVERY.md` | Filesystem real: functions.php, filtro-camisetas.php, offcanvas-menu.php leídos |
| `docs/operations/ACCESS_MODEL_NO_SSH.md` | Modelo de acceso. Cómo solicitar token cPanel temporal para Sesión 014 |
| `DECISIONS.md #DEC-10` | NO_SSH_SHADOW_RELEASE_FLOW. Restricciones absolutas. Canal de acceso aprobado. |
| `DECISIONS.md #DEC-9` | Application Password. DRAFT_ONLY. Revocación. |
| `DECISIONS.md #DEC-8` | Estrategia A0+B1 aprobada. Alternativas descartadas. |

---

*Documento creado en modo DOCS_ONLY / SCAFFOLD_PLAN / READ_ONLY.*  
*Ningún archivo PHP, CSS ni JS fue creado. Ningún acceso al servidor. Ninguna modificación al sitio WordPress.*  
*Ningún secreto ni credencial en este documento.*  
*Fecha: 2026-06-20 — Sesión 012 — Claude Code (Sonnet).*
