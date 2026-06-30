import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const arcanaType = searchParams.get('arcana_type');
    const suit = searchParams.get('suit');
    const published = searchParams.get('published');

    let query = supabase
      .from('tarot_cards')
      .select('id, card_number, suit, arcana_type, card_name, card_name_en, theme, recipe_role_id, linked_recipe_id, linked_base_recipe_id, image_source_mode, is_published, card_image_url, energy_word, daily_phrase, morning_tip, daily_trap, evening_question, created_at')
      .order('arcana_type', { ascending: true })
      .order('suit', { ascending: true, nullsFirst: true })
      .order('card_number', { ascending: true });

    if (arcanaType) query = query.eq('arcana_type', arcanaType);
    if (suit) query = query.eq('suit', suit);
    if (published === 'true') query = query.eq('is_published', true);
    else if (published === 'false') query = query.eq('is_published', false);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('[Tarot Cards API] GET Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { data, error } = await supabase
      .from('tarot_cards')
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[Tarot Cards API] POST Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
