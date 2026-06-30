# KetoCakR — Post-Import: Ingredient Matching + Nutrition + ready_recipes

## Goal
After PDF import, for each simple recipe:
1. Match recipe_ingredients → ingredients_database (fuzzy name match)
2. Calculate total nutrition from matched ingredients
3. Create ready_recipes record so recipe appears in mobile app

## Context
- `recipe_ingredients.ingredient_database_id` is NULL for all imported recipes
- `ingredients_database` has nutrition per 100g
- `ready_recipes` needs: name_bg, name_en, total_calories, total_protein, total_fat, total_carbs, total_net_carbs, total_servings, status, slug, is_free, is_featured, difficulty_level

---

## Step 1 — Read existing files

Read these files first:
- `Admin/app/api/simple-recipes/[id]/route.ts` (or similar edit/update route)
- `Admin/app/dashboard/simple-recipes/[id]/edit/page.tsx`

Understand how a simple recipe is currently saved/updated.

---

## Step 2 — Create ingredient matching API route

Create `Admin/app/api/simple-recipes/[id]/match-ingredients/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const recipeId = params.id

  // Get all recipe ingredients without a match
  const { data: recipeIngredients, error: riError } = await supabase
    .from('recipe_ingredients')
    .select('id, ingredient_name, quantity, unit')
    .eq('recipe_id', recipeId)
    .is('ingredient_database_id', null)

  if (riError) return NextResponse.json({ error: riError.message }, { status: 500 })
  if (!recipeIngredients?.length) return NextResponse.json({ matched: 0 })

  // Get all ingredients_database entries for matching
  const { data: dbIngredients } = await supabase
    .from('ingredients_database')
    .select('id, name_bg, name_en, aliases, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g, unit_weight_grams')

  if (!dbIngredients?.length) return NextResponse.json({ matched: 0, error: 'No ingredients in database' })

  let matchedCount = 0
  const matchResults: Array<{ ingredient_name: string; matched_to: string | null }> = []

  for (const ri of recipeIngredients) {
    const matched = findBestMatch(ri.ingredient_name, dbIngredients)
    
    matchResults.push({
      ingredient_name: ri.ingredient_name,
      matched_to: matched?.name_bg ?? null,
    })

    if (matched) {
      await supabase
        .from('recipe_ingredients')
        .update({ ingredient_database_id: matched.id })
        .eq('id', ri.id)
      matchedCount++
    }
  }

  console.log(`[Match] Recipe ${recipeId}: ${matchedCount}/${recipeIngredients.length} matched`)
  
  return NextResponse.json({ 
    matched: matchedCount, 
    total: recipeIngredients.length,
    results: matchResults 
  })
}

function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^а-яa-z0-9\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function findBestMatch(ingredientName: string, dbIngredients: any[]): any | null {
  const normalizedName = normalize(ingredientName)
  
  // 1. Exact match on name_bg
  const exact = dbIngredients.find(d => normalize(d.name_bg || '') === normalizedName)
  if (exact) return exact

  // 2. Check aliases
  const aliasMatch = dbIngredients.find(d => {
    const aliases: string[] = d.aliases || []
    return aliases.some(a => normalize(a) === normalizedName)
  })
  if (aliasMatch) return aliasMatch

  // 3. Contains match — ingredient name contains DB name or vice versa
  const containsMatch = dbIngredients.find(d => {
    const dbName = normalize(d.name_bg || '')
    return (
      normalizedName.includes(dbName) ||
      dbName.includes(normalizedName)
    ) && dbName.length >= 4
  })
  if (containsMatch) return containsMatch

  // 4. First significant word match
  const firstWord = normalizedName.split(' ').find(w => w.length >= 4)
  if (firstWord) {
    const wordMatch = dbIngredients.find(d => {
      const dbName = normalize(d.name_bg || '')
      return dbName.includes(firstWord) || firstWord.includes(dbName.split(' ')[0])
    })
    if (wordMatch) return wordMatch
  }

  return null
}
```

---

## Step 3 — Create nutrition calculation + ready_recipes route

Create `Admin/app/api/simple-recipes/[id]/publish/route.ts`:

