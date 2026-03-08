// ===========================================================
// Recipe Detail Screen - Product-Focused Design v2
// Fixed spacing and text visibility
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
  Dimensions 
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// wrappers for common icons
const ChevronLeft = (props: any) => <Ionicons name="chevron-back" {...props} />;
const Plus = (props: any) => <Ionicons name="add" {...props} />;
const Minus = (props: any) => <Ionicons name="remove" {...props} />;
const ShoppingCart = (props: any) => <Ionicons name="cart" {...props} />;
const Heart = (props: any) => <Ionicons name="heart-outline" {...props} />;
const Share2 = (props: any) => <Ionicons name="share-outline" {...props} />;
const ChevronDown = (props: any) => <Ionicons name="chevron-down" {...props} />;
const ChevronUp = (props: any) => <Ionicons name="chevron-up" {...props} />;
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useShoppingListStore } from '../../store/useShoppingListStore';
import { UserRecipe, BaseRecipe } from '../../../shared/types';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.70;

// centralized color definitions are in constants/Colors.ts
// we no longer need the local COLORS object


type DisplayMode = 'servings' | 'quantity';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const addRecipeIngredients = useShoppingListStore((state) => state.addRecipeIngredients);

  // UI State
  const [mode, setMode] = useState<DisplayMode>('servings');
  const [servings, setServings] = useState(12);
  const [multiplier, setMultiplier] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Expandable sections
  const [ingredientsExpanded, setIngredientsExpanded] = useState(false);
  const [stepsExpanded, setStepsExpanded] = useState(false);
  const [assemblyExpanded, setAssemblyExpanded] = useState(false);

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

  // Initialize servings from recipe
  useEffect(() => {
    if (recipe?.total_servings) {
      setServings(recipe.total_servings);
    }
  }, [recipe?.total_servings]);

  // Calculate base values from recipe
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

  // Calculate display values based on mode
  const displayValues = useMemo(() => {
    if (!baseValues) return null;

    if (mode === 'servings') {
      const nutritionMultiplier = baseValues.servings / servings;
      return {
        totalWeight: baseValues.weight,
        portionWeight: Math.round(baseValues.weight / servings),
        servingsCount: servings,
        calories: Math.round(baseValues.calories * nutritionMultiplier),
        fat: Math.round(baseValues.fat * nutritionMultiplier * 10) / 10,
        protein: Math.round(baseValues.protein * nutritionMultiplier * 10) / 10,
        carbs: Math.round(baseValues.carbs * nutritionMultiplier * 10) / 10,
        netCarbs: Math.round(baseValues.netCarbs * nutritionMultiplier * 10) / 10,
      };
    } else {
      return {
        totalWeight: Math.round(baseValues.weight * multiplier),
        portionWeight: Math.round(baseValues.weight / baseValues.servings),
        servingsCount: Math.round(baseValues.servings * multiplier),
        calories: Math.round(baseValues.calories),
        fat: Math.round(baseValues.fat * 10) / 10,
        protein: Math.round(baseValues.protein * 10) / 10,
        carbs: Math.round(baseValues.carbs * 10) / 10,
        netCarbs: Math.round(baseValues.netCarbs * 10) / 10,
      };
    }
  }, [mode, servings, multiplier, baseValues]);

  const handleModeSwitch = (newMode: DisplayMode) => {
    if (newMode === 'servings' && baseValues) {
      setServings(baseValues.servings);
      setMultiplier(1);
    } else {
      setMultiplier(1);
    }
    setMode(newMode);
  };

  const handleServingsChange = (delta: number) => {
    setServings(prev => Math.max(1, prev + delta));
  };

  const handleMultiplierChange = (mult: number) => {
    setMultiplier(mult);
  };

  const handleAddToShoppingList = () => {
    if (!recipe) return;
    Alert.alert('Успех! 🛒', 'Продуктите са добавени към списъка за пазаруване');
  };

  const handleShare = () => {
    Alert.alert('Споделяне', 'Функцията за споделяне скоро...');
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    Alert.alert(
      isFavorite ? 'Премахнато от любими' : 'Добавено в любими',
      isFavorite ? '💔' : '❤️'
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text className="text-gray-600 mt-4">Зареждане...</Text>
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Text className="text-6xl mb-4">😕</Text>
        <Text className="text-xl font-bold mb-2">Грешка при зареждане</Text>
        <Text className="text-gray-600 text-center mb-4">
          {error instanceof Error ? error.message : 'Рецептата не е намерена'}
        </Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="bg-blue-600 rounded-xl py-3 px-6"
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

  // Get image from decoration base recipe or first available
  const decorationRecipe = recipe.base_recipes.find(br => {
    const component = recipe.selected_components.find((c: any) => c.base_recipe_id === br.id);
    return component?.recipe_role_id === 4; // 4 = decoration
  });
  const heroImage = decorationRecipe?.image_url || recipe.base_recipes[0]?.image_url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="flex-1 bg-white">
        <ScrollView>
          {/* Hero Section with Product Image */}
          <View style={{ height: HERO_HEIGHT, position: 'relative' }}>
            <ImageBackground
              source={{ uri: heroImage }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            >
              {/* Subtle gradient for readability */}
              <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.2)']}
                locations={[0, 0.3, 1]}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              />

              {/* Top Action Buttons */}
              <View className="absolute top-12 left-0 right-0 flex-row justify-between items-center px-5">
                <TouchableOpacity 
                  onPress={() => router.back()}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderRadius: 20,
                    padding: 8,
                  }}
                >
                  <ChevronLeft size={24} color={Colors.text.primary} />
                </TouchableOpacity>

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={handleToggleFavorite}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderRadius: 20,
                      padding: 8,
                    }}
                  >
                    <Heart 
                      size={24} 
                      color={isFavorite ? Colors.nutrition.calories : Colors.text.primary}
                      fill={isFavorite ? Colors.nutrition.calories : 'none'}
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={handleShare}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderRadius: 20,
                      padding: 8,
                    }}
                  >
                    <Share2 size={24} color={Colors.text.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Recipe Title - Top */}
              <View className="absolute top-24 left-5 right-5">
                <Text 
                  className="text-white text-3xl font-bold text-center"
                  style={{
                    textShadowColor: 'rgba(0,0,0,0.8)',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 8,
                  }}
                >
                  {recipeName}
                </Text>
              </View>

              {/* Nutrition Info Bar - Below middle */}
              {displayValues && (
                <View
                  className="absolute left-5 right-5"
                  style={{ bottom: 155 }}
                >
                  <View 
                    className="rounded-2xl overflow-hidden"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                    }}
                  >
                    <View className="flex-row justify-around py-4 px-2">
                      <View className="items-center flex-1">
                        <Text className="text-gray-900 text-2xl font-bold">{displayValues.calories}</Text>
                        <Text className="text-gray-600 text-xs mt-1">kcal</Text>
                      </View>
                      <View className="items-center flex-1">
                        <Text className="text-gray-900 text-2xl font-bold">{displayValues.protein} g</Text>
                        <Text className="text-gray-600 text-xs mt-1">protein</Text>
                      </View>
                      <View className="items-center flex-1">
                        <Text className="text-gray-900 text-2xl font-bold">{displayValues.fat} g</Text>
                        <Text className="text-gray-600 text-xs mt-1">fat</Text>
                      </View>
                      <View className="items-center flex-1">
                        <Text className="text-[#5B7FFF] text-2xl font-bold">{displayValues.netCarbs} g</Text>
                        <Text className="text-gray-600 text-xs mt-1">carbs</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Control Panel - Bottom */}
              {displayValues && (
                <View
                  className="absolute left-5 right-5"
                  style={{ bottom: 20 }}
                >
                  <View 
                    className="rounded-3xl overflow-hidden"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.75)',
                    }}
                  >
                    <View className="p-4" style={{ gap: 14 }}>
                      {/* Mode Switcher */}
                      <View className="flex-row gap-2 bg-black/30 p-1 rounded-full">
                        <TouchableOpacity
                          onPress={() => handleModeSwitch('servings')}
                          className={`flex-1 py-2 px-3 rounded-full ${mode === 'servings' ? 'bg-white/25' : ''}`}
                        >
                          <Text className={`text-center text-sm font-semibold uppercase tracking-wide ${mode === 'servings' ? 'text-white' : 'text-white/60'}`}>
                            ПОРЦИИ
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleModeSwitch('quantity')}
                          className={`flex-1 py-2 px-3 rounded-full ${mode === 'quantity' ? 'bg-white/25' : ''}`}
                        >
                          <Text className={`text-center text-sm font-semibold uppercase tracking-wide ${mode === 'quantity' ? 'text-white' : 'text-white/60'}`}>
                            КОЛИЧЕСТВО
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Controls */}
                      {mode === 'servings' ? (
                        <View className="flex-row justify-between items-center">
                          <View className="items-start" style={{ width: 90 }}>
                            <Text className="text-white text-xl font-bold">{displayValues.totalWeight} g</Text>
                            <Text className="text-white/90 text-xs uppercase tracking-wide">ОБЩО ТЕГЛО</Text>
                          </View>
                          
                          <View className="flex-row items-center gap-4">
                            <TouchableOpacity
                              onPress={() => handleServingsChange(-1)}
                              className="w-11 h-11 rounded-full bg-white/20 border border-white/30 items-center justify-center"
                            >
                              <Minus size={24} color={Colors.text.inverse} />
                            </TouchableOpacity>
                            
                            <View className="items-center" style={{ minWidth: 60 }}>
                              <Text className="text-white text-3xl font-bold">{displayValues.servingsCount}</Text>
                              <Text className="text-white/90 text-xs uppercase tracking-wide">ПОРЦИИ</Text>
                            </View>
                            
                            <TouchableOpacity
                              onPress={() => handleServingsChange(1)}
                              className="w-11 h-11 rounded-full bg-white/20 border border-white/30 items-center justify-center"
                            >
                              <Plus size={24} color={Colors.text.inverse} />
                            </TouchableOpacity>
                          </View>

                          <View className="items-end" style={{ width: 90 }}>
                            <Text className="text-white text-xl font-bold">{displayValues.portionWeight} g</Text>
                            <Text className="text-white/90 text-xs uppercase tracking-wide text-right">НА ПОРЦИЯ</Text>
                          </View>
                        </View>
                      ) : (
                        <View className="flex-row flex-wrap justify-center gap-2">
                          {[0.5, 0.33, 1, 1.5, 2, 5].map(mult => (
                            <TouchableOpacity
                              key={mult}
                              onPress={() => handleMultiplierChange(mult)}
                              className={`px-4 py-2 rounded-full border ${
                                multiplier === mult 
                                  ? 'bg-[#5B7FFF] border-[#5B7FFF]' 
                                  : 'bg-white/20 border-white/30'
                              }`}
                            >
                              <Text className="text-white text-sm font-semibold">
                                {mult < 1 ? `÷${Math.round(1/mult)}` : `x${mult}`}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              )}
            </ImageBackground>
          </View>

          {/* Expandable Sections */}
          <View className="bg-white">
            {/* Ingredients Section */}
            <TouchableOpacity
              onPress={() => setIngredientsExpanded(!ingredientsExpanded)}
              className="border-b border-gray-200 px-6 py-5 flex-row justify-between items-center"
            >
              <Text className="text-lg font-bold text-gray-900">Съставки</Text>
              {ingredientsExpanded ? (
                <ChevronUp size={24} color="#666" />
              ) : (
                <ChevronDown size={24} color="#666" />
              )}
            </TouchableOpacity>
            
            {ingredientsExpanded && (
              <View className="px-6 py-4 bg-gray-50">
                <TouchableOpacity
                  onPress={handleAddToShoppingList}
                  className="bg-green-500 rounded-xl p-4 flex-row items-center justify-center mb-4"
                >
                  <ShoppingCart size={20} color={Colors.text.inverse} />
                  <Text className="text-white font-bold ml-2">
                    Добави към списъка за пазаруване
                  </Text>
                </TouchableOpacity>

                {allIngredients ? (
                  <View>
                    {allIngredients.split('\n').map((line, idx) => {
                      if (!line.trim()) return null;
                      const match = line.match(/^(\d+\.?\d*)\s*(g|ml|бр\.?|ч\.л\.?|с\.л\.?)?\s*(.+)/i);
                      const amount = match ? `${match[1]}${match[2] || ''}` : '';
                      const name = match ? match[3] : line;
                      
                      return (
                        <View key={idx} className="flex-row py-3 border-b border-gray-200">
                          <Text className="text-[#5B7FFF] font-bold w-24">{amount}</Text>
                          <Text className="flex-1 text-gray-800">{name}</Text>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Text className="text-gray-500 text-center py-4">Няма информация за съставки</Text>
                )}
              </View>
            )}

            {/* Steps Section */}
            <TouchableOpacity
              onPress={() => setStepsExpanded(!stepsExpanded)}
              className="border-b border-gray-200 px-6 py-5 flex-row justify-between items-center"
            >
              <Text className="text-lg font-bold text-gray-900">Начин на приготвяне</Text>
              {stepsExpanded ? (
                <ChevronUp size={24} color="#666" />
              ) : (
                <ChevronDown size={24} color="#666" />
              )}
            </TouchableOpacity>
            
            {stepsExpanded && (
              <View className="px-6 py-4 bg-gray-50">
                {recipe.base_recipes.some(br => br.description_bg || br.description) ? (
                  <View>
                    {recipe.base_recipes.map((br, idx) => {
                      const text = br.description_bg || br.description || br.description_en;
                      if (!text) return null;
                      return (
                        <View key={br.id} className="mb-4 bg-white rounded-xl p-4 border border-gray-200">
                          <Text className="text-sm font-bold text-gray-700 mb-2">
                            Стъпка {idx + 1}: {br.name_bg || br.name || br.name_en}
                          </Text>
                          <Text className="text-gray-800 leading-6">{text}</Text>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Text className="text-gray-500 text-center py-4">Няма инструкции</Text>
                )}
              </View>
            )}

            {/* Assembly Section */}
            <TouchableOpacity
              onPress={() => setAssemblyExpanded(!assemblyExpanded)}
              className="border-b border-gray-200 px-6 py-5 flex-row justify-between items-center"
            >
              <Text className="text-lg font-bold text-gray-900">Сглобяване</Text>
              {assemblyExpanded ? (
                <ChevronUp size={24} color="#666" />
              ) : (
                <ChevronDown size={24} color="#666" />
              )}
            </TouchableOpacity>
            
            {assemblyExpanded && (
              <View className="px-6 py-4 bg-gray-50">
                <View className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <Text className="text-blue-800 text-center">
                    📋 Инструкциите за сглобяване скоро ще бъдат налични
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </>
  );
}
