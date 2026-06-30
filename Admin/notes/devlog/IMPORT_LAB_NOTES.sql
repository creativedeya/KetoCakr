-- Import 25 Lab Notes directly via SQL
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/bvnmsiritbqypnnxadnl/sql

INSERT INTO lab_notes (
  title, title_bg, category, icon, subtitle_en, subtitle_bg,
  content, content_bg, content_json,
  display_order, is_active, is_published
) VALUES

-- 1. Almond Flour
('Almond Flour — Why It''s the Keto Base', 'Бадемово Брашно — Защо е Основата на Кето', 'flours', '🌾',
'The foundation of keto cakes', 'Основата на кето тортички',
'Almond flour is the foundation of most keto cakes. It''s naturally low-carb (9-10g per ¼ cup) and adds moisture. BUT: blanched (white) and unblanched (brown) behave differently. Blanched makes light, airy sponge. Unblanched makes denser crust. Never use alone—always mix with other flours (coconut, psyllium) for better texture and structure. Overmixing almond flour releases oils and creates greasy, dense texture. Mix until JUST combined. Always.',
'Бадемовото брашно е основата на повечето кето тортички. То е естествено нискоъглеводно (9-10г на ¼ чаша) и добавя влага. НО: бланшираното (белото) и небланшираното (кафявото) се държат различно. Бланшираното правит лека, въздушна маса. Небланшираното прави по-плътна коричка. Никога не го използвай само — винаги го смесвай с други брашна (кокос, псилиум) за по-добра текстура и структура. Претърсването на бадемовото брашно освобождава масла и създава мазна, плътна текстура. Смесвай докато едва не е комбинирано. Винаги.',
'[{"type":"intro","text_en":"Almond flour is the foundation of most keto cakes. It''s naturally low-carb (9-10g per ¼ cup) and adds moisture. BUT: blanched (white) and unblanched (brown) behave differently. Blanched makes light, airy sponge. Unblanched makes denser crust. Never use alone—always mix with other flours (coconut, psyllium) for better texture and structure.","text_bg":""},{"type":"lab_note","label_en":"KEY MISTAKE","label_bg":"","text_en":"Overmixing almond flour releases oils and creates greasy, dense texture. Mix until JUST combined. Always.","text_bg":""}]',
1, true, true
),

-- 2. Coconut Flour
('Coconut Flour — Dense & Thirsty', 'Кокосово Брашно — Плътно и Абсорбира Вода', 'flours', '🥥',
'Water absorption master', 'Майстор на абсорбцията на вода',
'Coconut flour absorbs 3-4x more liquid than almond flour. Use it sparingly (¼-½ cup max per recipe) or your cake becomes a brick. It creates very dense texture—ideal for brownie-like cakes, not light sponges. Always combine with lighter flours (almond, psyllium husk). If using coconut flour, reduce other liquids by 15-20%. Test with recipes that already use coconut flour.',
'Кокосовото брашно абсорбира 3-4 пъти повече течност от бадемовото брашно. Използвай го оскъдно (максимум ¼-½ чаша на рецепта) или тортичката ти ще стане тухла. То създава много плътна текстура — идеална за брауни-подобни тортички, не за лека маса. Винаги го комбинирай със по-леки брашна (бадем, люспи на псилиум). Ако използваш кокосово брашно, намали другите течности с 15-20%. Тествай с рецепти, които вече използват кокосово брашно.',
'[{"type":"intro","text_en":"Coconut flour absorbs 3-4x more liquid than almond flour. Use it sparingly (¼-½ cup max per recipe) or your cake becomes a brick. It creates very dense texture—ideal for brownie-like cakes, not light sponges. Always combine with lighter flours (almond, psyllium husk).","text_bg":""},{"type":"tip","text_en":"If using coconut flour, reduce other liquids by 15-20%. Test with recipes that already use coconut flour.","text_bg":""}]',
2, true, true
),

-- 3. Psyllium Husk
('Psyllium Husk Powder — Instant Structure', 'Прах от Люспи на Псилиум — Моментална Структура', 'flours', '🧪',
'Gluten-free baking''s secret weapon', 'Тайното оръжие на печивото без глутен',
'Psyllium husk powder is gluten-free baking''s secret weapon. It absorbs liquid, prevents collapse, and creates firm structure—especially for egg-free or low-egg recipes. Use 1-2 tablespoons per cake. Too much = dense texture. Start small, adjust. Bread without eggs, dense cakes, moisture-heavy batters. Mix dry first, then add wet ingredients.',
'Прахът от люспи на псилиум е тайното оръжие на печивото без глутен. Абсорбира течност, предотвратява свиване и създава твърда структура — особено за рецепти без яйца или с малко яйца. Използвай 1-2 супени лъжици на тортика. Твърде много = плътна текстура. Започни малко, коригирай. Хляб без яйца, плътни тортички, влажни смеси. Смесвай сухите първо, после добави мокрите съставки.',
'[{"type":"intro","text_en":"Psyllium husk powder is gluten-free baking''s secret weapon. It absorbs liquid, prevents collapse, and creates firm structure—especially for egg-free or low-egg recipes. Use 1-2 tablespoons per cake. Too much = dense texture. Start small, adjust.","text_bg":""},{"type":"lab_note","label_en":"BEST FOR","label_bg":"","text_en":"Bread without eggs, dense cakes, moisture-heavy batters. Mix dry first, then add wet ingredients.","text_bg":""}]',
3, true, true
),

