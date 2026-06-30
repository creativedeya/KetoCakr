// ===========================================================
// TOOLS SCREEN — 4-карто grid с реални инструменти
// ===========================================================
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadows, IconSize } from '../../../constants/Theme';
import { useTranslation } from '../../../constants/i18n';

export default function ToolsScreen() {
  const { t } = useTranslation();

  const tools = [
    {
      icon: 'swap-horizontal' as const,
      title: t('tools.items.converter.title'),
      description: t('tools.items.converter.description'),
      route: '/tools/unit-converter',
      color: Colors.primary.main,
    },
    {
      icon: 'timer-outline' as const,
      title: t('tools.items.timer.title'),
      description: t('tools.items.timer.description'),
      route: '/tools/baking-timer',
      color: '#E07B39',
    },
    {
      icon: 'resize-outline' as const,
      title: t('tools.items.panSizes.title'),
      description: t('tools.items.panSizes.description'),
      route: '/tools/pan-converter',
      color: '#5B8DB8',
    },
    {
      icon: 'calculator-outline' as const,
      title: t('tools.items.macroCalculator.title'),
      description: t('tools.items.macroCalculator.description'),
      route: '/tools/macro-calculator',
      color: '#6B8E6B',
    },
   {
      icon: 'journal-outline' as const,
      title: t('tools.items.labNotes.title'),
      description: t('tools.items.labNotes.description'),
      route: '/tools/lab-notes',
      color: Colors.primary.main,
    },
    {
      icon: 'nutrition-outline' as const,
      title: t('tools.items.sweetenerComparison.title'),
      description: t('tools.items.sweetenerComparison.description'),
      route: '/tools/sweetener-comparison',
      color: '#D4A574',
    },
    {
      icon: 'book-outline' as const,
      title: t('tools.items.blog.title'),
      description: t('tools.items.blog.description'),
      route: '/blog',
      color: Colors.primary.main,
    },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('tools.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('tools.subtitle')}</Text>
        </View>

        {/* 2×2 Grid */}
        <View style={styles.grid}>
          {tools.map((tool) => (
            <TouchableOpacity
              key={tool.route}
              onPress={() => router.push(tool.route as any)}
              style={styles.card}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, { backgroundColor: tool.color }]}>
                <Ionicons name={tool.icon} size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.cardTitle}>{tool.title}</Text>
              <Text style={styles.cardDesc}>{tool.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tip */}
        <View style={styles.tipBox}>
          <Text style={styles.tipLabel}>💡 {t('tools.tipsOfDay')}</Text>
          <Text style={styles.tipText}>{t('tools.tipText')}</Text>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  card: {
    width: '47%',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.md,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.body1,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  cardDesc: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  tipBox: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary.opacity[10],
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  tipLabel: {
    fontWeight: '700',
    color: Colors.primary.main,
    marginBottom: 4,
    fontSize: 13,
  },
  tipText: {
    ...Typography.body2,
    color: Colors.text.primary,
    lineHeight: 20,
  },
});
