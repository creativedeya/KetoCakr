import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { findBestMatches } from '@/lib/fuzzyMatch'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const recipeId = params.id

  const { data: recipeIngredients, error: riError } = await supabase
    .from('recipe_ingredients')
    .select('id, ingredient_name, quantity, unit')
    .eq('recipe_id', recipeId)
    .is('ingredient_database_id', null)

  if (riError) return NextResponse.json({ error: riError.message }, { status: 500 })
  if (!recipeIngredients?.length) return NextResponse.json({ matched: 0, total: 0 })

  const { data: dbIngredients } = await supabase
    .from('ingredients_database')
    .select('id, name_bg, name_en, aliases, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g, unit_weight_grams')

  if (!dbIngredients?.length) return NextResponse.json({ matched: 0, error: 'No ingredients in database' })

  let matchedCount = 0
  const matchResults: Array<{ ingredient_name: string; matched_to: string | null }> = []

  for (const ri of recipeIngredients) {
    // Use Levenshtein-based fuzzy matching on the Bulgarian name
    const matches = findBestMatches(
      ri.ingredient_name,
      dbIngredients.map(d => ({ id: d.id, name_bg: d.name_bg, name_en: d.name_en })),
      0.35,
      1
    )

    const best = matches[0] ? dbIngredients.find(d => d.id === matches[0].id) : null

    matchResults.push({
      ingredient_name: ri.ingredient_name,
      matched_to: best?.name_bg ?? null,
    })

    if (best) {
      await supabase
        .from('recipe_ingredients')
        .update({ ingredient_database_id: best.id })
        .eq('id', ri.id)
      matchedCount++
    }
  }

  console.log(`[Match] Recipe ${recipeId}: ${matchedCount}/${recipeIngredients.length} matched`)

  return NextResponse.json({
    matched: matchedCount,
    total: recipeIngredients.length,
    results: matchResults,
  })
}
