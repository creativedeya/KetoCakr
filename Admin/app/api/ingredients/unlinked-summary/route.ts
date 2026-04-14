import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { similarity } from '@/lib/fuzzyMatch';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function suggestNormalizedName(variations: string[]): string {
  return variations
    .map((v) => v.replace(/\d+%?|\d+г|\d+ml/gi, '').trim())
    .sort((a, b) => a.length - b.length)[0]
    .toLowerCase()
    .trim();
}

function groupByVariations(
  names: string[]
): Array<{ canonical: string; variations: string[]; count: number }> {
  const used = new Set<string>();
  const groups: Array<{ canonical: string; variations: string[]; count: number }> = [];

  // Count occurrences
  const counts: Record<string, number> = {};
  for (const name of names) {
    counts[name] = (counts[name] || 0) + 1;
  }

  const uniqueNames = Object.keys(counts);

  for (const name of uniqueNames) {
    if (used.has(name)) continue;

    const group = [name];
    used.add(name);

    for (const other of uniqueNames) {
      if (used.has(other)) continue;
      if (similarity(name.toLowerCase(), other.toLowerCase()) >= 0.7) {
        group.push(other);
        used.add(other);
      }
    }

    const totalCount = group.reduce((sum, v) => sum + counts[v], 0);
    groups.push({
      canonical: group[0],
      variations: group,
      count: totalCount,
    });
  }

  return groups;
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  try {

    const { data: unlinked, error } = await supabase
      .from('recipe_ingredients')
      .select('ingredient_name')
      .is('ingredient_database_id', null)
      .not('ingredient_name', 'is', null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const allNames = (unlinked || []).map((r) => r.ingredient_name as string);
    const rawGroups = groupByVariations(allNames);

    const groups = rawGroups
      .map((g) => ({
        canonical: g.canonical,
        variations: g.variations,
        count: g.count,
        suggested: suggestNormalizedName(g.variations),
        hasVariations: g.variations.length > 1,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      groups,
      totalUnlinked: allNames.length,
      uniqueNames: groups.length,
    });
  } catch (err: any) {
    console.error('unlinked-summary error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
