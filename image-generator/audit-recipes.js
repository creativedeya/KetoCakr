import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function auditRecipes() {
  console.log('📊 Recipe Audit Report\n');
  
  // Get all base recipes
  const { data: recipes, error: recipesError } = await supabase
    .from('base_recipes')
    .select('id, name, name_en')
    .order('name');
  
  if (recipesError) {
    console.error('Error fetching recipes:', recipesError);
    return;
  }
  
  console.log(`Total recipes: ${recipes.length}\n`);
  
  // Get step counts for each recipe
  const recipeDetails = [];
  let totalSteps = 0;
  
  for (const recipe of recipes) {
    const { data: steps, error: stepsError } = await supabase
      .from('recipe_instruction_steps')
      .select('id')
      .eq('recipe_id', recipe.id);
    
    const stepCount = steps?.length || 0;
    totalSteps += stepCount;
    
    recipeDetails.push({
      ...recipe,
      stepCount
    });
  }
  
  // Analyze by step count
  const byStepCount = {};
  
  recipeDetails.forEach(r => {
    if (!byStepCount[r.stepCount]) {
      byStepCount[r.stepCount] = [];
    }
    byStepCount[r.stepCount].push(r);
  });
  
  console.log('📈 Recipes by step count:');
  Object.keys(byStepCount).sort((a, b) => b - a).forEach(count => {
    console.log(`  ${count} steps: ${byStepCount[count].length} recipes`);
  });
  
  console.log(`\n📊 Statistics:`);
  console.log(`  Total steps across all recipes: ${totalSteps}`);
  console.log(`  Average steps per recipe: ${(totalSteps / recipes.length).toFixed(1)}`);
  
  // Estimate costs
  console.log(`\n💰 Cost Estimates (if we generate ALL steps):`);
  console.log(`  Imagen 4 only ($0.04/image): $${(totalSteps * 0.04).toFixed(2)}`);
  console.log(`  FLUX Schnell only ($0.003/image): $${(totalSteps * 0.003).toFixed(2)}`);
  console.log(`  Mixed strategy (key steps Imagen, rest Schnell):`);
  console.log(`    50% Imagen + 50% Schnell: $${(totalSteps * 0.0215).toFixed(2)}`);
  
  // Time estimates
  console.log(`\n⏱️  Time Estimates (with 12s delay between images):`);
  const timeMinutes = (totalSteps * 22) / 60; // ~22s per image (10s gen + 12s delay)
  console.log(`  Total time: ~${timeMinutes.toFixed(0)} minutes (${(timeMinutes/60).toFixed(1)} hours)`);
  
  // Show recipes with most steps
  console.log(`\n📝 Top 10 recipes by step count:`);
  recipeDetails
    .sort((a, b) => b.stepCount - a.stepCount)
    .slice(0, 10)
    .forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.name} - ${r.stepCount} steps`);
    });
  
  // Show recipes without steps
  const noSteps = recipeDetails.filter(r => r.stepCount === 0);
  if (noSteps.length > 0) {
    console.log(`\n⚠️  Recipes with 0 steps: ${noSteps.length}`);
    noSteps.slice(0, 5).forEach(r => {
      console.log(`  - ${r.name}`);
    });
  }
  
  console.log(`\n✅ Audit complete!`);
  
  return {
    totalRecipes: recipes.length,
    totalSteps,
    recipeDetails
  };
}

auditRecipes().catch(console.error);