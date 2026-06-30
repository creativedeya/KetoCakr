# PHASE 5.1 CLAUDE CODE TASK: Simple Recipes Mobile Implementation

## Overview
Add support for displaying simple recipes (created by admin) in the mobile app's recipe-detail screen.

**Task Scope:** Display + Cooking Mode
**Duration:** ~2-3 hours
**Complexity:** Medium (type detection + conditional queries)

---

## Prerequisites

Read these files FIRST:
1. `/home/claude/PHASE5_1_SIMPLE_RECIPES_MOBILE.md` — Architecture & detailed plan
2. Current mobile recipe-detail code: `Mobile/app/recipe-detail/[id].tsx`
3. Current RecipeDetailView: `Mobile/components/RecipeDetailView.tsx`

---

## TASK 1: Add Type Detection to recipe-detail/[id].tsx

**File:** `Mobile/app/recipe-detail/[id].tsx`

**Location:** Near top of component, after imports

**What to add:**

```typescript
// Add this import at top
import { useState } from 'react';

// Add this state variable after useLocalSearchParams()
const [recipeType, setRecipeType] = useState<'ready' | 'simple' | 'user' | null>(null);

// Add this NEW query after existing queries
// Step 1: Detect which table contains this recipe
const { data: detectedType, isLoading: typeLoading } = useQuery({
  queryKey: ['detectRecipeType', id],
  queryFn: async () => {
    console.log('[Recipe Detail] Detecting recipe type for ID:', id);

    // Check 1: ready_recipes
    const { data: readyData } = await supabase
      .from('ready_recipes')
      .select('id')
      .eq('id', id)
      .maybeSingle();
    
    if (readyData) {
      console.log('[Recipe Detail] Found in ready_recipes');
      setRecipeType('ready');
      return 'ready';
    }

    // Check 2: user_recipes
    const { data: userData } = await supabase
      .from('user_recipes')
      .select('id')
      .eq('id', id)
      .maybeSingle();
    
    if (userData) {
      console.log('[Recipe Detail] Found in user_recipes');
      setRecipeType('user');
      return 'user';
    }

    // Check 3: base_recipes WHERE is_simple_recipe = TRUE (✅ NEW)
    const { data: baseData } = await supabase
      .from('base_recipes')
      .select('id, is_simple_recipe')
      .eq('id', id)
      .maybeSingle();
    
    if (baseData?.is_simple_recipe === true) {
      console.log('[Recipe Detail] Found in base_recipes as simple recipe');
      setRecipeType('simple');
      return 'simple';
    }

    throw new Error('Recipe not found');
  },
  enabled: !!id,
});

// Early return if type is loading or not found
if (typeLoading) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

if (!recipeType) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Recipe not found</Text>
    </View>
  );
}
```

---

## TASK 2: Update Recipe Loading Query

**File:** `Mobile/app/recipe-detail/[id].tsx`

**Location:** Replace the existing recipe loading query (lines 20-32 approximately)

**What to change:**

Find this:
```typescript
// Заявка 1: ready_recipe
const { data: recipe, isLoading: recipeLoading, error: recipeError } = useQuery({
  queryKey: ['readyRecipe', id],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('ready_recipes')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  enabled: !!id,
});
```

Replace with:
```typescript
// ✅ UPDATE: Load recipe based on detected type
const { data: recipe, isLoading: recipeLoading, error: recipeError } = useQuery({
  queryKey: ['recipe', id, recipeType],
  queryFn: async () => {
    if (recipeType === 'ready') {
      // EXISTING: Load ready recipe
      const { data, error } = await supabase
        .from('ready_recipes')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return { ...data, recipe_type: 'ready' };
    }

    if (recipeType === 'simple') {
      // ✅ NEW: Load simple recipe from base_recipes
      const { data, error } = await supabase
        .from('base_recipes')
        .select(
          `id,
           name, name_en, name_bg,
           image_url,
           total_weight_grams,
           total_calories,
           total_protein,
           total_fat,
           total_carbs,
           total_net_carbs,
           prep_time_minutes,
           bake_time_minutes,
           servings,
           lab_notes_bg,
           lab_notes_en,
           recipe_role_id,
           role:recipe_roles(id, name, name_en),
           recipe_ingredients(
             id,
             ingredient_database_id,
             ingredient_name,
             quantity,
             unit,
             order_index,
             ingredient:ingredients_database(
               id,
               name_en,
               name_bg,
               image_url,
               category_id,
               cat:ingredient_categories(id, name, name_en)
             )
           )`
        )
        .eq('id', id)
        .eq('is_simple_recipe', true)
        .single();
      
      if (error) throw error;
      return { ...data, recipe_type: 'simple' };
    }

    if (recipeType === 'user') {
      // EXISTING: Load user recipe
      const { data, error } = await supabase
        .from('user_recipes')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return { ...data, recipe_type: 'user' };
    }
  },
  enabled: !!recipeType,
});
```

---

## TASK 3: Update Components Loading Query

