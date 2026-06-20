<?php
// woocommerce/single-product.php — catenaccio-a0-child
// Reemplaza template 100 de Elementor Pro ("Plantilla producto individual").
// WooCommerce detecta este archivo automáticamente al activar el tema.
// Sesión 013 — 2026-06-20
defined('ABSPATH') || exit;

get_header();
?>
<main class="cv-product-page" id="main">
<?php
while (have_posts()) :
    the_post();
    global $product;
?>

  <div class="cv-product-layout">

    <!-- Columna izquierda: breadcrumbs + galería -->
    <div class="cv-product-gallery">
      <?php woocommerce_breadcrumb(); ?>
      <?php woocommerce_show_product_images(); ?>
    </div>

    <!-- Columna derecha: información del producto -->
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

    </div><!-- .cv-product-info -->

  </div><!-- .cv-product-layout -->

  <div class="cv-product-description">
    <?php woocommerce_template_single_description(); ?>
  </div>

<?php endwhile; ?>
</main>
<?php
get_footer();
