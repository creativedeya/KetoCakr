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
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadows, IconSize } from '../constants/Theme';

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
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAllIngredients();
  }, []);

  // TODO: Enable custom prices when auth is implemented
  // async function setCustomPrice(ingredientId: string, price: number, notes?: string) {}
  // async function removeCustomPrice(ingredientId: string) {}

  async function loadAllIngredients() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ingredients_database')
        .select('id, name_en, name_bg, default_price, default_currency, price_unit')
        .order('name_bg');

      if (error) throw error;
      setAllIngredients(data || []);
    } catch (error) {
      console.error('Error loading ingredients:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredIngredients = allIngredients.filter(ing =>
    ing.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ing.name_bg.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading && allIngredients.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={[styles.loadingText, { marginTop: Spacing.base, color: Colors.text.secondary }]}> 
          Loading ingredients...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.background.secondary }]}> 
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.background.primary }]}> 
        <Text style={[styles.title, { color: Colors.text.primary }]}>Default Ingredient Prices</Text>
        <Text style={[styles.subtitle, { color: Colors.text.secondary }]}> 
          From {allIngredients.length} ingredients database
        </Text>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: Colors.background.primary }]}> 
        <Ionicons name="search" size={IconSize.sm} color={Colors.text.tertiary} />
        <TextInput
          style={[styles.searchInput, { color: Colors.text.primary }]}
          placeholder="Search ingredients..."
          placeholderTextColor={Colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}> 
        {filteredIngredients.map((ingredient) => (
          <View key={ingredient.id} style={[styles.card, { backgroundColor: Colors.background.primary }]}> 
            <View style={styles.ingredientInfo}> 
              <Text style={[styles.ingredientName, { color: Colors.text.primary }]}> 
                {ingredient.name_en}
              </Text>
              <Text style={[styles.ingredientNameBg, { color: Colors.text.secondary }]}> 
                {ingredient.name_bg}
              </Text>
            </View>

            <View style={styles.priceRow}> 
              <Text style={[styles.priceLabel, { color: Colors.text.secondary }]}>Price:</Text>
              <Text style={[styles.priceValue, { color: Colors.primary.main }]}> 
                {ingredient.default_price > 0
                  ? `${ingredient.default_price} ${ingredient.default_currency} / ${ingredient.price_unit}`
                  : 'Not set'}
              </Text>
            </View>
          </View>
        ))}
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
  loadingText: {
    ...Typography.body1,
    color: Colors.text.secondary,
  },
});