**File:** `Mobile/app/recipe-detail/[id].tsx`

**Location:** Find the baseRecipeIds useMemo (line ~50)

**What to change:**

Update this:
```typescript
const baseRecipeIds = useMemo(() => {
  if (!recipe?.selected_components) return [] as number[];
  const comps = recipe.selected_components as any[];
  return [...new Set(comps.map((c: any) => c.base_recipe_id))] as number[];
}, [recipe]);
```

To this:
```typescript
// ✅ UPDATE: Only extract components for ready recipes
const baseRecipeIds = useMemo(() => {
  if (recipeType !== 'ready') return [];  // ✅ NEW: Skip for simple & user recipes
  if (!recipe?.selected_components) return [];
  const comps = recipe.selected_components as any[];
  return [...new Set(comps.map((c: any) => c.base_recipe_id))];
}, [recipe, recipeType]);  // ✅ ADD recipeType dependency
```

---

## TASK 4: Update Steps Loading Query

**File:** `Mobile/app/recipe-detail/[id].tsx`

**Location:** Find stepsRecipeId calculation (before stepsData query)

**Add this NEW code (if it doesn't exist):**

```typescript
// ✅ UPDATE: Get recipe_id based on recipe type
const stepsRecipeId = useMemo(() => {
  if (recipeType === 'ready') {
    // For ready recipes: first component's recipe_id
    if (!recipe?.selected_components) return null;
    return recipe.selected_components[0]?.recipe_id;
  }

  if (recipeType === 'simple') {
    // ✅ NEW: For simple recipes, the ID itself is recipe_id
    return recipe?.id;
  }

  if (recipeType === 'user') {
    // For user recipes: first component's recipe_id
    if (!recipe?.selected_components) return null;
    return recipe.selected_components[0]?.recipe_id;
  }

  return null;
}, [recipe, recipeType]);

// Update stepsData query to use stepsRecipeId
const { data: stepsData, isLoading: stepsLoading, error: stepsError } = useQuery({
  queryKey: ['recipeSteps', stepsRecipeId],
  queryFn: async () => {
    if (!stepsRecipeId) return [];
    const { data, error } = await supabase
      .from('recipe_instruction_steps')
      .select('*')
      .eq('recipe_id', stepsRecipeId)
      .order('step_number');
    if (error) throw error;
    return data || [];
  },
  enabled: !!stepsRecipeId,
});
```

**If stepsData query already exists**, update it to use `stepsRecipeId` instead of `baseRecipeIds`.

---

## TASK 5: Update RecipeDetailView Component Call

**File:** `Mobile/app/recipe-detail/[id].tsx`

**Location:** Find return statement with RecipeDetailView

**What to change:**

Find this:
```typescript
return (
  <RecipeDetailView
    recipe={recipe}
    baseRecipes={baseRecipes}
    stepsData={stepsData}
    // ... other props
  />
);
```

Update to:
```typescript
return (
  <RecipeDetailView
    recipe={recipe}
    baseRecipes={baseRecipes || []}
    stepsData={stepsData}
    assemblyTemplate={assemblyTemplate}
    recipeType={recipeType}  // ✅ NEW: Pass type
    dessertType={dessertType}
    language={language}
    isLoading={recipeLoading || baseLoading || stepsLoading}  // ✅ Remove typeLoading
    error={recipeError || baseError || stepsError}
  />
);
```

---

## TASK 6: Update RecipeDetailView Component

**File:** `Mobile/components/RecipeDetailView.tsx`

**Location:** Interface definition at top

**What to change:**

Add to interface:
```typescript
interface RecipeDetailViewProps {
  recipe: any;
  baseRecipes?: any[];
  stepsData?: any[];
  assemblyTemplate?: any;
  recipeType?: 'ready' | 'simple' | 'user';  // ✅ NEW
  dessertType?: any;
  language?: string;
  isLoading: boolean;
  error?: Error | null;
}
```

Update component signature:
```typescript
export default function RecipeDetailView({
  recipe,
  baseRecipes = [],
  stepsData = [],
  assemblyTemplate,
  recipeType,  // ✅ NEW
  dessertType,
  language,
  isLoading,
  error
}: RecipeDetailViewProps) {
```

---

## TASK 7: Add Conditional Rendering in RecipeDetailView

**File:** `Mobile/components/RecipeDetailView.tsx`

**Location:** In the return JSX

**Add these sections:**

```typescript
// In the ScrollView, add after recipe header:

{/* Components section - ONLY for ready_recipes */}
{recipeType === 'ready' && baseRecipes.length > 0 && (
  <>
    <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 16 }}>
      Recipe Components
    </Text>
    {/* Render baseRecipes here - keep existing logic */}
  </>
)}

{/* Simple recipe specific section ✅ NEW */}
{recipeType === 'simple' && recipe.recipe_ingredients && (
  <>
    <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 16 }}>
      Ingredients
    </Text>
    {recipe.recipe_ingredients.map((ing: any, idx: number) => (
      <View key={idx} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold' }}>
          {ing.quantity} {ing.unit} {ing.ingredient_name}
        </Text>
        {ing.ingredient?.name_en && (
          <Text style={{ fontSize: 12, color: '#666' }}>
            {ing.ingredient.name_en}
          </Text>
        )}
      </View>
    ))}
  </>
)}

{/* Lab Notes - for admin recipes (ready + simple) ✅ NEW */}
{(recipeType === 'ready' || recipeType === 'simple') && 
 (recipe.lab_notes_bg || recipe.lab_notes_en) && (
  <>
    <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 16 }}>
      💡 Tips from Our Kitchen
    </Text>
    <Text style={{ fontSize: 14, color: '#555', lineHeight: 20 }}>
      {language === 'bg' ? recipe.lab_notes_bg : recipe.lab_notes_en}
    </Text>
  </>
)}
```

---

## TASK 8: Update RecipeHeader (Add Badge)

**File:** `Mobile/components/RecipeDetailView.tsx` or `Mobile/components/RecipeHeader.tsx`

**Add this somewhere in the header:**

```typescript
{/* Recipe Source Badge ✅ NEW */}
{recipeType === 'simple' && (
  <View style={{ paddingVertical: 8 }}>
    <Text style={{ fontSize: 12, color: '#10b981', fontWeight: '600' }}>
      🏆 By Our Chefs
    </Text>
  </View>
)}
{recipeType === 'ready' && (
  <View style={{ paddingVertical: 8 }}>
    <Text style={{ fontSize: 12, color: '#059669', fontWeight: '600' }}>
      ✓ Chef Selected
    </Text>
  </View>
)}
```

---

## TASK 9: Test Type Detection

**In your mobile app:**

1. Open a ready recipe (should detect as 'ready')
   - Look at console: "[Recipe Detail] Found in ready_recipes"
   - Should show components section

2. Open a user recipe (should detect as 'user')
   - Look at console: "[Recipe Detail] Found in user_recipes"
   - Should NOT show components section

3. Open a simple recipe by ID
   - Look at console: "[Recipe Detail] Found in base_recipes as simple recipe"
   - Should show ingredients directly
   - Should show "By Our Chefs" badge
   - Should show lab notes

---

## Console Debugging

Watch for these console logs:
```
[Recipe Detail] Detecting recipe type for ID: <uuid>
[Recipe Detail] Found in ready_recipes
    or
[Recipe Detail] Found in user_recipes
    or
[Recipe Detail] Found in base_recipes as simple recipe
```

If you see error:
```
[Recipe Detail] Recipe not found
```

The recipe doesn't exist in any table.

---

## Testing Checklist

- [ ] Type detection works (check console logs)
- [ ] ready_recipes load as before (no changes)
- [ ] user_recipes load as before (no changes)
- [ ] simple recipes load with new logic
- [ ] simple recipes show "By Our Chefs" badge
- [ ] simple recipes show ingredients
- [ ] simple recipes show lab notes
- [ ] Cooking Mode tab works for simple recipes
- [ ] No errors in console
- [ ] All recipe types display correctly

---

## Common Issues & Fixes

**Issue:** "Recipe not found"
- Check: Is the recipe ID valid?
- Check: Is it in one of the three tables?
- Check: For simple recipes, is `is_simple_recipe = TRUE`?

**Issue:** Steps don't load
- Check: Is `stepsRecipeId` correct?
- Check: Does recipe_instruction_steps table have steps for this recipe_id?

**Issue:** Ingredients don't show for simple recipe
- Check: Does base_recipes have recipe_ingredients FK?
- Check: Is the query including recipe_ingredients?

**Issue:** Components show for simple recipe
- Check: Verify `if (recipeType !== 'ready') return [];` is working
- Check: baseRecipeIds should be empty for simple recipes

---

## Implementation Order

1. ✅ Add type detection query
2. ✅ Update recipe loading query
3. ✅ Update components loading (skip for simple)
4. ✅ Update steps loading (use correct recipe_id)
5. ✅ Pass recipeType to RecipeDetailView
6. ✅ Add conditional rendering in RecipeDetailView
7. ✅ Add badge for simple recipes
8. ✅ Test all recipe types
9. ✅ Check console logs
10. ✅ Verify Cooking Mode works

---

## Expected Result

**Recipe Detail Screen Now Shows:**

```
Ready Recipe:
├─ Name, image
├─ Components (crust, cream, filling, decoration)
├─ "Chef Selected" badge
└─ Steps

Simple Recipe:
├─ Name, image
├─ "By Our Chefs" badge
├─ Ingredients (directly from recipe_ingredients)
├─ Lab notes (tips from kitchen)
└─ Steps

User Recipe:
├─ Name, image (or placeholder)
├─ "Your Creation" badge
├─ Components (from selected_components)
└─ Steps
```

---

## Ready?

Start with TASK 1 and work through systematically.

Check console logs frequently to verify detection is working.

Good luck! 🚀