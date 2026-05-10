import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Match {
  ingredientName: string;
  databaseId: string;
}

export async function POST(request: NextRequest) {
  try {
    const { matches } = (await request.json()) as { matches: Match[] };

    if (!Array.isArray(matches) || matches.length === 0) {
      return NextResponse.json({ error: 'matches array is required' }, { status: 400 });
    }

    let totalLinked = 0;
    const results: Array<{ ingredientName: string; databaseId: string; linked: number }> = [];

    for (const match of matches) {
      const { ingredientName, databaseId } = match;

      if (!ingredientName || !databaseId) continue;

      // Fetch canonical name from ingredients_database
      const { data: dbIngredient } = await supabase
        .from('ingredients_database')
        .select('name_bg')
        .eq('id', databaseId)
        .single();

      const canonicalName = dbIngredient?.name_bg ?? ingredientName;

      const { count, error } = await supabase
        .from('recipe_ingredients')
        .update({ ingredient_database_id: databaseId, ingredient_name: canonicalName })
        .eq('ingredient_name', ingredientName)
        .is('ingredient_database_id', null)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('auto-link error for', ingredientName, error);
        continue;
      }

      const linked = count || 0;
      totalLinked += linked;
      results.push({ ingredientName, databaseId, linked });
    }

    return NextResponse.json({ success: true, totalLinked, results });
  } catch (err: any) {
    console.error('auto-link error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
