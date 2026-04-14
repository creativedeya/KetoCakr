-- ==========================================
-- BACKUP SCRIPT - KetoCakR Database
-- Date: 2026-03-31
-- Purpose: Backup before AI corrections update
-- ==========================================

-- 1. Backup base_recipes table
CREATE TABLE base_recipes_backup_20260331 AS 
SELECT * FROM base_recipes
WHERE recipe_role_id = 1; -- Only блатове (role_id = 1)

-- 2. Backup recipe_instruction_steps
CREATE TABLE recipe_instruction_steps_backup_20260331 AS 
SELECT ris.* 
FROM recipe_instruction_steps ris
JOIN base_recipes br ON ris.recipe_id = br.id
WHERE br.recipe_role_id = 1;

-- 3. Verify backups
SELECT 
  'base_recipes_backup_20260331' as table_name,
  COUNT(*) as record_count
FROM base_recipes_backup_20260331
UNION ALL
SELECT 
  'recipe_instruction_steps_backup_20260331',
  COUNT(*)
FROM recipe_instruction_steps_backup_20260331;

-- ==========================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ==========================================
-- To restore from backup:
-- 
-- DELETE FROM recipe_instruction_steps 
-- WHERE recipe_id IN (SELECT id FROM base_recipes WHERE recipe_role_id = 1);
-- 
-- DELETE FROM base_recipes WHERE recipe_role_id = 1;
-- 
-- INSERT INTO base_recipes 
-- SELECT * FROM base_recipes_backup_20260331;
-- 
-- INSERT INTO recipe_instruction_steps 
-- SELECT * FROM recipe_instruction_steps_backup_20260331;
-- ==========================================
