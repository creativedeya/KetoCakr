// ===========================================================
// FILE: shared/utils/recipeCalculator.ts
// ===========================================================

import {
  BaseRecipe,
  CombinedRecipe,
  DessertType,
  Ingredient,
  Nutrition,
} from '../types';

/**
 * Combines 4 base recipes into a complete dessert recipe
 */
export function combineRecipes(
  dessertType: DessertType,
  crust: BaseRecipe,
  cream: BaseRecipe,
  filling: BaseRecipe,
  decoration: BaseRecipe,
  customName?: string,
  language: 'en' | 'bg' = 'en'
): CombinedRecipe {
  // Aggregate ingredients
  const allIngredients = [
    ...crust.ingredients,
    ...cream.ingredients,
    ...filling.ingredients,
    ...decoration.ingredients,
  ];

  const aggregatedIngredients = aggregateIngredients(allIngredients);

  // Sum nutrition
  const totalNutrition = sumNutrition([
    crust.nutrition,
    cream.nutrition,
    filling.nutrition,
    decoration.nutrition,
  ]);

  // Sum prep time
  const totalPrepTime =
    (crust.prep_time_minutes || 0) +
    (cream.prep_time_minutes || 0) +
    (filling.prep_time_minutes || 0) +
    (decoration.prep_time_minutes || 0);

  // Get assembly instructions
  const assemblyInstructions =
    language === 'bg'
      ? dessertType.assembly_instructions_bg
      : dessertType.assembly_instructions_en;

  return {
    name: customName || `${dessertType.name_en} with ${crust.name_en}`,
    dessert_type: dessertType,
    components: { crust, cream, filling, decoration },
    aggregated_ingredients: aggregatedIngredients,
    combined_steps: {
      crust: crust.steps,
      cream: cream.steps,
      filling: filling.steps,
      decoration: decoration.steps,
      assembly: assemblyInstructions?.split('\n').filter(s => s.trim()) || [],
    },
    total_nutrition: totalNutrition,
    total_prep_time: totalPrepTime,
  };
}

/**
 * Aggregates ingredients, combining same items with same units
 */
export function aggregateIngredients(ingredients: Ingredient[]): Ingredient[] {
  const map = new Map<string, Ingredient>();

  ingredients.forEach((ing) => {
    const key = `${ing.name.toLowerCase().trim()}-${ing.unit.toLowerCase()}`;
    
    if (map.has(key)) {
      const existing = map.get(key)!;
      existing.amount += ing.amount;
    } else {
      map.set(key, { ...ing });
    }
  });

  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

/**
 * Sums nutrition from multiple recipes
 */
export function sumNutrition(nutritions: Nutrition[]): Nutrition {
  return nutritions.reduce(
    (acc, curr) => ({
      calories: acc.calories + curr.calories,
      protein: acc.protein + curr.protein,
      fat: acc.fat + curr.fat,
      carbs: acc.carbs + curr.carbs,
      fiber: acc.fiber + curr.fiber,
      servings: acc.servings + curr.servings,
    }),
    {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      servings: 0,
    }
  );
}

/**
 * Calculates nutrition per serving
 */
export function calculatePerServing(nutrition: Nutrition): Nutrition {
  const { servings, ...rest } = nutrition;
  if (servings === 0) return nutrition;

  return {
    calories: Math.round(rest.calories / servings),
    protein: Math.round((rest.protein / servings) * 10) / 10,
    fat: Math.round((rest.fat / servings) * 10) / 10,
    carbs: Math.round((rest.carbs / servings) * 10) / 10,
    fiber: Math.round((rest.fiber / servings) * 10) / 10,
    servings: 1,
  };
}

/**
 * Calculates nutrition per 100g
 * @param totalWeight - Total weight in grams
 */
export function calculatePer100g(
  nutrition: Nutrition,
  totalWeight: number
): Nutrition {
  if (totalWeight === 0) return nutrition;

  const factor = 100 / totalWeight;
  const { servings, ...rest } = nutrition;

  return {
    calories: Math.round(rest.calories * factor),
    protein: Math.round(rest.protein * factor * 10) / 10,
    fat: Math.round(rest.fat * factor * 10) / 10,
    carbs: Math.round(rest.carbs * factor * 10) / 10,
    fiber: Math.round(rest.fiber * factor * 10) / 10,
    servings: 0,
  };
}

/**
 * Scales recipe for different pan sizes
 * @param baseSize - Original pan diameter in cm (default 18cm)
 * @param targetSize - Target pan diameter in cm
 */
export function scaleRecipeForPanSize(
  ingredients: Ingredient[],
  baseSize: number = 18,
  targetSize: number
): Ingredient[] {
  // Area scaling factor (circular pans)
  const scaleFactor = Math.pow(targetSize / baseSize, 2);

  return ingredients.map((ing) => ({
    ...ing,
    amount: Math.round(ing.amount * scaleFactor * 10) / 10,
  }));
}

/**
 * Estimate total weight from ingredients
 */
export function estimateTotalWeight(ingredients: Ingredient[]): number {
  return ingredients.reduce((total, ing) => {
    // Simple conversion - treat most units as grams
    // More sophisticated conversion can be added
    let grams = ing.amount;

    // Basic conversions
    if (ing.unit === 'ml') grams = ing.amount;
    if (ing.unit === 'cup') grams = ing.amount * 240;
    if (ing.unit === 'tbsp') grams = ing.amount * 15;
    if (ing.unit === 'tsp') grams = ing.amount * 5;

    return total + grams;
  }, 0);
}