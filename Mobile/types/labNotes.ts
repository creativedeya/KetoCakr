export type LabNoteCategory =
  | 'chocolate'
  | 'flours'
  | 'sweeteners'
  | 'assembly'
  | 'mistakes'
  | 'general';

export interface MatrixRow {
  label: string;
  value_en: string;
  value_bg?: string;
}

export type ContentBlock =
  | { type: 'intro'; text_en?: string; text_bg?: string }
  | { type: 'lab_note'; label_en?: string; label_bg?: string; text_en?: string; text_bg?: string }
  | { type: 'matrix'; title_en?: string; title_bg?: string; rows?: MatrixRow[] }
  | { type: 'critical_error'; text_en?: string; text_bg?: string }
  | { type: 'tip'; text_en?: string; text_bg?: string };

export interface LabNote {
  id: number;
  category: LabNoteCategory;
  icon: string;
  title_en: string;
  title_bg?: string | null;
  subtitle_en?: string | null;
  subtitle_bg?: string | null;
  content?: string | null;
  content_bg?: string | null;
  content_json: ContentBlock[];
  display_order: number;
  is_active: boolean;
  image_url?: string | null;
  image_alt?: string | null;
}

export interface CategoryInfo {
  key: LabNoteCategory;
  icon: string;
  title_en: string;
  title_bg: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { key: 'chocolate',  icon: '🍫', title_en: 'Chocolate & Ganache', title_bg: 'Шоколад и Ганаш' },
  { key: 'flours',     icon: '🌾', title_en: 'Flours & Bases',      title_bg: 'Брашна и Блатове' },
  { key: 'sweeteners', icon: '🍬', title_en: 'Sweeteners',          title_bg: 'Подсладители' },
  { key: 'assembly',   icon: '🧁', title_en: 'Assembly',            title_bg: 'Сглобяване' },
  { key: 'mistakes',   icon: '⚠️', title_en: 'Common Mistakes',     title_bg: 'Чести грешки' },
  { key: 'general',    icon: '🔬', title_en: 'General',             title_bg: 'Общи' },
];

export function noteTitle(note: Pick<LabNote, 'title_en' | 'title_bg'>, language: 'en' | 'bg'): string {
  return language === 'bg' ? (note.title_bg || note.title_en) : note.title_en;
}

export function noteSubtitle(note: Pick<LabNote, 'subtitle_en' | 'subtitle_bg'>, language: 'en' | 'bg'): string {
  if (language === 'bg') return note.subtitle_bg || note.subtitle_en || '';
  return note.subtitle_en || '';
}

export function blockText(
  block: ContentBlock,
  field: 'text' | 'label' | 'title',
  language: 'en' | 'bg',
): string {
  const enKey = `${field}_en` as keyof ContentBlock;
  const bgKey = `${field}_bg` as keyof ContentBlock;
  const bgVal = (block as any)[bgKey];
  const enVal = (block as any)[enKey];
  return language === 'bg' ? (bgVal || enVal || '') : (enVal || '');
}
