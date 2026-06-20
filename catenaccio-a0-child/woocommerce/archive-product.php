<?php
// woocommerce/archive-product.php — catenaccio-a0-child
// Reemplaza template 129 de Elementor Pro ("Archivo de Productos — Loop + Filtro").
// Se aplica a: shop, categorías de producto, resultados de búsqueda de producto.
// Sesión 013 — 2026-06-20
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

    <!-- Sidebar: filtros por taxonomía -->
    <aside class="cv-archive-sidebar" aria-label="<?php esc_attr_e('Filtros', 'catenaccio-a0-child'); ?>">
      <?php echo do_shortcode('[filtro_taxonomico slug="pa_liga" titulo="Liga"]'); ?>
      <?php echo do_shortcode('[filtro_taxonomico slug="pa_equipo" titulo="Equipo"]'); ?>
      <?php echo do_shortcode('[filtro_taxonomico slug="pa_talla" titulo="Talla"]'); ?>
      <?php echo do_shortcode('[filtro_taxonomico slug="pa_condicion" titulo="Condición"]'); ?>
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

    </div><!-- .cv-archive-products -->

  </div><!-- .cv-archive-layout -->

</main>
<?php
get_footer();
