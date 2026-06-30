-- Add ingredients_used and equipment_needed arrays to recipe_instruction_steps
-- ingredients_used: array of UUID strings (from ingredients_database.id)
-- equipment_needed: array of integers (from equipment.id)

ALTER TABLE recipe_instruction_steps
ADD COLUMN IF NOT EXISTS ingredients_used TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS equipment_needed INTEGER[] DEFAULT '{}';

-- GIN indexes for fast array containment queries
CREATE INDEX IF NOT EXISTS idx_recipe_steps_ingredients ON recipe_instruction_steps USING GIN (ingredients_used);
CREATE INDEX IF NOT EXISTS idx_recipe_steps_equipment ON recipe_instruction_steps USING GIN (equipment_needed);
