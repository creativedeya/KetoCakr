// ===========================================================
// FILE: mobile/lib/recipeCalculator.ts
// PART 1: Recipe calculation helpers for mobile
// ===========================================================

export interface CalculatedIngredient {
  ingredient: string;
  quantity: number;
  unit: string;
  originalQuantity: number;
}

export interface RecipeComponent {
  base_recipe: {
    name_bg: string;
    ingredients?: Array<{
      ingredient: string;
      quantity: number;
      unit: string;
    }>;
    instructions?: Array<{
      step_number: number;
      instruction_bg: string;
    }>;
  };
  servings_multiplier: number;
}

/**
 * Calculate scaled ingredient quantities based on servings multiplier
 */
export function calculateScaledIngredients(
  ingredients: Array<{ ingredient: string; quantity: number; unit: string }>,
  multiplier: number
): CalculatedIngredient[] {
  return ingredients.map(ing => ({
    ingredient: ing.ingredient,
    quantity: Math.round(ing.quantity * multiplier * 10) / 10,
    unit: ing.unit,
    originalQuantity: ing.quantity,
  }));
}

/**
 * Aggregate ingredients from multiple components
 * Combines same ingredients with same units
 */
export function aggregateIngredients(
  components: RecipeComponent[]
): CalculatedIngredient[] {
  const ingredientMap = new Map<string, CalculatedIngredient>();

  components.forEach(component => {
    const ingredients = component.base_recipe.ingredients || [];
    const scaledIngredients = calculateScaledIngredients(
      ingredients,
      component.servings_multiplier
    );

    scaledIngredients.forEach(ing => {
      const key = `${ing.ingredient.toLowerCase()}-${ing.unit.toLowerCase()}`;
      
      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key)!;
        existing.quantity = Math.round((existing.quantity + ing.quantity) * 10) / 10;
      } else {
        ingredientMap.set(key, { ...ing });
      }
    });
  });

  return Array.from(ingredientMap.values()).sort((a, b) =>
    a.ingredient.localeCompare(b.ingredient, 'bg')
  );
}

/**
 * Format ingredient for display
 */
export function formatIngredient(ing: CalculatedIngredient): string {
  return `${ing.quantity} ${ing.unit} ${ing.ingredient}`;
}
