# KetoCakR Mobile — Fix 3 Critical Bugs
**Task for Claude Code execution**

---

## Overview
Fix 3 bugs in KetoCakR mobile app:
1. **Cooking Mode (Tab 3):** Missing step ingredients display
2. **Home Screen:** Title positioning (not visible on load)
3. **Language handling:** Verify localized names load correctly

**Repo:** https://github.com/creativedeya/KetoCakr
**Focus:** Mobile app only
**Test recipe:** Barry Pana Cotta (id: `96325c6c-398d-45c8-912f-4ae728567347`)

---

## BUG 1: Cooking Mode Missing Step Ingredients

### Current Issue
When viewing Recipe Detail → Tab 3 (Steps/Cooking Mode), **step ingredients are NOT shown**. Database has `ingredients_used` field (confirmed: step 1 has `["4695","4696","4697","4698","4699"]`), but mobile app doesn't display them.

### Root Cause
- Query loads `ingredients_used` from DB (recipe_instruction_steps table)
- Transform logic IGNORES the field (doesn't extract it)
- UI component has no interface field for `ingredientsUsed`

### Solution

#### 1.1: Update StepItem interface
**File:** `Mobile/components/RecipeDetailView.tsx` (lines 57-64)

Add to the `StepItem` interface:
```typescript
ingredientsUsed?: string[];    // array of ingredient database IDs, e.g., ["4695","4696"]
```

#### 1.2: Extract ingredients_used in transform
**File:** `Mobile/app/recipe-detail/[id].tsx` (lines 232-247)

Replace the entire `stepsForRecipe.forEach()` block with:

```typescript
stepsForRecipe.forEach((step: any) => {
  // Parse ingredients_used: stored as text[] in DB, e.g., ["4695","4696"]
  const ingredientsUsedIds: string[] = [];
  if (step.ingredients_used) {
    if (typeof step.ingredients_used === 'string') {
      // If it's a JSON string, parse it
      try {
        const parsed = JSON.parse(step.ingredients_used);
        ingredientsUsedIds.push(...(Array.isArray(parsed) ? parsed : [parsed]));
      } catch (e) {
        // If parsing fails, treat as single value
        ingredientsUsedIds.push(step.ingredients_used);
      }
    } else if (Array.isArray(step.ingredients_used)) {
      ingredientsUsedIds.push(...step.ingredients_used.map(id => String(id)));
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
    ingredientsUsed: ingredientsUsedIds,  // ← NEW FIELD
  });
});
```

#### 1.3: Render step ingredients in UI
**File:** `Mobile/components/RecipeDetailView.tsx` (around line 1020, INSIDE the steps section)

After the `{/* Gallery mode: horizontal ingredient list */}` section and before `{/* Steps */}`, add:

```typescript
{/* Step-specific ingredients in text mode */}
{viewMode === 'text' && step.ingredientsUsed && step.ingredientsUsed.length > 0 && (
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
      {step.ingredientsUsed.map((ingId: string, idx: number) => {
        const ing = scaledIngredients.find(i => 
          String(i.ingredientDatabaseId) === ingId && i.componentId === component.id
        );
        if (!ing) return null;
        return (
          <View key={`${ingId}_${idx}`} style={styles.stepIngredientBadge}>
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
              <Text style={styles.stepIngredientQty}>
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

#### 1.4: Add styles to RecipeDetailView
**File:** `Mobile/components/RecipeDetailView.tsx` (add to `const styles = StyleSheet.create({...})` at bottom)

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
When opening Recipe Detail screen, **recipe title is NOT visible at the top**. It's positioned AFTER the hero image inside ScrollView, so user must scroll down to see it.

### Root Cause
- Hero image section takes ~75% of screen height
- Title section comes AFTER hero image in ScrollView
- No fixed/sticky header showing title

### Solution

#### 2.1: Restructure title position
**File:** `Mobile/components/RecipeDetailView.tsx` (lines 550-624)

**Find and remove** the current title section (lines 621-624):
```typescript
{/* Recipe Title */}
<View style={styles.titleSection}>
  <Text style={styles.recipeTitle}>{name}</Text>
</View>
```

**Add NEW title section BEFORE hero image** (after line 547, before the `<ImageBackground>` section):

```typescript
{/* ═══════════════════════════════════════
    TITLE HEADER (always visible)
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
**File:** `Mobile/components/RecipeDetailView.tsx` (add to `const styles = StyleSheet.create({...})`)

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

#### 2.3: Remove/update old titleSection style
**File:** `Mobile/components/RecipeDetailView.tsx`

Remove or comment out the old `titleSection` style if it exists. If the style is referenced elsewhere, keep it but update to:
```typescript
titleSection: {
  backgroundColor: Colors.background.primary,
  paddingHorizontal: Spacing.md,
  paddingVertical: Spacing.sm,
  // Removed from visible area, kept for backwards compatibility
  display: 'none',
},
```

---

## BUG 3: Language Handling — Verify Localized Names Load

### Current Issue
Home screen Daily Delight card sometimes shows English name even when language is set to Bulgarian.

### Root Cause
Query may not explicitly select both `name_bg` and `name_en`. If `name_bg` is NULL in DB, fallback to `name_en` is used (which is correct), but suggests missing translation.

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

#### 3.2: Verify language logic (already correct, but double-check)
**File:** `Mobile/app/(tabs)/home/index.tsx` (lines 222, 247)

Confirm both lines use correct pattern:
```typescript
{language === 'bg' ? dailyRecipe.name_bg : (dailyRecipe.name_en || dailyRecipe.name_bg)}
```

**Note:** This is CORRECT. If `name_bg` is NULL but `name_en` exists:
- Bulgarian user sees: `name_en` (fallback)
- English user sees: `name_en` (primary)
- This is expected behavior

**Action:** If still seeing English when Bulgarian is selected:
1. Check admin panel: Is Barry Pana Cotta's `name_bg` field populated?
2. If NULL, populate it: "Barry pana cotta" → "Бари паначота"

---

## Testing Checklist

### Test BUG 1: Cooking Mode Ingredients
**Setup:** 
- Open Expo Go or dev build on Android device
- Navigate to Recipe Detail: Barry Pana Cotta
- Go to Tab 3 (Steps/Cooking)

**Verify:**
- [ ] Step 1 shows: "Съставки за този стъп:" header
- [ ] Step 1 displays ingredient badges with:
  - [ ] Ingredient images (if available)
  - [ ] Quantity + unit (e.g., "10 gr.")
  - [ ] Ingredient name (e.g., "желатин")
- [ ] Scroll horizontally through badges (ScrollView works)
- [ ] Each step has correct ingredients based on admin panel
- [ ] Works in both Text and Gallery view modes
- [ ] Verify step 2 also shows its ingredients

**Expected:** Step 1 ingredients: `["4695","4696","4697","4698","4699"]` (5 items)

### Test BUG 2: Title Visibility
**Setup:**
- Open any recipe detail (Barry Pana Cotta)
- Screen should load showing title at TOP

**Verify:**
- [ ] Recipe title visible IMMEDIATELY on screen load
- [ ] Back button (←) visible and clickable
- [ ] Share button (share-social) visible and clickable
- [ ] Title doesn't overflow (use numberOfLines={1})
- [ ] Title section has light border/separator from hero image
- [ ] Scroll down—title header stays visible or scrolls naturally with content

**Expected:** "Barry pana cotta" or "Бари паначота" visible at top

### Test BUG 3: Language Switching
**Setup:**
- Device language: Bulgarian (or change in-app if settings available)
- Open Home screen
- View Daily Delight card

**Verify:**
- [ ] Daily Delight shows: "Бари паначота" (Bulgarian)
- [ ] Switch device language to English
- [ ] Daily Delight shows: "Barry pana cotta" (English)
- [ ] No hardcoded English text anywhere in title
- [ ] Other recipe names in grid also localized correctly

**If failing:** Check admin panel—is `ready_recipes.name_bg` populated for Barry Pana Cotta?

---

## Code Navigation Map

| File | Lines | Purpose |
|------|-------|---------|
| `Mobile/components/RecipeDetailView.tsx` | 57-64 | `StepItem` interface |
| `Mobile/components/RecipeDetailView.tsx` | 1020-1090 | Steps rendering (where to add ingredients) |
| `Mobile/components/RecipeDetailView.tsx` | End of file | `const styles = StyleSheet.create()` |
| `Mobile/app/recipe-detail/[id].tsx` | 232-247 | Steps transform logic |
| `Mobile/app/(tabs)/home/index.tsx` | 39-65 | Daily recipe query |
| `Mobile/app/(tabs)/home/index.tsx` | 222, 247 | Title rendering (already correct) |

---

## Important Notes

1. **Ingredient ID matching:** `ingredientsUsed` contains ingredient database IDs (e.g., "4695"). Must match against `scaledIngredients` which has `ingredientDatabaseId` field.

2. **Array parsing:** `ingredients_used` from DB is text[], but may come as:
   - JSON string: `'["4695","4696"]'` → parse with JSON.parse()
   - Array: `["4695","4696"]` → use directly
   - Handle both gracefully with try-catch

3. **Styling:** Use Colors.ts and Theme.ts constants (already imported). Don't hardcode colors or sizes.

4. **Performance:** `step.ingredientsUsed.map()` runs per step, per component. With ~6 steps × 3 components = OK, but avoid nested queries.

5. **Localization:** All text strings should use `t()` or ternary language checks. No hardcoded English/Bulgarian.

---

## Success Criteria

✅ Cooking mode shows step-specific ingredients in badges
✅ Recipe title visible at top of screen immediately
✅ Title header has back + share buttons
✅ Language switching works correctly (verify admin panel first)
✅ All tests pass on Android Expo Go
✅ No console errors or warnings
✅ Code follows existing style patterns

---

## Execution Order

1. **Start with BUG 1** (most complex, highest value)
   - Update interface (5 min)
   - Extract ingredients_used (10 min)
   - Render UI (15 min)
   - Test (10 min)

2. **Then BUG 2** (quick win)
   - Move title section (5 min)
   - Add header button styles (5 min)
   - Test (5 min)

3. **Finish with BUG 3** (verification)
   - Update query (2 min)
   - Test language switching (5 min)
   - If failing: ping Deyana to populate `name_bg` in admin panel

**Total estimated time:** 60-90 minutes

---

## Commands

```bash
# Clone repo
git clone https://github.com/creativedeya/KetoCakr.git
cd KetoCakr/Mobile

# Install if needed
npm install

# Start Expo
npx expo start

# On Android device:
# Scan QR code with Expo Go app, or press 'a' for Android
```

---

## If Something Goes Wrong

1. **Ingredients not showing:** Check `scaledIngredients` filter—ensure `ingredientDatabaseId` matches `step.ingredientsUsed` IDs
2. **Title overlapping hero:** Adjust `titleHeaderSection` padding/height
3. **Language still wrong:** Verify `language` variable from `useTranslation()` is 'bg', not 'en'
4. **Parse error on ingredients_used:** Log the raw value—may be different format than expected

---

## Questions for Deyana

- Is Barry Pana Cotta's `name_bg` field populated in admin panel? If not, what should it be translated to?
- Any specific styling preferences for step ingredient badges?
- Should title header be sticky (stays at top while scrolling) or scroll naturally with content?