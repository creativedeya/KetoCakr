-- ============================================================
-- File: 44_INSERT_DECORATION_EQUIPMENT.sql
-- Project: KetoCakR | Date: 2026-04-07
-- Total: 39 rows (13 × 3 items)
-- ============================================================

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, size, essential)
SELECT id, 'Offset spatula', 'Палета за измазване', 1, NULL, true
FROM base_recipes WHERE recipe_role_id = 4;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, size, essential)
SELECT id, 'Cake turntable', 'Въртяща се поставка за торти', 1, NULL, false
FROM base_recipes WHERE recipe_role_id = 4;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, size, essential)
SELECT id, 'Piping bag with tips', 'Пош за шприцоване с накрайници', 1, NULL, false
FROM base_recipes WHERE recipe_role_id = 4;

-- Total: 39 rows