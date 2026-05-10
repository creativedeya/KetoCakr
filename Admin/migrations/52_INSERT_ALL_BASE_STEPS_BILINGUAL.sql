-- ============================================================
-- File: 52_INSERT_ALL_BASE_STEPS_BILINGUAL.sql
-- Project: KetoCakR | Date: 2026-04-07
-- Description: Bilingual instruction steps for 22 base recipes
-- ============================================================

INSERT INTO recipe_instruction_steps (
  recipe_id, step_number,
  step_description, step_description_bg, step_description_en
)
VALUES
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов въздушен кето блат' AND recipe_role_id = 1),
    1,
    'Подготовка: Загрейте фурната на 160°C (с вентилатор). При тази рецепта високата температура (180°C) ще накара блата да избухне и след това да колабира (да спадне в средата).',
    'Подготовка: Загрейте фурната на 160°C (с вентилатор). При тази рецепта високата температура (180°C) ще накара блата да избухне и след това да колабира (да спадне в средата).',
    'Preparation: Preheat the oven to 160°C (with fan). In this recipe, a high temperature (180°C) will cause the base to explode and then collapse (sink in the middle).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов въздушен кето блат' AND recipe_role_id = 1),
    2,
    'Сух микс: Смесете бадемовото, кокосовото брашно, псилиума и ксантановата гума. Пресейте ги два пъти. В кето сладкарството пресяването на "тежките" ядкови брашна е жизненоважно за "въздушния" ефект.',
    'Сух микс: Смесете бадемовото, кокосовото брашно, псилиума и ксантановата гума. Пресейте ги два пъти. В кето сладкарството пресяването на "тежките" ядкови брашна е жизненоважно за "въздушния" ефект.',
    'Dry mix: Combine almond flour, coconut flour, psyllium, and xanthan gum. Sift them twice. In keto baking, sifting the "heavy" nut flours is crucial for the "airy" effect.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов въздушен кето блат' AND recipe_role_id = 1),
    3,
    'Жълтъци: Разбийте жълтъците с 60 г еритритол, докато сместа стане гъста, бледа и увеличи обема си тройно. Това отнема около 5 минути с мощен миксер.',
    'Жълтъци: Разбийте жълтъците с 60 г еритритол, докато сместа стане гъста, бледа и увеличи обема си тройно. Това отнема около 5 минути с мощен миксер.',
    'Egg yolks: Whisk the egg yolks with 60 g of erythritol until the mixture becomes thick, pale, and triples in volume. This takes about 5 minutes with a powerful mixer.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов въздушен кето блат' AND recipe_role_id = 1),
    4,
    'Белтъци (Меринг): Разбийте белтъците със солта до меки върхове. Започнете да добавяте останалия еритритол (90 г) лъжица по лъжица. Разбивайте до твърди, лъскави върхове.',
    'Белтъци (Меринг): Разбийте белтъците със солта до меки върхове. Започнете да добавяте останалия еритритол (90 г) лъжица по лъжица. Разбивайте до твърди, лъскави върхове.',
    'Egg whites (Meringue): Whip the egg whites with salt until soft peaks form. Start adding the remaining erythritol (90 g) one tablespoon at a time. Whip until stiff, glossy peaks form.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов въздушен кето блат' AND recipe_role_id = 1),
    5,
    'Темпериране на сместа: Вземете 1/4 от белтъците и ги добавете към жълтъците. Разбъркайте смело – целта е да втечните жълтъците, за да не "счупят" останалия белтък по-късно.',
    'Темпериране на сместа: Вземете 1/4 от белтъците и ги добавете към жълтъците. Разбъркайте смело – целта е да втечните жълтъците, за да не "счупят" останалия белтък по-късно.',
    'Tempering the mixture: Take 1/4 of the egg whites and add them to the egg yolks. Stir boldly – the goal is to liquefy the yolks so they don''t "break" the remaining egg whites later.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов въздушен кето блат' AND recipe_role_id = 1),
    6,
    'Обединяване: Изсипете жълтъчната смес върху останалите белтъци. Добавете сухите съставки на три етапа през сито. Смесвайте с шпатула с движение "J" (загребване от дъното и обръщане), като завъртате купата. Спрете веднага щом не виждате сухи бучици!',
    'Обединяване: Изсипете жълтъчната смес върху останалите белтъци. Добавете сухите съставки на три етапа през сито. Смесвайте с шпатула с движение "J" (загребване от дъното и обръщане), като завъртате купата. Спрете веднага щом не виждате сухи бучици!',
    'Combining: Pour the yolk mixture over the remaining egg whites. Add the dry ingredients in three stages through a sieve. Mix with a spatula using a "J" motion (scooping from the bottom and folding), while rotating the bowl. Stop as soon as you no longer see dry lumps!'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов въздушен кето блат' AND recipe_role_id = 1),
    7,
    'Печене: Изсипете в ринг (18 см). Не мажете стените на ринга с мазнина! Пандишпанът трябва да се "катери" по стените. Печете 35–40 минути на 160°C.',
    'Печене: Изсипете в ринг (18 см). Не мажете стените на ринга с мазнина! Пандишпанът трябва да се "катери" по стените. Печете 35–40 минути на 160°C.',
    'Baking: Pour into a ring (18 cm). Do not grease the sides of the ring with fat! The sponge should "climb" the walls. Bake for 35–40 minutes at 160°C.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов пандишпан' AND recipe_role_id = 1),
    1,
    'Шоколадов пандишпан
Шоколадов кекс: Замяната на 30% от брашното с какао ще направи тестото много сухо, защото какаото абсорбира много повече течност от бадемовото брашно.

Шеф корекция: Ако добавяте какао, добавете и 30-50 мл бадемово мляко или течна сметана, за да балансирате влажността.',
    'Шоколадов пандишпан
Шоколадов кекс: Замяната на 30% от брашното с какао ще направи тестото много сухо, защото какаото абсорбира много повече течност от бадемовото брашно.

Шеф корекция: Ако добавяте какао, добавете и 30-50 мл бадемово мляко или течна сметана, за да балансирате влажността.',
    'Chocolate sponge cake'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Брауни пандишпан' AND recipe_role_id = 1),
    1,
    'Брауни пандишпан

Заменете 20% от бадемовото брашно с какао на прах и го добавете към тестото заедно с другите сухи съставки.

След като добавите сухите съставки, добавете към тестото 50 г разтопен, но не горещ шоколад над 85% масленост без захар или същото количество бял шоколад без захар.
Добавянето на разтопен шоколад е отлична идея. Увери се, че шоколадът е около 35-40°C. Ако е по-студен, ще се втвърди на парченца в тестото; ако е по-горещ, ще стопи маслото.',
    'Брауни пандишпан

