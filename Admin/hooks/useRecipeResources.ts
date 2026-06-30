import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface RecipeResource {
  id: string;
  recipe_id: string;
  recipe_type: 'base' | 'ready' | 'simple';
  resource_type: 'youtube' | 'instagram' | 'tiktok' | 'pinterest' | 'blog' | 'idea_source';
  url: string;
  title?: string;
  description?: string;
  created_at: string;
}

export function useRecipeResources(
  recipeId: string,
  recipeType: 'base' | 'ready' | 'simple',
  extraTypes?: Array<'base' | 'ready' | 'simple'>
) {
  const [resources, setResources] = useState<RecipeResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allTypes = [recipeType, ...(extraTypes ?? [])];

  const load = useCallback(async () => {
    if (!recipeId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('recipe_resources')
        .select('*')
        .eq('recipe_id', recipeId)
        .in('recipe_type', allTypes)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setResources((data as RecipeResource[]) || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [recipeId, JSON.stringify(allTypes)]);

  useEffect(() => {
    load();
  }, [load]);

  const addResource = async (resource: Omit<RecipeResource, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('recipe_resources')
      .insert([resource])
      .select()
      .single();
    if (error) throw error;
    await load();
    return data;
  };

  const deleteResource = async (resourceId: string) => {
    const { error } = await supabase
      .from('recipe_resources')
      .delete()
      .eq('id', resourceId);
    if (error) throw error;
    await load();
  };

  return { resources, loading, error, addResource, deleteResource, reload: load };
}
