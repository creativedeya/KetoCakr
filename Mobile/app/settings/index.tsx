// ===========================================================
// FILE: mobile/app/settings/index.tsx
// PART 2: Settings screen
// ===========================================================
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, StyleSheet } from 'react-native';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Theme';
import { useTranslation } from '../../constants/i18n';
import { useLanguageStore } from '../../store/useLanguageStore';

// icon wrappers matching previous lucide names
const ChevronLeft = (props: any) => <Ionicons name="chevron-back" {...props} />;
const SettingsIcon = (props: any) => <Ionicons name="settings-outline" {...props} />;
const Bell = (props: any) => <Ionicons name="notifications-outline" {...props} />;
const Moon = (props: any) => <Ionicons name="moon-outline" {...props} />;
const Globe = (props: any) => <Ionicons name="globe-outline" {...props} />;
const Info = (props: any) => <Ionicons name="information-circle-outline" {...props} />;
const Shield = (props: any) => <Ionicons name="shield-outline" {...props} />;
const HelpCircle = (props: any) => <Ionicons name="help-circle-outline" {...props} />;
const Mail = (props: any) => <Ionicons name="mail-outline" {...props} />;
const ExternalLink = (props: any) => <Ionicons name="open-outline" {...props} />;
const ChevronRight = (props: any) => <Ionicons name="chevron-forward" {...props} />;
import { useAuthStore } from '../../store/useAuthStore';

