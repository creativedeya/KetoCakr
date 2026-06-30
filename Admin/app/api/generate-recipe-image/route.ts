// =====================================================
// FILE: admin/app/api/generate-recipe-image/route.ts
// Generate AI hero image for a ready_recipe.
//
// Providers:
//   reve   — Native Reve API (api.reve.com)
//              Remix  → /v1/image/remix  (when all components have image_url)
//              Create → /v1/image/create (fallback when images are missing)
//   gemini — Google Gemini Flash Image (primary) + Imagen 3 (fallback)
//
// Reve response shape (confirmed):
//   { image: "<base64_png>", content_violation: bool, request_id, credits_used, credits_remaining }
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { GenerationSettings } from '@/lib/types/generationSettings'
import { buildVisualParams } from '@/lib/utils/generationSettingsPrompt'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const GOOGLE_AI_API_KEY = process.env.GEMINI_API_KEY!
const REVE_API_KEY = process.env.REVE_API_KEY!

const ROLE_NAMES: Record<number, { bg: string; en: string }> = {
  1: { bg: 'блат', en: 'Base' },
  2: { bg: 'крем', en: 'Cream' },
  3: { bg: 'плънка', en: 'Filling' },
  4: { bg: 'декор', en: 'Decoration' },
}

type PromptComponent = {
  roleId: number
  nameEn: string
  descriptionEn?: string
  imageUrl: string | null
}

type TemplateStep = {
  id: number
  step_number: number
  recipe_role_id: number | null
  step_type: string
  image_generation_hints: string | null
}

// ── Prompt builders ──────────────────────────────────────────────────────────

function buildNanoBananaPrompt(components: PromptComponent[], dynamicLayerBlock?: string | null): string {
  const layers: string[] = []

  for (const comp of components) {
    const roleName = ROLE_NAMES[comp.roleId]
    if (!roleName) continue
    layers.push(`${roleName.en} layer (${roleName.bg}): ${comp.nameEn}`)
    if (comp.descriptionEn) {
      layers.push(`  Description: ${comp.descriptionEn}`)
    }
  }

  const layerStructure = dynamicLayerBlock ?? `EXACT LAYER STRUCTURE (from bottom to top):
1. Base layer - 18mm thick, moist texture
2. PAPER-THIN cream layer - ONLY 2-3mm (as thin as a coin)
3. PAPER-THIN filling layer - ONLY 2-3mm (thin accent stripe)
4. Base layer - 18mm thick
5. PAPER-THIN cream layer - 2-3mm
6. Base layer - 18mm thick
7. PAPER-THIN filling layer - 2-3mm
8. PAPER-THIN cream layer - 2-3mm
9. Top base layer - 18mm thick
10. Decoration on top and sides`

  // When a precise per-component dynamic block is present, the generic "CRITICAL REQUIREMENTS"
  // section would contradict the outer-coating description (telling the model cream/filling are
  // ONLY thin accent layers while the dynamic block also describes cream as an exterior finish).
  // Same for the thickness bullets — already stated per-layer in the dynamic block.
  const criticalRequirements = dynamicLayerBlock ? '' : `CRITICAL REQUIREMENTS FOR LAYER STRUCTURE:
- This is a DELICATE layered keto cake where filling and cream layers must be PAPER-THIN
- The base sponge/cake layer is the dominant element
- Filling and cream are ACCENT layers, NOT FEATURE layers

`
  const absoluteRequirements = dynamicLayerBlock
    ? `ABSOLUTE REQUIREMENTS:
✅ All layers perfectly horizontal and evenly distributed
✅ NO hands, people, or body parts visible
✅ NO text, labels, watermarks
✅ Keto-friendly aesthetic (low-carb, sugar-free)
✅ Professional bakery-quality presentation`
    : `ABSOLUTE REQUIREMENTS:
✅ Filling layers MUST be 2-3mm maximum (paper-thin)
✅ Cream layers MUST be 2-3mm maximum (paper-thin)
✅ Base layers MUST be 18mm each (thick and prominent)
✅ All layers perfectly horizontal and evenly distributed
✅ NO hands, people, or body parts visible
✅ NO text, labels, watermarks
✅ Keto-friendly aesthetic (low-carb, sugar-free)
✅ Professional bakery-quality presentation

This is a high-end keto dessert with DELICATE, REFINED layers - not thick and chunky.`

  return `Create a professional keto dessert food photography image showing a layered cake with the following components:

${layers.join('\n')}

${criticalRequirements}${layerStructure}

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

${absoluteRequirements}`
}

