# Update Task: ProductsMode - Beautiful 3-Column Grid with Avatars

**Status:** COSMETIC - Nice to have  
**Timeline:** 30-45 minutes  
**Priority:** MEDIUM  
**Scope:** Only ProductsMode component update  

---

## OBJECTIVE

Redesign ProductsMode to show products in a beautiful 3-column grid with:
- ✅ Product avatars (image_url)
- ✅ Product name below avatar
- ✅ 3 columns per row (compact)
- ✅ Checkbox in top-right corner
- ✅ Much less scrolling
- ✅ Touch-friendly tap area

---

## VISUAL BEFORE vs AFTER

### BEFORE (Current - List):
```
┌─────────────────────────┐
│  ← Назад  Избери продукти   │
├─────────────────────────┤
│  🔍 Търси продукти...   │
├─────────────────────────┤
│ ☐ Ягоди                 │
│ ☐ Еритритол             │
│ ☐ Бадемово брашно       │
│ ☐ Масло                 │
│ ☐ Яйца                  │
│ ☐ Шоколад               │
│ ☐ Крем                  │
│ ☐ Масло кокосово        │
│ ... (много скрол)       │
└─────────────────────────┘
```

### AFTER (New - 3-Column Grid):
```
┌─────────────────────────────────┐
│  ← Назад  Избери продукти    ✓  │
├─────────────────────────────────┤
│  🔍 Търси продукти...           │
├─────────────────────────────────┤
│ ┌──────┐  ┌──────┐  ┌──────┐   │
│ │  ✓   │  │      │  │      │   │
│ │ 🍓   │  │ 🍯   │  │ 🍫   │   │
│ │Ягоди │  │Еритр │  │Шокол │   │
│ └──────┘  └──────┘  └──────┘   │
│ ┌──────┐  ┌──────┐  ┌──────┐   │
│ │      │  │      │  │      │   │
│ │ 🧈   │  │ 🥚   │  │ 🍞   │   │
│ │Масло │  │Яйца  │  │Брашно│   │
│ └──────┘  └──────┘  └──────┘   │
│ ... (намного по-малко скрол)   │
│                                 │
│ [ПОКАЖИ РЕЦЕПТИ]                │
└─────────────────────────────────┘
```

---

## STEP-BY-STEP IMPLEMENTATION

### STEP 1: Replace ProductsMode Component (40 min)

**File:** `Mobile/components/ProductsMode.tsx`

**ACTION:** Delete entire file and replace with this:

```typescript
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
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

interface Product {
  id: string;
  name: string;
  name_bg: string;
  image_url?: string;
}

export const ProductsMode = ({ language, onBack }: ProductsModeProps) => {
  const [modalOpen, setModalOpen] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Fetch available products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ingredients_database')
        .select('id, name, name_bg, image_url')
        .limit(100);
      return (data as Product[]) || [];
    },
  });

  // Fetch recipes with selected products
  const { data: recipes = [], isLoading: recipesLoading } = useProductRecipes(selectedProductIds);

  // Filter products by search
  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      (p.name_bg || p.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (p.name || '').toLowerCase().includes(searchText.toLowerCase())
    );
  }, [products, searchText]);

  const toggleProduct = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // If showing results
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
        <RecipesGrid recipes={recipes} isLoading={recipesLoading} language={language} />
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

        {/* Selected Count Badge */}
        {selectedProductIds.length > 0 && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>
              {language === 'bg' ? 'Избрани' : 'Selected'}: {selectedProductIds.length}
            </Text>
          </View>
        )}

        {/* Products Grid */}
        <ScrollView style={styles.productsGrid}>
          {productsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary.main} />
            </View>
          ) : filteredProducts.length > 0 ? (
            <View style={styles.gridContainer}>
              {filteredProducts.map((product, index) => {
                const isSelected = selectedProductIds.includes(product.id);
                
                return (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.productCard}
                    onPress={() => toggleProduct(product.id)}
                  >
                    {/* Product Avatar Container */}
                    <View
                      style={[
                        styles.avatarContainer,
                        isSelected && styles.avatarContainerSelected,
                      ]}
                    >
                      {/* Product Image */}
                      {product.image_url ? (
                        <Image
                          source={{ uri: product.image_url }}
                          style={styles.avatar}
                        />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <MaterialCommunityIcons
                            name="bottle"
                            size={32}
                            color={Colors.primary.main}
                          />
                        </View>
                      )}

                      {/* Checkbox (Top-Right) */}
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected,
                        ]}
                      >
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color="white"
                            style={{ fontWeight: 'bold' }}
                          />
                        )}
                      </View>
                    </View>

                    {/* Product Name */}
                    <Text
                      style={styles.productName}
                      numberOfLines={2}
                    >
                      {product.name_bg || product.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.emptyText}>
                {language === 'bg' ? 'Няма продукти' : 'No products found'}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Show Recipes Button */}
        <View style={styles.bottomAction}>
          <TouchableOpacity
            style={[
              styles.showButton,
              selectedProductIds.length === 0 && styles.showButtonDisabled,
            ]}
            onPress={() => setShowResults(true)}
            disabled={selectedProductIds.length === 0}
          >
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.showButtonText}>
              {language === 'bg' ? 'Покажи рецепти' : 'Show Recipes'}
              {selectedProductIds.length > 0 && ` (${selectedProductIds.length})`}
            </Text>
          </TouchableOpacity>
        </View>
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
    fontWeight: '600',
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
    fontSize: 14,
  },
  selectedBadge: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.primary.opacity[10] || 'rgba(168, 0, 72, 0.1)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  selectedBadgeText: {
    color: Colors.primary.main,
    fontWeight: '600',
    fontSize: 12,
  },
  productsGrid: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '31%', // 3 columns with small gaps
    marginBottom: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  avatarContainerSelected: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.opacity[5] || 'rgba(168, 0, 72, 0.05)',
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
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 2,
    borderColor: Colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  productName: {
    fontSize: 12,
    color: Colors.text.primary,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
  bottomAction: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.background.secondary,
  },
  showButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary.main,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
```

