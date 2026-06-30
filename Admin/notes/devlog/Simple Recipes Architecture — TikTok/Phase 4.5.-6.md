# Phase 4.6: Add Ingredients & Lab Notes Management to Simple Recipe Steps

## Current Status

**Simple Recipes Steps Currently Have:**
- ✅ Step description (BG/EN)
- ✅ Settings (background, angle, lighting)
- ✅ Equipment selection
- ✅ Image generation with AI
- ❌ **MISSING:** Ingredients used in THIS step
- ❌ **MISSING:** Lab notes for THIS step

**Base Recipes Have (for reference):**
- ✅ Recipe-level ingredients (recipe_ingredients table)
- ❌ No per-step ingredients OR lab notes

**What we need:**
- Add per-step ingredients (which ingredients used in which step)
- Add per-step lab notes (tips, tricks, observations)

---

## Architecture Decision

### Simple Recipes Step Ingredients/Notes

```
recipe_instruction_steps columns (ADDITIONS):
├── step_ingredients TEXT[] or JSONB
│   └── Array of ingredient_database_id + quantity used in this step
├── lab_notes_bg TEXT
│   └── Bulgarian tips, tricks, observations
└── lab_notes_en TEXT
    └── English translation
```

**Example:**
```
Step 1: "Mix eggs and cocoa"
├── Ingredients: [
│     {ingredient_id: 5, quantity: 3, unit: "piece"},
│     {ingredient_id: 12, quantity: 50, unit: "g"}
│   ]
├── Lab Notes BG: "Яйцата трябва да са стайна температура за по-добра емулсификация"
└── Lab Notes EN: "Eggs must be room temperature for better emulsification"
```

---

## TASK 1: Check/Add Database Columns

### Verify columns exist:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'recipe_instruction_steps'
AND column_name IN ('step_ingredients', 'lab_notes_bg', 'lab_notes_en')
ORDER BY column_name;
```

### If columns DON'T exist, add them:

```sql
-- Add step-level ingredients reference
ALTER TABLE recipe_instruction_steps
ADD COLUMN step_ingredients JSONB DEFAULT NULL;

-- Add lab notes in Bulgarian
ALTER TABLE recipe_instruction_steps
ADD COLUMN lab_notes_bg TEXT;

-- Add lab notes in English
ALTER TABLE recipe_instruction_steps
ADD COLUMN lab_notes_en TEXT;

-- Add comments
COMMENT ON COLUMN recipe_instruction_steps.step_ingredients IS 'JSON array of {ingredient_id, quantity, unit} used in this specific step';
COMMENT ON COLUMN recipe_instruction_steps.lab_notes_bg IS 'Bulgarian tips, tricks, observations, warnings for this step';
COMMENT ON COLUMN recipe_instruction_steps.lab_notes_en IS 'English translation of lab notes';

-- Verify
SELECT column_name FROM information_schema.columns
WHERE table_name = 'recipe_instruction_steps'
ORDER BY ordinal_position;
```

---

## TASK 2: Create Step Ingredients Component

### File: `Admin/app/dashboard/simple-recipes/components/StepIngredientsSelector.tsx`

```typescript
'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';

interface StepIngredient {
  ingredient_id: number;
  ingredient_name: string;
  quantity: number;
  unit: string;
}

interface IngredientDatabase {
  id: number;
  name: string;
  name_bg: string;
  name_en: string | null;
  calories_per_100g: number | null;
}

interface StepIngredientsSelectorProps {
  stepNumber: number;
  ingredients: StepIngredient[];
  onIngredientsChange: (ingredients: StepIngredient[]) => void;
}

