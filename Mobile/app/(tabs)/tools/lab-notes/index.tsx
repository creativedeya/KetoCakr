// ===========================================================
// Lab Notes — Category Grid
// Route: /tools/lab-notes
// ===========================================================
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../../../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../../../../constants/Theme';
import { useTranslation } from '../../../../constants/i18n';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { supabase } from '../../../../lib/supabase';
import { CATEGORIES } from '../../../../types/labNotes';
import type { LabNoteCategory } from '../../../../types/labNotes';

export default function LabNotesIndex() {
  const { t } = useTranslation();
  const language = useLanguageStore(s => s.language);

  const { data: counts = {}, isLoading } = useQuery({
    queryKey: ['lab-notes-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lab_notes')
        .select('category')
        .is('recipe_id', null)
        .eq('is_active', true);
      if (error) throw error;
      const map: Record<string, number> = {};
      (data ?? []).forEach((n: { category: string }) => {
        map[n.category] = (map[n.category] || 0) + 1;
      });
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });

  function categoryLabel(key: LabNoteCategory): string {
    return language === 'bg'
      ? (t(`labNotes.categories.${key}` as any) || key)
      : (t(`labNotes.categories.${key}` as any) || key);
  }

  function noteCountLabel(count: number): string {
    if (count === 0) return `0 ${t('labNotes.notes')}`;
    if (language === 'bg') {
      return `${count} ${count === 1 ? t('labNotes.note') : t('labNotes.notes')}`;
    }
    return `${count} ${count === 1 ? t('labNotes.note') : t('labNotes.notes')}`;
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('labNotes.title')}</Text>
        <Text style={styles.headerEmoji}>🧪</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>{t('labNotes.subtitle')}</Text>

        {isLoading && (
          <ActivityIndicator color={Colors.primary.main} style={{ marginTop: Spacing.xl }} />
        )}

        {/* 2-column category grid */}
        <View style={styles.grid}>
          {CATEGORIES.map(cat => {
            const count = counts[cat.key] ?? 0;
            return (
              <TouchableOpacity
                key={cat.key}
                style={styles.card}
                activeOpacity={0.75}
                onPress={() => router.push(`/tools/lab-notes/${cat.key}` as any)}
              >
                <View style={styles.cardLeft}>
                  <Text style={styles.cardIcon}>{cat.icon}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {categoryLabel(cat.key)}
                  </Text>
                  <Text style={styles.cardCount}>{noteCountLabel(count)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
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
  headerTitle: { ...Typography.h3, color: Colors.text.primary, flex: 1, textAlign: 'center' },
  headerEmoji: { fontSize: 24, width: 40, textAlign: 'right' },
  content: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  subtitle: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  grid: {
    gap: Spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary.main,
    ...Shadows.sm,
  },
  cardLeft: {
    width: 44,
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 28,
  },
  cardBody: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  cardTitle: {
    ...Typography.body1,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  cardCount: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
});
