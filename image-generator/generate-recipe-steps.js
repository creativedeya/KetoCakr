// =====================================================
// Generate Images for Recipe Steps
// Complete workflow: Generate → Upload → Update DB
// =====================================================

import Replicate from "replicate";
import dotenv from "dotenv";
import { 
  downloadAndUpload,
  updateStepImage,
  testSupabaseConnection 
} from './supabase.js';
import { createClient } from '@supabase/supabase-js';

// Helper: Wait/sleep function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper: Retry with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message.includes('429') || error.message.includes('throttled')) {
        const waitTime = Math.pow(2, i) * 2000; // 2s, 4s, 8s
        console.log(`   ⏳ Rate limited. Waiting ${waitTime/1000}s...`);
        await sleep(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Generate image for a single recipe step
 */
async function generateStepImage(step, recipeName, allSteps, ingredients, model = 'imagen') {
  console.log(`\n🎨 Generating image for step ${step.step_number}...`);
  console.log(`   "${step.step_description.substring(0, 60)}..."`);
  
  // Get previous and next steps for context
  const currentIndex = allSteps.findIndex(s => s.id === step.id);
  const previousStep = currentIndex > 0 ? allSteps[currentIndex - 1] : null;
  const nextStep = currentIndex < allSteps.length - 1 ? allSteps[currentIndex + 1] : null;
  
  // Use GPT-4 to analyze and generate detailed visual description
  const { analyzeStepVisual, buildImagenPrompt } = await import('./gpt-analyzer.js');
  
  const stepData = {
    recipeName,
    ingredients,
    stepNumber: step.step_number,
    totalSteps: allSteps.length,
    stepDescription: step.step_description,
    previousStepDescription: previousStep?.step_description || null,
    nextStepDescription: nextStep?.step_description || null
  };
  
  const visualDescription = await analyzeStepVisual(stepData);
  const prompt = buildImagenPrompt(visualDescription, recipeName, step.step_number);

  const modelMap = {
    'imagen': 'google/imagen-4',
    'flux-pro': 'black-forest-labs/flux-1.1-pro',
    'flux': 'black-forest-labs/flux-schnell'
  };

  const input = {
    prompt: prompt,
    aspect_ratio: "1:1",
    output_format: model === 'imagen' ? 'png' : 'webp'
  };

  if (model === 'flux-pro') {
    input.prompt_upsampling = true;
  }

  try {
    console.log(`   ⏳ Calling ${model}...`);
    
    const output = await replicate.run(modelMap[model], { input });
    
    let imageUrl;
    if (typeof output === 'string') {
      imageUrl = output;
    } else if (output && typeof output.toString === 'function') {
      imageUrl = output.toString();
    } else if (Array.isArray(output)) {
      imageUrl = output[0]?.toString() || output[0];
    }
    
    if (!imageUrl || !imageUrl.startsWith('http')) {
      console.error(`   ❌ Could not extract URL`);
      return null;
    }
    
    console.log(`   ✅ Image generated!`);
    console.log(`   🌐 URL: ${imageUrl.substring(0, 60)}...`);
    
    return imageUrl;
    
  } catch (error) {
    console.error(`   ❌ Generation failed:`, error.message);
    return null;
  }
}

/**
 * Process all steps for a recipe
 */
async function processRecipeSteps(recipeId, model = 'imagen') {
  console.log(`\n📋 Processing recipe: ${recipeId}`);
  
  // Test connection
  const connected = await testSupabaseConnection();
  if (!connected) {
    console.error('❌ Cannot connect to Supabase');
    return;
  }
  
  // Fetch recipe and steps
  console.log('\n1️⃣ Fetching recipe data...');
  
  const { data: recipe, error: recipeError } = await supabase
    .from('base_recipes')
    .select('id, name, name_en')
    .eq('id', recipeId)
    .single();
  
  if (recipeError || !recipe) {
    console.error('❌ Recipe not found:', recipeError?.message);
    return;
  }
  
  console.log(`   Recipe: ${recipe.name} (${recipe.name_en || 'N/A'})`);
  // Fetch ingredients for context
const { data: recipeIngredients } = await supabase
  .from('recipe_ingredients')
  .select('ingredient_id, ingredient:base_ingredients(name)')
  .eq('recipe_id', recipeId);

const ingredientsList = recipeIngredients
  ?.map(ri => ri.ingredient?.name)
  .filter(Boolean)
  .join(', ') || 'various ingredients';

console.log(`   Ingredients: ${ingredientsList.substring(0, 60)}...`);

  // Fetch steps
  const { data: steps, error: stepsError } = await supabase
    .from('recipe_instruction_steps')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('step_number');
  
  if (stepsError || !steps || steps.length === 0) {
    console.error('❌ No steps found:', stepsError?.message);
    return;
  }
  
  console.log(`   Found ${steps.length} steps`);
  
  // Process each step
  console.log('\n2️⃣ Generating images...\n');
  
  const results = [];
  
 for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const startTime = Date.now();
    
    console.log(`\n[${ i + 1}/${steps.length}] Processing step ${step.step_number}...`);
    
    try {
      // Add delay between requests to avoid rate limit
      if (i > 0) {
        console.log(`   ⏸️  Waiting 12s to avoid rate limit...`);
        await sleep(12000); // 12 seconds = safe for 6/min limit
      }
      
      // Generate image with retry
      const imageUrl = await retryWithBackoff(async () => {
  return await generateStepImage(step, recipe.name, steps, ingredientsList, model);
});
      
      if (!imageUrl) {
        results.push({ step: step.step_number, success: false, error: 'Generation failed' });
        continue;
      }
      
      // Upload to Supabase
      console.log(`   📤 Uploading to Supabase...`);
      const uploadResult = await downloadAndUpload(imageUrl, {
        prefix: `step-${step.step_number}`,
        extension: model === 'imagen' ? 'png' : 'webp',
        folder: `recipes/${recipeId}`,
        metadata: {
          recipe_id: recipeId,
          step_number: step.step_number,
          model: model
        }
      });
      
      if (!uploadResult.success) {
        results.push({ step: step.step_number, success: false, error: uploadResult.error });
        continue;
      }
      
      // Update database
      console.log(`   💾 Updating database...`);
      const updateResult = await updateStepImage(step.id, uploadResult.publicUrl);
      
      if (!updateResult.success) {
        results.push({ step: step.step_number, success: false, error: updateResult.error });
        continue;
      }
      
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      
      results.push({
        step: step.step_number,
        success: true,
        url: uploadResult.publicUrl,
        time: elapsed
      });
      
      console.log(`   ✅ Step ${step.step_number} complete (${elapsed}s)\n`);
      
    } catch (error) {
      console.error(`   ❌ Error processing step ${step.step_number}:`, error.message);
      results.push({ step: step.step_number, success: false, error: error.message });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY\n');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${results.length}`);
  
  if (successful > 0) {
    const totalTime = results.filter(r => r.success).reduce((sum, r) => sum + parseFloat(r.time), 0);
    const avgTime = (totalTime / successful).toFixed(1);
    console.log(`⏱️  Average time: ${avgTime}s per image`);
    console.log(`💰 Total cost: ~$${(successful * (model === 'imagen' || model === 'flux-pro' ? 0.04 : 0.003)).toFixed(2)}`);
  }
  
  console.log('\n' + '='.repeat(60));
}

// Command line usage
const recipeId = process.argv[2];
const model = process.argv[3] || 'imagen';

if (!recipeId) {
  console.log('Usage: node generate-recipe-steps.js <recipe_id> [model]');
  console.log('Example: node generate-recipe-steps.js abc-123 imagen');
  console.log('Models: imagen (default), flux-pro, flux');
  process.exit(1);
}

processRecipeSteps(recipeId, model).catch(console.error);