-- First, let's check what columns lab_notes table actually has
-- Run this first to verify structure:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'lab_notes' ORDER BY ordinal_position;

-- Import 25 Lab Notes (CORRECTED - removed is_published column)
-- Copy and paste into Supabase SQL Editor

INSERT INTO lab_notes (
  title, title_bg, category, icon, subtitle_en, subtitle_bg,
  content, content_bg, content_json,
  display_order, is_active
) VALUES

-- 1. Almond Flour
('Almond Flour — Why It''s the Keto Base', 'Бадемово Брашно — Защо е Основата на Кето', 'flours', '🌾',
'The foundation of keto cakes', 'Основата на кето тортички',
'Almond flour is the foundation of most keto cakes. It''s naturally low-carb (9-10g per ¼ cup) and adds moisture. BUT: blanched (white) and unblanched (brown) behave differently. Blanched makes light, airy sponge. Unblanched makes denser crust. Never use alone—always mix with other flours (coconut, psyllium) for better texture and structure. Overmixing almond flour releases oils and creates greasy, dense texture. Mix until JUST combined. Always.',
'Бадемовото брашно е основата на повечето кето тортички. То е естествено нискоъглеводно (9-10г на ¼ чаша) и добавя влага. НО: бланшираното (белото) и небланшираното (кафявото) се държат различно. Бланшираното правит лека, въздушна маса. Небланшираното прави по-плътна коричка. Никога не го използвай само — винаги го смесвай с други брашна (кокос, псилиум) за по-добра текстура и структура. Претърсването на бадемовото брашно освобождава масла и създава мазна, плътна текстура. Смесвай докато едва не е комбинирано. Винаги.',
'[{"type":"intro","text_en":"Almond flour is the foundation of most keto cakes. It''s naturally low-carb (9-10g per ¼ cup) and adds moisture. BUT: blanched (white) and unblanched (brown) behave differently. Blanched makes light, airy sponge. Unblanched makes denser crust. Never use alone—always mix with other flours (coconut, psyllium) for better texture and structure.","text_bg":""},{"type":"lab_note","label_en":"KEY MISTAKE","label_bg":"","text_en":"Overmixing almond flour releases oils and creates greasy, dense texture. Mix until JUST combined. Always.","text_bg":""}]',
1, true
),

-- 2. Coconut Flour
('Coconut Flour — Dense & Thirsty', 'Кокосово Брашно — Плътно и Абсорбира Вода', 'flours', '🥥',
'Water absorption master', 'Майстор на абсорбцията на вода',
'Coconut flour absorbs 3-4x more liquid than almond flour. Use it sparingly (¼-½ cup max per recipe) or your cake becomes a brick. It creates very dense texture—ideal for brownie-like cakes, not light sponges. Always combine with lighter flours (almond, psyllium husk). If using coconut flour, reduce other liquids by 15-20%. Test with recipes that already use coconut flour.',
'Кокосовото брашно абсорбира 3-4 пъти повече течност от бадемовото брашно. Използвай го оскъдно (максимум ¼-½ чаша на рецепта) или тортичката ти ще стане тухла. То създава много плътна текстура — идеална за брауни-подобни тортички, не за лека маса. Винаги го комбинирай със по-леки брашна (бадем, люспи на псилиум). Ако използваш кокосово брашно, намали другите течности с 15-20%. Тествай с рецепти, които вече използват кокосово брашно.',
'[{"type":"intro","text_en":"Coconut flour absorbs 3-4x more liquid than almond flour. Use it sparingly (¼-½ cup max per recipe) or your cake becomes a brick. It creates very dense texture—ideal for brownie-like cakes, not light sponges. Always combine with lighter flours (almond, psyllium husk).","text_bg":""},{"type":"tip","text_en":"If using coconut flour, reduce other liquids by 15-20%. Test with recipes that already use coconut flour.","text_bg":""}]',
2, true
),

-- 3. Psyllium Husk
('Psyllium Husk Powder — Instant Structure', 'Прах от Люспи на Псилиум — Моментална Структура', 'flours', '🧪',
'Gluten-free baking''s secret weapon', 'Тайното оръжие на печивото без глутен',
'Psyllium husk powder is gluten-free baking''s secret weapon. It absorbs liquid, prevents collapse, and creates firm structure—especially for egg-free or low-egg recipes. Use 1-2 tablespoons per cake. Too much = dense texture. Start small, adjust. Bread without eggs, dense cakes, moisture-heavy batters. Mix dry first, then add wet ingredients.',
'Прахът от люспи на псилиум е тайното оръжие на печивото без глутен. Абсорбира течност, предотвратява свиване и създава твърда структура — особено за рецепти без яйца или с малко яйца. Използвай 1-2 супени лъжици на тортика. Твърде много = плътна текстура. Започни малко, коригирай. Хляб без яйца, плътни тортички, влажни смеси. Смесвай сухите първо, после добави мокрите съставки.',
'[{"type":"intro","text_en":"Psyllium husk powder is gluten-free baking''s secret weapon. It absorbs liquid, prevents collapse, and creates firm structure—especially for egg-free or low-egg recipes. Use 1-2 tablespoons per cake. Too much = dense texture. Start small, adjust.","text_bg":""},{"type":"lab_note","label_en":"BEST FOR","label_bg":"","text_en":"Bread without eggs, dense cakes, moisture-heavy batters. Mix dry first, then add wet ingredients.","text_bg":""}]',
3, true
),

