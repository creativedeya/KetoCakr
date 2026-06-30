import { NextRequest, NextResponse } from 'next/server';
import { readFile, unlink, rmdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import os from 'os';
import { parsePDFRecipes } from '@/utils/pdfParser';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

const UPLOAD_DIR = join(os.tmpdir(), 'pdf-chunks');

export interface ParsedRecipe {
  id: string;
  name: string;
  name_en: string;
  servings: number;
  bake_time_minutes: number;
  ingredients_text_bg: string;
  ingredients_text_en: string;
  description: string;
  description_en: string;
  steps: import('@/utils/pdfParser').ParsedStep[];
  ingredients: import('@/utils/pdfParser').ParsedIngredient[];
  page_number: number;
}

export async function POST(request: NextRequest) {
  let assembledPath = '';
  const chunkPaths: string[] = [];

  try {
    const body = await request.json();
    const { filename, sessionId } = body as { filename: string; sessionId: string };

    if (!filename || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'filename and sessionId required', stats: { total: 0, parsed: 0, failed: 0 }, recipes: [], errors: [] },
        { status: 400 }
      );
    }

    const dir = join(UPLOAD_DIR, sessionId);

    if (!existsSync(dir)) {
      return NextResponse.json(
        { success: false, error: 'No uploaded chunks found. Please re-upload the file.', stats: { total: 0, parsed: 0, failed: 0 }, recipes: [], errors: [] },
        { status: 404 }
      );
    }

    // Assemble chunks
    console.log('[PDF Parse] 📦 Assembling chunks from session:', sessionId);

    for (let i = 0; i < 200; i++) {
      const p = join(dir, `chunk-${i}`);
      if (!existsSync(p)) break;
      chunkPaths.push(p);
    }

    if (chunkPaths.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No chunks found in session.', stats: { total: 0, parsed: 0, failed: 0 }, recipes: [], errors: [] },
        { status: 400 }
      );
    }

    console.log(`[PDF Parse] Assembling ${chunkPaths.length} chunks for "${filename}"`);
    const buffers = await Promise.all(chunkPaths.map((p) => readFile(p)));
    const assembled = Buffer.concat(buffers);
    console.log(`[PDF Parse] ✅ Assembled ${(assembled.length / 1024 / 1024).toFixed(2)} MB`);

    assembledPath = join(os.tmpdir(), `pdf-assembled-${Date.now()}.pdf`);
    await writeFile(assembledPath, assembled);

    console.log('[PDF Parse] 🔍 Parsing TOC from first 3 pages...');
    const parsed = await parsePDFRecipes(assembledPath);
    console.log(`[PDF Parse] ✅ Parsed ${parsed.length} recipes`);

    // Map to full ParsedRecipe shape expected by execute/route and RecipePreview
    const recipes: ParsedRecipe[] = parsed.map((r, idx) => ({
      id: crypto.randomUUID(),
      name: r.name,
      name_en: r.name_en ?? r.name,
      servings: r.servings,
      bake_time_minutes: r.bake_time_minutes,
      ingredients_text_bg: r.ingredients_text_bg,
      ingredients_text_en: r.ingredients_text_en,
      description: r.description,
      description_en: r.description_en,
      steps: r.steps ?? [],
      ingredients: r.ingredients ?? [],
      page_number: idx + 3,
    }));

    // Cleanup temp files
    await cleanup(dir, chunkPaths);
    try { await unlink(assembledPath); } catch {}

    return NextResponse.json({
      success: recipes.length > 0,
      recipes,
      stats: { total: recipes.length, parsed: recipes.length, failed: 0 },
      errors: [],
      message: `✅ Parsed ${recipes.length} recipes from PDF`,
    });
  } catch (error: any) {
    console.error('[PDF Parse] ❌ Error:', error.message);

    if (assembledPath) {
      try { await unlink(assembledPath); } catch {}
    }

    return NextResponse.json(
      { success: false, error: error.message, stats: { total: 0, parsed: 0, failed: 0 }, recipes: [], errors: [error.message] },
      { status: 500 }
    );
  }
}

async function cleanup(dir: string, chunkPaths: string[]) {
  for (const p of chunkPaths) {
    try { await unlink(p); } catch {}
  }
  try { await rmdir(dir); } catch {}
}
