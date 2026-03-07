// ===========================================================
// RecipeDetailView — Споделен компонент за рецепти
// Използва се от recipe-detail/[id].tsx и user-recipe/[id].tsx
// ===========================================================
import React, { useState, useMemo, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

const { height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.75;

// ─── Fixed servings options ──────────────────────────────────
const PAN_SERVINGS = [6, 8, 10, 12, 14, 18, 20, 35];
const NO_PAN_SERVINGS = [4, 6, 8, 10, 12, 16, 20, 24];

// ─── Types ─────────────────────────────────────────────────
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
}

export interface StepItem {
  id: string;
  stepNumber: number;
  description: string;
  imageUrl?: string | null;
  durationMinutes?: number | null;
  componentId?: string;
}

export interface ComponentItem {
  id: string;
  name: string;
  roleName: string;
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
  hasFixedPan?: boolean;  // true = торти/чийзкейкове (default); false = мъфини/брауни
  onBack?: () => void;
}

type DisplayMode = 'servings' | 'price';
type ViewMode = 'text' | 'gallery';
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

// ─── Component ──────────────────────────────────────────────
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
  hasFixedPan = true,
  onBack,
}: RecipeDetailViewProps) {
  const { t, language } = useTranslation();
  const { unitSystem, currency } = useLanguageStore();

  // Shopping list store
  const addRecipeIngredients = useShoppingListStore((s) => s.addRecipeIngredients);

  // Price store
  const getEffectivePrice = useUserPricesStore((s) => s.getEffectivePrice);
  const setCustomPrice = useUserPricesStore((s) => s.setCustomPrice);
  const loadIngredients = useUserPricesStore((s) => s.loadIngredients);
  const storeIngredientCount = useUserPricesStore((s) => s.ingredients.length);

  const [mode, setMode] = useState<DisplayMode>('servings');
  const [viewMode, setViewMode] = useState<ViewMode>('text');
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [selectedServings, setSelectedServings] = useState(totalServings || BASE_SERVINGS);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('intro');
  const [editingIngId, setEditingIngId] = useState<string | null>(null);
  const [editingPriceText, setEditingPriceText] = useState('');

  // Servings options based on dessert type
  const servingsOptions = hasFixedPan ? PAN_SERVINGS : NO_PAN_SERVINGS;

  // Sync when totalServings changes (e.g., on navigation)
  useEffect(() => {
    const base = totalServings || BASE_SERVINGS;
    // Pick closest chip value
    const closest = servingsOptions.reduce((prev, cur) =>
      Math.abs(cur - base) < Math.abs(prev - base) ? cur : prev
    );
    setSelectedServings(closest);
  }, [totalServings]);

  // Load ingredient prices when switching to price mode
  useEffect(() => {
    if (mode === 'price' && storeIngredientCount === 0) {
      loadIngredients();
    }
  }, [mode]);

  // scaleFactor: from BakingPans if available, else proportional
  const selectedPan = getPanByServings(selectedServings);
  const scaleFactor = selectedPan
    ? selectedPan.scaleFactor / BASE_PAN.scaleFactor
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
        : Math.round(converted.value);
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

  const displayValues = useMemo(() => {
    const s = selectedServings > 0 ? selectedServings : 1;
    const totalWeight = calculatedTotalWeight || Math.round(totalWeightGrams * scaleFactor);
    return {
      totalWeight,
      portionWeight: Math.round(totalWeight / s),
      servingsCount: s,
      calories: Math.round(nutrition.totalCalories * scaleFactor / s),
      protein: Math.round((nutrition.totalProtein * scaleFactor / s) * 10) / 10,
      fat: Math.round((nutrition.totalFat * scaleFactor / s) * 10) / 10,
      carbs: Math.round((nutrition.totalCarbs * scaleFactor / s) * 10) / 10,
      netCarbs: Math.round((nutrition.totalNetCarbs * scaleFactor / s) * 10) / 10,
    };
  }, [selectedServings, scaleFactor, nutrition, totalWeightGrams, calculatedTotalWeight]);

  // Price data
  const priceData = useMemo(() => {
    return scaledIngredients.map(ing => {
      if (!ing.ingredientDatabaseId) {
        return { ...ing, cost: null as number | null, pricePerUnit: null as number | null };
      }
      const price = getEffectivePrice(ing.ingredientDatabaseId);
      if (price === null || price === 0) {
        return { ...ing, cost: null as number | null, pricePerUnit: null as number | null };
      }
      let cost: number | null = null;
      const lowerUnit = ing.unit.toLowerCase();
      const isPiece = ['бр', 'pcs', 'pieces'].includes(lowerUnit);
      if (isPiece) {
        // price is per piece; ing.quantity is already scaled
        cost = ing.quantity * price;
      } else if (ing.weightInGrams > 0) {
        // price is per kg/L; weightInGrams already handles ч.л./с.л./g/ml
        cost = (ing.weightInGrams / 1000) * price;
      }
      return {
        ...ing,
        cost: (cost !== null && cost > 0) ? cost : null,
        pricePerUnit: price,
      };
    });
  }, [scaledIngredients, getEffectivePrice]);

  const totalCost = useMemo(() => {
    const sum = priceData.reduce((acc, ing) => acc + (ing.cost || 0), 0);
    return sum > 0 ? sum : null;
  }, [priceData]);

  const hasAnyPrice = priceData.some(ing => ing.cost !== null);

  const startTimer = (minutes: number) => {
    Alert.alert(
      '🕔 Timer',
      t('recipeDetail.timer.started').replace('{{minutes}}', String(minutes))
    );
  };

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

  const defaultHero = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800';

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
            source={{ uri: heroImageUrl || defaultHero }}
            style={styles.heroImage}
            resizeMode="cover"
          >
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
                {/* Mode Toggle */}
                <View style={styles.modeToggleRow}>
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

                {/* Servings Mode — compact single row */}
                {mode === 'servings' && (
                  <View style={styles.servingsCompactRow}>
                    {/* Left: total weight */}
                    <View style={styles.servingsCompactSide}>
                      <Text style={styles.servingsCompactValue}>{displayValues.totalWeight}g</Text>
                      <Text style={styles.servingsCompactLabel}>{language === 'bg' ? 'общо' : 'total'}</Text>
                    </View>
                    {/* Center: stepper */}
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
                    {/* Right: per serving weight */}
                    <View style={[styles.servingsCompactSide, { alignItems: 'flex-end' }]}>
                      <Text style={styles.servingsCompactValue}>{displayValues.portionWeight}g</Text>
                      <Text style={styles.servingsCompactLabel}>{language === 'bg' ? 'на порция' : 'per serving'}</Text>
                    </View>
                  </View>
                )}

                {/* Price Mode — summary only in card */}
                {mode === 'price' && (
                  <View style={styles.priceSummaryRow}>
                    <View style={styles.priceSummaryItem}>
                      <Text style={styles.priceSummaryValue}>
                        {totalCost !== null ? formatPrice(totalCost, currency) : '—'}
                      </Text>
                      <Text style={styles.controlLabel}>{t('recipeDetail.cost.total')}</Text>
                    </View>
                    <View style={styles.priceSummaryDivider} />
                    <View style={styles.priceSummaryItem}>
                      <Text style={styles.priceSummaryValue}>
                        {totalCost !== null ? formatPrice(totalCost / selectedServings, currency) : '—'}
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
              {/* Dessert Type */}
              {dessertTypeName ? (
                <View style={styles.introInfoCard}>
                  <Text style={styles.introInfoEmoji}>🍰</Text>
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

              {/* Pan info */}
              {panInfoStr && (
                <View style={styles.introInfoCard}>
                  <Text style={styles.introInfoEmoji}>📏</Text>
                  <View style={styles.introInfoContent}>
                    <Text style={styles.introInfoLabel}>{t('panPicker.title')}</Text>
                    <Text style={styles.introInfoValue}>
                      {panInfoStr} · {selectedServings} {t('panPicker.servings')}
                    </Text>
                  </View>
                </View>
              )}

              {/* Equipment */}
              {introData.uniqueEquipment.length > 0 && (
                <View style={styles.introInfoCard}>
                  <Text style={styles.introInfoEmoji}>🔧</Text>
                  <View style={styles.introInfoContent}>
                    <Text style={styles.introInfoLabel}>{t('recipeDetail.intro.equipment')}</Text>
                    <Text style={styles.introInfoValue}>{introData.uniqueEquipment.join(', ')}</Text>
                  </View>
                </View>
              )}

              {/* BLAGO logo divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Image
                  source={require('../assets/Logo-Blago.png')}
                  style={styles.blagoLogo}
                  resizeMode="contain"
                />
                <View style={styles.dividerLine} />
              </View>

              {/* Intro text */}
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
                            {totalCost !== null ? formatPrice(totalCost, currency) : '—'}
                          </Text>
                          <Text style={[styles.priceTotalValue, { fontSize: 13, color: Colors.text.secondary }]}>
                            {totalCost !== null ? formatPrice(totalCost / selectedServings, currency) : '—'}
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
                            <Text style={styles.categoryLabel}>{component.roleName}</Text>
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
            <View>
              {/* Controls Row */}
              <View style={styles.stepsControlsRow}>
                {/* Text / Gallery toggle */}
                <View style={styles.viewToggle}>
                  <TouchableOpacity
                    onPress={() => setViewMode('text')}
                    style={[styles.viewToggleBtnLeft, viewMode === 'text' && styles.viewToggleBtnActive]}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={14}
                      color={viewMode === 'text' ? Colors.primary.main : Colors.text.secondary}
                    />
                    <Text style={[styles.viewToggleBtnText, {
                      color: viewMode === 'text' ? Colors.primary.main : Colors.text.secondary,
                    }]}>
                      {t('recipeDetail.views.text')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setViewMode('gallery')}
                    style={[styles.viewToggleBtnRight, viewMode === 'gallery' && styles.viewToggleBtnActive]}
                  >
                    <Ionicons
                      name="images-outline"
                      size={14}
                      color={viewMode === 'gallery' ? Colors.primary.main : Colors.text.secondary}
                    />
                    <Text style={[styles.viewToggleBtnText, {
                      color: viewMode === 'gallery' ? Colors.primary.main : Colors.text.secondary,
                    }]}>
                      {t('recipeDetail.views.gallery')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Timer toggle */}
                <TouchableOpacity
                  onPress={() => setTimerEnabled(prev => !prev)}
                  style={[styles.timerToggle, timerEnabled && styles.timerToggleActive]}
                >
                  <Ionicons
                    name="timer-outline"
                    size={14}
                    color={timerEnabled ? Colors.text.inverse : Colors.text.secondary}
                  />
                  <Text style={[styles.timerToggleText, {
                    color: timerEnabled ? Colors.text.inverse : Colors.text.secondary,
                  }]}>
                    {timerEnabled ? 'ON' : 'OFF'}
                  </Text>
                </TouchableOpacity>
              </View>

              {steps.length > 0 ? (
                <View>
                  {components.map(component => {
                    const compSteps = steps.filter(s => s.componentId === component.id);
                    const compIngredients = scaledIngredients.filter(
                      ing => ing.componentId === component.id
                    );
                    if (compSteps.length === 0) return null;
                    return (
                      <View key={component.id} style={styles.stepGroup}>
                        <Text style={styles.categoryLabel}>{component.roleName}</Text>

                        {/* Gallery mode: horizontal ingredient list */}
                        {viewMode === 'gallery' && compIngredients.length > 0 && (
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.galleryIngredients}
                            contentContainerStyle={styles.galleryIngredientsContent}
                          >
                            {compIngredients.map(ing => (
                              <View key={ing.id} style={styles.galleryIngredientItem}>
                                {ing.imageUrl ? (
                                  <Image
                                    source={{ uri: ing.imageUrl }}
                                    style={styles.galleryIngredientImage}
                                    resizeMode="cover"
                                  />
                                ) : (
                                  <View style={styles.galleryIngredientFallback}>
                                    <Text style={styles.galleryIngredientEmoji}>🥄</Text>
                                  </View>
                                )}
                                <Text style={styles.galleryIngredientQty} numberOfLines={1}>
                                  {ing.quantity} {ing.displayUnit}
                                </Text>
                                <Text style={styles.galleryIngredientName} numberOfLines={2}>
                                  {ing.name}
                                </Text>
                              </View>
                            ))}
                          </ScrollView>
                        )}

                        {/* Steps */}
                        {compSteps.map(step => {
                          if (!step.description && !step.imageUrl) return null;
                          return (
                            <View key={step.id} style={styles.stepItem}>
                              {viewMode === 'text' ? (
                                <View>
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
                              ) : (
                                <View>
                                  {step.imageUrl ? (
                                    <View>
                                      <View style={styles.stepRowGallery}>
                                        <View style={styles.stepCircleSmall}>
                                          <Text style={styles.stepCircleText}>{step.stepNumber}</Text>
                                        </View>
                                        <Text style={styles.stepLabelGallery}>
                                          {t('recipeDetail.instructions.step')} {step.stepNumber}
                                        </Text>
                                      </View>
                                      <Image
                                        source={{ uri: step.imageUrl }}
                                        style={styles.stepImage}
                                        resizeMode="cover"
                                      />
                                    </View>
                                  ) : step.description ? (
                                    <View style={styles.stepRowText}>
                                      <View style={[styles.stepCircleSmall, { backgroundColor: Colors.secondary.main }]}>
                                        <Text style={styles.stepCircleText}>{step.stepNumber}</Text>
                                      </View>
                                      <Text style={styles.stepDescriptionGallery}>{step.description}</Text>
                                    </View>
                                  ) : null}
                                  {step.durationMinutes && step.durationMinutes > 0 && (
                                    <TouchableOpacity
                                      onPress={() => startTimer(step.durationMinutes!)}
                                      style={styles.timerBtn}
                                    >
                                      <Ionicons name="timer-outline" size={14} color={Colors.text.inverse} />
                                      <Text style={styles.timerBtnText}>
                                        {step.durationMinutes} {language === 'bg' ? 'мин' : 'min'}
                                      </Text>
                                    </TouchableOpacity>
                                  )}
                                </View>
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

              {/* Assembly section */}
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

          {/* NUTRITION Tab */}
          {activeTab === 'nutrition' && (
            <View>
              <Text style={styles.nutritionTabHeader}>
                {t('recipeDetail.nutrition.perServing')}
              </Text>
              {[
                { label: t('recipeDetail.nutrition.calories'), value: `${displayValues.calories} kcal`, highlight: false },
                { label: t('recipeDetail.nutrition.protein'), value: `${displayValues.protein} g`, highlight: false },
                { label: t('recipeDetail.nutrition.fat'), value: `${displayValues.fat} g`, highlight: false },
                { label: t('recipeDetail.nutrition.carbs'), value: `${displayValues.carbs} g`, highlight: false },
                { label: t('recipeDetail.nutrition.netCarbs'), value: `${displayValues.netCarbs} g`, highlight: true },
              ].map((row, idx, arr) => (
                <View
                  key={row.label}
                  style={[styles.nutritionTabRow, idx < arr.length - 1 && styles.nutritionTabRowBorder]}
                >
                  <Text style={styles.nutritionTabLabel}>{row.label}</Text>
                  <Text style={[styles.nutritionTabValue, row.highlight && { color: Colors.primary.main }]}>
                    {row.value}
                  </Text>
                </View>
              ))}
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
  stepsControlsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  viewToggle: {
    flexDirection: 'row',
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.secondary.main,
    borderRadius: BorderRadius.lg,
  },
  viewToggleBtnLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopLeftRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.lg,
  },
  viewToggleBtnRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopRightRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
  },
  viewToggleBtnActive: {
    backgroundColor: Colors.background.secondary,
  },
  viewToggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  timerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.secondary.main,
    borderRadius: BorderRadius.lg,
  },
  timerToggleActive: {
    backgroundColor: Colors.secondary.main,
  },
  timerToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
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
  stepRowGallery: {
    flexDirection: 'row',
    alignItems: 'center',
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
  stepCircleSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
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
  stepDescriptionGallery: {
    flex: 1,
    lineHeight: 24,
    color: Colors.text.secondary,
    fontSize: 13,
  },
  stepLabelGallery: {
    fontWeight: '600',
    color: Colors.text.primary,
    fontSize: 13,
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

  // Gallery ingredients
  galleryIngredients: {
    marginBottom: 24,
  },
  galleryIngredientsContent: {
    paddingRight: 16,
  },
  galleryIngredientItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  galleryIngredientImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  galleryIngredientFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    backgroundColor: Colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryIngredientEmoji: {
    fontSize: 24,
  },
  galleryIngredientQty: {
    fontSize: 11,
    color: Colors.text.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  galleryIngredientName: {
    fontSize: 9,
    color: Colors.text.secondary,
    textAlign: 'center',
  },

  // Nutrition tab
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
});