-- 4. Never One Flour
('Never Use One Flour Alone', 'Никога не Използвай Само Едно Брашно', 'flours', '🔀',
'Flour blending is essential', 'Смесването на брашна е необходимо',
'The golden rule: always mix flours. Almond + coconut + psyllium = better texture, taste, and structure than any single flour. Each brings something: almond = moisture, coconut = density, psyllium = structure. Example: ½ cup almond + 2 tbsp coconut + 1 tbsp psyllium = balanced cake. DO NOT use pure almond flour for bread or any low-moisture recipe—it will be greasy and heavy.',
'Златното правило: винаги смесвай брашна. Бадем + кокос + псилиум = по-добра текстура, вкус и структура от което и да е брашно. Всяко донася нещо: бадем = влага, кокос = плътност, псилиум = структура. Пример: ½ чаша бадем + 2 супени лъжици кокос + 1 супена лъжица псилиум = балансирана тортика. НЕ използвай чисто бадемово брашно за хляб или която и да е рецепта с малко влага — ще бъде мазно и тежко.',
'[{"type":"intro","text_en":"The golden rule: always mix flours. Almond + coconut + psyllium = better texture, taste, and structure than any single flour. Each brings something: almond = moisture, coconut = density, psyllium = structure. Example: ½ cup almond + 2 tbsp coconut + 1 tbsp psyllium = balanced cake.","text_bg":""},{"type":"critical_error","text_en":"DO NOT use pure almond flour for bread or any low-moisture recipe—it will be greasy and heavy.","text_bg":""}]',
4, true
),

-- 5. Blanched vs Unblanched
('Blanched or Unblanched? How to Choose', 'Бланшировано или не? Как да Изберем', 'flours', '🤔',
'Understanding the difference', 'Разбиране на разликата',
'Blanched almond flour (white, no skin) = lighter, fluffier cakes. Unblanched (brown, with skin) = denser, more nutty flavor, slightly more bitter. For light sponges, use blanched. For brownies or dense cakes, unblanched works fine.',
'Бланшировано бадемово брашно (бяло, без кожица) = по-леки, по-пушести тортички. Небланшировано (кафяво, с кожица) = по-плътно, повече ореховато вкусово, малко по-горчиво. За лека маса, използвай бланшировано. За браунита или плътни тортички, небланшираното е добре.',
'[{"type":"intro","text_en":"Blanched almond flour (white, no skin) = lighter, fluffier cakes. Unblanched (brown, with skin) = denser, more nutty flavor, slightly more bitter. For light sponges, use blanched. For brownies or dense cakes, unblanched works fine.","text_bg":""},{"type":"matrix","title_en":"Blanched vs Unblanched","title_bg":"","rows":[{"name":"Blanched","description":"Light sponge, mild flavor, better for delicate cakes"},{"name":"Unblanched","description":"Dense texture, nutty taste, best for brownies/fudgy cakes"}]}]',
5, true
),

-- 6. Net Carbs Comparison
('Net Carbs Comparison — Flour by Flour', 'Нетни Въглехидрати — Сравнение на Брашна', 'flours', '📊',
'Quick keto reference', 'Бързо кето справка',
'Almond flour: 9-10g per ¼ cup (Keto). Coconut flour: 4-5g (Keto, use sparingly). Psyllium husk: 0-1g (Keto). Bamboo fiber: 0-1g (Keto). Flaxseed meal: 1-2g (Keto). Hazelnut flour: 4-5g (Use carefully). Tapioca starch: 21-23g (Not keto). Rice flour: 19-20g (Not keto).',
'Бадемово брашно: 9-10г на ¼ чаша (Кето). Кокосово брашно: 4-5г (Кето, използвай оскъдно). Люспи на псилиум: 0-1г (Кето). Бамбукови влакна: 0-1г (Кето). Мляно лено: 1-2г (Кето). Ореховото брашно: 4-5г (Използвай внимателно). Тапиока скорбло: 21-23г (Не кето). Ризово брашно: 19-20г (Не кето).',
'[{"type":"matrix","title_en":"Net Carbs per ¼ cup (approx)","title_bg":"","rows":[{"name":"Almond flour","description":"9-10g | ✓ Keto"},{"name":"Coconut flour","description":"4-5g | ✓ Keto (use sparingly)"},{"name":"Psyllium husk","description":"0-1g | ✓ Keto"},{"name":"Bamboo fiber","description":"0-1g | ✓ Keto"},{"name":"Flaxseed meal","description":"1-2g | ✓ Keto"},{"name":"Hazelnut flour","description":"4-5g | ⚠️ Use carefully"},{"name":"Tapioca starch","description":"21-23g | ✗ Not keto"},{"name":"Rice flour","description":"19-20g | ✗ Not keto"}]}]',
6, true
),

