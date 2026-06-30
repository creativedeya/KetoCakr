import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export interface SearchFilters {
  query: string;
  caloriesMin: number;
  caloriesMax: number;
  carbsMin: number;
  carbsMax: number;
  sortBy: 'default' | 'calories' | 'carbs';
}

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  query: '',
  caloriesMin: 0,
  caloriesMax: 1000,
  carbsMin: 0,
  carbsMax: 50,
  sortBy: 'default',
};

export const useSearchRecipes = (filters: SearchFilters) => {
  return useQuery({
    queryKey: ['searchRecipes', filters],
    queryFn: async () => {
      let q = supabase
        .from('ready_recipes')
        .select('id, name_bg, name_en, hero_image_url, total_calories, total_net_carbs, total_servings')
        .eq('status', 'published');

      if (filters.query.trim()) {
        const text = filters.query.trim();
        q = q.or(`name_bg.ilike.%${text}%,name_en.ilike.%${text}%`);
      }

      if (filters.caloriesMin > 0) q = q.gte('total_calories', filters.caloriesMin);
      if (filters.caloriesMax < 1000) q = q.lte('total_calories', filters.caloriesMax);
      if (filters.carbsMin > 0) q = q.gte('total_net_carbs', filters.carbsMin);
      if (filters.carbsMax < 50) q = q.lte('total_net_carbs', filters.carbsMax);

      switch (filters.sortBy) {
        case 'calories':
          q = q.order('total_calories', { ascending: true });
          break;
        case 'carbs':
          q = q.order('total_net_carbs', { ascending: true });
          break;
        default:
          q = q.order('name_bg', { ascending: true });
      }

      const { data, error } = await q.limit(50);
      if (error) return [];
      return data || [];
    },
  });
};
