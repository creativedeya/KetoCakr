# KetoCakR Mobile — Add Equipment Field to Steps
**Task for Claude Code execution**

---

## Problem

**Equipment list is NOT showing in Cooking Mode (Готвя).**

Log shows:
```
LOG  [CookingMode] step 1: equipmentNeeded=undefined
```

Equipment data is loaded but NOT being passed to steps.

---

## Solution - Single Line Addition

**File:** `Mobile/app/recipe-detail/[id].tsx`

**Location:** Lines 236-247 (the stepsForRecipe.forEach block where we added ingredientsUsedIds)

**In the `allSteps.push()` object, ADD ONE LINE:**

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
    ingredientsUsedIds,
    equipmentNeeded: step.equipment_needed,  // ← ADD THIS ONE LINE!
  });
});
```

---

## That's it! 🎉

**One line is all that's needed.** The equipment rendering logic in `RecipeDetailView.tsx` already exists and works — it just needs the `equipmentNeeded` field from the step.

---

## Testing

**Setup:**
- Close and reopen Expo Go
- Navigate to: Recipe Detail → Barry Pana Cotta
- Go to Tab 3 (Steps/Готвя)
- Make sure TEXT VIEW mode

**Expected:**

**Step 1:**
- [ ] Shows ingredients: желатин + вода ✅
- [ ] Shows equipment: Glass cup (or relevant equipment) ✅

**Step 2:**
- [ ] Shows ingredients: кокосова сметана + еритритол ✅
- [ ] Shows equipment: Casserole ✅

**Step 3-6:**
- [ ] Shows appropriate equipment for each step ✅

---

## Files to Modify

| File | Changes |
|------|---------|
| `Mobile/app/recipe-detail/[id].tsx` | Add ONE line: `equipmentNeeded: step.equipment_needed,` |

---

## Success Criteria

✅ Equipment list appears in Cooking Mode
✅ Each step shows correct equipment
✅ Ingredients AND equipment both show correctly
✅ No console errors
✅ Works in TEXT view mode

---

## Time Estimate

2 minutes

---

## Why This Works

The `RecipeDetailView.tsx` already has rendering logic for equipment in Cooking mode. It just wasn't receiving the `equipmentNeeded` field from the steps because it wasn't being extracted from the DB.

By adding this one line, we pass the `step.equipment_needed` array (e.g., `[86, 85, 9, 87]`) to the UI, which can then filter and display the correct equipment for each step.