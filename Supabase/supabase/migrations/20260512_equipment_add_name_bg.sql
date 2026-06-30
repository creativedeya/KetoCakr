-- Add Bulgarian name column to equipment table
ALTER TABLE equipment
ADD COLUMN IF NOT EXISTS name_bg VARCHAR(255);

-- Appliances
UPDATE equipment SET name_bg = 'Ръчен миксер'         WHERE name_en ILIKE '%hand mixer%'       OR name ILIKE '%hand mixer%';
UPDATE equipment SET name_bg = 'Планетарен миксер'     WHERE name_en ILIKE '%stand mixer%'       OR name ILIKE '%stand mixer%';
UPDATE equipment SET name_bg = 'Пръчков блендер'       WHERE name_en ILIKE '%immersion blender%' OR name ILIKE '%immersion blender%';
UPDATE equipment SET name_bg = 'Кухненски робот'       WHERE name_en ILIKE '%food processor%'    OR name ILIKE '%food processor%';
UPDATE equipment SET name_bg = 'Блендер'               WHERE name_en ILIKE '%blender%'           AND name_bg IS NULL;

-- Pans
UPDATE equipment SET name_bg = 'Тава за печене'        WHERE name_en ILIKE '%baking sheet%'      OR name ILIKE '%baking sheet%';
UPDATE equipment SET name_bg = 'Форма за торта 18 см'  WHERE name_en ILIKE '%cake pan 18%'       OR name ILIKE '%cake pan 18%';
UPDATE equipment SET name_bg = 'Форма с подвижни страни' WHERE name_en ILIKE '%springform%'      OR name ILIKE '%springform%';
UPDATE equipment SET name_bg = 'Силиконова форма'      WHERE name_en ILIKE '%silicone mold%'     OR name ILIKE '%silicone mold%';
UPDATE equipment SET name_bg = 'Форма за кекс'         WHERE name_en ILIKE '%loaf pan%'          OR name ILIKE '%loaf pan%';

-- Containers
UPDATE equipment SET name_bg = 'Купа за смесване'      WHERE name_en ILIKE '%mixing bowl%'       OR name ILIKE '%mixing bowl%';
UPDATE equipment SET name_bg = 'Мерителна чаша'        WHERE name_en ILIKE '%measuring cup%'     OR name ILIKE '%measuring cup%';
UPDATE equipment SET name_bg = 'Мерителни лъжици'      WHERE name_en ILIKE '%measuring spoon%'   OR name ILIKE '%measuring spoon%';
UPDATE equipment SET name_bg = 'Кана'                  WHERE name_en ILIKE '%pitcher%'           OR name ILIKE '%pitcher%';
UPDATE equipment SET name_bg = 'Тенджера'              WHERE name_en ILIKE '%pot%'               AND name_bg IS NULL;

-- Cookware
UPDATE equipment SET name_bg = 'Тенджерка'             WHERE name_en ILIKE '%saucepan%'          OR name ILIKE '%saucepan%';
UPDATE equipment SET name_bg = 'Водна баня'            WHERE name_en ILIKE '%double boiler%'     OR name ILIKE '%double boiler%';
UPDATE equipment SET name_bg = 'Тиган'                 WHERE name_en ILIKE '%frying pan%'        OR name_en ILIKE '%skillet%';

-- Tools
UPDATE equipment SET name_bg = 'Бъркалка'              WHERE name_en ILIKE '%balloon whisk%'     OR name ILIKE '%balloon whisk%';
UPDATE equipment SET name_bg = 'Бъркалка'              WHERE name_en ILIKE '%whisk%'             AND name_bg IS NULL;
UPDATE equipment SET name_bg = 'Шпатула'               WHERE name_en ILIKE '%silicone spatula%'  OR name_en ILIKE '%rubber spatula%';
UPDATE equipment SET name_bg = 'Шпатула'               WHERE name_en ILIKE '%spatula%'           AND name_bg IS NULL;
UPDATE equipment SET name_bg = 'Ъглова шпатула'        WHERE name_en ILIKE '%offset spatula%'    OR name ILIKE '%offset spatula%';
UPDATE equipment SET name_bg = 'Шпатула за маса'       WHERE name_en ILIKE '%bench scraper%'     OR name ILIKE '%bench scraper%';
UPDATE equipment SET name_bg = 'Четка за сладкиши'     WHERE name_en ILIKE '%pastry brush%'      OR name ILIKE '%pastry brush%';
UPDATE equipment SET name_bg = 'Фино сито'             WHERE name_en ILIKE '%sieve%'             OR name_en ILIKE '%sifter%';
UPDATE equipment SET name_bg = 'Кухненска везна'       WHERE name_en ILIKE '%scale%'             OR name ILIKE '%scale%';
UPDATE equipment SET name_bg = 'Кухненски термометър'  WHERE name_en ILIKE '%thermometer%'       OR name ILIKE '%thermometer%';
UPDATE equipment SET name_bg = 'Точилка'               WHERE name_en ILIKE '%rolling pin%'       OR name ILIKE '%rolling pin%';
UPDATE equipment SET name_bg = 'Игла за тесто'         WHERE name_en ILIKE '%cake tester%'       OR name_en ILIKE '%skewer%';
UPDATE equipment SET name_bg = 'Скрепер'               WHERE name_en ILIKE '%scraper%'           AND name_bg IS NULL;

-- Consumables
UPDATE equipment SET name_bg = 'Сладкарски плик'       WHERE name_en ILIKE '%piping bag%'        OR name ILIKE '%piping bag%';
UPDATE equipment SET name_bg = 'Хартия за печене'      WHERE name_en ILIKE '%parchment%'         OR name_en ILIKE '%baking paper%';
UPDATE equipment SET name_bg = 'Ацетатна лента'        WHERE name_en ILIKE '%acetate%'           OR name_en ILIKE '%cake collar%';

-- Accessories
UPDATE equipment SET name_bg = 'Въртяща плоча'         WHERE name_en ILIKE '%turntable%'         OR name ILIKE '%turntable%';
UPDATE equipment SET name_bg = 'Накрайници за пош'     WHERE name_en ILIKE '%piping tip%'        OR name_en ILIKE '%nozzle%';

-- Verify results (uncomment to check):
-- SELECT id, name, name_en, name_bg, category FROM equipment ORDER BY category, name;
-- SELECT COUNT(*) FILTER (WHERE name_bg IS NULL), COUNT(*) FROM equipment;
