# Fix: Steps Tab — Default duration 0 + Bulk Parse toggle

## File to edit
`Admin/components/simple-recipes/SimpleRecipeForm.tsx`

---

## Change 1: Default step_duration_minutes → 0, min → 0

### 1a. StepRow interface — no change needed (already `number`)

### 1b. useState initializer for steps (map from initialSteps)

OLD:
```
      step_duration_minutes: Number(s.step_duration_minutes) || 5,
```
NEW:
```
      step_duration_minutes: Number(s.step_duration_minutes) || 0,
```

### 1c. "Add step" button — new empty step default

OLD:
```
              step_duration_minutes: 5,
```
NEW:
```
              step_duration_minutes: 0,
```

### 1d. Duration input — min from 1 to 0

OLD:
```
                    <input type="number" min={1} value={step.step_duration_minutes}
```
NEW:
```
                    <input type="number" min={0} value={step.step_duration_minutes}
```

---

## Change 2: Bulk Parse toggle in Steps tab

### 2a. Add state variable (after existing useState hooks, before `save`)

OLD:
```
  const moveStep = (i: number, dir: -1 | 1) => {
```
NEW:
```
  const [stepsMode, setStepsMode] = useState<'manual' | 'bulk'>('manual');
  const [bulkText, setBulkText] = useState('');
  const [bulkParsing, setBulkParsing] = useState(false);

  const parseBulkSteps = async () => {
    if (!bulkText.trim()) return;
    setBulkParsing(true);
    try {
      const res = await fetch('/api/simple-recipes/parse-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: bulkText, recipeName: form.name || form.name_en }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setSteps(data.steps.map((s: any) => ({
        step_description_bg: s.step_description_bg || '',
        step_description_en: s.step_description_en || '',
        step_duration_minutes: s.step_duration_minutes || 0,
        step_image_url: '',
      })));
      setBulkText('');
      setStepsMode('manual');
    } catch (err: any) {
      setMsg({ type: 'error', text: `Parse error: ${err.message}` });
    } finally {
      setBulkParsing(false);
    }
  };

  const moveStep = (i: number, dir: -1 | 1) => {
```

### 2b. Replace Steps tab header — add toggle buttons

The Steps tab currently starts with:
```tsx
        {tab === 'steps' && (
          <div className="space-y-3">
            {steps.map((step, i) => (
```

Replace with:
```tsx
        {tab === 'steps' && (
          <div className="space-y-3">
            {/* Mode toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStepsMode('manual')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  stepsMode === 'manual'
                    ? 'bg-rose-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ✍️ Стъпка по стъпка
              </button>
              <button
                type="button"
                onClick={() => setStepsMode('bulk')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  stepsMode === 'bulk'
                    ? 'bg-rose-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📋 Bulk Parse
              </button>
              {steps.length > 0 && (
                <span className="text-xs text-gray-400 ml-2">{steps.length} стъпки добавени</span>
              )}
            </div>

            {/* Bulk parse mode */}
            {stepsMode === 'bulk' && (
              <div className="border-2 border-dashed border-rose-300 rounded-xl p-4 space-y-3 bg-rose-50">
                <p className="text-sm text-rose-700 font-medium">
                  📋 Въведи целия текст с инструкции — AI ще го раздели на отделни стъпки
                </p>
                <p className="text-xs text-gray-500">
                  Може да е номериран списък, разделен с нови редове, или свободен текст. 
                  Съществуващите стъпки ще бъдат <strong>заменени</strong>.
                </p>
                <textarea
                  className="w-full px-3 py-2 border border-rose-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  rows={10}
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  placeholder={"1. Загрей фурната до 180°C.\n2. Смесете брашното с бакпулвера.\n3. Разбийте яйцата с еритритол..."}
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={parseBulkSteps}
                    disabled={bulkParsing || !bulkText.trim()}
                    className="px-5 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-50 transition flex items-center gap-2"
                  >
                    {bulkParsing ? (
                      <>⏳ Parsing...</>
                    ) : (
                      <>✨ Parse Steps</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setBulkText(''); setStepsMode('manual'); }}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition"
                  >
                    Откажи
                  </button>
                </div>
              </div>
            )}

            {/* Manual mode — existing step list */}
            {stepsMode === 'manual' && steps.map((step, i) => (
```

### 2c. Close the `stepsMode === 'manual' &&` fragment

Find the closing of the steps.map block. Currently it ends with:
```tsx
            ))}

            <button type="button"
              onClick={() => setSteps(prev => [...prev, {
```

Replace with:
```tsx
            ))}

            {stepsMode === 'manual' && <button type="button"
              onClick={() => setSteps(prev => [...prev, {
```

And find the closing of that button:
```tsx
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:border-rose-400 hover:text-rose-500 transition">
              + Добави стъпка
            </button>
```
Replace with:
```tsx
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:border-rose-400 hover:text-rose-500 transition">
              + Добави стъпка
            </button>}
```

---

## Change 3: New API route — parse-steps

Create file: `Admin/app/api/simple-recipes/parse-steps/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { text, recipeName } = await req.json();
    if (!text?.trim()) return NextResponse.json({ success: false, error: 'No text provided' }, { status: 400 });

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `You are parsing cooking recipe instructions into structured steps.

Recipe name: "${recipeName || 'Unknown'}"

Instructions text:
${text}

Parse this into individual steps. For each step estimate a realistic duration in minutes (0 if instant/no waiting).
Respond ONLY with a JSON array, no markdown, no explanation:
[
  {
    "step_description_bg": "Bulgarian text (translate if needed)",
    "step_description_en": "English text (translate if needed)",
    "step_duration_minutes": 5
  }
]

Rules:
- If text is in Bulgarian, fill step_description_bg and translate to English for step_description_en
- If text is in English, fill step_description_en and translate to Bulgarian for step_description_bg
- step_duration_minutes = 0 for mixing/combining steps with no wait time
- step_duration_minutes = realistic minutes for baking, chilling, resting steps
- Keep each step focused on ONE action
- Do not merge steps, do not skip steps`
      }],
    });

    const raw = (message.content[0] as any).text.trim();
    const clean = raw.replace(/```json|```/g, '').trim();
    const steps = JSON.parse(clean);

    if (!Array.isArray(steps)) throw new Error('Response is not an array');

    return NextResponse.json({ success: true, steps });
  } catch (err: any) {
    console.error('parse-steps error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
```

---

## Verify
1. Steps tab shows toggle buttons at top
2. Default new step has duration = 0, min = 0
3. Bulk Parse mode shows textarea + Parse button
4. After parsing, switches back to manual mode with populated steps
5. API route responds with JSON array of steps
