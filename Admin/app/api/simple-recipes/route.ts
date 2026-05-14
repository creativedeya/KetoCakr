import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const sourceType = searchParams.get('source_type');
  const search = searchParams.get('search');

  let query = supabase
    .from('base_recipes')
    .select('id, name, name_en, source_type, source_url, servings, total_calories, total_net_carbs, published_at, created_at, image_url, is_simple_recipe')
    .eq('is_simple_recipe', true)
    .order('created_at', { ascending: false });

  if (status === 'published') query = query.not('published_at', 'is', null);
  else if (status === 'draft') query = query.is('published_at', null);

  if (sourceType) query = query.eq('source_type', sourceType);
  if (search) query = query.or(`name.ilike.%${search}%,name_en.ilike.%${search}%`);

  const { data, error } = await query;
  if (error) {
    console.error('[Simple Recipes API] GET Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log('[Simple Recipes API] GET all:', data?.length, 'recipes');
  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(req: NextRequest) {
  try {
    const { ingredients, steps, ...body } = await req.json();
    console.log('[Simple Recipes API] POST:', body.name_en || body.name);

    const { data: recipe, error } = await supabase
      .from('base_recipes')
      .insert([{ ...body, is_simple_recipe: true }])
      .select()
      .single();

    if (error) throw error;

    // Save ingredients
    if (ingredients?.length) {
      await supabase.from('recipe_ingredients').insert(
        ingredients.map((ing: any, i: number) => ({
          recipe_id: recipe.id,
          ingredient_name: ing.ingredient_name,
          ingredient_database_id: ing.ingredient_database_id || null,
          quantity: ing.quantity,
          unit: ing.unit,
          order_index: i,
        }))
      );
    }

    // Save steps
    if (steps?.length) {
      await supabase.from('recipe_instruction_steps').insert(
        steps.map((step: any, i: number) => ({
          recipe_id: recipe.id,
          step_number: i + 1,
          step_description: step.step_description_bg || step.step_description || '',
          step_description_bg: step.step_description_bg || '',
          step_description_en: step.step_description_en || '',
          step_duration_minutes: step.step_duration_minutes || 5,
          step_image_url: step.step_image_url || null,
        }))
      );
    }

    console.log('[Simple Recipes API] Created:', recipe.id);
    return NextResponse.json({ success: true, data: recipe });
  } catch (error: any) {
    console.error('[Simple Recipes API] POST Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
