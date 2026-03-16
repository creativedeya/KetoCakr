/**
 * Bulk Generate Recipe Steps
 * 
 * This script generates instruction steps for all base recipes that:
 * - Have a description
 * - Don't have steps yet
 * 
 * Run: node scripts/bulk-generate-steps.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get script directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from parent directory (admin root)
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !OPENAI_API_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, OPENAI_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function generateStepsForRecipe(recipeId, recipeName, description) {
  try {
    console.log(`\n🤖 Generating steps for: ${recipeName}`);
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: 'You are a helpful assistant that extracts cooking steps from recipe descriptions in both Bulgarian and English. Always respond with valid JSON only, no markdown, no explanations.'
        }, {
          role: 'user',
          content: `Analyze this recipe description and extract clear, numbered cooking steps in BOTH Bulgarian and English.

The description is in Bulgarian and may contain:
- Ingredients list (ignore this)
- Instructions section (extract from this)
- Mixed format text

Your task:
1. Find the cooking instructions in the text
2. Split them into individual steps
3. Provide each step in both Bulgarian (original) and English (translation)
4. Return ONLY a JSON array, no markdown, no explanation

Description:
${description}

Return format (copy exactly):
[
  {
    "step_bg": "Bulgarian step text here",
    "step_en": "English translation here"
  },
  {
    "step_bg": "Next Bulgarian step",
    "step_en": "Next English step"
  }
]

Rules:
- Extract actual Bulgarian text from description
- Translate accurately to English
- Each step is ONE clear action
- Start with verb (imperative)
- Keep concise (1-2 sentences max)
- If text has "Инструкции:" section, focus on that
- Ignore ingredient lists (those with bullet points and measurements)
- Return 5-15 steps typically
- Respond ONLY with the JSON array`
        }],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Parse JSON
    let jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
    }

    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }

    const steps = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(steps) || steps.length === 0) {
      throw new Error('Invalid steps format');
    }

    // Insert into database
    const stepsData = steps.map((step, index) => ({
      recipe_id: recipeId,
      step_number: index + 1,
      step_description: step.step_bg,
      step_description_bg: step.step_bg,
      step_description_en: step.step_en || null
    }));

    const { error: insertError } = await supabase
      .from('recipe_instruction_steps')
      .insert(stepsData);

    if (insertError) throw insertError;

    console.log(`   ✅ Generated ${steps.length} steps`);
    return { success: true, stepsCount: steps.length };

  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Starting bulk recipe steps generation...\n');

  // Get all recipes without steps
  const { data: recipes, error: fetchError } = await supabase
    .from('base_recipes')
    .select('id, name, description')
    .not('description', 'is', null)
    .neq('description', '');

  if (fetchError) {
    console.error('❌ Error fetching recipes:', fetchError);
    process.exit(1);
  }

  if (!recipes || recipes.length === 0) {
    console.log('ℹ️  No recipes found with descriptions');
    process.exit(0);
  }

  // Filter recipes that don't have steps yet
  const recipesNeedingSteps = [];
  for (const recipe of recipes) {
    const { count } = await supabase
      .from('recipe_instruction_steps')
      .select('*', { count: 'exact', head: true })
      .eq('recipe_id', recipe.id);

    if (count === 0) {
      recipesNeedingSteps.push(recipe);
    }
  }

  console.log(`📊 Found ${recipesNeedingSteps.length} recipes needing steps\n`);

  if (recipesNeedingSteps.length === 0) {
    console.log('✅ All recipes already have steps!');
    process.exit(0);
  }

  const results = {
    total: recipesNeedingSteps.length,
    success: 0,
    failed: 0,
    errors: []
  };

  // Process each recipe with delay to avoid rate limits
  for (let i = 0; i < recipesNeedingSteps.length; i++) {
    const recipe = recipesNeedingSteps[i];
    
    console.log(`\n[${i + 1}/${recipesNeedingSteps.length}] Processing: ${recipe.name}`);
    
    const result = await generateStepsForRecipe(recipe.id, recipe.name, recipe.description);
    
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push({ recipe: recipe.name, error: result.error });
    }

    // Delay between requests to avoid rate limiting (1 second)
    if (i < recipesNeedingSteps.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 BULK GENERATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total recipes processed: ${results.total}`);
  console.log(`✅ Successful: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(({ recipe, error }) => {
      console.log(`   - ${recipe}: ${error}`);
    });
  }

  console.log('\n✨ Done!');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});