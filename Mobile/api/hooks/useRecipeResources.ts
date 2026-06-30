import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export interface RecipeResource {
  id: string;
  recipe_id: string;
  recipe_type: 'base' | 'ready' | 'simple';
  resource_type: 'youtube' | 'instagram' | 'tiktok' | 'pinterest' | 'blog' | 'idea_source';
  url: string;
  title?: string;
  description?: string;
}

export function useRecipeResources(recipeId: string | undefined, recipeType: 'base' | 'ready' | 'simple') {
  return useQuery({
    queryKey: ['recipe-resources', recipeId, recipeType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipe_resources')
        .select('*')
        .eq('recipe_id', recipeId!)
        .eq('recipe_type', recipeType)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as RecipeResource[]) || [];
    },
    enabled: !!recipeId,
    staleTime: 1000 * 60 * 10,
  });
}
