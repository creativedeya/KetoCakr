import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useUserPricesStore } from '../store/useUserPricesStore';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadows, IconSize } from '../constants/Theme';
import { useTranslation } from '../constants/i18n';

interface Ingredient {
  id: string;
  name_en: string;
  name_bg: string;
  default_price: number;
  default_currency: string;
  price_unit: string;
}

export default function IngredientPricesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    ingredients,
    isLoading,
    loadIngredients,
    getEffectivePrice,
    setCustomPrice,
    removeCustomPrice,
    getCustomPricesCount,
    currency,
  } = useUserPricesStore();

  // local editing state for a single inline editor
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  useEffect(() => {
    loadIngredients();
  }, []);

  const filteredIngredients = ingredients.filter((ing) =>
    ing.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ing.name_bg.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading && ingredients.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={[styles.loadingText, { marginTop: Spacing.base, color: Colors.text.secondary }]}>
          {t('ingredientPrices.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.background.secondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.background.primary }]}>
        <Text style={[styles.title, { color: Colors.text.primary }]}>{t('ingredientPrices.title')}</Text>
        <Text style={[styles.subtitle, { color: Colors.text.secondary }]}>
          {ingredients.length} {t('ingredientPrices.subtitle')}
        </Text>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: Colors.background.primary }]}>
        <Ionicons name="search" size={IconSize.sm} color={Colors.text.tertiary} />
        <TextInput
          style={[styles.searchInput, { color: Colors.text.primary }]}
          placeholder={t('ingredientPrices.search')}
          placeholderTextColor={Colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredIngredients.map((ingredient) => {
          const effective = getEffectivePrice(ingredient.id);
          const isEditing = editingId === ingredient.id;

          return (
            <View key={ingredient.id} style={[styles.card, { backgroundColor: Colors.background.primary }]}>
              <View style={styles.ingredientInfo}>
                <Text style={[styles.ingredientName, { color: Colors.text.primary }]}>
                  {ingredient.name_en}
                </Text>
                <Text style={[styles.ingredientNameBg, { color: Colors.text.secondary }]}>
                  {ingredient.name_bg}
                </Text>
              </View>

              <View style={[styles.priceRow, { alignItems: 'center' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.priceLabel, { color: Colors.text.secondary }]}>{t('ingredientPrices.priceLabel')}</Text>
                  <Text style={[styles.priceValue, { color: Colors.primary.main }]}>
                    {effective !== null
                      ? `${effective} ${currency} / ${ingredient.price_unit}`
                      : t('ingredientPrices.notSet')}
                  </Text>
                </View>

                {isEditing ? (
                  <View style={styles.editRow}>
                    <TextInput
                      keyboardType="numeric"
                      value={editValue}
                      onChangeText={setEditValue}
                      placeholder="0.00"
                      placeholderTextColor={Colors.text.tertiary}
                      style={[styles.editInput, { color: Colors.text.primary, borderColor: Colors.border.light }]}
                    />
                    <TouchableOpacity
                      onPress={async () => {
                        const parsed = parseFloat(editValue || '0');
                        if (!isNaN(parsed)) {
                          await setCustomPrice(ingredient.id, parsed);
                        }
                        setEditingId(null);
                      }}
                      style={styles.iconButton}
                    >
                      <Ionicons name="checkmark" size={IconSize.md} color={Colors.primary.main} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={async () => {
                        await removeCustomPrice(ingredient.id);
                        setEditingId(null);
                      }}
                      style={styles.iconButton}
                    >
                      <Ionicons name="trash" size={IconSize.md} color={Colors.error.main} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setEditingId(null)} style={styles.iconButton}>
                      <Ionicons name="close" size={IconSize.md} color={Colors.text.secondary} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.rowActions}>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingId(ingredient.id);
                        setEditValue(String(effective ?? ingredient.default_price ?? 0));
                      }}
                      style={styles.iconButton}
                    >
                      <Ionicons name="pencil" size={IconSize.md} color={Colors.text.secondary} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          );
        })}
        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    backgroundColor: Colors.background.primary,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  title: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  searchInput: {
    flex: 1,
    ...Typography.body1,
    color: Colors.text.primary,
  },
  list: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  ingredientNameBg: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  priceLabel: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },
  priceValue: {
    ...Typography.body1,
    color: Colors.primary.main,
    fontWeight: '600',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    width: 96,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.sm,
    ...Typography.body1,
  },
  iconButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body1,
    color: Colors.text.secondary,
  },
});
