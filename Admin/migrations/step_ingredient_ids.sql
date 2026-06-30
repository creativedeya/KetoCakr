-- Add ingredient_ids (INTEGER[]) to recipe_instruction_steps
-- Links step to which recipe_ingredients are used in it
-- Run once in Supabase SQL editor

ALTER TABLE recipe_instruction_steps
  ADD COLUMN IF NOT EXISTS ingredient_ids INTEGER[] DEFAULT NULL;

COMMENT ON COLUMN recipe_instruction_steps.ingredient_ids IS
  'Array of recipe_ingredients.id values used in this specific step';

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'recipe_instruction_steps'
ORDER BY ordinal_position;
