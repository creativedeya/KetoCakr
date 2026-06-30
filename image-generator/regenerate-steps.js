// =====================================================
// Regenerate specific steps with improved prompts
// =====================================================

import Replicate from "replicate";
import dotenv from "dotenv";
import { 
  downloadAndUpload,
  updateStepImage,
  testSupabaseConnection 
} from './supabase.js';
import { createClient } from '@supabase/supabase-js';
import { analyzeStepVisual, buildImagenPrompt } from './gpt-analyzer.js';

dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Helper: Wait/sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Regenerate specific steps
 */
async function regenerateSpecificSteps(recipeId, stepNumbers, model = 'imagen') {
  console.log(`\n🔄 Regenerating steps ${stepNumbers.join(', ')} for recipe ${recipeId}\n`);
  
  // Test connection
  const connected = await testSupabaseConnection();
  if (!connected) return;
  
  // Fetch recipe
  const { data: recipe } = await supabase
    .from('base_recipes')
    .select('id, name, name_en')
    .eq('id', recipeId)
    .single();
  
  console.log(`Recipe: ${recipe.name}`);
  
  // Fetch ALL steps for context
  const { data: allSteps } = await supabase
    .from('recipe_instruction_steps')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('step_number');
  
  // Fetch ingredients
 // Fetch ingredients with proper JOIN
const { data: recipeIngredients } = await supabase
  .from('recipe_ingredients')
  .select(`
    ingredient_name,
    ingredient:ingredients_database(name_bg, name_en)
  `)
  .eq('recipe_id', recipeId)
  .order('order_index');

const ingredientsList = recipeIngredients
  ?.map(ri => ri.ingredient?.name_bg || ri.ingredient?.name_en || ri.ingredient_name)
  .filter(Boolean)
  .filter(name => !name.includes(':'))
  .join(', ') || 'various ingredients';

   // Filter steps to regenerate
  const stepsToRegenerate = allSteps.filter(s => stepNumbers.includes(s.step_number));
  
  console.log(`\nRegenerating ${stepsToRegenerate.length} steps...\n`);
  
  const results = [];
  
  for (const step of stepsToRegenerate) {
    const startTime = Date.now();
    
    try {
      console.log(`\n🎨 Step ${step.step_number}: "${step.step_description.substring(0, 60)}..."`);
      
      // Get context
      const currentIndex = allSteps.findIndex(s => s.id === step.id);
      const previousStep = currentIndex > 0 ? allSteps[currentIndex - 1] : null;
      const nextStep = currentIndex < allSteps.length - 1 ? allSteps[currentIndex + 1] : null;
      
      // Analyze with GPT-4
      const stepData = {
        recipeName: recipe.name,
        ingredients: ingredientsList,
        stepNumber: step.step_number,
        totalSteps: allSteps.length,
        stepDescription: step.step_description,
        previousStepDescription: previousStep?.step_description || null,
        nextStepDescription: nextStep?.step_description || null
      };
      
      const visualDescription = await analyzeStepVisual(stepData);
      const prompt = buildImagenPrompt(visualDescription, recipe.name, step.step_number);
      
      // Generate image
      console.log(`   ⏳ Generating with ${model}...`);
      
      const input = {
        prompt: prompt,
        aspect_ratio: "1:1",
        output_format: model === 'imagen' ? 'png' : 'webp'
      };
      
      const output = await replicate.run(
        model === 'imagen' ? 'google/imagen-4' : 'black-forest-labs/flux-1.1-pro',
        { input }
      );
      
      const imageUrl = output.toString();
      
      console.log(`   ✅ Generated!`);
      console.log(`   🌐 URL: ${imageUrl.substring(0, 60)}...`);
      
      // Upload
      console.log(`   📤 Uploading...`);
      const uploadResult = await downloadAndUpload(imageUrl, {
        prefix: `step-${step.step_number}`,
        extension: 'png',
        folder: `recipes/${recipeId}`,
        metadata: {
          recipe_id: recipeId,
          step_number: step.step_number,
          model: model,
          regenerated: true
        }
      });
      
      if (!uploadResult.success) throw new Error(uploadResult.error);
      
      // Update DB
      console.log(`   💾 Updating database...`);
      await updateStepImage(step.id, uploadResult.publicUrl);
      
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`   ✅ Complete (${elapsed}s)`);
      
      results.push({
        step: step.step_number,
        success: true,
        url: uploadResult.publicUrl,
        time: elapsed
      });
      
      // Wait to avoid rate limit
      if (stepsToRegenerate.indexOf(step) < stepsToRegenerate.length - 1) {
        console.log(`\n   ⏸️  Waiting 12s...`);
        await sleep(12000);
      }
      
    } catch (error) {
      console.error(`   ❌ Failed:`, error.message);
      results.push({
        step: step.step_number,
        success: false,
        error: error.message
      });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 REGENERATION SUMMARY\n');
  
  const successful = results.filter(r => r.success).length;
  console.log(`✅ Success: ${successful}/${results.length}`);
  
  if (successful > 0) {
    const totalTime = results.filter(r => r.success).reduce((sum, r) => sum + parseFloat(r.time), 0);
    console.log(`⏱️  Total time: ${totalTime.toFixed(1)}s`);
    console.log(`💰 Cost: ~$${(successful * 0.04).toFixed(2)}`);
  }
  
  console.log('\n' + '='.repeat(60));
}

// Usage: node regenerate-steps.js <recipe_id> <step_numbers>
// Example: node regenerate-steps.js abc-123 1,3,4,6

const recipeId = process.argv[2];
const stepNumbers = process.argv[3]?.split(',').map(Number);
const model = process.argv[4] || 'imagen';

if (!recipeId || !stepNumbers) {
  console.log('Usage: node regenerate-steps.js <recipe_id> <step_numbers> [model]');
  console.log('Example: node regenerate-steps.js 2e0b50d3-ab91-4840-9a02-12f46297037d 1,3,4,6 imagen');
  process.exit(1);
}

regenerateSpecificSteps(recipeId, stepNumbers, model).catch(console.error);