# Phase 4.6 FINAL - Fixed Code & Reorganized Layout

## FIXES NEEDED

### Issue 1: FK Naming
**ERROR:** `column recipe_ingredients.base_recipe_id does not exist`

**REASON:** recipe_ingredients uses `recipe_id` NOT `base_recipe_id`

**FIX:** Change all queries from `base_recipe_id` to `recipe_id`

---

### Issue 2: Layout Organization
**Current (WRONG):**
```
EnhancedStepImages
├── Settings (background, angle, lighting)
├── Equipment selector
├── Image generation
└── (ingredients/notes are scattered)
```

**Desired (RIGHT):**
```
Step List Section
├── Step 1
│   ├── Description (BG/EN)
│   ├── Duration
│   ├── Ingredients (select from recipe)
│   ├── Equipment (select & notes)
│   └── [Save Info Button]
├── Step 2
│   ├── ...similar...
│   └── [Save Info Button]
│
THEN BELOW: Image Generation Section
├── Step 1 Image
│   ├── Settings
│   ├── Custom hints
│   ├── Reference image
│   ├── [Generate] [Compare] [Upload]
│   └── Large preview
├── Step 2 Image
│   ├── ...similar...
```

Why? Complete step info FIRST, then optional images.

---

## TASK 1: Fix StepIngredientsFromRecipe Component

### File: `Admin/app/dashboard/simple-recipes/components/StepIngredientsFromRecipe.tsx`

**CHANGE:**
```typescript
// FROM (WRONG):
const { data, error } = await supabase
  .from('recipe_ingredients')
  .select('*')
  .eq('base_recipe_id', recipeId)  // ❌ WRONG FK
  .order('order_index', { ascending: true });

// TO (CORRECT):
const { data, error } = await supabase
  .from('recipe_ingredients')
  .select('*')
  .eq('recipe_id', recipeId)  // ✅ CORRECT FK
  .order('order_index', { ascending: true });
```

**ALSO REMOVE:**
```typescript
// Delete this if it exists:
.eq('base_recipe_id', recipeId)

// CHANGE ALL to:
.eq('recipe_id', recipeId)
```

---

## TASK 2: Create Step Info Section Component

### File: `Admin/app/dashboard/simple-recipes/[id]/components/StepInfoSection.tsx`

**NEW COMPONENT - Combines ingredients + equipment + basic info:**

