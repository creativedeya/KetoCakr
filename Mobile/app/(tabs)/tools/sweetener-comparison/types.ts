export interface Sweetener {
  id: string;
  name_en: string;
  name_bg: string;
  glycemic_index: number;
  sweetness_ratio: number;        // e.g. 1.0 = 100% as sweet as sugar, 2.0 = 200%
  keto: boolean;
  calories_per_gram: number;
  source: string;
  icon?: string;
  taste_profile_en?: string;
  taste_profile_bg?: string;
  common_uses?: string;
  description_en?: string;
  description_bg?: string;
  pros_en?: string[];
  pros_bg?: string[];
  cons_en?: string[];
  cons_bg?: string[];
  form_en?: 'powder' | 'syrup' | 'crystals' | 'granules' | 'liquid' | 'paste';
  form_bg?: 'прах' | 'сироп' | 'кристали' | 'гранули' | 'течност' | 'паста';
  recommended_combinations?: string;
  net_carbs_per_100g?: number;
  price?: number;
  display_order?: number;
}

export interface FilterState {
  sourceType: string | null;
  maxGI: number;
  ketoOnly: boolean;
  searchQuery: string;
}

export const UNIT_TO_GRAMS: Record<string, number> = {
  g: 1,
  tbsp: 15,
  tsp: 5,
  cup: 240,
};

export const SOURCE_TYPES = ['natural', 'synthetic', 'semi-natural'];
