# Task: Add Reve API as Image Generation Provider

## Context
The admin panel already has working AI image generation for `ready_recipes` using Gemini (`app/api/generate-recipe-image/route.ts`). Manual testing (outside this codebase) showed that **Reve API**, especially its **Remix** endpoint (text + reference images), produces significantly better results than Gemini for this use case — closer match to real component colors/textures, thinner filling layers, cleaner edits.

**Goal:** Add Reve as a selectable provider alongside Gemini, with three capabilities:
1. **Remix** — when all 4 selected components (base/cream/filling/decoration) have existing photos → use those photos as reference images
2. **Create** — fallback when components are missing photos → text-only prompt
3. **Edit** — "Refine" feature: apply a text instruction to an already-generated hero image (e.g. "remove the cream dollop", "make the glaze glossier")

---

## ⚠️ PHASE 0 — MANDATORY: Verify Exact Reve API Contract Before Writing Code

We do NOT have confirmed exact endpoint paths/payload shapes for the official Reve API (`https://api.reve.com/v1/`) — only that Create/Edit/Remix exist conceptually, and that the API is credit-based ($10 minimum = 7,500 credits = 1,500 images, i.e. ~$0.0067/image).

**Before writing any integration code:**

1. Log into `https://api.reve.com/console` → **Docs** tab → copy the exact curl/code examples for:
   - Create endpoint (text → image)
   - Remix endpoint (text + multiple reference image URLs/files → image)
   - Edit endpoint (text + single image → modified image)
2. Note the exact:
   - Endpoint URL paths
   - Auth header format (likely `Authorization: Bearer <REVE_API_KEY>`, but confirm)
   - Request body field names (e.g. is it `image_urls` or `images` or multipart file upload? Does it accept public URLs or require base64/binary upload?)
   - Response shape (URL returned vs base64)
3. **Test each endpoint manually with curl/Postman first**, using a real `REVE_API_KEY`, before integrating into Next.js. Confirm a 200 response and a usable image before writing route code.

If the Docs tab requires images to be uploaded as binary/multipart rather than passed as public URLs, the integration below must fetch the image bytes from Supabase Storage first and forward them as multipart form-data instead of JSON URLs — adjust accordingly once confirmed.

**Do not guess endpoint paths.** Use whatever is confirmed in step 1-3. The payload shapes below are best-effort placeholders to illustrate intent — replace with the confirmed contract.

---

## Implementation Plan (adjust per confirmed Reve contract)

### 1. Environment Variable
**File:** `Admin/.env.local`
```bash
REVE_API_KEY=your_reve_api_key_here
```

---

### 2. Extend the Existing API Route
**File:** `app/api/generate-recipe-image/route.ts`

Add a `provider` field to the POST body (default `"reve"`):
```typescript
interface RequestBody {
  recipe_id: string;
  provider?: 'gemini' | 'reve'; // default: 'reve'
}
```

**Routing logic:**
```typescript
const provider = body.provider ?? 'reve';

if (provider === 'reve') {
  return await generateWithReve(recipe, baseRecipes);
} else {
  return await generateWithGemini(recipe, baseRecipes); // existing logic, keep as-is
}
```

Keep all existing Gemini code working exactly as it is today — this is additive, not a replacement.

---

### 3. Reve Generation Logic

```typescript
async function generateWithReve(recipe: any, baseRecipes: any[]) {
  console.log('[reve] Starting Reve generation for recipe:', recipe.id)

  // Check if ALL components have a usable image_url
  const componentImageUrls = baseRecipes
    .map(r => r.image_url)
    .filter(Boolean)

  const hasAllImages = componentImageUrls.length === baseRecipes.length && baseRecipes.length > 0

  console.log(`[reve] ${componentImageUrls.length}/${baseRecipes.length} components have images`)

  if (hasAllImages) {
    console.log('[reve] Using REMIX endpoint with reference images')
    return await reveRemix(recipe, baseRecipes, componentImageUrls)
  } else {
    console.log('[reve] Missing some component images — falling back to CREATE (text-only)')
    return await reveCreate(recipe, baseRecipes)
  }
}
```

