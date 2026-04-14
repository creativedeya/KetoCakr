-- ============================================================
-- File: 51_INSERT_ALL_BASE_INGREDIENTS.sql
-- Project: KetoCakR | Date: 2026-04-07
-- Description: Ingredients for 22 base recipes
-- ============================================================

INSERT INTO recipe_ingredients (
  recipe_id, ingredient_database_id, ingredient_name, quantity, unit, order_index
)
VALUES
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов въздушен кето блат' AND recipe_role_id = 1),
    NULL,
    'За белтъчния сняг (Меренг):',
    NULL,
    NULL,
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов въздушен кето блат' AND recipe_role_id = 1),
    NULL,
    '6 белтъка (стайна температура)',
    6.0,
    NULL,
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов въздушен кето блат' AND recipe_role_id = 1),
    NULL,
    '90 г еритритол пудра (намалихме го леко за по-добра стабилност)',
    90.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов въздушен кето блат' AND recipe_role_id = 1),
    NULL,
    'Щипка сол или 1/4 ч.л. лимонена киселина (за стабилизиране на протеина)',
    NULL,
    NULL,
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов въздушен кето блат' AND recipe_role_id = 1),
    NULL,
    'За жълтъчната смес:',
    NULL,
    NULL,
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов въздушен кето блат' AND recipe_role_id = 1),
    NULL,
    '6 жълтъка',
    6.0,
    NULL,
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов въздушен кето блат' AND recipe_role_id = 1),
    NULL,
    '60 г еритритол пудра',
    60.0,
    'г',
    7
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов въздушен кето блат' AND recipe_role_id = 1),
    NULL,
    '1 ч.л. ванилов екстракт (за премахване на яйчния аромат)',
    1.0,
    'ч.л.',
    8
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов въздушен кето блат' AND recipe_role_id = 1),
    NULL,
    '70 г бадемово брашно (фино смляно)',
    70.0,
    'г',
    9
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов въздушен кето блат' AND recipe_role_id = 1),
    NULL,
    '10 г кокосово брашно',
    10.0,
    'г',
    10
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов въздушен кето блат' AND recipe_role_id = 1),
    NULL,
    '10 г псилиум хуск (фино смлян на брашно)',
    10.0,
    'г',
    11
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов въздушен кето блат' AND recipe_role_id = 1),
    NULL,
    '1 г ксантанова гума (задължителна тук!)',
    1.0,
    'г',
    12
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов пандишпан' AND recipe_role_id = 1),
    NULL,
    'Шоколадов пандишпан',
    NULL,
    NULL,
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов пандишпан' AND recipe_role_id = 1),
    NULL,
    'Шоколадов кекс: Замяната на 30% от брашното с какао ще направи тестото много сухо, защото какаото абсорбира много повече течност от бадемовото брашно.',
    NULL,
    NULL,
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов пандишпан' AND recipe_role_id = 1),
    NULL,
    'Шеф корекция: Ако добавяте какао, добавете и 30-50 мл бадемово мляко или течна сметана, за да балансирате влажността.',
    NULL,
    NULL,
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Брауни пандишпан' AND recipe_role_id = 1),
    NULL,
    'Брауни пандишпан',
    NULL,
    NULL,
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Брауни пандишпан' AND recipe_role_id = 1),
    NULL,
    'Заменете 20% от бадемовото брашно с какао на прах и го добавете към тестото заедно с другите сухи съставки.',
    NULL,
    NULL,
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Брауни пандишпан' AND recipe_role_id = 1),
    NULL,
    'След като добавите сухите съставки, добавете към тестото 50 г разтопен, но не горещ шоколад над 85% масленост без захар или същото количество бял шоколад без захар.',
    NULL,
    NULL,
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Брауни пандишпан' AND recipe_role_id = 1),
    NULL,
    'Добавяне',
    NULL,
    NULL,
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Цитрусов пандишпан' AND recipe_role_id = 1),
    NULL,
    'Цитрусов пандишпан',
    NULL,
    NULL,
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Цитрусов пандишпан' AND recipe_role_id = 1),
    NULL,
    'Добавете кора от портокал, лимон или лайм към сухите съставки. Количеството може да се коригира по ваш вкус.',
    NULL,
    NULL,
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Пандишпан с горски плодове' AND recipe_role_id = 1),
    NULL,
    'Пандишпан с горски плодове',
    NULL,
    NULL,
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Пандишпан с горски плодове' AND recipe_role_id = 1),
    NULL,
    'При разбиването на белтъците добавете 50 г сок от горски плодове.',
    NULL,
    NULL,
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Пандишпан с горски плодове' AND recipe_role_id = 1),
    NULL,
    'Оваляйте 80 г дребни горски плодове (череши, малини, боровинки, горски боровинки) в малко бадемово брашно, разделете тестото на няколко форми и добавете към пандишпана преди печене. В този случай не т',
    NULL,
    NULL,
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Орехов пандишпан' AND recipe_role_id = 1),
    NULL,
    'Орехов пандишпан',
    NULL,
    NULL,
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Орехов пандишпан' AND recipe_role_id = 1),
    NULL,
    'Добавете 30 г ситно смлени ядки към сухите съставки.',
    NULL,
    NULL,
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов кето кекс' AND recipe_role_id = 1),
    NULL,
    '140 г краве масло (меко, на стайна температура)',
    140.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов кето кекс' AND recipe_role_id = 1),
    NULL,
    '140 г еритритол (за предпочитане на пудра)',
    140.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов кето кекс' AND recipe_role_id = 1),
    NULL,
    '4 големи яйца (стайна температура)',
    4.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов кето кекс' AND recipe_role_id = 1),
    NULL,
    '110 г бадемово брашно',
    110.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов кето кекс' AND recipe_role_id = 1),
    NULL,
    '35 г кокосово брашно',
    35.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов кето кекс' AND recipe_role_id = 1),
    NULL,
    '1 с. л. псилиум хуск (фино смлян)',
    1.0,
    NULL,
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов кето кекс' AND recipe_role_id = 1),
    NULL,
    '1 ч. л. бакпулвер',
    1.0,
    NULL,
    7
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов кето кекс' AND recipe_role_id = 1),
    NULL,
    'Щипка сол',
    NULL,
    NULL,
    8
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов кекс' AND recipe_role_id = 1),
    NULL,
    'Шоколадов кекс',
    NULL,
    NULL,
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов кекс' AND recipe_role_id = 1),
    NULL,
    'Заменете 30% от бадемовото брашно с какао на прах и го добавете към тестото заедно с другите брашна.',
    NULL,
    NULL,
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Брауни кекс' AND recipe_role_id = 1),
    NULL,
    'Брауни',
    NULL,
    NULL,
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Брауни кекс' AND recipe_role_id = 1),
    NULL,
    'След като добавите сухите съставки, добавете към тестото 50 г разтопен, но не горещ шоколад поне 85% какаова масленост и без захар, може да използвате и бял кето шоколад без захар.',
    NULL,
    NULL,
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кекс с горски плодове' AND recipe_role_id = 1),
    NULL,
    'Кекс с горски плодове',
    NULL,
    NULL,
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кекс с горски плодове' AND recipe_role_id = 1),
    NULL,
    'Добавете 50 г замразени дребни горски плодове към тестото непосредствено преди печене.',
    NULL,
    NULL,
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кекс с горски плодове' AND recipe_role_id = 1),
    NULL,
    'Печете в две отделни форми.',
    NULL,
    NULL,
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Цитрусов кекс' AND recipe_role_id = 1),
    NULL,
    'Цитрусов кекс',
    NULL,
    NULL,
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Цитрусов кекс' AND recipe_role_id = 1),
    NULL,
    'Добавете кора от лайм, лимон или портокал към тестото заедно с брашното. Количеството може да се коригира по ваш вкус.',
    NULL,
    NULL,
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Орехов кекс' AND recipe_role_id = 1),
    NULL,
    'Орехов кекс',
    NULL,
    NULL,
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Орехов кекс' AND recipe_role_id = 1),
    NULL,
    'Добавете 60-80 г ситно счукани ядки заедно с брашната',
    NULL,
    NULL,
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1),
    NULL,
    '90 г еритритол (препоръчително на пудра)',
    90.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1),
    NULL,
    '40 г кокосово брашно',
    40.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1),
    NULL,
    '15 г кокосови стърготини',
    15.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1),
    NULL,
    '2 г ксантанова гума (задължителна за спойка)',
    2.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1),
    NULL,
    '70 г кокосово масло (разтопено и охладено до стайна температура)',
    70.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1),
    NULL,
    '4 бр. яйца (размер L), разделени на белтъци и жълтъци',
    4.0,
    'бр.',
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1),
    NULL,
    'щипка сол',
    NULL,
    NULL,
    7
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов блат' AND recipe_role_id = 1),
    NULL,
    '100 г еритритол (пудра)',
    100.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов блат' AND recipe_role_id = 1),
    NULL,
    '50 г бадемово брашно',
    50.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов блат' AND recipe_role_id = 1),
    NULL,
    '10 г кокосово брашно',
    10.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов блат' AND recipe_role_id = 1),
    NULL,
    '12 г псилиум хуск (фино смлян)',
    12.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов блат' AND recipe_role_id = 1),
    NULL,
    '2 г ксантанова гума',
    2.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов блат' AND recipe_role_id = 1),
    NULL,
    '5 г бакпулвер',
    5.0,
    'г',
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов блат' AND recipe_role_id = 1),
    NULL,
    '4 бр. яйца (размер L), разделени',
    4.0,
    'бр.',
    7
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов блат' AND recipe_role_id = 1),
    NULL,
    '30 г кокосово масло (разтопено и охладено)',
    30.0,
    'г',
    8
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов блат' AND recipe_role_id = 1),
    NULL,
    '5 г ванилов екстракт',
    5.0,
    'г',
    9
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов блат' AND recipe_role_id = 1),
    NULL,
    'щипка сол',
    NULL,
    NULL,
    10
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1),
    NULL,
    '110 г еритритол пудра (разделен на две)',
    110.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1),
    NULL,
    '70 г бадемово брашно',
    70.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1),
    NULL,
    '10 г кокосово брашно',
    10.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1),
    NULL,
    '10 г псилиум хуск (фино смлян)',
    10.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1),
    NULL,
    '2 г ксантанова гума',
    2.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1),
    NULL,
    '5 г бакпулвер',
    5.0,
    'г',
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1),
    NULL,
    '4 яйца (L), разделени',
    4.0,
    NULL,
    7
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1),
    NULL,
    '30 г лимонов сок (прясно изцеден)',
    30.0,
    'г',
    8
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1),
    NULL,
    'Настъргана кора от 1 био лимон',
    NULL,
    NULL,
    9
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1),
    NULL,
    '30 г разтопено кокосово масло или масло (охладено) – добавям го за мекота',
    30.0,
    'г',
    10
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1),
    NULL,
    'щипка сол',
    NULL,
    NULL,
    11
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Морковен блат' AND recipe_role_id = 1),
    NULL,
    '70 г еритритол пудра (разделен)',
    70.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Морковен блат' AND recipe_role_id = 1),
    NULL,
    '70 г бадемово брашно',
    70.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Морковен блат' AND recipe_role_id = 1),
    NULL,
    '10 г кокосово брашно',
    10.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Морковен блат' AND recipe_role_id = 1),
    NULL,
    '4 яйца (L), разделени',
    4.0,
    NULL,
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Морковен блат' AND recipe_role_id = 1),
    NULL,
    '10 г кокосово масло (разтопено и охладено)',
    10.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Морковен блат' AND recipe_role_id = 1),
    NULL,
    '50 г орехи или пекан (нарязани, не на брашно)',
    50.0,
    'г',
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Морковен блат' AND recipe_role_id = 1),
    NULL,
    '120 г моркови (настъргани на ситно и леко изстискани)',
    120.0,
    'г',
    7
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Морковен блат' AND recipe_role_id = 1),
    NULL,
    'Подправки: 1 ч.л. канела, 1/2 ч.л. джинджифил, 1/4 ч.л. кардамон',
    NULL,
    NULL,
    8
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Морковен блат' AND recipe_role_id = 1),
    NULL,
    '2 г ксантанова гума (около 1/2 ч.л.)',
    2.0,
    'г',
    9
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Морковен блат' AND recipe_role_id = 1),
    NULL,
    '1 ч.л. бакпулвер (добавям го за стабилност)',
    1.0,
    'ч.л.',
    10
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Морковен блат' AND recipe_role_id = 1),
    NULL,
    'щипка сол',
    NULL,
    NULL,
    11
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Маслен морковен блат' AND recipe_role_id = 1),
    NULL,
    '80 г еритритол пудра',
    80.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Маслен морковен блат' AND recipe_role_id = 1),
    NULL,
    '200 г бадемово брашно',
    200.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Маслен морковен блат' AND recipe_role_id = 1),
    NULL,
    '20 г кокосово брашно (Добавям го, за да абсорбира влагата от 300 г моркови)',
    20.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Маслен морковен блат' AND recipe_role_id = 1),
    NULL,
    '3 яйца (L) – стайна температура',
    3.0,
    NULL,
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Маслен морковен блат' AND recipe_role_id = 1),
    NULL,
    '150 г краве масло – много меко',
    150.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Маслен морковен блат' AND recipe_role_id = 1),
    NULL,
    '100 г орехи или пекан (едро нарязани)',
    100.0,
    'г',
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Маслен морковен блат' AND recipe_role_id = 1),
    NULL,
    '300 г моркови (фино настъргани и добре изцедени)',
    300.0,
    'г',
    7
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Маслен морковен блат' AND recipe_role_id = 1),
    NULL,
    'Подправки: 1 ч.л. канела, 1 ч.л. джинджифил, 1/2 ч.л. кардамон',
    NULL,
    NULL,
    8
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Маслен морковен блат' AND recipe_role_id = 1),
    NULL,
    '1 ч.л. бакпулвер (Задължително!)',
    1.0,
    'ч.л.',
    9
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Маслен морковен блат' AND recipe_role_id = 1),
    NULL,
    '1/2 ч.л. ксантанова гума',
    1.0,
    NULL,
    10
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Маслен морковен блат' AND recipe_role_id = 1),
    NULL,
    'щипка сол',
    NULL,
    NULL,
    11
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов блат Rich' AND recipe_role_id = 1),
    NULL,
    '120 г еритритол пудра',
    120.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов блат Rich' AND recipe_role_id = 1),
    NULL,
    '150 г меко краве масло (мин. 82%)',
    150.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов блат Rich' AND recipe_role_id = 1),
    NULL,
    '4 яйца (размер L) – стайна температура',
    4.0,
    NULL,
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов блат Rich' AND recipe_role_id = 1),
    NULL,
    '50 г течна готварска сметана (30-35% масленост)',
    50.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов блат Rich' AND recipe_role_id = 1),
    NULL,
    '30 мл горещо кафе или вряла вода (Тайната на сочния шоколадов блат!)',
    30.0,
    'мл',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов блат Rich' AND recipe_role_id = 1),
    NULL,
    '60 г бадемово брашно',
    60.0,
    'г',
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов блат Rich' AND recipe_role_id = 1),
    NULL,
    '60 г качествено какао',
    60.0,
    'г',
    7
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов блат Rich' AND recipe_role_id = 1),
    NULL,
    '10 г бакпулвер (около 2 ч.л.)',
    10.0,
    'г',
    8
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов блат Rich' AND recipe_role_id = 1),
    NULL,
    'щипка сол',
    NULL,
    NULL,
    9
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бадемов блат Swedish Style' AND recipe_role_id = 1),
    NULL,
    '6 белтъка (L) – стайна температура',
    6.0,
    NULL,
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бадемов блат Swedish Style' AND recipe_role_id = 1),
    NULL,
    '140 г бадемово брашно (фино)',
    140.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бадемов блат Swedish Style' AND recipe_role_id = 1),
    NULL,
    '70 г еритритол пудра',
    70.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бадемов блат Swedish Style' AND recipe_role_id = 1),
    NULL,
    '2 г ксантанова гума (около 1/2 ч.л.)',
    2.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бадемов блат Swedish Style' AND recipe_role_id = 1),
    NULL,
    '1/4 ч.л. сол (намалихме я, за да не доминира)',
    1.0,
    NULL,
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бадемов блат Swedish Style' AND recipe_role_id = 1),
    NULL,
    'няколко капки лимонов сок (за стабилност)',
    NULL,
    NULL,
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Гараш' AND recipe_role_id = 1),
    NULL,
    '6 белтъка (L) – стайна температура',
    6.0,
    NULL,
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Гараш' AND recipe_role_id = 1),
    NULL,
    '200 г орехи (фино смлени, но сухи)',
    200.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Гараш' AND recipe_role_id = 1),
    NULL,
    '100 г еритритол пудра',
    100.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Гараш' AND recipe_role_id = 1),
    NULL,
    '2 г ксантанова гума (1/2 ч.л.)',
    2.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Гараш' AND recipe_role_id = 1),
    NULL,
    'Щипка сол',
    NULL,
    NULL,
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Гараш' AND recipe_role_id = 1),
    NULL,
    'Няколко капки лимонов сок',
    NULL,
    NULL,
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Брауни блат без брашно' AND recipe_role_id = 1),
    NULL,
    '100 г натурален шоколад без захар (мин. 70% какао)',
    100.0,
    'г',
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Брауни блат без брашно' AND recipe_role_id = 1),
    NULL,
    '100 г краве масло (мин. 82% масленост)',
    100.0,
    'г',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Брауни блат без брашно' AND recipe_role_id = 1),
    NULL,
    '6 яйца (L) – задължително на стайна температура',
    6.0,
    NULL,
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Брауни блат без брашно' AND recipe_role_id = 1),
    NULL,
    '100 г еритритол пудра',
    100.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Брауни блат без брашно' AND recipe_role_id = 1),
    NULL,
    'Щипка сол и 1 ч.л. ванилов екстракт',
    NULL,
    NULL,
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Сахер' AND recipe_role_id = 1),
    NULL,
    '4 яйца (L), разделени',
    4.0,
    NULL,
    1
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Сахер' AND recipe_role_id = 1),
    NULL,
    '80 мл бадемово или краве мляко',
    80.0,
    'мл',
    2
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Сахер' AND recipe_role_id = 1),
    NULL,
    '30 г шоколад (85%+) или какаова маса',
    30.0,
    'г',
    3
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Сахер' AND recipe_role_id = 1),
    NULL,
    '15 г краве масло (добавям го за автентичност)',
    15.0,
    'г',
    4
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Сахер' AND recipe_role_id = 1),
    NULL,
    '20 г какао на прах',
    20.0,
    'г',
    5
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Сахер' AND recipe_role_id = 1),
    NULL,
    '35 г кокосово брашно',
    35.0,
    'г',
    6
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Сахер' AND recipe_role_id = 1),
    NULL,
    '70 г еритритол пудра',
    70.0,
    'г',
    7
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Сахер' AND recipe_role_id = 1),
    NULL,
    '2 г сода за хляб',
    2.0,
    'г',
    8
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Сахер' AND recipe_role_id = 1),
    NULL,
    '10 г лимонов сок',
    10.0,
    'г',
    9
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Сахер' AND recipe_role_id = 1),
    NULL,
    'щипка сол',
    NULL,
    NULL,
    10
  )
;

-- Total: 131 ingredients