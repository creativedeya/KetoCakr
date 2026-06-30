# Feature: Admin Simple Recipes — Steps Editor (CRUD)

**Scope:** Admin panel — simple recipe edit page  
**Time:** ~60 min

---

## Goal

In the simple recipe edit page, add a full steps editor:
- View all existing steps in order
- Edit step text inline
- Add new step (at end or at specific position)
- Delete a step
- Reorder steps (move up / move down)
- Save changes to DB via API route

---

## Step 0 — Find the files

```bash
# Find simple recipe edit page
find C:/Dev/KetoCakR/admin/app -name "*.tsx" | xargs grep -l "simple_recipe\|is_simple_recipe\|simple-recipe" 2>/dev/null

# Find existing steps display
grep -rn "recipe_instruction_steps\|instruction_steps" C:/Dev/KetoCakR/admin/app --include="*.tsx" -l
```

Most likely edit page: `admin/app/dashboard/simple-recipes/[id]/page.tsx` or `edit/page.tsx`

---

## Step 1 — API Route for steps

**File:** `admin/app/api/simple-recipes/[id]/steps/route.ts` (create new)

```typescript
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET — fetch steps for a recipe
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from('recipe_instruction_steps')
    .select('*')
    .eq('base_recipe_id', params.id)
    .order('step_number', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — save full steps array (replace all)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { steps } = await req.json();

  // Delete existing steps
  const { error: deleteError } = await supabase
    .from('recipe_instruction_steps')
    .delete()
    .eq('base_recipe_id', params.id);

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  if (!steps || steps.length === 0) {
    return NextResponse.json({ success: true });
  }

  // Insert new steps with correct step_number
  const insertData = steps.map((step: any, index: number) => ({
    base_recipe_id: params.id,
    step_number: index + 1,
    instruction_bg: step.instruction_bg || '',
    instruction_en: step.instruction_en || '',
    ingredients_used: step.ingredients_used || [],
    image_url: step.image_url || null,
  }));

  const { error: insertError } = await supabase
    .from('recipe_instruction_steps')
    .insert(insertData);

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
```

> Note: Uses SERVICE_ROLE_KEY — bypasses RLS. Required per project rules.

---

## Step 2 — StepsEditor Component

**File:** `admin/components/StepsEditor.tsx` (create new)

```typescript
'use client';
import { useState } from 'react';

interface Step {
  id?: string;
  step_number: number;
  instruction_bg: string;
  instruction_en: string;
  image_url?: string | null;
  ingredients_used?: string[];
}

interface StepsEditorProps {
  recipeId: string;
  initialSteps: Step[];
}

export default function StepsEditor({ recipeId, initialSteps }: StepsEditorProps) {
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const updateStep = (index: number, field: 'instruction_bg' | 'instruction_en', value: string) => {
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const addStep = (afterIndex?: number) => {
    const newStep: Step = {
      step_number: 0,
      instruction_bg: '',
      instruction_en: '',
      ingredients_used: [],
    };
    setSteps(prev => {
      const next = [...prev];
      const insertAt = afterIndex !== undefined ? afterIndex + 1 : next.length;
      next.splice(insertAt, 0, newStep);
      return next.map((s, i) => ({ ...s, step_number: i + 1 }));
    });
  };

  const deleteStep = (index: number) => {
    if (!confirm('Изтрий тази стъпка?')) return;
    setSteps(prev => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, step_number: i + 1 })));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    setSteps(prev => {
      const next = [...prev];
      const swapWith = direction === 'up' ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= next.length) return prev;
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return next.map((s, i) => ({ ...s, step_number: i + 1 }));
    });
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/simple-recipes/${recipeId}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage('✅ Запазено успешно');
    } catch (err: any) {
      setMessage(`❌ Грешка: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>
          Стъпки ({steps.length})
        </h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {message && <span style={{ fontSize: 14 }}>{message}</span>}
          <button
            onClick={() => addStep()}
            style={{ padding: '8px 16px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            + Добави стъпка
          </button>
          <button
            onClick={save}
            disabled={saving}
            style={{ padding: '8px 16px', backgroundColor: '#A80048', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Запазване...' : 'Запази стъпките'}
          </button>
        </div>
      </div>

      {steps.length === 0 && (
        <p style={{ color: '#9ca3af', textAlign: 'center', padding: 32 }}>
          Няма стъпки. Добави първата стъпка.
        </p>
      )}

      {steps.map((step, index) => (
        <div key={index} style={{
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          backgroundColor: '#fafafa',
        }}>
          {/* Step Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 600, color: '#A80048' }}>Стъпка {index + 1}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => moveStep(index, 'up')} disabled={index === 0}
                style={{ padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', backgroundColor: 'white', opacity: index === 0 ? 0.4 : 1 }}>
                ↑
              </button>
              <button onClick={() => moveStep(index, 'down')} disabled={index === steps.length - 1}
                style={{ padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', backgroundColor: 'white', opacity: index === steps.length - 1 ? 0.4 : 1 }}>
                ↓
              </button>
              <button onClick={() => addStep(index)}
                style={{ padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', backgroundColor: 'white', fontSize: 12 }}>
                + след
              </button>
              <button onClick={() => deleteStep(index)}
                style={{ padding: '4px 10px', border: '1px solid #fca5a5', borderRadius: 6, cursor: 'pointer', backgroundColor: '#fff5f5', color: '#dc2626' }}>
                ✕
              </button>
            </div>
          </div>

          {/* BG instruction */}
          <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>
            Инструкция (BG)
          </label>
          <textarea
            value={step.instruction_bg}
            onChange={e => updateStep(index, 'instruction_bg', e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box', marginBottom: 8 }}
          />

          {/* EN instruction */}
          <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>
            Инструкция (EN)
          </label>
          <textarea
            value={step.instruction_en || ''}
            onChange={e => updateStep(index, 'instruction_en', e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }}
            placeholder="English translation (optional)"
          />
        </div>
      ))}

      {steps.length > 0 && (
        <div style={{ textAlign: 'right', marginTop: 8 }}>
          <button
            onClick={save}
            disabled={saving}
            style={{ padding: '10px 24px', backgroundColor: '#A80048', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Запазване...' : 'Запази стъпките'}
          </button>
          {message && <span style={{ marginLeft: 12, fontSize: 14 }}>{message}</span>}
        </div>
      )}
    </div>
  );
}
```

---

## Step 3 — Add StepsEditor to simple recipe edit page

**File:** simple recipe edit page (found in Step 0)

At the top, add import:
```typescript
import StepsEditor from '@/components/StepsEditor';
```

In the page component, fetch steps alongside the recipe. Add to the existing data fetch or as separate fetch:
```typescript
// Fetch steps
const stepsRes = await fetch(`/api/simple-recipes/${params.id}/steps`);
const steps = stepsRes.ok ? await stepsRes.json() : [];
```

At the bottom of the page JSX (after existing form fields), add:
```typescript
<StepsEditor recipeId={params.id} initialSteps={steps} />
```

---

## Rules
- API route uses SERVICE_ROLE_KEY (required — RLS blocks anon writes)
- Save strategy: delete-all + re-insert (simplest, avoids ID conflicts)
- Do NOT touch mobile app files
- Do NOT change recipe_instruction_steps table schema
- StepsEditor is client component ('use client') — page can stay server component

---

## Verification
1. Open admin → Simple Recipes → edit any recipe
2. Steps section appears at bottom
3. Edit a step text → Запази → refresh → changes persist
4. Add new step → appears in list
5. Delete step → confirm → removed
6. Move up/down → reorders correctly
7. Check mobile app → steps show in correct order
