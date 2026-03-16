// =====================================================
// FILE: admin/app/api/generate-recipe-images/route.ts
// Batch generate images for all steps in a recipe
// Using Google Imagen 4 via Replicate API
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Replicate from 'replicate';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN!;

const EMMA_STUDIO_BASE = `
Emma's Cake Studio aesthetic.
Clean, minimal, professional food magazine quality.
High-end pastry photography.
Realistic, not overly stylized.
Focus on the food and action.
No text, no numbers, no labels visible.
`.trim();

const PHOTO_STYLES = {
  overhead: 'Professional overhead flat lay food photography, directly from above, bird\'s eye view perspective',
  angle45: 'Professional 45-degree elevated angle food photography',
  closeup: 'Professional close-up detail food photography, shallow depth of field',
  threequarter: 'Professional three-quarter view food photography'
};

const LIGHTING_STYLES = {
  natural: 'Natural daylight from window, soft diffused lighting',
  studio: 'Professional studio lighting, controlled soft shadows',
  golden: 'Golden hour warm lighting, soft glowing ambiance',
  bright: 'Bright clean lighting, minimal shadows'
};

const BACKGROUND_STYLES = {
  marble: 'Clean white marble countertop surface',
  wood: 'Warm natural wood surface, rustic aesthetic',
  concrete: 'Light grey concrete surface, modern minimal',
  white: 'Pure white background, clean and simple'
};

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createImagenPrompt(
  recipeName: string,
  stepNumber: number,
  stepDescription: string,
  style: string = 'overhead',
  lighting: string = 'natural',
  background: string = 'marble'
): string {
  const photoStyle = PHOTO_STYLES[style as keyof typeof PHOTO_STYLES] || PHOTO_STYLES.overhead;
  const lightingDesc = LIGHTING_STYLES[lighting as keyof typeof LIGHTING_STYLES] || LIGHTING_STYLES.natural;
  const backgroundDesc = BACKGROUND_STYLES[background as keyof typeof BACKGROUND_STYLES] || BACKGROUND_STYLES.marble;
  
  return `${photoStyle} depicting: ${stepDescription}

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

Quality: High resolution, sharp focus on main subject, professional food photography standard.`.trim();
}

