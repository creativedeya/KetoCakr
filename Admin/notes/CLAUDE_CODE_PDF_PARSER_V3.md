# KetoCakR — PDF Parser v3 (Claude API + Full DB Population)

## Goal
1. Parse PDF with Claude API (handles Bulgarian text perfectly)
2. Insert into `base_recipes` with correct field mapping
3. Auto-populate `recipe_instruction_steps` and `recipe_ingredients` from parsed data

## PDF Structure (confirmed, clean version)
Each recipe:
- Header image (skip — no image_url)
- Title (Bulgarian)
- "Serving size: X | Cook time: Y mins"
- "Ingredients" + ingredient list
- "Directions" + step-by-step instructions

---

## DB Field Mapping

| PDF content | DB table | DB column |
|---|---|---|
| Title (BG) | base_recipes | name |
| Title translated EN | base_recipes | name_en |
| Serving size | base_recipes | servings |
| Cook time | base_recipes | bake_time_minutes |
| Ingredients (BG) | base_recipes | ingredients_text_bg |
| Ingredients translated EN | base_recipes | ingredients_text_en |
| Directions (BG) | base_recipes | description |
| Directions translated EN | base_recipes | description_en |
| Each direction step (BG) | recipe_instruction_steps | step_description_bg |
| Each direction step (EN) | recipe_instruction_steps | step_description_en |
| Each direction step (BG) | recipe_instruction_steps | step_description (same as bg) |
| Step number | recipe_instruction_steps | step_number |
| recipe_id FK | recipe_instruction_steps | recipe_id |
| Each ingredient line | recipe_ingredients | ingredient_name |
| Quantity (parsed from line) | recipe_ingredients | quantity |
| Unit (parsed from line) | recipe_ingredients | unit |
| Order index | recipe_ingredients | order_index |
| recipe_id FK | recipe_ingredients | recipe_id |

---

## Step 1 — Check ANTHROPIC_API_KEY

In `Admin/.env.local` verify `ANTHROPIC_API_KEY` exists.
It's the same key used for AI step generation elsewhere in the project.

---

## Step 2 — Rewrite Admin/utils/pdfParser.ts

```typescript
import fs from 'fs'
import Anthropic from '@anthropic-ai/sdk'

export interface ParsedStep {
  step_number: number
  step_description_bg: string
  step_description_en: string
}

export interface ParsedIngredient {
  ingredient_name: string
  quantity: string
  unit: string
  order_index: number
}

export interface ParsedRecipe {
  name: string
  name_en: string
  servings: number
  bake_time_minutes: number
  ingredients_text_bg: string
  ingredients_text_en: string
  description: string
  description_en: string
  steps: ParsedStep[]
  ingredients: ParsedIngredient[]
}

export async function parsePDFRecipes(filePath: string): Promise<ParsedRecipe[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const fileBuffer = fs.readFileSync(filePath)
  const base64PDF = fileBuffer.toString('base64')

  console.log('[PDF Parser] Sending to Claude API...')

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 16000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: base64PDF,
          },
        },
        {
          type: 'text',
          text: `You are extracting recipes from a Bulgarian keto cookbook PDF.

Extract ALL recipes. For each recipe return a JSON object with:
- "name": recipe title in Bulgarian (exactly as written)
- "name_en": recipe title translated to English
- "servings": integer (from "Serving size:" line, take the first number)
- "bake_time_minutes": integer (from "Cook time:" line)
- "ingredients_text_bg": all ingredients as multiline string, one ingredient per line, in Bulgarian
- "ingredients_text_en": all ingredients translated to English, one per line
- "description": all directions as one string, each step separated by double newline, in Bulgarian
- "description_en": all directions translated to English, each step separated by double newline
- "steps": array of objects, one per direction step: {"step_number": 1, "step_description_bg": "...", "step_description_en": "..."}
- "ingredients": array of objects, one per ingredient: {"ingredient_name": "...", "quantity": "...", "unit": "...", "order_index": 1}
  For ingredients, parse quantity and unit from the ingredient line. Example: "200 г бадемово брашно" → {"ingredient_name":"бадемово брашно","quantity":"200","unit":"г","order_index":1}
  If no quantity/unit, use empty strings.

Return ONLY a valid JSON array of recipe objects. No markdown, no explanation, no code blocks.`
        }
      ]
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  console.log('[PDF Parser] Response received, length:', text.length)
  console.log('[PDF Parser] First 300 chars:', text.substring(0, 300))

  const clean = text.replace(/^```json\s*/m, '').replace(/^```\s*$/m, '').trim()
  
  let recipes: ParsedRecipe[]
  try {
    recipes = JSON.parse(clean)
  } catch (e) {
    console.error('[PDF Parser] JSON parse failed. Raw text:', text.substring(0, 1000))
    throw new Error('Claude returned invalid JSON')
  }

  console.log('[PDF Parser] ✅ Parsed', recipes.length, 'recipes')
  return recipes
}
```

---

## Step 3 — Rewrite Admin/app/api/pdf-import/execute/route.ts

Replace the insert logic to populate all 3 tables:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ParsedRecipe } from '@/utils/pdfParser'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { recipes }: { recipes: ParsedRecipe[] } = await request.json()
    console.log('[PDF Execute] Importing', recipes.length, 'recipes')

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
          const ingredientsToInsert = recipe.ingredients.map(ing => ({
            recipe_id: recipeId,
            ingredient_name: ing.ingredient_name,
            quantity: ing.quantity,
            unit: ing.unit,
            order_index: ing.order_index,
          }))

          const { error: ingError } = await supabase
            .from('recipe_ingredients')
            .insert(ingredientsToInsert)

          if (ingError) console.warn(`[PDF Execute] Ingredients error for "${recipe.name}":`, ingError.message)
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
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (err: any) {
    console.error('[PDF Execute] Fatal error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
```

---

## Step 4 — Verify RecipePreview component

Open `Admin/components/RecipePreview.tsx`.
Make sure it reads `recipe.description` (not `recipe.instructions`) for the directions preview,
and `recipe.ingredients_text_bg` for ingredients.

---

## Step 5 — Test

```bash
npm run dev
# Upload PDF
# Expected console:
# [PDF Parser] Sending to Claude API...
# [PDF Parser] ✅ Parsed 20 recipes
# [PDF Execute] ✅ "АНИСОВИ ПОНИЧКИ" — 5 steps, 8 ingredients
# ...
```

Then check in Supabase:
```sql
SELECT r.name, COUNT(DISTINCT s.id) as steps, COUNT(DISTINCT i.id) as ingredients
FROM base_recipes r
LEFT JOIN recipe_instruction_steps s ON s.recipe_id = r.id
LEFT JOIN recipe_ingredients i ON i.recipe_id = r.id
WHERE r.is_simple_recipe = true
GROUP BY r.name
ORDER BY r.created_at DESC
LIMIT 25;
```

All recipes should have steps > 0 and ingredients > 0.

---

## Do NOT change
- upload-chunk/route.ts
- Admin UI dashboard components
- Any other API routes
