import { NextRequest, NextResponse } from 'next/server';

async function fetchWithRetry(url: string, init: RequestInit, retries = 2): Promise<Response> {
  let lastRes: Response | null = null;
  for (let i = 0; i <= retries; i++) {
    const res = await fetch(url, init);
    if (res.ok) return res;
    lastRes = res;
    if (res.status < 500) return res;
    await new Promise(r => setTimeout(r, 600 * (i + 1)));
  }
  return lastRes!;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query');
  console.log('🌍 [OFF] Route called, query:', query);

  if (!query) {
    console.error('❌ [OFF] Missing query');
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10&fields=product_name,brands,image_url,nutriments,nutrition_data_per`;
    console.log('📤 [OFF] Fetching:', url);

    const response = await fetchWithRetry(url, {
      headers: {
        'User-Agent': 'KetoCakR-Admin/1.0 (https://ketocakelab.com; contact@ketocakelab.com)',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    console.log('📥 [OFF] Response status:', response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ [OFF] API error:', response.status, text.substring(0, 200));
      return NextResponse.json(
        { results: [], error: `OFF unavailable (${response.status})` },
        { status: 503 }
      );
    }

    const data = await response.json();
    console.log('📥 [OFF] Products count:', data.products?.length ?? 0);

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

    console.log('✅ [OFF] Returning', results.length, 'results');
    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('❌ [OFF] Unexpected error:', error.message);
    console.error('❌ [OFF] Stack:', error.stack);
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
