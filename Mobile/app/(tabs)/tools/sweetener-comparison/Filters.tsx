import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../../../constants/Theme';
import { useTranslation } from '../../../../constants/i18n';
import { FilterState, SOURCE_TYPES } from './types';

interface Props {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export default function Filters({ filters, onFilterChange }: Props) {
  const { language } = useTranslation();
  const isBg = language === 'bg';

  const labels = {
    search: isBg ? 'Търсене...' : 'Search...',
    ketoOnly: isBg ? 'Само кето' : 'Keto-Friendly Only',
    reset: isBg ? 'Нулирай' : 'Reset',
    all: isBg ? 'Всички' : 'All',
  };

  const sourceLabels: Record<string, string> = {
    'natural': isBg ? 'Природен' : 'Natural',
    'synthetic': isBg ? 'Синтетичен' : 'Synthetic',
    'semi-natural': isBg ? 'Полу-природен' : 'Semi-Natural',
  };

  const isDefault =
    filters.sourceType === null &&
    filters.maxGI === 100 &&
    !filters.ketoOnly &&
    filters.searchQuery === '';

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={Colors.text.tertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={labels.search}
          placeholderTextColor={Colors.text.tertiary}
          value={filters.searchQuery}
          onChangeText={q => onFilterChange({ ...filters, searchQuery: q })}
        />
        {filters.searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onFilterChange({ ...filters, searchQuery: '' })}>
            <Ionicons name="close-circle" size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        <TouchableOpacity
          style={[styles.chip, filters.sourceType === null && styles.chipActive]}
          onPress={() => onFilterChange({ ...filters, sourceType: null })}
        >
          <Text style={[styles.chipText, filters.sourceType === null && styles.chipTextActive]}>
            {labels.all}
          </Text>
        </TouchableOpacity>
        {SOURCE_TYPES.map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.chip, filters.sourceType === type && styles.chipActive]}
            onPress={() =>
              onFilterChange({ ...filters, sourceType: filters.sourceType === type ? null : type })
            }
          >
            <Text
              style={[styles.chipText, filters.sourceType === type && styles.chipTextActive]}
            >
              {sourceLabels[type] ?? type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.bottomRow}>
        <View style={styles.ketoRow}>
          <Text style={styles.ketoLabel}>{labels.ketoOnly}</Text>
          <Switch
            value={filters.ketoOnly}
            onValueChange={v => onFilterChange({ ...filters, ketoOnly: v })}
            trackColor={{ true: Colors.primary.main, false: Colors.border.medium }}
            thumbColor={Colors.background.primary}
          />
        </View>
        {!isDefault && (
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() =>
              onFilterChange({ sourceType: null, maxGI: 100, ketoOnly: false, searchQuery: '' })
            }
          >
            <Ionicons name="refresh" size={14} color={Colors.primary.main} />
            <Text style={styles.resetText}>{labels.reset}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.primary,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    gap: Spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchIcon: { marginRight: Spacing.xs },
  searchInput: {
    flex: 1,
    ...Typography.body2,
    color: Colors.text.primary,
    padding: 0,
  },
  chips: { flexDirection: 'row' },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.background.secondary,
    marginRight: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  chipActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  chipText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  chipTextActive: { color: Colors.text.inverse },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ketoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  ketoLabel: { ...Typography.body2, color: Colors.text.primary },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  resetText: { ...Typography.caption, color: Colors.primary.main, fontWeight: '600' },
});
