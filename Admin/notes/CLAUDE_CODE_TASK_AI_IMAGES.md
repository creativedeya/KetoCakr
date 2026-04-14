# Task: Integrate Nano Banana AI Image Generation in Admin Panel

## Context
KetoCakR admin panel (`C:\Dev\KetoCakr\Admin`) has a recipe generator where admins select 4 components (Base/Cream/Filling/Decoration) to create new assembled recipes. Currently, images must be uploaded manually.

**Goal:** Add automatic AI image generation using Google Gemini Flash Image (Nano Banana) to create professional product shots when creating new recipes.

---

## Reference Implementation
The working prototype is in `/tmp/src/lib/gemini.ts` which uses `@google/genai` SDK. For Next.js backend, we'll use REST API approach instead.

**Prototype Key Details:**
- Uses `gemini-2.5-flash-image` model (fallback to `imagen-4.0-generate-001`)
- Aspect ratio: `1:1` (square images)
- Returns base64 image data
- Optimized prompt structure (see `/tmp/src/App.tsx` lines 25-160)

---

## Implementation Plan

### 1. Create API Route
**File:** `Admin/app/api/generate-recipe-image/route.ts`

**Requirements:**
- POST endpoint accepting `recipe_id` (UUID)
- Fetch recipe components from Supabase:
  ```typescript
  const { data: recipe } = await supabase
    .from('ready_recipes')
    .select(`
      *,
      base:base_recipes!base_recipe_id(name_en, description_en),
      cream:base_recipes!cream_recipe_id(name_en, description_en),
      filling:base_recipes!filling_recipe_id(name_en, description_en),
      decoration:base_recipes!decoration_recipe_id(name_en, description_en)
    `)
    .eq('id', recipe_id)
    .single()
  ```

- Call Google Gemini API:
  ```typescript
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GOOGLE_AI_API_KEY!
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          responseMimeType: 'image/jpeg'
        }
      })
    }
  )
  ```

- Extract base64 image from response:
  ```typescript
  const data = await response.json()
  const imageBase64 = data.candidates[0].content.parts[0].inlineData.data
  const imageBuffer = Buffer.from(imageBase64, 'base64')
  ```

- Upload to Supabase Storage:
  ```typescript
  const fileName = `recipe-${recipe_id}-${Date.now()}.jpg`
  await supabase.storage
    .from('recipe-images')
    .upload(fileName, imageBuffer, {
      contentType: 'image/jpeg',
      upsert: true
    })
  
  const { data: { publicUrl } } = supabase.storage
    .from('recipe-images')
    .getPublicUrl(fileName)
  ```

- Update DB:
  ```typescript
  await supabase
    .from('ready_recipes')
    .update({ image_url: publicUrl })
    .eq('id', recipe_id)
  ```

- Return: `{ success: true, image_url: publicUrl }`

---

### 2. Prompt Generation Function
**Inside API route file:**

```typescript
function buildNanoBananaPrompt(recipe: any): string {
  const layers = []
  
  if (recipe.base?.name_en) {
    layers.push(`Base layer (блат): ${recipe.base.name_en}`)
    if (recipe.base.description_en) {
      layers.push(`  Description: ${recipe.base.description_en}`)
    }
  }
  
  if (recipe.cream?.name_en) {
    layers.push(`Cream layer (крем): ${recipe.cream.name_en}`)
  }
  
  if (recipe.filling?.name_en) {
    layers.push(`Filling layer (плънка): ${recipe.filling.name_en}`)
  }
  
  if (recipe.decoration?.name_en) {
    layers.push(`Decoration (декор): ${recipe.decoration.name_en}`)
  }

  return `Create a professional keto dessert food photography image showing a layered cake with the following components:

${layers.join('\n')}

CRITICAL REQUIREMENTS FOR LAYER STRUCTURE:
- This is a DELICATE layered keto cake where filling and cream layers must be PAPER-THIN
- The base sponge/cake layer is the dominant element
- Filling and cream are ACCENT layers, NOT FEATURE layers

