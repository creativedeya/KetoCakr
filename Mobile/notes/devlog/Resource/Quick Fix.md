# QUICK FIXES: 3 Problems → 3 Solutions (30 min)

**Status:** CRITICAL FIXES  
**Timeline:** 30 minutes  
**Priority:** HIGHEST  

---

## FIX 1: Simple Recipes List API (5 min)

**File:** `Admin/app/api/simple-recipes/route.ts`

**PROBLEM:**
```
[Simple Recipes API] GET Error: column base_recipes.source_type does not exist
```

**SOLUTION:** Remove `source_type` from SELECT

**ACTION:**

Replace entire file with:

```typescript
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    console.log('[Simple Recipes API] GET list');

    // Select ONLY existing columns (NO source_type, NO source_url)
    const { data: recipes, error } = await supabase
      .from('base_recipes')
      .select(`
        id,
        name,
        name_en,
        servings,
        bake_time_minutes,
        ingredients_text_bg,
        ingredients_text_en,
        description,
        description_en,
        image_url,
        is_simple_recipe,
        is_visible_to_users,
        is_free,
        created_at,
        updated_at
      `)
      .eq('is_simple_recipe', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Simple Recipes API] SELECT Error:', error.message);
      throw error;
    }

    console.log(`[Simple Recipes API] Found ${recipes?.length || 0} recipes`);

    return NextResponse.json({
      success: true,
      data: recipes || [],
      count: recipes?.length || 0,
    });
  } catch (error: any) {
    console.error('[Simple Recipes API] GET Error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

**Checklist:**
- [ ] File updated
- [ ] Removed `source_type` and `source_url` from SELECT
- [ ] Only existing columns remain
- [ ] No syntax errors

---

## FIX 2: PDF Stream Upload (15 min)

**Problem:**
```
[PDF Import] Error: 413 Request exceeds the maximum size
```

**Solution:** Use `formidable` for streaming + increase buffer

### STEP 1: Install formidable

```bash
cd Admin
npm install formidable
```

**File:** `Admin/app/api/pdf-import/parse/route.ts`

**ACTION:** Replace entire file:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { parsePDFRecipes } from '@/utils/pdfParser';
import formidable from 'formidable';
import os from 'os';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '500mb', // Increase limit
    },
  },
};

/**
 * Parse uploaded PDF file and extract recipes
 */
export async function POST(request: NextRequest) {
  const tempDir = os.tmpdir();

  try {
    // Get file from FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { success: false, error: 'Only PDF files supported' },
        { status: 400 }
      );
    }

    console.log(`[PDF Import] Parsing file: ${file.name} size: ${file.size}`);

    // Save file to temp directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = join(tempDir, `pdf-import-${Date.now()}.pdf`);

    console.log(`[PDF Import] Writing to temp: ${tempPath}`);
    await writeFile(tempPath, buffer);

    console.log(`[PDF Import] Starting PDF parse...`);

    // Parse PDF
    const result = await parsePDFRecipes(tempPath);

    console.log(`[PDF Import] Parse complete: ${result.recipes.length} recipes`);

    // Cleanup temp file
    try {
      await unlink(tempPath);
      console.log(`[PDF Import] Cleaned up temp file`);
    } catch (cleanupErr) {
      console.warn(`[PDF Import] Could not delete temp file: ${cleanupErr}`);
    }

    return NextResponse.json({
      success: result.success,
      recipes: result.recipes,
      stats: result.stats,
      errors: result.errors,
    });
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    console.error(`[PDF Import] POST Error: ${errorMsg}`);

    return NextResponse.json(
      { 
        success: false, 
        error: errorMsg,
        stats: { total: 0, parsed: 0, failed: 0 },
        recipes: [],
        errors: [errorMsg],
      },
      { status: 500 }
    );
  }
}
```

**Checklist:**
- [ ] `npm install formidable` completed
- [ ] File updated with streaming logic
- [ ] bodyParser sizeLimit = 500mb
- [ ] Error handling added
- [ ] Temp file cleanup added

---

## FIX 3: Optimize PDF Parser for Large Files (10 min)

**Problem:** pdfplumber is slow with 116MB files

**File:** `Admin/utils/pdfParser.ts`

**ACTION:** Add caching + optimize page extraction:

```typescript
// Add at top of parsePDFRecipes function:

const pageCache = new Map<number, string>();

// In parseRecipePage, replace extractText() with:

async function extractTextOptimized(page: any): Promise<string> {
  const pageNum = page.page_number;
  
  // Check cache first
  if (pageCache.has(pageNum)) {
    return pageCache.get(pageNum)!;
  }
  
  // Extract and cache
  const text = await page.extractText();
  pageCache.set(pageNum, text || '');
  
  return text || '';
}

// Then in loop, use:
const recipeText = await extractTextOptimized(recipePage);
```

Also add **timeout** for each page:

```typescript
// In parseRecipePage:

const EXTRACTION_TIMEOUT = 30000; // 30 seconds per page

const extractPromise = recipePage.extractText();
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Extraction timeout')), EXTRACTION_TIMEOUT)
);

const recipeText = await Promise.race([extractPromise, timeoutPromise]);
```

**Alternative: Use lighter library**

If pdfplumber is too slow, switch to `pdfjs-dist` (much faster):

```bash
npm install pdfjs-dist
```

Then use:

```typescript
import * as pdfjsLib from 'pdfjs-dist';

const pdf = await pdfjsLib.getDocument(filePath).promise;
const page = await pdf.getPage(pageNum);
const text = await page.getTextContent();
```

---

## TESTING (After fixes)

### TEST 1: List API

```bash
curl http://localhost:3000/api/simple-recipes
```

**Should show:** 200 + JSON array (no error)

### TEST 2: PDF Upload

1. Navigate to http://localhost:3000/dashboard/pdf-importer
2. Upload `Испанска_кето_книга.pdf` (116MB)
3. Should NOT show 413 error
4. Should start parsing
5. Should show progress

### TEST 3: Parsing Progress

Monitor terminal for:
```
[PDF Import] Parsing file: Испанска_кето_книга.pdf size: 116415675
[PDF Import] Writing to temp: ...
[PDF Import] Starting PDF parse...
[PDF Import] Found 76 recipes in TOC
[PDF Import] Extracting recipe 1/76: ...
...
[PDF Import] Parse complete: 79 recipes
```

---

## QUICK CHECKLIST

**FIX 1: List API**
- [ ] Removed `source_type` from SELECT
- [ ] File saved
- [ ] http://localhost:3000/api/simple-recipes shows 200

**FIX 2: Stream Upload**
- [ ] `npm install formidable` (if using formidable)
- [ ] `route.ts` updated with 500mb limit
- [ ] Error handling added
- [ ] Temp file cleanup working

**FIX 3: PDF Parser**
- [ ] Added caching (or switched to pdfjs-dist)
- [ ] Added timeout per page
- [ ] Ready for 116MB files

---

**EXECUTE ALL 3 FIXES, THEN TEST!** ⚡