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
  recipe_id?: string | null;
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
  created_at: string;
  updated_at: string;
}

export type LabNoteFormData = Omit<LabNote, 'id' | 'created_at' | 'updated_at'>;

export interface ParsedLabNote {
  title_en: string;
  title_bg?: string;
  subtitle_en: string;
  subtitle_bg?: string;
  icon: string;
  category: LabNoteCategory;
  content_json: ContentBlock[];
}

export interface TranslationRequest {
  text: string;
  context?: string;
  language?: 'bg';
}

export interface TranslationResponse {
  original: string;
  translated: string;
  language: string;
}
