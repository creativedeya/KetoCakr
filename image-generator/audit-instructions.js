import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function auditInstructions() {
  console.log('📊 RECIPE INSTRUCTIONS AUDIT\n');
  
  const { data: recipes } = await supabase
    .from('base_recipes')
    .select('id, name, name_en')
    .order('name');
  
  const report = {
    withSteps: [],
    withoutSteps: [],
    withIngredients: [],
    withoutIngredients: [],
    fullyComplete: [],
    needsWork: []
  };
  
  for (const recipe of recipes) {
    // Check steps
    const { data: steps } = await supabase
      .from('recipe_instruction_steps')
      .select('id, step_number, step_description')
      .eq('recipe_id', recipe.id)
      .order('step_number');
    
    // Check ingredients with proper JOIN
    const { data: ingredients } = await supabase
      .from('recipe_ingredients')
      .select(`
        id,
        ingredient_name,
        quantity,
        unit,
        ingredient_database_id,
        ingredient:ingredients_database(name_bg, name_en)
      `)
      .eq('recipe_id', recipe.id)
      .order('order_index');
    
    const hasSteps = steps && steps.length > 0;
    const hasIngredients = ingredients && ingredients.length > 0;
    
    const recipeInfo = {
      id: recipe.id,
      name: recipe.name,
      nameEn: recipe.name_en,
      stepCount: steps?.length || 0,
      ingredientCount: ingredients?.length || 0,
      steps: steps || [],
      ingredients: ingredients || []
    };
    
    if (hasSteps) report.withSteps.push(recipeInfo);
    else report.withoutSteps.push(recipeInfo);
    
    if (hasIngredients) report.withIngredients.push(recipeInfo);
    else report.withoutIngredients.push(recipeInfo);
    
    if (hasSteps && hasIngredients) report.fullyComplete.push(recipeInfo);
    else report.needsWork.push(recipeInfo);
  }
  
  // Print report
  console.log('═'.repeat(70));
  console.log('📈 SUMMARY');
  console.log('═'.repeat(70));
  console.log(`Total recipes: ${recipes.length}\n`);
  
  console.log(`✅ With instructions: ${report.withSteps.length}`);
  console.log(`❌ Without instructions: ${report.withoutSteps.length}\n`);
  
  console.log(`✅ With ingredients: ${report.withIngredients.length}`);
  console.log(`❌ Without ingredients: ${report.withoutIngredients.length}\n`);
  
  console.log(`🎯 FULLY COMPLETE: ${report.fullyComplete.length}`);
  console.log(`⚠️  NEEDS WORK: ${report.needsWork.length}\n`);
  
  console.log('═'.repeat(70));
  console.log('✅ READY FOR IMAGE GENERATION:');
  console.log('═'.repeat(70));
  report.fullyComplete.forEach(r => {
    console.log(`  📋 ${r.name}`);
    console.log(`     Steps: ${r.stepCount} | Ingredients: ${r.ingredientCount}`);
  });
  
  console.log('\n' + '═'.repeat(70));
  console.log('⚠️  NEEDS COMPLETION:');
  console.log('═'.repeat(70));
  report.needsWork.slice(0, 10).forEach(r => {
    const issues = [];
    if (r.stepCount === 0) issues.push('NO STEPS');
    if (r.ingredientCount === 0) issues.push('NO INGREDIENTS');
    console.log(`  ⚠️  ${r.name} - ${issues.join(', ')}`);
  });
  
  if (report.needsWork.length > 10) {
    console.log(`  ... and ${report.needsWork.length - 10} more`);
  }
  
  const fs = await import('fs');
  fs.writeFileSync(
    'recipe-audit-report.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📄 Full report saved to: recipe-audit-report.json');
}

auditInstructions().catch(console.error);