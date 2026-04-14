-- ============================================================
-- File: 40_INSERT_DECORATION_BASE_RECIPES.sql
-- Project: KetoCakR | Date: 2026-04-07
-- Description: 13 decoration patterns (recipe_role_id = 4)
-- ============================================================

INSERT INTO base_recipes (
  recipe_role_id, name, name_en,
  description, description_en,
  ingredients_text_bg, ingredients_text_en,
  difficulty_level, prep_time_minutes, bake_time_minutes, servings
)
VALUES
  (4, 'Горски венец', 'Forest Wreath',
   '(Количества за торта с диаметър 18 см)',
   '(Quantities for an 18 cm diameter cake)',
   'Пресни ягоди: 6-8 броя (изберете средни по размер и еднакви по форма).
Пресни боровинки: около 50 г (едри и здрави).
Пресни малини: 8-10 броя.
Прясна мента: няколко малки листенца за акцент.
Опционално: Кето пудра захар (смилате еритритол) за фина "снежна" поръска точно преди сервиране.',
   'Fresh strawberries: 6-8 pieces (choose medium-sized and uniform in shape).
Fresh blueberries: about 50 g (large and firm).
Fresh raspberries: 8-10 pieces.
Fresh mint: a few small leaves for accent.
Optional: Keto powdered sugar (grind erythritol) for a fine "snowy" sprinkle just before serving.',
   1, 20, NULL, 8),
  (4, 'Кралски Сахер', 'Royal Sacher',
   '(Количества за 1 торта / 8 порции)',
   '(Quantities for 1 cake / 8 servings)',
   '100 г Кето шоколад (минимум 75-80% какао или подсладен със стевия/еритритол).
100 мл Течна млечна сметана (35% масленост).
20 г Краве масло (за допълнителен блясък).
Щипка сол (за засилване на шоколадовия вкус).
30 г Кето шоколад.
1/2 ч.л. Кокосово масло (прави шоколада по-течен за писане, но го оставя твърд след застиване).',
   '100 g Keto chocolate (minimum 75-80% cocoa or sweetened with stevia/erythritol).
100 ml Liquid heavy cream (35% fat content).
20 g Butter (for extra shine).
A pinch of salt (to enhance the chocolate flavor).
30 g Keto chocolate.
1/2 tsp Coconut oil (makes the chocolate more liquid for writing, but leaves it firm after setting).',
   2, 20, NULL, 8),
  (4, 'Хрупкав Орех', 'Crunchy Nut',
   '(Количества за 1 торта / 18 см диаметър)',
   '(Quantities for 1 cake / 18 cm diameter)',
   'Сурови орехови ядки: 120 – 150 г (за обилно покриване на горната част и страните).
Основа: Тортата трябва да е предварително измазана с тънък слой лепкав крем (напр. маслено-кремообразен или ганаш), за да полепнат ядките.',
   'Raw walnut kernels: 120 – 150 g (for generous coverage of the top and sides).
Base: The cake should be pre-coated with a thin layer of sticky cream (e.g., buttercream or ganache) to help the nuts adhere.',
   1, 20, NULL, 8),
  (4, 'Класически Гараш', 'Classic Garash',
   '(Количества за 1 торта / 18 см диаметър)',
   '(Quantities for 1 cake / 18 cm diameter)',
   'По желание: 1 капка масло от шамфъстък за подсилване на аромата.',
   'Optional: 1 drop of pistachio oil to enhance the aroma.',
   2, 20, NULL, 8),
  (4, 'Бадемов облак', 'Almond Cloud',
   '(Количества за 1 торта / 18 см диаметър)',
   '(Quantities for 1 cake / 18 cm diameter)',
   'Филирани бадеми: 40–50 г.
Основа: Светъл кето крем (например ванилов маскарпоне крем или крем сирене с масло).
По избор: Малко еритритол на прах за поръсване.',
   'Sliced almonds: 40–50 g.
Base: Light keto cream (such as vanilla mascarpone cream or cream cheese with butter).
Optional: A little powdered erythritol for sprinkling.',
   1, 20, NULL, 8),
  (4, 'Черна гора', 'Black Mountain',
   '(Количества за 1 торта / 18 см диаметър – 8 порции)',
   '(Quantities for 1 cake / 18 cm diameter – 8 servings)',
   'Алтернатива: Ако черешите не са в сезон, могат да се използват малини.',
   'Alternative: If cherries are out of season, raspberries can be used.',
   2, 20, NULL, 8),
  (4, 'Шоколадов дует', 'Chocolate Duet',
   '(Количества за 1 торта / 18 см диаметър)',
   '(Quantities for 1 cake / 18 cm diameter)',
   'Тъмен кето шоколад (минимум 75% какао): 60 г.
Бял кето шоколад (подсладен с еритритол/стевия): 30 г.
Основа: Тортата трябва да е измазана с лепкав крем (шоколадов мус или ванилов маскарпоне), за да се закрепят стружките.',
   'Dark keto chocolate (minimum 75% cocoa): 60 g.
White keto chocolate (sweetened with erythritol/stevia): 30 g.
Base: The cake should be coated with a sticky cream (chocolate mousse or vanilla mascarpone) to hold the shavings in place.',
   2, 20, NULL, 8),
  (4, 'Цъфтяща нощ', 'Blooming Night',
   '(Количества за 1 торта / 18 см диаметър)',
   '(Quantities for 1 cake / 18 cm diameter)',
   'Основа: Кето шоколадов ганаш (използвай рецептата от торта „Сахер“: 100 г кето шоколад + 100 мл сметана).
Ядливи цветя: 8-10 броя (на снимката виждаме теменужки/виолки и малки венчелистчета от рози).
Прясна мента: 5-6 малки листенца за „зелен“ акцент.
Специфичен инструмент: Малка сладкарска палета или гърба на чаена лъжица.',
   'Base: Keto chocolate ganache (use the recipe from the "Sacher" cake: 100 g keto chocolate + 100 ml cream).
Edible flowers: 8-10 pieces (in the picture we see violets and small rose petals).
Fresh mint: 5-6 small leaves for a "green" accent.
Specific tool: Small pastry spatula or the back of a teaspoon.',
   1, 20, NULL, 8),
  (4, 'Натурална дъга', 'Natural Rainbow',
   '(Количества за 1 торта / 18 см диаметър)',
   '(Quantities for 1 cake / 18 cm diameter)',
   '80 г Маскарпоне (на стайна температура).
40 г Краве масло (много меко).
1 с.л. Еритритол на прах (фино смлян).
Натурални пигменти:
Жълто: 1/2 ч.л. Куркума (не се притеснявай, вкусът не се усеща в това количество).
Червено: 1 ч.л. Прах от червено цвекло.
Синьо: 1/2 ч.л. Синя спирулина.
Няколко цели плодчета (напр. касис или малки топчета крем, оцветени в червено) за „точките“ в дизайна.',
   '80 g Mascarpone (at room temperature).
40 g Butter (very soft).
1 tbsp Erythritol powder (finely ground).
Natural pigments:
Yellow: 1/2 tsp Turmeric (don’t worry, the taste is not noticeable in this amount).
Red: 1 tsp Beetroot powder.
Blue: 1/2 tsp Blue spirulina.
A few whole fruits (e.g., currants or small cream balls colored red) for the "dots" in the design.',
   2, 20, NULL, 8),
  (4, 'Празнични балони', 'Party Balloons',
   '(Количества за 1 торта / 18 см диаметър)',
   '(Quantities for 1 cake / 18 cm diameter)',
   '100 г Маскарпоне (студено).
50 г Меко краве масло.
1 с.л. Еритритол на прах (задължително пресят през фино сито).
Натурални бои: Куркума (жълто), прах от цвекло (розово/червено), синя спирулина (синьо).',
   '100 g Mascarpone (cold).
50 g Soft butter.
1 tbsp Erythritol powder (must be sifted through a fine sieve).
Natural colors: Turmeric (yellow), beetroot powder (pink/red), blue spirulina (blue).',
   3, 20, NULL, 8),
  (4, 'Кадифени трохи', 'Velvet Crumbs',
   '(Количества за торта с диаметър 18 см – 8 порции)',
   '(Quantities for an 18 cm diameter cake – 8 servings)',
   '1 брой Кето блат „Червено кадифе“: (предварително изпечен и охладен).
Бял Кето крем: около 150-200 г (Маскарпоне и сметана), за да имаме лепкава повърхност отгоре.
Инструмент: Ситно ренде или кухненски блендер.',
   '1 Keto "Red Velvet" layer: (pre-baked and cooled).
White Keto cream: about 150-200 g (Mascarpone and cream), to have a sticky surface on top.
Tool: Fine grater or kitchen blender.',
   1, 20, NULL, 8),
  (4, 'Кадифени трохи с Кармин', 'Velvet Crumbs Carmine',
   '(Оразмерено за 18 см торта / 8 порции)',
   '(Sized for an 18 cm cake / 8 servings)',
   '1 брой Кето блат: приготвен с натурален кармин за дълбок червен цвят.
150 г Бял кремообразен слой: (Маскарпоне + еритритол) за основа.
Натурален кармин: (ако потребителят го добавя допълнително към трохите за по-силен ефект).',
   '1 Keto layer: made with natural carmine for a deep red color.
150 g White creamy layer: (Mascarpone + erythritol) for the base.
Natural carmine: (if the user adds it additionally to the crumbs for a stronger effect).',
   2, 20, NULL, 8),
  (4, 'Снежни розети', 'Snowy Rosettes',
   '(Количества за 1 торта / 18 см диаметър)',
   '(Quantities for 1 cake / 18 cm diameter)',
   'Стабилен Кето Крем за пош: * 200 г Маскарпоне (много студено).
100 мл Млечна сметана 35% (студена).
30-40 г Еритритол на прах (фино смлян).
Ванилия.
По желание: Щипка кокосови стърготини за поръсване на борда (както е на снимката).',
   'Stable Keto Cream for piping: * 200 g Mascarpone (very cold).
100 ml Heavy cream 35% (cold).
30-40 g Erythritol powder (finely ground).
Vanilla.
Optional: A pinch of shredded coconut for sprinkling on the sides (as shown in the picture).',
   2, 20, NULL, 8)
;

-- Total: 13 decoration patterns