import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, TAROT_SUIT_COLORS } from '../constants/Colors';
import { BorderRadius, Shadows, Spacing, Typography } from '../constants/Theme';
import { useTranslation } from '../constants/i18n';
import {
  fetchPublishedDeck,
  getDrawnCardToday,
  markDrawnToday,
  pickCardOfTheDay,
  type TarotCardData,
  type TarotSuit,
} from '../constants/mockTarotCards';
import TarotCardBack, { CARD_SIZES, type FanPosition } from './TarotCardBack';

// Fan geometry from spec §5 (design-handoff exact values)
const FAN_POSITIONS: Record<FanPosition, { translateX: number; rotate: string; zIndex: number; bottom: number }> = {
  'far-left':    { translateX: -156, rotate: '-28deg', zIndex: 1, bottom: 2 },
  'inner-left':  { translateX: -107, rotate: '-14deg', zIndex: 2, bottom: 9 },
  'center':      { translateX: -66,  rotate: '0deg',   zIndex: 4, bottom: 18 },
  'inner-right': { translateX: -13,  rotate: '14deg',  zIndex: 2, bottom: 9 },
  'far-right':   { translateX: 40,   rotate: '28deg',  zIndex: 1, bottom: 2 },
};

const FAN_ORDER: FanPosition[] = ['far-left', 'inner-left', 'center', 'inner-right', 'far-right'];

function getSuitColor(suit: TarotSuit): string {
  if (suit === 'major') return TAROT_SUIT_COLORS.major.accent;
  return TAROT_SUIT_COLORS[suit as keyof Omit<typeof TAROT_SUIT_COLORS, 'major'>] as string;
}
const FAN_CONTAINER_HEIGHT = 240;

type Phase = 'loading' | 'fan' | 'flipping' | 'revealed';