-- 4. Never One Flour
('Never Use One Flour Alone', 'Никога не Използвай Само Едно Брашно', 'flours', '🔀',
'Flour blending is essential', 'Смесването на брашна е необходимо',
'The golden rule: always mix flours. Almond + coconut + psyllium = better texture, taste, and structure than any single flour. Each brings something: almond = moisture, coconut = density, psyllium = structure. Example: ½ cup almond + 2 tbsp coconut + 1 tbsp psyllium = balanced cake. DO NOT use pure almond flour for bread or any low-moisture recipe—it will be greasy and heavy.',
'Златното правило: винаги смесвай брашна. Бадем + кокос + псилиум = по-добра текстура, вкус и структура от което и да е брашно. Всяко донася нещо: бадем = влага, кокос = плътност, псилиум = структура. Пример: ½ чаша бадем + 2 супени лъжици кокос + 1 супена лъжица псилиум = балансирана тортика. НЕ използвай чисто бадемово брашно за хляб или която и да е рецепта с малко влага — ще бъде мазно и тежко.',
'[{"type":"intro","text_en":"The golden rule: always mix flours. Almond + coconut + psyllium = better texture, taste, and structure than any single flour. Each brings something: almond = moisture, coconut = density, psyllium = structure. Example: ½ cup almond + 2 tbsp coconut + 1 tbsp psyllium = balanced cake.","text_bg":""},{"type":"critical_error","text_en":"DO NOT use pure almond flour for bread or any low-moisture recipe—it will be greasy and heavy.","text_bg":""}]',
4, true, true
),

-- 5. Blanched vs Unblanched
('Blanched or Unblanched? How to Choose', 'Бланшировано или не? Как да Изберем', 'flours', '🤔',
'Understanding the difference', 'Разбиране на разликата',
'Blanched almond flour (white, no skin) = lighter, fluffier cakes. Unblanched (brown, with skin) = denser, more nutty flavor, slightly more bitter. For light sponges, use blanched. For brownies or dense cakes, unblanched works fine.',
'Бланшировано бадемово брашно (бяло, без кожица) = по-леки, по-пушести тортички. Небланшировано (кафяво, с кожица) = по-плътно, повече ореховато вкусово, малко по-горчиво. За лека маса, използвай бланшировано. За браунита или плътни тортички, небланшираното е добре.',
'[{"type":"intro","text_en":"Blanched almond flour (white, no skin) = lighter, fluffier cakes. Unblanched (brown, with skin) = denser, more nutty flavor, slightly more bitter. For light sponges, use blanched. For brownies or dense cakes, unblanched works fine.","text_bg":""},{"type":"matrix","title_en":"Blanched vs Unblanched","title_bg":"","rows":[{"name":"Blanched","description":"Light sponge, mild flavor, better for delicate cakes"},{"name":"Unblanched","description":"Dense texture, nutty taste, best for brownies/fudgy cakes"}]}]',
5, true, true
),

-- 6. Net Carbs Comparison
('Net Carbs Comparison — Flour by Flour', 'Нетни Въглехидрати — Сравнение на Брашна', 'flours', '📊',
'Quick keto reference', 'Бързо кето справка',
'Almond flour: 9-10g per ¼ cup (Keto). Coconut flour: 4-5g (Keto, use sparingly). Psyllium husk: 0-1g (Keto). Bamboo fiber: 0-1g (Keto). Flaxseed meal: 1-2g (Keto). Hazelnut flour: 4-5g (Use carefully). Tapioca starch: 21-23g (Not keto). Rice flour: 19-20g (Not keto).',
'Бадемово брашно: 9-10г на ¼ чаша (Кето). Кокосово брашно: 4-5г (Кето, използвай оскъдно). Люспи на псилиум: 0-1г (Кето). Бамбукови влакна: 0-1г (Кето). Мляно лено: 1-2г (Кето). Ореховото брашно: 4-5г (Използвай внимателно). Тапиока скорбло: 21-23г (Не кето). Ризово брашно: 19-20г (Не кето).',
'[{"type":"matrix","title_en":"Net Carbs per ¼ cup (approx)","title_bg":"","rows":[{"name":"Almond flour","description":"9-10g | ✓ Keto"},{"name":"Coconut flour","description":"4-5g | ✓ Keto (use sparingly)"},{"name":"Psyllium husk","description":"0-1g | ✓ Keto"},{"name":"Bamboo fiber","description":"0-1g | ✓ Keto"},{"name":"Flaxseed meal","description":"1-2g | ✓ Keto"},{"name":"Hazelnut flour","description":"4-5g | ⚠️ Use carefully"},{"name":"Tapioca starch","description":"21-23g | ✗ Not keto"},{"name":"Rice flour","description":"19-20g | ✗ Not keto"}]}]',
6, true, true
);

-- Verification
SELECT COUNT(*) as total_notes, 
       COUNT(DISTINCT category) as categories
FROM lab_notes 
WHERE display_order BETWEEN 1 AND 6;
