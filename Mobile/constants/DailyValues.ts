/**
 * Recommended Daily Allowances (RDA) for Keto Diet
 * Source: Standard keto macros + USDA guidelines
 */

export const DAILY_VALUES = {
  // Макроси (keto-specific)
  calories: 2000,
  protein: 150,      // g (for active person)
  fat: 165,          // g (75% of calories)
  carbs: 50,         // g (10% - strict keto)
  fiber: 25,         // g

  // Детайлни въглехидрати/мазнини
  sugar: 25,         // g (added sugars limit)
  saturated_fat: 20, // g
  cholesterol: 300,  // mg

  // Минерали (mg)
  sodium: 2300,
  calcium: 1000,
  iron: 18,
  magnesium: 400,
  potassium: 4700,
  zinc: 11,

  // Витамини
  vitamin_a: 900,    // mcg
  vitamin_c: 90,     // mg
  vitamin_d: 20,     // mcg
};

/**
 * Calculate % Daily Value
 */
export function calculateDV(value: number, nutrient: keyof typeof DAILY_VALUES): number {
  const dv = DAILY_VALUES[nutrient];
  if (!dv) return 0;
  return (value / dv) * 100;
}

/**
 * Format nutrient value with unit
 */
export function formatNutrientValue(value: number, nutrient: string): string {
  if (value === null || value === undefined) return '-';

  // mcg nutrients
  if (['vitamin_a', 'vitamin_d'].includes(nutrient)) {
    return `${value.toFixed(1)}mcg`;
  }

  // mg nutrients (all minerals + some vitamins)
  if (['sodium', 'calcium', 'iron', 'magnesium', 'potassium', 'zinc',
       'cholesterol', 'vitamin_c'].includes(nutrient)) {
    return `${value.toFixed(1)}mg`;
  }

  // g nutrients (everything else)
  return `${value.toFixed(1)}g`;
}
