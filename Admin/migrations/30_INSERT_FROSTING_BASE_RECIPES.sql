-- ============================================================
-- File: 30_INSERT_FROSTING_BASE_RECIPES.sql
-- Project: KetoCakR | Date: 2026-04-07
-- Description: 13 frosting recipes (recipe_role_id = 2)
-- ============================================================

INSERT INTO base_recipes (
  recipe_role_id, name, name_en,
  description, description_en,
  ingredients_text_bg, ingredients_text_en,
  difficulty_level, prep_time_minutes, bake_time_minutes, servings
)
VALUES
  (2, 'Кето Фъстъчен крем', 'Peanut Butter Frosting',
   'Подходящ за пълнеж и за измазване',
   'Suitable for filling and for coating',
   '400 г Маскарпоне (ледено студено);
150 г Натурално фъстъчено масло (гладко, без добавена захар);
150 мл Течна сметана (33-35%, студена);
100 г Еритритол на пудра (фино смлян);
Щипка сол (ако фъстъченото масло не е солено – солта подчертава вкуса му);
1 ч.л. Ванилия.',
   '400 g Mascarpone (ice cold);
150 g Natural peanut butter (smooth, no added sugar);
150 ml Liquid cream (33-35%, cold);
100 g Erythritol powdered (finely ground);
A pinch of salt (if the peanut butter is not salted – the salt enhances its flavor);
1 tsp Vanilla.',
   2, 15, 0, 8),
  (2, 'Кето Карамелен крем', 'Salted Caramel Frosting',
   'Най-луксозният крем за измазване и пълнеж със вкус на истински карамел',
   'The most luxurious cream for frosting and filling with the taste of real caramel.',
   '400 г Маскарпоне (ледено студено);
150 мл Течна сметана (33-35%, студена);
100 г Алулоза (за карамелизиране);
30 мл Гореща сметана (за деглазиране на карамела – по избор, за по-мек вкус);
1/2 ч.л. Морска сол (за вариант "Солен карамел");
1 ч.л. Ванилия.',
   '400 g Mascarpone (ice cold);
150 ml Heavy cream (33-35%, cold);
100 g Allulose (for caramelizing);
30 ml Hot cream (for deglazing the caramel – optional, for a softer taste);
1/2 tsp Sea salt (for the "Salted Caramel" variation);
1 tsp Vanilla.',
   2, 15, 0, 8),
  (2, 'Шоколадова Броня', 'Chocolate Armor',
   'Най-добра употреба: В приложението отбележи: "Това е най-добрият крем за ''остри ръбове''. След като тортата стегне в хладилника, можете буквално да я пипате с ръце, без да остават отпечатъци."',
   'Best use: In the app, note: "This is the best cream for ''sharp edges''. Once the cake sets in the fridge, you can literally touch it with your hands without leaving any fingerprints."',
   '300 г Черен шоколад без захар (85%);
150 г Краве масло (мин. 82%, на стайна температура);
Щипка сол (засилва шоколадовия вкус);
30-50 г Еритритол пудра (по желание).',
   '300 g Sugar-free dark chocolate (85%);
150 g Butter (min. 82%, at room temperature);
A pinch of salt (enhances the chocolate flavor);
30-50 g Powdered erythritol (optional).',
   2, 15, 0, 8),
  (2, 'Кокосов стабилизиран крем', 'Coconut Stabilized Cream',
   'Маслеността (17-19%): Изключително важно уточнение! Много хора купуват „кокосово мляко за готвене“ (което е около 5-10% мазнини) и се чудят защо не се отделя сметана. 17-19% е златният стандарт за кен',
   'Fat content (17-19%): An extremely important clarification! Many people buy "cooking coconut milk" (which is about 5-10% fat) and wonder why cream doesn''t separate. 17-19% is the gold standard for a c',
   '600 г Кокосова сметана (само твърдата част от охладени кенчета);
40 г Какаово масло (чисто, настъргано и разтопено);
120 г Еритритол пудра (фино пресят);
1 ч.л. Ванилия или малко кокосови стърготини (по желание).',
   '600 g Coconut cream (only the solid part from chilled cans);
40 g Cocoa butter (pure, grated, and melted);
120 g Powdered erythritol (finely sifted);
1 tsp Vanilla or a little coconut flakes (optional).',
   2, 15, 0, 8),
  (2, 'Лимонов Чийзкейк крем', 'Lemon Cheesecake Frosting',
   'Стабилност (Критична точка): Добавянето на 100 мл течност (лимонов сок) към 600 г сирене е смел ход. Киселината в лимона всъщност помага на протеините в млечните продукти да се „пресекат“ леко и да се',
   'Stability (Critical Point): Adding 100 ml of liquid (lemon juice) to 600 g of cheese is a bold move. The acidity in the lemon actually helps the proteins in dairy products to "curdle" slightly and thi',
   '600 г Крем сирене (тип Филаделфия, студено);
100 мл Течна сметана (мин. 33%, студена);
100 мл Пресен лимонов сок (прецеден);
Кората на 1 голям био лимон (фино настъргана);
150 г Еритритол пудра (пресят).',
   '600 g Cream cheese (Philadelphia type, cold);
100 ml Liquid cream (min. 33%, cold);
100 ml Fresh lemon juice (strained);
Zest of 1 large organic lemon (finely grated);
150 g Powdered erythritol (sifted).',
   2, 15, 0, 8),
  (2, 'Кето Шоколадов Трюфел', 'Keto Chocolate Truffle',
   'Най-добри комбинации:',
   'Best combinations:',
   '400 г Крем сирене (тип Филаделфия, студено);
250 г Краве масло (82%, омекотено на стайна температура);
100 г Черен шоколад (85% какао);
20 г Какаово масло;
130 г Еритритол пудра (фино пресята);
30 г Какао на прах (висококачествено).',
   '400 g Cream cheese (Philadelphia type, cold);
250 g Butter (82%, softened at room temperature);
100 g Dark chocolate (85% cocoa);
20 g Cocoa butter;
130 g Powdered erythritol (finely sifted);
30 g Cocoa powder (high quality).',
   2, 15, 0, 8),
  (2, 'Крем Пистачо', 'Pistachio Frosting',
   'Качеството на тахана (Критично): Ако потребителят мели шам-фъстък сам, трябва да знае, че ядките трябва да са печени и несолени. Суровият шам-фъстък няма толкова интензивен вкус. Шеф съвет: Добавете щ',
   'The quality of the tahini (Critical): If the user grinds pistachios themselves, they should know that the nuts must be roasted and unsalted. Raw pistachios do not have such an intense flavor. Chef''s t',
   '600 г Крема сирене или Маскарпоне (ледено студено);
100 г Тахан от шам-фъстък (100% ядки);
100 мл Течна сметана (33-35%, студена);
150 г Еритритол пудра (фино пресята).',
   '600 g Cream cheese or Mascarpone (ice cold);
100 g Pistachio tahini (100% nuts);
100 ml Liquid cream (33-35%, cold);
150 g Powdered erythritol (finely sifted).',
   2, 15, 0, 8),
  (2, 'Пухкав Фъстъчен крем', 'Fluffy Peanut Butter Frosting',
   'Перфектен за пълнеж и декорация с пош',
   'Perfect for filling and decoration with a piping bag.',
   '220 г Крем сирене (студено);
200 мл Течна сметана (33%, ледено студена);
100 г Фъстъчено масло (натурално) или печени фъстъци;
60 г Краве масло (на стайна температура);
150 г Еритритол пудра (фино пресята);
5 г Екстракт от ванилия.',
   '220 g Cream cheese (cold);
200 ml Liquid cream (33%, ice cold);
100 g Peanut butter (natural) or roasted peanuts;
60 g Butter (at room temperature);
150 g Powdered erythritol (finely sifted);
5 g Vanilla extract.',
   2, 15, 0, 8),
  (2, 'Малинов крем', 'Berry Cream Frosting',
   'Подходящ за пълнеж и за измазване на плодови кето торти',
   'Suitable for filling and frosting fruit keto cakes',
   '600 г Крем сирене (ледено студено, тип Филаделфия);
100 мл Течна сметана (мин. 30-35% масленост, студена);
100 г Малини (пресни, замразени или готово пюре);
130 г Еритритол на пудра (фино пресят);
5 г Екстракт от ванилия или 1 с.л. лимонов сок (по желание, за засилване на плодовия вкус).',
   '600 g Cream cheese (ice cold, Philadelphia type);
100 ml Liquid cream (min. 30-35% fat content, cold);
100 g Raspberries (fresh, frozen, or ready-made puree);
130 g Powdered erythritol (finely sifted);
5 g Vanilla extract or 1 tbsp lemon juice (optional, to enhance the fruity flavor).',
   2, 15, 0, 8),
  (2, 'Ванилов маслен крем', 'Classic Keto Buttercream',
   'Най-добрият крем за декорация, шприцоване и „остри ръбове“',
   'The best cream for decoration, piping, and "sharp edges"',
   '350 г Краве масло (минимално 82% масленост, задължително на стайна температура);
130 г Еритритол на пудра (фино пресят, за да няма хрупкави зрънца);
45 мл Течна сметана (33% масленост, на стайна температура);
5 г Екстракт от ванилия (или съдържанието на една шушулка ванилия за луксозен вид с черни точки).',
   '350 g Butter (minimum 82% fat content, must be at room temperature);
130 g Powdered erythritol (finely sifted to avoid crunchy granules);
45 ml Liquid cream (33% fat content, at room temperature);
5 g Vanilla extract (or the contents of one vanilla pod for a luxurious look with black specks).',
   2, 15, 0, 8),
  (2, 'Кето Крем Мока', 'Mocha Buttercream',
   'Интензивен вкус на кафе и шоколад с копринена текстура',
   'Intense flavor of coffee and chocolate with a silky texture',
   '250 г Краве масло (82%, меко, на стайна температура);
200 мл Течна сметана (33-35%, ледено студена);
150 г Еритритол на пудра (фино пресят);
60 г Крем сирене (студено);
50 г Какао на прах (неподсладено);
5 г Инстантно кафе (фино смляно);
5 г Екстракт от ванилия.',
   '250 g Butter (82%, soft, at room temperature)
200 ml Liquid cream (33-35%, ice cold)
150 g Powdered erythritol (finely sifted)
60 g Cream cheese (cold)
50 g Cocoa powder (unsweetened)
5 g Instant coffee (finely ground)
5 g Vanilla extract',
   2, 15, 0, 8),
  (2, 'Шоколадов маслен крем', 'Velvet Chocolate Buttercream',
   'Изключително стабилен крем с наситен трюфелов вкус',
   'Extremely stable cream with a rich truffle flavor.',
   '400 г Крем сирене (студено, тип Филаделфия);
250 г Краве масло (82%, меко, на стайна температура);
100 г Черен шоколад (мин. 85% какао);
130 г Еритритол на пудра (фино пресят);
30 г Какао на прах (неподсладено);
20 г Какаово масло (за допълнителен блясък и твърдост).',
   '400 g Cream cheese (cold, Philadelphia type);
250 g Butter (82%, soft, at room temperature);
100 g Dark chocolate (min. 85% cocoa);
130 g Powdered erythritol (finely sifted);
30 g Unsweetened cocoa powder;
20 g Cocoa butter (for extra shine and firmness).',
   2, 15, 0, 8),
  (2, 'Кето Крем Руби', 'Ruby Velvet Frosting',
   'Стабилен плодов крем с кадифена структура и розов цвят',
   'Stable fruit cream with a velvety texture and pink color',
   '400 г Извара (9% масленост, възможно най-фина);
300 мл Течна сметана (33-35%, ледено студена);
150 г Еритритол на пудра (фино пресят);
60 г Какаово масло (чисто, настъргано);
5 г Червено цвекло на прах (за цвят);
5 г Екстракт от ванилия или капка лимонов сок (за баланс).',
   '400 g Cottage cheese (9% fat content, as fine as possible);
300 ml Liquid cream (33-35%, ice cold);
150 g Powdered erythritol (finely sifted);
60 g Cocoa butter (pure, grated);
5 g Beetroot powder (for color);
5 g Vanilla extract or a drop of lemon juice (for balance).',
   2, 15, 0, 8)
;

-- Total: 13 frosting recipes