```typescript
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const recipeId = params.id

  // Get recipe
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
        carbs_per_100g, fiber_per_100g, unit_weight_grams
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

    // Convert quantity to grams
    let grams = 0
    const qty = parseFloat(ing.quantity) || 0
    const unit = (ing.unit || '').toLowerCase()

    if (['г', 'g', 'гр'].includes(unit)) {
      grams = qty
    } else if (['кг', 'kg'].includes(unit)) {
      grams = qty * 1000
    } else if (['мл', 'ml'].includes(unit)) {
      grams = qty // 1ml ≈ 1g for most liquids
    } else if (['л', 'l'].includes(unit)) {
      grams = qty * 1000
    } else if (['чаена лъжичка', 'tsp'].includes(unit)) {
      grams = qty * 5
    } else if (['супена лъжица', 'tbsp'].includes(unit)) {
      grams = qty * 15
    } else if (['чаша', 'cup'].includes(unit)) {
      grams = qty * 240
    } else if (['бр', 'бройки', 'pcs'].includes(unit)) {
      grams = qty * (db.unit_weight_grams || 50)
    } else {
      grams = qty * (db.unit_weight_grams || 100)
    }

    if (grams > 0) {
      const factor = grams / 100
      totalCalories += (db.calories_per_100g || 0) * factor
      totalProtein += (db.protein_per_100g || 0) * factor
      totalFat += (db.fat_per_100g || 0) * factor
      totalCarbs += (db.carbs_per_100g || 0) * factor
      totalFiber += (db.fiber_per_100g || 0) * factor
    }
  }

  const totalNetCarbs = Math.max(0, totalCarbs - totalFiber)

  // Update base_recipe nutrition
  await supabase
    .from('base_recipes')
    .update({
      total_calories: Math.round(totalCalories),
      total_protein: Math.round(totalProtein * 10) / 10,
      total_fat: Math.round(totalFat * 10) / 10,
      total_carbs: Math.round(totalCarbs * 10) / 10,
      total_fiber: Math.round(totalFiber * 10) / 10,
      total_net_carbs: Math.round(totalNetCarbs * 10) / 10,
    })
    .eq('id', recipeId)

  // Check if ready_recipes record already exists
  const { data: existing } = await supabase
    .from('ready_recipes')
    .select('id')
    .eq('name_bg', recipe.name)
    .single()

  if (existing) {
    return NextResponse.json({ 
      success: true, 
      message: 'Nutrition updated, ready_recipe already exists',
      ready_recipe_id: existing.id 
    })
  }

  // Create ready_recipes record
  const servings = recipe.servings || 8
  const { data: readyRecipe, error: rrError } = await supabase
    .from('ready_recipes')
    .insert({
      name_bg: recipe.name,
      name_en: recipe.name_en || recipe.name,
      description_bg: recipe.description || '',
      description_en: recipe.description_en || '',
      hero_image_url: recipe.image_url || '',
      is_featured: false,
      is_free: recipe.is_free ?? false,
      difficulty_level: recipe.difficulty_level || 'medium',
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
      calories_per_serving: Math.round(totalCalories / servings),
      protein_per_serving: Math.round(totalProtein / servings * 10) / 10,
      fat_per_serving: Math.round(totalFat / servings * 10) / 10,
      carbs_per_serving: Math.round(totalCarbs / servings * 10) / 10,
      net_carbs_per_serving: Math.round(totalNetCarbs / servings * 10) / 10,
    })
    .select('id')
    .single()

  if (rrError) {
    console.error('[Publish] ready_recipes error:', rrError.message)
    // Return partial success — nutrition was updated
    return NextResponse.json({ 
      success: true,
      warning: `ready_recipes insert failed: ${rrError.message}`,
      nutrition: { totalCalories, totalProtein, totalFat, totalCarbs, totalNetCarbs }
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
    }
  })
}
```

---

## Step 4 — Add buttons to simple recipe edit page

In `Admin/app/dashboard/simple-recipes/[id]/edit/page.tsx`, add two buttons:

### Button 1: "Свържи съставки"
Calls `POST /api/simple-recipes/[id]/match-ingredients`
Shows result: "Свързани X от Y съставки"

### Button 2: "Изчисли нутриенти и публикувай"
Calls `POST /api/simple-recipes/[id]/publish`
Shows result with nutrition values

Both buttons should show loading state and success/error message.

Place buttons in a new section below the existing form fields, labeled:
"Автоматична обработка"

---

## Step 5 — Also call match + publish automatically after PDF import

In `Admin/app/api/pdf-import/execute/route.ts`, after successfully inserting a recipe,
add automatic matching and nutrition calculation:

```typescript
// After successful base_recipes insert and getting recipeId:

// Auto-match ingredients
const matchRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/simple-recipes/${recipeId}/match-ingredients`, {
  method: 'POST',
})
const matchData = await matchRes.json()
console.log(`[PDF Execute] Matched ${matchData.matched}/${matchData.total} ingredients for "${recipe.name}"`)

// Auto-calculate nutrition and create ready_recipe
const publishRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/simple-recipes/${recipeId}/publish`, {
  method: 'POST',
})
const publishData = await publishRes.json()
console.log(`[PDF Execute] Published "${recipe.name}":`, publishData.nutrition)
```

Check if `NEXT_PUBLIC_APP_URL` is in `.env.local`. If not, add:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 6 — Test

Delete today's recipes first:
```sql
DELETE FROM base_recipes WHERE is_simple_recipe = true AND created_at::date = CURRENT_DATE;
```

Then upload PDF and verify:
```sql
SELECT 
  r.name,
  r.total_calories,
  r.total_net_carbs,
  COUNT(DISTINCT ri.id) as ingredients,
  COUNT(DISTINCT ri2.id) as matched_ingredients,
  COUNT(DISTINCT s.id) as steps,
  rr.id as ready_recipe_id
FROM base_recipes r
LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
LEFT JOIN recipe_ingredients ri2 ON ri2.recipe_id = r.id AND ri2.ingredient_database_id IS NOT NULL
LEFT JOIN recipe_instruction_steps s ON s.recipe_id = r.id
LEFT JOIN ready_recipes rr ON rr.name_bg = r.name
WHERE r.is_simple_recipe = true AND r.created_at::date = CURRENT_DATE
GROUP BY r.name, r.total_calories, r.total_net_carbs, rr.id;
```

---

## Do NOT change
- upload-chunk/route.ts
- pdfParser.ts
- Any other existing routes
