# FINAL TASK: Tab 2 Complete Search System (3 Modes)

**Status:** CRITICAL - Ready for execution  
**Timeline:** 4-5 hours  
**Complexity:** HIGH  
**Target:** Production-ready Tab 2  

---

## OVERVIEW

Tab 2 will have **3 independent search modes**:

1. **🔍 SEARCH MODE** - Text search + advanced filters
2. **🥘 PRODUCTS MODE** - Multi-select ingredients → find recipes
3. **🧪 TIPS MODE** - Lab Notes search

---

## VISUAL LAYOUT

### Main Tab 2 Screen:
```
┌─────────────────────────────────────┐
│  Търсене         ♥  🖼   🥘  🧪     │  ← Header with mode buttons
├─────────────────────────────────────┤
│  🔍 Търси рецепти...                │  ← Search box
├─────────────────────────────────────┤
│  ♥    ⏱    📌   🎛 Filter           │  ← Quick filters + advanced
├─────────────────────────────────────┤
│  [RECIPES GRID]                     │
│  ┌──────────────┬──────────────┐   │
│  │ 📷           │ 📷           │   │
│  │ Торта 1      │ Торта 2      │   │
│  │ 250kcal 5gNC │ 300kcal 7gNC │   │
│  └──────────────┴──────────────┘   │
│  ┌──────────────┬──────────────┐   │
│  │ 📷           │ 📷           │   │
│  │ Панакота     │ Мус          │   │
│  └──────────────┴──────────────┘   │
└─────────────────────────────────────┘
```

### Products Mode Modal:
```
┌─────────────────────────────────────┐
│  ← Назад     Избери продукти    ✓   │
├─────────────────────────────────────┤
│  🔍 Търси продукти...               │
├─────────────────────────────────────┤
│  ПОПУЛЯРНИ:                         │
│  ☑ Ягоди                           │
│  ☐ Еритритол                       │
│  ☐ Бадемово брашно                 │
│  ☐ Масло                           │
│  ☐ Яйца                            │
│  ☐ Шоколад                         │
│                                     │
│  [ПОКАЖИ РЕЦЕПТИ] (green button)    │
└─────────────────────────────────────┘
```

### Tips Mode Modal:
```
┌─────────────────────────────────────┐
│  ← Назад     🧪 Съвети         ✓   │
├─────────────────────────────────────┤
│  🔍 Търси съвети...                 │
│  (e.g. "шоколад + крем")            │
├─────────────────────────────────────┤
│  РЕЗУЛТАТИ:                         │
│  🧪 Шоколад + Крем                 │
│     Пайрва добре - 1:1 ratio        │
│     Нужно охлаждане                 │
│                                     │
│  🧪 Шоколад + Ганаш                │
│     Класическа комбинация           │
└─────────────────────────────────────┘
```

---

## FILE STRUCTURE

**Main file:** `Mobile/app/(tabs)/search/index.tsx`

**Components to create:**
1. `SearchModeComponent` - Text search + filters
2. `ProductsModeComponent` - Multi-select products
3. `TipsModeComponent` - Lab Notes search
4. `RecipesGrid` - Shared recipe display

**Hooks to create:**
1. `useSearchRecipes` - Query recipes by text/filters
2. `useProductRecipes` - Query recipes by ingredients
3. `useLabNotes` - Query lab notes

---

## STEP-BY-STEP IMPLEMENTATION

### STEP 0: Install Dependencies (2 min)

```bash
cd Mobile
npm install @react-native-community/slider
npx expo start --clear
```

---

### STEP 1: Create Hook - useSearchRecipes (20 min)

