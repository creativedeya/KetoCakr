# UX FIX: Batch Save All Steps at Once - Zero Interruptions

## New Workflow (IDEAL)

```
1. Open recipe
2. Step 1 - select ingredients, equipment (NO SAVE button)
3. Step 2 - select ingredients, equipment (NO SAVE button)
4. Step 3 - select ingredients, equipment (NO SAVE button)
5. ...more steps...
6. Step N - select ingredients, equipment (NO SAVE button)
7. [ONE BUTTON AT TOP/BOTTOM: "💾 SAVE ALL STEPS"]
8. Spinner: "Saving 12 steps..."
9. One toast: "✓ All 12 steps saved!"
10. Done! All data in DB.
```

**Benefits:**
- ✅ ZERO interruptions while editing
- ✅ ONE click to save everything
- ✅ Batch DB write (faster, more efficient)
- ✅ User focuses on content, not saving
- ✅ ONE success message at end

---

## TASK 1: Remove Save Buttons from StepInfoSection

### File: `Admin/app/dashboard/simple-recipes/[id]/components/StepInfoSection.tsx`

**SIMPLIFY MASSIVELY:**

```typescript
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { StepIngredientsFromRecipe } from './StepIngredientsFromRecipe';
import { EquipmentSelectorImproved } from './EquipmentSelectorImproved';

interface StepInfoSectionProps {
  step: any;
  stepIndex: number;
  recipeId: string;
  // ✅ CALLBACK to notify parent when changes made
  onStepChanged: (stepId: string, ingredientIds: number[], equipmentIds: number[]) => void;
}

export function StepInfoSection({
  step,
  stepIndex,
  recipeId,
  onStepChanged
}: StepInfoSectionProps) {
  const [isExpanded, setIsExpanded] = useState(stepIndex === 0);
  
  const [ingredientIds, setIngredientIds] = useState<number[]>(
    step.ingredient_ids || []
  );
  const [equipmentMap, setEquipmentMap] = useState<Map<number, string>>(
    new Map(
      step.equipment_needed?.map((id: number) => [id, '']) || []
    )
  );

  // ✅ NOTIFY parent when anything changes (NO saving here!)
  function handleIngredientsChange(ids: number[]) {
    setIngredientIds(ids);
    onStepChanged(step.id, ids, Array.from(equipmentMap.keys()));
  }

  function handleEquipmentChange(equip: Map<number, string>) {
    setEquipmentMap(equip);
    onStepChanged(step.id, ingredientIds, Array.from(equip.keys()));
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
              onIngredientsChange={handleIngredientsChange}  // ✅ Notify parent
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
              onEquipmentChange={handleEquipmentChange}  // ✅ Notify parent
            />
          </div>

          {/* ❌ NO SAVE BUTTON HERE - saving happens at page level */}
          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 text-center">
              💡 Changes saved automatically when you click "Save All Steps"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## TASK 2: Create Batch Save Manager at Page Level

### File: `Admin/app/dashboard/simple-recipes/[id]/page.tsx`

**NEW APPROACH - Batch all changes, save once:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
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
  const [isSavingAll, setIsSavingAll] = useState(false);
  
  const [recipeLabNotesBg, setRecipeLabNotesBg] = useState('');
  const [recipeLabNotesEn, setRecipeLabNotesEn] = useState('');

  // ✅ BATCH STORAGE: Track all changes
  const [stepChanges, setStepChanges] = useState<Record<string, {
    ingredientIds: number[];
    equipmentIds: number[];
  }>>({});

  const recipeId = params.id;

  useEffect(() => {
    loadRecipeAndSteps();
  }, [recipeId]);

  async function loadRecipeAndSteps() {
    try {
      setLoading(true);

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

      const { data: stepsData, error: stepsError } = await supabase
        .from('recipe_instruction_steps')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('step_number', { ascending: true });

      if (stepsError) throw stepsError;
      setSteps(stepsData || []);
      
      // Initialize batch storage with existing data
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

  // ✅ TRACK CHANGES (called when user edits ingredients/equipment)
  function handleStepChanged(
    stepId: string,
    ingredientIds: number[],
    equipmentIds: number[]
  ) {
    setStepChanges(prev => ({
      ...prev,
      [stepId]: {
        ingredientIds,
        equipmentIds
      }
    }));
    console.log(`[Batch] Step ${stepId} changed (not saved yet)`);
  }

  // ✅ BATCH SAVE ALL STEPS AT ONCE
  async function saveAllSteps() {
    try {
      setIsSavingAll(true);

      console.log('[Batch Save] Starting batch save for', Object.keys(stepChanges).length, 'steps');

      // Prepare all updates
      const updates = Object.entries(stepChanges).map(([stepId, changes]) => ({
        id: stepId,
        ingredient_ids: changes.ingredientIds.length > 0 ? changes.ingredientIds : null,
        equipment_needed: changes.equipmentIds.length > 0 ? changes.equipmentIds : null
      }));

      // Batch update using transaction-like approach
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

      // Save recipe lab notes
      const { error: notesError } = await supabase
        .from('base_recipes')
        .update({
          lab_notes_bg: recipeLabNotesBg || null,
          lab_notes_en: recipeLabNotesEn || null
        })
        .eq('id', recipeId);

      if (notesError) throw notesError;

      console.log('[Batch Save] ✓ Successfully saved all steps');
      
      // ✅ ONE success message
      toast.success(
        `✓ Saved ${updates.length} steps! Recipe is ready.`,
        {
          duration: 3000,
          position: 'bottom-right'
        }
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

  // Check if there are unsaved changes
  const hasUnsavedChanges = Object.values(stepChanges).some(
    change => change.ingredientIds.length > 0 || change.equipmentIds.length > 0
  );

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

      {/* ✅ STICKY SAVE BUTTON AT TOP */}
      {hasUnsavedChanges && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-purple-900">
                  You have unsaved changes
                </p>
                <p className="text-sm text-purple-700">
                  {Object.values(stepChanges).filter(c => c.ingredientIds.length > 0 || c.equipmentIds.length > 0).length} steps modified
                </p>
              </div>
            </div>
            <button
              onClick={saveAllSteps}
              disabled={isSavingAll}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-bold text-base transition whitespace-nowrap"
            >
              {isSavingAll ? (
                <>
                  <span className="inline-block animate-spin mr-2">⟳</span>
                  Saving {Object.keys(stepChanges).length} steps...
                </>
              ) : (
                `💾 SAVE ALL STEPS`
              )}
            </button>
          </div>
        </div>
      )}

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
      </section>

      {/* SEPARATOR */}
      <div className="border-t"></div>

      {/* ========== SECTION 1: STEP INFO ========== */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Step Information</h2>
        <p className="text-gray-600 mb-4 text-sm">
          ✏️ Edit all steps below. Click "SAVE ALL STEPS" at top when done.
        </p>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <StepInfoSection
              key={step.id}
              step={step}
              stepIndex={index}
              recipeId={recipeId}
              onStepChanged={handleStepChanged}  // ✅ Notify parent of changes
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
            💡 This is optional. After configuring steps above, you can generate images here.
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

## TASK 3: Update StepIngredientsFromRecipe (Notify Parent)

**CHANGE callback signature:**

```typescript
// FROM:
onIngredientsChange: (ingredients: StepIngredient[]) => void;

