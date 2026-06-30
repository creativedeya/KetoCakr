import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// PATCH: Update step
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; stepId: string } }
) {
  try {
    const stepId = parseInt(params.stepId);
    const body = await req.json();

    console.log('[Assembly Step Detail API] PATCH step:', stepId);

    const { data, error } = await supabase
      .from('assembly_template_steps')
      .update(body)
      .eq('id', stepId)
      .select()
      .single();

    if (error) throw error;

    console.log('[Assembly Step Detail API] Updated step:', stepId);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[Assembly Step Detail API] PATCH error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete step
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; stepId: string } }
) {
  try {
    const stepId = parseInt(params.stepId);
    console.log('[Assembly Step Detail API] DELETE step:', stepId);

    const { error } = await supabase
      .from('assembly_template_steps')
      .delete()
      .eq('id', stepId);

    if (error) throw error;

    console.log('[Assembly Step Detail API] Deleted step:', stepId);
    return NextResponse.json({ success: true, message: 'Step deleted' });
  } catch (error: any) {
    console.error('[Assembly Step Detail API] DELETE error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}