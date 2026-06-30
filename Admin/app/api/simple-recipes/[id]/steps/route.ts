import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from('recipe_instruction_steps')
    .select('*')
    .eq('recipe_id', params.id)
    .order('step_number', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { steps } = await req.json();
    const recipeId = params.id;

    if (!Array.isArray(steps)) {
      return NextResponse.json({ error: 'steps must be an array' }, { status: 400 });
    }

    // Fetch existing steps to preserve images and ingredients_used
    const { data: existingSteps } = await supabase
      .from('recipe_instruction_steps')
      .select('id, step_number, step_image_url, ingredients_used, ingredient_ids, equipment_needed')
      .eq('recipe_id', recipeId)
      .order('step_number');

    const existingMap = new Map(
      (existingSteps || []).map(s => [s.step_number, s])
    );

    // Fetch recipe_ingredients to build a lookup: ingredient_database_id → recipe_ingredient.id
    const { data: recipeIngs } = await supabase
      .from('recipe_ingredients')
      .select('id, ingredient_database_id, order_index')
      .eq('recipe_id', recipeId)
      .order('order_index');

    // Map: recipe_ingredient.id (PK) → itself (for ingredients_used array)
    const allIngPks = (recipeIngs || []).map((r: any) => r.id);

    // Upsert each step
    for (const [i, step] of steps.entries()) {
      const stepNumber = i + 1;
      const existing = existingMap.get(stepNumber);

      // ingredients_used: use existing per-step selection if set,
      // otherwise keep existing from DB, otherwise use all (fallback)
      const existingIngredientsUsed = existing?.ingredients_used;
      const hasPerStepSelection = existingIngredientsUsed && existingIngredientsUsed.length > 0;

      const stepData = {
        recipe_id: recipeId,
        step_number: stepNumber,
        step_description: step.step_description_bg || '',
        step_description_bg: step.step_description_bg || '',
        step_description_en: step.step_description_en || '',
        step_duration_minutes: step.step_duration_minutes ?? 0,
        // Preserve existing image — never overwrite from text editor
        step_image_url: existing?.step_image_url ?? step.step_image_url ?? null,
        // Preserve per-step ingredient selection from StepInfoSection
        ingredients_used: hasPerStepSelection ? existingIngredientsUsed : [],
        ingredient_ids: existing?.ingredient_ids ?? null,
        equipment_needed: existing?.equipment_needed ?? null,
      };

      if (existing) {
        const { error } = await supabase
          .from('recipe_instruction_steps')
          .update(stepData)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('recipe_instruction_steps')
          .insert(stepData);
        if (error) throw error;
      }
    }

    // Delete steps beyond the new count
    const newStepNumbers = steps.map((_: any, i: number) => i + 1);
    const toDelete = (existingSteps || [])
      .filter(s => !newStepNumbers.includes(s.step_number))
      .map(s => s.id);

    if (toDelete.length > 0) {
      await supabase
        .from('recipe_instruction_steps')
        .delete()
        .in('id', toDelete);
    }

    console.log(`[Steps API] Saved ${steps.length} steps for recipe ${recipeId}`);
    return NextResponse.json({ success: true, count: steps.length });

  } catch (error: any) {
    console.error('[Steps API] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
