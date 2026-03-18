import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query');
  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10&fields=product_name,brands,image_url,nutriments,nutrition_data_per`,
      { headers: { 'User-Agent': 'KetoCakrAdmin/1.0 (admin@ketocakr.com)' } }
    );

    if (!response.ok) {
      return NextResponse.json({ error: `OFF API error: ${response.status}` }, { status: 502 });
    }

    const data = await response.json();

    const results = (data.products || [])
      .filter((p: any) => p.product_name)
      .slice(0, 8)
      .map((product: any) => {
        const n = product.nutriments || {};

        // Helpers — OFF stores minerals/vitamins in g per 100g
        const r = (v: any): number | null =>
          v != null && !isNaN(parseFloat(v)) ? Math.round(parseFloat(v) * 100) / 100 : null;
        const gToMg = (v: any): number | null =>
          v != null && !isNaN(parseFloat(v)) ? Math.round(parseFloat(v) * 1000 * 100) / 100 : null;
        const gToMcg = (v: any): number | null =>
          v != null && !isNaN(parseFloat(v)) ? Math.round(parseFloat(v) * 1000000 * 100) / 100 : null;

        return {
          name: product.product_name || '',
          brand: product.brands || null,
          imageUrl: product.image_url || null,
          confidence: calculateConfidence(product),
          nutrients: {
            calories:     r(n['energy-kcal_100g']),
            protein:      r(n.proteins_100g),
            fat:          r(n.fat_100g),
            carbs:        r(n.carbohydrates_100g),
            fiber:        r(n.fiber_100g),
            sugar:        r(n.sugars_100g),
            sugarAlcohol: r(n['sugar-alcohols_100g']),
            saturatedFat: r(n['saturated-fat_100g']),
            cholesterol:  gToMg(n.cholesterol_100g),
            sodium:       gToMg(n.sodium_100g),
            calcium:      gToMg(n.calcium_100g),
            iron:         gToMg(n.iron_100g),
            magnesium:    gToMg(n.magnesium_100g),
            potassium:    gToMg(n.potassium_100g),
            zinc:         gToMg(n.zinc_100g),
            vitaminA:     gToMcg(n['vitamin-a_100g']),
            vitaminC:     gToMg(n['vitamin-c_100g']),
            vitaminD:     gToMcg(n['vitamin-d_100g']),
          },
        };
      });

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function calculateConfidence(product: any): number {
  let score = 0;
  if (product.image_url) score += 30;
  if (product.brands) score += 20;
  const n = product.nutriments || {};
  const filled = Object.keys(n).filter(k => k.endsWith('_100g') && n[k] != null).length;
  score += Math.min(filled * 2, 50);
  return Math.min(score, 100);
}
