// ===========================================================
// FILE: mobile/api/hooks/useRecipeData.ts
// UPDATED: Using shared types and correct field names
// ===========================================================
import { useQuery } from '@tanstack/react-query';
import { getDessertTypes, getRecipeRoles } from '../recipes';

// ============================================
// DESSERT TYPES HOOK
// ============================================
export function useDessertTypes() {
  return useQuery({
    queryKey: ['dessertTypes'],
    queryFn: getDessertTypes,
    staleTime: 1000 * 60 * 60, // 1 hour - this data rarely changes
  });
}

// ============================================
// RECIPE ROLES HOOK
// ============================================
export function useRecipeRoles() {
  return useQuery({
    queryKey: ['recipeRoles'],
    queryFn: getRecipeRoles,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
