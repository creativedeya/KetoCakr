-- ==========================================
-- CREATE LAB_NOTES TABLE
-- Date: 2026-03-31
-- Purpose: Store educational notes for recipes
-- ==========================================

CREATE TABLE IF NOT EXISTS lab_notes (
  id SERIAL PRIMARY KEY,
  recipe_id UUID REFERENCES base_recipes(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL, 
  -- Categories: technique, chef_trick, app_advice, troubleshooting, pairing, storage, ingredient
  
  title VARCHAR(255) NOT NULL,
  title_bg VARCHAR(255),
  
  content TEXT NOT NULL,
  content_bg TEXT,
  
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_lab_notes_recipe_id ON lab_notes(recipe_id);
CREATE INDEX idx_lab_notes_category ON lab_notes(category);
CREATE INDEX idx_lab_notes_active ON lab_notes(is_active);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_lab_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lab_notes_updated_at
BEFORE UPDATE ON lab_notes
FOR EACH ROW
EXECUTE FUNCTION update_lab_notes_updated_at();

-- Verify table created
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'lab_notes'
ORDER BY ordinal_position;

COMMENT ON TABLE lab_notes IS 'Educational notes and tips for recipes - AI-generated content';
COMMENT ON COLUMN lab_notes.category IS 'technique, chef_trick, app_advice, troubleshooting, pairing, storage, ingredient';
