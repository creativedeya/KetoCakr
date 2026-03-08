// ===========================================================
// FILE: mobile/app/favorites/index.tsx
// PART 2: Favorites screen - list of favorite recipes
// ===========================================================
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useAuthStore } from '../../store/useAuthStore';
import { useUserRecipes } from '../../api/hooks';
import { useTranslation } from '../../constants/i18n';

// Icon wrappers
const ChevronLeft = (props: any) => <Ionicons name="chevron-back" {...props} />;
const Heart = (props: any) => <Ionicons name="heart" {...props} />;
const Sparkles = (props: any) => <Ionicons name="sparkles" {...props} />;

export default function FavoritesScreen() {
  const user = useAuthStore((state) => state.user);
  const { data: recipes, isLoading } = useUserRecipes();
  const { t } = useTranslation();

  const favoriteRecipes = recipes?.filter(r => r.is_favorite) || [];

  if (!user) {
    return (
      <View className="flex-1 bg-white">
        <View className="px-6 pt-16 pb-6 flex-row items-center" style={{ backgroundColor: Colors.error.main }}>
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ChevronLeft size={24} color={Colors.text.inverse} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold flex-1" style={{ color: Colors.text.inverse }}>
            {t('favorites.title')}
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-6xl mb-4">🔒</Text>
          <Text className="text-xl font-bold mb-2 text-center" style={{ color: Colors.text.primary }}>
            {t('profile.login.title')}
          </Text>
          <Text className="text-center mb-6" style={{ color: Colors.text.secondary }}>
            {t('favorites.loginRequired.description')}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/signin')}
            className="rounded-xl px-8 py-4"
            style={{ backgroundColor: Colors.error.main }}
          >
            <Text className="font-bold text-base" style={{ color: Colors.text.inverse }}>
              {t('profile.login.signIn')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="px-6 pt-16 pb-6 flex-row items-center" style={{ backgroundColor: Colors.error.main }}>
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ChevronLeft size={24} color={Colors.text.inverse} />
          </TouchableOpacity>
          <Heart size={24} color={Colors.text.inverse} />
          <Text className="text-2xl font-bold ml-3 flex-1" style={{ color: Colors.text.inverse }}>
            {t('favorites.title')}
          </Text>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={Colors.error.main} />
          </View>
        ) : favoriteRecipes.length > 0 ? (
          <ScrollView className="flex-1 px-6 pt-6">
            <Text className="text-sm text-gray-600 mb-4">
              {favoriteRecipes.length} {favoriteRecipes.length === 1 ? t('favorites.count.single') : t('favorites.count.plural')}
            </Text>

            {favoriteRecipes.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                onPress={() => router.push(`/user-recipe/${recipe.id}`)}
                className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-5 mb-4 border-2 border-red-100"
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <Heart size={16} color={Colors.error.main} />
                      <Text className="text-lg font-bold ml-2" style={{ color: Colors.text.primary }}>
                        {recipe.name}
                      </Text>
                    </View>
                    <Text className="text-sm" style={{ color: Colors.text.secondary }}>
                      {recipe.dessert_type?.name_bg}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center pt-3 border-t border-red-100">
                  <View className="bg-red-100 rounded-lg px-3 py-1">
                    <Text className="text-red-700 font-semibold text-xs">
                      {recipe.total_servings} {t('favorites.servings')}
                    </Text>
                  </View>
                  <Text className="text-gray-400 mx-2">•</Text>
                  <Text className="text-xs text-gray-500">
                    {recipe.components?.length || 0} {t('favorites.components')}
                  </Text>
                  <Text className="text-gray-400 mx-2">•</Text>
                  <Text className="text-xs text-gray-500">
                    {new Date(recipe.created_at).toLocaleDateString('bg-BG')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            <View className="h-20" />
          </ScrollView>
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-6xl mb-4">💔</Text>
            <Text className="text-xl font-bold mb-2 text-center" style={{ color: Colors.text.primary }}>
              {t('favorites.empty.title')}
            </Text>
            <Text className="text-center mb-6" style={{ color: Colors.text.secondary }}>
              {t('favorites.empty.description')}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/recipes')}
              className="rounded-xl px-6 py-3 flex-row items-center"
              style={{ backgroundColor: Colors.error.main }}
            >
              <Sparkles size={20} color={Colors.text.inverse} />
              <Text className="font-bold text-base ml-2" style={{ color: Colors.text.inverse }}>
                {t('favorites.empty.browse')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
}
