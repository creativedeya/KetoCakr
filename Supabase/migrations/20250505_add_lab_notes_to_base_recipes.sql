-- Add lab_notes column to base_recipes table
-- This is for internal development notes, not shown to users

ALTER TABLE base_recipes
ADD COLUMN lab_notes TEXT DEFAULT NULL;

COMMENT ON COLUMN base_recipes.lab_notes IS 'Internal development notes for the recipe - testing, variations, improvements';

-- Create index for faster searching (optional)
CREATE INDEX IF NOT EXISTS idx_base_recipes_lab_notes ON base_recipes USING GIN(to_tsvector('english', lab_notes));
