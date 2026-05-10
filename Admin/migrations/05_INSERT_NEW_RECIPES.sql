-- ==========================================
-- INSERT NEW RECIPES - 9 NEW БЛАТОВЕ
-- Date: 2026-03-31
-- Purpose: Add 9 new AI-corrected recipes
-- ==========================================

-- 1. БЛАТ ВАНИЛИЯ → Ванилов блат (Оптимизирана)
INSERT INTO base_recipes (
  id, name, name_en, recipe_role_id, description, description_en,
  ingredients_text_bg, ingredients_text_en,
  prep_time_minutes, bake_time_minutes, servings,
  is_visible_to_users, is_free, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Блат ванилия',
  'Vanilla Cake Layer',
  1,
  'Оптимизирана рецепта - комбинацията от псилиум и ксантанова гума създава перфектна имитация на пандишпан.',
  'Optimized recipe - combination of psyllium and xanthan gum creates perfect sponge cake imitation.',
  E'100 г еритритол (пудра)\n50 г бадемово брашно\n10 г кокосово брашно\n12 г псилиум хуск (фино смлян)\n2 г ксантанова гума\n5 г бакпулвер\n4 бр. яйца (размер L), разделени\n30 г кокосово масло (разтопено и охладено)\n5 г ванилов екстракт\nщипка сол',
  E'100 g erythritol (powder)\n50 g almond flour\n10 g coconut flour\n12 g psyllium husk (finely ground)\n2 g xanthan gum\n5 g baking powder\n4 eggs (size L), separated\n30 g coconut oil (melted and cooled)\n5 g vanilla extract\npinch of salt',
  20, 35, 8,
  true, true, NOW(), NOW()
);

-- 2. БЛАТ ЗА БАДЕМОВА ТОРТА АЛА ИКЕА → Бадемови блатове (Swedish Style)
INSERT INTO base_recipes (
  id, name, name_en, recipe_role_id, description, description_en,
  ingredients_text_bg, ingredients_text_en,
  prep_time_minutes, bake_time_minutes, servings,
  is_visible_to_users, is_free, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Блат за бадемова торта ала Икеа',
  'Swedish Almond Cake Layer (IKEA Style)',
  1,
  'Шведски стил бадемови блатове - перфектна "zero waste" рецепта когато се комбинира с Яйчен маслен крем.',
  'Swedish style almond cake layers - perfect "zero waste" recipe when paired with Yellow Egg Yolk Cream.',
  E'6 белтъка (L) – стайна температура\n140 г бадемово брашно (фино)\n70 г еритритол пудра\n2 г ксантанова гума (около 1/2 ч.л.)\n1/4 ч.л. сол\nняколко капки лимонов сок (за стабилност)',
  E'6 egg whites (L) - room temperature\n140 g almond flour (fine)\n70 g erythritol powder\n2 g xanthan gum (about 1/2 tsp)\n1/4 tsp salt\nfew drops lemon juice (for stability)',
  15, 25, 8,
  true, true, NOW(), NOW()
);

-- 3. БЛАТ ЗА МОРКОВЕНА ТОРТА → Кето Морковен блат (Light версия)
INSERT INTO base_recipes (
  id, name, name_en, recipe_role_id, description, description_en,
  ingredients_text_bg, ingredients_text_en,
  prep_time_minutes, bake_time_minutes, servings,
  is_visible_to_users, is_free, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Блат за морковена торта',
  'Carrot Cake Layer (Light)',
  1,
  'Лека версия на морковен блат със 120г моркови - по-въздушен от маслената версия.',
  'Light version of carrot cake with 120g carrots - airier than the buttery version.',
  E'70 г еритритол пудра (разделен)\n70 г бадемово брашно\n10 г кокосово брашно\n4 яйца (L), разделени\n10 г кокосово масло (разтопено и охладено)\n50 г орехи или пекан (нарязани)\n120 г моркови (настъргани на ситно и леко изстискани)\n1 ч.л. канела\n1/2 ч.л. джинджифил\n1/4 ч.л. кардамон\n2 г ксантанова гума\n1 ч.л. бакпулвер\nщипка сол',
  E'70 g erythritol powder (divided)\n70 g almond flour\n10 g coconut flour\n4 eggs (L), separated\n10 g coconut oil (melted and cooled)\n50 g walnuts or pecans (chopped)\n120 g carrots (finely grated and lightly squeezed)\n1 tsp cinnamon\n1/2 tsp ginger\n1/4 tsp cardamom\n2 g xanthan gum\n1 tsp baking powder\npinch of salt',
  20, 45, 8,
  true, true, NOW(), NOW()
);

