import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { stepId, imageUrl, imageHints } = await request.json();

    if (!stepId || !imageUrl) {
      return NextResponse.json(
        { error: 'stepId and imageUrl are required' },
        { status: 400 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    console.log('Saving step image:', { stepId, imageUrl, imageHints });
    const { error } = await supabase
      .from('recipe_instruction_steps')
      .update({
        step_image_url: imageUrl,
        image_generation_hints: imageHints || null,
      })
      .eq('id', stepId);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Save step image error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save' },
      { status: 500 }
    );
  }
}
