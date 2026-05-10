-- ==========================================
-- INSERT LAB NOTES - 51 Notes for 16 Recipes
-- Date: 2026-04-06
-- Purpose: Insert lab notes with CORRECT DB recipe names
-- ==========================================

-- IMPORTANT: Run after 04_UPDATE and 05_INSERT!


-- ==========================================
-- Базова рецепта за въздушни кето блатове (3 notes)
-- ==========================================
INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'technique',
'Why Lower Temperature (160°C)',
'Защо по-ниска температура (160°C)',
'High temperature (180°C) will cause the batter to rise dramatically and then collapse in the center. The 160°C setting provides slower, more controlled expansion.',
'Високата температура (180°C) ще накара блата да избухне и след това да колабира (да спадне в средата). Температурата 160°C осигурява по-бавно и контролирано разширяване.',
1
FROM base_recipes WHERE name = 'Пандишпанов блат' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'technique',
'Sifting Is Critical',
'Пресяването е критично',
'In keto baking, sifting heavy nut flours is essential for the ''airy'' effect. Sift dry ingredients twice for best results.',
'В кето сладкарството пресяването на ''тежките'' ядкови брашна е жизненоважно за ''въздушния'' ефект. Пресейте сухите съставки два пъти за най-добри резултати.',
2
FROM base_recipes WHERE name = 'Пандишпанов блат' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'chef_trick',
'Upside-Down Cooling',
'Охлаждане с главата надолу',
'After removing from oven, invert the cake (upside-down) onto a cooling rack while still in the pan. This prevents the heavy keto structure from collapsing under its own weight.',
'След като извадите блата от фурната, го обърнете обратно (с главата надолу) върху решетка, докато е още във формата. Това не позволява на тежката кето структура да се свие под собствената си тежест.',
3
FROM base_recipes WHERE name = 'Пандишпанов блат' AND recipe_role_id = 1;


-- ==========================================
-- Кето кексово тесто (2 notes)
-- ==========================================
INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'technique',
'Psyllium Hydration Time',
'Време за хидратация на псилиум',
'Let the batter rest for 10 minutes to allow psyllium and coconut flour to absorb moisture. This creates proper structure.',
'Оставете тестото да престои 10 минути, за да може псилиумът и кокосовото брашно да абсорбират влагата. Това създава правилна структура.',
1
FROM base_recipes WHERE name = 'Базов маслен блат за торта' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'troubleshooting',
'If Mixture Starts Splitting',
'Ако сместа започне да се пресича',
'Add 1 tablespoon of the almond flour if the butter-egg emulsion starts to split. This will stabilize it.',
'Добавете 1 с.л. от бадемовото брашно ако маслено-яйчената емулсия започне да се пресича. Това ще я стабилизира.',
2
FROM base_recipes WHERE name = 'Базов маслен блат за торта' AND recipe_role_id = 1;


-- ==========================================
-- Кокосови блатове (2 notes)
-- ==========================================
INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'technique',
'Xanthan Gum Is Mandatory',
'Ксантановата гума е задължителна',
'2g xanthan gum is critical for binding. Mix it thoroughly with dry ingredients to prevent lumps.',
'2 г ксантанова гума (задължителна за спойка). Разбъркайте я добре със сухите съставки, за да няма бучки.',
1
FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'storage',
'Refrigeration Makes It Elastic',
'Хладилникът го прави еластичен',
'Wrap in foil and refrigerate - this makes the cake more elastic and easier to slice without crumbling.',
'Завийте във фолио и приберете в хладилник – това прави блата по-еластичен и лесен за рязане без да се троши.',
2
FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1;


