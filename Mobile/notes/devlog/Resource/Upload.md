# CHUNKED UPLOAD: Send PDF in 5MB Chunks

**Status:** FINAL - Bypass all file size limits  
**Timeline:** 15 minutes  
**Priority:** CRITICAL  

---

## PROBLEM

```
Browser can't hold 28MB in memory at once
arrayBuffer() fails
Need to stream upload in chunks!
```

---

## SOLUTION: Frontend Chunked Upload

**File:** `Admin/components/PDFRecipeImporter.tsx`

**Find `handleFileSelect` function and REPLACE it:**

```typescript
async function handleFileSelect(file: File) {
  setIsLoading(true);
  setStep('parsing');
  setMessage('Claude AI анализира PDF...');
  setErrors([]);

  try {
    console.log('[Frontend] Uploading chunked:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');

    // Upload in 5MB chunks
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    
    console.log('[Frontend] Total chunks:', totalChunks);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      console.log(`[Frontend] Uploading chunk ${i + 1}/${totalChunks} (${(chunk.size / 1024 / 1024).toFixed(2)} MB)`);

      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('chunkIndex', String(i));
      formData.append('totalChunks', String(totalChunks));
      formData.append('filename', file.name);

      const res = await fetch('/api/pdf-import/upload-chunk', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        setErrors([data.error || `Chunk ${i + 1} failed`]);
        setStep('upload');
        return;
      }

      console.log(`[Frontend] ✅ Chunk ${i + 1}/${totalChunks} uploaded`);
    }

    // All chunks uploaded, now trigger parsing
    console.log('[Frontend] All chunks uploaded, triggering parse...');

    const parseRes = await fetch('/api/pdf-import/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename: file.name }),
    });

    const parseData = await parseRes.json();

    if (!parseData.success) {
      setErrors(parseData.errors || [parseData.error || 'Parse failed']);
      setStep('upload');
      return;
    }

    setRecipes(parseData.recipes);
    setErrors(parseData.errors || []);
    setMessage(`Намерени ${parseData.stats.parsed} рецепти`);
    setStep('preview');
  } catch (err: any) {
    console.error('[Frontend] Error:', err);
    setErrors([err.message || 'Unknown error']);
    setStep('upload');
  } finally {
    setIsLoading(false);
  }
}
```

**Checklist:**
- [ ] Replaced `handleFileSelect` function
- [ ] Chunk size = 5MB
- [ ] Loops through all chunks
- [ ] Sends each chunk with metadata
- [ ] Calls parse endpoint after all chunks

---

## SOLUTION: Backend Upload Chunk Handler

**File:** `Admin/app/api/pdf-import/upload-chunk/route.ts` (NEW FILE)

**ACTION:** Create new file:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import os from 'os';
import path from 'path';

export const runtime = 'nodejs';

const UPLOAD_DIR = join(os.tmpdir(), 'pdf-chunks');

/**
 * Handle chunked PDF uploads
 * Receives 5MB chunks and assembles them on disk
 */
