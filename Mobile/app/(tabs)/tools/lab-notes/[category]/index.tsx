// ===========================================================
// Lab Notes — Notes List by Category
// Route: /tools/lab-notes/[category]
// ===========================================================
import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../../../../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../../../../../constants/Theme';
import { useTranslation } from '../../../../../constants/i18n';
import { useLanguageStore } from '../../../../../store/useLanguageStore';
import { supabase } from '../../../../../lib/supabase';
import { CATEGORIES, noteTitle, noteSubtitle } from '../../../../../types/labNotes';
import type { LabNote, LabNoteCategory } from '../../../../../types/labNotes';

export default function LabNotesCategoryScreen() {
  const { t } = useTranslation();
  const language = useLanguageStore(s => s.language);
  const { category } = useLocalSearchParams<{ category: string }>();

  const catInfo = CATEGORIES.find(c => c.key === category);

  const { data: notes = [], isLoading, error } = useQuery<LabNote[]>({
    queryKey: ['lab-notes', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lab_notes')
        .select('id, category, icon, title_en:title, title_bg, subtitle_en, subtitle_bg, display_order, content_json, is_active')
        .is('recipe_id', null)
        .eq('is_active', true)
        .eq('category', category)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as LabNote[];
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  });

  const headerTitle = t(`labNotes.categories.${category as LabNoteCategory}` as any) || catInfo?.title_bg || category || '';

  const headerEmoji = catInfo?.icon ?? '🧪';

  function renderItem({ item }: { item: LabNote }) {
    const title = noteTitle(item, language);
    const subtitle = noteSubtitle(item, language);

    return (
      <TouchableOpacity
        style={styles.noteCard}
        activeOpacity={0.75}
        onPress={() => router.push(`/tools/lab-notes/${category}/${item.id}` as any)}
      >
        <Text style={styles.noteIcon}>{item.icon || '🧪'}</Text>
        <View style={styles.noteBody}>
          <Text style={styles.noteTitle} numberOfLines={2}>{title}</Text>
          {!!subtitle && (
            <Text style={styles.noteSubtitle} numberOfLines={2}>{subtitle}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{headerTitle}</Text>
        <Text style={styles.headerEmoji}>{headerEmoji}</Text>
      </View>

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
        </View>
      )}

      {error && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{t('common.error')}</Text>
        </View>
      )}

      {!isLoading && !error && (
        <FlatList
          data={notes}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>{t('labNotes.noNotes')}</Text>
            </View>
          }
          ListFooterComponent={<View style={{ height: 60 }} />}
        />
      )}
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
  headerEmoji: { fontSize: 22, width: 40, textAlign: 'right' },
  list: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  noteIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  noteBody: {
    flex: 1,
  },
  noteTitle: {
    ...Typography.body1,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  noteSubtitle: {
    ...Typography.body2,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing['3xl'],
  },
  emptyText: {
    ...Typography.body2,
    color: Colors.text.tertiary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorText: {
    ...Typography.body2,
    color: Colors.error.main,
    textAlign: 'center',
  },
});
