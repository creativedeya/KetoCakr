// ===========================================================
// FILE: mobile/app/(modals)/recipe-generator.tsx
// PART 6: Main recipe generator modal screen
// ===========================================================
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useRecipeGeneratorStore } from '../../store/useRecipeGeneratorStore';
import { useCreateUserRecipe } from '../../api/hooks';
import { useDessertTypes } from '../../api/hooks';

// Icon wrappers
const X = (props: any) => <Ionicons name="close" {...props} />;
const ChevronLeft = (props: any) => <Ionicons name="chevron-back" {...props} />;

// Step components
import Step1DessertType from '../../components/recipe-generator/Step1DessertType';
import Step2Components from '../../components/recipe-generator/Step2Components';
import Step3Portions from '../../components/recipe-generator/Step3Portions';
import Step4Review from '../../components/recipe-generator/Step4Review';

export default function RecipeGeneratorModal() {
  const currentStep = useRecipeGeneratorStore((state) => state.currentStep);
  const previousStep = useRecipeGeneratorStore((state) => state.previousStep);
  const nextStep = useRecipeGeneratorStore((state) => state.nextStep);
  const reset = useRecipeGeneratorStore((state) => state.reset);
  
  // Recipe data
  const selectedDessertTypeId = useRecipeGeneratorStore((state) => state.selectedDessertTypeId);
  const selectedComponents = useRecipeGeneratorStore((state) => state.selectedComponents);
  const totalServings = useRecipeGeneratorStore((state) => state.totalServings);
  const recipeName = useRecipeGeneratorStore((state) => state.recipeName);

  const createRecipe = useCreateUserRecipe();
  const { data: dessertTypes } = useDessertTypes();

  const handleClose = () => {
    Alert.alert(
      'Прекъсване',
      'Сигурни ли сте, че искате да прекъснете? Прогресът няма да бъде запазен.',
      [
        { text: 'Откажи', style: 'cancel' },
        {
          text: 'Прекъсни',
          style: 'destructive',
          onPress: () => {
            reset();
            router.back();
          },
        },
      ]
    );
  };

  const handleBack = () => {
    if (currentStep === 1) {
      handleClose();
    } else {
      previousStep();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!selectedDessertTypeId;
      case 2:
        return selectedComponents.length > 0;
      case 3:
        return totalServings >= 2;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 4) {
      handleCreateRecipe();
    } else {
      nextStep();
    }
  };

  const handleCreateRecipe = async () => {
    if (!selectedDessertTypeId || selectedComponents.length === 0) {
      Alert.alert('Грешка', 'Моля, изберете всички необходими компоненти');
      return;
    }

    const selectedDessertType = dessertTypes?.find(dt => dt.id === selectedDessertTypeId);
    const displayDessertName = selectedDessertType?.name || selectedDessertType?.name_en || 'торта';
    
    // SUPER CLEAR LOGIC - NO CONFUSION POSSIBLE
    let finalRecipeName;
    
    if (!recipeName || recipeName.trim() === '') {
      // User left it empty - use default
      finalRecipeName = `Моя ${displayDessertName} - ${new Date().toLocaleDateString('bg-BG')}`;
      console.log('USER LEFT NAME EMPTY - Using default:', finalRecipeName);
    } else {
      // User typed something - use EXACTLY what they typed
      finalRecipeName = recipeName.trim();
      console.log('USER ENTERED NAME - Using their input:', finalRecipeName);
    }
    
    console.log('=== FINAL NAME TO SAVE ===');
    console.log('Will save to database:', finalRecipeName);
    console.log('=========================');

    try {
      await createRecipe.mutateAsync({
        name: finalRecipeName,
        dessert_type_id: selectedDessertTypeId,
        total_servings: totalServings,
        components: selectedComponents.map(comp => ({
          recipe_role_id: comp.recipeRoleId,
          base_recipe_id: comp.baseRecipeId,
          servings_multiplier: comp.servingsMultiplier,
          name: comp.name,
        })),
      });

      Alert.alert(
        'Успех! 🎉',
        'Вашата рецепта беше създадена успешно!',
        [
          {
            text: 'OK',
            onPress: () => {
              reset();
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Create recipe error:', error);
      Alert.alert(
        'Грешка',
        'Неуспешно създаване на рецепта. Моля, опитайте отново.'
      );
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 pt-14 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={handleBack} className="p-2 -ml-2">
            {currentStep === 1 ? (
              <X size={24} color={Colors.text.secondary} />
            ) : (
              <ChevronLeft size={24} color={Colors.text.secondary} />
            )}
          </TouchableOpacity>

          <Text className="text-lg font-bold" style={{ color: Colors.text.primary }}>
            Създай рецепта
          </Text>

          <TouchableOpacity onPress={handleClose} className="p-2 -mr-2">
            <X size={24} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Progress indicator */}
        <View className="flex-row gap-2">
          {[1, 2, 3, 4].map((step) => (
            <View
              key={step}
              className="flex-1 h-1 rounded-full"
              style={{
                backgroundColor: step <= currentStep ? Colors.primary.main : Colors.border.light
              }}
            />
          ))}
        </View>

        <Text className="text-sm mt-2" style={{ color: Colors.text.secondary }}>
          Стъпка {currentStep} от 4
        </Text>
      </View>

      {/* Step content */}
      <View className="flex-1">
        {currentStep === 1 && <Step1DessertType />}
        {currentStep === 2 && <Step2Components />}
        {currentStep === 3 && <Step3Portions />}
        {currentStep === 4 && <Step4Review />}
      </View>

      {/* Footer with action button */}
      <View className="bg-white border-t px-6 py-4" style={{ borderColor: Colors.border.light }}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={!canProceed() || createRecipe.isPending}
          className="py-4 rounded-xl"
          style={{
            backgroundColor: canProceed() && !createRecipe.isPending
              ? Colors.primary.main
              : Colors.secondary.main,
            opacity: canProceed() && !createRecipe.isPending ? 1 : 0.5,
          }}
        >
          {createRecipe.isPending ? (
            <ActivityIndicator color={Colors.text.inverse} />
          ) : (
            <Text className="text-center font-bold text-base" style={{ color: Colors.text.inverse }}>
              {currentStep === 4 ? 'Създай рецепта' : 'Напред'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