---

### 4. Prompt Builder (generalized from manual Sachertorte/Red Velvet tests)

```typescript
function buildReveRemixPrompt(baseRecipes: any[]): string {
  // Map recipe_role_id to role name and reference image index
  // 1 = Base (Блат), 2 = Cream (Крем), 3 = Filling (Плънка), 4 = Decoration (Декор)
  const roleMap: Record<number, string> = {
    1: 'sponge/base layer',
    2: 'cream/coating layer',
    3: 'filling layer',
    4: 'decoration/topping'
  }

  const refDescriptions = baseRecipes.map((r, i) => {
    const role = roleMap[r.recipe_role_id] || 'component'
    return `- Reference Image ${i + 1}: This is the ${role} ("${r.name_en}"). Use its exact color, texture, and consistency for this part of the cake.`
  }).join('\n')

  return `Combine these reference images into a professional bakery food photography shot of a layered keto cake, shown as a cross-section view with one slice removed and placed beside the whole cake.

USE THE EXACT VISUAL CHARACTERISTICS FROM EACH REFERENCE IMAGE:
${refDescriptions}

CRITICAL LAYER STRUCTURE:
- Base/sponge layers: thick (18mm each), dominant element, matching their reference image's crumb texture and color exactly
- Filling and cream layers: PAPER-THIN (2-3mm max), like a thin ribbon — NOT a thick band
- Outer coating/decoration: matching its reference image's exact color and finish

PLATING & COMPOSITION:
- White marble round cake stand, clean white marble background
- One elegant slice cut and placed beside the whole cake, same cross-section visible
- Camera angle: 45 degrees from the side
- Soft natural daylight, golden hour aesthetic
- Professional DSLR quality, shallow depth of field, magazine-quality bakery photography

ABSOLUTE REQUIREMENTS:
✅ Filling/cream layers MUST be paper-thin (2-3mm max)
✅ Base layers MUST be thick (18mm each)
✅ Colors and textures MUST match the reference images precisely, not generic interpretations
✅ No hands, no people, no text overlays beyond what appears in reference images, no watermarks
✅ Square aspect ratio composition

This is a refined keto dessert for Emma's Cake Studio — built precisely from the reference images provided.`
}

