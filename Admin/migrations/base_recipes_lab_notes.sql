-- Add recipe-level lab notes and source notes to base_recipes
-- Run once in Supabase SQL editor

ALTER TABLE base_recipes
  ADD COLUMN IF NOT EXISTS lab_notes_bg  TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS lab_notes_en  TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS source_notes  TEXT DEFAULT NULL;

COMMENT ON COLUMN base_recipes.lab_notes_bg IS
  'Recipe-level tips, observations, warnings in Bulgarian (shown in recipe info)';
COMMENT ON COLUMN base_recipes.lab_notes_en IS
  'Recipe-level tips, observations, warnings in English';
COMMENT ON COLUMN base_recipes.source_notes IS
  'Attribution/notes if recipe is adapted from a source';

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'base_recipes'
  AND column_name IN ('lab_notes_bg', 'lab_notes_en', 'source_notes')
ORDER BY ordinal_position;
