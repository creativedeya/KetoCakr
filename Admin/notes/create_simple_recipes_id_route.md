# Create: Admin/app/api/simple-recipes/[id]/route.ts

## This file does NOT exist — create it from scratch.

## Path
`Admin/app/api/simple-recipes/[id]/route.ts`

## Full file content

```typescript
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── GET single simple recipe ───────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: recipe, error } = await supabase
      .from('base_recipes')
      .select('*')
      .eq('id', params.id)
      .eq('is_simple_recipe', true)
      .single();

    if (error) throw error;
    if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const [{ data: ingredients }, { data: steps }] = await Promise.all([
      supabase
        .from('recipe_ingredients')
        .select('*, ingredients_database(calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g, is_sugar_alcohol)')
        .eq('recipe_id', params.id)
        .order('order_index'),
      supabase
        .from('recipe_instruction_steps')
        .select('*')
        .eq('recipe_id', params.id)
        .order('step_number'),
    ]);

    return NextResponse.json({
      success: true,
      data: recipe,
      ingredients: ingredients || [],
      steps: steps || [],
    });
  } catch (error: any) {
    console.error('[Simple Recipes API] GET by id error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── PATCH update simple recipe ─────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { ingredients, steps, ...body } = await req.json();
    console.log('[Simple Recipes API] PATCH:', params.id);

    // Update base_recipes
    const { data: recipe, error } = await supabase
      .from('base_recipes')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    // Update ingredients if provided
    let ingredientPks: number[] = [];
    if (ingredients !== undefined) {
      await supabase.from('recipe_ingredients').delete().eq('recipe_id', params.id);
      if (ingredients.length > 0) {
        const { data: savedIngredients } = await supabase
          .from('recipe_ingredients')
          .insert(ingredients.map((ing: any, i: number) => ({
            recipe_id: params.id,
            ingredient_name: ing.ingredient_name,
            ingredient_database_id: ing.ingredient_database_id || null,
            quantity: ing.quantity,
            unit: ing.unit,
            order_index: i,
          })))
          .select('id');
        ingredientPks = (savedIngredients || []).map((r: any) => r.id);
      }
    }

    // Update steps if provided
    if (steps !== undefined) {
      await supabase.from('recipe_instruction_steps').delete().eq('recipe_id', params.id);
      if (steps.length > 0) {
        // If ingredients were NOT updated in this request, fetch existing PKs
        if (ingredients === undefined) {
          const { data: existingIngs } = await supabase
            .from('recipe_ingredients')
            .select('id')
            .eq('recipe_id', params.id);
          ingredientPks = (existingIngs || []).map((r: any) => r.id);
        }
        await supabase.from('recipe_instruction_steps').insert(
          steps.map((step: any, i: number) => ({
            recipe_id: params.id,
            step_number: i + 1,
            step_description: step.step_description_bg || '',
            step_description_bg: step.step_description_bg || '',
            step_description_en: step.step_description_en || '',
            step_duration_minutes: step.step_duration_minutes ?? 0,
            step_image_url: step.step_image_url || null,
            ingredients_used: ingredientPks,
          }))
        );
      }
    }

    // Sync to ready_recipes — find by selected_components containing this base_recipe id
    const syncFields: Record<string, any> = {};
    if (body.name !== undefined)           syncFields.name_bg = body.name;
    if (body.name_en !== undefined)        syncFields.name_en = body.name_en || body.name;
    if (body.description !== undefined)    syncFields.description_bg = body.description;
    if (body.description_en !== undefined) syncFields.description_en = body.description_en;
    if (body.image_url !== undefined)      syncFields.hero_image_url = body.image_url;
    if (body.servings !== undefined)       syncFields.total_servings = body.servings;
    if (body.total_calories !== undefined) syncFields.total_calories = body.total_calories;
    if (body.total_protein !== undefined)  syncFields.total_protein = body.total_protein;
    if (body.total_fat !== undefined)      syncFields.total_fat = body.total_fat;
    if (body.total_carbs !== undefined)    syncFields.total_carbs = body.total_carbs;
    if (body.total_net_carbs !== undefined) syncFields.total_net_carbs = body.total_net_carbs;
    if (body.total_weight_grams !== undefined) syncFields.total_weight_grams = body.total_weight_grams;
    if (body.published_at !== undefined) {
      syncFields.published_at = body.published_at;
      syncFields.status = body.published_at ? 'published' : 'draft';
    }
    if (body.difficulty_level !== undefined)    syncFields.difficulty_level = body.difficulty_level;
    if (body.dessert_type_id !== undefined)     syncFields.dessert_type_id = body.dessert_type_id ? parseInt(body.dessert_type_id) : null;
    if (body.serving_container_id !== undefined) syncFields.serving_container_id = body.serving_container_id || null;

    if (Object.keys(syncFields).length > 0) {
      const { error: syncError } = await supabase
        .from('ready_recipes')
        .update(syncFields)
        .contains('selected_components', JSON.stringify([{ base_recipe_id: params.id }]));

      if (syncError) {
        console.error('[Simple Recipes API] ready_recipes sync failed:', syncError.message, syncError.hint);
      } else {
        console.log('[Simple Recipes API] ready_recipes synced OK:', params.id);
      }
    }

    return NextResponse.json({ success: true, data: recipe });
  } catch (error: any) {
    console.error('[Simple Recipes API] PATCH error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── DELETE simple recipe — full cascade ────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[Simple Recipes API] DELETE:', params.id);

    // 1. Delete from ready_recipes (find by selected_components)
    const { error: readyError } = await supabase
      .from('ready_recipes')
      .delete()
      .contains('selected_components', JSON.stringify([{ base_recipe_id: params.id }]));

    if (readyError) {
      console.error('[Simple Recipes API] ready_recipes delete failed:', readyError.message);
      // Continue — base_recipe cleanup is more important
    } else {
      console.log('[Simple Recipes API] ready_recipes deleted for:', params.id);
    }

    // 2. Delete instruction steps
    const { error: stepsError } = await supabase
      .from('recipe_instruction_steps')
      .delete()
      .eq('recipe_id', params.id);

    if (stepsError) console.error('[Simple Recipes API] steps delete failed:', stepsError.message);

    // 3. Delete ingredients
    const { error: ingsError } = await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('recipe_id', params.id);

    if (ingsError) console.error('[Simple Recipes API] ingredients delete failed:', ingsError.message);

    // 4. Delete base_recipe last (it may have FK constraints)
    const { error: baseError } = await supabase
      .from('base_recipes')
      .delete()
      .eq('id', params.id)
      .eq('is_simple_recipe', true); // safety: only delete simple recipes

    if (baseError) throw baseError;

    console.log('[Simple Recipes API] Full cascade delete complete:', params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Simple Recipes API] DELETE error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```
