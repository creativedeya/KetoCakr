# KetoCakR Mobile — Fix Step Ingredients for Simply Recipes (FINAL)
**Task for Claude Code execution - WITH EXACT CODE**

---

## Problem

**Simply recipes show NO step-specific ingredients in Cooking mode.**

Example: Barry Pana Cotta shows ALL 5 ingredients for EVERY step, instead of:
- Step 1: только желатин + вода
- Step 2: only other ingredients
- etc.

**Why:** The `ingredients_used` field from DB is NOT being extracted in the step transform logic.

---

## Solution - SINGLE FIX

### Only ONE change needed!

**File:** `Mobile/app/recipe-detail/[id].tsx`

**Location:** Lines 236-247 (the stepsForRecipe.forEach block)

**REPLACE THIS:**
```typescript
stepsForRecipe.forEach((step: any) => {
  allSteps.push({
    id: `${step.id}_${comp.order_index}`,
    stepNumber: step.step_number,
    description: language === 'en'
      ? (step.step_description_en || step.step_description || step.step_description_bg || '')
      : (step.step_description_bg || step.step_description || step.step_description_en || ''),
    imageUrl: step.step_image_url,
    durationMinutes: step.step_duration_minutes,
    componentId,
  });
});
```

**WITH THIS:**
```typescript
stepsForRecipe.forEach((step: any) => {
  // Parse ingredients_used and convert to correct ID format
  let ingredientsUsedIds: string[] = [];
  
  if (step.ingredients_used) {
    let idsArray: string[] = [];
    
    if (typeof step.ingredients_used === 'string') {
      try {
        const parsed = JSON.parse(step.ingredients_used);
        idsArray = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        idsArray = [step.ingredients_used];
      }
    } else if (Array.isArray(step.ingredients_used)) {
      idsArray = step.ingredients_used.map(id => String(id));
    }
    
    // Convert IDs to correct format: ingredient_id_order_index
    ingredientsUsedIds = idsArray.map(id => `${id}_${comp.order_index}`);
  }

  allSteps.push({
    id: `${step.id}_${comp.order_index}`,
    stepNumber: step.step_number,
    description: language === 'en'
      ? (step.step_description_en || step.step_description || step.step_description_bg || '')
      : (step.step_description_bg || step.step_description || step.step_description_en || ''),
    imageUrl: step.step_image_url,
    durationMinutes: step.step_duration_minutes,
    componentId,
    ingredientsUsedIds,  // ← ADD THIS FIELD!
  });
});
```

---

## That's it! 🎉

No new queries needed. No helper functions needed. Just add the parsing + field to existing code.

### How it works:

1. **Extract `ingredients_used`** from each step (format: `["4695","4696","4697","4698","4699"]`)
2. **Convert format** → `["4695_0","4696_0","4697_0","4698_0","4699_0"]` (add comp.order_index)
3. **Pass to `allSteps`** → RecipeDetailView now has step-specific ingredients
4. **RecipeDetailView filtering** (already working) → filters scaledIngredients by ingredientsUsedIds

---

## Testing

**Setup:**
- Open Expo Go on Android
- Navigate to: Recipe Detail → Barry Pana Cotta
- Go to Tab 3 (Steps/Готвя)
- Ensure TEXT VIEW mode

**Expected:**
- Step 1: Shows ONLY желатин + вода ✅
- Step 2: Shows DIFFERENT ingredients (not all 5) ✅
- Each step: Only ITS specific ingredients ✅

---

## Files to Modify

| File | Changes |
|------|---------|
| `Mobile/app/recipe-detail/[id].tsx` | Replace lines 236-247 with new code |

---

## Success Criteria

✅ Barry Pana Cotta Step 1 shows only желатин + вода
✅ Step 2 shows only different ingredients
✅ Each step shows ONLY its specific ingredients
✅ No console errors
✅ Works in TEXT view mode
✅ Base recipes still work fine

---

## Time Estimate

5 minutes

---

## Why This Works

The fix leverages EXISTING functionality in RecipeDetailView:

1. **Cooking mode rendering** (RecipeDetailView.tsx) already filters by `ingredientsUsedIds`:
```typescript
const stepIngredientsForCooking = step.ingredientsUsedIds 
  ? scaledIngredients.filter(ing => step.ingredientsUsedIds.includes(ing.id))
  : [];
```

2. **scaledIngredients** (already loaded) has ALL ingredients with IDs in format: `"4695_0"`, `"4696_0"`, etc.

3. **This fix just provides the mapping** so RecipeDetailView can filter correctly.

That's all! ✨