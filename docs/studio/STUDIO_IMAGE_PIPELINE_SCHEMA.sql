-- ============================================================
-- CATENACCIO STUDIO — S026A Image Pipeline (local → Supabase Storage)
-- Sesión S026A — 2026-07-01
-- ============================================================
-- ADITIVO ÚNICAMENTE. Reutiliza la tabla `media_assets` ya existente
-- (creada en STUDIO_SUPABASE_SCHEMA_MVP.sql / S019, aplicada en Supabase
-- en S020D) en vez de crear una tabla nueva. `media_assets` ya tiene:
-- id, item_id (FK -> inventory_items ON DELETE CASCADE), workspace_id,
-- owner_id, filename, sort_order, is_primary, storage_bucket,
-- storage_path, public_url, wc_media_id, upload_status, created_at,
-- updated_at (+ trigger), y RLS owner-based (pol_media_assets_owner).
--
-- Esta migración solo añade lo que faltaba para S026A: mime_type y
-- size_bytes (validación de subida), un default de bucket, y un índice
-- único sobre storage_path (evita colisiones de path).
--
-- NO ejecutar contra Supabase remoto desde el agente. Pablo la aplica
-- manualmente en el SQL Editor.
-- ============================================================

ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS mime_type TEXT;
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS size_bytes BIGINT;

ALTER TABLE media_assets ALTER COLUMN storage_bucket SET DEFAULT 'studio-product-images';

CREATE UNIQUE INDEX IF NOT EXISTS idx_media_assets_storage_path
    ON media_assets(storage_path)
    WHERE storage_path IS NOT NULL;

-- RLS ya activa desde S020D (pol_media_assets_owner: auth.uid() = owner_id).
-- No se añade ninguna policy nueva — la existente ya cubre SELECT/INSERT/
-- UPDATE/DELETE (FOR ALL) sobre las filas propias del usuario.

-- Verificación manual sugerida tras aplicar:
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'media_assets' AND column_name IN ('mime_type','size_bytes');
-- SELECT column_default FROM information_schema.columns
--   WHERE table_name = 'media_assets' AND column_name = 'storage_bucket';
