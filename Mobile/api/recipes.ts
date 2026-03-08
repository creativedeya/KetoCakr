// ===========================================================
// FILE: mobile/api/recipes.ts - FIXED for actual schema
// ===========================================================
import { supabase } from '../lib/supabase';
import {
  DessertType,
  BaseRecipe,
  RecipeRole,
  UserRecipe,
  SelectedComponent
} from '../../shared/types';

// =====================================================
// DESSERT TYPES
// =====================================================

export async function getDessertTypes(): Promise<DessertType[]> {
  const { data, error } = await supabase
    .from('dessert_types')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw error;
  return data as DessertType[];
}

// =====================================================
// RECIPE ROLES
// =====================================================

export async function getRecipeRoles(): Promise<RecipeRole[]> {
  const { data, error } = await supabase
    .from('recipe_roles')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw error;
  return data as RecipeRole[];
}

// =====================================================
// BASE RECIPES
// =====================================================

export async function getBaseRecipesByRole(
  recipeRoleId: number,
  dessertTypeId?: number
): Promise<BaseRecipe[]> {
  let query = supabase
    .from('base_recipes')
    .select('*')
    .eq('recipe_role_id', recipeRoleId);

  // Filter by compatible dessert type if provided
  if (dessertTypeId) {
    query = query.contains('compatible_dessert_types', [dessertTypeId]);
  }

  query = query.order('name', { ascending: true });

  const { data, error } = await query;
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
// USER RECIPES
// =====================================================

export async function getUserRecipes(userId: string): Promise<UserRecipe[]> {
  // First, get recipes without join
  const { data: recipes, error } = await supabase
    .from('user_recipes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!recipes) return [];
  
  // Then fetch dessert types separately
  const dessertTypeIds = [...new Set(recipes.map(r => r.dessert_type_id))];
  const { data: dessertTypes } = await supabase
    .from('dessert_types')
    .select('*')
    .in('id', dessertTypeIds);
  
  // Combine the data
  return recipes.map(recipe => ({
    ...recipe,
    dessert_type: dessertTypes?.find(dt => dt.id === recipe.dessert_type_id),
  })) as UserRecipe[];
}

export async function createUserRecipe(
  userId: string,
  dessertTypeId: number,
  recipeName: string,
  selectedComponents: SelectedComponent[],
  totalServings: number
): Promise<UserRecipe> {
  console.log('createUserRecipe called with:', {
    userId,
    dessertTypeId,
    recipeName,
    totalServings,
    componentsCount: selectedComponents.length,
  });
  
  const { data, error } = await supabase
    .from('user_recipes')
    .insert({
      user_id: userId,
      dessert_type_id: dessertTypeId,
      name: recipeName,  // IMPORTANT: Actually send the name!
      selected_components: selectedComponents,
      total_servings: totalServings,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Insert error:', error);
    throw error;
  }
  
  console.log('Created recipe:', data);
  
  // Then fetch the dessert type separately
  const { data: dessertType } = await supabase
    .from('dessert_types')
    .select('*')
    .eq('id', dessertTypeId)
    .single();
  
  return {
    ...data,
    dessert_type: dessertType || undefined,
  } as UserRecipe;
}

export async function deleteUserRecipe(id: string): Promise<void> {
  const { error } = await supabase
    .from('user_recipes')
    .delete()
    .eq('id', id);
    
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
// FAVORITES (if needed later)
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