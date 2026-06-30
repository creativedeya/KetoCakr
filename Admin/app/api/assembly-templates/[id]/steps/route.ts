import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: List steps for a template
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = parseInt(params.id);
    console.log('[Assembly Steps API] GET steps for template:', templateId);

    const { data, error } = await supabase
      .from('assembly_template_steps')
      .select('*')
      .eq('assembly_template_id', templateId)
      .order('step_number', { ascending: true });

    if (error) throw error;

    console.log('[Assembly Steps API] Found', data?.length || 0, 'steps');
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('[Assembly Steps API] GET error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create new step
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = parseInt(params.id);
    const body = await req.json();

    console.log('[Assembly Steps API] POST new step for template:', templateId);

    const { data, error } = await supabase
      .from('assembly_template_steps')
      .insert({
        assembly_template_id: templateId,
        ...body,
      })
      .select()
      .single();

    if (error) throw error;

    console.log('[Assembly Steps API] Created step:', data.id);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[Assembly Steps API] POST error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}