-- 7. Erythritol Crystallization
('Erythritol Crystals — Grainy Texture Problem', 'Кристали на Еритритол — Проблемът с Гранулираната Текстура', 'sweeteners', '💎',
'Why sweeteners turn grainy', 'Защо подсладителите стават гранулирани',
'Erythritol crystallizes, creating grainy texture (especially in hard candies, fudge, caramel). This happens because erythritol molecules form crystals as they cool. 100% erythritol alone = grainy. Mix erythritol with monk fruit, allulose, or sorbitol. The blend prevents crystallization. Example: 70% erythritol + 30% monk fruit = smooth texture, no graininess.',
'Еритритолът кристализира, създавайки гранулирана текстура (особено в твърди бонбони, фъдж, карамел). Това се случва защото молекулите на еритритола образуват кристали докато се охлаждат. 100% еритритол сам = гранулиран. Смесвай еритритол с монк фрут, алулоза или сорбитол. Смесата предотвратява кристализацията. Пример: 70% еритритол + 30% монк фрут = гладка текстура, без гранулираност.',
'[{"type":"intro","text_en":"Erythritol crystallizes, creating grainy texture (especially in hard candies, fudge, caramel). This happens because erythritol molecules form crystals as they cool. 100% erythritol alone = grainy.","text_bg":""},{"type":"lab_note","label_en":"QUICK FIX","label_bg":"","text_en":"Mix erythritol with monk fruit, allulose, or sorbitol. The blend prevents crystallization. Example: 70% erythritol + 30% monk fruit = smooth texture, no graininess.","text_bg":""}]',
7, true
),

-- 8. Allulose
('Allulose — Most Sugar-Like Sweetener', 'Алулоза — Най-Подобна на Захар', 'sweeteners', '🍯',
'The sugar replacement champion', 'Чемпионът на замяната на захар',
'Allulose tastes & behaves closest to real sugar. It''s 30% less sweet than sugar, browns/caramelizes well, and has no glycemic impact. Conversion: use ¾ cup allulose for every 1 cup sugar. No crystallization issues. No bitter aftertaste. Allulose is ideal for caramel, ganache, and delicate cakes where you need sugar-like behavior.',
'Алулозата има вкус и се държи най-близо до истинската захар. Е 30% по-малко сладка от захар, добре подрумяна/карамелизира и няма гликемичен ефект. Конверсия: използвай ¾ чаша алулоза за всяка 1 чаша захар. Без проблеми с кристализацията. Без горчив привкус. Алулозата е идеална за карамел, ганаш и нежни тортички където ти трябва поведение като захар.',
'[{"type":"intro","text_en":"Allulose tastes & behaves closest to real sugar. It''s 30% less sweet than sugar, browns/caramelizes well, and has no glycemic impact. Conversion: use ¾ cup allulose for every 1 cup sugar. No crystallization issues. No bitter aftertaste.","text_bg":""},{"type":"tip","text_en":"Allulose is ideal for caramel, ganache, and delicate cakes where you need sugar-like behavior.","text_bg":""}]',
8, true
),

-- 9. Monk Fruit
('Monk Fruit — Zero Calories, Very Sweet', 'Монк Фрут — Нула Калории, Много Сладко', 'sweeteners', '🌿',
'The sweet secret weapon', 'Сладкото тайно оръжие',
'Monk fruit extract is 150-200x sweeter than sugar with ZERO calories and zero glycemic impact. But pure monk fruit = very strong (can taste bitter in large amounts). Always mix with erythritol or allulose. Perfect pairing: 50g monk fruit + erythritol blend = smooth sweetness. Never use monk fruit alone in cakes—use only in beverages or as 20-30% of sweetener blend.',
'Екстрактът от монк фрут е 150-200 пъти по-сладък от захар с НУЛА калории и нула гликемичен ефект. Но чистият монк фрут = много силен (може да бъде горчив в големи количества). Винаги го смесвай с еритритол или алулоза. Перфектна комбинация: 50г монк фрут + еритритол смес = гладка сладост. Никога не използвай монк фрут сам в тортички — използвай само в напитки или като 20-30% на подсладител смес.',
'[{"type":"intro","text_en":"Monk fruit extract is 150-200x sweeter than sugar with ZERO calories and zero glycemic impact. But pure monk fruit = very strong (can taste bitter in large amounts). Always mix with erythritol or allulose. Perfect pairing: 50g monk fruit + erythritol blend = smooth sweetness.","text_bg":""},{"type":"critical_error","text_en":"Never use monk fruit alone in cakes—use only in beverages or as 20-30% of sweetener blend.","text_bg":""}]',
9, true
),

