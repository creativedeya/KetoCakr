# Fix: Save Changes button disabled — saveDescription never fires

## File
`Admin/app/dashboard/simple-recipes/[id]/EnhancedStepImages.tsx`

## Problem
The "💾 Save Changes" button is disabled even after clicking ✏️ Edit.
No console errors — the click handler never runs.

Root cause: the button's `disabled` condition checks `!editTexts[step.step_number]?.trim()`
but `editTexts` is keyed by `step.step_number` (integer).
The ✏️ Edit button sets `editTexts` correctly, BUT the `step` object
inside the `.map()` render may have `step_number` as a string from the API response,
while `editTexts` state was set with an integer key — causing a key mismatch.

## Fix 1: Normalize step_number to integer everywhere in editTexts

### Change 1a: In the ✏️ Edit button onClick — force integer key

OLD:
```typescript
                      onClick={() => {
                        setEditTexts(prev => ({ ...prev, [step.step_number]: step.step_description_bg || step.step_description }));
                        setEditingStep(step.step_number);
                      }}
```
NEW:
```typescript
                      onClick={() => {
                        const sn = Number(step.step_number);
                        setEditTexts(prev => ({ ...prev, [sn]: step.step_description_bg || step.step_description || '' }));
                        setEditDurations(prev => ({ ...prev, [sn]: step.step_duration_minutes ?? 0 }));
                        setEditingStep(sn);
                      }}
```

### Change 1b: Normalize editingStep check

OLD:
```typescript
                {editingStep === step.step_number ? (
```
NEW:
```typescript
                {editingStep === Number(step.step_number) ? (
```

### Change 1c: Normalize all editTexts/editDurations reads in the inline edit block

OLD:
```typescript
                      value={editTexts[step.step_number] ?? (step.step_description_bg || step.step_description)}
                      onChange={(e) => setEditTexts(prev => ({ ...prev, [step.step_number]: e.target.value }))}
```
NEW:
```typescript
                      value={editTexts[Number(step.step_number)] ?? (step.step_description_bg || step.step_description || '')}
                      onChange={(e) => setEditTexts(prev => ({ ...prev, [Number(step.step_number)]: e.target.value }))}
```

OLD:
```typescript
                        value={editDurations[step.step_number] ?? step.step_duration_minutes ?? 0}
                        onChange={e => setEditDurations(prev => ({
                          ...prev,
                          [step.step_number]: parseInt(e.target.value) || 0,
                        }))}
```
NEW:
```typescript
                        value={editDurations[Number(step.step_number)] ?? step.step_duration_minutes ?? 0}
                        onChange={e => setEditDurations(prev => ({
                          ...prev,
                          [Number(step.step_number)]: parseInt(e.target.value) || 0,
                        }))}
```

### Change 1d: Fix the Save button disabled condition and onClick

OLD:
```typescript
                      <button
                        type="button"
                        onClick={() => saveDescription(step.step_number)}
                        disabled={savingDescription === step.step_number || !editTexts[step.step_number]?.trim()}
```
NEW:
```typescript
                      <button
                        type="button"
                        onClick={() => saveDescription(Number(step.step_number))}
                        disabled={savingDescription === Number(step.step_number) || !editTexts[Number(step.step_number)]?.trim()}
```

### Change 1e: Fix Cancel button onClick

OLD:
```typescript
                        onClick={() => {
                          setEditingStep(null);
                          setEditTexts(prev => ({ ...prev, [step.step_number]: '' }));
                          setEditDurations(prev => ({ ...prev, [step.step_number]: undefined as any }));
                        }}
```
NEW:
```typescript
                        onClick={() => {
                          setEditingStep(null);
                          setEditTexts(prev => ({ ...prev, [Number(step.step_number)]: '' }));
                          setEditDurations(prev => ({ ...prev, [Number(step.step_number)]: undefined as any }));
                        }}
```

### Change 1f: Fix saveDescription — normalize stepNumber

OLD:
```typescript
  async function saveDescription(stepNumber: number) {
    const step = steps.find(s => s.step_number === stepNumber);
    const newText = editTexts[stepNumber]?.trim();
    if (!newText || !step?.id) return;

    // Use edited duration if changed, otherwise fall back to current DB value
    const duration = editDurations[stepNumber] !== undefined
      ? editDurations[stepNumber]
      : (step.step_duration_minutes ?? 0);
```
NEW:
```typescript
  async function saveDescription(stepNumber: number) {
    const sn = Number(stepNumber);
    const step = steps.find(s => Number(s.step_number) === sn);
    const newText = editTexts[sn]?.trim();
    if (!newText || !step?.id) return;

    // Use edited duration if changed, otherwise fall back to current DB value
    const duration = editDurations[sn] !== undefined
      ? editDurations[sn]
      : (step.step_duration_minutes ?? 0);
```

### Change 1g: Fix remaining references to stepNumber in saveDescription

OLD:
```typescript
    setSavingDescription(stepNumber);
    try {
      const res = await fetch('/api/save-step-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId: step.id,
          description: newText,
          step_duration_minutes: duration,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEditingStep(null);
      onStepsUpdate();
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    } finally {
      setSavingDescription(null);
    }
```
NEW:
```typescript
    setSavingDescription(sn);
    try {
      const res = await fetch('/api/save-step-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId: step.id,
          description: newText,
          step_duration_minutes: duration,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEditingStep(null);
      onStepsUpdate();
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    } finally {
      setSavingDescription(null);
    }
```

## Also fix: step_description_en not shown after edit

### Change 1h: Normalize editingStep check for EN description display

OLD:
```typescript
                {step.step_description_en && editingStep !== step.step_number && (
```
NEW:
```typescript
                {step.step_description_en && editingStep !== Number(step.step_number) && (
```

---

## Verify after fix
1. Click ✏️ Edit on any step
2. Change only the timer value (don't touch the text)
3. "💾 Save Changes" button should be ACTIVE (not grayed out)
4. Click Save — check DB:
```sql
SELECT id, step_number, step_duration_minutes
FROM recipe_instruction_steps
WHERE recipe_id = '<recipe_id>'
ORDER BY step_number;
```
Expected: updated value visible immediately.
