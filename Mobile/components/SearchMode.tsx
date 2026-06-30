import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Colors } from '../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../constants/Theme';
import { useSearchRecipes, DEFAULT_SEARCH_FILTERS, SearchFilters } from '../api/hooks/useSearchRecipes';
import { RecipesGrid } from './RecipesGrid';

interface SearchModeProps {
  language: 'en' | 'bg';
}

export const SearchMode = ({ language }: SearchModeProps) => {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const { data: recipes = [], isLoading } = useSearchRecipes(filters);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.caloriesMin > 0 || filters.caloriesMax < 1000) count++;
    if (filters.carbsMin > 0 || filters.carbsMax < 50) count++;
    return count;
  }, [filters]);

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={Colors.text.tertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder={language === 'bg' ? 'Търси рецепти...' : 'Search recipes...'}
          value={filters.query}
          onChangeText={(text) => setFilters({ ...filters, query: text })}
          placeholderTextColor={Colors.text.tertiary}
        />
        {filters.query.length > 0 && (
          <TouchableOpacity onPress={() => setFilters({ ...filters, query: '' })}>
            <Ionicons name="close-circle" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterModalOpen(true)}>
          <MaterialCommunityIcons name="filter-variant" size={18} color={Colors.primary.main} />
          <Text style={styles.filterBtnText}>
            {language === 'bg' ? 'Филтри' : 'Filters'}
          </Text>
          {activeFilterCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {activeFilterCount > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => setFilters(DEFAULT_SEARCH_FILTERS)}
          >
            <Ionicons name="close-circle" size={16} color={Colors.error.main} />
            <Text style={styles.clearBtnText}>
              {language === 'bg' ? 'Изчисти' : 'Clear'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Recipes */}
      <RecipesGrid recipes={recipes} isLoading={isLoading} language={language} />

      {/* Filter Modal */}
      <Modal
        visible={filterModalOpen}
        animationType="slide"
        onRequestClose={() => setFilterModalOpen(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setFilterModalOpen(false)}>
              <Text style={styles.modalBackBtn}>
                ← {language === 'bg' ? 'Назад' : 'Back'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {language === 'bg' ? 'Филтрирай' : 'Filters'}
            </Text>
            <TouchableOpacity onPress={() => setFilterModalOpen(false)}>
              <Ionicons name="checkmark" size={24} color={Colors.primary.main} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            {/* Calories */}
            <View style={styles.filterSection}>
              <View style={styles.filterSectionHeader}>
                <Text style={styles.sectionTitle}>
                  {language === 'bg' ? 'Калории (на порция)' : 'Calories (per serving)'}
                </Text>
                <Text style={styles.sectionValue}>
                  {filters.caloriesMin === 0 && filters.caloriesMax === 1000
                    ? (language === 'bg' ? 'Всички' : 'All')
                    : `${filters.caloriesMin} – ${filters.caloriesMax}`}
                </Text>
              </View>
              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>0</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1000}
                  step={50}
                  value={filters.caloriesMin}
                  onValueChange={(val) => setFilters({ ...filters, caloriesMin: val })}
                  minimumTrackTintColor={Colors.primary.main}
                  maximumTrackTintColor={Colors.border.light}
                  thumbTintColor={Colors.primary.main}
                />
                <Text style={styles.sliderLabel}>1000</Text>
              </View>
              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>0</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1000}
                  step={50}
                  value={filters.caloriesMax}
                  onValueChange={(val) => setFilters({ ...filters, caloriesMax: val })}
                  minimumTrackTintColor={Colors.primary.main}
                  maximumTrackTintColor={Colors.border.light}
                  thumbTintColor={Colors.primary.main}
                />
                <Text style={styles.sliderLabel}>1000</Text>
              </View>
            </View>

            {/* Net Carbs */}
            <View style={styles.filterSection}>
              <View style={styles.filterSectionHeader}>
                <Text style={styles.sectionTitle}>
                  {language === 'bg' ? 'Нет въглехидрати (г)' : 'Net Carbs (g)'}
                </Text>
                <Text style={styles.sectionValue}>
                  {filters.carbsMin === 0 && filters.carbsMax === 50
                    ? (language === 'bg' ? 'Всички' : 'All')
                    : `${filters.carbsMin} – ${filters.carbsMax}g`}
                </Text>
              </View>
              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>0g</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={50}
                  step={1}
                  value={filters.carbsMin}
                  onValueChange={(val) => setFilters({ ...filters, carbsMin: val })}
                  minimumTrackTintColor={Colors.primary.main}
                  maximumTrackTintColor={Colors.border.light}
                  thumbTintColor={Colors.primary.main}
                />
                <Text style={styles.sliderLabel}>50g</Text>
              </View>
              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>0g</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={50}
                  step={1}
                  value={filters.carbsMax}
                  onValueChange={(val) => setFilters({ ...filters, carbsMax: val })}
                  minimumTrackTintColor={Colors.primary.main}
                  maximumTrackTintColor={Colors.border.light}
                  thumbTintColor={Colors.primary.main}
                />
                <Text style={styles.sliderLabel}>50g</Text>
              </View>
            </View>

            {/* Sort */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>
                {language === 'bg' ? 'Сортиране' : 'Sort by'}
              </Text>
              <View style={styles.sortRow}>
                {(['default', 'calories', 'carbs'] as const).map((option) => {
                  const labels = {
                    default: language === 'bg' ? 'По азбука' : 'A–Z',
                    calories: language === 'bg' ? 'Калории ↑' : 'Calories ↑',
                    carbs: language === 'bg' ? 'Въглехидрати ↑' : 'Carbs ↑',
                  };
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.sortChip, filters.sortBy === option && styles.sortChipActive]}
                      onPress={() => setFilters({ ...filters, sortBy: option })}
                    >
                      <Text style={[styles.sortChipText, filters.sortBy === option && styles.sortChipTextActive]}>
                        {labels[option]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    height: 48,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  filterBtnText: {
    color: Colors.primary.main,
    fontWeight: '600',
    fontSize: 13,
  },
  badge: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 2,
  },
  badgeText: {
    color: Colors.text.inverse,
    fontSize: 11,
    fontWeight: 'bold',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  clearBtnText: {
    color: Colors.error.main,
    fontSize: 13,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  modalBackBtn: {
    color: Colors.primary.main,
    fontSize: 15,
    fontWeight: '600',
  },
  modalTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  filterSection: {
    marginBottom: Spacing.xl,
  },
  filterSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  sectionValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary.main,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderLabel: {
    fontSize: 11,
    color: Colors.text.tertiary,
    minWidth: 32,
    textAlign: 'center',
  },
  sortRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  sortChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.background.secondary,
  },
  sortChipActive: {
    backgroundColor: Colors.primary.main,
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  sortChipTextActive: {
    color: Colors.text.inverse,
  },
});
