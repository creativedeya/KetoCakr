# Fix: ready_recipes name_bg empty + Cooking Mode ingredients missing

**Scope:** 2 fixes  
**Time:** 20 min

---

## Fix 1 — name_bg empty when publishing simple recipe

**File:** `admin/app/dashboard/simple-recipes/[id]/page.tsx`

**Problem:** `recipe.name_bg` is null/undefined for recipes imported from PDF.
Their Bulgarian name is stored in `recipe.name`, not `recipe.name_bg`.

Find `upsertReadyRecipe()`. Fix the name fields:

```typescript
// BEFORE:
name_en: recipe?.name_en || recipe?.name || '',
name_bg: recipe?.name_bg || '',

// AFTER:
name_en: recipe?.name_en || recipe?.name || '',
name_bg: recipe?.name_bg || recipe?.name || '',
```

Same pattern — `name_bg` falls back to `name` if empty.

Also fix in `generateUniqueSlug` call — use EN name for slug:
```typescript
const slugName = recipe?.name_en || recipe?.name || recipe?.name_bg || '';
```
This is already correct — no change needed here.

---

## Fix 2 — Cooking Mode ingredients missing (Порционни десерти / type 8)

**Problem:** ingredients_used arrays are empty in recipe_instruction_steps.
This is the known outstanding bug — steps were imported without ingredient links.

First, check what's happening:

```bash
grep -rn "ingredients_used\|ingredientsUsed\|СЪСТАВКИ\|ingredients.*step\|step.*ingredients" C:/Dev/KetoCakR/Mobile/components/RecipeDetailView.tsx | head -20
grep -rn "ingredients_used\|ingredientsUsed" C:/Dev/KetoCakR/Mobile/app/recipe-detail/[id].tsx | head -20
```

**Find the cooking mode step component that renders ingredients:**

```bash
grep -rn "СЪСТАВКИ\|ingredients_used\|stepIngredients\|cookingIngredients" C:/Dev/KetoCakR/Mobile/app/recipe-detail/components/ --include="*.tsx"
```

**The ingredients section in cooking mode likely does:**
```typescript
// Shows ingredients only if step.ingredients_used.length > 0
{step.ingredients_used?.length > 0 && (
  <View>...</View>
)}
```

Since `ingredients_used = []` for all imported steps, the section never shows.

**Fix — show ALL recipe ingredients when step has no specific ingredients_used:**

Find the cooking mode step render. Replace the empty-array guard:

```typescript
// BEFORE — shows nothing when ingredients_used is empty:
{step.ingredients_used?.length > 0 && (
  <View style={styles.ingredientsSection}>
    {step.ingredients_used.map(...)}
  </View>
)}

// AFTER — falls back to all recipe ingredients when step has none:
{(() => {
  const stepIngIds = step.ingredients_used || [];
  // If step has specific ingredients, show those
  // If not, show all recipe ingredients (fallback for imported recipes)
  const displayIngredients = stepIngIds.length > 0
    ? allIngredients.filter(ing => stepIngIds.includes(ing.id))
    : allIngredients;
  
  return displayIngredients.length > 0 ? (
    <View style={styles.ingredientsSection}>
      <Text style={styles.ingredientsLabel}>
        {stepIngIds.length === 0 ? 'Съставки за рецептата:' : 'Необходими съставки:'}
      </Text>
      {displayIngredients.map((ing, i) => (
        // existing ingredient item render
      ))}
    </View>
  ) : null;
})()}
```

**IMPORTANT:** Check what variable holds all ingredients in that component.
It may be called `component.ingredients`, `recipeIngredients`, `allIngredients`, etc.
Read the file first, then adapt the variable name in the fix above.

---

## Rules
- Fix 1: 1 line change in upsertReadyRecipe
- Fix 2: read the cooking mode step file first, adapt to actual variable names
- Do NOT add new DB queries for Fix 2 — use already-loaded ingredients data

---

## Verification

**Fix 1:**
1. Admin → simple recipe → Публикувай
2. Check ready_recipes → name_bg populated correctly

**Fix 2:**
1. Mobile → Порционни десерти recipe → СТЪПКИ → Готвя
2. Each step shows ingredients section
3. Steps with specific ingredients_used → show only those
4. Steps with empty ingredients_used → show all recipe ingredients
