# Create: Admin/app/api/simple-recipes/[id]/steps/route.ts

## This file does NOT exist — create it from scratch.

## Path
`Admin/app/api/simple-recipes/[id]/steps/route.ts`

## Full file content

```typescript
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Fetch current ingredient PKs for ingredients_used
    const { data: recipeIngs } = await supabase
      .from('recipe_ingredients')
      .select('id')
      .eq('recipe_id', recipeId)
      .order('order_index');
    const ingredientPks = (recipeIngs || []).map((r: any) => r.id);

    // Upsert each step
    for (const [i, step] of steps.entries()) {
      const stepNumber = i + 1;
      const existing = existingMap.get(stepNumber);

      const stepData = {
        recipe_id: recipeId,
        step_number: stepNumber,
        step_description: step.step_description_bg || '',
        step_description_bg: step.step_description_bg || '',
        step_description_en: step.step_description_en || '',
        step_duration_minutes: step.step_duration_minutes ?? 0,
        // Preserve existing image/ingredients — don't overwrite
        step_image_url: existing?.step_image_url ?? step.step_image_url ?? null,
        ingredients_used: existing?.ingredients_used?.length > 0
          ? existing.ingredients_used
          : ingredientPks,
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
```
