export type RecipeCategory = 'crust' | 'cream' | 'filling' | 'decoration';
export type DessertTypeSlug = 'cake' | 'cheesecake' | 'tart' | 'muffin' | 'roll';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type UnitSystem = 'metric' | 'imperial';
export type Language = 'en' | 'bg';

export interface Profile {
  id: string;
  email: string;
  is_admin: boolean;
  is_premium: boolean;
  preferred_units: UnitSystem;
  language: Language;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Nutrition {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  servings: number;
}

export interface BaseRecipe {
  id: string;
  category: RecipeCategory;
  name_en: string;
  name_bg?: string;
  description_en?: string;
  description_bg?: string;
  ingredients: Ingredient[];
  steps: string[];
  prep_time_minutes?: number;
  difficulty?: Difficulty;
  image_url?: string;
  nutrition: Nutrition;
  suitable_for_dessert_types: DessertTypeSlug[];
  created_at: string;
  updated_at: string;
}

export interface DessertType {
  id: string;
  slug: DessertTypeSlug;
  name_en: string;
  name_bg?: string;
  icon?: string;
  assembly_instructions_en?: string;
  assembly_instructions_bg?: string;
  created_at: string;
}

export interface ReadyRecipe {
  id: string;
  dessert_type_id: string;
  dessert_type?: DessertType;
  name_en: string;
  name_bg?: string;
  description_en?: string;
  description_bg?: string;
  crust_id: string;
  crust?: BaseRecipe;
  cream_id: string;
  cream?: BaseRecipe;
  filling_id: string;
  filling?: BaseRecipe;
  decoration_id: string;
  decoration?: BaseRecipe;
  hero_image_url?: string;
  is_featured: boolean;
  created_at: string;
  published_at?: string;
}

export interface UserRecipe {
  id: string;
  user_id: string;
  dessert_type_id: string;
  dessert_type?: DessertType;
  custom_name?: string;
  crust_id: string;
  crust?: BaseRecipe;
  cream_id: string;
  cream?: BaseRecipe;
  filling_id: string;
  filling?: BaseRecipe;
  decoration_id: string;
  decoration?: BaseRecipe;
  is_favorite: boolean;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  ready_recipe_id: string;
  created_at: string;
}

export interface ShoppingListItem {
  ingredient: string;
  amount: number;
  unit: string;
  checked: boolean;
}

export interface ShoppingList {
  id: string;
  user_id: string;
  items: ShoppingListItem[];
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  category: 'tip' | 'guide' | 'converter';
  title_en: string;
  title_bg?: string;
  content_en: string;
  content_bg?: string;
  icon?: string;
  order_index: number;
  created_at: string;
}

export interface CombinedRecipe {
  name: string;
  dessert_type: DessertType;
  components: {
    crust: BaseRecipe;
    cream: BaseRecipe;
    filling: BaseRecipe;
    decoration: BaseRecipe;
  };
  aggregated_ingredients: Ingredient[];
  combined_steps: {
    crust: string[];
    cream: string[];
    filling: string[];
    decoration: string[];
    assembly: string[];
  };
  total_nutrition: Nutrition;
  total_prep_time: number;
}