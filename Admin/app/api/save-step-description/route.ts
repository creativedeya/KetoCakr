import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { stepId, description, step_duration_minutes } = await request.json();

    if (!stepId || !description?.trim()) {
      return NextResponse.json(
        { error: 'stepId and description are required' },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, any> = {
      step_description_bg: description.trim(),
      step_description: description.trim(),
    };
    if (step_duration_minutes !== undefined) {
      updatePayload.step_duration_minutes = step_duration_minutes;
    }

    const { error } = await supabase
      .from('recipe_instruction_steps')
      .update(updatePayload)
      .eq('id', stepId);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Save step description error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save' },
      { status: 500 }
    );
  }
}
