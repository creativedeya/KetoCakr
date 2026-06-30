// Кои steps да генерираме за различни типове рецепти

export const STEP_GENERATION_RULES = {
  // За CURD рецепти (лимон, малина, портокал)
  curd: {
    generateSteps: [2, 5, 6, 7], // heating, cooking, thickening, final
    skipSteps: [1, 3, 4], // raw ingredients, eggs, tempering (hard to capture)
    reason: 'Focus on cooking process and results'
  },
  
  // За CREAM рецепти
  cream: {
    generateSteps: [2, 3, 5], // mixing, whipping, final
    skipSteps: [1, 4],
    reason: 'Show transformation and texture'
  },
  
  // За CAKE/BROWNIE
  cake: {
    generateSteps: [3, 4, 6], // batter, pan, baked result
    skipSteps: [1, 2, 5],
    reason: 'Show key visual stages'
  },
  
  // Default - generate 40-50% of steps
  default: {
    strategy: 'every_other', // Generate steps 2, 4, 6, etc
    minSteps: 2,
    maxSteps: 4
  }
};

export function selectStepsToGenerate(recipeName, totalSteps) {
  const lower = recipeName.toLowerCase();
  
  // Detect recipe type
  let config;
  if (lower.includes('curd') || lower.includes('кърд')) {
    config = STEP_GENERATION_RULES.curd;
  } else if (lower.includes('cream') || lower.includes('крем') || lower.includes('mousse')) {
    config = STEP_GENERATION_RULES.cream;
  } else if (lower.includes('cake') || lower.includes('brownie')) {
    config = STEP_GENERATION_RULES.cake;
  } else {
    // Default strategy: every other step
    const steps = [];
    for (let i = 2; i <= totalSteps; i += 2) {
      steps.push(i);
      if (steps.length >= STEP_GENERATION_RULES.default.maxSteps) break;
    }
    return steps;
  }
  
  // Return only steps that exist
  return config.generateSteps.filter(s => s <= totalSteps);
}