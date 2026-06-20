<?php
// woocommerce/content-product.php — catenaccio-a0-child
// Ítem del grid. Reemplaza loop-items 878/354/720/892 de Elementor Pro.
// Se mantienen clases WooCommerce estándar (products > li.product) para
// compatibilidad con el AJAX del plugin filtro-camisetas.
// Sesión 013 — 2026-06-20
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
