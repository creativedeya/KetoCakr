import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json();

    if (!description || description.length < 30) {
      return NextResponse.json({ error: 'Description too short to parse' }, { status: 400 });
    }

    console.log('[Parse Steps API] Processing:', description.substring(0, 50));

    const prompt = `You are an expert at extracting cooking steps from recipe descriptions.

Recipe Description:
${description}

Please extract the step-by-step instructions from this recipe description.

Return ONLY valid JSON in this format (no markdown, no code blocks):
{
  "steps": [
    {
      "step_number": 1,
      "step_description": "Mix cocoa powder with eggs and sugar",
      "step_description_bg": "Смесете какаото със яйца и захар",
      "step_description_en": "Mix cocoa powder with eggs and sugar",
      "step_duration_minutes": 5
    }
  ],
  "total_steps": 2,
  "parsing_notes": "Duration estimates are rough"
}

Rules:
- Number steps sequentially (1, 2, 3, etc)
- Each step should be 1-3 sentences, concise but complete
- Extract duration if mentioned (e.g., "microwave 90 sec" = 2 minutes for the step)
- If duration not mentioned, estimate based on typical cooking time
- Include both step_description_bg (Bulgarian) and step_description_en (English)
- If original is in one language, translate to the other
- Preserve specific details (temperatures, times, quantities)`;

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-1',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('[Parse Steps API] Response:', responseText.substring(0, 200));

    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      console.error('[Parse Steps API] JSON parse error:', responseText);
      throw new Error('Failed to parse Claude response as JSON');
    }

    if (!parsedData.steps || !Array.isArray(parsedData.steps)) {
      throw new Error('Invalid response format: missing steps array');
    }

    console.log('[Parse Steps API] Parsed', parsedData.steps.length, 'steps');

    return NextResponse.json({
      success: true,
      steps: parsedData.steps,
      total: parsedData.total_steps || parsedData.steps.length,
      notes: parsedData.parsing_notes,
    });
  } catch (error: any) {
    console.error('[Parse Steps API] Error:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to parse steps' }, { status: 500 });
  }
}
