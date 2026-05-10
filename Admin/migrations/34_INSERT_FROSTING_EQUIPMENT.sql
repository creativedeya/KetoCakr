-- ============================================================
-- File: 34_INSERT_FROSTING_EQUIPMENT.sql
-- Project: KetoCakR | Date: 2026-04-07
-- Total: 52 rows (13 recipes × 4 items)
-- ============================================================

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, size, essential)
SELECT id, 'Electric mixer', 'Електрически миксер', 1, NULL, true
FROM base_recipes WHERE recipe_role_id = 2;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, size, essential)
SELECT id, 'Mixing bowl', 'Купа за смесване', 2, 'medium', true
FROM base_recipes WHERE recipe_role_id = 2;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, size, essential)
SELECT id, 'Silicone spatula', 'Силиконова шпатула', 1, NULL, true
FROM base_recipes WHERE recipe_role_id = 2;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, size, essential)
SELECT id, 'Piping bag', 'Пош за шприцоване', 1, NULL, true
FROM base_recipes WHERE recipe_role_id = 2;

-- Total: 52 rows