import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { findBestMatches } from '@/lib/fuzzyMatch';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ParsedIngredient {
  name: string;
  name_bg?: string;
  name_en?: string;
  quantity: number;
  unit: string;
}

interface MatchedIngredient extends ParsedIngredient {
  ingredient_database_id?: string;
  matched_name?: string;
  match_score?: number;
  nutrition?: {
    calories_per_100g: number;
    protein_per_100g: number;
    fat_per_100g: number;
    carbs_per_100g: number;
    fiber_per_100g: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    const { ingredients } = (await req.json()) as { ingredients: ParsedIngredient[] };

    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json({ error: 'ingredients array is required' }, { status: 400 });
    }

    console.log('[Match Ingredients API] Matching', ingredients.length, 'ingredients');

    const { data: allIngredients, error: dbError } = await supabase
      .from('ingredients_database')
      .select('id, name_bg, name_en, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g');

    if (dbError) throw dbError;
    if (!allIngredients || allIngredients.length === 0) {
      throw new Error('No ingredients found in database');
    }

    const matchedIngredients: MatchedIngredient[] = ingredients.map((ingredient) => {
      const searchName = ingredient.name_en || ingredient.name || '';

      const matches = findBestMatches(
        searchName,
        allIngredients.map((ing) => ({ id: ing.id, name_bg: ing.name_bg, name_en: ing.name_en })),
        0.4,
        5
      );

      if (matches.length === 0) {
        console.warn(`[Match Ingredients API] No match for: ${searchName}`);
        return { ...ingredient, ingredient_database_id: undefined, matched_name: undefined, match_score: 0 };
      }

      const bestMatch = matches[0];
      const dbIngredient = allIngredients.find((ing) => ing.id === bestMatch.id);

      if (!dbIngredient) {
        return { ...ingredient, ingredient_database_id: undefined, matched_name: undefined, match_score: 0 };
      }

      return {
        ...ingredient,
        ingredient_database_id: dbIngredient.id,
        matched_name: bestMatch.name,
        match_score: bestMatch.score,
        nutrition: {
          calories_per_100g: dbIngredient.calories_per_100g || 0,
          protein_per_100g: dbIngredient.protein_per_100g || 0,
          fat_per_100g: dbIngredient.fat_per_100g || 0,
          carbs_per_100g: dbIngredient.carbs_per_100g || 0,
          fiber_per_100g: dbIngredient.fiber_per_100g || 0,
        },
      };
    });

    const successCount = matchedIngredients.filter((ing) => ing.ingredient_database_id).length;
    const unlinkedCount = matchedIngredients.filter((ing) => !ing.ingredient_database_id).length;

    console.log(`[Match Ingredients API] Success: ${successCount}, Unlinked: ${unlinkedCount}`);

    return NextResponse.json({
      success: true,
      ingredients: matchedIngredients,
      summary: { total: matchedIngredients.length, matched: successCount, unlinked: unlinkedCount },
    });
  } catch (error: any) {
    console.error('[Match Ingredients API] Error:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to match ingredients' }, { status: 500 });
  }
}
