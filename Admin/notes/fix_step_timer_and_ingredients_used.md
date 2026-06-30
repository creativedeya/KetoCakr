# Fix: Step timer not saved + ingredients_used wiped on save

---

## BUG 1: Timer not saved when editing step description

### Problem
`EnhancedStepImages.tsx` → `saveDescription()` calls `/api/save-step-description`
with only `{ stepId, description }`. Timer value is never sent or saved.

The step editor in `SimpleRecipeForm.tsx` (Steps tab) has a duration input,
but when you edit via EnhancedStepImages the inline edit only saves text.

### Fix: Update /api/save-step-description/route.ts

Find file: `Admin/app/api/save-step-description/route.ts`

OLD (likely):
```typescript
const { stepId, description } = await req.json();
// ...
await supabase
  .from('recipe_instruction_steps')
  .update({ step_description_bg: description, step_description: description })
  .eq('id', stepId);
```

NEW:
```typescript
const { stepId, description, step_duration_minutes } = await req.json();
// ...
const updatePayload: Record<string, any> = {
  step_description_bg: description,
  step_description: description,
};
if (step_duration_minutes !== undefined) {
  updatePayload.step_duration_minutes = step_duration_minutes;
}
await supabase
  .from('recipe_instruction_steps')
  .update(updatePayload)
  .eq('id', stepId);
```

### Also fix: EnhancedStepImages.tsx — add duration field to inline edit

#### Change 1: Add duration to Step interface

OLD:
```typescript
interface Step {
  id?: number | string;
  step_number: number;
  step_description: string;
  step_description_bg?: string | null;
  step_description_en?: string | null;
  step_image_url?: string | null;
  image_generation_hints?: string | null;
  equipment_needed?: number[] | null;
  ingredient_ids?: number[] | null;
}
```
NEW:
```typescript
interface Step {
  id?: number | string;
  step_number: number;
  step_description: string;
  step_description_bg?: string | null;
  step_description_en?: string | null;
  step_image_url?: string | null;
  image_generation_hints?: string | null;
  equipment_needed?: number[] | null;
  ingredient_ids?: number[] | null;
  step_duration_minutes?: number | null;
}
```

#### Change 2: Add editDurations state

OLD:
```typescript
  const [editTexts, setEditTexts] = useState<{ [stepNumber: number]: string }>({});
  const [savingDescription, setSavingDescription] = useState<number | null>(null);
```
NEW:
```typescript
  const [editTexts, setEditTexts] = useState<{ [stepNumber: number]: string }>({});
  const [editDurations, setEditDurations] = useState<{ [stepNumber: number]: number }>({});
  const [savingDescription, setSavingDescription] = useState<number | null>(null);
```

#### Change 3: Update saveDescription to include duration

OLD:
```typescript
  async function saveDescription(stepNumber: number) {
    const step = steps.find(s => s.step_number === stepNumber);
    const newText = editTexts[stepNumber]?.trim();
    if (!newText || !step?.id) return;

    setSavingDescription(stepNumber);
    try {
      const res = await fetch('/api/save-step-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId: step.id, description: newText }),
      });
```
NEW:
```typescript
  async function saveDescription(stepNumber: number) {
    const step = steps.find(s => s.step_number === stepNumber);
    const newText = editTexts[stepNumber]?.trim();
    if (!newText || !step?.id) return;

    const duration = editDurations[stepNumber];

    setSavingDescription(stepNumber);
    try {
      const res = await fetch('/api/save-step-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId: step.id,
          description: newText,
          ...(duration !== undefined ? { step_duration_minutes: duration } : {}),
        }),
      });
```

#### Change 4: Add duration input to inline edit mode in JSX

Find the inline edit mode block (inside `editingStep === step.step_number`):

OLD:
```tsx
                  <div className="space-y-2">
                    <textarea
                      autoFocus
                      rows={3}
                      value={editTexts[step.step_number] ?? (step.step_description_bg || step.step_description)}
                      onChange={(e) => setEditTexts(prev => ({ ...prev, [step.step_number]: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-blue-400 rounded-lg text-sm focus:outline-none focus:border-blue-600 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => saveDescription(step.step_number)}
                        disabled={savingDescription === step.step_number || !editTexts[step.step_number]?.trim()}
                        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                      >
                        {savingDescription === step.step_number ? '⏳ Saving...' : '💾 Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingStep(null); setEditTexts(prev => ({ ...prev, [step.step_number]: '' })); }}
                        className="px-4 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 text-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
```
NEW:
```tsx
                  <div className="space-y-2">
                    <textarea
                      autoFocus
                      rows={3}
                      value={editTexts[step.step_number] ?? (step.step_description_bg || step.step_description)}
                      onChange={(e) => setEditTexts(prev => ({ ...prev, [step.step_number]: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-blue-400 rounded-lg text-sm focus:outline-none focus:border-blue-600 resize-none"
                    />
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium text-gray-600 whitespace-nowrap">⏱ Таймер (мин)</label>
                      <input
                        type="number"
                        min={0}
                        value={editDurations[step.step_number] ?? step.step_duration_minutes ?? 0}
                        onChange={e => setEditDurations(prev => ({
                          ...prev,
                          [step.step_number]: parseInt(e.target.value) || 0,
                        }))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => saveDescription(step.step_number)}
                        disabled={savingDescription === step.step_number || !editTexts[step.step_number]?.trim()}
                        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                      >
                        {savingDescription === step.step_number ? '⏳ Saving...' : '💾 Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStep(null);
                          setEditTexts(prev => ({ ...prev, [step.step_number]: '' }));
                          setEditDurations(prev => ({ ...prev, [step.step_number]: undefined as any }));
                        }}
                        className="px-4 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 text-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
```