-- 4. БЛАТ ЗА ТОРТА ГАРАШ → Кето блатове „Гараш"
INSERT INTO base_recipes (
  id, name, name_en, recipe_role_id, description, description_en,
  ingredients_text_bg, ingredients_text_en,
  prep_time_minutes, bake_time_minutes, servings,
  is_visible_to_users, is_free, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Блат за торта Гараш',
  'Garash Cake Layers',
  1,
  'Традиционни орехови блатове за торта Гараш - 5 тънки слоя или 2-3 по-дебели.',
  'Traditional walnut layers for Garash cake - 5 thin layers or 2-3 thicker ones.',
  E'6 белтъка (L) – стайна температура\n200 г орехи (фино смлени, но сухи)\n100 г еритритол пудра\n2 г ксантанова гума (1/2 ч.л.)\nЩипка сол\nНяколко капки лимонов сок',
  E'6 egg whites (L) - room temperature\n200 g walnuts (finely ground but dry)\n100 g erythritol powder\n2 g xanthan gum (1/2 tsp)\nPinch of salt\nFew drops lemon juice',
  15, 12, 8,
  true, true, NOW(), NOW()
);

-- 5. БЛАТ ЗА ТОРТА САХЕР → Кето Блат „Сахер"
INSERT INTO base_recipes (
  id, name, name_en, recipe_role_id, description, description_en,
  ingredients_text_bg, ingredients_text_en,
  prep_time_minutes, bake_time_minutes, servings,
  is_visible_to_users, is_free, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Блат за торта Сахер',
  'Sacher Cake Layer',
  1,
  'Автентичен блат за торта Сахер с кокосово брашно и шоколадов ганаш база.',
  'Authentic Sacher cake layer with coconut flour and chocolate ganache base.',
  E'4 яйца (L), разделени\n80 мл бадемово или краве мляко\n30 г шоколад (85%+) или какаова маса\n15 г краве масло\n20 г какао на прах\n35 г кокосово брашно\n70 г еритритол пудра\n2 г сода за хляб\n10 г лимонов сок\nщипка сол',
  E'4 eggs (L), separated\n80 ml almond or cow milk\n30 g chocolate (85%+) or cocoa mass\n15 g butter\n20 g cocoa powder\n35 g coconut flour\n70 g erythritol powder\n2 g baking soda\n10 g lemon juice\npinch of salt',
  20, 40, 8,
  true, true, NOW(), NOW()
);

-- 6. БЛАТ С ЧАЙ МАТЧА → Кето Матча Пандишпан
INSERT INTO base_recipes (
  id, name, name_en, recipe_role_id, description, description_en,
  ingredients_text_bg, ingredients_text_en,
  prep_time_minutes, bake_time_minutes, servings,
  is_visible_to_users, is_free, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Блат с чай Матча',
  'Matcha Sponge Cake',
  1,
  'Матча пандишпан с ярък зелен цвят - ниската температура запазва цвета.',
  'Matcha sponge cake with vibrant green color - low temperature preserves the color.',
  E'90 г еритритол пудра (разделен)\n70 г бадемово брашно\n10 г кокосово брашно\n10 г качествен чай матча на прах (церемониален клас)\n12 г псилиум хуск (фино смлян)\n2 г ксантанова гума\n5 бр. яйца (L), разделени\n20 г кокосово масло (разтопено и охладено)\nщипка сол',
  E'90 g erythritol powder (divided)\n70 g almond flour\n10 g coconut flour\n10 g quality matcha tea powder (ceremonial grade)\n12 g psyllium husk (finely ground)\n2 g xanthan gum\n5 eggs (L), separated\n20 g coconut oil (melted and cooled)\npinch of salt',
  20, 40, 8,
  true, true, NOW(), NOW()
);

