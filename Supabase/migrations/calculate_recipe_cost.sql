-- Migration: Fix calculate_recipe_cost function for proper unit conversion
-- Date: 2025-05-01
-- Description: Fixed the unit conversion logic to properly handle:
--   - Grams (g) to Kilograms (kg) conversion
--   - Milliliters (ml) to Liters (l) conversion
--   - Piece/unit (бр, pc, piece) conversions

DROP FUNCTION IF EXISTS calculate_recipe_cost(uuid, uuid);

CREATE OR REPLACE FUNCTION calculate_recipe_cost(
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
  v_price_info RECORD;
  v_ingredient_cost NUMERIC(10, 2);
  v_breakdown JSONB := '[]'::JSONB;
  v_currency TEXT := 'EUR';
  v_matched_ingredient_id UUID;
BEGIN
  SELECT servings INTO v_servings
  FROM base_recipes
  WHERE id = p_recipe_id;
  
  FOR v_ingredient IN 
    SELECT 
      ri.ingredient_name,
      ri.quantity,
      ri.unit
    FROM recipe_ingredients ri
    WHERE ri.recipe_id = p_recipe_id
  LOOP
    SELECT id INTO v_matched_ingredient_id
    FROM ingredients_database
    WHERE LOWER(name_bg) = LOWER(v_ingredient.ingredient_name)
       OR LOWER(name_en) = LOWER(v_ingredient.ingredient_name)
    LIMIT 1;
    
    IF v_matched_ingredient_id IS NULL THEN
      SELECT id INTO v_matched_ingredient_id
      FROM ingredients_database
      WHERE LOWER(name_bg) ILIKE '%' || LOWER(v_ingredient.ingredient_name) || '%'
         OR LOWER(v_ingredient.ingredient_name) ILIKE '%' || LOWER(name_bg) || '%'
      LIMIT 1;
    END IF;
    
    IF v_matched_ingredient_id IS NULL THEN
      v_breakdown := v_breakdown || jsonb_build_object(
        'ingredient', v_ingredient.ingredient_name,
        'quantity', v_ingredient.quantity,
        'unit', v_ingredient.unit,
        'price', 0,
        'price_unit', 'n/a',
        'cost', 0,
        'is_custom', false,
        'matched', false
      );
      CONTINUE;
    END IF;
    
    SELECT * INTO v_price_info
    FROM get_ingredient_price(v_matched_ingredient_id, p_user_id);
    
    v_ingredient_cost := 0;

    -- 🔄 FIX: Proper unit conversion logic
    IF v_price_info.price IS NOT NULL AND v_price_info.price > 0 THEN
      IF v_price_info.price_unit = 'kg' AND v_ingredient.unit IN ('g') THEN
        -- Convert grams to kilograms
        v_ingredient_cost := (v_ingredient.quantity / 1000.0) * v_price_info.price;
      ELSIF v_price_info.price_unit = 'l' AND v_ingredient.unit IN ('ml') THEN
        -- Convert milliliters to liters
        v_ingredient_cost := (v_ingredient.quantity / 1000.0) * v_price_info.price;
      ELSIF v_price_info.price_unit IN ('бр', 'piece', 'pc') AND v_ingredient.unit IN ('бр', 'pc', 'piece') THEN
        -- No conversion needed for pieces/units
        v_ingredient_cost := v_ingredient.quantity * v_price_info.price;
      ELSE
        -- Fallback: если единицы не совпадают точно, приеми че са в същата система
        v_ingredient_cost := v_ingredient.quantity * v_price_info.price;
      END IF;
    END IF;

    v_total_cost := v_total_cost + v_ingredient_cost;
    
    v_breakdown := v_breakdown || jsonb_build_object(
      'ingredient', v_ingredient.ingredient_name,
      'quantity', v_ingredient.quantity,
      'unit', v_ingredient.unit,
      'price', COALESCE(v_price_info.price, 0),
      'price_unit', COALESCE(v_price_info.price_unit, 'n/a'),
      'cost', ROUND(v_ingredient_cost, 2),
      'is_custom', COALESCE(v_price_info.is_custom, false),
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
