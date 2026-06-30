# KetoCakR Mobile — Fix Step Ingredients Display (Simply Recipes)
**Task for Claude Code execution**

---

## Problem Overview

In **Cooking Mode (Готвя)**, when viewing **simply recipes** (e.g., Barry Pana Cotta), step ingredients are NOT displayed.

**Simply recipes** = рецепти с един компонент, записани във `base_recipes` и `ready_recipes`.

### Root Cause

ID matching is broken between `ingredients_used` and displayed ingredients:

- **In recipe-detail/[id].tsx:** Ingredients are built with ID format: `"4695_0"` (recipe_ingredients.id + order_index)
- **In steps:** `ingredients_used` = `["4695","4696","4697","4698","4699"]` (plain IDs without order_index)
- **Result:** No match → no ingredients shown in Cooking mode

### Solution

1. **Add `ingredientsUsedIds` to step transform** (with correct ID format)
2. **Add `ingredientsUsedIds` to `StepItem` interface**
3. **Filter and display step ingredients in Cooking mode**

---

## Implementation

### 1.1: Update StepItem interface
**File:** `Mobile/components/RecipeDetailView.tsx` (lines 57-64)

Replace the `StepItem` interface:

```typescript
export interface StepItem {
  id: string;
  stepNumber: number;
  description: string;
  imageUrl?: string | null;
  durationMinutes?: number | null;
  componentId?: string;
  ingredientsUsedIds?: string[];  // ← NEW: ingredient IDs for this step (format: "4695_0", "4696_0", etc.)
}
```

---

### 1.2: Transform steps with ingredientsUsedIds
**File:** `Mobile/app/recipe-detail/[id].tsx` (lines 236-247)

**REPLACE** the entire `stepsForRecipe.forEach()` block with:

```typescript
stepsForRecipe.forEach((step: any) => {
  // Parse ingredients_used and add comp.order_index to match ingredient IDs
  const ingredientsUsedIds: string[] = [];
  if (step.ingredients_used) {
    if (typeof step.ingredients_used === 'string') {
      try {
        const parsed = JSON.parse(step.ingredients_used);
        const idsArray = Array.isArray(parsed) ? parsed : [parsed];
        // Add comp.order_index to each ID (format: "4695_0")
        ingredientsUsedIds.push(...idsArray.map((id: any) => `${id}_${comp.order_index}`));
      } catch (e) {
        ingredientsUsedIds.push(`${step.ingredients_used}_${comp.order_index}`);
      }
    } else if (Array.isArray(step.ingredients_used)) {
      ingredientsUsedIds.push(...step.ingredients_used.map((id: any) => `${id}_${comp.order_index}`));
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
    ingredientsUsedIds,  // ← NEW: IDs with order_index
  });
});
```

---

### 1.3: Render step ingredients in Cooking mode
**File:** `Mobile/components/RecipeDetailView.tsx`

**Location:** Inside the steps rendering section (around line 1023)

Find the part where it says `{activeTab === 'steps' && (` and locate the cooking mode rendering.

Inside `compSteps.map()`, after the gallery section and BEFORE `{/* Steps */}` comment, add:

```typescript
{/* Step-specific ingredients (Cooking mode only) */}
{viewMode === 'text' && step.ingredientsUsedIds && step.ingredientsUsedIds.length > 0 && (
  <View style={styles.stepIngredientsBox}>
    <Text style={styles.stepIngredientsTitle}>
      {language === 'bg' ? '📋 Съставки за този стъп:' : '📋 Step ingredients:'}
    </Text>
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.stepIngredientsScroll}
      contentContainerStyle={styles.stepIngredientsContent}
    >
      {step.ingredientsUsedIds.map((ingredientId: string) => {
        const ing = scaledIngredients.find(i => i.id === ingredientId);
        if (!ing) return null;
        return (
          <View key={ingredientId} style={styles.stepIngredientBadge}>
            {ing.imageUrl ? (
              <Image 
                source={{ uri: ing.imageUrl }} 
                style={styles.stepIngredientImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.stepIngredientImagePlaceholder}>
                <Text style={styles.stepIngredientEmoji}>🥄</Text>
              </View>
            )}
            <View style={styles.stepIngredientTextWrap}>
              <Text style={styles.stepIngredientQty} numberOfLines={1}>
                {ing.quantity} {ing.displayUnit}
              </Text>
              <Text style={styles.stepIngredientName} numberOfLines={2}>
                {ing.name}
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  </View>
)}
```

---

### 1.4: Add styles for step ingredients
**File:** `Mobile/components/RecipeDetailView.tsx`

**Location:** Inside `const styles = StyleSheet.create({...})` at the bottom

Add these styles:

