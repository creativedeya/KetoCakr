// ===========================================================
// RECIPES SCREEN - BLAGO BRAND (User's Created Recipes)
// ===========================================================
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// lightweight wrappers that mirror the previous lucide naming
const Trash2 = (props: any) => <Ionicons name="trash-outline" {...props} />;
const Plus = (props: any) => <Ionicons name="add" {...props} />;
const Lock = (props: any) => <Ionicons name="lock-closed" {...props} />;
const Cake = (props: any) => <Ionicons name="cake" {...props} />;
import { useAuthStore } from '../../../store/useAuthStore';
import { useUserRecipes, useDeleteUserRecipe } from '../../../api/hooks';
import { Colors } from '../../../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadows, IconSize } from '../../../constants/Theme';

export default function RecipesScreen() {
  const user = useAuthStore((state) => state.user);
  const { data: recipes, isLoading, error, refetch } = useUserRecipes();
  const deleteRecipe = useDeleteUserRecipe();

  const handleDeleteRecipe = (recipeId: string, recipeName: string) => {
    Alert.alert(
      'Изтриване на рецепта',
      `Сигурни ли сте, че искате да изтриете "${recipeName}"?`,
      [
        { text: 'Откажи', style: 'cancel' },
        {
          text: 'Изтрий',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecipe.mutateAsync(recipeId);
              refetch();
            } catch (error) {
              Alert.alert('Грешка', 'Неуспешно изтриване на рецепта');
            }
          },
        },
      ]
    );
  };

  // ============================================
  // NOT LOGGED IN STATE
  // ============================================
  if (!user) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: Colors.background.primary }}>
        {/* Header */}
        <View style={{ 
          paddingHorizontal: Spacing.xl, 
          paddingTop: 64, 
          paddingBottom: Spacing.xl 
        }}>
          <Text style={{ ...Typography.h1, color: Colors.text.primary, marginBottom: Spacing.xs }}>
            Рецепти 📖
          </Text>
          <Text style={{ ...Typography.body1, color: Colors.text.secondary }}>
            Влезте, за да видите рецепти
          </Text>
        </View>
        
        {/* Login prompt */}
        <View style={{ paddingHorizontal: Spacing.xl }}>
          <View style={{
            backgroundColor: Colors.background.secondary,
            borderRadius: BorderRadius.xl,
            padding: Spacing['3xl'],
            alignItems: 'center',
          }}>
            <View style={{
              width: 80,
              height: 80,
              backgroundColor: Colors.primary.opacity[10],
              borderRadius: BorderRadius.xl,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: Spacing.lg,
            }}>
              <Lock size={IconSize.xl} color={Colors.primary.main} />
            </View>
            <Text style={{
              ...Typography.h3,
              color: Colors.text.primary,
              marginBottom: Spacing.sm,
            }}>
              Моля, влезте
            </Text>
            <Text style={{
              ...Typography.body1,
              color: Colors.text.secondary,
              textAlign: 'center',
              marginBottom: Spacing.xl,
            }}>
              Влезте от таба "Профил" за да създавате и виждате рецепти
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile')}
              style={{
                backgroundColor: Colors.primary.main,
                paddingHorizontal: Spacing['2xl'],
                paddingVertical: Spacing.base,
                borderRadius: BorderRadius.lg,
                ...Shadows.md,
              }}
            >
              <Text style={{ ...Typography.button, color: Colors.text.inverse }}>
                Влизане
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // ============================================
  // LOGGED IN - MAIN VIEW
  // ============================================
  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background.primary }}>
      {/* Header */}
      <View style={{ 
        paddingHorizontal: Spacing.xl, 
        paddingTop: 64, 
        paddingBottom: Spacing.xl 
      }}>
        <Text style={{ ...Typography.h1, color: Colors.text.primary, marginBottom: Spacing.xs }}>
          Моите Рецепти 📖
        </Text>
        <Text style={{ ...Typography.body1, color: Colors.text.secondary }}>
          {recipes?.length || 0} {recipes?.length === 1 ? 'рецепта' : 'рецепти'}
        </Text>
      </View>
      
      {/* Content */}
      <View style={{ paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl }}>
        {isLoading ? (
          // ============================================
          // LOADING STATE
          // ============================================
          <View style={{ alignItems: 'center', paddingVertical: Spacing['3xl'] }}>
            <ActivityIndicator size="large" color={Colors.primary.main} />
            <Text style={{ 
              ...Typography.body1, 
              color: Colors.text.secondary, 
              marginTop: Spacing.base 
            }}>
              Зареждане...
            </Text>
          </View>
        ) : error ? (
          // ============================================
          // ERROR STATE
          // ============================================
          <View style={{
            backgroundColor: Colors.error.light + '20',
            borderWidth: 1,
            borderColor: Colors.error.light,
            borderRadius: BorderRadius.lg,
            padding: Spacing.xl,
            alignItems: 'center',
          }}>
            <Text style={{ 
              ...Typography.h3, 
              color: Colors.error.main, 
              marginBottom: Spacing.sm 
            }}>
              ❌ Грешка
            </Text>
            <Text style={{
              ...Typography.body2,
              color: Colors.error.dark,
              textAlign: 'center',
            }}>
              {error instanceof Error ? error.message : 'Неуспешно зареждане на рецепти'}
            </Text>
          </View>
        ) : !recipes || recipes.length === 0 ? (
          // ============================================
          // EMPTY STATE
          // ============================================
          <View style={{
            backgroundColor: Colors.background.accent,
            borderRadius: BorderRadius.xl,
            padding: Spacing['3xl'],
            alignItems: 'center',
          }}>
            <View style={{
              width: 100,
              height: 100,
              backgroundColor: Colors.primary.opacity[10],
              borderRadius: BorderRadius['2xl'],
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: Spacing.lg,
            }}>
              <Cake size={IconSize.xl + 8} color={Colors.primary.main} />
            </View>
            <Text style={{
              ...Typography.h2,
              color: Colors.text.primary,
              marginBottom: Spacing.sm,
            }}>
              Все още няма рецепти
            </Text>
            <Text style={{
              ...Typography.body1,
              color: Colors.text.secondary,
              textAlign: 'center',
              marginBottom: Spacing.xl,
            }}>
              Създайте първата си кето торта!
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(modals)/visual-recipe-builder')}
              style={{
                backgroundColor: Colors.primary.main,
                paddingHorizontal: Spacing['2xl'],
                paddingVertical: Spacing.base,
                borderRadius: BorderRadius.lg,
                ...Shadows.md,
              }}
            >
              <Text style={{ ...Typography.button, color: Colors.text.inverse }}>
                + Създай Рецепта
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // ============================================
          // RECIPES LIST
          // ============================================
          <View style={{ gap: Spacing.base }}>
            {recipes.map((recipe) => {
              const dessertTypeName = recipe.dessert_type?.name || recipe.dessert_type?.name_en || 'Десерт';
              const displayName = recipe.name || `Моя ${dessertTypeName}`;
              const componentCount = recipe.selected_components?.length || 0;
              
              return (
                <TouchableOpacity
                  key={recipe.id}
                  onPress={() => {
                    console.log('Recipe clicked:', recipe.id);
                    router.push(`/recipe-detail/${recipe.id}`);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{
                    backgroundColor: Colors.background.primary,
                    borderWidth: 2,
                    borderColor: Colors.border.light,
                    borderRadius: BorderRadius.lg,
                    padding: Spacing.base,
                    ...Shadows.sm,
                  }}>
                    {/* Title and Delete Button */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: Spacing.sm,
                    }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          ...Typography.h4,
                          color: Colors.text.primary,
                          marginBottom: Spacing.xs,
                        }}>
                          {displayName}
                        </Text>
                        <Text style={{
                          ...Typography.body2,
                          color: Colors.primary.main,
                          fontWeight: '600',
                        }}>
                          {dessertTypeName}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDeleteRecipe(recipe.id, displayName);
                        }}
                        style={{ padding: Spacing.sm }}
                      >
                        <Trash2 size={IconSize.md} color={Colors.error.main} />
                      </TouchableOpacity>
                    </View>

                    {/* Recipe Stats */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: Spacing.base,
                      marginBottom: Spacing.md,
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ ...Typography.body2, color: Colors.text.secondary }}>
                          🧁 {componentCount} компонента
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ ...Typography.body2, color: Colors.text.secondary }}>
                          🍰 {recipe.total_servings} порции
                        </Text>
                      </View>
                    </View>

                    {/* Components List */}
                    {componentCount > 0 && (
                      <View style={{
                        backgroundColor: Colors.background.secondary,
                        borderRadius: BorderRadius.md,
                        padding: Spacing.md,
                        marginBottom: Spacing.md,
                      }}>
                        <Text style={{
                          ...Typography.caption,
                          color: Colors.text.secondary,
                          fontWeight: '600',
                          marginBottom: Spacing.sm,
                          letterSpacing: 0.5,
                        }}>
                          КОМПОНЕНТИ:
                        </Text>
                        {recipe.selected_components.map((comp, idx) => (
                          <Text
                            key={idx}
                            style={{
                              ...Typography.caption,
                              color: Colors.text.primary,
                              marginBottom: idx < recipe.selected_components.length - 1 ? Spacing.xs : 0,
                            }}
                          >
                            • {comp.name}
                          </Text>
                        ))}
                      </View>
                    )}

                    {/* Footer - Date */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: Spacing.md,
                      borderTopWidth: 1,
                      borderTopColor: Colors.border.light,
                    }}>
                      <Text style={{ ...Typography.caption, color: Colors.text.tertiary }}>
                        Създадена: {new Date(recipe.created_at).toLocaleDateString('bg-BG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Create New Recipe Button */}
            <TouchableOpacity
              onPress={() => router.push('/(modals)/visual-recipe-builder')}
              style={{
                backgroundColor: Colors.primary.main,
                borderRadius: BorderRadius.lg,
                padding: Spacing.base,
                alignItems: 'center',
                marginTop: Spacing.sm,
                ...Shadows.md,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Plus size={IconSize.md} color={Colors.text.inverse} strokeWidth={2.5} />
                <Text style={{
                  ...Typography.button,
                  color: Colors.text.inverse,
                  marginLeft: Spacing.sm,
                }}>
                  Създай Нова Рецепта
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
