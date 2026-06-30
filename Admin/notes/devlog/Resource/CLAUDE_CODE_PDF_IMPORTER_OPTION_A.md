# KetoCakR Admin — PDF Importer Fix (Option A)

> Stack: Next.js 14, TypeScript, Supabase
> Goal: Fix PDF parsing — local, fast, minimal (TOC names → placeholder recipes)
> Time estimate: 1-2 hours

---

## Context

Chunked upload already works (5MB chunks, no 413 errors).
Only PDF **parsing** is broken — pdfplumber takes 5-10 min.

**Option A plan:**
1. Keep chunked upload as-is
2. Replace parser: extract TOC from page 2 only (text extraction, fast)
3. Generate placeholder recipes from recipe names
4. Import to DB as `simple_recipes`

---

## Step 1 — Read these files first

```
Admin/utils/pdfParser.ts                          ← DELETE this file
Admin/app/api/pdf-import/parse/route.ts           ← KEEP structure, replace parser call
Admin/app/api/pdf-import/upload-chunk/route.ts    ← READ ONLY, already works
Admin/components/PDFRecipeImporter.tsx            ← READ ONLY, already works
Admin/app/dashboard/pdf-importer/page.tsx         ← READ ONLY, already works
```

Also read:
```
Admin/app/api/simple-recipes/route.ts             ← to understand DB insert shape
```

If `Admin/app/api/simple-recipes/route.ts` doesn't exist, check:
```
Admin/app/api/recipes/simple/route.ts
```
or query Supabase schema for `simple_recipes` table columns.

---

## Step 2 — Understand the assembled file location

The upload-chunk route assembles chunks into a temp file on disk.
Find where it saves the assembled file — look for something like:
```typescript
const assembledPath = path.join('/tmp', filename)
// or
const assembledPath = path.join(process.cwd(), 'tmp', filename)
```
The parse route receives this path (or reads from same location).
**Do not change the upload/assembly logic.**

---

## Step 3 — Install pdf-parse (if not already installed)

```bash
cd Admin
npm list pdf-parse 2>/dev/null || npm install pdf-parse
npm install --save-dev @types/pdf-parse
```

If `pdf-parse` has import issues (pdfjs-dist conflict), use this workaround:
```typescript
// Use require() instead of import
const pdfParse = require('pdf-parse/lib/pdf-parse.js')
```

Alternative: use `pdfjs-dist` directly if already installed:
```bash
npm list pdfjs-dist
```

---

## Step 4 — Delete old parser and rewrite

**Delete:** `Admin/utils/pdfParser.ts`

**Create:** `Admin/utils/pdfParser.ts` (new, simple version)

```typescript
import fs from 'fs'
import path from 'path'

export interface ParsedRecipe {
  name: string
  name_bg?: string
  servings: number
  bake_time_minutes: number
  ingredients: string[]
  directions: string[]
}

export async function parsePDFRecipes(filePath: string): Promise<ParsedRecipe[]> {
  // Read assembled PDF file from disk
  const fileBuffer = fs.readFileSync(filePath)

  // Use pdf-parse with page limit — only parse first 3 pages (TOC is on page 2)
  const pdfParse = require('pdf-parse/lib/pdf-parse.js')
  
  let text = ''
  try {
    const data = await pdfParse(fileBuffer, {
      max: 3  // Only parse first 3 pages — FAST
    })
    text = data.text
  } catch (err) {
    console.error('pdf-parse error:', err)
    throw new Error('Failed to parse PDF text')
  }

  // Extract recipe names from TOC
  // TOC lines typically look like:
  //   "Recipe Name ............ 12"  (with dots)
  //   "Recipe Name            12"    (with spaces)
  //   "Recipe Name 12"               (simple)
  const recipeNames = extractTOCNames(text)

  if (recipeNames.length === 0) {
    throw new Error('No recipes found in TOC. Check PDF structure.')
  }

  // Generate placeholder recipes
  return recipeNames.map((name) => ({
    name: name,
    servings: 8,
    bake_time_minutes: 0,
    ingredients: [
      'Placeholder ingredient 1',
      'Placeholder ingredient 2',
      'Placeholder ingredient 3',
    ],
    directions: [
      'Placeholder step 1',
      'Placeholder step 2',
    ],
  }))
}

function extractTOCNames(text: string): string[] {
  const lines = text.split('\n')
  const names: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.length < 3) continue

    // Skip lines that are just numbers or page headers
    if (/^\d+$/.test(trimmed)) continue
    if (/^(table of contents|съдържание|index|contents)/i.test(trimmed)) continue

    // Match: "Some Recipe Name ... 12" or "Some Recipe Name 12"
    // The key: line ends with optional dots/spaces + page number
    const tocMatch = trimmed.match(/^(.+?)[\s.·•]+(\d{1,3})\s*$/)
    if (tocMatch) {
      const name = tocMatch[1].trim()
      // Filter out noise: must be at least 4 chars, not all caps short strings
      if (name.length >= 4 && !/^\d/.test(name)) {
        names.push(name)
      }
      continue
    }

    // Fallback: if line has no page number but looks like a recipe title
    // (Title Case or contains food-related words) — skip for now
    // Only take lines that clearly have page numbers
  }

  // Deduplicate
  return [...new Set(names)]
}
```

