-- ==========================================
-- CLEANUP SCRIPT - Remove Test Data
-- Date: 2026-03-31
-- Purpose: Clean test data before applying AI corrections
-- ==========================================

-- WARNING: This will delete ALL ready_recipes and user_recipes!
-- Make sure you have a backup before running this!

-- 1. Delete user_recipes (cascades to related tables if FK exists)
DELETE FROM user_recipes;

-- 2. Delete ready_recipes (cascades to related tables if FK exists)
DELETE FROM ready_recipes;

-- 3. Delete instruction steps for блатове (recipe_role_id = 1)
DELETE FROM recipe_instruction_steps
WHERE recipe_id IN (
  SELECT id FROM base_recipes WHERE recipe_role_id = 1
);

-- 4. Verify cleanup
SELECT 
  'user_recipes' as table_name,
  COUNT(*) as remaining_records
FROM user_recipes
UNION ALL
SELECT 
  'ready_recipes',
  COUNT(*)
FROM ready_recipes
UNION ALL
SELECT 
  'recipe_instruction_steps (блатове)',
  COUNT(*)
FROM recipe_instruction_steps ris
JOIN base_recipes br ON ris.recipe_id = br.id
WHERE br.recipe_role_id = 1;

-- Expected result: All counts should be 0

-- ==========================================
-- SUMMARY: Test data cleaned
-- ==========================================
