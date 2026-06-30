import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors } from '../constants/Colors';
import { Spacing } from '../constants/Theme';

interface SliderComponentProps {
  label: string;
  min: number;
  max: number;
  value: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

export const SliderComponent = ({
  label,
  min,
  max,
  value,
  step,
  unit = '',
  onChange,
}: SliderComponentProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}{unit}</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={Colors.primary.main}
        maximumTrackTintColor={Colors.border.light}
        thumbTintColor={Colors.primary.main}
      />
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabel}>{min}{unit}</Text>
        <Text style={styles.rangeLabel}>{max}{unit}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary.main,
  },
  slider: {
    height: 40,
    marginVertical: 4,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeLabel: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
});
