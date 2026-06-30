// ===========================================================
// Step 1: Dessert Type Selection - WITH BETTER ERROR DISPLAY
// ===========================================================
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useRecipeGeneratorStore } from '../../store/useRecipeGeneratorStore';
import { useDessertTypes } from '../../api/hooks';
import { useTranslation } from '../../constants/i18n';

export default function Step1DessertType() {
  const { t } = useTranslation();
  const selectedDessertTypeId = useRecipeGeneratorStore((state) => state.selectedDessertTypeId);
  const setDessertType = useRecipeGeneratorStore((state) => state.setDessertType);

  const { data: dessertTypes, isLoading, error } = useDessertTypes();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text className="mt-4" style={{ color: Colors.text.secondary }}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : JSON.stringify(error, null, 2);

    console.error('Step1 Error:', error);

    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-lg font-semibold mb-2" style={{ color: Colors.error.main }}>❌ {t('common.error')}</Text>
        <ScrollView className="max-h-60 w-full">
          <Text className="text-sm font-mono p-3 rounded" style={{ color: Colors.text.secondary, backgroundColor: Colors.background.secondary }}>
            {errorMessage}
          </Text>
        </ScrollView>
        <Text className="text-xs mt-4" style={{ color: Colors.text.tertiary }}>
          {t('recipeBuilder.dessertSelection.checkConsole')}
        </Text>
      </View>
    );
  }

  if (!dessertTypes || dessertTypes.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-lg font-semibold mb-2" style={{ color: Colors.text.secondary }}>⚠️ {t('common.noResults')}</Text>
        <Text className="text-center" style={{ color: Colors.text.tertiary }}>
          {t('recipeBuilder.dessertSelection.noData')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-6">
      <Text className="text-2xl font-bold mb-2" style={{ color: Colors.text.primary }}>{t('recipeBuilder.dessertSelection.stepTitle')}</Text>
      <Text className="mb-6" style={{ color: Colors.text.secondary }}>
        {t('recipeBuilder.dessertSelection.stepSubtitle')}
      </Text>

      <View className="space-y-3">
        {dessertTypes.map((dessertType: any) => {
          const displayName = dessertType.name || dessertType.name_en || 'Без име';
          const description = dessertType.description;

          return (
            <TouchableOpacity
              key={dessertType.id}
              onPress={() => setDessertType(dessertType.id)}
              className="p-4 rounded-xl border-2"
              style={{
                borderColor: selectedDessertTypeId === dessertType.id ? Colors.primary.main : Colors.border.light,
                backgroundColor: selectedDessertTypeId === dessertType.id ? Colors.primary.opacity[10] : Colors.background.primary,
              }}
            >
              <View className="flex-row items-center">
                <View className="flex-1">
                  <Text className="text-lg font-semibold" style={{
                    color: selectedDessertTypeId === dessertType.id ? Colors.primary.main : Colors.text.primary
                  }}>
                    {displayName}
                  </Text>
                  {description && (
                    <Text className="text-sm mt-1" style={{ color: Colors.text.secondary }}>
                      {description}
                    </Text>
                  )}
                </View>
                {selectedDessertTypeId === dessertType.id && (
                  <View className="ml-2">
                    <Text className="text-xl" style={{ color: Colors.primary.main }}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