**Checklist:**
- [ ] File completely replaced
- [ ] All imports correct
- [ ] 3-column grid layout (31% width per card)
- [ ] Product avatars show
- [ ] Checkbox in top-right corner
- [ ] Selected state styling works
- [ ] Search still works
- [ ] No console errors

---

### STEP 2: Test on Device (15 min)

```bash
npx expo start --clear
# Open on Android via Expo Go
```

**Test Cases:**
- [ ] Products Mode opens
- [ ] Products show in 3-column grid
- [ ] Images load (or fallback icon)
- [ ] Checkbox appears in top-right
- [ ] Click checkbox → toggles selected
- [ ] Selected card has blue border
- [ ] Product name shows below
- [ ] Search filters products
- [ ] Selected count shows in badge
- [ ] "Show Recipes" button enabled when selected
- [ ] Click → shows recipes with selected products
- [ ] Back button returns to products
- [ ] Much less scrolling needed
- [ ] No console errors

---

## VISUAL DETAILS

### Product Card Layout:
```
┌─────────────┐
│      ✓      │  ← Checkbox (top-right, semi-transparent bg)
│             │
│    🍓       │  ← Avatar image (1:1 aspect ratio)
│    [IMG]    │
│             │
│      ✓      │  ← Checkbox (when selected)
└─────────────┘
   Ягоди      ← Product name (max 2 lines)
```

### Spacing:
- 3 columns per row
- ~4% gap between columns
- ~20px margin bottom between rows
- Responsive to screen size

### Colors:
- **Unselected:** Gray background, subtle border
- **Selected:** Blue border, light blue background, blue checkbox
- **Checkbox:** White checkmark on selected state

---

## BEFORE vs AFTER COMPARISON

| Aspect | BEFORE | AFTER |
|--------|--------|-------|
| Layout | List (one per row) | Grid (3 per row) |
| Images | None | Product avatars |
| Checkbox | Left side | Top-right corner |
| Space | Wasteful | Compact |
| Scrolling | Long | Short |
| Visual appeal | Basic | Beautiful |
| Touch area | Text only | Entire card |

---

## SUCCESS CRITERIA

✅ **ProductsMode update complete when:**
- 3-column grid displays
- Product images/avatars show
- Checkbox in corner works
- Much less scrolling
- Still functional (search, select, show recipes)
- Looks beautiful and modern
- No bugs or errors

---

**Execute STEP 1-2. This is a quick polish that makes huge impact!** ✨

Generated: 2026-05-23
Priority: MEDIUM
Status: READY FOR EXECUTION
Timeline: 30-45 minutes