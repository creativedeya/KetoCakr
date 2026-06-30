import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/Theme';
import { useTranslation } from '../../constants/i18n';
import { fetchCardById, type TarotCardData } from '../../constants/mockTarotCards';
import CardFace from '../../components/KetoTarotCard/CardFace';

function formatDateText(d: Date): string {
  return d.toLocaleDateString('bg-BG', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function TarotCardFaceScreen() {
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const { language } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();

  const [card, setCard] = useState<TarotCardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = Array.isArray(cardId) ? cardId[0] : cardId;
    if (!id) { setLoading(false); return; }
    fetchCardById(id)
      .then(setCard)
      .finally(() => setLoading(false));
  }, [cardId]);

  const isBg = language === 'bg';
  const dateText = formatDateText(new Date());
  const cardWidth = Math.min(Math.round(screenWidth * 0.92), 420);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardWrapper}>
        {loading ? (
          <ActivityIndicator color={Colors.tarot.gold} size="large" />
        ) : card ? (
          <CardFace
            suit={card.suit}
            numeral={card.numeral}
            title={isBg ? card.title : card.titleEn}
            theme={isBg ? card.theme : card.themeEn}
            image={card.image}
            dateText={dateText}
            width={cardWidth}
            onReveal={() => router.push(`/tarot/ritual?cardId=${card.id}`)}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.tarot.cream,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing['2xl'],
  },
});
