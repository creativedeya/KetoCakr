import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data: recipe, error } = await supabase
    .from('base_recipes')
    .select('*')
    .eq('id', params.id)
    .eq('is_simple_recipe', true)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [{ data: ingredients }, { data: steps }] = await Promise.all([
    supabase
      .from('recipe_ingredients')
      .select('*, ingredients_database(name_bg, name_en, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g)')
      .eq('recipe_id', params.id)
      .order('order_index'),
    supabase
      .from('recipe_instruction_steps')
      .select('*')
      .eq('recipe_id', params.id)
      .order('step_number'),
  ]);

  console.log('[Simple Recipes API] GET single:', params.id);
  return NextResponse.json({ success: true, data: { ...recipe, ingredients: ingredients || [], steps: steps || [] } });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { ingredients, steps, ...body } = await req.json();
    console.log('[Simple Recipes API] PATCH:', params.id);

    const { data, error } = await supabase
      .from('base_recipes')
      .update({ ...body, is_simple_recipe: true })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    // Replace ingredients if provided
    if (ingredients !== undefined) {
      await supabase.from('recipe_ingredients').delete().eq('recipe_id', params.id);
      if (ingredients.length > 0) {
        await supabase.from('recipe_ingredients').insert(
          ingredients.map((ing: any, i: number) => ({
            recipe_id: params.id,
            ingredient_name: ing.ingredient_name,
            ingredient_database_id: ing.ingredient_database_id || null,
            quantity: ing.quantity,
            unit: ing.unit,
            order_index: i,
          }))
        );
      }
    }

    // Replace steps if provided
    if (steps !== undefined) {
      await supabase.from('recipe_instruction_steps').delete().eq('recipe_id', params.id);
      if (steps.length > 0) {
        await supabase.from('recipe_instruction_steps').insert(
          steps.map((step: any, i: number) => ({
            recipe_id: params.id,
            step_number: i + 1,
            step_description: step.step_description_bg || step.step_description || '',
            step_description_bg: step.step_description_bg || '',
            step_description_en: step.step_description_en || '',
            step_duration_minutes: step.step_duration_minutes || 5,
            step_image_url: step.step_image_url || null,
          }))
        );
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[Simple Recipes API] PATCH Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[Simple Recipes API] DELETE:', params.id);

    await supabase.from('recipe_instruction_steps').delete().eq('recipe_id', params.id);
    await supabase.from('recipe_ingredients').delete().eq('recipe_id', params.id);

    const { error } = await supabase
      .from('base_recipes')
      .delete()
      .eq('id', params.id)
      .eq('is_simple_recipe', true);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Simple Recipes API] DELETE Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
