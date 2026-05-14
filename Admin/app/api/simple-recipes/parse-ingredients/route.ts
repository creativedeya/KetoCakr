import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json();

    if (!description || description.length < 20) {
      return NextResponse.json({ error: 'Description too short to parse' }, { status: 400 });
    }

    console.log('[Parse Ingredients API] Processing:', description.substring(0, 50));

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
      model: 'claude-opus-4-1',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('[Parse Ingredients API] Response:', responseText.substring(0, 200));

    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      console.error('[Parse Ingredients API] JSON parse error:', responseText);
      throw new Error('Failed to parse Claude response as JSON');
    }

    if (!parsedData.ingredients || !Array.isArray(parsedData.ingredients)) {
      throw new Error('Invalid response format: missing ingredients array');
    }

    console.log('[Parse Ingredients API] Parsed', parsedData.ingredients.length, 'ingredients');

    return NextResponse.json({
      success: true,
      ingredients: parsedData.ingredients,
      total: parsedData.total_ingredients || parsedData.ingredients.length,
      notes: parsedData.parsing_notes,
    });
  } catch (error: any) {
    console.error('[Parse Ingredients API] Error:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to parse ingredients' }, { status: 500 });
  }
}