Заменете 20% от бадемовото брашно с какао на прах и го добавете към тестото заедно с другите сухи съставки.

След като добавите сухите съставки, добавете към тестото 50 г разтопен, но не горещ шоколад над 85% масленост без захар или същото количество бял шоколад без захар.
Добавянето на разтопен шоколад е отлична идея. Увери се, че шоколадът е около 35-40°C. Ако е по-студен, ще се втвърди на парченца в тестото; ако е по-горещ, ще стопи маслото.',
    'Brownie sponge'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Цитрусов пандишпан' AND recipe_role_id = 1),
    1,
    'Цитрусов пандишпан

Добавете кора от портокал, лимон или лайм към сухите съставки. Количеството може да се коригира по ваш вкус.',
    'Цитрусов пандишпан

Добавете кора от портокал, лимон или лайм към сухите съставки. Количеството може да се коригира по ваш вкус.',
    'Citrus sponge cake'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Пандишпан с горски плодове' AND recipe_role_id = 1),
    1,
    'Пандишпан с горски плодове

При разбиването на белтъците добавете 50 г сок от горски плодове.

Оваляйте 80 г дребни горски плодове (череши, малини, боровинки, горски боровинки) в малко бадемово брашно, разделете тестото на няколко форми и добавете към пандишпана преди печене. В този случай не трябва да печете един висок блат: плодовете ще потънат под собствената си тежест и няма да позволят на тестото да се надигне добре. Ако използвате замразени плодове, първо трябва да ги размразите и да остав',
    'Пандишпан с горски плодове

При разбиването на белтъците добавете 50 г сок от горски плодове.

Оваляйте 80 г дребни горски плодове (череши, малини, боровинки, горски боровинки) в малко бадемово брашно, разделете тестото на няколко форми и добавете към пандишпана преди печене. В този случай не трябва да печете един висок блат: плодовете ще потънат под собствената си тежест и няма да позволят на тестото да се надигне добре. Ако използвате замразени плодове, първо трябва да ги размразите и да остав',
    'Sponge Cake with Berries'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Орехов пандишпан' AND recipe_role_id = 1),
    1,
    'Орехов пандишпан

Добавете 30 г ситно смлени ядки към сухите съставки.',
    'Орехов пандишпан

Добавете 30 г ситно смлени ядки към сухите съставки.',
    'Walnut sponge cake'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов кето кекс' AND recipe_role_id = 1),
    1,
    'Разбийте мекото масло с еритритола за 7-9 минути на висока скорост, докато стане светъл и пухкав крем.',
    'Разбийте мекото масло с еритритола за 7-9 минути на висока скорост, докато стане светъл и пухкав крем.',
    'Beat the softened butter with the erythritol for 7-9 minutes on high speed until it becomes a light and fluffy cream.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов кето кекс' AND recipe_role_id = 1),
    2,
    'Разбийте яйцата леко в отделен съд. Добавяйте ги към маслото лъжица по лъжица, като не спирате да разбивате. Ако сместа започне да се пресича, добавете 1 с.л. от бадемовото брашно.',
    'Разбийте яйцата леко в отделен съд. Добавяйте ги към маслото лъжица по лъжица, като не спирате да разбивате. Ако сместа започне да се пресича, добавете 1 с.л. от бадемовото брашно.',
    'Lightly beat the eggs in a separate bowl. Add them to the butter one spoonful at a time, while continuing to beat. If the mixture starts to curdle, add 1 tablespoon of almond flour.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов кето кекс' AND recipe_role_id = 1),
    3,
    'Смесете всички сухи съставки (бадемово, кокосово брашно, псилиум, бакпулвер и сол).',
    'Смесете всички сухи съставки (бадемово, кокосово брашно, псилиум, бакпулвер и сол).',
    'Mix all the dry ingredients (almond flour, coconut flour, psyllium, baking powder, and salt).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов кето кекс' AND recipe_role_id = 1),
    4,
    'Добавете сухите съставки към маслената смес. Разбъркайте на ниска скорост само докато се комбинират. Не прекалявайте с бъркането!',
    'Добавете сухите съставки към маслената смес. Разбъркайте на ниска скорост само докато се комбинират. Не прекалявайте с бъркането!',
    'Add the dry ingredients to the butter mixture. Stir on low speed just until combined. Do not overmix!'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов кето кекс' AND recipe_role_id = 1),
    5,
    'Важно: Оставете тестото да престои 10 минути, за да може псилиумът и кокосовото брашно да абсорбират влагата.',
    'Важно: Оставете тестото да престои 10 минути, за да може псилиумът и кокосовото брашно да абсорбират влагата.',
    'Important: Let the dough rest for 10 minutes so that the psyllium and coconut flour can absorb the moisture.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов кето кекс' AND recipe_role_id = 1),
    6,
    'Разпределете в две малки форми или една голяма. Печете на 170°C (с вентилатор) за около 35-45 минути.',
    'Разпределете в две малки форми или една голяма. Печете на 170°C (с вентилатор) за около 35-45 минути.',
    'Divide into two small molds or one large one. Bake at 170°C (with fan) for about 35-45 minutes.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов кето кекс' AND recipe_role_id = 1),
    7,
    'Кексовото тесто, подобно на пандишпановото може да бъде променяно, като му се придаде различен вкус. Ето няколко идеи:',
    'Кексовото тесто, подобно на пандишпановото може да бъде променяно, като му се придаде различен вкус. Ето няколко идеи:',
    'The cake batter, similar to sponge cake, can be altered to give it a different flavor. Here are a few ideas:'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов кекс' AND recipe_role_id = 1),
    1,
    'Шоколадов кекс

Заменете 30% от бадемовото брашно с какао на прах и го добавете към тестото заедно с другите брашна.',
    'Шоколадов кекс

Заменете 30% от бадемовото брашно с какао на прах и го добавете към тестото заедно с другите брашна.',
    'Chocolate Cake'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Брауни кекс' AND recipe_role_id = 1),
    1,
    'Брауни

След като добавите сухите съставки, добавете към тестото 50 г разтопен, но не горещ шоколад поне 85% какаова масленост и без захар, може да използвате и бял кето шоколад без захар.',
    'Брауни

След като добавите сухите съставки, добавете към тестото 50 г разтопен, но не горещ шоколад поне 85% какаова масленост и без захар, може да използвате и бял кето шоколад без захар.',
    'Brownies'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кекс с горски плодове' AND recipe_role_id = 1),
    1,
    'Кекс с горски плодове

Добавете 50 г замразени дребни горски плодове към тестото непосредствено преди печене.