-- 10. Erythritol + Monk Fruit Blend
('Erythritol + Monk Fruit — The Ideal Pair', 'Еритритол + Монк Фрут — Перфектна Комбинация', 'sweeteners', '✨',
'The perfect sweetener blend', 'Перфектната смес на подсладители',
'Combine 70% erythritol + 30% monk fruit to mimic real sugar perfectly. This blend: prevents crystallization, no bitter taste, caramelizes well, smooth texture. Use this in ALL your gluten-free keto recipes. Example: 70g erythritol + 30g monk fruit = 100g blend. Use like regular sugar in recipes (roughly 1:1 conversion, slight adjustments needed).',
'Комбинирай 70% еритритол + 30% монк фрут за да имитираш истинската захар перфектно. Тази смес: предотвратява кристализацията, без горчив вкус, добре се карамелизира, гладка текстура. Използвай това във ВСИЧКИ твои рецепти без глутен кето. Пример: 70г еритритол + 30г монк фрут = 100г смес. Използвай като обикновена захар в рецепти (приблизително 1:1 конверсия, малки коригировки се изискват).',
'[{"type":"intro","text_en":"Combine 70% erythritol + 30% monk fruit to mimic real sugar perfectly. This blend: prevents crystallization, no bitter taste, caramelizes well, smooth texture. Use this in ALL your gluten-free keto recipes.","text_bg":""},{"type":"lab_note","label_en":"HOW TO MIX","label_bg":"","text_en":"Example: 70g erythritol + 30g monk fruit = 100g blend. Use like regular sugar in recipes (roughly 1:1 conversion, slight adjustments needed).","text_bg":""}]',
10, true
),

-- 11. Stevia
('Stevia — Use Liquid, Skip Powder', 'Стевия — Само Течна, Не Прахообразна', 'sweeteners', '🌱',
'Why stevia works better liquid', 'Защо стевия е по-добра течна',
'Stevia is extremely concentrated and has a bitter aftertaste (many people notice it). Use liquid stevia ONLY for beverages. Never for baked goods. If you must use powder, mask bitterness with vanilla, lemon, or cinnamon. Better sweeteners for baking: allulose, erythritol, or monk fruit blends. Avoid stevia in solid recipes.',
'Стевията е изключително концентрирана и има горчив привкус (много хора го забелязват). Използвай течна стевия САМО за напитки. Никога за печени хлебни изделия. Ако трябва да използваш прахообразна, замаскирай горчивостта с ванилия, лимон или канел. По-добри подсладители за печене: алулоза, еритритол или смеси от монк фрут. Избягвай стевия в твърдите рецепти.',
'[{"type":"intro","text_en":"Stevia is extremely concentrated and has a bitter aftertaste (many people notice it). Use liquid stevia ONLY for beverages. Never for baked goods. If you must use powder, mask bitterness with vanilla, lemon, or cinnamon.","text_bg":""},{"type":"tip","text_en":"Better sweeteners for baking: allulose, erythritol, or monk fruit blends. Avoid stevia in solid recipes.","text_bg":""}]',
11, true
),

-- 12. Sweetener Weights vs Volume
('Sweetener Weights vs Volume — Why Grams Matter', 'Тегло vs Обем на Подсладители — Защо Граме са Важни', 'sweeteners', '📏',
'Precision in keto baking', 'Прецизност в кето печене',
'By volume: 1 tablespoon (15ml) ≈ 3 teaspoons (5ml each). BUT weight varies by sweetener density. Granulated erythritol: 1 tbsp ≈ 12.5g, 1 tsp ≈ 4g (close ratio). Powdered: different. For accuracy, weigh everything in grams, not cups/teaspoons. DON''T assume all sweeteners convert the same way by volume. Use a digital scale for precision.',
'По обем: 1 супена лъжица (15ml) ≈ 3 чайни лъжички (5ml всяка). НО теглото варира по densidade на подсладителя. Гранулиран еритритол: 1 супена лъжица ≈ 12.5г, 1 чайна лъжица ≈ 4г (близо съотношение). Прахообразна: различна. За точност, претегли всичко в грамове, не в чаши/чайни лъжички. НЕ предполагай че всички подсладители се превръщат по един и същи начин по обем. Използвай дигитална везна за прецизност.',
'[{"type":"intro","text_en":"By volume: 1 tablespoon (15ml) ≈ 3 teaspoons (5ml each). BUT weight varies by sweetener density. Granulated erythritol: 1 tbsp ≈ 12.5g, 1 tsp ≈ 4g (close ratio). Powdered: different. For accuracy, weigh everything in grams, not cups/teaspoons.","text_bg":""},{"type":"critical_error","text_en":"DON''T assume all sweeteners convert the same way by volume. Use a digital scale for precision.","text_bg":""}]',
12, true
),

