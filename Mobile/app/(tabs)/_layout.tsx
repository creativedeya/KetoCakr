// ===========================================================
// Bottom Tab Navigation - BLAGO BRAND
// ===========================================================
import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { IconSize } from '../../constants/Theme';
import { useTranslation } from '../../constants/i18n';

export default function TabsLayout() {
  const user = null;
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (

    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary.main,
        tabBarInactiveTintColor: Colors.text.tertiary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.background.primary,
          borderTopWidth: 1,
          borderTopColor: Colors.border.light,
          paddingBottom: insets.bottom + 10,
          paddingTop: 10,
          height: 70 + insets.bottom,
          shadowColor: Colors.shadow.light,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="home/index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name="home"
              size={focused ? IconSize.lg : IconSize.md}
              color={color}
            />
          ),
        }}
      />

      {/* Search Tab */}
      <Tabs.Screen
        name="search/index"
        options={{
          title: t('tabs.search'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name="search"
              size={focused ? IconSize.lg : IconSize.md}
              color={color}
            />
          ),
        }}
      />

      {/* Create Tab - Featured with larger icon */}
      <Tabs.Screen
        name="create/index"
        options={{
          title: t('tabs.create'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name="add-circle"
              size={focused ? 36 : 32}
              color={color}
            />
          ),
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      />

      {/* Tools Tab */}
      <Tabs.Screen
        name="tools/index"
        options={{
          title: t('tabs.tools'),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name="tools"
              size={focused ? IconSize.lg : IconSize.md}
              color={color}
            />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile/index"
        options={{
          title: user ? t('tabs.profile') : t('tabs.login'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name="person"
              size={focused ? IconSize.lg : IconSize.md}
              color={color}
            />
          ),
        }}
      />

      {/* Hidden Tabs */}
      <Tabs.Screen
        name="recipes/index"
        options={{
          href: null, // Hidden from tab bar
        }}
      />

      <Tabs.Screen
        name="shopping-list"
        options={{
        href: null,
      }}
      />
    </Tabs>
  );
}