Печете в две отделни форми.',
    'Кекс с горски плодове

Добавете 50 г замразени дребни горски плодове към тестото непосредствено преди печене.

Печете в две отделни форми.',
    'Berry Cake'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Цитрусов кекс' AND recipe_role_id = 1),
    1,
    'Цитрусов кекс

Добавете кора от лайм, лимон или портокал към тестото заедно с брашното. Количеството може да се коригира по ваш вкус.',
    'Цитрусов кекс

Добавете кора от лайм, лимон или портокал към тестото заедно с брашното. Количеството може да се коригира по ваш вкус.',
    'Citrus Cake'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Орехов кекс' AND recipe_role_id = 1),
    1,
    'Орехов кекс

Добавете 60-80 г ситно счукани ядки заедно с брашната',
    'Орехов кекс

Добавете 60-80 г ситно счукани ядки заедно с брашната',
    'Walnut cake'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1),
    1,
    'Подготовка: Загрейте фурната на 170°C (с вентилатор) или 175°C (без). Подгответе две форми (18 см) с хартия за печене.',
    'Подготовка: Загрейте фурната на 170°C (с вентилатор) или 175°C (без). Подгответе две форми (18 см) с хартия за печене.',
    'Preparation: Preheat the oven to 170°C (fan) or 175°C (without). Prepare two (18 cm) cake pans with parchment paper.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1),
    2,
    'Суха смес: В купа смесете кокосовото брашно, кокосовите стърготини и ксантановата гума. Разбъркайте добре, за да няма бучки от гумата.',
    'Суха смес: В купа смесете кокосовото брашно, кокосовите стърготини и ксантановата гума. Разбъркайте добре, за да няма бучки от гумата.',
    'Dry mixture: In a bowl, mix the coconut flour, shredded coconut, and xanthan gum. Stir well to avoid lumps of gum.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1),
    3,
    'Жълтъчна основа: Разбийте жълтъците с миксер заедно с охладеното течно кокосово масло и половината еритритол, докато сместа изсветлее и стане кремообразна.',
    'Жълтъчна основа: Разбийте жълтъците с миксер заедно с охладеното течно кокосово масло и половината еритритол, докато сместа изсветлее и стане кремообразна.',
    'Egg yolk base: Beat the egg yolks with a mixer together with the cooled liquid coconut oil and half of the erythritol until the mixture lightens and becomes creamy.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1),
    4,
    'Белтъчен обем: В чиста и суха купа разбийте белтъците със солта на ниска скорост до образуване на пяна. Добавете останалия еритритол и увеличете скоростта до получаване на устойчиви, твърди пикове.',
    'Белтъчен обем: В чиста и суха купа разбийте белтъците със солта на ниска скорост до образуване на пяна. Добавете останалия еритритол и увеличете скоростта до получаване на устойчиви, твърди пикове.',
    'Egg white volume: In a clean and dry bowl, beat the egg whites with the salt on low speed until foamy. Add the remaining erythritol and increase the speed until stiff, firm peaks form.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1),
    5,
    'Обединяване: Към жълтъчната смес добавете 1/3 от белтъците и разбъркайте внимателно с шпатула, за да олекотите текстурата. След това излейте тази смес при останалите белтъци.',
    'Обединяване: Към жълтъчната смес добавете 1/3 от белтъците и разбъркайте внимателно с шпатула, за да олекотите текстурата. След това излейте тази смес при останалите белтъци.',
    'Combining: Add 1/3 of the egg whites to the yolk mixture and gently fold with a spatula to lighten the texture. Then pour this mixture into the remaining egg whites.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1),
    6,
    'Финално смесване: Добавете сухите съставки на три части, като ги пресявате над сместа. Разбърквайте с шпатула с движение „загребване“ (отдолу-нагоре), докато всичко се обедини, без да губите обема на белтъците.',
    'Финално смесване: Добавете сухите съставки на три части, като ги пресявате над сместа. Разбърквайте с шпатула с движение „загребване“ (отдолу-нагоре), докато всичко се обедини, без да губите обема на белтъците.',
    'Final mixing: Add the dry ingredients in three parts, sifting them over the mixture. Fold with a spatula using a "scooping" motion (from bottom to top) until everything is combined, without losing the volume of the egg whites.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1),
    7,
    'Печене: Разпределете тестото равномерно. Печете 25–30 минути. Проверете с клечка – кокосовото брашно съхне бързо, не препичайте.',
    'Печене: Разпределете тестото равномерно. Печете 25–30 минути. Проверете с клечка – кокосовото брашно съхне бързо, не препичайте.',
    'Baking: Distribute the batter evenly. Bake for 25–30 minutes. Check with a toothpick – coconut flour dries quickly, do not overbake.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов блат' AND recipe_role_id = 1),
    8,
    'Стабилизация: Извадете и охладете напълно. Завийте във фолио и приберете в хладилник – това прави блата по-еластичен и лесен за рязане.',
    'Стабилизация: Извадете и охладете напълно. Завийте във фолио и приберете в хладилник – това прави блата по-еластичен и лесен за рязане.',
    'Stabilization: Remove and let cool completely. Wrap in foil and store in the refrigerator – this makes the cake layer more elastic and easier to cut.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов блат' AND recipe_role_id = 1),
    1,
    'Подготовка: Фурна на 175°C. Подгответе две форми по 18 см.',
    'Подготовка: Фурна на 175°C. Подгответе две форми по 18 см.',
    'Preparation: Oven at 175°C. Prepare two 18 cm pans.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов блат' AND recipe_role_id = 1),
    2,
    'Микс от брашна: Смесете бадемовото, кокосовото брашно, псилиума, ксантановата гума и бакпулвера. Разбъркайте с телена бъркалка, за да разбиете бучките.',
    'Микс от брашна: Смесете бадемовото, кокосовото брашно, псилиума, ксантановата гума и бакпулвера. Разбъркайте с телена бъркалка, за да разбиете бучките.',
    'Flour mix: Combine almond flour, coconut flour, psyllium, xanthan gum, and baking powder. Stir with a whisk to break up any lumps.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов блат' AND recipe_role_id = 1),
    3,
    'Емулсия: Разбийте жълтъците с охладеното масло, ванилията и 50 г от еритритола с миксер до пухкавост.',
    'Емулсия: Разбийте жълтъците с охладеното масло, ванилията и 50 г от еритритола с миксер до пухкавост.',
    'Emulsion: Beat the egg yolks with the melted butter, vanilla, and 50 g of erythritol with a mixer until fluffy.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов блат' AND recipe_role_id = 1),
    4,
    'Меринг: Разбийте белтъците със солта и останалите 50 г еритритол до "твърди пикове" (сместа не трябва да пада от обърната купа).',
    'Меринг: Разбийте белтъците със солта и останалите 50 г еритритол до "твърди пикове" (сместа не трябва да пада от обърната купа).',
    'Meringue: Whip the egg whites with salt and the remaining 50 g of erythritol until "stiff peaks" (the mixture should not fall from an inverted bowl).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов блат' AND recipe_role_id = 1),
    5,
    'Смесване: Смесете жълтъците с белтъците много внимателно с шпатула.',
    'Смесване: Смесете жълтъците с белтъците много внимателно с шпатула.',
    'Mixing: Carefully fold the egg yolks into the egg whites using a spatula.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов блат' AND recipe_role_id = 1),
    6,
    'Хидратация (Важно): Добавете сухите съставки и разбъркайте внимателно. Оставете тестото да "отпочине" 5 минути в купата. През това време псилиумът ще поеме влагата и ще стабилизира структурата.',
    'Хидратация (Важно): Добавете сухите съставки и разбъркайте внимателно. Оставете тестото да "отпочине" 5 минути в купата. През това време псилиумът ще поеме влагата и ще стабилизира структурата.',
    'Hydration (Important): Add the dry ingredients and mix gently. Let the batter "rest" for 5 minutes in the bowl. During this time, the psyllium will absorb moisture and stabilize the structure.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов блат' AND recipe_role_id = 1),
    7,
    'Печене: Разпределете в двете форми. Печете около 30-35 минути. Не отваряйте фурната първите 25 минути!',
    'Печене: Разпределете в двете форми. Печете около 30-35 минути. Не отваряйте фурната първите 25 минути!',
    'Baking: Distribute into the two pans. Bake for about 30-35 minutes. Do not open the oven for the first 25 minutes!'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов блат' AND recipe_role_id = 1),
    8,
    'Шеф Техника: След като клечката излезе суха, изключете фурната и оставете блатовете вътре на открехната врата за 5 минути. Това предотвратява "шоковото" свиване на блата.',
    'Шеф Техника: След като клечката излезе суха, изключете фурната и оставете блатовете вътре на открехната врата за 5 минути. Това предотвратява "шоковото" свиване на блата.',
    'Chef Technique: Once the toothpick comes out dry, turn off the oven and leave the cakes inside with the door ajar for 5 minutes. This prevents "shock" shrinking of the cake.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов блат' AND recipe_role_id = 1),
    9,
    'Охлаждане: След като изстинат на стайна температура, задължително ги приберете в хладилник за 2 часа (увити във фолио), преди да сглобявате тортата.',
    'Охлаждане: След като изстинат на стайна температура, задължително ги приберете в хладилник за 2 часа (увити във фолио), преди да сглобявате тортата.',
    'Cooling: After cooling to room temperature, be sure to refrigerate them for 2 hours (wrapped in foil) before assembling the cake.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1),
    1,
    'Фурна: Загрейте на 165°C (с вентилатор). Подгответе две форми от 18 см.',
    'Фурна: Загрейте на 165°C (с вентилатор). Подгответе две форми от 18 см.',
    'Oven: Preheat to 165°C (fan). Prepare two 18 cm pans.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1),
    2,
    'Сухи съставки: Смесете бадемовото, кокосовото брашно, псилиума, ксантановата гума и бакпулвера. Пресейте ги.',
    'Сухи съставки: Смесете бадемовото, кокосовото брашно, псилиума, ксантановата гума и бакпулвера. Пресейте ги.',
    'Dry ingredients: Mix the almond flour, coconut flour, psyllium, xanthan gum, and baking powder. Sift them.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1),
    3,
    'Жълтъчна база: Разбийте жълтъците с половината еритритол, лимоновия сок, лимоновата кора и разтопената мазнина. Разбивайте с миксер (не блендер), докато сместа стане светла и леко се сгъсти.',
    'Жълтъчна база: Разбийте жълтъците с половината еритритол, лимоновия сок, лимоновата кора и разтопената мазнина. Разбивайте с миксер (не блендер), докато сместа стане светла и леко се сгъсти.',
    'Egg yolk base: Beat the egg yolks with half of the erythritol, lemon juice, lemon zest, and melted fat. Whip with a mixer (not a blender) until the mixture becomes light and slightly thickens.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1),
    4,
    'Меринг: Разбийте белтъците със солта до меки пикове, добавете останалия еритритол и разбийте до твърд, лъскав сняг.',
    'Меринг: Разбийте белтъците със солта до меки пикове, добавете останалия еритритол и разбийте до твърд, лъскав сняг.',
    'Meringue: Whip the egg whites with the salt until soft peaks form, add the remaining erythritol, and whip to stiff, glossy peaks.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1),
    5,
    'Внимателно смесване: Добавете жълтъчната смес към белтъците. След това пресейте сухите съставки отгоре. Бъркайте с шпатула "отдолу-нагоре" изключително нежно. Лимоновата киселина прави белтъците малко по-нестабилни, затова работете бързо, но внимателно.',
    'Внимателно смесване: Добавете жълтъчната смес към белтъците. След това пресейте сухите съставки отгоре. Бъркайте с шпатула "отдолу-нагоре" изключително нежно. Лимоновата киселина прави белтъците малко по-нестабилни, затова работете бързо, но внимателно.',
    'Gentle mixing: Add the egg yolk mixture to the egg whites. Then sift the dry ingredients on top. Fold gently with a spatula "from bottom to top." The citric acid makes the egg whites a bit more unstable, so work quickly but carefully.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1),
    6,
    'Печене: Разпределете сместа. Печете 30–35 минути. Проверете с клечка.',
    'Печене: Разпределете сместа. Печете 30–35 минути. Проверете с клечка.',
    'Baking: Distribute the mixture. Bake for 30–35 minutes. Check with a toothpick.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов блат' AND recipe_role_id = 1),
    7,
    'Охлаждане: Оставете за 5-10 минути в изключена фурна на открехната врата. Извадете, охладете и задължително завийте във фолио преди хладилника, за да запазите лимоновия аромат.',
    'Охлаждане: Оставете за 5-10 минути в изключена фурна на открехната врата. Извадете, охладете и задължително завийте във фолио преди хладилника, за да запазите лимоновия аромат.',
    'Cooling: Leave for 5-10 minutes in the turned-off oven with the door ajar. Remove, cool, and be sure to wrap in foil before refrigerating to preserve the lemon aroma.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Морковен блат' AND recipe_role_id = 1),
    1,
    'Подготовка: Фурна на 165°C (с вентилатор). По-ниската температура е критична тук, за да може центърът да изсъхне, без краищата да изгорят.',
    'Подготовка: Фурна на 165°C (с вентилатор). По-ниската температура е критична тук, за да може центърът да изсъхне, без краищата да изгорят.',
    'Preparation: Oven at 165°C (with fan). The lower temperature is critical here to allow the center to dry out without the edges burning.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Морковен блат' AND recipe_role_id = 1),
    2,
    'Сух микс: Смесете бадемовото, кокосовото брашно, подправките, ксантановата гума и бакпулвера.',
    'Сух микс: Смесете бадемовото, кокосовото брашно, подправките, ксантановата гума и бакпулвера.',
    'Dry mix: Combine almond flour, coconut flour, spices, xanthan gum, and baking powder.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Морковен блат' AND recipe_role_id = 1),
    3,
    'Жълтъци: Разбийте жълтъците с маслото и половината еритритол до светъл крем. (Използвайте миксер, пасаторът ще втечни жълтъците прекалено много).',
    'Жълтъци: Разбийте жълтъците с маслото и половината еритритол до светъл крем. (Използвайте миксер, пасаторът ще втечни жълтъците прекалено много).',
    'Egg yolks: Whisk the egg yolks with the butter and half of the erythritol until light and creamy. (Use a mixer; a blender will liquefy the yolks too much).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Морковен блат' AND recipe_role_id = 1),
    4,
    'Белтъци: Разбийте белтъците със солта и останалия еритритол до устойчив сняг (твърди пикове).',
    'Белтъци: Разбийте белтъците със солта и останалия еритритол до устойчив сняг (твърди пикове).',
    'Egg whites: Whisk the egg whites with the salt and the remaining erythritol until stiff peaks form.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Морковен блат' AND recipe_role_id = 1),
    5,
    'Смесване (Folding): Към жълтъците добавете 1/3 от белтъците, за да отпуснете сместа. След това добавете сухите съставки през сито.',
    'Смесване (Folding): Към жълтъците добавете 1/3 от белтъците, за да отпуснете сместа. След това добавете сухите съставки през сито.',
    'Mixing (Folding): Add 1/3 of the egg whites to the yolks to loosen the mixture. Then add the dry ingredients through a sieve.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Морковен блат' AND recipe_role_id = 1),
    6,
    'Моркови и Ядки: Накрая добавете настърганите моркови и нарязаните ядки. Разбъркайте много внимателно с шпатула. Те ще се разпределят равномерно, без да смачкат въздуха в тестото.',
    'Моркови и Ядки: Накрая добавете настърганите моркови и нарязаните ядки. Разбъркайте много внимателно с шпатула. Те ще се разпределят равномерно, без да смачкат въздуха в тестото.',
    'Carrots and Nuts: Finally, add the grated carrots and chopped nuts. Gently fold in with a spatula. They will distribute evenly without crushing the air in the batter.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Морковен блат' AND recipe_role_id = 1),
    7,
    'Печене: Разпределете в две форми по 18 см. Печете 35–45 минути. Проверете с дървено шишче – то трябва да излезе напълно сухо.',
    'Печене: Разпределете в две форми по 18 см. Печете 35–45 минути. Проверете с дървено шишче – то трябва да излезе напълно сухо.',
    'Baking: Divide into two 18 cm pans. Bake for 35–45 minutes. Check with a wooden skewer – it should come out completely dry.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Морковен блат' AND recipe_role_id = 1),
    8,
    'Стабилизация: Оставете 10 минути в изключена фурна. След като изстинат, завийте във фолио. Този блат е най-вкусен след 12 часа в хладилника, когато подправките се "отпуснат".',
    'Стабилизация: Оставете 10 минути в изключена фурна. След като изстинат, завийте във фолио. Този блат е най-вкусен след 12 часа в хладилника, когато подправките се "отпуснат".',
    'Stabilization: Leave for 10 minutes in the turned-off oven. Once cooled, wrap in foil. This layer is most delicious after 12 hours in the refrigerator when the spices have "settled."'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Маслен морковен блат' AND recipe_role_id = 1),
    1,
    'Фурна: Загрейте на 165°C. Подгответе формите (18 см) с хартия.',
    'Фурна: Загрейте на 165°C. Подгответе формите (18 см) с хартия.',
    'Oven: Preheat to 165°C. Prepare the pans (18 cm) with parchment paper.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Маслен морковен блат' AND recipe_role_id = 1),
    2,
    'Маслена база: Разбийте мекото масло с еритритола, докато стане на бял крем (около 5 мин). Добавете яйцата едно по едно, като разбивате след всяко.',
    'Маслена база: Разбийте мекото масло с еритритола, докато стане на бял крем (около 5 мин). Добавете яйцата едно по едно, като разбивате след всяко.',
    'Butter base: Beat the soft butter with the erythritol until it becomes a white cream (about 5 minutes). Add the eggs one by one, mixing after each.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Маслен морковен блат' AND recipe_role_id = 1),
    3,
    'Сухи съставки: Смесете бадемовото брашно, кокосовото брашно (нашият таен агент срещу влагата), подправките, бакпулвера, солта и ксантановата гума.',
    'Сухи съставки: Смесете бадемовото брашно, кокосовото брашно (нашият таен агент срещу влагата), подправките, бакпулвера, солта и ксантановата гума.',
    'Dry ingredients: Combine the almond flour, coconut flour (our secret agent against moisture), spices, baking powder, salt, and xanthan gum.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Маслен морковен блат' AND recipe_role_id = 1),
    4,
    'Смесване: Добавете сухите съставки към маслената смес. Ще получите гъсто тесто.',
    'Смесване: Добавете сухите съставки към маслената смес. Ще получите гъсто тесто.',
    'Mixing: Add the dry ingredients to the butter mixture. You will get a thick dough.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Маслен морковен блат' AND recipe_role_id = 1),
    5,
    'Финал: Добавете изстисканите моркови и ядките. Разбъркайте с шпатула.',
    'Финал: Добавете изстисканите моркови и ядките. Разбъркайте с шпатула.',
    'Final: Add the squeezed carrots and nuts. Stir with a spatula.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Маслен морковен блат' AND recipe_role_id = 1),
    6,
    'Печене: Разпределете в двете форми. Печете 40–50 минути. Поради голямото количество моркови и масло, печенето е по-дълго. Проверете с шишче – трябва да излезе чисто.',
    'Печене: Разпределете в двете форми. Печете 40–50 минути. Поради голямото количество моркови и масло, печенето е по-дълго. Проверете с шишче – трябва да излезе чисто.',
    'Baking: Distribute into the two pans. Bake for 40–50 minutes. Due to the large amount of carrots and butter, the baking time is longer. Check with a skewer – it should come out clean.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Маслен морковен блат' AND recipe_role_id = 1),
    7,
    'Важно охлаждане: Тези блатове са много меки, докато са топли. Оставете ги да изстинат напълно във формата, преди да ги вадите. След това хладилник (увити във фолио) за поне 4-6 часа.',
    'Важно охлаждане: Тези блатове са много меки, докато са топли. Оставете ги да изстинат напълно във формата, преди да ги вадите. След това хладилник (увити във фолио) за поне 4-6 часа.',
    'Important cooling: These layers are very soft while warm. Let them cool completely in the pan before removing. Then refrigerate (wrapped in foil) for at least 4-6 hours.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов блат Rich' AND recipe_role_id = 1),
    1,
    'Подготовка: Фурна на 165°C (с вентилатор). Форма 18 см с хартия на дъното.',
    'Подготовка: Фурна на 165°C (с вентилатор). Форма 18 см с хартия на дъното.',
    'Preparation: Oven at 165°C (fan). 18 cm pan with parchment paper on the bottom.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов блат Rich' AND recipe_role_id = 1),
    2,
    'Крем-метод: Разбийте мекото масло с еритритола за поне 5 минути, докато стане светъл и много пухкав крем.',
    'Крем-метод: Разбийте мекото масло с еритритола за поне 5 минути, докато стане светъл и много пухкав крем.',
    'Cream method: Beat the softened butter with the erythritol for at least 5 minutes until it becomes a light and very fluffy cream.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов блат Rich' AND recipe_role_id = 1),
    3,
    'Емулсия: Добавяйте яйцата едно по едно. След всяко яйце разбивайте добре, докато се поеме напълно, преди да добавите следващото.',
    'Емулсия: Добавяйте яйцата едно по едно. След всяко яйце разбивайте добре, докато се поеме напълно, преди да добавите следващото.',
    'Emulsion: Add the eggs one by one. After each egg, mix well until fully incorporated before adding the next one.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов блат Rich' AND recipe_role_id = 1),
    4,
    'Течности: Добавете сметаната и горещото кафе/вода. Разбъркайте за кратко. (Горещата течност помага на какаото да освободи аромата си).',
    'Течности: Добавете сметаната и горещото кафе/вода. Разбъркайте за кратко. (Горещата течност помага на какаото да освободи аромата си).',
    'Liquids: Add the cream and hot coffee/water. Stir briefly. (The hot liquid helps the cocoa release its flavor).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов блат Rich' AND recipe_role_id = 1),
    5,
    'Сухи съставки: Смесете бадемовото брашно, какаото, бакпулвера и солта. Пресейте ги над маслената смес.',
    'Сухи съставки: Смесете бадемовото брашно, какаото, бакпулвера и солта. Пресейте ги над маслената смес.',
    'Dry ingredients: Mix the almond flour, cocoa, baking powder, and salt. Sift them over the butter mixture.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов блат Rich' AND recipe_role_id = 1),
    6,
    'Финално смесване: Разбъркайте с миксера на най-ниска скорост само докато сухите съставки се поемат. Не прекалявайте с бъркането!',
    'Финално смесване: Разбъркайте с миксера на най-ниска скорост само докато сухите съставки се поемат. Не прекалявайте с бъркането!',
    'Final mixing: Stir with the mixer on the lowest speed just until the dry ingredients are absorbed. Do not overmix!'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов блат Rich' AND recipe_role_id = 1),
    7,
    'Печене: Печете 40–50 минути. Тъй като блатът е богат на мазнини, той се пече малко по-бавно в центъра.',
    'Печене: Печете 40–50 минути. Тъй като блатът е богат на мазнини, той се пече малко по-бавно в центъра.',
    'Baking: Bake for 40–50 minutes. Since the batter is high in fat, it bakes a little slower in the center.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов блат Rich' AND recipe_role_id = 1),
    8,
    'Охлаждане: Оставете го да изстине напълно във формата. Този блат е много крехък, докато е топъл, заради маслото.',
    'Охлаждане: Оставете го да изстине напълно във формата. Този блат е много крехък, докато е топъл, заради маслото.',
    'Cooling: Allow it to cool completely in the pan. This cake is very fragile while warm due to the butter.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бадемов блат Swedish Style' AND recipe_role_id = 1),
    1,
    'Фурна: Загрейте на 160°C (с вентилатор). Подгответе формите или хартията по твоя отличен метод с очертаването.',
    'Фурна: Загрейте на 160°C (с вентилатор). Подгответе формите или хартията по твоя отличен метод с очертаването.',
    'Oven: Preheat to 160°C (fan). Prepare the pans or parchment paper using your excellent outlining method.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бадемов блат Swedish Style' AND recipe_role_id = 1),
    2,
    'Белтъчен сняг: Разбийте белтъците със солта и лимоновия сок до меки върхове. Започнете да добавяте еритритола пудра лъжица по лъжица, докато получите твърди и лъскави върхове (като за целувки).',
    'Белтъчен сняг: Разбийте белтъците със солта и лимоновия сок до меки върхове. Започнете да добавяте еритритола пудра лъжица по лъжица, докато получите твърди и лъскави върхове (като за целувки).',
    'Egg white foam: Whip the egg whites with salt and lemon juice until soft peaks form. Start adding the erythritol powder tablespoon by tablespoon until you achieve stiff and glossy peaks (like for meringues).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бадемов блат Swedish Style' AND recipe_role_id = 1),
    3,
    'Суха смес: Смесете бадемовото брашно с ксантановата гума в отделен съд и ги разбъркайте добре.',
    'Суха смес: Смесете бадемовото брашно с ксантановата гума в отделен съд и ги разбъркайте добре.',
    'Dry mixture: Combine the almond flour with xanthan gum in a separate bowl and mix them well.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бадемов блат Swedish Style' AND recipe_role_id = 1),
    4,
    'Внимателно обединяване (Folding): Добавете бадемовото брашно към белтъците на 3 порции. Важно: Не използвайте миксер! Смесвайте с шпатула, като загребвате от дъното нагоре. Спрете веднага щом брашното се поеме – не прекалявайте, за да не втечните сместа.',
    'Внимателно обединяване (Folding): Добавете бадемовото брашно към белтъците на 3 порции. Важно: Не използвайте миксер! Смесвайте с шпатула, като загребвате от дъното нагоре. Спрете веднага щом брашното се поеме – не прекалявайте, за да не втечните сместа.',
    'Gentle folding: Add the almond flour to the egg whites in 3 portions. Important: Do not use a mixer! Mix with a spatula, scooping from the bottom up. Stop as soon as the flour is incorporated – do not overmix to avoid thinning the mixture.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бадемов блат Swedish Style' AND recipe_role_id = 1),
    5,
    'Печене: Разпределете в двете форми (18 см). Загладете повърхността. Печете 20–25 минути. Блатовете трябва да са златисти и пружиниращи при допир.',
    'Печене: Разпределете в двете форми (18 см). Загладете повърхността. Печете 20–25 минути. Блатовете трябва да са златисти и пружиниращи при допир.',
    'Baking: Distribute into the two pans (18 cm). Smooth the surface. Bake for 20–25 minutes. The layers should be golden and spring back when touched.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бадемов блат Swedish Style' AND recipe_role_id = 1),
    6,
    'Охлаждане: Извадете от формите след 5 минути. Внимавайте – тези блатове са много нежни, докато са топли. Оставете ги да изстинат напълно на решетка.',
    'Охлаждане: Извадете от формите след 5 минути. Внимавайте – тези блатове са много нежни, докато са топли. Оставете ги да изстинат напълно на решетка.',
    'Cooling: Remove from the pans after 5 minutes. Be careful – these layers are very delicate while warm. Allow them to cool completely on a rack.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Гараш' AND recipe_role_id = 1),
    1,
    'Фурна: Загрейте на 160°C (с вентилатор). Твоят метод с очертаването на хартията е задължителен тук, защото блатовете са много тънки и се чупят лесно при вадене от дълбока форма.',
    'Фурна: Загрейте на 160°C (с вентилатор). Твоят метод с очертаването на хартията е задължителен тук, защото блатовете са много тънки и се чупят лесно при вадене от дълбока форма.',
    'Oven: Preheat to 160°C (with fan). Your method of outlining the paper is essential here because the layers are very thin and break easily when removed from a deep pan.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Гараш' AND recipe_role_id = 1),
    2,
    'Меринг: Разбийте белтъците със солта и лимона до меки пикове. Добавете еритритола, смесен с ксантановата гума, и разбийте до твърд, лъскав сняг.',
    'Меринг: Разбийте белтъците със солта и лимона до меки пикове. Добавете еритритола, смесен с ксантановата гума, и разбийте до твърд, лъскав сняг.',
    'Meringue: Whip the egg whites with the salt and lemon until soft peaks form. Add the erythritol mixed with xanthan gum, and whip until stiff, glossy peaks form.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Гараш' AND recipe_role_id = 1),
    3,
    'Орехите: Изсипете смлените орехи върху белтъците. Използвайте голяма шпатула и разбъркайте много нежно, като режете сместа през средата и обръщате отдолу-нагоре. Целта е да запазите колкото се може повече въздух.',
    'Орехите: Изсипете смлените орехи върху белтъците. Използвайте голяма шпатула и разбъркайте много нежно, като режете сместа през средата и обръщате отдолу-нагоре. Целта е да запазите колкото се може повече въздух.',
    'Walnuts: Pour the ground walnuts over the egg whites. Use a large spatula and gently fold, cutting through the mixture from the middle and turning it over from bottom to top. The goal is to retain as much air as possible.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Гараш' AND recipe_role_id = 1),
    4,
    'Разпределяне: Разпределете сместа на 5 тънки блата (традиционно Гараш е с 5 слоя) или на 2-3 по-дебели за по-лесно сглобяване в твоя 18 см ринг.',
    'Разпределяне: Разпределете сместа на 5 тънки блата (традиционно Гараш е с 5 слоя) или на 2-3 по-дебели за по-лесно сглобяване в твоя 18 см ринг.',
    'Distribution: Spread the mixture into 5 thin layers (traditionally, Garash has 5 layers) or into 2-3 thicker ones for easier assembly in your 18 cm ring.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Гараш' AND recipe_role_id = 1),
    5,
    'Печене: Печете 10–12 минути на 160°C. Внимавайте – щом краищата станат златисти, са готови.',
    'Печене: Печете 10–12 минути на 160°C. Внимавайте – щом краищата станат златисти, са готови.',
    'Baking: Bake for 10–12 minutes at 160°C. Be careful – as soon as the edges turn golden, they are ready.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Гараш' AND recipe_role_id = 1),
    6,
    'Стабилизация: Оставете ги да изстинат напълно върху хартията, преди да се опитвате да ги отлепите.',
    'Стабилизация: Оставете ги да изстинат напълно върху хартията, преди да се опитвате да ги отлепите.',
    'Stabilization: Allow them to cool completely on the paper before attempting to peel them off.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Брауни блат без брашно' AND recipe_role_id = 1),
    1,
    'Подготовка: Загрейте фурната на 155°C (без вентилатор). Покрийте дъното и страните на формата (18 см) с хартия за печене.',
    'Подготовка: Загрейте фурната на 155°C (без вентилатор). Покрийте дъното и страните на формата (18 см) с хартия за печене.',
    'Preparation: Preheat the oven to 155°C (without fan). Line the bottom and sides of the pan (18 cm) with parchment paper.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Брауни блат без брашно' AND recipe_role_id = 1),
    2,
    'Шоколадова база: Разтопете маслото и шоколада на водна баня или в микровълнова на кратки импулси. Разбъркайте до гладкост и оставете да се охлади до стайна температура.',
    'Шоколадова база: Разтопете маслото и шоколада на водна баня или в микровълнова на кратки импулси. Разбъркайте до гладкост и оставете да се охлади до стайна температура.',
    'Chocolate base: Melt the butter and chocolate in a water bath or in the microwave in short bursts. Stir until smooth and let cool to room temperature.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Брауни блат без брашно' AND recipe_role_id = 1),
    3,
    'Жълтъци: Добавете жълтъците един по едно към хладния шоколад, като бъркате с телена бъркалка след всяко. Добавете ванилията.',
    'Жълтъци: Добавете жълтъците един по едно към хладния шоколад, като бъркате с телена бъркалка след всяко. Добавете ванилията.',
    'Egg yolks: Add the egg yolks one by one to the cooled chocolate, stirring with a whisk after each addition. Add the vanilla.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Брауни блат без брашно' AND recipe_role_id = 1),
    4,
    'Меринг: Разбийте белтъците със солта до мека пяна. Започнете да добавяте еритритола пудра и разбийте до меки върхове (soft peaks). Не ги превръщайте в сух сняг, защото ще е трудно да ги вкарате в тежкия шоколад, без да ги „счупите“.',
    'Меринг: Разбийте белтъците със солта до мека пяна. Започнете да добавяте еритритола пудра и разбийте до меки върхове (soft peaks). Не ги превръщайте в сух сняг, защото ще е трудно да ги вкарате в тежкия шоколад, без да ги „счупите“.',
    'Meringue: Whip the egg whites with the salt until soft peaks form. Start adding the powdered erythritol and whip until soft peaks form. Do not turn them into dry snow, as it will be difficult to incorporate them into the heavy chocolate without "breaking" them.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Брауни блат без брашно' AND recipe_role_id = 1),
    5,
    'Обединяване (Folding): Вземете една голяма лъжица от белтъците и я разбъркайте енергично в шоколада. Това се нарича „жертвена доза“ – тя олекотява шоколада. След това добавете останалите белтъци много нежно с шпатула.',
    'Обединяване (Folding): Вземете една голяма лъжица от белтъците и я разбъркайте енергично в шоколада. Това се нарича „жертвена доза“ – тя олекотява шоколада. След това добавете останалите белтъци много нежно с шпатула.',
    'Combining (Folding): Take a large spoonful of the egg whites and stir it vigorously into the chocolate. This is called a "sacrificial dose" – it lightens the chocolate. Then gently add the remaining egg whites with a spatula.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Брауни блат без брашно' AND recipe_role_id = 1),
    6,
    'Печене: Изсипете във формата. Печете 35–40 минути. Блатът ще се надуе много и ще се напука леко – това е знак, че е готов.',
    'Печене: Изсипете във формата. Печете 35–40 минути. Блатът ще се надуе много и ще се напука леко – това е знак, че е готов.',
    'Baking: Pour into the pan. Bake for 35–40 minutes. The cake will puff up significantly and crack slightly – this is a sign that it is ready.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Брауни блат без брашно' AND recipe_role_id = 1),
    7,
    'Охлаждане: Изключете фурната и оставете блата вътре на открехната врата за 15 минути. Той ще спадне в центъра – не се плашете, това е търсеният ефект за брауни блат!',
    'Охлаждане: Изключете фурната и оставете блата вътре на открехната врата за 15 минути. Той ще спадне в центъра – не се плашете, това е търсеният ефект за брауни блат!',
    'Cooling: Turn off the oven and leave the cake inside with the door ajar for 15 minutes. It will sink in the center – do not be alarmed, this is the desired effect for brownie cake!'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Брауни блат без брашно' AND recipe_role_id = 1),
    8,
    'Рязане: Този блат е изключително нежен. Задължително го приберете в хладилник за 4-6 часа, преди да се опитвате да го режете на две. Използвайте топъл нож (потопен в гореща вода и подсушен).',
    'Рязане: Този блат е изключително нежен. Задължително го приберете в хладилник за 4-6 часа, преди да се опитвате да го режете на две. Използвайте топъл нож (потопен в гореща вода и подсушен).',
    'Cutting: This cake is extremely delicate. Be sure to refrigerate it for 4-6 hours before attempting to cut it in half. Use a warm knife (dipped in hot water and dried).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Сахер' AND recipe_role_id = 1),
    1,
    'Фурна: Загрейте на 165°C. Подгответе форма 18 см.',
    'Фурна: Загрейте на 165°C. Подгответе форма 18 см.',
    'Oven: Preheat to 165°C. Prepare an 18 cm pan.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Сахер' AND recipe_role_id = 1),
    2,
    'Шоколадов ганаш: Кипнете млякото с еритритола, солта и маслото. Залейте нарязания шоколад и бъркайте до лъскава смес. Оставете да се охлади леко.',
    'Шоколадов ганаш: Кипнете млякото с еритритола, солта и маслото. Залейте нарязания шоколад и бъркайте до лъскава смес. Оставете да се охлади леко.',
    'Chocolate ganache: Bring the milk to a boil with the erythritol, salt, and butter. Pour over the chopped chocolate and stir until a glossy mixture forms. Let it cool slightly.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Сахер' AND recipe_role_id = 1),
    3,
    'Жълтъци: Разбийте жълтъците и ги смесете с шоколадовата база. Добавете лимоновия сок тук.',
    'Жълтъци: Разбийте жълтъците и ги смесете с шоколадовата база. Добавете лимоновия сок тук.',
    'Egg yolks: Whisk the egg yolks and mix them with the chocolate base. Add the lemon juice here.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Сахер' AND recipe_role_id = 1),
    4,
    'Сухи съставки: Пресейте кокосовото брашно, какаото и содата над шоколадовата смес. Разбъркайте добре. Сместа ще стане доста гъста – това е нормално за кокосовото брашно.',
    'Сухи съставки: Пресейте кокосовото брашно, какаото и содата над шоколадовата смес. Разбъркайте добре. Сместа ще стане доста гъста – това е нормално за кокосовото брашно.',
    'Dry ingredients: Sift the coconut flour, cocoa powder, and baking soda over the chocolate mixture. Mix well. The mixture will become quite thick – this is normal for coconut flour.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Сахер' AND recipe_role_id = 1),
    5,
    'Белтъци: Разбийте белтъците на твърд сняг.',
    'Белтъци: Разбийте белтъците на твърд сняг.',
    'Egg whites: Whip the egg whites to stiff peaks.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Сахер' AND recipe_role_id = 1),
    6,
    'Обединяване: Вкарайте 1/3 от белтъците в гъстата шоколадова маса, за да я отпуснете (тук може да ползвате миксер на ниска скорост). Останалите 2/3 вкарайте внимателно с шпатула.',
    'Обединяване: Вкарайте 1/3 от белтъците в гъстата шоколадова маса, за да я отпуснете (тук може да ползвате миксер на ниска скорост). Останалите 2/3 вкарайте внимателно с шпатула.',
    'Combining: Fold in 1/3 of the egg whites into the thick chocolate mixture to loosen it (you can use a mixer on low speed here). Carefully fold in the remaining 2/3 with a spatula.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Сахер' AND recipe_role_id = 1),
    7,
    'Печене: Печете 35–40 минути. Проверете с клечка – трябва да излезе почти суха (със съвсем малко влажни трохи, за да остане сочен).',
    'Печене: Печете 35–40 минути. Проверете с клечка – трябва да излезе почти суха (със съвсем малко влажни трохи, за да остане сочен).',
    'Baking: Bake for 35–40 minutes. Check with a toothpick – it should come out almost dry (with just a few moist crumbs to keep it moist).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Блат Сахер' AND recipe_role_id = 1),
    8,
    'Охлаждане: Този блат трябва да престои в хладилник. Кокосовото брашно се стабилизира едва след пълно охлаждане.',
    'Охлаждане: Този блат трябва да престои в хладилник. Кокосовото брашно се стабилизира едва след пълно охлаждане.',
    'Cooling: This layer should sit in the refrigerator. Coconut flour stabilizes only after complete cooling.'
  )
;

-- Total: 99 steps