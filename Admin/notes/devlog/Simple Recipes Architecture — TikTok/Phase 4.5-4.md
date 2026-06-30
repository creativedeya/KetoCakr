# Phase 4.5.4: Equipment Management for Simple Recipe Steps

## Goal
Add equipment/dishes selection to each cooking step in simple recipes.
Clone the exact workflow from base_recipes.

Admin can:
- ✅ Select required equipment per step (checkboxes)
- ✅ Add notes to equipment (e.g., "20cm", "electric mixer")
- ✅ Equipment linked to step via recipe_instruction_steps.equipment_needed
- ✅ Equipment shows in mobile cooking mode
- ✅ Shopping list includes equipment reminders

---

## Database: equipment_needed Column

Check if `recipe_instruction_steps` has `equipment_needed` column:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'recipe_instruction_steps' 
AND column_name = 'equipment_needed';
```

Expected: 
- Column name: `equipment_needed`
- Data type: `integer[]` (array of equipment IDs)

If NOT exists, create it:

```sql
ALTER TABLE recipe_instruction_steps
ADD COLUMN equipment_needed INTEGER[] DEFAULT NULL;

-- Add index for performance
CREATE INDEX idx_recipe_steps_equipment 
ON recipe_instruction_steps USING GIN (equipment_needed);
```

---

## TASK 1: Create Equipment Selector Component

### File: `Admin/app/dashboard/simple-recipes/components/EquipmentSelector.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Equipment {
  id: number;
  slug: string;
  name: string;
  name_en: string | null;
  icon: string | null;
  category: string | null;
  reference_image_url?: string | null;
}

interface EquipmentSelectorProps {
  stepNumber: number;
  selectedEquipment: Map<number, string>;  // equipment_id -> notes
  onEquipmentChange: (equipment: Map<number, string>) => void;
}

