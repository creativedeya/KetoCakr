import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../constants/Theme';

interface RecipeCardProps {
  recipe: {
    id: string;
    name_bg?: string;
    name_en: string;
    hero_image_url?: string;
    total_calories?: number;
    total_servings?: number;
    difficulty_level?: number;
    dessert_type?: { name: string; image_url?: string };
  };
  onPress: () => void;
  size?: 'small' | 'large';
}

export default function RecipeCard({ recipe, onPress, size = 'small' }: RecipeCardProps) {
  const name = recipe.name_bg || recipe.name_en;
  const isSmall = size === 'small';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, isSmall ? styles.cardSmall : styles.cardLarge]}
      activeOpacity={0.85}
    >
      {/* Image */}
      {recipe.hero_image_url ? (
        <Image
          source={{ uri: recipe.hero_image_url }}
          style={[styles.image, isSmall ? styles.imageSmall : styles.imageLarge]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.imagePlaceholder, isSmall ? styles.imageSmall : styles.imageLarge]}>
          <Text style={styles.placeholderEmoji}>🎂</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{name}</Text>

        <View style={styles.badges}>
          {recipe.total_calories ? (
            <View style={styles.calorieBadge}>
              <Text style={styles.calorieBadgeText}>
                {Math.round(recipe.total_calories)} kcal
              </Text>
            </View>
          ) : null}
          {recipe.total_servings ? (
            <View style={styles.servingsBadge}>
              <Text style={styles.servingsBadgeText}>
                {recipe.total_servings} порц.
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  cardSmall: {
    width: 180,
    height: 240,
  },
  cardLarge: {
    flex: 1,
    minHeight: 220,
  },
  image: {
    width: '100%',
  },
  imageSmall: {
    height: 140,
  },
  imageLarge: {
    height: 140,
  },
  imagePlaceholder: {
    width: '100%',
    backgroundColor: Colors.background.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 40,
  },
  content: {
    padding: Spacing.md,
    flex: 1,
  },
  name: {
    ...Typography.body2,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  calorieBadge: {
    backgroundColor: Colors.nutrition.calories + '22',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  calorieBadgeText: {
    ...Typography.caption,
    color: Colors.nutrition.calories,
    fontWeight: '600',
  },
  servingsBadge: {
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  servingsBadgeText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
});
