import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

export interface UserPrice {
  ingredientId: string;
  price: number;
  currency?: string;
  notes?: string;
  updatedAt?: string;
}

interface UserPricesState {
  ingredients: IngredientWithPrice[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;

  // persisted local settings
  customPrices: Record<string, UserPrice>;
  currency: string;

  // Actions
  loadIngredients: () => Promise<void>;
  setSearchQuery: (query: string) => void;

  setCustomPrice: (ingredientId: string, price: number, notes?: string) => Promise<void>;
  removeCustomPrice: (ingredientId: string) => Promise<void>;
  getEffectivePrice: (ingredientId: string) => number | null;
  getCustomPricesCount: () => number;
  setUserCurrency: (currency: string) => Promise<void>;
  getUserCurrency: () => string;
}

export const useUserPricesStore = create<UserPricesState>()(
  persist(
    (set, get) => ({
      ingredients: [],
      isLoading: false,
      error: null,
      searchQuery: '',

      customPrices: {},
      currency: 'EUR',

      loadIngredients: async () => {
        set({ isLoading: true, error: null });

        try {
          const { data: ingredientsData, error: ingredientsError } = await supabase
            .from('ingredients_database')
            .select('id, name_en, name_bg, default_price, default_currency, price_unit, image_url, category_id')
            .order('name_bg');

          if (ingredientsError) throw ingredientsError;

          set({
            ingredients: (ingredientsData as IngredientWithPrice[]) || [],
            isLoading: false,
          });

        } catch (error: any) {
          console.error('Error loading ingredients:', error);
          set({
            error: error.message || 'Failed to load ingredients',
            isLoading: false,
          });
        }
      },

      setSearchQuery: (query: string) => set({ searchQuery: query }),

      setCustomPrice: async (ingredientId: string, price: number, notes?: string) => {
        const now = new Date().toISOString();
        set((state) => {
          const next: Record<string, UserPrice> = {
            ...state.customPrices,
            [ingredientId]: {
              ingredientId,
              price,
              currency: state.currency,
              notes,
              updatedAt: now,
            },
          };
          return { customPrices: next };
        });
      },

      removeCustomPrice: async (ingredientId: string) => {
        set((state) => {
          const next = { ...state.customPrices };
          delete next[ingredientId];
          return { customPrices: next };
        });
      },

      getEffectivePrice: (ingredientId: string) => {
        const state = get();
        const custom = state.customPrices[ingredientId];
        if (custom) return custom.price;
        const ing = state.ingredients.find((i) => i.id === ingredientId);
        return ing ? ing.default_price : null;
      },

      getCustomPricesCount: () => Object.keys(get().customPrices).length,

      setUserCurrency: async (currency: string) => {
        set({ currency });
      },

      getUserCurrency: () => get().currency,
    }),
    {
      name: 'user-prices',
      getStorage: () => AsyncStorage,
      // Only persist selected keys
      partialize: (state) => ({ customPrices: state.customPrices, currency: state.currency }),
    }
  )
);