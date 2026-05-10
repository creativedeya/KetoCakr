-- ============================================================
-- File: 54_INSERT_ALL_BASE_EQUIPMENT.sql
-- Project: KetoCakR | Date: 2026-04-07
-- Description: Standard baking equipment for all 22 base recipes
-- Total: 4 items × 22 recipes = 88 rows
-- ============================================================

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, size, essential)
SELECT id, 'Electric mixer', 'Електрически миксер', 1, NULL, true
FROM base_recipes WHERE recipe_role_id = 1
UNION ALL
SELECT id, 'Baking pan', 'Форма за печене', 1, '18cm', true
FROM base_recipes WHERE recipe_role_id = 1
UNION ALL
SELECT id, 'Silicone spatula', 'Силиконова шпатула', 1, NULL, true
FROM base_recipes WHERE recipe_role_id = 1
UNION ALL
SELECT id, 'Parchment paper', 'Хартия за печене', 1, NULL, true
FROM base_recipes WHERE recipe_role_id = 1;

-- Expected: 88 rows
