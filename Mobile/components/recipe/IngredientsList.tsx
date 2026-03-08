// ===========================================================
// FILE: mobile/components/recipe/IngredientsList.tsx
// PART 3: Ingredients list component
// ===========================================================
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useState } from 'react';
import { CalculatedIngredient, formatIngredient } from '../../lib/recipeCalculator';

// Icon wrappers
const CheckCircle2 = (props: any) => <Ionicons name="checkmark-circle" {...props} />;
const Circle = (props: any) => <Ionicons name="ellipse-outline" {...props} />;

interface IngredientsListProps {
  ingredients: CalculatedIngredient[];
}

export default function IngredientsList({ ingredients }: IngredientsListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggleCheck = (index: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
  };

  return (
    <View className="bg-white rounded-2xl p-5">
      <Text className="text-xl font-bold mb-4" style={{ color: Colors.text.primary }}>
        Съставки ({ingredients.length})
      </Text>

      {ingredients.map((ingredient, index) => {
        const isChecked = checkedItems.has(index);

        return (
          <TouchableOpacity
            key={index}
            onPress={() => toggleCheck(index)}
            className="flex-row items-center py-3 border-b"
            style={{
              borderColor: Colors.border.light,
              opacity: isChecked ? 0.5 : 1
            }}
          >
            {isChecked ? (
              <CheckCircle2 size={24} color={Colors.success.main} />
            ) : (
              <Circle size={24} color={Colors.border.medium} />
            )}

            <View className="flex-1 ml-3">
              <Text
                className="text-base"
                style={{
                  color: isChecked ? Colors.text.tertiary : Colors.text.primary,
                  textDecorationLine: isChecked ? 'line-through' : 'none'
                }}
              >
                {formatIngredient(ingredient)}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Summary */}
      <View className="mt-4 pt-4 border-t" style={{ borderColor: Colors.border.light }}>
        <Text className="text-sm" style={{ color: Colors.text.secondary }}>
          Отметнати: {checkedItems.size} / {ingredients.length}
        </Text>
      </View>
    </View>
  );
}
