import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { text, recipeName } = await req.json();
    if (!text?.trim()) return NextResponse.json({ success: false, error: 'No text provided' }, { status: 400 });

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `You are parsing cooking recipe instructions into structured steps.

Recipe name: "${recipeName || 'Unknown'}"

Instructions text:
${text}

Parse this into individual steps. For each step estimate a realistic duration in minutes (0 if instant/no waiting).
Respond ONLY with a JSON array, no markdown, no explanation:
[
  {
    "step_description_bg": "Bulgarian text (translate if needed)",
    "step_description_en": "English text (translate if needed)",
    "step_duration_minutes": 5
  }
]

Rules:
- If text is in Bulgarian, fill step_description_bg and translate to English for step_description_en
- If text is in English, fill step_description_en and translate to Bulgarian for step_description_bg
- step_duration_minutes = 0 for mixing/combining steps with no wait time
- step_duration_minutes = realistic minutes for baking, chilling, resting steps
- Keep each step focused on ONE action
- Do not merge steps, do not skip steps`,
      }],
    });

    const raw = (message.content[0] as any).text.trim();
    const clean = raw.replace(/```json|```/g, '').trim();
    const steps = JSON.parse(clean);

    if (!Array.isArray(steps)) throw new Error('Response is not an array');

    return NextResponse.json({ success: true, steps });
  } catch (err: any) {
    console.error('parse-steps error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
