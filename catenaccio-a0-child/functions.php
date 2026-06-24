<?php
/**
 * functions.php — catenaccio-a0-child (tema sombra A0)
 *
 * IMPLEMENTACIÓN COMPLETA — Sesión 013b — 2026-06-24
 *
 * Estrategia: APPROVE_MINIMAL_PORT + CPANEL_UAPI_READONLY
 * Código de blockers portado desde functions.php activo (read-only UAPI).
 * NO usar require_once del functions.php completo del activo (riesgo doble hooks).
 */

defined('ABSPATH') || exit;

// =============================================================================
// 1. ASSETS DEL TEMA SOMBRA
// =============================================================================

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

// =============================================================================
// 2. REGISTRO DE MENÚ DE NAVEGACIÓN
// =============================================================================

function cv_a0_register_menus() {
    register_nav_menus([
        'primary' => __('Menú Principal', 'catenaccio-a0-child'),
    ]);
}
add_action('after_setup_theme', 'cv_a0_register_menus');

// =============================================================================
// 3. SHORTCODES A0
//
// Guard: solo registrar si no existen ya. En WordPress solo un tema está activo,
// por lo que los shortcodes del child activo no estarán disponibles cuando
// este tema sombra esté activo.
// =============================================================================

// [cv_product_meta] — talla, medidas, condición y defectos (campos ACF)
if (!shortcode_exists('cv_product_meta')) {
    function cv_a0_product_meta_shortcode($atts) {
        if (!function_exists('get_field')) {
            return '';
        }
        $talla     = get_field('talla');
        $axila     = get_field('medida_axila');
        $largo     = get_field('medida_largo');
        $condicion = get_field('condicion');
        $defectos  = get_field('defectos');

        if (!$talla && !$axila && !$largo && !$condicion && !$defectos) {
            return '';
        }

        $html = '<div class="cv-product-meta-box">';
        if ($talla)     $html .= '<p class="cv-meta__row"><span class="cv-meta__label">Talla:</span> <span class="cv-meta__value">' . esc_html($talla) . '</span></p>';
        if ($axila)     $html .= '<p class="cv-meta__row"><span class="cv-meta__label">Medida axila-axila:</span> <span class="cv-meta__value">' . esc_html($axila) . ' cm</span></p>';
        if ($largo)     $html .= '<p class="cv-meta__row"><span class="cv-meta__label">Largo:</span> <span class="cv-meta__value">' . esc_html($largo) . ' cm</span></p>';
        if ($condicion) $html .= '<p class="cv-meta__row"><span class="cv-meta__label">Condición:</span> <span class="cv-meta__value">' . esc_html($condicion) . '</span></p>';
        if ($defectos)  $html .= '<p class="cv-meta__row cv-meta__row--defectos"><span class="cv-meta__label">Defectos:</span> <span class="cv-meta__value">' . esc_html($defectos) . '</span></p>';
        $html .= '</div>';

        return $html;
    }
    add_shortcode('cv_product_meta', 'cv_a0_product_meta_shortcode');
}

// [cv_short_description] — descripción corta dinámica desde ACF
if (!shortcode_exists('cv_short_description')) {
    function cv_a0_short_description_shortcode($atts) {
        global $product;
        if (!is_a($product, 'WC_Product')) {
            $product = wc_get_product(get_the_ID());
        }
        if (!$product) {
            return '';
        }
        $desc = $product->get_short_description();
        if (!$desc) {
            $desc = get_the_excerpt();
        }
        return $desc ? '<div class="cv-short-description">' . wp_kses_post($desc) . '</div>' : '';
    }
    add_shortcode('cv_short_description', 'cv_a0_short_description_shortcode');
}

// [cv_explorar] — links a colecciones relacionadas por equipo/liga/año
if (!shortcode_exists('cv_explorar')) {
    function cv_a0_explorar_shortcode($atts) {
        $post_id = get_the_ID();
        if (!$post_id) {
            return '';
        }

        $taxonomies = [
            'pa_equipo' => 'Más de',
            'pa_liga'   => 'Más de',
            'pa_ano'    => 'Temporada',
        ];

        $links = [];
        foreach ($taxonomies as $tax => $prefix) {
            $terms = get_the_terms($post_id, $tax);
            if ($terms && !is_wp_error($terms)) {
                foreach ($terms as $term) {
                    $url = get_term_link($term);
                    if (!is_wp_error($url)) {
                        $links[] = '<a href="' . esc_url($url) . '" class="cv-explorar__link">'
                                 . esc_html($prefix . ' ' . $term->name)
                                 . '</a>';
                    }
                }
            }
        }

        if (!$links) {
            return '';
        }

        return '<div class="cv-explorar">'
             . '<p class="cv-explorar__title">Explorar colección</p>'
             . '<div class="cv-explorar__links">' . implode('', $links) . '</div>'
             . '</div>';
    }
    add_shortcode('cv_explorar', 'cv_a0_explorar_shortcode');
}