-- 7. БЛАТ ФРЕНСКИ МЕРЕНГ → Кето Френска целувка (Dacquoise)
INSERT INTO base_recipes (
  id, name, name_en, recipe_role_id, description, description_en,
  ingredients_text_bg, ingredients_text_en,
  prep_time_minutes, bake_time_minutes, servings,
  is_visible_to_users, is_free, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Блат Френски меренг',
  'French Dacquoise',
  1,
  'Френска целувка с орехи - лек, хрупкав меренг блат. Не приготвяйте в дъждовно време!',
  'French dacquoise with nuts - light, crispy meringue layer. Do not make in rainy weather!',
  E'6 големи белтъка (стайна температура)\n120 г еритритол пудра\n2 г ксантанова гума (около 1/2 ч.л.)\n100 г ядки (ситно нарязани, но не на брашно)\nЩипка сол\n1/2 ч.л. лимонов сок',
  E'6 large egg whites (room temperature)\n120 g erythritol powder\n2 g xanthan gum (about 1/2 tsp)\n100 g nuts (finely chopped, but not flour)\nPinch of salt\n1/2 tsp lemon juice',
  15, 70, 8,
  true, true, NOW(), NOW()
);

-- 8. БЛАТ ЧЕРВЕНО КАДИФЕ → Кето Червено Кадифе
INSERT INTO base_recipes (
  id, name, name_en, recipe_role_id, description, description_en,
  ingredients_text_bg, ingredients_text_en,
  prep_time_minutes, bake_time_minutes, servings,
  is_visible_to_users, is_free, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Блат Червено кадифе',
  'Red Velvet Cake Layer',
  1,
  'Червено кадифе с ябълков оцет за стабилизиране на цвета. Задължително с Крем сирене!',
  'Red Velvet with apple cider vinegar for color stability. Must pair with Cream Cheese Frosting!',
  E'90 г еритритол пудра\n70 г бадемово брашно\n10 г кокосово брашно\n10 г какао на прах (макс количество за цвят)\n12 г псилиум хуск (фино смлян)\n2 г ксантанова гума\n5 бр. яйца (L), разделени\n30 г разтопено масло (стайна температура)\n1 ч.л. ябълков оцет\nЧервен оцветител (според указанията)\nщипка сол',
  E'90 g erythritol powder\n70 g almond flour\n10 g coconut flour\n10 g cocoa powder (max amount for color)\n12 g psyllium husk (finely ground)\n2 g xanthan gum\n5 eggs (L), separated\n30 g melted butter (room temperature)\n1 tsp apple cider vinegar\nRed food coloring (as directed)\npinch of salt',
  20, 35, 8,
  true, true, NOW(), NOW()
);

-- 9. БРАУНИ → Много шоколадов блат (Rich Chocolate Base)
INSERT INTO base_recipes (
  id, name, name_en, recipe_role_id, description, description_en,
  ingredients_text_bg, ingredients_text_en,
  prep_time_minutes, bake_time_minutes, servings,
  is_visible_to_users, is_free, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Брауни',
  'Rich Chocolate Brownie Base',
  1,
  'Много шоколадов блат богат на масло - перфектен за тежки маслени торти тип "Ганаш".',
  'Very chocolatey butter-rich base - perfect for heavy buttery cakes like "Ganache" style.',
  E'120 г еритритол пудра\n150 г меко краве масло (мин. 82%)\n4 яйца (размер L)\n50 г течна готварска сметана (30-35%)\n30 мл горещо кафе или вряла вода\n60 г бадемово брашно\n60 г качествено какао\n10 г бакпулвер\nщипка сол',
  E'120 g erythritol powder\n150 g soft butter (min. 82%)\n4 eggs (size L)\n50 g heavy cream (30-35%)\n30 ml hot coffee or boiling water\n60 g almond flour\n60 g quality cocoa\n10 g baking powder\npinch of salt',
  15, 50, 8,
  true, true, NOW(), NOW()
);

-- Verify inserts
SELECT 
  name,
  name_en,
  recipe_role_id,
  created_at
FROM base_recipes
WHERE created_at > NOW() - INTERVAL '5 minutes'
AND recipe_role_id = 1
ORDER BY name;

-- ==========================================
-- SUMMARY: 9 new recipes inserted
-- ==========================================
