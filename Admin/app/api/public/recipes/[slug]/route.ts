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

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { data, error } = await supabase
    .from('public_ready_recipes')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: cors });
  }

  return NextResponse.json(
    { ...data, app_url: `https://ketocakelab.com/recipe/${data.slug}` },
    { headers: cors }
  );
}