**File:** `Mobile/hooks/useSearchRecipes.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';

interface SearchFilters {
  query: string;
  timeMin: number;
  timeMax: number;
  caloriesMin: number;
  caloriesMax: number;
  carbsMin: number;
  carbsMax: number;
  dessertTypeId?: string;
  sortBy: 'newest' | 'rating' | 'time' | 'calories';
}

export const useSearchRecipes = (filters: SearchFilters) => {
  return useQuery({
    queryKey: ['searchRecipes', filters],
    queryFn: async () => {
      // Fetch from ALL recipe sources
      const [baseRecipes, readyRecipes, userRecipes] = await Promise.all([
        supabase
          .from('base_recipes')
          .select('id, name, name_bg, image_url, total_calories, total_net_carbs, recipe_role_id, dessert_type_id')
          .ilike('name', `%${filters.query}%`),
        
        supabase
          .from('ready_recipes')
          .select('id, name, name_bg, image_url, total_calories, total_net_carbs, dessert_type_id')
          .ilike('name', `%${filters.query}%`),
        
        supabase
          .from('user_recipes')
          .select('id, name, image_url, total_calories, total_net_carbs, dessert_type_id')
          .ilike('name', `%${filters.query}%`),
      ]);

      // Combine all results
      let allRecipes = [
        ...(baseRecipes.data || []),
        ...(readyRecipes.data || []),
        ...(userRecipes.data || []),
      ];

      // Apply nutrition filters
      allRecipes = allRecipes.filter(r => {
        const calories = r.total_calories || 0;
        const carbs = r.total_net_carbs || 0;

        return (
          calories >= filters.caloriesMin &&
          calories <= filters.caloriesMax &&
          carbs >= filters.carbsMin &&
          carbs <= filters.carbsMax
        );
      });

      // Apply dessert type filter
      if (filters.dessertTypeId) {
        allRecipes = allRecipes.filter(r => r.dessert_type_id === filters.dessertTypeId);
      }

      // Sort
      switch (filters.sortBy) {
        case 'rating':
          allRecipes.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'calories':
          allRecipes.sort((a, b) => (a.total_calories || 0) - (b.total_calories || 0));
          break;
        case 'newest':
        default:
          allRecipes.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      }

      return allRecipes;
    },
  });
};
```

**Checklist:**
- [ ] File created at correct path
- [ ] All imports work
- [ ] Export hook

---

### STEP 2: Create Hook - useProductRecipes (20 min)

**File:** `Mobile/hooks/useProductRecipes.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';

export const useProductRecipes = (selectedProductIds: string[]) => {
  return useQuery({
    queryKey: ['productRecipes', selectedProductIds],
    queryFn: async () => {
      if (selectedProductIds.length === 0) return [];

      // Find all recipes that contain AT LEAST ONE of selected products
      const [baseRecipes, readyRecipes, userRecipes] = await Promise.all([
        supabase
          .from('base_recipes')
          .select('id, name, name_bg, image_url, total_calories, total_net_carbs, recipe_ingredients(ingredient_id)'),
        
        supabase
          .from('ready_recipes')
          .select('id, name, name_bg, image_url, total_calories, total_net_carbs, recipe_ingredients(ingredient_id)'),
        
        supabase
          .from('user_recipes')
          .select('id, name, image_url, total_calories, total_net_carbs, selected_components'),
      ]);

      // Filter recipes that contain selected products
      const allRecipes = [
        ...(baseRecipes.data || []),
        ...(readyRecipes.data || []),
        ...(userRecipes.data || []),
      ].filter(recipe => {
        // For base/ready recipes: check ingredient list
        if (recipe.recipe_ingredients) {
          const ingredientIds = recipe.recipe_ingredients.map((ri: any) => ri.ingredient_id);
          return selectedProductIds.some(pid => ingredientIds.includes(pid));
        }
        return false;
      });

      return allRecipes;
    },
    enabled: selectedProductIds.length > 0,
  });
};
```

**Checklist:**
- [ ] File created
- [ ] Filter logic correct
- [ ] Export hook

---

### STEP 3: Create Hook - useLabNotes (15 min)

**File:** `Mobile/hooks/useLabNotes.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';

export const useLabNotes = (query: string) => {
  return useQuery({
    queryKey: ['labNotes', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const { data } = await supabase
        .from('lab_notes')
        .select('*')
        .or(
          `title.ilike.%${query}%,note.ilike.%${query}%,tips.ilike.%${query}%`
        )
        .limit(20);

      return data || [];
    },
  });
};
```

