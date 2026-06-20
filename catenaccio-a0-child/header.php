<?php
// header.php — catenaccio-a0-child
// Header nativo A0. Reemplaza template 653 de Elementor Pro.
// Componentes: logo, nav primary, mini-cart WC, toggle off-canvas, panel off-canvas, backdrop.
defined('ABSPATH') || exit;
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php if (function_exists('wp_body_open')) wp_body_open(); ?>

<header class="cv-header" role="banner">
  <div class="cv-header__inner">

    <!-- Logo -->
    <div class="cv-header__logo">
      <?php
      if (function_exists('the_custom_logo') && has_custom_logo()) {
          the_custom_logo();
      } else {
          echo '<a href="' . esc_url(home_url('/')) . '" class="cv-header__site-name">' . esc_html(get_bloginfo('name')) . '</a>';
      }
      ?>
    </div>

    <!-- Navegación principal (desktop) -->
    <nav class="cv-header__nav" aria-label="<?php esc_attr_e('Navegación principal', 'catenaccio-a0-child'); ?>">
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

    <!-- Acciones: mini-cart + toggle off-canvas -->
    <div class="cv-header__actions">

      <?php if (class_exists('WooCommerce')) : ?>
      <div class="cv-mini-cart" id="cv-mini-cart">
        <?php woocommerce_mini_cart(); ?>
      </div>
      <?php endif; ?>

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

<!-- Panel off-canvas (contenido: plugin catenaccio-offcanvas-menu) -->
<div
  class="cv-offcanvas-panel"
  id="cv-offcanvas-panel"
  aria-hidden="true"
  role="dialog"
  aria-label="<?php esc_attr_e('Menú de categorías', 'catenaccio-a0-child'); ?>"
>
  <div class="cv-offcanvas-panel__inner">
    <button
      class="cv-offcanvas-close"
      aria-label="<?php esc_attr_e('Cerrar menú', 'catenaccio-a0-child'); ?>"
      type="button"
    >&times;</button>

    <?php
    if (shortcode_exists('catenaccio_offcanvas_menu')) {
        echo do_shortcode('[catenaccio_offcanvas_menu show_leagues="yes" show_sizes="yes" show_players="yes"]');
    } else {
        echo '<p style="padding:16px">' . esc_html__('Menú de categorías no disponible.', 'catenaccio-a0-child') . '</p>';
    }
    ?>
  </div>
</div>

<!-- Backdrop (cierra el panel al hacer click) -->
<div class="cv-offcanvas-backdrop" id="cv-offcanvas-backdrop" aria-hidden="true"></div>
