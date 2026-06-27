-- CATENACCIO STUDIO - Supabase schema MVP verification
-- Session 020C - read-only checks for Supabase SQL Editor
--
-- Safe usage:
-- 1. Run docs/studio/STUDIO_SUPABASE_SCHEMA_MVP.sql first.
-- 2. Run this file in Supabase SQL Editor.
-- 3. Return only PASS/FAIL rows and error names if any. Do not paste secrets.

-- Expected tables and view.
WITH expected_objects(object_type, object_name) AS (
    VALUES
        ('table', 'workspaces'),
        ('table', 'inventory_items'),
        ('table', 'football_shirt_details'),
        ('table', 'ai_suggestions'),
        ('table', 'item_lifecycle_events'),
        ('table', 'media_assets'),
        ('view',  'inventory_margins')
),
actual_objects AS (
    SELECT table_type, table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
)
SELECT
    'objects' AS check_name,
    e.object_type,
    e.object_name,
    CASE
        WHEN e.object_type = 'table' AND a.table_type = 'BASE TABLE' THEN 'PASS'
        WHEN e.object_type = 'view' AND a.table_type = 'VIEW' THEN 'PASS'
        ELSE 'FAIL'
    END AS result
FROM expected_objects e
LEFT JOIN actual_objects a ON a.table_name = e.object_name
ORDER BY e.object_type, e.object_name;

-- Expected enums.
WITH expected_enums(enum_name) AS (
    VALUES
        ('item_status'),
        ('photo_status'),
        ('ai_suggestion_status'),
        ('wc_sync_status'),
        ('vinted_status'),
        ('sale_channel'),
        ('lifecycle_trigger')
),
actual_enums AS (
    SELECT t.typname AS enum_name
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typtype = 'e'
)
SELECT
    'enums' AS check_name,
    e.enum_name,
    CASE WHEN a.enum_name IS NOT NULL THEN 'PASS' ELSE 'FAIL' END AS result
FROM expected_enums e
LEFT JOIN actual_enums a ON a.enum_name = e.enum_name
ORDER BY e.enum_name;

-- RLS enabled on all expected tables.
WITH expected_tables(table_name) AS (
    VALUES
        ('workspaces'),
        ('inventory_items'),
        ('football_shirt_details'),
        ('ai_suggestions'),
        ('item_lifecycle_events'),
        ('media_assets')
)
SELECT
    'rls' AS check_name,
    e.table_name,
    CASE WHEN c.relrowsecurity THEN 'PASS' ELSE 'FAIL' END AS result
FROM expected_tables e
LEFT JOIN pg_class c ON c.relname = e.table_name
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'public'
WHERE c.relkind = 'r'
ORDER BY e.table_name;

-- Expected owner policies.
WITH expected_policies(table_name, policy_name) AS (
    VALUES
        ('workspaces', 'pol_workspaces_owner'),
        ('inventory_items', 'pol_inventory_items_owner'),
        ('football_shirt_details', 'pol_fsd_owner'),
        ('item_lifecycle_events', 'pol_lifecycle_events_owner'),
        ('ai_suggestions', 'pol_ai_suggestions_owner'),
        ('media_assets', 'pol_media_assets_owner')
)
SELECT
    'policies' AS check_name,
    e.table_name,
    e.policy_name,
    CASE WHEN p.policyname IS NOT NULL THEN 'PASS' ELSE 'FAIL' END AS result
FROM expected_policies e
LEFT JOIN pg_policies p
    ON p.schemaname = 'public'
   AND p.tablename = e.table_name
   AND p.policyname = e.policy_name
ORDER BY e.table_name;

-- Expected indexes count. Current canonical SQL creates 18 indexes.
SELECT
    'indexes' AS check_name,
    COUNT(*) AS actual_public_indexes,
    CASE WHEN COUNT(*) >= 18 THEN 'PASS' ELSE 'FAIL' END AS result
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%';
