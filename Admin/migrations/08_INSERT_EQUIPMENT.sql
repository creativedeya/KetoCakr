-- ==========================================
-- INSERT EQUIPMENT - 126 Items for 16 Recipes
-- Date: 2026-04-02
-- Purpose: Insert all equipment data
-- ==========================================

-- Delete existing equipment to avoid duplicates
DELETE FROM recipe_equipment;


-- ==========================================
-- ПАНДИШПАНОВ БЛАТ (8 items)
-- ==========================================
INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'stand_mixer_or_hand_mixer', 'миксер (статичен или ръчен)', 1, true, '', '', true, 'For beating egg whites to stiff peaks', 1
FROM base_recipes WHERE name = 'Пандишпанов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'mixing_bowl', 'купа за смесване', 3, true, 'medium', '', true, 'One for dry ingredients, one for yolks, one for whites', 2
FROM base_recipes WHERE name = 'Пандишпанов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'silicone_spatula', 'силиконова шпатула', 1, true, '', '', true, 'For folding technique', 3
FROM base_recipes WHERE name = 'Пандишпанов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'fine_mesh_sieve', 'фино сито', 1, true, '', '', true, 'For sifting dry ingredients twice', 4
FROM base_recipes WHERE name = 'Пандишпанов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'cake_pan_ring', 'форма за торта (ринг)', 1, false, '', '18cm diameter', true, 'Do not grease sides - batter must climb', 5
FROM base_recipes WHERE name = 'Пандишпанов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'parchment_paper', 'хартия за печене', 1, false, '', '', true, '', 6
FROM base_recipes WHERE name = 'Пандишпанов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'cooling_rack', 'решетка за охлаждане', 1, true, '', '', true, 'For upside-down cooling trick', 7
FROM base_recipes WHERE name = 'Пандишпанов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'whisk', 'телена бъркалка', 1, true, '', '', false, 'Optional for breaking lumps', 8
FROM base_recipes WHERE name = 'Пандишпанов блат' AND recipe_role_id = 1;


-- ==========================================
-- БАЗОВ МАСЛЕН БЛАТ (6 items)
-- ==========================================
INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'stand_mixer_or_hand_mixer', 'миксер', 1, true, '', '', true, 'For creaming butter and sugar', 9
FROM base_recipes WHERE name = 'Базов маслен блат за торта' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'mixing_bowl', 'купа за смесване', 2, true, 'medium', '', true, '', 10
FROM base_recipes WHERE name = 'Базов маслен блат за торта' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'silicone_spatula', 'силиконова шпатула', 1, true, '', '', true, '', 11
FROM base_recipes WHERE name = 'Базов маслен блат за торта' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'whisk', 'телена бъркалка', 1, true, '', '', false, '', 12
FROM base_recipes WHERE name = 'Базов маслен блат за торта' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'cake_pan', 'форма за торта', 2, false, '', '18cm round or 1 large', true, '', 13
FROM base_recipes WHERE name = 'Базов маслен блат за торта' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'parchment_paper', 'хартия за печене', 1, false, '', '', true, '', 14
FROM base_recipes WHERE name = 'Базов маслен блат за торта' AND recipe_role_id = 1;


-- ==========================================
-- КОКОСОВ БЛАТ (7 items)
-- ==========================================
INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'stand_mixer_or_hand_mixer', 'миксер', 1, true, '', '', true, '', 15
FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'mixing_bowl', 'купа за смесване', 3, true, 'medium', '', true, 'Clean dry bowl critical for egg whites', 16
FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'silicone_spatula', 'силиконова шпатула', 1, true, '', '', true, '', 17
FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'fine_mesh_sieve', 'фино сито', 1, true, '', '', true, 'For sifting xanthan gum', 18
FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'cake_pan', 'форма за торта', 2, false, '', '18cm diameter', true, '', 19
FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'parchment_paper', 'хартия за печене', 1, false, '', '', true, '', 20
FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'aluminum_foil', 'алуминиево фолио', 1, false, '', '', true, 'For wrapping after cooling', 21
FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1;


