# KetoCakR — PDF Parser Rewrite (No TOC Structure)

## New PDF Structure (confirmed from screenshots)
- NO table of contents
- Each recipe = 1-2 pages with this exact layout:
  1. Photo (top)
  2. Recipe title (bold, centered, ALL CAPS or Title Case)
  3. "Serving size: X | Cook time: Y mins"
  4. "Ingredients" header → ingredient list (left column)
  5. "Directions" header → steps text (right column OR below)
  6. Steps may continue on next page until the next recipe title appears

## Goal
Rewrite `Admin/utils/pdfParser.ts` completely — no TOC, no page number lookup.
Parse page by page, detect recipe boundaries by title pattern.

---

## Step 1 — Check pdfjs-dist version and available files

```bash
cd Admin
node -e "const p = require('pdfjs-dist/package.json'); console.log(p.version, Object.keys(p.exports || {}).slice(0,10))"
ls node_modules/pdfjs-dist/build/
ls node_modules/pdfjs-dist/legacy/build/ 2>/dev/null || echo "no legacy"
```

Use the output to pick the correct import path (see Step 2).

---

## Step 2 — Rewrite Admin/utils/pdfParser.ts

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

// Load pdfjs — try multiple paths depending on installed version
async function loadPdfJs() {
  const paths = [
    'pdfjs-dist/legacy/build/pdf.js',
    'pdfjs-dist/legacy/build/pdf.mjs',
    'pdfjs-dist/build/pdf.js',
    'pdfjs-dist/build/pdf.mjs',
    'pdfjs-dist',
  ]
  for (const p of paths) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const lib = require(p)
      if (lib.getDocument) {
        try { lib.GlobalWorkerOptions.workerSrc = '' } catch {}
        console.log(`[PDF Parser] Using: ${p}`)
        return lib
      }
    } catch {}
  }
  throw new Error('pdfjs-dist not found — run: npm install pdfjs-dist')
}

interface TextItem {
  str: string
  x: number
  y: number
}

// Extract all text items from a page with coordinates
async function getPageItems(pdf: any, pageNum: number): Promise<TextItem[]> {
  const page = await pdf.getPage(pageNum)
  const content = await page.getTextContent()
  return (content.items as Array<{ str: string; transform: number[] }>)
    .filter(i => i.str.trim())
    .map(i => ({ str: i.str.trim(), x: i.transform[4], y: i.transform[5] }))
}

// Group items into visual lines by Y position
function groupIntoLines(items: TextItem[]): Array<{ y: number; items: TextItem[] }> {
  const lines = new Map<number, TextItem[]>()
  for (const item of items) {
    const y = Math.round(item.y)
    let lineY = y
    for (const [ey] of lines) {
      if (Math.abs(ey - y) <= 4) { lineY = ey; break }
    }
    if (!lines.has(lineY)) lines.set(lineY, [])
    lines.get(lineY)!.push(item)
  }
  // Sort top to bottom (higher Y = higher on page in PDF coords)
  return [...lines.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([y, items]) => ({ y, items: items.sort((a, b) => a.x - b.x) }))
}

// Check if a line looks like a recipe title
// Title = prominent text that is NOT "Ingredients", "Directions", "Serving size", page numbers
function isRecipeTitle(lineText: string): boolean {
  const t = lineText.trim()
  if (t.length < 3) return false
  if (/^(ingredients|directions|serving size|cook time|\d+)\s*$/i.test(t)) return false
  if (/^[📒🍰🎂]\s/.test(t)) return false // emoji lines = subtitle
  // Title: either ALL CAPS (≥3 words or ≥10 chars) or Title Case with ≥2 words
  const isAllCaps = t === t.toUpperCase() && /[А-ЯA-Z]/.test(t) && t.length >= 5
  const isTitleCase = /^[А-ЯA-ZЁ][а-яa-zёА-ЯA-Z]/.test(t) && t.split(' ').length >= 2
  return isAllCaps || isTitleCase
}

