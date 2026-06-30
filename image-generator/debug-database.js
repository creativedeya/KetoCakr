import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function debugDatabase() {
  console.log('🔍 DATABASE DEBUG\n');
  
  // Test 1: Check base_recipes
  console.log('1️⃣ Testing base_recipes table...');
  const { data: recipes, error: recipesError } = await supabase
    .from('base_recipes')
    .select('id, name')
    .limit(3);
  
  if (recipesError) {
    console.error('❌ Error:', recipesError);
  } else {
    console.log(`✅ Found ${recipes.length} recipes`);
    console.log('   Sample:', recipes[0]);
  }
  
  // Test 2: Check recipe_instruction_steps
  console.log('\n2️⃣ Testing recipe_instruction_steps table...');
  const { data: steps, error: stepsError } = await supabase
    .from('recipe_instruction_steps')
    .select('id, recipe_id, step_number, step_description')
    .limit(3);
  
  if (stepsError) {
    console.error('❌ Error:', stepsError);
  } else {
    console.log(`✅ Found ${steps?.length || 0} steps`);
    if (steps && steps.length > 0) {
      console.log('   Sample:', steps[0]);
    }
  }
  
  // Test 3: Check recipe_base_ingredients
  console.log('\n3️⃣ Testing recipe_base_ingredients table...');
  const { data: recipeIngredients, error: riError } = await supabase
   .from('recipe_ingredients')
    .select('*')
    .limit(3);
  
  if (riError) {
    console.error('❌ Error:', riError);
  } else {
    console.log(`✅ Found ${recipeIngredients?.length || 0} recipe-ingredient links`);
    if (recipeIngredients && recipeIngredients.length > 0) {
      console.log('   Sample:', recipeIngredients[0]);
    }
  }
  
  // Test 4: Check base_ingredients
  console.log('\n4️⃣ Testing base_ingredients table...');
  const { data: ingredients, error: ingredientsError } = await supabase
    .from('base_ingredients')
    .select('*')
    .limit(5);
  
  if (ingredientsError) {
    console.error('❌ Error:', ingredientsError);
  } else {
    console.log(`✅ Found ${ingredients?.length || 0} base ingredients`);
    if (ingredients && ingredients.length > 0) {
      console.log('   Samples:', ingredients.map(i => i.name).join(', '));
    }
  }
  
  // Test 5: Test JOIN query (like in audit)
  console.log('\n5️⃣ Testing JOIN query...');
  const testRecipeId = recipes && recipes.length > 0 ? recipes[0].id : null;
  
  if (testRecipeId) {
    const { data: joinTest, error: joinError } = await supabase
      .from('recipe_base_ingredients')
      .select('ingredient_id, ingredient:base_ingredients(name)')
      .eq('recipe_id', testRecipeId);
    
    if (joinError) {
      console.error('❌ JOIN Error:', joinError);
    } else {
      console.log(`✅ JOIN returned ${joinTest?.length || 0} ingredients for recipe ${recipes[0].name}`);
      if (joinTest && joinTest.length > 0) {
        console.log('   Sample:', joinTest[0]);
      }
    }
  }
  
  // List all tables
  console.log('\n6️⃣ Available tables check...');
  const tables = [
    'base_recipes',
    'recipe_instruction_steps', 
    'recipe_base_ingredients',
    'base_ingredients',
    'ready_recipes',
    'recipe_ingredients'
  ];
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`   ❌ ${table}: ${error.message}`);
    } else {
      console.log(`   ✅ ${table}: ${count} rows`);
    }
  }
}

debugDatabase().catch(console.error);