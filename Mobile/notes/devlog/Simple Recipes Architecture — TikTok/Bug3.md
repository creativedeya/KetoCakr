# KetoCakR Mobile — Fix Step Ingredients for Ready Recipes (Simply Recipes)
**Task for Claude Code execution**

---

## Problem

**Ready recipes (simply recipes) show NO step ingredients in Cooking mode.**

Example: Barry Pana Cotta
- `ingredients_used` = `["4695","4696","4697","4698","4699"]` ✅ (in DB)
- But `ingredientsUsedIds=[]` ❌ (in app)
- Result: No ingredients shown in Cooking mode steps

**Regular base recipes work fine** — their step ingredients show correctly.

### Root Cause

For **ready recipes**, the transform logic is different:
- Regular recipes: `recipe_ingredients` loaded via baseRecipes query
- Ready recipes: `recipe_ingredients` must be loaded separately (they're for the ready recipe itself, not components)

Current code doesn't load `recipe_ingredients` for ready recipes → can't match `ingredients_used` IDs.

---

## Solution

### Step 1: Load recipe_ingredients for ready recipes
**File:** `Mobile/app/recipe-detail/[id].tsx`

**Location:** After the ready recipe query (around line 95-110)

Add NEW query for ready recipe ingredients:

```typescript
// Query 4c: recipe_ingredients for READY recipes
const { data: readyRecipeIngredientsData } = useQuery({
  queryKey: ['readyRecipeIngredients', id],
  queryFn: async () => {
    if (recipeType !== 'ready') return null;
    
    const { data, error } = await supabase
      .from('recipe_ingredients')
      .select('id, ingredient_database_id, ingredient_name, quantity, unit, order_index')
      .eq('recipe_id', id);
    
    if (error) throw error;
    return data || [];
  },
  enabled: !!id && recipeType === 'ready',  // Only for ready recipes!
});
```

### Step 2: Create mapping of recipe_ingredients IDs
**File:** `Mobile/app/recipe-detail/[id].tsx`

**Location:** In the useMemo where you build allSteps (around line 170)

Add THIS HELPER FUNCTION before the loop:

```typescript
// Helper: Build a map of recipe_ingredients.id → id_0 format
const buildRecipeIngredientsMap = () => {
  if (!readyRecipeIngredientsData) return new Map();
  const map = new Map<string, string>();
  readyRecipeIngredientsData.forEach((ing: any) => {
    // For ready recipes, order_index is always 0 (single component)
    map.set(String(ing.id), `${ing.id}_0`);
  });
  return map;
};

const recipeIngredientsIdMap = buildRecipeIngredientsMap();
```

### Step 3: Transform ingredients_used with correct ID format
**File:** `Mobile/app/recipe-detail/[id].tsx`

**Location:** In the stepsForRecipe.forEach loop (around line 236-247)

REPLACE the entire block with:

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
    
    // Convert to correct ID format based on recipe type
    if (recipeType === 'ready') {
      // For ready recipes: use recipe_ingredients ID mapping
      ingredientsUsedIds = idsArray
        .map(id => recipeIngredientsIdMap.get(id) || `${id}_0`)
        .filter(Boolean);
    } else {
      // For base recipes: add comp.order_index
      ingredientsUsedIds = idsArray.map(id => `${id}_${comp.order_index}`);
    }
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
    ingredientsUsedIds,  // ← With correct format now!
  });
});
```

---

## Testing

### Test Cooking Mode - Ready Recipe

**Setup:**
- Open Expo Go on Android
- Navigate to: Recipe Detail → Barry Pana Cotta (ready/simply recipe)
- Go to Tab 3 (Steps/Готвя)
- Make sure you're in **TEXT VIEW** mode

**Expected Result:**

**Step 1 (Накиснете желатин...):**
- [ ] Shows header: "📋 Съставки за този стъп:"
- [ ] Shows ingredients with images, quantities, units
- [ ] Should show: желатин, вода (only these 2 for step 1)

**Step 2 (Затоплете кокосов крем...):**
- [ ] Shows DIFFERENT ingredients from step 1
- [ ] Shows: Кокосова сметана, Еритритол (or whatever is for this step)

**Step 3-6:**
- [ ] Each step shows its SPECIFIC ingredients
- [ ] NOT all ingredients for every step

**Verify:**
- [ ] Works in TEXT view
- [ ] Gallery mode unchanged
- [ ] No console errors
- [ ] Matches behavior of regular base recipes

---

## Files to Modify

| File | Changes |
|------|---------|
| `Mobile/app/recipe-detail/[id].tsx` | Add query for ready recipe ingredients + helper function + transform logic |

---

## Code Navigation

| Section | Lines | Purpose |
|---------|-------|---------|
| Ready recipe query | ~95-110 | Where to add new ingredients query |
| useMemo building allSteps | ~170+ | Where to add helper function |
| stepsForRecipe.forEach | ~236-247 | Where to update transform logic |

---

## Log Verification

**Before (broken):**
```
LOG  [Ready Steps] step 1: ingredients_used=["4695","4696","4697","4698","4699"], 
                          ingredientsUsedIds=[],  ← EMPTY
```

**After (fixed):**
```
LOG  [Ready Steps] step 1: ingredients_used=["4695","4696","4697","4698","4699"], 
                          ingredientsUsedIds=["4695_0","4696_0","4697_0","4698_0","4699_0"]  ← POPULATED
```

---

## Important Notes

1. **Ready recipes format:** `recipe_ingredients.id` (e.g., 4695) → convert to `"4695_0"` (with order_index 0)

2. **Regular recipes format:** Stay as is — `recipe_ingredients.id` + `comp.order_index`

3. **Type detection:** Use existing `recipeType` variable to determine logic

4. **No UI changes needed:** Just fix the ID matching. RecipeDetailView rendering code stays the same.

---

## Success Criteria

✅ Barry Pana Cotta Cooking mode shows step-specific ingredients
✅ Each step shows only ITS ingredients
✅ Images, quantities, units display correctly
✅ Works in TEXT view mode
✅ Gallery mode unchanged
✅ `ingredientsUsedIds` is populated (not empty)
✅ No console errors
✅ Regular base recipes still work fine

---

## Time Estimate

15-20 minutes

---

## If Something Goes Wrong

1. **ingredientsUsedIds still empty:**
   - Check if `readyRecipeIngredientsData` is loaded
   - Verify `recipeIngredientsIdMap` is built correctly
   - Log the map to see if IDs are in it

2. **Wrong ingredients showing:**
   - Verify mapping format: should be `"4695_0"`, not `4695_0` (string!)
   - Check that filter uses exact string comparison

3. **Base recipes broken:**
   - Ensure the condition `if (recipeType === 'ready')` is correct
   - Verify regular recipes still get `${id}_${comp.order_index}` format

---

## Reference: How Regular Recipes Work

For comparison, here's how **base recipes** currently work correctly:

```
ingredients_used = ["4695","4696"]
+ comp.order_index = 0
= ingredientsUsedIds = ["4695_0","4696_0"]  ✅ Works!

Then in RecipeDetailView:
scaledIngredients.find(i => i.id === "4695_0")  ✅ Match found!
```

**For ready recipes, do the same but use readyRecipeIngredientsData directly.**