-- ==========================================
-- БЛАТ ВАНИЛИЯ (7 items)
-- ==========================================
INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'stand_mixer_or_hand_mixer', 'миксер', 1, true, '', '', true, '', 22
FROM base_recipes WHERE name = 'Блат ванилия' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'mixing_bowl', 'купа за смесване', 3, true, 'medium', '', true, '', 23
FROM base_recipes WHERE name = 'Блат ванилия' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'silicone_spatula', 'силиконова шпатула', 1, true, '', '', true, '', 24
FROM base_recipes WHERE name = 'Блат ванилия' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'whisk', 'телена бъркалка', 1, true, '', '', true, 'For mixing dry ingredients', 25
FROM base_recipes WHERE name = 'Блат ванилия' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'cake_pan', 'форма за торта', 2, false, '', '18cm diameter', true, '', 26
FROM base_recipes WHERE name = 'Блат ванилия' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'parchment_paper', 'хартия за печене', 1, false, '', '', true, '', 27
FROM base_recipes WHERE name = 'Блат ванилия' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'aluminum_foil', 'алуминиево фолио', 1, false, '', '', true, 'For 2-hour refrigeration wrap', 28
FROM base_recipes WHERE name = 'Блат ванилия' AND recipe_role_id = 1;


-- ==========================================
-- ЛИМОНОВ БЛАТ (9 items)
-- ==========================================
INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'stand_mixer_or_hand_mixer', 'миксер', 1, true, '', '', true, 'Not blender - must be mixer', 29
FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'mixing_bowl', 'купа за смесване', 3, true, 'medium', '', true, '', 30
FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'silicone_spatula', 'силиконова шпатула', 1, true, '', '', true, '', 31
FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'fine_mesh_sieve', 'фино сито', 1, true, '', '', true, '', 32
FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'microplane_zester', 'ренде за цитруси', 1, true, '', '', true, 'For lemon zest - yellow part only', 33
FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'citrus_juicer', 'цитрус преса', 1, true, '', '', false, 'For fresh lemon juice', 34
FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'cake_pan', 'форма за торта', 2, false, '', '18cm diameter', true, '', 35
FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'parchment_paper', 'хартия за печене', 1, false, '', '', true, '', 36
FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'aluminum_foil', 'алуминиево фолио', 1, false, '', '', true, 'To preserve lemon aroma', 37
FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1;


-- ==========================================
-- БЛАТ ЗА МОРКОВЕНА ТОРТА (11 items)
-- ==========================================
INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'stand_mixer_or_hand_mixer', 'миксер', 1, true, '', '', true, '', 38
FROM base_recipes WHERE name = 'Блат за морковена торта' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'mixing_bowl', 'купа за смесване', 3, true, 'medium', '', true, '', 39
FROM base_recipes WHERE name = 'Блат за морковена торта' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'box_grater', 'ренде', 1, true, '', '', true, 'Fine side for carrots', 40
FROM base_recipes WHERE name = 'Блат за морковена торта' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'clean_kitchen_towel', 'чиста кухненска кърпа', 1, true, '', '', true, 'For squeezing excess moisture from carrots', 41
FROM base_recipes WHERE name = 'Блат за морковена торта' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'silicone_spatula', 'силиконова шпатула', 1, true, '', '', true, '', 42
FROM base_recipes WHERE name = 'Блат за морковена торта' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'fine_mesh_sieve', 'фино сито', 1, true, '', '', true, '', 43
FROM base_recipes WHERE name = 'Блат за морковена торта' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'knife', 'нож', 1, true, '', '', true, 'For chopping nuts', 44
FROM base_recipes WHERE name = 'Блат за морковена торта' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'cake_pan', 'форма за торта', 2, false, '', '18cm diameter', true, '', 45
FROM base_recipes WHERE name = 'Блат за морковена торта' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'parchment_paper', 'хартия за печене', 1, false, '', '', true, '', 46
FROM base_recipes WHERE name = 'Блат за морковена торта' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'wooden_skewer', 'дървено шишче', 1, true, '', '', true, 'For doneness test', 47
FROM base_recipes WHERE name = 'Блат за морковена торта' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'aluminum_foil', 'алуминиево фолио', 1, false, '', '', true, 'For 12-hour refrigeration', 48
FROM base_recipes WHERE name = 'Блат за морковена торта' AND recipe_role_id = 1;


