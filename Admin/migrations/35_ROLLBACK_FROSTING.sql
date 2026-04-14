-- ============================================================
-- File: 35_ROLLBACK_FROSTING.sql
-- Project: KetoCakR | Date: 2026-04-07
-- Description: Rollback all frosting recipe data (recipe_role_id = 2)
-- ============================================================

DELETE FROM recipe_equipment
WHERE recipe_id IN (SELECT id FROM base_recipes WHERE recipe_role_id = 2);

DELETE FROM lab_notes
WHERE recipe_id IN (SELECT id FROM base_recipes WHERE recipe_role_id = 2);

DELETE FROM recipe_instruction_steps
WHERE recipe_id IN (SELECT id FROM base_recipes WHERE recipe_role_id = 2);

DELETE FROM recipe_ingredients
WHERE recipe_id IN (SELECT id FROM base_recipes WHERE recipe_role_id = 2);

DELETE FROM base_recipes WHERE recipe_role_id = 2;

-- Verify (all should be 0)
SELECT 'base_recipes' AS table_name, COUNT(*) AS remaining FROM base_recipes WHERE recipe_role_id = 2
UNION ALL
SELECT 'recipe_instruction_steps', COUNT(*) FROM recipe_instruction_steps
  WHERE recipe_id IN (SELECT id FROM base_recipes WHERE recipe_role_id = 2)
UNION ALL
SELECT 'lab_notes', COUNT(*) FROM lab_notes
  WHERE recipe_id IN (SELECT id FROM base_recipes WHERE recipe_role_id = 2)
UNION ALL
SELECT 'recipe_equipment', COUNT(*) FROM recipe_equipment
  WHERE recipe_id IN (SELECT id FROM base_recipes WHERE recipe_role_id = 2)
UNION ALL
SELECT 'recipe_ingredients', COUNT(*) FROM recipe_ingredients
  WHERE recipe_id IN (SELECT id FROM base_recipes WHERE recipe_role_id = 2);

-- Expected: All counts = 0