-- ==========================================
-- Ванилов блат (3 notes)
-- ==========================================
INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'technique',
'5-Minute Rest Is Critical',
'5-минутната почивка е критична',
'Let the batter ''rest'' for 5 minutes in the bowl. During this time, psyllium will absorb moisture and stabilize the structure.',
'Оставете тестото да ''отпочине'' 5 минути в купата. През това време псилиумът ще поеме влагата и ще стабилизира структурата.',
1
FROM base_recipes WHERE name = 'Блат ванилия' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'chef_trick',
'Don''t Open Oven First 25 Minutes',
'Не отваряйте фурната първите 25 минути',
'Opening the oven early will cause the cake to collapse. Wait at least 25 minutes before checking.',
'Не отваряйте фурната първите 25 минути! Това ще предизвика колабиране на блата.',
2
FROM base_recipes WHERE name = 'Блат ванилия' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'chef_trick',
'Gradual Cooling Technique',
'Техника за постепенно охлаждане',
'After toothpick comes out clean, turn off oven and leave cakes inside with door cracked for 5 minutes. This prevents shock shrinkage.',
'След като клечката излезе суха, изключете фурната и оставете блатовете вътре на открехната врата за 5 минути. Това предотвратява ''шоковото'' свиване.',
3
FROM base_recipes WHERE name = 'Блат ванилия' AND recipe_role_id = 1;


-- ==========================================
-- Лимонов блат (3 notes)
-- ==========================================
INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'technique',
'Lemon Acid Makes Whites Unstable',
'Лимоновата киселина прави белтъците нестабилни',
'Lemon acid makes egg whites slightly less stable, so work quickly but carefully when folding.',
'Лимоновата киселина прави белтъците малко по-нестабилни, затова работете бързо, но внимателно.',
1
FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'app_advice',
'Zest Only Yellow Part',
'Настъргвайте само жълтата част',
'Always zest only the yellow part of the peel, as the white pith underneath is bitter and can ruin the delicate flavor of keto desserts.',
'Винаги настъргвайте само жълтата част на кората, тъй като бялата под нея е горчива и може да развали финия вкус на кето десерта.',
2
FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'pairing',
'Perfect for Syrup Soaking',
'Перфектен за сиропиране',
'This cake is ideal for soaking with lemon syrup (water, erythritol, lemon juice) because its acidity allows it to absorb more moisture without becoming soggy.',
'Този блат е идеален за сиропиране с лимонада (вода, еритритол и малко лимонов сок), защото киселинността му позволява да поеме повече влага без да стане клисав.',
3
FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1;


-- ==========================================
-- Морковен блат (3 notes)
-- ==========================================
INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'app_advice',
'Carrot Sugar Content Warning',
'Предупреждение за захарите в морковите',
'Carrots contain natural sugars. For strict keto, do not exceed the amount specified in the recipe.',
'Морковите съдържат естествени захари. За стриктно кето, не превишавайте грамажа им в рецептата.',
1
FROM base_recipes WHERE name = 'Блат за морковена торта' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'texture',
'Naturally Denser Texture',
'Естествено по-плътна текстура',
'Carrot cake is naturally denser. If user wants a lighter cake, suggest using Vanilla Base with added spices and lemon zest.',
'Морковеният блат е естествено по-плътен. Ако потребителят иска по-въздушна торта, препоръчайте ''Ваниловия блат'' с добавени подправки и лимонова кора.',
2
FROM base_recipes WHERE name = 'Блат за морковена торта' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'pairing',
'Cream Cheese Is The Classic',
'Крем сирене е класиката',
'Carrot cake cries out for Cream Cheese Frosting. This is the iconic pairing for this dessert.',
'Морковеният блат плаче за Крем сирене (Frosting). Това е емблематичната комбинация за този десерт.',
3
FROM base_recipes WHERE name = 'Блат за морковена торта' AND recipe_role_id = 1;


-- ==========================================
-- Маслен морковен блат (2 notes)
-- ==========================================
INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'technique',
'Coconut Flour Is The Moisture Agent',
'Кокосовото брашно е агентът срещу влагата',
'20g coconut flour is added specifically to absorb moisture from 300g carrots. This is our secret weapon against sogginess.',
'20 г кокосово брашно (Добавям го, за да абсорбира влагата от 300 г моркови). Това е нашият таен агент срещу влагата.',
1
FROM base_recipes WHERE name = 'Морковен блат 1' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'storage',
'Very Soft When Warm',
'Много мек докато е топъл',
'These cakes are very soft while warm due to butter content. Let them cool completely in the pan before attempting to remove. Then refrigerate (wrapped in foil) for at least 4-6 hours.',
'Тези блатове са много меки, докато са топли заради маслото. Оставете ги да изстинат напълно във формата, преди да ги вадите. След това хладилник (увити във фолио) за поне 4-6 часа.',
2
FROM base_recipes WHERE name = 'Морковен блат 1' AND recipe_role_id = 1;


