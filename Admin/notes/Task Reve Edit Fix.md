# Task: Fix Reve Edit Integration ("Прецизиране с Reve Edit" — Refine button)

> Read CLAUDE.md first for stack, hard rules, DB schema, brand colors.
> This task continues `TASK_REVE_REMIX_FIX.md` (Remix is confirmed working — do not touch it).
> Make a plan first, do NOT write code yet.

---

## Goal
Fix `app/api/refine-recipe-image/route.ts` so the "Refine" button (Reve Edit) works.
Currently fails with `HTTP 400: Missing one or more required parameters` — the route is
almost certainly sending wrong field names (same class of bug Remix had before its fix).

---

## CONFIRMED API CONTRACT (authoritative — do not re-guess any of this)

Source: official Reve API docs (console, behind login).

```
POST https://api.reve.com/v1/image/edit
Headers:
  Authorization: Bearer {REVE_API_KEY}
  Accept: application/json
  Content-Type: application/json

Body:
{
  "edit_instruction": "string, required, max 2560 chars",
  "reference_image": "base64_string",   // required — SINGLE image, NOT an array
  "aspect_ratio": "16:9",                // optional, defaults to reference image's own ratio
  "version": "latest"                    // optional: latest | latest-fast | reve-edit@20250915 | reve-edit-fast@20251030
}
```

**Critical difference from Remix (do not confuse the two):**
| | Remix | Edit |
|---|---|---|
| Text field name | `prompt` | `edit_instruction` |
| Image field name | `reference_images` (array, 1-6) | `reference_image` (singular, one image only) |

**Success response (200):**
```json
{
  "image": "base64_png_string",
  "version": "reve-edit@20250915",
  "content_violation": false,
  "request_id": "rsid-...",
  "credits_used": 30,
  "credits_remaining": 970
}
```

**Failure response (non-200):**
```json
{ "error_code": "string", "message": "string", "params": {} }
```
(`error_code` values include `MISSING_REQUIRED_PARAMETER` — almost certainly what we're
currently hitting.)

**HTTP status codes (official, applies to all Reve endpoints):**
| Code | Meaning | Route should... |
|---|---|---|
| 200 | Success | proceed normally |
| 400 | Bad request — invalid params / malformed request | log `error_code`+`message`; this is the current bug class (`MISSING_REQUIRED_PARAMETER`) |
| 401 | Unauthorized — invalid/missing API key | surface as a config error, do not retry |
| 402 | Insufficient credits — budget ran out | surface a clear, distinct user-facing message: "Reve credits exhausted" — must not look like a generic refine failure |
| 404 | Not found — endpoint/resource doesn't exist | log full URL used; would indicate a typo'd path |
| 422 | Unprocessable content — inputs not understood | distinct from 400; surface `message` to help diagnose |
| 429 | Rate limit exceeded | retryable — see retry guidance below |
| 500 | Internal server error (Reve's side) | retryable — see retry guidance below |

---

## PHASE 0 — Investigation

1. Open `app/api/refine-recipe-image/route.ts` and read the current implementation in full.
2. Identify the exact field names currently being sent to `https://api.reve.com/v1/image/edit`
   and compare against the confirmed contract above — report the mismatch found.
3. Confirm what image the route currently treats as the "reference" for editing. Per the UI
   (Image 3: "Прецизирането запазва оригиналната снимка в Storage при нужда от rollback"), the
   intent is: fetch the recipe's **current `hero_image_url`** (the already-generated image being
   refined), base64-encode it, and send it as `reference_image`. Confirm this matches what the
   route is trying to do (it may currently be sending the wrong source, e.g. component images
   instead of the hero image, or a URL instead of base64).
4. Check whether base64-encoding logic from the Remix fix (`generate-recipe-image/route.ts`) can
   be reused/extracted into a shared helper rather than duplicated.

Report findings before proceeding to Phase 1.

---

## PHASE 1 — Fix the route

1. Fetch the recipe's current `hero_image_url` from Supabase Storage server-side and convert to
   raw base64 (no `data:` prefix) — reuse the existing fetch+base64 logic from the Remix fix if
   possible.
2. Take the user's refine text input (e.g. "искам блатовете да са 4 и крем между тях") and send it
   as `edit_instruction` (not `prompt`).
3. Send the request with the exact contract above:
   ```ts
   const response = await fetch('https://api.reve.com/v1/image/edit', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${process.env.REVE_API_KEY}`,
       'Accept': 'application/json',
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       edit_instruction: editInstructionFromUser,
       reference_image: base64HeroImage,   // singular string, not an array
       version: 'latest',
       // aspect_ratio: omit to preserve the original image's aspect ratio
     }),
   });
   ```
4. On success: extract `data.image` (base64 PNG) → upload to Supabase Storage as a **new** file
   (per the UI copy, the original must be preserved in Storage for rollback — do not overwrite the
   original file path) → update `hero_image_url` to point to the new file.
5. On failure: handle by HTTP status code, not just a generic catch:
   - **402** → return a distinct, user-facing message ("Reve credits exhausted") so the UI's
     refine dialog can show something actionable, not a generic error toast.
   - **401** → log clearly as a configuration error (bad/missing `REVE_API_KEY`), do not retry.
   - **429** or **500** → these are retryable. Implement a single retry with a short delay
     (e.g. 1–2s) before giving up and surfacing the error — do not loop indefinitely.
   - **400** / **422** → indicate a request/input problem. Surface `error_code` + `message`
     verbatim — these are the most useful for confirming this fix actually resolved the
     `MISSING_REQUIRED_PARAMETER` bug, and for catching anything still slightly off.
   - **404** → log the full request URL used.
   In all cases, keep verbose `console.log` step-tracing.

---

## PHASE 2 — End-to-end test

1. Use a recipe that already has a Reve-generated `hero_image_url` (e.g. the one from the Remix
   fix test).
2. Enter a refine instruction (e.g. "искам блатовете да са 4 и крем между тях") and click Refine.
3. Verify: request succeeds, new image reflects the edit, `hero_image_url` updates, original file
   still exists in Storage (rollback path intact).
4. Check `credits_used` in the response log against the ~$0.024/image cost estimate.

---

## Non-negotiables
- Do NOT touch the Remix or Gemini code paths — both are confirmed working.
- Do NOT guess any further field names — the Edit contract above is fully confirmed and final.
- Reuse existing Supabase upload logic where possible rather than duplicating it.
- Preserve the original image in Storage (rollback guarantee shown in the UI copy).
- Keep verbose `console.log` step-tracing in the route.
- Prefer `str_replace`-style surgical edits over full file rewrites.

---

## Session Start Template
```
Read CLAUDE.md and this file (TASK_REVE_EDIT_FIX.md).
The Edit API contract is now fully confirmed — do not re-test or re-guess it.
Remix and Gemini paths both work — do not modify them.
Today's task: PHASE 0 — investigate current refine-recipe-image/route.ts implementation.
Make a plan first, do NOT write code yet.
```