function buildReveRemixPrompt(components: PromptComponent[], dynamicLayerBlock?: string | null): string {
  const roleMap: Record<number, string> = {
    1: 'sponge/base layer',
    2: 'cream/coating layer',
    3: 'filling layer',
    4: 'decoration/topping',
  }

  const refDescriptions = components.map((comp, i) => {
    const role = roleMap[comp.roleId] || 'component'
    return `- Image ${i + 1} [${role}]: "${comp.nameEn}" — match its exact color, texture, and consistency.`
  }).join('\n')

  const layerStructure = dynamicLayerBlock ?? `CRITICAL LAYER STRUCTURE:
- Base/sponge layers: thick (18mm each), dominant element, matching their reference image's crumb texture and color exactly
- Filling and cream layers: PAPER-THIN (2-3mm max), like a thin ribbon — NOT a thick band
- Outer coating/decoration: matching its reference image's exact color and finish`

  // When a precise per-layer dynamic block is present, the generic thickness bullets
  // duplicate what it already states per step — drop them to stay under Reve's 2560-char limit.
  const absoluteRequirements = dynamicLayerBlock
    ? `ABSOLUTE REQUIREMENTS:
✅ Colors/textures MUST match each reference image exactly
✅ No hands, people, text overlays, or watermarks
✅ Square aspect ratio`
    : `ABSOLUTE REQUIREMENTS:
✅ Filling/cream layers MUST be paper-thin (2-3mm max)
✅ Base layers MUST be thick (18mm each)
✅ Colors and textures MUST match the reference images precisely, not generic interpretations
✅ No hands, no people, no text overlays beyond what appears in reference images, no watermarks
✅ Square aspect ratio composition

This is a refined keto dessert for Emma's Cake Studio — built precisely from the reference images provided.`

  return `Combine these reference images into a professional bakery food photography shot of a layered keto cake, shown as a cross-section view with one slice removed and placed beside the whole cake.

REFERENCE IMAGES:
${refDescriptions}

${layerStructure}

PLATING & COMPOSITION:
- White marble round cake stand, clean white marble background
- One elegant slice cut and placed beside the whole cake, same cross-section visible
- Camera angle: 45 degrees from the side
- Soft natural daylight, golden hour aesthetic
- Professional DSLR quality, shallow depth of field, magazine-quality bakery photography

${absoluteRequirements}`
}

function buildReveCreatePrompt(components: PromptComponent[], dynamicLayerBlock?: string | null): string {
  const roleMap: Record<number, string> = {
    1: 'Sponge/base layer',
    2: 'Cream/coating layer',
    3: 'Filling layer',
    4: 'Decoration/topping',
  }

  const layers = components.map(comp => {
    const role = roleMap[comp.roleId] || 'Component'
    return `- ${role}: "${comp.nameEn}"${comp.descriptionEn ? ` — ${comp.descriptionEn}` : ''}`
  }).join('\n')

  const layerStructure = dynamicLayerBlock ?? `CRITICAL LAYER STRUCTURE:
- Base/sponge layers: thick (18mm each), dominant element
- Filling and cream layers: PAPER-THIN (2-3mm max), like a thin ribbon — NOT a thick band
- Outer coating/decoration: matching described flavor and style`

  return `Create a professional bakery food photography shot of a layered keto cake, shown as a cross-section view with one slice removed and placed beside the whole cake.

LAYER COMPOSITION:
${layers}

${layerStructure}

PLATING & COMPOSITION:
- White marble round cake stand, clean white marble background
- One elegant slice cut and placed beside the whole cake, cross-section visible
- Camera angle: 45 degrees from the side
- Soft natural daylight, golden hour aesthetic
- Professional DSLR quality, shallow depth of field, magazine-quality bakery photography

ABSOLUTE REQUIREMENTS:
✅ Filling/cream layers MUST be paper-thin (2-3mm max)
✅ Base layers MUST be thick (18mm each)
✅ No hands, no people, no text overlays, no watermarks
✅ Square aspect ratio composition

This is a refined keto dessert for Emma's Cake Studio.`
}

// ── Dynamic layer description builder ───────────────────────────────────────
// Converts classified assembly_template_steps into an exact layer sequence string
// suitable for injection into any of the three prompt builders above.

