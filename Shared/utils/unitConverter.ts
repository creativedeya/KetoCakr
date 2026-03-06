// ===========================================================
// FILE: shared/utils/unitConverter.ts
// ===========================================================

/**
 * Unit conversion utilities
 */

// =====================================================
// WEIGHT CONVERSIONS
// =====================================================

export function gramsToOunces(grams: number): number {
  return Math.round(grams * 0.035274 * 100) / 100;
}

export function ouncesToGrams(ounces: number): number {
  return Math.round(ounces * 28.3495 * 100) / 100;
}

export function gramsToPounds(grams: number): number {
  return Math.round(grams * 0.00220462 * 100) / 100;
}

export function poundsToGrams(pounds: number): number {
  return Math.round(pounds * 453.592 * 100) / 100;
}

// =====================================================
// VOLUME CONVERSIONS
// =====================================================

export function mlToCups(ml: number): number {
  return Math.round(ml * 0.00422675 * 100) / 100;
}

export function cupsToMl(cups: number): number {
  return Math.round(cups * 236.588 * 100) / 100;
}

export function mlToFlOz(ml: number): number {
  return Math.round(ml * 0.033814 * 100) / 100;
}

export function flOzToMl(flOz: number): number {
  return Math.round(flOz * 29.5735 * 100) / 100;
}

export function tbspToMl(tbsp: number): number {
  return Math.round(tbsp * 14.7868 * 100) / 100;
}

export function mlToTbsp(ml: number): number {
  return Math.round(ml * 0.067628 * 100) / 100;
}

export function tspToMl(tsp: number): number {
  return Math.round(tsp * 4.92892 * 100) / 100;
}

export function mlToTsp(ml: number): number {
  return Math.round(ml * 0.202884 * 100) / 100;
}

// =====================================================
// TEMPERATURE CONVERSIONS
// =====================================================

export function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32);
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return Math.round(((fahrenheit - 32) * 5) / 9);
}

export function celsiusToKelvin(celsius: number): number {
  return Math.round((celsius + 273.15) * 100) / 100;
}

export function kelvinToCelsius(kelvin: number): number {
  return Math.round((kelvin - 273.15) * 100) / 100;
}

// =====================================================
// PAN SIZE CONVERSIONS
// =====================================================

export function cmToInches(cm: number): number {
  return Math.round(cm * 0.393701 * 100) / 100;
}

export function inchesToCm(inches: number): number {
  return Math.round(inches * 2.54 * 100) / 100;
}

/**
 * Calculate scaling factor for different pan sizes
 * @param originalDiameter - Original pan diameter
 * @param newDiameter - New pan diameter
 * @param unit - Unit of measurement ('cm' or 'inches')
 */
export function calculatePanScalingFactor(
  originalDiameter: number,
  newDiameter: number,
  unit: 'cm' | 'inches' = 'cm'
): number {
  // Convert to cm if needed
  const originalCm = unit === 'inches' ? inchesToCm(originalDiameter) : originalDiameter;
  const newCm = unit === 'inches' ? inchesToCm(newDiameter) : newDiameter;

  // Calculate area ratio (π*r²)
  const originalArea = Math.PI * Math.pow(originalCm / 2, 2);
  const newArea = Math.PI * Math.pow(newCm / 2, 2);

  return Math.round((newArea / originalArea) * 100) / 100;
}

// =====================================================
// BATCH CONVERSIONS
// =====================================================

/**
 * Convert ingredient amount based on unit systems
 */
export function convertIngredientAmount(
  amount: number,
  fromUnit: string,
  toUnit: string
): number {
  const lowerFrom = fromUnit.toLowerCase();
  const lowerTo = toUnit.toLowerCase();

  // Same unit, no conversion needed
  if (lowerFrom === lowerTo) return amount;

  // Weight conversions
  if (lowerFrom === 'g' && lowerTo === 'oz') return gramsToOunces(amount);
  if (lowerFrom === 'oz' && lowerTo === 'g') return ouncesToGrams(amount);
  if (lowerFrom === 'g' && lowerTo === 'lb') return gramsToPounds(amount);
  if (lowerFrom === 'lb' && lowerTo === 'g') return poundsToGrams(amount);

  // Volume conversions
  if (lowerFrom === 'ml' && lowerTo === 'cup') return mlToCups(amount);
  if (lowerFrom === 'cup' && lowerTo === 'ml') return cupsToMl(amount);
  if (lowerFrom === 'ml' && lowerTo === 'fl oz') return mlToFlOz(amount);
  if (lowerFrom === 'fl oz' && lowerTo === 'ml') return flOzToMl(amount);
  if (lowerFrom === 'tbsp' && lowerTo === 'ml') return tbspToMl(amount);
  if (lowerFrom === 'ml' && lowerTo === 'tbsp') return mlToTbsp(amount);
  if (lowerFrom === 'tsp' && lowerTo === 'ml') return tspToMl(amount);
  if (lowerFrom === 'ml' && lowerTo === 'tsp') return mlToTsp(amount);

  // Temperature conversions
  if (lowerFrom === 'c' && lowerTo === 'f') return celsiusToFahrenheit(amount);
  if (lowerFrom === 'f' && lowerTo === 'c') return fahrenheitToCelsius(amount);

  // If no conversion found, return original
  console.warn(`No conversion found from ${fromUnit} to ${toUnit}`);
  return amount;
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get common equivalent measurements
 */
export function getCommonEquivalents(unit: string): string[] {
  const equivalents: Record<string, string[]> = {
    'g': ['oz', 'lb'],
    'oz': ['g'],
    'lb': ['g', 'kg'],
    'ml': ['cup', 'fl oz', 'tbsp', 'tsp'],
    'cup': ['ml', 'fl oz'],
    'tbsp': ['ml', 'tsp'],
    'tsp': ['ml'],
    'c': ['f', 'k'],
    'f': ['c'],
  };

  return equivalents[unit.toLowerCase()] || [];
}

/**
 * Format number for display (remove unnecessary decimals)
 */
export function formatMeasurement(value: number, precision: number = 2): string {
  const rounded = Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
  
  // Remove trailing zeros
  return rounded.toString().replace(/\.?0+$/, '');
}