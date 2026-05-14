import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateImageWithGemini } from '@/lib/providers/gemini-image';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { recipe_id, step_number, step_description, recipe_name } = await req.json();

    if (!step_description || !step_number) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ error: 'GOOGLE_API_KEY not configured' }, { status: 500 });
    }

    console.log('[Generate Step Image API] Generating for:', recipe_name, 'step', step_number);

    const prompt = `Professional food photography, step-by-step cooking instruction photo.
Recipe: ${recipe_name || 'Recipe'}
Step ${step_number}: ${step_description}

First-person POV, looking down at hands performing the cooking action.
Wearing beige sweater sleeves. White marble counter surface.
Soft natural window light. Clean, minimal composition.
High quality, professional culinary blog aesthetic.`;

    console.log('[Generate Step Image API] Calling Gemini...');

    const result = await generateImageWithGemini({ prompt });
    const imageBuffer = Buffer.from(result.base64, 'base64');

    const recipeKey = recipe_id && recipe_id !== 'new' ? recipe_id : 'unsaved';
    const filename = `simple-recipes/${recipeKey}/step-${step_number}-${Date.now()}.png`;

    console.log('[Generate Step Image API] Uploading to Supabase:', filename);

    const { data, error } = await supabase.storage
      .from('recipe-images')
      .upload(filename, imageBuffer, {
        contentType: result.mimeType,
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(data.path);

    console.log('[Generate Step Image API] Done:', urlData.publicUrl);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    });
  } catch (error: any) {
    console.error('[Generate Step Image API] Error:', error.message);
    return NextResponse.json({ error: error.message || 'Image generation failed' }, { status: 500 });
  }
}
