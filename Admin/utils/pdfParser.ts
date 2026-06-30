import fs from 'fs'
import Anthropic from '@anthropic-ai/sdk'

export interface ParsedStep {
  step_number: number
  step_description_bg: string
  step_description_en: string
}

export interface ParsedIngredient {
  ingredient_name: string
  quantity: string
  unit: string
  order_index: number
}

export interface ParsedRecipe {
  name: string
  name_en: string
  servings: number
  bake_time_minutes: number
  ingredients_text_bg: string
  ingredients_text_en: string
  description: string
  description_en: string
  steps: ParsedStep[]
  ingredients: ParsedIngredient[]
}

// Extract raw text from PDF using pdfjs-dist (server-side, no worker)
async function extractPDFText(filePath: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfjs = require('pdfjs-dist/legacy/build/pdf.js')
  try { pdfjs.GlobalWorkerOptions.workerSrc = '' } catch {}

  const fileBuffer = fs.readFileSync(filePath)
  const pdf = await pdfjs.getDocument({
    data: new Uint8Array(fileBuffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise

  console.log(`[PDF Parser] Loaded ${pdf.numPages} pages`)

  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const items = content.items as Array<{ str: string; transform: number[] }>

    // Group by Y position to reconstruct visual lines
    const lines = new Map<number, string[]>()
    for (const item of items) {
      if (!item.str.trim()) continue
      const y = Math.round(item.transform[5])
      let lineY = y
      for (const [ey] of lines) {
        if (Math.abs(ey - y) <= 4) { lineY = ey; break }
      }
      if (!lines.has(lineY)) lines.set(lineY, [])
      lines.get(lineY)!.push(item.str)
    }

    const pageText = [...lines.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, words]) => words.join(' '))
      .join('\n')

    fullText += `\n--- PAGE ${i} ---\n${pageText}`
  }

  return fullText
}

// Split text into batches at page boundaries, max ~10000 chars each
function splitIntoBatches(text: string, batchSize = 10000): string[] {
  const batches: string[] = []
  const pages = text.split(/\n--- PAGE \d+ ---\n/).filter(Boolean)

  let current = ''
  let pageNum = 1
  for (const page of pages) {
    const chunk = `\n--- PAGE ${pageNum++} ---\n${page}`
    if (current.length + chunk.length > batchSize && current.length > 0) {
      batches.push(current)
      current = chunk
    } else {
      current += chunk
    }
  }
  if (current) batches.push(current)

  return batches
}

export async function parsePDFRecipes(filePath: string): Promise<ParsedRecipe[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  console.log('[PDF Parser] Extracting text from PDF...')
  const fullText = await extractPDFText(filePath)
  console.log('[PDF Parser] Extracted', fullText.length, 'chars')

  const batches = splitIntoBatches(fullText)
  console.log('[PDF Parser] Processing', batches.length, 'batches')

  const allRecipes: ParsedRecipe[] = []

  for (let i = 0; i < batches.length; i++) {
    console.log(`[PDF Parser] Batch ${i + 1}/${batches.length}...`)

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 16000,
      messages: [{
        role: 'user',
        content: `You are extracting recipes from a Bulgarian keto cookbook.

Here is text extracted from PDF pages (some characters may be garbled due to PDF encoding):

${batches[i]}

Extract ALL complete recipes from this text. Skip partial recipes that started on a previous batch.
A recipe starts with a title line (Bulgarian, ALL CAPS or Title Case), then "Serving size:", then "Ingredients", then "Directions".

For each complete recipe return a JSON object:
- "name": Bulgarian title (fix any garbled characters like ĸ→к)
- "name_en": English translation of title
- "servings": integer from "Serving size:" line
- "bake_time_minutes": integer from "Cook time:" line
- "ingredients_text_bg": ingredients as multiline string, one per line, Bulgarian (fix garbled chars)
- "ingredients_text_en": same ingredients translated to English
- "description": all direction steps joined with double newline, Bulgarian (fix garbled chars)
- "description_en": directions translated to English
- "steps": [{"step_number":1,"step_description_bg":"...","step_description_en":"..."}]
- "ingredients": [{"ingredient_name":"...","quantity":"200","unit":"г","order_index":1}]

If no complete recipes in this batch, return empty array [].
Return ONLY valid JSON array. No markdown, no explanation.`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
    console.log(`[PDF Parser] Batch ${i + 1} raw response (first 200):`, text.substring(0, 200))

    // Extract JSON array even if there's extra text around it
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.warn(`[PDF Parser] Batch ${i + 1}: no JSON array found`)
      continue
    }

    // Try full parse first
    let batchRecipes: any[] = []
    try {
      batchRecipes = JSON.parse(jsonMatch[0])
    } catch {
      // JSON is truncated — extract complete objects only
      const objectMatches = jsonMatch[0].matchAll(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*/g)
      for (const match of objectMatches) {
        try {
          const obj = JSON.parse(match[0])
          if (obj.name) batchRecipes.push(obj)
        } catch {}
      }
      console.warn(`[PDF Parser] Batch ${i + 1}: truncated JSON, recovered ${batchRecipes.length} objects`)
    }

    if (batchRecipes.length > 0) {
      console.log(`[PDF Parser] Batch ${i + 1}: found ${batchRecipes.length} recipes`)
      allRecipes.push(...batchRecipes)
    }
  }

  // Deduplicate by name
  const seen = new Set<string>()
  const unique = allRecipes.filter(r => {
    if (!r.name || seen.has(r.name)) return false
    seen.add(r.name)
    return true
  })

  console.log('[PDF Parser] ✅ Total unique recipes:', unique.length)

  if (unique.length === 0) throw new Error('No recipes found in PDF')
  return unique
}
