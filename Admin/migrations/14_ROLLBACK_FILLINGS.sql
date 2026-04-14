-- ============================================================
-- File: 14_ROLLBACK_FILLINGS.sql
-- Project: KetoCakR
-- Date: 2026-04-06
-- Description: Rollback all data for filling recipes (recipe_role_id = 3)
-- ============================================================

-- Step 1: Delete equipment
DELETE FROM recipe_equipment
WHERE recipe_id IN (SELECT id FROM base_recipes WHERE recipe_role_id = 3);

-- Step 2: Delete lab notes
DELETE FROM lab_notes
WHERE recipe_id IN (SELECT id FROM base_recipes WHERE recipe_role_id = 3);

-- Step 3: Delete instruction steps
DELETE FROM recipe_instruction_steps
WHERE recipe_id IN (SELECT id FROM base_recipes WHERE recipe_role_id = 3);

-- Step 4: Delete base recipes
DELETE FROM base_recipes WHERE recipe_role_id = 3;

-- Step 5: Verify deletion
SELECT
  'base_recipes' AS table_name,
  COUNT(*) AS remaining_records
FROM base_recipes WHERE recipe_role_id = 3
UNION ALL
SELECT 'recipe_instruction_steps', COUNT(*)
FROM recipe_instruction_steps ris
JOIN base_recipes br ON ris.recipe_id = br.id
WHERE br.recipe_role_id = 3
UNION ALL
SELECT 'lab_notes', COUNT(*)
FROM lab_notes ln
JOIN base_recipes br ON ln.recipe_id = br.id
WHERE br.recipe_role_id = 3
UNION ALL
SELECT 'recipe_equipment', COUNT(*)
FROM recipe_equipment re2
JOIN base_recipes br ON re2.recipe_id = br.id
WHERE br.recipe_role_id = 3;

-- Expected: All counts = 0