```typescript
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { StepIngredientsFromRecipe } from './StepIngredientsFromRecipe';
import { EquipmentSelectorImproved } from './EquipmentSelectorImproved';

interface RecipeStep {
  id: string;
  step_number: number;
  step_description: string;
  step_description_bg?: string;
  step_description_en?: string;
  step_duration_minutes?: number;
  ingredient_ids?: number[];
  equipment_needed?: number[];
}

interface StepInfoSectionProps {
  recipeId: string;
  step: RecipeStep;
  onStepUpdated: () => void;
}

export function StepInfoSection({
  recipeId,
  step,
  onStepUpdated
}: StepInfoSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [ingredientIds, setIngredientIds] = useState<number[]>(
    step.ingredient_ids || []
  );
  const [equipmentMap, setEquipmentMap] = useState<Map<number, string>>(
    new Map(
      step.equipment_needed?.map((id, idx) => [id, '']) || []
    )
  );

  async function saveStepInfo() {
    try {
      setIsSaving(true);

      const updates: any = {
        ingredient_ids: ingredientIds.length > 0 ? ingredientIds : null,
        equipment_needed: Array.from(equipmentMap.keys()).length > 0 
          ? Array.from(equipmentMap.keys())
          : null
      };

      const { error } = await supabase
        .from('recipe_instruction_steps')
        .update(updates)
        .eq('id', step.id);

      if (error) throw error;

      toast.success(`Step ${step.step_number} info saved`);
      onStepUpdated();
    } catch (error: any) {
      console.error('[Step Info] Error:', error);
      toast.error('Failed to save step info');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      {/* HEADER - CLICKABLE TO EXPAND/COLLAPSE */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-start justify-between p-4 hover:bg-gray-50 transition"
      >
        <div className="text-left flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            Step {step.step_number}
          </h3>
          <p className="text-gray-700 mt-1 line-clamp-2">
            {step.step_description_bg || step.step_description}
          </p>
          {step.step_duration_minutes && (
            <div className="text-xs text-gray-500 mt-1">
              ⏱️ {step.step_duration_minutes} min
            </div>
          )}
          
          {/* QUICK SUMMARY */}
          <div className="flex gap-4 mt-2 text-xs">
            {ingredientIds.length > 0 && (
              <span className="text-green-600">
                ✓ {ingredientIds.length} ingredients
              </span>
            )}
            {Array.from(equipmentMap.keys()).length > 0 && (
              <span className="text-blue-600">
                ✓ {Array.from(equipmentMap.keys()).length} equipment
              </span>
            )}
          </div>
        </div>

        <div className="text-gray-400 ml-4">
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </div>
      </button>

      {/* EXPANDED CONTENT */}
      {isExpanded && (
        <div className="border-t p-4 space-y-6 bg-gray-50">
          
          {/* BG DESCRIPTION */}
          {step.step_description_bg && (
            <div>
              <label className="text-xs font-medium text-gray-700">
                Описание (Български)
              </label>
              <p className="text-sm text-gray-800 mt-1">
                {step.step_description_bg}
              </p>
            </div>
          )}

          {/* EN DESCRIPTION */}
          {step.step_description_en && (
            <div>
              <label className="text-xs font-medium text-gray-700">
                Description (English)
              </label>
              <p className="text-sm text-gray-800 mt-1">
                {step.step_description_en}
              </p>
            </div>
          )}

          {/* INGREDIENTS */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              🥄 Съставки
            </h4>
            <StepIngredientsFromRecipe
              stepNumber={step.step_number}
              recipeId={recipeId}
              selectedIngredientIds={ingredientIds}
              onIngredientsChange={setIngredientIds}
            />
          </div>

          {/* EQUIPMENT */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              🍳 Посуда & Уреди
            </h4>
            <EquipmentSelectorImproved
              stepNumber={step.step_number}
              selectedEquipment={equipmentMap}
              onEquipmentChange={setEquipmentMap}
            />
          </div>

          {/* SAVE BUTTON */}
          <div className="border-t pt-4">
            <button
              onClick={saveStepInfo}
              disabled={isSaving}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium text-sm transition"
            >
              {isSaving ? 'Saving...' : '✓ Save Step Info'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## TASK 3: Create New Page Layout

### File: `Admin/app/dashboard/simple-recipes/[id]/page.tsx`

**REORGANIZE entire page:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { StepInfoSection } from './components/StepInfoSection';
import { EnhancedStepImages } from './EnhancedStepImages';
import { RecipeLabNotes } from './components/RecipeLabNotes';

export default function SimpleRecipeDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const [recipe, setRecipe] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [recipeLabNotesBg, setRecipeLabNotesBg] = useState('');
  const [recipeLabNotesEn, setRecipeLabNotesEn] = useState('');

  const recipeId = params.id;

  useEffect(() => {
    loadRecipeAndSteps();
  }, [recipeId]);

  async function loadRecipeAndSteps() {
    try {
      setLoading(true);

      // Load recipe
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

      // Load steps
      const { data: stepsData, error: stepsError } = await supabase
        .from('recipe_instruction_steps')
        .select('*')
        .eq('recipe_id', recipeId)  // ✅ CORRECT FK
        .order('step_number', { ascending: true });

      if (stepsError) throw stepsError;
      setSteps(stepsData || []);

      console.log('[Recipe Detail] Loaded recipe and', stepsData?.length, 'steps');
    } catch (error: any) {
      console.error('[Recipe Detail] Error:', error);
      alert('Failed to load recipe: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

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
      alert('Recipe lab notes saved');
    } catch (error: any) {
      console.error('[Lab Notes] Error:', error);
      alert('Failed to save lab notes');
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!recipe) return <div className="p-6">Recipe not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      
      {/* RECIPE HEADER */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">{recipe.name_en}</h1>
        <p className="text-lg text-gray-600 mt-2">{recipe.name_bg}</p>
        {recipe.description_en && (
          <p className="mt-4 text-gray-700">{recipe.description_en}</p>
        )}
      </div>

      {/* RECIPE LAB NOTES (OPTIONAL) */}
      <section className="border-t pt-6">
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
      <div className="border-t"></div>

      {/* ========== SECTION 1: STEP INFO ========== */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Step Information</h2>
        <div className="space-y-3">
          {steps.map(step => (
            <StepInfoSection
              key={step.id}
              recipeId={recipeId}
              step={step}
              onStepUpdated={loadRecipeAndSteps}
            />
          ))}
        </div>
      </section>

      {/* SEPARATOR */}
      <div className="border-t my-8"></div>

      {/* ========== SECTION 2: STEP IMAGES ========== */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Step-by-Step Images</h2>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <p className="text-sm text-blue-900">
            💡 Configure step information (ingredients, equipment) above first. 
            Then generate step images here for each step.
          </p>
        </div>
        
        <EnhancedStepImages
          recipeId={recipeId}
          steps={steps}
          onStepsUpdate={loadRecipeAndSteps}
        />
      </section>

      {/* SEPARATOR */}
      <div className="border-t my-8"></div>

      {/* NUTRITION */}
      {recipe.total_calories && (
        <section>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Nutrition</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {recipe.total_calories}
              </div>
              <div className="text-sm text-gray-600">Calories</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {recipe.total_protein}g
              </div>
              <div className="text-sm text-gray-600">Protein</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {recipe.total_fat}g
              </div>
              <div className="text-sm text-gray-600">Fat</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {recipe.total_net_carbs}g
              </div>
              <div className="text-sm text-gray-600">Net Carbs</div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
```

