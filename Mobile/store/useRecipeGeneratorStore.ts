// ===========================================================
// Recipe Generator Store - UPDATED for new schema
// ===========================================================
import { create } from 'zustand';

export interface SelectedComponent {
  recipeRoleId: number;
  baseRecipeId: string;
  servingsMultiplier: number;
  name: string; // for display
}

interface RecipeGeneratorState {
  // Step 1: Dessert type
  selectedDessertTypeId: number | null;
  
  // Step 2: Components selection
  selectedComponents: SelectedComponent[];
  
  // Step 3: Portions
  totalServings: number;
  
  // Step 4: Recipe name
  recipeName: string;
  
  // Navigation
  currentStep: number;
  
  // Actions
  setDessertType: (dessertTypeId: number) => void;
  addComponent: (component: SelectedComponent) => void;
  removeComponent: (recipeRoleId: number) => void;
  updateComponentServings: (recipeRoleId: number, multiplier: number) => void;
  setTotalServings: (servings: number) => void;
  setRecipeName: (name: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  reset: () => void;
}

const initialState = {
  selectedDessertTypeId: null,
  selectedComponents: [],
  totalServings: 8,
  recipeName: '',
  currentStep: 1,
};

export const useRecipeGeneratorStore = create<RecipeGeneratorState>((set) => ({
  ...initialState,

  setDessertType: (dessertTypeId) =>
    set({ 
      selectedDessertTypeId: dessertTypeId,
      selectedComponents: [], // Reset components when changing dessert type
    }),

  addComponent: (component) =>
    set((state) => {
      // Replace if same role, otherwise add
      const filtered = state.selectedComponents.filter(
        (c) => c.recipeRoleId !== component.recipeRoleId
      );
      return {
        selectedComponents: [...filtered, component],
      };
    }),

  removeComponent: (recipeRoleId) =>
    set((state) => ({
      selectedComponents: state.selectedComponents.filter(
        (c) => c.recipeRoleId !== recipeRoleId
      ),
    })),

  updateComponentServings: (recipeRoleId, multiplier) =>
    set((state) => ({
      selectedComponents: state.selectedComponents.map((c) =>
        c.recipeRoleId === recipeRoleId
          ? { ...c, servingsMultiplier: multiplier }
          : c
      ),
    })),

  setTotalServings: (servings) =>
    set({ totalServings: servings }),

  setRecipeName: (name) =>
    set({ recipeName: name }),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 4),
    })),

  previousStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
    })),

  goToStep: (step) =>
    set({ currentStep: step }),

  reset: () =>
    set(initialState),
}));