function buildDynamicLayerDescription(
  layerSteps: TemplateStep[],
  outerCoatingSteps: TemplateStep[],
  componentsByRole: Map<number, PromptComponent[]>,
  layerCountOverride: number | null = null,
): { layerSection: string; coatingSection: string } {
  const THICKNESS: Record<number, string> = {
    1: '18mm thick (dominant element)',
    2: 'paper-thin 2-3mm max',
    3: 'paper-thin 2-3mm max',
    4: 'as needed',
  }

  // layer_count_override is scoped to "repeat a SINGLE base component's uniform between-unit
  // N times". Two scenarios are explicitly OUT OF SCOPE and must not attempt expansion:
  //   1. Templates whose between-layer gaps are non-uniform (different cream/filling sequences
  //      between different pairs of consecutive base steps) — expansion would silently produce
  //      a structurally wrong prompt by repeating the first gap everywhere.
  //   2. Recipes where role=1 has more than one distinct selected component (e.g. two different
  //      sponge flavors in a custom alternating arrangement) — the cycling approach used here
  //      (comps[idx % comps.length]) does not encode the intended positional mapping.
  // Both cases fall through to the natural template sequence unchanged.
  const naturalBaseCount = layerSteps.filter(s => s.recipe_role_id === 1).length
  let effectiveLayerSteps = layerSteps
  // Set by the expansionSafe branch; when non-null the enumeration loop below is skipped.
  let compactedLayerSection: string | null = null

  if (layerCountOverride !== null && naturalBaseCount > 1 && layerCountOverride !== naturalBaseCount) {
    // ── Safety guard ─────────────────────────────────────────────────────────
    // Collect indices of every role=1 (base) step in template order.
    const baseIndices = layerSteps
      .map((s, i) => (s.recipe_role_id === 1 ? i : -1))
      .filter(i => i !== -1)

    // Serialize a gap as "roleId:stepType,..." pairs for equality comparison.
    const serializeGap = (steps: TemplateStep[]) =>
      steps.map(s => `${s.recipe_role_id ?? 'null'}:${s.step_type}`).join(',')

    const gaps: string[] = []
    for (let g = 0; g < baseIndices.length - 1; g++) {
      gaps.push(serializeGap(layerSteps.slice(baseIndices[g] + 1, baseIndices[g + 1])))
    }

    const distinctBaseComponents = componentsByRole.get(1)?.length ?? 0
    const allGapsUniform = gaps.length > 0 && gaps.every(g => g === gaps[0])
    const expansionSafe = allGapsUniform && distinctBaseComponents <= 1

    if (!expansionSafe) {
      if (distinctBaseComponents > 1) {
        console.warn(`[build_prompt] layer_count_override ignored: recipe has ${distinctBaseComponents} distinct role=1 components — custom multi-base arrangement is out of scope for override expansion, using natural sequence`)
      } else {
        console.warn(`[build_prompt] Template has non-uniform between-layer pattern — ignoring layerCountOverride=${layerCountOverride}, using natural sequence as-is (gaps: ${gaps.join(' | ')})`)
      }
      // effectiveLayerSteps stays = natural layerSteps, falls through to enumeration loop
    } else {
      // ── "Describe once + repeat instruction" compaction ──────────────────────
      // Enumerating all N×(1+betweenUnit) steps explicitly scales prompt O(N), hitting
      // Reve's 2560-char limit at high override values. Instead: describe each component
      // and the between-unit once, then give the model a count and sequence label.
      // Prompt size stays O(between-unit-size) regardless of layerCountOverride.
      const betweenUnit = layerSteps.slice(baseIndices[0] + 1, baseIndices[1])

      // Base (guard ensures exactly 1 distinct role=1 component for this path)
      const baseComp = (componentsByRole.get(1) ?? [])[0] ?? null
      const baseName = baseComp ? `"${baseComp.nameEn}"` : '[Base — component not mapped]'
      // Between-unit: one line per step, described once
      const betweenRoleCounters = new Map<number, number>()
      const betweenLines: string[] = []
      for (const step of betweenUnit) {
        const roleId = step.recipe_role_id
        if (roleId === null) continue
        const idx = betweenRoleCounters.get(roleId) ?? 0
        betweenRoleCounters.set(roleId, idx + 1)
        const comps = componentsByRole.get(roleId) ?? []
        const comp = comps[idx] ?? null
        const roleName = ROLE_NAMES[roleId]?.en ?? `Role ${roleId}`
        const compName = comp ? `"${comp.nameEn}"` : `[${roleName} not mapped]`
        const hints = step.image_generation_hints ? ` [${step.image_generation_hints}]` : ''
        betweenLines.push(`  - ${roleName}: ${compName}${hints} (${THICKNESS[roleId] ?? ''})`)
      }

      // Compact sequence label: "Base / [Cream→Filling] / Base / ... / Base"
      const unitLabel = betweenUnit
        .map(s => ROLE_NAMES[s.recipe_role_id ?? 0]?.en ?? '?')
        .join('→')
      const seqParts = ['Base']
      for (let i = 1; i < layerCountOverride; i++) seqParts.push(`[${unitLabel}]`, 'Base')

      compactedLayerSection = `EXACT LAYER STRUCTURE (bottom to top — ${layerCountOverride} base layers [override=${layerCountOverride}], uniform repeating pattern):
Base layer (×${layerCountOverride}): ${baseName} — 18mm thick each, dominant element
Between-unit (×${layerCountOverride - 1} between each pair of bases):
${betweenLines.join('\n')}
Sequence: ${seqParts.join(' / ')}`

      console.log(`[build_prompt] Layer compaction: ${naturalBaseCount} natural → ${layerCountOverride} (override), between-unit=${betweenUnit.length} step(s), section=${compactedLayerSection.length} chars`)
    }
  }

  // Enumerate steps from effectiveLayerSteps for the non-compacted path.
  // Skipped when compactedLayerSection is already set by the expansionSafe branch.
  const roleCounters = new Map<number, number>()
  const layerLines: string[] = []

  if (!compactedLayerSection) {
    effectiveLayerSteps.forEach((step, i) => {
      const roleId = step.recipe_role_id
      if (roleId === null) return

      const idx = roleCounters.get(roleId) ?? 0
      roleCounters.set(roleId, idx + 1)

      const comps = componentsByRole.get(roleId) ?? []
      const comp = comps.length > 0 ? comps[idx % comps.length] : null
      const thickness = THICKNESS[roleId] ?? ''
      const roleName = ROLE_NAMES[roleId]?.en ?? `Role ${roleId}`
      const compName = comp ? `"${comp.nameEn}"` : `[${roleName} — component not mapped]`
      const hints = step.image_generation_hints ? ` [${step.image_generation_hints}]` : ''

      layerLines.push(`${i + 1}. ${roleName} — ${compName}${hints} (${thickness})`)
    })
  }

  const effectiveBaseCount = effectiveLayerSteps.filter(s => s.recipe_role_id === 1).length
  const overrideNote = layerCountOverride !== null && naturalBaseCount > 1 ? ` [base count override=${layerCountOverride}]` : ' — from assembly template'
  const sectionHeader = `EXACT LAYER STRUCTURE (bottom to top — ${effectiveLayerSteps.length} structural layers, ${effectiveBaseCount} base layers${overrideNote}):`

  // Hard cap: keep layerSection under 1200 chars so the full prompt stays under Reve's 2560 limit.
  // The compacted path is already O(between-unit-size); the cap only applies to the enumeration path.
  const LAYER_SECTION_CAP = 1200
  let cappedLines = layerLines
  if (layerLines.length > 0) {
    let used = sectionHeader.length + 1 // +1 for the \n between header and first line
    const fitting: string[] = []
    for (const line of layerLines) {
      if (used + line.length + 1 > LAYER_SECTION_CAP) break
      fitting.push(line)
      used += line.length + 1
    }
    if (fitting.length < layerLines.length) {
      const remaining = layerLines.length - fitting.length
      fitting.push(`... [and ${remaining} more layer${remaining === 1 ? '' : 's'} following the same alternating pattern above]`)
      cappedLines = fitting
      console.log(`[build_prompt] layerSection capped: ${layerLines.length} lines → ${fitting.length - 1} shown + truncation notice (${remaining} omitted)`)
    }
  }

  const layerSection = compactedLayerSection ?? `${sectionHeader}\n${cappedLines.join('\n')}`

  // Outer coating: applied to the exterior, NOT counted in the stack
  const coatingRoleCounters = new Map<number, number>()
  const coatingLines: string[] = []
  for (const step of outerCoatingSteps) {
    const roleId = step.recipe_role_id
    if (roleId === null) continue
    const idx = coatingRoleCounters.get(roleId) ?? 0
    coatingRoleCounters.set(roleId, idx + 1)
    const comps = componentsByRole.get(roleId) ?? []
    const comp = comps[idx] ?? null
    const roleName = ROLE_NAMES[roleId]?.en ?? `Role ${roleId}`
    const compName = comp ? `"${comp.nameEn}"` : `[${roleName} component]`
    const hints = step.image_generation_hints ? ` — ${step.image_generation_hints}` : ''
    coatingLines.push(`- ${roleName}: ${compName}${hints} (applied to all exterior sides and top — NOT a stack layer)`)
  }

  const coatingSection = coatingLines.length > 0
    ? `OUTER COATING (exterior finish only — do NOT add extra internal layers for these):\n${coatingLines.join('\n')}`
    : ''

  return { layerSection, coatingSection }
}

