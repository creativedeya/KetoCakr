// =====================================================
// FILE: admin/app/api/generate-recipe-image/route.ts
// Generate AI hero image for a ready_recipe using
// Google Gemini Flash Image (Nano Banana)
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY!

const ROLE_NAMES: Record<number, { bg: string; en: string }> = {
  1: { bg: 'блат', en: 'Base' },
  2: { bg: 'крем', en: 'Cream' },
  3: { bg: 'плънка', en: 'Filling' },
  4: { bg: 'декор', en: 'Decoration' },
}

function buildNanoBananaPrompt(
  components: Array<{ roleId: number; nameEn: string; descriptionEn?: string }>
): string {
  const layers: string[] = []

  for (const comp of components) {
    const roleName = ROLE_NAMES[comp.roleId]
    if (!roleName) continue
    layers.push(`${roleName.en} layer (${roleName.bg}): ${comp.nameEn}`)
    if (comp.descriptionEn) {
      layers.push(`  Description: ${comp.descriptionEn}`)
    }
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

function errResponse(error: string, details: string, step: string, status: number) {
  console.error(`❌ [${step}] ${error}: ${details}`)
  return NextResponse.json({ success: false, error, details, step }, { status })
}

export async function POST(request: NextRequest) {
  console.log('\n========================================')
  console.log('🎨 generate-recipe-image: request start')
  console.log('========================================')

  // ── Step 0: parse body ──────────────────────────────
  let recipe_id: string
  try {
    const body = await request.json()
    recipe_id = body?.recipe_id
    console.log(`[parse_body] recipe_id = ${recipe_id}`)
  } catch (err: any) {
    return errResponse('Invalid request body', err.message, 'parse_body', 400)
  }

  if (!recipe_id) {
    return errResponse('Missing recipe_id', 'recipe_id is required in the request body', 'parse_body', 400)
  }

  // ── Step 1: env check ───────────────────────────────
  console.log('[env_check] GOOGLE_AI_API_KEY present:', !!GOOGLE_AI_API_KEY)
  console.log('[env_check] SUPABASE_URL present:', !!SUPABASE_URL)
  console.log('[env_check] SUPABASE_SERVICE_KEY present:', !!SUPABASE_SERVICE_KEY)

  if (!GOOGLE_AI_API_KEY) {
    return errResponse('API key not configured', 'GOOGLE_AI_API_KEY is missing from .env.local', 'env_check', 500)
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return errResponse('Supabase not configured', 'NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing', 'env_check', 500)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // ── Step 2: fetch ready_recipe ──────────────────────
  console.log(`[fetch_recipe] Fetching ready_recipe id=${recipe_id}`)
  let recipe: { id: string; name_en: string; name_bg: string; selected_components: any } | null = null
  try {
    const { data, error } = await supabase
      .from('ready_recipes')
      .select('id, name_en, name_bg, selected_components')
      .eq('id', recipe_id)
      .single()

    if (error) {
      console.error('[fetch_recipe] Supabase error:', error)
      return errResponse(`Recipe not found: ${recipe_id}`, error.message, 'fetch_recipe', 404)
    }
    if (!data) {
      return errResponse(`Recipe not found: ${recipe_id}`, 'No row returned', 'fetch_recipe', 404)
    }
    recipe = data
    console.log(`[fetch_recipe] Found: "${recipe.name_en || recipe.name_bg}"`)
    console.log(`[fetch_recipe] selected_components type: ${typeof recipe.selected_components}`)
    console.log(`[fetch_recipe] selected_components:`, JSON.stringify(recipe.selected_components))
  } catch (err: any) {
    console.error('[fetch_recipe] Unexpected error:', err)
    return errResponse('Recipe fetch failed', err.message, 'fetch_recipe', 500)
  }

  // ── Step 3: parse components ────────────────────────
  console.log('[parse_components] Parsing selected_components...')
  let selectedComponents: Array<{ recipe_role_id: number; base_recipe_id: string }> = []
  try {
    const raw = recipe.selected_components
    if (!raw) {
      return errResponse('Invalid components data', 'selected_components is null — recipe was saved without components', 'parse_components', 400)
    }
    selectedComponents = Array.isArray(raw) ? raw : JSON.parse(raw)
    console.log(`[parse_components] ${selectedComponents.length} component(s):`, selectedComponents.map(c => `role=${c.recipe_role_id} id=${c.base_recipe_id}`))
  } catch (err: any) {
    console.error('[parse_components] Parse error:', err)
    return errResponse('Invalid components data', `Could not parse selected_components: ${err.message}`, 'parse_components', 400)
  }

  const recipeIds = selectedComponents.map(c => c.base_recipe_id).filter(Boolean)
  if (recipeIds.length === 0) {
    return errResponse('Invalid components data', 'No valid base_recipe_id values found in selected_components', 'parse_components', 400)
  }

  // ── Step 4: fetch base recipes ──────────────────────
  console.log(`[fetch_base_recipes] Fetching ${recipeIds.length} base recipe(s):`, recipeIds)
  let baseRecipes: Array<{ id: string; name: string; name_en: string; description_en: string; recipe_role_id: number }> = []
  try {
    const { data, error } = await supabase
      .from('base_recipes')
      .select('id, name, name_en, description_en, recipe_role_id')
      .in('id', recipeIds)

    if (error) {
      console.error('[fetch_base_recipes] Supabase error:', error)
      return errResponse('Fetch base recipes failed', error.message, 'fetch_base_recipes', 500)
    }
    baseRecipes = data || []
    console.log(`[fetch_base_recipes] Got ${baseRecipes.length}/${recipeIds.length} base recipes`)
    baseRecipes.forEach(br => console.log(`  → role=${br.recipe_role_id} "${br.name_en || br.name}"`))
  } catch (err: any) {
    console.error('[fetch_base_recipes] Unexpected error:', err)
    return errResponse('Fetch base recipes failed', err.message, 'fetch_base_recipes', 500)
  }

  // ── Step 5: build prompt ────────────────────────────
  const promptComponents = selectedComponents
    .map(comp => {
      const base = baseRecipes.find(br => br.id === comp.base_recipe_id)
      if (!base) {
        console.warn(`[build_prompt] No base recipe found for id=${comp.base_recipe_id}`)
        return null
      }
      return {
        roleId: comp.recipe_role_id,
        nameEn: base.name_en || base.name,
        descriptionEn: base.description_en || undefined,
      }
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .sort((a, b) => a.roleId - b.roleId)

  if (promptComponents.length === 0) {
    return errResponse('Invalid components data', 'None of the component base_recipe_ids matched any base_recipe rows', 'build_prompt', 400)
  }

  const prompt = buildNanoBananaPrompt(promptComponents)
  console.log(`[build_prompt] Prompt built (${prompt.length} chars) for ${promptComponents.length} component(s)`)

  // ── Step 6 + 7: call image API with fallback ────────
  // Primary: gemini-2.5-flash-image (generateContent)
  // Fallback: imagen-3.0-generate-001 (generateImages)
  console.log(`[image_api] API key prefix: ${GOOGLE_AI_API_KEY.slice(0, 8)}...`)

  let imageBase64: string
  let mimeType: string

  // ── 6a: try gemini-2.5-flash-image ──────────────────
  const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent'
  console.log(`[gemini_call] POST ${geminiUrl}`)
  try {
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GOOGLE_AI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
        },
      }),
    })

    const rawBody = await geminiResponse.text()
    console.log(`[gemini_call] HTTP ${geminiResponse.status} ${geminiResponse.statusText}`)

    if (!geminiResponse.ok) {
      let details: string
      try { details = JSON.parse(rawBody)?.error?.message || rawBody } catch { details = rawBody }
      console.warn(`[gemini_call] Failed (${geminiResponse.status}): ${details} — will try fallback`)
      throw new Error(details)
    }

    let geminiData: any
    try {
      geminiData = JSON.parse(rawBody)
    } catch {
      console.warn('[gemini_call] Non-JSON response — will try fallback')
      throw new Error('non-JSON response')
    }

    console.log(`[gemini_call] candidates: ${geminiData?.candidates?.length ?? 0}`)
    console.log(`[gemini_call] finishReason: ${geminiData?.candidates?.[0]?.finishReason}`)

    const parts: any[] = geminiData?.candidates?.[0]?.content?.parts ?? []
    parts.forEach((p, i) => {
      console.log(`[gemini_call] part[${i}] keys: ${Object.keys(p).join(', ')}`)
      if (p.inlineData) console.log(`  mimeType=${p.inlineData.mimeType}, data length=${p.inlineData.data?.length ?? 0}`)
    })

    const imagePart = parts.find((p: any) => p.inlineData?.data)
    if (!imagePart) {
      const finishReason = geminiData?.candidates?.[0]?.finishReason
      console.warn(`[gemini_call] No inlineData in parts. finishReason=${finishReason} — will try fallback`)
      throw new Error(`no image data in response, finishReason=${finishReason}`)
    }

    imageBase64 = imagePart.inlineData.data
    mimeType = imagePart.inlineData.mimeType || 'image/jpeg'
    console.log(`[gemini_call] ✅ Got image — mimeType=${mimeType}, base64 length=${imageBase64.length}`)

  } catch (geminiErr: any) {
    // ── 6b: fallback — imagen-3.0-generate-001 ─────────
    console.log(`[imagen_fallback] gemini-2.5-flash-image failed (${geminiErr.message}) — trying imagen-3.0-generate-001`)
    const imagenUrl = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages'
    console.log(`[imagen_fallback] POST ${imagenUrl}`)

    try {
      const imagenResponse = await fetch(imagenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GOOGLE_AI_API_KEY,
        },
        body: JSON.stringify({
          prompt: prompt,
          numberOfImages: 1,
          aspectRatio: '1:1',
        }),
      })

      const rawBody = await imagenResponse.text()
      console.log(`[imagen_fallback] HTTP ${imagenResponse.status} ${imagenResponse.statusText}`)

      if (!imagenResponse.ok) {
        let details: string
        try { details = JSON.parse(rawBody)?.error?.message || rawBody } catch { details = rawBody }
        console.error('[imagen_fallback] Error:', details)
        return errResponse(
          'Image generation failed',
          `gemini-2.5-flash-image: ${geminiErr.message} | imagen-3.0: ${details}`,
          'imagen_fallback',
          502
        )
      }

      let imagenData: any
      try {
        imagenData = JSON.parse(rawBody)
      } catch (parseErr: any) {
        return errResponse('Image generation failed', `Non-JSON from imagen-3.0: ${parseErr.message}`, 'imagen_fallback', 502)
      }

      console.log(`[imagen_fallback] generatedImages count: ${imagenData?.generatedImages?.length ?? 0}`)

      const imageBytes = imagenData?.generatedImages?.[0]?.image?.imageBytes
      if (!imageBytes) {
        console.error('[imagen_fallback] No imageBytes. Response:', JSON.stringify(imagenData).slice(0, 500))
        return errResponse(
          'Image generation failed',
          `No image data from either model. gemini-2.5-flash-image: ${geminiErr.message}`,
          'imagen_fallback',
          502
        )
      }

      imageBase64 = imageBytes
      mimeType = 'image/png'
      console.log(`[imagen_fallback] ✅ Got image — base64 length=${imageBase64.length}`)

    } catch (imagenErr: any) {
      console.error('[imagen_fallback] Fetch threw:', imagenErr)
      return errResponse('Image generation failed', `Network error: ${imagenErr.message}`, 'imagen_fallback', 502)
    }
  }

  const imageBuffer = Buffer.from(imageBase64!, 'base64')
  const ext = mimeType!.includes('png') ? 'png' : 'jpg'
  console.log(`[extract_image] mimeType=${mimeType}, buffer size=${imageBuffer.length} bytes`)

  // ── Step 8: upload to Supabase Storage ─────────────
  const fileName = `ready-recipes/recipe-${recipe_id}-${Date.now()}.${ext}`
  console.log(`[upload] Uploading to recipe-images/${fileName}`)

  try {
    const { error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(fileName, imageBuffer, { contentType: mimeType, upsert: true })

    if (uploadError) {
      console.error('[upload] Supabase storage error:', uploadError)
      return errResponse('Upload failed', uploadError.message, 'upload', 500)
    }
    console.log('[upload] Upload successful')
  } catch (err: any) {
    console.error('[upload] Unexpected error:', err)
    return errResponse('Upload failed', err.message, 'upload', 500)
  }

  const { data: { publicUrl } } = supabase.storage.from('recipe-images').getPublicUrl(fileName)
  console.log(`[upload] Public URL: ${publicUrl}`)

  // ── Step 9: update DB ───────────────────────────────
  console.log(`[update_db] Updating ready_recipes.hero_image_url for id=${recipe_id}`)
  const { error: updateError } = await supabase
    .from('ready_recipes')
    .update({ hero_image_url: publicUrl })
    .eq('id', recipe_id)

  if (updateError) {
    // Non-fatal — image is already saved to storage
    console.warn('[update_db] Failed to update hero_image_url:', updateError.message)
  } else {
    console.log('[update_db] DB updated successfully')
  }

  console.log('✅ generate-recipe-image complete\n')
  return NextResponse.json({ success: true, image_url: publicUrl })
}

export async function GET() {
  return NextResponse.json({
    message: 'Generate Recipe Image API (Nano Banana)',
    primary_model: 'gemini-2.5-flash-image',
    fallback_model: 'imagen-3.0-generate-001',
    provider: 'Google AI',
    status: GOOGLE_AI_API_KEY ? 'configured' : 'missing GOOGLE_AI_API_KEY',
    supabase: SUPABASE_URL ? 'configured' : 'missing NEXT_PUBLIC_SUPABASE_URL',
  })
}
