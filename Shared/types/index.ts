// ===========================================================
// Shared Types - Based on actual Supabase schema
// ===========================================================

// Dessert Types
export interface DessertType {
  id: number;
  name: string;
  name_en: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

// Recipe Roles
export interface RecipeRole {
  id: number;
  name: string;
  name_en: string;
  description: string | null;
}

// Base Recipes
export interface BaseRecipe {
  id: string; // UUID
  name: string;
  name_en: string | null;
  recipe_role_id: number;
  compatible_dessert_types: number[]; // Array of dessert_type IDs
  assembly_template_key: string | null;
  description: string | null;
  description_en: string | null;
  description_bg: string | null;  // Bulgarian instructions
  prep_time_minutes: number | null;
  bake_time_minutes: number | null;
  servings: number;
  instructions: string | null;
  total_calories: number | null;
  total_fat: number | null;
  total_protein: number | null;
  total_carbs: number | null;
  total_net_carbs: number | null;
  total_weight_grams: number | null;  // ADDED: Total weight in grams
  image_url: string | null;
  image_url_1: string | null;
  image_url_2: string | null;
  ingredients_text_bg: string | null;
  ingredients_text_en: string | null;
  created_at: string;
  updated_at: string;
  created_by_user_id: string | null;
}

// User Recipes
export interface UserRecipe {
  id: string;
  user_id: string;
  dessert_type_id: number;
  name: string;  // Changed from recipe_name to name
  selected_components: SelectedComponent[];
  total_servings: number;
  created_at: string;
  
  // Joined data
  dessert_type?: DessertType;
}

export interface SelectedComponent {
  recipe_role_id: number;
  base_recipe_id: string;
  servings_multiplier: number;
  name: string;
}

// Profiles
export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

// Ready Recipes (Published recipes with components from selected_components JSONB)
export interface ReadyRecipe {
  id: string;
  dessert_type_id: number;
  name_bg: string;
  name_en: string | null;
  description_bg: string | null;
  description_en: string | null;
  hero_image_url: string | null;
  is_featured: boolean;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  
  // Assembly & Customization
  assembly_template_id: number | null;
  custom_intro_text_bg: string | null;
  custom_intro_text_en: string | null;
  tags: string[] | null;
  
  // Components (replaced crust_id/cream_id/filling_id/decoration_id)
  selected_components: SelectedComponent[] | null;
  
  // Nutrition
  total_servings: number | null;
  total_weight_grams: number | null;
  total_calories: number | null;
  total_protein: number | null;
  total_fat: number | null;
  total_carbs: number | null;
  total_net_carbs: number | null;
  
  // Difficulty & Pricing
  difficulty_level: number | null;
  is_free: boolean | null;
  estimated_cost: number | null;
  cost_currency: string | null;
  cost_calculated_at: string | null;
  selling_price: number | null;
  price_currency: string | null;
  
  // SEO
  slug: string | null;
  
  // Joined data
  dessert_type?: DessertType;
}
