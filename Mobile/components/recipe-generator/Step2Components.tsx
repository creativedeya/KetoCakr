// ===========================================================
// Step 2: Select Recipe Components - UPDATED for new schema
// ===========================================================
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useRecipeRoles, useBaseRecipes } from '../../api/hooks';
import { useRecipeGeneratorStore } from '../../store/useRecipeGeneratorStore';
import { BaseRecipe } from '../../../shared/types';

// Icon wrappers
const ChevronDown = (props: any) => <Ionicons name="chevron-down" {...props} />;
const ChevronUp = (props: any) => <Ionicons name="chevron-up" {...props} />;
const Check = (props: any) => <Ionicons name="checkmark" {...props} />;

export default function Step2Components() {
  const selectedDessertTypeId = useRecipeGeneratorStore((state) => state.selectedDessertTypeId);
  const selectedComponents = useRecipeGeneratorStore((state) => state.selectedComponents);
  const addComponent = useRecipeGeneratorStore((state) => state.addComponent);

  const { data: recipeRoles, isLoading: rolesLoading, error: rolesError } = useRecipeRoles();
  const [expandedRoleId, setExpandedRoleId] = useState<number | null>(null);

  if (rolesLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text className="mt-4" style={{ color: Colors.text.secondary }}>Зареждане на категории...</Text>
      </View>
    );
  }

  if (rolesError) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-lg font-semibold" style={{ color: Colors.error.main }}>❌ Грешка</Text>
        <Text className="text-center mt-2" style={{ color: Colors.text.secondary }}>
          {rolesError instanceof Error ? rolesError.message : 'Неуспешно зареждане на категории'}
        </Text>
      </View>
    );
  }

  if (!recipeRoles || recipeRoles.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-lg font-semibold" style={{ color: Colors.text.secondary }}>⚠️ Няма категории</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 px-6">
      <Text className="text-2xl font-bold mt-6 mb-2" style={{ color: Colors.text.primary }}>
        Изберете компоненти
      </Text>
      <Text className="mb-6" style={{ color: Colors.text.secondary }}>
        Натиснете на всяка категория, за да изберете
      </Text>

      {recipeRoles.map((role) => {
        const selectedComponent = selectedComponents.find(
          (c) => c.recipeRoleId === role.id
        );
        const isExpanded = expandedRoleId === role.id;
        const displayName = role.name || role.name_en || 'Категория';

        return (
          <View key={role.id} className="mb-4">
            {/* Role header */}
            <TouchableOpacity
              onPress={() => setExpandedRoleId(isExpanded ? null : role.id)}
              className="p-4 rounded-2xl border-2"
              style={{
                backgroundColor: selectedComponent ? Colors.primary.opacity[10] : Colors.background.primary,
                borderColor: selectedComponent ? Colors.primary.main : Colors.border.light,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-bold" style={{ color: Colors.text.primary }}>
                    {displayName}
                  </Text>
                  {selectedComponent && (
                    <Text className="text-sm mt-1" style={{ color: Colors.primary.main }}>
                      ✓ {selectedComponent.name}
                    </Text>
                  )}
                </View>
                {isExpanded ? (
                  <ChevronUp size={20} color={Colors.text.secondary} />
                ) : (
                  <ChevronDown size={20} color={Colors.text.secondary} />
                )}
              </View>
            </TouchableOpacity>

            {/* Expanded recipes list */}
            {isExpanded && (
              <RecipeRoleRecipes
                recipeRoleId={role.id}
                dessertTypeId={selectedDessertTypeId}
                selectedBaseRecipeId={selectedComponent?.baseRecipeId}
                onSelect={(baseRecipeId, name) => {
                  addComponent({
                    recipeRoleId: role.id,
                    baseRecipeId,
                    servingsMultiplier: 1,
                    name,
                  });
                  setExpandedRoleId(null); // Collapse after selection
                }}
              />
            )}
          </View>
        );
      })}

      <View className="h-20" />
    </ScrollView>
  );
}

// Sub-component for displaying recipes in a role
function RecipeRoleRecipes({
  recipeRoleId,
  dessertTypeId,
  selectedBaseRecipeId,
  onSelect,
}: {
  recipeRoleId: number;
  dessertTypeId: number | null;
  selectedBaseRecipeId?: string;
  onSelect: (baseRecipeId: string, name: string) => void;
}) {
  const { data: recipes, isLoading, error } = useBaseRecipes(
    recipeRoleId,
    dessertTypeId || undefined
  );

  if (isLoading) {
    return (
      <View className="mt-2 p-4">
        <ActivityIndicator size="small" color={Colors.primary.main} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="mt-2 p-4">
        <Text className="text-sm" style={{ color: Colors.error.main }}>
          Грешка при зареждане на рецепти
        </Text>
      </View>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <View className="mt-2 p-4">
        <Text className="text-sm text-center" style={{ color: Colors.text.secondary }}>
          Няма налични рецепти за тази категория
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-2 rounded-xl p-2" style={{ backgroundColor: Colors.background.secondary }}>
      {recipes.map((recipe: BaseRecipe) => {
        const displayName = recipe.name || recipe.name_en || 'Без име';
        const description = recipe.description;

        return (
          <TouchableOpacity
            key={recipe.id}
            onPress={() => onSelect(recipe.id, displayName)}
            className="p-3 rounded-lg mb-2 flex-row items-center justify-between"
            style={{
              backgroundColor: selectedBaseRecipeId === recipe.id ? Colors.primary.opacity[20] : Colors.background.primary
            }}
          >
            <View className="flex-1">
              <Text className="font-semibold" style={{
                color: selectedBaseRecipeId === recipe.id ? Colors.primary.dark : Colors.text.primary
              }}>
                {displayName}
              </Text>
              {description && (
                <Text className="text-xs mt-1" style={{ color: Colors.text.secondary }} numberOfLines={2}>
                  {description}
                </Text>
              )}
              {recipe.prep_time_minutes && (
                <Text className="text-xs mt-1" style={{ color: Colors.text.tertiary }}>
                  ⏱️ {recipe.prep_time_minutes} мин.
                </Text>
              )}
            </View>
            {selectedBaseRecipeId === recipe.id && (
              <View className="rounded-full p-1 ml-2" style={{ backgroundColor: Colors.primary.main }}>
                <Check size={16} color={Colors.text.inverse} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
