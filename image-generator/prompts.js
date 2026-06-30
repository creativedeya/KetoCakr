// =====================================================
// Emma's Cake Studio Style Prompts
// Professional food photography prompt templates
// =====================================================

export const PHOTO_STYLES = {
  overhead: {
    name: 'Overhead (Knolling)',
    prompt: 'Professional overhead flat lay food photography, directly from above, bird\'s eye view perspective'
  },
  angle45: {
    name: '45-degree angle',
    prompt: 'Professional 45-degree elevated angle food photography'
  },
  closeup: {
    name: 'Close-up detail',
    prompt: 'Professional close-up detail food photography, shallow depth of field'
  },
  threequarter: {
    name: '3/4 view',
    prompt: 'Professional three-quarter view food photography'
  }
};

export const LIGHTING_STYLES = {
  natural: 'Natural daylight from window, soft diffused lighting',
  studio: 'Professional studio lighting, controlled soft shadows',
  golden: 'Golden hour warm lighting, soft glowing ambiance',
  bright: 'Bright clean lighting, minimal shadows'
};

export const BACKGROUND_STYLES = {
  marble: 'Clean white marble countertop surface',
  wood: 'Warm natural wood surface, rustic aesthetic',
  concrete: 'Light grey concrete surface, modern minimal',
  white: 'Pure white background, clean and simple'
};

export const EMMA_STUDIO_BASE = `
Emma's Cake Studio aesthetic.
Clean, minimal, professional food magazine quality.
High-end pastry photography.
Realistic, not overly stylized.
Focus on the food and action.
No text, no numbers, no labels visible.
`;

/**
 * Generate prompt for recipe step image
 */
export function generateStepPrompt(stepData) {
  const {
    stepNumber,
    stepDescription,
    recipeName,
    style = 'overhead',
    lighting = 'natural',
    background = 'marble'
  } = stepData;

  const photoStyle = PHOTO_STYLES[style]?.prompt || PHOTO_STYLES.overhead.prompt;
  const lightingDesc = LIGHTING_STYLES[lighting] || LIGHTING_STYLES.natural;
  const backgroundDesc = BACKGROUND_STYLES[background] || BACKGROUND_STYLES.marble;

  return `
${photoStyle} depicting: ${stepDescription}

Context: This is step ${stepNumber} in making ${recipeName}.

Style requirements:
- ${backgroundDesc}
- ${lightingDesc}
- ${EMMA_STUDIO_BASE}

Composition:
- Show hands performing the action when relevant
- Include only necessary ingredients and tools visible in frame
- Center the main action/ingredient
- Clean, uncluttered composition
- Square format composition

Quality: High resolution, sharp focus on main subject, professional food photography standard.
`.trim();
}

/**
 * Generate prompt for hero/final product image
 */
export function generateHeroPrompt(recipeData) {
  const {
    recipeName,
    recipeNameEn,
    description,
    components = [],
    style = 'angle45',
    lighting = 'natural',
    background = 'marble',
    plating = 'elegant'
  } = recipeData;

  const photoStyle = PHOTO_STYLES[style]?.prompt || PHOTO_STYLES.angle45.prompt;
  const lightingDesc = LIGHTING_STYLES[lighting] || LIGHTING_STYLES.natural;
  const backgroundDesc = BACKGROUND_STYLES[background] || BACKGROUND_STYLES.marble;

  // Build component description
  let componentDesc = '';
  if (components.length > 0) {
    componentDesc = `
Layers visible in cross-section:
${components.map(c => `- ${c.name}: ${c.description || ''}`).join('\n')}
`;
  }

  return `
${photoStyle} of an elegant ${recipeNameEn || recipeName}.

${description || ''}

${componentDesc}

Plating:
- ${plating === 'elegant' ? 'Elegant white porcelain plate' : 'Rustic ceramic plate'}
- One slice cut to reveal beautiful layers inside
- Minimal garnish, focus on the dessert
- ${backgroundDesc}

Style requirements:
- ${lightingDesc}
- ${EMMA_STUDIO_BASE}

Composition:
- Main dessert as hero, perfectly centered or using rule of thirds
- Shallow depth of field, dessert in sharp focus
- Optional: small props like fork, napkin (minimal, not distracting)
- Professional restaurant/bakery quality presentation

Quality: Magazine cover quality, high resolution, mouthwatering appeal.
`.trim();
}

/**
 * Generate prompt for ingredient knolling shot
 */
export function generateKnollingPrompt(ingredients, recipeName) {
  return `
Professional overhead flat lay food photography, knolling composition.

All ingredients for ${recipeName}, artistically arranged:
${ingredients.map(ing => `- ${ing.quantity} ${ing.unit} ${ing.name} ${ing.vessel ? `in ${ing.vessel}` : ''}`).join('\n')}

Style requirements:
- Clean white marble countertop surface
- Natural daylight, soft shadows
- All items meticulously arranged in organized grid or circular pattern
- ${EMMA_STUDIO_BASE}

Composition:
- Perfect symmetry or pleasing asymmetric balance
- Each ingredient clearly visible and identifiable
- Appropriate bowls, measuring cups, and containers
- Square format, centered composition
- Minimal negative space, but not crowded

Quality: High-end food magazine editorial quality, sharp focus throughout.
`.trim();
}

/**
 * Translate Bulgarian text to English using simple word mapping
 * (For production, use Gemini API for translation)
 */
export function translateToEnglish(bulgarianText) {
  // Simple translations for common recipe terms
  const translations = {
    'яйца': 'eggs',
    'брашно': 'flour',
    'захар': 'sugar',
    'масло': 'butter',
    'мляко': 'milk',
    'какао': 'cocoa',
    'ванилия': 'vanilla',
    'шоколад': 'chocolate',
    'сметана': 'cream',
    'разбийте': 'beat',
    'добавете': 'add',
    'смесете': 'mix',
    'изсипете': 'pour',
    'печете': 'bake',
    'блат': 'cake layer',
    'крем': 'cream',
    'плънка': 'filling',
    'декор': 'decoration',
    'торта': 'cake',
    'купа': 'bowl',
    'чаша': 'cup',
  };

  let translated = bulgarianText.toLowerCase();
  Object.entries(translations).forEach(([bg, en]) => {
    translated = translated.replace(new RegExp(bg, 'gi'), en);
  });

  return translated;
}