export async function parsePDFRecipes(filePath: string): Promise<ParsedRecipe[]> {
  const fileBuffer = fs.readFileSync(filePath)
  const pdfjsLib = await loadPdfJs()

  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) }).promise
  console.log(`[PDF Parser] ✅ Loaded PDF: ${pdf.numPages} pages`)

  const recipes: ParsedRecipe[] = []
  let currentRecipe: Partial<ParsedRecipe> | null = null
  let mode: 'none' | 'ingredients' | 'directions' = 'none'
  let ingredientLines: string[] = []
  let directionLines: string[] = []

  const saveCurrentRecipe = () => {
    if (currentRecipe?.name) {
      recipes.push({
        name: currentRecipe.name,
        servings: currentRecipe.servings ?? 8,
        bake_time_minutes: currentRecipe.bake_time_minutes ?? 0,
        ingredients_text_bg: ingredientLines.join('\n'),
        ingredients_text_en: '',
        instructions: directionLines.join('\n\n'),
      })
      console.log(`[PDF Parser] ✅ Saved "${currentRecipe.name}": ${ingredientLines.length} ing, ${directionLines.length} dir`)
    }
  }

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const items = await getPageItems(pdf, pageNum)
    const lines = groupIntoLines(items)

    for (const line of lines) {
      const lineText = line.items.map(i => i.str).join(' ').trim()
      if (!lineText) continue

      // Skip page numbers (single digit or small number alone on a line)
      if (/^\d{1,3}$/.test(lineText)) continue

      // Skip subtitle lines (book title/category lines with emoji)
      if (/📒|•\s*(Бис|Торт|Кекс|Слад)/i.test(lineText)) continue

      // Detect section headers
      if (/^ingredients$/i.test(lineText)) { mode = 'ingredients'; continue }
      if (/^directions$/i.test(lineText)) { mode = 'directions'; continue }

      // Detect serving size / cook time line
      if (/serving size/i.test(lineText)) {
        const servMatch = lineText.match(/serving size[:\s]+(\d+)/i)
        const cookMatch = lineText.match(/cook time[:\s]+(\d+)/i)
        if (currentRecipe) {
          if (servMatch) currentRecipe.servings = parseInt(servMatch[1])
          if (cookMatch) currentRecipe.bake_time_minutes = parseInt(cookMatch[1])
        }
        continue
      }

      // Detect new recipe title
      if (isRecipeTitle(lineText) && mode !== 'directions') {
        // Check: is this actually a title or part of ingredients/directions?
        // If we're in ingredients mode and line doesn't look like a full title, skip
        saveCurrentRecipe()
        currentRecipe = { name: lineText }
        ingredientLines = []
        directionLines = []
        mode = 'none'
        console.log(`[PDF Parser] 📖 New recipe: "${lineText}" (page ${pageNum})`)
        continue
      }

      // Collect content based on current mode
      // For 2-column layout: left column = ingredients, right column = directions
      // Determine midX from page items
      const pageXValues = items.map(i => i.x)
      const maxX = Math.max(...pageXValues)
      const midX = maxX * 0.45

      const leftText = line.items.filter(i => i.x < midX).map(i => i.str).join(' ').trim()
      const rightText = line.items.filter(i => i.x >= midX).map(i => i.str).join(' ').trim()

      if (mode === 'ingredients') {
        if (leftText) ingredientLines.push(leftText)
        if (rightText) directionLines.push(rightText) // directions column starts same time
      } else if (mode === 'directions') {
        // Full width directions (continuation page or single column)
        if (lineText) directionLines.push(lineText)
      }
    }
  }

  // Save last recipe
  saveCurrentRecipe()

  if (recipes.length === 0) {
    throw new Error('No recipes found. Check PDF structure.')
  }

  console.log(`[PDF Parser] 🎉 Total: ${recipes.length} recipes`)
  return recipes
}
```

---

## Step 3 — Test

```bash
npm run dev
# Upload PDF
# Expected console:
# [PDF Parser] Using: pdfjs-dist/legacy/build/pdf.js
# [PDF Parser] ✅ Loaded PDF: 35 pages
# [PDF Parser] 📖 New recipe: "АНИСОВИ ПОНИЧКИ" (page 3)
# [PDF Parser] ✅ Saved "АНИСОВИ ПОНИЧКИ": 8 ing, 5 dir
# [PDF Parser] 📖 New recipe: "БАКТЕРИ С РИКОТА И МАЛИНИ" (page 5)
# ...
# [PDF Parser] 🎉 Total: 20 recipes
```

Open edit form for "АНИСОВИ ПОНИЧКИ" → should show real Bulgarian ingredients.

---

## If isRecipeTitle() misdetects

Log every line that triggers as title:
```typescript
if (isRecipeTitle(lineText)) {
  console.log(`[TITLE CANDIDATE] page=${pageNum} mode=${mode} text="${lineText}"`)
}
```
Paste output to adjust the detection logic.

---

## Do NOT change
- upload-chunk/route.ts
- execute/route.ts
- Admin UI components
