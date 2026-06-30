# Fix: 413 Request Too Large — PDF Batching

## Problem
35MB PDF encoded as base64 = ~47MB → exceeds Claude API limit.

## Solution
Use pdfjs-dist to extract text from PDF pages, then send text (not binary) to Claude API.
Text extraction = ~100KB total vs 47MB binary. No size limit issues.

pdfjs-dist is already installed (confirmed earlier: v3.11.174, legacy/build/pdf.js exists).

---

## Rewrite Admin/utils/pdfParser.ts

```typescript
import fs from 'fs'
import path from 'path'
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
  // Use require to avoid Next.js ESM issues
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfjs = require('pdfjs-dist/legacy/build/pdf.js')
  try { pdfjs.GlobalWorkerOptions.workerSrc = '' } catch {}

  const fileBuffer = fs.readFileSync(filePath)
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(fileBuffer), useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise

  console.log(`[PDF Parser] Loaded ${pdf.numPages} pages`)

  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    // Join items - pdfjs returns individual characters/words
    const items = content.items as Array<{ str: string; transform: number[] }>
    
    // Group by Y position to reconstruct lines
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

// Split text into batches of ~20000 chars (safe for Claude API)
function splitIntoBatches(text: string, batchSize = 20000): string[] {
  const batches: string[] = []
  // Split on page boundaries
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

  // Step 1: Extract text from PDF
  console.log('[PDF Parser] Extracting text from PDF...')
  const fullText = await extractPDFText(filePath)
  console.log('[PDF Parser] Extracted', fullText.length, 'chars')

  // Step 2: Send to Claude in batches
  const batches = splitIntoBatches(fullText)
  console.log('[PDF Parser] Processing', batches.length, 'batches')

  const allRecipes: ParsedRecipe[] = []

  for (let i = 0; i < batches.length; i++) {
    console.log(`[PDF Parser] Batch ${i + 1}/${batches.length}...`)
    
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 8000,
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
    const clean = text.replace(/^```json\s*/m, '').replace(/^```\s*$/m, '').trim()
    
    try {
      const batchRecipes = JSON.parse(clean)
      if (Array.isArray(batchRecipes) && batchRecipes.length > 0) {
        console.log(`[PDF Parser] Batch ${i + 1}: found ${batchRecipes.length} recipes`)
        allRecipes.push(...batchRecipes)
      }
    } catch (e) {
      console.warn(`[PDF Parser] Batch ${i + 1} parse failed:`, clean.substring(0, 200))
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
```

---

## Important: fix pdfjs worker error in Next.js

If you see "Cannot use import statement" or worker errors, add to `Admin/next.config.js`:

```javascript
webpack: (config) => {
  config.resolve.alias.canvas = false
  return config
}
```

---

## Test
```bash
npm run dev
# Upload PDF
# Expected:
# [PDF Parser] Extracted ~50000 chars
# [PDF Parser] Processing 3 batches
# [PDF Parser] Batch 1: found 7 recipes
# [PDF Parser] Batch 2: found 7 recipes  
# [PDF Parser] Batch 3: found 6 recipes
# [PDF Parser] ✅ Total unique recipes: 20
```

## Do NOT change
- upload-chunk/route.ts
- execute/route.ts
- Admin UI components
