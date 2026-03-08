// ===========================================================
// FILE: mobile/app/subscription/index.tsx
// PART 3: Premium subscription screen
// ===========================================================
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

// wrappers for previously used lucide icons
const X = (props: any) => <Ionicons name="close" {...props} />;
const Crown = (props: any) => <MaterialCommunityIcons name="crown" {...props} />;
const Check = (props: any) => <Ionicons name="checkmark" {...props} />;
const Sparkles = (props: any) => <Ionicons name="sparkles" {...props} />;
const Zap = (props: any) => <Ionicons name="flash" {...props} />;
const TrendingUp = (props: any) => <Ionicons name="trending-up" {...props} />;
import { useAuthStore } from '../../store/useAuthStore';

const PREMIUM_FEATURES = [
  {
    icon: Crown,
    title: 'Всички базови рецепти',
    description: 'Достъп до 200+ премиум базови рецепти',
  },
  {
    icon: Sparkles,
    title: 'Неограничени комбинации',
    description: 'Създавайте колкото искате персонализирани торти',
  },
  {
    icon: Zap,
    title: 'Приоритетна поддръжка',
    description: 'Бърз отговор на вашите въпроси',
  },
  {
    icon: TrendingUp,
    title: 'Ранен достъп',
    description: 'Първи достъп до нови функции',
  },
];

const SUBSCRIPTION_PLANS = [
  {
    id: 'monthly',
    name: 'Месечен',
    price: '9.99',
    currency: 'лв',
    period: 'месец',
    popular: false,
  },
  {
    id: 'yearly',
    name: 'Годишен',
    price: '89.99',
    currency: 'лв',
    period: 'година',
    popular: true,
    savings: 'Спестете 25%',
  },
];

