import { NextRequest, NextResponse } from 'next/server';
import { translateParsedNote } from '@/lib/translateToBulgarian';
import type { ParsedLabNote } from '@/lib/types/labNotes';

export async function POST(req: NextRequest) {
  try {
    const note: ParsedLabNote = await req.json();
    if (!note?.title_en) {
      return NextResponse.json({ error: 'Invalid note data' }, { status: 400 });
    }
    const translated = await translateParsedNote(note);
    return NextResponse.json(translated);
  } catch (err: any) {
    console.error('Translation error:', err);
    return NextResponse.json({ error: err.message ?? 'Translation failed' }, { status: 500 });
  }
}
