import { supabase } from '../lib/supabase';

export interface RecipeFilters {
  searchText: string;
  caloriesMin: number;
  caloriesMax: number;
  carbsMin: number;
  carbsMax: number;
  dessertTypeId: number | null;
  sortBy: 'default' | 'calories' | 'carbs';
}

export const DEFAULT_FILTERS: RecipeFilters = {
  searchText: '',
  caloriesMin: 0,
  caloriesMax: 1000,
  carbsMin: 0,
  carbsMax: 50,
  dessertTypeId: null,
  sortBy: 'default',
};

export const queryRecipes = async (filters: RecipeFilters) => {
  let query = supabase
    .from('ready_recipes')
    .select(
      'id, name_bg, name_en, hero_image_url, dessert_type_id, total_calories, total_net_carbs, total_servings, difficulty_level'
    )
    .eq('status', 'published');

  if (filters.searchText.trim()) {
    const q = filters.searchText.trim();
    query = query.or(`name_bg.ilike.%${q}%,name_en.ilike.%${q}%`);
  }

  if (filters.dessertTypeId !== null) {
    query = query.eq('dessert_type_id', filters.dessertTypeId);
  }

  if (filters.caloriesMin > 0) {
    query = query.gte('total_calories', filters.caloriesMin);
  }
  if (filters.caloriesMax < 1000) {
    query = query.lte('total_calories', filters.caloriesMax);
  }

  if (filters.carbsMin > 0) {
    query = query.gte('total_net_carbs', filters.carbsMin);
  }
  if (filters.carbsMax < 50) {
    query = query.lte('total_net_carbs', filters.carbsMax);
  }

  switch (filters.sortBy) {
    case 'calories':
      query = query.order('total_calories', { ascending: true });
      break;
    case 'carbs':
      query = query.order('total_net_carbs', { ascending: true });
      break;
    default:
      query = query.order('name_bg', { ascending: true });
  }

  const { data, error } = await query.limit(50);
  if (error) return [];
  return data || [];
};