EXACT LAYER STRUCTURE (from bottom to top):
1. Base layer - 18mm thick, moist texture
2. PAPER-THIN cream layer - ONLY 2-3mm (as thin as a coin)
3. PAPER-THIN filling layer - ONLY 2-3mm (thin accent stripe)
4. Base layer - 18mm thick
5. PAPER-THIN cream layer - 2-3mm
6. Base layer - 18mm thick
7. PAPER-THIN filling layer - 2-3mm
8. PAPER-THIN cream layer - 2-3mm
9. Top base layer - 18mm thick
10. Decoration on top and sides

VISUAL REQUIREMENTS:
- Professional product photography with cross-section view showing all layers
- Layers must be clearly visible and distinct
- Camera angle: 45 degrees showing both exterior and interior layers
- One elegant slice removed and placed beside the whole cake
- White marble cake stand (25cm diameter)
- Clean white marble background
- Minimal elegant garnish matching the flavors

PHOTOGRAPHY SPECS:
- Soft natural daylight from window at 45-degree angle (golden hour)
- Professional DSLR quality, 50mm lens, f/2.8 aperture
- Sharp focus on cross-section with shallow depth of field
- High-end patisserie magazine quality
- Warm inviting lighting with soft shadows

ABSOLUTE REQUIREMENTS:
✅ Filling layers MUST be 2-3mm maximum (paper-thin)
✅ Cream layers MUST be 2-3mm maximum (paper-thin)
✅ Base layers MUST be 18mm each (thick and prominent)
✅ All layers perfectly horizontal and evenly distributed
✅ NO hands, people, or body parts visible
✅ NO text, labels, watermarks
✅ Keto-friendly aesthetic (low-carb, sugar-free)
✅ Professional bakery-quality presentation

This is a high-end keto dessert with DELICATE, REFINED layers - not thick and chunky.`
}
```

**Key Differences from Prototype:**
- Adapted for keto desserts (not general patisserie)
- Uses actual DB field names (`name_en`, `description_en`)
- Bilingual context (блат/крем/плънка/декор) for better understanding
- Keto-specific aesthetic requirements

---

### 3. Update Recipe Generator UI
**File:** `Admin/app/recipes/create/page.tsx` (or wherever the form is)

**Add State:**
```typescript
const [generatingImage, setGeneratingImage] = useState(false)
const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
```

**Add Function:**
```typescript
const handleGenerateAIImage = async (recipeId: string) => {
  setGeneratingImage(true)
  
  try {
    const response = await fetch('/api/generate-recipe-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe_id: recipeId })
    })
    
    const data = await response.json()
    
    if (data.success) {
      setGeneratedImageUrl(data.image_url)
      toast.success('AI image generated successfully!')
    } else {
      toast.error(`Failed: ${data.error}`)
    }
  } catch (error) {
    toast.error(`Error: ${error.message}`)
  } finally {
    setGeneratingImage(false)
  }
}
```

**Add UI Component (after recipe creation succeeds):**
```tsx
{createdRecipeId && (
  <div className="mt-6 p-6 border border-gray-200 rounded-lg bg-white">
    <h3 className="text-lg font-semibold mb-4">Recipe Image</h3>
    
    {!generatedImageUrl ? (
      <button
        onClick={() => handleGenerateAIImage(createdRecipeId)}
        disabled={generatingImage}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
      >
        {generatingImage ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Generating AI Image (20-30s)...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>✨ Generate AI Product Shot</span>
          </>
        )}
      </button>
    ) : (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-green-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Image Generated Successfully!</span>
        </div>
        <img 
          src={generatedImageUrl} 
          alt="Generated recipe" 
          className="w-full max-w-md rounded-lg shadow-lg"
        />
        <p className="text-sm text-gray-500">
          Image saved to database: <code className="bg-gray-100 px-2 py-1 rounded">{generatedImageUrl}</code>
        </p>
      </div>
    )}
  </div>
)}
```

---

### 4. Environment Variables
**File:** `Admin/.env.local`

Add:
```bash
GOOGLE_AI_API_KEY=your_api_key_here
```

