# Task: Add "Generation Settings" (Visual Settings) to Hero Image Generation

> Read CLAUDE.md first for stack, hard rules, DB schema, brand colors.
> Builds on `TASK_REVE_REMIX_FIX.md` / `TASK_REVE_EDIT_FIX.md` — assumes those Reve contracts
> are already confirmed/fixed. Do not re-test or re-guess the Reve API contracts.
> Make a plan first, do NOT write code yet.

---

## Goal
Bring the same "Generation Settings" panel currently available for **step-image generation**
(base recipes) to the **hero-image generation** flow (ready recipes — `new/page.tsx` and
`[id]/edit/page.tsx`), for both Gemini and Reve providers.

---

## Context (from screenshots)

**Existing "Generation Settings" modal** (step images), opened via a "Visual Settings [PRESET]"
button next to the Image Provider selector:
- **Quick Presets:** Classic / Warm / Minimalist / Dramatic
- **Background:** Black / Dark Slate / White / Transparent
- **Viewing Angle:** Overhead / 45° / Side / Close-up
- **Lighting:** Studio / Natural / Warm / Cool (+ possibly more below the visible fold — confirm
  in Phase 0)

**Step images Image Provider options:** Auto (Smart) [Gemini → Replicate fallback] / Gemini
(~$0.015) / Replicate (~$0.04).

**Hero image Image Provider options (different — do not change this):** Gemini / Reve.

⚠️ The provider sets are intentionally different between the two flows (step images use
Gemini/Replicate, hero images use Gemini/Reve). This task only adds the **Visual Settings UI**
to the hero flow — it does not change either provider set.

---

## PHASE 0 — Investigation (do this before writing any code)

1. Locate the Generation Settings component used for step images (find the file path). Determine:
   - Is it already a standalone/reusable component, or tightly coupled to the step-image
     generation form/state?
   - Full options list — scroll past "Lighting" in the actual code/UI (the screenshot is cut off
     at the bottom) to see if there are more setting groups (e.g. Composition, Color Mood, etc.).
2. Determine what selecting these options actually produces in code:
   - A text prompt-modifier string appended to the AI prompt?
   - Structured params passed directly to the image API (e.g. Replicate may accept some of these
     as real params)?
   - Both (different per provider)?
3. Check whether any setting already maps to a structured parameter for an existing provider
   (e.g. does "Background: Transparent" already map to a real Replicate param?) — useful
   precedent for how we'll map it to Reve in Phase 2.
4. Open `app/dashboard/ready-recipes/new/page.tsx` and `app/dashboard/ready-recipes/[id]/edit/page.tsx`
   to confirm the current layout of the Gemini/Reve provider selector, so the Visual Settings
   button can be added in a consistent position/style.

Report findings — especially whether the component needs extraction into a shared component —
before proceeding to Phase 1.

---

## PHASE 1 — UI: add Visual Settings to the hero-image flow

1. Add the same "Visual Settings [PRESET]" button + Generation Settings modal next to the
   existing Gemini/Reve provider selector, on both `new/page.tsx` and `[id]/edit/page.tsx`.
2. If the component is already shared/extractable, reuse it directly. If it's currently inline/
   coupled to the step-image form, extract it into a shared component first — do not duplicate
   the JSX (existing project rule: fix at the source, not with copy-paste).
3. Settings are scoped to a single generation call (in-memory state), not persisted to the DB,
   unless Phase 0 reveals the step-image version already persists them somewhere — if so, confirm
   with the user before deciding whether hero-image settings should also persist.

---

## PHASE 2 — Wire settings into the hero-image generation route

**For Gemini:** reuse the exact same prompt-modifier construction logic already used for step
images — do not reinvent it.

**For Reve:** Reve has no structured style/angle/lighting parameters — these map to prompt text,
same approach as Gemini, **except**:

- **Background: Transparent** → use Reve's confirmed `postprocessing` parameter instead of prompt
  text:
  ```json
  "postprocessing": [{ "process": "remove_background" }]
  ```
  (Confirmed via official Reve docs. Adds cost/processing time proportional to image size — no
  other params needed for this option.)
- All other Background options (Black / Dark Slate / White) → describe in the prompt text; no
  structured background-color parameter exists for Reve.
- Viewing Angle, Lighting, Quick Presets → append as descriptive prompt text for both Gemini and
  Reve (e.g. "overhead view, studio lighting, classic warm tones" appended/blended into the base
  prompt) — reuse whatever text-construction approach Phase 0 finds for step images rather than
  writing a new one.

⚠️ Before implementing: flag to the user whether a transparent background makes sense as a
default-visible option for hero images specifically (it's more of a product-cutout style — main
recipe photos are usually full-scene). Don't silently hide the option, just confirm intent isn't
assumed incorrectly.

---

## PHASE 3 — Test

1. Generate a hero image with each Quick Preset, for both Gemini and Reve — confirm visibly
   distinct, sensible results per setting.
2. Specifically test **Background: Transparent + Reve** → confirm `postprocessing:
   remove_background` is sent, response succeeds, and `credits_used` reflects the extra
   processing cost.
3. Regression check: confirm step-image generation (the flow we're reusing code from) still works
   completely unchanged.
4. Regression check: confirm hero-image generation without touching Visual Settings (default
   behavior) still works exactly as it did after the Remix/Edit fixes.

---

## Non-negotiables
- Do NOT duplicate the Generation Settings component — extract/share it if it isn't already.
- Do NOT change either provider set (step images stay Gemini/Replicate, hero images stay
  Gemini/Reve).
- Reuse the already-confirmed Reve contracts from `TASK_REVE_REMIX_FIX.md` /
  `TASK_REVE_EDIT_FIX.md` — do not re-guess any field names.
- Existing functionality (step images, current hero generation) must keep working unchanged.
- Prefer `str_replace`-style surgical edits over full file rewrites.

---

## Session Start Template
```
Read CLAUDE.md and this file (TASK_VISUAL_SETTINGS_HERO_IMAGE.md).
Reve Remix and Edit contracts are already confirmed and fixed — do not re-test them.
Today's task: PHASE 0 — investigate the existing Generation Settings component (step images)
and the current hero-image provider selector layout.
Make a plan first, do NOT write code yet.
```