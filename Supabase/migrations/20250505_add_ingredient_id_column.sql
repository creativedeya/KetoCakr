-- Add ingredient_id column to recipe_ingredients
-- This enables linking recipe ingredients to the ingredients_database for pricing and nutrition calculations

ALTER TABLE recipe_ingredients
ADD COLUMN ingredient_id UUID REFERENCES ingredients_database(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);

-- Drop the old unique constraint if it exists and recreate it to allow NULLs
-- (This allows ingredients that don't exist in the database yet)
ALTER TABLE recipe_ingredients
DROP CONSTRAINT IF EXISTS recipe_ingredients_recipe_id_ingredient_name_key;

-- Backfill: Try to match existing ingredients with the database
UPDATE recipe_ingredients ri
SET ingredient_id = id.id
FROM ingredients_database id
WHERE LOWER(TRIM(ri.ingredient_name)) = LOWER(TRIM(id.name_bg))
  AND ri.ingredient_id IS NULL;

-- Also try to match with English names
UPDATE recipe_ingredients ri
SET ingredient_id = id.id
FROM ingredients_database id
WHERE LOWER(TRIM(ri.ingredient_name)) = LOWER(TRIM(id.name_en))
  AND ri.ingredient_id IS NULL;

COMMENT ON COLUMN recipe_ingredients.ingredient_id IS 'Foreign key to ingredients_database for pricing and nutritional data';
