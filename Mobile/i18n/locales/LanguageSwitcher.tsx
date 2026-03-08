// ===========================================================
// Language Switcher - React Context version
// ===========================================================
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useLanguageStore } from '../../store/useLanguageStore';

// Icon wrapper
const Check = (props: any) => <Ionicons name="checkmark" {...props} />;

const LANGUAGES = [
  { code: 'bg' as const, name: 'Български', flag: '🇧🇬' },
  { code: 'en' as const, name: 'English', flag: '🇬🇧' },
];

export default function LanguageSwitcher() {
  const currentLanguage = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const changeLanguage = (languageCode: 'bg' | 'en') => {
    setLanguage(languageCode);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text.primary,
        marginBottom: 15,
      }}>
        Language / Език
      </Text>

      {LANGUAGES.map((language) => {
        const isSelected = currentLanguage === language.code;

        return (
          <TouchableOpacity
            key={language.code}
            onPress={() => changeLanguage(language.code)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isSelected ? Colors.primary.opacity[10] : Colors.background.primary,
              borderWidth: 2,
              borderColor: isSelected ? Colors.primary.main : Colors.border.light,
              padding: 16,
              borderRadius: 12,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 32, marginRight: 15 }}>
              {language.flag}
            </Text>
            <Text style={{
              flex: 1,
              fontSize: 16,
              fontWeight: isSelected ? 'bold' : '600',
              color: isSelected ? Colors.primary.main : Colors.text.primary,
            }}>
              {language.name}
            </Text>
            {isSelected && (
              <Check size={24} color={Colors.primary.main} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
