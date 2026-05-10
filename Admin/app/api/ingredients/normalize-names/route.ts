import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Mapping {
  from: string[];
  to: string;
}

export async function POST(request: NextRequest) {
  try {
    const { mappings } = (await request.json()) as { mappings: Mapping[] };

    if (!Array.isArray(mappings) || mappings.length === 0) {
      return NextResponse.json({ error: 'mappings array is required' }, { status: 400 });
    }

    let totalUpdated = 0;
    const results: Array<{ from: string[]; to: string; updated: number }> = [];

    for (const mapping of mappings) {
      const { from, to } = mapping;

      if (!from?.length || !to) continue;

      // Only normalize names that don't already match the target
      const fromFiltered = from.filter((name) => name !== to);
      if (fromFiltered.length === 0) continue;

      const { count, error } = await supabase
        .from('recipe_ingredients')
        .update({ ingredient_name: to })
        .in('ingredient_name', fromFiltered)
        .is('ingredient_database_id', null)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('normalize error for mapping', mapping, error);
        continue;
      }

      const updated = count || 0;
      totalUpdated += updated;
      results.push({ from: fromFiltered, to, updated });
    }

    return NextResponse.json({ success: true, totalUpdated, results });
  } catch (err: any) {
    console.error('normalize-names error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
