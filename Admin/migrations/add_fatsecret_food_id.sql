-- Migration: Add FatSecret food ID tracking to ingredients_database
-- Run this before using the FatSecret import feature in the admin panel

ALTER TABLE ingredients_database
ADD COLUMN IF NOT EXISTS fatsecret_food_id TEXT;

COMMENT ON COLUMN ingredients_database.fatsecret_food_id IS 'FatSecret Platform API food_id for tracking data source';
