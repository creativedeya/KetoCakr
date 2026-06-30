import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../../../../constants/Theme';
import { useTranslation } from '../../../../constants/i18n';
import { supabase } from '../../../../lib/supabase';
import { Sweetener, FilterState } from './types';
import Filters from './Filters';
import ComparisonTable from './ComparisonTable';
import Calculator from './Calculator';
import DetailModal from './DetailModal';

type Tab = 'list' | 'compare' | 'convert';

export default function SweetenerComparison() {
  const { language } = useTranslation();
  const isBg = language === 'bg';

  const [activeTab, setActiveTab] = useState<Tab>('list');
  const [sweeteners, setSweeteners] = useState<Sweetener[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    sourceType: null,
    maxGI: 100,
    ketoOnly: false,
    searchQuery: '',
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailSweetener, setDetailSweetener] = useState<Sweetener | null>(null);

  const labels = {
    title: isBg ? 'Наръчник за подсладители' : 'Sweetener Guide',
    list: isBg ? 'Списък' : 'List',
    compare: isBg ? 'Сравни' : 'Compare',
    convert: isBg ? 'Конвертирай' : 'Convert',
    noResults: isBg ? 'Няма намерени подсладители' : 'No sweeteners found',
    gi: isBg ? 'ГИ' : 'GI',
    sweetness: isBg ? 'Сладост' : 'Sweet',
    calories: isBg ? 'Кал/г' : 'Cal/g',
    keto: 'Keto',
    compareHint: isBg ? 'Добави от Списък' : 'Add from List tab',
    selected: isBg ? 'избрани' : 'selected',
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('sweeteners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (!error && data) setSweeteners(data as Sweetener[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return sweeteners.filter(s => {
      if (filters.ketoOnly && s.keto !== true) return false;
      if (filters.sourceType && s.source !== filters.sourceType) return false;
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const name = (isBg ? s.name_bg : s.name_en).toLowerCase();
        if (!name.includes(q)) return false;
      }
      return true;
    });
  }, [sweeteners, filters, isBg]);

  const selectedSweeteners = useMemo(
    () => selectedIds.map(id => sweeteners.find(s => s.id === id)!).filter(Boolean),
    [selectedIds, sweeteners]
  );

  function toggleSelected(id: string) {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'list', label: labels.list },
    { key: 'compare', label: labels.compare },
    { key: 'convert', label: labels.convert },
  ];

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{labels.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
              {tab.key === 'compare' && selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary.main} style={{ marginTop: Spacing['2xl'] }} />
      ) : (
        <>
          {activeTab === 'list' && (
            <>
              <Filters filters={filters} onFilterChange={setFilters} />
              <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  <Text style={styles.empty}>{labels.noResults}</Text>
                }
                renderItem={({ item }) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <TouchableOpacity
                      style={[styles.listItem, isSelected && styles.listItemSelected]}
                      onPress={() => setDetailSweetener(item)}
                      activeOpacity={0.75}
                    >
                      <View style={styles.listItemMain}>
                        <Text style={styles.listItemName}>
                          {isBg ? item.name_bg : item.name_en}
                        </Text>
                        <View style={styles.listItemMeta}>
                          <Chip label={`${labels.gi}: ${item.glycemic_index}`} color={
                            item.glycemic_index <= 5 ? Colors.success.main
                            : item.glycemic_index <= 30 ? Colors.warning.main
                            : Colors.error.main
                          } />
                          <Chip label={`${Math.round(Number(item.sweetness_ratio) * 100)}%`} color={Colors.info.main} />
                          <Chip label={`${item.calories_per_gram} kcal`} color={Colors.nutrition.calories} />
                          {item.keto && <Chip label="Keto" color={Colors.success.main} />}
                        </View>
                      </View>
                      <TouchableOpacity
                        style={[styles.compareBtn, isSelected && styles.compareBtnActive]}
                        onPress={() => toggleSelected(item.id)}
                      >
                        <Ionicons
                          name={isSelected ? 'checkmark' : 'add'}
                          size={18}
                          color={isSelected ? Colors.text.inverse : Colors.primary.main}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                }}
              />
            </>
          )}

          {activeTab === 'compare' && (
            <View style={styles.tabContent}>
              {selectedSweeteners.length === 0 ? (
                <View style={styles.emptyCompare}>
                  <Ionicons name="git-compare-outline" size={48} color={Colors.text.tertiary} />
                  <Text style={styles.emptyCompareText}>{labels.compareHint}</Text>
                </View>
              ) : (
                <ComparisonTable sweeteners={selectedSweeteners} />
              )}
            </View>
          )}

          {activeTab === 'convert' && (
            <View style={styles.tabContent}>
              <Calculator sweeteners={sweeteners} />
            </View>
          )}
        </>
      )}

      <DetailModal
        sweetener={detailSweetener}
        visible={detailSweetener !== null}
        onClose={() => setDetailSweetener(null)}
      />
    </View>
  );
}

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <View style={[chipStyles.chip, { backgroundColor: color + '22' }]}>
      <Text style={[chipStyles.text, { color }]}>{label}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  text: { fontSize: 11, fontWeight: '600' },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background.secondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  headerTitle: { ...Typography.h3, color: Colors.text.primary },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.primary.main },
  tabText: { ...Typography.body2, color: Colors.text.secondary, fontWeight: '600' },
  tabTextActive: { color: Colors.primary.main },
  tabContent: { flex: 1 },
  listContent: { padding: Spacing.xl, gap: Spacing.sm, paddingBottom: 80 },
  listItem: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.sm,
  },
  listItemSelected: {
    borderWidth: 1.5,
    borderColor: Colors.primary.main,
  },
  listItemMain: { flex: 1 },
  listItemName: { ...Typography.body1, fontWeight: '700', color: Colors.text.primary, marginBottom: 6 },
  listItemMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  compareBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    borderWidth: 1.5,
    borderColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  compareBtnActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  empty: { ...Typography.body2, color: Colors.text.tertiary, textAlign: 'center', marginTop: Spacing['2xl'] },
  emptyCompare: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  emptyCompareText: { ...Typography.body2, color: Colors.text.tertiary, textAlign: 'center' },
});
