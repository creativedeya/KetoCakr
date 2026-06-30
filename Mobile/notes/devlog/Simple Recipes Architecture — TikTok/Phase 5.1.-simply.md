# CLAUDE CODE TASK: Add Dessert Type Selector & Auto-Create Ready Recipe

## Overview
When admin saves a simple recipe, create matching entry in `ready_recipes` table.
Requires selecting dessert type (dropdown).

**Status:** Feature Implementation
**Complexity:** Medium
**Duration:** 1.5-2 hours
**Files:** 2 main files + 1 API route

---

## Prerequisites

Read these first:
1. `/home/claude/ARCHITECTURE_SIMPLE_RECIPES_READY_LINK.md` — Full architecture
2. Current simple recipe form: `Admin/app/dashboard/simple-recipes/[id]/page.tsx`
3. Current API: Check if route exists `Admin/app/api/simple-recipes/[id]/route.ts`

---

## Task 1: Add Dessert Type Dropdown to Form

**File:** `Admin/app/dashboard/simple-recipes/[id]/page.tsx`

**Location:** Find where recipe form starts (after title input)

**Add this state and effect at top of component:**

```typescript
// ✅ NEW: Dessert types for dropdown
const [dessertTypes, setDessertTypes] = useState<any[]>([]);
const [selectedDessertTypeId, setSelectedDessertTypeId] = useState<string>('');

// Load dessert types on mount
useEffect(() => {
  const loadDessertTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('dessert_types')
        .select('id, name_en, name_bg')
        .order('name_en', { ascending: true });
      
      if (error) throw error;
      setDessertTypes(data || []);
      
      // If editing existing recipe, load its dessert_type
      if (recipe?.dessert_type_id) {
        setSelectedDessertTypeId(recipe.dessert_type_id);
      }
    } catch (error) {
      console.error('[Dessert Types] Error loading:', error);
      toast.error('Failed to load dessert types');
    }
  };
  
  loadDessertTypes();
}, [recipe?.dessert_type_id]);
```

---

## Task 2: Add Form Input for Dessert Type

**File:** `Admin/app/dashboard/simple-recipes/[id]/page.tsx`

**Location:** In the form JSX, after name input, add:**

```typescript
{/* ✅ NEW: Dessert Type Dropdown */}
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Dessert Type (Тип на Десерта) *
  </label>
  <select
    value={selectedDessertTypeId}
    onChange={(e) => setSelectedDessertTypeId(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
  >
    <option value="">-- Select type --</option>
    {dessertTypes.map(type => (
      <option key={type.id} value={type.id}>
        {type.name_en} / {type.name_bg}
      </option>
    ))}
  </select>
  
  {!selectedDessertTypeId && (
    <p className="text-red-500 text-sm mt-1">⚠️ Dessert type is required</p>
  )}
</div>
```

---

## Task 3: Update Save Button Validation

**File:** `Admin/app/dashboard/simple-recipes/[id]/page.tsx`

**Location:** Find the "SAVE ALL STEPS" button

**Update the button to include validation:**

```typescript
// ✅ UPDATE: Disable button if dessert type not selected
<button
  onClick={saveAllSteps}
  disabled={isSavingAll || !selectedDessertTypeId}  // ✅ Add dessert type check
  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-bold text-base transition whitespace-nowrap"
>
  {isSavingAll ? (
    <>
      <span className="inline-block animate-spin mr-2">⟳</span>
      Saving {Object.keys(stepChanges).length} steps...
    </>
  ) : !selectedDessertTypeId ? (
    '⚠️ Select Dessert Type First'  // ✅ Show message
  ) : (
    `💾 SAVE ALL STEPS`
  )}
</button>
```

---

## Task 4: Update Save Function

**File:** `Admin/app/dashboard/simple-recipes/[id]/page.tsx`

**Location:** Find the `saveAllSteps()` function

**Update it to include dessert type:**