// [cv_archive_title] — H1 SEO dinámico en archivos de taxonomía
// IMPLEMENTACIÓN MINIMAL — usa objetos WC nativos de consulta.
if (!shortcode_exists('cv_archive_title')) {
    function cv_a0_archive_title_shortcode($atts) {
        if (is_shop()) {
            $title = get_option('woocommerce_shop_page_title') ?: __('Tienda', 'catenaccio-a0-child');
        } elseif (is_product_taxonomy()) {
            $term  = get_queried_object();
            $title = ($term && isset($term->name)) ? $term->name : woocommerce_page_title(false);
        } elseif (is_search()) {
            $title = sprintf(__('Resultados: &ldquo;%s&rdquo;', 'catenaccio-a0-child'), esc_html(get_search_query()));
        } else {
            $title = woocommerce_page_title(false);
        }

        return $title ? '<h1 class="cv-archive-title">' . wp_kses_post($title) . '</h1>' : '';
    }
    add_shortcode('cv_archive_title', 'cv_a0_archive_title_shortcode');
}

// [cv_archive_intro] — intro SEO con toggle Ver más/Ver menos
if (!shortcode_exists('cv_archive_intro')) {
    function cv_a0_archive_intro_shortcode($atts) {
        if (!is_product_taxonomy()) {
            return '';
        }
        $term = get_queried_object();
        if (!$term || empty($term->description)) {
            return '';
        }
        $desc = $term->description;
        $id   = 'cv-intro-' . esc_attr($term->term_id);

        return '<div class="cv-archive-intro">'
             . '<div class="cv-archive-intro__text" id="' . $id . '">' . wp_kses_post($desc) . '</div>'
             . '<button class="cv-archive-intro__toggle" data-target="' . $id . '" aria-expanded="false">'
             . esc_html__('Ver más', 'catenaccio-a0-child')
             . '</button>'
             . '</div>';
    }
    add_shortcode('cv_archive_intro', 'cv_a0_archive_intro_shortcode');
}

// =============================================================================
// 4. BLOCKER-A — IVA 21% EN ENVÍO (woocommerce_package_rates)
// Código exacto del functions.php activo — portado sesión 013b UAPI read-only
// RIESGO FISCAL CRÍTICO: desglosa IVA 21% incluido en el coste de envío.
// =============================================================================

add_filter( 'woocommerce_package_rates', function( $rates ) {
    $tax_rate = 0.21;

    foreach ( $rates as $rate_key => $rate ) {
        if ( $rate->cost > 0 ) {
            $price_incl_tax = floatval( $rate->cost );
            $price_excl_tax = round( $price_incl_tax / ( 1 + $tax_rate ), 6 );
            $tax_amount     = round( $price_incl_tax - $price_excl_tax, 6 );

            $rate->cost  = $price_excl_tax;
            $rate->taxes = array_map( function() use ( $tax_amount ) {
                return $tax_amount;
            }, $rate->taxes ?: [ 1 => 0 ] );
        }
    }

    return $rates;
}, 10, 1 );

// =============================================================================
// 5. BLOCKER-B — URLs LIMPIAS (categorías + productos)
// Sistema: transient 12h + reglas top + catch-all + flush diferido + CDN purge
// Código exacto del functions.php activo — portado sesión 013b UAPI read-only
// =============================================================================

// Helper: slugs de páginas especiales WooCommerce (caché estática por request)
function get_woocommerce_special_pages() {
    static $special_pages = null;
    if ( $special_pages !== null ) {
        return $special_pages;
    }

    $wc_page_options = array(
        'woocommerce_shop_page_id',
        'woocommerce_cart_page_id',
        'woocommerce_checkout_page_id',
        'woocommerce_myaccount_page_id',
        'woocommerce_terms_page_id',
    );

    $special_pages = array();
    foreach ( $wc_page_options as $option ) {
        $page_id = get_option( $option );
        if ( $page_id ) {
            $page = get_post( $page_id );
            if ( $page ) {
                $special_pages[] = $page->post_name;
            }
        }
    }

    $extra         = array( 'elementor_library', 'admin', 'wp-admin', 'wp-content', 'wp-includes' );
    $special_pages = array_merge( $special_pages, $extra );

    return $special_pages;
}

