-- Migration: Sugar Alcohol Fix — FINAL
-- Purpose: Exclude sugar alcohols from total_carbs AND total_fiber
-- Date: 2025-05-05
-- Status: APPLIED in Supabase

-- =====================================================
-- 1. Add is_sugar_alcohol column
-- =====================================================
ALTER TABLE ingredients_database
ADD COLUMN IF NOT EXISTS is_sugar_alcohol BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN ingredients_database.is_sugar_alcohol IS
  'If true, ingredient is excluded from total_carbs and total_fiber.
   Used for erythritol, xylitol, allulose, etc.
   net_carbs = total_carbs - total_fiber (sugar alcohols do not affect either)';

-- =====================================================
-- 2. Mark known sugar alcohols
-- =====================================================
UPDATE ingredients_database
SET is_sugar_alcohol = TRUE
WHERE LOWER(name_bg) ILIKE ANY (ARRAY[
  '%еритритол%', '%ксилитол%', '%малтитол%',
  '%сорбитол%',  '%манитол%',  '%лактитол%',
  '%изомалт%',   '%аластам%',  '%алулоза%'
])
OR LOWER(name_en) ILIKE ANY (ARRAY[
  '%erythritol%', '%xylitol%',  '%maltitol%',
  '%sorbitol%',   '%mannitol%', '%lactitol%',
  '%isomalt%',    '%allulose%', '%stevia%'
]);

-- =====================================================
-- 3. trigger_update_nutrition_on_ingredients_change
--    Fires on INSERT/UPDATE/DELETE of recipe_ingredients
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_update_nutrition_on_ingredients_change()
RETURNS TRIGGER AS $$
DECLARE
  v_recipe_id UUID;
  v_total_calories NUMERIC(10,2) := 0;
  v_total_fat      NUMERIC(10,2) := 0;
  v_total_protein  NUMERIC(10,2) := 0;
  v_total_carbs    NUMERIC(10,2) := 0;
  v_total_fiber    NUMERIC(10,2) := 0;
  v_total_weight   INTEGER := 0;
  v_ingredient RECORD;
  v_db RECORD;
  v_qty_grams NUMERIC;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_recipe_id := OLD.recipe_id;
  ELSE
    v_recipe_id := NEW.recipe_id;
  END IF;

  IF v_recipe_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  FOR v_ingredient IN
    SELECT ri.quantity, ri.unit, ri.ingredient_database_id
    FROM recipe_ingredients ri
    WHERE ri.recipe_id = v_recipe_id
      AND ri.ingredient_database_id IS NOT NULL
  LOOP
    SELECT calories_per_100g, fat_per_100g, protein_per_100g,
           carbs_per_100g, fiber_per_100g, is_sugar_alcohol, unit_weight_grams
    INTO v_db
    FROM ingredients_database
    WHERE id = v_ingredient.ingredient_database_id;

    IF NOT FOUND THEN CONTINUE; END IF;

    v_qty_grams := CASE v_ingredient.unit
      WHEN 'g'     THEN v_ingredient.quantity
      WHEN 'kg'    THEN v_ingredient.quantity * 1000
      WHEN 'ml'    THEN v_ingredient.quantity
      WHEN 'l'     THEN v_ingredient.quantity * 1000
      WHEN 'tsp'   THEN v_ingredient.quantity * 5
      WHEN 'tbsp'  THEN v_ingredient.quantity * 15
      WHEN 'cup'   THEN v_ingredient.quantity * 240
      WHEN 'pc'    THEN v_ingredient.quantity * COALESCE(v_db.unit_weight_grams, 50)
      WHEN 'бр'    THEN v_ingredient.quantity * COALESCE(v_db.unit_weight_grams, 50)
      WHEN 'piece' THEN v_ingredient.quantity * COALESCE(v_db.unit_weight_grams, 50)
      ELSE v_ingredient.quantity
    END;

    v_total_calories := v_total_calories + (v_qty_grams * COALESCE(v_db.calories_per_100g, 0) / 100);
    v_total_fat      := v_total_fat      + (v_qty_grams * COALESCE(v_db.fat_per_100g, 0) / 100);
    v_total_protein  := v_total_protein  + (v_qty_grams * COALESCE(v_db.protein_per_100g, 0) / 100);
    v_total_weight   := v_total_weight   + v_qty_grams::INTEGER;

    -- Sugar alcohols excluded from BOTH carbs and fiber
    IF NOT COALESCE(v_db.is_sugar_alcohol, FALSE) THEN
      v_total_carbs := v_total_carbs + (v_qty_grams * COALESCE(v_db.carbs_per_100g, 0) / 100);
      v_total_fiber := v_total_fiber + (v_qty_grams * COALESCE(v_db.fiber_per_100g, 0) / 100);
    END IF;
  END LOOP;

  UPDATE base_recipes SET
    total_calories     = ROUND(v_total_calories, 2),
    total_fat          = ROUND(v_total_fat, 2),
    total_protein      = ROUND(v_total_protein, 2),
    total_carbs        = ROUND(v_total_carbs, 2),
    total_fiber        = ROUND(v_total_fiber, 2),
    total_net_carbs    = ROUND(GREATEST(v_total_carbs - v_total_fiber, 0), 2),
    total_weight_grams = v_total_weight,
    nutrition_last_calculated = NOW()
  WHERE id = v_recipe_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. trigger_update_recipe_nutrition
