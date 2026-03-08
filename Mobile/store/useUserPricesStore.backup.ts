import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface IngredientWithPrice {
  id: string;
  name_en: string;
  name_bg: string;
  default_price: number;
  default_currency: string;
  price_unit: string;
  image_url?: string;
  category_id?: number;
}

interface UserPricesState {
  ingredients: IngredientWithPrice[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;

  // Actions
  loadIngredients: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  
  // TODO: Enable when auth is implemented
  // setCustomPrice: (ingredientId: string, price: number, notes?: string) => Promise<void>;
  // removeCustomPrice: (ingredientId: string) => Promise<void>;
  // setUserCurrency: (currency: string) => Promise<void>;
  // getUserCurrency: () => Promise<string>;
}

export const useUserPricesStore = create<UserPricesState>((set) => ({
  ingredients: [],
  isLoading: false,
  error: null,
  searchQuery: '',

  loadIngredients: async () => {
    set({ isLoading: true, error: null });

    try {
      // Get all ingredients — no auth required
      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from('ingredients_database')
        .select('id, name_en, name_bg, default_price, default_currency, price_unit, image_url, category_id')
        .order('name_bg');

      if (ingredientsError) throw ingredientsError;

      set({ 
        ingredients: ingredientsData || [], 
        isLoading: false,
      });

    } catch (error: any) {
      console.error('Error loading ingredients:', error);
      set({ 
        error: error.message || 'Failed to load ingredients', 
        isLoading: false 
      });
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  
  // TODO: Implement these when auth is available
  // setCustomPrice: async (ingredientId: string, price: number, notes?: string) => {
  //   throw new Error('Custom prices require authentication');
  // },
  // removeCustomPrice: async (ingredientId: string) => {
  //   throw new Error('Custom prices require authentication');
  // },
  // setUserCurrency: async (currency: string) => {
  //   throw new Error('User settings require authentication');
  // },
  // getUserCurrency: async () => {
  //   return 'EUR';
  // }
}));