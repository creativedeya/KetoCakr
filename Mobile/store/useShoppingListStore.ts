// ===========================================================
// FILE: mobile/store/useShoppingListStore.ts
// PART 3: Shopping list state management with local persistence
// ===========================================================
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ShoppingListItem {
  id: string;
  ingredient: string;
  ingredientBg?: string;
  ingredientEn?: string;
  quantity: number;
  unit: string;
  isChecked: boolean;
  category?: string;
  recipeId?: string;
  recipeName?: string;
}

interface ShoppingListState {
  items: ShoppingListItem[];
  isLoaded: boolean;

  // Actions
  loadItems: () => Promise<void>;
  addItem: (item: Omit<ShoppingListItem, 'id' | 'isChecked'>) => Promise<void>;
  addRecipeIngredients: (
    recipeId: string,
    recipeName: string,
    ingredients: Array<{
      ingredient: string;
      ingredientBg?: string;
      ingredientEn?: string;
      quantity: number;
      unit: string;
      category?: string;
    }>
  ) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  toggleCheck: (id: string) => Promise<void>;
  clearChecked: () => Promise<void>;
  clearAll: () => Promise<void>;
}

const STORAGE_KEY = '@ketocakr:shopping_list';

export const useShoppingListStore = create<ShoppingListState>((set, get) => ({
  items: [],
  isLoaded: false,

  loadItems: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored);
        set({ items, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch (error) {
      console.error('Load shopping list error:', error);
      set({ isLoaded: true });
    }
  },

  addItem: async (item) => {
    const newItem: ShoppingListItem = {
      ...item,
      id: Date.now().toString(),
      isChecked: false,
    };

    const newItems = [...get().items, newItem];
    set({ items: newItems });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch (error) {
      console.error('Save shopping list error:', error);
    }
  },

  addRecipeIngredients: async (recipeId, recipeName, ingredients) => {
    const existingItems = get().items;
    const newItems = ingredients.map((ing) => {
      // Check if ingredient already exists
      const existing = existingItems.find(
        (item) =>
          item.ingredient.toLowerCase() === ing.ingredient.toLowerCase() &&
          item.unit.toLowerCase() === ing.unit.toLowerCase() &&
          !item.isChecked
      );

      if (existing) {
        // Aggregate quantity
        return {
          ...existing,
          quantity: existing.quantity + ing.quantity,
        };
      }

      // Create new item
      return {
        id: `${Date.now()}-${Math.random()}`,
        ingredient: ing.ingredient,
        ingredientBg: ing.ingredientBg,
        ingredientEn: ing.ingredientEn,
        quantity: ing.quantity,
        unit: ing.unit,
        isChecked: false,
        category: ing.category,
        recipeId,
        recipeName,
      };
    });

    // Merge with existing, removing duplicates
    const itemMap = new Map<string, ShoppingListItem>();
    
    existingItems.forEach((item) => {
      itemMap.set(item.id, item);
    });

    newItems.forEach((item) => {
      const existing = existingItems.find(
        (ei) =>
          ei.ingredient.toLowerCase() === item.ingredient.toLowerCase() &&
          ei.unit.toLowerCase() === item.unit.toLowerCase() &&
          !ei.isChecked
      );

      if (existing) {
        itemMap.set(existing.id, item);
      } else {
        itemMap.set(item.id, item);
      }
    });

    const mergedItems = Array.from(itemMap.values());
    set({ items: mergedItems });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mergedItems));
    } catch (error) {
      console.error('Save shopping list error:', error);
    }
  },

  removeItem: async (id) => {
    const newItems = get().items.filter((item) => item.id !== id);
    set({ items: newItems });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch (error) {
      console.error('Save shopping list error:', error);
    }
  },

  toggleCheck: async (id) => {
    const newItems = get().items.map((item) =>
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    );
    set({ items: newItems });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch (error) {
      console.error('Save shopping list error:', error);
    }
  },

  clearChecked: async () => {
    const newItems = get().items.filter((item) => !item.isChecked);
    set({ items: newItems });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch (error) {
      console.error('Save shopping list error:', error);
    }
  },

  clearAll: async () => {
    set({ items: [] });

    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Clear shopping list error:', error);
    }
  },
}));
