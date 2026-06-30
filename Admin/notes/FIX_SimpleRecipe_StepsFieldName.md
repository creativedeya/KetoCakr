# Fix: [id].tsx — Simple Recipe Steps Read Wrong Field

**File:** `Mobile/app/recipe-detail/[id].tsx`  
**Time:** 5 min — 1 line change

---

## Root Cause

Simple recipe path reads `step.ingredient_ids` (non-existent field).
Ready recipe path correctly reads `step.ingredients_used`.
Result: cooking mode never shows ingredients for simple recipes.

---

## Fix

Find (~line 285 in simpleStepItems map):

```typescript
if (Array.isArray(step.ingredient_ids) && step.ingredient_ids.length > 0) {
  ingredientsUsedIds = step.ingredient_ids
    .map((rawId: any) => {
      const pk = Number(rawId);
      return ingPkToStringId.get(pk) ?? null;
    })
    .filter(Boolean) as string[];
}
```

Replace `step.ingredient_ids` with `step.ingredients_used` in BOTH places:

```typescript
if (Array.isArray(step.ingredients_used) && step.ingredients_used.length > 0) {
  ingredientsUsedIds = step.ingredients_used
    .map((rawId: any) => {
      const pk = Number(rawId);
      return ingPkToStringId.get(pk) ?? null;
    })
    .filter(Boolean) as string[];
}
```

---

## Verification
1. Admin → simple recipe → assign ingredients to steps → Save All Steps
2. Check DB: `ingredients_used` populated
3. Mobile → same recipe → СТЪПКИ → Готвя
4. Each step shows only its assigned ingredients