```typescript
stepIngredientsBox: {
  marginVertical: Spacing.md,
  marginHorizontal: Spacing.md,
  backgroundColor: Colors.background.secondary,
  borderRadius: BorderRadius.lg,
  paddingVertical: Spacing.sm,
  paddingHorizontal: Spacing.sm,
  borderLeftWidth: 4,
  borderLeftColor: Colors.primary.main,
},
stepIngredientsTitle: {
  fontSize: Typography.caption.fontSize,
  fontWeight: '600',
  color: Colors.text.secondary,
  marginBottom: Spacing.sm,
  marginLeft: Spacing.sm,
  marginTop: Spacing.xs,
},
stepIngredientsScroll: {
  marginHorizontal: -Spacing.sm,
},
stepIngredientsContent: {
  paddingHorizontal: Spacing.sm,
  gap: Spacing.xs,
},
stepIngredientBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: Colors.primary.opacity[5],
  borderRadius: BorderRadius.md,
  paddingHorizontal: Spacing.sm,
  paddingVertical: Spacing.xs,
  minWidth: 140,
  gap: Spacing.xs,
},
stepIngredientImage: {
  width: 32,
  height: 32,
  borderRadius: BorderRadius.sm,
  backgroundColor: Colors.background.tertiary,
},
stepIngredientImagePlaceholder: {
  width: 32,
  height: 32,
  borderRadius: BorderRadius.sm,
  backgroundColor: Colors.background.tertiary,
  alignItems: 'center',
  justifyContent: 'center',
},
stepIngredientEmoji: {
  fontSize: 16,
},
stepIngredientTextWrap: {
  flex: 1,
},
stepIngredientQty: {
  fontSize: Typography.caption.fontSize,
  fontWeight: '600',
  color: Colors.primary.main,
  lineHeight: 14,
},
stepIngredientName: {
  fontSize: Typography.caption.fontSize,
  color: Colors.text.primary,
  lineHeight: 14,
},
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `Mobile/app/recipe-detail/[id].tsx` | Update steps transform logic (1.2) |
| `Mobile/components/RecipeDetailView.tsx` | Update StepItem interface (1.1) + Add rendering (1.3) + Add styles (1.4) |

---

## Testing Checklist

### Test: Cooking Mode - Step Ingredients
**Setup:**
- Open Expo Go on Android device
- Navigate to: Recipe Detail → Barry Pana Cotta (simply recipe)
- Go to Tab 3 (Steps/Готвя)
- **Make sure you're in TEXT VIEW mode** (toggle button at top)

**Expected Result:**

**Step 1 (Накиснете желатин...):**
- [ ] Shows header: "📋 Съставки за този стъп:"
- [ ] Shows 2 ingredients:
  - [ ] желатин (10 гр)
  - [ ] вода (60 мл)
- [ ] Scroll horizontally through badges (works smoothly)

**Step 2 (Затоплете кокосов крем...):**
- [ ] Shows different ingredients (only for this step)
- [ ] Shows:
  - [ ] Кокосова сметана
  - [ ] Подсладител (if applicable)

**Step 3-6:**
- [ ] Each step shows ONLY its specific ingredients
- [ ] NOT showing all 5 ingredients for every step

**Other checks:**
- [ ] Works in both **Text view** (shows ingredient badges)
- [ ] **Gallery view** shows nothing (correct - no change there)
- [ ] Ingredient images display correctly (if available)
- [ ] Quantity + unit displays correctly (e.g., "10 гр", "60 мл")

---

## Important Notes

1. **ID format matching:**
   - Ingredients are built as: `"4695_0"` (recipe_ingredients.id + "_" + order_index)
   - Steps ingredientsUsedIds must be same format: `["4695_0", "4696_0", ...]`

2. **Simply recipes have:**
   - One component (order_index = 0)
   - recipe_ingredients already loaded in baseRecipes query
   - steps already loaded via stepsData query

3. **Styling:**
   - All colors/sizes from Colors.ts and Theme.ts constants
   - No hardcoded values

4. **Text mode only:**
   - Only show ingredient badges in TEXT view mode
   - Gallery and other modes unchanged

---

## Code Navigation Map

| File | Lines | Purpose |
|------|-------|---------|
| `Mobile/app/recipe-detail/[id].tsx` | 236-247 | Steps transform (where to add ingredientsUsedIds) |
| `Mobile/components/RecipeDetailView.tsx` | 57-64 | StepItem interface |
| `Mobile/components/RecipeDetailView.tsx` | ~1023 | Steps rendering in Cooking mode (where to add ingredients display) |
| `Mobile/components/RecipeDetailView.tsx` | End of file | styles = StyleSheet.create() |

---

## Success Criteria

✅ Barry Pana Cotta Cooking mode shows step-specific ingredients
✅ Step 1 shows only желатин + вода
✅ Other steps show their correct ingredients
✅ Ingredient images, quantities, units display correctly
✅ Works only in Text view mode
✅ Gallery mode unchanged
✅ No console errors
✅ Tests pass on Android Expo Go

---

## Execution Time

Estimated: 30-40 minutes

---

## If Something Goes Wrong

1. **Ingredients not showing:**
   - Check that `ingredientsUsedIds` format matches ingredient IDs (e.g., "4695_0")
   - Verify `scaledIngredients` has all ingredients loaded

2. **Wrong ingredients showing:**
   - Verify the filter: `scaledIngredients.find(i => i.id === ingredientId)`
   - Check that step.ingredientsUsedIds has correct format

3. **Crashes on ingredient display:**
   - Ensure `ing.imageUrl` fallback works (placeholder emoji)
   - Check that `ing.quantity` and `ing.displayUnit` exist

---

## Notes for Deyana

- This is a simple fix: just proper ID matching between steps and ingredients
- No new database queries needed
- No changes to existing base recipe functionality
- Only affects Cooking mode (Text view) display
- Simply recipes now work same as any other recipe with steps