import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch single template with its steps
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = parseInt(params.id);
    console.log('[Assembly Template Detail API] GET template:', templateId);

    const { data: template, error: templateError } = await supabase
      .from('assembly_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw templateError;
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const { data: steps, error: stepsError } = await supabase
      .from('assembly_template_steps')
      .select('*')
      .eq('assembly_template_id', templateId)
      .order('step_number', { ascending: true });

    if (stepsError) throw stepsError;

    console.log('[Assembly Template Detail API] Found template with', steps?.length || 0, 'steps');

    return NextResponse.json({
      success: true,
      data: { ...template, steps: steps || [] },
    });
  } catch (error: any) {
    console.error('[Assembly Template Detail API] GET error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update template metadata
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = parseInt(params.id);
    const body = await req.json();

    console.log('[Assembly Template Detail API] PATCH template:', templateId);

    const { data, error } = await supabase
      .from('assembly_templates')
      .update(body)
      .eq('id', templateId)
      .select()
      .single();

    if (error) throw error;

    console.log('[Assembly Template Detail API] Updated template:', templateId);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[Assembly Template Detail API] PATCH error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete template (cascades to steps via FK)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = parseInt(params.id);
    console.log('[Assembly Template Detail API] DELETE template:', templateId);

    const { error } = await supabase
      .from('assembly_templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;

    console.log('[Assembly Template Detail API] Deleted template:', templateId);
    return NextResponse.json({ success: true, message: 'Template deleted' });
  } catch (error: any) {
    console.error('[Assembly Template Detail API] DELETE error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}