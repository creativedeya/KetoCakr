// ===========================================================
// FILE: mobile/api/hooks/useBaseRecipes.ts
// UPDATED: Using correct schema and shared types
// ===========================================================
import { useQuery } from '@tanstack/react-query';
import { getBaseRecipesByRole, getBaseRecipe } from '../recipes';

// ============================================
// BASE RECIPES HOOK
// ============================================
export function useBaseRecipes(recipeRoleId?: number, dessertTypeId?: number) {
  return useQuery({
    queryKey: ['baseRecipes', recipeRoleId, dessertTypeId],
    queryFn: () => {
      if (!recipeRoleId) throw new Error('Recipe role ID is required');
      return getBaseRecipesByRole(recipeRoleId, dessertTypeId);
    },
    enabled: !!recipeRoleId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// ============================================
// SINGLE BASE RECIPE HOOK
// ============================================
export function useBaseRecipe(recipeId: string) {
  return useQuery({
    queryKey: ['baseRecipe', recipeId],
    queryFn: () => getBaseRecipe(recipeId),
    enabled: !!recipeId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
