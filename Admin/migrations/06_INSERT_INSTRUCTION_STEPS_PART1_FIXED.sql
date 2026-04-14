-- ==========================================
-- INSERT INSTRUCTION STEPS - PART 1 (Recipes 1-3)
-- Date: 2026-03-31 - FIXED VERSION
-- Purpose: Add AI-corrected instruction steps (step_description + BG + EN)
-- ==========================================

-- NOTE: step_description is NOT NULL, so we populate it with BG text
-- step_description_bg = БГ текст
-- step_description_en = EN превод

-- ==========================================
-- 1. ПАНДИШПАНОВ БЛАТ
-- ==========================================
INSERT INTO recipe_instruction_steps (recipe_id, step_number, step_description, step_description_bg, step_description_en, step_duration_minutes)
SELECT id, 1,
'Подготовка: Загрейте фурната на 160°C (с вентилатор). При тази рецепта високата температура (180°C) ще накара блата да избухне и след това да колабира (да спадне в средата).',
'Подготовка: Загрейте фурната на 160°C (с вентилатор). При тази рецепта високата температура (180°C) ще накара блата да избухне и след това да колабира (да спадне в средата).',
'Preparation: Preheat oven to 160°C (with fan). For this recipe, high temperature (180°C) will cause the cake to rise dramatically and then collapse (sink in the middle).', 5
FROM base_recipes WHERE name = 'Пандишпанов блат' AND recipe_role_id = 1;

INSERT INTO recipe_instruction_steps (recipe_id, step_number, step_description, step_description_bg, step_description_en, step_duration_minutes)
SELECT id, 2,
'Сух микс: Смесете бадемовото, кокосовото брашно, псилиума и ксантановата гума. Пресейте ги два пъти. В кето сладкарството пресяването на "тежките" ядкови брашна е жизненоважно за "въздушния" ефект.',
'Сух микс: Смесете бадемовото, кокосовото брашно, псилиума и ксантановата гума. Пресейте ги два пъти. В кето сладкарството пресяването на "тежките" ядкови брашна е жизненоважно за "въздушния" ефект.',
'Dry mix: Combine almond flour, coconut flour, psyllium, and xanthan gum. Sift twice. In keto baking, sifting "heavy" nut flours is essential for the "airy" effect.', 5
FROM base_recipes WHERE name = 'Пандишпанов блат' AND recipe_role_id = 1;

INSERT INTO recipe_instruction_steps (recipe_id, step_number, step_description, step_description_bg, step_description_en, step_duration_minutes)
SELECT id, 3,
'Жълтъци: Разбийте жълтъците с 60 г еритритол, докато сместа стане гъста, бледа и увеличи обема си тройно. Това отнема около 5 минути с мощен миксер.',
'Жълтъци: Разбийте жълтъците с 60 г еритритол, докато сместа стане гъста, бледа и увеличи обема си тройно. Това отнема около 5 минути с мощен миксер.',
'Yolks: Beat egg yolks with 60g erythritol until mixture becomes thick, pale, and triples in volume. This takes about 5 minutes with a powerful mixer.', 5
FROM base_recipes WHERE name = 'Пандишпанов блат' AND recipe_role_id = 1;

INSERT INTO recipe_instruction_steps (recipe_id, step_number, step_description, step_description_bg, step_description_en, step_duration_minutes)
SELECT id, 4,
'Белтъци (Меренг): Разбийте белтъците със солта до меки върхове. Започнете да добавяте останалия еритритол (90 г) лъжица по лъжица. Разбивайте до твърди, лъскави върхове.',
'Белтъци (Меренг): Разбийте белтъците със солта до меки върхове. Започнете да добавяте останалия еритритол (90 г) лъжица по лъжица. Разбивайте до твърди, лъскави върхове.',
'Egg whites (Meringue): Beat egg whites with salt until soft peaks form. Start adding remaining erythritol (90g) tablespoon by tablespoon. Beat until stiff, glossy peaks form.', 7
FROM base_recipes WHERE name = 'Пандишпанов блат' AND recipe_role_id = 1;

