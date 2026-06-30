# Session Report — Reve API Integration (Image Generation)
**Date:** 2026-06-24
**Status:** In progress — Create endpoint confirmed working, Remix endpoint blocked on image input format

---

## Goal
Add Reve API as a selectable image-generation provider (alongside existing Gemini) for `ready_recipes` hero images, using Reve's **Remix** endpoint to leverage existing component photos (base/cream/filling/decoration) as reference images for higher-fidelity results.

---

## Why Reve (background)
Manual side-by-side testing (outside the codebase, via Reve's Playground/Create + Remix) showed Reve significantly outperforms Gemini for this use case:
- Thinner, more accurate filling/cream layers (2-3mm vs Gemini's 5-8mm)
- Remix with real component reference photos produced near-exact color/texture match (tested with Red Velvet and Sachertorte combinations)
- Edit endpoint cleanly removed an unwanted decoration element with no artifacts

Decision made: Reve becomes primary provider; Gemini stays as secondary/comparison option via a provider toggle in the UI.

---

## Confirmed API Contract (via manual PowerShell testing — DO NOT re-guess these)

### `POST https://api.reve.com/v1/image/create`
**Auth:** `Authorization: Bearer {REVE_API_KEY}`
**Request:**
```json
{ "prompt": "..." }
```
**Response (200):**
```json
{
  "image": "base64_encoded_png_string",
  "content_violation": false,
  "request_id": "rsid-...",
  "version": "reve-create@20250915",
  "credits_used": 18,
  "credits_remaining": 7464
}
```
✅ **Confirmed working end-to-end.**

### `POST https://api.reve.com/v1/image/remix`
**Auth:** same as above
**Request field name confirmed:** `reference_images` (NOT `image_urls` — that was the first wrong guess)
```json
{ "prompt": "...", "reference_images": [...] }
```
**Current blocker:** Sending public Supabase Storage **URLs** as strings in `reference_images` returns:
```json
{
  "error_code": "IMAGE_FORMAT_UNSUPPORTED",
  "message": "The image format in the request is corrupt or not supported."
}
```
**Working hypothesis (untested at session end):** `reference_images` likely expects **base64-encoded image data**, not URLs. Next test: fetch a real component image (e.g. from Supabase Storage), convert to base64, send as a single-element array, see if `IMAGE_FORMAT_UNSUPPORTED` clears.

The code was updated (after this session ended) to do server-side URL→base64 conversion. Format tried: raw base64 string (no `data:` prefix). If that still fails, try with `data:image/jpeg;base64,` prefix — the route logs exactly what format is being sent.

### `POST https://api.reve.com/v1/image/edit`
**Not yet tested directly.** Likely needs the same base64 pattern as Remix once confirmed — verify field name before assuming `image_url`/`image`/`reference_image`.

The code uses `{ prompt, image_url }` — confirm via manual test and adjust if rejected.

---

## Pricing (corrected from earlier estimate)
- Earlier estimate from marketing copy: ~$0.0067/image (5 credits)
- **Actual confirmed cost from a real Create call: 18 credits/image**
- 1 credit = $10 ÷ 7,500 = $0.00133
- **Real cost: 18 × $0.00133 ≈ $0.024/image** (still ~2.8x cheaper than Gemini's ~$0.067/image, not 10x as first estimated)

---

## Code State (end of session)
Files modified in `Admin/`:

| File | State |
|------|-------|
| `app/api/generate-recipe-image/route.ts` | Has `provider` param (gemini/reve), `generateWithGemini()` (unchanged, working). `reveCreate()` → `/v1/image/create`, confirmed working. `reveRemix()` → `/v1/image/remix` with `reference_images` field + server-side URL-to-base64 conversion. **Needs end-to-end test.** |
| `app/api/refine-recipe-image/route.ts` | Route for Edit endpoint. Contract NOT yet manually confirmed — field names may need adjustment. |
| `app/dashboard/ready-recipes/[id]/edit/page.tsx` | Provider selector (Reve/Gemini) added, Refine input box added. |
| `app/dashboard/ready-recipes/new/page.tsx` | Provider selector added; Reve shows a warning to save the recipe first. |
| `.env.local` | Has `REVE_API_KEY` (confirmed valid). AIML_API_KEY references fully removed. |

---

## Next Session — Action Items (in order)

1. **Test Remix base64 input.** Restart dev server → open a recipe where all 4 components have `image_url` → select Reve → Generate. Check server logs for `[reve_remix]` step — does `IMAGE_FORMAT_UNSUPPORTED` persist?
   - If yes: try adding `data:image/jpeg;base64,` prefix to each entry in `reference_images`
   - If still failing: log the raw Reve response and paste it here
2. **Confirm Edit endpoint contract** via manual PowerShell test (like we did for Create) before trusting the current field names in `refine-recipe-image/route.ts`
3. **Re-test end-to-end:** Create path (missing images) → Create fallback logs, valid image returned, `hero_image_url` updated
4. **Test Refine (Edit) end-to-end** once contract confirmed
5. **Update `PROJECT_STATUS.md`** once both Reve paths are fully working

---

## Non-Negotiables (carried over)
- Do NOT remove or break the existing Gemini integration
- Do NOT guess Reve endpoint field names — verify via curl/PowerShell first
- Reuse existing Supabase upload + `hero_image_url` update logic rather than duplicating it
- Keep verbose `console.log` step-tracing in the routes — it has been essential for debugging every step so far
