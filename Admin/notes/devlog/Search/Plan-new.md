# URGENT TASK: Modernize KetoCakR Tab 2 Search

**Status:** BLOCKING - Must complete before App Store submission  
**Timeline:** 6 hours  
**Complexity:** HIGH  
**Deadline:** Today  

---

## OBJECTIVE

Replace `Mobile/app/(tabs)/search/index.tsx` completely with modern search interface featuring:
- Advanced filter modal with sliders
- Lab Notes search
- Quick filters (Favorites, Recent, Pinned)
- Professional UX matching current design system

---

## CRITICAL: WHAT TO CHANGE

### CURRENT STATE (WRONG)
```
Tab 2 Search shows:
- Basic search bar
- Simple category pills (Всички, < 100, 100-150, etc.)
- Grid results
```

### DESIRED STATE (CORRECT)
```
Tab 2 Search shows:
- Search bar
- 3 Quick filter buttons (♥ ⏱ 📌)
- "Filter 🎛" button that opens advanced modal
- Grid results
- Modal contains: Time slider, Calorie slider, Carbs slider, Fat slider, Protein slider, Sort dropdown, Lab Notes search
```

---

## STEP-BY-STEP EXECUTION

### STEP 1: Install Dependencies (5 minutes)

```bash
cd Mobile
npm install @react-native-community/slider
npx expo start --clear
```

**Verify:** No error messages about missing slider library

---

### STEP 2: Create Complete Search Component (90 minutes)

**File:** `Mobile/app/(tabs)/search/index.tsx`

**ACTION:** Delete entire file content and replace with this:

