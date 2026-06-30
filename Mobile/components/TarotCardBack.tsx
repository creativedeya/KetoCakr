import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { BorderRadius, Spacing } from '../constants/Theme';

export type FanPosition = 'far-left' | 'inner-left' | 'center' | 'inner-right' | 'far-right';

interface Props {
  position: FanPosition;
  isCenter?: boolean;
  onPress?: () => void;
}

export const CARD_SIZES: Record<FanPosition, { width: number; height: number }> = {
  'far-left':    { width: 110, height: 165 },
  'inner-left':  { width: 115, height: 173 },
  'center':      { width: 132, height: 198 },
  'inner-right': { width: 115, height: 173 },
  'far-right':   { width: 110, height: 165 },
};

export default function TarotCardBack({ position, isCenter = false, onPress }: Props) {
  const { width, height } = CARD_SIZES[position];
  const floatY = useSharedValue(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (!isCenter || reduceMotion) {
      cancelAnimation(floatY);
      floatY.value = 0;
      return;
    }
    floatY.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    return () => {
      cancelAnimation(floatY);
      floatY.value = 0;
    };
  }, [isCenter, reduceMotion]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const cardContent = (
    <Animated.View style={[{ width, height }, isCenter ? floatStyle : undefined]}>
      {/* Outer gold border */}
      <View style={[styles.outerBorder, { width, height, borderRadius: BorderRadius.xl }]}>
        {/* Inner gold border */}
        <View style={styles.innerBorder}>
          <View style={styles.content}>
            <View style={[styles.logoCircle, isCenter ? styles.logoCenterSize : styles.logoSmallSize]}>
              <Image
                source={require('../assets/Logo-Blago.png')}
                style={isCenter ? styles.logoImgCenter : styles.logoImgSmall}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.brandText, isCenter ? styles.brandTextCenter : styles.brandTextSmall]}>
              КЕТО МАГИЯ ТАРО
            </Text>
            <View style={styles.divider} />
            <View style={styles.dots}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  if (isCenter && onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  outerBorder: {
    borderWidth: 1.5,
    borderColor: Colors.tarot.gold,
    backgroundColor: Colors.tarot.cream,
    padding: 4,
    overflow: 'hidden',
  },
  innerBorder: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.tarot.gold + 'AA',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.tarot.cream,
    gap: Spacing.xs,
    padding: Spacing.sm,
  },
  logoCircle: {
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.tarot.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCenterSize: {
    width: 52,
    height: 52,
  },
  logoSmallSize: {
    width: 36,
    height: 36,
  },
  logoImgCenter: {
    width: 34,
    height: 34,
  },
  logoImgSmall: {
    width: 22,
    height: 22,
  },
  brandText: {
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.tarot.gold,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  brandTextCenter: {
    fontSize: 8,
  },
  brandTextSmall: {
    fontSize: 6,
  },
  divider: {
    width: 28,
    height: 1,
    backgroundColor: Colors.tarot.gold,
    opacity: 0.5,
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.tarot.gold,
    opacity: 0.6,
  },
});
