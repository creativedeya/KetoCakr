import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: cors });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const dessertTypeId = searchParams.get('dessert_type_id');
  const maxNetCarbs = searchParams.get('max_net_carbs');
  const isFree = searchParams.get('is_free');
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 50);
  const offset = Number(searchParams.get('offset') ?? 0);

  let q = supabase
    .from('public_ready_recipes')
    .select('*', { count: 'exact' });

  if (query) q = q.or(`name_en.ilike.%${query}%,name_bg.ilike.%${query}%`);
  if (dessertTypeId) q = q.eq('dessert_type_id', dessertTypeId);
  if (maxNetCarbs) q = q.lte('total_net_carbs', Number(maxNetCarbs));
  if (isFree === 'true') q = q.eq('is_free', true);

  q = q.order('published_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await q;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: cors });
  }

  const results = (data ?? []).map((r) => ({
    ...r,
    app_url: `https://ketocakelab.com/recipe/${r.slug}`,
  }));

  return NextResponse.json({ results, count, limit, offset }, { headers: cors });
}
