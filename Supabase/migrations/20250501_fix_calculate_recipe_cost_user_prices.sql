-- Migration: Fix calculate_recipe_cost to use user_ingredient_prices
-- Date: 2025-05-01
-- Description: Updated function to check for custom user prices before using defaults

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
  v_matched_ingredient_id UUID;
  v_custom_price NUMERIC(10, 2);
  v_final_price NUMERIC(10, 2);
BEGIN
  SELECT servings INTO v_servings
  FROM base_recipes
  WHERE id = p_recipe_id;
  
  FOR v_ingredient IN 
    SELECT 
      ri.ingredient_name,
      ri.quantity,
      ri.unit,
      id.id as ingredient_id,
      id.default_price,
      id.price_unit
    FROM recipe_ingredients ri
    JOIN ingredients_database id ON LOWER(id.name_bg) = LOWER(ri.ingredient_name)
                                 OR LOWER(id.name_en) = LOWER(ri.ingredient_name)
    WHERE ri.recipe_id = p_recipe_id
  LOOP
    v_ingredient_cost := 0;
    v_final_price := v_ingredient.default_price;
    v_custom_price := NULL;
    
    -- 🔑 KEY LOGIC: Check for custom user price
    IF p_user_id IS NOT NULL THEN
      SELECT custom_price INTO v_custom_price
      FROM user_ingredient_prices
      WHERE user_id = p_user_id 
        AND ingredient_id = v_ingredient.ingredient_id
      LIMIT 1;
      
      IF v_custom_price IS NOT NULL THEN
        v_final_price := v_custom_price;
      END IF;
    END IF;
    
    -- Unit conversion logic
    IF v_final_price > 0 THEN
      IF (v_ingredient.price_unit = 'kg') AND (v_ingredient.unit = 'g') THEN
        v_ingredient_cost := (v_ingredient.quantity / 1000.0) * v_final_price;
      ELSIF (v_ingredient.price_unit = 'l') AND (v_ingredient.unit = 'ml') THEN
        v_ingredient_cost := (v_ingredient.quantity / 1000.0) * v_final_price;
      ELSIF (v_ingredient.price_unit IN ('бр', 'piece', 'pc')) AND (v_ingredient.unit IN ('бр', 'pc', 'piece')) THEN
        v_ingredient_cost := v_ingredient.quantity * v_final_price;
      ELSE
        v_ingredient_cost := v_ingredient.quantity * v_final_price;
      END IF;
    END IF;
    
    v_total_cost := v_total_cost + v_ingredient_cost;
    
    v_breakdown := v_breakdown || jsonb_build_object(
      'ingredient', v_ingredient.ingredient_name,
      'quantity', v_ingredient.quantity,
      'unit', v_ingredient.unit,
      'price', v_final_price,
      'price_unit', v_ingredient.price_unit,
      'cost', ROUND(v_ingredient_cost, 2),
      'is_custom', CASE WHEN v_custom_price IS NOT NULL THEN true ELSE false END,
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