---

## TASK 4: Update EnhancedStepImages

**Remove ingredients & equipment sections** (they're now in StepInfoSection)

**Keep ONLY:**
- Settings (background, angle, lighting)
- Custom hints
- Reference image selection
- Image generation + compare mode
- Upload own image

```typescript
// In EnhancedStepImages, REMOVE:
// ❌ StepIngredientsSelector
// ❌ StepLabNotes
// ❌ EquipmentSelector

// KEEP ONLY image generation related code
```

---

## TASK 5: Fix All FKs in API Routes

### Check all simple-recipes API routes:

```bash
grep -r "base_recipe_id" /home/claude/KetoCakr/Admin/app/api/simple-recipes --include="*.ts"
```

Change all:
```typescript
// FROM:
.eq('base_recipe_id', recipeId)

// TO:
.eq('recipe_id', recipeId)
```

---

## Database Verification

```sql
-- Check correct FK
SELECT column_name, constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'recipe_ingredients';

-- Should show: recipe_id (NOT base_recipe_id)

-- Load recipe ingredients correctly
SELECT * 
FROM recipe_ingredients
WHERE recipe_id = 'your-recipe-id'
ORDER BY order_index;
```

---

## Final Page Layout

```
┌─────────────────────────────────┐
│ Recipe Title                    │
├─────────────────────────────────┤
│ Recipe Lab Notes (optional)     │
├─────────────────────────────────┤
│ [SECTION 1: STEP INFO]          │
│ ▼ Step 1                        │
│   • Description (BG/EN)         │
│   • Duration                    │
│   • ✓ Ingredients selector      │
│   • ✓ Equipment selector        │
│   • [Save Step Info]            │
│ ▼ Step 2                        │
│   ...similar...                 │
├─────────────────────────────────┤
│ [SECTION 2: STEP IMAGES]        │
│ ▼ Step 1 Image                  │
│   • Settings (background, etc)  │
│   • Custom hints                │
│   • Reference image             │
│   • [Generate] [Compare]        │
│   • Large preview               │
│ ▼ Step 2 Image                  │
│   ...similar...                 │
└─────────────────────────────────┘
```

---

## Testing Checklist

- [ ] Open simple recipe
- [ ] See Step 1 collapsed header
- [ ] Click Step 1 to expand
- [ ] See description (BG/EN), duration
- [ ] See quick summary (0 ingredients, 0 equipment)
- [ ] Expand Ingredients section
- [ ] Select 3 ingredients
- [ ] Expand Equipment section
- [ ] Select 2 equipment items
- [ ] Click "Save Step Info"
- [ ] Success message
- [ ] Collapse Step 1
- [ ] Header now shows "✓ 3 ingredients ✓ 2 equipment"
- [ ] Click Step 2 to expand
- [ ] (repeat for another step)
- [ ] Scroll down to "Step-by-Step Images"
- [ ] EnhancedStepImages shows (no ingredients/equipment clutter)
- [ ] Generate image for Step 1
- [ ] See large preview
- [ ] Image generation works ✓

---

## Summary

**What's Fixed:**

✅ FK corrected: `recipe_id` (not `base_recipe_id`)
✅ Layout reorganized: Step Info first, then Images
✅ Removed duplication: Ingredients/Equipment removed from EnhancedStepImages
✅ Better UX: Complete step setup ONCE, then optional images
✅ Expandable headers: Quick summary visible, click to edit

**Workflow:**
```
1. Expand Step 1
2. Select ingredients
3. Select equipment
4. Save Step Info
5. Collapse Step 1
6. Repeat for Steps 2-N
7. Then go to Step Images section
8. Generate images (optional)
9. Done!
```

No need to jump back and forth! ✨

---

Good luck! 🎯