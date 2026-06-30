# KetoCakR Mobile — Fix 3 Critical Bugs (UPDATED)
**Task for Claude Code execution**

---

## 🔴 CRITICAL UPDATE: Barry Pana Cotta is a READY RECIPE!

**This changes EVERYTHING for Bug 1**

- Barry Pana Cotta (`96325c6c-398d-45c8-912f-4ae728567347`) is in `ready_recipes` table
- `ingredients_used` in steps = IDs from **`recipe_ingredients` table** (not `ingredients_database`)
- Need separate query for ready recipe ingredients
- Current code only handles base recipes

---

## Overview
Fix 3 bugs in KetoCakR mobile app:
1. **Cooking Mode (Tab 3):** Missing step ingredients display (READY RECIPES ONLY)
2. **Home Screen:** Title positioning (not visible on load)
3. **Language handling:** Verify localized names load correctly

**Repo:** https://github.com/creativedeya/KetoCakr
**Focus:** Mobile app only
**Test recipe:** Barry Pana Cotta (READY RECIPE)

---

## BUG 1: Cooking Mode Missing Step Ingredients (READY RECIPES)

### Current Issue
When viewing **Ready Recipe** Detail (Barry Pana Cotta) → Tab 3 (Steps/Cooking Mode), step ingredients are NOT shown.

Database confirms:
- `ingredients_used = ["4695","4696","4697","4698","4699"]` ← **recipe_ingredients.id values**
- These correspond to actual ingredients: желатин, вода, Ягоди, Еритритол, Кокосова сметана

### Root Cause
Ready recipes have different data structure than base recipes:
- Base recipes: `recipe_ingredients` nested in base_recipes query ✅ Works fine
- Ready recipes: NO separate `recipe_ingredients` query ❌ Missing!
- `ingredients_used` IDs are recipe_ingredients PKs, not ingredient_database UUIDs
- No way to match step ingredient IDs to ingredient details

### Solution

#### 1.1: Add query for ready recipe ingredients
**File:** `Mobile/app/recipe-detail/[id].tsx`

**Location:** After line 87 (after the stepsData query), add:

```typescript
// Заявка 4б (NEW): recipe_ingredients за ГОТОВАТА рецепта (само за ready recipes!)
const { data: readyRecipeIngredients } = useQuery({
  queryKey: ['readyRecipeIngredients', id],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('recipe_ingredients')
      .select('id, ingredient_database_id, ingredient_name, recipe_id, quantity, unit, order_index, ingredient:ingredients_database(id, name_en, name_bg, image_url, category_id, cat:ingredient_categories(id, name, name_en))')
      .eq('recipe_id', id);
    if (error) throw error;
    return data || [];
  },
  enabled: !!id && recipeType === 'ready',  // Only for ready recipes!
});
```

#### 1.2: Update StepItem interface
**File:** `Mobile/components/RecipeDetailView.tsx` (lines 57-64)

Replace the entire `StepItem` interface with:

```typescript
export interface StepItem {
  id: string;
  stepNumber: number;
  description: string;
  imageUrl?: string | null;
  durationMinutes?: number | null;
  componentId?: string;
  ingredientsForStep?: IngredientItem[];  // ← NEW: pre-matched ingredients for ready recipes
}
```

#### 1.3: Transform steps with matched ingredients
**File:** `Mobile/app/recipe-detail/[id].tsx`

**Location:** In the `transformedData` useMemo (around line 170-248)

Find the section where `allSteps` is populated, and ADD this BEFORE the loop:

```typescript
// Helper: find ingredient by recipe_ingredients ID (for ready recipes)
const findReadyIngredientById = (ingredientId: string): any => {
  return readyRecipeIngredients?.find((i: any) => String(i.id) === ingredientId);
};
```

Then **REPLACE** the entire `stepsForRecipe.forEach()` block (lines 236-247) with:

