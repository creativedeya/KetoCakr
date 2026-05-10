-- ==========================================
-- ROLLBACK SCRIPT - Emergency Restore
-- Date: 2026-04-02
-- Purpose: Restore database if migration fails
-- ==========================================

-- ⚠️ WARNING: This will DELETE all current data and restore from backup!
-- Only run this if something went wrong with the migration!

-- ==========================================
-- STEP 1: Delete current data
-- ==========================================

-- Delete lab notes
DELETE FROM lab_notes 
WHERE recipe_id IN (SELECT id FROM base_recipes WHERE recipe_role_id = 1);

-- Delete equipment
DELETE FROM recipe_equipment 
WHERE recipe_id IN (SELECT id FROM base_recipes WHERE recipe_role_id = 1);

-- Delete instruction steps
DELETE FROM recipe_instruction_steps 
WHERE recipe_id IN (SELECT id FROM base_recipes WHERE recipe_role_id = 1);

-- Delete user recipes (if any)
DELETE FROM user_recipes;

-- Delete ready recipes (if any)
DELETE FROM ready_recipes;

-- Delete base recipes (блатове only)
DELETE FROM base_recipes WHERE recipe_role_id = 1;

-- ==========================================
-- STEP 2: Restore from backup
-- ==========================================

-- Restore base_recipes
INSERT INTO base_recipes 
SELECT * FROM base_recipes_backup_20260331;

-- Restore instruction steps
INSERT INTO recipe_instruction_steps 
SELECT * FROM recipe_instruction_steps_backup_20260331;

-- ==========================================
-- STEP 3: Verify restore
-- ==========================================

SELECT 
  'base_recipes' as table_name,
  COUNT(*) as restored_records
FROM base_recipes WHERE recipe_role_id = 1
UNION ALL
SELECT 
  'recipe_instruction_steps',
  COUNT(*)
FROM recipe_instruction_steps ris
JOIN base_recipes br ON ris.recipe_id = br.id
WHERE br.recipe_role_id = 1;

-- ==========================================
-- ROLLBACK COMPLETE
-- Database restored to pre-migration state
-- ==========================================
