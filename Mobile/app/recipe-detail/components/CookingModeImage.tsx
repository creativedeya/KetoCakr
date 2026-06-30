import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../../constants/Colors';

const { height } = Dimensions.get('window');
const IMAGE_HEIGHT = height * 0.38;

const BLAGO_LOGO = require('../../../assets/Logo-Blago.png');

interface CookingModeImageProps {
  imageUrl?: string | null;
  stepNumber: number;
}

export function CookingModeImage({ imageUrl }: CookingModeImageProps) {
  if (!imageUrl) {
    return (
      <View style={[styles.container, styles.placeholder]}>
        <Image source={BLAGO_LOGO} style={styles.logo} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: Colors.background.secondary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    opacity: 0.5,
  },
});
