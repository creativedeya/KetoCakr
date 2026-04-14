-- ============================================================
-- File: 50_INSERT_ALL_BASE_RECIPES.sql
-- Project: KetoCakR | Date: 2026-04-07
-- Description: 22 cake base recipes (recipe_role_id = 1)
-- ============================================================

INSERT INTO base_recipes (
  recipe_role_id, name, name_en,
  description, description_en,
  ingredients_text_bg, ingredients_text_en,
  difficulty_level, prep_time_minutes, bake_time_minutes, servings
)
VALUES
  (1, 'Базов въздушен кето блат', 'Basic Airy Keto Base',
   '- Базова рецепта за въздушни кето блатове (Ревизирана)',
   '- Basic recipe for airy keto layers (Revised)',
   'За белтъчния сняг (Меренг):
6 белтъка (стайна температура)
90 г еритритол пудра (намалихме го леко за по-добра стабилност)
Щипка сол или 1/4 ч.л. лимонена киселина (за стабилизиране на протеина)
За жълтъчната смес:
6 жълтъка
60 г еритритол пудра
1 ч.л. ванилов екстракт (за премахване на яйчния аромат)
70 г бадемово брашно (фино смляно)
10 г кокосово брашно
10 г псилиум хуск (фино смлян на брашно)
1 г ксантанова гума (задължителна тук!)',
   'For the egg white foam (Meringue):
6 egg whites (room temperature)
90 g powdered erythritol (slightly reduced for better stability)
A pinch of salt or 1/4 tsp citric acid (for stabilizing the protein)
For the yolk mixture:
6 egg yolks
60 g powdered erythritol
1 tsp vanilla extract (to eliminate the egg flavor)
70 g almond flour (finely ground)
10 g coconut flour
10 g psyllium husk (finely ground into flour)
1 g xanthan gum (mandatory here!)',
   3, 25, 40, 8),
  (1, 'Шоколадов пандишпан', 'Chocolate Sponge Cake',
   'Вариант на Базов въздушен кето блат: Шоколадов пандишпан
Шоколадов кекс: Замяната на 30% от брашното с какао ще направи тестото много сухо, защото какаото абсорбира много повече течност от бадемовото брашно.

Шеф корекция: Ако добавяте к',
   'Variant of Basic Airy Keto Sponge: Chocolate Biscuit',
   'Шоколадов пандишпан
Шоколадов кекс: Замяната на 30% от брашното с какао ще направи тестото много сухо, защото какаото абсорбира много повече течност от бадемовото брашно.

Шеф корекция: Ако добавяте какао, добавете и 30-50 мл бадемово мляко или течна сметана, за да балансирате влажността.',
   'Chocolate sponge cake',
   3, 25, 40, 8),
  (1, 'Брауни пандишпан', 'Brownie Sponge',
   'Вариант на Базов въздушен кето блат: Брауни пандишпан

Заменете 20% от бадемовото брашно с какао на прах и го добавете към тестото заедно с другите сухи съставки.

След като добавите сухите съставки, добавете към тестото 50 г разтопен, н',
   'Variant of Basic Airy Keto Sponge: Brownie Biscuit',
   'Брауни пандишпан

Заменете 20% от бадемовото брашно с какао на прах и го добавете към тестото заедно с другите сухи съставки.

След като добавите сухите съставки, добавете към тестото 50 г разтопен, но не горещ шоколад над 85% масленост без захар или същото количество бял шоколад без захар.
Добавяне',
   'Brownie sponge cake',
   3, 25, 40, 8),
  (1, 'Цитрусов пандишпан', 'Citrus Sponge Cake',
   'Вариант на Базов въздушен кето блат: Цитрусов пандишпан

Добавете кора от портокал, лимон или лайм към сухите съставки. Количеството може да се коригира по ваш вкус.',
   'Variation of Basic Airy Keto Sponge: Citrus Sponge Cake',
   'Цитрусов пандишпан

Добавете кора от портокал, лимон или лайм към сухите съставки. Количеството може да се коригира по ваш вкус.',
   'Citrus sponge cake',
   2, 25, 40, 8),
  (1, 'Пандишпан с горски плодове', 'Berry Sponge Cake',
   'Вариант на Базов въздушен кето блат: Пандишпан с горски плодове

При разбиването на белтъците добавете 50 г сок от горски плодове.

Оваляйте 80 г дребни горски плодове (череши, малини, боровинки, горски боровинки) в малко бадемово брашно',
   'Variant of Basic Airy Keto Cake: Sponge Cake with Berries',
   'Пандишпан с горски плодове

При разбиването на белтъците добавете 50 г сок от горски плодове.

Оваляйте 80 г дребни горски плодове (череши, малини, боровинки, горски боровинки) в малко бадемово брашно, разделете тестото на няколко форми и добавете към пандишпана преди печене. В този случай не трябва',
   'Sponge Cake with Berries',
   2, 30, 40, 8),
  (1, 'Орехов пандишпан', 'Walnut Sponge Cake',
   'Вариант на Базов въздушен кето блат: Орехов пандишпан

Добавете 30 г ситно смлени ядки към сухите съставки.',
   'Variant of Basic Airy Keto Sponge: Walnut Sponge Cake',
   'Орехов пандишпан

Добавете 30 г ситно смлени ядки към сухите съставки.',
   'Walnut sponge cake',
   2, 25, 40, 8),
  (1, 'Базов кето кекс', 'Basic Keto Cake',
   '- Базова рецепта за Кето кексово тесто
Пропорциите са изчислени за стабилна структура без глутен.',
   '- Basic recipe for Keto cake batter',
   '140 г краве масло (меко, на стайна температура)
140 г еритритол (за предпочитане на пудра)
4 големи яйца (стайна температура)
110 г бадемово брашно
35 г кокосово брашно
1 с. л. псилиум хуск (фино смлян)
1 ч. л. бакпулвер
Щипка сол',
   '140 g unsalted butter (soft, at room temperature)
140 g erythritol (preferably powdered)
4 large eggs (at room temperature)
110 g almond flour
35 g coconut flour
1 tbsp psyllium husk (finely ground)
1 tsp baking powder
Pinch of salt',
   2, 20, 40, 8),
  (1, 'Шоколадов кекс', 'Chocolate Cake',
   'Вариант на Базов кето кекс: Шоколадов кекс

Заменете 30% от бадемовото брашно с какао на прах и го добавете към тестото заедно с другите брашна.',
   'Variant of Basic Keto Cake: Chocolate Cake',
   'Шоколадов кекс

Заменете 30% от бадемовото брашно с какао на прах и го добавете към тестото заедно с другите брашна.',
   'Chocolate Cake',
   2, 20, 40, 8),
  (1, 'Брауни кекс', 'Brownie Cake',
   'Вариант на Базов кето кекс: Брауни

След като добавите сухите съставки, добавете към тестото 50 г разтопен, но не горещ шоколад поне 85% какаова масленост и без захар, може да използвате и бял кето шоколад без захар.',
   'Variant of Basic Keto Cake: Brownies',
   'Брауни

След като добавите сухите съставки, добавете към тестото 50 г разтопен, но не горещ шоколад поне 85% какаова масленост и без захар, може да използвате и бял кето шоколад без захар.',
   'Brownies',
   2, 20, 40, 8),
  (1, 'Кекс с горски плодове', 'Berry Cake',
   'Вариант на Базов кето кекс: Кекс с горски плодове

Добавете 50 г замразени дребни горски плодове към тестото непосредствено преди печене.

Печете в две отделни форми.',
   'Variant of Basic Keto Cake: Berry Cake',
   'Кекс с горски плодове

Добавете 50 г замразени дребни горски плодове към тестото непосредствено преди печене.

Печете в две отделни форми.',
   'Cake with Berries',
   2, 20, 40, 8),
  (1, 'Цитрусов кекс', 'Citrus Cake',
   'Вариант на Базов кето кекс: Цитрусов кекс

Добавете кора от лайм, лимон или портокал към тестото заедно с брашното. Количеството може да се коригира по ваш вкус.',
   'Variation of Basic Keto Cake: Citrus Cake',
   'Цитрусов кекс

Добавете кора от лайм, лимон или портокал към тестото заедно с брашното. Количеството може да се коригира по ваш вкус.',
   'Citrus Cake',
   2, 20, 40, 8),
  (1, 'Орехов кекс', 'Walnut Cake',
   'Вариант на Базов кето кекс: Орехов кекс

Добавете 60-80 г ситно счукани ядки заедно с брашната',
   'Variant of Basic Keto Cake: Walnut Cake',
   'Орехов кекс

Добавете 60-80 г ситно счукани ядки заедно с брашната',
   'Walnut cake',
   2, 20, 40, 8),
  (1, 'Кокосов блат', 'Coconut Base',
   '🥥 Кокосови блатове (Оптимизирана рецепта)
Тази версия гарантира, че ксантановата гума ще си свърши работата и блатовете няма да се натрошат.',
   '🥥 Coconut Layers (Optimized Recipe)',
   '90 г еритритол (препоръчително на пудра)
40 г кокосово брашно
15 г кокосови стърготини
2 г ксантанова гума (задължителна за спойка)
70 г кокосово масло (разтопено и охладено до стайна температура)
4 бр. яйца (размер L), разделени на белтъци и жълтъци
щипка сол',
   '90 g erythritol (preferably powdered)
40 g coconut flour
15 g shredded coconut
2 g xanthan gum (essential for binding)
70 g coconut oil (melted and cooled to room temperature)
4 large eggs, separated into whites and yolks
pinch of salt',
   2, 20, 28, 8),
  (1, 'Ванилов блат', 'Vanilla Base',
   '🍦 Ванилов блат (Оптимизирана рецепта)
Комбинацията от псилиум и ксантанова гума тук създава перфектната имитация на пандишпан.',
   '🍦 Vanilla sponge (Optimized recipe)',
   '100 г еритритол (пудра)
50 г бадемово брашно
10 г кокосово брашно
12 г псилиум хуск (фино смлян)
2 г ксантанова гума
5 г бакпулвер
4 бр. яйца (размер L), разделени
30 г кокосово масло (разтопено и охладено)
5 г ванилов екстракт
щипка сол',
   '100 g erythritol (powdered)
50 g almond flour
10 g coconut flour
12 g psyllium husk (finely ground)
2 g xanthan gum
5 g baking powder
4 large eggs (size L), separated
30 g coconut oil (melted and cooled)
5 g vanilla extract
pinch of salt',
   2, 20, 33, 8),
  (1, 'Лимонов блат', 'Lemon Base',
   '👩‍🍳 Ревизирана Рецепта: Лимонов блат',
   '👩‍🍳 Revised Recipe: Lemon Cake',
   '110 г еритритол пудра (разделен на две)
70 г бадемово брашно
10 г кокосово брашно
10 г псилиум хуск (фино смлян)
2 г ксантанова гума
5 г бакпулвер
4 яйца (L), разделени
30 г лимонов сок (прясно изцеден)
Настъргана кора от 1 био лимон
30 г разтопено кокосово масло или масло (охладено) – добавям го за мекота
щипка сол',
   '110 g powdered erythritol (divided into two)
70 g almond flour
10 g coconut flour
10 g psyllium husk (finely ground)
2 g xanthan gum
5 g baking powder
4 eggs (L), separated
30 g lemon juice (freshly squeezed)
Zest of 1 organic lemon
30 g melted coconut oil or butter (cooled) – I add it for softness
pinch of salt',
   2, 20, 33, 8),
  (1, 'Морковен блат', 'Carrot Base',
   '👩‍🍳 Ревизирана Рецепта: Кето Морковен блат',
   '👩‍🍳 Revised Recipe: Keto Carrot Cake Base',
   '70 г еритритол пудра (разделен)
70 г бадемово брашно
10 г кокосово брашно
4 яйца (L), разделени
10 г кокосово масло (разтопено и охладено)
50 г орехи или пекан (нарязани, не на брашно)
120 г моркови (настъргани на ситно и леко изстискани)
Подправки: 1 ч.л. канела, 1/2 ч.л. джинджифил, 1/4 ч.л. кардамон
2 г ксантанова гума (около 1/2 ч.л.)
1 ч.л. бакпулвер (добавям го за стабилност)
щипка сол',
   '70 g powdered erythritol (divided)
70 g almond flour
10 g coconut flour
4 eggs (L), separated
10 g coconut oil (melted and cooled)
50 g walnuts or pecans (chopped, not ground)
120 g carrots (finely grated and lightly squeezed)
Spices: 1 tsp cinnamon, 1/2 tsp ginger, 1/4 tsp cardamom
2 g xanthan gum (about 1/2 tsp)
1 tsp baking powder (I add it for stability)
pinch of salt',
   2, 25, 40, 8),
  (1, 'Маслен морковен блат', 'Butter Carrot Base',
   'Рецепта: Маслен морковен блат (Heavy Carrot Base)',
   'Recipe: Buttery Carrot Base',
   '80 г еритритол пудра
200 г бадемово брашно
20 г кокосово брашно (Добавям го, за да абсорбира влагата от 300 г моркови)
3 яйца (L) – стайна температура
150 г краве масло – много меко
100 г орехи или пекан (едро нарязани)
300 г моркови (фино настъргани и добре изцедени)
Подправки: 1 ч.л. канела, 1 ч.л. джинджифил, 1/2 ч.л. кардамон
1 ч.л. бакпулвер (Задължително!)
1/2 ч.л. ксантанова гума
щипка сол',
   '80 g powdered erythritol
200 g almond flour
20 g coconut flour (I add it to absorb the moisture from 300 g of carrots)
3 eggs (L) – room temperature
150 g butter – very soft
100 g walnuts or pecans (coarsely chopped)
300 g carrots (finely grated and well squeezed)
Spices: 1 tsp cinnamon, 1 tsp ginger, 1/2 tsp cardamom
1 tsp baking powder (Mandatory!)
1/2 tsp xanthan gum
pinch of salt',
   2, 25, 45, 8),
  (1, 'Шоколадов блат Rich', 'Rich Chocolate Base',
   '- Рецепта: Много шоколадов блат (Rich Chocolate Base)',
   '- Recipe: Very Chocolatey Base (Rich Chocolate Base)',
   '120 г еритритол пудра
150 г меко краве масло (мин. 82%)
4 яйца (размер L) – стайна температура
50 г течна готварска сметана (30-35% масленост)
30 мл горещо кафе или вряла вода (Тайната на сочния шоколадов блат!)
60 г бадемово брашно
60 г качествено какао
10 г бакпулвер (около 2 ч.л.)
щипка сол',
   '120 g powdered erythritol
150 g soft butter (min. 82%)
4 eggs (size L) – room temperature
50 g liquid cooking cream (30-35% fat content)
30 ml hot coffee or boiling water (The secret to a moist chocolate cake!)
60 g almond flour
60 g quality cocoa
10 g baking powder (about 2 tsp)
pinch of salt',
   2, 20, 45, 8),
  (1, 'Бадемов блат Swedish Style', 'Swedish Almond Base',
   'Рецепта: Бадемови блатове (Swedish Style)',
   'Recipe: Almond Layers (Swedish Style)',
   '6 белтъка (L) – стайна температура
140 г бадемово брашно (фино)
70 г еритритол пудра
2 г ксантанова гума (около 1/2 ч.л.)
1/4 ч.л. сол (намалихме я, за да не доминира)
няколко капки лимонов сок (за стабилност)',
   '6 egg whites (L) – room temperature
140 g almond flour (fine)
70 g powdered erythritol
2 g xanthan gum (about 1/2 tsp)
1/4 tsp salt (we reduced it so it doesn''t dominate)
a few drops of lemon juice (for stability)',
   2, 20, 23, 8),
  (1, 'Блат Гараш', 'Garash Base',
   'Рецепта: Кето блатове „Гараш“',
   'Recipe: Keto "Garash" Layers',
   '6 белтъка (L) – стайна температура
200 г орехи (фино смлени, но сухи)
100 г еритритол пудра
2 г ксантанова гума (1/2 ч.л.)
Щипка сол
Няколко капки лимонов сок',
   '6 egg whites (L) – room temperature
200 g walnuts (finely ground, but dry)
100 g powdered erythritol
2 g xanthan gum (1/2 tsp)
A pinch of salt
A few drops of lemon juice',
   3, 20, 11, 8),
  (1, 'Брауни блат без брашно', 'Flourless Brownie Base',
   'Рецепта: Кето Брауни блат (Flourless)',
   'Recipe: Keto Brownie Base (Flourless)',
   '100 г натурален шоколад без захар (мин. 70% какао)
100 г краве масло (мин. 82% масленост)
6 яйца (L) – задължително на стайна температура
100 г еритритол пудра
Щипка сол и 1 ч.л. ванилов екстракт',
   '100 g natural sugar-free chocolate (min. 70% cocoa)
100 g butter (min. 82% fat)
6 eggs (L) – must be at room temperature
100 g powdered erythritol
A pinch of salt and 1 tsp vanilla extract',
   2, 20, 38, 8),
  (1, 'Блат Сахер', 'Sacher Base',
   'Рецепта: Кето Блат „Сахер“',
   'Recipe: Keto Sacher Cake Base',
   '4 яйца (L), разделени
80 мл бадемово или краве мляко
30 г шоколад (85%+) или какаова маса
15 г краве масло (добавям го за автентичност)
20 г какао на прах
35 г кокосово брашно
70 г еритритол пудра
2 г сода за хляб
10 г лимонов сок
щипка сол',
   '4 eggs (L), separated
80 ml almond or cow''s milk
30 g chocolate (85%+) or cocoa mass
15 g butter (I add it for authenticity)
20 g cocoa powder
35 g coconut flour
70 g powdered erythritol
2 g baking soda
10 g lemon juice
pinch of salt',
   3, 25, 38, 8)
;

-- Total: 22 base recipes