-- ==========================================
-- МАСЛЕН МОРКОВЕН БЛАТ (10 items)
-- ==========================================
INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'stand_mixer_or_hand_mixer', 'миксер', 1, true, '', '', true, '', 49
FROM base_recipes WHERE name = 'Морковен блат 1' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'mixing_bowl', 'купа за смесване', 2, true, 'medium', '', true, '', 50
FROM base_recipes WHERE name = 'Морковен блат 1' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'box_grater', 'ренде', 1, true, '', '', true, 'Fine side for 300g carrots', 51
FROM base_recipes WHERE name = 'Морковен блат 1' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'clean_kitchen_towel', 'чиста кухненска кърпа', 1, true, '', '', true, 'Critical for squeezing moisture', 52
FROM base_recipes WHERE name = 'Морковен блат 1' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'silicone_spatula', 'силиконова шпатула', 1, true, '', '', true, '', 53
FROM base_recipes WHERE name = 'Морковен блат 1' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'knife', 'нож', 1, true, '', '', true, 'For chopping 100g nuts coarsely', 54
FROM base_recipes WHERE name = 'Морковен блат 1' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'cake_pan', 'форма за торта', 2, false, '', '18cm diameter with parchment', true, '', 55
FROM base_recipes WHERE name = 'Морковен блат 1' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'parchment_paper', 'хартия за печене', 1, false, '', '', true, '', 56
FROM base_recipes WHERE name = 'Морковен блат 1' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'wooden_skewer', 'дървено шишче', 1, true, '', '', true, '', 57
FROM base_recipes WHERE name = 'Морковен блат 1' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'aluminum_foil', 'алуминиево фолио', 1, false, '', '', true, 'For 4-6 hour refrigeration', 58
FROM base_recipes WHERE name = 'Морковен блат 1' AND recipe_role_id = 1;


-- ==========================================
-- МАТЧА ПАНДИШПАН (6 items)
-- ==========================================
INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'stand_mixer_or_hand_mixer', 'миксер', 1, true, '', '', true, '', 59
FROM base_recipes WHERE name = 'Блат с чай матча' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'mixing_bowl', 'купа за смесване', 3, true, 'medium', '', true, '', 60
FROM base_recipes WHERE name = 'Блат с чай матча' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'silicone_spatula', 'силиконова шпатула', 1, true, '', '', true, '', 61
FROM base_recipes WHERE name = 'Блат с чай матча' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'fine_mesh_sieve', 'фино сито', 1, true, '', '', true, 'Must sift matcha TWICE to remove clumps', 62
FROM base_recipes WHERE name = 'Блат с чай матча' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'cake_pan', 'форма за торта', 2, false, '', '18cm diameter', true, '', 63
FROM base_recipes WHERE name = 'Блат с чай матча' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'parchment_paper', 'хартия за печене', 1, false, '', '', true, '', 64
FROM base_recipes WHERE name = 'Блат с чай матча' AND recipe_role_id = 1;


