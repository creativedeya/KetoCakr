import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import Replicate from 'replicate';
import { 
  downloadAndUpload,
  updateStepImage 
} from './supabase.js';
import { analyzeStepVisual, buildImagenPrompt } from './gpt-analyzer.js';

dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message.includes('429') || error.message.includes('throttled')) {
        const waitTime = Math.pow(2, i) * 2000;
        console.log(`   ⏳ Rate limited. Waiting ${waitTime/1000}s...`);
        await sleep(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

async function generateStepImage(step, recipeName, allSteps, ingredients, model = 'imagen') {
  // Get context
  const currentIndex = allSteps.findIndex(s => s.id === step.id);
  const previousStep = currentIndex > 0 ? allSteps[currentIndex - 1] : null;
  const nextStep = currentIndex < allSteps.length - 1 ? allSteps[currentIndex + 1] : null;
  
  // Analyze with GPT-4
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

  const output = await replicate.run(modelMap[model], { input });
  const imageUrl = output.toString();
  
  return imageUrl;
}

async function batchGenerateAll(options = {}) {
  const {
    model = 'imagen',
    skipCompleted = true,
    recipesToProcess = null // null = all, or array of recipe IDs
  } = options;

  console.log('🚀 BATCH IMAGE GENERATION\n');
  console.log(`Model: ${model}`);
  console.log(`Skip completed: ${skipCompleted}\n`);
  
  // Get all recipes with steps
  let query = supabase
    .from('base_recipes')
    .select('id, name, name_en')
    .order('name');
  
  if (recipesToProcess) {
    query = query.in('id', recipesToProcess);
  }
  
  const { data: recipes } = await query;
  
  console.log(`Found ${recipes.length} recipes to process\n`);
  
  const stats = {
    totalRecipes: recipes.length,
    totalSteps: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    startTime: Date.now()
  };
  
  // Process each recipe
  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    
    console.log(`\n[${ i + 1}/${recipes.length}] 📋 ${recipe.name}`);
    console.log('='.repeat(60));
    
    // Get steps
    const { data: allSteps } = await supabase
      .from('recipe_instruction_steps')
      .select('*')
      .eq('recipe_id', recipe.id)
      .order('step_number');
    
    if (!allSteps || allSteps.length === 0) {
      console.log('⏭️  No steps found, skipping...');
      continue;
    }
    
    // Get ingredients
    const { data: recipeIngredients } = await supabase
      .from('recipe_ingredients')
      .select('ingredient_id, ingredient:base_ingredients(name)')
      .eq('recipe_id', recipe.id);

    const ingredientsList = recipeIngredients
      ?.map(ri => ri.ingredient?.name)
      .filter(Boolean)
      .join(', ') || 'various ingredients';
    
    console.log(`Steps: ${allSteps.length}`);
    
    // Process steps
    for (let j = 0; j < allSteps.length; j++) {
      const step = allSteps[j];
      
      stats.totalSteps++;
      
      // Skip if already has image
      if (skipCompleted && step.step_image_url) {
        console.log(`  ⏭️  Step ${step.step_number}: Already has image, skipping`);
        stats.skipped++;
        continue;
      }
      
      console.log(`\n  🎨 Step ${step.step_number}/${allSteps.length}: "${step.step_description.substring(0, 50)}..."`);
      
      try {
        // Rate limit delay
        if (j > 0 || i > 0) {
          await sleep(12000);
        }
        
        // Generate
        const imageUrl = await retryWithBackoff(async () => {
          return await generateStepImage(step, recipe.name, allSteps, ingredientsList, model);
        });
        
        console.log(`     ✅ Generated`);
        
        // Upload
        const uploadResult = await downloadAndUpload(imageUrl, {
          prefix: `step-${step.step_number}`,
          extension: model === 'imagen' ? 'png' : 'webp',
          folder: `recipes/${recipe.id}`,
          metadata: {
            recipe_id: recipe.id,
            step_number: step.step_number,
            model: model,
            batch_generated: true
          }
        });
        
        if (!uploadResult.success) throw new Error(uploadResult.error);
        
        // Update DB
        await updateStepImage(step.id, uploadResult.publicUrl);
        
        console.log(`     💾 Saved to database`);
        stats.successful++;
        
      } catch (error) {
        console.error(`     ❌ Failed: ${error.message}`);
        stats.failed++;
      }
    }
  }
  
  // Final summary
  const elapsed = ((Date.now() - stats.startTime) / 1000 / 60).toFixed(1);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 BATCH GENERATION COMPLETE\n');
  console.log(`Recipes processed: ${stats.totalRecipes}`);
  console.log(`Total steps: ${stats.totalSteps}`);
  console.log(`✅ Successful: ${stats.successful}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`⏭️  Skipped: ${stats.skipped}`);
  console.log(`⏱️  Time: ${elapsed} minutes`);
  console.log(`💰 Cost: ~$${(stats.successful * (model === 'imagen' ? 0.04 : 0.003)).toFixed(2)}`);
  console.log('='.repeat(60));
}

// Usage
const model = process.argv[2] || 'imagen';
const skipCompleted = process.argv[3] !== 'force';

batchGenerateAll({ model, skipCompleted }).catch(console.error);