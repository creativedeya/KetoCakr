# FIXES NEEDED: Ready Recipe Auto-Creation & Dessert Type Dropdown

## Problem 1: Missing Nutrition Fields in ready_recipes

**Current Issue:**
- base_recipes has: `total_calories`, `total_protein`, `total_fat`, `total_carbs`, `total_net_carbs`
- ready_recipes created without these fields
- Mobile shows nutrition but it's wrong

**Fix Location:** When creating ready_recipes entry (either in API or SQL)

**Current SQL:**
```sql
INSERT INTO ready_recipes (...) VALUES (...)
-- Missing: total_calories, total_protein, total_fat, etc
```

**Correct SQL should include:**
```sql
INSERT INTO ready_recipes (
  id,
  name_en,
  name_bg,
  dessert_type_id,
  hero_image_url,
  selected_components,
  total_calories,          -- ✅ ADD
  total_protein,           -- ✅ ADD
  total_fat,               -- ✅ ADD
  total_carbs,             -- ✅ ADD
  total_net_carbs,         -- ✅ ADD
  total_weight_grams,      -- ✅ ADD
  servings,                -- ✅ ADD
  prep_time_minutes,       -- ✅ ADD
  bake_time_minutes,       -- ✅ ADD
  published_at,
  is_featured
)
SELECT
  id,
  name_en,
  name_bg,
  1,  -- dessert_type_id (hardcoded for now)
  image_url,
  '[{"base_recipe_id": id, "recipe_id": id}]'::jsonb,
  total_calories,          -- ✅ Copy from base_recipes
  total_protein,           -- ✅ Copy from base_recipes
  total_fat,               -- ✅ Copy from base_recipes
  total_carbs,             -- ✅ Copy from base_recipes
  total_net_carbs,         -- ✅ Copy from base_recipes
  total_weight_grams,      -- ✅ Copy from base_recipes
  servings,                -- ✅ Copy from base_recipes (not hardcoded 12!)
  prep_time_minutes,       -- ✅ Copy from base_recipes
  bake_time_minutes,       -- ✅ Copy from base_recipes
  NOW(),
  false
FROM base_recipes
WHERE id = '96325c6c-398d-45c8-912f-4ae728567347'
  AND is_simple_recipe = TRUE;
```

---

## Problem 2: Servings Wrong (12 vs 3)

**Issue:** ready_recipes shows `servings = 12` but base_recipes has `servings = 3`

**Root Cause:** Either:
1. Default value in schema (12)
2. SQL not copying from base_recipes
3. API hardcoded value

**Check in Supabase:**
```sql
-- Check what's in base_recipes
SELECT id, servings FROM base_recipes 
WHERE id = '96325c6c-398d-45c8-912f-4ae728567347';
-- Should show: 3

-- Check what's in ready_recipes
SELECT id, servings FROM ready_recipes 
WHERE id = '96325c6c-398d-45c8-912f-4ae728567347';
-- Currently shows: 12 ❌
```

**Fix:** Copy `servings` from base_recipes (see SQL above, includes `servings` field)

---

## Problem 3: Hero Image Not Copied

**Issue:** `hero_image_url` is NULL or wrong in ready_recipes

**Current SQL:**
```sql
hero_image_url,
(SELECT image_url FROM base_recipes WHERE id = '96325c6c-398d-45c8-912f-4ae728567347')
```

This SHOULD work, but might have issues if:
1. Subquery returns NULL
2. Image URL is wrong in base_recipes

**Check:**
```sql
SELECT id, image_url FROM base_recipes 
WHERE id = '96325c6c-398d-45c8-912f-4ae728567347';
```

**If image_url is NULL in base_recipes:**
- Admin needs to upload image when creating simple recipe
- Or manually set it

**Fix:** Ensure base_recipes.image_url is populated BEFORE creating ready_recipes

---

## Problem 4: Dessert Type Dropdown is EMPTY

**Issue:** When creating new simple recipe, dropdown shows no options

**Root Cause:** `useEffect` loading dessert_types might not be running

**In Admin Panel file** `[id]/page.tsx`:

```typescript
// Check this useEffect exists:
useEffect(() => {
  const loadDessertTypes = async () => {
    const { data, error } = await supabase
      .from('dessert_types')
      .select('id, name_en, name_bg')
      .order('name_en', { ascending: true });
    
    if (error) {
      console.error('[Dessert Types] Error:', error);
      return;
    }
    
    setDessertTypes(data || []);
    console.log('[Dessert Types] Loaded:', data?.length, 'types');  // ✅ ADD THIS
  };
  
  loadDessertTypes();
}, []);  // ✅ IMPORTANT: Empty dependency array (runs once on mount)
```

