-- ============================================================
-- File: 32_INSERT_FROSTING_STEPS_BILINGUAL.sql
-- Project: KetoCakR | Date: 2026-04-07
-- ============================================================

INSERT INTO recipe_instruction_steps (
  recipe_id, step_number,
  step_description, step_description_bg, step_description_en
)
VALUES
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Фъстъчен крем' AND recipe_role_id = 2),
    1,
    'Подготовка: Уверете се, че фъстъченото масло е със стайна температура (за да е течно и гладко), а маскарпонето и сметаната са директно от хладилника.',
    'Подготовка: Уверете се, че фъстъченото масло е със стайна температура (за да е течно и гладко), а маскарпонето и сметаната са директно от хладилника.',
    'Preparation: Make sure the peanut butter is at room temperature (to be liquid and smooth), and the mascarpone and cream are straight from the refrigerator.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Фъстъчен крем' AND recipe_role_id = 2),
    2,
    'Смесване на базата: В голяма купа сложете маскарпонето, еритритола и фъстъченото масло. Разбийте с миксер на ниска скорост за около 30-40 секунди, докато се обединят в гъста паста.',
    'Смесване на базата: В голяма купа сложете маскарпонето, еритритола и фъстъченото масло. Разбийте с миксер на ниска скорост за около 30-40 секунди, докато се обединят в гъста паста.',
    'Mixing the base: In a large bowl, place the mascarpone, erythritol, and peanut butter. Whip with a mixer on low speed for about 30-40 seconds until combined into a thick paste.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Фъстъчен крем' AND recipe_role_id = 2),
    3,
    'Добавяне на обем: Налейте студената течна сметана в купата при фъстъчената смес.',
    'Добавяне на обем: Налейте студената течна сметана в купата при фъстъчената смес.',
    'Adding volume: Pour the cold liquid cream into the bowl with the peanut mixture.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Фъстъчен крем' AND recipe_role_id = 2),
    4,
    'Емулсия: Разбийте на висока скорост. Сметаната ще започне да се сгъстява заедно с маскарпонето. Продължете до получаването на гъст, стабилен и пухкав крем (около 1-2 минути).',
    'Емулсия: Разбийте на висока скорост. Сметаната ще започне да се сгъстява заедно с маскарпонето. Продължете до получаването на гъст, стабилен и пухкав крем (около 1-2 минути).',
    'Emulsion: Whip on high speed. The cream will start to thicken together with the mascarpone. Continue until you achieve a thick, stable, and fluffy cream (about 1-2 minutes).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Фъстъчен крем' AND recipe_role_id = 2),
    5,
    'Внимание: Не преразбивайте! Щом видите, че бъркалките оставят ясни следи и кремът "стои" на тях, спрете веднага.',
    'Внимание: Не преразбивайте! Щом видите, че бъркалките оставят ясни следи и кремът "стои" на тях, спрете веднага.',
    'Attention: Do not over-whip! As soon as you see that the beaters leave clear marks and the cream "stands" on them, stop immediately.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамелен крем' AND recipe_role_id = 2),
    1,
    'Приготвяне на карамелената пудра:',
    'Приготвяне на карамелената пудра:',
    'Preparing the caramel powder:'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамелен крем' AND recipe_role_id = 2),
    2,
    'Изсипете алулозата в тиган с дебело дъно. Загрейте на среден огън, без да бъркате, докато се разтопи и придобие наситен кехлибарен цвят.',
    'Изсипете алулозата в тиган с дебело дъно. Загрейте на среден огън, без да бъркате, докато се разтопи и придобие наситен кехлибарен цвят.',
    'Pour the allulose into a heavy-bottomed pan. Heat over medium heat, without stirring, until it melts and acquires a rich amber color.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамелен крем' AND recipe_role_id = 2),
    3,
    'Веднага изсипете върху силиконова подложка или хартия за печене на тънък слой.',
    'Веднага изсипете върху силиконова подложка или хартия за печене на тънък слой.',
    'Immediately pour onto a silicone mat or parchment paper in a thin layer.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамелен крем' AND recipe_role_id = 2),
    4,
    'След като изстине напълно и стане твърда като стъкло, я начупете и я блендирайте на фин прах. Вече имате "Карамелена захар".',
    'След като изстине напълно и стане твърда като стъкло, я начупете и я блендирайте на фин прах. Вече имате "Карамелена захар".',
    'Once completely cooled and hardened like glass, break it and blend it into a fine powder. You now have "Caramel Sugar."'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамелен крем' AND recipe_role_id = 2),
    5,
    'В голяма купа сложете студеното маскарпоне и добавете получената карамелена пудра от алулоза, солта и ванилията.',
    'В голяма купа сложете студеното маскарпоне и добавете получената карамелена пудра от алулоза, солта и ванилията.',
    'In a large bowl, place the cold mascarpone and add the prepared caramel powder from allulose, the salt, and the vanilla.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамелен крем' AND recipe_role_id = 2),
    6,
    'Разбийте за кратко с миксер (30 сек.), за да се овкуси сиренето.',
    'Разбийте за кратко с миксер (30 сек.), за да се овкуси сиренето.',
    'Briefly whip with a mixer (30 seconds) to flavor the cheese.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамелен крем' AND recipe_role_id = 2),
    7,
    'Налейте студената течна сметана (150 мл) към карамеленото маскарпоне.',
    'Налейте студената течна сметана (150 мл) към карамеленото маскарпоне.',
    'Pour the cold heavy cream (150 ml) into the caramel mascarpone.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Карамелен крем' AND recipe_role_id = 2),
    8,
    'Разбийте на висока скорост, докато кремът стане плътен, пухкав и започне да образува стабилни върхове. Спрете веднага, щом стане готов за шприцоване, за да не се пресече маскарпонето.',
    'Разбийте на висока скорост, докато кремът стане плътен, пухкав и започне да образува стабилни върхове. Спрете веднага, щом стане готов за шприцоване, за да не се пресече маскарпонето.',
    'Whip on high speed until the cream becomes thick, fluffy, and starts to form stable peaks. Stop immediately once it is ready for piping, to prevent the mascarpone from curdling.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадова Броня' AND recipe_role_id = 2),
    1,
    'Шоколад: Разтопете шоколада на водна баня или в микровълнова. Оставете го да се охлади, докато при допир с устната го чувствате едва топъл (35°C).',
    'Шоколад: Разтопете шоколада на водна баня или в микровълнова. Оставете го да се охлади, докато при допир с устната го чувствате едва топъл (35°C).',
    'Chocolate: Melt the chocolate in a water bath or in the microwave. Let it cool until it feels barely warm to the touch (35°C).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадова Броня' AND recipe_role_id = 2),
    2,
    'Масло: Разбийте маслото (с еритритола, ако ползвате) с миксер до побеляване и пухкавост.',
    'Масло: Разбийте маслото (с еритритола, ако ползвате) с миксер до побеляване и пухкавост.',
    'Butter: Whip the butter (with erythritol, if using) with a mixer until it turns pale and fluffy.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадова Броня' AND recipe_role_id = 2),
    3,
    'Емулсия: Добавете разтопения шоколад към маслото на 2-3 части, като разбивате непрекъснато на средна скорост.',
    'Емулсия: Добавете разтопения шоколад към маслото на 2-3 части, като разбивате непрекъснато на средна скорост.',
    'Emulsion: Add the melted chocolate to the butter in 2-3 parts, continuously mixing at medium speed.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадова Броня' AND recipe_role_id = 2),
    4,
    'Стабилизация: Оставете крема на плота (не в хладилник!) за около 20 минути. Той ще започне да стяга и ще стане с консистенция на гъст течен шоколад, идеален за нанасяне.',
    'Стабилизация: Оставете крема на плота (не в хладилник!) за около 20 минути. Той ще започне да стяга и ще стане с консистенция на гъст течен шоколад, идеален за нанасяне.',
    'Stabilization: Leave the cream on the countertop (not in the fridge!) for about 20 minutes. It will start to thicken and will have the consistency of thick liquid chocolate, ideal for spreading.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов стабилизиран крем' AND recipe_role_id = 2),
    1,
    'Подготовка: Извадете кенчетата от хладилника внимателно (без да ги разклащате). Изгребете само гъстия бял слой. Останалата кокосова вода запазете за смути или за сиропиране на блатовете.',
    'Подготовка: Извадете кенчетата от хладилника внимателно (без да ги разклащате). Изгребете само гъстия бял слой. Останалата кокосова вода запазете за смути или за сиропиране на блатовете.',
    'Preparation: Carefully remove the cans from the refrigerator (without shaking them). Scoop out only the thick white layer. Keep the remaining coconut water for smoothies or for soaking the layers.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов стабилизиран крем' AND recipe_role_id = 2),
    2,
    'Разбиване: Поставете кокосовата сметана в студена купа и започнете да разбивате на ниска скорост. Добавете еритритола на два пъти.',
    'Разбиване: Поставете кокосовата сметана в студена купа и започнете да разбивате на ниска скорост. Добавете еритритола на два пъти.',
    'Whipping: Place the coconut cream in a cold bowl and start whipping at low speed. Add the erythritol in two batches.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов стабилизиран крем' AND recipe_role_id = 2),
    3,
    'Стабилизиране: Докато миксерът работи, налейте хладкото какаово масло на много тънка струя.',
    'Стабилизиране: Докато миксерът работи, налейте хладкото какаово масло на много тънка струя.',
    'Stabilizing: While the mixer is running, pour in the cooled cocoa butter in a very thin stream.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов стабилизиран крем' AND recipe_role_id = 2),
    4,
    'Финиш: Увеличете скоростта за 1 минута, докато кремът стане лъскав и хомогенен. Спрете веднага, щом започне да държи форма.',
    'Финиш: Увеличете скоростта за 1 минута, докато кремът стане лъскав и хомогенен. Спрете веднага, щом започне да държи форма.',
    'Finish: Increase the speed for 1 minute until the cream becomes shiny and homogeneous. Stop immediately as soon as it starts to hold its shape.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кокосов стабилизиран крем' AND recipe_role_id = 2),
    5,
    'Узряване: Приберете в пош в хладилника. Какаовото масло има нужда от време (1-2 часа), за да "кристализира" и да направи крема стабилен.',
    'Узряване: Приберете в пош в хладилника. Какаовото масло има нужда от време (1-2 часа), за да "кристализира" и да направи крема стабилен.',
    'Maturing: Store in a piping bag in the refrigerator. The cocoa butter needs time (1-2 hours) to "crystallize" and stabilize the cream.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов Чийзкейк крем' AND recipe_role_id = 2),
    1,
    'Основа: В дълбока купа разбийте крем сиренето с еритритола и лимоновата кора до гладкост (около 1 минута).',
    'Основа: В дълбока купа разбийте крем сиренето с еритритола и лимоновата кора до гладкост (около 1 минута).',
    'Base: In a deep bowl, beat the cream cheese with the erythritol and lemon zest until smooth (about 1 minute).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов Чийзкейк крем' AND recipe_role_id = 2),
    2,
    'Смесване: Налейте студената течна сметана и продължете да разбивате на средна скорост.',
    'Смесване: Налейте студената течна сметана и продължете да разбивате на средна скорост.',
    'Mixing: Pour in the cold liquid cream and continue to beat at medium speed.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов Чийзкейк крем' AND recipe_role_id = 2),
    3,
    'Емулсия: Докато миксерът работи, започнете да наливате лимоновия сок на малки порции. Ще забележите как кремът става лъскав и започва да стяга.',
    'Емулсия: Докато миксерът работи, започнете да наливате лимоновия сок на малки порции. Ще забележите как кремът става лъскав и започва да стяга.',
    'Emulsion: While the mixer is running, start pouring in the lemon juice in small portions. You will notice how the cream becomes shiny and starts to thicken.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов Чийзкейк крем' AND recipe_role_id = 2),
    4,
    'Финал: Разбивайте до получаване на стабилни върхове. Не прекалявайте, за да не се втечни сиренето.',
    'Финал: Разбивайте до получаване на стабилни върхове. Не прекалявайте, за да не се втечни сиренето.',
    'Final: Whip until stable peaks form. Do not overwhip, as it may liquefy the cheese.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Лимонов Чийзкейк крем' AND recipe_role_id = 2),
    5,
    'Охлаждане: Приберете в пош за минимум 2 часа. Студът ще помогне на мазнините и киселината да създадат перфектната текстура за измазване.',
    'Охлаждане: Приберете в пош за минимум 2 часа. Студът ще помогне на мазнините и киселината да създадат перфектната текстура за измазване.',
    'Cooling: Store in a piping bag for at least 2 hours. The cold will help the fats and acid create the perfect texture for frosting.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Шоколадов Трюфел' AND recipe_role_id = 2),
    1,
    'Аериране: Разбийте мекото масло с еритритола и какаото на прах, докато стане пухкаво и увеличи обема си.',
    'Аериране: Разбийте мекото масло с еритритола и какаото на прах, докато стане пухкаво и увеличи обема си.',
    'Aeration: Whip the softened butter with the erythritol and cocoa powder until fluffy and increased in volume.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Шоколадов Трюфел' AND recipe_role_id = 2),
    2,
    'Основа: Добавете студеното крем сирене към маслото и разбийте за кратко, само докато се обединят.',
    'Основа: Добавете студеното крем сирене към маслото и разбийте за кратко, само докато се обединят.',
    'Base: Add the cold cream cheese to the butter and beat briefly, just until combined.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Шоколадов Трюфел' AND recipe_role_id = 2),
    3,
    'Шоколадова магия: Разтопете шоколада и какаовото масло на водна баня. Оставете ги да се охладят до хладко (да не парят при допир).',
    'Шоколадова магия: Разтопете шоколада и какаовото масло на водна баня. Оставете ги да се охладят до хладко (да не парят при допир).',
    'Chocolate magic: Melt the chocolate and cocoa butter in a water bath. Let them cool to a warm temperature (not hot to the touch).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Шоколадов Трюфел' AND recipe_role_id = 2),
    4,
    'Емулсия: Налейте шоколада на тънка струя в купата, докато миксерът работи на средна скорост. Разбийте до пълна гладкост и наситен цвят.',
    'Емулсия: Налейте шоколада на тънка струя в купата, докато миксерът работи на средна скорост. Разбийте до пълна гладкост и наситен цвят.',
    'Emulsion: Pour the chocolate in a thin stream into the bowl while the mixer is running at medium speed. Whip until completely smooth and rich in color.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Шоколадов Трюфел' AND recipe_role_id = 2),
    5,
    'Стабилизация: Оставете крема в хладилник за 30 минути, след което го разбийте отново за 10-15 секунди, за да стане удобен за работа с пош.',
    'Стабилизация: Оставете крема в хладилник за 30 минути, след което го разбийте отново за 10-15 секунди, за да стане удобен за работа с пош.',
    'Stabilization: Leave the cream in the refrigerator for 30 minutes, then whip it again for 10-15 seconds to make it easy to work with a piping bag.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Крем Пистачо' AND recipe_role_id = 2),
    1,
    'Аериране на сметаната: Разбийте студената сметана до "меки върхове" и я оставете настрани в хладилника.',
    'Аериране на сметаната: Разбийте студената сметана до "меки върхове" и я оставете настрани в хладилника.',
    'Aerating the cream: Whip the cold cream to "soft peaks" and set aside in the refrigerator.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Крем Пистачо' AND recipe_role_id = 2),
    2,
    'База: В голяма купа разбийте студеното крема сирене (или пасираната извара) с тахана от шам-фъстък и еритритола. Разбивайте само докато сместа стане гладка и оцветена равномерно.',
    'База: В голяма купа разбийте студеното крема сирене (или пасираната извара) с тахана от шам-фъстък и еритритола. Разбивайте само докато сместа стане гладка и оцветена равномерно.',
    'Base: In a large bowl, beat the cold cream cheese (or pureed cottage cheese) with the pistachio tahini and erythritol. Beat only until the mixture becomes smooth and evenly colored.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Крем Пистачо' AND recipe_role_id = 2),
    3,
    'Обединяване: Добавете разбитата сметана към пистачо базата. Разбъркайте внимателно с шпатула (на ръка) или на най-ниската скорост на миксера за 10-15 секунди.',
    'Обединяване: Добавете разбитата сметана към пистачо базата. Разбъркайте внимателно с шпатула (на ръка) или на най-ниската скорост на миксера за 10-15 секунди.',
    'Combining: Add the whipped cream to the pistachio base. Gently fold with a spatula (by hand) or at the lowest speed of the mixer for 10-15 seconds.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Крем Пистачо' AND recipe_role_id = 2),
    4,
    'Стабилизация: Поставете в пош и охладете за поне 1 час преди употреба.',
    'Стабилизация: Поставете в пош и охладете за поне 1 час преди употреба.',
    'Stabilization: Place in a piping bag and chill for at least 1 hour before use.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Пухкав Фъстъчен крем' AND recipe_role_id = 2),
    1,
    'Подготовка на фъстъците: Ако ползвате цели ядки, смелете ги в мощен блендер, докато пуснат мазнина и станат на гладко фъстъчено масло.',
    'Подготовка на фъстъците: Ако ползвате цели ядки, смелете ги в мощен блендер, докато пуснат мазнина и станат на гладко фъстъчено масло.',
    'Preparation of the peanuts: If using whole nuts, grind them in a powerful blender until they release oil and become smooth peanut butter.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Пухкав Фъстъчен крем' AND recipe_role_id = 2),
    2,
    'Обем: В отделна купа разбийте студената течна сметана до "твърди върхове" и я приберете в хладилника.',
    'Обем: В отделна купа разбийте студената течна сметана до "твърди върхове" и я приберете в хладилника.',
    'Volume: In a separate bowl, whip the cold liquid cream to "stiff peaks" and store it in the refrigerator.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Пухкав Фъстъчен крем' AND recipe_role_id = 2),
    3,
    'Маслена база: В друга купа разбийте мекото краве масло с еритритола и ванилията до побеляване. Добавете фъстъченото масло и разбийте отново до хомогенност.',
    'Маслена база: В друга купа разбийте мекото краве масло с еритритола и ванилията до побеляване. Добавете фъстъченото масло и разбийте отново до хомогенност.',
    'Butter base: In another bowl, beat the soft butter with the erythritol and vanilla until pale. Add the peanut butter and beat again until homogeneous.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Пухкав Фъстъчен крем' AND recipe_role_id = 2),
    4,
    'Сирене: Добавете студеното крем сирене (или пасираната извара) към маслената смес и разбийте за кратко на средна скорост.',
    'Сирене: Добавете студеното крем сирене (или пасираната извара) към маслената смес и разбийте за кратко на средна скорост.',
    'Cheese: Add the cold cream cheese (or pureed cottage cheese) to the butter mixture and briefly whip at medium speed.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Пухкав Фъстъчен крем' AND recipe_role_id = 2),
    5,
    'Финално обединяване: Внимателно добавете разбитата сметана към фъстъчената база. Разбъркайте на ръка с шпатула или на най-ниска скорост на миксера, за да запазите въздушната текстура.',
    'Финално обединяване: Внимателно добавете разбитата сметана към фъстъчената база. Разбъркайте на ръка с шпатула или на най-ниска скорост на миксера, за да запазите въздушната текстура.',
    'Final combining: Gently fold the whipped cream into the peanut base. Stir by hand with a spatula or at the lowest speed of the mixer to maintain the airy texture.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Малинов крем' AND recipe_role_id = 2),
    1,
    'Подготовка на плода (Критична стъпка):',
    'Подготовка на плода (Критична стъпка):',
    'Preparation of the fruit (Critical step):'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Малинов крем' AND recipe_role_id = 2),
    2,
    'Ако използвате пресни или замразени малини, ги блендирайте и ги претрийте през фина цедка, за да отстраните семките.',
    'Ако използвате пресни или замразени малини, ги блендирайте и ги претрийте през фина цедка, за да отстраните семките.',
    'If you are using fresh or frozen raspberries, blend them and strain through a fine sieve to remove the seeds.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Малинов крем' AND recipe_role_id = 2),
    3,
    'Важно: Ако малините са много воднисти, сложете полученото пюре в касерола и го сварете на умерен огън за 5-10 минути, докато се сгъсти наполовина. Оставете го да се охлади напълно преди употреба. Това ще предотврати втечняването на крема.',
    'Важно: Ако малините са много воднисти, сложете полученото пюре в касерола и го сварете на умерен огън за 5-10 минути, докато се сгъсти наполовина. Оставете го да се охлади напълно преди употреба. Това ще предотврати втечняването на крема.',
    'Important: If the raspberries are very watery, place the resulting puree in a saucepan and cook over medium heat for 5-10 minutes until it thickens by half. Let it cool completely before use. This will prevent the cream from becoming too runny.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Малинов крем' AND recipe_role_id = 2),
    4,
    'Разбиване на основата:',
    'Разбиване на основата:',
    'Whipping the base:'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Малинов крем' AND recipe_role_id = 2),
    5,
    'В дълбока купа сложете студеното крем сирене, еритритола на пудра и плодовото пюре.',
    'В дълбока купа сложете студеното крем сирене, еритритола на пудра и плодовото пюре.',
    'In a deep bowl, place the cold cream cheese, powdered erythritol, and fruit puree.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Малинов крем' AND recipe_role_id = 2),
    6,
    'Разбийте с миксер на средна скорост до пълно смесване и получаване на равномерен розов цвят.',
    'Разбийте с миксер на средна скорост до пълно смесване и получаване на равномерен розов цвят.',
    'Beat with a mixer on medium speed until fully combined and a uniform pink color is achieved.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Малинов крем' AND recipe_role_id = 2),
    7,
    'Към плодовата смес налейте студената течна сметана.',
    'Към плодовата смес налейте студената течна сметана.',
    'Pour the cold liquid cream into the fruit mixture.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Малинов крем' AND recipe_role_id = 2),
    8,
    'Увеличете скоростта на миксера и разбивайте за 2-3 минути (внимавайте да не преразбиете!). Кремът трябва да стане пухкав и достатъчно гъст, за да стои на бъркалките.',
    'Увеличете скоростта на миксера и разбивайте за 2-3 минути (внимавайте да не преразбиете!). Кремът трябва да стане пухкав и достатъчно гъст, за да стои на бъркалките.',
    'Increase the mixer speed and whip for 2-3 minutes (be careful not to over-whip!). The cream should become fluffy and thick enough to hold on the beaters.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Малинов крем' AND recipe_role_id = 2),
    9,
    'Поставете крема в сладкарски пош и го оставете в хладилника за поне 1 час преди сглобяване на тортата.',
    'Поставете крема в сладкарски пош и го оставете в хладилника за поне 1 час преди сглобяване на тортата.',
    'Place the cream in a pastry bag and refrigerate for at least 1 hour before assembling the cake.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов маслен крем' AND recipe_role_id = 2),
    1,
    'Разбиване на маслото (Най-важната стъпка):',
    'Разбиване на маслото (Най-важната стъпка):',
    'Whipping the butter (The most important step):'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов маслен крем' AND recipe_role_id = 2),
    2,
    'Сложете мекото масло в купата на миксера. Разбивайте го на висока скорост в продължение на 5–8 минути. Маслото трябва да стане почти бяло на цвят и много пухкаво.',
    'Сложете мекото масло в купата на миксера. Разбивайте го на висока скорост в продължение на 5–8 минути. Маслото трябва да стане почти бяло на цвят и много пухкаво.',
    'Place the soft butter in the mixing bowl. Beat it at high speed for 5–8 minutes. The butter should become almost white in color and very fluffy.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов маслен крем' AND recipe_role_id = 2),
    3,
    'Добавяне на подсладителя:',
    'Добавяне на подсладителя:',
    'Adding the sweetener:'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов маслен крем' AND recipe_role_id = 2),
    4,
    'Намалете скоростта на миксера и добавете еритритола на пудра лъжица по лъжица. След като го поеме, увеличете отново скоростта и разбивайте още 2-3 минути.',
    'Намалете скоростта на миксера и добавете еритритола на пудра лъжица по лъжица. След като го поеме, увеличете отново скоростта и разбивайте още 2-3 минути.',
    'Reduce the mixer speed and add the powdered erythritol tablespoon by tablespoon. Once it is absorbed, increase the speed again and beat for another 2-3 minutes.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов маслен крем' AND recipe_role_id = 2),
    5,
    'Емулсия със сметаната:',
    'Емулсия със сметаната:',
    'Emulsifying with the cream:'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов маслен крем' AND recipe_role_id = 2),
    6,
    'Добавете ванилията и течната сметана на тънка струя. Продължете да разбивате. Сметаната ще направи крема копринено гладък и ще премахне прекалено „мазното“ усещане на небцето.',
    'Добавете ванилията и течната сметана на тънка струя. Продължете да разбивате. Сметаната ще направи крема копринено гладък и ще премахне прекалено „мазното“ усещане на небцето.',
    'Add the vanilla and liquid cream in a thin stream. Continue to beat. The cream will make the frosting silky smooth and will eliminate any overly "greasy" feeling on the palate.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Ванилов маслен крем' AND recipe_role_id = 2),
    7,
    'Накрая намалете миксера на най-ниската възможна скорост за 1-2 минути. Това ще изкара излишните въздушни мехурчета от крема, за да бъде той идеално гладък при измазване на тортата.',
    'Накрая намалете миксера на най-ниската възможна скорост за 1-2 минути. Това ще изкара излишните въздушни мехурчета от крема, за да бъде той идеално гладък при измазване на тортата.',
    'Finally, reduce the mixer to the lowest possible speed for 1-2 minutes. This will remove excess air bubbles from the cream, making it perfectly smooth for frosting the cake.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Мока' AND recipe_role_id = 2),
    1,
    'Кафе-екстракт: Разтворете инстантното кафе в екстракта от ванилия (или в 1 ч.л. гореща сметана), за да се получи гъста паста. Това гарантира, че няма да имате гранули в крема.',
    'Кафе-екстракт: Разтворете инстантното кафе в екстракта от ванилия (или в 1 ч.л. гореща сметана), за да се получи гъста паста. Това гарантира, че няма да имате гранули в крема.',
    'Coffee extract: Dissolve the instant coffee in the vanilla extract (or in 1 tsp of hot cream) to create a thick paste. This ensures that you won''t have granules in the cream.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Мока' AND recipe_role_id = 2),
    2,
    'Маслена база: Разбийте мекото масло с еритритола на пудра и какаото на прах за около 5 минути, докато сместа стане много пухкава и лека.',
    'Маслена база: Разбийте мекото масло с еритритола на пудра и какаото на прах за около 5 минути, докато сместа стане много пухкава и лека.',
    'Butter base: Whip the soft butter with the powdered erythritol and cocoa powder for about 5 minutes until the mixture becomes very fluffy and light.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Мока' AND recipe_role_id = 2),
    3,
    'Ароматизиране: Добавете кафеената паста и крем сиренето. Разбийте за още 1 минута, докато се обединят напълно.',
    'Ароматизиране: Добавете кафеената паста и крем сиренето. Разбийте за още 1 минута, докато се обединят напълно.',
    'Flavoring: Add the coffee paste and cream cheese. Whip for another minute until fully combined.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Мока' AND recipe_role_id = 2),
    4,
    'Обем: В отделна купа разбийте студената течна сметана до "твърди върхове".',
    'Обем: В отделна купа разбийте студената течна сметана до "твърди върхове".',
    'Volume: In a separate bowl, whip the cold liquid cream to "stiff peaks."'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Мока' AND recipe_role_id = 2),
    5,
    'Финално смесване: Внимателно добавете разбитата сметана към маслената база. Разбъркайте на ръка с шпатула или на най-ниската скорост на миксера само до еднородност. Сметаната ще „олекоти“ маслото и ще направи крема кадифен.',
    'Финално смесване: Внимателно добавете разбитата сметана към маслената база. Разбъркайте на ръка с шпатула или на най-ниската скорост на миксера само до еднородност. Сметаната ще „олекоти“ маслото и ще направи крема кадифен.',
    'Final mixing: Gently fold the whipped cream into the butter base. Stir by hand with a spatula or on the lowest speed of the mixer just until homogeneous. The cream will "lighten" the butter and make the cream velvety.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов маслен крем' AND recipe_role_id = 2),
    1,
    'Шоколадова база: Разтопете черния шоколад заедно с какаовото масло на водна баня или в микровълнова на ниска мощност. Разбъркайте до пълна гладкост и оставете да се охлади до 30-35°C (да не е горещо на пипане).',
    'Шоколадова база: Разтопете черния шоколад заедно с какаовото масло на водна баня или в микровълнова на ниска мощност. Разбъркайте до пълна гладкост и оставете да се охлади до 30-35°C (да не е горещо на пипане).',
    'Chocolate base: Melt the dark chocolate together with the cocoa butter in a water bath or in the microwave on low power. Stir until completely smooth and let cool to 30-35°C (not hot to the touch).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов маслен крем' AND recipe_role_id = 2),
    2,
    'Маслена основа: Разбийте мекото краве масло с еритритола на пудра и какаото на прах за около 5 минути. Маслото трябва да стане много пухкаво и да поеме какаото равномерно.',
    'Маслена основа: Разбийте мекото краве масло с еритритола на пудра и какаото на прах за около 5 минути. Маслото трябва да стане много пухкаво и да поеме какаото равномерно.',
    'Butter base: Beat the soft butter with the powdered erythritol and cocoa powder for about 5 minutes. The butter should become very fluffy and evenly absorb the cocoa.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов маслен крем' AND recipe_role_id = 2),
    3,
    'Емулсия: Добавете студеното крем сирене към маслената смес и разбийте за кратко (около 30-60 секунди), докато се обединят.',
    'Емулсия: Добавете студеното крем сирене към маслената смес и разбийте за кратко (около 30-60 секунди), докато се обединят.',
    'Emulsion: Add the cold cream cheese to the butter mixture and beat briefly (about 30-60 seconds) until combined.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов маслен крем' AND recipe_role_id = 2),
    4,
    'Темпериране: Налейте охладения (но все още течен) шоколад на тънка струя в купата, докато миксерът работи на средна скорост. Разбийте до получаването на лъскав, гъст шоколадов крем.',
    'Темпериране: Налейте охладения (но все още течен) шоколад на тънка струя в купата, докато миксерът работи на средна скорост. Разбийте до получаването на лъскав, гъст шоколадов крем.',
    'Tempering: Pour the cooled (but still liquid) chocolate in a thin stream into the bowl while the mixer is running at medium speed. Beat until you achieve a shiny, thick chocolate cream.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов маслен крем' AND recipe_role_id = 2),
    5,
    'Стабилизация: Оставете крема в хладилник за 20-30 минути, за да стегне леко, преди да го поставите в пош за сглобяване на тортата.',
    'Стабилизация: Оставете крема в хладилник за 20-30 минути, за да стегне леко, преди да го поставите в пош за сглобяване на тортата.',
    'Stabilization: Leave the cream in the refrigerator for 20-30 minutes to slightly firm up before placing it in a piping bag for assembling the cake.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Руби' AND recipe_role_id = 2),
    1,
    'Подготовка на изварата: За да бъде кремът „Руби“ наистина изискан, изварата трябва да е абсолютно гладка. Блендирайте я с пасатор или я претрийте през сито, докато стане на фин крем.',
    'Подготовка на изварата: За да бъде кремът „Руби“ наистина изискан, изварата трябва да е абсолютно гладка. Блендирайте я с пасатор или я претрийте през сито, докато стане на фин крем.',
    'Preparation of the cottage cheese: To make the "Ruby" cream truly exquisite, the cottage cheese must be absolutely smooth. Blend it with an immersion blender or pass it through a sieve until it becomes a fine cream.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Руби' AND recipe_role_id = 2),
    2,
    'Разтопяване: Разтопете какаовото масло на водна баня. Оставете го да се охлади до хладко (30-32°C). Ако е горещо, ще пресече сметаната; ако е студено, ще стане на бучки.',
    'Разтопяване: Разтопете какаовото масло на водна баня. Оставете го да се охлади до хладко (30-32°C). Ако е горещо, ще пресече сметаната; ако е студено, ще стане на бучки.',
    'Melting: Melt the cocoa butter in a water bath. Allow it to cool to lukewarm (30-32°C). If it is hot, it will curdle the cream; if it is cold, it will clump.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Руби' AND recipe_role_id = 2),
    3,
    'Оцветяване и подслаждане: Към пасираната извара добавете еритритола и цвеклото на прах. Разбийте с миксер, докато цветът стане равномерен и наситено розов.',
    'Оцветяване и подслаждане: Към пасираната извара добавете еритритола и цвеклото на прах. Разбийте с миксер, докато цветът стане равномерен и наситено розов.',
    'Coloring and sweetening: Add the erythritol and beetroot powder to the blended cottage cheese. Whip with a mixer until the color becomes even and a rich pink.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Руби' AND recipe_role_id = 2),
    4,
    'Емулсия: Докато миксерът работи на ниска скорост, налейте хладкото какаово масло на тънка струя в изварата.',
    'Емулсия: Докато миксерът работи на ниска скорост, налейте хладкото какаово масло на тънка струя в изварата.',
    'Emulsion: While the mixer is running at low speed, pour the lukewarm cocoa butter in a thin stream into the cottage cheese.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Руби' AND recipe_role_id = 2),
    5,
    'Обем: В отделна купа разбийте студената сметана до „меки върхове“. Внимателно я добавете към розовата извара на 2-3 порции, като разбърквате с шпатула (на ръка), за да остане кремът въздушен.',
    'Обем: В отделна купа разбийте студената сметана до „меки върхове“. Внимателно я добавете към розовата извара на 2-3 порции, като разбърквате с шпатула (на ръка), за да остане кремът въздушен.',
    'Volume: In a separate bowl, whip the cold cream to "soft peaks." Gently add it to the pink cottage cheese in 2-3 portions, folding with a spatula (by hand) to keep the cream airy.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кето Крем Руби' AND recipe_role_id = 2),
    6,
    'Стабилизация: Поставете в пош и охладете за 1 час. Какаовото масло ще стегне и ще направи крема перфектен за измазване.',
    'Стабилизация: Поставете в пош и охладете за 1 час. Какаовото масло ще стегне и ще направи крема перфектен за измазване.',
    'Stabilization: Place in a piping bag and chill for 1 hour. The cocoa butter will set and make the cream perfect for spreading.'
  )
;

-- Total: 73 steps