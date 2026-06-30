import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^а-яa-z0-9\s]/gi, '')
    .replace(/\s+/g, '-')
    .substring(0, 80)
    + '-' + Date.now().toString(36)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const sourceType = searchParams.get('source_type');
    const search = searchParams.get('search');

    let query = supabase
      .from('base_recipes')
      .select('id, name, name_en, servings, total_calories, total_net_carbs, published_at, created_at, image_url, is_simple_recipe')
      .eq('is_simple_recipe', true)
      .order('created_at', { ascending: false });

    if (status === 'published') query = query.not('published_at', 'is', null);
    else if (status === 'draft') query = query.is('published_at', null);

    // source_type column does not exist in base_recipes — filter skipped
    if (search) query = query.or(`name.ilike.%${search}%,name_en.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    console.log('[Simple Recipes API] GET all:', data?.length, 'recipes');
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('[Simple Recipes API] GET Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { ingredients, steps, dessert_type_id, serving_container_id, difficulty_level, equipment, lab_notes, ...body } = await req.json();
    console.log('[Simple Recipes API] POST:', body.name_en || body.name);

    const { data: recipe, error } = await supabase
      .from('base_recipes')
      .insert([{
        ...body,
        is_simple_recipe: true,
        compatible_dessert_types: dessert_type_id ? [parseInt(String(dessert_type_id))] : null,
        difficulty_level: difficulty_level != null ? String(Number(difficulty_level)) : null,
      }])
      .select()
      .single();

    if (error) throw error;

    // Save ingredients — capture PKs for ingredients_used in steps
    let ingredientPks: number[] = [];
    if (ingredients?.length) {
      const { data: savedIngredients } = await supabase.from('recipe_ingredients').insert(
        ingredients.map((ing: any, i: number) => ({
          recipe_id: recipe.id,
          ingredient_name: ing.ingredient_name,
          ingredient_database_id: ing.ingredient_database_id || null,
          quantity: ing.quantity,
          unit: ing.unit,
          order_index: i,
        }))
      ).select('id');
      ingredientPks = (savedIngredients || []).map((r: any) => r.id);
    }

    // Save steps — all ingredients shown on every step (cooking mode)
    if (steps?.length) {
      await supabase.from('recipe_instruction_steps').insert(
        steps.map((step: any, i: number) => ({
          recipe_id: recipe.id,
          step_number: i + 1,
          step_description: step.step_description_bg || step.step_description || '',
          step_description_bg: step.step_description_bg || '',
          step_description_en: step.step_description_en || '',
          step_duration_minutes: step.step_duration_minutes ?? 0,
          step_image_url: step.step_image_url || null,
          ingredients_used: ingredientPks,
        }))
      );
    }

    // Save equipment
    if (equipment?.length) {
      await supabase.from('recipe_equipment').insert(
        equipment.map((eq: any, i: number) => ({
          recipe_id: recipe.id,
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

    // Save lab_notes
    if (lab_notes?.length) {
      await supabase.from('lab_notes').insert(
        lab_notes.map((ln: any, i: number) => ({
          recipe_id: recipe.id,
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

    // Mirror to ready_recipes (best-effort — base_recipes is source of truth)
    const { error: readyError } = await supabase
      .from('ready_recipes')
      .insert({
        // NOTE: no `id` field — ready_recipes generates its own uuid
        base_recipe_id: recipe.id,             // FK for reliable lookup (migration 62)
        name_en: body.name_en || body.name,   // NOT NULL in schema — fallback to BG name
        name_bg: body.name || null,
        description_en: body.description_en || body.description || null,
        description_bg: body.description || null,
        hero_image_url: body.image_url || null,
        is_featured: false,
        is_free: body.is_free ?? false,
        difficulty_level: difficulty_level || 2,
        dessert_type_id: dessert_type_id ? parseInt(String(dessert_type_id)) : null,
        serving_container_id: serving_container_id || null,
        total_servings: body.servings || 1,
        total_weight_grams: body.total_weight_grams || null,
        total_calories: body.total_calories || null,
        total_protein: body.total_protein || null,
        total_fat: body.total_fat || null,
        total_carbs: body.total_carbs || null,
        total_net_carbs: body.total_net_carbs || null,
        published_at: body.published_at || null,
        status: body.published_at ? 'published' : 'draft',
        slug: generateSlug(body.name_en || body.name),
        selected_components: [{
          base_recipe_id: recipe.id,
          recipe_id: recipe.id,
          role: 'simple',
          order_index: 0,
          multiplier: 1,
        }],
      });
    if (readyError) {
      console.error('[Simple Recipes API] ready_recipes insert failed:', readyError.message, readyError.details, readyError.hint);
    } else {
      console.log('[Simple Recipes API] ready_recipes mirrored successfully for base_recipe:', recipe.id);
    }

    console.log('[Simple Recipes API] Created:', recipe.id);
    return NextResponse.json({ success: true, data: recipe });
  } catch (error: any) {
    console.error('[Simple Recipes API] POST Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
