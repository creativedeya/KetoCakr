-- ============================================================
-- File: 21_INSERT_FILLING_INGREDIENTS.sql
-- Project: KetoCakR | Date: 2026-04-06
-- Description: Parsed ingredients for 23 filling recipes
-- NOTE: ingredient_database_id = NULL (link manually in admin)
-- ============================================================

INSERT INTO recipe_ingredients (
  recipe_id, ingredient_database_id, ingredient_name, quantity, unit, order_index
)
VALUES
  (
    (SELECT id FROM base_recipes WHERE name = 'Кули' AND recipe_role_id = 3),
    NULL,
    'плодово пюре (пасирани и прецедени ягоди или малини)',
    350.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кули' AND recipe_role_id = 3),
    NULL,
    'еритритол пудра',
    70.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кули' AND recipe_role_id = 3),
    NULL,
    'желатин на прах (за стабилност при рязане)',
    10.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кули' AND recipe_role_id = 3),
    NULL,
    'студена вода (за набъбване на желатина)',
    60.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кули' AND recipe_role_id = 3),
    NULL,
    'лимонов сок (за цвят и баланс)',
    10.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Конфи' AND recipe_role_id = 3),
    NULL,
    'плодово пюре (може да оставиш малки парченца плод за текстура)',
    350.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Конфи' AND recipe_role_id = 3),
    NULL,
    'еритритол пудра',
    60.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Конфи' AND recipe_role_id = 3),
    NULL,
    'Пектин NH (около 2-2.5% от масата)',
    8.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Конфи' AND recipe_role_id = 3),
    NULL,
    'лимонов сок',
    10.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Конфи' AND recipe_role_id = 3),
    NULL,
    'щипка ванилия (по желание)',
    NULL,
    NULL,
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадово Креме' AND recipe_role_id = 3),
    NULL,
    'ядково или краве мляко',
    200.0,
    'мл',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадово Креме' AND recipe_role_id = 3),
    NULL,
    '(размер L)',
    4.0,
    'жълтъка',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадово Креме' AND recipe_role_id = 3),
    NULL,
    'еритритол пудра',
    40.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадово Креме' AND recipe_role_id = 3),
    NULL,
    'черен шоколад без захар (мин. 70% какао)',
    100.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадово Креме' AND recipe_role_id = 3),
    NULL,
    'желатин (набъбнал в 24 г студена вода)',
    4.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадово Креме' AND recipe_role_id = 3),
    NULL,
    'меко краве масло (добавя се накрая)',
    40.0,
    'г',
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бяла Намелака' AND recipe_role_id = 3),
    NULL,
    'мляко',
    200.0,
    'мл',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бяла Намелака' AND recipe_role_id = 3),
    NULL,
    '4 жълтъка',
    NULL,
    NULL,
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бяла Намелака' AND recipe_role_id = 3),
    NULL,
    'еритритол пудра',
    40.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бяла Намелака' AND recipe_role_id = 3),
    NULL,
    'желатин (набъбнал в 24 г студена вода)',
    4.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бяла Намелака' AND recipe_role_id = 3),
    NULL,
    'бял шоколад без захар (настърган или на капки)',
    120.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бяла Намелака' AND recipe_role_id = 3),
    NULL,
    'меко краве масло',
    60.0,
    'г',
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бяла Намелака' AND recipe_role_id = 3),
    NULL,
    'Ванилия (шушулка или екстракт)',
    NULL,
    NULL,
    7
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 1 (lowcarb)' AND recipe_role_id = 3),
    NULL,
    'почистени круши (сорт Конференс или Аббате Фетел са най-добри)',
    350.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 1 (lowcarb)' AND recipe_role_id = 3),
    NULL,
    'еритритол пудра (в зависимост от сладостта на плода)',
    60.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 1 (lowcarb)' AND recipe_role_id = 3),
    NULL,
    'Агар-агар (около 1 равна ч.л.)',
    4.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 1 (lowcarb)' AND recipe_role_id = 3),
    NULL,
    'лимонов сок (предотвратява потъмняването на крушата и балансира сладостта)',
    20.0,
    'мл',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 1 (lowcarb)' AND recipe_role_id = 3),
    NULL,
    'Щипка канела или джинджифил (крушата ги обожава!)',
    NULL,
    NULL,
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 2' AND recipe_role_id = 3),
    NULL,
    'яйца (L) + 2 жълтъка',
    2.0,
    'цели',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 2' AND recipe_role_id = 3),
    NULL,
    'еритритол пудра',
    120.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 2' AND recipe_role_id = 3),
    NULL,
    'прясно изцеден лимонов сок (около 2-3 лимона)',
    100.0,
    'мл',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 2' AND recipe_role_id = 3),
    NULL,
    'Настъргана кора от 1 био лимон',
    NULL,
    NULL,
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 2' AND recipe_role_id = 3),
    NULL,
    'краве масло (студено, нарязано на кубчета)',
    90.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 2' AND recipe_role_id = 3),
    NULL,
    'По желание: 2 г желатин (набъбнал в 12 г вода) – само ако се ползва за плънка в торта.',
    NULL,
    NULL,
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 3' AND recipe_role_id = 3),
    NULL,
    'плодове (малини, ягоди, къпини или почистен портокал)',
    350.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 3' AND recipe_role_id = 3),
    NULL,
    'еритритол пудра',
    70.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 3' AND recipe_role_id = 3),
    NULL,
    'Агар-агар (около 1 пълна ч.л.)',
    4.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 3' AND recipe_role_id = 3),
    NULL,
    'лимонов сок (за цвят и блясък)',
    10.0,
    'мл',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 3' AND recipe_role_id = 3),
    NULL,
    'вода (само ако плодовете не са много сочни)',
    30.0,
    'мл',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плодов мус' AND recipe_role_id = 3),
    NULL,
    'млечна сметана (33-35%, много студена)',
    300.0,
    'мл',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плодов мус' AND recipe_role_id = 3),
    NULL,
    'плодово пюре (маракуя, ягоди, малини или пасирани кайсии)',
    100.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плодов мус' AND recipe_role_id = 3),
    NULL,
    'еритритол пудра',
    80.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плодов мус' AND recipe_role_id = 3),
    NULL,
    'лимонов сок (важен за стабилизиране на сметаната и вкуса)',
    35.0,
    'мл',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плодов мус' AND recipe_role_id = 3),
    NULL,
    'желатин на прах',
    10.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плодов мус' AND recipe_role_id = 3),
    NULL,
    'студена вода (за желатина)',
    50.0,
    'мл',
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плодов мус' AND recipe_role_id = 3),
    NULL,
    'Плодова база: Смесете плодовото пюре с еритритола и лимоновия сок. Загрейте ги леко в касерола (до около 50-60°C), докато еритритолът се разтвори. Не варите!',
    NULL,
    NULL,
    7
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плънка Матча' AND recipe_role_id = 3),
    NULL,
    'млечна сметана (33-35%)',
    300.0,
    'мл',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плънка Матча' AND recipe_role_id = 3),
    NULL,
    'еритритол пудра',
    80.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плънка Матча' AND recipe_role_id = 3),
    NULL,
    'чай матча (за по-наситен цвят и вкус)',
    10.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плънка Матча' AND recipe_role_id = 3),
    NULL,
    'желатин на прах',
    10.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плънка Матча' AND recipe_role_id = 3),
    NULL,
    'студена вода',
    60.0,
    'мл',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Лате' AND recipe_role_id = 3),
    NULL,
    'крема сирене (тип Филаделфия, стайна температура)',
    125.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Лате' AND recipe_role_id = 3),
    NULL,
    'млечна сметана (33-35%)',
    200.0,
    'мл',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Лате' AND recipe_role_id = 3),
    NULL,
    'еритритол пудра',
    70.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Лате' AND recipe_role_id = 3),
    NULL,
    'инстантно кафе (фино, тип "espresso gold")',
    10.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Лате' AND recipe_role_id = 3),
    NULL,
    'Агар-агар (увеличавам го с 1 г, тъй като млечните мазнини понякога "отпускат" агара)',
    4.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Лате' AND recipe_role_id = 3),
    NULL,
    'гореща вода (за разтваряне на кафето)',
    20.0,
    'мл',
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Лате' AND recipe_role_id = 3),
    NULL,
    'Кафе паста: Разтворете инстантното кафе в 20 мл гореща вода. Това гарантира, че няма да има тъмни точки/песъчинки в муса.',
    NULL,
    NULL,
    7
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Лате' AND recipe_role_id = 3),
    NULL,
    'Варене с Агар: Поръсете агар-агара отгоре. Увеличете огъня и оставете сместа да заври, като бъркате енергично. Варете точно 2 минути на умерен огън.',
    NULL,
    NULL,
    8
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 4 (lowcarb)' AND recipe_role_id = 3),
    NULL,
    'филета от портокал (чисто месо, без ципи и семки)',
    350.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 4 (lowcarb)' AND recipe_role_id = 3),
    NULL,
    'еритритол пудра',
    65.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 4 (lowcarb)' AND recipe_role_id = 3),
    NULL,
    'желатин на прах (за по-сигурна стабилност)',
    7.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 4 (lowcarb)' AND recipe_role_id = 3),
    NULL,
    'студена вода (за желатина)',
    42.0,
    'мл',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 4 (lowcarb)' AND recipe_role_id = 3),
    NULL,
    'лимонов сок (за да „светне“ вкусът на портокала)',
    10.0,
    'мл',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Мармелад' AND recipe_role_id = 3),
    NULL,
    'плодово пюре (кайсия, ягода, малина, вишна)',
    170.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Мармелад' AND recipe_role_id = 3),
    NULL,
    'вода',
    170.0,
    'мл',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Мармелад' AND recipe_role_id = 3),
    NULL,
    'еритритол пудра',
    50.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Мармелад' AND recipe_role_id = 3),
    NULL,
    'Пектин (за предпочитане Пектин NH за стабилност)',
    10.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Мармелад' AND recipe_role_id = 3),
    NULL,
    'желатин (набъбнал в 30 мл студена вода)',
    5.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Мармелад' AND recipe_role_id = 3),
    NULL,
    'лимонов сок (задължителен за активиране на пектина)',
    5.0,
    'мл',
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Карамелизиран кокос' AND recipe_role_id = 3),
    NULL,
    'свеж кокосов орех (настърган на едро ренде или нарязан на тънки ленти с белачка за картофи)',
    1.0,
    'бр',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Карамелизиран кокос' AND recipe_role_id = 3),
    NULL,
    'Алулоза (задължително за цвят и лепкавост) или Еритритол GOLD',
    50.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Карамелизиран кокос' AND recipe_role_id = 3),
    NULL,
    'краве масло или кокосово масло (за веган вариант)',
    30.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Карамелизиран кокос' AND recipe_role_id = 3),
    NULL,
    '1/2 ч.л. морска сол (засилва кокосовия аромат)',
    NULL,
    NULL,
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Карамелизиран кокос' AND recipe_role_id = 3),
    NULL,
    'Щипка ванилия.',
    NULL,
    NULL,
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Супер Кокос' AND recipe_role_id = 3),
    NULL,
    'кокосово мляко (от консерва)',
    300.0,
    'мл',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Супер Кокос' AND recipe_role_id = 3),
    NULL,
    '(L)',
    2.0,
    'жълтъка',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Супер Кокос' AND recipe_role_id = 3),
    NULL,
    'еритритол пудра',
    70.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Супер Кокос' AND recipe_role_id = 3),
    NULL,
    'фини кокосови стърготини',
    15.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Супер Кокос' AND recipe_role_id = 3),
    NULL,
    'желатин + 60 мл студена вода',
    10.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Супер Кокос' AND recipe_role_id = 3),
    NULL,
    'разбита млечна сметана (33-35%) – за ефирност.',
    150.0,
    'мл',
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамел' AND recipe_role_id = 3),
    NULL,
    'краве масло (мин. 82%)',
    100.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамел' AND recipe_role_id = 3),
    NULL,
    'Алулоза (за по-гъст карамел сложи 80 г)',
    60.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамел' AND recipe_role_id = 3),
    NULL,
    'течна сметана (30-35%, гореща)',
    100.0,
    'мл',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамел' AND recipe_role_id = 3),
    NULL,
    'Щипка морска сол (за Salted Caramel)',
    NULL,
    NULL,
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамел' AND recipe_role_id = 3),
    NULL,
    'желатин + 30 мл вода (само ако искаш стабилен диск за плънка).',
    5.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов Крем Англез' AND recipe_role_id = 3),
    NULL,
    'течна млечна сметана (33-35%)',
    250.0,
    'мл',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов Крем Англез' AND recipe_role_id = 3),
    NULL,
    'жълтъка (L)',
    3.0,
    'големи',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов Крем Англез' AND recipe_role_id = 3),
    NULL,
    'еритритол пудра',
    50.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов Крем Англез' AND recipe_role_id = 3),
    NULL,
    'ванилова шушулка или качествен екстракт',
    1.0,
    'бр',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов Крем Англез' AND recipe_role_id = 3),
    NULL,
    'Щипка сол (изостря вкуса на ванилията).',
    NULL,
    NULL,
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов Крем Англез' AND recipe_role_id = 3),
    NULL,
    'Тестът "Lapping": Гответе до 82°C. Кремът е готов, когато покрие гърба на лъжицата и ако прокарате пръст по нея, остане ясна и чиста следа (това се нарича nappe).',
    NULL,
    NULL,
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Заварен крем' AND recipe_role_id = 3),
    NULL,
    '(размер L)',
    6.0,
    'жълтъка',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Заварен крем' AND recipe_role_id = 3),
    NULL,
    'еритритол пудра (зависи колко сладко обичате)',
    80.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Заварен крем' AND recipe_role_id = 3),
    NULL,
    'млечна сметана (33-35%)',
    180.0,
    'мл',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Заварен крем' AND recipe_role_id = 3),
    NULL,
    'ванилов или бадемов екстракт',
    5.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Заварен крем' AND recipe_role_id = 3),
    NULL,
    'Шеф добавка за стабилност: 80 г студено краве масло (добавя се след сваряването).',
    NULL,
    NULL,
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Плодов Кърд' AND recipe_role_id = 3),
    NULL,
    'плодово пюре (ягоди, малини, боровинки или лимон/лайм)',
    180.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Плодов Кърд' AND recipe_role_id = 3),
    NULL,
    '(L)',
    6.0,
    'жълтъка',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Плодов Кърд' AND recipe_role_id = 3),
    NULL,
    'еритритол пудра',
    80.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Плодов Кърд' AND recipe_role_id = 3),
    NULL,
    'студено краве масло (добавя се накрая за копринен финиш).',
    80.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 5' AND recipe_role_id = 3),
    NULL,
    'Черен Ганаш: 200 мл сметана (35%) + 200 г черен шоколад (85%) – Класическо 1:1 за стабилност.',
    NULL,
    NULL,
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 5' AND recipe_role_id = 3),
    NULL,
    'Бял Ганаш: 150 мл сметана (35%) + 300 г бял кето шоколад.',
    NULL,
    NULL,
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 5' AND recipe_role_id = 3),
    NULL,
    'Опция за пухкавост: След 4 часа в хладилника, разбийте студения ганаш с миксер за 1 минута. Ще получите "Разбит ганаш" (Whipped Ganache), който е идеален за шприцоване на розички.',
    NULL,
    NULL,
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 6' AND recipe_role_id = 3),
    NULL,
    'сметана (част 1 - за загряване)',
    100.0,
    'мл',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 6' AND recipe_role_id = 3),
    NULL,
    'сметана (част 2 - студена)',
    200.0,
    'мл',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 6' AND recipe_role_id = 3),
    NULL,
    'кето шоколад (бял или черен)',
    100.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 6' AND recipe_role_id = 3),
    NULL,
    'желатин + 12 мл студена вода',
    2.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 6' AND recipe_role_id = 3),
    NULL,
    'еритритол пудра (само ако шоколадът е много горчив).',
    30.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Шантили' AND recipe_role_id = 3),
    NULL,
    'млечна сметана (33-35% масленост, ледено студена)',
    300.0,
    'мл',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Шантили' AND recipe_role_id = 3),
    NULL,
    'еритритол пудра (90 г може да дойде твърде сладко при липса на плодове)',
    60.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Шантили' AND recipe_role_id = 3),
    NULL,
    'истински ванилов екстракт или семена от шушулка',
    1.0,
    'ч.л',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Шантили' AND recipe_role_id = 3),
    NULL,
    'Опция за стабилност (Шеф трик): Добавете 100 г студено Маскарпоне. Това прави крема „Шантили-Маскарпоне“, който е много по-издръжлив и подходящ за измазване на торта.',
    NULL,
    NULL,
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Крем със заквасена сметана' AND recipe_role_id = 3),
    NULL,
    'заквасена сметана (минимум 25-30% масленост, ледено студена)',
    400.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Крем със заквасена сметана' AND recipe_role_id = 3),
    NULL,
    'еритритол пудра (150 г може да прекъсне баланса на киселинността)',
    100.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Крем със заквасена сметана' AND recipe_role_id = 3),
    NULL,
    'ванилия или настъргана лимонова кора.',
    1.0,
    'ч.л',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Стабилен Розов Крем' AND recipe_role_id = 3),
    NULL,
    'Маскарпоне (ледено студено)',
    250.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Стабилен Розов Крем' AND recipe_role_id = 3),
    NULL,
    'Течна сметана (33-35% масленост, ледено студена)',
    200.0,
    'мл',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Стабилен Розов Крем' AND recipe_role_id = 3),
    NULL,
    'Еритритол пудра (пресят)',
    50.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Стабилен Розов Крем' AND recipe_role_id = 3),
    NULL,
    'Вода от рози (без захар)',
    15.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Стабилен Розов Крем' AND recipe_role_id = 3),
    NULL,
    'Щипка ванилия (помага на розата да изпъкне).',
    NULL,
    NULL,
    5
  )
;

-- Total: 121 ingredients (27 instruction lines removed)