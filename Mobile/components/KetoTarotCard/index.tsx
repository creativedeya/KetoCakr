import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import type { TarotSuit } from '../../constants/mockTarotCards';
import CardFace from './CardFace';
import DailyRitual from './DailyRitual';

export interface KetoTarotCardProps {
  suit: TarotSuit;
  numeral: string;
  pips: number;
  title: string;
  theme: string;
  image: string | null;
  energy: string;
  phrase: string;
  morning: string;
  trap: string;
  evening: string;
  cta: string;
  dateText: string;
  initialScreen?: 'face' | 'ritual';
}

export default function KetoTarotCard({
  suit, numeral, pips, title, theme, image, energy, phrase,
  morning, trap, evening, cta, dateText,
  initialScreen = 'face',
}: KetoTarotCardProps) {
  const [screen, setScreen] = useState<'face' | 'ritual'>(initialScreen);

  if (screen === 'ritual') {
    return (
      <DailyRitual
        suit={suit}
        title={title}
        theme={theme}
        energy={energy}
        phrase={phrase}
        morning={morning}
        trap={trap}
        evening={evening}
        cta={cta}
        onBack={() => setScreen('face')}
      />
    );
  }

  return (
    <View style={styles.wrapper}>
      <CardFace
        suit={suit}
        numeral={numeral}
        title={title}
        theme={theme}
        image={image}
        dateText={dateText}
        onReveal={() => setScreen('ritual')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
});
