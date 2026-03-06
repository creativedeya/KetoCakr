import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'bg' | 'en';
type UnitSystem = 'metric' | 'imperial';
type Currency = '€' | '$';

interface LanguageState {
  language: Language;
  unitSystem: UnitSystem;
  currency: Currency;
  isLoaded: boolean;
  setLanguage: (lang: Language) => void;
  setUnitSystem: (system: UnitSystem) => void;
  setCurrency: (c: Currency) => void;
  loadLanguage: () => Promise<void>;
}

const LANGUAGE_KEY = '@ketocakr_language';
const UNIT_SYSTEM_KEY = '@ketocakr_unit_system';
const CURRENCY_KEY = '@ketocakr_currency';

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'bg',
  unitSystem: 'metric',
  currency: '€',
  isLoaded: false,

  setLanguage: async (lang: Language) => {
    const defaultUnit: UnitSystem = lang === 'bg' ? 'metric' : 'imperial';
    const defaultCurrency: Currency = lang === 'bg' ? '€' : '$';
    set({ language: lang, unitSystem: defaultUnit, currency: defaultCurrency });
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      await AsyncStorage.setItem(UNIT_SYSTEM_KEY, defaultUnit);
      await AsyncStorage.setItem(CURRENCY_KEY, defaultCurrency);
    } catch (e) {
      console.warn('Failed to save language preference');
    }
  },

  setUnitSystem: async (system: UnitSystem) => {
    set({ unitSystem: system });
    try {
      await AsyncStorage.setItem(UNIT_SYSTEM_KEY, system);
    } catch (e) {
      console.warn('Failed to save unit system preference');
    }
  },

  setCurrency: async (c: Currency) => {
    set({ currency: c });
    try {
      await AsyncStorage.setItem(CURRENCY_KEY, c);
    } catch (e) {
      console.warn('Failed to save currency preference');
    }
  },

  loadLanguage: async () => {
    try {
      const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
      const savedUnit = await AsyncStorage.getItem(UNIT_SYSTEM_KEY);
      const savedCurrency = await AsyncStorage.getItem(CURRENCY_KEY);

      const lang: Language = (savedLang === 'bg' || savedLang === 'en') ? savedLang : 'bg';
      const unit: UnitSystem = (savedUnit === 'metric' || savedUnit === 'imperial')
        ? savedUnit
        : (lang === 'bg' ? 'metric' : 'imperial');
      const currency: Currency = (savedCurrency === '€' || savedCurrency === '$')
        ? savedCurrency
        : (lang === 'bg' ? '€' : '$');

      set({ language: lang, unitSystem: unit, currency, isLoaded: true });
    } catch (e) {
      set({ isLoaded: true });
    }
  },
}));
