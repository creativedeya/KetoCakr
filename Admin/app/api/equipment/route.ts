import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const servingContainer = req.nextUrl.searchParams.get('serving_container');

    if (servingContainer === 'true') {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name, name_en, category, serving_container_type')
        .eq('is_serving_container', true)
        .order('name');

      if (error) throw error;
      return NextResponse.json({ success: true, data: data || [] });
    }

    const { data, error } = await supabase
      .from('equipment')
      .select('id, name, name_en, category')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('[Equipment API] GET error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
