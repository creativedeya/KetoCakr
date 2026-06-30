# Bug Report + Fix: Mobile — RecipeDetailView breaks for non-cake dessert types

## Root Cause Summary
Three bugs in the mobile app, all caused by the same underlying issue:
RecipeDetailView was built and tested primarily with dessert types 1 (cake), 2 (cheesecake),
5 (tart) — which always have pan info, ≥6 servings, and full ready_recipes records.

Simple recipes (cookies, portion desserts, etc.) have:
- No pan/form data
- Variable servings (1–24, not locked to 8)
- total_weight_grams often NULL or 0 in ready_recipes (sync was missing — see fix_simple_recipes_dual_sync.md)
- No dessert_type_id set on the ready_recipe row

---

## Bug 1: Total weight display breaks when switching dessert types

### Symptom
In RecipeDetailView, the "total weight" field shown next to the servings +/- control
displays wrong/missing value when the recipe is not a cake/cheesecake/tart.

### Root Cause
`total_weight_grams` is NULL in `ready_recipes` for simple recipes (never synced from base_recipes).
The component likely reads `recipe.total_weight_grams` and falls back to pan-based calculation
which only works for cake types.

### Fix — RecipeDetailView (Mobile/app/recipe-detail/[id].tsx or RecipeDetailView component)

Find the total weight display logic. It probably looks like:
```typescript
const totalWeight = recipe.total_weight_grams || panWeight || 0;
```

Replace with a safe fallback chain:
```typescript
const totalWeightGrams: number = (() => {
  // 1. Use explicit total_weight_grams if set and > 0
  if (recipe.total_weight_grams && recipe.total_weight_grams > 0) {
    return recipe.total_weight_grams;
  }
  // 2. For cake/cheesecake/tart — calculate from pan volume (existing logic)
  if ([1, 2, 5].includes(recipe.dessert_type_id)) {
    return panBasedWeight ?? 0;
  }
  // 3. For all other types — show nothing (no pan info available)
  return 0;
})();

// In JSX: only render weight section if > 0
{totalWeightGrams > 0 && (
  <Text>{totalWeightGrams}g total</Text>
)}
```

---

## Bug 2: Tab 3 (Cooking mode) — ingredient list disappears

### Symptom
When viewing a newly added simple recipe in cooking/steps mode (Tab 3 of RecipeDetailView),
the ingredient list is empty. Happens every time a new recipe is added, then recurs.

### Root Cause — TWO possible causes, check both:

**Cause A: ingredients_used not populated in recipe_instruction_steps**
The `recipe_instruction_steps` table has an `ingredients_used` array field.
When steps are created via SimpleRecipeForm's API route, this array is likely empty [].
The cooking mode Tab 3 reads `ingredients_used` per step — finds nothing.

**Cause B: recipe_ingredients not linked**
The cooking mode may read from `recipe_ingredients` joined to the recipe.
If the recipe was created via simple-recipes API and ingredients were only saved
to `base_recipes`-level fields (ingredients_text_bg/en) but NOT to `recipe_ingredients` table,
the join returns empty.

### Investigation — check in Supabase SQL Editor:
```sql
-- Check if recipe_ingredients exist for a simple recipe
SELECT ri.* 
FROM recipe_ingredients ri
JOIN base_recipes br ON ri.recipe_id = br.id
WHERE br.is_simple_recipe = true
LIMIT 10;

-- Check ingredients_used in steps for a simple recipe
SELECT ris.step_number, ris.ingredients_used, ris.step_description_bg
FROM recipe_instruction_steps ris
WHERE ris.recipe_id IN (
  SELECT id FROM base_recipes WHERE is_simple_recipe = true LIMIT 5
);
```

### Fix A — If ingredients_used is the problem:
In `/api/simple-recipes/route.ts` POST handler, when inserting steps,
populate `ingredients_used` with the ingredient names from the recipe:

```typescript
// When inserting steps, include ingredient names
const ingredientNames = payload.ingredients.map((i: any) => i.ingredient_name);

const stepsToInsert = payload.steps.map((s: any) => ({
  recipe_id: baseRecipeId,
  step_number: s.step_number,
  step_description_bg: s.step_description_bg,
  step_description_en: s.step_description_en,
  step_duration_minutes: s.step_duration_minutes,
  step_image_url: s.step_image_url || null,
  ingredients_used: ingredientNames, // populate all ingredients on every step
  // OR: only on step 1, or leave smart parsing for later
}));
```

### Fix B — If recipe_ingredients table is empty:
In `/api/simple-recipes/route.ts` POST handler, after inserting base_recipe,
also insert into `recipe_ingredients`:

