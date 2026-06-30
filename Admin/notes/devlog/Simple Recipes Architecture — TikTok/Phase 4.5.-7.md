# Phase 4.6 CORRECTED: Step Ingredients Selection & Recipe Lab Notes

## Corrected Architecture

### What We Actually Need

**For EACH STEP:**
- ✅ Select from RECIPE ingredients (already exist in recipe_ingredients)
- ✅ Mark which ingredients are used in THIS step
- ❌ NOT new step-level ingredients (we have them on recipe!)
- ❌ NOT step-level notes (instruction_text is the note!)

**For RECIPE:**
- ✅ Lab Notes (ONE TIME, recipe-level)
- ✅ BG + EN translations
- ✅ Upsell notes, corrections, alternatives
- ✅ Only when NECESSARY

---

## Database Structure

### Recipe Ingredients (Already Exist)
```
recipe_ingredients:
├── id
├── base_recipe_id (FK)
├── ingredient_database_id (FK)
├── ingredient_name
├── quantity
├── unit
└── order_index
```

### Step-to-Ingredients Linking (NEW - SIMPLE)
```
recipe_instruction_steps ADD COLUMN:
├── ingredient_ids INTEGER[]
│   └── Array of recipe_ingredients.id used in THIS step
│   └── Example: [1, 3, 5]  (IDs from recipe_ingredients table)
```

### Recipe Lab Notes (NEW - OPTIONAL)
```
base_recipes ADD COLUMNS:
├── lab_notes_bg TEXT
│   └── Bulgarian уточнения, наблюдения, tips за рецептата
├── lab_notes_en TEXT
│   └── English translations
└── source_notes TEXT
    └── If recipe from source, attribution/notes
```

---

## TASK 1: Check/Add Database Columns

### Check recipe_instruction_steps:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'recipe_instruction_steps'
AND column_name = 'ingredient_ids';
```

If NOT exists:
```sql
ALTER TABLE recipe_instruction_steps
ADD COLUMN ingredient_ids INTEGER[] DEFAULT NULL;

COMMENT ON COLUMN recipe_instruction_steps.ingredient_ids IS 'Array of recipe_ingredients.id used in this specific step';
```

### Check base_recipes:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'base_recipes'
AND column_name IN ('lab_notes_bg', 'lab_notes_en');
```

If NOT exists:
```sql
ALTER TABLE base_recipes
ADD COLUMN lab_notes_bg TEXT;
ADD COLUMN lab_notes_en TEXT;

COMMENT ON COLUMN base_recipes.lab_notes_bg IS 'Recipe-level tips, observations, warnings in Bulgarian';
COMMENT ON COLUMN base_recipes.lab_notes_en IS 'Recipe-level tips, observations, warnings in English';
```

---

## TASK 2: Create Step Ingredients Selector (FROM RECIPE INGREDIENTS)

### File: `Admin/app/dashboard/simple-recipes/components/StepIngredientsFromRecipe.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface RecipeIngredient {
  id: number;
  ingredient_name: string;
  quantity: number;
  unit: string;
  ingredient_database_id?: number;
}

interface StepIngredientsFromRecipeProps {
  stepNumber: number;
  recipeId: string;
  selectedIngredientIds: number[];
  onIngredientsChange: (ingredientIds: number[]) => void;
}

