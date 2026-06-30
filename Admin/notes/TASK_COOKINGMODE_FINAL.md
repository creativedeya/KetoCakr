# Task: Final Fix — CookingMode Ingredient Matching

## Root cause (confirmed)
`recipe_instruction_steps.ingredient_ids` stores INTEGER[] of `recipe_ingredients.id` PKs directly.
Example: [5028, 5029] — but current recipe_ingredients.id values are 5050, 5051...
These are STALE references from before ingredients were re-saved.

The code fix below makes the mapping correct FOR FUTURE recipes where ingredient_ids match current PKs.
The DB fix (SQL) is needed for existing stale data.

## Fix in `Mobile/app/recipe-detail/[id].tsx`

Find this entire block (starts with `// Build a lookup: ingredient_database_id`):

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

Replace with:

```typescript
      // Build lookup: recipe_ingredients integer PK → string id used by CookingMode
      // ingredient_ids in steps stores integer PKs of recipe_ingredients rows directly
      const ingPkToStringId = new Map<number, string>();
      (simpleRecipe.recipe_ingredients || []).forEach((ing: any) => {
        const pk = Number(ing.id);
        if (!isNaN(pk)) {
          ingPkToStringId.set(pk, String(ing.id));
        }
      });

      const simpleStepItems = (simpleSteps || []).map((step: any) => {
        let ingredientsUsedIds: string[] = [];

        if (Array.isArray(step.ingredient_ids) && step.ingredient_ids.length > 0) {
          ingredientsUsedIds = step.ingredient_ids
            .map((rawId: any) => {
              const pk = Number(rawId);
              return ingPkToStringId.get(pk) ?? null;
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

## After code fix — run this SQL in Supabase to fix stale ingredient_ids

The steps for бисквитки (recipe_id = '69533fef-9045-4337-83b7-f7b442fd0061') have stale PKs.
Current recipe_ingredients PKs are 5050-5058. Update steps to use correct current PKs:

IMPORTANT: Before running, verify which ingredients belong to which steps by checking the recipe.
Run this first to see current data:

```sql
SELECT s.id as step_id, s.step_number, s.ingredient_ids,
       array_agg(ri.id || ': ' || ri.ingredient_name ORDER BY ri.order_index) as available_ingredients
FROM recipe_instruction_steps s
CROSS JOIN recipe_ingredients ri
WHERE s.recipe_id = '69533fef-9045-4337-83b7-f7b442fd0061'
  AND ri.recipe_id = '69533fef-9045-4337-83b7-f7b442fd0061'
GROUP BY s.id, s.step_number, s.ingredient_ids
ORDER BY s.step_number;
```

Then update each step with correct PKs. Example (adjust based on actual recipe logic):
```sql
-- Clear all stale ingredient_ids first
UPDATE recipe_instruction_steps 
SET ingredient_ids = NULL 
WHERE recipe_id = '69533fef-9045-4337-83b7-f7b442fd0061';
```

Then re-assign via admin panel StepInfoSection — this guarantees correct PKs going forward.

## Why the code fix alone is not enough
ingredient_ids = [5028, 5029] but recipe_ingredients PKs are now [5050..5058]
ingPkToStringId.get(5028) = undefined → no match → no ingredients shown

The code fix is CORRECT for all future recipes where ingredient_ids are set AFTER ingredients are saved.
The SQL fix (clear + reassign via admin) is needed for this specific recipe's stale data.

## Rules
- Surgical edit only
- Do NOT touch ready recipe path
- Do NOT change CookingMode.tsx