async function generateSingleStepImage(
  replicate: Replicate,
  supabase: any,
  recipeId: string,
  recipeName: string,
  step: any,
  style: string,
  lighting: string,
  background: string
): Promise<{ success: boolean; stepNumber: number; imageUrl?: string; error?: string; time?: number }> {
  const startTime = Date.now();
  
  try {
    const description = step.step_description_en || step.step_description;
    
    if (!description || description.trim() === '') {
      return {
        success: false,
        stepNumber: step.step_number,
        error: 'Empty step description'
      };
    }

    // Create prompt
    const prompt = createImagenPrompt(
      recipeName,
      step.step_number,
      description,
      style,
      lighting,
      background
    );

    console.log(`   📝 Generating step ${step.step_number}...`);

    // Generate image
    const output = await replicate.run(
      "google/imagen-4",
      {
        input: {
          prompt: prompt,
          aspect_ratio: "1:1",
          output_format: "png"
        }
      }
    );

    // Extract URL
    let imageUrl: string | null = null;
    
    if (typeof output === 'string') {
      imageUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      imageUrl = typeof output[0] === 'string' ? output[0] : output[0]?.toString();
    } else if (output && typeof output === 'object' && 'url' in output) {
      imageUrl = (output as any).url;
    }

    if (!imageUrl || !imageUrl.startsWith('http')) {
      return {
        success: false,
        stepNumber: step.step_number,
        error: 'Failed to extract image URL'
      };
    }

    // Download image
    const downloadResponse = await fetch(imageUrl);
    if (!downloadResponse.ok) {
      return {
        success: false,
        stepNumber: step.step_number,
        error: `Download failed: ${downloadResponse.statusText}`
      };
    }

    const imageBuffer = await downloadResponse.arrayBuffer();

    // Upload to Supabase
    const fileName = `${recipeId}/step-${step.step_number}-${Date.now()}.png`;
    const filePath = `recipes/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(filePath, imageBuffer, {
        contentType: 'image/png',
        upsert: false,
        cacheControl: '3600'
      });

    if (uploadError) {
      return {
        success: false,
        stepNumber: step.step_number,
        error: `Upload failed: ${uploadError.message}`
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(filePath);

    // Update step in database
    const { error: updateError } = await supabase
      .from('recipe_instruction_steps')
      .update({ step_image_url: publicUrl })
      .eq('id', step.id);

    if (updateError) {
      console.warn(`   ⚠️  Failed to update step ${step.step_number} in database:`, updateError.message);
    }

    const elapsed = Date.now() - startTime;
    console.log(`   ✅ Step ${step.step_number} complete (${(elapsed / 1000).toFixed(1)}s)`);

    return {
      success: true,
      stepNumber: step.step_number,
      imageUrl: publicUrl,
      time: elapsed
    };

  } catch (error: any) {
    return {
      success: false,
      stepNumber: step.step_number,
      error: error.message || 'Unknown error'
    };
  }
}

/**
 * POST: Generate images for all steps in a recipe
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      recipeId,
      style = 'overhead',
      lighting = 'natural',
      background = 'marble',
      skipExisting = true
    } = await request.json();

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Missing recipeId' },
        { status: 400 }
      );
    }

    if (!REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: 'Replicate API token not configured' },
        { status: 500 }
      );
    }

    console.log(`\n🎨 Batch generating images for recipe: ${recipeId}`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });

    // Fetch recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('base_recipes')
      .select('id, name, name_en')
      .eq('id', recipeId)
      .single();

    if (recipeError || !recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    const recipeName = recipe.name_en || recipe.name;
    console.log(`   Recipe: ${recipeName}`);

    // Fetch steps
    const { data: steps, error: stepsError } = await supabase
      .from('recipe_instruction_steps')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('step_number');

    if (stepsError || !steps || steps.length === 0) {
      return NextResponse.json(
        { error: 'No steps found for this recipe' },
        { status: 404 }
      );
    }

    console.log(`   Found ${steps.length} steps`);

    // Filter steps if skipExisting is true
    const stepsToProcess = skipExisting 
      ? steps.filter(s => !s.step_image_url)
      : steps;

    if (stepsToProcess.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All steps already have images',
        total: steps.length,
        processed: 0,
        skipped: steps.length
      });
    }

    console.log(`   Processing ${stepsToProcess.length} steps (${steps.length - stepsToProcess.length} skipped)`);

    // Process each step with delay
    const results = [];
    
    for (let i = 0; i < stepsToProcess.length; i++) {
      const step = stepsToProcess[i];
      
      console.log(`\n   [${i + 1}/${stepsToProcess.length}] Processing step ${step.step_number}...`);
      
      // Add delay between requests (Replicate rate limit: ~6 requests/min)
      if (i > 0) {
        const delaySeconds = 12;
        console.log(`   ⏸️  Waiting ${delaySeconds}s to avoid rate limit...`);
        await sleep(delaySeconds * 1000);
      }

      const result = await generateSingleStepImage(
        replicate,
        supabase,
        recipeId,
        recipeName,
        step,
        style,
        lighting,
        background
      );

      results.push(result);
    }

    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const totalTime = results
      .filter(r => r.success && r.time)
      .reduce((sum, r) => sum + (r.time || 0), 0);
    const avgTime = successful > 0 ? (totalTime / successful / 1000).toFixed(1) : 0;
    const estimatedCost = successful * 0.04;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 SUMMARY`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Average time: ${avgTime}s per image`);
    console.log(`💰 Total cost: ~$${estimatedCost.toFixed(2)}`);
    console.log(`${'='.repeat(60)}\n`);

    return NextResponse.json({
      success: true,
      summary: {
        total: stepsToProcess.length,
        successful,
        failed,
        avgTimeSeconds: parseFloat(avgTime as string),
        estimatedCost
      },
      results
    });

  } catch (error: any) {
    console.error('❌ Batch generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate images' },
      { status: 500 }
    );
  }
}

/**
 * GET: Check status
 */
export async function GET() {
  return NextResponse.json({
    message: 'Batch Generate Recipe Images API',
    model: 'Google Imagen 4',
    provider: 'Replicate',
    status: REPLICATE_API_TOKEN ? 'configured' : 'missing API token',
    rateLimit: '~6 requests/minute (auto-delayed)'
  });
}