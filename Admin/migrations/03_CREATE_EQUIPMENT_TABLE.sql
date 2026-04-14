-- ==========================================
-- CREATE RECIPE_EQUIPMENT TABLE
-- Date: 2026-03-31
-- Purpose: Store structured equipment data for recipes
-- ==========================================

CREATE TABLE IF NOT EXISTS recipe_equipment (
  id SERIAL PRIMARY KEY,
  recipe_id UUID REFERENCES base_recipes(id) ON DELETE CASCADE,
  
  item VARCHAR(100) NOT NULL,
  item_bg VARCHAR(100) NOT NULL,
  
  quantity INTEGER DEFAULT 1,
  reusable BOOLEAN DEFAULT true,
  
  size VARCHAR(50), -- small, medium, large, or specific measurements
  specs VARCHAR(255), -- e.g., "18cm diameter", "min. 82% fat"
  
  essential BOOLEAN DEFAULT true,
  notes TEXT,
  
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_recipe_equipment_recipe_id ON recipe_equipment(recipe_id);
CREATE INDEX idx_recipe_equipment_essential ON recipe_equipment(essential);
CREATE INDEX idx_recipe_equipment_reusable ON recipe_equipment(reusable);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_recipe_equipment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recipe_equipment_updated_at
BEFORE UPDATE ON recipe_equipment
FOR EACH ROW
EXECUTE FUNCTION update_recipe_equipment_updated_at();

-- Verify table created
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'recipe_equipment'
ORDER BY ordinal_position;

COMMENT ON TABLE recipe_equipment IS 'Equipment and tools needed for recipes with bilingual support';
COMMENT ON COLUMN recipe_equipment.reusable IS 'true = MAX aggregation, false = SUM aggregation';
COMMENT ON COLUMN recipe_equipment.essential IS 'Can recipe be made without this item?';
