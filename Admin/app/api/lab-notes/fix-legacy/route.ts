import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase';
import { batchTranslateToEnglish } from '@/lib/translateToBulgarian';

// U+0400–U+04FF covers the full Cyrillic block used in Bulgarian
const CYRILLIC = /[Ѐ-ӿ]/;

function hasCyrillic(text: string | null | undefined): boolean {
  return CYRILLIC.test(text ?? '');
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// GET — preview which notes need fixing (no changes made)
export async function GET(_req: NextRequest) {
  try {
    const supabase = createServerComponentClient();
    const { data: notes, error } = await supabase
      .from('lab_notes')
      .select('id, title, content, content_bg')
      .not('recipe_id', 'is', null)
      .order('id', { ascending: true });

    if (error) throw error;

    const needsFix = (notes ?? []).filter(n => hasCyrillic(n.content));

    return NextResponse.json({
      total_recipe_notes: notes?.length ?? 0,
      needs_fix: needsFix.length,
      notes: needsFix.map(n => ({
        id: n.id,
        title: n.title,
        content_preview: (n.content ?? '').slice(0, 120),
        content_bg_preview: (n.content_bg ?? '').slice(0, 80),
        content_bg_already_set: !!n.content_bg,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST — execute the fix: move BG→content_bg, translate BG→EN into content
export async function POST(request: NextRequest) {
  console.log('=== [fix-legacy] POST called ===');
  try {
    const body = await request.json().catch(() => ({}));
    const dryRun: boolean = body.dry_run === true;
    const onlyIds: number[] | undefined = Array.isArray(body.ids) ? body.ids : undefined;
    const chunkSize: number = typeof body.chunk_size === 'number' ? body.chunk_size : 5;

    console.log('[fix-legacy] body:', JSON.stringify({ dryRun, onlyIds, chunkSize }));

    const supabase = createServerComponentClient();
    const { data: notes, error } = await supabase
      .from('lab_notes')
      .select('id, title, content, content_bg')
      .not('recipe_id', 'is', null)
      .order('id', { ascending: true });

    if (error) throw error;

    console.log(`[fix-legacy] Fetched ${notes?.length ?? 0} recipe notes from DB`);

    // Log every note's Cyrillic check so we can see why candidates might be empty
    (notes ?? []).slice(0, 5).forEach(n => {
      const has = hasCyrillic(n.content);
      console.log(`[fix-legacy] Note ${n.id} hasCyrillic=${has} content[0..60]="${(n.content ?? '').slice(0, 60)}"`);
    });

    let candidates = (notes ?? []).filter(n => hasCyrillic(n.content));

    if (onlyIds?.length) {
      console.log(`[fix-legacy] Filtering to IDs: ${onlyIds}`);
      candidates = candidates.filter(n => onlyIds.includes(n.id));
    }

    console.log(`[fix-legacy] candidates after filter: ${candidates.length}, dry_run: ${dryRun}`);

    if (!candidates.length) {
      return NextResponse.json({
        fixed: 0,
        message: 'No notes need fixing (no Cyrillic found in content field)',
        total_recipe_notes: notes?.length ?? 0,
        sample_content: (notes ?? []).slice(0, 3).map(n => ({
          id: n.id,
          content_preview: (n.content ?? '').slice(0, 80),
        })),
      });
    }

    if (dryRun) {
      return NextResponse.json({
        dry_run: true,
        total_recipe_notes: notes?.length ?? 0,
        detected: candidates.length,
        notes: candidates.map(n => ({
          id: n.id,
          title: n.title,
          content_preview: (n.content ?? '').slice(0, 100),
        })),
      });
    }

    // Translate in chunks to avoid output token limits
    const translations: Record<string, string> = {};
    const chunks = chunk(candidates, chunkSize);

    console.log(`[fix-legacy] Processing ${chunks.length} chunks of up to ${chunkSize} notes each`);

    for (let ci = 0; ci < chunks.length; ci++) {
      const batch = chunks[ci];
      console.log(`[fix-legacy] Chunk ${ci + 1}/${chunks.length}: IDs ${batch.map(n => n.id).join(', ')}`);

      const items = batch.map(n => ({ id: String(n.id), text: n.content ?? '' }));
      console.log('[fix-legacy] About to call batchTranslateToEnglish with', items.length, 'items');
      const result = await batchTranslateToEnglish(items);
      console.log('[fix-legacy] batchTranslateToEnglish returned', Object.keys(result).length, 'results');

      for (const [id, text] of Object.entries(result)) {
        translations[id] = text;
      }

      console.log(`[fix-legacy] Chunk ${ci + 1} got ${Object.keys(result).length}/${batch.length} translations`);
    }

    console.log(`[fix-legacy] Total translations received: ${Object.keys(translations).length}/${candidates.length}`);

    // Apply updates
    const results: Array<{ id: number; title: string; ok: boolean; error?: string; en_preview?: string }> = [];

    for (const note of candidates) {
      const bgText = note.content ?? '';
      const newContentBg = !note.content_bg || hasCyrillic(note.content_bg)
        ? bgText
        : note.content_bg;
      const newContent = translations[String(note.id)] ?? '';

      if (!newContent) {
        console.warn(`[fix-legacy] No translation for note ${note.id} ("${note.title}")`);
        results.push({ id: note.id, title: note.title, ok: false, error: 'Translation returned empty string' });
        continue;
      }

      console.log(`[fix-legacy] Updating note ${note.id}: EN="${newContent.slice(0, 80)}..."`);

      const { error: updateErr } = await supabase
        .from('lab_notes')
        .update({ content: newContent, content_bg: newContentBg })
        .eq('id', note.id);

      results.push({
        id: note.id,
        title: note.title,
        ok: !updateErr,
        error: updateErr?.message,
        en_preview: newContent.slice(0, 100),
      });
    }

    return NextResponse.json({
      dry_run: false,
      total_recipe_notes: notes?.length ?? 0,
      detected: candidates.length,
      fixed: results.filter(r => r.ok).length,
      failed: results.filter(r => !r.ok).length,
      results,
    });
  } catch (err: any) {
    console.error('[fix-legacy] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