export function EquipmentSelector({
  stepNumber,
  selectedEquipment,
  onEquipmentChange
}: EquipmentSelectorProps) {
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadEquipment();
  }, []);

  async function loadEquipment() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      setAllEquipment(data || []);
      console.log('[Equipment Selector] Loaded', data?.length, 'equipment items');
    } catch (error: any) {
      console.error('[Equipment Selector] Error:', error);
      toast.error('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  }

  function toggleEquipment(equipmentId: number) {
    const newMap = new Map(selectedEquipment);
    if (newMap.has(equipmentId)) {
      newMap.delete(equipmentId);
    } else {
      newMap.set(equipmentId, '');  // Initialize with empty notes
    }
    onEquipmentChange(newMap);
  }

  function updateEquipmentNotes(equipmentId: number, notes: string) {
    const newMap = new Map(selectedEquipment);
    newMap.set(equipmentId, notes);
    onEquipmentChange(newMap);
  }

  // Group equipment by category
  const groupedEquipment = allEquipment.reduce((acc, equip) => {
    const category = equip.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(equip);
    return acc;
  }, {} as Record<string, Equipment[]>);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <Loader2 className="animate-spin" size={16} />
        <span>Loading equipment...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-900">
        Equipment Used in Step {stepNumber}
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-3">
        {Object.entries(groupedEquipment).map(([category, items]) => (
          <div key={category}>
            {/* Category Header (collapsible) */}
            <button
              onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
              className="w-full text-left flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded text-sm font-medium text-gray-700"
            >
              <span>{expandedCategory === category ? '▼' : '▶'}</span>
              <span className="capitalize">{category}</span>
              <span className="text-xs text-gray-500 ml-auto">
                ({items.filter(i => selectedEquipment.has(i.id)).length}/{items.length})
              </span>
            </button>

            {/* Equipment Items */}
            {expandedCategory === category && (
              <div className="ml-4 space-y-2 py-1">
                {items.map(equip => (
                  <div key={equip.id} className="space-y-1">
                    {/* Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEquipment.has(equip.id)}
                        onChange={() => toggleEquipment(equip.id)}
                        className="w-4 h-4 rounded text-purple-600"
                      />
                      <span className="text-sm text-gray-900">
                        {equip.icon && <span className="mr-1">{equip.icon}</span>}
                        {equip.name}
                      </span>
                      {equip.reference_image_url && (
                        <img
                          src={equip.reference_image_url}
                          alt={equip.name}
                          className="w-5 h-5 rounded"
                          title={equip.name}
                        />
                      )}
                    </label>

                    {/* Notes Input (shown when selected) */}
                    {selectedEquipment.has(equip.id) && (
                      <input
                        type="text"
                        value={selectedEquipment.get(equip.id) || ''}
                        onChange={(e) => updateEquipmentNotes(equip.id, e.target.value)}
                        placeholder="e.g. 20cm, electric, optional..."
                        className="ml-6 w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {allEquipment.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No equipment available. Add equipment to the equipment database first.
          </div>
        )}
      </div>

      {/* Selected Summary */}
      {selectedEquipment.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <div className="text-sm font-medium text-blue-900 mb-2">
            ✓ {selectedEquipment.size} item{selectedEquipment.size !== 1 ? 's' : ''} selected
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedEquipment.entries()).map(([equipId, notes]) => {
              const equip = allEquipment.find(e => e.id === equipId);
              return (
                <div
                  key={equipId}
                  className="bg-white px-2 py-1 rounded text-xs text-gray-700 border border-blue-200"
                >
                  {equip?.icon && <span className="mr-1">{equip.icon}</span>}
                  {equip?.name}
                  {notes && <span className="text-gray-500"> ({notes})</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## TASK 2: Add Equipment Section to EnhancedStepImages

### Update: `Admin/app/dashboard/simple-recipes/[id]/EnhancedStepImages.tsx`

Add equipment state and UI:

```typescript
'use client';

import { useState } from 'react';
import { EquipmentSelector } from './EquipmentSelector';

// In EnhancedStepImages component:

interface EnhancedStepImagesProps {
  recipeId: string;
  steps: Step[];
  onStepsUpdate: () => void;
}

export function EnhancedStepImages({ 
  recipeId, 
  steps,
  onStepsUpdate 
}: EnhancedStepImagesProps) {
  // ... existing state ...

  // ✅ ADD: Equipment state per step
  const [stepEquipment, setStepEquipment] = useState<{
    [stepNumber: number]: Map<number, string>
  }>(() => {
    // Initialize from existing step equipment_needed
    const initial: { [key: number]: Map<number, string> } = {};
    steps.forEach(step => {
      const equipmentIds = (step.equipment_needed as number[]) || [];
      initial[step.step_number] = new Map(
        equipmentIds.map(id => [id, ''])  // TODO: Load notes if they exist
      );
    });
    return initial;
  });

  // Handle equipment selection change
  function handleEquipmentChange(stepNumber: number, equipment: Map<number, string>) {
    setStepEquipment(prev => ({
      ...prev,
      [stepNumber]: equipment
    }));
  }

  // Save equipment to step
  async function saveStepEquipment(stepNumber: number) {
    const step = steps.find(s => s.step_number === stepNumber);
    if (!step?.id) return;

    const equipmentIds = Array.from(stepEquipment[stepNumber]?.keys() || []);

    try {
      console.log('[Equipment] Saving equipment for step', stepNumber, ':', equipmentIds);

      const { error } = await supabase
        .from('recipe_instruction_steps')
        .update({
          equipment_needed: equipmentIds.length > 0 ? equipmentIds : null
        })
        .eq('id', step.id);

      if (error) throw error;

      console.log('[Equipment] Saved successfully');
      toast.success('Equipment saved');
      onStepsUpdate();  // Refresh
    } catch (error: any) {
      console.error('[Equipment] Error:', error);
      toast.error('Failed to save equipment');
    }
  }

  // In JSX rendering, add equipment section after settings:

  return (
    <div className="space-y-8">
      {steps.map(step => {
        const state = stepImages[step.step_number] || {};

        return (
          <div key={step.step_number} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            {/* Step Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Step {step.step_number}</h3>
                <p className="text-gray-700 mt-1">{step.step_description}</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium whitespace-nowrap">
                ✅ Saved
              </span>
            </div>

            {/* SETTINGS PANEL (existing code) */}
            {/* ... existing settings section ... */}

            {/* ✅ EQUIPMENT SELECTOR (NEW) */}
            <div className="border-t pt-6 mt-6">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  🍳 Equipment & Dishes Needed
                </h4>
                <EquipmentSelector
                  stepNumber={step.step_number}
                  selectedEquipment={stepEquipment[step.step_number] || new Map()}
                  onEquipmentChange={(equipment) => handleEquipmentChange(step.step_number, equipment)}
                />
              </div>

              <button
                onClick={() => saveStepEquipment(step.step_number)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm"
              >
                Save Equipment
              </button>
            </div>

            {/* IMAGE SECTION (existing code) */}
            {/* ... existing image generation section ... */}
          </div>
        );
      })}
    </div>
  );
}
```

---

## TASK 3: Test Equipment Selection & Saving

### Test Checklist

- [ ] Open simple recipe detail page
- [ ] Scroll to step
- [ ] See "Equipment & Dishes Needed" section
- [ ] Click category to expand (e.g., "Cookware")
- [ ] See checkboxes for each equipment
- [ ] Check "Mixing Bowl"
- [ ] Add note: "20cm, medium"
- [ ] Check "Whisk"
- [ ] Add note: "electric"
- [ ] Click "Save Equipment"
- [ ] See success toast
- [ ] Refresh page
- [ ] Equipment still selected and notes preserved

### Database Verification

```sql
-- Check equipment_needed is saved
SELECT 
  step_number,
  step_description,
  equipment_needed
FROM recipe_instruction_steps
WHERE base_recipe_id = 'your-simple-recipe-id'
ORDER BY step_number;

-- Should show:
-- step_number | step_description    | equipment_needed
-- 1           | Mix cocoa and eggs  | {1,5}  (IDs of selected equipment)
-- 2           | Pour into mug       | {12}
```

### API Route (if needed)

Check if this exists:

```
Admin/app/api/recipe-instruction-steps/update-equipment/route.ts
```

If not, you can update directly via Supabase client (as shown above).

---

## TASK 4: Display in Mobile (Future)

When mobile app displays cooking mode, show equipment:

```typescript
// Mobile: recipe-detail/CookingMode.tsx

{recipe.equipment_needed && recipe.equipment_needed.length > 0 && (
  <div className="bg-blue-50 p-4 rounded-lg mb-6">
    <h4 className="font-semibold text-blue-900 mb-2">Equipment Needed:</h4>
    <div className="flex flex-wrap gap-2">
      {recipe.equipment_needed.map(equipId => {
        const equip = allEquipment.find(e => e.id === equipId);
        return (
          <div key={equipId} className="bg-blue-100 px-3 py-1 rounded-full text-sm">
            {equip?.icon} {equip?.name}
          </div>
        );
      })}
    </div>
  </div>
)}
```

---

## Summary

**What you're implementing:**

✅ Equipment selector component (with categories)
✅ Checkbox per equipment item
✅ Notes field for each equipment (e.g., "20cm", "electric")
✅ Save equipment_needed array to recipe_instruction_steps
✅ Persists across page refreshes
✅ Mobile can display equipment in cooking mode

**Exact copy of base_recipes workflow:**
- Same UI (categories, checkboxes, notes)
- Same data structure (Map<equipmentId, notes>)
- Same database column (equipment_needed INTEGER[])
- Same save mechanism

---

## Reports to Provide

1. **Screenshot of Equipment Selector** (expanded with items)
2. **Screenshot with 3+ items selected** (with notes)
3. **Screenshot after Save** (success message)
4. **Database query result** showing equipment_needed column populated
5. **Page refresh test** (equipment persists)
6. **Console logs** showing save operations

---

Good luck! 🍳🎯