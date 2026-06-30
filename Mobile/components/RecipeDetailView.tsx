// ===========================================================
// RecipeDetailView — Споделен компонент за рецепти
// Използва се от recipe-detail/[id].tsx и user-recipe/[id].tsx
// ===========================================================
import React, { useState, useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Image,
  TextInput,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { pickImage, uploadRecipeImage, updateRecipeImage } from '../lib/imageUpload';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { Colors } from '../constants/Colors';
import { Typography, Spacing, BorderRadius, IconSize } from '../constants/Theme';
import { useTranslation } from '../constants/i18n';
import { useLanguageStore } from '../store/useLanguageStore';
import { useUserPricesStore } from '../store/useUserPricesStore';
import { useShoppingListStore } from '../store/useShoppingListStore';
import {
  ROUND_PANS,
  getPanByServings,
  BASE_PAN,
  BASE_SERVINGS,
} from '../constants/BakingPans';
import { NutritionProgressBar } from './NutritionProgressBar';
import { MacroRingChart } from './MacroRingChart';
import { calculateDV } from '../constants/DailyValues';
import { VideoButton } from './VideoButton';
import { useRecipeResources } from '../api/hooks/useRecipeResources';
import StepsModeToggle, { StepsMode } from '../app/recipe-detail/components/StepsModeToggle';
import { StepsImagesTextMode } from '../app/recipe-detail/components/StepsImagesTextMode';
import { CookingMode } from '../app/recipe-detail/components/CookingMode';

const { height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.75;

// ─── Fixed servings options ──────────────────────────────────
const PAN_SERVINGS = [6, 8, 10, 12, 14, 18, 20, 35];
const NO_PAN_SERVINGS = [4, 6, 8, 10, 12, 16, 20, 24];

// ─── Types ─────────────────────────────────────────────────
// ─── Equipment & LabNote types (exported for [id].tsx) ───────────
export interface EquipmentItem {
  id: number;
  name: string;
  imageUrl?: string | null;
  quantity?: number;
}

export interface LabNoteItem {
  id: string;
  recipeId: number;
  text: string;
  title?: string;
  categoria?: string | null;
  baseRecipeImageUrl?: string | null;
}

export interface IngredientItem {
  id: string;
  ingredientDatabaseId?: string | null;
  name: string;
  nameBg?: string;
  nameEn?: string;
  quantity: number;
  unit: string;
  imageUrl?: string | null;
  unitWeightGrams?: number | null;
  category?: string;
  componentId?: string;
  // Micronutrients per 100g (optional — from ingredients_database)
  fiberPer100g?: number | null;
  sugarPer100g?: number | null;
  sugarAlcoholPer100g?: number | null;
  saturatedFatPer100g?: number | null;
  cholesterolPer100g?: number | null;
  sodiumPer100g?: number | null;
  calciumPer100g?: number | null;
  ironPer100g?: number | null;
  magnesiumPer100g?: number | null;
  potassiumPer100g?: number | null;
  zincPer100g?: number | null;
  vitaminAPer100g?: number | null;
  vitaminCPer100g?: number | null;
  vitaminDPer100g?: number | null;
}

export interface StepItem {
  id: string;
  stepNumber: number;
  description: string;
  imageUrl?: string | null;
  durationMinutes?: number | null;
  componentId?: string;
  equipmentNeeded?: number[];
  ingredientsUsed?: string[];
  ingredientsUsedIds?: string[];
  ingredientsForStep?: IngredientItem[];
}

export interface ComponentItem {
  id: string;
  name: string;
  roleName: string;
  imageUrl?: string | null;
  totalWeightGrams?: number;
  totalCalories?: number;
  totalProtein?: number;
  totalFat?: number;
  totalCarbs?: number;
  totalNetCarbs?: number;
  bakeTemp?: number;
  bakeTime?: number;
  prepTime?: number;
  equipmentNotes?: string;
  equipmentNotesEn?: string;
}

interface RecipeDetailViewProps {
  recipeId?: string;
  name: string;
  heroImageUrl?: string;
  components: ComponentItem[];
  ingredients: IngredientItem[];
  steps: StepItem[];
  assemblySteps?: string[];
  nutrition: {
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
    totalNetCarbs: number;
  };
  totalServings: number;
  totalWeightGrams: number;
  introText?: string;
  dessertTypeName?: string;
  dessertTypeImageUrl?: string | null;
  hasFixedPan?: boolean;  // true = торти/чийзкейкове (default); false = мъфини/брауни
  isPortionDessert?: boolean;
  isCookieRecipe?: boolean;
  servingContainer?: { id: number; name: string; name_en?: string | null; serving_container_type: string } | null;
  allowImageUpload?: boolean;
  equipment?: EquipmentItem[];
  labNotes?: LabNoteItem[];
  recipeType?: 'ready' | 'simple' | 'user';
  sourceUrl?: string;
  onBack?: () => void;
}

type DisplayMode = 'servings' | 'price';
type ActiveTab = 'intro' | 'ingredients' | 'steps' | 'nutrition';

// ─── Helper functions ───────────────────────────────────────
function convertToGrams(
  quantity: number,
  unit: string,
  unitWeightGrams?: number | null
): number {
  switch (unit.toLowerCase()) {
    case 'g': case 'gr': case 'grams': return quantity;
    case 'ml': case 'milliliters': return quantity;
    case 'kg': case 'kilograms': return quantity * 1000;
    case 'l': case 'liters': return quantity * 1000;
    case 'pcs': case 'pieces': case 'бр':
      return unitWeightGrams ? quantity * unitWeightGrams : 0;
    case 'tsp': case 'ч.л.': return quantity * 5;
    case 'tbsp': case 'с.л.': return quantity * 15;
    case 'cup': case 'чаша': return quantity * 240;
    default: return 0;
  }
}

function translateUnit(unit: string): string {
  const unitMap: Record<string, string> = {
    'g': 'г', 'gr': 'г', 'grams': 'грама',
    'ml': 'мл', 'milliliters': 'мл',
    'kg': 'кг', 'kilograms': 'кг',
    'l': 'л', 'liters': 'литра',
    'pcs': 'бр', 'pieces': 'бр', 'бр': 'бр',
    'tsp': 'ч.л.', 'ч.л.': 'ч.л.',
    'tbsp': 'с.л.', 'с.л.': 'с.л.',
    'cup': 'чаша', 'чаша': 'чаша',
  };
  return unitMap[unit.toLowerCase()] || unit;
}

function convertUnit(
  quantity: number,
  unit: string,
  unitSystem: 'metric' | 'imperial'
): { value: number; unit: string } {
  if (unitSystem === 'metric') return { value: quantity, unit };
  switch (unit.toLowerCase()) {
    case 'g': case 'г':
      return { value: Math.round(quantity / 28.35 * 10) / 10, unit: 'oz' };
    case 'ml': case 'мл':
      return { value: Math.round(quantity / 29.57 * 10) / 10, unit: 'fl oz' };
    default:
      return { value: quantity, unit };
  }
}

function formatPrice(amount: number, curr: string): string {
  const rounded = amount.toFixed(2);
  return curr === '€' ? `${rounded} €` : `$${rounded}`;
}

function formatPricePerUnit(
  price: number,
  unit: string,
  curr: string,
  lang: string,
  unitSystem: 'metric' | 'imperial'
): string {
  const isEN = lang === 'en';
  const isImperial = unitSystem === 'imperial';
  switch (unit.toLowerCase()) {
    case 'g': case 'г': case 'ч.л.': case 'tsp': case 'с.л.': case 'tbsp':
      if (isImperial) return `${formatPrice(price / 2.205, curr)}/lb`;
      return `${formatPrice(price, curr)}/${isEN ? 'kg' : 'кг'}`;
    case 'ml': case 'мл':
      if (isImperial) return `${formatPrice(price / 33.814, curr)}/fl oz`;
      return `${formatPrice(price, curr)}/${isEN ? 'L' : 'л'}`;
    case 'бр': case 'pcs': case 'pieces':
      return `${formatPrice(price, curr)}/${isEN ? 'pc' : 'бр'}`;
    default:
      if (isImperial) return `${formatPrice(price / 2.205, curr)}/lb`;
      return `${formatPrice(price, curr)}/${isEN ? 'kg' : 'кг'}`;
  }
}

function getPriceEditLabel(unit: string, lang: string, unitSystem: 'metric' | 'imperial'): string {
  const isEN = lang === 'en';
  const isImperial = unitSystem === 'imperial';
  switch (unit.toLowerCase()) {
    case 'g': case 'г': case 'ч.л.': case 'tsp': case 'с.л.': case 'tbsp':
      if (isImperial) return 'Price per lb';
      return isEN ? 'Price per kg' : 'Цена за кг';
    case 'ml': case 'мл':
      if (isImperial) return 'Price per fl oz';
      return isEN ? 'Price per L' : 'Цена за л';
    case 'бр': case 'pcs': case 'pieces':
      return isEN ? 'Price per pc' : 'Цена за бр';
    default:
      if (isImperial) return 'Price per lb';
      return isEN ? 'Price per kg' : 'Цена за кг';
  }
}

// Store → display (per kg → per lb, per L → per fl oz)
function toDisplayPrice(stored: number, unit: string, unitSystem: 'metric' | 'imperial'): number {
  if (unitSystem !== 'imperial') return stored;
  switch (unit.toLowerCase()) {
    case 'g': case 'г': case 'ч.л.': case 'tsp': case 'с.л.': case 'tbsp':
      return stored / 2.205;
    case 'ml': case 'мл':
      return stored / 33.814;
    default:
      return stored;
  }
}

// Display → store (per lb → per kg, per fl oz → per L)
function toStoredPrice(display: number, unit: string, unitSystem: 'metric' | 'imperial'): number {
  if (unitSystem !== 'imperial') return display;
  switch (unit.toLowerCase()) {
    case 'g': case 'г': case 'ч.л.': case 'tsp': case 'с.л.': case 'tbsp':
      return display * 2.205;
    case 'ml': case 'мл':
      return display * 33.814;
    default:
      return display;
  }
}

// ─── Smart quantity formatting ──────────────────────────────
// Оправдава 0.3 → 0.3, не → 0
// Правила: < 1 → 1 десетична | 1–10 → цяло | > 10 → цяло
function smartRound(value: number): number {
  if (value <= 0) return 0;
  if (value < 1) return Math.round(value * 10) / 10;  // 0.3 → 0.3
  return Math.round(value);                            // 1.7 → 2
}
export default function RecipeDetailView({
  recipeId,
  name,
  heroImageUrl,
  components,
  ingredients,
  steps,
  assemblySteps,
  nutrition,
  totalServings,
  totalWeightGrams,
  introText,
  dessertTypeName,
  dessertTypeImageUrl,
  hasFixedPan = true,
  isPortionDessert = false,
  isCookieRecipe = false,
  servingContainer,
  allowImageUpload = false,
  equipment = [],
  labNotes = [],
  recipeType,
  sourceUrl,
  onBack,
}: RecipeDetailViewProps) {

  const { t, language } = useTranslation();
  const { unitSystem, currency } = useLanguageStore();
  const queryClient = useQueryClient();

  // Shopping list store
  const addRecipeIngredients = useShoppingListStore((s) => s.addRecipeIngredients);

  // Price store
  const getEffectivePrice = useUserPricesStore((s) => s.getEffectivePrice);
  const setCustomPrice = useUserPricesStore((s) => s.setCustomPrice);
  const loadIngredients = useUserPricesStore((s) => s.loadIngredients);
  const storeIngredientCount = useUserPricesStore((s) => s.ingredients.length);

  const [mode, setMode] = useState<DisplayMode>('servings');
  const [servingMode, setServingMode] = useState<'scale' | 'slice'>('scale');
  const [stepsMode, setStepsMode] = useState<StepsMode>('text');
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [selectedServings, setSelectedServings] = useState(totalServings || BASE_SERVINGS);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('intro');
  const [editingIngId, setEditingIngId] = useState<string | null>(null);
  const [editingPriceText, setEditingPriceText] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showFullNutrition, setShowFullNutrition] = useState(false);
  const [nutritionMode, setNutritionMode] = useState<'serving' | '100g'>('serving');
  const [expandedLabNoteRecipes, setExpandedLabNoteRecipes] = useState<Set<number>>(new Set());

  const resolvedRecipeType = recipeType === 'user' ? 'simple' : (recipeType ?? 'simple');
  const { data: resources = [] } = useRecipeResources(recipeId, resolvedRecipeType as 'base' | 'ready' | 'simple');

  // Групирани lab notes по recipeId (за акордион)
  const groupedLabNotes = useMemo(() => {
    const map = new Map<number, { notes: LabNoteItem[]; imageUrl: string | null }>();
    for (const note of labNotes) {
      if (!map.has(note.recipeId)) {
        map.set(note.recipeId, { notes: [], imageUrl: note.baseRecipeImageUrl ?? null });
      }
      map.get(note.recipeId)!.notes.push(note);
    }
    return Array.from(map.entries()).map(([recipeId, val]) => ({ recipeId, ...val }));
  }, [labNotes]);

  const toggleLabNoteGroup = (recipeId: number) => {
    setExpandedLabNoteRecipes(prev => {
      const next = new Set(prev);
      if (next.has(recipeId)) next.delete(recipeId);
      else next.add(recipeId);
      return next;
    });
  };

  // Servings options based on dessert type
  const servingsOptions = hasFixedPan ? PAN_SERVINGS : NO_PAN_SERVINGS;

  // Sync when totalServings changes (e.g., on navigation)
  useEffect(() => {
    if (isPortionDessert || !!servingContainer || isCookieRecipe) {
      setSelectedServings(totalServings || 1);
      return;
    }
    const base = totalServings || BASE_SERVINGS;
    // Pick closest chip value
    const closest = servingsOptions.reduce((prev, cur) =>
      Math.abs(cur - base) < Math.abs(prev - base) ? cur : prev
    );
    setSelectedServings(closest);
  }, [totalServings, isPortionDessert, servingContainer]);

  // Load price data from RPC function when switching to price mode
  const [rpcBreakdown, setRpcBreakdown] = useState<Array<any>>([]);
  
 useEffect(() => {
  
  if (mode === 'price' && recipeId) {
    
    const fetchPriceData = async () => {
      try {
        
        const { data, error } = await supabase.rpc('calculate_recipe_cost_universal', {
  p_recipe_id: recipeId,
  p_user_id: null,
});
        
        if (error) {
          console.error('🔴 RPC error:', error);
          setRpcBreakdown([]);
          return;
        }
        
        if (data && data.length > 0 && data[0].breakdown) {
          setRpcBreakdown(data[0].breakdown);
        } else {
          setRpcBreakdown([]);
        }
      } catch (err) {
        console.error('🔴 Exception:', err);
        setRpcBreakdown([]);
      }
    };
    
    fetchPriceData();
  } else {
  }
}, [mode, recipeId]);

  // scaleFactor: from BakingPans if available, else proportional
  const isPortionMode = isPortionDessert || !!servingContainer;
  const isCookieMode = isCookieRecipe && !isPortionMode;
  const selectedPan = (!isPortionMode && !isCookieMode) ? getPanByServings(selectedServings) : null;
  const scaleFactor = servingMode === 'slice'
    ? 1
    : selectedPan
      ? selectedPan.scaleFactor / BASE_PAN.scaleFactor
      : (isPortionMode || isCookieMode)
        ? selectedServings / (totalServings || 1)
        : selectedServings / BASE_SERVINGS;

  const scaledIngredients = useMemo(() => {
    return ingredients.map(ing => {
      const scaledQty = ing.quantity * scaleFactor;
      const weightInGrams = convertToGrams(scaledQty, ing.unit, ing.unitWeightGrams);
      const converted = convertUnit(scaledQty, ing.unit, unitSystem);
      // Round: 1 decimal for oz/fl oz, integer for everything else
      const isImperialUnit = converted.unit === 'oz' || converted.unit === 'fl oz';
      const displayQty = isImperialUnit
        ? Math.round(converted.value * 10) / 10
        : smartRound(converted.value);
      let displayUnit: string;
      if (isImperialUnit) {
        displayUnit = converted.unit;
      } else {
        displayUnit = language === 'bg' ? translateUnit(ing.unit) : ing.unit;
      }
      return {
        ...ing,
        quantity: displayQty,
        displayUnit,
        weightInGrams,
      };
    });
  }, [ingredients, scaleFactor, language, unitSystem]);

  const calculatedTotalWeight = useMemo(() => {
    const total = scaledIngredients.reduce((sum, ing) => sum + (ing.weightInGrams || 0), 0);
    return total > 0 ? Math.round(total) : null;
  }, [scaledIngredients]);

 const microNutrition = useMemo(() => {
 let fiber = 0, sugar = 0, sugarAlcohol = 0, saturatedFat = 0, cholesterol = 0;
 let sodium = 0, calcium = 0, iron = 0, magnesium = 0, potassium = 0;
 let zinc = 0, vitaminA = 0, vitaminC = 0, vitaminD = 0;
 let hasAnyData = false;
 
 for (const ing of ingredients) {
 const grams = convertToGrams(ing.quantity, ing.unit, ing.unitWeightGrams);
 if (grams <= 0) continue;
 const f = grams / 100;
 
 fiber        += (ing.fiberPer100g ?? 0) * f;
    sugar        += (ing.sugarPer100g        ?? 0) * f;
    sugarAlcohol += (ing.sugarAlcoholPer100g ?? 0) * f;
    saturatedFat += (ing.saturatedFatPer100g ?? 0) * f;
    cholesterol  += (ing.cholesterolPer100g  ?? 0) * f;
    sodium       += (ing.sodiumPer100g       ?? 0) * f;
    calcium      += (ing.calciumPer100g      ?? 0) * f;
    iron         += (ing.ironPer100g         ?? 0) * f;
    magnesium    += (ing.magnesiumPer100g    ?? 0) * f;
    potassium    += (ing.potassiumPer100g    ?? 0) * f;
    zinc         += (ing.zincPer100g         ?? 0) * f;
    vitaminA     += (ing.vitaminAPer100g     ?? 0) * f;
    vitaminC     += (ing.vitaminCPer100g     ?? 0) * f;
    vitaminD     += (ing.vitaminDPer100g     ?? 0) * f;
    if (ing.sodiumPer100g != null || ing.calciumPer100g != null || ing.ironPer100g != null) {
      hasAnyData = true;
    }
  }
  
  return { fiber, sugar, sugarAlcohol, saturatedFat, cholesterol, sodium, calcium, iron, magnesium, potassium, zinc, vitaminA, vitaminC, vitaminD, hasAnyData };
}, [ingredients]);

  const displayValues = useMemo(() => {
    const s = selectedServings > 0 ? selectedServings : 1;
    const dbWeight = Math.round(totalWeightGrams * scaleFactor);
    const totalWeight = dbWeight > 0
      ? dbWeight
      : (calculatedTotalWeight ?? 0);
    return {
      totalWeight,
      portionWeight: Math.round(totalWeight / s),
      servingsCount: s,
      calories: Math.round(nutrition.totalCalories * scaleFactor / s),
      protein: Math.round(nutrition.totalProtein * scaleFactor / s),
      fat: Math.round(nutrition.totalFat * scaleFactor / s),
      carbs: Math.round(nutrition.totalCarbs * scaleFactor / s),
      netCarbs: Math.round(nutrition.totalNetCarbs * scaleFactor / s),
      fiber:        Math.round(microNutrition.fiber        * scaleFactor / s),
      sugar:        Math.round(microNutrition.sugar        * scaleFactor / s),
      sugarAlcohol: Math.round(microNutrition.sugarAlcohol * scaleFactor / s),
      saturatedFat: Math.round(microNutrition.saturatedFat * scaleFactor / s),
      cholesterol:  Math.round(microNutrition.cholesterol  * scaleFactor / s),
      sodium:       Math.round(microNutrition.sodium       * scaleFactor / s),
      calcium:      Math.round(microNutrition.calcium      * scaleFactor / s),
      iron:         Math.round(microNutrition.iron         * scaleFactor / s),
      magnesium:    Math.round(microNutrition.magnesium    * scaleFactor / s),
      potassium:    Math.round(microNutrition.potassium    * scaleFactor / s),
      zinc:         Math.round(microNutrition.zinc         * scaleFactor / s),
      vitaminA:     Math.round(microNutrition.vitaminA     * scaleFactor / s),
      vitaminC:     Math.round(microNutrition.vitaminC     * scaleFactor / s),
      vitaminD:     Math.round(microNutrition.vitaminD     * scaleFactor / s),
    };
  }, [selectedServings, scaleFactor, nutrition, totalWeightGrams, calculatedTotalWeight, microNutrition]);

  const nd = useMemo(() => {
    if (nutritionMode === 'serving' || displayValues.portionWeight <= 0) return displayValues;
    const factor = 100 / displayValues.portionWeight;
    const r = (v: number) => Math.round(v * factor * 10) / 10;
    return {
      ...displayValues,
      calories: r(displayValues.calories),
      protein: r(displayValues.protein),
      fat: r(displayValues.fat),
      carbs: r(displayValues.carbs),
      netCarbs: r(displayValues.netCarbs),
      fiber: r(displayValues.fiber),
      sugar: r(displayValues.sugar),
      sugarAlcohol: r(displayValues.sugarAlcohol),
      saturatedFat: r(displayValues.saturatedFat),
      cholesterol: r(displayValues.cholesterol),
      sodium: r(displayValues.sodium),
      calcium: r(displayValues.calcium),
      iron: r(displayValues.iron),
      magnesium: r(displayValues.magnesium),
      potassium: r(displayValues.potassium),
      zinc: r(displayValues.zinc),
      vitaminA: r(displayValues.vitaminA),
      vitaminC: r(displayValues.vitaminC),
      vitaminD: r(displayValues.vitaminD),
    };
  }, [nutritionMode, displayValues]);

  // Map RPC breakdown to priceData, matching with scaledIngredients
  const priceData = useMemo(() => {
    if (rpcBreakdown.length === 0) {
      return scaledIngredients.map(ing => ({
        ...ing,
        cost: null as number | null,
        pricePerUnit: null as number | null,
      }));
    }

    // Track which RPC items have already been matched to prevent duplicate costs
    const matchedRpcIndices = new Set<number>();

    return scaledIngredients.map(ing => {
      if (!ing.name) return { ...ing, cost: null as number | null, pricePerUnit: null as number | null };

      const ingLower = ing.name.toLowerCase().trim();

      // Find best match — prefer exact match, then starts-with, then contains
      // Never reuse an already-matched RPC item
      let bestIndex = -1;
      let bestScore = 0;

      rpcBreakdown.forEach((item: any, idx: number) => {
        if (matchedRpcIndices.has(idx)) return;
        if (!item.ingredient) return;

        const rpcLower = item.ingredient.toLowerCase().trim();

        let score = 0;
        if (rpcLower === ingLower) {
          score = 3; // exact match
        } else if (rpcLower.startsWith(ingLower) || ingLower.startsWith(rpcLower)) {
          score = 2; // prefix match
        } else if (rpcLower.includes(ingLower) && ingLower.length >= 5) {
          score = 1; // contains match (only if search term is 5+ chars to avoid false positives)
        } else if (ingLower.includes(rpcLower) && rpcLower.length >= 5) {
          score = 1;
        }

        if (score > bestScore) {
          bestScore = score;
          bestIndex = idx;
        }
      });

      if (bestIndex >= 0 && bestScore > 0) {
        const rpcItem = rpcBreakdown[bestIndex];
        matchedRpcIndices.add(bestIndex); // mark as used
        if (rpcItem.cost !== null && rpcItem.cost > 0) {
          return {
            ...ing,
            cost: rpcItem.cost as number,
            pricePerUnit: rpcItem.price as number | null,
          };
        }
      }

      return {
        ...ing,
        cost: null as number | null,
        pricePerUnit: null as number | null,
      };
    });
  }, [scaledIngredients, rpcBreakdown]);

  const totalCost = useMemo(() => {
    const sum = priceData.reduce((acc, ing) => acc + (ing.cost || 0), 0);
    return sum > 0 ? sum : null;
  }, [priceData]);

  // For portion desserts: scale total cost by serving multiplier so per-serving price stays constant
  const displayTotalCost = useMemo(() => {
    if (totalCost === null) return null;
    if (isPortionMode) return totalCost * scaleFactor;
    return totalCost;
  }, [totalCost, isPortionMode, scaleFactor]);

  const hasAnyPrice = priceData.some(ing => ing.cost !== null);

  const startTimer = (minutes: number) => {
    Alert.alert(
      '🕔 Timer',
      t('recipeDetail.timer.started').replace('{{minutes}}', String(minutes))
    );
  };

  // Flat ingredient lookup for CookingMode — uses scaledIngredients for serving-scaled qty + displayUnit
  const cookingIngredients = useMemo(() => {
    const seen = new Set<string>();
    const result: { id: string; name: string; imageUrl: string | null; quantity: number; unit: string }[] = [];
    for (const ing of scaledIngredients) {
      if (seen.has(ing.id)) continue;
      seen.add(ing.id);
      result.push({
        id: ing.id,
        name: ing.name,
        imageUrl: ing.imageUrl || null,
        quantity: ing.quantity,
        unit: ing.displayUnit,
      });
    }
    return result;
  }, [scaledIngredients]);

  // Intro tab computed data
  const introData = useMemo(() => {
    const totalPrepTime = components.reduce((s, c) => s + (c.prepTime || 0), 0);
    const totalBakeTime = components.reduce((s, c) => s + (c.bakeTime || 0), 0);
    const allEquipmentStrings = components
      .map(c => language === 'en' ? (c.equipmentNotesEn || c.equipmentNotes || '') : (c.equipmentNotes || ''))
      .filter(Boolean)
      .join(',')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const uniqueEquipment = [...new Set(allEquipmentStrings)];
    return { totalPrepTime, totalBakeTime, uniqueEquipment };
  }, [components, language]);

  // Pan info for intro tab
  const panForIntro = hasFixedPan ? getPanByServings(selectedServings) : null;
  const isRoundPan = panForIntro ? ROUND_PANS.some(p => p.servings === selectedServings) : false;
  const panSizeStr = panForIntro
    ? (unitSystem === 'metric' ? panForIntro.metricSize : panForIntro.imperialSize)
    : null;
  const panShapeStr = isRoundPan ? t('panPicker.round') : '';
  const panInfoStr = panSizeStr
    ? `${panSizeStr}${panShapeStr ? ` ${panShapeStr}` : ''}`
    : (hasFixedPan ? t('panPicker.freeSize') : null);

  const doImageUpload = async (source: 'camera' | 'gallery') => {
    if (!recipeId) return;
    setIsUploading(true);
    try {
      const uri = await pickImage(source);
      if (!uri) return;
      const publicUrl = await uploadRecipeImage(uri, recipeId);
      if (publicUrl) {
        await updateRecipeImage(recipeId, publicUrl);
        setUploadedImageUrl(publicUrl);
        queryClient.invalidateQueries({ queryKey: ['userRecipe', recipeId] });
        queryClient.invalidateQueries({ queryKey: ['homeUserRecipes'] });
        queryClient.invalidateQueries({ queryKey: ['userRecipesCreate'] });
        Alert.alert(t('common.success'), t('imageUpload.uploaded'));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraPress = () => {
    Alert.alert(
      t('imageUpload.addPhoto'),
      undefined,
      [
        { text: t('imageUpload.camera'), onPress: () => doImageUpload('camera') },
        { text: t('imageUpload.gallery'), onPress: () => doImageUpload('gallery') },
        { text: t('imageUpload.cancel'), style: 'cancel' },
      ]
    );
  };

  const defaultHero = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800';

  const RESOURCE_ICONS: Record<string, string> = {
    youtube: '📹', instagram: '📷', tiktok: '🎵',
    pinterest: '📌', blog: '📝', idea_source: '💡',
  };
  const RESOURCE_LABELS: Record<string, { bg: string; en: string }> = {
    youtube:      { bg: 'YouTube',          en: 'YouTube' },
    instagram:    { bg: 'Instagram',        en: 'Instagram' },
    tiktok:       { bg: 'TikTok',           en: 'TikTok' },
    pinterest:    { bg: 'Pinterest',        en: 'Pinterest' },
    blog:         { bg: 'Блог',             en: 'Blog' },
    idea_source:  { bg: 'Идеен източник',   en: 'Idea Source' },
  };

  const openResourceURL = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Absolute header */}
      <View style={styles.headerBar}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack}>
            <Ionicons name="chevron-back" size={28} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{name}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setIsFavorite(prev => !prev)}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={28}
                color={isFavorite ? Colors.primary.main : Colors.text.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Alert.alert(t('recipeDetail.share.title'), t('recipeDetail.share.message'))}
              style={{ marginLeft: Spacing.md }}
            >
              <Ionicons name="share-outline" size={28} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ─── Hero Section ─── */}
        <View style={styles.hero}>
          <ImageBackground
            source={{ uri: uploadedImageUrl || heroImageUrl || defaultHero }}
            style={styles.heroImage}
            resizeMode="cover"
          >
            {/* Camera Upload Button */}
            {allowImageUpload && (
              <TouchableOpacity
                style={styles.cameraUploadBtn}
                onPress={handleCameraPress}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="camera" size={IconSize.md} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            )}

            {/* Nutrition Overlay — top */}
            <View style={styles.nutritionOverlay}>
              <View style={styles.nutritionCard}>
                <View style={styles.nutritionRow}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{displayValues.calories}</Text>
                    <Text style={styles.nutritionLabel}>kcal</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{displayValues.protein}g</Text>
                    <Text style={styles.nutritionLabel}>{language === 'bg' ? 'протеин' : 'protein'}</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{displayValues.fat}g</Text>
                    <Text style={styles.nutritionLabel}>{language === 'bg' ? 'мазнини' : 'fat'}</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={[styles.nutritionValue, { color: Colors.primary.main }]}>
                      {displayValues.netCarbs}g
                    </Text>
                    <Text style={styles.nutritionLabel}>{language === 'bg' ? 'въгл.' : 'carbs'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Controls Overlay — bottom */}
            <View style={styles.controlsOverlay}>
              <View style={styles.controlsCard}>
                {/* Mode Toggle + YouTube button */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <View style={[styles.modeToggleRow, { flex: 1, marginBottom: 0 }]}>
                    <TouchableOpacity
                      onPress={() => setMode('servings')}
                      style={[styles.modeButton, mode === 'servings' && styles.modeButtonActive]}
                    >
                      <Text style={[styles.modeButtonText, {
                        color: mode === 'servings' ? Colors.text.primary : Colors.text.secondary,
                      }]}>
                        {t('recipeDetail.mode.servings')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setMode('price')}
                      style={[styles.modeButton, mode === 'price' && styles.modeButtonActive]}
                    >
                      <Text style={[styles.modeButtonText, {
                        color: mode === 'price' ? Colors.text.primary : Colors.text.secondary,
                      }]}>
                        {t('recipeDetail.mode.price')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {(() => {
                    const youtubeResource = resources.find(r => r.resource_type === 'youtube');
                    const videoUrl = youtubeResource?.url || sourceUrl;
                    if (!videoUrl) return null;
                    return <VideoButton sourceUrl={videoUrl} />;
                  })()}
                </View>

                {/* Servings Mode — compact single row */}
                {mode === 'servings' && (
                  <>
                    {/* Scale vs Slice toggle */}
                    <View style={{
                      flexDirection: 'row',
                      backgroundColor: Colors.background.secondary,
                      borderRadius: 8,
                      padding: 2,
                      marginBottom: 4,
                    }}>
                      <TouchableOpacity
                        onPress={() => setServingMode('scale')}
                        style={{
                          flex: 1,
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: 6,
                          backgroundColor: servingMode === 'scale' ? Colors.primary.main : 'transparent',
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{
                          fontSize: 11,
                          fontWeight: '600',
                          color: servingMode === 'scale' ? '#fff' : Colors.text.secondary,
                        }}>
                          📐 Скалирай
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setServingMode('slice')}
                        style={{
                          flex: 1,
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: 6,
                          backgroundColor: servingMode === 'slice' ? Colors.primary.main : 'transparent',
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{
                          fontSize: 11,
                          fontWeight: '600',
                          color: servingMode === 'slice' ? '#fff' : Colors.text.secondary,
                        }}>
                          ✂️ Режи
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={{ fontSize: 10, color: Colors.text.tertiary, textAlign: 'center', marginBottom: 4 }}>
                      {servingMode === 'scale'
                        ? 'Съставките се умножават с порциите'
                        : 'Теглото е фиксирано — само се нарязва на повече парчета'
                      }
                    </Text>
                    <View style={styles.servingsCompactRow}>
                    {/* Left: total weight — hidden when unknown */}
                    {displayValues.totalWeight > 0 ? (
                      <View style={styles.servingsCompactSide}>
                        <Text style={styles.servingsCompactValue}>{displayValues.totalWeight}g</Text>
                        <Text style={styles.servingsCompactLabel}>{language === 'bg' ? 'общо' : 'total'}</Text>
                      </View>
                    ) : (
                      <View style={styles.servingsCompactSide} />
                    )}
                    {/* Center: stepper OR fixed portion count */}
                    {(isPortionDessert || !!servingContainer) ? (
                      <View style={styles.servingsCompactCenter}>
                        <TouchableOpacity
                          onPress={() => setSelectedServings(prev => Math.max(1, prev - 1))}
                          style={[styles.stepperBtn, selectedServings <= 1 && styles.stepperBtnDisabled]}
                          disabled={selectedServings <= 1}
                        >
                          <Text style={styles.stepperBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.stepperValue}>{selectedServings}</Text>
                        <TouchableOpacity
                          onPress={() => setSelectedServings(prev => prev + 1)}
                          style={styles.stepperBtn}
                        >
                          <Text style={styles.stepperBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    ) : isCookieMode ? (
                      <View style={styles.servingsCompactCenter}>
                        <TouchableOpacity
                          onPress={() => setSelectedServings(prev => Math.max(5, prev - 5))}
                          style={[styles.stepperBtn, selectedServings <= 5 && styles.stepperBtnDisabled]}
                          disabled={selectedServings <= 5}
                        >
                          <Text style={styles.stepperBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.stepperValue}>{selectedServings}</Text>
                        <TouchableOpacity
                          onPress={() => setSelectedServings(prev => prev + 5)}
                          style={styles.stepperBtn}
                        >
                          <Text style={styles.stepperBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.servingsCompactCenter}>
                        <TouchableOpacity
                          onPress={() => {
                            const idx = servingsOptions.indexOf(selectedServings);
                            if (idx > 0) setSelectedServings(servingsOptions[idx - 1]);
                          }}
                          style={[
                            styles.stepperBtn,
                            servingsOptions.indexOf(selectedServings) === 0 && styles.stepperBtnDisabled,
                          ]}
                          disabled={servingsOptions.indexOf(selectedServings) === 0}
                        >
                          <Text style={styles.stepperBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.stepperValue}>{selectedServings}</Text>
                        <TouchableOpacity
                          onPress={() => {
                            const idx = servingsOptions.indexOf(selectedServings);
                            if (idx < servingsOptions.length - 1) setSelectedServings(servingsOptions[idx + 1]);
                          }}
                          style={[
                            styles.stepperBtn,
                            servingsOptions.indexOf(selectedServings) === servingsOptions.length - 1 && styles.stepperBtnDisabled,
                          ]}
                          disabled={servingsOptions.indexOf(selectedServings) === servingsOptions.length - 1}
                        >
                          <Text style={styles.stepperBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {/* Right: per serving weight — hidden when unknown */}
                    {displayValues.portionWeight > 0 ? (
                      <View style={[styles.servingsCompactSide, { alignItems: 'flex-end' }]}>
                        <Text style={styles.servingsCompactValue}>{displayValues.portionWeight}g</Text>
                        <Text style={styles.servingsCompactLabel}>{language === 'bg' ? 'на порция' : 'per serving'}</Text>
                      </View>
                    ) : (
                      <View style={[styles.servingsCompactSide, { alignItems: 'flex-end' }]} />
                    )}
                    </View>
                  </>
                )}

                {/* Price Mode — summary only in card */}
                {mode === 'price' && (
                  <View style={styles.priceSummaryRow}>
                    <View style={styles.priceSummaryItem}>
                      <Text style={styles.priceSummaryValue}>
                        {displayTotalCost !== null ? formatPrice(displayTotalCost, currency) : '—'}
                      </Text>
                      <Text style={styles.controlLabel}>{t('recipeDetail.cost.total')}</Text>
                    </View>
                    <View style={styles.priceSummaryDivider} />
                    <View style={styles.priceSummaryItem}>
                      <Text style={styles.priceSummaryValue}>
                        {displayTotalCost !== null ? formatPrice(displayTotalCost / selectedServings, currency) : '—'}
                      </Text>
                      <Text style={styles.controlLabel}>{t('recipeDetail.cost.perServing')}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Recipe Title */}
        <View style={styles.titleSection}>
          <Text style={styles.recipeTitle}>{name}</Text>
          {recipeType === 'simple' && (
            <Text style={{ fontSize: 12, color: '#10b981', fontWeight: '600', marginTop: 4 }}>
              🏆 {language === 'bg' ? 'От нашите сладкари' : 'By Our Chefs'}
            </Text>
          )}
          {recipeType === 'ready' && (
            <Text style={{ fontSize: 12, color: '#059669', fontWeight: '600', marginTop: 4 }}>
              ✓ {language === 'bg' ? 'Избрано от шеф' : 'Chef Selected'}
            </Text>
          )}
        </View>

        {/* ─── Tabs ─── */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsRow}>
            {([
              { key: 'intro' as const, label: t('recipeDetail.tabs.intro') },
              { key: 'ingredients' as const, label: t('recipeDetail.tabs.ingredients') },
              { key: 'steps' as const, label: t('recipeDetail.tabs.steps') },
              { key: 'nutrition' as const, label: t('recipeDetail.tabs.nutritionShort') },
            ]).map(tab => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
              >
                <Text style={[styles.tabLabel, {
                  color: activeTab === tab.key ? Colors.primary.main : Colors.text.secondary,
                }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── Content ─── */}
        <View style={styles.contentArea}>

          {/* INTRO Tab */}
          {activeTab === 'intro' && (
            <View>
              {/* Dessert Type — с аватар */}
              {dessertTypeName ? (
                <View style={styles.introInfoCard}>
                  {dessertTypeImageUrl ? (
                    <Image
                      source={{ uri: dessertTypeImageUrl }}
                      style={styles.dessertTypeAvatar}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.introInfoEmoji}>🍰</Text>
                  )}
                  <View style={styles.introInfoContent}>
                    <Text style={styles.introInfoLabel}>{t('recipeDetail.intro.type')}</Text>
                    <Text style={styles.introInfoValue}>{dessertTypeName}</Text>
                  </View>
                </View>
              ) : null}

              {/* Times */}
              {(introData.totalPrepTime > 0 || introData.totalBakeTime > 0) && (
                <View style={styles.introTimesCard}>
                  {introData.totalPrepTime > 0 && (
                    <View style={styles.introTimeRow}>
                      <Text style={styles.introTimeEmoji}>⏱</Text>
                      <Text style={styles.introTimeLabel}>{t('recipeDetail.intro.prep')}</Text>
                      <Text style={styles.introTimeValue}>
                        {introData.totalPrepTime} {language === 'bg' ? 'мин' : 'min'}
                      </Text>
                    </View>
                  )}
                  {introData.totalBakeTime > 0 && (
                    <View style={styles.introTimeRow}>
                      <Text style={styles.introTimeEmoji}>🔥</Text>
                      <Text style={styles.introTimeLabel}>{t('recipeDetail.intro.bake')}</Text>
                      <Text style={styles.introTimeValue}>
                        {introData.totalBakeTime} {language === 'bg' ? 'мин' : 'min'}
                      </Text>
                    </View>
                  )}
                  {(introData.totalPrepTime + introData.totalBakeTime) > 0 && (
                    <View style={[styles.introTimeRow, styles.introTimeTotalRow]}>
                      <Text style={styles.introTimeEmoji}>⏰</Text>
                      <Text style={[styles.introTimeLabel, { fontWeight: '700' }]}>{t('recipeDetail.intro.total')}</Text>
                      <Text style={[styles.introTimeValue, { fontWeight: '700', color: Colors.primary.main }]}>
                        {introData.totalPrepTime + introData.totalBakeTime} {language === 'bg' ? 'мин' : 'min'}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Pan info OR portion serving info */}
              {(isPortionDessert || !!servingContainer) ? (
                <View style={styles.introInfoCard}>
                  <Text style={styles.introInfoEmoji}>🥂</Text>
                  <View style={styles.introInfoContent}>
                    <Text style={styles.introInfoLabel}>
                      {language === 'bg' ? 'ПОРЦИИ' : 'SERVINGS'}
                    </Text>
                    <Text style={styles.introInfoValue}>
                      {selectedServings}{' '}
                      {servingContainer
                        ? (language === 'bg' ? servingContainer.name : (servingContainer.name_en || servingContainer.name))
                        : (language === 'bg' ? 'порции' : 'servings')}
                    </Text>
                  </View>
                </View>
              ) : isCookieMode ? (
                <View style={styles.introInfoCard}>
                  <View style={styles.panAvatarContainer}>
                    <Text style={styles.panAvatarEmoji}>🍪</Text>
                    <Text style={styles.panAvatarSize}>Тава</Text>
                  </View>
                  <View style={styles.introInfoContent}>
                    <Text style={styles.introInfoLabel}>
                      {language === 'bg' ? 'ТАВА ЗА ФУРНА' : 'BAKING TRAY'}
                    </Text>
                    <Text style={styles.introInfoValue}>
                      {selectedServings} {language === 'bg' ? 'бр.' : 'pcs'}
                    </Text>
                  </View>
                </View>
              ) : panInfoStr ? (
                <View style={styles.introInfoCard}>
                  <View style={styles.panAvatarContainer}>
                    <Text style={styles.panAvatarEmoji}>
                      {isRoundPan ? '🔵' : '□'}
                    </Text>
                    <Text style={styles.panAvatarSize}>
                      {panSizeStr || ''}
                    </Text>
                  </View>
                  <View style={styles.introInfoContent}>
                    <Text style={styles.introInfoLabel}>{t('panPicker.title')}</Text>
                    <Text style={styles.introInfoValue}>
                      {panInfoStr} · {selectedServings} {t('panPicker.servings')}
                    </Text>
                  </View>
                </View>
              ) : null}

              {/* ─── Equipment с аватари (DB) ─── */}
              {equipment.length > 0 ? (
                <View style={styles.equipmentCard}>
                  <Text style={styles.introInfoLabel}>
                    {language === 'bg' ? 'ОБОРУДВАНЕ' : 'EQUIPMENT'}
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.equipmentScrollContent}
                  >
                    {equipment.map((eq) => (
                      <View key={eq.id} style={styles.equipmentItem}>
                        {eq.imageUrl ? (
                          <Image
                            source={{ uri: eq.imageUrl }}
                            style={styles.equipmentAvatar}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.equipmentAvatarFallback}>
                            <Text style={styles.equipmentAvatarEmoji}>🍰</Text>
                          </View>
                        )}
                        <Text style={styles.equipmentName} numberOfLines={2}>{eq.name}</Text>
                        {(eq.quantity ?? 1) > 1 && (
                          <Text style={styles.equipmentQty}>x{eq.quantity}</Text>
                        )}
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ) : introData.uniqueEquipment.length > 0 ? (
                <View style={styles.introInfoCard}>
                  <Text style={styles.introInfoEmoji}>🔧</Text>
                  <View style={styles.introInfoContent}>
                    <Text style={styles.introInfoLabel}>{t('recipeDetail.intro.equipment')}</Text>
                    <Text style={styles.introInfoValue}>{introData.uniqueEquipment.join(', ')}</Text>
                  </View>
                </View>
              ) : null}

              {/* ─── LAB NOTES — акордион по base_recipe ─── */}
              {groupedLabNotes.length > 0 && (
                <View style={styles.labNotesSection}>
                  <Text style={styles.labNotesSectionTitle}>LAB NOTE</Text>
                  {groupedLabNotes.map(({ recipeId, notes, imageUrl }) => {
                    const isOpen = expandedLabNoteRecipes.has(recipeId);
                    const baseRecipeComponent = components.find(
                      c => c.id === String(recipeId) || c.id.startsWith(String(recipeId) + '_')
                    );
                    const baseRecipeName = baseRecipeComponent?.name ?? '';
                    return (
                      <View key={recipeId} style={styles.labNoteGroup}>
                        <TouchableOpacity
                          style={styles.labNoteGroupHeader}
                          onPress={() => toggleLabNoteGroup(recipeId)}
                          activeOpacity={0.7}
                        >
                          {imageUrl ? (
                            <Image source={{ uri: imageUrl }} style={styles.labNoteAvatar} resizeMode="cover" />
                          ) : (
                            <View style={styles.labNoteAvatarFallback}>
                              <Text style={styles.labNoteAvatarEmoji}>🧪</Text>
                            </View>
                          )}
                          <View style={styles.labNoteGroupHeaderText}>
                            {baseRecipeName ? (
                              <Text style={styles.labNoteGroupName} numberOfLines={1}>{baseRecipeName}</Text>
                            ) : null}
                            <Text style={styles.labNoteGroupCount}>
                              {notes.length} {language === 'bg' ? 'бележки' : 'notes'}
                            </Text>
                          </View>
                          <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.text.tertiary} />
                        </TouchableOpacity>
                        {isOpen && notes.map((note) => {
                          const categoryLabel = (() => {
                            const cat = note.categoria?.toLowerCase();
                            if (!cat) return null;
                            const labels: Record<string, { bg: string; en: string }> = {
                              lab_note:    { bg: 'Lab Note',        en: 'Lab Note' },
                              chefs_trick: { bg: 'Трик на шефа',    en: "Chef's Trick" },
                              technique:   { bg: 'Техника',         en: 'Technique' },
                              app_advice:  { bg: 'Съвет за прилож.',  en: 'App Advice' },
                            };
                            const entry = labels[cat];
                            return entry ? (language === 'bg' ? entry.bg : entry.en) : note.categoria;
                          })();
                          return (
                            <View key={note.id} style={styles.labNoteCard}>
                              <View style={styles.labNoteContent}>
                                {categoryLabel ? <Text style={styles.labNoteCategoryLabel}>{categoryLabel}</Text> : null}
                                {note.title ? <Text style={styles.labNoteTitle}>{note.title}</Text> : null}
                                <Text style={styles.labNoteText}>{note.text}</Text>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Resources Section */}
              {resources.length > 0 && (
                <View style={styles.resourcesSection}>
                  <Text style={styles.resourcesSectionTitle}>
                    🔗 {language === 'bg' ? 'Ресурси' : 'Resources'}
                  </Text>
                  <View style={styles.resourcesList}>
                    {resources.map(resource => (
                      <TouchableOpacity
                        key={resource.id}
                        style={styles.resourceItem}
                        onPress={() => openResourceURL(resource.url)}
                      >
                        <Text style={styles.resourceItemIcon}>
                          {RESOURCE_ICONS[resource.resource_type] ?? '🔗'}
                        </Text>
                        <View style={styles.resourceItemContent}>
                          <Text style={styles.resourceItemType}>
                            {RESOURCE_LABELS[resource.resource_type]?.[language] ?? resource.resource_type}
                          </Text>
                          {resource.title && (
                            <Text style={styles.resourceItemTitle} numberOfLines={1}>
                              {resource.title}
                            </Text>
                          )}
                        </View>
                        <Ionicons name="open-outline" size={18} color={Colors.primary.main} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* BLAGO logo divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Image source={require('../assets/Logo-Blago.png')} style={styles.blagoLogo} resizeMode="contain" />
                <View style={styles.dividerLine} />
              </View>

              {/* Intro text — накрая */}
              <Text style={styles.introBody}>
                {introText || (language === 'bg'
                  ? 'Специално приготвен с кето-приятелски съставки, без излишни въглехидрати.'
                  : 'Specially made with keto-friendly ingredients, without excess carbs.'
                )}
              </Text>
            </View>
          )}

          {/* INGREDIENTS Tab */}
          {activeTab === 'ingredients' && (
            <View>
              {/* Price mode: cost breakdown */}
              {mode === 'price' ? (
                <View>
                  {!hasAnyPrice ? (
                    <View style={styles.priceNoteBox}>
                      <Text style={styles.priceNoteText}>{t('recipeDetail.cost.note')}</Text>
                    </View>
                  ) : (
                    <View>
                      {components.map(component => {
                        const compIngredients = priceData.filter(
                          ing => ing.componentId === component.id
                        );
                        if (compIngredients.length === 0) return null;
                        return (
                          <View key={component.id} style={styles.ingredientGroup}>
                            <Text style={styles.categoryLabel}>{component.roleName}</Text>
                            {compIngredients.map(ing => (
                              editingIngId === ing.id ? (
                                <View key={ing.id} style={styles.priceEditRow}>
                                  <Text style={styles.priceIngName} numberOfLines={1}>
                                    {ing.name} {ing.quantity}{ing.displayUnit}
                                  </Text>
                                  <View style={styles.priceEditControls}>
                                    <Text style={styles.priceEditUnit}>
                                      {getPriceEditLabel(ing.unit, language, unitSystem)}:
                                    </Text>
                                    <TextInput
                                      value={editingPriceText}
                                      onChangeText={setEditingPriceText}
                                      keyboardType="decimal-pad"
                                      style={styles.priceEditInput}
                                      autoFocus
                                    />
                                    <TouchableOpacity
                                      onPress={() => {
                                        const entered = parseFloat(editingPriceText.replace(',', '.'));
                                        if (!isNaN(entered) && entered > 0 && ing.ingredientDatabaseId) {
                                          setCustomPrice(ing.ingredientDatabaseId, toStoredPrice(entered, ing.unit, unitSystem));
                                        }
                                        setEditingIngId(null);
                                      }}
                                    >
                                      <Ionicons name="checkmark" size={20} color={Colors.primary.main} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setEditingIngId(null)}>
                                      <Ionicons name="close" size={20} color={Colors.text.tertiary} />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              ) : (
                                <View key={ing.id} style={styles.priceRow}>
                                  <Text style={styles.priceIngName} numberOfLines={1}>
                                    {ing.name} {ing.quantity}{ing.displayUnit}
                                  </Text>
                                  <View style={styles.priceRowRight}>
                                    <View style={styles.priceCostBlock}>
                                      <Text style={[
                                        styles.priceCost,
                                        ing.cost === null && { color: Colors.text.secondary },
                                      ]}>
                                        {ing.cost !== null ? formatPrice(ing.cost, currency) : '—'}
                                      </Text>
                                      {ing.pricePerUnit !== null && ing.cost !== null && (
                                        <Text style={styles.pricePerUnitText}>
                                          {formatPricePerUnit(ing.pricePerUnit, ing.unit, currency, language, unitSystem)}
                                        </Text>
                                      )}
                                    </View>
                                    {ing.ingredientDatabaseId && (
                                      <TouchableOpacity
                                        onPress={() => {
                                          const currentStored = getEffectivePrice(ing.ingredientDatabaseId!) ?? 0;
                                          const displayPrice = toDisplayPrice(currentStored, ing.unit, unitSystem);
                                          setEditingPriceText(displayPrice > 0 ? displayPrice.toFixed(2) : '');
                                          setEditingIngId(ing.id);
                                        }}
                                        style={styles.priceEditBtn}
                                      >
                                        <Ionicons name="pencil" size={IconSize.sm} color={Colors.text.tertiary} />
                                      </TouchableOpacity>
                                    )}
                                  </View>
                                </View>
                              )
                            ))}
                          </View>
                        );
                      })}
                      <View style={styles.priceTotalRow}>
                        <View>
                          <Text style={styles.priceTotalLabel}>{t('recipeDetail.cost.total')}</Text>
                          <Text style={[styles.priceTotalLabel, { fontSize: 13, fontWeight: '400', color: Colors.text.secondary }]}>
                            {t('recipeDetail.cost.perServing')}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.priceTotalValue}>
                            {displayTotalCost !== null ? formatPrice(displayTotalCost, currency) : '—'}
                          </Text>
                          <Text style={[styles.priceTotalValue, { fontSize: 13, color: Colors.text.secondary }]}>
                            {displayTotalCost !== null ? formatPrice(displayTotalCost / selectedServings, currency) : '—'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.priceNoteText}>{t('recipeDetail.cost.note')}</Text>
                    </View>
                  )}
                </View>
              ) : (
                /* Servings mode: standard ingredient list */
                <View>
                  <TouchableOpacity
                    style={styles.shoppingBtn}
                    onPress={() => {
                      const items = scaledIngredients.map(ing => ({
                        ingredient: ing.name,
                        ingredientBg: ing.nameBg,
                        ingredientEn: ing.nameEn,
                        quantity: ing.quantity,
                        unit: ing.displayUnit || ing.unit,
                        category: ing.category,
                      }));
                      addRecipeIngredients(recipeId || name, name, items);
                      Alert.alert(t('common.success'), t('recipeDetail.actions.addedToList'));
                    }}
                  >
                    <Ionicons name="cart" size={18} color={Colors.text.inverse} />
                    <Text style={styles.shoppingBtnText}>
                      {t('recipeDetail.actions.addToShoppingListLong')}
                    </Text>
                  </TouchableOpacity>

                  {scaledIngredients.length > 0 ? (
                    <View>
                      {components.map(component => {
                        const compIngredients = scaledIngredients.filter(
                          ing => ing.componentId === component.id
                        );
                        if (compIngredients.length === 0) return null;
                        return (
                          <View key={component.id} style={styles.ingredientGroup}>
                            {component.roleName ? <Text style={styles.categoryLabel}>{component.roleName}</Text> : null}
                            {compIngredients.map(ing => (
                              <View key={ing.id} style={styles.ingredientRow}>
                                {ing.imageUrl ? (
                                  <Image
                                    source={{ uri: ing.imageUrl }}
                                    style={styles.ingredientAvatar}
                                    resizeMode="cover"
                                  />
                                ) : (
                                  <View style={styles.ingredientAvatarFallback}>
                                    <Text style={styles.ingredientAvatarEmoji}>🥄</Text>
                                  </View>
                                )}
                                <Text style={styles.ingredientName}>
                                  {ing.quantity} {ing.displayUnit} {ing.name}
                                </Text>
                              </View>
                            ))}
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>{t('recipeDetail.noIngredients')}</Text>
                  )}
                </View>
              )}
            </View>
          )}

          {/* STEPS Tab */}
          {activeTab === 'steps' && (
            <View style={{ flex: 1 }}>
              <StepsModeToggle
                selected={stepsMode}
                onChange={setStepsMode}
                timerEnabled={timerEnabled}
                onTimerToggle={() => setTimerEnabled(prev => !prev)}
              />

              {/* TEXT mode */}
              {stepsMode === 'text' && (
                <View>
                  {steps.length > 0 ? (
                    <View>
                      {components.map(component => {
                        const compSteps = steps.filter(s => s.componentId === component.id);
                        if (compSteps.length === 0) return null;
                        return (
                          <View key={component.id} style={styles.stepGroup}>
                            <View style={styles.componentHeader}>
                              {component.imageUrl ? (
                                <Image
                                  source={{ uri: component.imageUrl }}
                                  style={styles.componentAvatar}
                                  resizeMode="cover"
                                />
                              ) : (
                                <View style={styles.componentAvatarFallback}>
                                  <Text style={styles.componentAvatarEmoji}>🍰</Text>
                                </View>
                              )}
                              <View style={styles.componentHeaderText}>
                                <Text style={styles.componentName} numberOfLines={1}>{component.name}</Text>
                                <Text style={styles.componentRole} numberOfLines={1}>{component.roleName}</Text>
                              </View>
                              <Text style={styles.stepsCount}>{compSteps.length} {language === 'bg' ? 'стъпки' : 'steps'}</Text>
                            </View>
                            {compSteps.map(step => {
                              if (!step.description && !step.imageUrl) return null;
                              return (
                                <View key={step.id} style={styles.stepItem}>
                                  <View style={styles.stepRowText}>
                                    <View style={styles.stepCircle}>
                                      <Text style={styles.stepCircleText}>{step.stepNumber}</Text>
                                    </View>
                                    <Text style={styles.stepDescription}>
                                      {step.description ||
                                        `${t('recipeDetail.instructions.step')} ${step.stepNumber}`}
                                    </Text>
                                  </View>
                                  {timerEnabled && step.durationMinutes && step.durationMinutes > 0 && (
                                    <TouchableOpacity
                                      onPress={() => startTimer(step.durationMinutes!)}
                                      style={styles.timerBtnIndented}
                                    >
                                      <Ionicons name="timer-outline" size={14} color={Colors.text.inverse} />
                                      <Text style={styles.timerBtnText}>
                                        {step.durationMinutes} {language === 'bg' ? 'мин' : 'min'}
                                      </Text>
                                    </TouchableOpacity>
                                  )}
                                </View>
                              );
                            })}
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>{t('recipeDetail.instructions.noInstructions')}</Text>
                  )}

                  {assemblySteps && assemblySteps.length > 0 && (
                    <View style={styles.assemblySection}>
                      <View style={styles.assemblyDivider} />
                      <Text style={styles.assemblyTitle}>
                        🎂 {t('recipeDetail.instructions.assembly')}
                      </Text>
                      {assemblySteps.map((step, idx) => (
                        <View key={idx} style={styles.stepItem}>
                          <View style={styles.stepRowText}>
                            <View style={[styles.stepCircle, { backgroundColor: Colors.secondary.main }]}>
                              <Text style={styles.stepCircleText}>{idx + 1}</Text>
                            </View>
                            <Text style={styles.stepDescription}>{step}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* IMAGES+TEXT mode */}
              {stepsMode === 'images-text' && (
                <View>
                  <StepsImagesTextMode
                    steps={steps}
                    components={components}
                    ingredients={ingredients}
                    onTimerPress={timerEnabled ? startTimer : undefined}
                    timerEnabled={timerEnabled}
                  />
                  {assemblySteps && assemblySteps.length > 0 && (
                    <View style={styles.assemblySection}>
                      <View style={styles.assemblyDivider} />
                      <Text style={styles.assemblyTitle}>
                        🎂 {t('recipeDetail.instructions.assembly')}
                      </Text>
                      {assemblySteps.map((step, idx) => (
                        <View key={idx} style={styles.stepItem}>
                          <View style={styles.stepRowText}>
                            <View style={[styles.stepCircle, { backgroundColor: Colors.secondary.main }]}>
                              <Text style={styles.stepCircleText}>{idx + 1}</Text>
                            </View>
                            <Text style={styles.stepDescription}>{step}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* COOKING mode */}
              {stepsMode === 'cooking' && (
                <CookingMode
                  components={components}
                  steps={steps}
                  equipment={equipment}
                  ingredients={cookingIngredients}
                  onClose={() => setStepsMode('text')}
                />
              )}
            </View>
          )}

          {/* NUTRITION Tab */}
          {activeTab === 'nutrition' && (
            <View>
              {/* Nutrition Mode Toggle */}
              <View style={styles.nutritionToggle}>
                <TouchableOpacity
                  style={[styles.toggleBtn, nutritionMode === 'serving' && styles.toggleBtnActive]}
                  onPress={() => setNutritionMode('serving')}
                >
                  <Text style={[styles.toggleBtnText, nutritionMode === 'serving' && styles.toggleBtnTextActive]}>
                    {language === 'bg' ? 'На порция' : 'Per serving'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, nutritionMode === '100g' && styles.toggleBtnActive]}
                  onPress={() => setNutritionMode('100g')}
                >
                  <Text style={[styles.toggleBtnText, nutritionMode === '100g' && styles.toggleBtnTextActive]}>
                    {language === 'bg' ? 'На 100г' : 'Per 100g'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Ring Chart */}
              <View style={styles.ringChartContainer}>
                <MacroRingChart
                  calories={nd.calories}
                  netCarbsGrams={nd.netCarbs}
                  proteinGrams={nd.protein}
                  fatGrams={nd.fat}
                  size={180}
                />

                {/* Legend */}
                <View style={styles.ringChartLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.primary.main }]} />
                    <Text style={styles.legendLabel}>Net Carbs</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.macros.protein }]} />
                    <Text style={styles.legendLabel}>Protein</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.macros.fat }]} />
                    <Text style={styles.legendLabel}>Fat</Text>
                  </View>
                </View>
              </View>

              {/* Calories */}
              <View style={[styles.nutritionTabRow, styles.nutritionTabRowBorder]}>
                <Text style={styles.nutritionTabLabel}>{t('recipeDetail.nutrition.calories')}</Text>
                <Text style={styles.nutritionTabValue}>{nd.calories} kcal</Text>
              </View>

              {/* Protein */}
              <View style={[styles.nutritionTabRow, styles.nutritionTabRowBorder]}>
                <Text style={styles.nutritionTabLabel}>{t('recipeDetail.nutrition.protein')}</Text>
                <Text style={styles.nutritionTabValue}>{nd.protein} g</Text>
              </View>

              {/* Fat */}
              <View style={[styles.nutritionTabRow, styles.nutritionTabRowBorder]}>
                <Text style={styles.nutritionTabLabel}>{t('recipeDetail.nutrition.fat')}</Text>
                <Text style={styles.nutritionTabValue}>{nd.fat} g</Text>
              </View>

              {/* Carbs */}
              <View style={[styles.nutritionTabRow, styles.nutritionTabRowBorder]}>
                <Text style={styles.nutritionTabLabel}>{t('recipeDetail.nutrition.carbs')}</Text>
                <Text style={styles.nutritionTabValue}>{nd.carbs} g</Text>
              </View>

              {/* Net Carbs */}
              <View style={styles.nutritionTabRow}>
                <Text style={[styles.nutritionTabLabel, { color: Colors.primary.main }]}>{t('recipeDetail.nutrition.netCarbs')}</Text>
                <Text style={[styles.nutritionTabValue, { color: Colors.primary.main }]}>{nd.netCarbs} g</Text>
              </View>

              {/* Detailed Nutrition Toggle */}
              <TouchableOpacity
                style={styles.detailedNutritionButton}
                onPress={() => setShowFullNutrition(prev => !prev)}
                accessibilityLabel={showFullNutrition ? 'Скрий детайлни нутриенти' : 'Покажи детайлни нутриенти'}
              >
                <Ionicons name="nutrition" size={IconSize.sm} color={Colors.primary.main} />
                <Text style={styles.detailedNutritionButtonText}>
                  {showFullNutrition ? t('recipeDetail.nutrition.hideFull') : t('recipeDetail.nutrition.showFull')}
                </Text>
                <Ionicons
                  name={showFullNutrition ? 'chevron-up' : 'chevron-down'}
                  size={IconSize.sm}
                  color={Colors.primary.main}
                />
              </TouchableOpacity>

              {/* Detailed Nutrition (Expandable) */}
              {showFullNutrition && (
                <View style={styles.detailedNutritionContainer}>

                  {/* Въглехидрати детайли */}
                  <View style={styles.nutrientSection}>
                    <Text style={styles.nutritionSectionTitle}>ВЪГЛЕХИДРАТИ ДЕТАЙЛИ</Text>
                    <NutritionProgressBar
                      label="Захар"
                      value={nd.sugar}
                      unit="g"
                      percentDV={calculateDV(nd.sugar, 'sugar')}
                      color={Colors.micronutrients.sugar}
                    />
                    <NutritionProgressBar
                      label="Захарни алкохоли"
                      value={nd.sugarAlcohol}
                      unit="g"
                      percentDV={0}
                      color={Colors.micronutrients.sugarAlcohol}
                    />
                  </View>

                  {/* Мазнини детайли */}
                  <View style={styles.nutrientSection}>
                    <Text style={styles.nutritionSectionTitle}>МАЗНИНИ ДЕТАЙЛИ</Text>
                    <NutritionProgressBar
                      label="Наситени мазнини"
                      value={nd.saturatedFat}
                      unit="g"
                      percentDV={calculateDV(nd.saturatedFat, 'saturated_fat')}
                      color={Colors.micronutrients.saturatedFat}
                    />
                    <NutritionProgressBar
                      label="Холестерол"
                      value={nd.cholesterol}
                      unit="mg"
                      percentDV={calculateDV(nd.cholesterol, 'cholesterol')}
                      color={Colors.micronutrients.cholesterol}
                    />
                  </View>

                  {/* Минерали */}
                  <View style={styles.nutrientSection}>
                    <Text style={styles.nutritionSectionTitle}>МИНЕРАЛИ</Text>
                    <NutritionProgressBar
                      label="Натрий"
                      value={nd.sodium}
                      unit="mg"
                      percentDV={calculateDV(nd.sodium, 'sodium')}
                      color={Colors.micronutrients.sodium}
                    />
                    <NutritionProgressBar
                      label="Калций"
                      value={nd.calcium}
                      unit="mg"
                      percentDV={calculateDV(nd.calcium, 'calcium')}
                      color={Colors.micronutrients.calcium}
                    />
                    <NutritionProgressBar
                      label="Желязо"
                      value={nd.iron}
                      unit="mg"
                      percentDV={calculateDV(nd.iron, 'iron')}
                      color={Colors.micronutrients.iron}
                    />
                    <NutritionProgressBar
                      label="Магнезий"
                      value={nd.magnesium}
                      unit="mg"
                      percentDV={calculateDV(nd.magnesium, 'magnesium')}
                      color={Colors.micronutrients.magnesium}
                    />
                    <NutritionProgressBar
                      label="Калий"
                      value={nd.potassium}
                      unit="mg"
                      percentDV={calculateDV(nd.potassium, 'potassium')}
                      color={Colors.micronutrients.potassium}
                    />
                    <NutritionProgressBar
                      label="Цинк"
                      value={nd.zinc}
                      unit="mg"
                      percentDV={calculateDV(nd.zinc, 'zinc')}
                      color={Colors.micronutrients.zinc}
                    />
                  </View>

                  {/* Витамини */}
                  <View style={styles.nutrientSection}>
                    <Text style={styles.nutritionSectionTitle}>ВИТАМИНИ</Text>
                    <NutritionProgressBar
                      label="Витамин A"
                      value={nd.vitaminA}
                      unit="mcg"
                      percentDV={calculateDV(nd.vitaminA, 'vitamin_a')}
                      color={Colors.micronutrients.vitaminA}
                    />
                    <NutritionProgressBar
                      label="Витамин C"
                      value={nd.vitaminC}
                      unit="mg"
                      percentDV={calculateDV(nd.vitaminC, 'vitamin_c')}
                      color={Colors.micronutrients.vitaminC}
                    />
                    <NutritionProgressBar
                      label="Витамин D"
                      value={nd.vitaminD}
                      unit="mcg"
                      percentDV={calculateDV(nd.vitaminD, 'vitamin_d')}
                      color={Colors.micronutrients.vitaminD}
                    />
                  </View>

                  <Text style={styles.dvNote}>
                    * % DV базирани на 2000 калории кето диета
                  </Text>
                </View>
              )}
            </View>
          )}

        </View>
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  // Header
  headerBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 50,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    paddingTop: 48,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
    color: Colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Hero
  hero: {
    height: HERO_HEIGHT,
    marginTop: 88,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  videoSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },

  // Camera upload button
  cameraUploadBtn: {
    position: 'absolute',
    top: 80,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  // Nutrition overlay (top of hero)
  nutritionOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
  },
  nutritionCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: BorderRadius.lg,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  nutritionLabel: {
    fontSize: 8,
    color: Colors.text.secondary,
    marginTop: 2,
  },

  // Controls overlay (bottom of hero)
  controlsOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  controlsCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: BorderRadius.lg,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.secondary.main,
  },
  modeToggleRow: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: Colors.background.secondary,
    padding: 2,
    borderRadius: BorderRadius.round,
    marginBottom: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: Colors.background.primary,
  },
  modeButtonText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Servings compact row
  servingsCompactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  servingsCompactSide: {
    alignItems: 'flex-start',
    minWidth: 60,
  },
  servingsCompactCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  servingsCompactValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  servingsCompactLabel: {
    fontSize: 9,
    color: Colors.text.tertiary,
    marginTop: 2,
  },

  // Stepper buttons
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    backgroundColor: Colors.background.secondary,
  },
  stepperBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.inverse,
    lineHeight: 24,
  },
  stepperCenter: {
    alignItems: 'center',
    minWidth: 80,
  },
  stepperValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  stepperLabel: {
    fontSize: 9,
    color: Colors.text.secondary,
    marginTop: 2,
  },

  // Servings summary row (below chips)
  servingsSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  controlValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  controlLabel: {
    fontSize: 8,
    color: Colors.text.secondary,
  },
  servingsDisplay: {
    alignItems: 'center',
  },
  servingsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },

  // Price mode summary
  priceSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  priceSummaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  priceSummaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary.main,
  },
  priceSummaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border.light,
  },

  // Title
  titleSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  recipeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },

  // Tabs
  tabsContainer: {
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  tabsRow: {
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabItemActive: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary.main,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Content area
  contentArea: {
    backgroundColor: Colors.background.primary,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },

  // Intro info cards
  introInfoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  introInfoEmoji: {
    fontSize: 18,
    marginRight: Spacing.md,
    marginTop: 1,
  },
  introInfoContent: {
    flex: 1,
  },
  introInfoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  introInfoValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  introTimesCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  introTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  introTimeTotalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    marginTop: 4,
    paddingTop: 8,
  },
  introTimeEmoji: {
    fontSize: 16,
    marginRight: Spacing.md,
    width: 24,
    textAlign: 'center',
  },
  introTimeLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  introTimeValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '600',
  },

  // Intro tab
  introSection: {
    marginBottom: 24,
  },
  introTypeLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.text.primary,
  },
  dividerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    height: 1,
    flex: 1,
    backgroundColor: Colors.secondary.main,
  },
  blagoLogo: {
    width: 32,
    height: 32,
    marginHorizontal: 16,
  },
  introBody: {
    lineHeight: 24,
    color: Colors.text.secondary,
  },

  // Ingredients tab
  shoppingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.lg,
    marginBottom: 24,
    backgroundColor: Colors.primary.main,
  },
  shoppingBtnText: {
    color: Colors.text.inverse,
    fontWeight: '600',
    marginLeft: 8,
  },
  ingredientGroup: {
    marginBottom: 24,
  },
  categoryLabel: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.primary.main,
  },
  componentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  componentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  componentAvatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  componentAvatarEmoji: {
    fontSize: 24,
  },
  componentHeaderText: {
    flex: 1,
  },
  componentName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.main,
    marginBottom: 2,
  },
  componentRole: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  stepsCount: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 'auto',
    paddingLeft: 12,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ingredientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  ingredientAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: Colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientAvatarEmoji: {
    fontSize: 20,
  },
  ingredientName: {
    flex: 1,
    fontSize: 15,
    lineHeight: 28,
    color: Colors.text.primary,
  },

  // Price mode rows
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceIngName: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    marginRight: 8,
  },
  priceCost: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  priceTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  priceTotalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  priceTotalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.primary.main,
  },
  // Price row with edit button
  priceRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceCostBlock: {
    alignItems: 'flex-end',
  },
  pricePerUnitText: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginTop: 1,
  },
  priceEditBtn: {
    padding: 4,
  },
  priceEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  priceEditControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceEditInput: {
    width: 72,
    borderWidth: 1,
    borderColor: Colors.primary.main,
    borderRadius: BorderRadius.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 13,
    color: Colors.text.primary,
  },
  priceEditUnit: {
    fontSize: 11,
    color: Colors.text.tertiary,
  },
  priceNoteBox: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  priceNoteText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    lineHeight: 18,
  },

  // Steps tab
  stepGroup: {
    marginBottom: 24,
  },
  stepItem: {
    marginBottom: 16,
  },
  stepRowText: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: Colors.primary.main,
  },
  stepCircleText: {
    color: Colors.text.inverse,
    fontWeight: 'bold',
    fontSize: 12,
  },
  stepDescription: {
    flex: 1,
    lineHeight: 28,
    color: Colors.text.primary,
  },
  stepImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.lg,
    marginBottom: 8,
  },
  timerBtnIndented: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 40,
    marginTop: 8,
    backgroundColor: Colors.secondary.main,
  },
  timerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: Colors.secondary.main,
  },
  timerBtnText: {
    color: Colors.text.inverse,
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 12,
  },

  // Nutrition tab
  nutritionToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background.secondary,
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
    alignSelf: 'center',
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary.main,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  toggleBtnTextActive: {
    color: 'white',
    fontWeight: '600' as const,
  },
  nutritionTabHeader: {
    color: Colors.text.secondary,
    marginBottom: 32,
  },
  nutritionTabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  nutritionTabRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  nutritionTabLabel: {
    fontSize: 15,
    color: Colors.text.secondary,
  },
  nutritionTabValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  nutritionTabRowIndent: {
    paddingLeft: Spacing.lg,
  },
  nutritionTabLabelSub: {
    fontSize: 13,
    color: Colors.text.tertiary,
  },
  nutritionTabValueSub: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  nutritionToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    marginTop: Spacing.xs,
  },
  nutritionToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.main,
  },
  nutritionMineralsSection: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  nutritionSectionTitle: {
    fontSize: 11,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },

  // Ring chart
  ringChartContainer: {
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  ringChartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontSize: 12,
  },

  // Detailed nutrition
  detailedNutritionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.secondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  detailedNutritionButtonText: {
    ...Typography.button,
    color: Colors.primary.main,
  },
  detailedNutritionContainer: {
    marginTop: Spacing.lg,
    gap: Spacing.lg,
  },
  nutrientSection: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  dvNote: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },

  // Empty state
  emptyText: {
    textAlign: 'center',
    paddingVertical: 32,
    color: Colors.text.secondary,
  },

  // Assembly section
  assemblySection: {
    marginTop: 8,
  },
  assemblyDivider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: 24,
  },
  assemblyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginBottom: 16,
  },

  // ─── Equipment card (Intro tab) ────────────────
  equipmentCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  equipmentScrollContent: {
    paddingTop: Spacing.sm,
    paddingRight: Spacing.md,
    gap: 16,
  },
  equipmentItem: {
    alignItems: 'center',
    width: 72,
  },
  equipmentAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 6,
    backgroundColor: Colors.background.tertiary,
  },
  equipmentAvatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 6,
    backgroundColor: Colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equipmentAvatarEmoji: {
    fontSize: 24,
  },
  equipmentName: {
    fontSize: 10,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  equipmentQty: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary.main,
    marginTop: 2,
  },

  // ─── Dessert type & Pan avatars (Intro tab) ─────────
  dessertTypeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: Spacing.md,
    flexShrink: 0,
    backgroundColor: Colors.background.tertiary,
  },
  panAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    flexShrink: 0,
  },
  panAvatarEmoji: {
    fontSize: 20,
    lineHeight: 24,
  },
  panAvatarSize: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.text.tertiary,
    marginTop: 1,
  },

  // ─── Lab Notes section (Intro tab) ──────────────
  labNotesSection: {
    marginTop: Spacing.xl,
  },
  labNotesSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
  },
  labNoteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  labNoteAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    flexShrink: 0,
  },
  labNoteAvatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    flexShrink: 0,
    backgroundColor: Colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labNoteAvatarEmoji: {
    fontSize: 22,
  },
  labNoteContent: {
    flex: 1,
  },
  labNoteCategoryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary.main,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  labNoteText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.primary,
  },
  labNoteTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },

  // ─── Lab Notes акордион група ─────────────────────
  labNoteGroup: {
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  labNoteGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  labNoteGroupHeaderText: {
    flex: 1,
  },
  labNoteGroupName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  labNoteGroupCount: {
    fontSize: 11,
    color: Colors.text.tertiary,
  },

  // Step-specific ingredients in text mode
  stepIngredientsBox: {
    marginTop: Spacing.sm,
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },
  stepIngredientsTitle: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
    marginTop: Spacing.xs,
  },
  stepIngredientsScroll: {
    marginHorizontal: -Spacing.sm,
  },
  stepIngredientsContent: {
    paddingHorizontal: Spacing.sm,
    gap: Spacing.xs,
  },
  stepIngredientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.opacity[10],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minWidth: 130,
    gap: Spacing.xs,
  },
  stepIngredientImage: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background.tertiary,
  },
  stepIngredientImagePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIngredientEmoji: {
    fontSize: 16,
  },
  stepIngredientTextWrap: {
    flex: 1,
  },
  stepIngredientQty: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.primary.main,
    lineHeight: 14,
  },
  stepIngredientName: {
    fontSize: Typography.caption.fontSize,
    color: Colors.text.primary,
    lineHeight: 14,
  },

  // ─── Resources ───────────────────────────────────────────
  resourcesSection: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  resourcesSectionTitle: {
    fontSize: Typography.body1.fontSize,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  resourcesList: {
    gap: Spacing.sm,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  resourceItemIcon: {
    fontSize: 20,
  },
  resourceItemContent: {
    flex: 1,
  },
  resourceItemType: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary.main,
  },
  resourceItemTitle: {
    fontSize: 12,
    color: Colors.text.primary,
    marginTop: 2,
  },
});
