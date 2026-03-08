// ===========================================================
// FILE: mobile/components/recipe-generator/Step4Review.tsx
// PART 5: Step 4 - Review and name the recipe
// ===========================================================
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useRecipeGeneratorStore } from '../../store/useRecipeGeneratorStore';
import { useDessertTypes } from '../../api/hooks';

// Icon wrapper
const CheckCircle2 = (props: any) => <Ionicons name="checkmark-circle" {...props} />;

export default function Step4Review() {
  const recipeName = useRecipeGeneratorStore((state) => state.recipeName);
  const setRecipeName = useRecipeGeneratorStore((state) => state.setRecipeName);
  const selectedDessertTypeId = useRecipeGeneratorStore((state) => state.selectedDessertTypeId);
  const selectedComponents = useRecipeGeneratorStore((state) => state.selectedComponents);
  const totalServings = useRecipeGeneratorStore((state) => state.totalServings);

  const { data: dessertTypes } = useDessertTypes();
  const selectedDessertType = dessertTypes?.find(
    (dt) => dt.id === selectedDessertTypeId
  );

  // Generate default name if empty
  const displayDessertName = selectedDessertType?.name || selectedDessertType?.name_en || 'торта';
  const defaultName = `Моя ${displayDessertName} - ${new Date().toLocaleDateString('bg-BG')}`;

  return (
    <ScrollView className="flex-1 px-6">
      <Text className="text-2xl font-bold mt-6 mb-2" style={{ color: Colors.text.primary }}>
        Преглед и име
      </Text>
      <Text className="mb-6" style={{ color: Colors.text.secondary }}>
        Проверете вашата рецепта и й дайте име
      </Text>

      {/* Recipe name input */}
      <View className="mb-6">
        <Text className="text-sm font-semibold mb-2" style={{ color: Colors.text.primary }}>
          Име на рецептата
        </Text>
        <TextInput
          value={recipeName}
          onChangeText={(text) => {
            console.log('Step4 - TextInput onChange:', text);
            setRecipeName(text);
          }}
          placeholder={defaultName}
          placeholderTextColor={Colors.text.tertiary}
          className="bg-white border-2 rounded-xl px-4 py-3 text-base"
          style={{ borderColor: Colors.border.light, color: Colors.text.primary }}
        />
        <Text className="text-xs mt-2" style={{ color: Colors.text.tertiary }}>
          Ако оставите празно, ще използваме име по подразбиране
        </Text>
      </View>

      {/* Recipe summary */}
      <View className="rounded-2xl p-5 border-2 mb-6" style={{ backgroundColor: Colors.primary.opacity[10], borderColor: Colors.primary.light }}>
        <View className="flex-row items-center mb-4">
          <View className="rounded-full p-2" style={{ backgroundColor: Colors.primary.main }}>
            <CheckCircle2 size={20} color={Colors.text.inverse} />
          </View>
          <Text className="text-lg font-bold ml-3" style={{ color: Colors.primary.dark }}>
            Резюме на рецептата
          </Text>
        </View>

        {/* Dessert type */}
        <View className="mb-4 pb-4 border-b" style={{ borderColor: Colors.primary.light }}>
          <Text className="text-xs font-semibold mb-1" style={{ color: Colors.primary.main }}>
            ВИД ДЕСЕРТ
          </Text>
          <Text className="text-base font-semibold" style={{ color: Colors.primary.dark }}>
            {displayDessertName}
          </Text>
        </View>

        {/* Components */}
        <View className="mb-4 pb-4 border-b" style={{ borderColor: Colors.primary.light }}>
          <Text className="text-xs font-semibold mb-2" style={{ color: Colors.primary.main }}>
            КОМПОНЕНТИ ({selectedComponents.length})
          </Text>
          {selectedComponents.map((component, index) => (
            <View key={component.recipeRoleId} className="flex-row items-center mb-2">
              <View className="bg-white rounded-full w-6 h-6 items-center justify-center mr-3">
                <Text className="font-bold text-xs" style={{ color: Colors.primary.main }}>
                  {index + 1}
                </Text>
              </View>
              <Text className="text-base flex-1" style={{ color: Colors.primary.dark }}>
                {component.name}
              </Text>
            </View>
          ))}
        </View>

        {/* Servings */}
        <View>
          <Text className="text-xs font-semibold mb-1" style={{ color: Colors.primary.main }}>
            ПОРЦИИ
          </Text>
          <Text className="text-2xl font-bold" style={{ color: Colors.primary.dark }}>
            {totalServings} порции
          </Text>
        </View>
      </View>

      {/* Info message */}
      <View className="rounded-xl p-4 border mb-6" style={{ backgroundColor: Colors.success.opacity?.['10'] || '#E8F5E9', borderColor: Colors.success.light }}>
        <Text className="font-semibold mb-1" style={{ color: Colors.success.dark }}>
          ✨ Готово за създаване!
        </Text>
        <Text className="text-sm" style={{ color: Colors.success.dark }}>
          Натиснете "Създай рецепта" за да запазите вашата персонализирана кето торта. Всички количества ще бъдат автоматично изчислени.
        </Text>
      </View>

      <View className="h-20" />
    </ScrollView>
  );
}