// URLs limpias: categorías de producto (transient 12h + reglas top)
add_filter( 'term_link', 'custom_remove_category_base', 10, 3 );
function custom_remove_category_base( $url, $term, $taxonomy ) {
    if ( $taxonomy === 'product_cat' ) {
        $url = str_replace( '/categoria-producto/', '/', $url );
    }
    return $url;
}

add_action( 'init', 'custom_rewrite_product_cat_slug', 10 );
function custom_rewrite_product_cat_slug() {
    $slugs = get_transient( 'cv_product_cat_slugs' );

    if ( $slugs === false ) {
        $slugs = get_terms( array(
            'taxonomy'   => 'product_cat',
            'hide_empty' => false,
            'fields'     => 'slugs',
        ) );
        if ( ! is_array( $slugs ) ) {
            $slugs = array();
        }
        set_transient( 'cv_product_cat_slugs', $slugs, 12 * HOUR_IN_SECONDS );
    }

    $special_pages = get_woocommerce_special_pages();

    foreach ( $slugs as $slug ) {
        if ( ! in_array( $slug, $special_pages, true ) ) {
            add_rewrite_rule(
                '^' . preg_quote( $slug, '#' ) . '/?$',
                'index.php?product_cat=' . $slug,
                'top'
            );
            add_rewrite_rule(
                '^' . preg_quote( $slug, '#' ) . '/page/([0-9]+)/?$',
                'index.php?product_cat=' . $slug . '&paged=$matches[1]',
                'top'
            );
        }
    }
}

// Invalidar transient de categorías al crearlas o editarlas
add_action( 'created_product_cat', 'cv_invalidate_product_cat_cache' );
add_action( 'edited_product_cat',  'cv_invalidate_product_cat_cache' );
function cv_invalidate_product_cat_cache() {
    delete_transient( 'cv_product_cat_slugs' );
    wp_schedule_single_event( time() + 1, 'delayed_flush_rewrite_rules' );
}

// URLs limpias: productos individuales (reglas top + catch-all bottom)
add_filter( 'woocommerce_product_post_type_args', 'remove_product_slug', 10, 1 );
function remove_product_slug( $args ) {
    $args['rewrite']['slug'] = '';
    return $args;
}

add_action( 'init', 'custom_remove_product_slug_rewrite_rules' );
function custom_remove_product_slug_rewrite_rules() {
    $special_pages = get_woocommerce_special_pages();
    $slugs         = get_transient( 'cv_product_slugs' );

    if ( $slugs === false ) {
        $product_ids = get_posts( array(
            'post_type'   => 'product',
            'post_status' => 'publish',
            'numberposts' => -1,
            'fields'      => 'ids',
        ) );

        $slugs = array();
        foreach ( $product_ids as $id ) {
            $p = get_post( $id );
            if ( $p && $p->post_name ) {
                $slugs[] = $p->post_name;
            }
        }

        set_transient( 'cv_product_slugs', $slugs, 12 * HOUR_IN_SECONDS );
    }

    foreach ( $slugs as $slug ) {
        if ( ! in_array( $slug, $special_pages, true ) ) {
            add_rewrite_rule(
                '^' . preg_quote( $slug, '#' ) . '/?$',
                'index.php?product=' . $slug,
                'top'
            );
        }
    }

    $excluded = implode( '|', array_map( 'preg_quote', $special_pages ) );
    if ( ! empty( $excluded ) ) {
        add_rewrite_rule(
            '^(?!' . $excluded . ')([^/]+)/?$',
            'index.php?product=$matches[1]',
            'bottom'
        );
    }
}

function cv_invalidate_product_slugs_cache() {
    delete_transient( 'cv_product_slugs' );
}

// Modificar enlaces de productos (quitar /producto/ de permalinks)
add_filter( 'post_type_link', 'custom_remove_product_base_from_links', 10, 3 );
function custom_remove_product_base_from_links( $permalink, $post, $leavename ) {
    if ( $post->post_type !== 'product' || $post->post_status !== 'publish' ) {
        return $permalink;
    }
    $special_pages = get_woocommerce_special_pages();
    if ( in_array( $post->post_name, $special_pages, true ) ) {
        return $permalink;
    }
    return home_url( '/' . $post->post_name . '/' );
}

