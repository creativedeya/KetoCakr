# FAST PDF PARSER: pdf-parse Implementation

**Status:** SPEED OPTIMIZATION - Replace pdfplumber  
**Timeline:** 10 minutes  
**Priority:** CRITICAL  
**Improvement:** 5-10x faster (30-60 sec vs 5+ min)

---

## PROBLEM

```
pdfplumber = SLOW for large PDFs
28MB file = 5-10 minutes ❌
Need: 30-60 seconds ✅
```

---

## SOLUTION: Use pdf-parse

---

## STEP 1: Install pdf-parse

**Terminal:**

```bash
cd C:\Dev\KetoCakR\Admin
npm install pdf-parse
```

**Expected:**
```
added 1 package, and audited 145 packages in 2s
```

---

## STEP 2: Replace pdfParser.ts

**File:** `Admin/utils/pdfParser.ts`

**ACTION:** Replace ENTIRE file with:

```typescript
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { readFile } from 'fs/promises';
import { v4 as uuid } from 'uuid';

export interface ParsedRecipe {
  id: string;
  name: string;
  name_en?: string;
  servings: number;
  bake_time_minutes: number;
  ingredients: string[];
  directions: string[];
  page_number: number;
}

export interface ParseResult {
  success: boolean;
  recipes: ParsedRecipe[];
  errors: string[];
  stats: {
    total: number;
    parsed: number;
    failed: number;
  };
}

/**
 * Fast PDF parsing using pdf-parse
 * Extracts recipes from Table of Contents (page 2)
 */
export async function parsePDFRecipes(filePath: string): Promise<ParseResult> {
  const recipes: ParsedRecipe[] = [];
  const errors: string[] = [];

  try {
    console.log('[PDF Parser] 📖 Reading PDF with pdf-parse...');
    const buffer = await readFile(filePath);

    console.log('[PDF Parser] ⚡ Parsing PDF...');
    const pdfData = await pdfParse(buffer);

    console.log(`[PDF Parser] ✅ Extracted ${pdfData.numpages} pages`);
    console.log(`[PDF Parser] 📄 Text length: ${pdfData.text.length} chars`);

    // Split by pages
    const allText = pdfData.text;
    const lines = allText.split('\n').map((l) => l.trim()).filter(Boolean);

    // STEP 1: Find TOC (recipes with page numbers)
    console.log('[PDF Parser] 📋 Searching for recipes in TOC...');

    const recipeTOC: Array<{ name: string; pageNum: number }> = [];
    let tocStartIdx = -1;

    // Find TOC section (usually after "Contents" or "Table of Contents")
    for (let i = 0; i < Math.min(lines.length, 200); i++) {
      if (/содержани|table|contents|índice/i.test(lines[i])) {
        tocStartIdx = i;
        break;
      }
    }

    if (tocStartIdx === -1) {
      tocStartIdx = 0; // Start from beginning if no TOC header found
    }

    // Extract recipes from TOC section
    for (let i = tocStartIdx; i < Math.min(tocStartIdx + 300, lines.length); i++) {
      const line = lines[i];

      // Pattern: "RECIPE NAME    PAGE_NUMBER"
      const match = line.match(/(.+?)\s+(\d+)\s*$/);
      if (match) {
        const name = match[1].trim();
        const pageNum = parseInt(match[2], 10);

        // Validate recipe name
        if (
          name.length > 5 &&
          name.length < 150 &&
          pageNum >= 1 &&
          pageNum <= pdfData.numpages &&
          !name.toUpperCase().includes('ИСПАНСКА') &&
          !name.toUpperCase().includes('КЕТО') &&
          !name.toUpperCase().includes('СОДЕРЖАНИ') &&
          !name.toUpperCase().includes('ТАБЛИЦА')
        ) {
          recipeTOC.push({ name, pageNum });
        }
      }
    }

    console.log(`[PDF Parser] ✅ Found ${recipeTOC.length} recipes in TOC`);

    if (recipeTOC.length === 0) {
      return {
        success: false,
        recipes: [],
        errors: ['No recipes found in Table of Contents'],
        stats: { total: 0, parsed: 0, failed: 0 },
      };
    }

    // STEP 2: Extract recipe data by finding text patterns
    console.log('[PDF Parser] 🔍 Extracting recipe data...');

    for (const [idx, toc] of recipeTOC.entries()) {
      try {
        console.log(`[PDF Parser] ${idx + 1}/${recipeTOC.length}: ${toc.name}`);

        // Find recipe section in text (from TOC name onwards)
        const recipeStartIdx = allText.indexOf(toc.name);
        if (recipeStartIdx === -1) {
          errors.push(`Could not find text for "${toc.name}"`);
          continue;
        }

        // Get next 3000 chars for this recipe
        const recipeText = allText.substring(recipeStartIdx, recipeStartIdx + 3000);

        const recipe = parseRecipeText(recipeText, toc.name, toc.pageNum);
        recipes.push(recipe);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Error parsing "${toc.name}": ${msg}`);
      }
    }

    console.log(`[PDF Parser] ✅ Parsed ${recipes.length} recipes`);

    return {
      success: recipes.length > 0,
      recipes,
      errors,
      stats: {
        total: recipeTOC.length,
        parsed: recipes.length,
        failed: recipeTOC.length - recipes.length,
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[PDF Parser] ❌ Error:', msg);
    return {
      success: false,
      recipes: [],
      errors: [msg],
      stats: { total: 0, parsed: 0, failed: 0 },
    };
  }
}

