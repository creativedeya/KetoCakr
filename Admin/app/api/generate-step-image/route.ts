// =====================================================
// ENHANCED API - Auto-translates user hints
// File: app/api/generate-step-image/route.ts
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Replicate from 'replicate';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

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

/**
 * AI interpreter with custom hints support
 */
async function interpretStepWithAI(
  stepDescription: string,
  customHints?: string
): Promise<SceneInterpretation> {
  const translated = translateHints(customHints);
  
  const hintsSection = translated.additionalInstructions
    ? `\n\n### USER CUSTOM INSTRUCTIONS\n${translated.additionalInstructions}\nFollow these instructions carefully and prioritize them over defaults.`
    : '';

  const handsConstraint = !translated.showHands
    ? `\n\n### CRITICAL CONSTRAINT\nNO HANDS OR PEOPLE should be visible in this image. Show only the ingredient/object at rest. This is a still life composition without human presence.`
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
 * Build Imagen prompt with translated hints
 */
function buildImagenPrompt(
  interpretation: SceneInterpretation,
  originalStepDescription: string,
  customHints?: string
): string {
  const { sceneType, mainElements, handAction, cameraFocus, visualVibe } = interpretation;
  const translated = translateHints(customHints);

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

  return `${perspectiveNote}

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

${translated.additionalInstructions ? `\nUSER PREFERENCES:\n${translated.additionalInstructions}` : ''}

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

export async function POST(request: NextRequest) {
  try {
    console.log('\n🔍 === ENVIRONMENT CHECK ===');
    console.log('REPLICATE_API_TOKEN exists:', !!REPLICATE_API_TOKEN);
    console.log('OPENAI_API_KEY exists:', !!OPENAI_API_KEY);
    console.log('=========================\n');

    const { 
      recipeId, 
      recipeName, 
      stepNumber, 
      stepDescription, 
      stepDescriptionEn,
      customHints,
      referenceImageUrl  // ✅ NEW - for image-to-image consistency
    } = await request.json();

    if (!recipeId || !stepNumber || !stepDescription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!REPLICATE_API_TOKEN || !OPENAI_API_KEY) {
      console.error('❌ API TOKENS MISSING!');
      return NextResponse.json(
        { 
          error: 'API tokens not configured',
          details: {
            replicate: !!REPLICATE_API_TOKEN,
            openai: !!OPENAI_API_KEY
          }
        },
        { status: 500 }
      );
    }

    const description = stepDescriptionEn || stepDescription;
    const translated = translateHints(customHints);
    
    console.log(`\n🎬 Step ${stepNumber}: AI Food Photography Director`);
    console.log(`📝 Recipe Step: "${description}"`);
    if (customHints) {
      console.log(`💡 Custom Hints: "${customHints}"`);
      console.log(`🔧 Translated: showHands=${translated.showHands}, angle=${translated.cameraAngle || 'default'}`);
    }

    // STEP 1: AI interpretation with hints
    const interpretation = await interpretStepWithAI(description, customHints);
    
    console.log(`\n📋 AI Scene Interpretation:`);
    console.log(`   Type: ${interpretation.sceneType}`);
    console.log(`   Elements: ${interpretation.mainElements.join(', ')}`);
    console.log(`   Action: ${interpretation.handAction}`);
    console.log(`   Focus: ${interpretation.cameraFocus}`);
    console.log(`   Vibe: ${interpretation.visualVibe}`);

    // STEP 2: Build prompt with hints
    const prompt = buildImagenPrompt(interpretation, description, customHints);

    console.log(`\n📸 Imagen Prompt Generated (${prompt.length} chars)`);

    // STEP 3: Generate with Imagen
    const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });
    console.log('⏳ Calling Imagen 4...');
    
    // ✅ Build input with optional reference image for consistency
    const imagenInput: any = {
      prompt: prompt,
      aspect_ratio: "1:1",
      output_format: "png"
    };

    // If reference image provided, use image-to-image mode for visual consistency
    if (referenceImageUrl) {
      imagenInput.image = referenceImageUrl;
      imagenInput.prompt_strength = 0.75;  // 0.0 = exact copy, 1.0 = ignore reference
      
      console.log(`🖼️  Using reference image for visual consistency:`);
      console.log(`   URL: ${referenceImageUrl.substring(0, 60)}...`);
      console.log(`   Strength: 0.75 (maintains equipment/person/style)`);
    }
    
    const output: any = await replicate.run(
      "google/imagen-4",
      { input: imagenInput }
    );

    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    if (output && typeof output[Symbol.asyncIterator] === 'function') {
      for await (const chunk of output) {
        if (chunk instanceof Uint8Array) {
          chunks.push(chunk);
          totalBytes += chunk.length;
        }
      }
      console.log(`✓ Image received: ${(totalBytes / 1024).toFixed(1)} KB`);
    } else {
      return NextResponse.json(
        { error: 'Unexpected output format from Imagen' },
        { status: 500 }
      );
    }

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: 'No image data received' },
        { status: 500 }
      );
    }

    const imageBuffer = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      imageBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    console.log(`✅ Image assembled: ${(imageBuffer.length / 1024).toFixed(2)} KB`);

    // STEP 4: Upload to Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    const fileName = `${recipeId}/step-${stepNumber}-${Date.now()}.png`;
    const filePath = `recipes/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(filePath, imageBuffer, {
        contentType: 'image/png',
        upsert: false,
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: { publicUrl } } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(filePath);

    console.log(`✅ Success! URL: ${publicUrl}`);
    console.log(`💰 Cost: ~$0.041\n`);

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      stepNumber: stepNumber,
      interpretation: interpretation,
      translatedHints: translated,
      sizeKB: parseFloat((imageBuffer.length / 1024).toFixed(2)),
      model: 'google/imagen-4',
      interpreter: 'gpt-4o-enhanced',
      style: 'ai-professional-director'
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
    version: '3.0 (Enhanced with Auto-Translation)',
    model: 'Google Imagen 4',
    interpreter: 'GPT-4o',
    features: [
      'Universal recipe support',
      'AI scene interpretation',
      'Custom hints with auto-translation',
      'Explicit hand control (show/hide)',
      'Camera angle preferences',
      'Static vs Active detection',
      'Visual vibe enhancement',
      'Professional food photography standards'
    ],
    supportedHints: [
      'no hands / без ръце - Hide hands completely',
      'top view / overhead / отгоре - Bird\'s eye view',
      'side view / отстрани - 45-degree side angle',
      'show [item] - Include specific props',
      'minimal / минимал - Ultra minimalist composition',
      'dark / moody / тъмн - Dramatic lighting',
      'bright / airy / светъл - High-key lighting'
    ],
    status: (REPLICATE_API_TOKEN && OPENAI_API_KEY) ? 'ready' : 'missing API keys'
  });
}