// Flush diferido (no flush en cada init)
add_action( 'delayed_flush_rewrite_rules', function() {
    flush_rewrite_rules( false );
} );

// Publicar producto nuevo: invalidar cache + reconstruir reglas + flush + purge CDN
add_action( 'transition_post_status', function( $new_status, $old_status, $post ) {
    if ( $post->post_type === 'product' && $new_status === 'publish' && $old_status !== 'publish' ) {
        cv_invalidate_product_slugs_cache();
        custom_remove_product_slug_rewrite_rules();
        flush_rewrite_rules( false );
        do_action( 'litespeed_purge_all' );
    }
}, 10, 3 );

// Compatibilidad Elementor editor
add_action( 'elementor/editor/before_enqueue_scripts', 'ensure_elementor_compatibility' );
function ensure_elementor_compatibility() {
    global $post;
    if ( $post ) {
        $special_pages = get_woocommerce_special_pages();
        if ( in_array( $post->post_name, $special_pages, true ) ) {
            remove_filter( 'post_type_link', 'custom_remove_product_base_from_links', 10 );
        }
    }
}

// Al activar el tema: flush completo + invalida todos los transients
add_action( 'after_switch_theme', 'custom_flush_rewrite_rules' );
function custom_flush_rewrite_rules() {
    delete_transient( 'cv_product_cat_slugs' );
    cv_invalidate_product_slugs_cache();
    flush_rewrite_rules( false );
}

// Evitar que WordPress regenere # BEGIN WordPress en .htaccess
add_filter( 'flush_rewrite_rules_hard', '__return_false' );

// =============================================================================
// 6. BLOCKER-C — BREADCRUMBS PERSONALIZADOS (×2)
// Código exacto del functions.php activo — portado sesión 013b UAPI read-only
// =============================================================================

// Breadcrumbs: renombrar taxonomías en páginas de archivo
function cv_woo_breadcrumbs_fix_tax_labels( $crumbs, $breadcrumb ) {
    if ( ! is_tax( array( 'pa_equipo', 'pa_liga', 'pa_jugador', 'pa_ano', 'pa_talla', 'pa_marca' ) ) ) {
        return $crumbs;
    }

    $term = get_queried_object();
    if ( ! $term instanceof WP_Term ) {
        return $crumbs;
    }

    $rename = array(
        'pa_equipo'  => 'Equipos',
        'pa_liga'    => 'Ligas',
        'pa_jugador' => 'Jugadores',
        'pa_ano'     => 'Temporadas',
        'pa_talla'   => 'Tallas',
        'pa_marca'   => 'Marcas',
    );

    $tax = $term->taxonomy;

    if ( ! isset( $rename[ $tax ] ) ) {
        return $crumbs;
    }

    if ( isset( $crumbs[1] ) ) {
        $crumbs[1][0] = $rename[ $tax ];
    }

    return $crumbs;
}
add_filter( 'woocommerce_get_breadcrumb', 'cv_woo_breadcrumbs_fix_tax_labels', 10, 2 );

