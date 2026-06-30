# TASK: Step Sections Reorder + Equipment Reference Photos in Step Image Generation

**Scope:** Admin panel — BOTH step editors:
1. Base recipes step editor (`C:\Dev\KetoCakR\Admin\app\dashboard\...` — base recipe edit page / StepIngredientEditor)
2. Simple recipes step editor (steps CRUD editor used for simple/imported recipes)

> Exact file paths unknown — **INVESTIGATION PHASE REQUIRED FIRST** (see Phase 0). Do not guess anchors; read the actual files, then plan surgical edits.

**Hard rules:**
- Do NOT remove or change any existing functionality.
- Surgical `str_replace` edits; JSX blocks are moved, not rewritten.
- All prompt text sent to Gemini in **English** (Cyrillic costs 1.5–2x tokens).
- NO negative prompts in image generation (they increase hallucinations — established project rule).

---

## Goal

### Part A — Reorder per-step sections (cosmetic)
In both editors, each instruction step currently renders:
1. Image generation section
2. Ingredients + equipment selection section

Swap the order: **ingredients + equipment FIRST, image generation AFTER**. Logical flow: the admin first picks what's used in the step, then generates the image — enabling Part B.

### Part B — Equipment reference photos drive image generation
The `equipment` table has reference photos (bucket `equipment`). When generating a step image, the selected equipment for that step must be passed to Gemini as **reference images** + named in the prompt, so the exact same plate/pan/bowl appears in the generated frame. Result: all step images look like they come from one consistent kitchen.

---

## Phase 0 — Investigation (do this first, report findings before editing)

1. Locate both step editors:
   - `grep -r "StepIngredientEditor" Admin/` and `grep -r "generate.*step.*image\|step-image" Admin/ -il`
   - Identify the base-recipe steps editor file and the simple-recipe steps editor file.
2. Locate the image generation path:
   - Find the API route that calls Gemini (`gemini-2.5-flash-image`, direct `fetch` — NOT the SDK; SDK `inlineData` is bugged, established rule).
   - Note what payload the client currently sends (prompt only? recipe context?).
3. Verify `equipment` table columns: confirm the reference photo column name (likely `image_url`; table uses `name` = BG and `name_en` — there is NO `name_bg`). Also note `is_serving_container` / `serving_container_type`.
4. Verify how a step stores its selected equipment (e.g., `equipment_used` array on `recipe_instruction_steps`, or join table) — needed to know what IDs are available at generation time.

---

## Part A — Section reorder (both editors)

For each step card in the editor JSX:
- Cut the entire image-generation block (`<div>` containing the generate button, preview, prompt field if any).
- Paste it AFTER the ingredients/equipment selection block.
- Keep all handlers, state, keys, and props identical — pure JSX move.
- Verify no closures/refs depend on render order (they shouldn't).

---

## Part B — Reference images in generation

### B1. Client: send selected equipment with the generate request

When the admin clicks "Generate image" for a step, include the step's selected equipment IDs in the request body:

```ts
body: JSON.stringify({
  ...existingPayload,
  equipment_ids: stepEquipmentIds, // IDs selected in the equipment section of THIS step
})
```

If the editor only has equipment names at that point, send IDs — adapt to actual data shape found in Phase 0.

### B2. API route: fetch reference photos and build multimodal request

In the Gemini generation route (server-side, has `SUPABASE_SERVICE_ROLE_KEY`):

```ts
// 1. Load equipment rows
const { data: equipment } = await supabaseAdmin
  .from('equipment')
  .select('id, name, name_en, image_url, is_serving_container, serving_container_type')
  .in('id', equipment_ids || []);

// 2. Download reference photos (bucket is public) and convert to base64
//    Limit to MAX 3 reference images to keep the request small.
const refs: { mimeType: string; data: string }[] = [];
for (const eq of (equipment || []).slice(0, 3)) {
  if (!eq.image_url) continue;
  try {
    const imgRes = await fetch(eq.image_url);
    if (!imgRes.ok) continue;
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
    refs.push({ mimeType, data: buf.toString('base64') });
  } catch { /* skip broken refs, never fail generation because of them */ }
}

// 3. Build prompt addition (ENGLISH, positive phrasing only — no negative prompts)
const eqNames = (equipment || []).map(e => e.name_en || e.name).filter(Boolean);
const refInstruction = refs.length > 0
  ? `Use the exact kitchenware shown in the attached reference image${refs.length > 1 ? 's' : ''}: ${eqNames.join(', ')}. The scene must feature these exact items with the same shape, color, and material, as if photographed in the same kitchen.`
  : eqNames.length > 0
    ? `The scene features this kitchenware: ${eqNames.join(', ')}.`
    : '';

// 4. Gemini direct fetch — reference images BEFORE the text part
const parts: any[] = [
  ...refs.map(r => ({ inline_data: { mime_type: r.mimeType, data: r.data } })),
  { text: `${existingPrompt}\n\n${refInstruction}`.trim() },
];
// keep the rest of the existing direct-fetch call to gemini-2.5-flash-image unchanged,
// only replacing the contents/parts construction
```

> Field naming: the REST API accepts `inline_data` / `mime_type` (snake_case). Match whatever casing the existing working direct-fetch code already uses — do not switch conventions mid-file.

### B3. Graceful degradation
- No equipment selected → generation works exactly as today (no behavior change).
- Equipment selected but no photo → name-only mention in prompt.
- Photo download fails → skip silently, log a `console.warn`.

### B4. UX hint (small, optional)
Next to the generate button, when the step has equipment with reference photos, show a subtle hint:
`📷 Ще се използват {N} референтни снимки на посудата` — so the admin knows the link is active. Skip if it clutters the UI.

---

## Testing Checklist
- [ ] Both editors: ingredients/equipment section renders ABOVE image generation, per step
- [ ] All existing handlers still work after the JSX move (add/remove ingredient, equipment dropdown, timers)
- [ ] Generate WITHOUT equipment → identical behavior to before
- [ ] Generate WITH equipment that has a reference photo → photo is fetched, request contains inline_data parts, generated image features the item
- [ ] Generate with serving container (e.g., decorative plate, `is_serving_container = true`) → plate visibly consistent with reference
- [ ] Broken/missing image_url → generation still succeeds
- [ ] Max 3 reference images enforced
- [ ] Session report saved to `Admin/logs/`
