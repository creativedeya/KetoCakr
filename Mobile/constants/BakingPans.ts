// ===========================================================
// BakingPans — стандартни форми и scaleFactors
// Базов стандарт: 18 см кръгла = 8 порции = scaleFactor 1.00
// ===========================================================

export interface BakingPan {
  servings: number;
  metricSize: string;    // "18 см"
  imperialSize: string;  // "7\""
  volumeLiters: number;  // 1.4
  scaleFactor: number;   // 1.00
}

export interface RectangularPan {
  servings: number;
  metricSize: string;    // "23×33 см"
  imperialSize: string;  // "9×13\""
  sheetName: string;     // "Quarter Sheet"
  scaleFactor: number;
}

export const ROUND_PANS: BakingPan[] = [
  { servings: 6,  metricSize: '16 см',  imperialSize: '6"',  volumeLiters: 1.0, scaleFactor: 0.75 },
  { servings: 8,  metricSize: '18 см',  imperialSize: '7"',  volumeLiters: 1.4, scaleFactor: 1.00 }, // BASE
  { servings: 10, metricSize: '20 см',  imperialSize: '8"',  volumeLiters: 1.9, scaleFactor: 1.36 },
  { servings: 12, metricSize: '22 см',  imperialSize: '9"',  volumeLiters: 2.4, scaleFactor: 1.71 },
  { servings: 14, metricSize: '24 см',  imperialSize: '9"',  volumeLiters: 2.7, scaleFactor: 1.93 },
  { servings: 18, metricSize: '26 см',  imperialSize: '10"', volumeLiters: 3.0, scaleFactor: 2.14 },
  { servings: 20, metricSize: '28 см',  imperialSize: '11"', volumeLiters: 3.7, scaleFactor: 2.64 },
];

export const RECTANGULAR_PANS: RectangularPan[] = [
  { servings: 20, metricSize: '23×33 см', imperialSize: '9×13"',  sheetName: 'Quarter Sheet', scaleFactor: 2.64 },
  { servings: 35, metricSize: '30×45 см', imperialSize: '12×18"', sheetName: 'Half Sheet',    scaleFactor: 4.62 },
];

export const BASE_PAN = ROUND_PANS[1]; // 18 см, 8 порции, scaleFactor 1.00
export const BASE_SERVINGS = 8;

// Helper: получи pan по брой порции
export function getPanByServings(servings: number): BakingPan | RectangularPan | undefined {
  return ROUND_PANS.find(p => p.servings === servings)
    || RECTANGULAR_PANS.find(p => p.servings === servings);
}

// Helper: форматирай pan label според unit system
export function formatPanLabel(pan: BakingPan | RectangularPan, unitSystem: 'metric' | 'imperial'): string {
  const size = unitSystem === 'metric' ? pan.metricSize : pan.imperialSize;
  return `${pan.servings} ${unitSystem === 'metric' ? 'порции' : 'servings'} (${size})`;
}
