import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Bulk parse mode: parse raw ingredient text list and match against DB
async function handleBulkParse(text: string) {
  const message = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Parse this ingredient list into structured JSON.
Input text:
${text}

Respond ONLY with a JSON array, no markdown, no explanation:
[
  {
    "ingredient_name": "Бадемово брашно",
    "ingredient_name_en": "Almond flour",
    "quantity": 100,
    "unit": "g"
  }
]

Rules:
- ingredient_name: Bulgarian name (translate if needed)
- ingredient_name_en: English name (translate if needed)
- quantity: numeric value only (no fractions like 1.5 for pieces — round to nearest whole number for бр)
- unit: normalize using these rules:
  * weights (г, грама, грам, g, гр) → "g"
  * liquids (мл, ml, милилитра) → "ml"
  * teaspoon (ч.л., ч.л, чаена лъжица, tsp) → "tsp"
  * tablespoon (с.л., с.л, супена лъжица, tbsp) → "tbsp"
  * cup (чаша, cup) → "cup"
  * kg/л → "kg" or "l"
  * pieces/whole items (бр, броя, бройки, piece, шт) → "бр" ONLY for whole countable items like eggs, avocados, lemons
  * liquids/juices/extracts should NEVER be "бр" — use ml or tsp instead
  * "сок от лайм" or "лимонов сок" → use ml, not бр
  * If unit mentions "на вкус" or "по желание" → use "g" with quantity 1
- If unit is unclear, default to "g"
- If quantity is unclear, default to 100
- Split combined entries into separate items
- IMPORTANT: juice, extract, oil, sauce = liquid unit (ml/tsp/tbsp), never бр`,
    }],
  });

  const raw = (message.content[0] as any).text.trim();
  const clean = raw.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);

  if (!Array.isArray(parsed)) throw new Error('Response is not an array');

  const results = await Promise.all(parsed.map(async (item: any) => {
    const { data: matches } = await supabase
      .from('ingredients_database')
      .select('id, name_bg, name_en, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g, is_sugar_alcohol, default_piece_weight_grams')
      .or(`name_bg.ilike.%${item.ingredient_name}%,name_en.ilike.%${item.ingredient_name_en || item.ingredient_name}%`)
      .limit(1);

    const match = matches?.[0] || null;

    return {
      ingredient_name: match?.name_bg || item.ingredient_name,
      ingredient_name_en: match?.name_en || item.ingredient_name_en || '',
      ingredient_database_id: match?.id || null,
      quantity: item.quantity,
      unit: item.unit,
      matched: !!match,
      _calories: match?.calories_per_100g || null,
      _protein: match?.protein_per_100g || null,
      _fat: match?.fat_per_100g || null,
      _carbs: match?.carbs_per_100g || null,
      _fiber: match?.fiber_per_100g || null,
      _is_sugar_alcohol: match?.is_sugar_alcohol || false,
      _piece_weight: match?.default_piece_weight_grams || null,
    };
  }));

  return NextResponse.json({ success: true, ingredients: results });
}

// Description parse mode: extract ingredients from recipe description text (used by AutoParseModal)
async function handleDescriptionParse(description: string) {
  if (description.length < 20) {
    return NextResponse.json({ error: 'Description too short to parse' }, { status: 400 });
  }

  const prompt = `You are an expert at extracting ingredients from recipe descriptions.

Recipe Description:
${description}

Please extract ALL ingredients mentioned in this recipe description.

Return ONLY valid JSON in this format (no markdown, no code blocks):
{
  "ingredients": [
    {
      "name": "ingredient name in English",
      "name_bg": "ingredient name in Bulgarian (if identifiable)",
      "name_en": "ingredient name in English",
      "quantity": 2,
      "unit": "tbsp",
      "confidence": 0.95
    }
  ],
  "total_ingredients": 5,
  "parsing_notes": "Any notes about parsing"
}

Rules:
- Include quantity and unit (g, ml, tsp, tbsp, cup, oz, piece, etc)
- confidence: 0.0-1.0 (1.0 = very confident, 0.5 = uncertain, include anyway)
- If unit is ambiguous, use most common (e.g., "cocoa" = "2 tbsp" = reasonable default)
- Include ALL mentioned ingredients, even spices and seasonings
- If ingredient has common Bulgarian name, include name_bg
- Order by appearance in description`;

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const parsedData = JSON.parse(responseText);

  if (!parsedData.ingredients || !Array.isArray(parsedData.ingredients)) {
    throw new Error('Invalid response format: missing ingredients array');
  }

  return NextResponse.json({
    success: true,
    ingredients: parsedData.ingredients,
    total: parsedData.total_ingredients || parsedData.ingredients.length,
    notes: parsedData.parsing_notes,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.text?.trim()) {
      return await handleBulkParse(body.text);
    }

    if (body.description?.trim()) {
      return await handleDescriptionParse(body.description);
    }

    return NextResponse.json({ success: false, error: 'No text or description provided' }, { status: 400 });
  } catch (err: any) {
    console.error('[parse-ingredients] Error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
