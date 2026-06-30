import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: List all assembly templates
export async function GET(req: NextRequest) {
  try {
    console.log('[Assembly Templates API] GET all templates');

    const { data, error } = await supabase
      .from('assembly_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log('[Assembly Templates API] Found', data.length, 'templates');
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[Assembly Templates API] GET error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create new assembly template
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      template_key,
      name,
      name_en,
      intro_text,
      intro_text_bg,
      intro_text_en,
      instructions,
      instructions_bg,
      instructions_en,
      soaking_required,
      compatible_dessert_types,
    } = body;

    console.log('[Assembly Templates API] POST new template:', template_key);

    const { data, error } = await supabase
      .from('assembly_templates')
      .insert({
        template_key,
        name,
        name_en,
        intro_text,
        intro_text_bg,
        intro_text_en,
        instructions,
        instructions_bg,
        instructions_en,
        soaking_required: soaking_required || false,
        compatible_dessert_types: compatible_dessert_types || [],
      })
      .select()
      .single();

    if (error) throw error;

    console.log('[Assembly Templates API] Created template:', data.id);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[Assembly Templates API] POST error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}