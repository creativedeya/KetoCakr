// =====================================================
// Upload API - Uses service role key for permissions
// File: app/api/upload-step-image/route.ts
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const recipeId = formData.get('recipeId') as string;
    const stepNumber = formData.get('stepNumber') as string;

    if (!file || !recipeId || !stepNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use service role key for permissions
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const fileExt = file.name.split('.').pop();
    const fileName = `${recipeId}/step-${stepNumber}-${Date.now()}.${fileExt}`;
    const filePath = `recipes/${fileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('📤 Uploading:', filePath);

    const { data, error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(filePath);

    console.log('✅ Upload success:', publicUrl);

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      filePath: filePath
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Upload API',
    usage: 'POST with FormData containing file, recipeId, stepNumber'
  });
}