import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/Theme';
import { useTranslation } from '../../../constants/i18n';
import { SearchMode } from '../../../components/SearchMode';
import { ProductsMode } from '../../../components/ProductsMode';
import { TipsMode } from '../../../components/TipsMode';

type ActiveMode = 'search' | 'products' | 'tips';

export default function SearchTab() {
  const { language } = useTranslation();
  const [activeMode, setActiveMode] = useState<ActiveMode>('search');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {language === 'bg' ? 'Търсене' : 'Search'}
        </Text>

        <View style={styles.modeButtons}>
          {/* Search mode */}
          <TouchableOpacity
            style={[styles.modeBtn, activeMode === 'search' && styles.modeBtnActive]}
            onPress={() => setActiveMode('search')}
          >
            <Ionicons
              name="search"
              size={20}
              color={activeMode === 'search' ? Colors.text.inverse : Colors.primary.main}
            />
          </TouchableOpacity>

          {/* Products mode */}
          <TouchableOpacity
            style={[styles.modeBtn, activeMode === 'products' && styles.modeBtnActive]}
            onPress={() => setActiveMode('products')}
          >
            <MaterialCommunityIcons
              name="food-apple-outline"
              size={20}
              color={activeMode === 'products' ? Colors.text.inverse : Colors.primary.main}
            />
          </TouchableOpacity>

          {/* Tips mode */}
          <TouchableOpacity
            style={[styles.modeBtn, activeMode === 'tips' && styles.modeBtnActive]}
            onPress={() => setActiveMode('tips')}
          >
            <MaterialCommunityIcons
              name="flask-outline"
              size={20}
              color={activeMode === 'tips' ? Colors.text.inverse : Colors.primary.main}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mode Content */}
      {activeMode === 'search' && <SearchMode language={language} />}
      {activeMode === 'products' && (
        <ProductsMode language={language} onBack={() => setActiveMode('search')} />
      )}
      {activeMode === 'tips' && (
        <TipsMode language={language} onBack={() => setActiveMode('search')} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  modeButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: Colors.primary.main,
  },
});