**Checklist:**
- [ ] File created
- [ ] Export hook

---

### STEP 4: Create RecipesGrid Component (20 min)

**File:** `Mobile/components/RecipesGrid.tsx`

```typescript
import React from 'react';
import {
  View,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';

interface Recipe {
  id: string;
  name?: string;
  name_bg?: string;
  image_url?: string;
  total_calories?: number;
  total_net_carbs?: number;
}

interface RecipesGridProps {
  recipes: Recipe[];
  isLoading: boolean;
  language: 'en' | 'bg';
}

export const RecipesGrid = ({ recipes, isLoading, language }: RecipesGridProps) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </View>
    );
  }

  if (recipes.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>
          {language === 'bg' ? 'Няма резултати' : 'No results'}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={recipes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push(`/recipe-detail/${item.id}`)}
        >
          {/* Recipe Image */}
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.image}
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={styles.placeholderText}>📷</Text>
            </View>
          )}

          {/* Recipe Info */}
          <View style={styles.info}>
            <Text style={styles.recipeName} numberOfLines={2}>
              {item.name_bg || item.name || 'Unnamed'}
            </Text>
            <Text style={styles.nutrition}>
              {item.total_calories || 0} kcal · {item.total_net_carbs || 0}g NC
            </Text>
          </View>
        </TouchableOpacity>
      )}
      numColumns={2}
      columnWrapperStyle={styles.gridRow}
      contentContainerStyle={styles.gridContainer}
      scrollEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  gridContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  gridRow: {
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.background.primary,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
  },
  info: {
    padding: 10,
  },
  recipeName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  nutrition: {
    fontSize: 12,
    color: Colors.primary.main,
    fontWeight: '600',
  },
});
```

**Checklist:**
- [ ] File created
- [ ] Image handling (with fallback)
- [ ] Navigation to recipe-detail works
- [ ] Export component

---

### STEP 5: Create SearchMode Component (30 min)