```typescript
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';
import Colors from '@/constants/Colors';
import { useLanguage } from '@/hooks/useLanguage';

// Types
interface SearchFilters {
  searchText: string;
  timeMin: number;
  timeMax: number;
  caloriesMin: number;
  caloriesMax: number;
  carbsMin: number;
  carbsMax: number;
  fatMin: number;
  fatMax: number;
  proteinMin: number;
  proteinMax: number;
  favorites: boolean;
  recent: boolean;
  pinned: boolean;
  sortBy: 'default' | 'rating' | 'time' | 'calories';
  labNotesQuery: string;
}

const defaultFilters: SearchFilters = {
  searchText: '',
  timeMin: 0,
  timeMax: 120,
  caloriesMin: 0,
  caloriesMax: 1000,
  carbsMin: 0,
  carbsMax: 50,
  fatMin: 0,
  fatMax: 100,
  proteinMin: 0,
  proteinMax: 50,
  favorites: false,
  recent: false,
  pinned: false,
  sortBy: 'default',
  labNotesQuery: '',
};

export default function SearchTab() {
  const { language } = useLanguage();
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [labNotesModalOpen, setLabNotesModalOpen] = useState(false);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchText) count++;
    if (filters.timeMin > 0 || filters.timeMax < 120) count++;
    if (filters.caloriesMin > 0 || filters.caloriesMax < 1000) count++;
    if (filters.carbsMin > 0 || filters.carbsMax < 50) count++;
    if (filters.favorites || filters.recent || filters.pinned) count++;
    if (filters.labNotesQuery) count++;
    return count;
  }, [filters]);

  // Fetch recipes
  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['search', filters],
    queryFn: async () => {
      let query = supabase
        .from('base_recipes')
        .select('*');

      if (filters.searchText) {
        query = query.ilike('name', `%${filters.searchText}%`);
      }

      if (filters.caloriesMin > 0) {
        query = query.gte('total_calories', filters.caloriesMin);
      }
      if (filters.caloriesMax < 1000) {
        query = query.lte('total_calories', filters.caloriesMax);
      }

      if (filters.carbsMin > 0) {
        query = query.gte('total_net_carbs', filters.carbsMin);
      }
      if (filters.carbsMax < 50) {
        query = query.lte('total_net_carbs', filters.carbsMax);
      }

      switch (filters.sortBy) {
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'time':
          query = query.order('prep_time', { ascending: true });
          break;
        case 'calories':
          query = query.order('total_calories', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data } = await query.limit(50);
      return data || [];
    },
  });

  // Fetch lab notes
  const { data: labNotes = [] } = useQuery({
    queryKey: ['labNotes', filters.labNotesQuery],
    queryFn: async () => {
      if (!filters.labNotesQuery || filters.labNotesQuery.length < 2) return [];

      const { data } = await supabase
        .from('lab_notes')
        .select('*')
        .or(`title.ilike.%${filters.labNotesQuery}%,note.ilike.%${filters.labNotesQuery}%`)
        .limit(20);

      return data || [];
    },
  });

  const handleClearFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {language === 'bg' ? 'Търсене' : 'Search'}
        </Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Ionicons name="heart-outline" size={24} color={Colors.primary.main} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="image-outline" size={24} color={Colors.primary.main} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={Colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder={language === 'bg' ? 'Търси рецепти...' : 'Search recipes...'}
          value={filters.searchText}
          onChangeText={(text) => setFilters({ ...filters, searchText: text })}
          placeholderTextColor={Colors.text.secondary}
        />
      </View>

      {/* Quick Filters */}
      <View style={styles.quickFilters}>
        <TouchableOpacity
          style={[
            styles.quickBtn,
            filters.favorites && styles.quickBtnActive,
          ]}
          onPress={() => setFilters({ ...filters, favorites: !filters.favorites })}
        >
          <Ionicons
            name={filters.favorites ? 'heart' : 'heart-outline'}
            size={20}
            color={filters.favorites ? 'white' : Colors.primary.main}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickBtn,
            filters.recent && styles.quickBtnActive,
          ]}
          onPress={() => setFilters({ ...filters, recent: !filters.recent })}
        >
          <Ionicons
            name="time"
            size={20}
            color={filters.recent ? 'white' : Colors.primary.main}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickBtn,
            filters.pinned && styles.quickBtnActive,
          ]}
          onPress={() => setFilters({ ...filters, pinned: !filters.pinned })}
        >
          <MaterialCommunityIcons
            name="pin"
            size={20}
            color={filters.pinned ? 'white' : Colors.primary.main}
          />
        </TouchableOpacity>
      </View>

      {/* Filter Bar */}
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

        <TouchableOpacity
          style={styles.labNotesBtn}
          onPress={() => setLabNotesModalOpen(true)}
        >
          <MaterialCommunityIcons name="flask-outline" size={20} color={Colors.primary.main} />
          <Text style={styles.labNotesBtnText}>
            {language === 'bg' ? 'Съвети' : 'Tips'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recipe Grid */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
        </View>
      ) : recipes.length > 0 ? (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.recipeCard}>
              <Text style={styles.recipeName}>{item.name}</Text>
              <Text style={styles.recipeNutrition}>
                {item.total_calories} kcal · {item.total_net_carbs}g NC
              </Text>
            </View>
          )}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            {language === 'bg' ? 'Няма резултати' : 'No results'}
          </Text>
        </View>
      )}

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
            {/* Time Slider */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>
                {language === 'bg' ? 'Време' : 'Time'}
              </Text>
              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>{filters.timeMin} min</Text>
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
                <Text style={styles.sliderLabel}>{filters.timeMax} min</Text>
              </View>
            </View>

            {/* Calories Slider */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>
                {language === 'bg' ? 'Калории' : 'Calories'}
              </Text>
              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>{filters.caloriesMin}</Text>
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
                <Text style={styles.sliderLabel}>{filters.caloriesMax}</Text>
              </View>
            </View>

            {/* Carbs Slider */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>
                {language === 'bg' ? 'Въглеводи' : 'Carbs'} (g)
              </Text>
              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>{filters.carbsMin}</Text>
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
                <Text style={styles.sliderLabel}>{filters.carbsMax}</Text>
              </View>
            </View>

            {/* Fat Slider */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>
                {language === 'bg' ? 'Мазнини' : 'Fat'} (g)
              </Text>
              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>{filters.fatMin}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  step={5}
                  value={filters.fatMin}
                  onValueChange={(val) =>
                    setFilters({ ...filters, fatMin: val })
                  }
                  minimumTrackTintColor={Colors.primary.main}
                  maximumTrackTintColor={Colors.background.secondary}
                  thumbTintColor={Colors.primary.main}
                />
                <Text style={styles.sliderLabel}>{filters.fatMax}</Text>
              </View>
            </View>

            {/* Protein Slider */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>
                {language === 'bg' ? 'Протеин' : 'Protein'} (g)
              </Text>
              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>{filters.proteinMin}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={50}
                  step={1}
                  value={filters.proteinMin}
                  onValueChange={(val) =>
                    setFilters({ ...filters, proteinMin: val })
                  }
                  minimumTrackTintColor={Colors.primary.main}
                  maximumTrackTintColor={Colors.background.secondary}
                  thumbTintColor={Colors.primary.main}
                />
                <Text style={styles.sliderLabel}>{filters.proteinMax}</Text>
              </View>
            </View>

            {/* Lab Notes Search */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>🧪 {language === 'bg' ? 'Съвети' : 'Tips'}</Text>
              <TextInput
                style={styles.textInput}
                placeholder={language === 'bg' ? 'E.g. "шоколад + крем"' : 'E.g. "chocolate + cream"'}
                value={filters.labNotesQuery}
                onChangeText={(text) =>
                  setFilters({ ...filters, labNotesQuery: text })
                }
                placeholderTextColor={Colors.text.secondary}
              />
            </View>

            {/* Clear Button */}
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearFilters}>
              <MaterialCommunityIcons name="close-circle" size={20} color={Colors.danger} />
              <Text style={styles.clearBtnText}>
                {language === 'bg' ? 'Изчисти всички' : 'Clear All'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Lab Notes Modal */}
      <Modal
        visible={labNotesModalOpen}
        animationType="slide"
        onRequestClose={() => setLabNotesModalOpen(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setLabNotesModalOpen(false)}>
              <Text style={styles.modalBackBtn}>
                ← {language === 'bg' ? 'Назад' : 'Back'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              🧪 {language === 'bg' ? 'Съвети' : 'Lab Notes'}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={Colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={language === 'bg' ? 'Търси съвети...' : 'Search tips...'}
              value={filters.labNotesQuery}
              onChangeText={(text) =>
                setFilters({ ...filters, labNotesQuery: text })
              }
              placeholderTextColor={Colors.text.secondary}
            />
          </View>

          <ScrollView style={styles.modalContent}>
            {labNotes.length > 0 ? (
              labNotes.map((note: any) => (
                <View key={note.id} style={styles.labNoteCard}>
                  <Text style={styles.labNoteTitle}>{note.title}</Text>
                  <Text style={styles.labNoteText}>{note.note}</Text>
                  {note.tips && (
                    <Text style={styles.labNoteTips}>💡 {note.tips}</Text>
                  )}
                </View>
              ))
            ) : filters.labNotesQuery ? (
              <Text style={styles.emptyText}>
                {language === 'bg' ? 'Няма съвети' : 'No tips found'}
              </Text>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// Styles
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
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
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
    fontSize: 16,
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
  quickBtnActive: {
    backgroundColor: Colors.primary.main,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginVertical: 8,
  },
  filterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    gap: 8,
  },
  filterBtnText: {
    color: Colors.primary.main,
    fontWeight: 'bold',
    fontSize: 16,
  },
  labNotesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    gap: 8,
  },
  labNotesBtnText: {
    color: Colors.primary.main,
    fontWeight: 'bold',
    fontSize: 14,
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
  gridContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  gridRow: {
    gap: 8,
    paddingHorizontal: 8,
  },
  recipeCard: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  recipeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  recipeNutrition: {
    fontSize: 12,
    color: Colors.primary.main,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
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
  sliderRow: {
    alignItems: 'center',
    gap: 8,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    minWidth: 30,
  },
  textInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    color: Colors.text.primary,
    fontSize: 14,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    marginVertical: 20,
  },
  clearBtnText: {
    color: Colors.danger,
    fontSize: 16,
    fontWeight: 'bold',
  },
  labNoteCard: {
    backgroundColor: Colors.background.secondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  labNoteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginBottom: 4,
  },
  labNoteText: {
    fontSize: 13,
    color: Colors.text.primary,
    marginBottom: 6,
  },
  labNoteTips: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  danger: {
    color: '#FF6B6B',
  },
});
```

