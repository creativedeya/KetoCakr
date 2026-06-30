# KetoCakR Mobile — PRECISE Task: Pass sourceUrl Prop to RecipeDetailView

## PROBLEM

The VideoButton is not showing because `sourceUrl` prop is NOT being passed from parent components to `RecipeDetailView`.

**Current State:**
- ✅ RecipeDetailView has `sourceUrl?: string;` in interface (line 143)
- ✅ RecipeDetailView has VideoButton code at line 858 that uses `{sourceUrl ? ...}`
- ❌ BUT parent components are NOT passing `sourceUrl={...}` when calling RecipeDetailView
- Result: `sourceUrl` is undefined, condition fails, button doesn't show

---

## SOLUTION: Find and Fix All RecipeDetailView Calls

### Step 1: Find All Files That Call RecipeDetailView

**Search in these locations:**
1. `Mobile/app/recipe-detail/[id].tsx`
2. `Mobile/components/*.tsx` (any component that renders RecipeDetailView)
3. Anywhere else RecipeDetailView is imported and used

**How to find:**
In VS Code:
- `Ctrl+Shift+F` (Windows) or `Cmd+Shift+F` (Mac)
- Search: `<RecipeDetailView`
- Look at all matches

### Step 2: For EACH File That Uses RecipeDetailView

**Pattern to find:**
```typescript
<RecipeDetailView
  recipe={...}
  totalServings={...}
  // ... other props ...
/>
```

**What to check:**
- Does it have `sourceUrl={...}` prop? If YES → skip
- Does it NOT have `sourceUrl={...}` prop? If NO → ADD it

### Step 3: ADD sourceUrl Prop

**For each RecipeDetailView call, add:**

```typescript
sourceUrl={recipe.source_url}
```

**Example of BEFORE:**
```typescript
<RecipeDetailView
  recipe={recipe}
  totalServings={servings}
  dessertTypeName={dessertType?.name}
  onBack={onBack}
/>
```

**Example of AFTER:**
```typescript
<RecipeDetailView
  recipe={recipe}
  totalServings={servings}
  dessertTypeName={dessertType?.name}
  sourceUrl={recipe.source_url}  // ← ADD THIS LINE
  onBack={onBack}
/>
```

---

## CRITICAL FILES TO CHECK

### File 1: `Mobile/app/recipe-detail/[id].tsx`

**Find:** Where RecipeDetailView is rendered (usually near bottom)

**Look for:**
```typescript
return (
  <View>
    <RecipeDetailView
      recipe={...}
```

**ACTION:**
Add `sourceUrl={recipe.source_url}` to props

---

### File 2: `Mobile/app/user-recipe/[id].tsx` (if exists)

**Find:** Where RecipeDetailView is rendered

**ACTION:**
Add `sourceUrl={recipe.source_url}` to props

---

### File 3: Search ALL Other Files

In VS Code:
- `Ctrl+Shift+F`
- Search: `<RecipeDetailView`
- For each result, add `sourceUrl={recipe.source_url}` if missing

---

## EXACT CHANGE

**Every place where you see:**
```typescript
<RecipeDetailView
```

**Must have this prop added (if not already present):**
```typescript
sourceUrl={recipe.source_url}
```

**Full example:**
```typescript
<RecipeDetailView
  recipe={recipe}
  totalServings={recipe.servings || 8}
  totalWeightGrams={recipe.total_weight_grams || 0}
  introText={recipe.description}
  dessertTypeName={dessertType?.name}
  dessertTypeImageUrl={dessertType?.image_url}
  hasFixedPan={recipe.recipe_role_id !== 4}
  isPortionDessert={recipe.recipe_role_id === 4}
  servingContainer={servingContainer}
  allowImageUpload={true}
  equipment={equipment}
  labNotes={labNotes}
  recipeType={recipeType}
  sourceUrl={recipe.source_url}  // ← ADD THIS
  onBack={() => router.back()}
/>
```

---

## VERIFICATION CHECKLIST

- [ ] Find ALL files where RecipeDetailView is used (Ctrl+Shift+F search)
- [ ] For EACH file:
  - [ ] Verify `recipe` object is available
  - [ ] Verify `recipe.source_url` exists in recipe data
  - [ ] Add `sourceUrl={recipe.source_url}` prop
  - [ ] Verify syntax is correct (no missing commas)
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Test on simply recipe with source_url

---

## TESTING

After making changes:

1. **Open Mobile app**
2. **Navigate to simply recipe** (Ягодова панакота)
3. **Look below hero image**
4. **Should see:** Video button with YouTube thumbnail, play button, "WATCH VIDEO" text
5. **Click button**
6. **Should see:** Full-screen YouTube player opens
7. **Video plays** with subtitles

---

## IF STILL NOT WORKING

If video button still doesn't show after adding prop:

1. Check Supabase: Does the recipe have source_url? 
   ```sql
   SELECT id, source_url FROM base_recipes WHERE id = '96325c6c-398d-45c8-912f-4ae728567347';
   ```
   If NULL → add URL in Admin Panel first

2. Check React console for errors

3. Verify recipe data is loading: Add debug log
   ```typescript
   console.log('Recipe source_url:', recipe.source_url);
   ```

4. Verify VideoButton component exists at `Mobile/components/VideoButton.tsx`

---

## FILES TO MODIFY

**Primary files (most likely):**
- `Mobile/app/recipe-detail/[id].tsx`

**Secondary files (if they exist and use RecipeDetailView):**
- `Mobile/app/user-recipe/[id].tsx`
- Any component files under `Mobile/components/`

**Search pattern:**
```
<RecipeDetailView
```

Add:
```
sourceUrl={recipe.source_url}
```

---

Generated: 2026-05-21
Priority: BLOCKING (video button won't show without prop)
Complexity: TRIVIAL (just add 1 prop in 1-2 places)
Time: 5 minutes