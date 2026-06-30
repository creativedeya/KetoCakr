import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { ingredients } = await req.json();
    const recipeId = params.id;

    const { error: deleteError } = await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('recipe_id', recipeId);

    if (deleteError) throw deleteError;

    if (ingredients && ingredients.length > 0) {
      const { error: insertError } = await supabase
        .from('recipe_ingredients')
        .insert(
          ingredients.map((ing: any) => ({
            recipe_id: recipeId,
            ingredient_database_id: ing.ingredient_database_id || null,
            ingredient_name: ing.ingredient_name,
            quantity: ing.quantity || 0,
            unit: ing.unit || 'g',
            order_index: ing.order_index,
          }))
        );
      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
