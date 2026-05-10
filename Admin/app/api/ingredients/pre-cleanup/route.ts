import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { cleanups } = await request.json();
    
    if (!cleanups || !Array.isArray(cleanups)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let totalUpdated = 0;
    const errors = [];

    for (const cleanup of cleanups) {
      const { id, cleanedName } = cleanup;

      if (!id || !cleanedName) {
        errors.push(`Invalid cleanup object: ${JSON.stringify(cleanup)}`);
        continue;
      }

      const { error } = await supabase
        .from('recipe_ingredients')
        .update({ ingredient_name: cleanedName })
        .eq('id', id)
        .is('ingredient_database_id', null);

      if (error) {
        errors.push(`Failed to update ID ${id}: ${error.message}`);
      } else {
        totalUpdated++;
      }
    }

    console.log(`✅ Pre-cleanup updated ${totalUpdated} records`);
    if (errors.length > 0) {
      console.error('⚠️ Pre-cleanup errors:', errors);
    }

    return NextResponse.json({
      success: true,
      updatedRecords: totalUpdated,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('❌ Pre-cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}