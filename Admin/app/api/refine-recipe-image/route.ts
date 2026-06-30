// =====================================================
// FILE: admin/app/api/refine-recipe-image/route.ts
// Apply a text instruction to an existing ready_recipe hero image using Reve Edit.
//
// POST { recipe_id: string, instruction: string }
// 1. Fetch hero_image_url from ready_recipes (must already exist)
// 2. Call Reve Edit: POST https://api.reve.com/v1/image/edit
// 3. Upload result to Supabase Storage with a new filename (preserves old image)
// 4. Update ready_recipes.hero_image_url to the new image
// 5. Return { success: true, image_url }
//
// Reve response shape (confirmed):
//   { image: "<base64_png>", content_violation: bool, request_id, credits_used, credits_remaining }
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const REVE_API_KEY = process.env.REVE_API_KEY!

function errResponse(error: string, details: string, step: string, status: number) {
  console.error(`❌ [${step}] ${error}: ${details}`)
  return NextResponse.json({ success: false, error, details, step }, { status })
}

async function fetchImageAsBase64(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch image at ${url}: HTTP ${res.status}`)
  const arrayBuf = await res.arrayBuffer()
  return Buffer.from(arrayBuf).toString('base64')
}

export async function POST(request: NextRequest) {
  console.log('\n========================================')
  console.log('✏️  refine-recipe-image: request start')
  console.log('========================================')

  // ── Step 0: parse body ──────────────────────────────
  let recipe_id: string
  let instruction: string
  try {
    const body = await request.json()
    recipe_id = body?.recipe_id
    instruction = body?.instruction
    console.log(`[parse_body] recipe_id=${recipe_id}, instruction="${instruction}"`)
  } catch (err: any) {
    return errResponse('Invalid request body', err.message, 'parse_body', 400)
  }

  if (!recipe_id) {
    return errResponse('Missing recipe_id', 'recipe_id is required', 'parse_body', 400)
  }
  if (!instruction?.trim()) {
    return errResponse('Missing instruction', 'instruction is required', 'parse_body', 400)
  }

  // ── Step 1: env check ───────────────────────────────
  console.log('[env_check] REVE_API_KEY present:', !!REVE_API_KEY)

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return errResponse('Supabase not configured', 'NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing', 'env_check', 500)
  }
  if (!REVE_API_KEY) {
    return errResponse('API key not configured', 'REVE_API_KEY is missing from .env.local', 'env_check', 500)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // ── Step 2: fetch existing hero image ───────────────
  console.log(`[fetch_recipe] Fetching hero_image_url for recipe_id=${recipe_id}`)
  let heroImageUrl: string
  try {
    const { data, error } = await supabase
      .from('ready_recipes')
      .select('id, hero_image_url')
      .eq('id', recipe_id)
      .single()

    if (error || !data) {
      return errResponse('Recipe not found', error?.message || 'No row returned', 'fetch_recipe', 404)
    }
    if (!data.hero_image_url) {
      return errResponse('No image to refine', 'This recipe has no hero_image_url yet — generate an image first', 'fetch_recipe', 400)
    }

    heroImageUrl = data.hero_image_url
    console.log(`[fetch_recipe] Found image: ${heroImageUrl}`)
  } catch (err: any) {
    return errResponse('Recipe fetch failed', err.message, 'fetch_recipe', 500)
  }

  // ── Step 3: call Reve Edit ───────────────────────────
  // Confirmed contract: edit_instruction (not "prompt"), reference_image (singular base64, not "image_url")
  console.log('[reve_edit] Fetching hero image for base64 conversion')
  let imageBase64: string
  try {
    const heroImageBase64 = await fetchImageAsBase64(heroImageUrl)
    console.log(`[reve_edit] Hero image → base64 length=${heroImageBase64.length}`)

    const EDIT_URL = 'https://api.reve.com/v1/image/edit'
    let response!: Response
    let rawBody!: string
    const maxRetries = 1

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      response = await fetch(EDIT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${REVE_API_KEY}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          edit_instruction: instruction.trim(),
          reference_image: heroImageBase64,
          version: 'latest',
        }),
      })
      rawBody = await response.text()
      console.log(`[reve_edit] HTTP ${response.status}${attempt > 0 ? ` (attempt ${attempt + 1})` : ''}`)

      if ((response.status === 429 || response.status === 500) && attempt < maxRetries) {
        console.warn(`[reve_edit] HTTP ${response.status} — retrying in 1.5s`)
        await new Promise(r => setTimeout(r, 1500))
        continue
      }
      break
    }

    if (!response.ok) {
      let parsed: any
      try { parsed = JSON.parse(rawBody) } catch { parsed = null }
      const errorCode = parsed?.error_code || ''
      const message = parsed?.message || rawBody
      console.error(`[reve_edit] Error response (HTTP ${response.status}):`, rawBody.slice(0, 500))

      if (response.status === 401) {
        return errResponse('Reve API key invalid', 'Check REVE_API_KEY in .env.local', 'reve_edit', 500)
      }
      if (response.status === 402) {
        return errResponse('Reve credits exhausted', 'Top up at reve.com or switch to Gemini', 'reve_edit', 402)
      }
      if (response.status === 404) {
        console.error(`[reve_edit] 404 on URL: ${EDIT_URL}`)
        return errResponse('Reve Edit endpoint not found', `404: ${EDIT_URL}`, 'reve_edit', 502)
      }
      if (response.status === 429) {
        return errResponse('Reve rate limit exceeded', 'Too many requests — try again in a few seconds', 'reve_edit', 429)
      }
      return errResponse('Reve Edit failed', `HTTP ${response.status}${errorCode ? ` [${errorCode}]` : ''}: ${message}`, 'reve_edit', 502)
    }

    let data: any
    try { data = JSON.parse(rawBody) } catch {
      return errResponse('Reve Edit failed', 'Non-JSON response from Reve API', 'reve_edit', 502)
    }

    console.log('[reve_edit] Response keys:', Object.keys(data).join(', '))
    console.log(`[reve_edit] credits_used=${data.credits_used}, credits_remaining=${data.credits_remaining}`)

    if (data.content_violation) {
      return errResponse('Content flagged', 'Reve flagged this content — try adjusting the instruction', 'reve_edit', 422)
    }

    const b64 = data?.image
    if (!b64) {
      console.error('[reve_edit] Full response:', JSON.stringify(data).slice(0, 500))
      return errResponse('Reve Edit failed', 'No image field in response', 'reve_edit', 502)
    }

    imageBase64 = b64
    console.log(`[reve_edit] ✅ Got image, base64 length=${b64.length}`)
  } catch (err: any) {
    return errResponse('Reve Edit failed', err.message, 'reve_edit', 502)
  }

  // ── Step 4: upload to Supabase Storage ─────────────
  // New filename — old image is preserved in Storage (allows rollback)
  const imageBuffer = Buffer.from(imageBase64, 'base64')
  const fileName = `ready-recipes/recipe-${recipe_id}-refined-${Date.now()}.png`
  console.log(`[upload] Uploading refined image to recipe-images/${fileName}`)

  try {
    const { error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(fileName, imageBuffer, { contentType: 'image/png', upsert: false })

    if (uploadError) {
      return errResponse('Upload failed', uploadError.message, 'upload', 500)
    }
    console.log('[upload] Upload successful')
  } catch (err: any) {
    return errResponse('Upload failed', err.message, 'upload', 500)
  }

  const { data: { publicUrl } } = supabase.storage.from('recipe-images').getPublicUrl(fileName)
  console.log(`[upload] Public URL: ${publicUrl}`)

  // ── Step 5: update DB ───────────────────────────────
  console.log(`[update_db] Updating ready_recipes.hero_image_url for id=${recipe_id}`)
  const { error: updateError } = await supabase
    .from('ready_recipes')
    .update({ hero_image_url: publicUrl })
    .eq('id', recipe_id)

  if (updateError) {
    console.warn('[update_db] Failed to update hero_image_url:', updateError.message)
  } else {
    console.log('[update_db] DB updated successfully')
  }

  console.log('✅ refine-recipe-image complete\n')
  return NextResponse.json({ success: true, image_url: publicUrl })
}

export async function GET() {
  return NextResponse.json({
    message: 'Refine Recipe Image API (Reve Edit)',
    endpoint: 'https://api.reve.com/v1/image/edit',
    requires: 'REVE_API_KEY',
    status: REVE_API_KEY ? 'configured' : 'missing REVE_API_KEY',
  })
}