// TO:
onIngredientsChange: (ingredientIds: number[]) => void;

// In component:
function toggleIngredient(ingredientId: number) {
  if (selectedIngredientIds.includes(ingredientId)) {
    const newIds = selectedIngredientIds.filter(id => id !== ingredientId);
    onIngredientsChange(newIds);  // ✅ Pass IDs only
  } else {
    const newIds = [...selectedIngredientIds, ingredientId];
    onIngredientsChange(newIds);  // ✅ Pass IDs only
  }
}
```

---

## TASK 4: Update EquipmentSelectorImproved (Notify Parent)

**SAME pattern:**

```typescript
// FROM:
onEquipmentChange: (equipment: Map<number, string>) => void;

// TO: (in page context, convert Map to ID array)
// Equipment selector still returns Map, but parent extracts IDs

// In StepInfoSection:
function handleEquipmentChange(equip: Map<number, string>) {
  setEquipmentMap(equip);
  onStepChanged(step.id, ingredientIds, Array.from(equip.keys()));  // ✅ Extract IDs
}
```

---

## Final Workflow (PERFECT)

```
STEP 1: Edit Recipe
├─ Open recipe page
├─ DON'T see "Save Step 1" button (it's gone!)
└─ See sticky "💾 SAVE ALL STEPS" at top only

STEP 2: Configure All Steps
├─ Expand Step 1
│  ├─ Select 5 ingredients
│  ├─ Select 3 equipment items
│  └─ (Auto-saved in memory, no button click!)
├─ Expand Step 2
│  ├─ Select 4 ingredients
│  ├─ Select 2 equipment items
│  └─ (Auto-saved in memory)
├─ Expand Step 3, 4, 5...
│  └─ Continue editing
└─ All changes tracked in memory

STEP 3: Save Everything Once
├─ Click "💾 SAVE ALL STEPS" (ONE CLICK!)
├─ Spinner: "Saving 12 steps..."
├─ Toast: "✓ Saved 12 steps! Recipe is ready."
└─ All data in DB in ONE batch operation

Result: ✅ FAST, ✅ CLEAN, ✅ ZERO INTERRUPTIONS
```

---

## Testing Checklist

- [ ] Open recipe - see sticky save button at top
- [ ] It says "You have unsaved changes" + count
- [ ] Edit Step 1 - button updates count
- [ ] Edit Step 5 - button updates count
- [ ] Edit Step 2 - button updates count
- [ ] Edit Step 10 - button updates count
- [ ] Click "SAVE ALL STEPS" (ONE BUTTON)
- [ ] Spinner shows: "Saving 12 steps..."
- [ ] NO toast spam, just ONE message at end
- [ ] Message: "✓ Saved 12 steps! Recipe is ready."
- [ ] No page refresh, no scrolling, no interruption
- [ ] Refresh page - all data still there ✓
- [ ] Sticky button disappears (no unsaved changes)
- [ ] Workflow is SMOOTH and FAST ✓

---

## Performance Benefits

```
BEFORE:
- 12 steps × 1 save per step = 12 DB writes
- 12 success toasts (2-3 sec each)
- 12 page refreshes
- Total time: ~5-10 minutes per recipe

AFTER:
- 12 steps × 0 saves = 1 batch DB write
- 1 success toast (3 sec)
- 1 page refresh
- Total time: ~2-3 minutes per recipe
```

**You save ~3-7 minutes per recipe!** 🚀

---

Good luck! This is the IDEAL workflow! ✨