# Fix: Add debug logs to saveDescription

## File
`Admin/app/dashboard/simple-recipes/[id]/EnhancedStepImages.tsx`

## str_replace

OLD:
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
  }
```

NEW:
```typescript
  async function saveDescription(stepNumber: number) {
    const sn = Number(stepNumber);
    const step = steps.find(s => Number(s.step_number) === sn);
    const newText = editTexts[sn]?.trim();

    console.log('[saveDescription] called', {
      stepNumber,
      sn,
      stepFound: !!step,
      stepId: step?.id,
      newText,
      editTexts_sn: editTexts[sn],
      editDurations_sn: editDurations[sn],
      step_duration_minutes: step?.step_duration_minutes,
    });

    if (!newText || !step?.id) {
      console.warn('[saveDescription] EARLY RETURN — newText:', newText, 'step?.id:', step?.id);
      return;
    }

    // Use edited duration if changed, otherwise fall back to current DB value
    const duration = editDurations[sn] !== undefined
      ? editDurations[sn]
      : (step.step_duration_minutes ?? 0);

    console.log('[saveDescription] sending', { stepId: step.id, description: newText, step_duration_minutes: duration });

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
      console.log('[saveDescription] response', { status: res.status, data });
      if (!res.ok) throw new Error(data.error);

      setEditingStep(null);
      onStepsUpdate();
    } catch (err: any) {
      console.error('[saveDescription] error', err);
      alert(`❌ ${err.message}`);
    } finally {
      setSavingDescription(null);
    }
  }
```
