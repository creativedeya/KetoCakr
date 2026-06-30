import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../constants/Theme';
import { useLabNotes } from '../api/hooks/useLabNotes';

interface TipsModeProps {
  language: 'en' | 'bg';
  onBack: () => void;
}

export const TipsMode = ({ language, onBack }: TipsModeProps) => {
  const [query, setQuery] = useState('');
  const { data: tips = [], isFetching } = useLabNotes(query);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backBtn}>
            ← {language === 'bg' ? 'Назад' : 'Back'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          🧪 {language === 'bg' ? 'Съвети' : 'Tips'}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={Colors.text.tertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder={
            language === 'bg'
              ? 'Напр. "шоколад + крем"'
              : 'E.g. "chocolate + cream"'
          }
          value={query}
          onChangeText={setQuery}
          placeholderTextColor={Colors.text.tertiary}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={16} color={Colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      {query.trim().length < 2 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyEmoji}>🧪</Text>
          <Text style={styles.emptyText}>
            {language === 'bg' ? 'Въведи поне 2 символа' : 'Type at least 2 characters'}
          </Text>
        </View>
      ) : isFetching ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color={Colors.primary.main} size="large" />
        </View>
      ) : tips.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyText}>
            {language === 'bg' ? 'Няма намерени съвети' : 'No tips found'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={tips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: Colors.border.light }} />
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.tipCard}
              onPress={() => {
                router.push(`/tools/lab-notes/${item.category}/${item.id}` as any);
              }}
              activeOpacity={0.75}
            >
              <View style={styles.tipIcon}>
                <Text style={{ fontSize: 22 }}>{item.icon || '📋'}</Text>
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle} numberOfLines={2}>
                  {language === 'bg'
                    ? (item.title_bg || item.title)
                    : item.title}
                </Text>
                {(item.subtitle_en || item.subtitle_bg) && (
                  <Text style={styles.tipSubtitle} numberOfLines={1}>
                    {language === 'bg'
                      ? (item.subtitle_bg || item.subtitle_en)
                      : (item.subtitle_en || item.subtitle_bg)}
                  </Text>
                )}
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

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
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backBtn: {
    color: Colors.primary.main,
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    height: 44,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: 14,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    ...Typography.body1,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    ...Typography.body2,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  tipSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.secondary.opacity[10],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.secondary.dark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
