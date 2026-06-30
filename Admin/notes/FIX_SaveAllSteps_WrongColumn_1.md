# Fix: saveAllSteps — Write to ingredients_used Not ingredient_ids

**File:** `admin/app/dashboard/simple-recipes/[id]/page.tsx`  
**Time:** 2 min — 1 line change

---

## Problem

`saveAllSteps()` writes to `ingredient_ids` (integer[] column, legacy).
Mobile reads from `ingredients_used` (text[] column).
Result: data saved but never read → always shows empty.

---

## Fix

Find `saveAllSteps` function. Find the update call:

```typescript
const { error } = await supabase
  .from('recipe_instruction_steps')
  .update({
    ingredient_ids: ingredientIds.length > 0 ? ingredientIds : null,
    equipment_needed: equipmentIds.length > 0 ? equipmentIds : null,
  })
  .eq('id', stepId);
```

Replace with (write to BOTH columns for compatibility):

```typescript
const ingredientsAsStrings = ingredientIds.map(id => String(id));

const { error } = await supabase
  .from('recipe_instruction_steps')
  .update({
    ingredient_ids: ingredientIds.length > 0 ? ingredientIds : null,
    ingredients_used: ingredientsAsStrings.length > 0 ? ingredientsAsStrings : [],
    equipment_needed: equipmentIds.length > 0 ? equipmentIds : null,
  })
  .eq('id', stepId);
```

Writing to both ensures backward compatibility with any other code reading `ingredient_ids`.

---

## Verification

1. Admin → simple recipe → Step 1 → select 2 ingredients → Запази Всички Стъпки
2. Check DB:
```sql
SELECT step_number, ingredient_ids, ingredients_used
FROM recipe_instruction_steps
WHERE recipe_id = '69533fef-9045-4337-83b7-f7b442fd0061'
ORDER BY step_number LIMIT 3;
```
3. Both columns populated
4. Mobile → same recipe → Готвя → Step 1 shows correct ingredients
