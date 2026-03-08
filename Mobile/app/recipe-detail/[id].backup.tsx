// ===========================================================
// Recipe Detail Screen - Blago Design
// Hybrid: Gingerbread nutrition + Cupcake clean tabs + Blago branding
// ===========================================================
import { useState, useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert, 
  ImageBackground,
  Dimensions,
  Image
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { 
  ChevronLeft, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Heart, 
  Share2
} from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useShoppingListStore } from '../../store/useShoppingListStore';
import { UserRecipe, BaseRecipe } from '../../../shared/types';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.75; // Extra large hero image

const COLORS = {
  primary: '#A80048', // Blago primary - deep pink-red
  secondary: '#B2AC88', // Blago secondary - warm beige-green  
  text: '#333333', // Dark gray for text
  white: '#FFFFFF',
  black: '#000000',
  gray: '#666666',
  lightGray: '#F5F5F5',
};

// Blago SVG Logo as base64
const BLAGO_LOGO = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMwIDVMMzUgMjBIMjVMMzAgNVoiIGZpbGw9IiNBODAwNDgiLz4KPHBhdGggZD0iTTMwIDU1TDI1IDQwSDM1TDMwIDU1WiIgZmlsbD0iI0E4MDA0OCIvPgo8cGF0aCBkPSJNNSAzMEwyMCAyNVYzNUw1IDMwWiIgZmlsbD0iI0E4MDA0OCIvPgo8cGF0aCBkPSJNNTUgMzBMNDAgMzVWMjVMNTUgMzBaIiBmaWxsPSIjQTgwMDQ4Ii8+CjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjE1IiBmaWxsPSIjQjJBQzg4Ii8+CjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjgiIGZpbGw9IiNBODAwNDgiLz4KPC9zdmc+Cg==';

