-- ============================================================
-- CATENACCIO STUDIO - Verify WooCommerce term/category cache
-- Sesion S023A - run manually in Supabase SQL Editor after sync.
-- Read-only verifier.
-- ============================================================

WITH required_taxonomies AS (
    SELECT * FROM (VALUES
        (4, 'pa_equipo'),
        (5, 'pa_liga'),
        (6, 'pa_jugador'),
        (7, 'pa_ano')
    ) AS t(id, slug)
),
term_counts AS (
    SELECT taxonomy_slug, count(*)::integer AS row_count
    FROM public.wc_terms
    GROUP BY taxonomy_slug
),
checks AS (
    SELECT
        'wc_taxonomies_required_4_5_6_7' AS check_name,
        CASE
            WHEN count(*) = 4 THEN 'PASS'
            ELSE 'FAIL'
        END AS status,
        'found=' || count(*)::text || '/4' AS details
    FROM required_taxonomies r
    JOIN public.wc_taxonomies t
      ON t.id = r.id AND t.slug = r.slug

    UNION ALL

    SELECT
        'wc_terms_pa_equipo_has_rows',
        CASE WHEN COALESCE(max(row_count), 0) > 0 THEN 'PASS' ELSE 'FAIL' END,
        'count=' || COALESCE(max(row_count), 0)::text
    FROM term_counts
    WHERE taxonomy_slug = 'pa_equipo'

    UNION ALL

    SELECT
        'wc_terms_pa_ano_has_rows',
        CASE WHEN COALESCE(max(row_count), 0) > 0 THEN 'PASS' ELSE 'FAIL' END,
        'count=' || COALESCE(max(row_count), 0)::text
    FROM term_counts
    WHERE taxonomy_slug = 'pa_ano'

    UNION ALL

    SELECT
        'wc_terms_pa_liga_has_rows',
        CASE WHEN COALESCE(max(row_count), 0) > 0 THEN 'PASS' ELSE 'FAIL' END,
        'count=' || COALESCE(max(row_count), 0)::text
    FROM term_counts
    WHERE taxonomy_slug = 'pa_liga'

    UNION ALL

    SELECT
        'wc_terms_pa_jugador_check',
        CASE WHEN COALESCE(max(row_count), 0) >= 0 THEN 'PASS' ELSE 'FAIL' END,
        'count=' || COALESCE(max(row_count), 0)::text || ' (0 is acceptable if Woo currently has no players)'
    FROM term_counts
    WHERE taxonomy_slug = 'pa_jugador'

    UNION ALL

    SELECT
        'wc_categories_has_rows',
        CASE WHEN count(*) > 0 THEN 'PASS' ELSE 'FAIL' END,
        'count=' || count(*)::text
    FROM public.wc_categories

    UNION ALL

    SELECT
        'known_term_real_madrid_70',
        CASE
            WHEN EXISTS (
                SELECT 1 FROM public.wc_terms
                WHERE id = 70
                  AND taxonomy_slug = 'pa_equipo'
                  AND lower(name) = 'real madrid'
            )
            THEN 'PASS' ELSE 'FAIL'
        END,
        'expected pa_equipo Real Madrid -> 70'

    UNION ALL

    SELECT
        'known_term_fc_barcelona_170',
        CASE
            WHEN EXISTS (
                SELECT 1 FROM public.wc_terms
                WHERE id = 170
                  AND taxonomy_slug = 'pa_equipo'
                  AND lower(name) = 'fc barcelona'
            )
            THEN 'PASS' ELSE 'FAIL'
        END,
        'expected pa_equipo FC Barcelona -> 170'

    UNION ALL

    SELECT
        'known_term_2014_15_139',
        CASE
            WHEN EXISTS (
                SELECT 1 FROM public.wc_terms
                WHERE id = 139
                  AND taxonomy_slug = 'pa_ano'
                  AND name = '2014-15'
            )
            THEN 'PASS' ELSE 'FAIL'
        END,
        'expected pa_ano 2014-15 -> 139'
)
SELECT check_name, status, details
FROM checks
ORDER BY check_name;
