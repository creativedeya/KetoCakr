-- ============================================================
-- File: 42_INSERT_DECORATION_STEPS_BILINGUAL.sql
-- Project: KetoCakR | Date: 2026-04-07
-- ============================================================

INSERT INTO recipe_instruction_steps (
  recipe_id, step_number,
  step_description, step_description_bg, step_description_en
)
VALUES
  (
    (SELECT id FROM base_recipes WHERE name = 'Горски венец' AND recipe_role_id = 4),
    1,
    'Започнете с ягодите. Поставете разрязаните половинки ягоди в кръг по външния ръб на тортата, като оставяте малко разстояние между тях. Поставяйте ги с разреза нагоре за по-ярък цвят.',
    'Започнете с ягодите. Поставете разрязаните половинки ягоди в кръг по външния ръб на тортата, като оставяте малко разстояние между тях. Поставяйте ги с разреза нагоре за по-ярък цвят.',
    'Start with the strawberries. Place the halved strawberries in a circle along the outer edge of the cake, leaving a little space between them. Position them cut side up for a brighter color.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Горски венец' AND recipe_role_id = 4),
    2,
    'В пространствата между ягодите подредете боровинките и малините. Редувайте ги по 2 или 3, за да създадете ритъм и разнообразие в цветовете.',
    'В пространствата между ягодите подредете боровинките и малините. Редувайте ги по 2 или 3, за да създадете ритъм и разнообразие в цветовете.',
    'In the spaces between the strawberries, arrange the blueberries and raspberries. Alternate them in groups of 2 or 3 to create rhythm and variety in colors.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Горски венец' AND recipe_role_id = 4),
    3,
    'Ако тортата ще се транспортира, сложете по една малка капка от крема (маскарпонето) под всеки плод, за да го "залепите" за основата.',
    'Ако тортата ще се транспортира, сложете по една малка капка от крема (маскарпонето) под всеки плод, за да го "залепите" за основата.',
    'If the cake will be transported, place a small drop of cream (mascarpone) under each fruit to "stick" it to the base.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Горски венец' AND recipe_role_id = 4),
    4,
    'Поставете 4-5 малки листенца прясна мента на стратегически места между плодовете. Те придават контраст на червените и сините цветове.',
    'Поставете 4-5 малки листенца прясна мента на стратегически места между плодовете. Те придават контраст на червените и сините цветове.',
    'Place 4-5 small leaves of fresh mint at strategic spots between the fruits. They provide contrast to the red and blue colors.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Горски венец' AND recipe_role_id = 4),
    5,
    'Оставете центъра на тортата празен и чист. Това фокусира вниманието върху богатия плодов венец и подчертава минималистичния стил.',
    'Оставете центъра на тортата празен и чист. Това фокусира вниманието върху богатия плодов венец и подчертава минималистичния стил.',
    'Leave the center of the cake empty and clean. This focuses attention on the rich fruit wreath and emphasizes the minimalist style.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кралски Сахер' AND recipe_role_id = 4),
    1,
    'Поставете добре охладената торта върху решетка, под която има тава. Излейте ганаша в центъра и с една бърза и уверена манипулация на палетата го разнесете към ръбовете, за да облее страните равномерно. Важно: Не минавайте два пъти с палетата върху горната част, за да не развалите огледалния ефект.',
    'Поставете добре охладената торта върху решетка, под която има тава. Излейте ганаша в центъра и с една бърза и уверена манипулация на палетата го разнесете към ръбовете, за да облее страните равномерно. Важно: Не минавайте два пъти с палетата върху горната част, за да не развалите огледалния ефект.',
    'Place the well-chilled cake on a rack with a tray underneath. Pour the ganache in the center and with a quick and confident motion of the spatula, spread it towards the edges to coat the sides evenly. Important: Do not go over the top with the spatula twice to avoid ruining the mirror effect.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кралски Сахер' AND recipe_role_id = 4),
    2,
    'Приберете тортата в хладилник за поне 30-40 минути, за да стегне глазурата напълно, преди да пишете.',
    'Приберете тортата в хладилник за поне 30-40 минути, за да стегне глазурата напълно, преди да пишете.',
    'Refrigerate the cake for at least 30-40 minutes to allow the glaze to set completely before writing.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кралски Сахер' AND recipe_role_id = 4),
    3,
    'Преди да пишете върху тортата, тествайте върху чиния. Надписът „Sacher“ трябва да е с ръкописен, елегантен шрифт. Пишете с равномерно притискане на поша, без да го допирате до повърхността на тортата (нека шоколадът пада като тънка нишка).',
    'Преди да пишете върху тортата, тествайте върху чиния. Надписът „Sacher“ трябва да е с ръкописен, елегантен шрифт. Пишете с равномерно притискане на поша, без да го допирате до повърхността на тортата (нека шоколадът пада като тънка нишка).',
    'Before writing on the cake, test on a plate. The inscription "Sacher" should be in a handwritten, elegant font. Write with even pressure on the piping bag, without touching the surface of the cake (let the chocolate fall like a thin thread).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кралски Сахер' AND recipe_role_id = 4),
    4,
    'Оставете надписа да стегне на стайна температура или за кратко в хладилник.',
    'Оставете надписа да стегне на стайна температура или за кратко в хладилник.',
    'Allow the inscription to set at room temperature or briefly in the refrigerator.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Хрупкав Орех' AND recipe_role_id = 4),
    1,
    'Вземи шепа от орехите. Наклони леко тортата (или я остави върху подложка) и с нежно притискане на дланта нанеси ядките по стените на тортата, като започнеш отдолу нагоре. Под тортата постави тава, за да събереш излишните ядки, които падат.',
    'Вземи шепа от орехите. Наклони леко тортата (или я остави върху подложка) и с нежно притискане на дланта нанеси ядките по стените на тортата, като започнеш отдолу нагоре. Под тортата постави тава, за да събереш излишните ядки, които падат.',
    'Take a handful of the walnuts. Slightly tilt the cake (or leave it on a board) and gently press with your palm to apply the nuts to the sides of the cake, starting from the bottom and moving upwards. Place a tray under the cake to catch any excess nuts that fall.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Хрупкав Орех' AND recipe_role_id = 4),
    2,
    'Изсипи останалата част от орехите в центъра на тортата. С помощта на палета или гърба на лъжица ги разнеси равномерно до самия ръб.',
    'Изсипи останалата част от орехите в центъра на тортата. С помощта на палета или гърба на лъжица ги разнеси равномерно до самия ръб.',
    'Pour the remaining walnuts into the center of the cake. Using a spatula or the back of a spoon, spread them evenly to the very edge.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Хрупкав Орех' AND recipe_role_id = 4),
    3,
    'Притисни съвсем леко с длан върха на тортата, за да се "впият" ядките в крема и да не падат при рязане.',
    'Притисни съвсем леко с длан върха на тортата, за да се "впият" ядките в крема и да не падат при рязане.',
    'Gently press the top of the cake with your palm to "embed" the nuts into the cream so they don’t fall off when cutting.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Хрупкав Орех' AND recipe_role_id = 4),
    4,
    'С четка или чиста кърпа почисти подложката на тортата от падналите парченца за професионален вид.',
    'С четка или чиста кърпа почисти подложката на тортата от падналите парченца за професионален вид.',
    'Use a brush or a clean cloth to wipe the cake board clean of any fallen pieces for a professional appearance.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Класически Гараш' AND recipe_role_id = 4),
    1,
    'Покрий тортата с кето ганаша, като оставиш повърхността идеално гладка. Изчакай 5-10 минути на стайна температура, за да не е твърде течен шоколадът.',
    'Покрий тортата с кето ганаша, като оставиш повърхността идеално гладка. Изчакай 5-10 минути на стайна температура, за да не е твърде течен шоколадът.',
    'Cover the cake with keto ganache, leaving the surface perfectly smooth. Wait 5-10 minutes at room temperature so that the chocolate is not too runny.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Класически Гараш' AND recipe_role_id = 4),
    2,
    'Вземи малка лъжичка или действай внимателно с пръсти. Започни да посипваш натрошения шамфъстък в тесен кръг (около 1.5 – 2 см ширина) по самия външен ръб на тортата.',
    'Вземи малка лъжичка или действай внимателно с пръсти. Започни да посипваш натрошения шамфъстък в тесен кръг (около 1.5 – 2 см ширина) по самия външен ръб на тортата.',
    'Take a small spoon or act carefully with your fingers. Start sprinkling the crushed pistachios in a narrow circle (about 1.5 – 2 cm wide) along the very outer edge of the cake.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Класически Гараш' AND recipe_role_id = 4),
    3,
    'За да получиш перфектно равен кръг от вътрешната страна, можеш да поставиш чиния или ринг с диаметър 14-15 см в центъра на тортата и да посипваш ядките около него. След това внимателно вдигни ринга.',
    'За да получиш перфектно равен кръг от вътрешната страна, можеш да поставиш чиния или ринг с диаметър 14-15 см в центъра на тортата и да посипваш ядките около него. След това внимателно вдигни ринга.',
    'To achieve a perfectly even circle from the inside, you can place a plate or ring with a diameter of 14-15 cm in the center of the cake and sprinkle the nuts around it. Then carefully lift the ring.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Класически Гараш' AND recipe_role_id = 4),
    4,
    'Притисни съвсем леко ядките към шоколада, за да се фиксират. Остави тортата да стегне в хладилник.',
    'Притисни съвсем леко ядките към шоколада, за да се фиксират. Остави тортата да стегне в хладилник.',
    'Gently press the nuts against the chocolate to secure them. Leave the cake to set in the refrigerator.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бадемов облак' AND recipe_role_id = 4),
    1,
    'С гърба на лъжица направи леко спираловидно движение в центъра на тортата (както се вижда на снимката), за да създадеш визуален център.',
    'С гърба на лъжица направи леко спираловидно движение в центъра на тортата (както се вижда на снимката), за да създадеш визуален център.',
    'With the back of a spoon, make a slight swirling motion in the center of the cake (as seen in the picture) to create a visual center.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бадемов облак' AND recipe_role_id = 4),
    2,
    'Вземи шепа бадеми и ги посипвай внимателно в широк кръг по външния ръб. Не се старай да бъде перфектно подредено – чарът на този дизайн е в неговата "органична" разхвърляност.',
    'Вземи шепа бадеми и ги посипвай внимателно в широк кръг по външния ръб. Не се старай да бъде перфектно подредено – чарът на този дизайн е в неговата "органична" разхвърляност.',
    'Take a handful of almonds and carefully sprinkle them in a wide circle along the outer edge. Don’t strive for perfect arrangement – the charm of this design lies in its "organic" messiness.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бадемов облак' AND recipe_role_id = 4),
    3,
    'Постави повече бадеми в най-външната част и нека те плавно "изтъняват" към центъра на тортата.',
    'Постави повече бадеми в най-външната част и нека те плавно "изтъняват" към центъра на тортата.',
    'Place more almonds on the outermost part and let them gradually "thin out" towards the center of the cake.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Бадемов облак' AND recipe_role_id = 4),
    4,
    'Можеш съвсем леко да притиснеш с пръсти по-едрите люспи, за да си сигурен, че няма да изпадат при местене на тортата.',
    'Можеш съвсем леко да притиснеш с пръсти по-едрите люспи, за да си сигурен, че няма да изпадат при местене на тортата.',
    'You can gently press the larger flakes with your fingers to ensure they won’t fall off when moving the cake.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Черна гора' AND recipe_role_id = 4),
    1,
    'Поръси обилно центъра на тортата с шоколадовите стърготини. Трябва да покриеш около 12–14 см от диаметъра, като оставиш чист бордюр по края за розетите.',
    'Поръси обилно центъра на тортата с шоколадовите стърготини. Трябва да покриеш около 12–14 см от диаметъра, като оставиш чист бордюр по края за розетите.',
    'Generously sprinkle the center of the cake with chocolate shavings. You should cover about 12–14 cm of the diameter, leaving a clean border around the edge for the rosettes.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Черна гора' AND recipe_role_id = 4),
    2,
    'Шприцовай 12 симетрични розети по външния ръб на тортата. Важно е да са еднакви по размер и височина. За 18 см торта 12 розети осигуряват по една за всяко парче (ако се реже на 8, пак изглежда богато).',
    'Шприцовай 12 симетрични розети по външния ръб на тортата. Важно е да са еднакви по размер и височина. За 18 см торта 12 розети осигуряват по една за всяко парче (ако се реже на 8, пак изглежда богато).',
    'Pipe 12 symmetrical rosettes along the outer edge of the cake. It is important that they are the same size and height. For an 18 cm cake, 12 rosettes provide one for each piece (if cut into 8, it still looks abundant).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Черна гора' AND recipe_role_id = 4),
    3,
    'Постави по една череша върху всяка розета. Натисни съвсем леко, за да потъне плодът в крема и да стои стабилно.',
    'Постави по една череша върху всяка розета. Натисни съвсем леко, за да потъне плодът в крема и да стои стабилно.',
    'Place one cherry on each rosette. Press very lightly so that the fruit sinks into the cream and stays stable.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Черна гора' AND recipe_role_id = 4),
    4,
    'Поръси съвсем малко от останалия шоколад върху самите розети за завършен контраст.',
    'Поръси съвсем малко от останалия шоколад върху самите розети за завършен контраст.',
    'Sprinkle just a little of the remaining chocolate over the rosettes for a finishing contrast.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов дует' AND recipe_role_id = 4),
    1,
    'Първо декорирайте страните на тортата. Вземете малко количество от шоколадовия микс с длан и внимателно го притиснете към стените, като работите отдолу нагоре.',
    'Първо декорирайте страните на тортата. Вземете малко количество от шоколадовия микс с длан и внимателно го притиснете към стените, като работите отдолу нагоре.',
    'First, decorate the sides of the cake. Take a small amount of the chocolate mix in your palm and gently press it against the walls, working from the bottom up.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов дует' AND recipe_role_id = 4),
    2,
    'Изсипете щедро количество от микса в центъра на тортата. С помощта на сладкарска пинсета или много внимателно с пръсти, разнесете шоколада към краищата, докато покриете цялата горна повърхност.',
    'Изсипете щедро количество от микса в центъра на тортата. С помощта на сладкарска пинсета или много внимателно с пръсти, разнесете шоколада към краищата, докато покриете цялата горна повърхност.',
    'Pour a generous amount of the mix in the center of the cake. Using a pastry tweezers or very carefully with your fingers, spread the chocolate towards the edges until you cover the entire top surface.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов дует' AND recipe_role_id = 4),
    3,
    'Не заглаждайте шоколада! Оставете го да стои хаотично и "рошаво" – това придава на тортата занаятчийски и богат вид.',
    'Не заглаждайте шоколада! Оставете го да стои хаотично и "рошаво" – това придава на тортата занаятчийски и богат вид.',
    'Do not smooth the chocolate! Leave it to stand in a chaotic and "fluffy" manner – this gives the cake a handcrafted and rich appearance.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Шоколадов дует' AND recipe_role_id = 4),
    4,
    'Отстранете падналите стружки от подложката на тортата с чиста четка.',
    'Отстранете падналите стружки от подложката на тортата с чиста четка.',
    'Remove any fallen shavings from the cake board with a clean brush.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Цъфтяща нощ' AND recipe_role_id = 4),
    1,
    'Излей ганаша върху тортата. Докато е още мек, постави палетата или лъжицата в самия център. Започни да въртиш тортата (ако имаш въртяща се стойка е най-лесно), като бавно движиш палетата към външния ръб. Това ще създаде този релефен „улей“.',
    'Излей ганаша върху тортата. Докато е още мек, постави палетата или лъжицата в самия център. Започни да въртиш тортата (ако имаш въртяща се стойка е най-лесно), като бавно движиш палетата към външния ръб. Това ще създаде този релефен „улей“.',
    'Pour the ganache over the cake. While it is still soft, place the spatula or spoon in the very center. Start rotating the cake (if you have a rotating stand, it''s easiest), while slowly moving the spatula towards the outer edge. This will create the textured "groove."'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Цъфтяща нощ' AND recipe_role_id = 4),
    2,
    'За разлика от венеца, тук цветята са подредени по-гъсто само в едната половина на тортата (асиметрично). Започни от най-едрите цветя и ги подреди в дъга по релефа на спиралата.',
    'За разлика от венеца, тук цветята са подредени по-гъсто само в едната половина на тортата (асиметрично). Започни от най-едрите цветя и ги подреди в дъга по релефа на спиралата.',
    'Unlike the wreath, here the flowers are arranged more densely only on one half of the cake (asymmetrically). Start with the largest flowers and arrange them in an arc along the texture of the spiral.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Цъфтяща нощ' AND recipe_role_id = 4),
    3,
    'Запълни празните пространства с по-малки цветчета и листенца мента. Целта е да изглежда като естествено разцъфнала градина.',
    'Запълни празните пространства с по-малки цветчета и листенца мента. Целта е да изглежда като естествено разцъфнала градина.',
    'Fill the empty spaces with smaller flowers and mint leaves. The goal is to make it look like a naturally bloomed garden.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Цъфтяща нощ' AND recipe_role_id = 4),
    4,
    'Постави 1-2 венчелистчета извън основната група, за да създадеш усещане за движение (сякаш са паднали току-що).',
    'Постави 1-2 венчелистчета извън основната група, за да създадеш усещане за движение (сякаш са паднали току-що).',
    'Place 1-2 petals outside the main group to create a sense of movement (as if they have just fallen).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Натурална дъга' AND recipe_role_id = 4),
    1,
    'Вземи малко количество жълт крем на върха на малка палета или обла чаена лъжичка. Постави „точка“ крем в горния ляв край и с лек натиск и изтегляне по посока на часовниковата стрелка създай първата „люспа“. Повтори, докато направиш външния жълт полукръг.',
    'Вземи малко количество жълт крем на върха на малка палета или обла чаена лъжичка. Постави „точка“ крем в горния ляв край и с лек натиск и изтегляне по посока на часовниковата стрелка създай първата „люспа“. Повтори, докато направиш външния жълт полукръг.',
    'Take a small amount of yellow cream on the tip of a small spatula or rounded teaspoon. Place a "dot" of cream in the upper left corner and with light pressure and a pull in a clockwise direction, create the first "scale." Repeat until you make the outer yellow semicircle.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Натурална дъга' AND recipe_role_id = 4),
    2,
    'Повтори същото движение с червения крем точно под жълтия, като застъпваш леко краищата на горния слой.',
    'Повтори същото движение с червения крем точно под жълтия, като застъпваш леко краищата на горния слой.',
    'Repeat the same motion with the red cream just below the yellow, slightly overlapping the edges of the upper layer.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Натурална дъга' AND recipe_role_id = 4),
    3,
    'Завърши с вътрешния син кръг. Трябва да се получи ефект на ветрило или пера.',
    'Завърши с вътрешния син кръг. Трябва да се получи ефект на ветрило или пера.',
    'Finish with the inner blue circle. It should create a fan or feather effect.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Натурална дъга' AND recipe_role_id = 4),
    4,
    'С помощта на клечка за зъби или тънък пош постави малки червени точки (като капчици роса) върху синята част, за да придадеш дълбочина и динамика на дизайна.',
    'С помощта на клечка за зъби или тънък пош постави малки червени точки (като капчици роса) върху синята част, за да придадеш дълбочина и динамика на дизайна.',
    'Using a toothpick or thin piping bag, place small red dots (like drops of dew) on the blue part to add depth and dynamics to the design.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Празнични балони' AND recipe_role_id = 4),
    1,
    'Използвай малък сладкарски пош с обла дюза (диаметър 1-2 мм). Напиши текста в лявата половина на тортата. Съвет: Ако потребителят се притеснява, може първо да изпише буквите с клечка за зъби и после да мине отгоре с крема.',
    'Използвай малък сладкарски пош с обла дюза (диаметър 1-2 мм). Напиши текста в лявата половина на тортата. Съвет: Ако потребителят се притеснява, може първо да изпише буквите с клечка за зъби и после да мине отгоре с крема.',
    'Use a small piping bag with a round tip (diameter 1-2 mm). Write the text on the left half of the cake. Tip: If the user is concerned, they can first outline the letters with a toothpick and then go over them with the cream.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Празнични балони' AND recipe_role_id = 4),
    2,
    'Шприцовай малки „топки“ крем в дясната част. С гърба на малка лъжичка или палета разнеси крема в кръгово движение, за да оформиш балона (техниката, подобна на предишната торта, но в затворен кръг).',
    'Шприцовай малки „топки“ крем в дясната част. С гърба на малка лъжичка или палета разнеси крема в кръгово движение, за да оформиш балона (техниката, подобна на предишната торта, но в затворен кръг).',
    'Pipe small "balls" of cream on the right side. With the back of a small spoon or spatula, spread the cream in a circular motion to shape the balloon (the technique is similar to the previous cake, but in a closed circle).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Празнични балони' AND recipe_role_id = 4),
    3,
    'С най-тънкия накрайник (или просто срязано пликче) нарисувай нежните нишки (връзките) на балоните, които се събират в една точка долу.',
    'С най-тънкия накрайник (или просто срязано пликче) нарисувай нежните нишки (връзките) на балоните, които се събират в една точка долу.',
    'With the thinnest tip (or simply a cut bag), draw the delicate strings (ties) of the balloons that converge at one point below.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Празнични балони' AND recipe_role_id = 4),
    4,
    'Постави съвсем малка бяла чертичка или точка върху всеки балон, за да изглежда обемен.',
    'Постави съвсем малка бяла чертичка или точка върху всеки балон, за да изглежда обемен.',
    'Place a very small white line or dot on each balloon to make it look three-dimensional.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кадифени трохи' AND recipe_role_id = 4),
    1,
    'Измажете тортата с последния слой бял крем. Горната част трябва да е идеално равна, но не е нужно страните да са перфектни, ако планирате да слагате трохи и там.',
    'Измажете тортата с последния слой бял крем. Горната част трябва да е идеално равна, но не е нужно страните да са перфектни, ако планирате да слагате трохи и там.',
    'Coat the cake with the final layer of white cream. The top should be perfectly flat, but the sides do not need to be perfect if you plan to add crumbs there as well.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кадифени трохи' AND recipe_role_id = 4),
    2,
    'Поставете ринг (от форма за печене) или чиния с малко по-малък диаметър (около 15-16 см) върху тортата, ако искате да оставите чист бял бордюр по края. Ако искате целия връх да е червен (като на снимката), преминете към следващата стъпка.',
    'Поставете ринг (от форма за печене) или чиния с малко по-малък диаметър (около 15-16 см) върху тортата, ако искате да оставите чист бял бордюр по края. Ако искате целия връх да е червен (като на снимката), преминете към следващата стъпка.',
    'Place a ring (from a baking pan) or a plate with a slightly smaller diameter (about 15-16 cm) on top of the cake if you want to leave a clean white border around the edge. If you want the entire top to be red (like in the picture), proceed to the next step.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кадифени трохи' AND recipe_role_id = 4),
    3,
    'Започнете да посипвате трохите от центъра към краищата. Използвайте лъжица или просто ги разпръснете с пръсти, за да създадете „пухкав“ ефект. Не ги притискайте, за да не загубят обема си.',
    'Започнете да посипвате трохите от центъра към краищата. Използвайте лъжица или просто ги разпръснете с пръсти, за да създадете „пухкав“ ефект. Не ги притискайте, за да не загубят обема си.',
    'Start sprinkling the crumbs from the center towards the edges. Use a spoon or simply scatter them with your fingers to create a "fluffy" effect. Do not press them down, so they do not lose their volume.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кадифени трохи' AND recipe_role_id = 4),
    4,
    'Одухайте леко излишните трохи, които са паднали по чистия бял бордюр (ако има такъв), или ги оставете да падат небрежно по страните за по-рустикален вид.',
    'Одухайте леко излишните трохи, които са паднали по чистия бял бордюр (ако има такъв), или ги оставете да падат небрежно по страните за по-рустикален вид.',
    'Gently blow away any excess crumbs that have fallen on the clean white border (if there is one), or let them fall casually on the sides for a more rustic look.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Кадифени трохи с Кармин' AND recipe_role_id = 4),
    1,
    'Изпълни декорацията Кадифени трохи с Кармин според описанието.',
    'Изпълни декорацията Кадифени трохи с Кармин според описанието.',
    'Execute the Velvet Crumbs Carmine decoration according to the description.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Снежни розети' AND recipe_role_id = 4),
    1,
    'Измажете тортата с тънък слой от същия крем (т.нар. crumb coat), за да запечатате трохите и да създадете равен бял фон.',
    'Измажете тортата с тънък слой от същия крем (т.нар. crumb coat), за да запечатате трохите и да създадете равен бял фон.',
    'Coat the cake with a thin layer of the same cream (the so-called crumb coat) to seal in the crumbs and create an even white background.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Снежни розети' AND recipe_role_id = 4),
    2,
    'За да са симетрични розетите (на снимката са 12 броя), леко маркирайте местата им с клечка за зъби (като циферблат на часовник – 12, 6, 3, 9 часа и след това помежду им).',
    'За да са симетрични розетите (на снимката са 12 броя), леко маркирайте местата им с клечка за зъби (като циферблат на часовник – 12, 6, 3, 9 часа и след това помежду им).',
    'To make the rosettes symmetrical (there are 12 in the picture), lightly mark their positions with a toothpick (like a clock face – 12, 6, 3, 9 o''clock and then in between).'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Снежни розети' AND recipe_role_id = 4),
    3,
    'Дръжте поша перпендикулярно на тортата. Започнете от центъра на бъдещата розета, шприцовайте малко крем и с плавно кръгово движение изтеглете навън и нагоре, за да „затворите“ розетата.',
    'Дръжте поша перпендикулярно на тортата. Започнете от центъра на бъдещата розета, шприцовайте малко крем и с плавно кръгово движение изтеглете навън и нагоре, за да „затворите“ розетата.',
    'Hold the piping bag perpendicular to the cake. Start from the center of the future rosette, pipe a little cream, and with a smooth circular motion pull outward and upward to "close" the rosette.'
  ),
  (
    (SELECT id FROM base_recipes WHERE name = 'Снежни розети' AND recipe_role_id = 4),
    4,
    'Поръсете основата на тортата или празното пространство в центъра с малко кокосови стърготини или еритритол на прах за „скрежен“ ефект.',
    'Поръсете основата на тортата или празното пространство в центъра с малко кокосови стърготини или еритритол на прах за „скрежен“ ефект.',
    'Sprinkle the base of the cake or the empty space in the center with a little shredded coconut or powdered erythritol for a "frosted" effect.'
  )
;

-- Total: 50 steps