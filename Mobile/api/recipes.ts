// ===========================================================
// FILE: mobile/lib/api/recipes.ts
// ===========================================================
import { supabase } from '../supabase';
import {
  ReadyRecipe,
  UserRecipe,
  BaseRecipe,
  DessertType,
  RecipeCategory,
} from '../../../../shared/types';

// =====================================================
// READY RECIPES
// =====================================================

export async function getReadyRecipes(limit?: number): Promise<ReadyRecipe[]> {
  let query = supabase
    .from('ready_recipes')
    .select(
      `
      *,
      dessert_type:dessert_types(*),
      crust:base_recipes!ready_recipes_crust_id_fkey(*),
      cream:base_recipes!ready_recipes_cream_id_fkey(*),
      filling:base_recipes!ready_recipes_filling_id_fkey(*),
      decoration:base_recipes!ready_recipes_decoration_id_fkey(*)
    `
    )
    .not('published_at', 'is', null)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as ReadyRecipe[];
}

export async function getReadyRecipe(id: string): Promise<ReadyRecipe> {
  const { data, error } = await supabase
    .from('ready_recipes')
    .select(
      `
      *,
      dessert_type:dessert_types(*),
      crust:base_recipes!ready_recipes_crust_id_fkey(*),
      cream:base_recipes!ready_recipes_cream_id_fkey(*),
      filling:base_recipes!ready_recipes_filling_id_fkey(*),
      decoration:base_recipes!ready_recipes_decoration_id_fkey(*)
    `
    )
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as ReadyRecipe;
}

export async function getFeaturedRecipe(): Promise<ReadyRecipe | null> {
  const { data, error } = await supabase
    .from('ready_recipes')
    .select(
      `
      *,
      dessert_type:dessert_types(*),
      crust:base_recipes!ready_recipes_crust_id_fkey(*),
      cream:base_recipes!ready_recipes_cream_id_fkey(*),
      filling:base_recipes!ready_recipes_filling_id_fkey(*),
      decoration:base_recipes!ready_recipes_decoration_id_fkey(*)
    `
    )
    .eq('is_featured', true)
    .not('published_at', 'is', null)
    .maybeSingle();

  if (error) throw error;
  return data as ReadyRecipe | null;
}

// =====================================================
// USER RECIPES
// =====================================================

export async function getUserRecipes(userId: string): Promise<UserRecipe[]> {
  const { data, error } = await supabase
    .from('user_recipes')
    .select(
      `
      *,
      dessert_type:dessert_types(*),
      crust:base_recipes!user_recipes_crust_id_fkey(*),
      cream:base_recipes!user_recipes_cream_id_fkey(*),
      filling:base_recipes!user_recipes_filling_id_fkey(*),
      decoration:base_recipes!user_recipes_decoration_id_fkey(*)
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as UserRecipe[];
}

export async function createUserRecipe(
  recipe: Omit<UserRecipe, 'id' | 'created_at'>
): Promise<UserRecipe> {
  const { data, error } = await supabase
    .from('user_recipes')
    .insert(recipe)
    .select(
      `
      *,
      dessert_type:dessert_types(*),
      crust:base_recipes!user_recipes_crust_id_fkey(*),
      cream:base_recipes!user_recipes_cream_id_fkey(*),
      filling:base_recipes!user_recipes_filling_id_fkey(*),
      decoration:base_recipes!user_recipes_decoration_id_fkey(*)
    `
    )
    .single();

  if (error) throw error;
  return data as UserRecipe;
}

export async function deleteUserRecipe(id: string): Promise<void> {
  const { error } = await supabase.from('user_recipes').delete().eq('id', id);
  if (error) throw error;
}

export async function checkUserRecipeLimit(userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', userId)
    .single();

  if (profile?.is_premium) return true;

  const { count, error } = await supabase
    .from('user_recipes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) throw error;
  return (count || 0) < 3;
}

// =====================================================
// BASE RECIPES
// =====================================================

export async function getBaseRecipesByCategory(
  category: RecipeCategory
): Promise<BaseRecipe[]> {
  const { data, error } = await supabase
    .from('base_recipes')
    .select('*')
    .eq('category', category)
    .order('name_en');

  if (error) throw error;
  return data as BaseRecipe[];
}

export async function getBaseRecipe(id: string): Promise<BaseRecipe> {
  const { data, error } = await supabase
    .from('base_recipes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as BaseRecipe;
}

// =====================================================
// DESSERT TYPES
// =====================================================

export async function getDessertTypes(): Promise<DessertType[]> {
  const { data, error } = await supabase
    .from('dessert_types')
    .select('*')
    .order('slug');

  if (error) throw error;
  return data as DessertType[];
}

// =====================================================
// FAVORITES
// =====================================================

export async function getFavorites(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('ready_recipe_id')
    .eq('user_id', userId);

  if (error) throw error;
  return data.map((f) => f.ready_recipe_id);
}

export async function toggleFavorite(
  userId: string,
  recipeId: string
): Promise<boolean> {
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('ready_recipe_id', recipeId)
    .maybeSingle();

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase
      .from('favorites')
      .insert({ user_id: userId, ready_recipe_id: recipeId });
    return true;
  }
}