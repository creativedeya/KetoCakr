import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase';
import { autoTranslateMissing } from '@/lib/translateToBulgarian';
import type { ContentBlock, LabNoteCategory, LabNoteFormData } from '@/lib/types/labNotes';

// DB column "title" is exposed as "title_en" throughout the API
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

// Strip all BG fields from blocks before storing in content_json.
// BG translation lives in the content_bg plain-text column, not in the JSON.
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const active = searchParams.get('active');
    const order = searchParams.get('order') ?? 'asc';

    const supabase = createServerComponentClient();
    let query = supabase.from('lab_notes').select(SELECT_COLS);

    if (category && VALID_CATEGORIES.includes(category as LabNoteCategory)) {
      query = query.eq('category', category);
    }
    if (active === 'true') {
      query = query.eq('is_active', true);
    } else if (active === 'false') {
      query = query.eq('is_active', false);
    }

    const direction = order === 'desc';
    query = query
      .order('display_order', { ascending: !direction })
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: LabNoteFormData = await request.json();
    const {
      category, icon, title_en, title_bg, subtitle_en, subtitle_bg,
      content_json, display_order, is_active, recipe_id, image_url, image_alt,
    } = body;

    if (!title_en?.trim()) {
      return NextResponse.json({ error: 'title_en is required' }, { status: 400 });
    }
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({
        error: `Invalid category: "${category ?? ''}". Must be one of: ${VALID_CATEGORIES.join(', ')}`,
      }, { status: 400 });
    }

    let finalTitleBg    = title_bg    || null;
    let finalSubtitleBg = subtitle_bg || null;
    let finalContentJson = content_json ?? [];

    try {
      const translated = await autoTranslateMissing(
        title_en, finalTitleBg, subtitle_en || null, finalSubtitleBg, finalContentJson,
      );
      finalTitleBg      = translated.title_bg    || finalTitleBg;
      finalSubtitleBg   = translated.subtitle_bg || finalSubtitleBg;
      finalContentJson  = translated.content_json;
    } catch {
      // translation failed — proceed with whatever BG fields we have
    }

    // Derive plain-text columns from the translated blocks, then strip BG from JSON.
    // content_json stores EN structure only; content_bg holds the BG plain text.
    const contentEN       = extractContentEN(finalContentJson);
    const contentBG       = extractContentBG(finalContentJson) || contentEN;
    const storedContentJson = stripBGFromBlocks(finalContentJson);

    const supabase = createServerComponentClient();
    const { data, error } = await supabase
      .from('lab_notes')
      .insert({
        recipe_id:     recipe_id ?? null,
        category,
        icon:          icon || '🧪',
        title:         title_en.trim(),
        title_bg:      finalTitleBg,
        subtitle_en:   subtitle_en || null,
        subtitle_bg:   finalSubtitleBg,
        content:       contentEN,
        content_bg:    contentBG,
        content_json:  storedContentJson,
        display_order: display_order ?? 0,
        is_active:     is_active ?? true,
        image_url:     image_url  ?? null,
        image_alt:     image_alt  ?? null,
      })
      .select(SELECT_COLS)
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