-- ==========================================
-- Матча пандишпан (5 notes)
-- ==========================================
INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'ingredient',
'Use Ceremonial Grade Matcha',
'Използвайте церемониален клас матча',
'Ceremonial grade matcha gives the best color and deepest flavor. Culinary grade will work but color may be less vibrant.',
'Церемониален клас матча дава най-добър цвят и най-дълбок вкус. Кулинарният клас също работи, но цветът може да е по-слаб.',
1
FROM base_recipes WHERE name = 'Блат с чай матча' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'technique',
'Low Temperature Preserves Green Color',
'Ниската температура запазва зеления цвят',
'155-160°C is critical for preserving the vibrant green color. Higher heat will turn it brownish.',
'155-160°C е ключът към запазване на зеления цвят. По-висока температура ще го направи кафеникав.',
2
FROM base_recipes WHERE name = 'Блат с чай матча' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'technique',
'Sift Matcha Twice',
'Пресейте матчата два пъти',
'Matcha often clumps into small balls that don''t dissolve during mixing. Sifting twice is mandatory.',
'Матчата често се слепва на малки топчета, които не се разтварят при бъркане. Пресейте ги два пъти задължително.',
3
FROM base_recipes WHERE name = 'Блат с чай матча' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'pairing',
'Best Pairings',
'Най-добри комбинации',
'Matcha cakes pair divinely with white chocolate cream (keto) or lemon mousse.',
'Матча блатовете се комбинират божествено с крем от бял шоколад (кето) или лимонов мус.',
4
FROM base_recipes WHERE name = 'Блат с чай матча' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'app_advice',
'Sweetener Substitution Logic',
'Логика при замяна на подсладител',
'If you replace erythritol with liquid sweetener (stevia or sucralose), you must compensate for the lost volume. For every 100g erythritol removed, add 20g coconut flour or 15g finely ground psyllium husk. This will preserve the dessert''s structure and prevent it from becoming runny.',
'Ако замените еритритола с течен подсладител (като стевия или сукралоза), трябва да компенсирате загубения обем. За всеки 100 г премахнат еритритол, добавете 20 г кокосово брашно или 15 г фино смлян псилиум хуск. Това ще запази структурата на десерта и ще предотврати разтичането му.',
5
FROM base_recipes WHERE name = 'Блат с чай матча' AND recipe_role_id = 1;


-- ==========================================
-- Шоколадов пандишпан (4 notes)
-- ==========================================
INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'ingredient',
'Use Dutch-Processed Cocoa',
'Използвайте алкализирано какао',
'Dutch-processed (alkalized) cocoa provides deeper color and smoother flavor.',
'Алкализирано какао (Dutch-processed) дава по-дълбок цвят и по-мек вкус.',
1
FROM base_recipes WHERE name = 'Шоколадов блат' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'technique',
'Aerate The Cocoa',
'Аерирайте какаото',
'Cocoa must pass through a sieve to aerate it. Sift at least twice for best texture.',
'Какаото задължително трябва да мине през сито, за да се аерира. Пресейте поне два пъти.',
2
FROM base_recipes WHERE name = 'Шоколадов блат' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'chef_trick',
'Better 1 Minute Early Than Late',
'По-добре 1 минута по-рано отколкото късно',
'For chocolate cakes, it''s better to remove from oven 1 minute early rather than 1 minute late. They continue cooking from residual heat.',
'При шоколадовите блатове е по-добре да извадите 1 минута по-рано, отколкото 1 минута по-късно. Те продължават да се пекат от остатъчната топлина.',
3
FROM base_recipes WHERE name = 'Шоколадов блат' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'app_advice',
'Add Water When Batter Too Thick',
'Добавете вода ако тестото е много гъсто',
'Since cocoa and psyllium absorb a lot of water, if the batter looks too thick before baking, add 1-2 tablespoons of warm water or almond milk.',
'Тъй като какаото и псилиумът пият много вода, ако тестото изглежда прекалено гъсто преди печене, добавете 1-2 с.л. топла вода или бадемово мляко.',
4
FROM base_recipes WHERE name = 'Шоколадов блат' AND recipe_role_id = 1;


