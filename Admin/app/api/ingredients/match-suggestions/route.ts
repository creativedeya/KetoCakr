import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { findBestMatches } from '@/lib/fuzzyMatch';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  try {

    // 1. Get all unlinked ingredient names
    const { data: unlinked, error: unlinkedError } = await supabase
      .from('recipe_ingredients')
      .select('ingredient_name')
      .is('ingredient_database_id', null)
      .not('ingredient_name', 'is', null);

    if (unlinkedError) {
      return NextResponse.json({ error: unlinkedError.message }, { status: 500 });
    }

    // 2. Get all database ingredients
    const { data: database, error: dbError } = await supabase
      .from('ingredients_database')
      .select('id, name_bg, name_en');

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    const allNames = (unlinked || []).map((r) => r.ingredient_name as string);

    // Count occurrences per name
    const counts: Record<string, number> = {};
    for (const name of allNames) {
      counts[name] = (counts[name] || 0) + 1;
    }

    const uniqueNames = Object.keys(counts);
    const dbIngredients = database || [];

    // 3. Find best match for each unique name
    const suggestions = uniqueNames.map((name) => {
      const matches = findBestMatches(name, dbIngredients, 0.4, 3);
      const best = matches[0] ?? null;

      return {
        ingredientName: name,
        recordCount: counts[name],
        match: best
          ? { id: best.id, name: best.name, score: Math.round(best.score * 100) }
          : null,
        allMatches: matches.map((m) => ({ id: m.id, name: m.name, score: Math.round(m.score * 100) })),
        highConfidence: best ? best.score >= 0.9 : false,
      };
    });

    suggestions.sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0));

    const highConfidenceCount = suggestions.filter((s) => s.highConfidence).length;
    const lowConfidenceCount = suggestions.filter((s) => !s.highConfidence).length;

    return NextResponse.json({ suggestions, highConfidenceCount, lowConfidenceCount });
  } catch (err: any) {
    console.error('match-suggestions error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
