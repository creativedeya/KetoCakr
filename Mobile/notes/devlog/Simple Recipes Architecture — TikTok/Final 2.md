# KetoCakR Mobile — Fix Ingredients for Complex Recipes
**Task for Claude Code execution**

---

## Problem

**Complex recipes (2+ components) show NO ingredients** after we fixed simply recipes.

Currently:
- ✅ Simply recipes (1 component): ingredients ✅
- ❌ Complex recipes (2+ components): ingredients ❌

### Root Cause

- Simple recipes: `ingredients_used` contains recipe_ingredients.id numbers (4695, 4696)
- Complex recipes: `ingredients_used` contains ingredient_database UUIDs (d954f1e2-..., aec11c73-...)

But each base_recipe component has its OWN recipe_ingredients records with DIFFERENT IDs for the same ingredient:
```
Erythritol Powder (UUID: f342dd41-...):
  - Component 1 (Chocolate layer): recipe_ingredients.id = 4184
  - Component 2 (Hazelnut layer): recipe_ingredients.id = 4187
  - Component 3 (Coffee layer): recipe_ingredients.id = 4344
  - Component 4 (Orange jelly): recipe_ingredients.id = 4480
```

Need to link each UUID to the CORRECT recipe_ingredients.id for THAT component.

---

## Solution

**File:** `Mobile/app/recipe-detail/[id].tsx`

**Location:** Lines 232-247 (stepsForRecipe.forEach block)

**Add helper function BEFORE the loop (around line 232):**

```typescript
// Helper: Map ingredient_database UUID to recipe_ingredients.id for current base_recipe
const buildIngredientUuidMap = (baseRecipe: any): Map<string, string> => {
  const map = new Map<string, string>();
  
  if (baseRecipe?.recipe_ingredients) {
    baseRecipe.recipe_ingredients.forEach((ing: any) => {
      // Key: ingredient_database_id (UUID)
      // Value: recipe_ingredients.id (number) formatted with order_index
      const key = String(ing.ingredient_database_id);
      const value = `${ing.id}_${comp.order_index}`;
      map.set(key, value);
    });
  }
  
  return map;
};

const ingredientUuidMap = buildIngredientUuidMap(br);
```

**REPLACE the entire stepsForRecipe.forEach with:**

```typescript
stepsForRecipe.forEach((step: any) => {
  // Parse ingredients_used
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
    
    // Check if ingredients_used contains UUIDs (complex recipes) or numbers (simple recipes)
    const isUuidFormat = idsArray.some(id => id.includes('-')); // UUID has dashes
    
    if (isUuidFormat) {
      // Complex recipes: ingredients_used contains ingredient_database UUIDs
      // Map UUIDs to recipe_ingredients.id using the current base_recipe's ingredients
      ingredientsUsedIds = idsArray
        .map(uuid => ingredientUuidMap.get(uuid))
        .filter(Boolean) as string[];
    } else {
      // Simple recipes: ingredients_used contains recipe_ingredients.id numbers
      // Just add comp.order_index
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
    ingredientsUsedIds,
    equipmentNeeded: step.equipment_needed,
  });
});
```

---

## How It Works

1. **buildIngredientUuidMap()** creates a map:
   ```
   "d954f1e2-f17c-4645-9173-46910e00300e" → "4482_0"
   "aec11c73-f0c8-4aea-b872-ce324b76de98" → "4481_0"
   "f342dd41-ab2c-4a54-a767-601a8362429f" → "4184_0"
   ```

2. **UUID detection** checks if ingredients_used contains dashes (UUID format)

3. **For complex recipes** (UUIDs):
   - Parse UUID from ingredients_used
   - Map UUID → recipe_ingredients.id using ingredientUuidMap
   - Result: ["4482_0", "4481_0"] ✅

4. **For simple recipes** (numbers):
   - Parse number from ingredients_used
   - Add order_index
   - Result: ["4695_0", "4696_0"] ✅

---

## Testing

**Setup:**
- Close and reopen Expo Go
- Navigate to: Recipe Detail → Tropical with chocolate–orange (complex recipe)
- Go to Tab 3 (Steps/Готвя)
- TEXT VIEW mode

**Expected:**
- [ ] Step 1: Shows correct ingredients ✅
- [ ] Step 2: Shows correct ingredients ✅
- [ ] Step 3-5: Show correct ingredients ✅
- [ ] Step 6-7: No ingredients (empty) ✅
- [ ] Equipment shows for all steps ✅

**Also test:**
- [ ] Barry Pana Cotta (simple): Still works ✅
- [ ] Any other recipe: Works correctly ✅

---

## Files to Modify

| File | Changes |
|------|---------|
| `Mobile/app/recipe-detail/[id].tsx` | Add helper function + conditional logic in stepsForRecipe.forEach |

---

## Code Location Details

### Helper function location (around line 232):
Should be BEFORE the `for (const comp of sortedComponents)` loop starts iterating.

Actually, the helper needs to be INSIDE the loop, per-component. Here's the exact placement:

```typescript
for (const comp of sortedComponents) {
  const br = baseRecipesArray.find((b: any) => b.id === comp.base_recipe_id);
  if (!br) continue;

  // ← ADD HELPER FUNCTION HERE
  const buildIngredientUuidMap = (baseRecipe: any): Map<string, string> => {
    const map = new Map<string, string>();
    if (baseRecipe?.recipe_ingredients) {
      baseRecipe.recipe_ingredients.forEach((ing: any) => {
        const key = String(ing.ingredient_database_id);
        const value = `${ing.id}_${comp.order_index}`;
        map.set(key, value);
      });
    }
    return map;
  };
  
  const ingredientUuidMap = buildIngredientUuidMap(br);
  
  // ... existing code ...
  
  stepsForRecipe.forEach((step: any) => {
    // ← ADD CONDITIONAL LOGIC HERE
  });
}
```

---

## Success Criteria

✅ Simple recipes (Barry Pana Cotta): ingredients still show ✅
✅ Complex recipes (Tropical): ingredients now show ✅
✅ Each step shows correct step-specific ingredients ✅
✅ Equipment shows for all steps ✅
✅ No console errors ✅
✅ Works in TEXT view mode ✅

---

## Time Estimate

15-20 minutes

---

## Debug Tips

If ingredients still don't show for complex recipes:

1. Add LOG before the loop:
```typescript
console.log('🔍 Component:', br.id, 'Recipe ingredients:', br.recipe_ingredients);
```

2. Add LOG in buildIngredientUuidMap:
```typescript
console.log('📍 UUID Map:', ingredientUuidMap);
```

3. Add LOG in forEach:
```typescript
console.log('🔎 Step ingredients_used:', step.ingredients_used);
console.log('✅ Mapped ingredientsUsedIds:', ingredientsUsedIds);
```

This will show exactly what's being mapped and why ingredients may not be matching.