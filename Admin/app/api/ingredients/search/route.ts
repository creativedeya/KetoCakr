import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  console.log('[Search API] Query:', query);

  const { data, error } = await supabase
    .from('ingredients_database')
    .select('id, name_bg, name_en')
    .or(`name_bg.ilike.%${query}%,name_en.ilike.%${query}%`)
    .order('name_bg')
    .limit(10);

  console.log('[Search API] Results:', data?.length ?? 0, '| Error:', error?.message ?? 'none');

  if (error) {
    console.error('[Search API] Supabase error:', error);
    return NextResponse.json({ results: [] });
  }

  return NextResponse.json({ results: data || [] });
}
