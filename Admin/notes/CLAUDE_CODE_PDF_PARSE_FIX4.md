# Fix: PDF Parser — Word-Per-Line Format

## Problem
pdfjs-dist returns each word/syllable on a separate line:
```
АНИСОВИ
ПОНИЧКИ
1
БАКТЕРИ
С
РИКОТА
...
```
The regex `/^(.+?)[\s.]+(\d{1,3})\s*$/` never matches because name and page number are on different lines.

## Solution
Join all text items with spaces (not newlines), then use position-based X split for columns.

---

## Rewrite Admin/utils/pdfParser.ts

```typescript
import fs from 'fs'

export interface ParsedRecipe {
  name: string
  servings: number
  bake_time_minutes: number
  ingredients_text_bg: string
  ingredients_text_en: string
  instructions: string
}

interface TOCEntry {
  name: string
  page: number
}

export async function parsePDFRecipes(filePath: string): Promise<ParsedRecipe[]> {
  const fileBuffer = fs.readFileSync(filePath)
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  pdfjsLib.GlobalWorkerOptions.workerSrc = ''

  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) }).promise
  console.log(`[PDF Parser] ✅ Loaded PDF: ${pdf.numPages} pages`)

  // Pass 1: Extract TOC from page 2
  // Join all items with spaces — pdfjs splits each word separately
  const tocPage = await pdf.getPage(2)
  const tocContent = await tocPage.getTextContent()
  const tocItems = tocContent.items as Array<{ str: string; transform: number[] }>

  const tocEntries = extractTOCFromItems(tocItems)
  console.log(`[PDF Parser] 📋 Found ${tocEntries.length} entries:`, tocEntries.map(e => `${e.name} (p.${e.page})`))

  if (tocEntries.length === 0) {
    throw new Error('No TOC entries found.')
  }

  // Pass 2: Extract each recipe (may span multiple pages)
  const recipes: ParsedRecipe[] = []

  for (let i = 0; i < tocEntries.length; i++) {
    const entry = tocEntries[i]
    const nextStartPage = tocEntries[i + 1]?.page ?? pdf.numPages + 1

    console.log(`[PDF Parser] 📖 "${entry.name}" pages ${entry.page}–${nextStartPage - 1}`)

    try {
      const allIngredients: string[] = []
      const allDirections: string[] = []
      let servings = 8
      let bakeTime = 0
      let isFirstPage = true

      for (let p = entry.page; p < nextStartPage; p++) {
        const result = await extractRecipeFromPage(pdf, p, isFirstPage)
        allIngredients.push(...result.ingredients)
        allDirections.push(...result.directions)
        if (isFirstPage) {
          if (result.servings) servings = result.servings
          if (result.bakeTime) bakeTime = result.bakeTime
          isFirstPage = false
        }
      }

      console.log(`[PDF Parser] ✅ "${entry.name}": ${allIngredients.length} ing, ${allDirections.length} dir`)

      recipes.push({
        name: entry.name,
        servings,
        bake_time_minutes: bakeTime,
        ingredients_text_bg: allIngredients.join('\n'),
        ingredients_text_en: '',
        instructions: allDirections.join('\n\n'),
      })
    } catch (err) {
      console.warn(`[PDF Parser] ⚠️ Failed "${entry.name}":`, err)
      recipes.push({
        name: entry.name,
        servings: 8,
        bake_time_minutes: 0,
        ingredients_text_bg: '',
        ingredients_text_en: '',
        instructions: '',
      })
    }
  }

  return recipes
}

function extractTOCFromItems(items: Array<{ str: string; transform: number[] }>): TOCEntry[] {
  // Strategy: find items that are standalone numbers (page numbers)
  // The text items just before a number = recipe name words
  // Group by Y position to reconstruct lines

  // Group items by Y position (same line = within 3px)
  const lines = new Map<number, Array<{ str: string; x: number }>>()

  for (const item of items) {
    if (!item.str.trim()) continue
    const y = Math.round(item.transform[5])
    // Find existing line within 3px
    let lineY = y
    for (const [existingY] of lines) {
      if (Math.abs(existingY - y) <= 3) { lineY = existingY; break }
    }
    if (!lines.has(lineY)) lines.set(lineY, [])
    lines.get(lineY)!.push({ str: item.str.trim(), x: item.transform[4] })
  }

  // Sort lines top to bottom
  const sortedLines = [...lines.entries()]
    .sort((a, b) => b[0] - a[0]) // Y descending = top first
    .map(([, items]) => items.sort((a, b) => a.x - b.x).map(i => i.str).join(' '))

  console.log('[PDF Parser] TOC lines:', sortedLines.slice(0, 30))

  // Each TOC entry: "NAME ... PAGE_NUMBER"
  // After grouping by Y, lines should look like "АНИСОВИ ПОНИЧКИ 1"
  const entries: TOCEntry[] = []
  const seen = new Set<string>()

  for (const line of sortedLines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (/^(contents|съдържание)/i.test(trimmed)) continue

    // Match "SOME NAME 12" — ends with a number
    const match = trimmed.match(/^(.+?)\s+(\d{1,3})\s*$/)
    if (match) {
      const name = match[1].trim()
      const page = parseInt(match[2])
      if (name.length >= 3 && page > 0 && !seen.has(name)) {
        seen.add(name)
        entries.push({ name, page })
      }
    }
  }

  return entries
}

async function extractRecipeFromPage(
  pdf: any,
  pageNum: number,
  isFirstPage: boolean
): Promise<{
  ingredients: string[]
  directions: string[]
  servings: number
  bakeTime: number
}> {
  const page = await pdf.getPage(pageNum)
  const content = await page.getTextContent()
  const viewport = page.getViewport({ scale: 1 })
  const items = content.items as Array<{ str: string; transform: number[] }>

  // Group items by Y line (same approach as TOC)
  const lines = new Map<number, Array<{ str: string; x: number; y: number }>>()

  for (const item of items) {
    if (!item.str.trim()) continue
    const y = Math.round(item.transform[5])
    let lineY = y
    for (const [existingY] of lines) {
      if (Math.abs(existingY - y) <= 3) { lineY = existingY; break }
    }
    if (!lines.has(lineY)) lines.set(lineY, [])
    lines.get(lineY)!.push({ str: item.str.trim(), x: item.transform[4], y })
  }

  // Sort top to bottom
  const sortedLines = [...lines.entries()]
    .sort((a, b) => b[0] - a[0])

  // Find midX: look at x positions of all items, find natural gap between columns
  const allX = items.map(i => i.transform[4]).filter(x => x > 10)
  allX.sort((a, b) => a - b)
  // Use page midpoint as split
  const pageWidth = viewport.width
  const midX = pageWidth * 0.45

  let inContent = false
  let servings = 0
  let bakeTime = 0
  const ingredients: string[] = []
  const directions: string[] = []

  // Accumulate left/right text per line
  for (const [, lineItems] of sortedLines) {
    const lineText = lineItems.map(i => i.str).join(' ')

    // Parse serving size and cook time
    if (isFirstPage) {
      const servMatch = lineText.match(/serving size[:\s]+(.+?)(?:\||$)/i)
      if (servMatch) {
        const numMatch = servMatch[1].match(/(\d+)/)
        if (numMatch) servings = parseInt(numMatch[1])
      }
      const cookMatch = lineText.match(/cook time[:\s]+(\d+)/i)
      if (cookMatch) bakeTime = parseInt(cookMatch[1])
    }

    // Start content after "Serving size" line or "Ingredients/Directions" header
    if (!inContent) {
      if (/serving size|cook time/i.test(lineText)) { inContent = true; continue }
      if (!isFirstPage) inContent = true
    }
    if (!inContent) continue

    // Skip section headers
    if (/^(ingredients|directions|съставки)\s*$/i.test(lineText.trim())) continue

    // Split items in this line by column
    const leftParts = lineItems.filter(i => i.x < midX).map(i => i.str)
    const rightParts = lineItems.filter(i => i.x >= midX).map(i => i.str)

    if (leftParts.length > 0) ingredients.push(leftParts.join(' '))
    if (rightParts.length > 0) directions.push(rightParts.join(' '))
  }

  return { ingredients, directions, servings, bakeTime }
}
```

---

## Test
```bash
npm run dev
# Upload PDF
# Check console:
# [PDF Parser] TOC lines: ['АНИСОВИ ПОНИЧКИ 1', 'БАКТЕРИ С РИКОТА И МАЛИНИ 3', ...]
# [PDF Parser] ✅ "АНИСОВИ ПОНИЧКИ": 8 ing, 5 dir
```

If TOC lines still look wrong (words on separate lines), log the raw sortedLines array and paste output.

---

## Do NOT change
- upload-chunk/route.ts
- execute/route.ts  
- Admin UI components
