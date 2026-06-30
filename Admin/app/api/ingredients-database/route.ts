import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    console.log('[Ingredients DB API] GET all ingredients');

    const { data, error } = await supabase
      .from('ingredients_database')
      .select('id, name_en, name_bg')
      .order('name_en', { ascending: true });

    if (error) throw error;

    console.log('[Ingredients DB API] Found', data?.length || 0, 'ingredients');
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('[Ingredients DB API] GET error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