export async function POST(request: NextRequest) {
  try {
    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    const formData = await request.formData();
    const chunk = formData.get('chunk') as File;
    const chunkIndex = parseInt(formData.get('chunkIndex') as string, 10);
    const totalChunks = parseInt(formData.get('totalChunks') as string, 10);
    const filename = formData.get('filename') as string;

    if (!chunk || isNaN(chunkIndex) || isNaN(totalChunks)) {
      return NextResponse.json(
        { success: false, error: 'Missing chunk data' },
        { status: 400 }
      );
    }

    console.log(`[PDF Upload] Chunk ${chunkIndex + 1}/${totalChunks}: ${filename} (${(chunk.size / 1024).toFixed(2)} KB)`);

    // Create session directory for this file
    const sessionId = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const sessionDir = join(UPLOAD_DIR, sessionId);
    await mkdir(sessionDir, { recursive: true });

    // Save chunk
    const chunkPath = join(sessionDir, `chunk-${chunkIndex}`);
    const bytes = await chunk.arrayBuffer();
    await writeFile(chunkPath, Buffer.from(bytes));

    console.log(`[PDF Upload] ✅ Chunk ${chunkIndex + 1} saved`);

    return NextResponse.json({
      success: true,
      chunkIndex,
      totalChunks,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded`,
    });
  } catch (error: any) {
    console.error('[PDF Upload] Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

**Checklist:**
- [ ] New file created at `Admin/app/api/pdf-import/upload-chunk/route.ts`
- [ ] Handles FormData with chunk
- [ ] Saves chunks to temp directory
- [ ] Returns success for each chunk

---

## SOLUTION: Backend Parse Handler (UPDATED)

**File:** `Admin/app/api/pdf-import/parse/route.ts`

**Replace ENTIRE file:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { readFile, unlink, mkdir } from 'fs/promises';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
import os from 'os';
import { parsePDFRecipes } from '@/utils/pdfParser';

export const runtime = 'nodejs';

const UPLOAD_DIR = join(os.tmpdir(), 'pdf-chunks');

/**
 * Parse PDF after all chunks uploaded
 * Assembles chunks and parses the complete file
 */
export async function POST(request: NextRequest) {
  let assembledPath = '';

  try {
    const body = await request.json();
    const { filename } = body;

    if (!filename) {
      return NextResponse.json(
        {
          success: false,
          error: 'Filename required',
          stats: { total: 0, parsed: 0, failed: 0 },
          recipes: [],
          errors: [],
        },
        { status: 400 }
      );
    }

    const sessionId = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const sessionDir = join(UPLOAD_DIR, sessionId);

    console.log('[PDF Parse] 🔍 Starting parse for:', filename);
    console.log('[PDF Parse] Session dir:', sessionDir);

    if (!existsSync(sessionDir)) {
      return NextResponse.json(
        {
          success: false,
          error: 'No uploaded chunks found for this file',
          stats: { total: 0, parsed: 0, failed: 0 },
          recipes: [],
          errors: [],
        },
        { status: 404 }
      );
    }

    // Read all chunk files
    const chunkFiles = Array.from({ length: 100 }, (_, i) => join(sessionDir, `chunk-${i}`))
      .filter((f) => existsSync(f));

    if (chunkFiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No chunks found',
          stats: { total: 0, parsed: 0, failed: 0 },
          recipes: [],
          errors: [],
        },
        { status: 400 }
      );
    }

    console.log(`[PDF Parse] Found ${chunkFiles.length} chunks`);

    // Assemble chunks into single file
    assembledPath = join(os.tmpdir(), `pdf-assembled-${Date.now()}.pdf`);
    console.log('[PDF Parse] 📦 Assembling chunks...');

    const buffers: Buffer[] = [];
    for (const chunkPath of chunkFiles) {
      const data = await readFile(chunkPath);
      buffers.push(data);
    }

    const assembledBuffer = Buffer.concat(buffers);
    console.log(`[PDF Parse] ✅ Assembled ${(assembledBuffer.length / 1024 / 1024).toFixed(2)} MB`);

    // Write assembled file
    const fs = await import('fs/promises');
    await fs.writeFile(assembledPath, assembledBuffer);

    // Parse PDF
    console.log('[PDF Parse] 🔍 Parsing PDF...');
    const result = await parsePDFRecipes(assembledPath);

    console.log('[PDF Parse] ✅ Parse complete:', result.stats);

    // Cleanup chunks
    console.log('[PDF Parse] 🗑️  Cleaning up...');
    for (const chunkPath of chunkFiles) {
      try {
        await unlink(chunkPath);
      } catch (err) {
        console.warn('Could not delete chunk:', chunkPath);
      }
    }

    return NextResponse.json({
      success: result.success,
      recipes: result.recipes,
      stats: result.stats,
      errors: result.errors,
      message: `✅ Parsed ${result.stats.parsed} recipes from PDF`,
    });
  } catch (error: any) {
    console.error('[PDF Parse] ❌ Error:', error.message);

    if (assembledPath) {
      try {
        await unlink(assembledPath);
      } catch (err) {
        console.warn('Could not cleanup assembled file:', err);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stats: { total: 0, parsed: 0, failed: 0 },
        recipes: [],
        errors: [error.message],
      },
      { status: 500 }
    );
  }
}
```

**Checklist:**
- [ ] Replaced entire file
- [ ] Reads chunks from disk
- [ ] Assembles into single buffer
- [ ] Parses complete PDF
- [ ] Cleans up chunks

---

## TEST

1. **Claude Code:** Update 3 files:
   - `PDFRecipeImporter.tsx` (handleFileSelect)
   - Create `upload-chunk/route.ts`
   - Update `parse/route.ts`

2. **Restart dev server:**
```bash
Ctrl+C
npm run dev
```

3. **Upload 28MB PDF**

4. **Expected logs:**
```
[Frontend] Uploading chunked: ... Size: 28.02 MB
[Frontend] Total chunks: 6
[Frontend] Uploading chunk 1/6 (5.00 MB)
[PDF Upload] Chunk 1/6: ... (5000 KB)
[PDF Upload] ✅ Chunk 1 saved
[Frontend] ✅ Chunk 1/6 uploaded
...
[Frontend] All chunks uploaded, triggering parse...
[PDF Parse] 🔍 Starting parse...
[PDF Parse] Found 6 chunks
[PDF Parse] 📦 Assembling chunks...
[PDF Parse] ✅ Assembled 28.02 MB
[PDF Parse] 🔍 Parsing PDF...
[PDF Parse] ✅ Parse complete
```

5. **Expected result:** ✅ Recipes shown in preview

---

**THIS IS THE FINAL FIX! Claude Code now!** 🚀