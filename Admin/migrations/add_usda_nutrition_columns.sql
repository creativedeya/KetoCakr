-- Migration: Add USDA nutrition columns to ingredients_database
-- Date: 2026-03-16

-- Extended nutrient columns
ALTER TABLE ingredients_database ADD COLUMN IF NOT EXISTS sodium_per_100g NUMERIC(10,2);
ALTER TABLE ingredients_database ADD COLUMN IF NOT EXISTS calcium_per_100g NUMERIC(10,2);
ALTER TABLE ingredients_database ADD COLUMN IF NOT EXISTS iron_per_100g NUMERIC(10,2);
ALTER TABLE ingredients_database ADD COLUMN IF NOT EXISTS magnesium_per_100g NUMERIC(10,2);
ALTER TABLE ingredients_database ADD COLUMN IF NOT EXISTS potassium_per_100g NUMERIC(10,2);
ALTER TABLE ingredients_database ADD COLUMN IF NOT EXISTS sugar_per_100g NUMERIC(10,2);
ALTER TABLE ingredients_database ADD COLUMN IF NOT EXISTS cholesterol_per_100g NUMERIC(10,2);
ALTER TABLE ingredients_database ADD COLUMN IF NOT EXISTS saturated_fat_per_100g NUMERIC(10,2);

-- USDA reference tracking columns
ALTER TABLE ingredients_database ADD COLUMN IF NOT EXISTS usda_fdc_id INTEGER;
ALTER TABLE ingredients_database ADD COLUMN IF NOT EXISTS nutrition_source TEXT DEFAULT 'manual';
ALTER TABLE ingredients_database ADD COLUMN IF NOT EXISTS nutrition_verified_at TIMESTAMPTZ;
