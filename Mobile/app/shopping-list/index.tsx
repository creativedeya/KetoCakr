// ===========================================================
// FILE: mobile/app/shopping-list/index.tsx
// PART 4: Shopping list screen
// ===========================================================
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { router, Stack } from 'expo-router';
import { useEffect, useState, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Theme';
import { useTranslation } from '../../constants/i18n';
import { useLanguageStore } from '../../store/useLanguageStore';

// icon wrappers matching previous names
const ChevronLeft = (props: any) => <Ionicons name="chevron-back" {...props} />;
const ShoppingCart = (props: any) => <Ionicons name="cart" {...props} />;
const Plus = (props: any) => <Ionicons name="add" {...props} />;
const Trash2 = (props: any) => <Ionicons name="trash-outline" {...props} />;
const CheckCircle2 = (props: any) => <Ionicons name="checkmark-circle-outline" {...props} />;
const Circle = (props: any) => <Ionicons name="ellipse-outline" {...props} />;
const X = (props: any) => <Ionicons name="close" {...props} />;
import { useShoppingListStore } from '../../store/useShoppingListStore';

export default function ShoppingListScreen() {
  const {
    items,
    isLoaded,
    loadItems,
    addItem,
    removeItem,
    toggleCheck,
    clearChecked,
    clearAll,
  } = useShoppingListStore();

  const { t } = useTranslation();
  const { language } = useLanguageStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newIngredient, setNewIngredient] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newUnit, setNewUnit] = useState('гр');

  useEffect(() => {
    if (!isLoaded) {
      loadItems();
    }
  }, [isLoaded]);

  const handleAddItem = () => {
    if (!newIngredient.trim()) {
      Alert.alert(t('common.error'), t('shoppingList.alerts.emptyIngredient'));
      return;
    }

    const quantity = parseFloat(newQuantity) || 1;

    addItem({
      ingredient: newIngredient.trim(),
      quantity,
      unit: newUnit,
    });

    // Reset form
    setNewIngredient('');
    setNewQuantity('');
    setNewUnit('гр');
    setShowAddForm(false);
  };

  const handleClearChecked = () => {
    const checkedCount = items.filter(i => i.isChecked).length;
    if (checkedCount === 0) {
      Alert.alert(t('shoppingList.alerts.noChecked.title'), t('shoppingList.alerts.noChecked.message'));
      return;
    }

    Alert.alert(
      t('shoppingList.alerts.deleteChecked.title'),
      t('shoppingList.alerts.deleteChecked.message').replace('{{count}}', String(checkedCount)),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('shoppingList.alerts.deleteChecked.button'), style: 'destructive', onPress: clearChecked },
      ]
    );
  };

  const handleClearAll = () => {
    if (items.length === 0) return;

    Alert.alert(
      t('shoppingList.alerts.clearAll.title'),
      t('shoppingList.alerts.clearAll.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('shoppingList.alerts.clearAll.button'), style: 'destructive', onPress: clearAll },
      ]
    );
  };

  const uncheckedItems = items.filter(i => !i.isChecked);
  const checkedItems = items.filter(i => i.isChecked);

  // Category order for grocery shopping (matches ingredient_categories table)
  const CATEGORY_ORDER = language === 'en' ? [
    'Dairy',
    'Eggs & Proteins',
    'Flours',
    'Sweeteners',
    'Fats & Oils',
    'Chocolate & Cocoa',
    'Nuts & Seeds',
    'Spices & Flavors',
    'Leavening Agents',
    'Gelling Agents',
    'Other',
  ] : [
    'Млечни продукти',
    'Яйца и протеини',
    'Брашна',
    'Подсладители',
    'Мазнини',
    'Шоколад и какао',
    'Ядки и семена',
    'Подправки и аромати',
    'Разпускатели',
    'Желиращи агенти',
    'Други',
  ];

  const getIngredientName = (item: typeof items[0]) => {
    if (language === 'en' && item.ingredientEn) return item.ingredientEn;
    if (language === 'bg' && item.ingredientBg) return item.ingredientBg;
    return item.ingredient;
  };

  const groupedUnchecked = useMemo(() => {
    const groups = new Map<string, typeof items>();
    uncheckedItems.forEach(item => {
      const cat = item.category || 'other';
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(item);
    });
    // Sort by predefined order
    const sorted: Array<{ category: string; items: typeof items }> = [];
    CATEGORY_ORDER.forEach(cat => {
      if (groups.has(cat)) {
        sorted.push({ category: cat, items: groups.get(cat)! });
        groups.delete(cat);
      }
    });
    // Remaining unknown categories
    groups.forEach((groupItems, cat) => {
      sorted.push({ category: cat, items: groupItems });
    });
    return sorted;
  }, [uncheckedItems, language]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="px-6 pt-16 pb-6 bg-green-500 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <ShoppingCart size={24} color="white" />
          <Text className="text-white text-2xl font-bold ml-3 flex-1">
            {t('shoppingList.title')}
          </Text>
          {items.length > 0 && (
            <TouchableOpacity onPress={handleClearAll}>
              <Trash2 size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView className="flex-1 px-6 pt-6">
          {/* Stats */}
          {items.length > 0 && (
            <View className="bg-green-50 rounded-xl p-4 mb-4 border border-green-200">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-green-900 font-bold text-lg">
                    {t('shoppingList.stats.unchecked').replace('{{count}}', String(uncheckedItems.length))}
                  </Text>
                  <Text className="text-green-700 text-sm">
                    {t('shoppingList.stats.checked').replace('{{count}}', String(checkedItems.length))}
                  </Text>
                </View>
                {checkedItems.length > 0 && (
                  <TouchableOpacity
                    onPress={handleClearChecked}
                    className="bg-green-500 rounded-lg px-4 py-2"
                  >
                    <Text className="text-white font-semibold text-sm">
                      {t('shoppingList.clearChecked')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Add item button */}
          {!showAddForm && (
            <TouchableOpacity
              onPress={() => setShowAddForm(true)}
              className="bg-green-500 rounded-xl p-4 mb-4 flex-row items-center justify-center"
            >
              <Plus size={20} color="white" />
              <Text className="text-white font-bold ml-2">
                {t('shoppingList.addProduct')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Add item form */}
          {showAddForm && (
            <View className="bg-gray-50 rounded-xl p-4 mb-4 border-2 border-green-500">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-bold text-gray-900">
                  {t('shoppingList.newProduct')}
                </Text>
                <TouchableOpacity onPress={() => setShowAddForm(false)}>
                  <X size={24} color={Colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <TextInput
                value={newIngredient}
                onChangeText={setNewIngredient}
                placeholder={t('shoppingList.productName')}
                className="bg-white border-2 border-gray-200 rounded-lg px-4 py-3 mb-3 text-gray-900"
              />

              <View className="flex-row gap-2 mb-3">
                <TextInput
                  value={newQuantity}
                  onChangeText={setNewQuantity}
                  placeholder={t('shoppingList.quantity')}
                  keyboardType="numeric"
                  className="flex-1 bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900"
                />
                <TextInput
                  value={newUnit}
                  onChangeText={setNewUnit}
                  placeholder={t('shoppingList.unit')}
                  className="w-24 bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900"
                />
              </View>

              <TouchableOpacity
                onPress={handleAddItem}
                className="bg-green-500 rounded-lg py-3"
              >
                <Text className="text-white font-bold text-center">
                  {t('shoppingList.add')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Unchecked items — grouped by category */}
          {uncheckedItems.length > 0 && (
            <View style={styles.groupSection}>
              <Text className="text-lg font-bold text-gray-900 mb-3">
                {t('shoppingList.toBuy')}
              </Text>
              {groupedUnchecked.map(({ category, items: groupItems }) => (
                <View key={category}>
                  {groupedUnchecked.length > 1 && (
                    <Text style={styles.categoryHeader}>{category}</Text>
                  )}
                  {groupItems.map((item) => (
                    <View
                      key={item.id}
                      className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-3"
                    >
                      <View className="flex-row items-center">
                        <TouchableOpacity
                          onPress={() => toggleCheck(item.id)}
                          className="mr-3"
                        >
                          <Circle size={24} color={Colors.success.main} />
                        </TouchableOpacity>

                        <View className="flex-1">
                          <Text className="text-base font-semibold text-gray-900">
                            {getIngredientName(item)}
                          </Text>
                          <Text className="text-sm text-gray-600">
                            {item.quantity} {item.unit}
                            {item.recipeName && (
                              <Text className="text-green-600">
                                {' '}• {item.recipeName}
                              </Text>
                            )}
                          </Text>
                        </View>

                        <TouchableOpacity
                          onPress={() => removeItem(item.id)}
                          className="p-2"
                        >
                          <Trash2 size={18} color={Colors.error.main} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}

          {/* Checked items */}
          {checkedItems.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-500 mb-3">
                {t('shoppingList.bought')}
              </Text>
              {checkedItems.map((item) => (
                <View
                  key={item.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3 opacity-60"
                >
                  <View className="flex-row items-center">
                    <TouchableOpacity
                      onPress={() => toggleCheck(item.id)}
                      className="mr-3"
                    >
                      <CheckCircle2 size={24} color={Colors.success.main} />
                    </TouchableOpacity>

                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-500 line-through">
                        {getIngredientName(item)}
                      </Text>
                      <Text className="text-sm text-gray-400">
                        {item.quantity} {item.unit}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => removeItem(item.id)}
                      className="p-2"
                    >
                      <Trash2 size={18} color={Colors.text.secondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Empty state */}
          {items.length === 0 && (
            <View className="items-center py-12">
              <Text className="text-6xl mb-4">🛒</Text>
              <Text className="text-xl font-bold text-gray-900 mb-2">
                {t('shoppingList.empty.title')}
              </Text>
              <Text className="text-gray-600 text-center mb-6">
                {t('shoppingList.empty.description')}
              </Text>
            </View>
          )}

          <View className="h-20" />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  groupSection: {
    marginBottom: 24,
  },
  categoryHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
});
