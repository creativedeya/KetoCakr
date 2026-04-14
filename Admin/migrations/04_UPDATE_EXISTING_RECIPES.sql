-- ==========================================
-- UPDATE EXISTING RECIPES - AI CORRECTIONS
-- Date: 2026-03-31
-- Purpose: Update 7 existing блатове with AI-corrected content
-- ==========================================

-- 1. ПАНДИШПАНОВ БЛАТ → Базова рецепта за въздушни кето блатове
UPDATE base_recipes
SET
  name = 'Пандишпанов блат',
  name_en = 'Airy Keto Sponge Cake',
  description = 'Ревизирана рецепта за перфектен въздушен кето пандишпан с оптимизирани пропорции.',
  description_en = 'Revised recipe for perfect airy keto sponge cake with optimized proportions.',
  ingredients_text_bg = E'За белтъчния сняг (Меренг):\n6 белтъка (стайна температура)\n90 г еритритол пудра\nЩипка сол или 1/4 ч.л. лимонена киселина\n\nЗа жълтъчната смес:\n6 жълтъка\n60 г еритритол пудра\n1 ч.л. ванилов екстракт\n\nСухи съставки:\n70 г бадемово брашно (фино смляно)\n10 г кокосово брашно\n10 г псилиум хуск (фино смлян)\n1 г ксантанова гума',
  ingredients_text_en = E'For meringue:\n6 egg whites (room temperature)\n90 g erythritol powder\nPinch of salt or 1/4 tsp citric acid\n\nFor yolk mixture:\n6 egg yolks\n60 g erythritol powder\n1 tsp vanilla extract\n\nDry ingredients:\n70 g almond flour (finely ground)\n10 g coconut flour\n10 g psyllium husk (finely ground)\n1 g xanthan gum',
  prep_time_minutes = 20,
  bake_time_minutes = 40,
  servings = 8,
  updated_at = NOW()
WHERE id = '946c23f4-ac7d-47ed-a940-e6caf6e357a1';

-- 2. КОКОСОВ БЛАТ → Кокосови блатове (Оптимизирана)
UPDATE base_recipes
SET
  name = 'Кокосов блат',
  name_en = 'Coconut Cake Layer',
  description = 'Оптимизирана рецепта - ксантановата гума гарантира че блатовете няма да се натрошат.',
  description_en = 'Optimized recipe - xanthan gum ensures the cakes will not crumble.',
  ingredients_text_bg = E'90 г еритритол (препоръчително на пудра)\n40 г кокосово брашно\n15 г кокосови стърготини\n2 г ксантанова гума (задължителна за спойка)\n70 г кокосово масло (разтопено и охладено)\n4 бр. яйца (размер L), разделени\nщипка сол',
  ingredients_text_en = E'90 g erythritol (preferably powdered)\n40 g coconut flour\n15 g shredded coconut\n2 g xanthan gum (mandatory for binding)\n70 g coconut oil (melted and cooled)\n4 eggs (size L), separated\npinch of salt',
  prep_time_minutes = 15,
  bake_time_minutes = 30,
  servings = 8,
  updated_at = NOW()
WHERE id = 'd255d098-11f8-4a2e-9018-7b9be2625514';

-- 3. ЛИМОНОВ БЛАТ → Лимонов блат (Ревизирана)
UPDATE base_recipes
SET
  name = 'Лимонов блат',
  name_en = 'Lemon Cake Layer',
  description = 'Ревизирана рецепта с оптимална киселинност и аромат на лимон.',
  description_en = 'Revised recipe with optimal acidity and lemon aroma.',
  ingredients_text_bg = E'110 г еритритол пудра (разделен на две)\n70 г бадемово брашно\n10 г кокосово брашно\n10 г псилиум хуск (фино смлян)\n2 г ксантанова гума\n5 г бакпулвер\n4 яйца (L), разделени\n30 г лимонов сок (прясно изцеден)\nНастъргана кора от 1 био лимон\n30 г разтопено кокосово масло или масло (охладено)\nщипка сол',
  ingredients_text_en = E'110 g erythritol powder (divided)\n70 g almond flour\n10 g coconut flour\n10 g psyllium husk (finely ground)\n2 g xanthan gum\n5 g baking powder\n4 eggs (L), separated\n30 g lemon juice (freshly squeezed)\nZest from 1 organic lemon\n30 g melted coconut oil or butter (cooled)\npinch of salt',
  prep_time_minutes = 20,
  bake_time_minutes = 35,
  servings = 8,
  updated_at = NOW()
WHERE id = 'bf9027a2-8c9d-4894-be6c-4a8af9012903';

