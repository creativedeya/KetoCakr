import React from 'react';
import {
  Image,
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
import { formatNumeral } from './formatNumeral';

interface Props {
  suit: TarotSuit;
  numeral: string;
  title: string;
  theme: string;
  image: string | null;
  dateText: string;
  onReveal: () => void;
  width?: number;
}

function getSuitColor(suit: TarotSuit): string {
  if (suit === 'major') return TAROT_SUIT_COLORS.major.accent;
  return TAROT_SUIT_COLORS[suit];
}

export default function CardFace({ suit, numeral, title, theme, image, dateText, onReveal, width = CARD_WIDTH }: Props) {
  const { t } = useTranslation();
  const suitLabel = t(`home.tarot.suits.${suit}`);
  const { display: numeralDisplay, style: badgeStyle } = formatNumeral(suit, numeral);
  const suitColor = getSuitColor(suit);
  const imageAreaWidth = width - Spacing.base * 2;
  const imageAreaHeight = Math.round(width * 0.55);

  return (
    <View style={[styles.card, { width }]}>
      {/* Top row: suit chip + numeral badge */}
      <View style={styles.topRow}>
        <View style={[styles.suitChip, { backgroundColor: suitColor + '22', borderColor: suitColor }]}>
          <Text style={[styles.suitChipText, { color: suitColor }]}>● {suitLabel}</Text>
        </View>

        <View style={[
          styles.numeralBadge,
          badgeStyle === 'medallion'
            ? [styles.medallion, { borderColor: Colors.tarot.gold }]
            : [styles.disc, { backgroundColor: suitColor }],
        ]}>
          <Text style={[
            styles.numeralText,
            badgeStyle === 'medallion'
              ? { color: Colors.tarot.gold }
              : { color: Colors.text.inverse },
          ]}>
            {numeralDisplay}
          </Text>
        </View>
      </View>

      {/* Card image or placeholder */}
      <View style={[styles.imageArea, { width: imageAreaWidth, height: imageAreaHeight }]}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="sparkles-outline" size={36} color={Colors.tarot.gold} />
          </View>
        )}
      </View>

      {/* Date */}
      {dateText ? (
        <Text style={styles.dateText}>{dateText}</Text>
      ) : null}

      {/* Card name + theme */}
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardTheme}>{theme.toUpperCase()}</Text>

      {/* Pagination dots */}
      <View style={styles.dotsRow}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      {/* Italic teaser */}
      <Text style={styles.teaser}>{t('home.tarot.teaser')}</Text>

      {/* Reveal CTA */}
      <TouchableOpacity style={[styles.revealBtn, { backgroundColor: suitColor }]} onPress={onReveal} activeOpacity={0.85}>
        <Text style={styles.revealBtnText}>{t('home.tarot.revealButton')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const CARD_WIDTH = 280;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.tarot.cream,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1.5,
    borderColor: Colors.tarot.gold,
    padding: Spacing.base,
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.lg,
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  numeralBadge: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medallion: {
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  disc: {
    borderWidth: 0,
  },
  numeralText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  imageArea: {
    width: CARD_WIDTH - Spacing.base * 2,
    height: 160,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: Colors.tarot.gold + '18',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.xl,
  },
  dateText: {
    fontSize: 10,
    color: Colors.text.tertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  cardTheme: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border.medium,
  },
  dotActive: {
    backgroundColor: Colors.tarot.gold,
    width: 18,
    borderRadius: 3,
  },
  teaser: {
    ...Typography.body2,
    fontStyle: 'italic',
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  revealBtn: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    marginTop: Spacing.xs,
    ...Shadows.sm,
  },
  revealBtnText: {
    ...Typography.button,
    color: Colors.text.inverse,
    letterSpacing: 0.5,
  },
});