```typescript
if (payload.ingredients?.length > 0) {
  const ingredientsToInsert = payload.ingredients.map((ing: any) => ({
    recipe_id: baseRecipeId,
    ingredient_database_id: ing.ingredient_database_id || null,
    ingredient_name: ing.ingredient_name,
    quantity: ing.quantity,
    unit: ing.unit,
    order_index: ing.order_index ?? 0,
  }));

  const { error: ingError } = await supabaseAdmin
    .from('recipe_ingredients')
    .insert(ingredientsToInsert);

  if (ingError) console.error('recipe_ingredients insert failed:', ingError);
}
```

Same fix needed in PATCH handler — delete existing + reinsert:
```typescript
// In PATCH handler, if ingredients are included in payload:
await supabaseAdmin
  .from('recipe_ingredients')
  .delete()
  .eq('recipe_id', id);

// Then reinsert updated list
```

---

## Bug 3: Dessert type label missing in Tab 1 for non-cake types

### Symptom
In the recipe detail view (Tab 1 — info/overview), the dessert type label
shows for cakes but disappears for cookies, mug cakes, portion desserts, etc.

### Root Cause
Two possible causes:
1. `ready_recipes.dessert_type_id` is NULL for simple recipes (never set during creation)
2. The component hardcodes or assumes dessert_type_id is always a single integer FK,
   but `base_recipes` uses `compatible_dessert_types integer[]` (array), not a single FK.

### Investigation — check schema of ready_recipes:
```sql
-- Does ready_recipes have dessert_type_id?
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ready_recipes' 
AND column_name LIKE '%dessert%';

-- Check what dessert_type_id values are set
SELECT id, name, dessert_type_id, is_simple_recipe 
FROM ready_recipes 
ORDER BY created_at DESC 
LIMIT 20;
```

### Fix in mobile component — make dessert type display universal:

Find the dessert type label in RecipeDetailView. It likely does:
```typescript
// Probably something like:
const dessertType = dessertTypes.find(t => t.id === recipe.dessert_type_id);
```

The fix depends on what columns ready_recipes actually has.

**If ready_recipes has dessert_type_id (single int):**
```typescript
// Ensure it's set during simple recipe creation in API
// Add to readyPayload in POST handler:
dessert_type_id: payload.dessert_type_id || null,
```

**If ready_recipes has no dessert type column at all:**
```typescript
// In the mobile component, look up via base_recipe if possible
// OR: store dessert_type_id on base_recipes for simple recipes during import
```

**In the JSX — make the label render safely:**
```typescript
// Instead of:
{recipe.dessert_type?.name && <Text>{recipe.dessert_type.name}</Text>}

// Use with proper null check and universal fallback:
const dessertTypeName = recipe.dessert_type?.name 
  ?? recipe.dessert_type?.name_bg 
  ?? null;

{dessertTypeName ? (
  <Text style={styles.dessertTypeLabel}>{dessertTypeName}</Text>
) : null}
```

---

## Admin Panel fix needed FIRST (prerequisite)

Before fixing mobile bugs 1 and 3, run this in Supabase SQL Editor
to check and potentially backfill `dessert_type_id` on simple recipes:

```sql
-- See current state of simple recipes in ready_recipes
SELECT 
  rr.id,
  rr.name,
  rr.dessert_type_id,
  rr.total_weight_grams,
  br.is_simple_recipe,
  br.total_weight_grams as br_weight
FROM ready_recipes rr
LEFT JOIN base_recipes br ON br.name = rr.name AND br.is_simple_recipe = true
WHERE rr.is_simple_recipe = true OR br.is_simple_recipe = true
ORDER BY rr.created_at DESC;
```

---

## Update PROJECT_STATUS.md

Move from To-Do to Completed when fixed:
```
- [x] Bug fix: RecipeDetailView — total_weight_grams fallback for non-cake dessert types
- [x] Bug fix: Cooking mode (Tab 3) — ingredient list populated via recipe_ingredients table
- [x] Bug fix: Dessert type label renders universally for all dessert_type_ids
```

Add to Known DB Issues:
```
8. ready_recipes.dessert_type_id is NULL for most simple recipes — needs backfill after admin fix
9. recipe_ingredients table may be empty for simple recipes created before dual-sync fix
10. ingredients_used in recipe_instruction_steps is [] for simple recipes — cooking mode shows empty list
```

---

## Fix priority order
1. Run SQL investigation queries above — understand actual data state
2. Apply fix_simple_recipes_dual_sync.md (admin API routes) — prevents new issues
3. Fix recipe_ingredients insert in simple-recipes POST/PATCH API
4. Fix ingredients_used population in steps insert
5. Fix mobile RecipeDetailView — total weight fallback (Bug 1)
6. Fix mobile RecipeDetailView — dessert type label (Bug 3)
7. Backfill existing simple recipes with SQL