---

### STEP 3: Test on Device (30 minutes)

```bash
npx expo start --clear
# Open on Android device via Expo Go
```

**Test these:**
- [ ] Tab 2 loads without error
- [ ] Search box works
- [ ] Quick filter buttons toggle (♥ ⏱ 📌)
- [ ] Filter button shows badge with active count
- [ ] Click Filter → modal opens
- [ ] Sliders work (Time, Calories, Carbs, Fat, Protein)
- [ ] Results update when sliders change
- [ ] Clear All button resets everything
- [ ] Lab Notes button opens modal
- [ ] Lab Notes search works
- [ ] Both BG and EN languages work
- [ ] No console errors

---

### STEP 4: Commit & Done (5 minutes)

```bash
git add Mobile/app/\(tabs\)/search/index.tsx
git commit -m "feat: Modernize Tab 2 with advanced filters and Lab Notes search"
git push
```

---

## VERIFICATION CHECKLIST

Before marking DONE:
- [ ] Dependency installed: `@react-native-community/slider`
- [ ] File completely replaced (not merged)
- [ ] No console errors on load
- [ ] All 12 test cases pass
- [ ] Both languages work
- [ ] Ready for App Store submission

---

## SUCCESS CRITERIA

✅ **Tab 2 modernization is COMPLETE when:**
1. New UI matches design (Quick filters, Filter modal, Lab Notes)
2. All sliders work smoothly
3. Lab Notes search functional
4. No bugs or console errors
5. Bilingual (BG/EN)
6. Ready for production

---

## TIMELINE

| Task | Time | Status |
|------|------|--------|
| Install deps | 5m | TODO |
| Replace search component | 90m | TODO |
| Test on device | 30m | TODO |
| Commit | 5m | TODO |
| **TOTAL** | **2h** | **READY** |

---

**EXECUTE NOW. This must be done today.** 🚀

Generated: 2026-05-22  
Priority: CRITICAL  
Status: READY FOR EXECUTION