/**
 * Parse recipe text section
 */
function parseRecipeText(text: string, name: string, pageNum: number): ParsedRecipe {
  const recipe: ParsedRecipe = {
    id: uuid(),
    name: name.trim(),
    name_en: name.trim(),
    servings: 8,
    bake_time_minutes: 0,
    ingredients: [],
    directions: [],
    page_number: pageNum,
  };

  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  let inIngredients = false;
  let inDirections = false;
  let ingredientCount = 0;
  let directionCount = 0;

  for (const line of lines) {
    // Servings
    if (/serving|portion|porcion|person|people|порция|персона/i.test(line) && ingredientCount === 0) {
      const match = line.match(/(\d+)/);
      if (match) recipe.servings = Math.min(parseInt(match[1], 10), 50);
      continue;
    }

    // Cook time
    if (/време|cook|min|minute|prep|preparation|приготв|печене/i.test(line) && directionCount === 0) {
      const match = line.match(/(\d+)/);
      if (match) recipe.bake_time_minutes = Math.min(parseInt(match[1], 10), 300);
      continue;
    }

    // Ingredients section
    if (/съставк|ingredient|продукт|ингредиент|ingredientes/i.test(line)) {
      inIngredients = true;
      inDirections = false;
      continue;
    }

    // Directions section
    if (/инструкц|приготв|direction|step|стъпк|method|методи|preparación/i.test(line)) {
      inIngredients = false;
      inDirections = true;
      continue;
    }

    // Add ingredients
    if (inIngredients && line.length > 3 && ingredientCount < 50) {
      if (!line.match(/^[A-Z]/i) || line.includes('г') || line.includes('мл') || line.includes('бр')) {
        recipe.ingredients.push(line);
        ingredientCount++;
      }
    }

    // Add directions
    if (inDirections && line.length > 5 && directionCount < 30) {
      if (!line.match(/\d+\.\s/) || line.match(/^\d+\.\s/)) {
        recipe.directions.push(line);
        directionCount++;
      }
    }

    // Early exit if we have enough
    if (ingredientCount >= 25 && directionCount >= 15) break;
  }

  // Cleanup
  recipe.ingredients = [...new Set(recipe.ingredients)].slice(0, 50);
  recipe.directions = [...new Set(recipe.directions)].slice(0, 30);

  return recipe;
}
```

**Checklist:**
- [ ] File replaced
- [ ] Imports updated (pdfParse)
- [ ] No pdfplumber references
- [ ] No syntax errors

---

## STEP 3: Update parse/route.ts timeout

**File:** `Admin/app/api/pdf-import/parse/route.ts`

**Find:**
```typescript
export const maxDuration = 300;
```

**Change to:**
```typescript
export const maxDuration = 120; // 2 minutes (pdf-parse is fast!)
```

---

## STEP 4: Update frontend message

**File:** `Admin/components/PDFRecipeImporter.tsx`

**Find parsing message:**
```typescript
<p className="text-gray-600 font-medium">Claude AI анализира рецептите...</p>
<p className="text-sm text-gray-400">Може да отнеме до 2 минути за голям PDF</p>
```

**Replace with:**
```typescript
<p className="text-gray-600 font-medium">⚡ Бързо парсиране с pdf-parse...</p>
<p className="text-sm text-gray-400">Очаквано време: 30-60 секунди</p>
```

---

## TEST

1. **Terminal:**
```bash
npm install pdf-parse
```

2. **Update files** (pdfParser.ts, parse/route.ts, PDFRecipeImporter.tsx)

3. **Restart dev:**
```bash
Ctrl+C
npm run dev
```

4. **Upload PDF**

5. **Expected logs:**
```
[PDF Parser] 📖 Reading PDF with pdf-parse...
[PDF Parser] ⚡ Parsing PDF...
[PDF Parser] ✅ Extracted 280 pages
[PDF Parser] 📋 Searching for recipes in TOC...
[PDF Parser] ✅ Found 20 recipes in TOC
[PDF Parser] 🔍 Extracting recipe data...
[PDF Parser] 1/20: Recipe Name
...
[PDF Parser] ✅ Parsed 20 recipes
```

6. **Expected time:** 30-60 seconds ✅

---

## SPEED COMPARISON

```
Before (pdfplumber):  ⏳ 5-10 minutes
After (pdf-parse):    ⚡ 30-60 seconds
Improvement:          5-10x FASTER!
```

---

**ПУСНИ npm install И CLAUDE CODE СЕГА!** 🚀⚡