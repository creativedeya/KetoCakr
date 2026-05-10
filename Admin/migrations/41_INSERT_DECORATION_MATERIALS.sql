-- ============================================================
-- File: 41_INSERT_DECORATION_MATERIALS.sql
-- Project: KetoCakR | Date: 2026-04-07
-- Description: Decoration materials as recipe_ingredients
-- NOTE: quantities are approximate (decorative, not precise)
-- ============================================================

INSERT INTO recipe_ingredients (
  recipe_id, ingredient_database_id, ingredient_name, quantity, unit, order_index
)
VALUES
  (
    (SELECT id FROM base_recipes WHERE name = 'Горски венец' AND recipe_role_id = 4),
    NULL,
    'Пресни ягоди: 6-8 броя (изберете средни по размер и еднакви по форма).',
    NULL,
    NULL,
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Горски венец' AND recipe_role_id = 4),
    NULL,
    'Пресни боровинки: около 50 г (едри и здрави).',
    NULL,
    NULL,
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Горски венец' AND recipe_role_id = 4),
    NULL,
    'Пресни малини: 8-10 броя.',
    NULL,
    NULL,
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Горски венец' AND recipe_role_id = 4),
    NULL,
    'Прясна мента: няколко малки листенца за акцент.',
    NULL,
    NULL,
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Горски венец' AND recipe_role_id = 4),
    NULL,
    'Опционално: Кето пудра захар (смилате еритритол) за фина "снежна" поръска точно преди сервиране.',
    NULL,
    NULL,
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кралски Сахер' AND recipe_role_id = 4),
    NULL,
    'Кето шоколад (минимум 75-80% какао или подсладен със стевия/еритритол).',
    100.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кралски Сахер' AND recipe_role_id = 4),
    NULL,
    'Течна млечна сметана (35% масленост).',
    100.0,
    'мл',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кралски Сахер' AND recipe_role_id = 4),
    NULL,
    'Краве масло (за допълнителен блясък).',
    20.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кралски Сахер' AND recipe_role_id = 4),
    NULL,
    'Щипка сол (за засилване на шоколадовия вкус).',
    NULL,
    NULL,
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кралски Сахер' AND recipe_role_id = 4),
    NULL,
    'Кето шоколад.',
    30.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кралски Сахер' AND recipe_role_id = 4),
    NULL,
    '1/2 ч.л. Кокосово масло (прави шоколада по-течен за писане, но го оставя твърд след застиване).',
    NULL,
    NULL,
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Хрупкав Орех' AND recipe_role_id = 4),
    NULL,
    'Сурови орехови ядки: 120 – 150 г (за обилно покриване на горната част и страните).',
    NULL,
    NULL,
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Хрупкав Орех' AND recipe_role_id = 4),
    NULL,
    'Основа: Тортата трябва да е предварително измазана с тънък слой лепкав крем (напр. маслено-кремообразен или ганаш), за да полепнат ядките.',
    NULL,
    NULL,
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Класически Гараш' AND recipe_role_id = 4),
    NULL,
    'По желание: 1 капка масло от шамфъстък за подсилване на аромата.',
    NULL,
    NULL,
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бадемов облак' AND recipe_role_id = 4),
    NULL,
    'Филирани бадеми: 40–50 г.',
    NULL,
    NULL,
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бадемов облак' AND recipe_role_id = 4),
    NULL,
    'Основа: Светъл кето крем (например ванилов маскарпоне крем или крем сирене с масло).',
    NULL,
    NULL,
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бадемов облак' AND recipe_role_id = 4),
    NULL,
    'По избор: Малко еритритол на прах за поръсване.',
    NULL,
    NULL,
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Черна гора' AND recipe_role_id = 4),
    NULL,
    'Алтернатива: Ако черешите не са в сезон, могат да се използват малини.',
    NULL,
    NULL,
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов дует' AND recipe_role_id = 4),
    NULL,
    'Тъмен кето шоколад (минимум 75% какао): 60 г.',
    NULL,
    NULL,
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов дует' AND recipe_role_id = 4),
    NULL,
    'Бял кето шоколад (подсладен с еритритол/стевия): 30 г.',
    NULL,
    NULL,
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов дует' AND recipe_role_id = 4),
    NULL,
    'Основа: Тортата трябва да е измазана с лепкав крем (шоколадов мус или ванилов маскарпоне), за да се закрепят стружките.',
    NULL,
    NULL,
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Цъфтяща нощ' AND recipe_role_id = 4),
    NULL,
    'Основа: Кето шоколадов ганаш (използвай рецептата от торта „Сахер“: 100 г кето шоколад + 100 мл сметана).',
    NULL,
    NULL,
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Цъфтяща нощ' AND recipe_role_id = 4),
    NULL,
    'Ядливи цветя: 8-10 броя (на снимката виждаме теменужки/виолки и малки венчелистчета от рози).',
    NULL,
    NULL,
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Цъфтяща нощ' AND recipe_role_id = 4),
    NULL,
    'Прясна мента: 5-6 малки листенца за „зелен“ акцент.',
    NULL,
    NULL,
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Цъфтяща нощ' AND recipe_role_id = 4),
    NULL,
    'Специфичен инструмент: Малка сладкарска палета или гърба на чаена лъжица.',
    NULL,
    NULL,
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Натурална дъга' AND recipe_role_id = 4),
    NULL,
    'Маскарпоне (на стайна температура).',
    80.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Натурална дъга' AND recipe_role_id = 4),
    NULL,
    'Краве масло (много меко).',
    40.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Натурална дъга' AND recipe_role_id = 4),
    NULL,
    'Еритритол на прах (фино смлян).',
    1.0,
    'с.л',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Натурална дъга' AND recipe_role_id = 4),
    NULL,
    'Натурални пигменти:',
    NULL,
    NULL,
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Натурална дъга' AND recipe_role_id = 4),
    NULL,
    'Жълто: 1/2 ч.л. Куркума (не се притеснявай, вкусът не се усеща в това количество).',
    NULL,
    NULL,
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Натурална дъга' AND recipe_role_id = 4),
    NULL,
    'Червено: 1 ч.л. Прах от червено цвекло.',
    NULL,
    NULL,
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Натурална дъга' AND recipe_role_id = 4),
    NULL,
    'Синьо: 1/2 ч.л. Синя спирулина.',
    NULL,
    NULL,
    7
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Натурална дъга' AND recipe_role_id = 4),
    NULL,
    'Няколко цели плодчета (напр. касис или малки топчета крем, оцветени в червено) за „точките“ в дизайна.',
    NULL,
    NULL,
    8
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Празнични балони' AND recipe_role_id = 4),
    NULL,
    'Маскарпоне (студено).',
    100.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Празнични балони' AND recipe_role_id = 4),
    NULL,
    'Меко краве масло.',
    50.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Празнични балони' AND recipe_role_id = 4),
    NULL,
    'Еритритол на прах (задължително пресят през фино сито).',
    1.0,
    'с.л',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Празнични балони' AND recipe_role_id = 4),
    NULL,
    'Натурални бои: Куркума (жълто), прах от цвекло (розово/червено), синя спирулина (синьо).',
    NULL,
    NULL,
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кадифени трохи' AND recipe_role_id = 4),
    NULL,
    'Кето блат „Червено кадифе“: (предварително изпечен и охладен).',
    1.0,
    'брой',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кадифени трохи' AND recipe_role_id = 4),
    NULL,
    'Бял Кето крем: около 150-200 г (Маскарпоне и сметана), за да имаме лепкава повърхност отгоре.',
    NULL,
    NULL,
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кадифени трохи' AND recipe_role_id = 4),
    NULL,
    'Инструмент: Ситно ренде или кухненски блендер.',
    NULL,
    NULL,
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кадифени трохи с Кармин' AND recipe_role_id = 4),
    NULL,
    'Кето блат: приготвен с натурален кармин за дълбок червен цвят.',
    1.0,
    'брой',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кадифени трохи с Кармин' AND recipe_role_id = 4),
    NULL,
    'Бял кремообразен слой: (Маскарпоне + еритритол) за основа.',
    150.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кадифени трохи с Кармин' AND recipe_role_id = 4),
    NULL,
    'Натурален кармин: (ако потребителят го добавя допълнително към трохите за по-силен ефект).',
    NULL,
    NULL,
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Снежни розети' AND recipe_role_id = 4),
    NULL,
    'Стабилен Кето Крем за пош: * 200 г Маскарпоне (много студено).',
    NULL,
    NULL,
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Снежни розети' AND recipe_role_id = 4),
    NULL,
    'Млечна сметана 35% (студена).',
    100.0,
    'мл',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Снежни розети' AND recipe_role_id = 4),
    NULL,
    'Еритритол на прах (фино смлян).',
    35.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Снежни розети' AND recipe_role_id = 4),
    NULL,
    'Ванилия.',
    NULL,
    NULL,
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Снежни розети' AND recipe_role_id = 4),
    NULL,
    'По желание: Щипка кокосови стърготини за поръсване на борда (както е на снимката).',
    NULL,
    NULL,
    5
  )
;

-- Total: 48 materials