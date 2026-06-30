# Fix: Empty ingredients & instructions after PDF import

## Problem
After PDF import, recipes appear with only name + servings.
`ingredients_text_bg`, `instructions` columns are empty in `base_recipes`.

## Root Cause
The parser returns:
```typescript
{
  ingredients: ['Placeholder 1', 'Placeholder 2'],  // array
  directions: ['Step 1', 'Step 2'],                  // array
}
```

But `base_recipes` columns are **text fields**, not arrays:
- `ingredients_text_bg` — text (multiline string)
- `ingredients_text_en` — text (multiline string)  
- `instructions` — text (multiline string)

The DB insert maps the wrong field names → data is lost.

---

## Fix 1 — Update pdfParser.ts return shape

In `Admin/utils/pdfParser.ts`, change the returned object to match DB columns:

```typescript
// BEFORE:
return recipeNames.map((name) => ({
  name,
  servings: 8,
  bake_time_minutes: 0,
  ingredients: ['Placeholder ingredient 1', 'Placeholder ingredient 2'],
  directions: ['Placeholder step 1', 'Placeholder step 2'],
}))

// AFTER:
return recipeNames.map((name) => ({
  name,
  servings: 8,
  bake_time_minutes: 0,
  ingredients_text_bg: '- Съставка 1\n- Съставка 2\n- Съставка 3',
  ingredients_text_en: '- Ingredient 1\n- Ingredient 2\n- Ingredient 3',
  instructions: '1. Стъпка 1\n2. Стъпка 2\n3. Стъпка 3',
}))
```

Also update the `ParsedRecipe` interface:
```typescript
export interface ParsedRecipe {
  name: string
  servings: number
  bake_time_minutes: number
  ingredients_text_bg: string
  ingredients_text_en: string
  instructions: string
}
```

---

## Fix 2 — Verify parse/route.ts inserts correct fields

Open `Admin/app/api/pdf-import/parse/route.ts` (or wherever the Supabase insert happens).

Find the insert block and make sure ALL fields are passed:

```typescript
const { error } = await supabase
  .from('base_recipes')
  .insert(recipes.map((r) => ({
    name: r.name,
    servings: r.servings,
    bake_time_minutes: r.bake_time_minutes,
    ingredients_text_bg: r.ingredients_text_bg,
    ingredients_text_en: r.ingredients_text_en,
    instructions: r.instructions,
    is_simple_recipe: true,
    is_free: false,
    is_visible_to_users: true,
    total_weight_grams: 0,
  })))
```

---

## Fix 3 — Update existing imported recipes (SQL)

The 2 already-imported recipes (from 2026-06-01) have empty fields.
Run this in Supabase SQL Editor to patch them:

```sql
UPDATE base_recipes
SET 
  ingredients_text_bg = '- Съставка 1' || chr(10) || '- Съставка 2' || chr(10) || '- Съставка 3',
  ingredients_text_en = '- Ingredient 1' || chr(10) || '- Ingredient 2' || chr(10) || '- Ingredient 3',
  instructions = '1. Стъпка 1' || chr(10) || '2. Стъпка 2' || chr(10) || '3. Стъпка 3'
WHERE is_simple_recipe = true
  AND created_at::date = '2026-06-01'
  AND (ingredients_text_bg IS NULL OR ingredients_text_bg = '');
```

---

## Test after fix

1. Delete the 2 bad recipes from Supabase (or patch with SQL above)
2. Re-import PDF
3. Open simple recipe edit form → should show placeholder text in ingredients + instructions fields
4. User can then replace placeholders with real content

---

## Do NOT change
- Chunked upload logic
- PDF text extraction
- TOC name parsing regex
