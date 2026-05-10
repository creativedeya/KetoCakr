import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { recipeId } = await request.json();

    if (!recipeId) {
      return NextResponse.json({ error: 'recipeId is required' }, { status: 400 });
    }

    const supabase = createServerComponentClient();

    // 1. Fetch original recipe
    const { data: original, error: fetchError } = await supabase
      .from('base_recipes')
      .select('*')
      .eq('id', recipeId)
      .single();

    if (fetchError || !original) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // 2. Generate unique name
    const baseName = original.name;
    let counter = 1;
    let newName = `${baseName} + ${counter}`;

    while (true) {
      const { count } = await supabase
        .from('base_recipes')
        .select('*', { count: 'exact', head: true })
        .eq('name', newName);

      if ((count ?? 0) === 0) break;
      counter++;
      newName = `${baseName} + ${counter}`;
    }

    // 3. Insert new recipe (omit id, image_url, created_at, updated_at)
    const { id, image_url, created_at, updated_at, ...rest } = original;
    const { data: newRecipe, error: insertError } = await supabase
      .from('base_recipes')
      .insert({ ...rest, name: newName, image_url: null })
      .select()
      .single();

    if (insertError || !newRecipe) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create recipe' }, { status: 500 });
    }

    // 4. Copy recipe_ingredients
    const { data: ingredients } = await supabase
      .from('recipe_ingredients')
      .select('*')
      .eq('recipe_id', recipeId);

    if (ingredients && ingredients.length > 0) {
      const { error: ingError } = await supabase
        .from('recipe_ingredients')
        .insert(
          ingredients.map(({ id: _id, recipe_id: _rid, ...ing }) => ({
            ...ing,
            recipe_id: newRecipe.id,
          }))
        );

      if (ingError) {
        console.error('Ingredients copy error:', ingError);
      }
    }

    // 5. Copy recipe_instruction_steps (no FK constraint — always use WHERE clause)
    const { data: steps } = await supabase
      .from('recipe_instruction_steps')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('step_number');

    if (steps && steps.length > 0) {
      const { error: stepsError } = await supabase
        .from('recipe_instruction_steps')
        .insert(
          steps.map(({ id: _id, recipe_id: _rid, ...step }) => ({
            ...step,
            recipe_id: newRecipe.id,
          }))
        );

      if (stepsError) {
        console.error('Steps copy error:', stepsError);
      }
    }

    // 6. Copy recipe_equipment
    const { data: equipment } = await supabase
      .from('recipe_equipment')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('display_order');

    let equipmentCopied = 0;
    if (equipment && equipment.length > 0) {
      const { error: equipmentError } = await supabase
        .from('recipe_equipment')
        .insert(
          equipment.map(({ id: _id, recipe_id: _rid, created_at: _ca, updated_at: _ua, ...eq }) => ({
            ...eq,
            recipe_id: newRecipe.id,
          }))
        );

      if (equipmentError) {
        console.error('Equipment copy error:', equipmentError);
      } else {
        equipmentCopied = equipment.length;
      }
    }

    // 7. Copy lab notes
    const { data: labNotesData } = await supabase
      .from('lab_notes')
      .select('category, title, title_bg, content, content_bg, display_order, is_active')
      .eq('recipe_id', recipeId);

    let labNotesCopied = 0;
    if (labNotesData && labNotesData.length > 0) {
      const { error: labNotesError } = await supabase
        .from('lab_notes')
        .insert(
          labNotesData.map(note => ({ ...note, recipe_id: newRecipe.id }))
        );
      if (labNotesError) {
        console.error('Lab notes copy error:', labNotesError);
      } else {
        labNotesCopied = labNotesData.length;
      }
    }

    return NextResponse.json({ success: true, newRecipe, equipmentCopied, labNotesCopied });
  } catch (error: any) {
    console.error('Duplicate recipe error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