export function StepIngredientsFromRecipe({
  stepNumber,
  recipeId,
  selectedIngredientIds,
  onIngredientsChange
}: StepIngredientsFromRecipeProps) {
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipeIngredients();
  }, [recipeId]);

  async function loadRecipeIngredients() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recipe_ingredients')
        .select('*')
        .eq('base_recipe_id', recipeId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setRecipeIngredients(data || []);
      console.log('[Step Ingredients] Loaded', data?.length, 'recipe ingredients');
    } catch (error: any) {
      console.error('[Step Ingredients] Error:', error);
    } finally {
      setLoading(false);
    }
  }

  function toggleIngredient(ingredientId: number) {
    if (selectedIngredientIds.includes(ingredientId)) {
      onIngredientsChange(
        selectedIngredientIds.filter(id => id !== ingredientId)
      );
    } else {
      onIngredientsChange([...selectedIngredientIds, ingredientId]);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <Loader2 className="animate-spin" size={16} />
        <span>Loading recipe ingredients...</span>
      </div>
    );
  }

  if (recipeIngredients.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-900">
        ⚠️ No ingredients in this recipe yet. Add them on the recipe level first.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-900">
        Кои съставки се използват в Step {stepNumber}?
      </div>

      <div className="space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto">
        {recipeIngredients.map(ing => (
          <label key={ing.id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded transition">
            <input
              type="checkbox"
              checked={selectedIngredientIds.includes(ing.id)}
              onChange={() => toggleIngredient(ing.id)}
              className="w-4 h-4 rounded text-purple-600 cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-sm">{ing.ingredient_name}</div>
              <div className="text-xs text-gray-500">
                {ing.quantity} {ing.unit}
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* SELECTED SUMMARY */}
      {selectedIngredientIds.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 p-2 rounded text-xs text-purple-900">
          ✓ {selectedIngredientIds.length}/{recipeIngredients.length} съставки избрани за Step {stepNumber}
        </div>
      )}

      {/* INFO */}
      <div className="bg-blue-50 border border-blue-200 p-2 rounded text-xs text-blue-900">
        💡 Чекирайте съставките които влизат в тази конкретна стъпка. 
        Това помага за визуално представяне и shopping list.
      </div>
    </div>
  );
}
```

---

## TASK 3: Create Recipe Lab Notes Editor (RECIPE-LEVEL)

### File: `Admin/app/dashboard/simple-recipes/components/RecipeLabNotes.tsx`

```typescript
'use client';

import { useState } from 'react';

interface RecipeLabNotesProps {
  notesBg: string;
  notesEn: string;
  onNotesChange: (notesBg: string, notesEn: string) => void;
}

export function RecipeLabNotes({
  notesBg,
  notesEn,
  onNotesChange
}: RecipeLabNotesProps) {
  const [activeTab, setActiveTab] = useState<'bg' | 'en'>('bg');

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900">
          📝 Lab Notes за Рецептата
        </span>
        <span className="text-xs text-gray-500">
          (само ако е необходимо уточнение)
        </span>
      </div>

      {/* TAB SELECTION */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('bg')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'bg'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          На Български
        </button>
        <button
          onClick={() => setActiveTab('en')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'en'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          In English
        </button>
      </div>

      {/* BULGARIAN NOTES */}
      {activeTab === 'bg' && (
        <textarea
          value={notesBg}
          onChange={(e) => onNotesChange(e.target.value, notesEn)}
          placeholder="Напр: 'Яйцата трябва да са стайна температура за по-добра емулсификация. Внимание: НЕ миксирайте прекалено много - рискувате да развалите меренгата.'"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm font-mono"
        />
      )}

      {/* ENGLISH NOTES */}
      {activeTab === 'en' && (
        <textarea
          value={notesEn}
          onChange={(e) => onNotesChange(notesBg, e.target.value)}
          placeholder="E.g: 'Eggs must be room temperature for better emulsification. Warning: Do not overmix - you risk breaking the meringue.'"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm font-mono"
        />
      )}

      {/* CHARACTER COUNT */}
      <div className="text-xs text-gray-500">
        {activeTab === 'bg' ? notesBg.length : notesEn.length} символа
      </div>

      {/* INFO */}
      <div className="bg-blue-50 border border-blue-200 p-2 rounded text-xs text-blue-900">
        💡 Lab notes се показват в информацията за рецептата. Използвайте за:
        <br />• Уточнения за техниката
        <br />• Предупреждения (не миксирайте много, не прегрявайте, и т.н.)
        <br />• Алтернативи на съставки
        <br />• Съвети за съхранение
      </div>
    </div>
  );
}
```

---

## TASK 4: Update Page Layout

### Update: `Admin/app/dashboard/simple-recipes/[id]/page.tsx`

Add at top level (BEFORE the steps section):

```typescript
'use client';

import { RecipeLabNotes } from './components/RecipeLabNotes';
import { useState } from 'react';

// In component state:
const [recipeLabNotesBg, setRecipeLabNotesBg] = useState(recipe?.lab_notes_bg || '');
const [recipeLabNotesEn, setRecipeLabNotesEn] = useState(recipe?.lab_notes_en || '');

// Save function:
async function saveRecipeLabNotes() {
  try {
    const { error } = await supabase
      .from('base_recipes')
      .update({
        lab_notes_bg: recipeLabNotesBg || null,
        lab_notes_en: recipeLabNotesEn || null
      })
      .eq('id', recipeId);

    if (error) throw error;
    toast.success('Recipe lab notes saved');
  } catch (error: any) {
    console.error('[Recipe Lab Notes] Error:', error);
    toast.error('Failed to save lab notes');
  }
}

// In JSX (add BEFORE steps section):

{/* RECIPE LAB NOTES */}
<section className="border-t pt-6 mt-6">
  <RecipeLabNotes
    notesBg={recipeLabNotesBg}
    notesEn={recipeLabNotesEn}
    onNotesChange={(bg, en) => {
      setRecipeLabNotesBg(bg);
      setRecipeLabNotesEn(en);
    }}
  />
  <button
    onClick={saveRecipeLabNotes}
    className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm"
  >
    Save Recipe Lab Notes
  </button>
</section>

{/* SEPARATOR */}
<div className="border-t my-8"></div>

{/* STEPS SECTION */}
<section>
  <h2 className="text-2xl font-bold mb-4">Steps with Images</h2>
  {/* EnhancedStepImages component here */}
</section>
```

---

## TASK 5: Update EnhancedStepImages for Step Ingredients

### Update: `Admin/app/dashboard/simple-recipes/[id]/EnhancedStepImages.tsx`

```typescript
import { StepIngredientsFromRecipe } from './StepIngredientsFromRecipe';

// In component state:
const [stepIngredientIds, setStepIngredientIds] = useState<{
  [stepNumber: number]: number[]
}>(() => {
  const initial: { [key: number]: number[] } = {};
  steps.forEach(step => {
    // Parse ingredient_ids from DB
    const ids = step.ingredient_ids ? (Array.isArray(step.ingredient_ids) ? step.ingredient_ids : JSON.parse(step.ingredient_ids)) : [];
    initial[step.step_number] = ids;
  });
  return initial;
});

// Save function:
async function saveStepIngredients(stepNumber: number) {
  const step = steps.find(s => s.step_number === stepNumber);
  if (!step?.id) return;

  const ingredientIds = stepIngredientIds[stepNumber] || [];

  try {
    console.log('[Step Ingredients] Saving for step', stepNumber, ':', ingredientIds);

    const { error } = await supabase
      .from('recipe_instruction_steps')
      .update({
        ingredient_ids: ingredientIds.length > 0 ? ingredientIds : null
      })
      .eq('id', step.id);

    if (error) throw error;

    console.log('[Step Ingredients] Saved successfully');
    toast.success(`${ingredientIds.length} ingredients linked to step ${stepNumber}`);
  } catch (error: any) {
    console.error('[Step Ingredients] Error:', error);
    toast.error('Failed to save step ingredients');
  }
}

// In JSX (add to step rendering, BEFORE image section):

{/* STEP INGREDIENTS FROM RECIPE */}
<div className="border-t pt-6 mt-6">
  <StepIngredientsFromRecipe
    stepNumber={step.step_number}
    recipeId={recipeId}
    selectedIngredientIds={stepIngredientIds[step.step_number] || []}
    onIngredientsChange={(ids) =>
      setStepIngredientIds(prev => ({
        ...prev,
        [step.step_number]: ids
      }))
    }
  />
  <button
    onClick={() => saveStepIngredients(step.step_number)}
    className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm"
  >
    Save Step Ingredients
  </button>
</div>

{/* SETTINGS, EQUIPMENT, IMAGE SECTIONS ... */}
```

---

## Database Structure (FINAL)

```sql
-- recipe_ingredients (ALREADY EXISTS)
SELECT * FROM recipe_ingredients 
WHERE base_recipe_id = 'recipe-id'
ORDER BY order_index;

-- recipe_instruction_steps (ADD ingredient_ids)
ALTER TABLE recipe_instruction_steps
ADD COLUMN ingredient_ids INTEGER[] DEFAULT NULL;

-- base_recipes (ADD lab_notes)
ALTER TABLE base_recipes
ADD COLUMN lab_notes_bg TEXT;
ADD COLUMN lab_notes_en TEXT;
```

---

## Testing Workflow

### 1. Recipe Setup
```
Recipe: "Chocolate Cake"
├── Ingredients (recipe-level):
│   ├── ID 1: Flour 200g
│   ├── ID 2: Sugar 100g
│   ├── ID 3: Eggs 3 pieces
│   ├── ID 4: Cocoa 50g
│   └── ID 5: Butter 100g
│
└── Lab Notes (recipe-level):
    ├── BG: "Яйцата трябва да са стайна температура..."
    └── EN: "Eggs must be room temperature..."
```

### 2. Step 1: "Mix dry ingredients"
```
SELECT ingredients: [Flour, Sugar, Cocoa] ✓
Skip: [Eggs, Butter]
ingredient_ids = [1, 2, 4]
```

### 3. Step 2: "Cream butter and eggs"
```
SELECT ingredients: [Eggs, Butter] ✓
Skip: [Flour, Sugar, Cocoa]
ingredient_ids = [3, 5]
```

### 4. Database Verification
```sql
-- Check recipe ingredients
SELECT id, ingredient_name, quantity, unit
FROM recipe_ingredients
WHERE base_recipe_id = 'recipe-id'
ORDER BY order_index;

-- Check step ingredients
SELECT step_number, ingredient_ids
FROM recipe_instruction_steps
WHERE base_recipe_id = 'recipe-id'
ORDER BY step_number;

-- Check lab notes
SELECT lab_notes_bg, lab_notes_en
FROM base_recipes
WHERE id = 'recipe-id';
```

---

## Testing Checklist

- [ ] Open simple recipe
- [ ] Scroll to Recipe Lab Notes (top, before steps)
- [ ] Add BG note: "Яйцата трябва да са хладни"
- [ ] Switch to EN tab
- [ ] Add EN note: "Eggs must be cold"
- [ ] Click "Save Recipe Lab Notes"
- [ ] See success toast
- [ ] Go to Step 1
- [ ] See recipe ingredients list (all 5 items)
- [ ] Check 2 ingredients for Step 1
- [ ] Click "Save Step Ingredients"
- [ ] Success toast shows "2 ingredients linked"
- [ ] Go to Step 2
- [ ] Check different ingredients
- [ ] Go back to Step 1
- [ ] Step 1 ingredients still checked ✅
- [ ] Refresh page
- [ ] All data persists ✅

---

## Summary

**What Changed:**

❌ Removed: Step-level ingredient creation (confusing, redundant)
✅ Added: SELECT existing recipe ingredients for each step
✅ Added: Recipe-level lab notes (ONE TIME, at recipe level)

**Why Better:**

1. ✅ Use EXISTING recipe ingredients (no duplication)
2. ✅ Just mark which ones are used in THIS step
3. ✅ Lab notes are RECIPE-level (not per-step)
4. ✅ Much simpler workflow
5. ✅ Matches actual usage pattern

**Data Flow:**

```
Recipe has ingredients: [Flour, Sugar, Eggs, Cocoa, Butter]
  ↓
Step 1: Select [Flour, Sugar, Cocoa]
Step 2: Select [Eggs, Butter]
  ↓
Save ingredient_ids to recipe_instruction_steps
  ↓
Mobile app shows:
  Step 1: "Mix dry ingredients (Flour, Sugar, Cocoa)"
  Step 2: "Cream butter with eggs (Eggs, Butter)"
  + Lab notes: "Яйцата трябва да са хладни..."
```

---

## Reports to Provide

1. **Screenshot of Recipe Lab Notes** (BG/EN tabs)
2. **Screenshot of Step Ingredients selector** (checkboxes from recipe)
3. **Screenshot after save** (success toast)
4. **Database verification:**
   ```sql
   SELECT step_number, ingredient_ids FROM recipe_instruction_steps;
   SELECT lab_notes_bg, lab_notes_en FROM base_recipes;
   ```
5. **Workflow test** (refresh, data persists)

---

This is MUCH simpler and makes WAY more sense! 🎯✨