**File:** `Mobile/components/SearchMode.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useSearchRecipes } from '@/hooks/useSearchRecipes';
import { RecipesGrid } from './RecipesGrid';
import Colors from '@/constants/Colors';

interface SearchModeProps {
  language: 'en' | 'bg';
}

export const SearchMode = ({ language }: SearchModeProps) => {
  const [searchText, setSearchText] = useState('');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    query: searchText,
    timeMin: 0,
    timeMax: 120,
    caloriesMin: 0,
    caloriesMax: 1000,
    carbsMin: 0,
    carbsMax: 50,
    sortBy: 'newest' as const,
  });

  const { data: recipes = [], isLoading } = useSearchRecipes(filters);

  const activeFilterCount = [
    searchText && 1,
    filters.timeMin > 0 || filters.timeMax < 120,
    filters.caloriesMin > 0 || filters.caloriesMax < 1000,
  ].filter(Boolean).length;

  const handleSearch = (text: string) => {
    setSearchText(text);
    setFilters({ ...filters, query: text });
  };

  return (
    <ScrollView style={styles.container} scrollEnabled={false}>
      {/* Search Box */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={Colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder={language === 'bg' ? 'Търси рецепти...' : 'Search recipes...'}
          value={searchText}
          onChangeText={handleSearch}
          placeholderTextColor={Colors.text.secondary}
        />
      </View>

      {/* Quick Filters */}
      <View style={styles.quickFilters}>
        <TouchableOpacity style={styles.quickBtn}>
          <Ionicons name="heart-outline" size={20} color={Colors.primary.main} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn}>
          <Ionicons name="time" size={20} color={Colors.primary.main} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn}>
          <MaterialCommunityIcons name="pin" size={20} color={Colors.primary.main} />
        </TouchableOpacity>
      </View>

      {/* Filter Button */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setFilterModalOpen(true)}
        >
          <MaterialCommunityIcons name="filter-variant" size={20} color={Colors.primary.main} />
          <Text style={styles.filterBtnText}>
            {language === 'bg' ? 'Филтър' : 'Filter'}
          </Text>
          {activeFilterCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Recipes Grid */}
      <RecipesGrid recipes={recipes} isLoading={isLoading} language={language} />

      {/* Filter Modal */}
      <Modal
        visible={filterModalOpen}
        animationType="slide"
        onRequestClose={() => setFilterModalOpen(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setFilterModalOpen(false)}>
              <Text style={styles.modalBackBtn}>
                ← {language === 'bg' ? 'Назад' : 'Back'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {language === 'bg' ? 'Филтрирай' : 'Filter'}
            </Text>
            <TouchableOpacity onPress={() => setFilterModalOpen(false)}>
              <Ionicons name="checkmark" size={24} color={Colors.primary.main} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Calories Slider */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>
                {language === 'bg' ? 'Калории' : 'Calories'}: {filters.caloriesMin} - {filters.caloriesMax}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1000}
                step={50}
                value={filters.caloriesMin}
                onValueChange={(val) =>
                  setFilters({ ...filters, caloriesMin: val })
                }
                minimumTrackTintColor={Colors.primary.main}
                maximumTrackTintColor={Colors.background.secondary}
                thumbTintColor={Colors.primary.main}
              />
            </View>

            {/* Carbs Slider */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>
                {language === 'bg' ? 'Въглеводи (г)' : 'Carbs (g)'}: {filters.carbsMin} - {filters.carbsMax}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={50}
                step={1}
                value={filters.carbsMin}
                onValueChange={(val) =>
                  setFilters({ ...filters, carbsMin: val })
                }
                minimumTrackTintColor={Colors.primary.main}
                maximumTrackTintColor={Colors.background.secondary}
                thumbTintColor={Colors.primary.main}
              />
            </View>

            {/* Time Slider */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>
                {language === 'bg' ? 'Време (мин)' : 'Time (min)'}: {filters.timeMin} - {filters.timeMax}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={120}
                step={5}
                value={filters.timeMin}
                onValueChange={(val) =>
                  setFilters({ ...filters, timeMin: val })
                }
                minimumTrackTintColor={Colors.primary.main}
                maximumTrackTintColor={Colors.background.secondary}
                thumbTintColor={Colors.primary.main}
              />
            </View>

            {/* Sort By */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>
                {language === 'bg' ? 'Сортиране' : 'Sort by'}
              </Text>
              <View style={styles.sortOptions}>
                {['newest', 'rating', 'calories'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.sortBtn,
                      filters.sortBy === option && styles.sortBtnActive,
                    ]}
                    onPress={() => setFilters({ ...filters, sortBy: option as any })}
                  >
                    <Text
                      style={[
                        styles.sortBtnText,
                        filters.sortBy === option && styles.sortBtnTextActive,
                      ]}
                    >
                      {option === 'newest' && (language === 'bg' ? 'По ново' : 'Newest')}
                      {option === 'rating' && (language === 'bg' ? 'По рейтинг' : 'Rating')}
                      {option === 'calories' && (language === 'bg' ? 'По калории' : 'Calories')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: Colors.text.primary,
  },
  quickFilters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginVertical: 8,
  },
  quickBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBar: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    gap: 8,
  },
  filterBtnText: {
    color: Colors.primary.main,
    fontWeight: 'bold',
    fontSize: 16,
  },
  badge: {
    marginLeft: 'auto',
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    paddingTop: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.secondary,
  },
  modalBackBtn: {
    color: Colors.primary.main,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  slider: {
    height: 40,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sortBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    alignItems: 'center',
  },
  sortBtnActive: {
    backgroundColor: Colors.primary.main,
  },
  sortBtnText: {
    fontSize: 12,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  sortBtnTextActive: {
    color: 'white',
  },
});
```

**Checklist:**
- [ ] File created
- [ ] Search input works
- [ ] Sliders functional
- [ ] RecipesGrid shows results
- [ ] Filter modal opens/closes

---

### STEP 6: Create ProductsMode Component (30 min)

