-- Create sweeteners table for Sweetener Comparison Tool
-- Migration: 2026-04-30

CREATE TABLE IF NOT EXISTS public.sweeteners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic info
  name_en VARCHAR(255) NOT NULL,
  name_bg VARCHAR(255),
  icon TEXT,
  
  -- Classification
  source VARCHAR(50) NOT NULL CHECK (source IN ('natural', 'synthetic', 'semi-natural')),
  price VARCHAR(50) CHECK (price IN ('low', 'mid', 'high')),
  
  -- Nutritional & health metrics
  glycemic_index INT CHECK (glycemic_index >= 0 AND glycemic_index <= 100),
  sweetness_ratio FLOAT CHECK (sweetness_ratio > 0), -- vs sugar (100 = equal)
  net_carbs_per_100g FLOAT DEFAULT 0,
  calories_per_gram FLOAT,
  
  -- Keto compatibility
  keto BOOLEAN DEFAULT FALSE,
  
  -- Taste & use
  taste_profile_en TEXT,
  taste_profile_bg TEXT,
  common_uses TEXT[] DEFAULT '{}',
  
  -- Description & details
  description_en TEXT,
  description_bg TEXT,
  
  -- Pros & cons (arrays for easy editing)
  pros_en TEXT[] DEFAULT '{}',
  pros_bg TEXT[] DEFAULT '{}',
  cons_en TEXT[] DEFAULT '{}',
  cons_bg TEXT[] DEFAULT '{}',
  
  -- Combinations (recommended pairs)
  recommended_combinations TEXT[] DEFAULT '{}',
  
  -- Display & management
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sweeteners_active ON sweeteners(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_sweeteners_source ON sweeteners(source);
CREATE INDEX IF NOT EXISTS idx_sweeteners_keto ON sweeteners(keto) WHERE keto = TRUE;
CREATE INDEX IF NOT EXISTS idx_sweeteners_display_order ON sweeteners(display_order);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_sweeteners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF NOT EXISTS update_sweeteners_updated_at ON sweeteners;

CREATE TRIGGER update_sweeteners_updated_at
  BEFORE UPDATE ON sweeteners
  FOR EACH ROW EXECUTE FUNCTION update_sweeteners_updated_at();

-- RLS Policies
ALTER TABLE sweeteners ENABLE ROW LEVEL SECURITY;

-- Public read access (everyone can see active sweeteners)
CREATE POLICY "Public read active sweeteners"
ON sweeteners FOR SELECT
USING (is_active = TRUE);

-- Admin full access
CREATE POLICY "Admins manage sweeteners"
ON sweeteners FOR ALL
USING (auth.jwt() ->> 'role' = 'authenticated' AND 
       EXISTS (
         SELECT 1 FROM profiles 
         WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
       ));
