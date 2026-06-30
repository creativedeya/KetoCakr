# Task: Fix Reve Remix Integration (Admin Panel — Hero Image Generation)

> Read CLAUDE.md first for stack, hard rules, DB schema, brand colors.
> This task continues `TASK_REVE_API_INTEGRATION.md` / `SESSION_REPORT_REVE_INTEGRATION.md`.
> Make a plan first, do NOT write code yet.

---

## Goal
Fix `generateWithReve()` in `app/api/generate-recipe-image/route.ts` so the **Remix**
endpoint works end-to-end with real component reference images, using the now-fully-confirmed
API contract below. Do not touch the Gemini path — it works and must keep working.

---

## CONFIRMED API CONTRACT (authoritative — do not re-guess any of this)

Source: official Reve API docs (console, behind login) + manual curl.exe verification.

```
POST https://api.reve.com/v1/image/remix
Headers:
  Authorization: Bearer {REVE_API_KEY}
  Accept: application/json
  Content-Type: application/json

Body:
{
  "prompt": "string, required, max 2560 chars",
  "reference_images": ["base64_string", ...],   // required, 1-6 images
  "aspect_ratio": "1:1",                          // optional: 16:9 | 9:16 | 3:2 | 2:3 | 4:3 | 3:4 | 1:1
  "version": "latest"                             // optional: latest | latest-fast | reve-remix@20250915 | reve-remix-fast@20251030
}
```

**`reference_images` rules:**
- Raw base64 strings, **no** `data:image/...;base64,` prefix
- Each image: max 40 MB, max 33,554,432 pixels
- Across all images combined: max 100 MB total, max 50,331,648 pixels total
- Accepted input formats: JPEG, PNG, GIF, **WebP**, TIFF, AVIF — **no conversion needed**,
  Supabase Storage WebP files can be base64-encoded and sent as-is

**Success response (200):**
```json
{
  "image": "base64_png_string",
  "version": "reve-remix@20250915",
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

**Verified working** via `curl.exe` (real 1.59MB WebP component image → HTTP 200, valid image returned).

### ⚠️ Important debugging note — do not be misled by this
During manual testing, **PowerShell's `Invoke-WebRequest`** (and `curl` alias to it) failed with an
empty-body `404 NotFound` on this exact same payload that succeeded via real `curl.exe`. This was a
**PowerShell HTTP client artifact, not a Reve API or code issue.** Node's native `fetch()` (used in
the actual route) does not exhibit this problem — no defensive workaround is needed in the route code
for this. Mentioned only so it isn't re-investigated.

---

## PHASE 0 — Investigation (do this before writing any code)

1. Open `app/api/generate-recipe-image/route.ts` and read the current `generateWithReve()`
   implementation in full.
2. Confirm current state matches the session report:
   - Currently uses `image_urls` field name → must become `reference_images`
   - Currently sends public Supabase Storage URLs → must become base64-encoded image data
   - Check whether `Accept: application/json` header is currently set (docs example sets it
     explicitly — add it if missing)
3. Open `app/api/refine-recipe-image/route.ts` and `.env.local` — locate all `AIML_API_KEY` /
   `api.aimlapi.com` references for removal in Phase 2.
4. Confirm how component reference images are currently selected/ordered (which components —
   base/cream/filling/decoration — map to which `image_url` fields) before changing the array
   construction logic.

Report findings before proceeding to Phase 1.

---

## PHASE 1 — Fix `generateWithReve()` (Remix path)

1. For each recipe component that has an `image_url`, fetch the image server-side:
   ```ts
   const res = await fetch(componentImageUrl);
   const buffer = await res.arrayBuffer();
   const base64 = Buffer.from(buffer).toString('base64'); // raw, no data: prefix
   ```
2. Build `reference_images` array from these base64 strings (max 6 — if more than 6 components
   somehow exist, cap at 6 and log a warning, don't error).
3. Send the request with the exact contract above:
   ```ts
   const response = await fetch('https://api.reve.com/v1/image/remix', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${process.env.REVE_API_KEY}`,
       'Accept': 'application/json',
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       prompt,
       reference_images,
       version: 'latest',
       // aspect_ratio: omit to let the model choose, unless we want to force one
     }),
   });
   ```
4. On success: extract `data.image` (base64 PNG) → reuse the **existing** Supabase upload +
   `hero_image_url` update logic already used by the Gemini path. Do not duplicate this logic.
5. On failure: surface `error_code` + `message` from the response body in the API route's error
   return, and keep the verbose `console.log` step-tracing already established in this route.
6. Keep the existing fallback: if a recipe has no component images at all, fall back to
   `/v1/image/create` (Create endpoint) exactly as currently implemented — that path is unaffected
   by this fix.

---

## PHASE 2 — Cleanup

1. Remove `AIML_API_KEY` from `.env.local`.
2. Remove all AIML-related code paths/comments from `generate-recipe-image/route.ts` and
   `refine-recipe-image/route.ts` (the false-start mentioned in the session report — we use the
   native Reve API directly, not the AIML reseller).

---

## PHASE 3 — End-to-end test

1. Pick a real recipe with 2–4 components that have `image_url` set.
2. Trigger Remix generation from the admin UI (provider = Reve).
3. Verify: request succeeds, `hero_image_url` updates correctly, image renders in the UI.
4. Verify the Gemini path is still completely unaffected (switch provider toggle, regenerate,
   confirm it still works exactly as before).
5. Check `credits_used` / `credits_remaining` in the response log to confirm real-world cost
   matches the ~$0.024/image (18-30 credits) estimate from the session report.

---

## Out of scope for this task (do not touch)

- **Edit endpoint** (`/v1/image/edit` / `refine-recipe-image/route.ts` logic) — contract not yet
  confirmed via docs or curl. Needs its own curl-first verification pass before any code changes,
  per the project's established debugging pattern (confirm via terminal before coding).
- `aspect_ratio` and `postprocessing` parameters — available per docs but not required for this
  fix; can be added in a later iteration if a specific need arises (e.g. forcing a square hero
  image crop via `aspect_ratio: "1:1"`).

---

## Non-negotiables
- Do NOT remove or break the existing Gemini integration.
- Do NOT guess any further field names — the Remix contract above is fully confirmed and final.
- Reuse existing Supabase upload + `hero_image_url` update logic rather than duplicating it.
- Keep verbose `console.log` step-tracing in the routes.
- Prefer `str_replace`-style surgical edits over full file rewrites.

---

## Session Start Template
```
Read CLAUDE.md and this file (TASK_REVE_REMIX_FIX.md).
The Remix API contract is now fully confirmed — do not re-test or re-guess it.
Today's task: PHASE 0 — investigate current generateWithReve() implementation.
Make a plan first, do NOT write code yet.
```