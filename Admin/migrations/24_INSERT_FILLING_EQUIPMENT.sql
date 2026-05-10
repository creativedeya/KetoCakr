-- ============================================================
-- File: 24_INSERT_FILLING_EQUIPMENT.sql
-- Project: KetoCakR | Date: 2026-04-06
-- Description: Generic equipment for all 23 filling recipes
-- Total: 115 rows
-- ============================================================

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, size, essential)
SELECT id, 'Saucepan', 'Касерола', 1, 'medium', true
FROM base_recipes WHERE recipe_role_id = 3;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, size, essential)
SELECT id, 'Mixing bowl', 'Купа за смесване', 2, 'medium', true
FROM base_recipes WHERE recipe_role_id = 3;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, size, essential)
SELECT id, 'Whisk', 'Телена бъркалка', 1, NULL, true
FROM base_recipes WHERE recipe_role_id = 3;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, size, essential)
SELECT id, 'Silicone spatula', 'Силиконова шпатула', 1, NULL, true
FROM base_recipes WHERE recipe_role_id = 3;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, size, essential)
SELECT id, 'Freezing molds', 'Форми за замразяване', 2, '14-16cm', true
FROM base_recipes WHERE recipe_role_id = 3;

-- Total: 115 rows inserted