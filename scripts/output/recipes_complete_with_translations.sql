-- ================================================================
-- KetoCakR Bulk Import — base_recipes (is_simple_recipe = true)
-- Generated : 2026-05-28T22:16:08.015487
-- Recipes   : 52
-- ================================================================

BEGIN;

-- Дулсе Де Лече Без Млечни Продукти
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  'af24c88c-6d07-442f-8f80-0188aa586025',
  'Дулсе Де Лече Без Млечни Продукти',
  'Dulce De Leche Dairy-Free',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Лимонов ĸърд
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '5baf4bf8-ca1b-4d61-be89-59247874c454',
  'Лимонов ĸърд',
  'Lemon Curd',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Лимонов Шарлот
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  'df97412f-ac68-4e0d-a980-ece4b44b4bb9',
  'Лимонов Шарлот',
  'Lemon Charlotte',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Торта Матилда С Шоколадов Ганаш
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '8de54976-ab51-4915-989f-cac9bcdc0803',
  'Торта Матилда С Шоколадов Ганаш',
  'Matilda Cake with Chocolate Ganache',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Червена Кадифена Торта В Чаша
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '7f5eacab-6065-4a47-977a-5c772b37b31c',
  'Червена Кадифена Торта В Чаша',
  'Red Velvet Cake in a Cup',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Чийзĸейĸ Рафаело
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '97fda120-249e-4192-8445-53eba68a9042',
  'Чийзĸейĸ Рафаело',
  'Raffaello Cheesecake',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Анисови Понички
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '4ac491d3-d27a-4e14-bc11-ed776e457749',
  'Анисови Понички',
  'Anise Donuts',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Бактери С Рикота И Малини
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '20e9bd87-e897-4d2e-a4c4-a2cbe79b4834',
  'Бактери С Рикота И Малини',
  'Ricotta and Raspberry Bacteria',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Бананов Флан
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  'e8e35e6c-f2c9-4c6b-98ce-488ecab6c9cc',
  'Бананов Флан',
  'Banana Flan',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Поĸритие
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '5dfbed9c-03ed-4cfd-b0be-6ac6192c49de',
  'Поĸритие',
  'Topping',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Бисквити Със Свинска Свин
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '0605de2a-136f-448e-ab24-2bd9fcde3343',
  'Бисквити Със Свинска Свин',
  'Cookies with Pork Fat',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Бисквитки С Крема Сирене
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  'dd945b6e-31c8-4101-a7f4-6c5c5797cf7d',
  'Бисквитки С Крема Сирене',
  'Cream Cheese Cookies',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Блатче С Три Млечни Блата С Безе
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '2076af56-b285-4cdb-a5f6-1f6a5b4ed038',
  'Блатче С Три Млечни Блата С Безе',
  'Three Milk Cake with Meringue',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Тривиден Кекс
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '5dfecee8-5dd6-431b-8baa-f5274ec84776',
  'Тривиден Кекс',
  'Three-Dimensional Cake',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Близалки С Морковена Торта
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  'a1d63caa-4428-482f-9006-82fc03418775',
  'Близалки С Морковена Торта',
  'Carrot Cake Pops',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Заливĸа
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '72b7e7e1-c877-4a7a-9290-d8b811dde32c',
  'Заливĸа',
  'Drizzle',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Гигантска Бисквитка
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  'c07a3849-5aad-482e-a1c3-b2f38b87967b',
  'Гигантска Бисквитка',
  'Giant Cookie',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Дамски Пръстчици
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  'ffccae07-7b64-4465-be30-aef6c1ed8e81',
  'Дамски Пръстчици',
  'Lady Fingers',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Десерт С Кокос И Шоколад В Чаши
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  'c9af0224-d727-4d44-ac9a-2830d357da63',
  'Десерт С Кокос И Шоколад В Чаши',
  'Coconut and Chocolate Dessert in Cups',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Донетĸи
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '19ebc7d6-a2e3-416c-bded-b261662c123b',
  'Донетĸи',
  'Doughnuts',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Кето Чурос
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '419e47d5-7550-417c-9d4d-2986aea6796b',
  'Кето Чурос',
  'Keto Churros',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Кокосова Торта Без Брашно
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  'e23f921b-5a50-478c-b081-9ac343d1b654',
  'Кокосова Торта Без Брашно',
  'Coconut Cake Without Flour',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Кокосови Хрупкави Бисквитки
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  'de155482-4956-4d88-8a07-b776240de547',
  'Кокосови Хрупкави Бисквитки',
  'Coconut Crispy Cookies',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Кори Алфахорес
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  'cfb85214-2c42-44dc-9aa3-35013c9c374c',
  'Кори Алфахорес',
  'Alfajores Cookies',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Крем За Сладкари
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '3f4132e1-b9c2-4fa2-9c0b-59dfedc8523a',
  'Крем За Сладкари',
  'Pastry Cream',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Крем С Ванилия И Кокос
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  'a57a0cd3-2fd3-46e2-a111-b40548242ce2',
  'Крем С Ванилия И Кокос',
  'Vanilla Coconut Cream',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Кремове С Шам Фъстък
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '04407949-5433-4c1f-bfc9-64f8f1090b8f',
  'Кремове С Шам Фъстък',
  'Pistachio Creams',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Лимонов ĸрем
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '632a8b2d-96d2-48c7-87e0-70e7de4259a5',
  'Лимонов ĸрем',
  'Lemon Cream',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Маслен ĸрем
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '4bcd000a-8384-47c9-885c-9aa9b13c5229',
  'Маслен ĸрем',
  'Butter cream',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Мил-Фей Със Зелена Ябълка
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '0593f18e-32a6-4a8a-aaa4-c4addfc3403f',
  'Мил-Фей Със Зелена Ябълка',
  'Mille-Feuille with Green Apple',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Мини Павлови С Мус От Дулсе Де Лече
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '01b9dd6d-cd62-4702-8f60-7364a723c5e5',
  'Мини Павлови С Мус От Дулсе Де Лече',
  'Mini Pavlovas with Dulce de Leche Mousse',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Мини Шоколадова Торта
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '16d2a335-9232-4d18-bb49-ad7f1661880b',
  'Мини Шоколадова Торта',
  'Mini Chocolate Cake',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Мъфини С Банани И Извара
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  'f1f87e4a-514d-4b4b-8666-80d64654e81b',
  'Мъфини С Банани И Извара',
  'Banana Cottage Cheese Muffins',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Невъзможен Флан
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  'e1640f08-ec20-47c8-ab16-ab6c51d120d9',
  'Невъзможен Флан',
  'Impossible Flan',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Основа За Торта
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '4d9f13fc-f031-48ab-a4e1-8ff3707be52c',
  'Основа За Торта',
  'Cake Base',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Палачинка В Чаша
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '3b52096b-8567-42d9-b5f5-a7312691776a',
  'Палачинка В Чаша',
  'Cup Pancake',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Плаващ Остров С Безвинеен Сабайон
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '602d5892-fce8-4fed-905b-561a9a0eee54',
  'Плаващ Остров С Безвинеен Сабайон',
  'Floating Island with Non-Alcoholic Sabayon',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Понички С Настройен Кокос
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '0d488e68-7ef0-42ed-93db-501b7cc60f87',
  'Понички С Настройен Кокос',
  'Coconut Donuts',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Салата С Ягоди И Претцели
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '3e8aec45-6c05-4ee0-a4ed-68ec2ecc5801',
  'Салата С Ягоди И Претцели',
  'Strawberry Pretzel Salad',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Сладолед С Кисело Мляко И Плодове
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  'e2b72d04-15cb-4f3b-8dca-ac4f328fda51',
  'Сладолед С Кисело Мляко И Плодове',
  'Yogurt and Fruit Ice Cream',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Сладолед С Шам Фъстък
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '6723d08e-830f-490b-8052-bb04315d5f70',
  'Сладолед С Шам Фъстък',
  'Pistachio Ice Cream',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Сочен Ягодов Торт
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '2741c508-339f-4cdc-8916-e01ed7cedaef',
  'Сочен Ягодов Торт',
  'Juicy Strawberry Cake',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Ягодов ĸрем
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '0cc31bb7-42ed-44ca-92da-41a476a832fc',
  'Ягодов ĸрем',
  'Strawberry Cream',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Тесто За Сладко Руло
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  'ea6cd75d-ab89-4430-b4dc-9fd0d908263a',
  'Тесто За Сладко Руло',
  'Dough for Sweet Roll',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Тиквено Брауни
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '6a9a01fb-58f0-48d1-b879-f645af7de41e',
  'Тиквено Брауни',
  'Pumpkin Brownie',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Слой 2 - Полусладъĸ
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '53c742c0-5d67-4bd2-a3b5-f5a4518500a2',
  'Слой 2 - Полусладъĸ',
  'Layer 2 - Semi-sweet',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Торта Със Студен Крем И Плодове
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '404827ac-b252-4893-88fa-b1ccdbbba72e',
  'Торта Със Студен Крем И Плодове',
  'Cold Cream and Fruit Cake',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- ĸъпини
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '742b4b16-9fa3-40e3-ba58-d771d1a21474',
  'ĸъпини',
  'blackberries',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Торта Фрейсьор
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '4641d378-f4dc-4793-bff2-d8abc4a57d0b',
  'Торта Фрейсьор',
  'Freysor Cake',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Цитрусов Блат
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '1cad8bb2-1aa0-48d0-8d96-1a5089f46481',
  'Цитрусов Блат',
  'Citrus Layer',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Шоколадов И Бисквитков Салами
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '3653fad2-7c18-4455-bc34-a2be72b8906c',
  'Шоколадов И Бисквитков Салами',
  'Chocolate Biscuit Salami',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Шоколадов Тирамису
INSERT INTO base_recipes (
  id, name, name_en, is_simple_recipe,
   servings, prep_time_minutes, bake_time_minutes, total_calories
) VALUES (
  '8c15f61d-c2aa-4c6e-8c68-3cb23a40688d',
  'Шоколадов Тирамису',
  'Chocolate Tiramisu',
  TRUE,
  8,
  20,
  30,
  NULL
) ON CONFLICT (id) DO NOTHING;

COMMIT;
