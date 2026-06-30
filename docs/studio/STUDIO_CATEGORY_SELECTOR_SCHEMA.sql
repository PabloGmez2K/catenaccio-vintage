-- ============================================================
-- CATENACCIO STUDIO — Category selector schema patch (S023E)
-- Sesion S023E - 2026-07-01
-- Estado: CANONICO - aplicar manualmente por Pablo en Supabase SQL Editor.
-- NO ejecutado por agentes. ADITIVO: solo ADD COLUMN, sin DROP/TRUNCATE/DELETE/UPDATE.
-- ============================================================
--
-- Anade el override explicito de categoria WooCommerce a la camiseta.
--   categoria          -> WC product category id (real de Woo, cacheado en wc_categories).
--                         NULL = sin override -> el bridge aplica la heuristica por liga
--                         (liga vacia -> Selecciones 148; con liga -> Otros Clubs 147).
--   categoria_display  -> nombre legible de la categoria (cache local, evita re-fetch a Woo),
--                         mismo patron que liga_display / equipo_display / jugador_display.
--
-- IMPORTANTE: aplicar este SQL ANTES de usar el formulario actualizado. El codigo de
-- guardado (createInventoryItem / updateInventoryItem) escribe estas columnas; si no existen,
-- el guardado de cualquier camiseta fallara con "column categoria does not exist".
--
-- No hay FOREIGN KEY a wc_categories (igual que equipo/liga no son FK a wc_terms): la caché
-- es vocabulario de WC y se valida en runtime contra wc_categories al guardar.

ALTER TABLE public.football_shirt_details
    ADD COLUMN IF NOT EXISTS categoria         INTEGER,
    ADD COLUMN IF NOT EXISTS categoria_display TEXT;

COMMENT ON COLUMN public.football_shirt_details.categoria IS
    'Override explicito de categoria WooCommerce (WC product category id). NULL = heuristica por liga. S023E.';
COMMENT ON COLUMN public.football_shirt_details.categoria_display IS
    'Nombre legible de la categoria seleccionada (cache local). S023E.';

-- Verificacion read-only (opcional, tras aplicar):
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'football_shirt_details'
--   AND column_name IN ('categoria', 'categoria_display');
