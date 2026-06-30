import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ParsedRecipe } from '@/utils/pdfParser'

export const dynamic = 'force-dynamic'

function parseQuantity(qty: string): number | null {
  if (!qty || qty.trim() === '') return null
  const trimmed = qty.trim()

  // Handle "1 1/2" format
  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/)
  if (mixedMatch) {
    return parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3])
  }

  // Handle "1/4" format
  const fractionMatch = trimmed.match(/^(\d+)\/(\d+)$/)
  if (fractionMatch) {
    return parseInt(fractionMatch[1]) / parseInt(fractionMatch[2])
  }

  // Handle plain number
  const num = parseFloat(trimmed)
  return isNaN(num) ? null : num
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { recipes }: { recipes: ParsedRecipe[] } = await request.json()
    console.log('[PDF Execute] Importing', recipes.length, 'recipes')
    console.log('[PDF Execute] First recipe ingredients sample:', JSON.stringify(recipes[0]?.ingredients?.slice(0, 2)))
    console.log('[PDF Execute] Recipe 0 ingredients:', JSON.stringify(recipes[0]?.ingredients))
    console.log('[PDF Execute] Recipe 0 ingredients_text_bg:', recipes[0]?.ingredients_text_bg?.substring(0, 100))

    let successCount = 0
    const errors: string[] = []

    for (const recipe of recipes) {
      try {
        // 1. Insert into base_recipes
        const { data: inserted, error: recipeError } = await supabase
          .from('base_recipes')
          .insert({
            name: recipe.name,
            name_en: recipe.name_en,
            servings: recipe.servings,
            bake_time_minutes: recipe.bake_time_minutes,
            ingredients_text_bg: recipe.ingredients_text_bg,
            ingredients_text_en: recipe.ingredients_text_en,
            description: recipe.description,
            description_en: recipe.description_en,
            is_simple_recipe: true,
            is_free: false,
            is_visible_to_users: true,
            total_weight_grams: 0,
            total_calories: 0,
            total_fat: 0,
            total_protein: 0,
            total_carbs: 0,
            total_net_carbs: 0,
          })
          .select('id')
          .single()

        if (recipeError) throw recipeError
        const recipeId = inserted.id

        // 2. Insert recipe_instruction_steps
        if (recipe.steps && recipe.steps.length > 0) {
          const stepsToInsert = recipe.steps.map(step => ({
            recipe_id: recipeId,
            step_number: step.step_number,
            step_description: step.step_description_bg,
            step_description_bg: step.step_description_bg,
            step_description_en: step.step_description_en,
            duration_minutes: 0,
            ingredients_used: [],
            equipment_needed: [],
          }))

          const { error: stepsError } = await supabase
            .from('recipe_instruction_steps')
            .insert(stepsToInsert)

          if (stepsError) console.warn(`[PDF Execute] Steps error for "${recipe.name}":`, stepsError.message)
        }

        // 3. Insert recipe_ingredients
        if (recipe.ingredients && recipe.ingredients.length > 0) {
          const ingredientsToInsert = (recipe.ingredients as any[]).map(ing => ({
            recipe_id: recipeId,
            ingredient_name: ing.ingredient_name,
            quantity: parseQuantity(ing.quantity),
            unit: ing.unit || '',
            order_index: ing.order_index || 0,
          }))

          const { error: ingError } = await supabase
            .from('recipe_ingredients')
            .insert(ingredientsToInsert)

          if (ingError) {
            console.error(`[PDF Execute] Ingredients error for "${recipe.name}":`, ingError.message)
          } else {
            console.log(`[PDF Execute] ✅ Inserted ${ingredientsToInsert.length} ingredients for "${recipe.name}"`)
          }
        }

        // Auto-match ingredients to database entries
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        try {
          const matchRes = await fetch(`${appUrl}/api/simple-recipes/${recipeId}/match-ingredients`, { method: 'POST' })
          const matchData = await matchRes.json()
          console.log(`[PDF Execute] Matched ${matchData.matched}/${matchData.total} ingredients for "${recipe.name}"`)
        } catch (matchErr: any) {
          console.warn(`[PDF Execute] Match failed for "${recipe.name}":`, matchErr.message)
        }

        // Auto-calculate nutrition and create ready_recipe
        try {
          const publishRes = await fetch(`${appUrl}/api/simple-recipes/${recipeId}/publish`, { method: 'POST' })
          const publishData = await publishRes.json()
          console.log(`[PDF Execute] Published "${recipe.name}":`, publishData.nutrition ?? publishData.warning)
        } catch (publishErr: any) {
          console.warn(`[PDF Execute] Publish failed for "${recipe.name}":`, publishErr.message)
        }

        successCount++
        console.log(`[PDF Execute] ✅ "${recipe.name}" — ${recipe.steps?.length ?? 0} steps, ${recipe.ingredients?.length ?? 0} ingredients`)

      } catch (err: any) {
        console.error(`[PDF Execute] ❌ Failed "${recipe.name}":`, err.message)
        errors.push(`${recipe.name}: ${err.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      imported: successCount,
      total: recipes.length,
      errors: errors.length > 0 ? errors : [],
    })

  } catch (err: any) {
    console.error('[PDF Execute] Fatal error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