--    Fires on manual "Преизчисли" button (UPDATE OF updated_at)
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_update_recipe_nutrition()
RETURNS TRIGGER AS $$
DECLARE
  v_total_calories NUMERIC(10,2) := 0;
  v_total_fat      NUMERIC(10,2) := 0;
  v_total_protein  NUMERIC(10,2) := 0;
  v_total_carbs    NUMERIC(10,2) := 0;
  v_total_fiber    NUMERIC(10,2) := 0;
  v_ingredient RECORD;
  v_db RECORD;
  v_qty_grams NUMERIC;
BEGIN
  FOR v_ingredient IN
    SELECT ri.quantity, ri.unit, ri.ingredient_database_id
    FROM recipe_ingredients ri
    WHERE ri.recipe_id = NEW.id
      AND ri.ingredient_database_id IS NOT NULL
  LOOP
    SELECT calories_per_100g, fat_per_100g, protein_per_100g,
           carbs_per_100g, fiber_per_100g, is_sugar_alcohol, unit_weight_grams
    INTO v_db
    FROM ingredients_database
    WHERE id = v_ingredient.ingredient_database_id;

    IF NOT FOUND THEN CONTINUE; END IF;

    v_qty_grams := CASE v_ingredient.unit
      WHEN 'g'     THEN v_ingredient.quantity
      WHEN 'kg'    THEN v_ingredient.quantity * 1000
      WHEN 'ml'    THEN v_ingredient.quantity
      WHEN 'l'     THEN v_ingredient.quantity * 1000
      WHEN 'tsp'   THEN v_ingredient.quantity * 5
      WHEN 'tbsp'  THEN v_ingredient.quantity * 15
      WHEN 'cup'   THEN v_ingredient.quantity * 240
      WHEN 'pc'    THEN v_ingredient.quantity * COALESCE(v_db.unit_weight_grams, 50)
      WHEN 'бр'    THEN v_ingredient.quantity * COALESCE(v_db.unit_weight_grams, 50)
      WHEN 'piece' THEN v_ingredient.quantity * COALESCE(v_db.unit_weight_grams, 50)
      ELSE v_ingredient.quantity
    END;

    v_total_calories := v_total_calories + (v_qty_grams * COALESCE(v_db.calories_per_100g, 0) / 100);
    v_total_fat      := v_total_fat      + (v_qty_grams * COALESCE(v_db.fat_per_100g, 0) / 100);
    v_total_protein  := v_total_protein  + (v_qty_grams * COALESCE(v_db.protein_per_100g, 0) / 100);

    IF NOT COALESCE(v_db.is_sugar_alcohol, FALSE) THEN
      v_total_carbs := v_total_carbs + (v_qty_grams * COALESCE(v_db.carbs_per_100g, 0) / 100);
      v_total_fiber := v_total_fiber + (v_qty_grams * COALESCE(v_db.fiber_per_100g, 0) / 100);
    END IF;
  END LOOP;

  NEW.total_calories  := ROUND(v_total_calories, 2);
  NEW.total_fat       := ROUND(v_total_fat, 2);
  NEW.total_protein   := ROUND(v_total_protein, 2);
  NEW.total_carbs     := ROUND(v_total_carbs, 2);
  NEW.total_fiber     := ROUND(v_total_fiber, 2);
  NEW.total_net_carbs := ROUND(GREATEST(v_total_carbs - v_total_fiber, 0), 2);
  NEW.nutrition_last_calculated := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. Recalculate all existing recipes
-- =====================================================
UPDATE recipe_ingredients SET order_index = order_index;
