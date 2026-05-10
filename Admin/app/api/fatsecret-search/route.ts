import { NextRequest, NextResponse } from 'next/server';
import { fatSecretSearch, fatSecretGetFood, getFatSecretNutritionPer100g, parseNutritionFromDescription } from '@/lib/fatsecret';

export async function GET(request: NextRequest) {
  console.log('🔬 [FS Route] ========== NEW REQUEST ==========');
  console.log('🔬 [FS Route] Full URL:', request.url);

  const { searchParams } = new URL(request.url);
  const query    = searchParams.get('query');
  const foodId   = searchParams.get('food_id');
  const foodType = searchParams.get('food_type') as 'generic' | 'brand' | 'all' | null;

  console.log('🔬 [FS Route] Extracted params:', { query, foodId, foodType });
  console.log('🔬 [FS Route] foodType type:', typeof foodType);
  console.log('🔬 [FS Route] foodType value:', foodType);

  if (!query && !foodId) {
    console.error('❌ [FS Route] Missing query or food_id');
    return NextResponse.json({ error: 'Missing query or food_id' }, { status: 400 });
  }

  const keyExists = !!process.env.FATSECRET_CONSUMER_KEY;
  const secretExists = !!process.env.FATSECRET_CONSUMER_SECRET;
  console.log('🔑 [FS Route] FATSECRET_CONSUMER_KEY exists:', keyExists);
  console.log('🔑 [FS Route] FATSECRET_CONSUMER_SECRET exists:', secretExists);

  if (!keyExists || !secretExists) {
    console.error('❌ [FS Route] Missing credentials in .env.local');
    return NextResponse.json(
      { error: 'FatSecret API credentials not configured' },
      { status: 500 }
    );
  }

  try {
    if (foodId) {
      console.log('🔍 [FS Route] Fetching food detail for id:', foodId);
      const detail = await fatSecretGetFood(foodId);

      if (!detail) {
        console.warn('⚠️ [FS Route] Food not found for id:', foodId);
        return NextResponse.json({ error: 'Food not found' }, { status: 404 });
      }

      // Get native 100g nutrition (or calculated fallback)
      const nutrition = await getFatSecretNutritionPer100g(foodId);

      if (!nutrition) {
        console.warn('⚠️ [FS Route] Could not get nutrition for id:', foodId);
        return NextResponse.json({ error: 'Could not get nutrition data' }, { status: 404 });
      }

      console.log('✅ [FS Route] Nutrition source:', nutrition.source);

      // Transform to FatSecretFoodDetail format (matches UI expectations)
      const transformed = {
        id: detail.food_id,
        name: detail.food_name,
        brand: detail.brand_name || null,
        nutritionSource: nutrition.source,
        nutrients: {
          calories:     nutrition.calories,
          protein:      nutrition.protein,
          fat:          nutrition.fat,
          carbs:        nutrition.carbs,
          fiber:        nutrition.fiber ?? null,
          sugar:        nutrition.sugar ?? null,
          sugarAlcohol: null,
          saturatedFat: nutrition.saturated_fat ?? null,
          cholesterol:  nutrition.cholesterol ?? null,
          sodium:       nutrition.sodium ?? null,
          calcium:      nutrition.calcium ?? null,
          iron:         nutrition.iron ?? null,
          magnesium:    nutrition.magnesium ?? null,
          potassium:    nutrition.potassium ?? null,
          zinc:         null,
          vitaminA:     null,
          vitaminC:     null,
          vitaminD:     null,
        },
      };

      console.log('✅ [FS Route] Returning transformed food detail (per 100g)');
      return NextResponse.json(transformed);
    }
    console.log('🔬 [FS Route] About to call fatSecretSearch with:', { query, foodType });
    const results = await fatSecretSearch(query!, foodType || 'all');
    console.log('🔬 [FS Route] Got results count:', results.length);

    // Check food_type of first few results
    results.slice(0, 3).forEach((r, i) => {
      console.log(`🔬 [FS Route] Result ${i + 1} food_type:`, r.food_type, '| name:', r.food_name);
    });

    // Transform FatSecret format to match UI expectations
    const transformedResults = results.map(food => ({
      id: food.food_id,
      name: food.food_name,
      brand: food.brand_name || null,
      description: food.food_description,
      type: food.food_type || 'Generic',
      preview: parseNutritionFromDescription(food.food_description),
    }));

    console.log('✅ [FS Route] Returning', transformedResults.length, 'results');
    return NextResponse.json({ results: transformedResults });
    
  } catch (error: any) {
    console.error('❌ [FS Route] Error:', error.message);
    console.error('❌ [FS Route] Stack:', error.stack);
    return NextResponse.json({ error: error.message || 'FatSecret request failed' }, { status: 500 });
  }
}