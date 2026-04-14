-- ==========================================
-- ADD total_fiber, baking_pans, lab_notes TO base_recipes
-- Date: 2026-04-10
-- Purpose: Support fiber nutrition, baking pan config, and inline lab notes per recipe
-- ==========================================

ALTER TABLE base_recipes
  ADD COLUMN IF NOT EXISTS total_fiber NUMERIC(8,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS baking_pans JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS lab_notes JSONB DEFAULT NULL;

-- Comments
COMMENT ON COLUMN base_recipes.total_fiber IS 'Total dietary fiber in grams for the whole recipe';
COMMENT ON COLUMN base_recipes.baking_pans IS 'Recommended baking pan(s), e.g. {"diameter_cm": 18, "type": "round", "servings": 8}';
COMMENT ON COLUMN base_recipes.lab_notes IS 'Inline lab notes array, e.g. [{"note_bg": "...", "note_en": "...", "tip_type": "technique"}]';

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'base_recipes'
  AND column_name IN ('total_fiber', 'baking_pans', 'lab_notes')
ORDER BY column_name;