INSERT INTO recipe_instruction_steps (recipe_id, step_number, step_description, step_description_bg, step_description_en, step_duration_minutes)
SELECT id, 5,
'Темпериране на сместа: Вземете 1/4 от белтъците и ги добавете към жълтъците. Разбъркайте смело – целта е да втечните жълтъците, за да не "счупят" останалия белтък по-късно.',
'Темпериране на сместа: Вземете 1/4 от белтъците и ги добавете към жълтъците. Разбъркайте смело – целта е да втечните жълтъците, за да не "счупят" останалия белтък по-късно.',
'Tempering: Take 1/4 of the egg whites and add them to the yolks. Mix boldly – the goal is to loosen the yolks so they won''t "break" the remaining whites later.', 2
FROM base_recipes WHERE name = 'Пандишпанов блат' AND recipe_role_id = 1;

INSERT INTO recipe_instruction_steps (recipe_id, step_number, step_description, step_description_bg, step_description_en, step_duration_minutes)
SELECT id, 6,
'Обединяване: Изсипете жълтъчната смес върху останалите белтъци. Добавете сухите съставки на три етапа през сито. Смесвайте с шпатула с движение "J" (загребване от дъното и обръщане), като завъртате купата. Спрете веднага щом не виждате сухи бучици!',
'Обединяване: Изсипете жълтъчната смес върху останалите белтъци. Добавете сухите съставки на три етапа през сито. Смесвайте с шпатула с движение "J" (загребване от дъното и обръщане), като завъртате купата. Спрете веднага щом не виждате сухи бучици!',
'Combining: Pour yolk mixture over remaining egg whites. Add dry ingredients in three stages through sieve. Mix with spatula using "J" motion (scooping from bottom and turning), rotating the bowl. Stop as soon as you see no dry lumps!', 5
FROM base_recipes WHERE name = 'Пандишпанов блат' AND recipe_role_id = 1;

INSERT INTO recipe_instruction_steps (recipe_id, step_number, step_description, step_description_bg, step_description_en, step_duration_minutes)
SELECT id, 7,
'Печене: Изсипете в ринг (18 см). Не мажете стените на ринга с мазнина! Пандишпанът трябва да се "катери" по стените. Печете 35–40 минути на 160°C.',
'Печене: Изсипете в ринг (18 см). Не мажете стените на ринга с мазнина! Пандишпанът трябва да се "катери" по стените. Печете 35–40 минути на 160°C.',
'Baking: Pour into ring pan (18 cm). Do not grease the sides of the pan! The sponge cake needs to "climb" up the sides. Bake 35-40 minutes at 160°C.', 40
FROM base_recipes WHERE name = 'Пандишпанов блат' AND recipe_role_id = 1;

INSERT INTO recipe_instruction_steps (recipe_id, step_number, step_description, step_description_bg, step_description_en, step_duration_minutes)
SELECT id, 8,
'Шеф трик за охлаждане: След като извадите блата, го обърнете обратно (с главата надолу) върху решетка, докато е още във формата. Това не позволява на тежката кето структура да се свие под собствената си тежест.',
'Шеф трик за охлаждане: След като извадите блата, го обърнете обратно (с главата надолу) върху решетка, докато е още във формата. Това не позволява на тежката кето структура да се свие под собствената си тежест.',
'Chef cooling trick: After removing from oven, flip the cake upside down onto a cooling rack while still in the pan. This prevents the heavy keto structure from collapsing under its own weight.', 60
FROM base_recipes WHERE name = 'Пандишпанов блат' AND recipe_role_id = 1;

-- Verify
SELECT COUNT(*) as steps_added FROM recipe_instruction_steps 
WHERE recipe_id = (SELECT id FROM base_recipes WHERE name = 'Пандишпанов блат' AND recipe_role_id = 1);