function buildReveCreatePrompt(baseRecipes: any[]): string {
  // Same structure as buildReveRemixPrompt but describing components by name/description
  // instead of "Reference Image N" since there are no images to reference.
  // Reuse logic adapted from the existing Gemini buildNanoBananaPrompt() function.
}
```

---

### 5. Reve API Calls (PLACEHOLDER — replace with confirmed contract from Phase 0)

```typescript
async function reveRemix(recipe: any, baseRecipes: any[], imageUrls: string[]) {
  const prompt = buildReveRemixPrompt(baseRecipes)

  console.log('[reve_remix] Calling Reve Remix endpoint')
  const response = await fetch('https://api.reve.com/v1/REPLACE_WITH_CONFIRMED_PATH', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.REVE_API_KEY}`
    },
    body: JSON.stringify({
      prompt,
      image_urls: imageUrls, // CONFIRM: field name + whether URLs or base64/multipart required
      aspect_ratio: '1:1'
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    console.error('[reve_remix] HTTP', response.status, errText)
    throw new Error(`Reve Remix error: ${errText}`)
  }

  const data = await response.json()
  console.log('[reve_remix] Success')
  return data // CONFIRM: shape — image URL vs base64
}

async function reveCreate(recipe: any, baseRecipes: any[]) {
  const prompt = buildReveCreatePrompt(baseRecipes)

  console.log('[reve_create] Calling Reve Create endpoint')
  const response = await fetch('https://api.reve.com/v1/REPLACE_WITH_CONFIRMED_PATH', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.REVE_API_KEY}`
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: '1:1'
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    console.error('[reve_create] HTTP', response.status, errText)
    throw new Error(`Reve Create error: ${errText}`)
  }

  return await response.json()
}
```

After getting the image (URL or base64) from Reve, reuse the **existing** upload-to-Supabase-Storage + `hero_image_url` update logic already present in the Gemini path — do not duplicate it, extract it into a shared helper:

```typescript
async function saveGeneratedImage(recipeId: string, imageData: string | Buffer, sourceLabel: string) {
  // Existing upload + DB update logic, extracted from current Gemini implementation
  // fileName pattern: recipe-{id}-{ts}.jpg (keep consistent with existing files)
  // Update ready_recipes.hero_image_url
}
```

---

### 6. New Endpoint: Refine (Edit)
**File:** `app/api/refine-recipe-image/route.ts` (new file)

```typescript
// POST { recipe_id: string, instruction: string }
// 1. Fetch ready_recipes.hero_image_url for this recipe (must already exist)
// 2. Call Reve Edit endpoint with that image + the instruction text
// 3. Upload result to Supabase Storage (new filename, don't overwrite old one in case of rollback)
// 4. Update ready_recipes.hero_image_url to the new image
// 5. Return { success: true, image_url }
```

Use the same Phase 0 verification approach — confirm Edit endpoint's exact contract (does it take an image URL or require upload of image bytes?) before implementing.

---

### 7. UI Changes
**File:** `app/dashboard/ready-recipes/new/page.tsx` and `[id]/edit/page.tsx`

**A. Provider selector** (above the "Generate AI Image" button):
```tsx
<div className="flex gap-2 mb-3">
  <button
    onClick={() => setProvider('reve')}
    className={provider === 'reve' ? 'active-style' : 'inactive-style'}
  >
    ✨ Reve (recommended)
  </button>
  <button
    onClick={() => setProvider('gemini')}
    className={provider === 'gemini' ? 'active-style' : 'inactive-style'}
  >
    Gemini
  </button>
</div>
```
Pass `provider` in the existing `generateHeroImage()` fetch body.

**B. Refine input** (shown only after an image has been generated):
```tsx
{generatedImageUrl && (
  <div className="mt-4 flex gap-2">
    <input
      type="text"
      value={refineInstruction}
      onChange={(e) => setRefineInstruction(e.target.value)}
      placeholder="напр. 'премахни декорацията със сметана'"
      className="flex-1 border rounded-lg px-3 py-2"
    />
    <button onClick={handleRefine} disabled={!refineInstruction.trim() || refining}>
      {refining ? 'Обработка...' : 'Refine'}
    </button>
  </div>
)}
```

`handleRefine()` calls `POST /api/refine-recipe-image` with `{ recipe_id, instruction: refineInstruction }`, then updates `generatedImageUrl` with the response on success.

---

## Testing Checklist

1. **Phase 0 curl tests pass** for Create, Remix, Edit — confirmed before any route code written
2. Create a test recipe where all 4 components already have `image_url` set → generation should log `[reve] Using REMIX endpoint` and produce an image visually similar to the component photos
3. Create a test recipe where one component is missing an image → should log `[reve] ... falling back to CREATE`
4. After a successful generation, use the Refine box with an instruction (e.g. "remove the berries on top") → new image should reflect the change, old image should still exist in Storage (not deleted)
5. Switch provider to Gemini → confirm existing Gemini path still works unchanged
6. Check `ready_recipes.hero_image_url` updates correctly in all cases
7. Check Supabase Storage for new files in each case

---

## Cost Reference (already confirmed)
- Reve: ~$0.0067/image (5 credits × $0.00133/credit), minimum prepaid $10 = 1,500 images
- Gemini: ~$0.067/image (kept as secondary option)

## Non-Negotiables
- Do NOT remove or break the existing Gemini integration — it stays as a working fallback/comparison option
- Do NOT guess Reve's endpoint contract — verify via Docs tab + curl first (Phase 0)
- Reuse the existing Supabase upload + `hero_image_url` update logic rather than duplicating it
- Keep the same verbose `console.log` step-tracing style used in the Gemini route — it was essential for debugging last time