export default function SubscriptionScreen() {
  const user = useAuthStore((state) => state.user);
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  const handleSubscribe = () => {
    if (!user) {
      Alert.alert('Вход необходим', 'Моля, влезте в профила си първо');
      router.push('/(auth)/signin');
      return;
    }

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan);
    
    Alert.alert(
      'Premium абонамент',
      `Потвърдете ${plan?.name} план за ${plan?.price} ${plan?.currency}/${plan?.period}`,
      [
        { text: 'Откажи', style: 'cancel' },
        {
          text: 'Потвърди',
          onPress: () => {
            // TODO: Integrate with RevenueCat
            Alert.alert('Успех! 👑', 'Благодарим ви за абонамента!\\n\\nПремиум функциите са активирани.');
            router.back();
          },
        },
      ]
    );
  };

  const handleRestorePurchases = () => {
    Alert.alert('Възстановяване', 'Проверяваме вашите покупки...');
    // TODO: Implement restore purchases with RevenueCat
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="flex-1 bg-white">
        {/* Close button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-14 right-6 z-10 bg-white/90 rounded-full p-2"
        >
          <X size={24} color={Colors.text.primary} />
        </TouchableOpacity>

        <ScrollView>
          {/* Hero Section */}
          <LinearGradient
            colors={[Colors.warning.main, Colors.warning.light]}
            className="px-6 pt-20 pb-12"
          >
            <View className="items-center">
              <View className="bg-white/20 rounded-full p-4 mb-4">
                <Crown size={48} color="white" />
              </View>
              <Text className="text-white text-4xl font-bold mb-2 text-center">
                KetoCakr Premium
              </Text>
              <Text className="text-amber-100 text-lg text-center">
                Отключете пълния потенциал
              </Text>
            </View>
          </LinearGradient>

          {/* Features */}
          <View className="px-6 py-8">
            <Text className="text-2xl font-bold text-gray-900 mb-6">
              Какво получавате?
            </Text>

            {PREMIUM_FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <View
                  key={index}
                  className="bg-amber-50 rounded-2xl p-5 mb-4 border-2 border-amber-200"
                >
                  <View className="flex-row items-start">
                    <View className="bg-amber-500 rounded-full p-3">
                      <Icon size={24} color="white" />
                    </View>
                    <View className="flex-1 ml-4">
                      <Text className="text-lg font-bold text-gray-900 mb-1">
                        {feature.title}
                      </Text>
                      <Text className="text-gray-600">
                        {feature.description}
                      </Text>
                    </View>
                    <Check size={20} color={Colors.warning.main} />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Pricing Plans */}
          <View className="px-6 pb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-6">
              Изберете план
            </Text>

            {SUBSCRIPTION_PLANS.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                onPress={() => setSelectedPlan(plan.id)}
                className={`rounded-2xl p-5 mb-4 border-2 ${
                  selectedPlan === plan.id
                    ? 'bg-amber-50 border-amber-500'
                    : 'bg-white border-gray-200'
                }`}
              >
                {plan.popular && (
                  <View className="absolute -top-3 right-4 bg-amber-500 rounded-full px-3 py-1">
                    <Text className="text-white text-xs font-bold">
                      ПОПУЛЯРЕН
                    </Text>
                  </View>
                )}

                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-900 mb-1">
                      {plan.name}
                    </Text>
                    <View className="flex-row items-baseline">
                      <Text className="text-3xl font-bold text-amber-600">
                        {plan.price}
                      </Text>
                      <Text className="text-gray-600 ml-1">
                        {plan.currency}/{plan.period}
                      </Text>
                    </View>
                    {plan.savings && (
                      <View className="bg-green-100 self-start px-2 py-1 rounded mt-2">
                        <Text className="text-green-700 text-xs font-bold">
                          {plan.savings}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <View
                    className={`w-6 h-6 rounded-full border-2 ${
                      selectedPlan === plan.id
                        ? 'bg-amber-500 border-amber-500'
                        : 'border-gray-300'
                    } items-center justify-center`}
                  >
                    {selectedPlan === plan.id && (
                      <Check size={16} color="white" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Testimonial */}
          <View className="px-6 pb-8">
            <View className="bg-purple-50 rounded-2xl p-5 border border-purple-200">
              <Text className="text-purple-900 font-semibold mb-2">
                💜 "Най-доброто приложение за кето десерти!"
              </Text>
              <Text className="text-purple-800 text-sm mb-2">
                "Премиум абонаментът напълно си заслужава. Толкова много опции и всички рецепти са перфектни!"
              </Text>
              <Text className="text-purple-600 text-xs">
                - Мария, Premium потребител
              </Text>
            </View>
          </View>

          {/* Free vs Premium comparison */}
          <View className="px-6 pb-8">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Free vs Premium
            </Text>
            
            <View className="bg-gray-50 rounded-2xl overflow-hidden">
              {[
                { feature: 'Базови рецепти', free: '50', premium: '200+' },
                { feature: 'Генерирани рецепти', free: '10/месец', premium: 'Неограничено' },
                { feature: 'Shopping list', free: '✓', premium: '✓' },
                { feature: 'Поддръжка', free: 'Email', premium: 'Приоритет' },
              ].map((row, index) => (
                <View
                  key={index}
                  className={`flex-row p-4 ${
                    index !== 3 ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <Text className="flex-1 text-gray-900">
                    {row.feature}
                  </Text>
                  <Text className="w-20 text-center text-gray-600">
                    {row.free}
                  </Text>
                  <Text className="w-20 text-center text-amber-600 font-bold">
                    {row.premium}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="h-32" />
        </ScrollView>

        {/* Bottom CTA */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
          <TouchableOpacity
            onPress={handleSubscribe}
            className="bg-amber-500 rounded-xl py-4 mb-3 flex-row items-center justify-center"
          >
            <Crown size={24} color="white" />
            <Text className="text-white font-bold text-lg ml-2">
              Започнете Premium
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRestorePurchases}>
            <Text className="text-gray-600 text-center text-sm">
              Възстановяване на покупки
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