// Breadcrumbs: productos individuales — lógica Catenaccio
function cv_custom_single_product_breadcrumb( $crumbs, $breadcrumb ) {
    if ( ! is_product() ) {
        return $crumbs;
    }

    $product_id = get_the_ID();
    if ( ! $product_id ) {
        return $crumbs;
    }

    $find_term_by_slug = function( $terms, $slug ) {
        if ( empty( $terms ) || is_wp_error( $terms ) ) {
            return null;
        }
        foreach ( $terms as $term ) {
            if ( isset( $term->slug ) && $term->slug === $slug ) {
                return $term;
            }
        }
        return null;
    };

    $product_cats  = wp_get_post_terms( $product_id, 'product_cat' );
    $liga_terms    = wp_get_post_terms( $product_id, 'pa_liga' );
    $equipo_terms  = wp_get_post_terms( $product_id, 'pa_equipo' );

    $has_liga   = ! empty( $liga_terms )   && ! is_wp_error( $liga_terms );
    $has_equipo = ! empty( $equipo_terms ) && ! is_wp_error( $equipo_terms );

    $leyendas_cat    = $find_term_by_slug( $product_cats, 'leyendas' );
    $selecciones_cat = $find_term_by_slug( $product_cats, 'selecciones-nacionales' );

    $new_crumbs = array();
    if ( ! empty( $crumbs[0] ) ) {
        $new_crumbs[] = $crumbs[0];
    }

    $last = end( $crumbs );
    if ( ! $last ) {
        return $crumbs;
    }

    // Prioridad 1: Leyendas → Inicio / Leyendas / Producto
    if ( $leyendas_cat instanceof WP_Term ) {
        $new_crumbs[] = array( esc_html( $leyendas_cat->name ), get_term_link( $leyendas_cat ) );
        $new_crumbs[] = $last;
        return $new_crumbs;
    }

    // Prioridad 2: Selecciones → Inicio / Selecciones / (Equipo) / Producto
    if ( $selecciones_cat instanceof WP_Term ) {
        $new_crumbs[] = array( esc_html( $selecciones_cat->name ), get_term_link( $selecciones_cat ) );
        if ( $has_equipo ) {
            $equipo       = $equipo_terms[0];
            $new_crumbs[] = array( esc_html( $equipo->name ), get_term_link( $equipo ) );
        }
        $new_crumbs[] = $last;
        return $new_crumbs;
    }

    // Prioridad 3: Clubes → Inicio / Liga / Equipo / Producto
    if ( $has_liga && $has_equipo ) {
        $liga         = $liga_terms[0];
        $new_crumbs[] = array( esc_html( $liga->name ), get_term_link( $liga ) );
        $equipo       = $equipo_terms[0];
        $new_crumbs[] = array( esc_html( $equipo->name ), get_term_link( $equipo ) );
        $new_crumbs[] = $last;
        return $new_crumbs;
    }

    // Fallback: breadcrumbs nativos WooCommerce
    return $crumbs;
}
add_filter( 'woocommerce_get_breadcrumb', 'cv_custom_single_product_breadcrumb', 20, 2 );

// =============================================================================
// 7. BLOCKER-D — CARRUSEL HOME: solo productos en stock
// pre_get_posts intercepta queries Elementor Loop (woocommerce_product_query no lo hace)
// Código exacto del functions.php activo — portado sesión 013b UAPI read-only
// =============================================================================

add_action( 'pre_get_posts', function( $query ) {
    if ( is_admin() || ! is_front_page() ) {
        return;
    }
    if ( $query->get( 'post_type' ) !== 'product' ) {
        return;
    }
    $meta_query   = $query->get( 'meta_query' ) ?: [];
    $meta_query[] = [
        'key'     => '_stock_status',
        'value'   => 'instock',
        'compare' => '=',
    ];
    $query->set( 'meta_query', $meta_query );
} );

// =============================================================================
// 8. RANK MATH SEO
// Código exacto del functions.php activo — portado sesión 013b UAPI read-only
// =============================================================================

add_filter( 'rank_math/frontend/description', function( $desc ) {
    return do_shortcode( $desc );
} );

add_filter( 'rank_math/opengraph/image', 'cv_og_product_image', 10, 2 );
function cv_og_product_image( $image, $object ) {
    if ( ! is_product() ) {
        return $image;
    }
    $product_id   = get_the_ID();
    $thumbnail_id = get_post_thumbnail_id( $product_id );
    if ( ! $thumbnail_id ) {
        return $image;
    }
    $img = wp_get_attachment_image_src( $thumbnail_id, 'full' );
    if ( $img && ! empty( $img[0] ) ) {
        return $img[0];
    }
    return $image;
}

// =============================================================================
// 9. BÚSQUEDA (header) — AJAX + shortcode + script
// Código exacto del functions.php activo — portado sesión 013b UAPI read-only
// =============================================================================

add_action( 'wp_ajax_cv_search_products',        'cv_ajax_search_products' );
add_action( 'wp_ajax_nopriv_cv_search_products', 'cv_ajax_search_products' );