-- 13. Cake Collapse
('Cake Collapse — 3 Causes & Fixes', 'Блатото Се Свива — 3 Причини и Решения', 'mistakes', '💥',
'Structural failure diagnosis', 'Диагноза за структурен отказ',
'Gluten-free cakes collapse when structure is weak or oven heat is wrong. This is one of the most common keto baking problems. It''s fixable. Oven not preheated: Preheat 10-15 min before baking. Opened door too early: Never open first half of baking. Weak structure: Add psyllium, protein, or chia molido.',
'Печивата без глутен се свиват когато структурата е слаба или топлината на фурната е грешна. Това е един от най-честите проблеми с кето печенето. Поправимо е. Фурната не е предварително нагрята: Загрей 10-15 мин преди печене. Отварял си врата твърде рано: Никога не отваряй първата половина на печене. Слаба структура: Добави псилиум, протеин или мляно чия.',
'[{"type":"intro","text_en":"Gluten-free cakes collapse when structure is weak or oven heat is wrong. This is one of the most common keto baking problems. It''s fixable.","text_bg":""},{"type":"matrix","title_en":"Causes & Fixes","title_bg":"","rows":[{"name":"Oven not preheated","description":"Preheat 10-15 min before baking"},{"name":"Opened door too early","description":"Never open first half of baking"},{"name":"Weak structure","description":"Add psyllium, protein, or chia molido"}]}]',
13, true
),

-- 14. Uneven Baking
('Uneven Baking — Heat Distribution Fix', 'Неравномерно Печене — Как да Разпределим Топлина', 'mistakes', '🌡️',
'Raw inside, dry outside', 'Сурово вътре, сухо отвън',
'If your cake is raw in center but brown outside, your oven heat distribution is uneven. This happens with very hot ovens or ovens that only heat from bottom. Use oven with top & bottom heat (no fan). Use wider, shorter mold. Cover with foil if browning too fast. Bake at slightly lower temperature (160°C instead of 180°C).',
'Ако тортичката ти е сурова в центъра но кафява отвън, разпределението на топлина на фурната ти е неравномерно. Това се случва с много горещи фурни или фурни които нагряват само от дъно. Използвай фурна с топлина отгоре и отдолу (без вентилатор). Използвай по-широка, по-къса форма. Покрий с алуминиева фолия ако подрумява твърде бързо. Печи при малко по-ниска температура (160°C вместо 180°C).',
'[{"type":"intro","text_en":"If your cake is raw in center but brown outside, your oven heat distribution is uneven. This happens with very hot ovens or ovens that only heat from bottom.","text_bg":""},{"type":"lab_note","label_en":"SOLUTION","label_bg":"","text_en":"Use oven with top & bottom heat (no fan). Use wider, shorter mold. Cover with foil if browning too fast. Bake at slightly lower temperature (160°C instead of 180°C).","text_bg":""}]',
14, true
),

-- 15. Dough Won''t Hold
('Dough Won''t Hold Together', 'Тестото не Се Драпира', 'mistakes', '📍',
'Adding binding agents', 'Добавяне на свързващи агенти',
'Gluten-free dough lacks natural cohesion (no gluten). If it breaks when you touch it, add binding agents: xanthan gum, psyllium, flaxseed meal, or chia molido. Use room-temperature eggs (not cold). Wait completely before unmolding—gluten-free cakes are fragile when warm.',
'Тестото без глутен липсва естественото свързване (няма глутен). Ако се пречупва когато го докоснеш, добави свързващи агенти: ксантанова гума, псилиум, прах от лено или мляно чия. Използвай яйца при стайна температура (не студени). Чакай докато полностью се охлаж преди да вадиш от форма — печивата без глутен са крехки когато са топли.',
'[{"type":"intro","text_en":"Gluten-free dough lacks natural cohesion (no gluten). If it breaks when you touch it, add binding agents: xanthan gum, psyllium, flaxseed meal, or chia molido.","text_bg":""},{"type":"tip","text_en":"Use room-temperature eggs (not cold). Wait completely before unmolding—gluten-free cakes are fragile when warm.","text_bg":""}]',
15, true
),

