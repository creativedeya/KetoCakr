import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { recipeId, rows } = await request.json();
    if (!recipeId) return NextResponse.json({ error: 'recipeId required' }, { status: 400 });

    // Delete existing
    await supabase.from('recipe_equipment').delete().eq('recipe_id', recipeId);

    // Insert new rows
    if (rows.length > 0) {
      const { error } = await supabase.from('recipe_equipment').insert(
        rows.map((r: any, idx: number) => ({
          recipe_id: recipeId,
          item: r.name || r.name_bg,
          item_bg: r.name_bg || r.name,
          quantity: r.quantity || 1,
          size: r.size || null,
          essential: r.essential ?? true,
          reusable: true,
          equipment_id: r.equipment_id || null,
          image_url: r.image_url || null,
          display_order: idx,
        }))
      );
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
