import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

// 'suit' on TarotCardData is 'major' for Major Arcana, or the actual suit for Minor Arcana
export type TarotSuit = 'major' | 'pentacles' | 'cups' | 'swords' | 'wands';

export interface TarotCardData {
  id: string;
  suit: TarotSuit;
  numeral: string;
  pips: number;
  title: string;
  titleEn: string;
  theme: string;
  themeEn: string;
  image: string | null;
  energy: string;
  energyEn: string;
  phrase: string;
  phraseEn: string;
  morning: string;
  morningEn: string;
  trap: string;
  trapEn: string;
  evening: string;
  eveningEn: string;
  cta: string;
  ctaEn: string;
  // Extended for navigation
  arcana_type: 'major' | 'minor';
  linked_recipe_id: string | null;
  linked_base_recipe_id: string | null;
  recipe_role_id: number | null;
}

const ROMAN = [
  '0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI',
];

const MINOR_NUMERAL: Record<number, string> = {
  1: 'А', 11: 'П', 12: 'Р', 13: 'К', 14: 'Кр',
};

function dbToCard(row: any): TarotCardData {
  const arcana = row.arcana_type as 'major' | 'minor';
  const suit: TarotSuit = arcana === 'major' ? 'major' : (row.suit as TarotSuit);

  let numeral: string;
  if (arcana === 'major') {
    numeral = ROMAN[row.card_number] ?? String(row.card_number);
  } else {
    numeral = MINOR_NUMERAL[row.card_number] ?? String(row.card_number);
  }

  const cta = arcana === 'major' ? 'Виж рецептата →' : 'Виж рецепти →';
  const ctaEn = arcana === 'major' ? 'View recipe →' : 'View recipes →';

  return {
    id: row.id,
    suit,
    numeral,
    pips: row.card_number,
    title: row.card_name,
    titleEn: row.card_name_en || row.card_name,
    theme: row.theme || '',
    themeEn: row.theme_en || row.theme || '',
    image: row.card_image_url ?? null,
    energy: row.energy_word,
    energyEn: row.energy_word_en || row.energy_word,
    phrase: row.daily_phrase,
    phraseEn: row.daily_phrase_en || row.daily_phrase,
    morning: row.morning_tip,
    morningEn: row.morning_tip_en || row.morning_tip,
    trap: row.daily_trap,
    trapEn: row.daily_trap_en || row.daily_trap,
    evening: row.evening_question,
    eveningEn: row.evening_question_en || row.evening_question,
    cta,
    ctaEn,
    arcana_type: arcana,
    linked_recipe_id: row.linked_recipe_id ?? null,
    linked_base_recipe_id: row.linked_base_recipe_id ?? null,
    recipe_role_id: row.recipe_role_id ?? null,
  };
}

export async function fetchPublishedDeck(): Promise<TarotCardData[]> {
  const { data, error } = await supabase
    .from('tarot_cards')
    .select('*')
    .eq('is_published', true);

  if (error || !data || data.length === 0) return [];
  return data.map(dbToCard);
}

export function pickCardOfTheDay(deck: TarotCardData[]): TarotCardData {
  if (deck.length === 0) throw new Error('Deck is empty');
  const today = new Date();
  const seed =
    today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return deck[seed % deck.length];
}

function getTodayKey(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `tarot_drawn_${d.getFullYear()}-${mm}-${dd}`;
}

export async function getDrawnCardToday(deck: TarotCardData[]): Promise<TarotCardData | null> {
  const key = getTodayKey();
  const storedId = await AsyncStorage.getItem(key);
  if (!storedId) return null;
  return deck.find((c) => c.id === storedId) ?? null;
}

export async function markDrawnToday(card: TarotCardData): Promise<void> {
  await AsyncStorage.setItem(getTodayKey(), card.id);
}

export async function fetchCardById(id: string): Promise<TarotCardData | null> {
  const { data, error } = await supabase
    .from('tarot_cards')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return dbToCard(data);
}

// Kept as synchronous no-op for any remaining call sites during migration;
// callers should be updated to use fetchCardById instead.
export function getCardById(_id: string): TarotCardData | null {
  return null;
}