-- 16. Grainy Texture
('Grainy, Sandy Texture — What Went Wrong', 'Гранулирана Текстура — Какво се Случи', 'mistakes', '🌾',
'Sweetener not dissolved', 'Подсладител не е разтворен',
'Grainy texture = sweetener (usually erythritol) not dissolved properly OR too much dry nut flour. Solution: use powdered sweetener (you can make it yourself with a coffee grinder). Pulverize erythritol with a coffee grinder or blender for 20-30 seconds until fine like powdered sugar. Mix dry ingredients thoroughly before adding wet.',
'Гранулирана текстура = подсладител (обикновено еритритол) не е разтворен правилно ИЛИ твърде много сухо ореховото брашно. Решение: използвай прахообразен подсладител (можеш да го направиш сам с млинче за кафе). Изпълвериз еритритола с млинче за кафе или блендер за 20-30 секунди докато фин като прахосъм захар. Смесвай сухите съставки тщателно преди да добавиш мокрите.',
'[{"type":"intro","text_en":"Grainy texture = sweetener (usually erythritol) not dissolved properly OR too much dry nut flour. Solution: use powdered sweetener (you can make it yourself with a coffee grinder).","text_bg":""},{"type":"lab_note","label_en":"QUICK FIX","label_bg":"","text_en":"Pulverize erythritol with a coffee grinder or blender for 20-30 seconds until fine like powdered sugar. Mix dry ingredients thoroughly before adding wet.","text_bg":""}]',
16, true
),

-- 17. Bland or Weird Taste
('Tastes Bland or Weird — How to Fix', 'Вкусът е Скучен или Странен — Как да Го Поправим', 'mistakes', '😕',
'Master the flavor balance', 'Владей баланса на вкуса',
'Gluten-free keto cakes taste bland because: (1) erythritol alone has metallic aftertaste, (2) missing salt to balance sweetness, (3) no vanilla or lemon zest. Solution: balance flavors. Metallic taste: Use sweetener blend (erythritol + monk fruit) not erythritol alone. Too sweet: Add tiny pinch of salt (even in sweet recipes). Boring: Add vanilla, lemon zest, or cinnamon. Bitter: Use better quality nut flour or reduce psyllium.',
'Печивата без глутен кето вкус скучен защото: (1) еритритолът сам има метален привкус, (2) липсва сол за баланс на сладост, (3) няма ванилия или лимонова цеста. Решение: баланс на вкусовете. Метален вкус: Използвай смес на подсладители (еритритол + монк фрут) не само еритритол. Твърде сладко: Добави малка щипка сол (дори и в сладки рецепти). Скучно: Добави ванилия, лимонова цеста или канел. Горчиво: Използвай по-качествено ореховото брашно или намали псилиума.',
'[{"type":"intro","text_en":"Gluten-free keto cakes taste bland because: (1) erythritol alone has metallic aftertaste, (2) missing salt to balance sweetness, (3) no vanilla or lemon zest. Solution: balance flavors.","text_bg":""},{"type":"matrix","title_en":"Flavor Fixes","title_bg":"","rows":[{"name":"Metallic taste","description":"Use sweetener blend (erythritol + monk fruit) not erythritol alone"},{"name":"Too sweet","description":"Add tiny pinch of salt (even in sweet recipes)"},{"name":"Boring","description":"Add vanilla, lemon zest, or cinnamon"},{"name":"Bitter","description":"Use better quality nut flour or reduce psyllium"}]}]',
17, true
),

-- 18. Too Dense
('Cake Too Dense — Texture Problem', 'Блатото е Твърде Плътно — Проблем с Текстурата', 'mistakes', '🪨',
'Overmixing or wrong flour', 'Претърсване или грешно брашно',
'Dense cake = overmixing flour (develops gluten alternative) OR using wrong flour (coconut flour without balance). Never overmix. Mix only until JUST combined. Use almond flour as base, add small amounts of coconut. Use whipped egg whites or beaten eggs to add air. Rest batter 5 minutes before baking.',
'Плътна тортика = претърсване на брашно (развива алтернатива на глутен) ИЛИ използване на грешно брашно (кокосово брашно без баланс). Никога не претърсвай. Смесвай докато едва не е комбинирано. Използвай бадемово брашно като основа, добави малки количества кокос. Използвай разбити белци или разбити яйца за добавяне на въздух. Остави тестото 5 минути преди печене.',
'[{"type":"intro","text_en":"Dense cake = overmixing flour (develops gluten alternative) OR using wrong flour (coconut flour without balance). Never overmix. Mix only until JUST combined. Use almond flour as base, add small amounts of coconut.","text_bg":""},{"type":"tip","text_en":"Use whipped egg whites or beaten eggs to add air. Rest batter 5 minutes before baking.","text_bg":""}]',
18, true
),

-- 19. Room Temp Emulsion
('Room Temp Eggs & Cream = Better Emulsion', 'Яйца и Крем при Стайна Температура = По-добра Емулсия', 'assembly', '🌡️',
'Why temperature matters', 'Защо температурата е важна',
'Cold eggs and cream don''t emulsify properly—batter separates, texture becomes grainy or oily. Bring eggs and dairy to room temperature (30 min before mixing). This helps batter incorporate air better. Room-temperature ingredients = smoother batter, more uniform texture, better rise, lighter crumb.',
'Студени яйца и крем не се емулсират правилно — тестото се разделя, текстурата става гранулирана или маслена. Донеси яйца и млечни продукти до стайна температура (30 мин преди смесване). Това помага на тестото да поеме въздух по-добре. Съставки при стайна температура = по-гладко тесто, по-равномерна текстура, по-добър подем, по-лека миякa.',
'[{"type":"intro","text_en":"Cold eggs and cream don''t emulsify properly—batter separates, texture becomes grainy or oily. Bring eggs and dairy to room temperature (30 min before mixing). This helps batter incorporate air better.","text_bg":""},{"type":"lab_note","label_en":"KEY TIP","label_bg":"","text_en":"Room-temperature ingredients = smoother batter, more uniform texture, better rise, lighter crumb.","text_bg":""}]',
19, true
),