**Check console:**
- Open browser DevTools → Console
- Look for: `[Dessert Types] Loaded: 7 types`
- If NOT there → Effect didn't run

**Possible Issues:**
1. `useEffect` not in code (missing Task 1)
2. Supabase query fails (check error log)
3. useState not initialized properly
4. Component re-renders before data loads

**Test Fix:**
```typescript
// Add this to see what's happening:
useEffect(() => {
  console.log('[DEBUG] Current dessertTypes state:', dessertTypes);
}, [dessertTypes]);
```

---

## Complete Fix SQL (All Problems)

**Run this to fix existing record:**

```sql
-- ✅ UPDATE ready_recipes with ALL missing fields
UPDATE ready_recipes
SET
  total_calories = (SELECT total_calories FROM base_recipes WHERE id = '96325c6c-398d-45c8-912f-4ae728567347'),
  total_protein = (SELECT total_protein FROM base_recipes WHERE id = '96325c6c-398d-45c8-912f-4ae728567347'),
  total_fat = (SELECT total_fat FROM base_recipes WHERE id = '96325c6c-398d-45c8-912f-4ae728567347'),
  total_carbs = (SELECT total_carbs FROM base_recipes WHERE id = '96325c6c-398d-45c8-912f-4ae728567347'),
  total_net_carbs = (SELECT total_net_carbs FROM base_recipes WHERE id = '96325c6c-398d-45c8-912f-4ae728567347'),
  total_weight_grams = (SELECT total_weight_grams FROM base_recipes WHERE id = '96325c6c-398d-45c8-912f-4ae728567347'),
  servings = (SELECT servings FROM base_recipes WHERE id = '96325c6c-398d-45c8-912f-4ae728567347'),
  prep_time_minutes = (SELECT prep_time_minutes FROM base_recipes WHERE id = '96325c6c-398d-45c8-912f-4ae728567347'),
  bake_time_minutes = (SELECT bake_time_minutes FROM base_recipes WHERE id = '96325c6c-398d-45c8-912f-4ae728567347'),
  hero_image_url = (SELECT image_url FROM base_recipes WHERE id = '96325c6c-398d-45c8-912f-4ae728567347')
WHERE id = '96325c6c-398d-45c8-912f-4ae728567347';
```

**Then verify:**
```sql
SELECT 
  id,
  servings,
  total_calories,
  total_protein,
  hero_image_url
FROM ready_recipes
WHERE id = '96325c6c-398d-45c8-912f-4ae728567347';
```

Should show:
- `servings = 3` ✅
- `total_calories = 586.10` ✅
- `hero_image_url = <valid URL>` ✅

---

## For Future (Admin Panel Implementation)

When implementing Tasks 1-5 from previous task, the API should do:

```typescript
// When saving simple recipe → create ready_recipes with ALL fields:

const readyRecipePayload = {
  id: recipeId,
  name_en: recipe.name_en,
  name_bg: recipe.name_bg,
  dessert_type_id: selectedDessertTypeId,  // ✅ From dropdown
  hero_image_url: recipe.image_url,  // ✅ From base_recipes
  selected_components: [{ base_recipe_id: recipeId, recipe_id: recipeId }],
  
  // ✅ ALL nutrition fields:
  total_calories: recipe.total_calories,
  total_protein: recipe.total_protein,
  total_fat: recipe.total_fat,
  total_carbs: recipe.total_carbs,
  total_net_carbs: recipe.total_net_carbs,
  total_weight_grams: recipe.total_weight_grams,
  servings: recipe.servings,  // ✅ NOT hardcoded!
  prep_time_minutes: recipe.prep_time_minutes,
  bake_time_minutes: recipe.bake_time_minutes,
  
  published_at: new Date().toISOString(),
};
```

---

## Debugging Checklist

### For Dropdown Issue:
- [ ] Check console: `[Dessert Types] Loaded: 7 types`
- [ ] If missing: useEffect not running
- [ ] Check: `dessertTypes` state in DevTools
- [ ] Check: No Supabase error in console

### For Nutrition/Servings:
- [ ] Run SQL UPDATE above
- [ ] Verify in Supabase: `SELECT * FROM ready_recipes WHERE id = '...'`
- [ ] Check all fields populated
- [ ] Test in mobile: nutrition should match base_recipes

### For Hero Image:
- [ ] Check `hero_image_url` is NOT NULL
- [ ] Verify URL is valid (not broken link)
- [ ] Test in mobile: image should display

---

## Summary

```
Problem 1 (Nutrition): Copy all nutrition fields from base_recipes ✅
Problem 2 (Servings): Copy servings from base_recipes (not hardcode 12) ✅
Problem 3 (Image): Ensure image_url is populated ✅
Problem 4 (Dropdown): Fix useEffect/useState for dessert types ✅
```

---

Ready to implement these fixes? 🚀