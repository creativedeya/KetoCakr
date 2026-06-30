import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export const useProductRecipes = (selectedIngredientIds: string[]) => {
  return useQuery({
    queryKey: ['productRecipes', selectedIngredientIds],
    queryFn: async () => {
      if (selectedIngredientIds.length === 0) return [];

      // Step 1: find base_recipe IDs that use the selected ingredients
      const { data: ingredientRows, error: ingError } = await supabase
        .from('recipe_ingredients')
        .select('recipe_id')
        .in('ingredient_database_id', selectedIngredientIds);

      if (ingError || !ingredientRows || ingredientRows.length === 0) return [];

      const baseRecipeIds = [...new Set(
        ingredientRows.map((r: any) => r.recipe_id).filter(Boolean)
      )];
      if (baseRecipeIds.length === 0) return [];

      // Step 2: fetch ready_recipes with selected_components and filter client-side
      const { data: readyRecipes, error: recipesError } = await supabase
        .from('ready_recipes')
        .select('id, name_bg, name_en, hero_image_url, total_calories, total_net_carbs, total_servings, selected_components')
        .eq('status', 'published');

      if (recipesError || !readyRecipes) return [];

      return readyRecipes.filter((recipe: any) => {
        const components = recipe.selected_components;
        if (!Array.isArray(components)) return false;
        return components.some((comp: any) => baseRecipeIds.includes(comp.base_recipe_id));
      });
    },
    enabled: selectedIngredientIds.length > 0,
  });
};
