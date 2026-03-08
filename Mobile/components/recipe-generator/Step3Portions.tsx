// ===========================================================
// FILE: mobile/components/recipe-generator/Step3Portions.tsx
// PART 4: Step 3 - Select portions/servings
// ===========================================================
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useRecipeGeneratorStore } from '../../store/useRecipeGeneratorStore';

// Icon wrappers
const Minus = (props: any) => <Ionicons name="remove" {...props} />;
const Plus = (props: any) => <Ionicons name="add" {...props} />;

const SERVING_OPTIONS = [4, 6, 8, 10, 12, 16];

export default function Step3Portions() {
  const totalServings = useRecipeGeneratorStore((state) => state.totalServings);
  const setTotalServings = useRecipeGeneratorStore((state) => state.setTotalServings);
  const selectedComponents = useRecipeGeneratorStore((state) => state.selectedComponents);

  const increment = () => {
    setTotalServings(Math.min(totalServings + 2, 24));
  };

  const decrement = () => {
    setTotalServings(Math.max(totalServings - 2, 2));
  };

  return (
    <ScrollView className="flex-1 px-6">
      <Text className="text-2xl font-bold mt-6 mb-2" style={{ color: Colors.text.primary }}>
        Изберете порции
      </Text>
      <Text className="mb-8" style={{ color: Colors.text.secondary }}>
        Колко порции искате да бъдат вашата торта?
      </Text>

      {/* Custom serving selector */}
      <View className="rounded-2xl p-6 mb-6" style={{ backgroundColor: Colors.background.secondary }}>
        <View className="flex-row items-center justify-center">
          <TouchableOpacity
            onPress={decrement}
            className="bg-white rounded-full p-4 shadow-sm"
          >
            <Minus size={24} color={Colors.text.secondary} />
          </TouchableOpacity>

          <View className="mx-8 items-center">
            <Text className="text-6xl font-bold" style={{ color: Colors.primary.main }}>
              {totalServings}
            </Text>
            <Text className="mt-2" style={{ color: Colors.text.secondary }}>
              порции
            </Text>
          </View>

          <TouchableOpacity
            onPress={increment}
            className="bg-white rounded-full p-4 shadow-sm"
          >
            <Plus size={24} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick select options */}
      <Text className="text-sm font-semibold mb-3" style={{ color: Colors.text.primary }}>
        Бързи опции:
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-8">
        {SERVING_OPTIONS.map((servings) => (
          <TouchableOpacity
            key={servings}
            onPress={() => setTotalServings(servings)}
            className="px-6 py-3 rounded-full"
            style={{
              backgroundColor: totalServings === servings ? Colors.primary.main : Colors.background.secondary
            }}
          >
            <Text className="font-semibold" style={{
              color: totalServings === servings ? Colors.text.inverse : Colors.text.primary
            }}>
              {servings} порции
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Selected components summary */}
      <View className="rounded-2xl p-4 mb-6" style={{ backgroundColor: Colors.primary.opacity[10] }}>
        <Text className="text-sm font-semibold mb-3" style={{ color: Colors.primary.dark }}>
          Вашите компоненти:
        </Text>
        {selectedComponents.map((component, index) => (
          <View key={component.recipeRoleId} className="flex-row items-center mb-2">
            <Text className="text-2xl mr-3">
              {index === 0 ? '🍰' : index === 1 ? '🍓' : index === 2 ? '🎨' : '✨'}
            </Text>
            <Text className="flex-1" style={{ color: Colors.text.primary }}>
              {component.name}
            </Text>
          </View>
        ))}
      </View>

      {/* Info box */}
      <View className="rounded-xl p-4 border" style={{ backgroundColor: Colors.info.opacity?.['10'] || '#E3F2FD', borderColor: Colors.info.light }}>
        <Text className="font-semibold mb-1" style={{ color: Colors.info.dark }}>
          💡 Полезно за знае
        </Text>
        <Text className="text-sm" style={{ color: Colors.info.dark }}>
          Всички количества на съставките ще бъдат автоматично изчислени за избрания от вас брой порции.
        </Text>
      </View>

      <View className="h-20" />
    </ScrollView>
  );
}
