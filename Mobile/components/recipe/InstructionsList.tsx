// ===========================================================
// FILE: mobile/components/recipe/InstructionsList.tsx
// PART 4: Step-by-step instructions component
// ===========================================================
import { View, Text, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

// Icon wrapper
const ChefHat = (props: any) => <MaterialCommunityIcons name="chef-hat" {...props} />;

interface Instruction {
  step_number: number;
  instruction_bg: string;
}

interface InstructionsListProps {
  componentName: string;
  instructions: Instruction[];
  color?: string;
}

export default function InstructionsList({
  componentName,
  instructions,
  color = Colors.primary.main
}: InstructionsListProps) {
  if (!instructions || instructions.length === 0) return null;

  return (
    <View className="bg-white rounded-2xl p-5 mb-4">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <View className="rounded-full p-2" style={{ backgroundColor: Colors.primary.opacity[20] }}>
          <ChefHat size={20} color={color} />
        </View>
        <Text className="text-lg font-bold ml-3" style={{ color: Colors.text.primary }}>
          {componentName}
        </Text>
      </View>

      {/* Steps */}
      {instructions.map((instruction) => (
        <View key={instruction.step_number} className="flex-row mb-4">
          {/* Step number */}
          <View
            className="w-8 h-8 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${color}20` }}
          >
            <Text
              className="font-bold text-sm"
              style={{ color }}
            >
              {instruction.step_number}
            </Text>
          </View>

          {/* Instruction text */}
          <View className="flex-1">
            <Text className="text-base leading-6" style={{ color: Colors.text.primary }}>
              {instruction.instruction_bg}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