-- ==========================================
-- Червено кадифе (4 notes)
-- ==========================================
INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'technique',
'160°C Is Critical For Color',
'160°C е критично за цвета',
'Temperature must be exactly 160°C to preserve the vibrant red color. Higher heat will darken it.',
'160°C е критично за запазване на цвета! По-висока температура ще го потъмни.',
1
FROM base_recipes WHERE name = 'Блат Червено кадифе' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'ingredient',
'Don''t Exceed 10g Cocoa',
'Не превишавайте 10г какао',
'Maximum 10g cocoa powder - more will make the color too dark brown instead of red.',
'Не превишавайте 10г какао, за да не потъмнее цветът.',
2
FROM base_recipes WHERE name = 'Блат Червено кадифе' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'app_advice',
'Natural Food Coloring Warning',
'Предупреждение за естествен оцветител',
'If using natural food coloring (like beetroot powder), warn users that color may vary after baking.',
'Ако използвате естествен оцветител (като цвекло на прах), предупредете потребителите, че цветът може да варира след печене.',
3
FROM base_recipes WHERE name = 'Блат Червено кадифе' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'pairing',
'Cream Cheese Frosting Is Mandatory',
'Крем сирене е задължителен',
'In the Cake Constructor, ''Red Velvet'' must be paired with Cream Cheese Frosting. This is the iconic combination for this dessert.',
'В ''Конструктора'' на торта, ''Червено кадифе'' задължително трябва да се предлага с Крем сирене (Cream Cheese Frosting). Това е емблематичната комбинация за този десерт.',
4
FROM base_recipes WHERE name = 'Блат Червено кадифе' AND recipe_role_id = 1;


-- ==========================================
-- Много шоколадов блат (4 notes)
-- ==========================================
INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'technique',
'Hot Coffee/Water Is The Secret',
'Горещото кафе/вода е тайната',
'Hot liquid (coffee or water) helps cocoa release its aroma and creates a moister, fudgier texture.',
'Горещата течност (кафе или вода) помага на какаото да освободи аромата си и създава по-влажна, сочна текстура.',
1
FROM base_recipes WHERE name = 'Брауни' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'technique',
'Bakes Slower Due To Fat Content',
'Пече се по-бавно заради мазнините',
'Due to high butter content, this cake bakes more slowly in the center. 40-50 minutes is normal.',
'Поради голямото количество масло, той се пече малко по-бавно в центъра. 40-50 минути е нормално.',
2
FROM base_recipes WHERE name = 'Брауни' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'app_advice',
'Cutting Into 3 Layers Advice',
'Съвет за рязане на три блата',
'Since keto cakes have no gluten, they''re more crumbly. Advise in app: ''To easily cut cake into 3 equal parts, it must have been refrigerated for at least 6-8 hours. Use thread or a very sharp serrated knife.''',
'Тъй като кето блатовете нямат глутен, те са по-ронливи. Дайте съвет в приложението: ''За да разрежете блата лесно на три равни части, той трябва да е престоял в хладилник поне 6-8 часа. Използвайте конец или много остър назъбен нож.''',
3
FROM base_recipes WHERE name = 'Брауни' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'pairing',
'Perfect For Ganache Cakes',
'Перфектен за ганаш торти',
'This cake is perfect for heavy, buttery cakes like ''Ganache'' style.',
'Този блат е перфектен за тежки, маслени торти тип ''Ганаш''.',
4
FROM base_recipes WHERE name = 'Брауни' AND recipe_role_id = 1;