```typescript
stepsForRecipe.forEach((step: any) => {
  // Parse ingredients_used: stored as text[] in DB
  const ingredientsUsedIds: string[] = [];
  if (step.ingredients_used) {
    if (typeof step.ingredients_used === 'string') {
      try {
        const parsed = JSON.parse(step.ingredients_used);
        ingredientsUsedIds.push(...(Array.isArray(parsed) ? parsed : [parsed]));
      } catch (e) {
        ingredientsUsedIds.push(step.ingredients_used);
      }
    } else if (Array.isArray(step.ingredients_used)) {
      ingredientsUsedIds.push(...step.ingredients_used.map(id => String(id)));
    }
  }

  // For ready recipes: match ingredients_used IDs to recipe_ingredients
  const stepIngredients: any[] = [];
  if (baseRecipeIds.length > 0 && ingredientsUsedIds.length > 0) {
    // Recipe type check: if ingredients_used IDs don't match scaledIngredients, use ready recipe ingredients
    const isReadyRecipe = ingredientsUsedIds.some(id => {
      // Check if this ID exists in readyRecipeIngredients
      return readyRecipeIngredients?.some((i: any) => String(i.id) === id);
    });

    if (isReadyRecipe && readyRecipeIngredients) {
      ingredientsUsedIds.forEach((ingId: string) => {
        const readyIng = findReadyIngredientById(ingId);
        if (readyIng) {
          stepIngredients.push({
            id: `${readyIng.id}_step`,
            ingredientDatabaseId: readyIng.ingredient_database_id,
            name: language === 'en'
              ? (readyIng.ingredient?.name_en || readyIng.ingredient_name || '')
              : (readyIng.ingredient?.name_bg || readyIng.ingredient_name || ''),
            nameBg: readyIng.ingredient?.name_bg || readyIng.ingredient_name || '',
            nameEn: readyIng.ingredient?.name_en || readyIng.ingredient_name || '',
            quantity: readyIng.quantity,
            unit: readyIng.unit || '',
            imageUrl: readyIng.ingredient?.image_url || null,
            category: language === 'en'
              ? (readyIng.ingredient?.cat?.name_en || undefined)
              : (readyIng.ingredient?.cat?.name || undefined),
            componentId,
          });
        }
      });
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
    ingredientsForStep: stepIngredients.length > 0 ? stepIngredients : undefined,  // ← NEW
  });
});
```

#### 1.4: Render step ingredients in UI
**File:** `Mobile/components/RecipeDetailView.tsx`

**Location:** Inside steps rendering (line ~1023), in the `compSteps.map()` loop

After the gallery section (`{/* Gallery mode: horizontal ingredient list */}`) and BEFORE `{/* Steps */}`, add:

```typescript
{/* Step-specific ingredients (ready recipes only) */}
{viewMode === 'text' && step.ingredientsForStep && step.ingredientsForStep.length > 0 && (
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
      {step.ingredientsForStep.map((ing) => (
        <View key={ing.id} style={styles.stepIngredientBadge}>
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
              {ing.quantity} {ing.unit}
            </Text>
            <Text style={styles.stepIngredientName} numberOfLines={2}>
              {ing.name}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  </View>
)}
```

#### 1.5: Add styles to RecipeDetailView
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

## BUG 2: Home Screen — Title Positioning

### Current Issue
When opening Recipe Detail screen, recipe title is NOT visible at the top. It's positioned AFTER the hero image inside ScrollView, so user must scroll down to see it.

### Root Cause
- Hero image section takes ~75% of screen height
- Title section comes AFTER hero image in ScrollView
- No fixed/sticky header showing title

### Solution

#### 2.1: Restructure title position
**File:** `Mobile/components/RecipeDetailView.tsx`

**Location:** Lines 550-624

**FIND and REMOVE** the current title section (lines 621-624):
```typescript
{/* Recipe Title */}
<View style={styles.titleSection}>
  <Text style={styles.recipeTitle}>{name}</Text>
</View>
```

**ADD NEW title section BEFORE hero image** (insert after line 547, BEFORE the `<ImageBackground>` starts):

```typescript
{/* ═══════════════════════════════════════
    TITLE HEADER (always visible at top)
    ═════════════════════════════════════ */}
<View style={styles.titleHeaderSection}>
  <TouchableOpacity onPress={onBack} style={styles.titleHeaderBtn}>
    <Ionicons name="chevron-back" size={IconSize.md} color={Colors.primary.main} />
  </TouchableOpacity>
  <Text style={styles.titleHeaderText} numberOfLines={1}>{name}</Text>
  <TouchableOpacity style={styles.titleHeaderBtn}>
    <Ionicons name="share-social-outline" size={IconSize.md} color={Colors.primary.main} />
  </TouchableOpacity>
</View>

{/* ═══════════════════════════════════════
    HERO IMAGE & OVERLAY
    ═════════════════════════════════════ */}
```

#### 2.2: Add styles for title header
**File:** `Mobile/components/RecipeDetailView.tsx`

Add to `const styles = StyleSheet.create({...})`:

```typescript
titleHeaderSection: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: Spacing.md,
  paddingVertical: Spacing.md,
  paddingTop: Spacing.lg,
  backgroundColor: Colors.background.primary,
  borderBottomWidth: 1,
  borderBottomColor: Colors.background.secondary,
},
titleHeaderBtn: {
  padding: Spacing.xs,
  borderRadius: BorderRadius.md,
},
titleHeaderText: {
  flex: 1,
  marginHorizontal: Spacing.md,
  fontSize: Typography.heading.fontSize,
  fontWeight: '700',
  color: Colors.text.primary,
},
```