**To get API key:**
1. Go to https://aistudio.google.com/apikey
2. Create new API key
3. Copy and paste into `.env.local`

---

### 5. Supabase Storage Setup
Ensure bucket exists:

```sql
-- Run in Supabase SQL Editor if bucket doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set public access policy
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'recipe-images');
```

---

## Testing Checklist

### API Route Test
```bash
# Test API route manually
curl -X POST http://localhost:3000/api/generate-recipe-image \
  -H "Content-Type: application/json" \
  -d '{"recipe_id": "your-test-recipe-uuid"}'
```

### Expected Response
```json
{
  "success": true,
  "image_url": "https://your-project.supabase.co/storage/v1/object/public/recipe-images/recipe-xxx-123456789.jpg"
}
```

### UI Flow Test
1. Navigate to recipe creation page
2. Select 4 components (Base, Cream, Filling, Decoration)
3. Click "Generate Recipe" → new recipe created
4. Click "✨ Generate AI Product Shot" button
5. Wait 20-30 seconds (loading spinner visible)
6. Image appears below button
7. Check DB: `ready_recipes.image_url` updated
8. Check Supabase Storage: file exists in `recipe-images` bucket

---

## Error Handling

### Common Issues & Solutions

**1. API Key Invalid**
```typescript
// In API route
if (!process.env.GOOGLE_AI_API_KEY) {
  return NextResponse.json({ 
    error: 'GOOGLE_AI_API_KEY not configured' 
  }, { status: 500 })
}
```

**2. Recipe Not Found**
```typescript
if (!recipe) {
  return NextResponse.json({ 
    error: 'Recipe not found' 
  }, { status: 404 })
}
```

**3. Image Generation Failed**
```typescript
if (!response.ok) {
  const errorText = await response.text()
  throw new Error(`Gemini API error: ${errorText}`)
}
```

**4. Upload Failed**
```typescript
if (uploadError) {
  throw new Error(`Supabase upload failed: ${uploadError.message}`)
}
```

---

## Cost Estimation

**Google Gemini Flash Image Pricing:**
- Input: $0.0 per 1M tokens (text prompts are free)
- Output: $0.067 per image (1024px)

**Estimated Usage:**
- 1 recipe = 1 image generation = $0.067
- 100 recipes/month = $6.70
- 500 recipes/month = $33.50

**Budget Recommendation:** Start with $50/month limit

---

## File Locations Reference

```
Admin/
├── app/
│   ├── api/
│   │   └── generate-recipe-image/
│   │       └── route.ts          ← CREATE THIS
│   └── recipes/
│       └── create/
│           └── page.tsx           ← UPDATE THIS
├── .env.local                     ← ADD GOOGLE_AI_API_KEY
└── lib/
    └── supabase.ts                ← (already exists)
```

---

## Dependencies Check

Ensure these are installed:
```bash
cd Admin
npm install
```

No additional packages needed - Next.js has built-in `fetch` and `Buffer` support.

---

## Execution Order

1. **Setup:** Add `GOOGLE_AI_API_KEY` to `.env.local`
2. **Backend:** Create `app/api/generate-recipe-image/route.ts`
3. **Frontend:** Update recipe creation page with UI components
4. **Storage:** Verify `recipe-images` bucket exists in Supabase
5. **Test:** Create test recipe and generate image
6. **Debug:** Check console logs, network tab, Supabase storage

---

## Success Criteria

✅ API route responds in ~20-30 seconds  
✅ Generated image shows clear layer cross-section  
✅ Image uploaded to Supabase Storage  
✅ `ready_recipes.image_url` updated in DB  
✅ UI shows loading state during generation  
✅ Error states handled gracefully  
✅ Image quality matches prototype (professional food photography)

---

## Notes for Claude Code

- Project path: `C:\Dev\KetoCakr\Admin`
- Use existing Supabase client from `lib/supabase.ts`
- Follow Next.js 14 App Router conventions
- Match existing UI component patterns in the admin panel
- Add proper TypeScript types
- Include error boundaries and loading states
- Test on localhost before deploying

**Priority:** Create working API route first, then add UI components.