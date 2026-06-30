import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const REQUIRED_FIELDS = [
  'arcana_type',
  'card_number',
  'card_name',
  'daily_phrase',
  'energy_word',
  'morning_tip',
  'daily_trap',
  'evening_question',
] as const;

const VALID_ARCANA = ['major', 'minor'] as const;
const VALID_SUITS = ['pentacles', 'cups', 'swords', 'wands'] as const;

function validateRow(row: any, index: number): string[] {
  const errors: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    if (!row[field] || String(row[field]).trim() === '') {
      errors.push(`Row ${index + 1}: missing ${field}`);
    }
  }

  if (row.arcana_type && !VALID_ARCANA.includes(row.arcana_type)) {
    errors.push(`Row ${index + 1}: arcana_type must be 'major' or 'minor', got '${row.arcana_type}'`);
  }

  if (row.arcana_type === 'minor' && row.suit && !VALID_SUITS.includes(row.suit)) {
    errors.push(`Row ${index + 1}: suit must be one of ${VALID_SUITS.join('/')}, got '${row.suit}'`);
  }

  if (row.arcana_type === 'minor' && !row.suit) {
    errors.push(`Row ${index + 1}: suit is required for minor arcana`);
  }

  if (typeof row.card_number !== 'number' && isNaN(Number(row.card_number))) {
    errors.push(`Row ${index + 1}: card_number must be a number`);
  }

  return errors;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Request body must be a JSON array of tarot card objects' }, { status: 400 });
    }

    if (body.length === 0) {
      return NextResponse.json({ error: 'Empty array — nothing to import' }, { status: 400 });
    }

    if (body.length > 78) {
      return NextResponse.json({ error: `Too many rows: ${body.length}. A tarot deck has at most 78 cards.` }, { status: 400 });
    }

    // Validate all rows first
    const allErrors: string[] = [];
    for (let i = 0; i < body.length; i++) {
      allErrors.push(...validateRow(body[i], i));
    }

    if (allErrors.length > 0) {
      return NextResponse.json({
        error: 'Validation failed',
        details: allErrors,
        imported: 0,
      }, { status: 422 });
    }

    // Normalize numeric card_number
    const rows = body.map((row: any) => ({
      ...row,
      card_number: Number(row.card_number),
    }));

    const { data, error } = await supabase
      .from('tarot_cards')
      .upsert(rows, { onConflict: 'arcana_type,suit,card_number' })
      .select('id, arcana_type, suit, card_number, card_name');

    if (error) throw error;

    return NextResponse.json({
      success: true,
      imported: data?.length ?? 0,
      data,
    });
  } catch (error: any) {
    console.error('[Tarot Cards Bulk Import] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