---

## BUG 3: Language Handling — Verify Localized Names

### Current Issue
Home screen Daily Delight card sometimes shows English name even when language is set to Bulgarian.

### Root Cause (likely)
Query may not explicitly select both `name_bg` and `name_en`. If `name_bg` is NULL, fallback is used.

### Solution

#### 3.1: Ensure query selects both localized fields
**File:** `Mobile/app/(tabs)/home/index.tsx` (lines 39-65)

Replace the daily recipe query with:

```typescript
const {
  data: dailyRecipe,
  isLoading: dailyLoading,
  isError: dailyError,
  refetch: refetchDaily,
} = useQuery({
  queryKey: ['dailyDelight'],
  queryFn: async () => {
    // Featured recipe
    const { data: featured } = await supabase
      .from('ready_recipes')
      .select('id, name_bg, name_en, hero_image_url, description_bg, description_en, total_calories, total_net_carbs')
      .eq('is_featured', true)
      .limit(1)
      .maybeSingle();

    if (featured) return featured;

    // Fallback: most recent ready_recipe
    const { data: fallback } = await supabase
      .from('ready_recipes')
      .select('id, name_bg, name_en, hero_image_url, description_bg, description_en, total_calories, total_net_carbs')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return fallback || null;
  },
});
```

---

## Testing Checklist

### Test BUG 1: Cooking Mode Ingredients
**Setup:** 
- Open Expo Go on Android device
- Navigate to: Recipe Detail → Barry Pana Cotta
- Go to Tab 3 (Steps/Cooking)

**Verify:**
- [ ] Step 1 shows: "📋 Съставки за този стъп:" header
- [ ] Below header: 5 ingredient badges with:
  - [ ] Ingredient images (желатин, вода, Ягоди, Еритритол, Кокосова сметана)
  - [ ] Quantity + unit (e.g., "60 мл", "40-50 гр")
  - [ ] Ingredient name in correct language
- [ ] Scroll horizontally through badges (works smoothly)
- [ ] Each step (1-6) has correct ingredients
- [ ] Works in both Text and Gallery view modes

**Expected ingredients per step:** All 5 same ingredients (желатин, вода, Ягоди, Еритритол, Кокосова сметана)

### Test BUG 2: Title Visibility
**Setup:**
- Open any recipe detail (Barry Pana Cotta)
- Screen should load

**Verify:**
- [ ] Recipe title visible IMMEDIATELY at TOP
- [ ] Back button (←) visible and clickable
- [ ] Share button visible and clickable
- [ ] Title doesn't overflow (shows: "Barry pana cotta" or "Бари паначота")
- [ ] Title section has light border separating from hero image
- [ ] When scrolling down, title scrolls naturally with content

### Test BUG 3: Language Switching
**Setup:**
- Set device language to Bulgarian
- Open Home screen
- View Daily Delight card

**Verify:**
- [ ] Daily Delight shows Bulgarian name: "Бари паначота"
- [ ] Switch device language to English
- [ ] Daily Delight shows: "Barry pana cotta"

**If failing:** Check admin panel — is `ready_recipes.name_bg` populated?

---

## Code Files to Modify

| File | Changes |
|------|---------|
| `Mobile/app/recipe-detail/[id].tsx` | Add readyRecipeIngredients query (1.1) + Transform logic (1.3) |
| `Mobile/components/RecipeDetailView.tsx` | Update StepItem interface (1.2) + Add rendering (1.4) + Add styles (1.5) + Move title (2.1, 2.2) |
| `Mobile/app/(tabs)/home/index.tsx` | Update daily recipe query (3.1) |

---

## Execution Order

1. **BUG 1** (45 min) — Cooking mode ingredients
2. **BUG 2** (10 min) — Title positioning
3. **BUG 3** (5 min) — Query optimization

**Total:** ~60 minutes

---

## Important Notes

1. **Ready recipe ingredients:** `recipe_ingredients.id` (PK) is what's stored in `ingredients_used`, NOT `ingredient_database_id`

2. **Array parsing:** `ingredients_used` from DB is text[], but handles both:
   - JSON string: `'["4695","4696"]'`
   - Array: `["4695","4696"]`

3. **Styling:** Use Colors.ts and Theme.ts constants (already imported)

4. **Localization:** All text uses `t()` function or language ternaries

---

## Success Criteria

✅ Step ingredients show in cooking mode (Barry Pana Cotta)
✅ Recipe title visible at top of screen
✅ Language switching works correctly
✅ No console errors
✅ Tests pass on Android Expo Go