---

## BUG 2: ingredients_used wiped when saving recipe from SimpleRecipeForm

### Problem
In `[id]/route.ts` PATCH handler (to be created), when steps are re-inserted:
- If `ingredients` is NOT in the payload (user only changed text/timer) → `ingredientPks = []`
- Steps get re-inserted with `ingredients_used: []` → cooking mode shows empty list

### Fix: In Admin/app/api/simple-recipes/[id]/route.ts PATCH handler

This is the file to CREATE (from create_simple_recipes_id_route.md).
The steps insert section needs this guard:

```typescript
    // Update steps if provided
    if (steps !== undefined) {
      await supabase.from('recipe_instruction_steps').delete().eq('recipe_id', params.id);
      if (steps.length > 0) {
        // IMPORTANT: fetch existing ingredient PKs if ingredients were NOT updated
        // to avoid wiping ingredients_used with empty array
        if (ingredients === undefined || ingredientPks.length === 0) {
          const { data: existingIngs } = await supabase
            .from('recipe_ingredients')
            .select('id')
            .eq('recipe_id', params.id)
            .order('order_index');
          ingredientPks = (existingIngs || []).map((r: any) => r.id);
        }

        await supabase.from('recipe_instruction_steps').insert(
          steps.map((step: any, i: number) => ({
            recipe_id: params.id,
            step_number: i + 1,
            step_description: step.step_description_bg || '',
            step_description_bg: step.step_description_bg || '',
            step_description_en: step.step_description_en || '',
            step_duration_minutes: step.step_duration_minutes ?? 0,
            step_image_url: step.step_image_url || null,
            ingredients_used: ingredientPks,  // always populated now
          }))
        );
      }
    }
```

### Also fix: SimpleRecipeForm.tsx — don't delete+reinsert steps if only timer changed

The real fix is: **never wipe steps from DB on every save**.
Instead, update each step individually by step_number.

In `[id]/route.ts` PATCH handler, replace delete+reinsert pattern with upsert:

```typescript
    // Update steps if provided — UPDATE existing, don't delete+reinsert
    if (steps !== undefined && steps.length > 0) {
      // Fetch existing step IDs
      const { data: existingSteps } = await supabase
        .from('recipe_instruction_steps')
        .select('id, step_number')
        .eq('recipe_id', params.id)
        .order('step_number');

      const existingMap = new Map((existingSteps || []).map(s => [s.step_number, s.id]));

      // Fetch current ingredient PKs (preserve ingredients_used)
      if (ingredientPks.length === 0) {
        const { data: existingIngs } = await supabase
          .from('recipe_ingredients')
          .select('id')
          .eq('recipe_id', params.id)
          .order('order_index');
        ingredientPks = (existingIngs || []).map((r: any) => r.id);
      }

      for (const [i, step] of steps.entries()) {
        const stepNumber = i + 1;
        const existingId = existingMap.get(stepNumber);

        const stepData = {
          recipe_id: params.id,
          step_number: stepNumber,
          step_description: step.step_description_bg || '',
          step_description_bg: step.step_description_bg || '',
          step_description_en: step.step_description_en || '',
          step_duration_minutes: step.step_duration_minutes ?? 0,
          step_image_url: step.step_image_url || null,
          ingredients_used: ingredientPks,
        };

        if (existingId) {
          await supabase
            .from('recipe_instruction_steps')
            .update(stepData)
            .eq('id', existingId);
        } else {
          await supabase
            .from('recipe_instruction_steps')
            .insert(stepData);
        }
      }

      // Delete steps that no longer exist (if count decreased)
      const newStepNumbers = steps.map((_: any, i: number) => i + 1);
      const toDelete = (existingSteps || [])
        .filter(s => !newStepNumbers.includes(s.step_number))
        .map(s => s.id);
      if (toDelete.length > 0) {
        await supabase
          .from('recipe_instruction_steps')
          .delete()
          .in('id', toDelete);
      }
    }
```

---

## Execution order for Claude Code

1. First CREATE `Admin/app/api/simple-recipes/[id]/route.ts`
   (use create_simple_recipes_id_route.md as base, apply Bug 2 fix above)
2. Then fix `Admin/app/api/save-step-description/route.ts` (Bug 1 — API)
3. Then fix `Admin/app/dashboard/simple-recipes/[id]/EnhancedStepImages.tsx` (Bug 1 — UI)
