import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get('id');
    const force = searchParams.get('force') === 'true';

    if (!recipeId) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const supabase = createServerComponentClient();

    if (!force) {
      // Check usage in ready recipes
      const { count: readyCount } = await supabase
        .from('ready_recipe_components')
        .select('*', { count: 'exact', head: true })
        .eq('base_recipe_id', recipeId);

      // Check usage in user recipes
      const { count: userCount } = await supabase
        .from('user_recipe_components')
        .select('*', { count: 'exact', head: true })
        .eq('base_recipe_id', recipeId);

      if ((readyCount ?? 0) > 0 || (userCount ?? 0) > 0) {
        return NextResponse.json({ warning: true, readyCount, userCount });
      }
    }

    // Delete cascade in order
    const { error: ingError } = await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('recipe_id', recipeId);
    if (ingError) console.error('Delete ingredients error:', ingError);

    // recipe_instruction_steps has no FK — always delete by WHERE clause
    const { error: stepsError } = await supabase
      .from('recipe_instruction_steps')
      .delete()
      .eq('recipe_id', recipeId);
    if (stepsError) console.error('Delete steps error:', stepsError);

    const { error: readyCompError } = await supabase
      .from('ready_recipe_components')
      .delete()
      .eq('base_recipe_id', recipeId);
    if (readyCompError) console.error('Delete ready_recipe_components error:', readyCompError);

    const { error: userCompError } = await supabase
      .from('user_recipe_components')
      .delete()
      .eq('base_recipe_id', recipeId);
    if (userCompError) console.error('Delete user_recipe_components error:', userCompError);

    const { error: recipeError } = await supabase
      .from('base_recipes')
      .delete()
      .eq('id', recipeId);

    if (recipeError) {
      console.error('Delete recipe error:', recipeError);
      return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete recipe error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