export default function SettingsScreen() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const { t, language } = useTranslation();
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const unitSystem = useLanguageStore((state) => state.unitSystem);
  const setUnitSystem = useLanguageStore((state) => state.setUnitSystem);
  const currency = useLanguageStore((state) => state.currency);
  const setCurrency = useLanguageStore((state) => state.setCurrency);

  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSaveSettings = () => {
    Alert.alert(t('settings.saved.title'), t('settings.saved.message'));
  };

  if (!user) {
    return (
      <View className="flex-1 bg-white">
        <View className="px-6 pt-16 pb-6 flex-row items-center" style={{ backgroundColor: Colors.text.secondary }}>
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ChevronLeft size={24} color={Colors.text.inverse} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold flex-1" style={{ color: Colors.text.inverse }}>
            {t('settings.title')}
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-6xl mb-4">🔒</Text>
          <Text className="text-xl font-bold mb-2 text-center" style={{ color: Colors.text.primary }}>
            {t('settings.loginRequired.title')}
          </Text>
          <Text className="text-center mb-6" style={{ color: Colors.text.secondary }}>
            {t('settings.loginRequired.subtitle')}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/signin')}
            className="rounded-xl px-8 py-4"
            style={{ backgroundColor: Colors.text.secondary }}
          >
            <Text className="font-bold text-base" style={{ color: Colors.text.inverse }}>
              {t('profile.login.signIn')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="px-6 pt-16 pb-6 flex-row items-center" style={{ backgroundColor: Colors.text.secondary }}>
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ChevronLeft size={24} color={Colors.text.inverse} />
          </TouchableOpacity>
          <SettingsIcon size={24} color={Colors.text.inverse} />
          <Text className="text-2xl font-bold ml-3 flex-1" style={{ color: Colors.text.inverse }}>
            {t('settings.title')}
          </Text>
        </View>

        <ScrollView className="flex-1">
          {/* Account Section */}
          <View className="px-6 py-4">
            <Text className="text-xs font-bold text-gray-500 mb-3 uppercase">
              {t('settings.account')}
            </Text>

            <View className="bg-gray-50 rounded-2xl p-4 mb-2">
              <Text className="text-sm text-gray-600 mb-1">{t('settings.email')}</Text>
              <Text className="text-base font-semibold text-gray-900">
                {user.email}
              </Text>
            </View>

            <View className="bg-gray-50 rounded-2xl p-4">
              <Text className="text-sm text-gray-600 mb-1">{t('settings.name')}</Text>
              <Text className="text-base font-semibold text-gray-900">
                {profile?.full_name || t('settings.notSet')}
              </Text>
            </View>
          </View>

          {/* Preferences Section */}
          <View className="px-6 py-4 border-t border-gray-200">
            <Text className="text-xs font-bold text-gray-500 mb-3 uppercase">
              {t('settings.preferences')}
            </Text>

            {/* Notifications */}
            <View className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-blue-50 rounded-full p-2">
                  <Bell size={20} color="#3B82F6" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    {t('settings.notifications.title')}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {t('settings.notifications.subtitle')}
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: Colors.border.medium, true: Colors.primary.main }}
                thumbColor={notifications ? Colors.background.primary : Colors.background.tertiary}
              />
            </View>

            {/* Dark Mode */}
            <View className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="rounded-full p-2" style={{ backgroundColor: Colors.text.primary }}>
                  <Moon size={20} color={Colors.text.inverse} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    {t('settings.darkMode.title')}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {t('settings.darkMode.comingSoon')}
                  </Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                disabled
                trackColor={{ false: Colors.border.medium, true: Colors.primary.main }}
                thumbColor={Colors.background.tertiary}
              />
            </View>

            {/* Language */}
            <TouchableOpacity
              onPress={() => setLanguage(language === 'bg' ? 'en' : 'bg')}
              className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-3 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <View className="bg-green-50 rounded-full p-2">
                  <Globe size={20} color="#10B981" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    {t('settings.language.title')}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {language === 'bg' ? '🇧🇬 Български' : '🇬🇧 English'}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Units */}
            <View style={unitsStyles.card}>
              <View style={unitsStyles.iconRow}>
                <View style={unitsStyles.iconBg}>
                  <Ionicons name="scale-outline" size={20} color={Colors.primary.main} />
                </View>
                <View style={unitsStyles.labelBlock}>
                  <Text style={unitsStyles.title}>{t('settings.units.title')}</Text>
                  <Text style={unitsStyles.hint}>
                    {unitSystem === 'metric' ? t('settings.units.metricHint') : t('settings.units.imperialHint')}
                  </Text>
                </View>
              </View>
              <View style={unitsStyles.toggle}>
                <TouchableOpacity
                  onPress={() => setUnitSystem('metric')}
                  style={[unitsStyles.toggleBtn, unitSystem === 'metric' && unitsStyles.toggleBtnActive]}
                >
                  <Text style={[unitsStyles.toggleText, unitSystem === 'metric' && unitsStyles.toggleTextActive]}>
                    {t('settings.units.metric')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setUnitSystem('imperial')}
                  style={[unitsStyles.toggleBtn, unitSystem === 'imperial' && unitsStyles.toggleBtnActive]}
                >
                  <Text style={[unitsStyles.toggleText, unitSystem === 'imperial' && unitsStyles.toggleTextActive]}>
                    {t('settings.units.imperial')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Currency — only for EN */}
            {language === 'en' && (
              <View style={[unitsStyles.card, { marginTop: 12 }]}>
                <View style={unitsStyles.iconRow}>
                  <View style={unitsStyles.iconBg}>
                    <Ionicons name="cash-outline" size={20} color={Colors.primary.main} />
                  </View>
                  <View style={unitsStyles.labelBlock}>
                    <Text style={unitsStyles.title}>{t('settings.currency.title')}</Text>
                    <Text style={unitsStyles.hint}>
                      {currency === '$' ? '$ Dollar' : '€ Euro'}
                    </Text>
                  </View>
                </View>
                <View style={unitsStyles.toggle}>
                  <TouchableOpacity
                    onPress={() => setCurrency('$')}
                    style={[unitsStyles.toggleBtn, currency === '$' && unitsStyles.toggleBtnActive]}
                  >
                    <Text style={[unitsStyles.toggleText, currency === '$' && unitsStyles.toggleTextActive]}>
                      $ {t('settings.currency.dollar')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setCurrency('€')}
                    style={[unitsStyles.toggleBtn, currency === '€' && unitsStyles.toggleBtnActive]}
                  >
                    <Text style={[unitsStyles.toggleText, currency === '€' && unitsStyles.toggleTextActive]}>
                      € {t('settings.currency.euro')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* About Section */}
          <View className="px-6 py-4 border-t border-gray-200">
            <Text className="text-xs font-bold text-gray-500 mb-3 uppercase">
              {t('settings.about.title')}
            </Text>

            <TouchableOpacity
              onPress={() => Alert.alert(t('settings.about.title'), t('settings.about.alertMessage'))}
              className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-3 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <View className="bg-purple-50 rounded-full p-2">
                  <Info size={20} color="#8B5CF6" />
                </View>
                <Text className="ml-3 text-base font-semibold text-gray-900">
                  {t('settings.about.title')}
                </Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert(t('settings.privacy.title'), t('settings.privacy.alertMessage'))}
              className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-3 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <View className="bg-blue-50 rounded-full p-2">
                  <Shield size={20} color="#3B82F6" />
                </View>
                <Text className="ml-3 text-base font-semibold text-gray-900">
                  {t('settings.privacy.title')}
                </Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert(t('settings.help.title'), t('settings.help.alertMessage'))}
              className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-3 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <View className="bg-amber-50 rounded-full p-2">
                  <HelpCircle size={20} color="#F59E0B" />
                </View>
                <Text className="ml-3 text-base font-semibold text-gray-900">
                  {t('settings.help.title')}
                </Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert(t('settings.contact.title'), t('settings.contact.alertMessage'))}
              className="bg-white border-2 border-gray-200 rounded-xl p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <View className="bg-red-50 rounded-full p-2">
                  <Mail size={20} color="#EF4444" />
                </View>
                <Text className="ml-3 text-base font-semibold text-gray-900">
                  {t('settings.contact.title')}
                </Text>
              </View>
              <ExternalLink size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Version */}
          <View className="px-6 py-8 items-center">
            <Text className="text-gray-400 text-sm">
              KetoCakr v1.0.0
            </Text>
            <Text className="text-gray-400 text-xs mt-1">
              {t('settings.copyright')}
            </Text>
          </View>

          <View className="h-20" />
        </ScrollView>

        {/* Save button (if settings changed) */}
        {(notifications !== true || darkMode !== false) && (
          <View className="px-6 py-4 bg-white border-t border-gray-200">
            <TouchableOpacity
              onPress={handleSaveSettings}
              className="rounded-xl py-4"
              style={{ backgroundColor: Colors.primary.main }}
            >
              <Text className="font-bold text-center" style={{ color: Colors.text.inverse }}>
                {t('settings.saveChanges')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
}

const unitsStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.primary,
    borderWidth: 2,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.opacity[10],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  labelBlock: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  hint: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.round,
    padding: 2,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.round,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary.main,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  toggleTextActive: {
    color: Colors.text.inverse,
  },
});
