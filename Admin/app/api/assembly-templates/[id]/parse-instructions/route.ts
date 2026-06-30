import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = parseInt(params.id);
    const body = await req.json();
    const { instructions_bg, instructions_en } = body as {
      instructions_bg: string;
      instructions_en: string;
    };

    if (!instructions_bg && !instructions_en) {
      return NextResponse.json(
        { error: 'At least one language instructions required' },
        { status: 400 }
      );
    }

    console.log('[Parse Instructions API] Processing template:', templateId);

    const prompt = `You are an expert at breaking down cooking/baking instructions into clear, individual steps.

Bulgarian Instructions:
${instructions_bg || 'N/A'}

English Instructions:
${instructions_en || 'N/A'}

Please:
1. Identify each individual step/action in the instructions
2. Number them sequentially (1, 2, 3, etc.)
3. Keep each step description concise but clear (1-3 sentences)
4. Preserve specific details (temperatures, times, ingredients)
5. If one language is missing, translate from the other
6. Use imperative verbs (Mix, Pour, Spread, Намажете, Разбъркайте, etc.)
7. Return ONLY valid JSON, no markdown, no code blocks

JSON format:
{
  "steps": [
    {
      "number": 1,
      "description_bg": "Description in Bulgarian",
      "description_en": "Description in English"
    }
  ]
}`;

    console.log('[Parse Instructions API] Calling Claude API...');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    console.log('[Parse Instructions API] Claude response received');

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    console.log('[Parse Instructions API] Response:', responseText.substring(0, 200));

    let parsedData: { steps: { number: number; description_bg: string; description_en: string }[] };
    try {
      // Strip markdown code fences if present
      const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    } catch {
      console.error('[Parse Instructions API] JSON parse error:', responseText);
      throw new Error('Failed to parse Claude response as JSON');
    }

    if (!parsedData.steps || !Array.isArray(parsedData.steps)) {
      throw new Error('Invalid response format: missing steps array');
    }

    console.log('[Parse Instructions API] Parsed', parsedData.steps.length, 'steps');

    // Delete existing steps for this template
    console.log('[Parse Instructions API] Deleting existing steps...');
    const { error: deleteError } = await supabase
      .from('assembly_template_steps')
      .delete()
      .eq('assembly_template_id', templateId);

    if (deleteError) throw deleteError;

    // Insert new steps
    const stepsToInsert = parsedData.steps.map((step) => ({
      assembly_template_id: templateId,
      step_number: step.number,
      step_description: step.description_en || step.description_bg,
      step_description_bg: step.description_bg,
      step_description_en: step.description_en,
      step_duration_minutes: 5,
      ingredients_used: [],
      equipment_needed: [],
    }));

    console.log('[Parse Instructions API] Inserting', stepsToInsert.length, 'steps...');

    const { data, error } = await supabase
      .from('assembly_template_steps')
      .insert(stepsToInsert)
      .select();

    if (error) throw error;

    console.log('[Parse Instructions API] Inserted successfully');

    return NextResponse.json({
      success: true,
      stepsCreated: data?.length ?? stepsToInsert.length,
      steps: data ?? stepsToInsert,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to parse instructions';
    console.error('[Parse Instructions API] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
