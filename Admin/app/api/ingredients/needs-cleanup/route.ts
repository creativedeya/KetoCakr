import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  console.log('=== NEEDS CLEANUP DEBUG ===');
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Service role key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('recipe_ingredients')
    .select('id, ingredient_name, recipe_id')
    .is('ingredient_database_id', null);

  if (error) {
    console.error('Supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log('Total unlinked records:', data?.length);
  console.log('First 5 records:', data?.slice(0, 5));

  const withParentheses = data?.filter((item) => item.ingredient_name.includes('('));
  console.log('Records with parentheses:', withParentheses?.length);
  console.log('First 5 with parentheses:', withParentheses?.slice(0, 5));

  const cleanupCandidates =
    (withParentheses || [])
      .map((item) => ({
        id: item.id,
        originalName: item.ingredient_name,
        cleanedName: item.ingredient_name.replace(/\s*\([^)]*\)/g, '').trim(),
        recipeId: item.recipe_id,
      }))
      .filter((item) => item.cleanedName.length > 0);

  console.log('Cleanup candidates:', cleanupCandidates.length);
  console.log('=== END DEBUG ===');

  return NextResponse.json(
    {
      candidates: cleanupCandidates,
      totalNeedsCleanup: cleanupCandidates.length,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}