-- ==========================================
-- Френска целувка (Dacquoise) (3 notes)
-- ==========================================
INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'technique',
'Parchment Tracing Trick',
'Трик с очертаването на хартията',
'Trace circles on parchment with pencil, then flip the paper over. This prevents pencil marks from transferring to the meringue.',
'Очертайте кръговете на хартията с молив, след това я обърнете. Това предотвратява преминаването на молива в блата.',
1
FROM base_recipes WHERE name = 'Блат Френски Меренг' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'app_advice',
'Don''t Make In Humid Weather',
'Не приготвяйте в дъждовно време',
'Meringue cakes hate moisture. In app add warning: ''Do not make these cakes in very rainy weather or if there''s a lot of steam in the kitchen - they will absorb moisture and soften.''',
'Целувчените блатове мразят влагата. Добавете в приложението: ''Не приготвяйте тези блатове в много дъждовно време или ако в кухнята има много пара – те ще поемат влагата и ще омекнат.''',
2
FROM base_recipes WHERE name = 'Блат Френски Меренг' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'storage',
'Assemble Right Before Serving',
'Сглобявайте непосредствено преди сервиране',
'These cakes must be assembled with cream immediately before serving (or up to 2-3 hours before) because moisture from cream will dissolve the meringue. If user wants to keep them crispy longer, suggest coating the inside with a thin layer of melted cocoa butter.',
'Тези блатове трябва да се сглобяват с крема непосредствено преди сервиране (или до 2-3 часа преди това), защото влагата от крема ще разтопи целувката. Ако потребителят иска да ги запази хрупкави по-дълго, предложете да ги намаже с тънък слой разтопено какаово масло от вътрешната страна.',
3
FROM base_recipes WHERE name = 'Блат Френски Меренг' AND recipe_role_id = 1;


-- ==========================================
-- Бадемови блатове (Swedish Style) (3 notes)
-- ==========================================
INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'texture',
'Dacquoise Style - Naturally Lower',
'Дакуаз стил - естествено по-ниски',
'These cakes are in ''dacquoise'' style - they don''t rise much, but are exceptionally rich in flavor and aroma.',
'Тези блатове са в стил ''дакуаз'' – те не бухват много, но са изключително богати на вкус и аромат.',
1
FROM base_recipes WHERE name = 'Блат за бадемова торта ала Икеа' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'pairing',
'Classic IKEA Pairing',
'Класическата комбинация от ИКЕА',
'In constructor, this cake must pair with Yellow Egg Yolk Cream - exactly like the original IKEA cake. Since we use 6 egg whites for the cake, the cream should use the remaining 6 yolks. This is a perfect ''zero waste'' recipe.',
'В конструктора този блат задължително се свързва с Яйчен маслен крем (Yellow Egg Yolk Cream) – точно както е в оригиналната торта на Икеа. Тъй като за блатовете ползваме 6 белтъка, кремът трябва да използва останалите 6 жълтъка. Това е перфектната ''zero waste'' (без отпадък) рецепта.',
2
FROM base_recipes WHERE name = 'Блат за бадемова торта ала Икеа' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'technique',
'NEVER Use Mixer For Folding',
'НИКОГА миксер за обединяване',
'Only use spatula for folding in almond flour. Using mixer will deflate the egg whites and ruin the texture.',
'Не използвайте миксер! Смесвайте с шпатула, като загребвате от дъното нагоре. Миксерът ще счупи белтъците.',
3
FROM base_recipes WHERE name = 'Блат за бадемова торта ала Икеа' AND recipe_role_id = 1;


-- ==========================================
-- Гараш блатове (3 notes)
-- ==========================================
INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'app_advice',
'5 Thin Layers vs 2 Thick',
'5 тънки блата срещу 2 дебели',
'In app give option: ''For classic Garash, spread mixture on 5 thin discs. For faster version - on 2 thicker cakes.''',
'В приложението дайте опция: ''За класически Гараш разпределете сместа на 5 тънки диска. За по-бърза версия – на 2 по-дебели блата.''',
1
FROM base_recipes WHERE name = 'Блат за торта Гараш' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'storage',
'Best After Soaking In Cream',
'Най-добри след като попият от крема',
'These cakes can be made 1-2 days ahead. They''re best when they''ve ''soaked'' in the chocolate cream.',
'Тези блатове могат да се направят 1-2 дни по-рано. Те са най-добри, когато ''попият'' от шоколадовия крем.',
2
FROM base_recipes WHERE name = 'Блат за торта Гараш' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'pairing',
'Classic Garash Ganache',
'Класически Гараш ганаш',
'Classic Garash cream is just cream and chocolate (ganache). If user selects these cakes, app should suggest Keto Chocolate Ganache (with cream and cocoa/dark chocolate).',
'Класическият крем Гараш е само сметана и шоколад (ганаш). Ако потребителят избере тези блатове, приложението трябва да му предложи Кето шоколадов ганаш (със сметана и какао/черен шоколад).',
3
FROM base_recipes WHERE name = 'Блат за торта Гараш' AND recipe_role_id = 1;


