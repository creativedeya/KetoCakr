-- ==========================================
-- EMERGENCY ROLLBACK SCRIPT
-- Date: 2026-04-02
-- Purpose: Restore database to state before migration
-- ==========================================

-- ⚠️ WARNING: This will DELETE all new data!
-- Only use if migration failed and you need to restore.

-- PREREQUISITES:
-- 1. Backup tables exist (base_recipes_backup_20260331, etc.)
-- 2. You want to completely undo the migration

-- ==========================================
-- STEP 1: DELETE NEW DATA
-- ==========================================

-- Delete lab notes
DELETE FROM lab_notes;

-- Delete equipment
DELETE FROM recipe_equipment;

-- Delete instruction steps for блатове
DELETE FROM recipe_instruction_steps 
WHERE recipe_id IN (
  SELECT id FROM base_recipes WHERE recipe_role_id = 1
);

-- Delete all блатове (recipe_role_id = 1)
DELETE FROM base_recipes WHERE recipe_role_id = 1;

-- Verify deletion
SELECT 
  'After deletion' as status,
  (SELECT COUNT(*) FROM base_recipes WHERE recipe_role_id = 1) as base_recipes_count,
  (SELECT COUNT(*) FROM lab_notes) as lab_notes_count,
  (SELECT COUNT(*) FROM recipe_equipment) as equipment_count;

-- ==========================================
-- STEP 2: RESTORE FROM BACKUP
-- ==========================================

-- Restore base_recipes
INSERT INTO base_recipes 
SELECT * FROM base_recipes_backup_20260331;

-- Restore instruction steps
INSERT INTO recipe_instruction_steps 
SELECT * FROM recipe_instruction_steps_backup_20260331;

-- Verify restoration
SELECT 
  'After restoration' as status,
  (SELECT COUNT(*) FROM base_recipes WHERE recipe_role_id = 1) as base_recipes_count,
  (SELECT COUNT(*) FROM recipe_instruction_steps) as instruction_steps_count;

-- Expected results:
-- base_recipes_count: 10 (original count before migration)
-- instruction_steps_count: X (whatever was there before)

-- ==========================================
-- STEP 3: CLEANUP BACKUP TABLES (OPTIONAL)
-- ==========================================

-- Only run this if you're sure you don't need the backups anymore!
-- Uncomment to execute:

-- DROP TABLE IF EXISTS base_recipes_backup_20260331;
-- DROP TABLE IF EXISTS recipe_instruction_steps_backup_20260331;

-- ==========================================
-- STEP 4: DROP NEW TABLES (OPTIONAL)
-- ==========================================

-- If you want to completely remove lab_notes and recipe_equipment tables:
-- Uncomment to execute:

-- DROP TABLE IF EXISTS lab_notes;
-- DROP TABLE IF EXISTS recipe_equipment;

-- ==========================================
-- FINAL VERIFICATION
-- ==========================================

SELECT 
  'ROLLBACK COMPLETE' as status,
  'Base recipes restored to original state' as message,
  (SELECT COUNT(*) FROM base_recipes WHERE recipe_role_id = 1) as total_recipes;

-- ==========================================
-- NOTES
-- ==========================================

-- If rollback was successful, you should see:
-- - 10 base_recipes (original count)
-- - 0 lab_notes
-- - 0 recipe_equipment
-- - Original instruction_steps restored

-- You can now re-run the migration from scratch if needed.

-- ==========================================
