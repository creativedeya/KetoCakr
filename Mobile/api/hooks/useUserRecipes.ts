// ===========================================================
// User Recipes Hooks - UPDATED for new schema
// ===========================================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getUserRecipes, 
  createUserRecipe, 
  deleteUserRecipe, 
  checkUserRecipeLimit 
} from '../recipes';
import { useAuthStore } from '../../store/useAuthStore';
import { SelectedComponent } from '../../../shared/types';

// ============================================
// GET USER RECIPES
// ============================================
export function useUserRecipes() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['userRecipes', user?.id],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated');
      return getUserRecipes(user.id);
    },
    enabled: !!user,
  });
}

// ============================================
// CREATE USER RECIPE
// ============================================
export function useCreateUserRecipe() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (recipe: {
      name: string;
      dessert_type_id: number;
      total_servings: number;
      components: Array<{
        recipe_role_id: number;
        base_recipe_id: string;
        servings_multiplier: number;
        name: string;
      }>;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Check recipe limit first
      const canCreate = await checkUserRecipeLimit(user.id);
      if (!canCreate) {
        throw new Error('Достигнахте лимита от 3 рецепти. Моля, upgrade-нете до Premium за неограничен достъп.');
      }

      // Transform components to match SelectedComponent type
      const selectedComponents: SelectedComponent[] = recipe.components.map(comp => ({
        recipe_role_id: comp.recipe_role_id,
        base_recipe_id: comp.base_recipe_id,
        servings_multiplier: comp.servings_multiplier,
        name: comp.name,
      }));

      return createUserRecipe(
        user.id,
        recipe.dessert_type_id,
        recipe.name,
        selectedComponents,
        recipe.total_servings
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRecipes'] });
    },
  });
}

// ============================================
// DELETE USER RECIPE
// ============================================
export function useDeleteUserRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipeId: string) => deleteUserRecipe(recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRecipes'] });
    },
  });
}

// ============================================
// CHECK RECIPE LIMIT
// ============================================
export function useRecipeLimit() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['recipeLimit', user?.id],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated');
      return checkUserRecipeLimit(user.id);
    },
    enabled: !!user,
  });
}