-- 20. Always Preheat
('Always Preheat 10-15 Minutes', 'Винаги Загрявай Фурната 10-15 Минути', 'assembly', '🔥',
'Non-negotiable step', 'Неотложима стъпка',
'Preheating is CRITICAL for gluten-free baking. A properly preheated oven = even heat distribution = no collapse, no raw center. Skip preheating = disaster. Preheat minimum 10-15 minutes. NEVER skip oven preheating in gluten-free recipes. It''s the difference between success and failure.',
'Предварителното нагряване е КРИТИЧНО за печенето без глутен. Правилно предварително нагрята фурна = равномерно разпределение на топлина = без свиване, без сурав център. Пропуснеш предварителното нагряване = катастрофа. Загрей минимум 10-15 минути. НИКОГА не пропускай предварителното нагряване на фурна в рецепти без глутен. То е разликата между успех и неудача.',
'[{"type":"intro","text_en":"Preheating is CRITICAL for gluten-free baking. A properly preheated oven = even heat distribution = no collapse, no raw center. Skip preheating = disaster. Preheat minimum 10-15 minutes.","text_bg":""},{"type":"critical_error","text_en":"NEVER skip oven preheating in gluten-free recipes. It''s the difference between success and failure.","text_bg":""}]',
20, true
),

-- 21. Xanthan vs Guar
('Xanthan vs Guar Gum — Structural Differences', 'Ксантанова Гума vs Гуарова Гума — Структурни Разлики', 'assembly', '⚖️',
'When to use each', 'Кога да използваш всяка',
'Both add elasticity & cohesion (mimic gluten). Xanthan: stronger, more stretchy (best for bread). Guar: milder, smoother (better for delicate cakes). Never use alone—always combine with psyllium or protein. Xanthan gum: Stretchy, strong, best for bread, can make gummy if overused. Guar gum: Smooth, mild, best for cakes, less sticky. Psyllium husk: Absorbs liquid, adds structure, best for moisture-heavy recipes.',
'И двата добавят еластичност и свързване (имитират глутен). Ксантанова: по-силна, по-разтегляща (най-добра за хляб). Гуарова: по-мека, по-гладка (по-добра за нежни тортички). Никога не използвай сам — винаги комбинирай с псилиум или протеин. Ксантанова гума: Разтегляща, силна, най-добра за хляб, може да направи гумена ако се използва твърде много. Гуарова гума: Гладка, мека, най-добра за тортички, по-малко залепляща. Люспи на псилиум: Абсорбира течност, добавя структура, най-добра за влажни рецепти.',
'[{"type":"intro","text_en":"Both add elasticity & cohesion (mimic gluten). Xanthan: stronger, more stretchy (best for bread). Guar: milder, smoother (better for delicate cakes). Never use alone—always combine with psyllium or protein.","text_bg":""},{"type":"matrix","title_en":"Gum Comparison","title_bg":"","rows":[{"name":"Xanthan gum","description":"Stretchy, strong, best for bread, can make gummy if overused"},{"name":"Guar gum","description":"Smooth, mild, best for cakes, less sticky"},{"name":"Psyllium husk","description":"Absorbs liquid, adds structure, best for moisture-heavy recipes"}]}]',
21, true
),

-- 22. Chia Flax Replacers
('Ground Chia & Flax — Egg Replacers', 'Мляно Чия и Лен — Замени на Яйца', 'assembly', '🌱',
'Natural binding agents', 'Естествени свързващи агенти',
'Ground chia (1 tbsp + 3 tbsp water, rest 10 min) = replaces 1 egg. Adds moisture, structure, cohesion. Same with flaxseed meal. Both are keto-friendly, add fiber, bind doughs naturally. Chia + almond flour = great for egg-free cakes. Chia + psyllium = perfect for bread without eggs.',
'Мляно чия (1 супена лъжица + 3 супени лъжици вода, почивай 10 мин) = замения 1 яйце. Добавя влага, структура, свързване. Същото с мляно лено. И двата са кето-приятни, добавят клетчатка, свързват тестата естествено. Чия + бадемово брашно = отлично за безяйчни тортички. Чия + псилиум = перфектно за хляб без яйца.',
'[{"type":"intro","text_en":"Ground chia (1 tbsp + 3 tbsp water, rest 10 min) = replaces 1 egg. Adds moisture, structure, cohesion. Same with flaxseed meal. Both are keto-friendly, add fiber, bind doughs naturally.","text_bg":""},{"type":"tip","text_en":"Chia + almond flour = great for egg-free cakes. Chia + psyllium = perfect for bread without eggs.","text_bg":""}]',
22, true
),

