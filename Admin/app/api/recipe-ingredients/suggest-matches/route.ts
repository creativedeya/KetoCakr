import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase';
import { findBestMatches } from '@/lib/fuzzyMatch';

export async function POST(request: NextRequest) {
  try {
    const { ingredientName } = await request.json();

    if (!ingredientName) {
      return NextResponse.json({ error: 'ingredientName is required' }, { status: 400 });
    }

    const supabase = createServerComponentClient();

    const { data: allIngredients, error } = await supabase
      .from('ingredients_database')
      .select('id, name_bg, name_en');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const matches = findBestMatches(ingredientName, allIngredients || []);

    return NextResponse.json({ matches });
  } catch (error: any) {
    console.error('suggest-matches error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
