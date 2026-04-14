-- ============================================================
-- File: 31_INSERT_FROSTING_INGREDIENTS.sql
-- Project: KetoCakR | Date: 2026-04-07
-- NOTE: ingredient_database_id = NULL (link manually in admin)
-- ============================================================

INSERT INTO recipe_ingredients (
  recipe_id, ingredient_database_id, ingredient_name, quantity, unit, order_index
)
VALUES
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Фъстъчен крем' AND recipe_role_id = 2),
    NULL,
    'Маскарпоне (ледено студено)',
    400.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Фъстъчен крем' AND recipe_role_id = 2),
    NULL,
    'Натурално фъстъчено масло (гладко, без добавена захар)',
    150.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Фъстъчен крем' AND recipe_role_id = 2),
    NULL,
    'Течна сметана (33-35%, студена)',
    150.0,
    'мл',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Фъстъчен крем' AND recipe_role_id = 2),
    NULL,
    'Еритритол на пудра (фино смлян)',
    100.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Фъстъчен крем' AND recipe_role_id = 2),
    NULL,
    'Щипка сол (ако фъстъченото масло не е солено – солта подчертава вкуса му)',
    NULL,
    NULL,
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Фъстъчен крем' AND recipe_role_id = 2),
    NULL,
    'Ванилия.',
    1.0,
    'ч.л',
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамелен крем' AND recipe_role_id = 2),
    NULL,
    'Маскарпоне (ледено студено)',
    400.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамелен крем' AND recipe_role_id = 2),
    NULL,
    'Течна сметана (33-35%, студена)',
    150.0,
    'мл',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамелен крем' AND recipe_role_id = 2),
    NULL,
    'Алулоза (за карамелизиране)',
    100.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамелен крем' AND recipe_role_id = 2),
    NULL,
    'Гореща сметана (за деглазиране на карамела – по избор, за по-мек вкус)',
    30.0,
    'мл',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамелен крем' AND recipe_role_id = 2),
    NULL,
    '1/2 ч.л. Морска сол (за вариант "Солен карамел")',
    NULL,
    NULL,
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамелен крем' AND recipe_role_id = 2),
    NULL,
    'Ванилия.',
    1.0,
    'ч.л',
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадова Броня' AND recipe_role_id = 2),
    NULL,
    'Черен шоколад без захар (85%)',
    300.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадова Броня' AND recipe_role_id = 2),
    NULL,
    'Краве масло (мин. 82%, на стайна температура)',
    150.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадова Броня' AND recipe_role_id = 2),
    NULL,
    'Щипка сол (засилва шоколадовия вкус)',
    NULL,
    NULL,
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадова Броня' AND recipe_role_id = 2),
    NULL,
    'Еритритол пудра (по желание).',
    30.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов стабилизиран крем' AND recipe_role_id = 2),
    NULL,
    'Кокосова сметана (само твърдата част от охладени кенчета)',
    600.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов стабилизиран крем' AND recipe_role_id = 2),
    NULL,
    'Какаово масло (чисто, настъргано и разтопено)',
    40.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов стабилизиран крем' AND recipe_role_id = 2),
    NULL,
    'Еритритол пудра (фино пресят)',
    120.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов стабилизиран крем' AND recipe_role_id = 2),
    NULL,
    'Ванилия или малко кокосови стърготини (по желание).',
    1.0,
    'ч.л',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов Чийзкейк крем' AND recipe_role_id = 2),
    NULL,
    'Крем сирене (тип Филаделфия, студено)',
    600.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов Чийзкейк крем' AND recipe_role_id = 2),
    NULL,
    'Течна сметана (мин. 33%, студена)',
    100.0,
    'мл',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов Чийзкейк крем' AND recipe_role_id = 2),
    NULL,
    'Пресен лимонов сок (прецеден)',
    100.0,
    'мл',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов Чийзкейк крем' AND recipe_role_id = 2),
    NULL,
    'Кората на 1 голям био лимон (фино настъргана)',
    NULL,
    NULL,
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов Чийзкейк крем' AND recipe_role_id = 2),
    NULL,
    'Еритритол пудра (пресят).',
    150.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Шоколадов Трюфел' AND recipe_role_id = 2),
    NULL,
    'Крем сирене (тип Филаделфия, студено)',
    400.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Шоколадов Трюфел' AND recipe_role_id = 2),
    NULL,
    'Краве масло (82%, омекотено на стайна температура)',
    250.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Шоколадов Трюфел' AND recipe_role_id = 2),
    NULL,
    'Черен шоколад (85% какао)',
    100.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Шоколадов Трюфел' AND recipe_role_id = 2),
    NULL,
    'Какаово масло',
    20.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Шоколадов Трюфел' AND recipe_role_id = 2),
    NULL,
    'Еритритол пудра (фино пресята)',
    130.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Шоколадов Трюфел' AND recipe_role_id = 2),
    NULL,
    'Какао на прах (висококачествено).',
    30.0,
    'г',
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Крем Пистачо' AND recipe_role_id = 2),
    NULL,
    'Крема сирене или Маскарпоне (ледено студено)',
    600.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Крем Пистачо' AND recipe_role_id = 2),
    NULL,
    'Тахан от шам-фъстък (100% ядки)',
    100.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Крем Пистачо' AND recipe_role_id = 2),
    NULL,
    'Течна сметана (33-35%, студена)',
    100.0,
    'мл',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Крем Пистачо' AND recipe_role_id = 2),
    NULL,
    'Еритритол пудра (фино пресята).',
    150.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Пухкав Фъстъчен крем' AND recipe_role_id = 2),
    NULL,
    'Крем сирене (студено)',
    220.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Пухкав Фъстъчен крем' AND recipe_role_id = 2),
    NULL,
    'Течна сметана (33%, ледено студена)',
    200.0,
    'мл',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Пухкав Фъстъчен крем' AND recipe_role_id = 2),
    NULL,
    'Фъстъчено масло (натурално) или печени фъстъци',
    100.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Пухкав Фъстъчен крем' AND recipe_role_id = 2),
    NULL,
    'Краве масло (на стайна температура)',
    60.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Пухкав Фъстъчен крем' AND recipe_role_id = 2),
    NULL,
    'Еритритол пудра (фино пресята)',
    150.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Пухкав Фъстъчен крем' AND recipe_role_id = 2),
    NULL,
    'Екстракт от ванилия.',
    5.0,
    'г',
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Малинов крем' AND recipe_role_id = 2),
    NULL,
    'Крем сирене (ледено студено, тип Филаделфия)',
    600.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Малинов крем' AND recipe_role_id = 2),
    NULL,
    'Течна сметана (мин. 30-35% масленост, студена)',
    100.0,
    'мл',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Малинов крем' AND recipe_role_id = 2),
    NULL,
    'Малини (пресни, замразени или готово пюре)',
    100.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Малинов крем' AND recipe_role_id = 2),
    NULL,
    'Еритритол на пудра (фино пресят)',
    130.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Малинов крем' AND recipe_role_id = 2),
    NULL,
    'Екстракт от ванилия или 1 с.л. лимонов сок (по желание, за засилване на плодовия вкус).',
    5.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов маслен крем' AND recipe_role_id = 2),
    NULL,
    'Краве масло (минимално 82% масленост, задължително на стайна температура)',
    350.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов маслен крем' AND recipe_role_id = 2),
    NULL,
    'Еритритол на пудра (фино пресят, за да няма хрупкави зрънца)',
    130.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов маслен крем' AND recipe_role_id = 2),
    NULL,
    'Течна сметана (33% масленост, на стайна температура)',
    45.0,
    'мл',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов маслен крем' AND recipe_role_id = 2),
    NULL,
    'Екстракт от ванилия (или съдържанието на една шушулка ванилия за луксозен вид с черни точки).',
    5.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Мока' AND recipe_role_id = 2),
    NULL,
    'Краве масло (82%, меко, на стайна температура)',
    250.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Мока' AND recipe_role_id = 2),
    NULL,
    'Течна сметана (33-35%, ледено студена)',
    200.0,
    'мл',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Мока' AND recipe_role_id = 2),
    NULL,
    'Еритритол на пудра (фино пресят)',
    150.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Мока' AND recipe_role_id = 2),
    NULL,
    'Крем сирене (студено)',
    60.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Мока' AND recipe_role_id = 2),
    NULL,
    'Какао на прах (неподсладено)',
    50.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Мока' AND recipe_role_id = 2),
    NULL,
    'Инстантно кафе (фино смляно)',
    5.0,
    'г',
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Мока' AND recipe_role_id = 2),
    NULL,
    'Екстракт от ванилия.',
    5.0,
    'г',
    7
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов маслен крем' AND recipe_role_id = 2),
    NULL,
    'Крем сирене (студено, тип Филаделфия)',
    400.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов маслен крем' AND recipe_role_id = 2),
    NULL,
    'Краве масло (82%, меко, на стайна температура)',
    250.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов маслен крем' AND recipe_role_id = 2),
    NULL,
    'Черен шоколад (мин. 85% какао)',
    100.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов маслен крем' AND recipe_role_id = 2),
    NULL,
    'Еритритол на пудра (фино пресят)',
    130.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов маслен крем' AND recipe_role_id = 2),
    NULL,
    'Какао на прах (неподсладено)',
    30.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов маслен крем' AND recipe_role_id = 2),
    NULL,
    'Какаово масло (за допълнителен блясък и твърдост).',
    20.0,
    'г',
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Руби' AND recipe_role_id = 2),
    NULL,
    'Извара (9% масленост, възможно най-фина)',
    400.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Руби' AND recipe_role_id = 2),
    NULL,
    'Течна сметана (33-35%, ледено студена)',
    300.0,
    'мл',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Руби' AND recipe_role_id = 2),
    NULL,
    'Еритритол на пудра (фино пресят)',
    150.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Руби' AND recipe_role_id = 2),
    NULL,
    'Какаово масло (чисто, настъргано)',
    60.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Руби' AND recipe_role_id = 2),
    NULL,
    'Червено цвекло на прах (за цвят)',
    5.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Руби' AND recipe_role_id = 2),
    NULL,
    'Екстракт от ванилия или капка лимонов сок (за баланс).',
    5.0,
    'г',
    6
  )
;

-- Total: 69 ingredients