---

## Step 5 — Update parse/route.ts

Keep the existing file structure. Only replace the parser call.

The route should:
1. Get the assembled file path (from request body or reconstruct it)
2. Call `parsePDFRecipes(filePath)`
3. Return `{ recipes: ParsedRecipe[] }`

Check the current `parse/route.ts` — if it already calls `parsePDFRecipes`, just ensure the import points to the new utils/pdfParser.ts.

If the route passes file path correctly → no changes needed except deleting old parser.

**Important:** After parsing, delete the temp file:
```typescript
try { fs.unlinkSync(filePath) } catch {}
```

---

## Step 6 — Check simple_recipes DB schema

Run this in Supabase SQL Editor to verify columns:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'simple_recipes'
ORDER BY ordinal_position;
```

The import endpoint must map `ParsedRecipe` fields to the correct columns.
Common schema:
```
id, name, name_en, name_bg, servings, bake_time_minutes,
ingredients (text[] or jsonb), directions (text[] or jsonb),
created_at, updated_at, is_published
```

If ingredients/directions are stored as JSONB array of objects vs text[]:
- text[]: insert as `['Placeholder 1', 'Placeholder 2']`
- JSONB objects: insert as `[{ text: 'Placeholder 1' }, ...]`

---

## Step 7 — Test

```bash
cd Admin
npm run dev

# In browser: http://localhost:3000/dashboard/pdf-importer
# Upload: C:\Dev\KetoCakr\admin\notes\Испанска_кето_книга (1).pdf
# Expected:
#   - Chunked upload: shows 1/6, 2/6... 6/6 progress ✅
#   - Parsing: 10-30 seconds (not 5-10 minutes!)
#   - Preview: 20 recipe cards with names from TOC
#   - Import button: inserts into simple_recipes
#   - Navigate to /dashboard/simple-recipes → see 20 new entries
```

---

## Step 8 — If TOC extraction finds 0 recipes

Debug: log the extracted text from pages 1-3:
```typescript
console.log('=== PDF TEXT (first 2000 chars) ===')
console.log(text.substring(0, 2000))
```

Then adjust the regex in `extractTOCNames()` based on actual TOC format.

Common TOC formats in recipe books:
- `Шоколадова торта ..... 45`
- `Шоколадова торта         45`
- `45  Шоколадова торта` (page number first — Spanish books sometimes do this)

For the Spanish keto book, try also:
```typescript
// Page number first format
const tocMatchReverse = trimmed.match(/^(\d{1,3})\s+(.+)$/)
if (tocMatchReverse) {
  const name = tocMatchReverse[2].trim()
  if (name.length >= 4) names.push(name)
}
```

---

## Deliverables

- [ ] `Admin/utils/pdfParser.ts` — rewritten (simple, fast, TOC-only)
- [ ] `Admin/app/api/pdf-import/parse/route.ts` — updated if needed
- [ ] PDF parsing completes in < 60 seconds
- [ ] 15-25 recipe names extracted from TOC
- [ ] Placeholder recipes importable to `simple_recipes` table
- [ ] Console log shows recipe names for verification

---

## Do NOT change

- `Admin/components/PDFRecipeImporter.tsx`
- `Admin/app/api/pdf-import/upload-chunk/route.ts`
- `Admin/app/dashboard/pdf-importer/page.tsx`
- `Admin/next.config.js`
- Any Supabase schema

---

## Notes

- The 28MB PDF has ~280 pages but TOC is on page 2 → `max: 3` is enough
- Placeholder recipes can be edited later in the admin panel (edit form exists)
- Recipe names from Spanish book will be in Spanish — that's OK for now
- If recipe names come out garbled (encoding issues), try `pdfjs-dist` instead
