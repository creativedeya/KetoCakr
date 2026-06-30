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

    const [{ data: ingredients }, { data: steps }, { data: equipmentData }, { data: labNotesData }, { data: readyData }] = await Promise.all([
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
      supabase
        .from('recipe_equipment')
        .select('*')
        .eq('recipe_id', params.id)
        .order('display_order'),
      supabase
        .from('lab_notes')
        .select('*')
        .eq('recipe_id', params.id)
        .order('display_order'),
      supabase
        .from('ready_recipes')
        .select('dessert_type_id, serving_container_id, difficulty_level, published_at, status')
        .eq('base_recipe_id', params.id)
        .maybeSingle(),
    ]);

    return NextResponse.json({
      success: true,
      data: recipe,
      ingredients: ingredients || [],
      steps: steps || [],
      equipment: equipmentData || [],
      lab_notes: labNotesData || [],
      ready_recipe: readyData || null,
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
    const { ingredients, steps, dessert_type_id, serving_container_id, difficulty_level, equipment, lab_notes, ...body } = await req.json();
    console.log('[Simple Recipes API] PATCH:', params.id);

    // Build base_recipes update — only fields that exist on that table
    const baseUpdate: Record<string, any> = { ...body, updated_at: new Date().toISOString() };
    if (dessert_type_id !== undefined) {
      baseUpdate.compatible_dessert_types = dessert_type_id ? [parseInt(String(dessert_type_id))] : null;
    }
    if (difficulty_level !== undefined) {
      baseUpdate.difficulty_level = difficulty_level != null ? String(Number(difficulty_level)) : null;
    }

    // Update base_recipes
    const { data: recipe, error } = await supabase
      .from('base_recipes')
      .update(baseUpdate)
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

    // Update steps if provided — UPDATE existing rows, don't delete+reinsert
    // (preserves step images and avoids wiping ingredients_used)
    if (steps !== undefined && steps.length > 0) {
      const { data: existingSteps } = await supabase
        .from('recipe_instruction_steps')
        .select('id, step_number')
        .eq('recipe_id', params.id)
        .order('step_number');

      const existingMap = new Map((existingSteps || []).map(s => [s.step_number, s.id]));

      if (ingredientPks.length === 0) {
        const { data: existingIngs } = await supabase
          .from('recipe_ingredients')
          .select('id')
          .eq('recipe_id', params.id)
          .order('order_index');
        ingredientPks = (existingIngs || []).map((r: any) => r.id);
      }

      for (const [i, step] of steps.entries()) {
        const stepNumber = i + 1;
        const existingId = existingMap.get(stepNumber);

        const stepData = {
          recipe_id: params.id,
          step_number: stepNumber,
          step_description: step.step_description_bg || '',
          step_description_bg: step.step_description_bg || '',
          step_description_en: step.step_description_en || '',
          step_duration_minutes: step.step_duration_minutes ?? 0,
          step_image_url: step.step_image_url || null,
          // NOTE: do NOT write ingredients_used here — Tab 5 step-associations route owns that field
        };

        if (existingId) {
          await supabase
            .from('recipe_instruction_steps')
            .update(stepData)
            .eq('id', existingId);
        } else {
          await supabase
            .from('recipe_instruction_steps')
            .insert(stepData);
        }
      }

      // Delete steps beyond the new count (if steps were removed)
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
    }

    // Save equipment (replace-all)
    if (equipment !== undefined) {
      await supabase.from('recipe_equipment').delete().eq('recipe_id', params.id);
      if (equipment.length > 0) {
        await supabase.from('recipe_equipment').insert(
          equipment.map((eq: any, i: number) => ({
            recipe_id: params.id,
            item_bg: eq.item_bg || '',
            item: eq.item || null,
            quantity: eq.quantity || 1,
            size: eq.size || null,
            specs: eq.specs || null,
            essential: eq.essential ?? true,
            reusable: eq.reusable ?? true,
            notes: eq.notes || null,
            equipment_id: eq.equipment_id || null,
            display_order: i,
          }))
        );
      }
    }

    // Save lab_notes (replace-all)
    if (lab_notes !== undefined) {
      await supabase.from('lab_notes').delete().eq('recipe_id', params.id);
      if (lab_notes.length > 0) {
        await supabase.from('lab_notes').insert(
          lab_notes.map((ln: any, i: number) => ({
            recipe_id: params.id,
            category: ln.category || 'general',
            title: ln.title || '',
            title_bg: ln.title_bg || '',
            content: ln.content || '',
            content_bg: ln.content_bg || '',
            icon: ln.icon || '🧪',
            display_order: i,
            is_active: ln.is_active ?? true,
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
    if (difficulty_level !== undefined)     syncFields.difficulty_level = difficulty_level ? Number(difficulty_level) : null;
    if (dessert_type_id !== undefined)      syncFields.dessert_type_id = dessert_type_id ? parseInt(String(dessert_type_id)) : null;
    if (serving_container_id !== undefined) syncFields.serving_container_id = serving_container_id || null;

    if (Object.keys(syncFields).length > 0) {
      // Find the canonical ready_recipes row via FK (reliable; not fragile JSONB containment)
      const { data: existingReady } = await supabase
        .from('ready_recipes')
        .select('id')
        .eq('base_recipe_id', params.id)
        .maybeSingle();

      if (existingReady) {
        const { error: syncError } = await supabase
          .from('ready_recipes')
          .update(syncFields)
          .eq('id', existingReady.id);
        if (syncError) {
          console.error('[Simple Recipes API] ready_recipes sync failed:', syncError.message, syncError.hint);
        } else {
          console.log('[Simple Recipes API] ready_recipes synced OK:', params.id);
        }
      } else {
        // No ready_recipe row yet — create one (edge case: POST's ready_recipe insert failed)
        const { error: insertError } = await supabase
          .from('ready_recipes')
          .insert({
            base_recipe_id: params.id,
            name_en: recipe.name_en || recipe.name,
            name_bg: recipe.name,
            slug: recipe.name_en
              ? recipe.name_en.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').substring(0, 80) + '-' + Date.now().toString(36)
              : recipe.name.toLowerCase().replace(/[^а-яa-z0-9\s]/gi, '').replace(/\s+/g, '-').substring(0, 80) + '-' + Date.now().toString(36),
            status: recipe.published_at ? 'published' : 'draft',
            is_featured: false,
            is_free: false,
            selected_components: [{ base_recipe_id: params.id, recipe_id: params.id, role: 'simple', order_index: 0, multiplier: 1 }],
            ...syncFields,
          });
        if (insertError) {
          console.error('[Simple Recipes API] ready_recipes insert (recovery) failed:', insertError.message);
        } else {
          console.log('[Simple Recipes API] ready_recipes created (recovery) for:', params.id);
        }
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

    // 1. Delete from ready_recipes (find by base_recipe_id FK)
    const { error: readyError } = await supabase
      .from('ready_recipes')
      .delete()
      .eq('base_recipe_id', params.id);

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
