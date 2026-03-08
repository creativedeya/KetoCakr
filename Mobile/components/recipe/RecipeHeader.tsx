// ===========================================================
// FILE: mobile/components/recipe/RecipeHeader.tsx
// PART 5: Recipe detail header with actions
// ===========================================================
import { View, Text, TouchableOpacity, Share, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useToggleFavorite, useDeleteUserRecipe } from '../../api/hooks';
import { router } from 'expo-router';

// Icon wrappers
const Heart = (props: any) => <Ionicons name="heart" {...props} />;
const Share2 = (props: any) => <Ionicons name="share-outline" {...props} />;
const Trash2 = (props: any) => <Ionicons name="trash-outline" {...props} />;
const Clock = (props: any) => <Ionicons name="time-outline" {...props} />;
const Users = (props: any) => <Ionicons name="people-outline" {...props} />;

interface RecipeHeaderProps {
  recipeId: string;
  name: string;
  dessertTypeName: string;
  totalServings: number;
  isFavorite: boolean;
  componentCount: number;
}

export default function RecipeHeader({
  recipeId,
  name,
  dessertTypeName,
  totalServings,
  isFavorite,
  componentCount,
}: RecipeHeaderProps) {
  const toggleFavorite = useToggleFavorite();
  const deleteRecipe = useDeleteUserRecipe();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Виж моята ${name} рецепта в KetoCakr!`,
        title: name,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Изтриване на рецепта',
      'Сигурни ли сте, че искате да изтриете тази рецепта?',
      [
        { text: 'Откажи', style: 'cancel' },
        {
          text: 'Изтрий',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecipe.mutateAsync(recipeId);
              Alert.alert('Успех', 'Рецептата беше изтрита');
              router.back();
            } catch (error) {
              Alert.alert('Грешка', 'Неуспешно изтриване');
            }
          },
        },
      ]
    );
  };

  const handleToggleFavorite = () => {
    toggleFavorite.mutate({
      recipeId,
      isFavorite: !isFavorite,
    });
  };

  return (
    <LinearGradient
      colors={[Colors.primary.main, Colors.primary.dark]}
      className="px-6 pt-16 pb-8"
    >
      {/* Recipe name */}
      <Text className="text-3xl font-bold mb-2" style={{ color: Colors.text.inverse }}>
        {name}
      </Text>

      {/* Dessert type */}
      <View className="self-start px-3 py-1 rounded-full mb-4" style={{ backgroundColor: Colors.primary.light }}>
        <Text className="font-semibold" style={{ color: Colors.text.inverse }}>
          {dessertTypeName}
        </Text>
      </View>

      {/* Stats */}
      <View className="flex-row items-center mb-6">
        <View className="flex-row items-center mr-6">
          <Users size={18} color={Colors.text.inverse} />
          <Text className="ml-2 font-semibold" style={{ color: Colors.text.inverse }}>
            {totalServings} порции
          </Text>
        </View>
        <View className="flex-row items-center">
          <Clock size={18} color={Colors.text.inverse} />
          <Text className="ml-2 font-semibold" style={{ color: Colors.text.inverse }}>
            {componentCount} компонента
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={handleToggleFavorite}
          className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
          style={{
            backgroundColor: isFavorite ? Colors.error.main : 'rgba(255,255,255,0.2)'
          }}
        >
          <Heart
            size={20}
            color={Colors.text.inverse}
          />
          <Text className="font-bold ml-2" style={{ color: Colors.text.inverse }}>
            {isFavorite ? 'Премахни' : 'Любима'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleShare}
          className="px-4 py-3 rounded-xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
          <Share2 size={20} color={Colors.text.inverse} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDelete}
          className="px-4 py-3 rounded-xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
          <Trash2 size={20} color={Colors.text.inverse} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