```typescript
// ✅ UPDATE: Add dessert type to save
async function saveAllSteps() {
  try {
    // ✅ NEW: Validate dessert type
    if (!selectedDessertTypeId) {
      toast.error('Please select a dessert type');
      return;
    }

    setIsSavingAll(true);

    console.log('[Batch Save] Starting batch save for', Object.keys(stepChanges).length, 'steps');

    // Prepare all updates
    const updates = Object.entries(stepChanges).map(([stepId, changes]) => ({
      id: stepId,
      ingredient_ids: changes.ingredientIds.length > 0 ? changes.ingredientIds : null,
      equipment_needed: changes.equipmentIds.length > 0 ? changes.equipmentIds : null
    }));

    // Batch update steps
    for (const update of updates) {
      const { error } = await supabase
        .from('recipe_instruction_steps')
        .update({
          ingredient_ids: update.ingredient_ids,
          equipment_needed: update.equipment_needed
        })
        .eq('id', update.id);

      if (error) throw error;
    }

    // ✅ NEW: Also save recipe metadata + create ready_recipes entry
    const { error: recipeError } = await supabase
      .from('base_recipes')
      .update({
        lab_notes_bg: recipeLabNotesBg || null,
        lab_notes_en: recipeLabNotesEn || null
      })
      .eq('id', recipeId);

    if (recipeError) throw recipeError;

    // ✅ NEW: Create/Update ready_recipes entry
    const readyRecipePayload = {
      id: recipeId,  // Same ID as base_recipes!
      name_en: recipe?.name_en || '',
      name_bg: recipe?.name_bg || '',
      dessert_type_id: selectedDessertTypeId,
      hero_image_url: recipe?.image_url || null,
      selected_components: [{
        base_recipe_id: recipeId,
        recipe_id: recipeId,
        role: 'simple'
      }],
      published_at: new Date().toISOString(),
    };

    const { error: readyError } = await supabase
      .from('ready_recipes')
      .upsert(readyRecipePayload, {
        onConflict: 'id'
      });

    if (readyError) throw readyError;

    console.log('[Batch Save] ✓ Successfully saved all steps + ready_recipes entry');
    
    toast.success(
      `✓ Saved ${updates.length} steps + created ready recipe! Ready to go.`,
      { duration: 3000, position: 'bottom-right' }
    );

    // Reload to confirm
    await loadRecipeAndSteps();

  } catch (error: any) {
    console.error('[Batch Save] Error:', error);
    toast.error(`Failed to save: ${error.message}`);
  } finally {
    setIsSavingAll(false);
  }
}
```

---

## Task 5: Update loadRecipeAndSteps Function

**File:** `Admin/app/dashboard/simple-recipes/[id]/page.tsx`

**Location:** Find the `loadRecipeAndSteps()` function

**Add loading dessert_type_id from ready_recipes:**

```typescript
// ✅ UPDATE: Load dessert type from ready_recipes if it exists
async function loadRecipeAndSteps() {
  try {
    setLoading(true);

    // Load base recipe
    const { data: recipeData, error: recipeError } = await supabase
      .from('base_recipes')
      .select('*')
      .eq('id', recipeId)
      .eq('is_simple_recipe', true)
      .single();

    if (recipeError) throw recipeError;
    setRecipe(recipeData);
    setRecipeLabNotesBg(recipeData?.lab_notes_bg || '');
    setRecipeLabNotesEn(recipeData?.lab_notes_en || '');

    // ✅ NEW: Load dessert type from ready_recipes
    const { data: readyData } = await supabase
      .from('ready_recipes')
      .select('dessert_type_id')
      .eq('id', recipeId)
      .maybeSingle();

    if (readyData?.dessert_type_id) {
      setSelectedDessertTypeId(readyData.dessert_type_id);
      console.log('[Recipe Detail] Loaded dessert_type:', readyData.dessert_type_id);
    }

    // Load steps
    const { data: stepsData, error: stepsError } = await supabase
      .from('recipe_instruction_steps')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('step_number', { ascending: true });

    if (stepsError) throw stepsError;
    setSteps(stepsData || []);

    // Initialize batch storage
    const initialChanges: Record<string, any> = {};
    stepsData?.forEach(step => {
      initialChanges[step.id] = {
        ingredientIds: step.ingredient_ids || [],
        equipmentIds: step.equipment_needed || []
      };
    });
    setStepChanges(initialChanges);

    console.log('[Recipe Detail] Loaded recipe and', stepsData?.length, 'steps');
  } catch (error: any) {
    console.error('[Recipe Detail] Error:', error);
    alert('Failed to load recipe: ' + error.message);
  } finally {
    setLoading(false);
  }
}
```