function cv_ajax_search_products() {
    $term = isset( $_POST['term'] ) ? sanitize_text_field( wp_unslash( $_POST['term'] ) ) : '';

    if ( strlen( $term ) < 2 ) {
        wp_send_json_success( array(
            'products'   => array(),
            'categories' => array(),
        ) );
    }

    $query = new WP_Query( array(
        'post_type'           => 'product',
        'post_status'         => 'publish',
        'posts_per_page'      => 4,
        's'                   => $term,
        'ignore_sticky_posts' => true,
    ) );

    $products   = array();
    $categories = array();

    if ( $query->have_posts() ) {
        while ( $query->have_posts() ) {
            $query->the_post();

            $product_id = get_the_ID();
            $product    = wc_get_product( $product_id );

            $image_url = get_the_post_thumbnail_url( $product_id, 'woocommerce_thumbnail' );
            if ( ! $image_url ) {
                $image_url = wc_placeholder_img_src();
            }

            $price_html = $product ? $product->get_price_html() : '';

            $cats     = wp_get_post_terms( $product_id, 'product_cat' );
            $cat_name = '';
            if ( ! empty( $cats ) && ! is_wp_error( $cats ) ) {
                $cat_name = $cats[0]->name;
            }

            $liga_terms   = wp_get_post_terms( $product_id, 'pa_liga' );
            $equipo_terms = wp_get_post_terms( $product_id, 'pa_equipo' );

            $liga_name   = ( ! empty( $liga_terms )   && ! is_wp_error( $liga_terms ) )   ? $liga_terms[0]->name   : '';
            $equipo_name = ( ! empty( $equipo_terms ) && ! is_wp_error( $equipo_terms ) ) ? $equipo_terms[0]->name : '';

            $category_path = '';
            if ( $liga_name && $equipo_name ) {
                $category_path = 'Ligas / ' . $liga_name . ' / ' . $equipo_name;
            } elseif ( $cat_name ) {
                $category_path = $cat_name;
            }

            if ( $category_path && ! in_array( $category_path, $categories, true ) ) {
                $categories[] = $category_path;
            }

            $products[] = array(
                'id'        => $product_id,
                'title'     => get_the_title(),
                'permalink' => get_permalink(),
                'image'     => $image_url,
                'category'  => $cat_name,
                'price'     => wp_strip_all_tags( $price_html ),
            );
        }

        wp_reset_postdata();
    }

    wp_send_json_success( array(
        'products'   => $products,
        'categories' => $categories,
    ) );
}

// Shortcode: últimos productos para el popup de búsqueda
if ( ! shortcode_exists( 'cv_search_latest_products' ) ) {
    function cv_search_latest_products_shortcode() {
        $query = new WP_Query( array(
            'post_type'      => 'product',
            'post_status'    => 'publish',
            'posts_per_page' => 4,
            'orderby'        => 'date',
            'order'          => 'DESC',
        ) );

        ob_start();

        if ( $query->have_posts() ) {
            while ( $query->have_posts() ) {
                $query->the_post();

                $product_id = get_the_ID();
                $product    = wc_get_product( $product_id );

                $image_url = get_the_post_thumbnail_url( $product_id, 'woocommerce_thumbnail' );
                if ( ! $image_url ) {
                    $image_url = wc_placeholder_img_src();
                }

                $cats     = wp_get_post_terms( $product_id, 'product_cat' );
                $cat_name = ( ! empty( $cats ) && ! is_wp_error( $cats ) ) ? $cats[0]->name : '';

                $price_html = $product ? $product->get_price_html() : '';
                $price_text = $price_html ? wp_strip_all_tags( $price_html ) : '';
                ?>
                <a class="cv-search-result-item" href="<?php echo esc_url( get_permalink() ); ?>">
                    <img src="<?php echo esc_url( $image_url ); ?>" alt="">
                    <div class="cv-search-result-text">
                        <div class="cv-search-result-title"><?php echo esc_html( get_the_title() ); ?></div>
                        <?php if ( $cat_name ) : ?>
                            <div class="cv-search-result-meta"><?php echo esc_html( 'en ' . $cat_name ); ?></div>
                        <?php endif; ?>
                        <?php if ( $price_text ) : ?>
                            <div class="cv-search-result-price"><?php echo esc_html( $price_text ); ?></div>
                        <?php endif; ?>
                    </div>
                </a>
                <?php
            }
            wp_reset_postdata();
        }

        return ob_get_clean();
    }
    add_shortcode( 'cv_search_latest_products', 'cv_search_latest_products_shortcode' );
}

// Encolar JS del buscador + URL de AJAX
function cv_enqueue_search_script() {
    if ( is_admin() ) {
        return;
    }
    wp_enqueue_script(
        'cv-search',
        get_stylesheet_directory_uri() . '/js/cv-search.js',
        array( 'jquery' ),
        '1.0',
        true
    );
    wp_localize_script( 'cv-search', 'cvSearchData', array(
        'ajax_url' => admin_url( 'admin-ajax.php' ),
    ) );
}
add_action( 'wp_enqueue_scripts', 'cv_enqueue_search_script' );