type DisplayMode = 'servings' | 'quantity';
type ActiveTab = 'intro' | 'ingredients' | 'steps' | 'nutrition';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const addRecipeIngredients = useShoppingListStore((state) => state.addRecipeIngredients);

  // UI State
  const [mode, setMode] = useState<DisplayMode>('servings');
  const [servings, setServings] = useState(12);
  const [multiplier, setMultiplier] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('intro');

  // Fetch recipe with all related data
  const { data: recipe, isLoading, error } = useQuery({
    queryKey: ['userRecipe', id],
    queryFn: async () => {
      const { data: recipeData, error: recipeError } = await supabase
        .from('user_recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (recipeError) throw recipeError;

      const { data: dessertType } = await supabase
        .from('dessert_types')
        .select('*')
        .eq('id', recipeData.dessert_type_id)
        .single();

      const baseRecipeIds = recipeData.selected_components.map((c: any) => c.base_recipe_id);
      const { data: baseRecipes } = await supabase
        .from('base_recipes')
        .select('*')
        .in('id', baseRecipeIds);

      const sortedBaseRecipes = baseRecipes?.sort((a, b) => {
        const aComponent = recipeData.selected_components.find((c: any) => c.base_recipe_id === a.id);
        const bComponent = recipeData.selected_components.find((c: any) => c.base_recipe_id === b.id);
        return (aComponent?.recipe_role_id || 0) - (bComponent?.recipe_role_id || 0);
      }) || [];

      return {
        ...recipeData,
        dessert_type: dessertType,
        base_recipes: sortedBaseRecipes,
      } as UserRecipe & { base_recipes: BaseRecipe[] };
    },
    enabled: !!id,
  });
  const { data: ingredients } = useQuery({
  queryKey: ['recipeIngredients', recipe?.base_recipes.map(br => br.id)],
  queryFn: async () => {
    if (!recipe) return [];
    
    const baseRecipeIds = recipe.base_recipes.map(br => br.id);
    const { data, error } = await supabase
      .from('recipe_ingredients')
      .select(`
        *,
        ingredient:ingredients_database(
          id, name_en, name_bg
        )
      `)
      .in('recipe_id', baseRecipeIds)
      .order('recipe_id')
      .order('order_index');
    
    if (error) throw error;
    return data || [];
  },
  enabled: !!recipe,
});

  // Sync servings when multiplier changes in quantity mode
  useEffect(() => {
    if (!baseValues || mode !== 'quantity') return;
    
    // In quantity mode, update servings based on multiplier
    setServings(Math.round(baseValues.servings * multiplier));
  }, [multiplier, mode, baseValues]);

  const baseValues = useMemo(() => {
    if (!recipe) return null;

    const totalNutrition = recipe.base_recipes.reduce((acc, br) => ({
      calories: acc.calories + (br.total_calories || 0),
      fat: acc.fat + (br.total_fat || 0),
      protein: acc.protein + (br.total_protein || 0),
      carbs: acc.carbs + (br.total_carbs || 0),
      netCarbs: acc.netCarbs + (br.total_net_carbs || 0),
      weight: acc.weight + (br.total_weight_grams || 0),
    }), { calories: 0, fat: 0, protein: 0, carbs: 0, netCarbs: 0, weight: 0 });

    return {
      weight: totalNutrition.weight,
      servings: recipe.total_servings,
      calories: totalNutrition.calories / recipe.total_servings,
      fat: totalNutrition.fat / recipe.total_servings,
      protein: totalNutrition.protein / recipe.total_servings,
      carbs: totalNutrition.carbs / recipe.total_servings,
      netCarbs: totalNutrition.netCarbs / recipe.total_servings,
    };
  }, [recipe]);

  const displayValues = useMemo(() => {
    if (!baseValues) return null;

    // Total weight is determined by multiplier ONLY (not by servings)
    const totalWeight = Math.round(baseValues.weight * multiplier);
    
    // Portion weight = total weight divided by servings
    const portionWeight = Math.round(totalWeight / servings);

    // Nutrition is always PER PORTION (based on servings, not multiplier)
    const nutritionMultiplier = baseValues.servings / servings;

    return {
      totalWeight: totalWeight,
      portionWeight: portionWeight,
      servingsCount: servings,
      calories: Math.round(baseValues.calories * nutritionMultiplier),
      fat: Math.round(baseValues.fat * nutritionMultiplier * 10) / 10,
      protein: Math.round(baseValues.protein * nutritionMultiplier * 10) / 10,
      carbs: Math.round(baseValues.carbs * nutritionMultiplier * 10) / 10,
      netCarbs: Math.round(baseValues.netCarbs * nutritionMultiplier * 10) / 10,
    };
  }, [servings, multiplier, baseValues]);

  const scaledIngredients = useMemo(() => {
  if (!ingredients || ingredients.length === 0) return [];
  
  return ingredients.map(ing => {
    // Scale quantity based on multiplier
    const scaledQty = ing.quantity * multiplier;
    
    // Get ingredient name in Bulgarian (fallback to English, then legacy name)
    const displayName = ing.ingredient?.name_bg || ing.ingredient?.name_en || ing.ingredient_name;
    
    return {
      id: ing.id,
      name: displayName,
      quantity: Math.round(scaledQty * 10) / 10, // Round to 1 decimal
      unit: ing.unit,
      recipe_id: ing.recipe_id
    };
  });
}, [ingredients, multiplier]);

  const handleModeSwitch = (newMode: DisplayMode) => {
    setMode(newMode);
    // Don't reset multiplier/servings when switching modes
    // This keeps them in sync
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Text className="text-6xl mb-4">😕</Text>
        <Text className="text-xl font-bold mb-2" style={{ color: COLORS.text }}>Грешка при зареждане</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="rounded-xl py-3 px-6 mt-4"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Text className="text-white font-bold">Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const recipeName = recipe.name || `Моя ${recipe.dessert_type?.name || 'Десерт'}`;
  const allIngredients = recipe.base_recipes
    .map(br => br.ingredients_text_bg || br.ingredients_text_en)
    .filter(Boolean)
    .join('\n\n');

  const decorationRecipe = recipe.base_recipes.find(br => {
    const component = recipe.selected_components.find((c: any) => c.base_recipe_id === br.id);
    return component?.recipe_role_id === 4;
  });
  const heroImage = decorationRecipe?.image_url || recipe.base_recipes[0]?.image_url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="flex-1 bg-white">
        {/* Fixed Header */}
        <View className="absolute top-0 left-0 right-0 z-50 bg-white border-b border-gray-100" style={{ paddingTop: 48 }}>
          <View className="flex-row justify-between items-center px-5 py-3">
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={28} color={COLORS.text} />
            </TouchableOpacity>
            
            <Text className="text-lg font-bold flex-1 text-center mx-4" numberOfLines={1} style={{ color: COLORS.text }}>
              {recipeName}
            </Text>
            
            <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
              <Heart 
                size={28} 
                color={isFavorite ? COLORS.primary : COLORS.text}
                fill={isFavorite ? COLORS.primary : 'none'}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView>
          {/* Hero Section */}
          <View style={{ height: HERO_HEIGHT, marginTop: 88 }}>
            <ImageBackground
              source={{ uri: heroImage }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            >
              {/* Nutrition Overlay - Very compact */}
              {displayValues && (
                <View className="absolute top-4 left-4 right-4">
                  <View className="bg-white/90 rounded-xl py-2 px-2">
                    <View className="flex-row justify-around">
                      <View className="items-center flex-1">
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.text }}>{displayValues.calories}</Text>
                        <Text style={{ fontSize: 8, color: COLORS.gray, marginTop: 2 }}>kcal</Text>
                      </View>
                      <View className="items-center flex-1">
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.text }}>{displayValues.protein}g</Text>
                        <Text style={{ fontSize: 8, color: COLORS.gray, marginTop: 2 }}>protein</Text>
                      </View>
                      <View className="items-center flex-1">
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.text }}>{displayValues.fat}g</Text>
                        <Text style={{ fontSize: 8, color: COLORS.gray, marginTop: 2 }}>fat</Text>
                      </View>
                      <View className="items-center flex-1">
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.primary }}>{displayValues.netCarbs}g</Text>
                        <Text style={{ fontSize: 8, color: COLORS.gray, marginTop: 2 }}>carbs</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Mode Switcher + Controls on Hero - Very compact */}
              <View className="absolute bottom-4 left-4 right-4">
                <View className="bg-white/95 rounded-xl py-2 px-3 border" style={{ borderColor: COLORS.secondary }}>
                  {/* Mode Switcher - Very small */}
                  <View className="flex-row gap-1 bg-gray-100 p-0.5 rounded-full mb-2">
                    <TouchableOpacity
                      onPress={() => handleModeSwitch('servings')}
                      className={`flex-1 py-1 px-2 rounded-full ${mode === 'servings' ? 'bg-white' : ''}`}
                    >
                      <Text className="text-center font-semibold uppercase" style={{ fontSize: 9, color: mode === 'servings' ? COLORS.text : COLORS.gray }}>
                        ПОРЦИИ
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleModeSwitch('quantity')}
                      className={`flex-1 py-1 px-2 rounded-full ${mode === 'quantity' ? 'bg-white' : ''}`}
                    >
                      <Text className="text-center font-semibold uppercase" style={{ fontSize: 9, color: mode === 'quantity' ? COLORS.text : COLORS.gray }}>
                        КОЛИЧЕСТВО
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {displayValues && mode === 'servings' && (
                    /* Servings Mode - Everything in ONE ROW - Very compact */
                    <View className="flex-row items-center justify-between">
                      {/* Total Weight */}
                      <View>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.text }}>{displayValues.totalWeight}g</Text>
                        <Text style={{ fontSize: 8, color: COLORS.gray }}>ОБЩО</Text>
                      </View>

                      {/* Servings Controls */}
                      <View className="flex-row items-center gap-1.5">
                        <TouchableOpacity
                          onPress={() => setServings(prev => Math.max(1, prev - 1))}
                          className="w-7 h-7 rounded-full border items-center justify-center"
                          style={{ borderColor: COLORS.secondary, backgroundColor: COLORS.white }}
                        >
                          <Minus size={12} color={COLORS.gray} />
                        </TouchableOpacity>
                        
                        <View className="items-center px-1.5">
                          <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.text }}>{displayValues.servingsCount}</Text>
                          <Text style={{ fontSize: 8, color: COLORS.gray }}>ПОРЦИИ</Text>
                        </View>
                        
                        <TouchableOpacity
                          onPress={() => setServings(prev => prev + 1)}
                          className="w-7 h-7 rounded-full border items-center justify-center"
                          style={{ borderColor: COLORS.secondary, backgroundColor: COLORS.white }}
                        >
                          <Plus size={12} color={COLORS.gray} />
                        </TouchableOpacity>
                      </View>

                      {/* Portion Weight */}
                      <View className="items-end">
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.text }}>{displayValues.portionWeight}g</Text>
                        <Text style={{ fontSize: 8, color: COLORS.gray }}>ПОРЦИЯ</Text>
                      </View>
                    </View>
                  )}

                  {displayValues && mode === 'quantity' && (
                    /* Quantity Mode - 2 rows but SAME total height as servings */
                    <View>
                      {/* Row 1: Multiplier Buttons */}
                      <View className="flex-row justify-center gap-1 mb-1">
                        {[0.33, 0.5, 1, 1.5, 2, 5].map(mult => (
                          <TouchableOpacity
                            key={mult}
                            onPress={() => setMultiplier(mult)}
                            className="px-2 py-1 rounded-full border"
                            style={{
                              backgroundColor: multiplier === mult ? COLORS.primary : COLORS.white,
                              borderColor: multiplier === mult ? COLORS.primary : COLORS.secondary,
                            }}
                          >
                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: multiplier === mult ? COLORS.white : COLORS.text }}>
                              {mult < 1 ? `÷${Math.round(1/mult)}` : `x${mult}`}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      {/* Row 2: Total Weight - Centered */}
                      <View className="items-center">
                        <Text style={{ fontSize: 11, color: COLORS.gray }}>Общо тегло: <Text style={{ fontWeight: 'bold', color: COLORS.text }}>{displayValues.totalWeight}g</Text></Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </ImageBackground>
          </View>

          {/* Sticky Tabs */}
          <View className="bg-white border-b border-gray-200">
            <View className="flex-row">
              {[
                { key: 'intro', label: 'УВОД' },
                { key: 'ingredients', label: 'СЪСТАВКИ' },
                { key: 'steps', label: 'СТЪПКИ' },
                { key: 'nutrition', label: 'ХРАН. СТОЙ.' }
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key as ActiveTab)}
                  className="flex-1 py-4"
                  style={{
                    borderBottomWidth: activeTab === tab.key ? 3 : 0,
                    borderBottomColor: COLORS.primary,
                  }}
                >
                  <Text
                    className="text-center font-semibold text-xs uppercase tracking-wide"
                    style={{
                      color: activeTab === tab.key ? COLORS.primary : COLORS.gray,
                    }}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Content Area */}
          <View className="bg-white px-6 py-6">
            {/* INTRO Tab */}
            {activeTab === 'intro' && (
              <View>
                {/* Recipe Type Only */}
                <View className="mb-6">
                  <Text className="text-base font-bold mb-2" style={{ color: COLORS.text }}>ТИП:</Text>
                  <Text style={{ color: COLORS.gray }}>{recipe.dessert_type?.name || recipe.dessert_type?.name_en || 'Десерт'}</Text>
                </View>

                {/* Divider with logo */}
                <View className="flex-row justify-center items-center my-6">
                  <View className="h-px flex-1" style={{ backgroundColor: COLORS.secondary }} />
                  <Image 
                    source={{ uri: BLAGO_LOGO }}
                    style={{ width: 32, height: 32, marginHorizontal: 16 }}
                    resizeMode="contain"
                  />
                  <View className="h-px flex-1" style={{ backgroundColor: COLORS.secondary }} />
                </View>

                {/* Description */}
                <Text className="text-xl font-bold mb-3" style={{ color: COLORS.text }}>{recipeName}</Text>
                <Text className="leading-6" style={{ color: COLORS.gray }}>
                  Този {recipe.dessert_type?.name?.toLowerCase() || 'десерт'} е специално приготвен с кето-приятелски съставки, които ви позволяват да се насладите на вкусен десерт без излишни въглехидрати.
                </Text>
              </View>
            )}

            {/* INGREDIENTS Tab */}
          {activeTab === 'ingredients' && (
  <View>
    <TouchableOpacity
      onPress={() => Alert.alert('Успех! 🛒', 'Продуктите са добавени към списъка')}
      className="rounded-xl py-4 flex-row items-center justify-center mb-6"
      style={{ backgroundColor: '#4CAF50' }}
    >
      <ShoppingCart size={20} color={COLORS.white} />
      <Text className="text-white font-bold ml-2 text-base">
        Добави към списъка за пазаруване
      </Text>
    </TouchableOpacity>

    <View className="flex-row justify-center items-center mb-6">
      <View className="h-px flex-1" style={{ backgroundColor: COLORS.secondary }} />
      <Image 
        source={{ uri: BLAGO_LOGO }}
        style={{ width: 32, height: 32, marginHorizontal: 16 }}
        resizeMode="contain"
      />
      <View className="h-px flex-1" style={{ backgroundColor: COLORS.secondary }} />
    </View>

    <Text className="text-2xl font-bold mb-6" style={{ color: COLORS.text }}>{recipeName}</Text>

    {scaledIngredients.length > 0 ? (
      <View>
        {/* Group ingredients by recipe */}
        {recipe.base_recipes.map((baseRecipe) => {
          const recipeIngredients = scaledIngredients.filter(ing => ing.recipe_id === baseRecipe.id);
          if (recipeIngredients.length === 0) return null;
          
          return (
            <View key={baseRecipe.id} className="mb-6">
              {/* Recipe component name */}
              <Text className="text-lg font-bold mb-3" style={{ color: COLORS.text }}>
                {baseRecipe.name_bg || baseRecipe.name || baseRecipe.name_en}
              </Text>
              
              {/* Ingredients list */}
              <View className="space-y-3">
                {recipeIngredients.map((ing) => (
                  <View key={ing.id} className="flex-row items-start">
                    <Text className="text-xl mr-3" style={{ color: COLORS.primary }}>♥</Text>
                    <Text className="flex-1 text-base leading-7" style={{ color: COLORS.text }}>
                      {ing.quantity} {ing.unit} {ing.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    ) : (
      // Fallback to text ingredients if structured data not available
      allIngredients ? (
        <View className="space-y-4">
          {allIngredients.split('\n').map((line, idx) => {
            if (!line.trim()) return null;
            
            return (
              <View key={idx} className="flex-row items-start">
                <Text className="text-xl mr-3" style={{ color: COLORS.primary }}>♥</Text>
                <Text className="flex-1 text-base leading-7" style={{ color: COLORS.text }}>{line}</Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text className="text-center py-8" style={{ color: COLORS.gray }}>Няма информация за съставки</Text>
      )
    )}
  </View>
)}

            {/* STEPS Tab */}
            {activeTab === 'steps' && (
              <View>
                <View className="flex-row justify-center items-center mb-6">
                  <View className="h-px flex-1" style={{ backgroundColor: COLORS.secondary }} />
                  <Image 
                    source={{ uri: BLAGO_LOGO }}
                    style={{ width: 32, height: 32, marginHorizontal: 16 }}
                    resizeMode="contain"
                  />
                  <View className="h-px flex-1" style={{ backgroundColor: COLORS.secondary }} />
                </View>

                <Text className="text-2xl font-bold mb-6" style={{ color: COLORS.text }}>{recipeName}</Text>

                {recipe.base_recipes.some(br => br.description_bg || br.description) ? (
                  <View className="space-y-6">
                    {recipe.base_recipes.map((br, idx) => {
                      const text = br.description_bg || br.description || br.description_en;
                      if (!text) return null;
                      return (
                        <View key={br.id}>
                          <Text className="text-lg font-bold mb-3" style={{ color: COLORS.text }}>
                            {br.name_bg || br.name || br.name_en}
                          </Text>
                          <Text className="leading-7" style={{ color: COLORS.gray }}>{text}</Text>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Text className="text-center py-8" style={{ color: COLORS.gray }}>Няма инструкции</Text>
                )}
              </View>
            )}

            {/* NUTRITION Tab */}
            {activeTab === 'nutrition' && displayValues && (
              <View>
                <View className="flex-row justify-center items-center mb-6">
                  <View className="h-px flex-1" style={{ backgroundColor: COLORS.secondary }} />
                  <Image 
                    source={{ uri: BLAGO_LOGO }}
                    style={{ width: 32, height: 32, marginHorizontal: 16 }}
                    resizeMode="contain"
                  />
                  <View className="h-px flex-1" style={{ backgroundColor: COLORS.secondary }} />
                </View>

                <Text className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>{recipeName}</Text>
                <Text className="mb-8" style={{ color: COLORS.gray }}>Хранителни стойности на порция</Text>

                <View className="space-y-4">
                  <View className="flex-row justify-between py-4 border-b border-gray-200">
                    <Text className="text-base" style={{ color: COLORS.gray }}>Калории</Text>
                    <Text className="text-base font-bold" style={{ color: COLORS.text }}>{displayValues.calories} kcal</Text>
                  </View>
                  <View className="flex-row justify-between py-4 border-b border-gray-200">
                    <Text className="text-base" style={{ color: COLORS.gray }}>Протеини</Text>
                    <Text className="text-base font-bold" style={{ color: COLORS.text }}>{displayValues.protein} g</Text>
                  </View>
                  <View className="flex-row justify-between py-4 border-b border-gray-200">
                    <Text className="text-base" style={{ color: COLORS.gray }}>Мазнини</Text>
                    <Text className="text-base font-bold" style={{ color: COLORS.text }}>{displayValues.fat} g</Text>
                  </View>
                  <View className="flex-row justify-between py-4 border-b border-gray-200">
                    <Text className="text-base" style={{ color: COLORS.gray }}>Въглехидрати</Text>
                    <Text className="text-base font-bold" style={{ color: COLORS.text }}>{displayValues.carbs} g</Text>
                  </View>
                  <View className="flex-row justify-between py-4">
                    <Text className="text-base" style={{ color: COLORS.gray }}>Нетни въглехидрати</Text>
                    <Text className="text-base font-bold" style={{ color: COLORS.primary }}>{displayValues.netCarbs} g</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </>
  );
}