**File:** `Mobile/components/ProductsMode.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';
import { useProductRecipes } from '@/hooks/useProductRecipes';
import { RecipesGrid } from './RecipesGrid';
import Colors from '@/constants/Colors';

interface ProductsModeProps {
  language: 'en' | 'bg';
  onBack: () => void;
}

export const ProductsMode = ({ language, onBack }: ProductsModeProps) => {
  const [modalOpen, setModalOpen] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Fetch available products
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ingredients_database')
        .select('id, name, name_bg, image_url')
        .limit(100);
      return data || [];
    },
  });

  // Fetch recipes with selected products
  const { data: recipes = [], isLoading } = useProductRecipes(selectedProductIds);

  // Filter products by search
  const filteredProducts = products.filter(p =>
    (p.name_bg || p.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (p.name || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const toggleProduct = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  if (showResults) {
    return (
      <View style={styles.resultsContainer}>
        <TouchableOpacity
          style={styles.backToProducts}
          onPress={() => setShowResults(false)}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.primary.main} />
          <Text style={styles.backText}>
            {language === 'bg' ? 'Обратно' : 'Back'}
          </Text>
        </TouchableOpacity>
        <RecipesGrid recipes={recipes} isLoading={isLoading} language={language} />
      </View>
    );
  }

  return (
    <Modal
      visible={modalOpen}
      animationType="slide"
      onRequestClose={() => {
        setModalOpen(false);
        onBack();
      }}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              setModalOpen(false);
              onBack();
            }}
          >
            <Text style={styles.backBtn}>
              ← {language === 'bg' ? 'Назад' : 'Back'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {language === 'bg' ? 'Избери продукти' : 'Select Products'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Products */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={Colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={language === 'bg' ? 'Търси продукти...' : 'Search products...'}
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={Colors.text.secondary}
          />
        </View>

        {/* Selected Count */}
        {selectedProductIds.length > 0 && (
          <View style={styles.selectedCount}>
            <Text style={styles.selectedCountText}>
              {language === 'bg' ? 'Избрани' : 'Selected'}: {selectedProductIds.length}
            </Text>
          </View>
        )}

        {/* Products List */}
        <ScrollView style={styles.productsList}>
          {filteredProducts.map(product => (
            <TouchableOpacity
              key={product.id}
              style={styles.productItem}
              onPress={() => toggleProduct(product.id)}
            >
              <View style={styles.checkbox}>
                {selectedProductIds.includes(product.id) && (
                  <Ionicons name="checkmark" size={18} color="white" />
                )}
              </View>
              <Text style={styles.productName}>
                {product.name_bg || product.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Show Recipes Button */}
        <TouchableOpacity
          style={[
            styles.showButton,
            selectedProductIds.length === 0 && styles.showButtonDisabled,
          ]}
          onPress={() => setShowResults(true)}
          disabled={selectedProductIds.length === 0}
        >
          <Text style={styles.showButtonText}>
            {language === 'bg' ? 'Покажи рецепти' : 'Show Recipes'}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    paddingTop: 40,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.secondary,
  },
  backBtn: {
    color: Colors.primary.main,
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: Colors.text.primary,
  },
  selectedCount: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary.opacity[10],
    borderRadius: 8,
  },
  selectedCountText: {
    color: Colors.primary.main,
    fontWeight: '600',
    fontSize: 12,
  },
  productsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.secondary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.primary.main,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
  showButton: {
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 14,
    backgroundColor: Colors.primary.main,
    borderRadius: 12,
    alignItems: 'center',
  },
  showButtonDisabled: {
    opacity: 0.5,
  },
  showButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backToProducts: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  backText: {
    color: Colors.primary.main,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
```

**Checklist:**
- [ ] File created
- [ ] Multi-select works
- [ ] Search products works
- [ ] "Show Recipes" button works
- [ ] Recipes display correctly

---

### STEP 7: Create TipsMode Component (20 min)

