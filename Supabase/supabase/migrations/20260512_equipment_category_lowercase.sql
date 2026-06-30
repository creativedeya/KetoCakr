-- Standardize equipment categories to lowercase
-- Merges 'Cookware' and 'cookware' -> 'cookware', 'Accessory' -> 'accessory'
UPDATE equipment
SET category = LOWER(category)
WHERE category IS NOT NULL AND category != LOWER(category);

-- Verify: should return 8 rows, all lowercase
-- SELECT DISTINCT category, COUNT(*) as count
-- FROM equipment
-- GROUP BY category
-- ORDER BY category;