-- ==========================================
-- ШОКОЛАДОВ ПАНДИШПАН (8 items)
-- ==========================================
INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'stand_mixer_or_hand_mixer', 'миксер', 1, true, '', '', true, '', 65
FROM base_recipes WHERE name = 'Шоколадов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'mixing_bowl', 'купа за смесване', 3, true, 'medium', '', true, '', 66
FROM base_recipes WHERE name = 'Шоколадов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'silicone_spatula', 'силиконова шпатула', 1, true, '', '', true, '', 67
FROM base_recipes WHERE name = 'Шоколадов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'fine_mesh_sieve', 'фино сито', 1, true, '', '', true, 'Sift cocoa at least twice for aeration', 68
FROM base_recipes WHERE name = 'Шоколадов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'cake_pan', 'форма за торта', 2, false, '', '18cm diameter', true, '', 69
FROM base_recipes WHERE name = 'Шоколадов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'parchment_paper', 'хартия за печене', 1, false, '', '', true, '', 70
FROM base_recipes WHERE name = 'Шоколадов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'wooden_toothpick', 'дървена клечка за зъби', 1, true, '', '', true, 'For checking doneness - better 1 min early than late', 71
FROM base_recipes WHERE name = 'Шоколадов блат' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'aluminum_foil', 'алуминиево фолио', 1, false, '', '', true, 'Aroma develops after refrigeration', 72
FROM base_recipes WHERE name = 'Шоколадов блат' AND recipe_role_id = 1;


-- ==========================================
-- ЧЕРВЕНО КАДИФЕ (7 items)
-- ==========================================
INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'stand_mixer_or_hand_mixer', 'миксер', 1, true, '', '', true, '', 73
FROM base_recipes WHERE name = 'Блат Червено кадифе' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'mixing_bowl', 'купа за смесване', 3, true, 'medium', '', true, '', 74
FROM base_recipes WHERE name = 'Блат Червено кадифе' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'silicone_spatula', 'силиконова шпатула', 1, true, '', '', true, '', 75
FROM base_recipes WHERE name = 'Блат Червено кадифе' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'fine_mesh_sieve', 'фино сито', 1, true, '', '', true, '', 76
FROM base_recipes WHERE name = 'Блат Червено кадифе' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'measuring_spoon', 'мерителна лъжичка', 1, true, '', '', true, 'For precise cocoa measurement - max 10g', 77
FROM base_recipes WHERE name = 'Блат Червено кадифе' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'cake_pan', 'форма за торта', 2, false, '', '18cm diameter', true, '', 78
FROM base_recipes WHERE name = 'Блат Червено кадифе' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'parchment_paper', 'хартия за печене', 1, false, '', '', true, '', 79
FROM base_recipes WHERE name = 'Блат Червено кадифе' AND recipe_role_id = 1;


-- ==========================================
-- БРАУНИ (7 items)
-- ==========================================
INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'stand_mixer_or_hand_mixer', 'миксер', 1, true, '', '', true, '', 80
FROM base_recipes WHERE name = 'Брауни' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'mixing_bowl', 'купа за смесване', 2, true, 'medium', '', true, '', 81
FROM base_recipes WHERE name = 'Брауни' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'silicone_spatula', 'силиконова шпатула', 1, true, '', '', true, '', 82
FROM base_recipes WHERE name = 'Брауни' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'fine_mesh_sieve', 'фино сито', 1, true, '', '', true, '', 83
FROM base_recipes WHERE name = 'Брауни' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'small_saucepan', 'малка тенджера', 1, true, '', '', false, 'For boiling water or coffee', 84
FROM base_recipes WHERE name = 'Брауни' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'cake_pan', 'форма за торта', 1, false, '', '18cm diameter with parchment bottom only', true, '', 85
FROM base_recipes WHERE name = 'Брауни' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'parchment_paper', 'хартия за печене', 1, false, '', '', true, '', 86
FROM base_recipes WHERE name = 'Брауни' AND recipe_role_id = 1;


-- ==========================================
-- ФРЕНСКА ЦЕЛУВКА (DACQUOISE) (7 items)
-- ==========================================
INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'stand_mixer_or_hand_mixer', 'миксер', 1, true, '', '', true, '', 87
FROM base_recipes WHERE name = 'Блат Френски Меренг' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'mixing_bowl', 'купа за смесване', 1, true, 'large', '', true, 'Must be perfectly clean and dry', 88
FROM base_recipes WHERE name = 'Блат Френски Меренг' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'silicone_spatula', 'силиконова шпатула', 1, true, '', '', true, '', 89
FROM base_recipes WHERE name = 'Блат Френски Меренг' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'knife', 'нож', 1, true, '', '', true, 'For finely chopping nuts (not flour)', 90
FROM base_recipes WHERE name = 'Блат Френски Меренг' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'parchment_paper', 'хартия за печене', 1, false, '', '', true, 'Chef trick - trace circles and flip over', 91
FROM base_recipes WHERE name = 'Блат Френски Меренг' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'pencil_or_pen', 'молив или химикал', 1, true, '', '', true, 'For tracing 3 circles on parchment', 92
FROM base_recipes WHERE name = 'Блат Френски Меренг' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'baking_sheet', 'тава за печене', 1, true, '', '', true, '', 93
FROM base_recipes WHERE name = 'Блат Френски Меренг' AND recipe_role_id = 1;


