// =====================================================
// ENHANCED API - Gemini Primary + Replicate Fallback
// File: app/api/generate-step-image/route.ts
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Replicate from 'replicate';
import { generateImageWithGemini, translatePrompt } from '@/lib/providers/gemini-image';
import type { GenerationSettings } from '@/lib/types/generationSettings';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;

const CONSTANT_STYLE = {
  clothing: 'beige sweater sleeves',
  surface: 'white marble counter',
  angle: '60-degree downward angle (POV)',
  lighting: 'Soft natural window light, bright and airy',
  aesthetic: 'Professional culinary blog aesthetic, high resolution, macro focus',

  // VISUAL ANCHORS for consistency across steps
  container: 'medium white ceramic mixing bowl with thick rounded rim and smooth finish',
  plate: 'small round white ceramic plate with flat surface',
  mixer: 'stainless steel electric hand mixer with chrome beaters and silver body',
  whisk: 'stainless steel balloon whisk with metal handle',
  spatula: 'wooden spatula with light wood finish'
};

interface SceneInterpretation {
  sceneType: 'static' | 'active';
  mainElements: string[];
  handAction: string;
  cameraFocus: string;
  visualVibe: string;
}

/**
 * Auto-translate common user hints to AI instructions
 */
function translateHints(customHints?: string): {
  showHands: boolean;
  cameraAngle?: string;
  additionalInstructions: string;
} {
  if (!customHints) {
    return { showHands: true, additionalInstructions: '' };
  }

  const hints = customHints.toLowerCase();
  const instructions: string[] = [];

  // Detect "no hands" variants
  const showHands = !(
    hints.includes('no hands') ||
    hints.includes('без ръце') ||
    hints.includes('no people') ||
    hints.includes('hands off')
  );

  // Detect camera angle preferences
  let cameraAngle: string | undefined;
  if (hints.includes('top view') || hints.includes('overhead') || hints.includes('отгоре')) {
    cameraAngle = 'Directly overhead (90-degree bird\'s eye view)';
    instructions.push('Camera positioned directly above, looking straight down');
  } else if (hints.includes('side view') || hints.includes('отстрани')) {
    cameraAngle = '45-degree side angle';
    instructions.push('Camera at 45-degree angle from the side');
  }

  // Detect specific props/items to show
  const showMatch = hints.match(/show\s+([^,]+)/g);
  if (showMatch) {
    const items = showMatch.map(m => m.replace('show ', '').trim());
    instructions.push(`Include in frame: ${items.join(', ')}`);
  }

  // Detect minimalism preference
  if (hints.includes('minimal') || hints.includes('минимал')) {
    instructions.push('Ultra minimalist composition, maximum 2 objects');
  }

  // Detect lighting preferences
  if (hints.includes('dark') || hints.includes('moody') || hints.includes('тъмн')) {
    instructions.push('Moody, dramatic lighting with shadows');
  } else if (hints.includes('bright') || hints.includes('airy') || hints.includes('светъл')) {
    instructions.push('Bright, airy, high-key lighting');
  }

  // Keep original hints as additional context
  const additionalInstructions = instructions.length > 0
    ? instructions.join('. ') + '. ' + customHints
    : customHints;

  return {
    showHands,
    cameraAngle,
    additionalInstructions
  };
}

interface RecipeContext {
  recipeName?: string;
  ingredients?: string;
  utensils?: string;
  stepNumber?: number;
  refinement?: string;
}

/**
 * AI interpreter with custom hints support
 */
