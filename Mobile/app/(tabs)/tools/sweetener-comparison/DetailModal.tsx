import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../../../../constants/Theme';
import { useTranslation } from '../../../../constants/i18n';
import { Sweetener } from './types';

interface Props {
  sweetener: Sweetener | null;
  visible: boolean;
  onClose: () => void;
}

export default function DetailModal({ sweetener, visible, onClose }: Props) {
  const { language } = useTranslation();
  const isBg = language === 'bg';

  if (!sweetener) return null;

  const name = isBg ? sweetener.name_bg : sweetener.name_en;
  const pros = isBg ? sweetener.pros_bg : sweetener.pros_en;
  const cons = isBg ? sweetener.cons_bg : sweetener.cons_en;
  const description = isBg ? sweetener.description_bg : sweetener.description_en;
  const tasteProfile = isBg ? sweetener.taste_profile_bg : sweetener.taste_profile_en;
  const form = isBg ? sweetener.form_bg : sweetener.form_en;
  const sweetnessDisplay = `${Math.round(Number(sweetener.sweetness_ratio) * 100)}%`;

  const labels = {
    close: isBg ? 'Затвори' : 'Close',
    gi: isBg ? 'Гликемичен индекс' : 'Glycemic Index',
    sweetness: isBg ? 'Сладост' : 'Sweetness',
    calories: isBg ? 'Калории/г' : 'Calories/g',
    pros: isBg ? 'Предимства' : 'Pros',
    cons: isBg ? 'Недостатъци' : 'Cons',
    form: isBg ? 'Форма' : 'Form',
    description: isBg ? 'Описание' : 'Description',
    tasteProfile: isBg ? 'Вкусов профил' : 'Taste Profile',
    commonUses: isBg ? 'Приложения' : 'Common Uses',
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerName}>{name}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.metricsRow}>
              <MetricBadge label={labels.gi} value={String(sweetener.glycemic_index)} color={
                sweetener.glycemic_index <= 5 ? Colors.success.main
                : sweetener.glycemic_index <= 30 ? Colors.warning.main
                : Colors.error.main
              } />
              <MetricBadge label={labels.sweetness} value={sweetnessDisplay} color={Colors.info.main} />
              <MetricBadge label={labels.calories} value={`${sweetener.calories_per_gram} kcal`} color={Colors.nutrition.calories} />
            </View>

            <View style={styles.tagsRow}>
              <View style={[styles.tag, { backgroundColor: sweetener.keto ? Colors.success.main : Colors.border.medium }]}>
                <Text style={styles.tagText}>
                  {sweetener.keto ? `✓ Keto` : `✗ Keto`}
                </Text>
              </View>
              {sweetener.source && (
                <View style={[styles.tag, { backgroundColor: Colors.secondary.opacity[20] }]}>
                  <Text style={[styles.tagText, { color: Colors.text.secondary }]}>
                    {({ natural: isBg ? 'Природен' : 'Natural', synthetic: isBg ? 'Синтетичен' : 'Synthetic', 'semi-natural': isBg ? 'Полу-природен' : 'Semi-Natural' } as Record<string, string>)[sweetener.source] ?? sweetener.source}
                  </Text>
                </View>
              )}
              {form && (
                <View style={[styles.tag, { backgroundColor: Colors.secondary.opacity[20] }]}>
                  <Text style={[styles.tagText, { color: Colors.text.secondary }]}>{form}</Text>
                </View>
              )}
            </View>

            {description && (
              <Section label={labels.description}>
                <Text style={styles.bodyText}>{description}</Text>
              </Section>
            )}

            {pros && pros.length > 0 && (
              <Section label={labels.pros}>
                {pros.map((p, i) => (
                  <Text key={i} style={styles.listItem}>{'✓  '}{p}</Text>
                ))}
              </Section>
            )}

            {cons && cons.length > 0 && (
              <Section label={labels.cons}>
                {cons.map((c, i) => (
                  <Text key={i} style={[styles.listItem, { color: Colors.error.main }]}>{'✗  '}{c}</Text>
                ))}
              </Section>
            )}

            {tasteProfile && (
              <Section label={labels.tasteProfile}>
                <Text style={styles.bodyText}>{tasteProfile}</Text>
              </Section>
            )}

            {sweetener.common_uses && (
              <Section label={labels.commonUses}>
                <Text style={styles.bodyText}>{sweetener.common_uses}</Text>
              </Section>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function MetricBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[metricStyles.badge, { borderColor: color }]}>
      <Text style={[metricStyles.value, { color }]}>{value}</Text>
      <Text style={metricStyles.label}>{label}</Text>
    </View>
  );
}

const metricStyles = StyleSheet.create({
  badge: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  value: { ...Typography.h4, fontWeight: '700' },
  label: { ...Typography.caption, color: Colors.text.tertiary, marginTop: 2 },
});

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.label}>{label}</Text>
      {children}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: { gap: Spacing.xs },
  label: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: Spacing.md,
  },
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    maxHeight: '85%',
    ...Shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerName: { ...Typography.h4, color: Colors.text.primary, flex: 1 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: Spacing.xl, gap: Spacing.sm },
  metricsRow: { flexDirection: 'row', gap: Spacing.sm },
  tagsRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
  },
  tagText: { ...Typography.caption, color: Colors.text.inverse, fontWeight: '700' },
  listItem: { ...Typography.body2, color: Colors.success.dark, paddingLeft: Spacing.xs },
  bodyText: { ...Typography.body2, color: Colors.text.primary, lineHeight: 22 },
});
