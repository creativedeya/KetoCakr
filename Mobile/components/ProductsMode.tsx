import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Colors } from '../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../constants/Theme';
import { useProductRecipes } from '../api/hooks/useProductRecipes';
import { RecipesGrid } from './RecipesGrid';

interface Product {
  id: string;
  name_en: string;
  name_bg: string;
  image_url?: string | null;
}

interface ProductsModeProps {
  language: 'en' | 'bg';
  onBack: () => void;
}

export const ProductsMode = ({ language, onBack }: ProductsModeProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showResults, setShowResults] = useState(false);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['ingredientsDatabase'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredients_database')
        .select('id, name_en, name_bg, image_url')
        .order('name_bg', { ascending: true })
        .limit(200);
      if (error) return [];
      return (data as Product[]) || [];
    },
  });

  const { data: recipes = [], isLoading: recipesLoading } = useProductRecipes(selectedIds);

  const filtered = useMemo(() => {
    const q = searchText.toLowerCase();
    return products.filter(p =>
      (p.name_bg || '').toLowerCase().includes(q) ||
      (p.name_en || '').toLowerCase().includes(q)
    );
  }, [products, searchText]);

  const toggleProduct = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  if (showResults) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backRow} onPress={() => setShowResults(false)}>
          <Ionicons name="chevron-back" size={20} color={Colors.primary.main} />
          <Text style={styles.backText}>
            {language === 'bg' ? 'Обратно към продукти' : 'Back to products'}
          </Text>
        </TouchableOpacity>
        <RecipesGrid recipes={recipes} isLoading={recipesLoading} language={language} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backBtn}>
            ← {language === 'bg' ? 'Назад' : 'Back'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {language === 'bg' ? 'Избери продукти' : 'Select Products'}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={Colors.text.tertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder={language === 'bg' ? 'Търси продукти...' : 'Search products...'}
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor={Colors.text.tertiary}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={16} color={Colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Selected count badge */}
      {selectedIds.length > 0 && (
        <View style={styles.selectedBadge}>
          <Text style={styles.selectedBadgeText}>
            {language === 'bg' ? 'Избрани' : 'Selected'}: {selectedIds.length}
          </Text>
          <TouchableOpacity onPress={() => setSelectedIds([])}>
            <Text style={styles.clearSelectedText}>
              {language === 'bg' ? 'Изчисти' : 'Clear'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Products Grid */}
      {productsLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color={Colors.primary.main} />
        </View>
      ) : (
        <ScrollView style={styles.gridScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.gridContainer}>
            {filtered.map(product => {
              const isSelected = selectedIds.includes(product.id);
              const displayName = language === 'bg'
                ? (product.name_bg || product.name_en)
                : (product.name_en || product.name_bg);

              return (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => toggleProduct(product.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.avatarContainer, isSelected && styles.avatarContainerSelected]}>
                    {product.image_url ? (
                      <Image source={{ uri: product.image_url }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <MaterialCommunityIcons name="food-apple" size={28} color={Colors.primary.main} />
                      </View>
                    )}
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={13} color={Colors.text.inverse} />
                      )}
                    </View>
                  </View>
                  <Text style={styles.productName} numberOfLines={2}>
                    {displayName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {filtered.length === 0 && (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                {language === 'bg' ? 'Няма продукти' : 'No products found'}
              </Text>
            </View>
          )}
          <View style={{ height: 16 }} />
        </ScrollView>
      )}

      {/* Show Recipes Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.showBtn, selectedIds.length === 0 && styles.showBtnDisabled]}
          onPress={() => setShowResults(true)}
          disabled={selectedIds.length === 0}
        >
          <Text style={styles.showBtnText}>
            {language === 'bg' ? 'Покажи рецепти' : 'Show Recipes'}
            {selectedIds.length > 0 && ` (${selectedIds.length})`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backBtn: {
    color: Colors.primary.main,
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    height: 44,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: 14,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primary.opacity[10],
    borderRadius: BorderRadius.sm,
  },
  selectedBadgeText: {
    color: Colors.primary.main,
    fontWeight: '600',
    fontSize: 13,
  },
  clearSelectedText: {
    color: Colors.error.main,
    fontWeight: '600',
    fontSize: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  gridScroll: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
  },
  productCard: {
    width: '31%',
    marginBottom: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  avatarContainerSelected: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.opacity[5],
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
  },
  checkbox: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  productName: {
    fontSize: 11,
    color: Colors.text.primary,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 15,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  showBtn: {
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
  showBtnDisabled: {
    opacity: 0.4,
  },
  showBtnText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  backText: {
    color: Colors.primary.main,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
