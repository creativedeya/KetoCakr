import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const templateId = formData.get('templateId') as string;
    const stepId = formData.get('stepId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const folder = templateId ? `template-${templateId}` : 'steps';
    const filePath = `${folder}/${Date.now()}-step.${fileExt}`;

    console.log('[Upload Assembly Step Image] Uploading:', filePath);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error: uploadError } = await supabase.storage
      .from('assembly-templates')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('assembly-templates')
      .getPublicUrl(data.path);

    console.log('[Upload Assembly Step Image] Uploaded:', publicUrl);

    if (stepId) {
      const { error: dbError } = await supabase
        .from('assembly_template_steps')
        .update({ step_image_url: publicUrl })
        .eq('id', parseInt(stepId));

      if (dbError) {
        console.warn('[Upload Assembly Step Image] DB update failed:', dbError.message);
      } else {
        console.log('[Upload Assembly Step Image] DB updated for step:', stepId);
      }
    }

    return NextResponse.json({ success: true, url: publicUrl, path: data.path });
  } catch (error: any) {
    console.error('[Upload Assembly Step Image] Error:', error.message);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