-- ==========================================
-- БЛАТ ЗА БАДЕМОВА ТОРТА АЛА ИКЕА (7 items)
-- ==========================================
INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'stand_mixer_or_hand_mixer', 'миксер', 1, true, '', '', true, '', 94
FROM base_recipes WHERE name = 'Блат за бадемова торта ала Икеа' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'mixing_bowl', 'купа за смесване', 2, true, 'medium', '', true, 'One clean and dry for egg whites', 95
FROM base_recipes WHERE name = 'Блат за бадемова торта ала Икеа' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'silicone_spatula', 'силиконова шпатула', 1, true, '', '', true, 'NEVER use mixer - only spatula for folding', 96
FROM base_recipes WHERE name = 'Блат за бадемова торта ала Икеа' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'whisk', 'телена бъркалка', 1, true, '', '', true, 'For mixing almond flour with xanthan', 97
FROM base_recipes WHERE name = 'Блат за бадемова торта ала Икеа' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'cake_pan', 'форма за торта', 2, false, '', '18cm diameter', true, '', 98
FROM base_recipes WHERE name = 'Блат за бадемова торта ала Икеа' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'parchment_paper', 'хартия за печене', 1, false, '', '', true, '', 99
FROM base_recipes WHERE name = 'Блат за бадемова торта ала Икеа' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'cooling_rack', 'решетка за охлаждане', 1, true, '', '', true, 'Delicate when warm - handle carefully', 100
FROM base_recipes WHERE name = 'Блат за бадемова торта ала Икеа' AND recipe_role_id = 1;


-- ==========================================
-- БЛАТ ЗА ТОРТА ГАРАШ (7 items)
-- ==========================================
INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'stand_mixer_or_hand_mixer', 'миксер', 1, true, '', '', true, '', 101
FROM base_recipes WHERE name = 'Блат за торта Гараш' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'mixing_bowl', 'купа за смесване', 1, true, 'large', '', true, 'Must be clean and dry', 102
FROM base_recipes WHERE name = 'Блат за торта Гараш' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'silicone_spatula', 'силиконова шпатула', 1, true, '', '', true, 'Large spatula for gentle folding', 103
FROM base_recipes WHERE name = 'Блат за торта Гараш' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'food_processor_or_nut_grinder', 'кухненски робот или мелничка за ядки', 1, true, '', '', true, 'For grinding 200g walnuts finely but dry', 104
FROM base_recipes WHERE name = 'Блат за торта Гараш' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'parchment_paper', 'хартия за печене', 1, false, '', '', true, 'Trace circles method - mandatory for thin layers', 105
FROM base_recipes WHERE name = 'Блат за торта Гараш' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'pencil_or_pen', 'молив или химикал', 1, true, '', '', true, 'For tracing 5 thin circles or 2-3 thick', 106
FROM base_recipes WHERE name = 'Блат за торта Гараш' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'baking_sheet', 'тава за печене', 2, true, '', '', true, 'May need 2 sheets for 5 layers', 107
FROM base_recipes WHERE name = 'Блат за торта Гараш' AND recipe_role_id = 1;


