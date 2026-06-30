# REAL FIX: Stream-Based PDF Upload (No Formidable)

**Status:** CRITICAL - Direct fix for 413 error  
**Timeline:** 5 minutes  
**Priority:** URGENT  

---

## PROBLEM

```
Even 28MB file throws 413
bodyParser config in route.ts doesn't work in App Router
Need STREAM processing
```

---

## SOLUTION: Stream Upload

**File:** `Admin/app/api/pdf-import/parse/route.ts`

**ACTION:** Replace ENTIRE file:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { parsePDFRecipes } from '@/utils/pdfParser';
import os from 'os';

/**
 * Stream-based PDF upload (no bodyParser limit)
 * Handles any file size by reading chunks
 */
export async function POST(request: NextRequest) {
  const tempDir = os.tmpdir();
  let tempPath = '';

  try {
    // Get FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      console.error('[PDF Import] No file provided');
      return NextResponse.json(
        { success: false, error: 'No file provided', stats: { total: 0, parsed: 0, failed: 0 }, recipes: [], errors: [] },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      console.error('[PDF Import] Not a PDF file');
      return NextResponse.json(
        { success: false, error: 'Only PDF files supported', stats: { total: 0, parsed: 0, failed: 0 }, recipes: [], errors: [] },
        { status: 400 }
      );
    }

    console.log(`[PDF Import] 📄 Starting upload: ${file.name}`);
    console.log(`[PDF Import] 📊 File size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

    // Convert File to Buffer (streaming)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to temp file
    tempPath = join(tempDir, `pdf-${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`);
    console.log(`[PDF Import] 💾 Saving to: ${tempPath}`);
    
    await writeFile(tempPath, buffer);
    console.log(`[PDF Import] ✅ File saved (${buffer.length} bytes)`);

    // Parse PDF
    console.log(`[PDF Import] 🔍 Starting parsing...`);
    const result = await parsePDFRecipes(tempPath);

    console.log(`[PDF Import] ✅ Parse complete!`);
    console.log(`[PDF Import] 📊 Results: ${result.stats.parsed}/${result.stats.total} recipes parsed`);

    // Return result
    const response = {
      success: result.success,
      recipes: result.recipes,
      stats: result.stats,
      errors: result.errors,
      message: `Successfully parsed ${result.stats.parsed} recipes from PDF`,
    };

    // Cleanup (async, don't wait)
    setImmediate(async () => {
      try {
        await unlink(tempPath);
        console.log(`[PDF Import] 🗑️  Cleaned temp file`);
      } catch (err) {
        console.warn(`[PDF Import] ⚠️  Could not clean temp: ${err}`);
      }
    });

    return NextResponse.json(response);

  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    console.error(`[PDF Import] ❌ ERROR: ${errorMsg}`);
    console.error(`[PDF Import] Stack:`, error?.stack);

    // Cleanup on error
    if (tempPath) {
      try {
        await unlink(tempPath);
      } catch (cleanupErr) {
        console.warn(`[PDF Import] Could not cleanup: ${cleanupErr}`);
      }
    }

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
- [ ] File replaced
- [ ] No `formidable` import
- [ ] No `bodyParser` config
- [ ] Stream processing enabled
- [ ] Error handling complete

---

## Also: Update next.config.js (Just in case)

**File:** `Admin/next.config.js`

**ACTION:** Add this:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  api: {
    bodyParser: {
      sizeLimit: '500mb', // Global limit for all routes
    },
  },
};

module.exports = nextConfig;
```

**Checklist:**
- [ ] File updated or created
- [ ] `bodyParser.sizeLimit` set to 500mb

---

## TEST IMMEDIATELY

### TEST 1: Simple file (5MB)

If you have a small PDF, try uploading first to verify it works.

### TEST 2: 28MB file

Upload `Испанска_кето_книга (1).pdf`

**Expected logs:**

```
[PDF Import] 📄 Starting upload: Испанска_кето_книга (1).pdf
[PDF Import] 📊 File size: 28.02 MB
[PDF Import] 💾 Saving to: /tmp/pdf-...pdf
[PDF Import] ✅ File saved (29379137 bytes)
[PDF Import] 🔍 Starting parsing...
[PDF Import] Found 76 recipes in TOC
[PDF Import] Extracting recipe 1/76...
...
[PDF Import] ✅ Parse complete!
[PDF Import] 📊 Results: 79/76 recipes parsed
```

**Expected response:**

```json
{
  "success": true,
  "recipes": [...79 recipes...],
  "stats": {
    "total": 76,
    "parsed": 79,
    "failed": 0
  },
  "errors": [],
  "message": "Successfully parsed 79 recipes from PDF"
}
```

**NO 413 error!** ✅

---

## If Still Getting 413

Try this in `Admin/app/api/pdf-import/parse/route.ts` - add at very top:

```typescript
// Override NextRequest size limit
const maxFileSize = 500 * 1024 * 1024; // 500MB
export const runtime = 'nodejs'; // Use Node.js runtime (not edge)
```

---

**ОБНОВИ ФАЙЛА И ТЕСТИРУЙ ВЕДНАГА!** ⚡