**File:** `Mobile/components/TipsMode.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useLabNotes } from '@/hooks/useLabNotes';
import Colors from '@/constants/Colors';

interface TipsModeProps {
  language: 'en' | 'bg';
  onBack: () => void;
}

export const TipsMode = ({ language, onBack }: TipsModeProps) => {
  const [modalOpen, setModalOpen] = useState(true);
  const [query, setQuery] = useState('');
  const { data: tips = [] } = useLabNotes(query);

  return (
    <Modal
      visible={modalOpen}
      animationType="slide"
      onRequestClose={() => {
        setModalOpen(false);
        onBack();
      }}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              setModalOpen(false);
              onBack();
            }}
          >
            <Text style={styles.backBtn}>
              ← {language === 'bg' ? 'Назад' : 'Back'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            🧪 {language === 'bg' ? 'Съвети' : 'Tips'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Tips */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={Colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={language === 'bg' ? 'E.g. "шоколад + крем"' : 'E.g. "chocolate + cream"'}
            value={query}
            onChangeText={setQuery}
            placeholderTextColor={Colors.text.secondary}
          />
        </View>

        {/* Tips Results */}
        <ScrollView style={styles.tipsContainer}>
          {query.length >= 2 ? (
            tips.length > 0 ? (
              tips.map(tip => (
                <View key={tip.id} style={styles.tipCard}>
                  <Text style={styles.tipTitle}>🧪 {tip.title}</Text>
                  <Text style={styles.tipText}>{tip.note}</Text>
                  {tip.tips && (
                    <Text style={styles.tipHint}>💡 {tip.tips}</Text>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>
                  {language === 'bg' ? 'Няма съвети' : 'No tips found'}
                </Text>
              </View>
            )
          ) : (
            <View style={styles.centerContainer}>
              <Text style={styles.placeholderText}>
                {language === 'bg'
                  ? 'Напиши поне 2 символа...'
                  : 'Type at least 2 characters...'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.secondary,
  },
  backBtn: {
    color: Colors.primary.main,
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: Colors.text.primary,
  },
  tipsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tipCard: {
    backgroundColor: Colors.background.secondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginBottom: 6,
  },
  tipText: {
    fontSize: 13,
    color: Colors.text.primary,
    marginBottom: 6,
    lineHeight: 18,
  },
  tipHint: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
```

**Checklist:**
- [ ] File created
- [ ] Search works
- [ ] Tips display
- [ ] Modal opens/closes

---

### STEP 8: Create Main Tab 2 Component (30 min)

**File:** `Mobile/app/(tabs)/search/index.tsx` (REPLACE ENTIRE FILE)

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/hooks/useLanguage';
import { SearchMode } from '@/components/SearchMode';
import { ProductsMode } from '@/components/ProductsMode';
import { TipsMode } from '@/components/TipsMode';
import Colors from '@/constants/Colors';

type SearchMode = 'search' | 'products' | 'tips';

