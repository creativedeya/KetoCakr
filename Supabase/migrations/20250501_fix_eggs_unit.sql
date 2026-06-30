-- Migration: Fix unit matching for eggs (pc instead of piece)
-- Date: 2025-05-01
-- Description: Updated RPC function to recognize 'pc' as piece unit

DROP FUNCTION IF EXISTS public.calculate_recipe_cost(uuid, uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.calculate_recipe_cost(
  p_recipe_id uuid, 
  p_user_id uuid DEFAULT NULL::uuid
)
RETURNS TABLE(total_cost numeric, cost_per_serving numeric, currency text, breakdown jsonb)
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_cost NUMERIC(10, 2) := 0;
  v_servings INTEGER;
  v_ingredient RECORD;
  v_ingredient_cost NUMERIC(10, 2);
  v_breakdown JSONB := '[]'::JSONB;
  v_currency TEXT := 'EUR';
  v_price NUMERIC(10, 2);
  v_price_unit TEXT;
BEGIN
  -- Get servings from base_recipes
  SELECT servings INTO v_servings
  FROM base_recipes
  WHERE id = p_recipe_id;
  
  -- Loop through all ingredients in the recipe
  FOR v_ingredient IN 
    SELECT 
      ri.ingredient_name,
      ri.quantity,
      ri.unit,
      id.default_price,
      id.price_unit
    FROM recipe_ingredients ri
    JOIN ingredients_database id ON LOWER(id.name_bg) = LOWER(ri.ingredient_name)
                                 OR LOWER(id.name_en) = LOWER(ri.ingredient_name)
    WHERE ri.recipe_id = p_recipe_id
  LOOP
    v_price := v_ingredient.default_price;
    v_price_unit := v_ingredient.price_unit;
    v_ingredient_cost := 0;
    
    -- Unit conversion logic with detailed handling
    IF v_price IS NOT NULL AND v_price > 0 THEN
      -- Case 1: Price in kg, quantity in grams
      IF v_price_unit = 'kg' AND v_ingredient.unit = 'g' THEN
        v_ingredient_cost := (v_ingredient.quantity / 1000.0) * v_price;
      
      -- Case 2: Price in liters, quantity in milliliters
      ELSIF v_price_unit = 'l' AND v_ingredient.unit = 'ml' THEN
        v_ingredient_cost := (v_ingredient.quantity / 1000.0) * v_price;
      
      -- Case 3: Price per unit (piece), quantity in pieces
      -- Support multiple piece unit variations: бр, piece, pc, шт, pcs
      ELSIF v_price_unit IN ('бр', 'piece', 'pc', 'шт', 'pcs') 
        AND v_ingredient.unit IN ('бр', 'piece', 'pc', 'шт', 'pcs') THEN
        v_ingredient_cost := v_ingredient.quantity * v_price;
      
      -- Case 4: Same units - no conversion
      ELSIF v_price_unit = v_ingredient.unit THEN
        v_ingredient_cost := v_ingredient.quantity * v_price;
      
      -- Fallback: Assume same unit system
      ELSE
        v_ingredient_cost := v_ingredient.quantity * v_price;
      END IF;
    END IF;
    
    v_total_cost := v_total_cost + v_ingredient_cost;
    
    v_breakdown := v_breakdown || jsonb_build_object(
      'ingredient', v_ingredient.ingredient_name,
      'quantity', v_ingredient.quantity,
      'unit', v_ingredient.unit,
      'price', COALESCE(v_price, 0),
      'price_unit', COALESCE(v_price_unit, 'n/a'),
      'cost', ROUND(v_ingredient_cost, 2),
      'is_custom', false,
      'matched', true
    );
  END LOOP;
  
  RETURN QUERY SELECT 
    ROUND(v_total_cost, 2),
    CASE WHEN v_servings > 0 THEN ROUND(v_total_cost / v_servings, 2) ELSE v_total_cost END,
    v_currency,
    v_breakdown;
END;
$$;