export function StepIngredientsSelector({
  stepNumber,
  ingredients,
  onIngredientsChange
}: StepIngredientsSelectorProps) {
  const [allIngredients, setAllIngredients] = useState<IngredientDatabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadIngredients();
  }, []);

  async function loadIngredients() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ingredients_database')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setAllIngredients(data || []);
    } catch (error: any) {
      console.error('[Step Ingredients] Error:', error);
      toast.error('Failed to load ingredients');
    } finally {
      setLoading(false);
    }
  }

  const filteredIngredients = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return allIngredients
      .filter(ing => 
        ing.name.toLowerCase().includes(query) ||
        ing.name_bg.toLowerCase().includes(query) ||
        (ing.name_en && ing.name_en.toLowerCase().includes(query))
      )
      .slice(0, 10);  // Limit to 10 results
  }, [searchQuery, allIngredients]);

  function addIngredient(ingredientId: number) {
    const ingredient = allIngredients.find(i => i.id === ingredientId);
    if (!ingredient) return;

    // Don't add duplicate
    if (ingredients.some(i => i.ingredient_id === ingredientId)) {
      toast.warning('This ingredient is already added');
      return;
    }

    const newIngredient: StepIngredient = {
      ingredient_id: ingredientId,
      ingredient_name: ingredient.name,
      quantity: 100,
      unit: 'g'
    };

    onIngredientsChange([...ingredients, newIngredient]);
    setSearchQuery('');
    setShowDropdown(false);
  }

  function removeIngredient(ingredientId: number) {
    onIngredientsChange(
      ingredients.filter(ing => ing.ingredient_id !== ingredientId)
    );
  }

  function updateIngredient(ingredientId: number, quantity: number, unit: string) {
    const updated = ingredients.map(ing =>
      ing.ingredient_id === ingredientId
        ? { ...ing, quantity, unit }
        : ing
    );
    onIngredientsChange(updated);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <Loader2 className="animate-spin" size={16} />
        <span>Loading ingredients...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-900">
        Съставки за Step {stepNumber}
      </div>

      {/* ADD INGREDIENT */}
      <div className="relative">
        <input
          type="text"
          placeholder="Търси съставка (мука, яйцо, захар...)..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
        />

        {/* Dropdown */}
        {showDropdown && filteredIngredients.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            {filteredIngredients.map(ing => (
              <button
                key={ing.id}
                onClick={() => addIngredient(ing.id)}
                className="w-full text-left px-3 py-2 hover:bg-purple-50 border-b border-gray-200 last:border-b-0 text-sm"
              >
                <div className="font-medium text-gray-900">{ing.name}</div>
                <div className="text-xs text-gray-500">{ing.name_bg}</div>
              </button>
            ))}
          </div>
        )}

        {showDropdown && searchQuery && filteredIngredients.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg p-3 text-sm text-gray-500">
            No results found
          </div>
        )}
      </div>

      {/* SELECTED INGREDIENTS */}
      <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
        {ingredients.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            Добавете съставки за тази стъпка...
          </div>
        ) : (
          ingredients.map(ing => (
            <div key={ing.ingredient_id} className="bg-white p-2 rounded border border-gray-200 flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm">{ing.ingredient_name}</div>
              </div>

              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={ing.quantity}
                  onChange={(e) => updateIngredient(ing.ingredient_id, parseFloat(e.target.value) || 0, ing.unit)}
                  className="w-12 px-1 py-1 border border-gray-300 rounded text-xs"
                />
                <select
                  value={ing.unit}
                  onChange={(e) => updateIngredient(ing.ingredient_id, ing.quantity, e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-xs"
                >
                  <option>g</option>
                  <option>ml</option>
                  <option>piece</option>
                  <option>tbsp</option>
                  <option>tsp</option>
                </select>
              </div>

              <button
                onClick={() => removeIngredient(ing.ingredient_id)}
                className="text-red-600 hover:text-red-700 p-1"
              >
                <X size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* SUMMARY */}
      {ingredients.length > 0 && (
        <div className="text-xs text-gray-600">
          ✓ {ingredients.length} съставк{ingredients.length === 1 ? 'а' : 'и'} избрани
        </div>
      )}
    </div>
  );
}
```

---

## TASK 3: Create Lab Notes Component

### File: `Admin/app/dashboard/simple-recipes/components/StepLabNotes.tsx`

```typescript
'use client';

interface StepLabNotesProps {
  stepNumber: number;
  notesBg: string;
  notesEn: string;
  onNotesChange: (notesBg: string, notesEn: string) => void;
}

export function StepLabNotes({
  stepNumber,
  notesBg,
  notesEn,
  onNotesChange
}: StepLabNotesProps) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-900">
        📝 Lab Notes за Step {stepNumber}
      </div>

      {/* Bulgarian Notes */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          На Български
        </label>
        <textarea
          value={notesBg}
          onChange={(e) => onNotesChange(e.target.value, notesEn)}
          placeholder="Съвети, трикове, наблюдения, предупреждения... (БГ)"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm font-mono"
        />
      </div>

      {/* English Notes */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          На Английски
        </label>
        <textarea
          value={notesEn}
          onChange={(e) => onNotesChange(notesBg, e.target.value)}
          placeholder="Tips, tricks, observations, warnings... (EN)"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm font-mono"
        />
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 p-2 rounded text-xs text-blue-900">
        💡 Lab notes могат да включват техники, опасности, алтернативи.
        Ще бъдат видими в мобилната версия при cooking mode.
      </div>
    </div>
  );
}
```

---

## TASK 4: Integrate into EnhancedStepImages

### Update: `Admin/app/dashboard/simple-recipes/[id]/EnhancedStepImages.tsx`

Add at the top:

```typescript
import { StepIngredientsSelector } from './StepIngredientsSelector';
import { StepLabNotes } from './StepLabNotes';

// In component state:
const [stepIngredients, setStepIngredients] = useState<{
  [stepNumber: number]: StepIngredient[]
}>(() => {
  const initial: { [key: number]: StepIngredient[] } = {};
  steps.forEach(step => {
    // Parse step_ingredients from DB if it exists
    const parsed = step.step_ingredients ? JSON.parse(step.step_ingredients) : [];
    initial[step.step_number] = parsed;
  });
  return initial;
});

const [stepLabNotes, setStepLabNotes] = useState<{
  [stepNumber: number]: { bg: string; en: string }
}>(() => {
  const initial: { [key: number]: { bg: string; en: string } } = {};
  steps.forEach(step => {
    initial[step.step_number] = {
      bg: step.lab_notes_bg || '',
      en: step.lab_notes_en || ''
    };
  });
  return initial;
});

// Save functions:
async function saveStepIngredients(stepNumber: number) {
  const step = steps.find(s => s.step_number === stepNumber);
  if (!step?.id) return;

  const ingredients = stepIngredients[stepNumber] || [];

  try {
    const { error } = await supabase
      .from('recipe_instruction_steps')
      .update({
        step_ingredients: ingredients.length > 0 ? JSON.stringify(ingredients) : null
      })
      .eq('id', step.id);

    if (error) throw error;
    toast.success('Ingredients saved');
  } catch (error: any) {
    console.error('[Step Ingredients] Error:', error);
    toast.error('Failed to save ingredients');
  }
}

async function saveStepLabNotes(stepNumber: number) {
  const step = steps.find(s => s.step_number === stepNumber);
  if (!step?.id) return;

  const notes = stepLabNotes[stepNumber] || { bg: '', en: '' };

  try {
    const { error } = await supabase
      .from('recipe_instruction_steps')
      .update({
        lab_notes_bg: notes.bg || null,
        lab_notes_en: notes.en || null
      })
      .eq('id', step.id);

    if (error) throw error;
    toast.success('Lab notes saved');
  } catch (error: any) {
    console.error('[Step Lab Notes] Error:', error);
    toast.error('Failed to save lab notes');
  }
}
```

In JSX, add after equipment section:

```typescript
{/* INGREDIENTS FOR THIS STEP */}
<div className="border-t pt-6 mt-6">
  <h4 className="text-sm font-semibold text-gray-900 mb-3">
    🥄 Съставки за Step {step.step_number}
  </h4>
  <StepIngredientsSelector
    stepNumber={step.step_number}
    ingredients={stepIngredients[step.step_number] || []}
    onIngredientsChange={(ing) => 
      setStepIngredients(prev => ({
        ...prev,
        [step.step_number]: ing
      }))
    }
  />
  <button
    onClick={() => saveStepIngredients(step.step_number)}
    className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm"
  >
    Save Ingredients
  </button>
</div>

{/* LAB NOTES FOR THIS STEP */}
<div className="border-t pt-6 mt-6">
  <StepLabNotes
    stepNumber={step.step_number}
    notesBg={stepLabNotes[step.step_number]?.bg || ''}
    notesEn={stepLabNotes[step.step_number]?.en || ''}
    onNotesChange={(bg, en) =>
      setStepLabNotes(prev => ({
        ...prev,
        [step.step_number]: { bg, en }
      }))
    }
  />
  <button
    onClick={() => saveStepLabNotes(step.step_number)}
    className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm"
  >
    Save Lab Notes
  </button>
</div>
```

---

## TASK 5: Verify Database & Test

### Database Check

```sql
-- Check columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'recipe_instruction_steps'
ORDER BY ordinal_position;

-- Check structure of a step
SELECT 
  step_number,
  step_description,
  step_ingredients,
  lab_notes_bg,
  lab_notes_en
FROM recipe_instruction_steps
WHERE base_recipe_id = 'your-simple-recipe-id'
LIMIT 3;
```

### Testing Checklist

- [ ] Open simple recipe
- [ ] Go to Step 1
- [ ] See "Съставки за Step 1" section
- [ ] Search and add "мука" (flour)
- [ ] Set quantity: 200g
- [ ] Add another ingredient
- [ ] Click "Save Ingredients"
- [ ] See success toast
- [ ] Go to Step 2
- [ ] Go back to Step 1
- [ ] Ingredients still there ✅

- [ ] Add lab notes: "Гремки трябва да са хладни"
- [ ] Add English: "Whips must be cold"
- [ ] Click "Save Lab Notes"
- [ ] Refresh page
- [ ] Notes still there ✅

### Database Verification

```sql
-- Check ingredients saved
SELECT 
  step_number,
  step_ingredients::text
FROM recipe_instruction_steps
WHERE base_recipe_id = 'your-simple-recipe-id'
LIMIT 5;

-- Check lab notes saved
SELECT 
  step_number,
  lab_notes_bg,
  lab_notes_en
FROM recipe_instruction_steps
WHERE base_recipe_id = 'your-simple-recipe-id'
LIMIT 5;
```

---

## Summary

**What you're adding:**

✅ Step-level ingredients (not recipe-level)
✅ Step-level lab notes (BG/EN)
✅ Searchable ingredient selector
✅ Quantity + unit per ingredient
✅ Lab notes visible in cooking mode (future)

**Data Structure:**

```json
step_ingredients: [
  {
    "ingredient_id": 12,
    "ingredient_name": "Мука за торти",
    "quantity": 200,
    "unit": "g"
  },
  {
    "ingredient_id": 5,
    "ingredient_name": "Яйцо",
    "quantity": 3,
    "unit": "piece"
  }
]

lab_notes_bg: "Гремките трябва да са хладни за по-добра емулсификация"
lab_notes_en: "Whips must be cold for better emulsification"
```

---

## Reports to Provide

1. **Screenshot of ingredients selector** (search + dropdown)
2. **Screenshot with 3+ ingredients** (quantity, unit)
3. **Screenshot of lab notes** (BG/EN fields)
4. **Screenshot after save** (success toast)
5. **Database verification** (ingredients + lab notes in DB)
6. **Page refresh test** (data persists)

---

Good luck! 🎯