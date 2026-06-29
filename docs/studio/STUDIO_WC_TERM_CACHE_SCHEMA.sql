-- ============================================================
-- CATENACCIO STUDIO - WooCommerce term/category cache schema
-- Sesion S023A - 2026-06-29
-- Estado: CANONICO - aplicar manualmente por Pablo en Supabase SQL Editor.
-- NO ejecutado por agentes. Aditivo: no modifica tablas Studio existentes.
-- ============================================================

-- Fuente de verdad de identidad: WooCommerce.
-- Esta cache guarda IDs reales de Woo, no UUIDs inventados.

CREATE TABLE IF NOT EXISTS public.wc_taxonomies (
    id            INTEGER PRIMARY KEY, -- WooCommerce product attribute id
    slug          TEXT NOT NULL UNIQUE, -- pa_equipo, pa_liga, pa_ano, pa_jugador
    name          TEXT NOT NULL,
    label_studio  TEXT,
    type          TEXT,
    order_by      TEXT,
    has_archives  BOOLEAN,
    source        TEXT NOT NULL DEFAULT 'wc_sync'
                  CHECK (source IN ('wc_sync', 'studio_created')),
    synced_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    raw           JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.wc_terms (
    id             INTEGER PRIMARY KEY, -- WooCommerce term id
    taxonomy_id    INTEGER NOT NULL REFERENCES public.wc_taxonomies(id) ON DELETE RESTRICT,
    taxonomy_slug  TEXT NOT NULL,
    name           TEXT NOT NULL,
    slug           TEXT NOT NULL,
    count          INTEGER NOT NULL DEFAULT 0,
    source         TEXT NOT NULL DEFAULT 'wc_sync'
                   CHECK (source IN ('wc_sync', 'studio_created')),
    synced_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    raw            JSONB NOT NULL DEFAULT '{}',
    UNIQUE (taxonomy_id, slug)
);

CREATE TABLE IF NOT EXISTS public.wc_categories (
    id             INTEGER PRIMARY KEY, -- WooCommerce product category id
    name           TEXT NOT NULL,
    slug           TEXT NOT NULL UNIQUE,
    parent         INTEGER,
    count          INTEGER NOT NULL DEFAULT 0,
    description    TEXT,
    menu_order     INTEGER,
    is_curatorial  BOOLEAN NOT NULL DEFAULT FALSE,
    source         TEXT NOT NULL DEFAULT 'wc_sync'
                   CHECK (source IN ('wc_sync', 'studio_created')),
    synced_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    raw            JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_wc_terms_taxonomy_slug
    ON public.wc_terms(taxonomy_slug);

CREATE INDEX IF NOT EXISTS idx_wc_terms_taxonomy_id
    ON public.wc_terms(taxonomy_id);

CREATE INDEX IF NOT EXISTS idx_wc_categories_parent
    ON public.wc_categories(parent);

-- RLS: vocabulario compartido de Studio.
-- MVP internal-suite: cualquier usuario autenticado puede leer y disparar sync.
-- No se concede acceso a anon.

ALTER TABLE public.wc_taxonomies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wc_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wc_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pol_wc_taxonomies_authenticated_select ON public.wc_taxonomies;
DROP POLICY IF EXISTS pol_wc_taxonomies_authenticated_insert ON public.wc_taxonomies;
DROP POLICY IF EXISTS pol_wc_taxonomies_authenticated_update ON public.wc_taxonomies;
DROP POLICY IF EXISTS pol_wc_terms_authenticated_select ON public.wc_terms;
DROP POLICY IF EXISTS pol_wc_terms_authenticated_insert ON public.wc_terms;
DROP POLICY IF EXISTS pol_wc_terms_authenticated_update ON public.wc_terms;
DROP POLICY IF EXISTS pol_wc_categories_authenticated_select ON public.wc_categories;
DROP POLICY IF EXISTS pol_wc_categories_authenticated_insert ON public.wc_categories;
DROP POLICY IF EXISTS pol_wc_categories_authenticated_update ON public.wc_categories;

CREATE POLICY pol_wc_taxonomies_authenticated_select
    ON public.wc_taxonomies FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY pol_wc_taxonomies_authenticated_insert
    ON public.wc_taxonomies FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY pol_wc_taxonomies_authenticated_update
    ON public.wc_taxonomies FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY pol_wc_terms_authenticated_select
    ON public.wc_terms FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY pol_wc_terms_authenticated_insert
    ON public.wc_terms FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY pol_wc_terms_authenticated_update
    ON public.wc_terms FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY pol_wc_categories_authenticated_select
    ON public.wc_categories FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY pol_wc_categories_authenticated_insert
    ON public.wc_categories FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY pol_wc_categories_authenticated_update
    ON public.wc_categories FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE
    public.wc_taxonomies,
    public.wc_terms,
    public.wc_categories
TO authenticated;

-- Curatorial category hints known from S022C.5.
-- The S023A sync service marks Nuevo (22) and Leyendas (149) as curatorial.
--
-- UPDATE public.wc_categories
-- SET is_curatorial = TRUE
-- WHERE id IN (22, 149);
