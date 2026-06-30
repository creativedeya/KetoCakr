import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateImageWithGemini } from '@/lib/providers/gemini-image';

export const dynamic = 'force-dynamic';

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
    const { stepNumber, description, hints, stepId } = body;

    if (!description?.trim()) {
      return NextResponse.json({ error: 'Step description is required' }, { status: 400 });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ error: 'GOOGLE_API_KEY not configured' }, { status: 500 });
    }

    console.log('[Assembly Image Gen API] Generating image for step:', stepNumber);

    const prompt = `Professional food photography for keto baking assembly step.
Step: ${description}
${hints ? `Visual hints: ${hints}` : ''}

Style: Clean, well-lit professional food photography, recipe instruction style.
White marble counter, soft natural window lighting from the side.
60-degree downward angle, close-up shot showing the action clearly.
Ultra minimalist composition, only essential items visible.
No text, no labels, no overlays.`;

    const result = await generateImageWithGemini({ prompt });

    const imageBuffer = Buffer.from(result.base64, 'base64');
    const ext = result.mimeType.includes('jpeg') ? 'jpg' : 'png';
    const filePath = `assembly-steps/${templateId}/${Date.now()}-step-${stepNumber}.${ext}`;

    const { data, error: uploadError } = await supabase.storage
      .from('assembly-templates')
      .upload(filePath, imageBuffer, {
        contentType: result.mimeType,
        upsert: false,
        cacheControl: '3600',
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('assembly-templates')
      .getPublicUrl(data.path);

    console.log('[Assembly Image Gen API] Uploaded:', publicUrl);

    if (stepId) {
      const { error: dbError } = await supabase
        .from('assembly_template_steps')
        .update({ step_image_url: publicUrl })
        .eq('id', stepId);

      if (dbError) {
        console.warn('[Assembly Image Gen API] DB update failed:', dbError.message);
      } else {
        console.log('[Assembly Image Gen API] DB updated for step:', stepId);
      }
    }

    return NextResponse.json({ success: true, url: publicUrl, path: data.path });
  } catch (error: any) {
    console.error('[Assembly Image Gen API] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Image generation failed' },
      { status: 500 }
    );
  }
}