-- 4. МОРКОВЕН БЛАТ 1 → Маслен морковен блат (Heavy Carrot Base)
UPDATE base_recipes
SET
  name = 'Маслен морковен блат',
  name_en = 'Buttery Carrot Cake Layer',
  description = 'Богат на масло морковен блат с 300г моркови - идеален за класическа морковена торта.',
  description_en = 'Rich buttery carrot cake with 300g carrots - perfect for classic carrot cake.',
  ingredients_text_bg = E'80 г еритритол пудра\n200 г бадемово брашно\n20 г кокосово брашно\n3 яйца (L)\n150 г краве масло (много меко)\n100 г орехи или пекан (едро нарязани)\n300 г моркови (фино настъргани и добре изцедени)\n1 ч.л. канела\n1 ч.л. джинджифил\n1/2 ч.л. кардамон\n1 ч.л. бакпулвер\n1/2 ч.л. ксантанова гума\nщипка сол',
  ingredients_text_en = E'80 g erythritol powder\n200 g almond flour\n20 g coconut flour\n3 eggs (L)\n150 g butter (very soft)\n100 g walnuts or pecans (coarsely chopped)\n300 g carrots (finely grated and well drained)\n1 tsp cinnamon\n1 tsp ginger\n1/2 tsp cardamom\n1 tsp baking powder\n1/2 tsp xanthan gum\npinch of salt',
  prep_time_minutes = 25,
  bake_time_minutes = 50,
  servings = 8,
  updated_at = NOW()
WHERE id = '97e2de5a-f528-48c7-8b72-4a5f011e49af';

-- 5. ШОКОЛАДОВ БЛАТ → Кето Шоколадов Пандишпан
UPDATE base_recipes
SET
  name = 'Шоколадов пандишпан',
  name_en = 'Chocolate Sponge Cake',
  description = 'Шоколадов пандишпан с оптимална влажност и дълбок какаов вкус.',
  description_en = 'Chocolate sponge cake with optimal moisture and deep cocoa flavor.',
  ingredients_text_bg = E'90 г еритритол пудра (разделен)\n40 г бадемово брашно\n40 г висококачествено какао (неподсладено)\n12 г псилиум хуск (фино смлян)\n2 г ксантанова гума\n5 бр. яйца (размер L), разделени\n30 г разтопено масло или кокосово масло\nщипка сол',
  ingredients_text_en = E'90 g erythritol powder (divided)\n40 g almond flour\n40 g high-quality cocoa (unsweetened)\n12 g psyllium husk (finely ground)\n2 g xanthan gum\n5 eggs (size L), separated\n30 g melted butter or coconut oil\npinch of salt',
  prep_time_minutes = 20,
  bake_time_minutes = 35,
  servings = 8,
  updated_at = NOW()
WHERE id = 'bde8cc34-256c-43ca-bcb3-54fd5842bbaf';

-- 6. БАЗОВ МАСЛЕН БЛАТ ЗА ТОРТА → Кето кексово тесто
UPDATE base_recipes
SET
  name = 'Базов маслен блат',
  name_en = 'Basic Butter Cake Layer',
  description = 'Базова рецепта за кето кексово тесто със стабилна структура без глутен.',
  description_en = 'Basic keto cake batter recipe with stable gluten-free structure.',
  ingredients_text_bg = E'140 г краве масло (меко, на стайна температура)\n140 г еритритол (за предпочитане на пудра)\n4 големи яйца (стайна температура)\n110 г бадемово брашно\n35 г кокосово брашно\n1 с. л. псилиум хуск (фино смлян)\n1 ч. л. бакпулвер\nЩипка сол',
  ingredients_text_en = E'140 g butter (soft, room temperature)\n140 g erythritol (preferably powdered)\n4 large eggs (room temperature)\n110 g almond flour\n35 g coconut flour\n1 tbsp psyllium husk (finely ground)\n1 tsp baking powder\nPinch of salt',
  prep_time_minutes = 15,
  bake_time_minutes = 45,
  servings = 8,
  updated_at = NOW()
WHERE id = '8ff6959f-90a9-4556-9fd8-b14dea8ab203';

-- 7. БРАУНИ БЛАТ ЗА ТОРТА → Кето Брауни блат (Flourless)
UPDATE base_recipes
SET
  name = 'Брауни блат',
  name_en = 'Flourless Brownie Layer',
  description = 'Flourless брауни блат с интензивен шоколадов вкус и трюфелна текстура.',
  description_en = 'Flourless brownie layer with intense chocolate flavor and truffle-like texture.',
  ingredients_text_bg = E'100 г натурален шоколад без захар (мин. 70% какао)\n100 г краве масло (мин. 82% масленост)\n6 яйца (L) – стайна температура\n100 г еритритол пудра\nЩипка сол\n1 ч.л. ванилов екстракт',
  ingredients_text_en = E'100 g sugar-free dark chocolate (min. 70% cocoa)\n100 g butter (min. 82% fat)\n6 eggs (L) - room temperature\n100 g erythritol powder\nPinch of salt\n1 tsp vanilla extract',
  prep_time_minutes = 15,
  bake_time_minutes = 40,
  servings = 8,
  updated_at = NOW()
WHERE id = '59c478d9-3cde-4e78-bb05-3b6ca432e8e4';

-- Verify updates
SELECT 
  id,
  name,
  name_en,
  updated_at
FROM base_recipes
WHERE id IN (
  '946c23f4-ac7d-47ed-a940-e6caf6e357a1',
  'd255d098-11f8-4a2e-9018-7b9be2625514',
  'bf9027a2-8c9d-4894-be6c-4a8af9012903',
  '97e2de5a-f528-48c7-8b72-4a5f011e49af',
  'bde8cc34-256c-43ca-bcb3-54fd5842bbaf',
  '8ff6959f-90a9-4556-9fd8-b14dea8ab203',
  '59c478d9-3cde-4e78-bb05-3b6ca432e8e4'
)
ORDER BY name;

-- ==========================================
-- SUMMARY: 7 recipes updated
-- ==========================================
