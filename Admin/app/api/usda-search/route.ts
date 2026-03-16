import { NextRequest, NextResponse } from 'next/server';

const USDA_API_KEY = process.env.USDA_API_KEY;
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query');
  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  if (!USDA_API_KEY) {
    return NextResponse.json({ error: 'USDA_API_KEY not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `${USDA_BASE_URL}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&dataType=Foundation,SR%20Legacy&pageSize=5`
    );

    if (!response.ok) {
      return NextResponse.json({ error: `USDA API error: ${response.status}` }, { status: 502 });
    }

    const data = await response.json();

    const results = (data.foods || []).map((food: any) => {
      const nutrients = food.foodNutrients || [];

      const getNutrient = (id: number): number | null => {
        const n = nutrients.find((n: any) => n.nutrientId === id);
        return n ? Math.round(n.value * 100) / 100 : null;
      };

      const carbs = getNutrient(1005) || 0;
      const fiber = getNutrient(1079) || 0;

      return {
        fdcId: food.fdcId,
        description: food.description,
        dataType: food.dataType,
        calories_per_100g: getNutrient(1008),
        protein_per_100g: getNutrient(1003),
        fat_per_100g: getNutrient(1004),
        carbs_per_100g: getNutrient(1005),
        fiber_per_100g: getNutrient(1079),
        net_carbs_per_100g: Math.round((carbs - fiber) * 100) / 100,
        sodium_per_100g: getNutrient(1093),
        calcium_per_100g: getNutrient(1087),
        iron_per_100g: getNutrient(1089),
        magnesium_per_100g: getNutrient(1090),
        potassium_per_100g: getNutrient(1092),
        sugar_per_100g: getNutrient(2000),
        cholesterol_per_100g: getNutrient(1253),
        saturated_fat_per_100g: getNutrient(1258),
      };
    });

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
