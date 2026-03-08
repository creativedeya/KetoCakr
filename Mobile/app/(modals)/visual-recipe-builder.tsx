// ===========================================================
// Visual Recipe Builder - Purple & Gold Theme
// ===========================================================
import { View, Text, ScrollView, TouchableOpacity, ImageBackground, Animated, TextInput, Alert, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { BorderRadius, Spacing } from '../../constants/Theme';

// simple wrappers for icons
const X = (props: any) => <Ionicons name="close" {...props} />;
const ChevronLeft = (props: any) => <Ionicons name="chevron-back" {...props} />;
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { DessertType, BaseRecipe } from '../../../shared/types';
import { useTranslation } from '../../constants/i18n';
import PanSizePicker from '../../components/PanSizePicker';
import { getPanByServings, BASE_PAN, BASE_SERVINGS } from '../../constants/BakingPans';
import { pickImage, uploadRecipeImage, updateRecipeImage } from '../../lib/imageUpload';

const PLACEHOLDER_USER_ID = '00000000-0000-0000-0000-000000000000';

export default function VisualRecipeBuilder() {
  const { t, language } = useTranslation();
  const [step, setStep] = useState<'dessert' | 'build' | 'finalize'>('dessert');
  const [selectedDessertType, setSelectedDessertType] = useState<DessertType | null>(null);
  const [selectedTab, setSelectedTab] = useState(1);
  const [selectedComponents, setSelectedComponents] = useState<{
    [key: number]: BaseRecipe | null;
  }>({
    1: null, 2: null, 3: null, 4: null,
  });
  const [selectedPanServings, setSelectedPanServings] = useState(BASE_SERVINGS);
  const [servings, setServings] = useState(BASE_SERVINGS);
  const [recipeName, setRecipeName] = useState('');
  const [introText, setIntroText] = useState('');
  const [builderImageUri, setBuilderImageUri] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const nutritionAnim = useRef(new Animated.Value(0)).current;

  const RECIPE_ROLES = [
    { id: 1, name: t('recipeBuilder.buildStep.roles.crust') },
    { id: 2, name: t('recipeBuilder.buildStep.roles.cream') },
    { id: 3, name: t('recipeBuilder.buildStep.roles.filling') },
    { id: 4, name: t('recipeBuilder.buildStep.roles.decoration') },
  ];

  // Fetch dessert types
  const { data: dessertTypes } = useQuery({
    queryKey: ['dessertTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dessert_types')
        .select('*')
        .order('id');
      if (error) throw error;
      return data as DessertType[];
    },
  });

  // Fetch base recipes
  const { data: baseRecipes } = useQuery({
    queryKey: ['baseRecipes', selectedDessertType?.id, selectedTab],
    queryFn: async () => {
      if (!selectedDessertType) return [];

      const { data, error } = await supabase
        .from('base_recipes')
        .select('*')
        .eq('recipe_role_id', selectedTab)
        .contains('compatible_dessert_types', [selectedDessertType.id]);

      if (error) throw error;
      return data as BaseRecipe[];
    },
    enabled: !!selectedDessertType && step === 'build',
  });

  // Derive scale factor from selected pan
  const selectedPan = getPanByServings(selectedPanServings);
  const scaleFactor = selectedPan ? selectedPan.scaleFactor / BASE_PAN.scaleFactor : 1;

  // Calculate nutrition per serving (with scaleFactor)
  const totalNutritionRaw = Object.values(selectedComponents).reduce(
    (acc, recipe) => {
      if (!recipe) return acc;
      return {
        calories: acc.calories + (recipe.total_calories || 0),
        protein: acc.protein + (recipe.total_protein || 0),
        fat: acc.fat + (recipe.total_fat || 0),
        carbs: acc.carbs + (recipe.total_carbs || 0),
        netCarbs: acc.netCarbs + (recipe.total_net_carbs || 0),
      };
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0, netCarbs: 0 }
  );

  const safeServings = selectedPanServings > 0 ? selectedPanServings : 1;
  const perServing = {
    calories: Math.round(totalNutritionRaw.calories * scaleFactor / safeServings),
    protein: Math.round(totalNutritionRaw.protein * scaleFactor / safeServings),
    fat: Math.round(totalNutritionRaw.fat * scaleFactor / safeServings),
    carbs: Math.round(totalNutritionRaw.carbs * scaleFactor / safeServings),
    netCarbs: Math.round(totalNutritionRaw.netCarbs * scaleFactor / safeServings),
  };

  useEffect(() => {
    Animated.spring(nutritionAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start(() => nutritionAnim.setValue(0));
  }, [perServing.calories]);

  const handleSelectDessert = (dessert: DessertType) => {
    setSelectedDessertType(dessert);
    setStep('build');
  };

  const handleSelectComponent = (recipe: BaseRecipe) => {
    setSelectedComponents((prev) => ({
      ...prev,
      [selectedTab]: prev[selectedTab]?.id === recipe.id ? null : recipe,
    }));
  };

  const handleSave = async () => {
    const hasComponents = Object.values(selectedComponents).some(c => c !== null);
    if (!hasComponents) {
      Alert.alert(
        t('recipeBuilder.alerts.selectComponent.title'),
        t('recipeBuilder.alerts.selectComponent.message')
      );
      return;
    }
    setServings(selectedPanServings);
    setStep('finalize');
  };

  const handleFinalSave = async () => {
    if (!selectedDessertType) return;

    try {
      const components = Object.entries(selectedComponents)
        .filter(([_, recipe]) => recipe !== null)
        .map(([roleId, recipe], index) => ({
          recipe_role_id: parseInt(roleId),
          base_recipe_id: recipe!.id,
          order_index: index,
          multiplier: 1,
        }));

      const dessertName = language === 'en'
        ? (selectedDessertType.name_en || selectedDessertType.name)
        : selectedDessertType.name;
      const finalName = recipeName.trim() || `${t('recipeBuilder.finalizeStep.placeholder').replace('{{dessert}}', dessertName)}`;

      const { data, error } = await supabase
        .from('user_recipes')
        .insert({
          user_id: PLACEHOLDER_USER_ID,
          dessert_type_id: selectedDessertType.id,
          name: finalName,
          intro_text: introText.trim() || null,
          selected_components: components,
          total_servings: servings,
        })
        .select()
        .single();

      if (error) throw error;

      // Upload image if selected
      if (builderImageUri && data.id) {
        setIsUploadingImage(true);
        try {
          const publicUrl = await uploadRecipeImage(builderImageUri, String(data.id));
          if (publicUrl) {
            await updateRecipeImage(String(data.id), publicUrl);
          }
        } finally {
          setIsUploadingImage(false);
        }
      }

      Alert.alert(
        t('recipeBuilder.alerts.success.title'),
        t('recipeBuilder.alerts.success.message'),
        [
          {
            text: t('recipeBuilder.alerts.success.viewRecipe'),
            onPress: () => router.replace(`/user-recipe/${data.id}`),
          },
          {
            text: t('recipeBuilder.alerts.success.goToRecipes'),
            onPress: () => router.replace('/(tabs)/recipes'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        t('recipeBuilder.alerts.error.title'),
        t('recipeBuilder.alerts.error.message')
      );
    }
  };

  const formatNum = (num: number) => Math.round(num * 10) / 10;

  // ============================================
  // STEP 3: FINALIZE - Name and Servings
  // ============================================
  if (step === 'finalize') {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 16 }}>
          <TouchableOpacity
            onPress={() => setStep('build')}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
          >
            <ChevronLeft size={24} color={Colors.text.secondary} />
            <Text style={{ color: Colors.text.primary, marginLeft: 8, fontSize: 16 }}>{t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 30, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 8 }}>
            {t('recipeBuilder.finalizeStep.title')}
          </Text>
          <Text style={{ color: Colors.text.secondary, fontSize: 16 }}>{t('recipeBuilder.finalizeStep.subtitle')}</Text>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }}>
          {/* Recipe Name */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text.primary, marginBottom: 8 }}>
              {t('recipeBuilder.finalizeStep.recipeName')}
            </Text>
            <TextInput
              value={recipeName}
              onChangeText={setRecipeName}
              placeholder={`${t('recipeBuilder.finalizeStep.placeholder').replace('{{dessert}}', language === 'en' ? (selectedDessertType?.name_en || selectedDessertType?.name || '') : (selectedDessertType?.name || ''))}`}
              style={{
                backgroundColor: Colors.background.primary,
                borderWidth: 2,
                borderColor: Colors.border.light,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
              }}
              placeholderTextColor={Colors.text.secondary}
            />
          </View>

          {/* Intro Text */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text.primary, marginBottom: 8 }}>
              {t('recipeBuilder.finalizeStep.descriptionLabel')}
            </Text>
            <TextInput
              value={introText}
              onChangeText={setIntroText}
              placeholder={t('recipeBuilder.finalizeStep.descriptionPlaceholder')}
              multiline
              numberOfLines={4}
              maxLength={500}
              style={{
                backgroundColor: Colors.background.primary,
                borderWidth: 2,
                borderColor: Colors.border.light,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                height: 100,
                textAlignVertical: 'top',
              }}
              placeholderTextColor={Colors.text.secondary}
            />
            <Text style={{ fontSize: 12, color: Colors.text.secondary, marginTop: 4, textAlign: 'right' }}>
              {introText.length}/500
            </Text>
          </View>

          {/* Optional Photo */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text.primary, marginBottom: 8 }}>
              {t('imageUpload.addPhoto')}
            </Text>
            {builderImageUri ? (
              <View>
                <Image
                  source={{ uri: builderImageUri }}
                  style={{ width: '100%', height: 180, borderRadius: 12, marginBottom: 8 }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => setBuilderImageUri(null)}
                  style={{ alignSelf: 'center', paddingVertical: 4 }}
                >
                  <Text style={{ color: Colors.text.secondary, fontSize: 13 }}>{t('common.delete')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
                  <TouchableOpacity
                    onPress={async () => {
                      const uri = await pickImage('camera');
                      if (uri) setBuilderImageUri(uri);
                    }}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      backgroundColor: Colors.background.primary,
                      borderWidth: 2,
                      borderColor: Colors.border.light,
                      borderRadius: 12,
                      paddingVertical: 14,
                    }}
                  >
                    <Ionicons name="camera-outline" size={20} color={Colors.primary.main} />
                    <Text style={{ color: Colors.primary.main, fontWeight: '600' }}>
                      {t('imageUpload.camera')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      const uri = await pickImage('gallery');
                      if (uri) setBuilderImageUri(uri);
                    }}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      backgroundColor: Colors.background.primary,
                      borderWidth: 2,
                      borderColor: Colors.border.light,
                      borderRadius: 12,
                      paddingVertical: 14,
                    }}
                  >
                    <Ionicons name="images-outline" size={20} color={Colors.primary.main} />
                    <Text style={{ color: Colors.primary.main, fontWeight: '600' }}>
                      {t('imageUpload.gallery')}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 12, color: Colors.text.secondary, textAlign: 'center' }}>
                  {t('imageUpload.skipForNow')}
                </Text>
              </View>
            )}
          </View>

          {/* Servings */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text.primary, marginBottom: 8 }}>
              {t('recipeBuilder.finalizeStep.servings')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <TouchableOpacity
                onPress={() => setServings(Math.max(1, servings - 1))}
                style={{
                  backgroundColor: Colors.background.primary,
                  borderWidth: 2,
                  borderColor: Colors.border.light,
                  borderRadius: 12,
                  width: 48,
                  height: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 24, color: Colors.text.primary }}>−</Text>
              </TouchableOpacity>
              <View style={{
                flex: 1,
                backgroundColor: Colors.background.primary,
                borderWidth: 2,
                borderColor: Colors.primary.main,
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: Colors.primary.main }}>{servings}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setServings(servings + 1)}
                style={{
                  backgroundColor: Colors.background.primary,
                  borderWidth: 2,
                  borderColor: Colors.border.light,
                  borderRadius: 12,
                  width: 48,
                  height: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 24, color: Colors.text.primary }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Summary */}
          <View style={{
            backgroundColor: Colors.background.primary,
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 12 }}>
              {t('recipeBuilder.finalizeStep.summary.title')}
            </Text>
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: Colors.text.secondary }}>{t('recipeBuilder.finalizeStep.summary.dessert')}</Text>
                <Text style={{ fontWeight: '600' }}>
                  {language === 'en' ? (selectedDessertType?.name_en || selectedDessertType?.name) : selectedDessertType?.name}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: Colors.text.secondary }}>{t('recipeBuilder.finalizeStep.summary.components')}</Text>
                <Text style={{ fontWeight: '600' }}>
                  {Object.values(selectedComponents).filter(Boolean).length}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: Colors.text.secondary }}>{t('recipeBuilder.finalizeStep.summary.calories')}</Text>
                <Text style={{ fontWeight: '600' }}>
                  {formatNum(totalNutritionRaw.calories * scaleFactor / safeServings)} {t('recipeBuilder.finalizeStep.summary.perServing')}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          <TouchableOpacity
            onPress={handleFinalSave}
            disabled={isUploadingImage}
            style={{
              backgroundColor: Colors.primary.main,
              paddingVertical: 16,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {isUploadingImage && <ActivityIndicator size="small" color="#FFFFFF" />}
            <Text style={{
              color: Colors.text.inverse,
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: 18,
            }}>
              {t('recipeBuilder.finalizeStep.saveButton')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ============================================
  // STEP 1: DESSERT TYPE SELECTION
  // ============================================
  if (step === 'dessert') {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 16 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
          >
            <ChevronLeft size={24} color={Colors.text.secondary} />
            <Text style={{ color: Colors.text.primary, marginLeft: 8, fontSize: 16 }}>{t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 30, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 8 }}>
            {t('recipeBuilder.dessertSelection.title')}
          </Text>
          <Text style={{ color: Colors.text.secondary, fontSize: 16 }}>{t('recipeBuilder.dessertSelection.subtitle')}</Text>
        </View>

        {/* Dessert Types - Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
        >
          {dessertTypes?.map((dessert) => (
            <TouchableOpacity
              key={dessert.id}
              onPress={() => handleSelectDessert(dessert)}
              style={{ alignItems: 'center' }}
            >
              <View style={{
                width: 128,
                height: 128,
                backgroundColor: Colors.background.primary,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                shadowColor: Colors.shadow.dark,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
                overflow: 'hidden',
              }}>
                {dessert.image_url ? (
                  <Image
                    source={{ uri: dessert.image_url }}
                    style={{ width: '100%', height: '100%', borderRadius: 24 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={{ fontSize: 60 }}>🎂</Text>
                )}
              </View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text.primary }}>
                {language === 'en' ? (dessert.name_en || dessert.name) : dessert.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ============================================
  // STEP 2: VISUAL BUILDER
  // ============================================
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.primary }}>

      <View style={{ flex: 1 }}>
        {/* Header with Nutrition */}
        <View style={{
          paddingHorizontal: 24,
          paddingTop: 64,
          paddingBottom: 12,
          backgroundColor: Colors.background.secondary,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}>
            <TouchableOpacity onPress={() => setStep('dessert')}>
              <ChevronLeft size={24} color={Colors.text.secondary} />
            </TouchableOpacity>
            <Text style={{ color: Colors.text.primary, fontSize: 18, fontWeight: 'bold' }}>
              {language === 'en' ? (selectedDessertType?.name_en || selectedDessertType?.name) : selectedDessertType?.name}
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Real-time Nutrition Per Serving */}
          <Animated.View
            style={{
              transform: [{
                scale: nutritionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.05]
                })
              }],
            }}
          >
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: BorderRadius.lg,
              paddingVertical: Spacing.sm,
              paddingHorizontal: Spacing.sm,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: Colors.text.primary }}>
                    {perServing.calories}
                  </Text>
                  <Text style={{ fontSize: 8, color: Colors.text.secondary, marginTop: 2 }}>
                    {t('recipeBuilder.buildStep.nutrition.kcal')}
                  </Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: Colors.text.primary }}>
                    {perServing.protein}g
                  </Text>
                  <Text style={{ fontSize: 8, color: Colors.text.secondary, marginTop: 2 }}>
                    {t('recipeBuilder.buildStep.nutrition.protein')}
                  </Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: Colors.text.primary }}>
                    {perServing.fat}g
                  </Text>
                  <Text style={{ fontSize: 8, color: Colors.text.secondary, marginTop: 2 }}>
                    {t('recipeBuilder.buildStep.nutrition.fat')}
                  </Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: Colors.text.primary }}>
                    {perServing.carbs}g
                  </Text>
                  <Text style={{ fontSize: 8, color: Colors.text.secondary, marginTop: 2 }}>
                    {t('recipeBuilder.buildStep.nutrition.carbs')}
                  </Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: Colors.primary.main }}>
                    {perServing.netCarbs}g
                  </Text>
                  <Text style={{ fontSize: 8, color: Colors.text.secondary, marginTop: 2 }}>
                    {t('recipeBuilder.buildStep.nutrition.net')}
                  </Text>
                </View>
              </View>
              {/* Per serving label */}
              <Text style={{ fontSize: 9, color: Colors.text.secondary, textAlign: 'center', marginTop: 4 }}>
                {t('panPicker.perServing')} ({selectedPanServings} {t('panPicker.servings')})
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Components Grid */}
        <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24 }}>
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 12,
          }}>
            {baseRecipes?.map((recipe) => {
              const isSelected = selectedComponents[selectedTab]?.id === recipe.id;

              return (
                <TouchableOpacity
                  key={recipe.id}
                  onPress={() => handleSelectComponent(recipe)}
                  style={{ width: '45%' }}
                >
                  <View style={{
                    borderRadius: 16,
                    padding: 16,
                    backgroundColor: isSelected ? Colors.background.primary : 'rgba(255,255,255,0.8)',
                  }}>
                    {/* Recipe Image */}
                    <View style={{
                      width: '100%',
                      height: 128,
                      backgroundColor: Colors.border.light,
                      borderRadius: 12,
                      marginBottom: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}>
                      {recipe.image_url ? (
                        <ImageBackground
                          source={{ uri: recipe.image_url }}
                          style={{ width: '100%', height: '100%' }}
                        />
                      ) : (
                        <Text style={{ fontSize: 40 }}>🍰</Text>
                      )}
                    </View>

                    {/* Recipe Name */}
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: Colors.text.primary,
                        marginBottom: 4,
                      }}
                      numberOfLines={2}
                    >
                      {language === 'en' ? (recipe.name_en || recipe.name) : recipe.name}
                    </Text>

                    {/* Nutrition hint */}
                    {recipe.total_calories ? (
                      <Text style={{ fontSize: 12, color: Colors.text.secondary }}>
                        {formatNum(recipe.total_calories)} {t('recipeBuilder.buildStep.nutrition.kcal')}
                      </Text>
                    ) : null}

                    {/* Selection indicator */}
                    <View style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? Colors.primary.main : Colors.border.light,
                    }}>
                      <Text style={{ color: Colors.text.inverse, fontWeight: 'bold' }}>
                        {isSelected ? '✓' : '+'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom: PanSizePicker + Role Tabs + Save */}
        <View style={{ backgroundColor: Colors.background.secondary, paddingBottom: 32 }}>
          {/* Pan Size Picker (compact chips) */}
          <View style={{ paddingTop: Spacing.sm }}>
            <PanSizePicker
              selectedServings={selectedPanServings}
              onSelectServings={setSelectedPanServings}
              compact
            />
          </View>

          {/* Role Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}
          >
            {RECIPE_ROLES.map((role) => {
              const isSelected = selectedTab === role.id;
              const hasComponent = !!selectedComponents[role.id];

              return (
                <TouchableOpacity
                  key={role.id}
                  onPress={() => setSelectedTab(role.id)}
                  style={{
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isSelected ? Colors.primary.main : Colors.border.light,
                  }}
                >
                  <Text style={{
                    fontWeight: '600',
                    color: isSelected ? Colors.text.inverse : Colors.text.secondary,
                  }}>
                    {role.name}
                  </Text>
                  {hasComponent ? (
                    <View style={{
                      marginLeft: 8,
                      width: 8,
                      height: 8,
                      backgroundColor: Colors.secondary.main,
                      borderRadius: 4,
                    }} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Save Button */}
          <View style={{ paddingHorizontal: 24 }}>
            <TouchableOpacity
              onPress={handleSave}
              style={{
                paddingVertical: 16,
                borderRadius: 16,
                backgroundColor: Object.values(selectedComponents).filter(Boolean).length === 0
                  ? Colors.secondary.main
                  : Colors.primary.main,
                opacity: Object.values(selectedComponents).filter(Boolean).length === 0 ? 0.5 : 1,
              }}
              disabled={Object.values(selectedComponents).filter(Boolean).length === 0}
            >
              <Text style={{
                color: Colors.text.inverse,
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: 18,
              }}>
                {t('recipeBuilder.buildStep.continueButton').replace('{{count}}', String(Object.values(selectedComponents).filter(Boolean).length))}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
