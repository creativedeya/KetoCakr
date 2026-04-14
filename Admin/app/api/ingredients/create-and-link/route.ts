import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { ingredientName, canonicalNameBg, canonicalNameEn } = await request.json();

    if (!ingredientName || !canonicalNameBg) {
      return NextResponse.json({ error: 'ingredientName and canonicalNameBg are required' }, { status: 400 });
    }

    // 1. Create new ingredient in database
    const { data: newIngredient, error: createError } = await supabase
      .from('ingredients_database')
      .insert({
        name_bg: canonicalNameBg,
        name_en: canonicalNameEn || canonicalNameBg,
        calories_per_100g: 0,
        protein_per_100g: 0,
        fat_per_100g: 0,
        carbs_per_100g: 0,
        fiber_per_100g: 0,
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    // 2. Link all recipe_ingredients with this name (update both name and ID)
    const { count, error: linkError } = await supabase
      .from('recipe_ingredients')
      .update({
        ingredient_name: canonicalNameBg,
        ingredient_database_id: newIngredient.id,
      })
      .eq('ingredient_name', ingredientName)
      .is('ingredient_database_id', null)
      .select('*', { count: 'exact', head: true });

    if (linkError) {
      return NextResponse.json({ error: linkError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      newIngredient,
      linkedRecords: count || 0,
    });
  } catch (err: any) {
    console.error('create-and-link error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
