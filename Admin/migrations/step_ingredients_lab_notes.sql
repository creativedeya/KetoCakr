-- Add step-level ingredients (JSONB) and lab notes to recipe_instruction_steps
-- Run once in Supabase SQL editor

ALTER TABLE recipe_instruction_steps
  ADD COLUMN IF NOT EXISTS step_ingredients JSONB        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS lab_notes_bg     TEXT         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS lab_notes_en     TEXT         DEFAULT NULL;

-- Comments
COMMENT ON COLUMN recipe_instruction_steps.step_ingredients IS
  'JSON array of {ingredient_id, ingredient_name, quantity, unit} used in this step';
COMMENT ON COLUMN recipe_instruction_steps.lab_notes_bg IS
  'Bulgarian tips, tricks, warnings for this step (shown in cooking mode)';
COMMENT ON COLUMN recipe_instruction_steps.lab_notes_en IS
  'English translation of lab notes';

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'recipe_instruction_steps'
ORDER BY ordinal_position;