async function interpretStepWithAI(
  stepDescription: string,
  customHints?: string,
  recipeContext?: RecipeContext
): Promise<SceneInterpretation> {
  const translated = translateHints(customHints);

  const hintsSection = translated.additionalInstructions
    ? `\n\n### USER CUSTOM INSTRUCTIONS\n${translated.additionalInstructions}\nFollow these instructions carefully and prioritize them over defaults.`
    : '';

  const handsConstraint = !translated.showHands
    ? `\n\n### CRITICAL CONSTRAINT\nNO HANDS OR PEOPLE should be visible in this image. Show only the ingredient/object at rest. This is a still life composition without human presence.`
    : '';

  const recipeSection = recipeContext?.recipeName
    ? `\n\n### RECIPE CONTEXT\nRecipe: ${recipeContext.recipeName}${recipeContext.stepNumber ? ` (Step ${recipeContext.stepNumber})` : ''}${recipeContext.ingredients ? `\nAvailable ingredients: ${recipeContext.ingredients}` : ''}${recipeContext.utensils ? `\nEquipment/utensils: ${recipeContext.utensils}` : ''}\nUse this context to accurately identify which specific ingredients and tools should appear in the frame.${recipeContext.refinement ? `\n\n### REFINEMENT REQUEST (HIGH PRIORITY)\nThe user wants to adjust the image: ${recipeContext.refinement}\nIncorporate these specific adjustments while keeping everything else the same.` : ''}`
    : recipeContext?.refinement
      ? `\n\n### REFINEMENT REQUEST (HIGH PRIORITY)\nThe user wants to adjust the image: ${recipeContext.refinement}\nIncorporate these specific adjustments while keeping everything else the same.`
      : '';

  const prompt = `You are a Professional Food Photography Director and AI Prompt Engineer. Your task is to interpret cooking recipe steps and translate them into a structured visual schema for an image generation model.

### OBJECTIVE
Analyze the provided cooking step and output a JSON object that describes a clean, consistent, first-person POV (Point of View) scene.

### CONSTRAINTS & RULES
1. PERSPECTIVE: ${translated.showHands ? 'First-Person POV, looking down at one\'s own hands' : 'Commercial product photography - isolated top-down shot with no people'}.
2. HANDS: ${translated.showHands ? 'Explicitly limit to TWO hands (the user\'s hands). No extra people or ghost hands.' : 'NO hands or people visible. This is isolated product photography, not a cooking scene.'}.
3. SIMPLICITY: Limit "mainElements" to a maximum of 3 key items to avoid visual clutter.
4. SCENE TYPE:
   - Use "static" for resting, waiting, or simple ingredient displays (these will be PRODUCT SHOTS with NO people).
   - Use "active" for mixing, pouring, cutting, or any motion.
5. NO TEXT: Do not include labels, captions, or text overlays in the visual description.
6. CONSISTENCY: ${translated.showHands ? 'Maintain the "Beige sweater sleeves" and "White marble counter" as the environment' : 'Use clean white or marble surface as background, studio lighting, empty scene'}.

### OUTPUT SCHEMA (JSON ONLY)
{
  "sceneType": "static" | "active",
  "mainElements": ["item1", "item2", "item3"],
  "handAction": "${translated.showHands ? 'Short description of what the two hands are doing' : 'no hands visible - describe object positioning'}",
  "cameraFocus": "The specific object or texture that should be the sharpest",
  "visualVibe": "e.g., 'creamy texture', 'flour dusting', 'soft lighting'"
}

### EXAMPLES
Input: "Оставете маслото да омекне"
Output:
{
  "sceneType": "static",
  "mainElements": ["block of butter", "small white ceramic plate"],
  "handAction": "${translated.showHands ? 'one hand gently pressing the butter to check for softness' : 'centered on plate, isolated product shot, empty scene'}",
  "cameraFocus": "the soft texture of butter",
  "visualVibe": "clean commercial catalog photography, studio lighting"
}

Input: "Разбийте с миксер до кремообразна смес"
Output:
{
  "sceneType": "active",
  "mainElements": ["electric hand mixer", "large glass bowl", "creamy butter mixture"],
  "handAction": "${translated.showHands ? 'both hands firmly holding the handle of the mixer while whisking' : 'mixer in motion above bowl, no hands visible, overhead shot'}",
  "cameraFocus": "the swirling texture of the creamed butter",
  "visualVibe": "dynamic motion, professional kitchen"
}
${hintsSection}${handsConstraint}

### NOW INTERPRET THIS STEP
Recipe step: "${stepDescription}"
${recipeSection}
Respond with ONLY the JSON object, no other text.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional food photography director. Output only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const responseText = data.choices[0].message.content || '';

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI interpretation');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Use GPT-4o-mini to extract equipment/utensil names from a step description
 */
async function extractEquipmentNames(stepDescription: string): Promise<string[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `Extract kitchen equipment and utensil names from this cooking step text.
Return ONLY a JSON array of lowercase English names.
Include only physical tools (mixer, whisk, bowl, spatula, pan, mold, etc.) — NOT ingredients.
Return [] if no equipment is mentioned.

Text: "${stepDescription}"

Return only: ["tool1", "tool2"]`
        }],
        temperature: 0,
        max_tokens: 100
      })
    });

    if (!response.ok) return [];

    const data = await response.json();
    const text = data.choices[0].message.content || '[]';
    const match = text.match(/\[[\s\S]*?\]/);
    if (!match) return [];

    const names = JSON.parse(match[0]);
    return Array.isArray(names) ? names : [];
  } catch {
    return [];
  }
}

/**
 * Fetch equipment data from DB: reference image URLs + English names for prompt enhancement.
 * Queries by name_en and slug (both English-friendly) since AI extracts English names.
 */
async function getEquipmentData(stepDescription: string): Promise<{
  imageUrls: string[];
  equipmentNames: string[];
}> {
  const empty = { imageUrls: [], equipmentNames: [] };
  try {
    const extracted = await extractEquipmentNames(stepDescription);
    if (extracted.length === 0) return empty;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const conditions = extracted
      .flatMap(name => [`name_en.ilike.%${name}%`, `slug.ilike.%${name}%`])
      .join(',');

    const { data: equipment, error } = await supabase
      .from('equipment')
      .select('image_url, reference_image_url, name_en')
      .or(conditions);

    if (error) {
      console.warn(`⚠️ Equipment DB query failed: ${error.message}`);
      return empty;
    }

    // Prefer reference_image_url, fallback to image_url
    const imageUrls = (equipment ?? [])
      .flatMap((e: any) => [e.reference_image_url, e.image_url])
      .filter(Boolean);

    const equipmentNames = (equipment ?? [])
      .map((e: any) => e.name_en)
      .filter(Boolean);

    if (equipmentNames.length > 0) {
      console.log(`🔧 Equipment from DB: ${equipmentNames.join(', ')} (${imageUrls.length} image(s))`);
    }

    return { imageUrls, equipmentNames };
  } catch (error: any) {
    console.warn(`⚠️ getEquipmentData error: ${error.message}`);
    return empty;
  }
}

/**
 * Fetch equipment reference images by explicit IDs (from per-step equipment_needed column).
 * Prioritised over the text-extracted lookup — user explicitly chose these items.
 */
async function getEquipmentDataByIds(ids: number[]): Promise<{
  imageUrls: string[];
  equipmentNames: string[];
}> {
  const empty = { imageUrls: [], equipmentNames: [] };
  if (!ids?.length) return empty;
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: equipment, error } = await supabase
      .from('equipment')
      .select('id, name, name_en, reference_image_url, image_url')
      .in('id', ids);

    if (error) {
      console.warn(`⚠️ Equipment by-ID query failed: ${error.message}`);
      return empty;
    }

    const imageUrls = (equipment ?? [])
      .flatMap((e: any) => [e.reference_image_url, e.image_url])
      .filter(Boolean);

    const equipmentNames = (equipment ?? [])
      .map((e: any) => e.name_en || e.name)
      .filter(Boolean);

    if (equipmentNames.length > 0) {
      console.log(`🔧 Equipment by ID: ${equipmentNames.join(', ')} (${imageUrls.length} ref image(s))`);
    }

    return { imageUrls, equipmentNames };
  } catch (error: any) {
    console.warn(`⚠️ getEquipmentDataByIds error: ${error.message}`);
    return empty;
  }
}

/**
 * Build Imagen prompt with translated hints
 */
function buildImagenPrompt(
  interpretation: SceneInterpretation,
  originalStepDescription: string,
  customHints?: string,
  translatedHints?: string,
  recipeContext?: RecipeContext
): string {
  const { sceneType, mainElements, handAction, cameraFocus, visualVibe } = interpretation;
  const translated = translateHints(customHints);
  const hintText = translatedHints || customHints || '';
  const translatedInstructions = translated.additionalInstructions
    ? translated.additionalInstructions.replace(customHints || '', hintText)
    : hintText;

  // Intelligently select Visual Anchors based on elements
  const desc = originalStepDescription.toLowerCase();
  let containerSpec = CONSTANT_STYLE.container;
  let toolSpec = '';

  // Detect specific tools from description
  if (desc.includes('миксер') || desc.includes('mixer')) {
    toolSpec = `${CONSTANT_STYLE.mixer}. CRITICAL: Only ONE mixer visible - beaters INSIDE the bowl, body in hands. No floating parts.`;
  } else if (desc.includes('бъркалка') || desc.includes('whisk')) {
    toolSpec = `${CONSTANT_STYLE.whisk} actively whisking inside bowl`;
  } else if (desc.includes('лъжица') || desc.includes('spatula')) {
    toolSpec = CONSTANT_STYLE.spatula;
  }

  // Use small plate for static ingredient display
  if (sceneType === 'static' && (desc.includes('масло') || desc.includes('butter'))) {
    containerSpec = CONSTANT_STYLE.plate;
  }

  const cameraAngle = translated.cameraAngle || CONSTANT_STYLE.angle;

  const perspectiveNote = translated.showHands
    ? 'First-person POV food photography, looking down at my own hands.'
    : 'Isolated product photography, top-down flatlay. Studio lighting, empty scene. Professional food styling for commercial catalog.';

  const handsConstraint = translated.showHands
    ? '- My two hands are the only hands visible (NO extra people, NO ghost hands)'
    : '- Isolated product shot with NO people\n- Empty scene - no hands, arms, or body parts\n- Commercial food styling (not cooking scene)\n- Professional catalog photography';

  const recipeContextBlock = recipeContext?.recipeName
    ? `\nRECIPE: ${recipeContext.recipeName}${recipeContext.stepNumber ? ` — Step ${recipeContext.stepNumber}` : ''}${recipeContext.ingredients ? `\nINGREDIENT PALETTE: ${recipeContext.ingredients}` : ''}${recipeContext.utensils ? `\nEQUIPMENT AVAILABLE: ${recipeContext.utensils}` : ''}${recipeContext.refinement ? `\nSPECIFIC ADJUSTMENT (HIGH PRIORITY): ${recipeContext.refinement}` : ''}\n`
    : recipeContext?.refinement
      ? `\nSPECIFIC ADJUSTMENT (HIGH PRIORITY): ${recipeContext.refinement}\n`
      : '';

  return `${perspectiveNote}
${recipeContextBlock}
SUBJECT: ${originalStepDescription}

SCENE TYPE: ${sceneType === 'static' ? 'PRODUCT PHOTOGRAPHY - isolated ingredient display, no human presence' : 'ACTIVE - tool in motion (BUT NO HANDS HOLDING IT)'}

SINGLE CONTAINER SCENE:
- All action contained within ONE vessel: ${containerSpec}
- NO extra bowls, NO spare tools on counter
- NO floating objects or duplicate items
- Clean minimalist workspace

KEY ELEMENTS:
${handsConstraint}
${translated.showHands ? `- Wearing ${CONSTANT_STYLE.clothing}` : '- Top-down flatlay composition'}
- Container: ${containerSpec}
${toolSpec ? `- Tool: ${toolSpec}` : ''}
- Surface: ${CONSTANT_STYLE.surface}

${translated.showHands ? `HANDS: ${handAction}` : `COMPOSITION: Centered ${containerSpec} on clean surface. Still life arrangement. NO human presence.`}

CAMERA & FOCUS:
- ${cameraAngle}
- EXTREME CLOSE-UP: ${cameraFocus} fills 90% of frame
- Sharp focus on: ${cameraFocus}
- Background softly blurred

VISUAL STYLE:
- ${visualVibe}
- Ultra minimalist, only essential items visible
- Counter barely visible around edges
- NO text, NO labels, NO overlays

${translatedInstructions ? `\nUSER PREFERENCES:\n${translatedInstructions}` : ''}

${sceneType === 'static' ?
`PRODUCT PHOTOGRAPHY REQUIREMENTS:
- Studio product shot, not cooking scene
- Empty scene with no human presence
- Top-down flatlay composition
- Isolated ingredient display
- Commercial catalog quality
- Minimalist styling` :
`ACTIVE SCENE REQUIREMENTS:
- Tool actively in motion (mixer beaters spinning, whisk moving, etc.)
${translated.showHands ? '- Both hands firmly gripping tool handle' : '- Tool motion without showing hands'}
- Focus on texture being created or transformed
- Energy and motion visible
- All action contained within the center of the bowl`}

LIGHTING: ${CONSTANT_STYLE.lighting}

STYLE: ${translated.showHands ? CONSTANT_STYLE.aesthetic : 'Commercial product photography, catalog quality, professional food styling, minimalist composition'}

CRITICAL EXCLUSIONS:
- NO duplicate tools (only ONE mixer, ONE whisk, ONE spatula)
- NO extra prep bowls scattered around
- NO floating objects or spare parts
- ${translated.showHands ? 'Only TWO hands total from ONE person' : 'NO people or hands visible anywhere'}

TECHNICAL CONSISTENCY:
- Use the SAME ${containerSpec} as reference
- Maintain consistent surface texture (${CONSTANT_STYLE.surface})
- Keep lighting direction consistent (${CONSTANT_STYLE.lighting})`.trim();
}

/**
 * Build visual parameter instructions from generation settings.
 * Appended at end of prompt as CRITICAL overrides.
 */
function buildVisualParams(settings: GenerationSettings): string {
  const bgColor =
    settings.backgroundColor === 'black' ? 'Pure black, matte, no reflections' :
    settings.backgroundColor === 'dark-slate' ? 'Dark slate gray, deep charcoal surface' :
    settings.backgroundColor === 'white' ? 'Pure white, bright and clean' :
    'Blurred, shallow depth-of-field background';

  const angle =
    settings.viewingAngle === 'overhead' ? '90° overhead bird\'s eye view, camera pointing straight down' :
    settings.viewingAngle === '45-degree' ? '45° angle from above, angled perspective' :
    settings.viewingAngle === 'side' ? 'Side profile view, horizontal camera angle' :
    'Extreme close-up macro view, tight crop, very shallow depth of field';

  const lighting =
    settings.lightingStyle === 'studio' ? 'Soft studio lighting, high-key, even illumination, no harsh shadows' :
    settings.lightingStyle === 'natural' ? 'Natural window light, soft diffused daylight from the side' :
    settings.lightingStyle === 'warm' ? 'Warm golden hour lighting, amber and orange tones' :
    settings.lightingStyle === 'cool' ? 'Cool bright lighting, blue-white tones, crisp and clean' :
    'Dramatic side lighting, deep shadows, strong chiaroscuro, high contrast';

  const texture =
    settings.backgroundTexture === 'slate' ? 'Textured dark slate stone surface' :
    settings.backgroundTexture === 'wood' ? 'Rustic wood grain surface, natural wood planks' :
    settings.backgroundTexture === 'marble' ? 'Polished marble surface with subtle veining' :
    settings.backgroundTexture === 'plain' ? 'Plain smooth surface, no visible texture' :
    'Linen fabric texture surface, soft woven cloth';

  return `

VISUAL PARAMETERS (CRITICAL — OVERRIDE CONFLICTING INSTRUCTIONS ABOVE):
- Background Color: ${bgColor}
- Viewing Angle: ${angle}
- Lighting Style: ${lighting}
- Background/Surface Texture: ${texture}
- Full-bleed composition, edge-to-edge, no white borders or frame padding
- Apply these visual parameters with highest priority`;
}

/**
 * Generate image via Replicate Imagen 4 and return raw Uint8Array
 */
async function generateWithReplicate(
  prompt: string,
  referenceImageUrl?: string
): Promise<Uint8Array> {
  const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });

  const imagenInput: any = {
    prompt,
    aspect_ratio: '1:1',
    output_format: 'png',
  };

  if (referenceImageUrl) {
    imagenInput.image = referenceImageUrl;
    imagenInput.prompt_strength = 0.75;
    console.log(`🖼️  Replicate: using reference image for consistency`);
  }

  const output: any = await replicate.run('google/imagen-4', { input: imagenInput });

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  if (output && typeof output[Symbol.asyncIterator] === 'function') {
    for await (const chunk of output) {
      if (chunk instanceof Uint8Array) {
        chunks.push(chunk);
        totalBytes += chunk.length;
      }
    }
  } else {
    throw new Error('Unexpected output format from Replicate Imagen 4');
  }

  if (chunks.length === 0) {
    throw new Error('No image data received from Replicate');
  }

  const imageBuffer = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    imageBuffer.set(chunk, offset);
    offset += chunk.length;
  }

  return imageBuffer;
}

/**
 * Upload Uint8Array image buffer to Supabase Storage
 */
async function uploadToSupabase(
  imageBuffer: Uint8Array,
  recipeId: string,
  stepNumber: number,
  mimeType: string = 'image/png'
): Promise<string> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const ext = mimeType.includes('jpeg') ? 'jpg' : 'png';
  const filePath = `recipes/${recipeId}/step-${stepNumber}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('recipe-images')
    .upload(filePath, imageBuffer, {
      contentType: mimeType,
      upsert: false,
      cacheControl: '3600',
    });

  if (uploadError) {
    throw new Error(`Supabase upload failed: ${uploadError.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('recipe-images')
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function POST(request: NextRequest) {
  try {
    console.log('\n🔍 === ENVIRONMENT CHECK ===');
    console.log('GOOGLE_API_KEY exists:', !!GOOGLE_API_KEY);
    console.log('REPLICATE_API_TOKEN exists:', !!REPLICATE_API_TOKEN);
    console.log('OPENAI_API_KEY exists:', !!OPENAI_API_KEY);
    console.log('=========================\n');

    const {
      recipeId,
      recipeName,
      stepId,
      stepNumber,
      stepDescription,
      stepDescriptionEn,
      customHints,
      aiHint,
      refinement,
      referenceImageUrl,
      ingredients,
      utensils,
      equipment_ids,
      generationSettings,
    } = await request.json();

    if (!recipeId || !stepNumber || !stepDescription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not configured' },
        { status: 500 }
      );
    }

    const provider = new URL(request.url).searchParams.get('provider') || 'auto';
    const description = stepDescriptionEn || stepDescription;
    const translated = translateHints(customHints);

    console.log(`\n🎬 Step ${stepNumber}: AI Food Photography Director`);
    console.log(`📝 Recipe Step: "${description}"`);
    console.log(`🔌 Provider mode: ${provider}`);
    if (customHints) {
      console.log(`💡 Custom Hints: "${customHints}"`);
      console.log(`🔧 Translated: showHands=${translated.showHands}, angle=${translated.cameraAngle || 'default'}`);
    }

    const recipeCtx: RecipeContext = {
      recipeName: recipeName || undefined,
      ingredients: ingredients || undefined,
      utensils: utensils || undefined,
      stepNumber: stepNumber || undefined,
      refinement: refinement || undefined,
    };

    // STEP 1: AI interpretation + equipment lookup (parallel — both by text and explicit IDs)
    const [interpretation, equipmentData, idEquipmentData] = await Promise.all([
      interpretStepWithAI(description, customHints, recipeCtx),
      getEquipmentData(description),
      getEquipmentDataByIds(equipment_ids || []),
    ]);

    // Merge: ID-based first (explicit > inferred), cap at 3 images, deduplicate names
    const mergedEquipmentImageUrls = [...idEquipmentData.imageUrls, ...equipmentData.imageUrls].slice(0, 3);
    const mergedEquipmentNames = [...new Set([...idEquipmentData.equipmentNames, ...equipmentData.equipmentNames])];

    // Append DB equipment names to utensils context so the prompt is more precise
    if (mergedEquipmentNames.length > 0) {
      const dbUtensils = mergedEquipmentNames.join(', ');
      recipeCtx.utensils = recipeCtx.utensils
        ? `${recipeCtx.utensils}, ${dbUtensils}`
        : dbUtensils;
    }

    console.log(`\n📋 AI Scene Interpretation:`);
    console.log(`   Type: ${interpretation.sceneType}`);
    console.log(`   Elements: ${interpretation.mainElements.join(', ')}`);
    console.log(`   Action: ${interpretation.handAction}`);
    console.log(`   Focus: ${interpretation.cameraFocus}`);
    console.log(`   Vibe: ${interpretation.visualVibe}`);
    if (recipeCtx.recipeName) console.log(`   Recipe: ${recipeCtx.recipeName}`);
    if (mergedEquipmentImageUrls.length > 0) console.log(`   Equipment refs: ${mergedEquipmentImageUrls.length} image(s) (${idEquipmentData.imageUrls.length} by ID, ${equipmentData.imageUrls.length} by text)`);

    const translatedHint = customHints ? await translatePrompt(customHints) : '';
    if (translatedHint) {
      console.log(`💬 Translated Hint: "${translatedHint}"`);
    }

    // STEP 2: Build prompt with new Reference + AI Prompt logic
    const useReferenceImage = !!referenceImageUrl;
    const stepAIHint = aiHint || '';
    const translatedAIHint = stepAIHint ? await translatePrompt(stepAIHint) : '';

    console.log('=== STEP AI HINT TRANSLATED ===');
    console.log('Original:', stepAIHint);
    console.log('Translated:', translatedAIHint);
    console.log('==================================');

    // NEW LOGIC: Reference Image = PRIMARY (visual foundation), AI Prompt = SECONDARY (detail modifications)
    const finalPrompt = useReferenceImage
      ? `
MATCH THIS REFERENCE IMAGE EXACTLY:
- Keep the exact same vessel/container from the reference image
- Keep the exact same visual style and lighting from the reference
- Keep the exact same angle and composition from the reference

APPLY ONLY THESE MODIFICATIONS:
${translatedAIHint}
${refinement || ''}
${customHints || ''}

KEY INSTRUCTION:
- Do NOT change container/vessel type or orientation from reference
- Apply only the specified modifications above
- Maintain reference visual style and lighting
      `.trim()
      : `${translatedAIHint}\n${refinement || ''}\n${customHints || ''}`;

    const prompt = generationSettings
      ? finalPrompt + buildVisualParams(generationSettings)
      : finalPrompt;
    if (generationSettings) {
      console.log(`🎨 Visual settings applied: bg=${generationSettings.backgroundColor}, angle=${generationSettings.viewingAngle}, light=${generationSettings.lightingStyle}, texture=${generationSettings.backgroundTexture}`);
    }
    console.log(`\n📸 Prompt generated (${prompt.length} chars)`);
    console.log(`🖼️ Reference Image: ${useReferenceImage ? 'YES (PRIMARY)' : 'NO'}`);
    console.log(`💡 AI Prompt: ${translatedAIHint ? 'YES (SECONDARY)' : 'NO'}`);

    // STEP 3: Generate image — Gemini primary, Replicate fallback
    let imageBuffer: Uint8Array;
    let usedProvider: 'gemini' | 'replicate';
    let mimeType = 'image/png';

    if (provider === 'gemini' || provider === 'auto') {
      try {
        if (!GOOGLE_API_KEY) throw new Error('GOOGLE_API_KEY not configured');
        console.log('⏳ Calling Gemini...');
        const geminiResult = await generateImageWithGemini({ prompt, referenceImageUrl, equipmentImages: mergedEquipmentImageUrls });
        imageBuffer = Buffer.from(geminiResult.base64, 'base64');
        mimeType = geminiResult.mimeType;
        usedProvider = 'gemini';
        console.log(`✅ Gemini success (${(imageBuffer.length / 1024).toFixed(1)} KB)`);
      } catch (geminiError: any) {
        if (provider === 'gemini') {
          throw geminiError;
        }
        console.warn(`⚠️ Gemini failed, falling back to Replicate: ${geminiError.message}`);
        if (!REPLICATE_API_TOKEN) {
          throw new Error('Replicate fallback unavailable: REPLICATE_API_TOKEN not configured');
        }
        console.log('⏳ Calling Replicate Imagen 4...');
        imageBuffer = await generateWithReplicate(prompt, referenceImageUrl);
        usedProvider = 'replicate';
        console.log(`✅ Replicate success (${(imageBuffer.length / 1024).toFixed(1)} KB)`);
      }
    } else {
      // provider === 'replicate'
      if (!REPLICATE_API_TOKEN) {
        return NextResponse.json(
          { error: 'REPLICATE_API_TOKEN not configured' },
          { status: 500 }
        );
      }
      console.log('⏳ Calling Replicate Imagen 4...');
      imageBuffer = await generateWithReplicate(prompt, referenceImageUrl);
      usedProvider = 'replicate';
      console.log(`✅ Replicate success (${(imageBuffer.length / 1024).toFixed(1)} KB)`);
    }

    // STEP 4: Upload to Supabase Storage
    const imageUrl = await uploadToSupabase(imageBuffer, recipeId, stepNumber, mimeType);
    console.log(`✅ Uploaded: ${imageUrl}`);

    // STEP 5: Save URL to DB immediately (bypasses RLS via service role)
    let savedToDb = false;
    if (stepId) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      const { error: dbError } = await supabase
        .from('recipe_instruction_steps')
        .update({ step_image_url: imageUrl })
        .eq('id', stepId);

      if (dbError) {
        console.warn(`⚠️ DB save failed (image is still in storage): ${dbError.message}`);
      } else {
        savedToDb = true;
        console.log(`✅ DB updated: step_image_url saved for step id ${stepId}`);
      }
    }

    const cost = usedProvider === 'gemini' ? 0.015 : 0.041;
    console.log(`💰 Estimated cost: ~$${cost}\n`);

    return NextResponse.json({
      success: true,
      imageUrl,
      savedToDb,
      stepNumber,
      provider: usedProvider,
      cost,
      interpretation,
      translatedHints: translated,
      sizeKB: parseFloat((imageBuffer.length / 1024).toFixed(2)),
      model: usedProvider === 'gemini' ? 'gemini-2.5-flash-image' : 'google/imagen-4',
      interpreter: 'gpt-4o-enhanced',
      style: 'ai-professional-director',
    });

  } catch (error: any) {
    console.error('❌ Error:', error);

    if (error.message?.includes('429')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait and try again.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Professional AI Food Photography Director API',
    version: '4.0 (Gemini Primary + Replicate Fallback)',
    providers: {
      primary: 'Gemini 2.5 Flash Image (gemini-2.5-flash-image)',
      fallback: 'Google Imagen 4 via Replicate',
    },
    interpreter: 'GPT-4o',
    providerParam: '?provider=auto|gemini|replicate (default: auto)',
    features: [
      'Gemini primary with automatic Replicate fallback',
      'AI scene interpretation (GPT-4o)',
      'Custom hints with auto-translation',
      'Explicit hand control (show/hide)',
      'Camera angle preferences',
      'Static vs Active detection',
      'Visual vibe enhancement',
      'Professional food photography standards',
    ],
    supportedHints: [
      'no hands / без ръце - Hide hands completely',
      'top view / overhead / отгоре - Bird\'s eye view',
      'side view / отстрани - 45-degree side angle',
      'show [item] - Include specific props',
      'minimal / минимал - Ultra minimalist composition',
      'dark / moody / тъмн - Dramatic lighting',
      'bright / airy / светъл - High-key lighting',
    ],
    status: {
      gemini: !!GOOGLE_API_KEY ? 'ready' : 'missing GOOGLE_API_KEY',
      replicate: !!REPLICATE_API_TOKEN ? 'ready' : 'missing REPLICATE_API_TOKEN',
      openai: !!OPENAI_API_KEY ? 'ready' : 'missing OPENAI_API_KEY',
    },
  });
}
