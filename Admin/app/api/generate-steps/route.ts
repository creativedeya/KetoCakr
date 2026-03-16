import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Fast and cheap
        messages: [{
          role: 'system',
          content: 'You are a helpful assistant that extracts cooking steps from recipe descriptions. Always respond with valid JSON only, no markdown, no explanations.'
        }, {
          role: 'user',
          content: `Analyze this recipe description and extract clear, numbered cooking steps.

The description may contain:
- Ingredients list (ignore this)
- Instructions section (extract from this)
- Mixed format text

Your task:
1. Find the cooking instructions in the text
2. Split them into individual steps
3. Return ONLY a JSON array, no markdown, no explanation

Description:
${description}

Return format (copy exactly):
[
  {"step": "First step text"},
  {"step": "Second step text"}
]

Rules:
- Each step is ONE clear action
- Start each step with a verb (imperative)
- Keep concise (1-2 sentences max)
- Extract actual steps from text, don't invent
- If text has "Инструкции:" section, focus on that
- Ignore ingredient lists
- Return 5-15 steps typically
- Respond ONLY with the JSON array, nothing else`
        }],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return NextResponse.json(
        { error: errorData.error?.message || 'API request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      return NextResponse.json(
        { error: 'Empty response from API' },
        { status: 500 }
      );
    }

    const content = data.choices[0]?.message?.content || '';
    console.log('AI Response:', content);

    // Parse JSON from response
    let jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      // Try removing markdown code blocks
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
    }

    if (!jsonMatch) {
      console.error('Could not parse JSON from:', content);
      return NextResponse.json(
        { error: 'Could not parse AI response', raw: content.substring(0, 200) },
        { status: 500 }
      );
    }

    const steps = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json(
        { error: 'Invalid steps format from AI' },
        { status: 500 }
      );
    }

    // Normalize steps format
    const normalizedSteps = steps.map((item: any, index: number) => ({
      step_number: index + 1,
      step_description: item.step || item.description || item.text || String(item)
    }));

    return NextResponse.json({ steps: normalizedSteps });

  } catch (error: any) {
    console.error('Generate steps error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate steps' },
      { status: 500 }
    );
  }
}
