// ===========================================================
// PROFILE SCREEN - User Stats + Menu
// ===========================================================
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { router } from 'expo-router';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTranslation } from '../../../constants/i18n';
import { useLanguageStore } from '../../../store/useLanguageStore';

const Heart = (props: any) => <Ionicons name="heart-outline" {...props} />;
const ShoppingCart = (props: any) => <Ionicons name="cart" {...props} />;
const Crown = (props: any) => <MaterialCommunityIcons name="crown" {...props} />;
const Settings = (props: any) => <Ionicons name="settings-outline" {...props} />;
const LogOut = (props: any) => <Ionicons name="log-out-outline" {...props} />;
const DollarSign = (props: any) => <Ionicons name="cash" {...props} />;
const Globe = (props: any) => <Ionicons name="globe-outline" {...props} />;

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const { t, language } = useTranslation();
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const handleLogout = async () => {
    Alert.alert(
      t('profile.logoutConfirm.title'),
      t('profile.logoutConfirm.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.menu.logout'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: Heart,
      title: t('profile.menu.favoriteRecipes.title'),
      subtitle: t('profile.menu.favoriteRecipes.subtitle'),
      onPress: () => router.push('/favorites'),
    },
    {
      icon: ShoppingCart,
      title: t('profile.menu.shoppingList.title'),
      subtitle: t('profile.menu.shoppingList.subtitle'),
      onPress: () => router.push('/shopping-list'),
    },
    {
      icon: Crown,
      title: t('profile.menu.premium.title'),
      subtitle: t('profile.menu.premium.subtitle'),
      isPremium: true,
      onPress: () => router.push('/subscription'),
    },
    {
      icon: Settings,
      title: t('profile.menu.settings.title'),
      subtitle: t('profile.menu.settings.subtitle'),
      onPress: () => router.push('/settings'),
    },
  ];

  // If not logged in
  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background.primary }}>
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 40,
        }}>
          <Text style={{ fontSize: 80, marginBottom: 20 }}>👤</Text>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.text.primary,
            textAlign: 'center',
            marginBottom: 10,
          }}>
            {t('profile.login.title')}
          </Text>
          <Text style={{
            fontSize: 14,
            color: Colors.text.secondary,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 30,
          }}>
            {t('profile.login.description')}
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/signin')}
            style={{
              backgroundColor: Colors.primary.main,
              paddingVertical: 15,
              paddingHorizontal: 40,
              borderRadius: 30,
              marginBottom: 15,
            }}
          >
            <Text style={{
              color: Colors.text.inverse,
              fontWeight: 'bold',
              fontSize: 16,
            }}>
              {t('profile.login.signIn')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/signup')}
            style={{
              borderWidth: 2,
              borderColor: Colors.primary.main,
              paddingVertical: 15,
              paddingHorizontal: 40,
              borderRadius: 30,
            }}
          >
            <Text style={{
              color: Colors.primary.main,
              fontWeight: 'bold',
              fontSize: 16,
            }}>
              {t('profile.login.signUp')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Logged in user
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.primary }}>
      <ScrollView>
        {/* Profile Header with Gradient */}
        <View style={{
          backgroundColor: Colors.primary.main,
          paddingTop: 60,
          paddingBottom: 40,
          paddingHorizontal: 20,
          alignItems: 'center',
        }}>
          {/* Avatar */}
          <View style={{
            width: 80,
            height: 80,
            backgroundColor: Colors.primary.opacity[30],
            borderRadius: 40,
            borderWidth: 3,
            borderColor: Colors.text.inverse,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 15,
          }}>
            <Text style={{ fontSize: 40 }}>👤</Text>
          </View>

          {/* Name & Email */}
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.text.inverse,
            marginBottom: 5,
          }}>
            {user.user_metadata?.full_name || t('profile.user')}
          </Text>
          <Text style={{
            fontSize: 14,
            color: Colors.text.inverse,
            opacity: 0.9,
          }}>
            {user.email}
          </Text>
        </View>

        {/* Stats */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: Colors.background.primary,
          paddingVertical: 20,
          paddingHorizontal: 20,
          gap: 10,
        }}>
          {[
            { number: '12', label: t('profile.stats.myRecipes') },
            { number: '28', label: t('profile.stats.favorites') },
            { number: '156', label: t('profile.stats.daysActive') },
          ].map((stat, index) => (
            <View key={index} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: Colors.primary.main,
              }}>
                {stat.number}
              </Text>
              <Text style={{
                fontSize: 12,
                color: Colors.text.secondary,
                marginTop: 5,
                textAlign: 'center',
              }}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <View style={{ padding: 10 }}>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 18,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.border.light,
                }}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  backgroundColor: Colors.background.secondary,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 15,
                }}>
                  <IconComponent
                    size={20}
                    color={item.isPremium ? Colors.secondary.main : Colors.primary.main}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: Colors.text.primary,
                    marginBottom: 3,
                  }}>
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: Colors.text.secondary }}>
                    {item.subtitle}
                  </Text>
                </View>
                <Text style={{ color: Colors.border.dark, fontSize: 20 }}>›</Text>
              </TouchableOpacity>
            );
          })}

          {/* ========================================= */}
          {/* 💰 INGREDIENT PRICES - PRO FEATURE (NEW) */}
          {/* ========================================= */}
          <TouchableOpacity
            onPress={() => router.push('/ingredient-prices')}
            style={styles.pricesMenuItem}
          >
            <View style={styles.pricesIconContainer}>
              <DollarSign size={20} color="#A80048" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.pricesTitle}>
                  {t('profile.ingredientPrices.title')}
                </Text>
                <View style={styles.proBadge}>
                  <MaterialCommunityIcons name="crown" size={10} color="#FFD700" />
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              </View>
              <Text style={styles.pricesSubtitle}>
                {t('profile.ingredientPrices.subtitle')}
              </Text>
            </View>
            <Text style={{ color: Colors.border.dark, fontSize: 20 }}>›</Text>
          </TouchableOpacity>

          {/* Language Switcher */}
          <TouchableOpacity
            onPress={() => setLanguage(language === 'bg' ? 'en' : 'bg')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 18,
              borderBottomWidth: 1,
              borderBottomColor: Colors.border.light,
            }}
          >
            <View style={{
              width: 40,
              height: 40,
              backgroundColor: Colors.background.secondary,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 15,
            }}>
              <Globe size={20} color={Colors.primary.main} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.text.primary, marginBottom: 3 }}>
                {t('settings.language.title')}
              </Text>
              <Text style={{ fontSize: 13, color: Colors.text.secondary }}>
                {language === 'bg' ? '🇧🇬 Български' : '🇬🇧 English'}
              </Text>
            </View>
            <Text style={{ color: Colors.border.dark, fontSize: 20 }}>›</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 18,
              borderBottomWidth: 1,
              borderBottomColor: Colors.border.light,
            }}
          >
            <View style={{
              width: 40,
              height: 40,
              backgroundColor: Colors.error.light,
              opacity: 0.3,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 15,
            }}>
              <LogOut size={20} color={Colors.error.main} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 15,
                fontWeight: '600',
                color: Colors.error.main,
              }}>
                {t('profile.menu.logout')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={{
          padding: 20,
          alignItems: 'center',
          marginTop: 20,
        }}>
          <Text style={{
            fontSize: 12,
            color: Colors.text.secondary,
            marginBottom: 5,
          }}>
            {t('profile.appInfo.version')}
          </Text>
          <Text style={{
            fontSize: 11,
            color: Colors.text.secondary,
          }}>
            {t('profile.appInfo.tagline')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// Styles for the new Ingredient Prices menu item
const styles = StyleSheet.create({
  pricesMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    backgroundColor: '#FFF9F0', // Slight highlight for Pro feature
  },
  pricesIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#FFF0F5',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  pricesTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  pricesSubtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 3,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#B8860B',
  },
});