---

## Testing Checklist

### Create New Simple Recipe

- [ ] Open admin: `/dashboard/simple-recipes/new`
- [ ] Fill in:
  - [ ] Name (EN & BG)
  - [ ] Description
  - [ ] Ingredients
  - [ ] Steps
  - [ ] Image
  - [ ] Lab notes
- [ ] **CRITICAL:** Select dessert type from dropdown
- [ ] Button text should change to "💾 SAVE ALL STEPS" (not grayed out)
- [ ] Click [SAVE ALL STEPS]
- [ ] Success: "✓ Saved X steps + created ready recipe!"

### Verify Database

```sql
-- Check base_recipes
SELECT id, is_simple_recipe FROM base_recipes 
WHERE id = '<new-id>';
-- Result: is_simple_recipe = TRUE ✅

-- Check ready_recipes (CRITICAL!)
SELECT id, dessert_type_id, selected_components 
FROM ready_recipes 
WHERE id = '<new-id>';
-- Result: Should have dessert_type_id + selected_components ✅
```

### Test in Mobile

1. Clear cache
2. Open app
3. Navigate to simple recipe
4. **Should appear immediately!** ✅
5. Should show:
   - ✅ Recipe name
   - ✅ 🏆 "От нашите сладкари" badge (or whatever)
   - ✅ Ingredients
   - ✅ Steps
   - ✅ Cooking Mode works

### Edit Existing Simple Recipe

- [ ] Open existing simple recipe
- [ ] Dessert type should be pre-selected (loaded from ready_recipes)
- [ ] Make changes
- [ ] Save
- [ ] ready_recipes should update ✅

---

## Common Issues

**Button stays grayed out:**
- Check: `selectedDessertTypeId` state is being set
- Check: Dropdown has dessert types loaded
- Check: User actually selected one

**"Select Dessert Type First" message:**
- User needs to select from dropdown
- It's a required field

**Error "Failed to save":**
- Check console for exact error
- Likely: dessert_type_id doesn't exist
- Or: selected_components format wrong

**ready_recipes doesn't get created:**
- Check: upsert syntax is correct
- Check: recipeId is correct
- Check: No permission error in logs

---

## Key Points

1. **Dessert type is REQUIRED** for simple recipes
2. **Same ID in both tables:** `base_recipes.id = ready_recipes.id`
3. **selected_components must point back:** `base_recipe_id = recipeId`
4. **Toast shows success:** "✓ Saved X steps + created ready recipe!"
5. **Mobile finds it immediately** (no need to restart)

---

## Implementation Order

1. ✅ Add state + effect (Task 1)
2. ✅ Add dropdown input (Task 2)
3. ✅ Update button validation (Task 3)
4. ✅ Update save function (Task 4)
5. ✅ Update load function (Task 5)
6. ✅ Test create new
7. ✅ Test edit existing
8. ✅ Test mobile shows recipe

---

## Expected Result

**Admin Panel:**
```
Form with new "Dessert Type" dropdown
When saved → creates BOTH:
  ✅ base_recipes (is_simple_recipe = TRUE)
  ✅ ready_recipes (with dessert_type_id + selected_components)
```

**Mobile:**
```
Simple recipe immediately visible
No cache clearing needed
Shows as normal ready recipe ✅
```

---

Ready to implement? 🚀

Execute Tasks 1-5 in order.
Test after Task 4.
Report results!