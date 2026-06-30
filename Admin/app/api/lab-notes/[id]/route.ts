import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase';
import type { ContentBlock, LabNoteCategory, LabNoteFormData } from '@/lib/types/labNotes';

const SELECT_COLS =
  'id, recipe_id, category, icon, title_en:title, title_bg, subtitle_en, subtitle_bg, content, content_bg, content_json, display_order, is_active, image_url, image_alt, created_at, updated_at';

function extractContentEN(blocks: ContentBlock[]): string {
  return blocks.flatMap(block => {
    if (block.type === 'intro')          return block.text_en ? [block.text_en] : [];
    if (block.type === 'lab_note')       return block.text_en ? [`${block.label_en ?? 'LAB NOTE'}: ${block.text_en}`] : [];
    if (block.type === 'tip')            return block.text_en ? [`💡 ${block.text_en}`] : [];
    if (block.type === 'critical_error') return block.text_en ? [`⚠️ ${block.text_en}`] : [];
    if (block.type === 'matrix') {
      const lines: string[] = [];
      if (block.title_en) lines.push(block.title_en);
      (block.rows ?? []).forEach(r => { if (r.label || r.value_en) lines.push(`${r.label}: ${r.value_en}`); });
      return lines.length ? [lines.join('\n')] : [];
    }
    return [];
  }).join('\n\n');
}

function stripBGFromBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.map((block): ContentBlock => {
    switch (block.type) {
      case 'intro':          return { type: 'intro',          text_en: block.text_en,   text_bg: '' };
      case 'critical_error': return { type: 'critical_error', text_en: block.text_en,   text_bg: '' };
      case 'tip':            return { type: 'tip',            text_en: block.text_en,   text_bg: '' };
      case 'lab_note':       return { type: 'lab_note',       label_en: block.label_en, label_bg: '', text_en: block.text_en, text_bg: '' };
      case 'matrix':         return {
        type: 'matrix',
        title_en: block.title_en,
        title_bg: '',
        rows: (block.rows ?? []).map(r => ({ label: r.label, value_en: r.value_en, value_bg: '' })),
      };
    }
  });
}

function extractContentBG(blocks: ContentBlock[]): string {
  return blocks.flatMap(block => {
    if (block.type === 'intro')          return block.text_bg ? [block.text_bg] : [];
    if (block.type === 'lab_note')       return block.text_bg ? [`${block.label_bg ?? block.label_en ?? 'ЛАБ. БЕЛЕЖКА'}: ${block.text_bg}`] : [];
    if (block.type === 'tip')            return block.text_bg ? [`💡 ${block.text_bg}`] : [];
    if (block.type === 'critical_error') return block.text_bg ? [`⚠️ ${block.text_bg}`] : [];
    if (block.type === 'matrix') {
      const lines: string[] = [];
      if (block.title_bg) lines.push(block.title_bg);
      (block.rows ?? []).forEach(r => { if (r.label || r.value_bg) lines.push(`${r.label}: ${r.value_bg ?? r.value_en}`); });
      return lines.length ? [lines.join('\n')] : [];
    }
    return [];
  }).join('\n\n');
}

const VALID_CATEGORIES: LabNoteCategory[] = [
  'chocolate', 'flours', 'sweeteners', 'assembly', 'mistakes', 'general',
];

function parseId(raw: string): number | null {
  const n = parseInt(raw, 10);
  return isNaN(n) ? null : n;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = parseId(params.id);
  if (id === null) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  try {
    const supabase = createServerComponentClient();
    const { data, error } = await supabase
      .from('lab_notes')
      .select(SELECT_COLS)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch (err: any) {
    if (err.code === 'PGRST116') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = parseId(params.id);
  if (id === null) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  try {
    const body: Partial<LabNoteFormData> = await request.json();
    const {
      category, icon, title_en, title_bg, subtitle_en, subtitle_bg,
      content_json, display_order, is_active, recipe_id, image_url, image_alt,
    } = body;

    if (title_en !== undefined && !title_en.trim()) {
      return NextResponse.json({ error: 'title_en cannot be empty' }, { status: 400 });
    }
    if (category !== undefined && (!category || !VALID_CATEGORIES.includes(category))) {
      return NextResponse.json({
        error: `Invalid category: "${category ?? ''}". Must be one of: ${VALID_CATEGORIES.join(', ')}`,
      }, { status: 400 });
    }

    const patch: Record<string, unknown> = {};
    if (recipe_id !== undefined) patch.recipe_id = recipe_id;
    if (category !== undefined) patch.category = category;
    if (icon !== undefined) patch.icon = icon || '🧪';
    if (title_en !== undefined) patch.title = title_en.trim();
    if (title_bg !== undefined) patch.title_bg = title_bg || null;
    if (subtitle_en !== undefined) patch.subtitle_en = subtitle_en || null;
    if (subtitle_bg !== undefined) patch.subtitle_bg = subtitle_bg || null;
    if (content_json !== undefined) {
      patch.content      = extractContentEN(content_json);
      patch.content_bg   = extractContentBG(content_json) || null;
      patch.content_json = stripBGFromBlocks(content_json);
    }
    if (display_order !== undefined) patch.display_order = display_order;
    if (is_active     !== undefined) patch.is_active     = is_active;
    if (image_url     !== undefined) patch.image_url     = image_url  || null;
    if (image_alt     !== undefined) patch.image_alt     = image_alt  || null;

    const supabase = createServerComponentClient();
    const { data, error } = await supabase
      .from('lab_notes')
      .update(patch)
      .eq('id', id)
      .select(SELECT_COLS)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = parseId(params.id);
  if (id === null) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  try {
    const supabase = createServerComponentClient();
    const { error, count } = await supabase
      .from('lab_notes')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error) throw error;
    if (count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
