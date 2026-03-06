-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dessert_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE base_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ready_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- DESSERT TYPES
CREATE POLICY "Anyone can view dessert types"
  ON dessert_types FOR SELECT USING (TRUE);

CREATE POLICY "Only admins can manage dessert types"
  ON dessert_types FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- BASE RECIPES
CREATE POLICY "Anyone can view base recipes"
  ON base_recipes FOR SELECT USING (TRUE);

CREATE POLICY "Only admins can manage base recipes"
  ON base_recipes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- READY RECIPES
CREATE POLICY "Anyone can view published ready recipes"
  ON ready_recipes FOR SELECT
  USING (published_at IS NOT NULL);

CREATE POLICY "Admins can view all ready recipes"
  ON ready_recipes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Only admins can manage ready recipes"
  ON ready_recipes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- USER RECIPES
CREATE POLICY "Users can view their own recipes"
  ON user_recipes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recipes"
  ON user_recipes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes"
  ON user_recipes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes"
  ON user_recipes FOR DELETE USING (auth.uid() = user_id);

-- FAVORITES
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites"
  ON favorites FOR ALL USING (auth.uid() = user_id);

-- SHOPPING LISTS
CREATE POLICY "Users can view their own shopping lists"
  ON shopping_lists FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own shopping lists"
  ON shopping_lists FOR ALL USING (auth.uid() = user_id);

-- RESOURCES
CREATE POLICY "Anyone can view resources"
  ON resources FOR SELECT USING (TRUE);

CREATE POLICY "Only admins can manage resources"
  ON resources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );