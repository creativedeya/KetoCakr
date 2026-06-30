import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// PATCH — update ingredients_used and equipment_needed per step
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { stepAssociations } = await req.json();
    // stepAssociations: Array<{ stepId: string; ingredientIds: number[]; equipmentIds: number[] }>

    for (const assoc of stepAssociations) {
      const { error } = await supabase
        .from('recipe_instruction_steps')
        .update({
          ingredients_used: assoc.ingredientIds || [],
          equipment_needed: assoc.equipmentIds?.length > 0 ? assoc.equipmentIds : null,
        })
        .eq('id', assoc.stepId)
        .eq('recipe_id', params.id); // safety: only touch steps for this recipe

      if (error) throw error;
    }

    console.log('[Step Associations] Updated', stepAssociations.length, 'steps for recipe:', params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Step Associations] PATCH error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
