// =====================================================
// EQUIPMENT LIBRARY - Product Placement System
// Ensures consistent brand/model appearance in images
// =====================================================

/**
 * Equipment Library Configuration
 * 
 * Add reference images for each equipment piece
 * AI will use these as visual guides for consistency
 */

export const EQUIPMENT_LIBRARY = {
  // Electric Hand Mixer (HANDHELD - for active mixing with hands visible)
  electricMixer: {
    brand: 'KitchenAid',
    model: 'KHM7210 7-Speed Digital',
    color: 'Empire Red',
    description: 'KitchenAid 7-Speed Digital HAND MIXER (handheld, portable) in Empire Red with Turbo Beater II accessories',
    referenceImage: '/equipment/kitchenaid-hand-mixer-red.png',
    technicalSpec: 'HANDHELD device: Empire Red glossy finish, ergonomic soft grip handle held in both hands, stainless steel Turbo Beater II attachments, digital speed display, compact portable design with rounded styling. User holds mixer body with both hands while beaters mix in bowl.'
  },

  // Stand Mixer (STATIONARY - sits on counter, NOT held in hands)
  standMixer: {
    brand: 'KitchenAid',
    model: 'KSM150FEER Artisan Series',
    color: 'Empire Red',
    description: 'KitchenAid Artisan Series 5-Quart Tilt-Head STAND MIXER (stationary, sits on counter) in Empire Red with glossy enamel finish',
    referenceImage: '/equipment/kitchenaid-artisan-red.png',
    technicalSpec: 'STATIONARY countertop appliance: Iconic tilt-head design, heavy base sits on counter (NOT handheld), glossy Empire Red enamel body, stainless steel 5-quart bowl with handle locks onto base, planetary mixing action with C-dough hook or flat beater attachment, 10 speeds, distinctive rounded retro styling. Mixer stands upright on counter - hands may touch controls or tilt head but DO NOT hold the body.'
  },

  // Immersion Blender
  immersionBlender: {
    brand: 'Braun',
    model: 'MQ7035X',
    color: 'Stainless Steel',
    description: 'Braun MultiQuick 7 immersion blender, stainless steel body',
    referenceImage: '/equipment/braun-blender-steel.png',
    technicalSpec: 'Long stainless steel stick blender, ergonomic grip, blending bell at bottom'
  },

  // Food Processor
  foodProcessor: {
    brand: 'Cuisinart',
    model: 'DFP-14BCNY',
    color: 'Brushed Steel',
    description: 'Cuisinart 14-Cup food processor, brushed stainless steel',
    referenceImage: '/equipment/cuisinart-processor-steel.png',
    technicalSpec: 'Large transparent bowl, steel base, white plastic lid'
  },

  // Whisk (Manual)
  balloonWhisk: {
    brand: 'OXO',
    model: 'Good Grips',
    color: 'Stainless Steel',
    description: 'OXO Good Grips 11-inch balloon whisk, stainless steel wires with black handle',
    referenceImage: '/equipment/oxo-whisk.png',
    technicalSpec: 'Classic balloon whisk shape, thin stainless steel wires, black rubber grip handle'
  },

  // Spatula
  spatula: {
    brand: 'Le Creuset',
    model: 'Craft Series',
    color: 'Beechwood',
    description: 'Le Creuset beechwood spatula with natural wood finish',
    referenceImage: '/equipment/lecreuset-spatula.png',
    technicalSpec: 'Light beechwood spatula, smooth natural wood grain, traditional shape'
  },

  // Mixing Bowls
  mixingBowl: {
    brand: 'Pyrex',
    model: 'Smart Essentials',
    color: 'Clear Glass',
    description: 'Pyrex 2-quart glass mixing bowl, clear with measurement marks',
    referenceImage: '/equipment/pyrex-bowl-clear.png',
    technicalSpec: 'Clear tempered glass bowl, slight taper, no handles, measurement marks on side'
  },

  // Baking Sheet
  bakingSheet: {
    brand: 'Nordic Ware',
    model: 'Natural Aluminum',
    color: 'Silver Aluminum',
    description: 'Nordic Ware natural aluminum baking sheet, half-sheet size',
    referenceImage: '/equipment/nordicware-sheet.png',
    technicalSpec: 'Uncoated aluminum sheet pan, silver finish, reinforced rim'
  }
};

/**
 * Get equipment specification for prompt
 */
export function getEquipmentSpec(equipmentType: string): string {
  const equipment = EQUIPMENT_LIBRARY[equipmentType as keyof typeof EQUIPMENT_LIBRARY];
  
  if (!equipment) {
    return 'standard kitchen equipment';
  }

  return `${equipment.brand} ${equipment.model} in ${equipment.color}. ${equipment.technicalSpec}`;
}

/**
 * Get reference image path
 */
export function getEquipmentReference(equipmentType: string): string | null {
  const equipment = EQUIPMENT_LIBRARY[equipmentType as keyof typeof EQUIPMENT_LIBRARY];
  return equipment?.referenceImage || null;
}

/**
 * Detect equipment from step description
 */
export function detectEquipment(description: string): string | null {
  const desc = description.toLowerCase();

  // Stand mixers (планетарен) - keywords: stand, планетарен, настолен
  if (desc.includes('stand mixer') || desc.includes('планетарен') || desc.includes('настолен миксер')) {
    return 'standMixer';
  }

  // Electric hand mixers (ръчен) - default for "миксер" / "mixer"
  if (desc.includes('миксер') || desc.includes('mixer') || desc.includes('electric')) {
    return 'electricMixer'; // Hand mixer is default
  }

  // Immersion blenders
  if (desc.includes('блендер') && desc.includes('пръчков')) return 'immersionBlender';
  if (desc.includes('immersion blender') || desc.includes('stick blender')) return 'immersionBlender';

  // Food processor
  if (desc.includes('кухненски робот') || desc.includes('food processor')) return 'foodProcessor';

  // Manual whisk
  if (desc.includes('бъркалка') || desc.includes('whisk')) return 'balloonWhisk';

  // Spatula
  if (desc.includes('лъжица') || desc.includes('spatula')) return 'spatula';

  // Bowl
  if (desc.includes('купа') || desc.includes('bowl')) return 'mixingBowl';

  return null;
}

/**
 * Build equipment-specific prompt enhancement
 */
export function buildEquipmentPrompt(description: string): string {
  const equipmentType = detectEquipment(description);
  
  if (!equipmentType) {
    return '';
  }

  const spec = getEquipmentSpec(equipmentType);
  const equipment = EQUIPMENT_LIBRARY[equipmentType as keyof typeof EQUIPMENT_LIBRARY];

  return `
EQUIPMENT SPECIFICATION:
- Brand: ${equipment.brand}
- Model: ${equipment.model}
- Description: ${equipment.description}
- Technical details: ${spec}

CRITICAL: Use EXACTLY this equipment model. Do not substitute with generic or different brands.
Match the color, shape, and design details precisely.
`;
}

// Example usage:
// const equipmentPrompt = buildEquipmentPrompt("Разбийте с миксер");
// Add equipmentPrompt to your Imagen generation prompt