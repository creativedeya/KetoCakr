-- ============================================================
-- File: 22_INSERT_FILLING_STEPS_BILINGUAL.sql
-- Project: KetoCakR | Date: 2026-04-06
-- Description: Bilingual instruction steps for 23 fillings
-- ============================================================

INSERT INTO recipe_instruction_steps (
  recipe_id, step_number,
  step_description, step_description_bg, step_description_en
)
VALUES
  (
    (SELECT id FROM base_recipes WHERE name = 'Кули' AND recipe_role_id = 3),
    1,
    'Желатин: Залей желатина със студената вода, разбъркай и остави за 10–15 минути.',
    'Желатин: Залей желатина със студената вода, разбъркай и остави за 10–15 минути.',
    'Gelatin: Pour the gelatin over the cold water, stir, and let it sit for 10–15 minutes.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кули' AND recipe_role_id = 3),
    2,
    'Пюре: Сложи плодовото пюре, еритритола и лимоновия сок в касерола. Загрей на среден огън, докато заври. Махни веднага от котлона.',
    'Пюре: Сложи плодовото пюре, еритритола и лимоновия сок в касерола. Загрей на среден огън, докато заври. Махни веднага от котлона.',
    'Puree: Place the fruit puree, erythritol, and lemon juice in a saucepan. Heat over medium heat until it boils. Remove immediately from the heat.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кули' AND recipe_role_id = 3),
    3,
    'Обединяване: Добави набъбналия желатин към горещото (но не врящо) пюре. Бъркай, докато желатинът се разтвори напълно.',
    'Обединяване: Добави набъбналия желатин към горещото (но не врящо) пюре. Бъркай, докато желатинът се разтвори напълно.',
    'Combining: Add the bloomed gelatin to the hot (but not boiling) puree. Stir until the gelatin is completely dissolved.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кули' AND recipe_role_id = 3),
    4,
    'Разливане: Раздели сместа по равно в две форми с диаметър 14 или 16 см, покрити със стреч фолио на дъното.',
    'Разливане: Раздели сместа по равно в две форми с диаметър 14 или 16 см, покрити със стреч фолио на дъното.',
    'Pouring: Divide the mixture evenly into two molds with a diameter of 14 or 16 cm, lined with cling film at the bottom.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кули' AND recipe_role_id = 3),
    5,
    'Защо 16 см? За да имаш 1 см борд от крем около плода, което гарантира, че тортата няма да се "хлъзне".',
    'Защо 16 см? За да имаш 1 см борд от крем около плода, което гарантира, че тортата няма да се "хлъзне".',
    'Why 16 cm? To have a 1 cm border of cream around the fruit, which ensures that the cake will not "slip."'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кули' AND recipe_role_id = 3),
    6,
    'Замразяване: Остави да се охлади до стайна температура и прибери във фризера за поне 2 часа.',
    'Замразяване: Остави да се охлади до стайна температура и прибери във фризера за поне 2 часа.',
    'Freezing: Allow to cool to room temperature and place in the freezer for at least 2 hours.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кули' AND recipe_role_id = 3),
    7,
    'Важно: Плодовите слоеве се сглобяват в тортата замразени. Така са твърди, лесни за центриране и не размиват крема.',
    'Важно: Плодовите слоеве се сглобяват в тортата замразени. Така са твърди, лесни за центриране и не размиват крема.',
    'Important: The fruit layers are assembled in the cake while frozen. This makes them firm, easy to center, and does not dilute the cream.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Конфи' AND recipe_role_id = 3),
    1,
    'Смесване: Смесете много добре пектина с еритритола в малка купичка.',
    'Смесване: Смесете много добре пектина с еритритола в малка купичка.',
    'Mixing: Mix the pectin very well with the erythritol in a small bowl.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Конфи' AND recipe_role_id = 3),
    2,
    'Загряване: Загрейте плодовото пюре в касерола до около 40–45°C (топло на пипане, но не врящо).',
    'Загряване: Загрейте плодовото пюре в касерола до около 40–45°C (топло на пипане, но не врящо).',
    'Heating: Heat the fruit puree in a saucepan to about 40–45°C (warm to the touch, but not boiling).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Конфи' AND recipe_role_id = 3),
    3,
    'Добавяне: Изсипете еритритола с пектина на "дъжд" върху пюрето, като бъркате непрекъснато с бъркалка.',
    'Добавяне: Изсипете еритритола с пектина на "дъжд" върху пюрето, като бъркате непрекъснато с бъркалка.',
    'Adding: Sprinkle the erythritol with pectin over the puree in a "rain" manner, while continuously stirring with a whisk.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Конфи' AND recipe_role_id = 3),
    4,
    'Варене: Увеличете огъня и оставете сместа да заври. Варете 2 минути при постоянно бъркане.',
    'Варене: Увеличете огъня и оставете сместа да заври. Варете 2 минути при постоянно бъркане.',
    'Boiling: Increase the heat and bring the mixture to a boil. Cook for 2 minutes while stirring constantly.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Конфи' AND recipe_role_id = 3),
    5,
    'Финал: Махнете от огъня и добавете лимоновия сок. Разбъркайте.',
    'Финал: Махнете от огъня и добавете лимоновия сок. Разбъркайте.',
    'Final: Remove from heat and add the lemon juice. Stir.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Конфи' AND recipe_role_id = 3),
    6,
    'Формоване: Разпределете в две форми (ринг или силикон) с диаметър 14 или 16 см. Оставете да изстине и приберете във фризера, за да стегне напълно.',
    'Формоване: Разпределете в две форми (ринг или силикон) с диаметър 14 или 16 см. Оставете да изстине и приберете във фризера, за да стегне напълно.',
    'Molding: Distribute into two molds (ring or silicone) with a diameter of 14 or 16 cm. Let cool and place in the freezer to set completely.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадово Креме' AND recipe_role_id = 3),
    1,
    'Направете английски крем с млякото, жълтъците и еритритола до 82°C.',
    'Направете английски крем с млякото, жълтъците и еритритола до 82°C.',
    'Make an English cream with the milk, egg yolks, and erythritol until it reaches 82°C.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадово Креме' AND recipe_role_id = 3),
    2,
    'Добавете набъбналия желатин в горещия крем и разбъркайте.',
    'Добавете набъбналия желатин в горещия крем и разбъркайте.',
    'Add the soaked gelatin to the hot cream and stir.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадово Креме' AND recipe_role_id = 3),
    3,
    'Излейте върху начупения шоколад, изчакайте 1 мин. и пасирайте с пасатор (за най-гладка емулсия).',
    'Излейте върху начупения шоколад, изчакайте 1 мин. и пасирайте с пасатор (за най-гладка емулсия).',
    'Pour over the broken chocolate, wait 1 min., and blend with an immersion blender (for the smoothest emulsion).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадово Креме' AND recipe_role_id = 3),
    4,
    'Когато падне до 35°C, добавете маслото и пасирайте отново.',
    'Когато падне до 35°C, добавете маслото и пасирайте отново.',
    'When it cools to 35°C, add the butter and blend again.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадово Креме' AND recipe_role_id = 3),
    5,
    'Разлейте в две форми по 14-16 см и замразете.',
    'Разлейте в две форми по 14-16 см и замразете.',
    'Pour into two molds of 14-16 cm and freeze.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бяла Намелака' AND recipe_role_id = 3),
    1,
    'Следвайте същата технология като при Креме-то, но внимавайте при топенето на белия шоколад – той е по-чувствителен към топлина.',
    'Следвайте същата технология като при Креме-то, но внимавайте при топенето на белия шоколад – той е по-чувствителен към топлина.',
    'Follow the same technique as for the Cream, but be careful when melting the white chocolate – it is more sensitive to heat.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бяла Намелака' AND recipe_role_id = 3),
    2,
    'Задължително пасирайте с пасатор, за да разбиете мастните молекули на маслото и шоколада в една перфектна "намелака".',
    'Задължително пасирайте с пасатор, за да разбиете мастните молекули на маслото и шоколада в една перфектна "намелака".',
    'Be sure to blend with an immersion blender to break down the fat molecules of the butter and chocolate into a perfect "namelaka."'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бяла Намелака' AND recipe_role_id = 3),
    3,
    'Стабилизирайте в хладилник или замразете във форми за директно вграждане.',
    'Стабилизирайте в хладилник или замразете във форми за директно вграждане.',
    'Stabilize in the refrigerator or freeze in molds for direct incorporation.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 1 (lowcarb)' AND recipe_role_id = 3),
    1,
    'Нарежете крушите на ситни кубчета и ги сложете в касерола с еритритола и лимоновия сок.',
    'Нарежете крушите на ситни кубчета и ги сложете в касерола с еритритола и лимоновия сок.',
    'Cut the pears into small cubes and place them in a saucepan with the erythritol and lemon juice.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 1 (lowcarb)' AND recipe_role_id = 3),
    2,
    'Гответе на среден огън, докато крушите пуснат сок и омекнат (около 5-8 минути). Ако сокът е малко, добавете 2 с.л. вода.',
    'Гответе на среден огън, докато крушите пуснат сок и омекнат (около 5-8 минути). Ако сокът е малко, добавете 2 с.л. вода.',
    'Cook over medium heat until the pears release juice and soften (about 5-8 minutes). If the juice is little, add 2 tbsp of water.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 1 (lowcarb)' AND recipe_role_id = 3),
    3,
    'Поръсете агар-агара отгоре и разбъркайте енергично. Оставете сместа да кипи силно за точно 2 минути.',
    'Поръсете агар-агара отгоре и разбъркайте енергично. Оставете сместа да кипи силно за точно 2 минути.',
    'Sprinkle the agar-agar on top and stir vigorously. Allow the mixture to boil vigorously for exactly 2 minutes.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 1 (lowcarb)' AND recipe_role_id = 3),
    4,
    'Махнете от огъня. По желание пасирайте леко с преса за картофи (за рустикална текстура).',
    'Махнете от огъня. По желание пасирайте леко с преса за картофи (за рустикална текстура).',
    'Remove from heat. Optionally, mash lightly with a potato masher (for a rustic texture).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 1 (lowcarb)' AND recipe_role_id = 3),
    5,
    'Разлейте веднага в две форми (14-15 см). Важно: Работете бързо, защото агарът започва да стяга още на 40°C!',
    'Разлейте веднага в две форми (14-15 см). Важно: Работете бързо, защото агарът започва да стяга още на 40°C!',
    'Immediately pour into two molds (14-15 cm). Important: Work quickly, as the agar begins to set at 40°C!'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 1 (lowcarb)' AND recipe_role_id = 3),
    6,
    'Оставете да изстине на плота, след което приберете в хладилник.',
    'Оставете да изстине на плота, след което приберете в хладилник.',
    'Let cool on the countertop, then store in the refrigerator.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 2' AND recipe_role_id = 3),
    1,
    'Маслен сос: Загрейте лимоновия сок, кората, еритритола и маслото, докато всичко се разтопи.',
    'Маслен сос: Загрейте лимоновия сок, кората, еритритола и маслото, докато всичко се разтопи.',
    'Butter sauce: Heat the lemon juice, zest, erythritol, and butter until everything melts.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 2' AND recipe_role_id = 3),
    2,
    'Емулсия: Разбийте яйцата и жълтъците. Налейте горещия сос на тънка струя при тях, като бъркате енергично.',
    'Емулсия: Разбийте яйцата и жълтъците. Налейте горещия сос на тънка струя при тях, като бъркате енергично.',
    'Emulsion: Whisk the eggs and yolks. Pour the hot sauce in a thin stream while whisking vigorously.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 2' AND recipe_role_id = 3),
    3,
    'Готвене: Върнете на слаб огън. Бъркайте непрекъснато с телена бъркалка или силиконова шпатула. Гответе до 80-82°C. Кремът трябва да е гъст и лъскав.',
    'Готвене: Върнете на слаб огън. Бъркайте непрекъснато с телена бъркалка или силиконова шпатула. Гответе до 80-82°C. Кремът трябва да е гъст и лъскав.',
    'Cooking: Return to low heat. Stir continuously with a whisk or silicone spatula. Cook until 80-82°C. The cream should be thick and shiny.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 2' AND recipe_role_id = 3),
    4,
    'Финал: Махнете от огъня. Ако ползвате желатин, добавете го сега в горещия кърд.',
    'Финал: Махнете от огъня. Ако ползвате желатин, добавете го сега в горещия кърд.',
    'Final: Remove from heat. If using gelatin, add it now to the hot curd.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 2' AND recipe_role_id = 3),
    5,
    'Гладкост: Прецедете готовия кърд през фино сито, за да отстраните лимоновите корички и евентуални частици сготвен белтък.',
    'Гладкост: Прецедете готовия кърд през фино сито, за да отстраните лимоновите корички и евентуални частици сготвен белтък.',
    'Smoothness: Strain the finished curd through a fine sieve to remove the lemon zest and any cooked egg white particles.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 2' AND recipe_role_id = 3),
    6,
    'Охлаждане: Покрийте със стреч фолио "контактно" (директно върху крема), за да не хваща коричка. Охладете напълно.',
    'Охлаждане: Покрийте със стреч фолио "контактно" (директно върху крема), за да не хваща коричка. Охладете напълно.',
    'Cooling: Cover with plastic wrap "contact" (directly on the cream) to prevent a skin from forming. Cool completely.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 3' AND recipe_role_id = 3),
    1,
    'Подготовка: Поставете плодовете и еритритола в касерола. Загрейте, докато плодовете омекнат и пуснат сока си.',
    'Подготовка: Поставете плодовете и еритритола в касерола. Загрейте, докато плодовете омекнат и пуснат сока си.',
    'Preparation: Place the fruits and erythritol in a saucepan. Heat until the fruits soften and release their juice.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 3' AND recipe_role_id = 3),
    2,
    'Агар: Поръсете агар-агара равномерно върху сместа и разбъркайте веднага с бъркалка, за да няма бучки.',
    'Агар: Поръсете агар-агара равномерно върху сместа и разбъркайте веднага с бъркалка, за да няма бучки.',
    'Agar: Sprinkle the agar-agar evenly over the mixture and stir immediately with a whisk to avoid lumps.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 3' AND recipe_role_id = 3),
    3,
    'Варене: Оставете да ври силно (с големи мехури) за 3 минути. Това е времето, в което агарът "се събужда".',
    'Варене: Оставете да ври силно (с големи мехури) за 3 минути. Това е времето, в което агарът "се събужда".',
    'Boiling: Let it boil vigorously (with large bubbles) for 3 minutes. This is the time when the agar "wakes up."'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 3' AND recipe_role_id = 3),
    4,
    'Формоване: Разлейте веднага в две форми (14-16 см).',
    'Формоване: Разлейте веднага в две форми (14-16 см).',
    'Molding: Immediately pour into two molds (14-16 cm).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 3' AND recipe_role_id = 3),
    5,
    'Забележка: Агарът стяга много бързо (още при 40°C), така че не се бавете.',
    'Забележка: Агарът стяга много бързо (още при 40°C), така че не се бавете.',
    'Note: The agar sets very quickly (even at 40°C), so do not delay.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 3' AND recipe_role_id = 3),
    6,
    'Охлаждане: Оставете на плота. След 30-40 минути ще имате стабилни дискове, които лесно се отделят от силикона или фолиото.',
    'Охлаждане: Оставете на плота. След 30-40 минути ще имате стабилни дискове, които лесно се отделят от силикона или фолиото.',
    'Cooling: Leave on the countertop. After 30-40 minutes, you will have stable discs that easily detach from the silicone or foil.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плодов мус' AND recipe_role_id = 3),
    1,
    'Желатин: Залейте желатина със студената вода и го оставете да набъбне за 10-15 минути.',
    'Желатин: Залейте желатина със студената вода и го оставете да набъбне за 10-15 минути.',
    'Gelatin: Pour the gelatin over the cold water and let it swell for 10-15 minutes.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плодов мус' AND recipe_role_id = 3),
    2,
    'Плодова база: Смесете плодовото пюре с еритритола и лимоновия сок. Загрейте ги леко в касерола (до около 50-60°C), докато еритритолът се разтвори. Не варите!',
    'Плодова база: Смесете плодовото пюре с еритритола и лимоновия сок. Загрейте ги леко в касерола (до около 50-60°C), докато еритритолът се разтвори. Не варите!',
    'Fruit base: Mix the fruit puree with the erythritol and lemon juice. Gently heat them in a saucepan (to about 50-60°C) until the erythritol dissolves. Do not boil!'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плодов мус' AND recipe_role_id = 3),
    3,
    'Активация: Добавете набъбналия желатин към топлото пюре и бъркайте, докато се разтопи напълно. Оставете сместа да се охлади до стайна температура (но да не стяга още).',
    'Активация: Добавете набъбналия желатин към топлото пюре и бъркайте, докато се разтопи напълно. Оставете сместа да се охлади до стайна температура (но да не стяга още).',
    'Activation: Add the swollen gelatin to the warm puree and stir until completely melted. Allow the mixture to cool to room temperature (but do not let it set yet).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плодов мус' AND recipe_role_id = 3),
    4,
    'Сметана: В отделен съд разбийте студената сметана до меки върхове (не я правете прекалено гъста, за да остане мусът фин).',
    'Сметана: В отделен съд разбийте студената сметана до меки върхове (не я правете прекалено гъста, за да остане мусът фин).',
    'Cream: In a separate bowl, whip the cold cream to soft peaks (do not make it too thick so that the mousse remains fine).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плодов мус' AND recipe_role_id = 3),
    5,
    'Обединяване: Към плодовата смес добавете 2-3 лъжици от сметаната и разбъркайте енергично. След това внимателно добавете останалата сметана, като бъркате с шпатула отдолу-нагоре.',
    'Обединяване: Към плодовата смес добавете 2-3 лъжици от сметаната и разбъркайте енергично. След това внимателно добавете останалата сметана, като бъркате с шпатула отдолу-нагоре.',
    'Combining: Add 2-3 tablespoons of the cream to the fruit mixture and stir vigorously. Then gently fold in the remaining cream using a spatula, stirring from the bottom up.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плодов мус' AND recipe_role_id = 3),
    6,
    'Формоване: Разлейте веднага в две форми (14-16 см). Почукайте ги леко в плота, за да излязат балончетата въздух.',
    'Формоване: Разлейте веднага в две форми (14-16 см). Почукайте ги леко в плота, за да излязат балончетата въздух.',
    'Molding: Immediately pour into two molds (14-16 cm). Tap them lightly on the counter to release any air bubbles.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плодов мус' AND recipe_role_id = 3),
    7,
    'Замразяване: Приберете във фризера за поне 3-4 часа. Мусът трябва да е напълно "кокал", за да го вградите лесно в центъра на тортата.',
    'Замразяване: Приберете във фризера за поне 3-4 часа. Мусът трябва да е напълно "кокал", за да го вградите лесно в центъра на тортата.',
    'Freezing: Place in the freezer for at least 3-4 hours. The mousse should be completely "set" so that you can easily embed it in the center of the cake.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плънка Матча' AND recipe_role_id = 3),
    1,
    'Желатин: Залей желатина със студената вода и го остави да набъбне (10 мин).',
    'Желатин: Залей желатина със студената вода и го остави да набъбне (10 мин).',
    'Gelatin: Pour the gelatin over the cold water and let it swell (10 min).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плънка Матча' AND recipe_role_id = 3),
    2,
    'Загряване: Сложи сметаната и еритритола в касерола. Загрей до около 75-80°C (когато започне да пуши силно, но преди да заври). Махни от огъня.',
    'Загряване: Сложи сметаната и еритритола в касерола. Загрей до около 75-80°C (когато започне да пуши силно, но преди да заври). Махни от огъня.',
    'Heating: Place the cream and erythritol in a saucepan. Heat to about 75-80°C (when it starts to smoke heavily, but before it boils). Remove from heat.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плънка Матча' AND recipe_role_id = 3),
    3,
    'Разтваряне на матчата: В малка купичка сложи матчата. Добави 3-4 с.л. от горещата сметана и разбъркай енергично (най-добре с бамбукова бъркалка или малка телена бъркалка), докато стане гладка паста без бучки. Изсипи пастата обратно в тенджерата със сметаната.',
    'Разтваряне на матчата: В малка купичка сложи матчата. Добави 3-4 с.л. от горещата сметана и разбъркай енергично (най-добре с бамбукова бъркалка или малка телена бъркалка), докато стане гладка паста без бучки. Изсипи пастата обратно в тенджерата със сметаната.',
    'Dissolving the matcha: In a small bowl, place the matcha. Add 3-4 tablespoons of the hot cream and stir vigorously (best with a bamboo whisk or a small wire whisk) until it becomes a smooth paste without lumps. Pour the paste back into the saucepan with the cream.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плънка Матча' AND recipe_role_id = 3),
    4,
    'Желатин: Добави набъбналия желатин в топлата матча-сметана. Разбъркай добре, докато се разтвори напълно.',
    'Желатин: Добави набъбналия желатин в топлата матча-сметана. Разбъркай добре, докато се разтвори напълно.',
    'Gelatin: Add the swollen gelatin to the warm matcha-cream mixture. Stir well until completely dissolved.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плънка Матча' AND recipe_role_id = 3),
    5,
    'Емулсия (Шеф трик): Препоръчвам да минеш сместа с пасатор за 30 секунди. Това ще разбие и най-микроскопичните частици чай и ще направи цвета абсолютно равномерен и искрящ.',
    'Емулсия (Шеф трик): Препоръчвам да минеш сместа с пасатор за 30 секунди. Това ще разбие и най-микроскопичните частици чай и ще направи цвета абсолютно равномерен и искрящ.',
    'Emulsion (Chef trick): I recommend blending the mixture with an immersion blender for 30 seconds. This will break down even the most microscopic tea particles and make the color absolutely uniform and sparkling.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плънка Матча' AND recipe_role_id = 3),
    6,
    'Формоване: Разлей по равно в две форми (14-16 см). Покрий със стреч фолио.',
    'Формоване: Разлей по равно в две форми (14-16 см). Покрий със стреч фолио.',
    'Molding: Divide evenly into two molds (14-16 cm). Cover with cling film.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Плънка Матча' AND recipe_role_id = 3),
    7,
    'Стабилизация: Остави в хладилник за поне 4 часа или във фризер за 2 часа.',
    'Стабилизация: Остави в хладилник за поне 4 часа или във фризер за 2 часа.',
    'Stabilization: Leave in the refrigerator for at least 4 hours or in the freezer for 2 hours.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Лате' AND recipe_role_id = 3),
    1,
    'Кафе паста: Разтворете инстантното кафе в 20 мл гореща вода. Това гарантира, че няма да има тъмни точки/песъчинки в муса.',
    'Кафе паста: Разтворете инстантното кафе в 20 мл гореща вода. Това гарантира, че няма да има тъмни точки/песъчинки в муса.',
    'Coffee paste: Dissolve the instant coffee in 20 ml of hot water. This ensures that there will be no dark spots/grains in the mousse.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Лате' AND recipe_role_id = 3),
    2,
    'Смесване: В касерола смесете сметаната, еритритола и разтвореното кафе. Загрейте до около 60°C.',
    'Смесване: В касерола смесете сметаната, еритритола и разтвореното кафе. Загрейте до около 60°C.',
    'Mixing: In a saucepan, combine the cream, erythritol, and dissolved coffee. Heat to about 60°C.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Лате' AND recipe_role_id = 3),
    3,
    'Емулсия: Добавете крема сиренето на части към топлата сметана и разбийте с бъркалка, докато сместа стане напълно гладка и без бучки.',
    'Емулсия: Добавете крема сиренето на части към топлата сметана и разбийте с бъркалка, докато сместа стане напълно гладка и без бучки.',
    'Emulsion: Gradually add the cream cheese to the warm cream and whisk until the mixture is completely smooth and lump-free.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Лате' AND recipe_role_id = 3),
    4,
    'Варене с Агар: Поръсете агар-агара отгоре. Увеличете огъня и оставете сместа да заври, като бъркате енергично. Варете точно 2 минути на умерен огън.',
    'Варене с Агар: Поръсете агар-агара отгоре. Увеличете огъня и оставете сместа да заври, като бъркате енергично. Варете точно 2 минути на умерен огън.',
    'Cooking with Agar: Sprinkle the agar-agar on top. Increase the heat and bring the mixture to a boil, stirring vigorously. Cook for exactly 2 minutes over medium heat.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Лате' AND recipe_role_id = 3),
    5,
    'Финал: Махнете от огъня. За перфектен резултат, минете сместа с пасатор за 20 секунди – това ще я направи копринена.',
    'Финал: Махнете от огъня. За перфектен резултат, минете сместа с пасатор за 20 секунди – това ще я направи копринена.',
    'Final: Remove from heat. For a perfect result, blend the mixture with an immersion blender for 20 seconds – this will make it silky.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Лате' AND recipe_role_id = 3),
    6,
    'Формоване: Разлейте веднага в две форми (14-16 см). Покрийте със стреч фолио.',
    'Формоване: Разлейте веднага в две форми (14-16 см). Покрийте със стреч фолио.',
    'Molding: Immediately pour into two molds (14-16 cm). Cover with plastic wrap.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Лате' AND recipe_role_id = 3),
    7,
    'Стабилизация: Оставете на стайна температура за 1 час (агарът ще стегне още тогава), след което приберете в хладилник.',
    'Стабилизация: Оставете на стайна температура за 1 час (агарът ще стегне още тогава), след което приберете в хладилник.',
    'Stabilization: Leave at room temperature for 1 hour (the agar will set further then), after which refrigerate.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 4 (lowcarb)' AND recipe_role_id = 3),
    1,
    'Желатин: Залейте желатина със студената вода и го оставете да набъбне (10-15 мин).',
    'Желатин: Залейте желатина със студената вода и го оставете да набъбне (10-15 мин).',
    'Gelatin: Pour the gelatin over the cold water and let it swell (10-15 min).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 4 (lowcarb)' AND recipe_role_id = 3),
    2,
    'Плодове: Сложете портокаловите филета, еритритола и лимоновия сок в касерола. Загрейте на среден огън, докато плодовете омекнат и пуснат сок (около 5 мин). Не е нужно да врят дълго.',
    'Плодове: Сложете портокаловите филета, еритритола и лимоновия сок в касерола. Загрейте на среден огън, докато плодовете омекнат и пуснат сок (около 5 мин). Не е нужно да врят дълго.',
    'Fruits: Place the orange fillets, erythritol, and lemon juice in a saucepan. Heat over medium heat until the fruit softens and releases juice (about 5 min). It does not need to boil for long.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 4 (lowcarb)' AND recipe_role_id = 3),
    3,
    'Обединяване: Махнете от огъня. Изчакайте 1-2 минути (температурата да падне до около 70-80°C) и добавете набъбналия желатин. Бъркайте, докато се разтвори напълно.',
    'Обединяване: Махнете от огъня. Изчакайте 1-2 минути (температурата да падне до около 70-80°C) и добавете набъбналия желатин. Бъркайте, докато се разтвори напълно.',
    'Combining: Remove from heat. Wait 1-2 minutes (for the temperature to drop to about 70-80°C) and add the swollen gelatin. Stir until completely dissolved.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 4 (lowcarb)' AND recipe_role_id = 3),
    4,
    'Текстура (Опция): Може да оставите парченцата цели за рустикален вид или да ги пасирате леко с пасатор за гладко, елегантно желе.',
    'Текстура (Опция): Може да оставите парченцата цели за рустикален вид или да ги пасирате леко с пасатор за гладко, елегантно желе.',
    'Texture (Option): You can leave the pieces whole for a rustic look or lightly puree them with an immersion blender for a smooth, elegant jelly.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 4 (lowcarb)' AND recipe_role_id = 3),
    5,
    'Формоване: Разлейте в две форми по 14-16 см. Оставете да се охладят на стайна температура и приберете в хладилник за поне 3 часа (или във фризер за 1 час за по-лесно изваждане).',
    'Формоване: Разлейте в две форми по 14-16 см. Оставете да се охладят на стайна температура и приберете в хладилник за поне 3 часа (или във фризер за 1 час за по-лесно изваждане).',
    'Molding: Pour into two molds of 14-16 cm. Allow to cool at room temperature and refrigerate for at least 3 hours (or freeze for 1 hour for easier removal).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Мармелад' AND recipe_role_id = 3),
    1,
    'Подготовка: Залей желатина с водата. Смеси еритритола с пектина в суха купичка.',
    'Подготовка: Залей желатина с водата. Смеси еритритола с пектина в суха купичка.',
    'Preparation: Pour the gelatin with the water. Mix the erythritol with the pectin in a dry bowl.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Мармелад' AND recipe_role_id = 3),
    2,
    'Загряване: Сложи пюрето и водата в тенджерка. Загрей до около 40-45°C.',
    'Загряване: Сложи пюрето и водата в тенджерка. Загрей до около 40-45°C.',
    'Heating: Place the puree and water in a saucepan. Heat to about 40-45°C.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Мармелад' AND recipe_role_id = 3),
    3,
    'Сгъстяване: Изсипи сместа от еритритол и пектин на тънка струя, като бъркаш непрекъснато с бъркалка.',
    'Сгъстяване: Изсипи сместа от еритритол и пектин на тънка струя, като бъркаш непрекъснато с бъркалка.',
    'Thickening: Pour the erythritol and pectin mixture in a thin stream while continuously stirring with a whisk.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Мармелад' AND recipe_role_id = 3),
    4,
    'Кипене: Доведи до кипене и вари 2 минути. Добави лимоновия сок в края.',
    'Кипене: Доведи до кипене и вари 2 минути. Добави лимоновия сок в края.',
    'Boiling: Bring to a boil and cook for 2 minutes. Add the lemon juice at the end.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Мармелад' AND recipe_role_id = 3),
    5,
    'Желатин: Свали от котлона и добави набъбналия желатин. Разбъркай до пълно разтваряне.',
    'Желатин: Свали от котлона и добави набъбналия желатин. Разбъркай до пълно разтваряне.',
    'Gelatin: Remove from heat and add the swollen gelatin. Stir until completely dissolved.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Мармелад' AND recipe_role_id = 3),
    6,
    'За Сахер: Намажи блатовете, докато сладкото е още топло (но не врящо) – така ще попие леко в блата.',
    'За Сахер: Намажи блатовете, докато сладкото е още топло (но не врящо) – така ще попие леко в блата.',
    'For Sacher: Spread the jam on the layers while it is still warm (but not boiling) – this way it will slightly soak into the layers.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Мармелад' AND recipe_role_id = 3),
    7,
    'За плънка: Излей в два ринга (14-15 см) и остави да стегне в хладилник.',
    'За плънка: Излей в два ринга (14-15 см) и остави да стегне в хладилник.',
    'For filling: Pour into two rings (14-15 cm) and let set in the refrigerator.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Карамелизиран кокос' AND recipe_role_id = 3),
    1,
    'Подготовка: След като настържеш кокоса, го попий леко с кухненска хартия. Свежият кокос е мокър и ако влезе директно в карамела, ще го разводни.',
    'Подготовка: След като настържеш кокоса, го попий леко с кухненска хартия. Свежият кокос е мокър и ако влезе директно в карамела, ще го разводни.',
    'Preparation: After grating the coconut, lightly pat it dry with kitchen paper. Fresh coconut is wet, and if it goes directly into the caramel, it will dilute it.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Карамелизиран кокос' AND recipe_role_id = 3),
    2,
    'Затопляне: В тиган с дебело дъно разтопи маслото заедно с алулозата (или еритритола) на среден огън. Бъркай, докато подсладителят се разтвори напълно.',
    'Затопляне: В тиган с дебело дъно разтопи маслото заедно с алулозата (или еритритола) на среден огън. Бъркай, докато подсладителят се разтвори напълно.',
    'Heating: In a heavy-bottomed pan, melt the butter together with the allulose (or erythritol) over medium heat. Stir until the sweetener is completely dissolved.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Карамелизиран кокос' AND recipe_role_id = 3),
    3,
    'Готвене: Добави настъргания кокос в тигана. В началото кокосът ще пусне още малко влага – не се притеснявай. Продължи да бъркаш непрекъснато.',
    'Готвене: Добави настъргания кокос в тигана. В началото кокосът ще пусне още малко влага – не се притеснявай. Продължи да бъркаш непрекъснато.',
    'Cooking: Add the grated coconut to the pan. Initially, the coconut will release a little more moisture – don''t worry. Keep stirring continuously.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Карамелизиран кокос' AND recipe_role_id = 3),
    4,
    'Карамелизация: Готви 8-10 минути на умерен огън. Кокосът трябва първо да се изсуши, а след това алулозата ще започне да го обвива и да променя цвета му към златисто-кафяв.',
    'Карамелизация: Готви 8-10 минути на умерен огън. Кокосът трябва първо да се изсуши, а след това алулозата ще започне да го обвива и да променя цвета му към златисто-кафяв.',
    'Caramelization: Cook for 8-10 minutes over moderate heat. The coconut should first dry out, and then the allulose will start to coat it and change its color to golden-brown.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Карамелизиран кокос' AND recipe_role_id = 3),
    5,
    'Финал: Когато усетиш интензивен аромат на печен кокос и парченцата станат кехлибарени, добави солта и ванилията.',
    'Финал: Когато усетиш интензивен аромат на печен кокос и парченцата станат кехлибарени, добави солта и ванилията.',
    'Final: When you smell an intense aroma of roasted coconut and the pieces turn amber, add the salt and vanilla.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Карамелизиран кокос' AND recipe_role_id = 3),
    6,
    'Охлаждане: Изсипи веднага върху хартия за печене и го разстели на тънък слой. Когато изстине, кокосът ще стане хрупкав и леко лепкав (тип „тофи“).',
    'Охлаждане: Изсипи веднага върху хартия за печене и го разстели на тънък слой. Когато изстине, кокосът ще стане хрупкав и леко лепкав (тип „тофи“).',
    'Cooling: Immediately pour onto parchment paper and spread it into a thin layer. Once cooled, the coconut will become crispy and slightly sticky (like toffee).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Супер Кокос' AND recipe_role_id = 3),
    1,
    'Основа: Накиснете желатина във водата. Разбийте жълтъците с еритритола.',
    'Основа: Накиснете желатина във водата. Разбийте жълтъците с еритритола.',
    'Base: Soak the gelatin in the water. Whisk the egg yolks with the erythritol.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Супер Кокос' AND recipe_role_id = 3),
    2,
    'Темпериране: Загрейте кокосовото мляко до завиране. Налейте го на тънка струя при жълтъците, като бъркате постоянно.',
    'Темпериране: Загрейте кокосовото мляко до завиране. Налейте го на тънка струя при жълтъците, като бъркате постоянно.',
    'Tempering: Heat the coconut milk to boiling. Pour it in a thin stream over the egg yolks while constantly stirring.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Супер Кокос' AND recipe_role_id = 3),
    3,
    'Сгъстяване: Върнете сместа на водна баня (или на много слаб огън) и гответе до леко сгъстяване (82°C). Махнете от огъня и добавете набъбналия желатин.',
    'Сгъстяване: Върнете сместа на водна баня (или на много слаб огън) и гответе до леко сгъстяване (82°C). Махнете от огъня и добавете набъбналия желатин.',
    'Thickening: Return the mixture to a water bath (or on very low heat) and cook until slightly thickened (82°C). Remove from heat and add the bloomed gelatin.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Супер Кокос' AND recipe_role_id = 3),
    4,
    'Емулсия: Пасирайте горещата смес с пасатор за 30 секунди. Оставете я да се охлади до стайна температура.',
    'Емулсия: Пасирайте горещата смес с пасатор за 30 секунди. Оставете я да се охлади до стайна температура.',
    'Emulsification: Blend the hot mixture with an immersion blender for 30 seconds. Let it cool to room temperature.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Супер Кокос' AND recipe_role_id = 3),
    5,
    'Финал: Разбийте студената сметана до меки върхове. Смесете я внимателно с охладения кокосов крем и добавете кокосовите стърготини.',
    'Финал: Разбийте студената сметана до меки върхове. Смесете я внимателно с охладения кокосов крем и добавете кокосовите стърготини.',
    'Final: Whip the cold cream to soft peaks. Gently fold it into the cooled coconut cream and add the coconut flakes.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Мус Супер Кокос' AND recipe_role_id = 3),
    6,
    'Формоване: Разлейте в две форми (14-16 см) и замразете за поне 3 часа.',
    'Формоване: Разлейте в две форми (14-16 см) и замразете за поне 3 часа.',
    'Molding: Pour into two molds (14-16 cm) and freeze for at least 3 hours.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамел' AND recipe_role_id = 3),
    1,
    'Карамелизация: В съд с дебело дъно разтопи маслото и добави алулозата. Готви на среден огън, като разбъркваш от време на време. Изчакай сместа да стане с цвят на тъмен кехлибар (това дава истинския вкус).',
    'Карамелизация: В съд с дебело дъно разтопи маслото и добави алулозата. Готви на среден огън, като разбъркваш от време на време. Изчакай сместа да стане с цвят на тъмен кехлибар (това дава истинския вкус).',
    'Caramelization: In a heavy-bottomed pot, melt the butter and add the allulose. Cook over medium heat, stirring occasionally. Wait for the mixture to turn a dark amber color (this gives the true flavor).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамел' AND recipe_role_id = 3),
    2,
    'Деглазиране: Махни за секунда от огъня и налей горещата сметана на тънка струя. Внимавай, ще кипи силно! Бъркай енергично с дървена лъжица или бъркалка.',
    'Деглазиране: Махни за секунда от огъня и налей горещата сметана на тънка струя. Внимавай, ще кипи силно! Бъркай енергично с дървена лъжица или бъркалка.',
    'Deglazing: Remove from heat for a second and pour in the hot cream in a thin stream. Be careful, it will boil vigorously! Stir vigorously with a wooden spoon or whisk.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамел' AND recipe_role_id = 3),
    3,
    'Емулсия: Върни на огъня и готви още 2-3 минути, докато сосът стане гладък и започне леко да се сгъстява (при охлаждане ще стегне много повече).',
    'Емулсия: Върни на огъня и готви още 2-3 минути, докато сосът стане гладък и започне леко да се сгъстява (при охлаждане ще стегне много повече).',
    'Emulsion: Return to heat and cook for another 2-3 minutes until the sauce becomes smooth and starts to thicken slightly (it will firm up much more when cooled).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамел' AND recipe_role_id = 3),
    4,
    'Финал: Добави солта. Ако ще правиш стабилен слой за торта, сега е момента да добавиш набъбналия желатин в горещия карамел.',
    'Финал: Добави солта. Ако ще правиш стабилен слой за торта, сега е момента да добавиш набъбналия желатин в горещия карамел.',
    'Final: Add the salt. If you are going to make a stable layer for a cake, now is the time to add the bloomed gelatin to the hot caramel.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамел' AND recipe_role_id = 3),
    5,
    'Охлаждане: Пресипи в стъклен буркан. Когато изстине напълно в хладилника, ще придобие текстурата на мека дъвка.',
    'Охлаждане: Пресипи в стъклен буркан. Когато изстине напълно в хладилника, ще придобие текстурата на мека дъвка.',
    'Cooling: Transfer to a glass jar. When it cools completely in the refrigerator, it will acquire the texture of soft candy.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов Крем Англез' AND recipe_role_id = 3),
    1,
    'Инфузия: Загрейте сметаната с ванилията в касерола почти до кипене.',
    'Инфузия: Загрейте сметаната с ванилията в касерола почти до кипене.',
    'Infusion: Heat the cream with the vanilla in a saucepan almost to boiling.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов Крем Англез' AND recipe_role_id = 3),
    2,
    'Застройка: В отделна купа разбийте жълтъците с еритритола, докато станат бледожълти.',
    'Застройка: В отделна купа разбийте жълтъците с еритритола, докато станат бледожълти.',
    'Base: In a separate bowl, whisk the egg yolks with the erythritol until they become pale yellow.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов Крем Англез' AND recipe_role_id = 3),
    3,
    'Темпериране: Налейте около 1/3 от горещата сметана при жълтъците на тънка струя, като бъркате непрекъснато. Това ги "затопля" бавно, за да не се пресекат.',
    'Темпериране: Налейте около 1/3 от горещата сметана при жълтъците на тънка струя, като бъркате непрекъснато. Това ги "затопля" бавно, за да не се пресекат.',
    'Tempering: Pour about 1/3 of the hot cream into the yolks in a thin stream, whisking continuously. This "warms" them slowly to prevent curdling.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов Крем Англез' AND recipe_role_id = 3),
    4,
    'Готвене: Върнете сместа в касеролата на слаб огън. Бъркайте постоянно с шпатула (не с бъркалка), като минавате по дъното и ъглите.',
    'Готвене: Върнете сместа в касеролата на слаб огън. Бъркайте постоянно с шпатула (не с бъркалка), като минавате по дъното и ъглите.',
    'Cooking: Return the mixture to the saucepan over low heat. Stir constantly with a spatula (not a whisk), making sure to reach the bottom and corners.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов Крем Англез' AND recipe_role_id = 3),
    5,
    'Тестът "Lapping": Гответе до 82°C. Кремът е готов, когато покрие гърба на лъжицата и ако прокарате пръст по нея, остане ясна и чиста следа (това се нарича nappe).',
    'Тестът "Lapping": Гответе до 82°C. Кремът е готов, когато покрие гърба на лъжицата и ако прокарате пръст по нея, остане ясна и чиста следа (това се нарича nappe).',
    'The "Lapping" test: Cook until 82°C. The cream is ready when it coats the back of a spoon and if you run your finger through it, it leaves a clear and clean trail (this is called nappe).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Базов Крем Англез' AND recipe_role_id = 3),
    6,
    'Финал: Веднага дръпнете от огъня и прецедете през фина цедка в студена купа, за да спрете процеса на готвене.',
    'Финал: Веднага дръпнете от огъня и прецедете през фина цедка в студена купа, за да спрете процеса на готвене.',
    'Final: Immediately remove from heat and strain through a fine sieve into a cold bowl to stop the cooking process.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Заварен крем' AND recipe_role_id = 3),
    1,
    'Основа: Разбийте жълтъците с еритритола в касерола, докато изсветлеят.',
    'Основа: Разбийте жълтъците с еритритола в касерола, докато изсветлеят.',
    'Base: Whisk the yolks with the erythritol in a saucepan until they lighten in color.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Заварен крем' AND recipe_role_id = 3),
    2,
    'Темпериране: Налейте сметаната на тънка струя, като бъркате непрекъснато. Добавете екстракта.',
    'Темпериране: Налейте сметаната на тънка струя, като бъркате непрекъснато. Добавете екстракта.',
    'Tempering: Pour the cream in a thin stream while continuously stirring. Add the extract.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Заварен крем' AND recipe_role_id = 3),
    3,
    'Готвене: Поставете на слаб до среден огън. Бъркайте постоянно с шпатула, за да не загори по дъното. Гответе до 82°C или докато кремът покрие гърба на лъжицата (тестът с пръста).',
    'Готвене: Поставете на слаб до среден огън. Бъркайте постоянно с шпатула, за да не загори по дъното. Гответе до 82°C или докато кремът покрие гърба на лъжицата (тестът с пръста).',
    'Cooking: Place over low to medium heat. Stir constantly with a spatula to prevent burning on the bottom. Cook until 82°C or until the cream coats the back of a spoon (finger test).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Заварен крем' AND recipe_role_id = 3),
    4,
    'Емулсия (Важно!): Веднага след като го свалите от огъня, добавете студеното масло на кубчета и пасирайте с пасатор. Това ще направи крема по-гъст и много по-стабилен след охлаждане.',
    'Емулсия (Важно!): Веднага след като го свалите от огъня, добавете студеното масло на кубчета и пасирайте с пасатор. Това ще направи крема по-гъст и много по-стабилен след охлаждане.',
    'Emulsion (Important!): As soon as you remove it from the heat, add the cold butter in cubes and blend with an immersion blender. This will make the cream thicker and much more stable after cooling.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Заварен крем' AND recipe_role_id = 3),
    5,
    'Охлаждане: Покрийте със стреч фолио "контактно" (директно върху крема), за да не хване коричка. Оставете го на плота, а след това в хладилник за поне 4 часа.',
    'Охлаждане: Покрийте със стреч фолио "контактно" (директно върху крема), за да не хване коричка. Оставете го на плота, а след това в хладилник за поне 4 часа.',
    'Cooling: Cover with plastic wrap "contact" (directly on the cream) to prevent a skin from forming. Leave it on the countertop, then refrigerate for at least 4 hours.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Плодов Кърд' AND recipe_role_id = 3),
    1,
    'База: Пасирайте плодовете и ги прецедете. Трябва да имате чисто пюре.',
    'База: Пасирайте плодовете и ги прецедете. Трябва да имате чисто пюре.',
    'Base: Puree the fruits and strain them. You should have a clean puree.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Плодов Кърд' AND recipe_role_id = 3),
    2,
    'Смесване: В тенджерка разбийте жълтъците с еритритола, докато побелеят. Добавете плодовото пюре и разбъркайте до хомогенност.',
    'Смесване: В тенджерка разбийте жълтъците с еритритола, докато побелеят. Добавете плодовото пюре и разбъркайте до хомогенност.',
    'Mixing: In a saucepan, whisk the egg yolks with the erythritol until they turn pale. Add the fruit puree and stir until homogeneous.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Плодов Кърд' AND recipe_role_id = 3),
    3,
    'Готвене: Гответе на слаб огън (най-добре на водна баня), като бъркате непрекъснато. Целта отново е 82°C. Кремът ще започне да се сгъстява и да става лъскав.',
    'Готвене: Гответе на слаб огън (най-добре на водна баня), като бъркате непрекъснато. Целта отново е 82°C. Кремът ще започне да се сгъстява и да става лъскав.',
    'Cooking: Cook over low heat (preferably in a water bath), stirring continuously. The goal is again 82°C. The cream will start to thicken and become glossy.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Плодов Кърд' AND recipe_role_id = 3),
    4,
    'Емулсия: Свалете от огъня и добавете кубчетата студено масло. Пасирайте с пасатор. Маслото ще „заключи“ плодовия вкус и ще придаде невероятна гладкост.',
    'Емулсия: Свалете от огъня и добавете кубчетата студено масло. Пасирайте с пасатор. Маслото ще „заключи“ плодовия вкус и ще придаде невероятна гладкост.',
    'Emulsion: Remove from heat and add the cold butter cubes. Blend with an immersion blender. The butter will "lock in" the fruit flavor and provide incredible smoothness.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Плодов Кърд' AND recipe_role_id = 3),
    5,
    'Охлаждане: Покрийте със стреч фолио в контакт и оставете да стегне в хладилник.',
    'Охлаждане: Покрийте със стреч фолио в контакт и оставете да стегне в хладилник.',
    'Cooling: Cover with plastic wrap in contact and let it set in the refrigerator.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 5' AND recipe_role_id = 3),
    1,
    'Нагряване: Загрейте сметаната (или плодовото пюре) до точка на кипене, но не я оставяйте да ври дълго.',
    'Нагряване: Загрейте сметаната (или плодовото пюре) до точка на кипене, но не я оставяйте да ври дълго.',
    'Heating: Heat the cream (or fruit puree) to the boiling point, but do not let it boil for long.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 5' AND recipe_role_id = 3),
    2,
    'Заливане: Залейте начупения шоколад. Изчакайте 2 минути, без да пипате.',
    'Заливане: Залейте начупения шоколад. Изчакайте 2 минути, без да пипате.',
    'Pouring: Pour over the chopped chocolate. Wait 2 minutes without touching.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 5' AND recipe_role_id = 3),
    3,
    'Емулсия: Разбъркайте с шпатула от центъра навън. Добавете алкохола или маслото (ако ползвате) и пасирайте с пасатор за фина структура.',
    'Емулсия: Разбъркайте с шпатула от центъра навън. Добавете алкохола или маслото (ако ползвате) и пасирайте с пасатор за фина структура.',
    'Emulsification: Stir with a spatula from the center outwards. Add the alcohol or butter (if using) and blend with an immersion blender for a fine texture.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 5' AND recipe_role_id = 3),
    4,
    'Стабилизация: Покрийте със стреч фолио (контактно) и приберете в хладилник за минимум 4 часа.',
    'Стабилизация: Покрийте със стреч фолио (контактно) и приберете в хладилник за минимум 4 часа.',
    'Stabilization: Cover with plastic wrap (contact) and refrigerate for at least 4 hours.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 6' AND recipe_role_id = 3),
    1,
    'База: Накиснете желатина във водата. Загрейте Сметана (част 1) с еритритола до кипене.',
    'База: Накиснете желатина във водата. Загрейте Сметана (част 1) с еритритола до кипене.',
    'Base: Soak the gelatin in the water. Heat the cream (part 1) with the erythritol until boiling.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 6' AND recipe_role_id = 3),
    2,
    'Емулсия: Залейте шоколада с горещата сметана, добавете набъбналия желатин и пасирайте с пасатор (не миксер!), докато стане лъскаво и гладко.',
    'Емулсия: Залейте шоколада с горещата сметана, добавете набъбналия желатин и пасирайте с пасатор (не миксер!), докато стане лъскаво и гладко.',
    'Emulsion: Pour the hot cream over the chocolate, add the bloomed gelatin, and blend with an immersion blender (not a mixer!) until shiny and smooth.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 6' AND recipe_role_id = 3),
    3,
    'Обединяване (течно): Налейте студената Сметана (част 2) към топлата шоколадова смес. Пасирайте отново за 30 секунди. В този момент сместа е напълно течна – това е нормално!',
    'Обединяване (течно): Налейте студената Сметана (част 2) към топлата шоколадова смес. Пасирайте отново за 30 секунди. В този момент сместа е напълно течна – това е нормално!',
    'Combining (liquid): Pour the cold cream (part 2) into the warm chocolate mixture. Blend again for 30 seconds. At this point, the mixture is completely liquid – this is normal!'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 6' AND recipe_role_id = 3),
    4,
    'Узряване: Покрийте със стреч фолио (контактно) и приберете в хладилник за минимум 8-12 часа. Това е най-важната стъпка за кристализация на мазнините.',
    'Узряване: Покрийте със стреч фолио (контактно) и приберете в хладилник за минимум 8-12 часа. Това е най-важната стъпка за кристализация на мазнините.',
    'Maturation: Cover with cling film (contact) and refrigerate for at least 8-12 hours. This is the most important step for fat crystallization.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Без име 6' AND recipe_role_id = 3),
    5,
    'Финално разбиване: Извадете ледената смес от хладилника и я разбийте с миксер на средна скорост, докато стане на пухкав, стабилен крем (като гъста разбита сметана). Внимавайте да не го преразбиете на масло!',
    'Финално разбиване: Извадете ледената смес от хладилника и я разбийте с миксер на средна скорост, докато стане на пухкав, стабилен крем (като гъста разбита сметана). Внимавайте да не го преразбиете на масло!',
    'Final whipping: Remove the chilled mixture from the refrigerator and whip with a mixer on medium speed until it becomes a fluffy, stable cream (like thick whipped cream). Be careful not to over-whip it into butter!'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Шантили' AND recipe_role_id = 3),
    1,
    'Подготовка: Сложете купата и бъркалките във фризера за 10 минути преди работа.',
    'Подготовка: Сложете купата и бъркалките във фризера за 10 минути преди работа.',
    'Preparation: Place the bowl and beaters in the freezer for 10 minutes before starting.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Шантили' AND recipe_role_id = 3),
    2,
    'Смесване: Изсипете сметаната в купата, добавете пресятия еритритол и ванилията.',
    'Смесване: Изсипете сметаната в купата, добавете пресятия еритритол и ванилията.',
    'Mixing: Pour the cream into the bowl, add the sifted erythritol and vanilla.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Шантили' AND recipe_role_id = 3),
    3,
    'Разбиване: Започнете на ниска скорост, за да се разтвори подсладителят, и постепенно увеличете до висока. Разбивайте, докато се образуват твърди върхове (stiff peaks).',
    'Разбиване: Започнете на ниска скорост, за да се разтвори подсладителят, и постепенно увеличете до висока. Разбивайте, докато се образуват твърди върхове (stiff peaks).',
    'Whipping: Start on low speed to dissolve the sweetener, and gradually increase to high. Whip until stiff peaks form.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Шантили' AND recipe_role_id = 3),
    4,
    'Внимание: Спрете веднага щом кремът стане стабилен и спре да бъде лъскав.',
    'Внимание: Спрете веднага щом кремът стане стабилен и спре да бъде лъскав.',
    'Attention: Stop as soon as the cream becomes stable and stops being glossy.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Крем със заквасена сметана' AND recipe_role_id = 3),
    1,
    'Отцеждане (Шеф трик): Ако искате кремът да е „бетон“ и да измажете тортата с него, оставете заквасената сметана в тензух над купа за 2 часа в хладилника, за да изтече излишната суроватка.',
    'Отцеждане (Шеф трик): Ако искате кремът да е „бетон“ и да измажете тортата с него, оставете заквасената сметана в тензух над купа за 2 часа в хладилника, за да изтече излишната суроватка.',
    'Draining (Chef trick): If you want the cream to be "concrete" and to frost the cake with it, leave the sour cream in cheesecloth over a bowl for 2 hours in the refrigerator to drain the excess whey.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Крем със заквасена сметана' AND recipe_role_id = 3),
    2,
    'Смесване: Сложете студената сметана в купа, добавете еритритола и ванилията.',
    'Смесване: Сложете студената сметана в купа, добавете еритритола и ванилията.',
    'Mixing: Place the cold sour cream in a bowl, add the erythritol and vanilla.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Крем със заквасена сметана' AND recipe_role_id = 3),
    3,
    'Разбиване: Започнете на ниска скорост, за да се смесят, и увеличете до средно-висока. Разбивайте само докато видите, че бъркалките оставят ясни, стабилни следи и кремът стане „въздушен“. Спрете веднага, щом достигне този етап!',
    'Разбиване: Започнете на ниска скорост, за да се смесят, и увеличете до средно-висока. Разбивайте само докато видите, че бъркалките оставят ясни, стабилни следи и кремът стане „въздушен“. Спрете веднага, щом достигне този етап!',
    'Whipping: Start on low speed to combine, then increase to medium-high. Whip only until you see clear, stable trails left by the beaters and the cream becomes "airy." Stop immediately as soon as it reaches this stage!'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Крем със заквасена сметана' AND recipe_role_id = 3),
    4,
    'Стабилизация: Оставете в хладилника за 30 минути преди употреба – еритритолът ще помогне на мазнините да стегнат още малко.',
    'Стабилизация: Оставете в хладилника за 30 минути преди употреба – еритритолът ще помогне на мазнините да стегнат още малко.',
    'Stabilization: Leave in the refrigerator for 30 minutes before use – the erythritol will help the fats firm up a bit more.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Стабилен Розов Крем' AND recipe_role_id = 3),
    1,
    'Ароматизиране: В купа разбийте за кратко маскарпонето с еритритола и розовата вода – само колкото да стане гладко (около 30 секунди). Не прекалявайте!',
    'Ароматизиране: В купа разбийте за кратко маскарпонето с еритритола и розовата вода – само колкото да стане гладко (около 30 секунди). Не прекалявайте!',
    'Flavoring: In a bowl, briefly beat the mascarpone with the erythritol and rose water – just enough to make it smooth (about 30 seconds). Do not overmix!'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Стабилен Розов Крем' AND recipe_role_id = 3),
    2,
    'Обем: В отделна ледена купа разбийте сметаната до „твърди върхове“.',
    'Обем: В отделна ледена купа разбийте сметаната до „твърди върхове“.',
    'Volume: In a separate ice-cold bowl, whip the cream to "stiff peaks."'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Стабилен Розов Крем' AND recipe_role_id = 3),
    3,
    'Обединяване: Добавете 1/3 от сметаната към маскарпонето и разбъркайте енергично, за да „отпуснете“ сиренето. След това добавете останалата сметана и бъркайте внимателно с шпатула (отдолу нагоре), докато получите копринен, гъст крем.',
    'Обединяване: Добавете 1/3 от сметаната към маскарпонето и разбъркайте енергично, за да „отпуснете“ сиренето. След това добавете останалата сметана и бъркайте внимателно с шпатула (отдолу нагоре), докато получите копринен, гъст крем.',
    'Combining: Add 1/3 of the whipped cream to the mascarpone and mix vigorously to "loosen" the cheese. Then add the remaining cream and gently fold with a spatula (from bottom to top) until you achieve a silky, thick cream.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Стабилен Розов Крем' AND recipe_role_id = 3),
    4,
    'Отлежаване: Оставете го в хладилник за 30 минути. Това ще позволи на вкусовете да се „омъжат“ и кремът да стане още по-стабилен за шприцоване.',
    'Отлежаване: Оставете го в хладилник за 30 минути. Това ще позволи на вкусовете да се „омъжат“ и кремът да стане още по-стабилен за шприцоване.',
    'Resting: Leave it in the refrigerator for 30 minutes. This will allow the flavors to "marry" and the cream to become even more stable for piping.'
  )
;

-- Total: 126 steps