-- ==========================================
-- БРАУНИ БЛАТ (9 items)
-- ==========================================
INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'mixing_bowl', 'купа за смесване', 2, true, 'medium', '', true, '', 108
FROM base_recipes WHERE name = 'Брауни блат за торта' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'double_boiler_or_microwave', 'водна баня или микровълнова', 1, true, '', '', true, 'For melting butter and chocolate', 109
FROM base_recipes WHERE name = 'Брауни блат за торта' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'whisk', 'телена бъркалка', 1, true, '', '', true, 'For mixing yolks into chocolate', 110
FROM base_recipes WHERE name = 'Брауни блат за торта' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'stand_mixer_or_hand_mixer', 'миксер', 1, true, '', '', true, 'For egg whites to soft peaks only', 111
FROM base_recipes WHERE name = 'Брауни блат за торта' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'silicone_spatula', 'силиконова шпатула', 1, true, '', '', true, 'For gentle folding', 112
FROM base_recipes WHERE name = 'Брауни блат за торта' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'cake_pan', 'форма за торта', 1, false, '', '18cm diameter, parchment on bottom and sides', true, '', 113
FROM base_recipes WHERE name = 'Брауни блат за торта' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'parchment_paper', 'хартия за печене', 1, false, '', '', true, '', 114
FROM base_recipes WHERE name = 'Брауни блат за торта' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'serrated_knife', 'назъбен нож', 1, true, '', '', true, 'Warm knife (dipped in hot water) for cutting', 115
FROM base_recipes WHERE name = 'Брауни блат за торта' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'aluminum_foil', 'алуминиево фолио', 1, false, '', '', true, 'Mandatory 4-6 hour refrigeration before cutting', 116
FROM base_recipes WHERE name = 'Брауни блат за торта' AND recipe_role_id = 1;


-- ==========================================
-- БЛАТ ЗА ТОРТА САХЕР (10 items)
-- ==========================================
INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'small_saucepan', 'малка тенджера', 1, true, '', '', true, 'For boiling milk with erythritol', 117
FROM base_recipes WHERE name = 'Блат за торта Сахер' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'mixing_bowl', 'купа за смесване', 2, true, 'medium', '', true, '', 118
FROM base_recipes WHERE name = 'Блат за торта Сахер' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'whisk', 'телена бъркалка', 1, true, '', '', true, 'For chocolate ganache base', 119
FROM base_recipes WHERE name = 'Блат за торта Сахер' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'stand_mixer_or_hand_mixer', 'миксер', 1, true, '', '', true, '', 120
FROM base_recipes WHERE name = 'Блат за торта Сахер' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'silicone_spatula', 'силиконова шпатула', 1, true, '', '', true, '', 121
FROM base_recipes WHERE name = 'Блат за торта Сахер' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'fine_mesh_sieve', 'фино сито', 1, true, '', '', true, 'For sifting coconut flour and cocoa', 122
FROM base_recipes WHERE name = 'Блат за торта Сахер' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'cake_pan', 'форма за торта', 1, false, '', '18cm diameter', true, '', 123
FROM base_recipes WHERE name = 'Блат за торта Сахер' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'parchment_paper', 'хартия за печене', 1, false, '', '', true, '', 124
FROM base_recipes WHERE name = 'Блат за торта Сахер' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'wooden_toothpick', 'дървена клечка', 1, true, '', '', true, 'Should come out almost dry with few moist crumbs', 125
FROM base_recipes WHERE name = 'Блат за торта Сахер' AND recipe_role_id = 1;

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, reusable, size, specs, essential, notes, display_order)
SELECT id, 'aluminum_foil', 'алуминиево фолио', 1, false, '', '', true, 'Refrigeration stabilizes coconut flour', 126
FROM base_recipes WHERE name = 'Блат за торта Сахер' AND recipe_role_id = 1;

-- ==========================================
-- SUMMARY: 126 equipment items inserted
-- ==========================================

-- Verification
SELECT 'Equipment inserted' as status, COUNT(*) as total FROM recipe_equipment;

SELECT 
  br.name as recipe_name,
  COUNT(re.id) as equipment_count
FROM base_recipes br
LEFT JOIN recipe_equipment re ON br.id = re.recipe_id
WHERE br.recipe_role_id = 1
GROUP BY br.name
ORDER BY br.name;