-- 23. Gelatin
('Gelatin — Structure & Moisture for Fragile Cakes', 'Желатин — Структура и Влага за Нежни Тортички', 'assembly', '🥄',
'For delicate desserts', 'За нежни десерти',
'Gelatin adds structure and moisture to delicate keto cakes (especially those without eggs). Dissolve in warm water first, cool slightly, then add to batter. Works well in cheesecakes and mousse-based cakes. Ideal for egg-free cakes, delicate cheesecakes, mousses. Adds tender crumb without graininess.',
'Желатинът добавя структура и влага на нежни кето тортички (особено тези без яйца). Разтвори в топла вода първо, охлади малко, после добави към тестото. Работи добре в сирене тортички и мусни тортички. Идеален за безяйчни тортички, нежни сирене тортички, мусове. Добавя нежна миякa без гранулираност.',
'[{"type":"intro","text_en":"Gelatin adds structure and moisture to delicate keto cakes (especially those without eggs). Dissolve in warm water first, cool slightly, then add to batter. Works well in cheesecakes and mousse-based cakes.","text_bg":""},{"type":"lab_note","label_en":"USE CASE","label_bg":"","text_en":"Ideal for egg-free cakes, delicate cheesecakes, mousses. Adds tender crumb without graininess.","text_bg":""}]',
23, true
),

-- 24. Digital Scale
('Weigh Ingredients in Grams, Not Cups', 'Претегли Съставките в Грамове, Не в Чаши', 'assembly', '⚖️',
'The most important tool', 'Най-важният инструмент',
'For gluten-free keto baking, a digital scale is ESSENTIAL. Flours and sweeteners have different densities. 1 cup almond flour ≠ 1 cup coconut flour by weight. Weighing = consistency = success. DO NOT estimate with cups/spoons. Invest in a cheap digital scale ($10-20). It will save your recipes.',
'За печенето без глутен кето, дигитална везна е НЕОБХОДИМА. Брашната и подсладителите имат различни плътности. 1 чаша бадемово брашно ≠ 1 чаша кокосово брашно по тегло. Претегляне = последователност = успех. НЕ оценявай с чаши/лъжици. Инвестирай в евтина дигитална везна ($10-20). Ще спаси твоите рецепти.',
'[{"type":"intro","text_en":"For gluten-free keto baking, a digital scale is ESSENTIAL. Flours and sweeteners have different densities. 1 cup almond flour ≠ 1 cup coconut flour by weight. Weighing = consistency = success.","text_bg":""},{"type":"critical_error","text_en":"DO NOT estimate with cups/spoons. Invest in a cheap digital scale ($10-20). It will save your recipes.","text_bg":""}]',
24, true
),

-- 25. Volume Conversions
('Volume Conversions — Misleading in Keto Baking', 'Конверсии на Обем — Подвеждащи в Кето Печива', 'assembly', '📐',
'1 tablespoon ≠ 3 teaspoons by weight', '1 супена лъжица ≠ 3 чайни лъжички по тегло',
'By volume: 1 tablespoon (15ml) = 3 teaspoons (5ml). TRUE by volume. FALSE by weight! Granulated erythritol: 1 tbsp ≈ 12.5g, 1 tsp ≈ 4g (close). But powdered sweetener? Different density. Almond flour? Also different. Always weigh when possible. Use grams for flours, sweeteners, and fats. Use milliliters for water/oil. You''ll get consistent results.',
'По обем: 1 супена лъжица (15ml) = 3 чайни лъжички (5ml). ИСТИНА по обем. НЕИСТИНА по тегло! Гранулиран еритритол: 1 супена лъжица ≈ 12.5г, 1 чайна лъжица ≈ 4г (близо). Но прахообразен подсладител? Различна плътност. Бадемово брашно? Също различно. Винаги претегли когато можеш. Използвай грамове за брашна, подсладители и мастни вещества. Използвай милилитри за вода/масло. Ще получиш последователни резултати.',
'[{"type":"intro","text_en":"By volume: 1 tablespoon (15ml) = 3 teaspoons (5ml). TRUE by volume. FALSE by weight! Granulated erythritol: 1 tbsp ≈ 12.5g, 1 tsp ≈ 4g (close). But powdered sweetener? Different density. Almond flour? Also different. Always weigh when possible.","text_bg":""},{"type":"tip","text_en":"Use grams for flours, sweeteners, and fats. Use milliliters for water/oil. You''ll get consistent results.","text_bg":""}]',
25, true
);

-- Verification query
SELECT COUNT(*) as total_inserted,
       COUNT(DISTINCT category) as categories_used
FROM lab_notes 
WHERE display_order BETWEEN 1 AND 25;
