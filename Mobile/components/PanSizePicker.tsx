// ===========================================================
// PanSizePicker — вградени чипове или разгъваем dropdown
// compact=true → хоризонтални chips (за builder)
// compact=false → header + Modal dropdown (за recipe detail)
// ===========================================================
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Spacing, BorderRadius } from '../constants/Theme';
import { useTranslation } from '../constants/i18n';
import { useLanguageStore } from '../store/useLanguageStore';
import {
  ROUND_PANS,
  RECTANGULAR_PANS,
  BakingPan,
  RectangularPan,
  getPanByServings,
} from '../constants/BakingPans';

interface PanSizePickerProps {
  selectedServings: number;
  onSelectServings: (servings: number) => void;
  compact?: boolean;
}

export default function PanSizePicker({
  selectedServings,
  onSelectServings,
  compact = false,
}: PanSizePickerProps) {
  const { t } = useTranslation();
  const { unitSystem } = useLanguageStore();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedPan = getPanByServings(selectedServings);

  const getPanSize = (pan: BakingPan | RectangularPan): string =>
    unitSystem === 'metric' ? pan.metricSize : pan.imperialSize;

  const isRectangular = RECTANGULAR_PANS.some(p => p.servings === selectedServings);
  const currentServingsLabel = isRectangular
    ? t('panPicker.pieces')
    : t('panPicker.servings');

  // ─── Compact mode: horizontal chips ───────────────────────
  if (compact) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {[...ROUND_PANS, ...RECTANGULAR_PANS].map(pan => {
          const isActive = pan.servings === selectedServings;
          return (
            <TouchableOpacity
              key={pan.servings}
              onPress={() => onSelectServings(pan.servings)}
              style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
            >
              <Text style={[
                styles.chipText,
                { color: isActive ? Colors.text.inverse : Colors.text.primary },
              ]}>
                {pan.servings}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  // ─── Full mode: header row + Modal dropdown ────────────────
  const currentSize = selectedPan ? getPanSize(selectedPan) : '-';

  return (
    <View>
      <TouchableOpacity style={styles.header} onPress={() => setModalVisible(true)}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>
            🍰 {t('panPicker.title')}: {currentSize}
          </Text>
          <Text style={styles.headerSubtitle}>
            {selectedServings} {currentServingsLabel}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={Colors.text.secondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
          activeOpacity={1}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('panPicker.selectPan')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {ROUND_PANS.map(pan => {
                const isSelected = pan.servings === selectedServings;
                return (
                  <TouchableOpacity
                    key={pan.servings}
                    style={styles.optionRow}
                    onPress={() => {
                      onSelectServings(pan.servings);
                      setModalVisible(false);
                    }}
                  >
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.optionText}>
                      {pan.servings} {t('panPicker.servings')} — {getPanSize(pan)}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <View style={styles.sectionDivider} />
              <Text style={styles.sectionTitle}>{t('panPicker.rectangular')}</Text>

              {RECTANGULAR_PANS.map(pan => {
                const isSelected = pan.servings === selectedServings;
                return (
                  <TouchableOpacity
                    key={pan.servings}
                    style={styles.optionRow}
                    onPress={() => {
                      onSelectServings(pan.servings);
                      setModalVisible(false);
                    }}
                  >
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.optionText}>
                      {pan.servings} {t('panPicker.pieces')} — {getPanSize(pan)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Compact chips
  chipsContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    minWidth: 40,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: Colors.primary.main,
  },
  chipInactive: {
    backgroundColor: Colors.background.secondary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Full mode header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 2,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },

  // Options
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.secondary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: Colors.primary.main,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary.main,
  },
  optionText: {
    fontSize: 15,
    color: Colors.text.primary,
  },

  // Section divider
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
