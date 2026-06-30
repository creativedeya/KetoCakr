# CLAUDE CODE TASK: Fix Lab Notes Query

## Overview
Fix lab notes display for simple recipes. Lab notes are in separate `lab_notes` table, not in `base_recipes`.

**Status:** Bug Fix
**Complexity:** Low
**Duration:** 30-45 minutes

---

## Problem
- Simple recipes load with 5 ingredients and 6 steps ✅
- But lab notes don't show because code looks in wrong table ❌

**Current Code:** Looks for `recipe.lab_notes_bg` and `recipe.lab_notes_en` in base_recipes
**Actual Data:** Lab notes are in separate `lab_notes` table with FK to base_recipes

---

## Task 1: Update recipe-detail/[id].tsx - Add Lab Notes Query

**File:** `Mobile/app/recipe-detail/[id].tsx`

**Location:** Find the `simpleRecipe` query (around line 150-180)

**After the `simpleRecipe` query, add this NEW query:**

```typescript
// ✅ NEW: Query lab notes from lab_notes table
const { data: labNotesData } = useQuery({
  queryKey: ['labNotes', id],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('lab_notes')
      .select('id, content_bg, content, title, title_bg, icon')
      .eq('recipe_id', id)
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('[Lab Notes] Error loading:', error);
      return [];
    }
    return data || [];
  },
  enabled: !!id && recipeType === 'simple',
});
```

---

## Task 2: Update transformedData - Add Lab Notes Array

**File:** `Mobile/app/recipe-detail/[id].tsx`

**Location:** Find where `transformedData` is returned (look for `return { ... }`)

**In the return object, for simple recipe path, add:**

```typescript
if (recipeType === 'simple') {
  return {
    recipe_type: 'simple',
    // ... existing fields ...
    lab_notes_array: labNotesData || [],  // ✅ ADD THIS LINE
  };
}
```

**Complete example (find this pattern):**
```typescript
if (recipeType === 'simple') {
  const transformedData = {
    recipe_type: 'simple',
    id: simpleRecipe.id,
    name: simpleRecipe.name,
    name_en: simpleRecipe.name_en,
    name_bg: simpleRecipe.name_bg,
    image_url: simpleRecipe.image_url,
    total_calories: simpleRecipe.total_calories,
    total_protein: simpleRecipe.total_protein,
    total_fat: simpleRecipe.total_fat,
    total_net_carbs: simpleRecipe.total_net_carbs,
    prep_time_minutes: simpleRecipe.prep_time_minutes,
    bake_time_minutes: simpleRecipe.bake_time_minutes,
    servings: simpleRecipe.servings,
    components: [{
      id: 'simple-main',
      roleName: '',
      ingredients: transformedIngredients,
      steps: transformedSteps,
    }],
    lab_notes_array: labNotesData || [],  // ✅ ADD THIS
  };
  
  return transformedData;
}
```

---

## Task 3: Update RecipeDetailView - Fix Lab Notes Rendering

**File:** `Mobile/components/RecipeDetailView.tsx`

**Location:** Find the Lab Notes section (search for "💡 Tips" or "lab_notes")

**REPLACE this:**
```typescript
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

**WITH this:**
```typescript
{(recipeType === 'ready' || recipeType === 'simple') && 
 recipe.lab_notes_array && recipe.lab_notes_array.length > 0 && (
  <>
    <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 16 }}>
      💡 Tips from Our Kitchen
    </Text>
    {recipe.lab_notes_array.map((note: any) => (
      <View key={note.id} style={{ marginVertical: 12, paddingLeft: 12, borderLeftWidth: 3, borderLeftColor: '#10b981' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>
            {note.icon || '💡'}
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#333' }}>
            {language === 'bg' ? note.title_bg || note.title : note.title}
          </Text>
        </View>
        <Text style={{ fontSize: 13, color: '#555', lineHeight: 18 }}>
          {language === 'bg' ? note.content_bg || note.content : note.content}
        </Text>
      </View>
    ))}
  </>
)}
```

---

## Testing Checklist

- [ ] Open mobile app
- [ ] Clear cache (if needed)
- [ ] Navigate to simple recipe ID: `96325c6c-398d-45c8-912f-4ae728567347`
- [ ] Recipe loads with:
  - [ ] ✅ Name: "Barry pana cotta" / "Яготова панакота"
  - [ ] ✅ Badge: "🏆 От нашите сладкари"
  - [ ] ✅ 5 ingredients visible
  - [ ] ✅ 6 steps in Cooking Mode
  - [ ] ✅ Lab notes displayed (if they exist in lab_notes table)
- [ ] No console errors
- [ ] All 3 recipe types still work (ready, simple, user)

---

## Console Debugging

Watch for these logs:
```
[Recipe Detail] Detecting recipe type for ID: 96325c6c...
[Recipe Detail] Found in base_recipes as simple recipe

[Lab Notes] Query executed
(or error if lab notes query fails)
```

---

## Key Points

1. Lab notes are in **separate `lab_notes` table**
2. FK: `lab_notes.recipe_id` → `base_recipes.id`
3. Each note has: `id`, `title`, `title_bg`, `content`, `content_bg`, `icon`
4. We query them separately and add as `lab_notes_array`
5. RecipeDetailView loops through array to render each note

---

## Common Issues

**Lab notes still don't show:**
- Check: Does `lab_notes` table have records for this recipe_id?
- Check: Is `is_active = true`?
- Check: Console shows `labNotesData` loaded?

**App crashes:**
- Check: `lab_notes_array` is always array (never null)
- Check: `.map()` has null check

**Styling looks wrong:**
- Adjust colors, sizes in the rendering code
- Use existing Colors from constants if needed

---

Ready to implement? 🚀

Execute Tasks 1, 2, and 3 in order.
Test after each task if possible.
Report back with results!