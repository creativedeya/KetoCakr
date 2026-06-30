import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, TAROT_SUIT_COLORS } from '../../constants/Colors';
import { BorderRadius, Shadows, Spacing, Typography } from '../../constants/Theme';
import { useTranslation } from '../../constants/i18n';
import type { TarotSuit } from '../../constants/mockTarotCards';

interface Props {
  suit: TarotSuit;
  title: string;
  theme: string;
  image?: string | null;
  energy: string;
  phrase: string;
  morning: string;
  trap: string;
  evening: string;
  cta: string;
  onBack: () => void;
  onCta?: () => void;
  onShare?: () => void;
}

function getSuitColor(suit: TarotSuit): string {
  if (suit === 'major') return TAROT_SUIT_COLORS.major.accent;
  return TAROT_SUIT_COLORS[suit];
}

export default function DailyRitual({
  suit, title, theme, image, energy, phrase, morning, trap, evening, cta, onBack, onCta, onShare,
}: Props) {
  const { t } = useTranslation();
  const suitLabel = t(`home.tarot.suits.${suit}`);
  const suitColor = getSuitColor(suit);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('home.tarot.dailyRitual')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="heart-outline" size={22} color={Colors.primary.main} />
          </TouchableOpacity>
          <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} onPress={onShare}>
            <Ionicons name="share-outline" size={22} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Card thumbnail strip */}
        <View style={styles.thumbnailRow}>
          <View style={[styles.thumbnailImg, { backgroundColor: suitColor + '22' }]}>
            {image ? (
              <Image source={{ uri: image }} style={styles.thumbnailImgFull} resizeMode="cover" />
            ) : (
              <Ionicons name="sparkles-outline" size={18} color={suitColor} />
            )}
          </View>
          <View style={styles.thumbnailText}>
            <Text style={styles.thumbnailName}>{title}</Text>
            <Text style={styles.thumbnailMeta}>Кето магия · {theme}</Text>
          </View>
        </View>

        {/* Context header */}
        <View style={styles.contextRow}>
          <View style={[styles.suitChip, { backgroundColor: suitColor + '22', borderColor: suitColor }]}>
            <Text style={[styles.suitChipText, { color: suitColor }]}>● {suitLabel}</Text>
          </View>
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardTheme}>{theme.toUpperCase()}</Text>

        {/* Energy */}
        <View style={styles.energyBlock}>
          <Text style={styles.sectionLabel}>{t('home.tarot.energyLabel')}</Text>
          <Text style={[styles.energyWord, { color: suitColor }]}>{energy}</Text>
        </View>

        {/* Quote / phrase */}
        <View style={styles.quoteBlock}>
          <View style={[styles.quoteBar, { backgroundColor: suitColor }]} />
          <Text style={styles.quoteText}>{phrase}</Text>
        </View>

        {/* Morning */}
        <View style={styles.textBlock}>
          <Text style={[styles.blockLabel, { color: suitColor }]}>{t('home.tarot.morningLabel')}</Text>
          <Text style={styles.blockText}>{morning}</Text>
        </View>

        {/* Trap */}
        <View style={styles.textBlock}>
          <Text style={[styles.blockLabel, { color: Colors.warning.dark }]}>{t('home.tarot.trapLabel')}</Text>
          <Text style={styles.blockText}>{trap}</Text>
        </View>

        {/* Evening */}
        <View style={styles.textBlock}>
          <Text style={[styles.blockLabel, { color: Colors.text.secondary }]}>{t('home.tarot.eveningLabel')}</Text>
          <Text style={styles.blockText}>{evening}</Text>
        </View>

        {/* CTA */}
        <TouchableOpacity style={[styles.ctaButton, { backgroundColor: suitColor }]} onPress={onCta} activeOpacity={0.85}>
          <Text style={styles.ctaButtonText}>{cta}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.tarot.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    backgroundColor: Colors.tarot.cream,
  },
  backBtn: {
    marginRight: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    ...Typography.h4,
    color: Colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.base,
  },
  content: {
    padding: Spacing.xl,
    gap: Spacing.base,
    paddingBottom: Spacing['4xl'],
  },
  contextRow: {
    flexDirection: 'row',
  },
  suitChip: {
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  suitChipText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  cardTheme: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    color: Colors.text.secondary,
  },
  energyBlock: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border.light,
  },
  sectionLabel: {
    ...Typography.caption,
    fontWeight: '700',
    letterSpacing: 2,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
  },
  energyWord: {
    ...Typography.h3,
    textAlign: 'center',
  },
  quoteBlock: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
  },
  quoteBar: {
    width: 3,
    borderRadius: BorderRadius.round,
    flexShrink: 0,
  },
  quoteText: {
    ...Typography.body1,
    fontStyle: 'italic',
    color: Colors.text.primary,
    flex: 1,
    lineHeight: 26,
  },
  textBlock: {
    gap: Spacing.xs,
  },
  blockLabel: {
    ...Typography.caption,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  blockText: {
    ...Typography.body2,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  ctaButton: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadows.sm,
  },
  ctaButtonText: {
    ...Typography.button,
    color: Colors.text.inverse,
    letterSpacing: 0.5,
  },
  thumbnailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  thumbnailImg: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnailImgFull: {
    width: '100%',
    height: '100%',
  },
  thumbnailText: {
    flex: 1,
  },
  thumbnailName: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  thumbnailMeta: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
});
