// ===========================================================
// Lab Notes — Note Detail
// Route: /tools/lab-notes/[category]/[id]
// ===========================================================
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../../../../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../../../../../constants/Theme';
import { useTranslation } from '../../../../../constants/i18n';
import { useLanguageStore } from '../../../../../store/useLanguageStore';
import { supabase } from '../../../../../lib/supabase';
import { noteTitle, noteSubtitle, blockText } from '../../../../../types/labNotes';
import type { LabNote, ContentBlock, MatrixRow } from '../../../../../types/labNotes';

// ─── Block renderers ─────────────────────────────────────────

function IntroBlock({ block, language }: { block: ContentBlock & { type: 'intro' }; language: 'en' | 'bg' }) {
  const text = blockText(block, 'text', language);
  if (!text) return null;
  return <Text style={blockStyles.introText}>{text}</Text>;
}

function LabNoteBlock({
  block,
  language,
  label,
}: {
  block: ContentBlock & { type: 'lab_note' };
  language: 'en' | 'bg';
  label: string;
}) {
  const text = blockText(block, 'text', language);
  const blockLabel = blockText(block, 'label', language) || label;
  if (!text) return null;
  return (
    <View style={blockStyles.labNoteBox}>
      <Text style={blockStyles.labNoteLabel}>🧪 {blockLabel}</Text>
      <Text style={blockStyles.labNoteText}>{text}</Text>
    </View>
  );
}

function MatrixBlock({
  block,
  language,
}: {
  block: ContentBlock & { type: 'matrix' };
  language: 'en' | 'bg';
}) {
  const title = blockText(block, 'title', language);
  const rows = block.rows ?? [];
  if (!rows.length && !title) return null;
  return (
    <View style={blockStyles.matrixBox}>
      {!!title && <Text style={blockStyles.matrixTitle}>{title}</Text>}
      {rows.map((row: MatrixRow, i: number) => {
        const value = language === 'bg' ? (row.value_bg || row.value_en) : row.value_en;
        return (
          <View
            key={i}
            style={[blockStyles.matrixRow, i % 2 === 0 ? blockStyles.matrixRowEven : blockStyles.matrixRowOdd]}
          >
            <Text style={blockStyles.matrixLabel}>{row.label}</Text>
            <Text style={blockStyles.matrixValue}>{value}</Text>
          </View>
        );
      })}
    </View>
  );
}

function CriticalErrorBlock({ block, language }: { block: ContentBlock & { type: 'critical_error' }; language: 'en' | 'bg' }) {
  const text = blockText(block, 'text', language);
  if (!text) return null;
  return (
    <View style={blockStyles.criticalBox}>
      <Text style={blockStyles.criticalIcon}>⚠️</Text>
      <Text style={blockStyles.criticalText}>{text}</Text>
    </View>
  );
}

function TipBlock({ block, language }: { block: ContentBlock & { type: 'tip' }; language: 'en' | 'bg' }) {
  const text = blockText(block, 'text', language);
  if (!text) return null;
  return (
    <View style={blockStyles.tipBox}>
      <Text style={blockStyles.tipIcon}>💡</Text>
      <Text style={blockStyles.tipText}>{text}</Text>
    </View>
  );
}

function Block({ block, language, defaultLabel }: { block: ContentBlock; language: 'en' | 'bg'; defaultLabel: string }) {
  switch (block.type) {
    case 'intro':          return <IntroBlock block={block} language={language} />;
    case 'lab_note':       return <LabNoteBlock block={block} language={language} label={defaultLabel} />;
    case 'matrix':         return <MatrixBlock block={block} language={language} />;
    case 'critical_error': return <CriticalErrorBlock block={block} language={language} />;
    case 'tip':            return <TipBlock block={block} language={language} />;
    default:               return null;
  }
}

// ─── Main screen ─────────────────────────────────────────────