function formatDateText(d: Date): string {
  return d.toLocaleDateString('bg-BG', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function TarotDailyCardSection() {
  const { t, language } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();

  const [phase, setPhase] = useState<Phase>('loading');
  const [drawnCard, setDrawnCard] = useState<TarotCardData | null>(null);
  const [deck, setDeck] = useState<TarotCardData[]>([]);
  const dateText = useRef(formatDateText(new Date())).current;

  const flipRotation = useSharedValue(0);
  const fanOpacity = useSharedValue(1);

  // Fetch deck and check AsyncStorage for today's draw on mount
  useEffect(() => {
    fetchPublishedDeck().then((fetchedDeck) => {
      setDeck(fetchedDeck);
      return getDrawnCardToday(fetchedDeck);
    }).then((card) => {
      if (card) {
        setDrawnCard(card);
        setPhase('revealed');
      } else {
        setPhase('fan');
      }
    }).catch(() => {
      setPhase('fan');
    });
  }, []);

  function handleFlipComplete(card: TarotCardData) {
    markDrawnToday(card).catch(() => {});
    setDrawnCard(card);
    setPhase('revealed');
    router.push(`/tarot/card-face?cardId=${card.id}`);
  }

  function handleTapCenter() {
    if (phase !== 'fan' || deck.length === 0) return;
    const card = pickCardOfTheDay(deck);
    setPhase('flipping');

    // Fade out non-center cards
    fanOpacity.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.ease) });

    // Flip center card: rotateY 0→180 in 600ms, then transition
    flipRotation.value = withTiming(
      180,
      { duration: 600, easing: Easing.bezier(0.2, 0.7, 0.2, 1) },
      (finished) => {
        if (finished) runOnJS(handleFlipComplete)(card);
      }
    );
  }

  // Center card animated style: flip + fade out at end
  const centerFlipStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${flipRotation.value}deg` },
    ],
    opacity: interpolate(flipRotation.value, [0, 150, 180], [1, 1, 0]),
  }));

  // Non-center cards fade out on flip
  const nonCenterFadeStyle = useAnimatedStyle(() => ({
    opacity: fanOpacity.value,
  }));

  if (phase === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.tarot.gold} />
      </View>
    );
  }

  if (phase === 'revealed' && drawnCard) {
    const isBg = language === 'bg';
    const suitColor = getSuitColor(drawnCard.suit);
    const suitLabel = t(`home.tarot.suits.${drawnCard.suit}`);
    const cardTitle = isBg ? drawnCard.title : drawnCard.titleEn;
    const cardTheme = isBg ? drawnCard.theme : drawnCard.themeEn;

    return (
      <View style={styles.revealedContainer}>
        <TouchableOpacity
          style={styles.compactCard}
          onPress={() => router.push(`/tarot/card-face?cardId=${drawnCard.id}`)}
          activeOpacity={0.9}
        >
          <View style={styles.compactTopRow}>
            <View style={[styles.compactSuitChip, { backgroundColor: suitColor + '22', borderColor: suitColor }]}>
              <Text style={[styles.compactSuitText, { color: suitColor }]}>● {suitLabel}</Text>
            </View>
          </View>
          <View style={[styles.compactImageArea, { backgroundColor: suitColor + '18' }]}>
            <Ionicons name="sparkles-outline" size={28} color={suitColor} />
          </View>
          <Text style={styles.compactTitle}>{cardTitle}</Text>
          <Text style={styles.compactTheme}>{cardTheme.toUpperCase()}</Text>
          <Text style={[styles.compactCta, { color: suitColor }]}>{t('home.tarot.revealButton')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Fan state (including 'flipping' — same layout, animation handles the visual)
  return (
    <View style={styles.sectionContainer}>
      {/* 5-card fan */}
      <View style={[styles.fanContainer, { height: FAN_CONTAINER_HEIGHT }]} pointerEvents="box-none">
        {FAN_ORDER.map((pos) => {
          const cfg = FAN_POSITIONS[pos];
          const size = CARD_SIZES[pos];
          const isCenter = pos === 'center';
          const left = screenWidth / 2 + cfg.translateX;

          const positionStyle = {
            position: 'absolute' as const,
            left,
            bottom: cfg.bottom,
            zIndex: cfg.zIndex,
          };

          // Bottom-center rotation pivot (transform-origin: bottom center equivalent)
          const pivotTransform = isCenter
            ? []
            : [
                { translateY: size.height / 2 },
                { rotate: cfg.rotate },
                { translateY: -size.height / 2 },
              ];

          if (isCenter) {
            return (
              <Animated.View
                key={pos}
                style={[positionStyle, centerFlipStyle]}
                pointerEvents="auto"
              >
                <TarotCardBack
                  position="center"
                  isCenter={phase === 'fan'}
                  onPress={handleTapCenter}
                />
              </Animated.View>
            );
          }

          return (
            <Animated.View
              key={pos}
              style={[positionStyle, { transform: pivotTransform }, nonCenterFadeStyle]}
              pointerEvents="none"
            >
              <TarotCardBack position={pos} />
            </Animated.View>
          );
        })}
      </View>

      {/* White panel — sits visually behind the fan (fan overlaps its top) */}
      <View style={styles.panel}>
        <View style={styles.panelContent}>
          <Text style={styles.panelTitle}>{t('home.tarot.title')}</Text>
          <Text style={styles.panelHint}>{t('home.tarot.shuffleHint')}</Text>

          <TouchableOpacity
            style={styles.drawButton}
            onPress={handleTapCenter}
            disabled={phase === 'flipping'}
            activeOpacity={0.85}
          >
            <Text style={styles.drawButtonText}>{t('home.tarot.drawButton')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealedContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
  },
  compactCard: {
    width: 260,
    backgroundColor: Colors.tarot.cream,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1.5,
    borderColor: Colors.tarot.gold,
    padding: Spacing.base,
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.lg,
  },
  compactTopRow: {
    width: '100%',
    alignItems: 'flex-start',
  },
  compactSuitChip: {
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  compactSuitText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  compactImageArea: {
    width: '100%',
    height: 100,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  compactTheme: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  compactCta: {
    ...Typography.button,
    letterSpacing: 0.5,
    marginTop: Spacing.xs,
  },
  sectionContainer: {
    overflow: 'visible',
  },
  fanContainer: {
    position: 'relative',
    overflow: 'visible',
    zIndex: 4,
    marginBottom: -80,
  },
  panel: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius['2xl'],
    marginHorizontal: Spacing.base,
    paddingTop: 96,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    zIndex: 2,
    ...Shadows.md,
  },
  panelContent: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  panelTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  panelHint: {
    ...Typography.body2,
    color: Colors.text.tertiary,
    textAlign: 'center',
    fontSize: 12,
  },
  drawButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing['2xl'],
    marginTop: Spacing.sm,
    ...Shadows.sm,
  },
  drawButtonText: {
    ...Typography.button,
    color: Colors.text.inverse,
    letterSpacing: 0.5,
  },
});
