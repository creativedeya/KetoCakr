import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, Share, StyleSheet, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useTranslation } from '../../constants/i18n';
import { fetchCardById, type TarotCardData } from '../../constants/mockTarotCards';
import DailyRitual from '../../components/KetoTarotCard/DailyRitual';

export default function TarotRitualScreen() {
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const { language } = useTranslation();

  const [card, setCard] = useState<TarotCardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = Array.isArray(cardId) ? cardId[0] : cardId;
    if (!id) { setLoading(false); return; }
    fetchCardById(id)
      .then(setCard)
      .finally(() => setLoading(false));
  }, [cardId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.center}>
          <ActivityIndicator color={Colors.tarot.gold} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!card) return null;

  const isBg = language === 'bg';

  async function handleShareCard() {
    try {
      const shareTitle = isBg ? card!.title : card!.titleEn;
      const shareTheme = isBg ? card!.theme : card!.themeEn;
      const sharePhrase = isBg ? card!.phrase : card!.phraseEn;
      await Share.share({
        message: `${shareTitle} — ${shareTheme}\n"${sharePhrase}"\n\nИзтегли своята карта на деня в KetoCakR! 🔮🍰`,
      });
    } catch (err) {
      console.error('[Tarot] Share error:', err);
    }
  }

  function handleCta() {
    if (card!.arcana_type === 'major' && card!.linked_recipe_id) {
      router.push(`/recipe-detail/${card!.linked_recipe_id}`);
    } else if (card!.arcana_type === 'minor' && card!.linked_base_recipe_id) {
      router.push({
        pathname: '/tarot/recipes-by-role',
        params: {
          linkedBaseRecipeId: card!.linked_base_recipe_id,
          componentName: isBg ? card!.theme : card!.themeEn,
        },
      });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <DailyRitual
        suit={card.suit}
        title={isBg ? card.title : card.titleEn}
        theme={isBg ? card.theme : card.themeEn}
        image={card.image}
        energy={isBg ? card.energy : card.energyEn}
        phrase={isBg ? card.phrase : card.phraseEn}
        morning={isBg ? card.morning : card.morningEn}
        trap={isBg ? card.trap : card.trapEn}
        evening={isBg ? card.evening : card.eveningEn}
        cta={isBg ? card.cta : card.ctaEn}
        onBack={() => router.back()}
        onCta={handleCta}
        onShare={handleShareCard}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.tarot.cream,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
