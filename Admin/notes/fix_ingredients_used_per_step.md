# Fix: steps/route.ts — ingredients_used per step, not all recipe ingredients

## File
`Admin/app/api/simple-recipes/[id]/steps/route.ts`

## Problem
Current code sets `ingredients_used = ingredientPks` (ALL recipe ingredients)
for every step. Should use only the ingredient PKs that correspond to
the step's own `ingredient_ids` (set via StepInfoSection checkboxes).

## str_replace

OLD:
```typescript
    // Fetch current ingredient PKs for ingredients_used
    const { data: recipeIngs } = await supabase
      .from('recipe_ingredients')
      .select('id')
      .eq('recipe_id', recipeId)
      .order('order_index');
    const ingredientPks = (recipeIngs || []).map((r: any) => r.id);

    // Upsert each step
    for (const [i, step] of steps.entries()) {
      const stepNumber = i + 1;
      const existing = existingMap.get(stepNumber);

      const stepData = {
        recipe_id: recipeId,
        step_number: stepNumber,
        step_description: step.step_description_bg || '',
        step_description_bg: step.step_description_bg || '',
        step_description_en: step.step_description_en || '',
        step_duration_minutes: step.step_duration_minutes ?? 0,
        // Preserve existing image/ingredients — don't overwrite
        step_image_url: existing?.step_image_url ?? step.step_image_url ?? null,
        ingredients_used: existing?.ingredients_used?.length > 0
          ? existing.ingredients_used
          : ingredientPks,
        ingredient_ids: existing?.ingredient_ids ?? null,
        equipment_needed: existing?.equipment_needed ?? null,
      };
```
NEW:
```typescript
    // Fetch recipe_ingredients to build a lookup: ingredient_database_id → recipe_ingredient.id
    const { data: recipeIngs } = await supabase
      .from('recipe_ingredients')
      .select('id, ingredient_database_id, order_index')
      .eq('recipe_id', recipeId)
      .order('order_index');

    // Map: recipe_ingredient.id (PK) → itself (for ingredients_used array)
    const allIngPks = (recipeIngs || []).map((r: any) => r.id);

    // Upsert each step
    for (const [i, step] of steps.entries()) {
      const stepNumber = i + 1;
      const existing = existingMap.get(stepNumber);

      // ingredients_used: use existing per-step selection if set,
      // otherwise keep existing from DB, otherwise use all (fallback)
      const existingIngredientsUsed = existing?.ingredients_used;
      const hasPerStepSelection = existingIngredientsUsed && existingIngredientsUsed.length > 0;

      const stepData = {
        recipe_id: recipeId,
        step_number: stepNumber,
        step_description: step.step_description_bg || '',
        step_description_bg: step.step_description_bg || '',
        step_description_en: step.step_description_en || '',
        step_duration_minutes: step.step_duration_minutes ?? 0,
        // Preserve existing image — never overwrite from text editor
        step_image_url: existing?.step_image_url ?? step.step_image_url ?? null,
        // Preserve per-step ingredient selection from StepInfoSection
        ingredients_used: hasPerStepSelection ? existingIngredientsUsed : [],
        ingredient_ids: existing?.ingredient_ids ?? null,
        equipment_needed: existing?.equipment_needed ?? null,
      };
```

---

## Also fix: saveAllSteps in page.tsx — populate ingredients_used from ingredient_ids

When user selects ingredients per step in StepInfoSection and clicks
"Запази Всички Стъпки", the `saveAllSteps` function saves `ingredient_ids`
but needs to also resolve them to `ingredients_used` (recipe_ingredient PKs).

In `Admin/app/dashboard/simple-recipes/[id]/page.tsx`:

OLD:
```typescript
      for (const stepId of changedStepIds) {
        const { ingredientIds, equipmentIds } = stepChanges[stepId];
        const ingredientsAsStrings = ingredientIds.map(id => String(id));

        const { error } = await supabase
          .from('recipe_instruction_steps')
          .update({
            ingredient_ids: ingredientIds.length > 0 ? ingredientIds : null,
            ingredients_used: ingredientsAsStrings.length > 0 ? ingredientsAsStrings : [],
            equipment_needed: equipmentIds.length > 0 ? equipmentIds : null,
          })
          .eq('id', stepId);

        if (error) throw error;
      }
```
NEW:
```typescript
      // Fetch recipe_ingredients PKs for this recipe (for ingredients_used array)
      const { data: recipeIngRows } = await supabase
        .from('recipe_ingredients')
        .select('id, ingredient_database_id')
        .eq('recipe_id', recipeId);

      // Build map: ingredient_database_id → recipe_ingredient.id
      const ingDbIdToPk = new Map(
        (recipeIngRows || []).map((r: any) => [String(r.ingredient_database_id), r.id])
      );

      for (const stepId of changedStepIds) {
        const { ingredientIds, equipmentIds } = stepChanges[stepId];

        // Resolve ingredient_database_ids to recipe_ingredient PKs
        const ingredientsUsed = ingredientIds
          .map(id => ingDbIdToPk.get(String(id)))
          .filter(Boolean);

        const { error } = await supabase
          .from('recipe_instruction_steps')
          .update({
            ingredient_ids: ingredientIds.length > 0 ? ingredientIds : null,
            ingredients_used: ingredientsUsed.length > 0 ? ingredientsUsed : [],
            equipment_needed: equipmentIds.length > 0 ? equipmentIds : null,
          })
          .eq('id', stepId);

        if (error) throw error;
      }
```

---

## How it works after fix

1. User edits text/timer in StepsEditor → clicks "Запази стъпките"
   → steps/route.ts preserves existing per-step ingredient selection
   
2. User selects ingredients per step in StepInfoSection → clicks "Запази Всички Стъпки"  
   → saveAllSteps resolves ingredient_database_ids to recipe_ingredient PKs
   → ingredients_used correctly populated per step
   
3. Mobile cooking mode reads ingredients_used → shows only relevant ingredients per step
