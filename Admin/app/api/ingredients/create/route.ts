import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { name_bg, name_en } = await request.json();

    if (!name_bg?.trim()) {
      return NextResponse.json({ error: 'name_bg is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { data: ingredient, error } = await supabase
      .from('ingredients_database')
      .insert({
        name_bg: name_bg.trim(),
        name_en: name_en?.trim() || name_bg.trim(),
        calories_per_100g: 0,
        protein_per_100g: 0,
        fat_per_100g: 0,
        carbs_per_100g: 0,
        fiber_per_100g: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Create ingredient error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, ingredient });
  } catch (err: any) {
    console.error('Create ingredient error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
