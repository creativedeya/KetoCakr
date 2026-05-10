-- ============================================================
-- File: 20_INSERT_FILLING_BASE_RECIPES.sql
-- Project: KetoCakR | Date: 2026-04-06
-- Description: 23 filling recipes with bilingual content
-- ============================================================

INSERT INTO base_recipes (
  recipe_role_id, name, name_en,
  description, description_en,
  ingredients_text_bg, ingredients_text_en,
  difficulty_level, prep_time_minutes, bake_time_minutes, servings
)
VALUES
  (3, 'Кули', 'Fruit Coulis',
   'Кули представлява сос от пасирани плодове (напр. малини или ягоди), прецедени и комбинирани с подсладител и лимонов сок. Обикновенно този сос е допълнение към десертите, но ако към него се добави жела',
   'Coulis is a sauce made from pureed fruits (e.g., raspberries or strawberries), strained and combined with a sweetener and lemon juice. Usually, this sauce is an addition to desserts, but if gelatin is',
   '350 г плодово пюре (пасирани и прецедени ягоди или малини)
70 г еритритол пудра
10 г желатин на прах (за стабилност при рязане)
60 г студена вода (за набъбване на желатина)
10 г лимонов сок (за цвят и баланс)',
   '350 g fruit puree (pureed and strained strawberries or raspberries)
70 g powdered erythritol
10 g powdered gelatin (for stability when cutting)
60 g cold water (for blooming the gelatin)
10 g lemon juice (for color and balance)',
   2, 30, 60, 8),
  (3, 'Конфи', 'Fruit Confit',
   'Конфи',
   'Confit',
   '350 г плодово пюре (може да оставиш малки парченца плод за текстура)
60 г еритритол пудра
8 г Пектин NH (около 2-2.5% от масата)
10 г лимонов сок
щипка ванилия (по желание)',
   '350 g fruit puree (you can leave small pieces of fruit for texture)
60 g powdered erythritol
8 g Pectin NH (about 2-2.5% of the weight)
10 g lemon juice
pinch of vanilla (optional)',
   2, 30, 60, 8),
  (3, 'Шоколадово Креме', 'Chocolate Cremeux',
   'Шоколадово Креме',
   'Chocolate Cream',
   '200 мл ядково или краве мляко
4 жълтъка (размер L)
40 г еритритол пудра
100 г черен шоколад без захар (мин. 70% какао)
4 г желатин (набъбнал в 24 г студена вода)
40 г меко краве масло (добавя се накрая)',
   '200 ml nut or cow''s milk
4 egg yolks (size L)
40 g powdered erythritol
100 g sugar-free dark chocolate (min. 70% cocoa)
4 g gelatin (soaked in 24 g cold water)
40 g soft cow''s butter (added at the end)',
   2, 30, 60, 8),
  (3, 'Бяла Намелака', 'White Namelaka',
   'Бяла Намелака',
   'White Namelaka',
   '200 мл мляко
4 жълтъка
40 г еритритол пудра
4 г желатин (набъбнал в 24 г студена вода)
120 г бял шоколад без захар (настърган или на капки)
60 г меко краве масло
Ванилия (шушулка или екстракт)',
   '200 ml milk
4 egg yolks
40 g powdered erythritol
4 g gelatin (swelled in 24 g cold water)
120 g sugar-free white chocolate (grated or in drops)
60 g soft butter
Vanilla (bean or extract)',
   2, 30, 60, 8),
  (3, 'Без име 1 (lowcarb)', 'Unnamed 1 (lowcarb)',
   'Без име 1 (lowcarb)',
   'No name 1 (low carb)',
   '350 г почистени круши (сорт Конференс или Аббате Фетел са най-добри)
60-70 г еритритол пудра (в зависимост от сладостта на плода)
4 г Агар-агар (около 1 равна ч.л.)
20 мл лимонов сок (предотвратява потъмняването на крушата и балансира сладостта)
Щипка канела или джинджифил (крушата ги обожава!)',
   '350 g peeled pears (Conference or Abate Fetel varieties are best)
60-70 g powdered erythritol (depending on the sweetness of the fruit)
4 g agar-agar (about 1 level tsp)
20 ml lemon juice (prevents the pears from browning and balances the sweetness)
A pinch of cinnamon or ginger (the pear loves them!)',
   2, 30, 60, 8),
  (3, 'Без име 2', 'Unnamed 2',
   'Без име 2',
   'Untitled 2',
   '2 цели яйца (L) + 2 жълтъка
120 г еритритол пудра
100-110 мл прясно изцеден лимонов сок (около 2-3 лимона)
Настъргана кора от 1 био лимон
90 г краве масло (студено, нарязано на кубчета)
По желание: 2 г желатин (набъбнал в 12 г вода) – само ако се ползва за плънка в торта.',
   '2 whole eggs (L) + 2 yolks
120 g powdered erythritol
100-110 ml freshly squeezed lemon juice (about 2-3 lemons)
Zest from 1 organic lemon
90 g unsalted butter (cold, cut into cubes)
Optional: 2 g gelatin (soaked in 12 g water) – only if used as a filling in a cake.',
   2, 30, 60, 8),
  (3, 'Без име 3', 'Unnamed 3',
   'Без име 3',
   'Untitled 3',
   '350–400 г плодове (малини, ягоди, къпини или почистен портокал)
70 г еритритол пудра
4 г Агар-агар (около 1 пълна ч.л.)
10 мл лимонов сок (за цвят и блясък)
30 мл вода (само ако плодовете не са много сочни)',
   '350–400 g fruits (raspberries, strawberries, blackberries, or peeled orange)
70 g powdered erythritol
4 g agar-agar (about 1 full tsp)
10 ml lemon juice (for color and shine)
30 ml water (only if the fruits are not very juicy)',
   2, 30, 60, 8),
  (3, 'Плодов мус', 'Fruit Mousse',
   'Терминология: В приложението го наречи „Плодов облак“ или „Сметанов мус с плодове“. Тъй като съдържа сметана, той не може да се съхранява като „сладко“ в буркан на стайна температура. Маракуя (Passion',
   'Terminology: In the application, call it "Fruit Cloud" or "Cream Mousse with Fruits." Since it contains cream, it cannot be stored like "jam" in a jar at room temperature. Passion Fruit: This is one o',
   '300 мл млечна сметана (33-35%, много студена)
100 г плодово пюре (маракуя, ягоди, малини или пасирани кайсии)
80 г еритритол пудра
35 мл лимонов сок (важен за стабилизиране на сметаната и вкуса)
10 г желатин на прах
50-60 мл студена вода (за желатина)
Начин на приготвяне (Стъпка по стъпка):
Желатин: Залейте желатина със студената вода и го оставете да набъбне за 10-15 минути.
Плодова база: Смесете плодовото пюре с еритритола и лимоновия сок. Загрейте ги леко в касерола (до около 50-60°C), докато еритритолът се разтвори. Не варите!
Активация: Добавете набъбналия желатин към топлото пюре и бъркайте, докато се разтопи напълно. Оставете сместа да се охлади до стайна температура (но да не стяга още).
Сметана: В отделен съд разбийте студената сметана до меки върхове (не я правете прекалено гъста, за да остане мусът фин).
Обединяване: Към плодовата смес добавете 2-3 лъжици от сметаната и разбъркайте енергично. След това внимателно добавете останалата сметана, като бъркате с шпатула отдолу-нагоре.
Формоване: Разлейте веднага в две форми (14-16 см). Почукайте ги леко в плота, за да излязат балончетата въздух.
Замразяване: Приберете във фризера за поне 3-4 часа. Мусът трябва да е напълно "кокал", за да го вградите лесно в центъра на тортата.',
   '300 ml heavy cream (33-35%, very cold)
100 g fruit puree (passion fruit, strawberries, raspberries, or pureed apricots)
80 g powdered erythritol
35 ml lemon juice (important for stabilizing the cream and flavor)
10 g powdered gelatin
50-60 ml cold water (for the gelatin)
Method of preparation (Step by step):
Gelatin: Pour the gelatin over the cold water and let it swell for 10-15 minutes.
Fruit base: Mix the fruit puree with the erythritol and lemon juice. Gently heat them in a saucepan (to about 50-60°C) until the erythritol dissolves. Do not boil!
Activation: Add the swollen gelatin to the warm puree and stir until completely melted. Allow the mixture to cool to room temperature (but do not let it set yet).
Cream: In a separate bowl, whip the cold cream to soft peaks (do not make it too thick so that the mousse remains fine).
Combining: Add 2-3 tablespoons of the cream to the fruit mixture and stir vigorously. Then gently fold in the remaining cream using a spatula, stirring from the bottom up.
Molding: Immediately pour into two molds (14-16 cm). Tap them lightly on the counter to release any air bubbles.
Freezing: Place in the freezer for at least 3-4 hours. The mousse should be completely "set" so that you can easily embed it in the center of the cake.',
   2, 30, 60, 8),
  (3, 'Плънка Матча', 'Matcha Filling',
   'Плънка Матча',
   'Matcha Filling',
   '300 мл млечна сметана (33-35%)
80 г еритритол пудра
10-12 г чай матча (за по-наситен цвят и вкус)
10 г желатин на прах
60 мл студена вода
Начин на приготвяне (Стъпка по стъпка):
Желатин: Залей желатина със студената вода и го остави да набъбне (10 мин).
Загряване: Сложи сметаната и еритритола в касерола. Загрей до около 75-80°C (когато започне да пуши силно, но преди да заври). Махни от огъня.
Разтваряне на матчата: В малка купичка сложи матчата. Добави 3-4 с.л. от горещата сметана и разбъркай енергично (най-добре с бамбукова бъркалка или малка телена бъркалка), докато стане гладка паста без бучки. Изсипи пастата обратно в тенджерата със сметаната.
Желатин: Добави набъбналия желатин в топлата матча-сметана. Разбъркай добре, докато се разтвори напълно.
Емулсия (Шеф трик): Препоръчвам да минеш сместа с пасатор за 30 секунди. Това ще разбие и най-микроскопичните частици чай и ще направи цвета абсолютно равномерен и искрящ.
Формоване: Разлей по равно в две форми (14-16 см). Покрий със стреч фолио.
Стабилизация: Остави в хладилник за поне 4 часа или във фризер за 2 часа.',
   '300 ml heavy cream (33-35%)
80 g powdered erythritol
10-12 g matcha tea (for a more intense color and flavor)
10 g powdered gelatin
60 ml cold water
Preparation method (Step by step):
Gelatin: Pour the gelatin over the cold water and let it swell (10 min).
Heating: Place the cream and erythritol in a saucepan. Heat to about 75-80°C (when it starts to smoke heavily, but before it boils). Remove from heat.
Dissolving the matcha: In a small bowl, place the matcha. Add 3-4 tablespoons of the hot cream and stir vigorously (best with a bamboo whisk or a small wire whisk) until it becomes a smooth paste without lumps. Pour the paste back into the saucepan with the cream.
Gelatin: Add the swollen gelatin to the warm matcha-cream mixture. Stir well until completely dissolved.
Emulsion (Chef trick): I recommend blending the mixture with an immersion blender for 30 seconds. This will break down even the most microscopic tea particles and make the color absolutely uniform and sparkling.
Molding: Divide evenly into two molds (14-16 cm). Cover with cling film.
Stabilization: Leave in the refrigerator for at least 4 hours or in the freezer for 2 hours.',
   2, 30, 60, 8),
  (3, 'Мус Лате', 'Latte Mousse',
   'За два стабилни диска (14-16 см), количеството е точно, но ще го прецизираме за максимална гладкост.',
   'For two stable discs (14-16 cm), the quantity is exact, but we will refine it for maximum smoothness.',
   '125 г крема сирене (тип Филаделфия, стайна температура)
200 мл млечна сметана (33-35%)
70 г еритритол пудра
10 г инстантно кафе (фино, тип "espresso gold")
4 г Агар-агар (увеличавам го с 1 г, тъй като млечните мазнини понякога "отпускат" агара)
20 мл гореща вода (за разтваряне на кафето)
Начин на приготвяне (Стъпка по стъпка):
Кафе паста: Разтворете инстантното кафе в 20 мл гореща вода. Това гарантира, че няма да има тъмни точки/песъчинки в муса.
Смесване: В касерола смесете сметаната, еритритола и разтвореното кафе. Загрейте до около 60°C.
Емулсия: Добавете крема сиренето на части към топлата сметана и разбийте с бъркалка, докато сместа стане напълно гладка и без бучки.
Варене с Агар: Поръсете агар-агара отгоре. Увеличете огъня и оставете сместа да заври, като бъркате енергично. Варете точно 2 минути на умерен огън.
Финал: Махнете от огъня. За перфектен резултат, минете сместа с пасатор за 20 секунди – това ще я направи копринена.
Формоване: Разлейте веднага в две форми (14-16 см). Покрийте със стреч фолио.
Стабилизация: Оставете на стайна температура за 1 час (агарът ще стегне още тогава), след което приберете в хладилник.',
   '125 g cream cheese (Philadelphia type, at room temperature)
200 ml heavy cream (33-35%)
70 g powdered erythritol
10 g instant coffee (fine, "espresso gold" type)
4 g agar-agar (I am increasing it by 1 g, as dairy fats sometimes "loosen" the agar)
20 ml hot water (for dissolving the coffee)
Method of preparation (Step by step):
Coffee paste: Dissolve the instant coffee in 20 ml of hot water. This ensures that there will be no dark spots/grains in the mousse.
Mixing: In a saucepan, combine the cream, erythritol, and dissolved coffee. Heat to about 60°C.
Emulsion: Gradually add the cream cheese to the warm cream and whisk until the mixture is completely smooth and lump-free.
Cooking with Agar: Sprinkle the agar-agar on top. Increase the heat and bring the mixture to a boil, stirring vigorously. Cook for exactly 2 minutes over medium heat.
Final: Remove from heat. For a perfect result, blend the mixture with an immersion blender for 20 seconds – this will make it silky.
Molding: Immediately pour into two molds (14-16 cm). Cover with plastic wrap.
Stabilization: Leave at room temperature for 1 hour (the agar will set further then), after which refrigerate.',
   2, 30, 60, 8),
  (3, 'Без име 4 (lowcarb)', 'Unnamed 4 (lowcarb)',
   'Почистване (Fillet): Твоето указание за премахване на бялата ципа е ключово. Ако тя остане, след термичната обработка желето ще нагорчава осезаемо. Желатинът (5 г): За 350 г плод, 5 г желатин ще даде ',
   'Cleaning (Fillet): Your instruction for removing the white membrane is crucial. If it remains, the jelly will become noticeably bitter after cooking. Gelatin (5 g): For 350 g of fruit, 5 g of gelatin ',
   '350 г филета от портокал (чисто месо, без ципи и семки)
65 г еритритол пудра
7 г желатин на прах (за по-сигурна стабилност)
42 мл студена вода (за желатина)
10 мл лимонов сок (за да „светне“ вкусът на портокала)',
   '350 g orange fillets (pure meat, without membranes and seeds)
65 g powdered erythritol
7 g powdered gelatin (for more reliable stability)
42 ml cold water (for the gelatin)
10 ml lemon juice (to "brighten" the flavor of the orange)',
   2, 30, 60, 8),
  (3, 'Кето Мармелад', 'Keto Jam',
   'Кето Мармелад',
   'Keto Jam',
   '170 г плодово пюре (кайсия, ягода, малина, вишна)
170 мл вода
50 г еритритол пудра
10 г Пектин (за предпочитане Пектин NH за стабилност)
5 г желатин (набъбнал в 30 мл студена вода)
5 мл лимонов сок (задължителен за активиране на пектина)',
   '170 g fruit puree (apricot, strawberry, raspberry, cherry)
170 ml water
50 g powdered erythritol
10 g pectin (preferably Pectin NH for stability)
5 g gelatin (swelled in 30 ml cold water)
5 ml lemon juice (mandatory for activating the pectin)',
   2, 30, 60, 8),
  (3, 'Карамелизиран кокос', 'Coconut Toffee',
   'Карамелизиран кокос',
   'Caramelized Coconut',
   '1 бр. свеж кокосов орех (настърган на едро ренде или нарязан на тънки ленти с белачка за картофи);
50 г Алулоза (задължително за цвят и лепкавост) или Еритритол GOLD;
30 г краве масло или кокосово масло (за веган вариант);
1/2 ч.л. морска сол (засилва кокосовия аромат);
Щипка ванилия.',
   '1 fresh coconut (grated on a coarse grater or sliced into thin strips with a vegetable peeler);
50 g Allulose (essential for color and stickiness) or Erythritol GOLD;
30 g butter or coconut oil (for a vegan option);
1/2 tsp sea salt (enhances the coconut aroma);
A pinch of vanilla.',
   2, 30, 60, 8),
  (3, 'Мус Супер Кокос', 'Super Coconut Mousse',
   'Сметаната: За да бъде мус, а не просто желиран крем, ни трябват около 150-200 мл разбита сметана. Без нея текстурата ще бъде по-скоро като пудинг. Техника на варене: Казваш „до първите въздушни мехури',
   'The cream: To achieve a mousse rather than just a jellied cream, we need about 150-200 ml of whipped cream. Without it, the texture will be more like pudding. Cooking technique: You say "until the fir',
   '300 мл кокосово мляко (от консерва);
2 жълтъка (L);
70 г еритритол пудра;
15-20 г фини кокосови стърготини;
10 г желатин + 60 мл студена вода;
150 мл разбита млечна сметана (33-35%) – за ефирност.',
   '300 ml coconut milk (from a can);
2 egg yolks (L);
70 g powdered erythritol;
15-20 g fine coconut flakes;
10 g gelatin + 60 ml cold water;
150 ml whipped heavy cream (33-35%) – for fluffiness.',
   2, 30, 60, 8),
  (3, 'Кето Карамел', 'Keto Caramel',
   'Кето Карамел',
   'Keto Caramel',
   '100 г краве масло (мин. 82%);
60-80 г Алулоза (за по-гъст карамел сложи 80 г);
100 мл течна сметана (30-35%, гореща);
Щипка морска сол (за Salted Caramel);
5 г желатин + 30 мл вода (само ако искаш стабилен диск за плънка).',
   '100 g butter (min. 82%);
60-80 g Allulose (for thicker caramel use 80 g);
100 ml liquid cream (30-35%, hot);
A pinch of sea salt (for Salted Caramel);
5 g gelatin + 30 ml water (only if you want a stable disk for filling).',
   2, 30, 60, 8),
  (3, 'Базов Крем Англез', 'Creme Anglaise Base',
   'Това количество е универсално за добавяне към шоколад или плодови пюрета.',
   'This quantity is universal for adding to chocolate or fruit purees.',
   '250 мл течна млечна сметана (33-35%);
3 големи жълтъка (L);
50-60 г еритритол пудра;
1 бр. ванилова шушулка или качествен екстракт;
Щипка сол (изостря вкуса на ванилията).
Начин на приготвяне (Техника "Nappe"):
Инфузия: Загрейте сметаната с ванилията в касерола почти до кипене.
Застройка: В отделна купа разбийте жълтъците с еритритола, докато станат бледожълти.
Темпериране: Налейте около 1/3 от горещата сметана при жълтъците на тънка струя, като бъркате непрекъснато. Това ги "затопля" бавно, за да не се пресекат.
Готвене: Върнете сместа в касеролата на слаб огън. Бъркайте постоянно с шпатула (не с бъркалка), като минавате по дъното и ъглите.
Тестът "Lapping": Гответе до 82°C. Кремът е готов, когато покрие гърба на лъжицата и ако прокарате пръст по нея, остане ясна и чиста следа (това се нарича nappe).
Финал: Веднага дръпнете от огъня и прецедете през фина цедка в студена купа, за да спрете процеса на готвене.',
   '250 ml liquid heavy cream (33-35%);
3 large egg yolks (L);
50-60 g powdered erythritol;
1 vanilla bean or quality extract;
A pinch of salt (enhances the flavor of the vanilla).
Method of preparation (Technique "Nappe"):
Infusion: Heat the cream with the vanilla in a saucepan almost to boiling.
Base: In a separate bowl, whisk the egg yolks with the erythritol until they become pale yellow.
Tempering: Pour about 1/3 of the hot cream into the yolks in a thin stream, whisking continuously. This "warms" them slowly to prevent curdling.
Cooking: Return the mixture to the saucepan over low heat. Stir constantly with a spatula (not a whisk), making sure to reach the bottom and corners.
The "Lapping" test: Cook until 82°C. The cream is ready when it coats the back of a spoon and if you run your finger through it, it leaves a clear and clean trail (this is called nappe).
Final: Immediately remove from heat and strain through a fine sieve into a cold bowl to stop the cooking process.',
   2, 30, 60, 8),
  (3, 'Кето Заварен крем', 'Pastry Cream Base',
   'Липсата на нишесте: В класическото сладкарство нишестето стабилизира жълтъците и им позволява да заврят. В кето варианта кремът НЕ трябва да завира. Ако заври без нишесте, ще се пресече на момента. Го',
   'The absence of starch: In classic pastry, starch stabilizes the yolks and allows them to boil. In the keto version, the cream MUST NOT boil. If it boils without starch, it will curdle immediately. Coo',
   '6 жълтъка (размер L);
80-100 г еритритол пудра (зависи колко сладко обичате);
180-200 мл млечна сметана (33-35%);
5 г ванилов или бадемов екстракт;
Шеф добавка за стабилност: 80 г студено краве масло (добавя се след сваряването).',
   '6 egg yolks (size L);
80-100 g powdered erythritol (depends on how sweet you like it);
180-200 ml heavy cream (33-35%);
5 g vanilla or almond extract;
Chef''s addition for stability: 80 g cold unsalted butter (added after cooking).',
   2, 30, 60, 8),
  (3, 'Кето Плодов Кърд', 'Fruit Curd',
   'Кето Плодов Кърд',
   'Keto Fruit Curd',
   '180–200 г плодово пюре (ягоди, малини, боровинки или лимон/лайм);
6 жълтъка (L);
80–100 г еритритол пудра;
80 г студено краве масло (добавя се накрая за копринен финиш).',
   '180–200 g fruit puree (strawberries, raspberries, blueberries, or lemon/lime);
6 egg yolks (L);
80–100 g powdered erythritol;
80 g cold unsalted butter (added at the end for a silky finish).',
   2, 30, 60, 8),
  (3, 'Без име 5', 'Unnamed 5',
   'Без име 5',
   'Untitled 5',
   'Черен Ганаш: 200 мл сметана (35%) + 200 г черен шоколад (85%) – Класическо 1:1 за стабилност.
Бял Ганаш: 150 мл сметана (35%) + 300 г бял кето шоколад.
Опция за пухкавост: След 4 часа в хладилника, разбийте студения ганаш с миксер за 1 минута. Ще получите "Разбит ганаш" (Whipped Ganache), който е идеален за шприцоване на розички.',
   'Dark Ganache: 200 ml cream (35%) + 200 g dark chocolate (85%) – Classic 1:1 for stability.
White Ganache: 150 ml cream (35%) + 300 g white keto chocolate.
Fluffiness Option: After 4 hours in the refrigerator, whip the cold ganache with a mixer for 1 minute. You will get "Whipped Ganache," which is perfect for piping roses.',
   2, 30, 60, 8),
  (3, 'Без име 6', 'Unnamed 6',
   'Без име 6',
   'Untitled 6',
   '100 мл сметана (част 1 - за загряване);
200 мл сметана (част 2 - студена);
100 г кето шоколад (бял или черен);
2 г желатин + 12 мл студена вода;
30 г еритритол пудра (само ако шоколадът е много горчив).',
   '100 ml cream (part 1 - for heating);
200 ml cream (part 2 - cold);
100 g keto chocolate (white or dark);
2 g gelatin + 12 ml cold water;
30 g powdered erythritol (only if the chocolate is very bitter).',
   2, 30, 60, 8),
  (3, 'Кето Шантили', 'Keto Chantilly',
   'Кето Шантили',
   'Keto Chantilly',
   '300 мл млечна сметана (33-35% масленост, ледено студена);
60-80 г еритритол пудра (90 г може да дойде твърде сладко при липса на плодове);
1 ч.л. истински ванилов екстракт или семена от шушулка;
Опция за стабилност (Шеф трик): Добавете 100 г студено Маскарпоне. Това прави крема „Шантили-Маскарпоне“, който е много по-издръжлив и подходящ за измазване на торта.',
   '300 ml heavy cream (33-35% fat content, ice cold);
60-80 g powdered erythritol (90 g may be too sweet in the absence of fruits);
1 tsp pure vanilla extract or seeds from a vanilla pod;
Stability option (Chef trick): Add 100 g cold Mascarpone. This makes the cream "Chantilly-Mascarpone," which is much more durable and suitable for frosting a cake.',
   2, 30, 60, 8),
  (3, 'Крем със заквасена сметана', 'Sour Cream Frosting',
   'Крем със заквасена сметана',
   'Cream with sour cream',
   '400 г заквасена сметана (минимум 25-30% масленост, ледено студена);
100–120 г еритритол пудра (150 г може да прекъсне баланса на киселинността);
1 ч.л. ванилия или настъргана лимонова кора.',
   '400 g sour cream (minimum 25-30% fat content, ice cold);
100–120 g powdered erythritol (150 g may disrupt the acidity balance);
1 tsp vanilla or grated lemon zest.',
   2, 30, 60, 8),
  (3, 'Стабилен Розов Крем', 'Stable Rose Cream',
   'Стабилен Розов Крем',
   'Stable Pink Cream',
   '250 г Маскарпоне (ледено студено);
200 мл Течна сметана (33-35% масленост, ледено студена);
50-60 г Еритритол пудра (пресят);
15 г Вода от рози (без захар);
Щипка ванилия (помага на розата да изпъкне).',
   '250 g Mascarpone (ice cold);
200 ml Heavy cream (33-35% fat content, ice cold);
50-60 g Powdered erythritol (sifted);
15 g Rose water (sugar-free);
A pinch of vanilla (helps the rose flavor to stand out).',
   2, 30, 60, 8)
;

-- Total: 23 recipes