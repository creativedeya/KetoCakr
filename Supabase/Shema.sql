-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE (User metadata)
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE,
  is_admin BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  preferred_units TEXT DEFAULT 'metric' CHECK (preferred_units IN ('metric', 'imperial')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'bg')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DESSERT TYPES
-- =====================================================
CREATE TABLE dessert_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL CHECK (slug IN ('cake', 'cheesecake', 'tart', 'muffin', 'roll')),
  name_en TEXT NOT NULL,
  name_bg TEXT,
  icon TEXT,
  assembly_instructions_en TEXT,
  assembly_instructions_bg TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BASE RECIPES (Components)
-- =====================================================
CREATE TABLE base_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL CHECK (category IN ('crust', 'cream', 'filling', 'decoration')),
  name_en TEXT NOT NULL,
  name_bg TEXT,
  description_en TEXT,
  description_bg TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]',
  steps JSONB NOT NULL DEFAULT '[]',
  prep_time_minutes INT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  image_url TEXT,
  nutrition JSONB NOT NULL DEFAULT '{}',
  suitable_for_dessert_types TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- READY RECIPES (Admin curated)
-- =====================================================
CREATE TABLE ready_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dessert_type_id UUID REFERENCES dessert_types ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_bg TEXT,
  description_en TEXT,
  description_bg TEXT,
  crust_id UUID REFERENCES base_recipes ON DELETE RESTRICT,
  cream_id UUID REFERENCES base_recipes ON DELETE RESTRICT,
  filling_id UUID REFERENCES base_recipes ON DELETE RESTRICT,
  decoration_id UUID REFERENCES base_recipes ON DELETE RESTRICT,
  hero_image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- USER RECIPES (User generated)
-- =====================================================
CREATE TABLE user_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles ON DELETE CASCADE,
  dessert_type_id UUID REFERENCES dessert_types ON DELETE CASCADE,
  custom_name TEXT,
  crust_id UUID REFERENCES base_recipes ON DELETE RESTRICT,
  cream_id UUID REFERENCES base_recipes ON DELETE RESTRICT,
  filling_id UUID REFERENCES base_recipes ON DELETE RESTRICT,
  decoration_id UUID REFERENCES base_recipes ON DELETE RESTRICT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FAVORITES
-- =====================================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles ON DELETE CASCADE,
  ready_recipe_id UUID REFERENCES ready_recipes ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, ready_recipe_id)
);

-- =====================================================
-- SHOPPING LISTS
-- =====================================================
CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RESOURCES (Tips & Tools)
-- =====================================================
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL CHECK (category IN ('tip', 'guide', 'converter')),
  title_en TEXT NOT NULL,
  title_bg TEXT,
  content_en TEXT NOT NULL,
  content_bg TEXT,
  icon TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================
CREATE INDEX idx_base_recipes_category ON base_recipes(category);
CREATE INDEX idx_ready_recipes_featured ON ready_recipes(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_ready_recipes_published ON ready_recipes(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX idx_user_recipes_user_id ON user_recipes(user_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_base_recipes_updated_at
  BEFORE UPDATE ON base_recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_shopping_lists_updated_at
  BEFORE UPDATE ON shopping_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();# Auto detect text files and perform LF normalization
* text=auto
