# KetoCakR Admin — PDF Full Recipe Parser

## Goal
Parse real ingredients + directions from each recipe page in the PDF.
Recipes may span multiple pages — handle continuation pages.

## PDF Structure (confirmed from screenshot)
Each recipe occupies 1-2+ pages:
```
[image]
ЗАГЛАВИЕ (bold, centered, caps)
Serving size: X | Cook time: Y mins
Ingredients          Directions
Съставки             Стъпка 1...
- item 1             Стъпка 2...
                     (continues on next page if needed)
```

## Test PDF
`C:\Dev\KetoCakr\admin\notes\Испанска_кето_книга (1).pdf`

---

## Step 1 — Read current parser
Read `Admin/utils/pdfParser.ts` — understand current structure.

---

## Step 2 — Rewrite pdfParser.ts

Replace the entire file with:

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

  // Pass 1: Extract TOC from first 3 pages
  let tocText = ''
  for (let i = 1; i <= Math.min(3, pdf.numPages); i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    tocText += content.items.map((item: any) => item.str).join(' ') + '\n'
  }

  const tocEntries = extractTOCEntries(tocText)
  console.log(`[PDF Parser] 📋 Found ${tocEntries.length} TOC entries:`, tocEntries.map(e => `${e.name} (p.${e.page})`))

  if (tocEntries.length === 0) {
    throw new Error('No TOC entries found. Check PDF structure.')
  }

  // Pass 2: Extract each recipe — may span multiple pages
  const recipes: ParsedRecipe[] = []

  for (let i = 0; i < tocEntries.length; i++) {
    const entry = tocEntries[i]
    // Last page of this recipe = page before next recipe starts
    const nextStartPage = tocEntries[i + 1]?.page ?? pdf.numPages + 1

    console.log(`[PDF Parser] 📖 "${entry.name}" — pages ${entry.page} to ${nextStartPage - 1}`)

    try {
      const allIngredients: string[] = []
      const allDirections: string[] = []
      let servings = 8
      let bakeTime = 0
      let isFirstPage = true

      for (let p = entry.page; p < nextStartPage; p++) {
        const result = await extractPageContent(pdf, p, isFirstPage)
        allIngredients.push(...result.leftItems)
        allDirections.push(...result.rightItems)
        if (isFirstPage) {
          servings = result.servings
          bakeTime = result.bakeTime
          isFirstPage = false
        }
      }

      console.log(`[PDF Parser] ✅ "${entry.name}": ${allIngredients.length} ingredient lines, ${allDirections.length} direction lines`)

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

async function extractPageContent(
  pdf: any,
  pageNum: number,
  isFirstPage: boolean
): Promise<{
  leftItems: string[]
  rightItems: string[]
  servings: number
  bakeTime: number
}> {
  const page = await pdf.getPage(pageNum)
  const content = await page.getTextContent()
  const viewport = await page.getViewport({ scale: 1 })
  const midX = viewport.width * 0.45 // Split point: left = ingredients, right = directions

  const items = content.items as Array<{ str: string; transform: number[] }>

  // Sort top-to-bottom, left-to-right
  const sorted = items
    .filter(i => i.str.trim())
    .sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5]
      if (Math.abs(yDiff) > 5) return yDiff
      return a.transform[4] - b.transform[4]
    })

  const fullText = sorted.map(i => i.str).join(' ')

  // Parse serving size and cook time (first page only)
  let servings = 8
  let bakeTime = 0
  if (isFirstPage) {
    const servingsMatch = fullText.match(/serving size[:\s]+(\d+)/i)
    if (servingsMatch) servings = parseInt(servingsMatch[1])
    const cookMatch = fullText.match(/cook time[:\s]+(\d+)/i)
    if (cookMatch) bakeTime = parseInt(cookMatch[1])
  }

  const leftItems: string[] = []
  const rightItems: string[] = []
  let inContent = false

  for (const item of sorted) {
    const text = item.str.trim()
    if (!text) continue

    // Start collecting after "Serving size" line (first page) or from top (continuation pages)
    if (!inContent) {
      if (!isFirstPage) {
        inContent = true
      } else if (/serving size|cook time/i.test(text)) {
        inContent = true
        continue
      } else {
        continue
      }
    }

    // Skip column headers
    if (/^(ingredients|directions|съставки)$/i.test(text)) continue

    if (item.transform[4] < midX) {
      leftItems.push(text)
    } else {
      rightItems.push(text)
    }
  }

  return { leftItems, rightItems, servings, bakeTime }
}

function extractTOCEntries(text: string): TOCEntry[] {
  const lines = text.split(/[\n\r]+/)
  const entries: TOCEntry[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.length < 4) continue
    if (/^\d+$/.test(trimmed)) continue
    if (/^(table of contents|съдържание|índice|index|contents|subtitle)/i.test(trimmed)) continue

    // "RECIPE NAME ..... 12"
    const match = trimmed.match(/^(.+?)[\s.·•]+(\d{1,3})\s*$/)
    if (match) {
      const name = match[1].trim()
      const page = parseInt(match[2])
      if (name.length >= 4 && !/^\d/.test(name) && page > 0) {
        entries.push({ name, page })
      }
    }
  }

  // Deduplicate by name
  const seen = new Set<string>()
  return entries.filter(e => {
    if (seen.has(e.name)) return false
    seen.add(e.name)
    return true
  })
}
```

---

## Step 3 — Test

```bash
npm run dev
# Upload PDF
# Check console for:
# [PDF Parser] 📖 "ДАМСКИ ПРЪСТЧИЦИ" — pages 20 to 21
# [PDF Parser] ✅ "ДАМСКИ ПРЪСТЧИЦИ": 5 ingredient lines, 6 direction lines
```

Open edit form for imported recipe — should show real Bulgarian text.

---

## If column split is wrong

Log item positions to find actual midX:
```typescript
if (pageNum === 20) { // check specific page
  sorted.forEach(i => console.log(`x=${Math.round(i.transform[4])} y=${Math.round(i.transform[5])} "${i.str}"`))
}
```
Adjust `viewport.width * 0.45` based on actual x values.

---

## Do NOT change
- `upload-chunk/route.ts`
- `execute/route.ts`
- Admin UI components