// ── Error helper ─────────────────────────────────────────────────────────────

function errResponse(error: string, details: string, step: string, status: number) {
  console.error(`❌ [${step}] ${error}: ${details}`)
  return NextResponse.json({ success: false, error, details, step }, { status })
}

class ReveError extends Error {
  constructor(
    public readonly status: number,
    public readonly errorCode: string,
    message: string,
  ) {
    super(message)
    this.name = 'ReveError'
  }
}

// ── Reve generation (native api.reve.com) ────────────────────────────────────

async function fetchImageAsBase64(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch image at ${url}: HTTP ${res.status}`)
  const arrayBuf = await res.arrayBuffer()
  return Buffer.from(arrayBuf).toString('base64')
}

async function reveRemix(
  components: PromptComponent[],
  imageUrls: string[],
  settings?: GenerationSettings,
  dynamicLayerBlock?: string | null
): Promise<{ imageBase64: string; mimeType: string }> {
  const basePrompt = buildReveRemixPrompt(components, dynamicLayerBlock)
  const prompt = settings ? basePrompt + buildVisualParams(settings) : basePrompt
  const useRemoveBg = settings?.backgroundColor === 'transparent'

  // Reve requires base64 image data, not URLs — fetch each component image server-side
  // Cap at 6 (Reve's max); in practice we'll never exceed 4 (base/cream/filling/decoration)
  const urlsToFetch = imageUrls.slice(0, 6)
  if (imageUrls.length > 6) {
    console.warn(`[reve_remix] ${imageUrls.length} images provided — capping at 6 (Reve max)`)
  }
  console.log(`[reve_remix] Fetching ${urlsToFetch.length} component images for base64 conversion`)
  const referenceImages: string[] = []
  for (let i = 0; i < urlsToFetch.length; i++) {
    const b64 = await fetchImageAsBase64(urlsToFetch[i])
    referenceImages.push(b64)
    console.log(`[reve_remix] Image ${i + 1}/${urlsToFetch.length}: ${urlsToFetch[i].split('/').pop()} → base64 length=${b64.length}`)
  }

  console.log('[reve_remix] Final prompt length:', prompt.length, 'chars')
  console.log(`[reve_remix] Calling /v1/image/remix — ${referenceImages.length} reference images (raw base64, no data: prefix)`)
  const REMIX_URL = 'https://api.reve.com/v1/image/remix'
  let response!: Response
  let rawBody!: string
  const maxRetries = 1

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    response = await fetch(REMIX_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REVE_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        reference_images: referenceImages,
        version: 'latest',
        ...(useRemoveBg ? { postprocessing: [{ process: 'remove_background' }] } : {}),
      }),
    })
    rawBody = await response.text()
    console.log(`[reve_remix] HTTP ${response.status}${attempt > 0 ? ` (attempt ${attempt + 1})` : ''}${useRemoveBg ? ' [+remove_background]' : ''}`)

    if ((response.status === 429 || response.status === 500) && attempt < maxRetries) {
      console.warn(`[reve_remix] HTTP ${response.status} — retrying in 1.5s`)
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
    console.error(`[reve_remix] Error response (HTTP ${response.status}):`, rawBody.slice(0, 500))

    if (response.status === 401) {
      throw new ReveError(401, errorCode, 'Reve API key invalid or missing — check REVE_API_KEY in .env.local')
    }
    if (response.status === 402) {
      throw new ReveError(402, errorCode, 'Reve credits exhausted — top up at reve.com or switch to Gemini')
    }
    if (response.status === 404) {
      console.error(`[reve_remix] 404 on URL: ${REMIX_URL}`)
      throw new ReveError(404, errorCode, `Reve endpoint not found: ${REMIX_URL}`)
    }
    throw new ReveError(response.status, errorCode, `Reve Remix HTTP ${response.status}${errorCode ? ` [${errorCode}]` : ''}: ${message}`)
  }

  let data: any
  try { data = JSON.parse(rawBody) } catch { throw new Error('Reve Remix: non-JSON response') }

  // Log full response keys on first use to catch unexpected shapes
  console.log('[reve_remix] Response keys:', Object.keys(data).join(', '))
  console.log(`[reve_remix] credits_used=${data.credits_used}, credits_remaining=${data.credits_remaining}`)

  if (data.content_violation) {
    throw new Error('Reve flagged this content — try adjusting the prompt or reference images')
  }

  const b64 = data?.image
  if (!b64) {
    console.error('[reve_remix] Full response:', JSON.stringify(data).slice(0, 500))
    throw new Error('Reve Remix: no image field in response')
  }

  console.log(`[reve_remix] ✅ Got image, base64 length=${b64.length}`)
  return { imageBase64: b64, mimeType: 'image/png' }
}

async function reveCreate(
  components: PromptComponent[],
  settings?: GenerationSettings,
  dynamicLayerBlock?: string | null
): Promise<{ imageBase64: string; mimeType: string }> {
  const basePrompt = buildReveCreatePrompt(components, dynamicLayerBlock)
  const prompt = settings ? basePrompt + buildVisualParams(settings) : basePrompt
  const useRemoveBg = settings?.backgroundColor === 'transparent'

  console.log('[reve_create] Calling /v1/image/create (text-only)')
  const CREATE_URL = 'https://api.reve.com/v1/image/create'
  let response!: Response
  let rawBody!: string
  const maxRetries = 1

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    response = await fetch(CREATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${REVE_API_KEY}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        ...(useRemoveBg ? { postprocessing: [{ process: 'remove_background' }] } : {}),
      }),
    })
    rawBody = await response.text()
    console.log(`[reve_create] HTTP ${response.status}${attempt > 0 ? ` (attempt ${attempt + 1})` : ''}${useRemoveBg ? ' [+remove_background]' : ''}`)

    if ((response.status === 429 || response.status === 500) && attempt < maxRetries) {
      console.warn(`[reve_create] HTTP ${response.status} — retrying in 1.5s`)
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
    console.error(`[reve_create] Error response (HTTP ${response.status}):`, rawBody.slice(0, 500))

    if (response.status === 401) {
      throw new ReveError(401, errorCode, 'Reve API key invalid or missing — check REVE_API_KEY in .env.local')
    }
    if (response.status === 402) {
      throw new ReveError(402, errorCode, 'Reve credits exhausted — top up at reve.com or switch to Gemini')
    }
    if (response.status === 404) {
      console.error(`[reve_create] 404 on URL: ${CREATE_URL}`)
      throw new ReveError(404, errorCode, `Reve endpoint not found: ${CREATE_URL}`)
    }
    throw new ReveError(response.status, errorCode, `Reve Create HTTP ${response.status}${errorCode ? ` [${errorCode}]` : ''}: ${message}`)
  }

  let data: any
  try { data = JSON.parse(rawBody) } catch { throw new Error('Reve Create: non-JSON response') }

  console.log(`[reve_create] credits_used=${data.credits_used}, credits_remaining=${data.credits_remaining}`)

  if (data.content_violation) {
    throw new Error('Reve flagged this content — try adjusting the prompt')
  }

  const b64 = data?.image
  if (!b64) {
    console.error('[reve_create] Full response:', JSON.stringify(data).slice(0, 500))
    throw new Error('Reve Create: no image field in response')
  }

  console.log(`[reve_create] ✅ Got image, base64 length=${b64.length}`)
  return { imageBase64: b64, mimeType: 'image/png' }
}

async function generateWithReve(
  components: PromptComponent[],
  settings?: GenerationSettings,
  dynamicLayerBlock?: string | null
): Promise<{ imageBase64: string; mimeType: string }> {
  const imageUrls = components.map(c => c.imageUrl).filter((u): u is string => !!u)
  const hasAllImages = imageUrls.length === components.length && components.length > 0

  console.log(`[reve] ${imageUrls.length}/${components.length} components have images`)
  if (settings) {
    console.log(`[reve] Visual settings: bg=${settings.backgroundColor}, angle=${settings.viewingAngle}, light=${settings.lightingStyle}, texture=${settings.backgroundTexture}`)
  }
  if (dynamicLayerBlock) {
    console.log(`[reve] Dynamic layer block: ${dynamicLayerBlock.slice(0, 80)}...`)
  }

  if (hasAllImages) {
    console.log('[reve] Using REMIX endpoint with reference images')
    return reveRemix(components, imageUrls, settings, dynamicLayerBlock)
  } else {
    console.log('[reve] Missing some component images — falling back to CREATE (text-only)')
    return reveCreate(components, settings, dynamicLayerBlock)
  }
}

// ── Gemini generation (primary: gemini-2.5-flash-image, fallback: imagen-3) ──

async function generateWithGemini(
  prompt: string
): Promise<{ imageBase64: string; mimeType: string }> {
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
        generationConfig: { temperature: 0.4, topK: 32, topP: 1 },
      }),
    })

    const rawBody = await geminiResponse.text()
    console.log(`[gemini_call] HTTP ${geminiResponse.status} ${geminiResponse.statusText}`)

    if (!geminiResponse.ok) {
      let details: string
      try { details = JSON.parse(rawBody)?.error?.message || rawBody } catch { details = rawBody }
      console.warn(`[gemini_call] Failed (${geminiResponse.status}): ${details} — will try imagen fallback`)
      throw new Error(details)
    }

    let geminiData: any
    try { geminiData = JSON.parse(rawBody) } catch {
      console.warn('[gemini_call] Non-JSON response — will try imagen fallback')
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
      console.warn(`[gemini_call] No inlineData. finishReason=${finishReason} — will try imagen fallback`)
      throw new Error(`no image data in response, finishReason=${finishReason}`)
    }

    const imageBase64 = imagePart.inlineData.data
    const mimeType = imagePart.inlineData.mimeType || 'image/jpeg'
    console.log(`[gemini_call] ✅ Got image — mimeType=${mimeType}, base64 length=${imageBase64.length}`)
    return { imageBase64, mimeType }

  } catch (geminiErr: any) {
    // Fallback: imagen-3.0-generate-001
    console.log(`[imagen_fallback] gemini-2.5-flash-image failed (${geminiErr.message}) — trying imagen-3.0-generate-001`)
    const imagenUrl = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages'

    const imagenResponse = await fetch(imagenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GOOGLE_AI_API_KEY,
      },
      body: JSON.stringify({
        prompt,
        numberOfImages: 1,
        aspectRatio: '1:1',
      }),
    })

    const rawBody = await imagenResponse.text()
    console.log(`[imagen_fallback] HTTP ${imagenResponse.status} ${imagenResponse.statusText}`)

    if (!imagenResponse.ok) {
      let details: string
      try { details = JSON.parse(rawBody)?.error?.message || rawBody } catch { details = rawBody }
      throw new Error(`gemini-2.5-flash-image: ${geminiErr.message} | imagen-3.0: ${details}`)
    }

    let imagenData: any
    try { imagenData = JSON.parse(rawBody) } catch (parseErr: any) {
      throw new Error(`Non-JSON from imagen-3.0: ${parseErr.message}`)
    }

    console.log(`[imagen_fallback] generatedImages count: ${imagenData?.generatedImages?.length ?? 0}`)

    const imageBytes = imagenData?.generatedImages?.[0]?.image?.imageBytes
    if (!imageBytes) {
      console.error('[imagen_fallback] No imageBytes. Response:', JSON.stringify(imagenData).slice(0, 500))
      throw new Error(`No image data from either model. gemini-2.5-flash-image: ${geminiErr.message}`)
    }

    console.log(`[imagen_fallback] ✅ Got image — base64 length=${imageBytes.length}`)
    return { imageBase64: imageBytes, mimeType: 'image/png' }
  }
}

// ── Main handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  console.log('\n========================================')
  console.log('🎨 generate-recipe-image: request start')
  console.log('========================================')

  // ── Step 0: parse body ──────────────────────────────
  let recipe_id: string
  let provider: string
  let generationSettings: GenerationSettings | undefined
  try {
    const body = await request.json()
    recipe_id = body?.recipe_id
    provider = body?.provider ?? 'reve'
    generationSettings = body?.generationSettings ?? undefined
    console.log(`[parse_body] recipe_id=${recipe_id}, provider=${provider}, settings=${generationSettings ? `bg=${generationSettings.backgroundColor},angle=${generationSettings.viewingAngle},light=${generationSettings.lightingStyle}` : 'none'}`)
  } catch (err: any) {
    return errResponse('Invalid request body', err.message, 'parse_body', 400)
  }

  if (!recipe_id) {
    return errResponse('Missing recipe_id', 'recipe_id is required in the request body', 'parse_body', 400)
  }

  // ── Step 1: env check ───────────────────────────────
  console.log('[env_check] REVE_API_KEY present:', !!REVE_API_KEY)
  console.log('[env_check] GOOGLE_AI_API_KEY present:', !!GOOGLE_AI_API_KEY)
  console.log('[env_check] SUPABASE_URL present:', !!SUPABASE_URL)
  console.log('[env_check] SUPABASE_SERVICE_KEY present:', !!SUPABASE_SERVICE_KEY)

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return errResponse('Supabase not configured', 'NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing', 'env_check', 500)
  }
  if (provider === 'reve' && !REVE_API_KEY) {
    return errResponse('API key not configured', 'REVE_API_KEY is missing from .env.local (required for Reve provider)', 'env_check', 500)
  }
  if (provider === 'gemini' && !GOOGLE_AI_API_KEY) {
    return errResponse('API key not configured', 'GOOGLE_AI_API_KEY is missing from .env.local (required for Gemini provider)', 'env_check', 500)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // ── Step 2: fetch ready_recipe ──────────────────────
  console.log(`[fetch_recipe] Fetching ready_recipe id=${recipe_id}`)
  let recipe: { id: string; name_en: string; name_bg: string; selected_components: any; assembly_template_id: number | null; layer_count_override: number | null } | null = null
  try {
    const { data, error } = await supabase
      .from('ready_recipes')
      .select('id, name_en, name_bg, selected_components, assembly_template_id, layer_count_override')
      .eq('id', recipe_id)
      .single()

    if (error) {
      return errResponse(`Recipe not found: ${recipe_id}`, error.message, 'fetch_recipe', 404)
    }
    if (!data) {
      return errResponse(`Recipe not found: ${recipe_id}`, 'No row returned', 'fetch_recipe', 404)
    }
    recipe = data
    console.log(`[fetch_recipe] Found: "${recipe.name_en || recipe.name_bg}"`)
    console.log(`[fetch_recipe] selected_components:`, JSON.stringify(recipe.selected_components))
  } catch (err: any) {
    return errResponse('Recipe fetch failed', err.message, 'fetch_recipe', 500)
  }

  // ── Step 3: parse components ────────────────────────
  console.log('[parse_components] Parsing selected_components...')
  let selectedComponents: Array<{ recipe_role_id: number; base_recipe_id: string }> = []
  try {
    const raw = recipe.selected_components
    if (!raw) {
      return errResponse('Invalid components data', 'selected_components is null', 'parse_components', 400)
    }
    selectedComponents = Array.isArray(raw) ? raw : JSON.parse(raw)
    // Sort by order_index so same-role components zip correctly with template steps
    selectedComponents.sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
    console.log(`[parse_components] ${selectedComponents.length} component(s)`)
  } catch (err: any) {
    return errResponse('Invalid components data', `Could not parse selected_components: ${err.message}`, 'parse_components', 400)
  }

  const recipeIds = selectedComponents.map(c => c.base_recipe_id).filter(Boolean)
  if (recipeIds.length === 0) {
    return errResponse('Invalid components data', 'No valid base_recipe_id values in selected_components', 'parse_components', 400)
  }

  // ── Step 3.5: fetch assembly template steps (if linked) ────────────────────
  let layerSteps: TemplateStep[] = []
  let outerCoatingSteps: TemplateStep[] = []
  let hasTemplate = false

  if (recipe.assembly_template_id) {
    console.log(`[fetch_template] Fetching steps for assembly_template_id=${recipe.assembly_template_id}`)
    try {
      const { data: allSteps, error: stepsError } = await supabase
        .from('assembly_template_steps')
        .select('id, step_number, recipe_role_id, step_type, image_generation_hints')
        .eq('assembly_template_id', recipe.assembly_template_id)
        .not('step_type', 'is', null)
        .order('step_number', { ascending: true })

      if (stepsError) {
        console.warn(`[fetch_template] Error fetching template steps: ${stepsError.message} — falling back to generic prompt`)
      } else if (allSteps && allSteps.length > 0) {
        layerSteps = allSteps.filter((s: any) => s.step_type === 'layer')
        outerCoatingSteps = allSteps.filter((s: any) => s.step_type === 'outer_coating')
        hasTemplate = layerSteps.length > 0
        console.log(`[fetch_template] ${allSteps.length} classified steps: ${layerSteps.length} layer, ${outerCoatingSteps.length} outer_coating`)
      } else {
        console.warn('[fetch_template] Template linked but no classified steps found — falling back to generic prompt')
      }
    } catch (err: any) {
      console.warn(`[fetch_template] Exception: ${err.message} — falling back to generic prompt`)
    }
  } else {
    console.log('[fetch_template] No assembly_template_id set — using generic prompt')
  }

  // ── Step 4: fetch base recipes ──────────────────────
  console.log(`[fetch_base_recipes] Fetching ${recipeIds.length} base recipe(s)`)
  let baseRecipes: Array<{
    id: string
    name: string
    name_en: string
    description_en: string
    recipe_role_id: number
    image_url: string | null
  }> = []
  try {
    const { data, error } = await supabase
      .from('base_recipes')
      .select('id, name, name_en, description_en, recipe_role_id, image_url')
      .in('id', recipeIds)

    if (error) {
      return errResponse('Fetch base recipes failed', error.message, 'fetch_base_recipes', 500)
    }
    baseRecipes = data || []
    console.log(`[fetch_base_recipes] Got ${baseRecipes.length}/${recipeIds.length} base recipes`)
    baseRecipes.forEach(br => console.log(
      `  → role=${br.recipe_role_id} "${br.name_en || br.name}" image=${br.image_url ? '✅' : '❌'}`
    ))
  } catch (err: any) {
    return errResponse('Fetch base recipes failed', err.message, 'fetch_base_recipes', 500)
  }

  // ── Step 5: build prompt components ────────────────
  // Order preserved from selectedComponents (already sorted by order_index in Step 3)
  const promptComponents: PromptComponent[] = selectedComponents
    .map((comp: any) => {
      const base = baseRecipes.find(br => br.id === comp.base_recipe_id)
      if (!base) {
        console.warn(`[build_prompt] No base recipe found for id=${comp.base_recipe_id}`)
        return null
      }
      return {
        roleId: comp.recipe_role_id,
        nameEn: base.name_en || base.name,
        descriptionEn: base.description_en || undefined,
        imageUrl: base.image_url || null,
      }
    })
    .filter((c: PromptComponent | null): c is PromptComponent => c !== null)

  if (promptComponents.length === 0) {
    return errResponse('Invalid components data', 'None of the component base_recipe_ids matched any base_recipe rows', 'build_prompt', 400)
  }

  // Build role → components map (preserves order_index order within each role)
  const componentsByRole = new Map<number, PromptComponent[]>()
  for (const comp of promptComponents) {
    const existing = componentsByRole.get(comp.roleId) ?? []
    existing.push(comp)
    componentsByRole.set(comp.roleId, existing)
  }

  // Build dynamic layer block from template steps (if available and classified)
  let dynamicLayerBlock: string | null = null
  const layerCountOverride = recipe.layer_count_override ?? null
  if (hasTemplate) {
    const { layerSection, coatingSection } = buildDynamicLayerDescription(layerSteps, outerCoatingSteps, componentsByRole, layerCountOverride)
    dynamicLayerBlock = coatingSection ? `${layerSection}\n\n${coatingSection}` : layerSection
    console.log(`[build_prompt] Dynamic block: ${layerSteps.length} layer step(s), ${outerCoatingSteps.length} outer coating(s)${layerCountOverride !== null ? `, layer_count_override=${layerCountOverride}` : ''}`)
  } else {
    console.warn('[build_prompt] No template data — using generic hardcoded layer structure (fallback)')
  }

  console.log(`[build_prompt] ${promptComponents.length} component(s) resolved, provider=${provider}`)

  // ── Step 6: generate image via selected provider ────
  let imageBase64: string
  let mimeType: string

  try {
    if (provider === 'reve') {
      const result = await generateWithReve(promptComponents, generationSettings, dynamicLayerBlock)
      imageBase64 = result.imageBase64
      mimeType = result.mimeType
    } else {
      const basePrompt = buildNanoBananaPrompt(promptComponents, dynamicLayerBlock)
      const prompt = generationSettings ? basePrompt + buildVisualParams(generationSettings) : basePrompt
      console.log(`[build_prompt] Gemini prompt built (${prompt.length} chars)${generationSettings ? ` + visual params (bg=${generationSettings.backgroundColor})` : ''}${dynamicLayerBlock ? ' + dynamic layers' : ' (generic fallback)'}`)
      const result = await generateWithGemini(prompt)
      imageBase64 = result.imageBase64
      mimeType = result.mimeType
    }
  } catch (err: any) {
    if (err instanceof ReveError) {
      if (err.status === 402) {
        return errResponse('Reve credits exhausted', 'Top up at reve.com or switch the provider toggle to Gemini', 'generate_image', 402)
      }
      if (err.status === 401) {
        return errResponse('Reve API key invalid', err.message, 'generate_image', 500)
      }
      if (err.status === 429) {
        return errResponse('Reve rate limit exceeded', 'Too many requests — try again in a few seconds', 'generate_image', 429)
      }
    }
    if (err.message?.includes('content_violation') || err.message?.includes('flagged')) {
      return errResponse('Content flagged', err.message, 'generate_image', 422)
    }
    return errResponse('Image generation failed', err.message, 'generate_image', 502)
  }

  const imageBuffer = Buffer.from(imageBase64!, 'base64')
  const ext = mimeType!.includes('png') ? 'png' : 'jpg'
  console.log(`[extract_image] mimeType=${mimeType}, buffer size=${imageBuffer.length} bytes`)

  // ── Step 7: upload to Supabase Storage ─────────────
  const fileName = `ready-recipes/recipe-${recipe_id}-${Date.now()}.${ext}`
  console.log(`[upload] Uploading to recipe-images/${fileName}`)

  try {
    const { error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(fileName, imageBuffer, { contentType: mimeType, upsert: true })

    if (uploadError) {
      return errResponse('Upload failed', uploadError.message, 'upload', 500)
    }
    console.log('[upload] Upload successful')
  } catch (err: any) {
    return errResponse('Upload failed', err.message, 'upload', 500)
  }

  const { data: { publicUrl } } = supabase.storage.from('recipe-images').getPublicUrl(fileName)
  console.log(`[upload] Public URL: ${publicUrl}`)

  // ── Step 8: update DB ───────────────────────────────
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

  console.log(`✅ generate-recipe-image complete (provider=${provider})\n`)
  return NextResponse.json({ success: true, image_url: publicUrl })
}

export async function GET() {
  return NextResponse.json({
    message: 'Generate Recipe Image API',
    providers: {
      reve: {
        description: 'Native Reve API — Remix (/v1/image/remix) if all components have images, Create (/v1/image/create) otherwise',
        endpoints: ['https://api.reve.com/v1/image/create', 'https://api.reve.com/v1/image/remix'],
        requires: 'REVE_API_KEY',
        status: REVE_API_KEY ? 'configured' : 'missing REVE_API_KEY',
      },
      gemini: {
        description: 'Google Gemini Flash Image (primary) + Imagen 3 (fallback)',
        models: ['gemini-2.5-flash-image', 'imagen-3.0-generate-001'],
        requires: 'GOOGLE_AI_API_KEY',
        status: GOOGLE_AI_API_KEY ? 'configured' : 'missing GOOGLE_AI_API_KEY',
      },
    },
    supabase: SUPABASE_URL ? 'configured' : 'missing NEXT_PUBLIC_SUPABASE_URL',
  })
}
