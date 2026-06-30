import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^а-яa-z0-9\s]/gi, '')
    .replace(/\s+/g, '-')
    .substring(0, 80)
    + '-' + Date.now().toString(36)
}

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const recipeId = params.id

  const { data: recipe, error: recipeError } = await supabase
    .from('base_recipes')
    .select('*')
    .eq('id', recipeId)
    .single()

  if (recipeError || !recipe) {
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
  }

  // Get recipe ingredients with nutrition data
  const { data: ingredients } = await supabase
    .from('recipe_ingredients')
    .select(`
      quantity, unit,
      ingredient_database_id,
      ingredients_database (
        calories_per_100g, protein_per_100g, fat_per_100g,
        carbs_per_100g, fiber_per_100g, unit_weight_grams, is_sugar_alcohol
      )
    `)
    .eq('recipe_id', recipeId)

  // Calculate total nutrition
  let totalCalories = 0
  let totalProtein = 0
  let totalFat = 0
  let totalCarbs = 0
  let totalFiber = 0

  for (const ing of ingredients || []) {
    const db = ing.ingredients_database as any
    if (!db || !ing.quantity) continue

    const qty = parseFloat(ing.quantity) || 0
    const unit = (ing.unit || '').toLowerCase()
    let grams = 0

    if (['г', 'g', 'гр'].includes(unit)) {
      grams = qty
    } else if (['кг', 'kg'].includes(unit)) {
      grams = qty * 1000
    } else if (['мл', 'ml'].includes(unit)) {
      grams = qty
    } else if (['л', 'l'].includes(unit)) {
      grams = qty * 1000
    } else if (['ч.л.', 'tsp'].includes(unit)) {
      grams = qty * 5
    } else if (['с.л.', 'tbsp'].includes(unit)) {
      grams = qty * 15
    } else if (['чаша', 'cup'].includes(unit)) {
      grams = qty * 240
    } else if (['бр', 'бр.', 'pcs'].includes(unit)) {
      grams = qty * (db.unit_weight_grams || 50)
    } else {
      // Unknown/decorative units (e.g. 'за поръсване', 'по избор', 'pkg') — skip
      grams = 0
    }

    if (grams > 0) {
      const factor = grams / 100
      totalCalories += (db.calories_per_100g || 0) * factor
      totalProtein += (db.protein_per_100g || 0) * factor
      totalFat += (db.fat_per_100g || 0) * factor
      if (!db.is_sugar_alcohol) {
        totalCarbs += (db.carbs_per_100g || 0) * factor
        totalFiber += (db.fiber_per_100g || 0) * factor
      }
    }
  }

  const totalNetCarbs = Math.max(0, totalCarbs - totalFiber)

  // Calculate total weight in grams
  let totalWeightGrams = 0
  for (const ing of ingredients || []) {
    const qty = parseFloat(ing.quantity) || 0
    const unit = (ing.unit || '').toLowerCase()
    let grams = 0
    if (['г', 'g', 'гр'].includes(unit)) grams = qty
    else if (['кг', 'kg'].includes(unit)) grams = qty * 1000
    else if (['мл', 'ml'].includes(unit)) grams = qty
    else if (['л', 'l'].includes(unit)) grams = qty * 1000
    else if (['ч.л.', 'tsp'].includes(unit)) grams = qty * 5
    else if (['с.л.', 'tbsp'].includes(unit)) grams = qty * 15
    else if (['чаша', 'cup'].includes(unit)) grams = qty * 240
    else if (['бр', 'бр.', 'pcs'].includes(unit)) grams = 0
    else grams = 0
    totalWeightGrams += grams
  }
  totalWeightGrams = Math.round(totalWeightGrams)

  const w = totalWeightGrams > 0 ? totalWeightGrams : null
  const caloriesPer100g = w ? Math.round(totalCalories / w * 100 * 10) / 10 : null
  const proteinPer100g = w ? Math.round(totalProtein / w * 100 * 10) / 10 : null
  const fatPer100g = w ? Math.round(totalFat / w * 100 * 10) / 10 : null
  const netCarbsPer100g = w ? Math.round(totalNetCarbs / w * 100 * 10) / 10 : null

  // Update base_recipe nutrition
  await supabase
    .from('base_recipes')
    .update({
      total_calories: Math.round(totalCalories),
      total_protein: Math.round(totalProtein * 10) / 10,
      total_fat: Math.round(totalFat * 10) / 10,
      total_carbs: Math.round(totalCarbs * 10) / 10,
      total_net_carbs: Math.round(totalNetCarbs * 10) / 10,
      total_weight_grams: totalWeightGrams || null,
      calories_per_100g: caloriesPer100g,
      protein_per_100g: proteinPer100g,
      fat_per_100g: fatPer100g,
      net_carbs_per_100g: netCarbsPer100g,
    })
    .eq('id', recipeId)

  // Check if ready_recipes record already exists for this base recipe (FK lookup — migration 62)
  const { data: existing } = await supabase
    .from('ready_recipes')
    .select('id')
    .eq('base_recipe_id', recipeId)
    .maybeSingle()

  if (existing) {
    // Update existing record's nutrition and names (names change when admin edits basic info)
    await supabase
      .from('ready_recipes')
      .update({
        name_bg: recipe.name,
        name_en: recipe.name_en || recipe.name,
        total_calories: Math.round(totalCalories),
        total_protein: Math.round(totalProtein * 10) / 10,
        total_fat: Math.round(totalFat * 10) / 10,
        total_carbs: Math.round(totalCarbs * 10) / 10,
        total_net_carbs: Math.round(totalNetCarbs * 10) / 10,
      })
      .eq('id', existing.id)

    return NextResponse.json({
      success: true,
      message: 'Nutrition updated on existing ready_recipe',
      ready_recipe_id: existing.id,
      nutrition: {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein * 10) / 10,
        fat: Math.round(totalFat * 10) / 10,
        carbs: Math.round(totalCarbs * 10) / 10,
        net_carbs: Math.round(totalNetCarbs * 10) / 10,
      },
    })
  }

  // Create new ready_recipes record with base_recipe_id FK (migration 62)
  const servings = recipe.servings || 8
  const { data: readyRecipe, error: rrError } = await supabase
    .from('ready_recipes')
    .insert({
      base_recipe_id: recipeId,
      name_bg: recipe.name,
      name_en: recipe.name_en || recipe.name,
      description_bg: recipe.description || '',
      description_en: recipe.description_en || '',
      hero_image_url: recipe.image_url || '',
      is_featured: false,
      is_free: recipe.is_free ?? false,
      difficulty_level: recipe.difficulty_level || 2,
      total_servings: servings,
      total_weight_grams: recipe.total_weight_grams || 0,
      total_calories: Math.round(totalCalories),
      total_protein: Math.round(totalProtein * 10) / 10,
      total_fat: Math.round(totalFat * 10) / 10,
      total_carbs: Math.round(totalCarbs * 10) / 10,
      total_net_carbs: Math.round(totalNetCarbs * 10) / 10,
      status: 'draft',
      slug: generateSlug(recipe.name),
      cost_currency: 'BGN',
      price_currency: 'BGN',
      selected_components: [{
        base_recipe_id: recipeId,
        recipe_id: recipeId,
        role: 'simple',
        order_index: 0,
        multiplier: 1,
      }],
    })
    .select('id')
    .single()

  if (rrError) {
    console.error('[Publish] ready_recipes error:', rrError.message)
    return NextResponse.json({
      success: true,
      warning: `ready_recipes insert failed: ${rrError.message}`,
      nutrition: {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein * 10) / 10,
        fat: Math.round(totalFat * 10) / 10,
        carbs: Math.round(totalCarbs * 10) / 10,
        net_carbs: Math.round(totalNetCarbs * 10) / 10,
      },
    })
  }

  return NextResponse.json({
    success: true,
    ready_recipe_id: readyRecipe.id,
    nutrition: {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      net_carbs: Math.round(totalNetCarbs * 10) / 10,
    },
  })
}