-- ==========================================
-- Брауни блат (Flourless) (4 notes)
-- ==========================================
INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'texture',
'Dense Truffle Texture',
'Плътна трюфелна текстура',
'This cake contains no flour and has a dense truffle texture. It''s extremely rich, so it pairs best with light dairy creams or fruits.',
'Този блат не съдържа брашно и има текстура на плътен трюфел. Той е изключително наситен, затова се комбинира най-добре с леки млечни кремове или плодове.',
1
FROM base_recipes WHERE name = 'Брауни блат за торта' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'technique',
'Center Will Sink - This Is Normal',
'Центърът ще спадне - това е нормално',
'It will rise dramatically and crack slightly - this is a sign it''s ready. After cooling, it will sink in the center - don''t worry, this is the desired brownie effect!',
'Блатът ще се надуе много и ще се напука леко – това е знак, че е готов. Той ще спадне в центъра – не се плашете, това е търсеният ефект за брауни блат!',
2
FROM base_recipes WHERE name = 'Брауни блат за торта' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'app_advice',
'Alternative Serving Style',
'Алтернативен начин на сервиране',
'If cake is too fragile, use it as one thick single layer with cream on top (like ''Pavlova'' style cake, but chocolate).',
'Ако блатът е твърде крехък, използвайте го като един цял, дебел блат, върху който да наредите крема (тип торта ''Павлова'', но шоколадова).',
3
FROM base_recipes WHERE name = 'Брауни блат за торта' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'storage',
'Mandatory Refrigeration Before Cutting',
'Задължителна хладилничка преди рязане',
'This cake is extremely delicate. Must refrigerate for 4-6 hours before attempting to cut into two layers. Use warm knife (dipped in hot water and dried).',
'Този блат е изключително нежен. Задължително го приберете в хладилник за 4-6 часа, преди да се опитвате да го режете на две. Използвайте топъл нож (потопен в гореща вода и подсушен).',
4
FROM base_recipes WHERE name = 'Брауни блат за торта' AND recipe_role_id = 1;


-- ==========================================
-- Сахер блат (3 notes)
-- ==========================================
INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'pairing',
'Apricot Jam Is The Soul',
'Кайсиево сладко е душата',
'In Constructor, suggest user brush this cake with Keto Apricot Jam (or raspberry) before adding glaze. This is the soul of Sacher Torte.',
'В ''Конструктора'' предложете на потребителя да намаже този блат с Кето сладко от кайсии (или малини) преди да сложи глазурата. Това е душата на торта Сахер.',
1
FROM base_recipes WHERE name = 'Блат за торта Сахер' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'technique',
'Only Cut When Cold',
'Режете само когато е студен',
'Since the cake is dense, it cuts easily, but only when cold.',
'Тъй като блатът е плътен, се реже лесно, но само когато е студен.',
2
FROM base_recipes WHERE name = 'Блат за торта Сахер' AND recipe_role_id = 1;

INSERT INTO lab_notes (recipe_id, category, title, title_bg, content, content_bg, display_order)
SELECT id, 'storage',
'Coconut Flour Stabilizes After Cooling',
'Кокосовото брашно се стабилизира след охлаждане',
'This cake must be refrigerated. Coconut flour only stabilizes after complete cooling.',
'Този блат трябва да престои в хладилник. Кокосовото брашно се стабилизира едва след пълно охлаждане.',
3
FROM base_recipes WHERE name = 'Блат за торта Сахер' AND recipe_role_id = 1;

