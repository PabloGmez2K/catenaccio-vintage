<?php
/**
 * functions.php — catenaccio-a0-child (tema sombra A0)
 *
 * IMPLEMENTACIÓN PARCIAL — Sesión 013 — 2026-06-20
 *
 * Estrategia aprobada: APPROVE_MINIMAL_PORT
 * Solo funciones críticas A0. NO es copia del functions.php del tema activo.
 * NO usar require_once del functions.php completo del activo (riesgo doble hooks).
 *
 * ============================================================================
 * BLOCKERS PENDIENTES — requieren código exacto del functions.php del activo
 * ============================================================================
 *
 *   BLOCKER-A  woocommerce_package_rates — IVA 21% en envío
 *              RIESGO FISCAL CRÍTICO. NO activar en producción sin esto.
 *              Solución: Pablo sube functions.php del activo al repo o lo pega en sesión 013b.
 *              Buscar: add_filter('woocommerce_package_rates', ...)
 *
 *   BLOCKER-B  woocommerce_product_post_type_args + add_rewrite_rule()
 *              URLs limpias /[slug]/ en lugar de /producto/[slug]/
 *              El activo usa sistema complejo (reglas top + catch-all + transient).
 *              Sin este hook: URLs funcionan como /producto/[slug]/ — no 404, pero URL diferente.
 *              Solución: código exacto del activo. Completar en sesión 013b.
 *
 *   BLOCKER-C  woocommerce_get_breadcrumb (×2) — breadcrumbs personalizados
 *              Sin esto: WooCommerce usa breadcrumbs nativos (funcionales, sin personalización).
 *              No es blocker de funcionalidad. Completar en sesión 013b.
 *
 *   BLOCKER-D  pre_get_posts — carrusel home solo en stock
 *              Sin esto: carrusel puede mostrar productos agotados.
 *              No es blocker de ventas. Completar en sesión 013b.
 *
 * ============================================================================
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
//
// NOTA: Las implementaciones marcadas con "MINIMAL" usan los campos ACF y
// taxonomías documentados en SERVER_FILESYSTEM_READONLY_DISCOVERY.md.
// El comportamiento exacto del tema activo puede diferir visualmente.
// Completar en sesión 013b con el código exacto del functions.php del activo.
// =============================================================================

// [cv_product_meta] — talla, medidas, condición y defectos (campos ACF)
// IMPLEMENTACIÓN MINIMAL — campos documentados: talla, medida_axila, medida_largo, condicion, defectos
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
// IMPLEMENTACIÓN MINIMAL — fallback a WooCommerce short description o excerpt.
// La versión exacta del activo puede incluir formato ACF adicional.
// Completar en sesión 013b con código exacto.
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
// IMPLEMENTACIÓN MINIMAL — basada en taxonomías conocidas (pa_equipo, pa_liga, pa_ano).
// La versión exacta del activo puede incluir taxonomías adicionales (pa_jugador, pa_talla, pa_marca).
// Completar en sesión 013b con código exacto.
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
// IMPLEMENTACIÓN MINIMAL — usa descripción del término de taxonomía.
// La versión exacta del activo puede leer textos desde ACF options o campos custom.
// Completar en sesión 013b con código exacto.
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
// 4. BLOCKERS — NO IMPLEMENTADOS EN ESTA SESIÓN
// Ver comentarios de bloque al inicio de este archivo.
// =============================================================================

/*
 * BLOCKER-A: woocommerce_package_rates (IVA 21% envío) — SESIÓN 013b
 * BLOCKER-B: woocommerce_product_post_type_args (URLs sin /producto/) — SESIÓN 013b
 * BLOCKER-C: woocommerce_get_breadcrumb (breadcrumbs personalizados) — SESIÓN 013b
 * BLOCKER-D: pre_get_posts (carrusel home en stock) — SESIÓN 013b
 */
