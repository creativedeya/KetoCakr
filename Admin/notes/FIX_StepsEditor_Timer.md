# Fix: StepsEditor — Add Timer Field + Fix Default Value

**File:** `admin/components/StepsEditor.tsx`  
**Time:** 10 min — surgical edits only

---

## Fix 1 — Change default timer from 5 to 0 (no timer)

Find `addStep()`:
```typescript
const newStep: Step = {
  step_number: 0,
  step_description_bg: '',
  step_description_en: '',
  step_duration_minutes: 5,   // ← CHANGE TO 0
};
```

Replace `step_duration_minutes: 5` with `step_duration_minutes: 0`.

---

## Fix 2 — Add updateStepDuration helper

After the `updateStep` function, add:

```typescript
const updateStepDuration = (index: number, value: number) => {
  setSteps(prev => prev.map((s, i) => i === index ? { ...s, step_duration_minutes: value } : s));
};
```

---

## Fix 3 — Add timer input to each step card

Inside the step card, after the EN instruction textarea, add the timer field:

```typescript
          {/* Timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <label style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>
              ⏱ Таймер (минути)
            </label>
            <input
              type="number"
              min={0}
              max={180}
              value={step.step_duration_minutes ?? 0}
              onChange={e => updateStepDuration(index, parseInt(e.target.value) || 0)}
              style={{
                width: 80,
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14,
                textAlign: 'center',
              }}
            />
            <span style={{ fontSize: 12, color: '#9ca3af' }}>
              {(step.step_duration_minutes ?? 0) === 0 ? '(без таймер)' : `= ${step.step_duration_minutes} мин`}
            </span>
          </div>
```

Place it between the EN textarea and the closing `</div>` of the step card.

---

## Verification
1. Admin → simple recipe → Steps section
2. Each step shows "⏱ Таймер (минути)" input
3. Existing steps show their current value (5 for imported, 0 for new)
4. Change value → Запази → reload → value persists
5. New steps added with 0 (без таймер) by default
