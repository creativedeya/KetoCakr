-- Equipment category cleanup
-- Run in Supabase SQL editor

-- 1. Normalize case (lowercase + trim)
UPDATE equipment
SET category = LOWER(TRIM(category))
WHERE category IS DISTINCT FROM LOWER(TRIM(category));

-- 2. Fix NULL / empty categories
UPDATE equipment
SET category = 'other'
WHERE category IS NULL OR TRIM(category) = '';

-- 3. Add category_bg column (safe if already exists)
ALTER TABLE equipment
ADD COLUMN IF NOT EXISTS category_bg VARCHAR(100);

-- 4. Populate Bulgarian names
UPDATE equipment
SET category_bg = CASE
  WHEN category = 'cookware'   THEN 'Съдове'
  WHEN category = 'appliance'  THEN 'Уреди'
  WHEN category = 'tools'      THEN 'Инструменти'
  WHEN category = 'molds'      THEN 'Форми'
  WHEN category = 'utensils'   THEN 'Прибори'
  WHEN category = 'bakeware'   THEN 'Печене'
  WHEN category = 'pastry'     THEN 'Сладкарство'
  WHEN category = 'mixing'     THEN 'Смесване'
  WHEN category = 'measuring'  THEN 'Мерене'
  WHEN category = 'decorating' THEN 'Декориране'
  ELSE INITCAP(category)
END
WHERE category_bg IS NULL;

-- 5. Verify — should show one row per category with Bulgarian name
SELECT category, category_bg, COUNT(*) AS item_count
FROM equipment
GROUP BY category, category_bg
ORDER BY category;
