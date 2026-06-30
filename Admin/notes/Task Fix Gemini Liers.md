# Task: Fix Gemini Path — Layer Count Accuracy

> Read CLAUDE.md first. Reve path is confirmed working — do not touch it.
> Make a plan first, do NOT write code yet.

---

## Context
Reve path with `layer_count_override=4` correctly generates 4-layer cakes.
Gemini path with the same override still generates 3 layers, and one attempt produced
a strange horizontal color band on the exterior coating — likely a prompt conflict.

## PHASE 0 — Investigation (answer these before touching any code)

1. Open `generate-recipe-image/route.ts` and find `buildNanoBananaPrompt`. Does it:
   - (a) Use the SAME `layerSection` string returned by `buildDynamicLayerDescription`, OR
   - (b) Still contain its OWN separate hardcoded layer-structure text (the old
     "EXACT LAYER STRUCTURE (bottom to top)" / "ABSOLUTE REQUIREMENTS" / thickness
     constraints that existed before the dynamic block was added)?
   If (b) — paste the relevant hardcoded section verbatim. This is almost certainly the
   root cause of both issues (layer count wrong + exterior color band confusion).

2. Find exactly where the dynamic `layerSection` and `coatingSection` from
   `buildDynamicLayerDescription` get inserted into the Gemini prompt. Is it:
   - Appended at the end (after buildNanoBananaPrompt's own text)?
   - Prepended?
   - Replacing the old hardcoded section?
   If the dynamic block is APPENDED to a prompt that already contains its own
   hardcoded layer structure, the model receives contradictory instructions
   (old text says 3 layers, new text says "repeat 3 more times for 4 total") —
   which explains both observed failures.

3. Check the actual Gemini prompt character count for this recipe with override=4.
   Gemini doesn't have Reve's 2560-char limit, but a bloated prompt with
   contradictory layer instructions hurts quality regardless of length.

Report findings before Phase 1.

---

## PHASE 1 — Fix

**If buildNanoBananaPrompt still has its own hardcoded layer section (expected finding):**
- Remove the hardcoded layer-structure text from buildNanoBananaPrompt entirely.
- Replace it with the same `layerSection` + `coatingSection` from
  `buildDynamicLayerDescription` that Reve already uses — single source of truth,
  same dynamic block for both providers.
- The only difference between Gemini and Reve prompts should be photography/style
  instructions, NOT layer structure logic.

**Verify the fix makes logical sense for the fallback case too:**
- When `assembly_template_id` is NULL (no template linked yet, fallback behavior):
  confirm `buildDynamicLayerDescription` returns a reasonable generic block,
  and that `buildNanoBananaPrompt` handles a null/empty `layerSection` gracefully
  (falls back to some minimal layer description, doesn't crash or produce empty text).

---

## PHASE 2 — Test

1. Generate with Gemini, `layer_count_override=4`, same carrot cake recipe.
2. Confirm in the log: no contradictory layer-structure text in the prompt,
   `[build_prompt]` shows guard passed (not "non-uniform"), expansion applied.
3. Visual check: 4 distinct base layers visible, NO strange color band on exterior.
4. Generate with `layer_count_override=NULL` (natural count) — confirm still works.
5. Regression: confirm Reve path unchanged and still produces correct results.

---

## Non-negotiables
- Do NOT touch Reve path — it works.
- Single source of truth for layer structure: `buildDynamicLayerDescription` for
  BOTH providers, not separate implementations.
- Prefer `str_replace` surgical edits over full rewrites.
- Keep verbose console.log tracing.

---

## Session Start Template
```
Read CLAUDE.md and TASK_GEMINI_LAYER_FIX.md.
Reve path is confirmed working — do not modify it.
Today's task: PHASE 0 — investigate whether buildNanoBananaPrompt still has its own
hardcoded layer-structure text conflicting with the dynamic block.
Make a plan first, do NOT write code yet.
```