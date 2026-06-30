# Task: Fix Simple Recipe Display Bugs

## Files to edit
1. `Mobile/app/recipe-detail/[id].tsx`
2. `Mobile/components/RecipeDetailView.tsx`

---

## Bug 1: total_weight_grams shows wrong value (e.g. 10g instead of 575g)

### Root cause
In `RecipeDetailView.tsx`, `displayValues.totalWeight` is calculated as:
```typescript
const totalWeight = calculatedTotalWeight || Math.round(totalWeightGrams * scaleFactor);
```
`calculatedTotalWeight` is derived from summing ingredient weights via `convertToGrams()`.
When ingredients use units like `бр` without `unitWeightGrams`, the sum is near-zero (e.g. 10g),
which overrides the correct `totalWeightGrams` value from the DB (575g).

### Fix in `RecipeDetailView.tsx`

Find this block inside `displayValues` useMemo (around line where totalWeight is computed):
```typescript
const totalWeight = calculatedTotalWeight || Math.round(totalWeightGrams * scaleFactor);
```

Replace with:
```typescript
// Prefer DB value (totalWeightGrams) if it's non-zero; use calculated only as fallback
const dbWeight = Math.round(totalWeightGrams * scaleFactor);
const totalWeight = dbWeight > 0
  ? dbWeight
  : (calculatedTotalWeight ?? 0);
```

---

## Bug 2: Cooking Mode shows no ingredients for cookie/simple recipes

### Root cause
In `recipe-detail/[id].tsx`, simple recipe steps map `ingredient_ids` (INTEGER[]) to `ingredientsUsedIds`:
```typescript
const ingredientsUsedIds: string[] = Array.isArray(step.ingredient_ids)
  ? step.ingredient_ids.map(String)
  : [];
```

`ingredient_ids` stores integer ORDER INDEX values (0, 1, 2...) or integer PKs from `recipe_ingredients`.
But `cookingIngredients` in `RecipeDetailView` uses `ing.id` which is a UUID string from `recipe_ingredients.id`.
They never match → CookingMode shows no ingredients.

### Fix in `recipe-detail/[id].tsx`

In the `transformedData` useMemo, inside the simple recipe path, find where `simpleStepItems` is built.

Find:
```typescript
const simpleStepItems = (simpleSteps || []).map((step: any) => {
  // Admin saves to ingredient_ids (INTEGER[]) for simple recipes
  const ingredientsUsedIds: string[] = Array.isArray(step.ingredient_ids)
    ? step.ingredient_ids.map(String)
    : [];
  return {
    id: String(step.id),
    stepNumber: step.step_number,
    description: language === 'en'
      ? (step.step_description_en || step.step_description || step.step_description_bg || '')
      : (step.step_description_bg || step.step_description || step.step_description_en || ''),
    imageUrl: step.step_image_url,
    durationMinutes: step.step_duration_minutes,
    componentId: 'simple-main',
    equipmentNeeded: step.equipment_needed ?? [],
    ingredientsUsedIds,
  };
});
```

Replace with:
```typescript
// Build a lookup: ingredient_database_id (integer) → ingredient UUID (string)
// This bridges the gap between ingredient_ids (int[]) stored in steps
// and the UUID-based ing.id used by CookingMode
const dbIdToIngUuid = new Map<number, string>();
(simpleRecipe.recipe_ingredients || []).forEach((ing: any) => {
  if (ing.ingredient_database_id != null) {
    dbIdToIngUuid.set(Number(ing.ingredient_database_id), String(ing.id));
  }
});

// Also build index-based lookup (0, 1, 2...) as fallback
const indexToIngUuid = new Map<number, string>();
[...(simpleRecipe.recipe_ingredients || [])]
  .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
  .forEach((ing: any, idx: number) => {
    indexToIngUuid.set(idx, String(ing.id));
  });

const simpleStepItems = (simpleSteps || []).map((step: any) => {
  let ingredientsUsedIds: string[] = [];

  if (Array.isArray(step.ingredient_ids) && step.ingredient_ids.length > 0) {
    ingredientsUsedIds = step.ingredient_ids
      .map((rawId: any) => {
        const num = Number(rawId);
        // Try matching by ingredient_database_id first
        if (dbIdToIngUuid.has(num)) return dbIdToIngUuid.get(num)!;
        // Fallback: treat as order_index
        if (indexToIngUuid.has(num)) return indexToIngUuid.get(num)!;
        return null;
      })
      .filter(Boolean) as string[];
  }

  return {
    id: String(step.id),
    stepNumber: step.step_number,
    description: language === 'en'
      ? (step.step_description_en || step.step_description || step.step_description_bg || '')
      : (step.step_description_bg || step.step_description || step.step_description_en || ''),
    imageUrl: step.step_image_url,
    durationMinutes: step.step_duration_minutes,
    componentId: 'simple-main',
    equipmentNeeded: step.equipment_needed ?? [],
    ingredientsUsedIds,
  };
});
```

---

## Verification after fix

1. Open бисквитките рецепта in mobile
2. Check: total weight shows ~575g (not 10g)
3. Go to Steps tab → Cooking mode
4. Each step should show ingredient badges if ingredient_ids is populated in DB

### If ingredient badges still missing after fix:
Run this SQL in Supabase to check what's in ingredient_ids:
```sql
SELECT id, step_number, ingredient_ids, ingredients_used
FROM recipe_instruction_steps
WHERE recipe_id = '69533fef-9045-4337-83b7-f7b442fd0061'
ORDER BY step_number;
```
If ingredient_ids is NULL for all steps → admin needs to assign ingredients to steps first.
ingredient_ids is populated via the StepInfoSection in the admin panel.

---

## Notes
- Do NOT rewrite full files — surgical edits only
- Do NOT change ready recipe path logic
- Test only the simple recipe (бисквитки) after changes
