// =====================================================
// AI RECIPE NAME GENERATOR API
// Path: admin/app/api/ready-recipes/generate-name/route.ts
// =====================================================

import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { components } = await request.json();

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Build component description
    const componentList = [];
    if (components.dessert_type) componentList.push(`Type: ${components.dessert_type}`);
    if (components.crust) componentList.push(`Crust: ${components.crust}`);
    if (components.cream) componentList.push(`Cream: ${components.cream}`);
    if (components.filling) componentList.push(`Filling: ${components.filling}`);
    if (components.decoration) componentList.push(`Decoration: ${components.decoration}`);

    const prompt = `You are a creative pastry chef naming keto desserts. Create an appealing name and short description for a dessert with these components:

${componentList.join('\n')}

Requirements:
- Name should be elegant, appetizing, and memorable
- Name should reflect the key flavors/ingredients
- Keep it concise (2-4 words)
- Description should be 1-2 sentences highlighting what makes it special
- Emphasize it's keto-friendly

Provide BOTH Bulgarian and English versions.

Respond with ONLY valid JSON in this exact format:
{
  "name_bg": "Bulgarian name here",
  "name_en": "English name here",
  "description_bg": "Bulgarian description here",
  "description_en": "English description here"
}`;

    console.log('🎨 Generating recipe name...');
    console.log('Components:', componentList.join(', '));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a creative pastry chef specializing in keto desserts. Output only valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content || '';
    
    console.log('Raw response:', responseText);

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from response');
    }

    const result = JSON.parse(jsonMatch[0]);

    console.log('✅ Generated names:');
    console.log('  BG:', result.name_bg);
    console.log('  EN:', result.name_en);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ Error generating recipe name:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to generate recipe name' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Recipe Name Generator',
    status: OPENAI_API_KEY ? 'ready' : 'missing API key'
  });
}