export default function LabNoteDetailScreen() {
  const { t } = useTranslation();
  const language = useLanguageStore(s => s.language);
  const { category, id } = useLocalSearchParams<{ category: string; id: string }>();

  const { data: note, isLoading, error } = useQuery<LabNote>({
    queryKey: ['lab-note', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lab_notes')
        .select('id, category, icon, title_en:title, title_bg, subtitle_en, subtitle_bg, content_json, display_order, is_active, image_url, image_alt')
        .eq('id', Number(id))
        .single();
      if (error) throw error;
      return data as unknown as LabNote;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

  const title = note ? noteTitle(note, language) : '';
  const subtitle = note ? noteSubtitle(note, language) : '';
  const defaultLabel = t('labNotes.blockLabel');

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>{title || '🧪'}</Text>
        <Text style={styles.headerEmoji}>{note?.icon || '🧪'}</Text>
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

      {note && !isLoading && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero: image only if available */}
          {!!note.image_url && (
            <Image
              source={{ uri: note.image_url }}
              style={styles.image}
              accessible
              accessibilityLabel={note.image_alt || 'Lab note image'}
            />
          )}

          {/* Visual header: emoji + title + subtitle */}
          <View style={styles.visualHeader}>
            <Text style={styles.visualIcon}>{note.icon || '🧪'}</Text>
            <View style={styles.visualTitleBlock}>
              <Text style={styles.visualTitle}>{title}</Text>
              {!!subtitle && <Text style={styles.visualSubtitle}>{subtitle}</Text>}
            </View>
          </View>

          {/* Content blocks */}
          <View style={styles.blocks}>
            {(note.content_json ?? []).map((block, i) => (
              <Block key={i} block={block} language={language} defaultLabel={defaultLabel} />
            ))}
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      )}
    </View>
  );
}

// ─── Block styles ─────────────────────────────────────────────

const blockStyles = StyleSheet.create({
  introText: {
    ...Typography.body1,
    color: Colors.text.primary,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },

  labNoteBox: {
    backgroundColor: '#FFF9F0',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary.main,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  labNoteLabel: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primary.main,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  labNoteText: {
    ...Typography.body2,
    color: Colors.text.primary,
    lineHeight: 20,
  },

  matrixBox: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  matrixTitle: {
    ...Typography.body2,
    fontWeight: '700',
    color: Colors.text.primary,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    backgroundColor: Colors.background.secondary,
  },
  matrixRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  matrixRowEven: {
    backgroundColor: Colors.background.primary,
  },
  matrixRowOdd: {
    backgroundColor: Colors.background.secondary,
  },
  matrixLabel: {
    ...Typography.body2,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  matrixValue: {
    ...Typography.body2,
    color: Colors.text.secondary,
    flex: 2,
  },

  criticalBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF0F0',
    borderLeftWidth: 4,
    borderLeftColor: '#E53E3E',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  criticalIcon: {
    fontSize: 18,
    lineHeight: 22,
  },
  criticalText: {
    ...Typography.body2,
    color: Colors.text.primary,
    lineHeight: 20,
    flex: 1,
  },

  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 3,
    borderLeftColor: '#3182CE',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tipIcon: {
    fontSize: 18,
    lineHeight: 22,
  },
  tipText: {
    ...Typography.body2,
    color: Colors.text.primary,
    lineHeight: 20,
    flex: 1,
  },
});

// ─── Screen styles ────────────────────────────────────────────

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
  headerTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
  },
  headerEmoji: { fontSize: 22, width: 40, textAlign: 'right' },
  image: {
    width: '100%',
    height: 240,
    backgroundColor: Colors.background.secondary,
    resizeMode: 'cover',
  },
  visualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#FEF9F0',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  visualIcon: {
    fontSize: 48,
    marginRight: Spacing.md,
  },
  visualTitleBlock: {
    flex: 1,
  },
  visualTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    lineHeight: 26,
  },
  visualSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  blocks: {
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing['3xl'],
  },
  errorText: {
    ...Typography.body2,
    color: Colors.error.main,
    textAlign: 'center',
  },
});
