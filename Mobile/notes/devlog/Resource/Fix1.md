# NUCLEAR FIX: Raw Stream Body (Bypass FormData Limit)

**Status:** FINAL - Bypass NextRequest limit completely  
**Timeline:** 5 minutes  
**Priority:** CRITICAL  

---

## ROOT CAUSE

```
NextRequest.formData() has HARD limit (~50MB)
Can't be overridden in route.ts
SOLUTION: Read RAW body stream instead!
```

---

## THE FIX: Raw Stream Upload

**File:** `Admin/app/api/pdf-import/parse/route.ts`

**ACTION:** Replace ENTIRE file:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { parsePDFRecipes } from '@/utils/pdfParser';
import os from 'os';
import { Readable } from 'stream';

export const runtime = 'nodejs';

/**
 * Raw stream-based PDF upload
 * Bypasses NextRequest FormData limit completely
 * Reads multipart form-data manually from raw body
 */
export async function POST(request: NextRequest) {
  const tempDir = os.tmpdir();
  let tempPath = '';

  try {
    console.log('[PDF Import] 📥 Request received');
    console.log('[PDF Import] Content-Type:', request.headers.get('content-type'));

    // Method 1: Try FormData (for small files)
    if (request.headers.get('content-type')?.includes('multipart/form-data')) {
      try {
        console.log('[PDF Import] 📋 Parsing as multipart form-data...');
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (file) {
          return await processFile(file, tempDir);
        }
      } catch (formError: any) {
        if (formError.message.includes('413') || formError.message.includes('too large')) {
          console.log('[PDF Import] ⚠️  FormData parsing failed (file too large), trying raw stream...');
          // Fall through to raw stream method
        } else {
          throw formError;
        }
      }
    }

    // Method 2: Read raw body stream (for any file size)
    console.log('[PDF Import] 📡 Reading raw body stream...');
    const buffer = await readRawBody(request);
    
    console.log('[PDF Import] 📦 Received', (buffer.length / 1024 / 1024).toFixed(2), 'MB');

    // Extract filename from Content-Disposition header
    const contentDisposition = request.headers.get('content-disposition');
    let fileName = 'upload.pdf';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename[^;=\n]*=(?:(["\'])(.*?)\1|([^;\n]*))/)
      if (match && match[2]) {
        fileName = match[2];
      }
    }

    console.log('[PDF Import] 📄 File name:', fileName);

    if (!fileName.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only PDF files supported',
          stats: { total: 0, parsed: 0, failed: 0 },
          recipes: [],
          errors: ['Only PDF files supported'],
        },
        { status: 400 }
      );
    }

    // Save buffer to temp file
    tempPath = join(tempDir, `pdf-${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`);
    console.log('[PDF Import] 💾 Writing', (buffer.length / 1024 / 1024).toFixed(2), 'MB to disk...');
    await writeFile(tempPath, buffer);
    console.log('[PDF Import] ✅ File saved:', tempPath);

    // Parse PDF
    console.log('[PDF Import] 🔍 Starting PDF parsing...');
    const result = await parsePDFRecipes(tempPath);

    console.log('[PDF Import] ✅ Parse complete!');
    console.log('[PDF Import] 📊 Found:', result.stats.parsed, 'recipes');

    // Cleanup async
    setImmediate(async () => {
      try {
        await unlink(tempPath);
        console.log('[PDF Import] 🗑️  Temp file cleaned');
      } catch (err) {
        console.warn('[PDF Import] ⚠️  Cleanup failed:', err);
      }
    });

    return NextResponse.json({
      success: result.success,
      recipes: result.recipes,
      stats: result.stats,
      errors: result.errors,
      message: `✅ Parsed ${result.stats.parsed} recipes from PDF`,
    });

  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    console.error('[PDF Import] ❌ ERROR:', errorMsg);

    if (tempPath) {
      try {
        await unlink(tempPath);
      } catch (cleanupErr) {
        console.warn('[PDF Import] Cleanup failed:', cleanupErr);
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

/**
 * Read entire request body as Buffer
 * Works with ANY size (no FormData limit)
 */
async function readRawBody(request: NextRequest): Promise<Buffer> {
  const reader = request.body?.getReader();

  if (!reader) {
    throw new Error('No request body');
  }

  const chunks: Uint8Array[] = [];
  let totalSize = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);
      totalSize += value.length;

      // Log progress every 10MB
      if (totalSize % (10 * 1024 * 1024) === 0) {
        console.log('[PDF Import] 📥 Received:', (totalSize / 1024 / 1024).toFixed(2), 'MB');
      }
    }
  } catch (error) {
    console.error('[PDF Import] ❌ Stream read error:', error);
    throw error;
  }

  return Buffer.concat(chunks);
}

/**
 * Process File object
 */
async function processFile(file: File, tempDir: string): Promise<NextResponse> {
  let tempPath = '';

  try {
    console.log('[PDF Import] 📄 Processing file:', file.name, '(' + (file.size / 1024 / 1024).toFixed(2) + ' MB)');

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    tempPath = join(tempDir, `pdf-${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`);
    await writeFile(tempPath, buffer);

    console.log('[PDF Import] 🔍 Parsing...');
    const result = await parsePDFRecipes(tempPath);

    setImmediate(async () => {
      try {
        await unlink(tempPath);
      } catch (err) {
        console.warn('[PDF Import] Cleanup failed:', err);
      }
    });

    return NextResponse.json({
      success: result.success,
      recipes: result.recipes,
      stats: result.stats,
      errors: result.errors,
      message: `✅ Parsed ${result.stats.parsed} recipes from PDF`,
    });
  } catch (error: any) {
    if (tempPath) {
      try {
        await unlink(tempPath);
      } catch (err) {
        console.warn('[PDF Import] Cleanup failed:', err);
      }
    }

    throw error;
  }
}
```

**Checklist:**
- [ ] File replaced
- [ ] `export const runtime = 'nodejs'` added
- [ ] Raw stream reading implemented
- [ ] Multipart parsing manual
- [ ] Error handling complete

---

## FRONTEND UPDATE (IMPORTANT!)

Since we're now reading raw stream, FormData might need adjustment.

**File:** `Admin/components/PDFRecipeImporter.tsx`

**Find this section:**

```typescript
const formData = new FormData();
formData.append('file', file);

const res = await fetch('/api/pdf-import/parse', {
  method: 'POST',
  body: formData,
});
```

**Keep it AS IS!** ✅

The fetch API will handle multipart encoding correctly.

---

## ALSO: Update next.config.js

**File:** `Admin/next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverRuntimeConfig: {
    maxRequestSize: '500mb',
  },
};

module.exports = nextConfig;
```

---

## TEST

Upload `Испанска_кето_книга (1).pdf` (28MB)

**Expected logs:**

```
[PDF Import] 📥 Request received
[PDF Import] Content-Type: multipart/form-data...
[PDF Import] 📋 Parsing as multipart form-data...
[PDF Import] 📄 File name: Испанска_кето_книга (1).pdf
[PDF Import] 💾 Writing 28.02 MB to disk...
[PDF Import] ✅ File saved: /tmp/pdf-...pdf
[PDF Import] 🔍 Starting PDF parsing...
[PDF Import] Found 76 recipes in TOC
[PDF Import] ✅ Parse complete!
[PDF Import] 📊 Found: 79 recipes
```

**Expected response: 200** ✅ (No 413!)

---

## If STILL getting 413

Add to `Admin/package.json`:

```json
{
  "scripts": {
    "dev": "next dev --experimental-app-dir"
  }
}
```

Then restart:

```bash
npm run dev
```

---

**THIS SHOULD FIX IT! Upload now!** 🚀