export default function SearchTab() {
  const { language } = useLanguage();
  const [activeMode, setActiveMode] = useState<SearchMode>('search');

  return (
    <View style={styles.container}>
      {/* Header with Mode Buttons */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {language === 'bg' ? 'Търсене' : 'Search'}
        </Text>
        <View style={styles.modeButtons}>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              activeMode === 'search' && styles.modeBtnActive,
            ]}
            onPress={() => setActiveMode('search')}
          >
            <Ionicons
              name="search"
              size={20}
              color={activeMode === 'search' ? 'white' : Colors.primary.main}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeBtn,
              activeMode === 'products' && styles.modeBtnActive,
            ]}
            onPress={() => setActiveMode('products')}
          >
            <MaterialCommunityIcons
              name="bottle-multiple"
              size={20}
              color={activeMode === 'products' ? 'white' : Colors.primary.main}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeBtn,
              activeMode === 'tips' && styles.modeBtnActive,
            ]}
            onPress={() => setActiveMode('tips')}
          >
            <MaterialCommunityIcons
              name="flask-outline"
              size={20}
              color={activeMode === 'tips' ? 'white' : Colors.primary.main}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content by Mode */}
      {activeMode === 'search' && <SearchMode language={language} />}
      {activeMode === 'products' && (
        <ProductsMode language={language} onBack={() => setActiveMode('search')} />
      )}
      {activeMode === 'tips' && (
        <TipsMode language={language} onBack={() => setActiveMode('search')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  modeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: Colors.primary.main,
  },
});
```

**Checklist:**
- [ ] File completely replaces old search/index.tsx
- [ ] All imports work
- [ ] Mode buttons work
- [ ] Each mode displays correctly
- [ ] Navigation between modes works

---

### STEP 9: Test on Device (1 hour)

```bash
npx expo start --clear
# Open on Android via Expo Go
```

**Test all 3 modes:**

#### **Mode 1: SEARCH** 🔍
- [ ] Type recipe name → results appear
- [ ] Click Filter → modal opens
- [ ] Adjust Calories slider → results update
- [ ] Change Sort → results re-sort
- [ ] Click recipe → goes to detail page
- [ ] Images show (or fallback emoji)

#### **Mode 2: PRODUCTS** 🥘
- [ ] Click product mode button
- [ ] Modal opens
- [ ] Search products works
- [ ] Select checkbox → product selected
- [ ] "Show Recipes" button enabled
- [ ] Click button → shows recipes with that product
- [ ] Back button returns to search
- [ ] Can select multiple products

#### **Mode 3: TIPS** 🧪
- [ ] Click tips mode button
- [ ] Modal opens
- [ ] Type "шоколад" → tips appear
- [ ] Tips display title + note + hint
- [ ] Back button returns to search

#### **General:**
- [ ] No console errors
- [ ] Smooth transitions
- [ ] Both languages work (BG/EN)
- [ ] Images load correctly
- [ ] Nutrition data shows (kcal, NC)

---

## VERIFICATION CHECKLIST

### Files Created
- [ ] `Mobile/hooks/useSearchRecipes.ts`
- [ ] `Mobile/hooks/useProductRecipes.ts`
- [ ] `Mobile/hooks/useLabNotes.ts`
- [ ] `Mobile/components/RecipesGrid.tsx`
- [ ] `Mobile/components/SearchMode.tsx`
- [ ] `Mobile/components/ProductsMode.tsx`
- [ ] `Mobile/components/TipsMode.tsx`
- [ ] `Mobile/app/(tabs)/search/index.tsx` (REPLACED)

### Dependencies
- [ ] @react-native-community/slider installed
- [ ] npm install executed successfully

### Functionality
- [ ] All 3 modes work independently
- [ ] Search mode filters recipes
- [ ] Products mode selects ingredients
- [ ] Tips mode finds advice
- [ ] Images display with fallback
- [ ] Bilingual (BG/EN)
- [ ] No crashes or errors

### UI/UX
- [ ] Mode buttons clearly visible
- [ ] Smooth mode transitions
- [ ] Modals open/close properly
- [ ] Sliders work smoothly
- [ ] Text is readable
- [ ] Colors match brand

---

## COMMON ISSUES & SOLUTIONS

### Issue: "Cannot find module useSearchRecipes"
**Solution:**
```bash
# Check file path is correct
ls Mobile/hooks/useSearchRecipes.ts

# Clear cache
npx expo start --clear
```

### Issue: Images not showing
**Solution:** Check image_url is valid in database:
```sql
SELECT id, name, image_url FROM base_recipes LIMIT 5;
```

### Issue: Recipes not filtering
**Solution:** Check database fields match code (total_calories, total_net_carbs)

### Issue: Products modal doesn't close
**Solution:** Verify onBack function is called correctly

---

## SUCCESS CRITERIA

✅ **Tab 2 is production-ready when:**
- All 3 modes work without errors
- All test cases pass
- Images display correctly
- Bilingual works
- No console errors
- Smooth performance
- Ready for App Store

---

## NEXT STEPS

1. **Commit changes:**
```bash
git add Mobile/
git commit -m "feat: Complete Tab 2 with 3 search modes (search/products/tips)"
git push
```

2. **Test on multiple devices**
3. **Gather feedback**
4. **Prepare for App Store submission**

---

**Execute STEP 0-9 in order. Do NOT skip steps.** 🚀

Generated: 2026-05-22
Priority: CRITICAL
Status: READY FOR EXECUTION
Timeline: 4-5 hours