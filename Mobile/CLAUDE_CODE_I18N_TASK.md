# 🌐 ЗАДАНИЕ ЗА CLAUDE CODE — Двуезичност (BG/EN) на KetoCakR

> **Проект:** KetoCakR Mobile App
> **Задача:** Пълна двуезична поддръжка (Български / English)
> **Дата:** 28.02.2026
> **Приоритет:** Висок

---

## 📋 ОБЩА ЦЕЛ

Направи приложението напълно двуезично — Български (BG) и English (EN). 
Потребителят трябва да може да превключва между езиците от Профил екрана.
Избраният език се запазва между сесиите (persistent).

**ВАЖНО:** НЕ инсталирай i18n библиотеки (i18next, react-intl и т.н.).
Ще използваме прост, лек подход с Zustand store + JSON речници.

---

## ⚠️ КРИТИЧНИ ПРАВИЛА (от CLAUDE.md)

1. ВИНАГИ импортирай цветове от `constants/Colors.ts`
2. ВИНАГИ импортирай Typography/Spacing/BorderRadius/Shadows/IconSize от `constants/Theme.ts`
3. НИКОГА не пиши hardcoded цветове в компоненти
4. НИКОГА не инсталирай нови npm пакети без одобрение
5. За икони: САМО `@expo/vector-icons`
6. НЕ използвай NativeWind/Tailwind — само StyleSheet
7. НЕ прави expo prebuild — само Expo Go

---

## 🏗️ АРХИТЕКТУРА НА РЕШЕНИЕТО

### Файлова структура (нови файлове):

```
Mobile/
├── constants/
│   └── i18n/
│       ├── index.ts          ← Главен export + useTranslation hook
│       ├── bg.ts             ← Български речник
│       └── en.ts             ← English dictionary
├── store/
│   └── useLanguageStore.ts   ← Zustand store за език (persistent)
```

### Принцип на работа:

```typescript
// Във всеки компонент:
import { useTranslation } from '../../constants/i18n';

export default function SomeScreen() {
  const { t } = useTranslation();
  
  return (
    <Text>{t('home.title')}</Text>        // "Начало" или "Home"
    <Text>{t('common.search')}</Text>      // "Търси..." или "Search..."
  );
}
```

---

## 📝 СТЪПКА 1: Zustand Store за език

### Файл: `store/useLanguageStore.ts`

```typescript
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'bg' | 'en';

interface LanguageState {
  language: Language;
  isLoaded: boolean;
  setLanguage: (lang: Language) => void;
  loadLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'bg', // Default: Български
  isLoaded: false,

  setLanguage: async (lang: Language) => {
    set({ language: lang });
    try {
      await AsyncStorage.setItem('app_language', lang);
    } catch (e) {
      console.warn('Failed to save language preference');
    }
  },

  loadLanguage: async () => {
    try {
      const saved = await AsyncStorage.getItem('app_language');
      if (saved === 'bg' || saved === 'en') {
        set({ language: saved, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch (e) {
      set({ isLoaded: true });
    }
  },
}));
```

---

## 📝 СТЪПКА 2: Речници (Translations)

### Файл: `constants/i18n/bg.ts`

Речникът е организиран по екрани и общи секции:

```typescript
export const bg = {
  // ==========================================
  // ОБЩИ (Common)
  // ==========================================
  common: {
    search: 'Търси...',
    loading: 'Зареждане...',
    error: 'Грешка',
    retry: 'Опитай отново',
    save: 'Запази',
    cancel: 'Отказ',
    delete: 'Изтрий',
    edit: 'Редактирай',
    close: 'Затвори',
    back: 'Назад',
    next: 'Напред',
    done: 'Готово',
    yes: 'Да',
    no: 'Не',
    ok: 'ОК',
    seeAll: 'Виж всички',
    noResults: 'Няма резултати',
    comingSoon: 'Очаквай скоро!',
  },

  // ==========================================
  // TAB BAR
  // ==========================================
  tabs: {
    home: 'Начало',
    search: 'Търсене',
    create: 'Създай',
    tools: 'Помощници',
    profile: 'Профил',
  },

  // ==========================================
  // TAB 1: HOME SCREEN
  // ==========================================
  home: {
    greeting: 'Здравей!',
    dailyDelight: 'Десерт на деня',
    seeRecipe: 'Виж рецептата',
    createMasterpiece: 'Създай шедьовър',
    yourCreations: 'Твоите създания',
    createNew: '+ Създай нова',
    noCreations: 'Все още нямаш рецепти',
    startCreating: 'Създай първата си торта',
    allTypes: 'Всички',
    featuredRecipes: 'Препоръчани рецепти',
    popularRecipes: 'Популярни рецепти',
  },

  // ==========================================
  // TAB 2: SEARCH SCREEN
  // ==========================================
  search: {
    title: 'Търсене',
    placeholder: 'Търси рецепти...',
    filters: 'Филтри',
    highProtein: 'Високо протеинови',
    lowCarb: 'Ниско въглехидратни',
    under200cal: 'Под 200 кал',
    noResults: 'Няма намерени рецепти',
    tryDifferent: 'Опитай с различна дума',
  },

  // ==========================================
  // TAB 3: CREATE / MY RECIPES
  // ==========================================
  create: {
    title: 'Моите рецепти',
    createNew: 'Създай нова рецепта',
    noRecipes: 'Все още нямаш рецепти',
    startCreating: 'Създай първата си торта',
    recipeCount: 'рецепти',
    servings: 'порции',
  },

  // ==========================================
  // TAB 4: TOOLS SCREEN
  // ==========================================
  tools: {
    title: 'Помощници',
    ketoCalculator: 'Кето калкулатор',
    ketoCalculatorDesc: 'Изчисли дневните си макроси',
    converter: 'Конвертор на мерки',
    converterDesc: 'г ↔ oz, мл ↔ fl oz',
    aiAssistant: 'AI Keto асистент',
    aiAssistantDesc: 'Попитай за кето съвети',
    bakingTimer: 'Таймер за печене',
    bakingTimerDesc: 'Прецизен таймер',
  },

  // ==========================================
  // TAB 5: PROFILE SCREEN
  // ==========================================
  profile: {
    title: 'Профил',
    guest: 'Гост потребител',
    loginPrompt: 'Влез в профила си',
    loginSubtitle: 'Запази рецептите си и синхронизирай\nмежду всички твои устройства',
    login: 'Вход',
    register: 'Регистрация',
    logout: 'Изход',
    logoutConfirm: 'Сигурни ли сте, че искате да излезете?',
    favorites: 'Любими рецепти',
    favoritesCount: 'запазени десерти',
    shoppingList: 'Списък за пазаруване',
    shoppingListDesc: 'Генериран от рецептите',
    ingredientPrices: 'Цени на съставки',
    ingredientPricesDesc: 'Default цени в база данни',
    myPrices: 'Моите цени на продуктите',
    myPricesDesc: 'Персонализирай за точни разходи',
    premium: 'Премиум абонамент',
    premiumDesc: 'Unlock всички функции',
    settings: 'Настройки',
    settingsDesc: 'Профил и предпочитания',
    language: 'Език',
    languageDesc: 'Български / English',
    myRecipes: 'Мои рецепти',
    favoritesLabel: 'Любими',
    daysActive: 'Дни активност',
    appVersion: 'KetoCakr v1.0.0',
    madeWith: 'Направено с 💜 за кето любители',
  },

  // ==========================================
  // RECIPE DETAIL SCREEN
  // ==========================================
  recipeDetail: {
    servings: 'Порции',
    quantity: 'Количество',
    intro: 'Увод',
    ingredients: 'Съставки',
    steps: 'Стъпки',
    nutrition: 'Хран. стой.',
    totalWeight: 'Общо тегло',
    portionWeight: 'Тегло на порция',
    price: 'Цена',
    addToShoppingList: 'Добави към списъка за пазаруване',
    requiredProducts: 'Необходими продукти',
    calories: 'Калории',
    protein: 'Протеин',
    fat: 'Мазнини',
    carbs: 'Въглехидрати',
    netCarbs: 'Нетни въгл.',
    fiber: 'Фибри',
    perServing: 'на порция',
    timer: 'Таймер',
    timerStarted: 'Стартиран',
    minutes: 'мин',
    textView: 'Текст',
    galleryView: 'Галерия',
  },

  // ==========================================
  // INGREDIENT PRICES SCREEN
  // ==========================================
  ingredientPrices: {
    title: 'Цени на съставките',
    subtitle: 'съставки в базата данни',
    searchPlaceholder: 'Търси съставки...',
    price: 'Цена',
    notSet: 'Не е зададена',
    loading: 'Зареждане на съставки...',
  },

  // ==========================================
  // SHOPPING LIST
  // ==========================================
  shoppingList: {
    title: 'Списък за пазаруване',
    empty: 'Списъкът е празен',
    emptySubtitle: 'Добави съставки от рецепти',
    clearAll: 'Изчисти всичко',
    clearConfirm: 'Сигурни ли сте, че искате да изчистите списъка?',
    itemsCount: 'продукта',
    checked: 'Купени',
    unchecked: 'За купуване',
  },

  // ==========================================
  // RECIPE ROLES (Puzzle components)
  // ==========================================
  roles: {
    crust: 'Блат',
    cream: 'Крем',
    filling: 'Плънка',
    decoration: 'Декор',
    noCrust: 'Без блат',
    noCream: 'Без крем',
    noFilling: 'Без плънка',
    noDecoration: 'Без декор',
  },

  // ==========================================
  // UNITS
  // ==========================================
  units: {
    g: 'г',
    ml: 'мл',
    pcs: 'бр',
    tsp: 'ч.л.',
    tbsp: 'с.л.',
    cup: 'чаша',
    minutes: 'мин',
    celsius: '°C',
  },
} as const;

export type TranslationKeys = typeof bg;
```

### Файл: `constants/i18n/en.ts`

```typescript
import type { TranslationKeys } from './bg';

export const en: TranslationKeys = {
  common: {
    search: 'Search...',
    loading: 'Loading...',
    error: 'Error',
    retry: 'Try again',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    seeAll: 'See all',
    noResults: 'No results',
    comingSoon: 'Coming soon!',
  },

  tabs: {
    home: 'Home',
    search: 'Search',
    create: 'Create',
    tools: 'Tools',
    profile: 'Profile',
  },

  home: {
    greeting: 'Hello!',
    dailyDelight: 'Dessert of the Day',
    seeRecipe: 'See recipe',
    createMasterpiece: 'Create a Masterpiece',
    yourCreations: 'Your Creations',
    createNew: '+ Create new',
    noCreations: 'No recipes yet',
    startCreating: 'Create your first cake',
    allTypes: 'All',
    featuredRecipes: 'Featured Recipes',
    popularRecipes: 'Popular Recipes',
  },

  search: {
    title: 'Search',
    placeholder: 'Search recipes...',
    filters: 'Filters',
    highProtein: 'High Protein',
    lowCarb: 'Low Carb',
    under200cal: 'Under 200 cal',
    noResults: 'No recipes found',
    tryDifferent: 'Try a different keyword',
  },

  create: {
    title: 'My Recipes',
    createNew: 'Create new recipe',
    noRecipes: 'No recipes yet',
    startCreating: 'Create your first cake',
    recipeCount: 'recipes',
    servings: 'servings',
  },

  tools: {
    title: 'Tools',
    ketoCalculator: 'Keto Calculator',
    ketoCalculatorDesc: 'Calculate your daily macros',
    converter: 'Unit Converter',
    converterDesc: 'g ↔ oz, ml ↔ fl oz',
    aiAssistant: 'AI Keto Assistant',
    aiAssistantDesc: 'Ask for keto tips',
    bakingTimer: 'Baking Timer',
    bakingTimerDesc: 'Precise timer',
  },

  profile: {
    title: 'Profile',
    guest: 'Guest User',
    loginPrompt: 'Sign in to your account',
    loginSubtitle: 'Save your recipes and sync\nacross all your devices',
    login: 'Sign In',
    register: 'Sign Up',
    logout: 'Sign Out',
    logoutConfirm: 'Are you sure you want to sign out?',
    favorites: 'Favorite Recipes',
    favoritesCount: 'saved desserts',
    shoppingList: 'Shopping List',
    shoppingListDesc: 'Generated from recipes',
    ingredientPrices: 'Ingredient Prices',
    ingredientPricesDesc: 'Default prices in database',
    myPrices: 'My Product Prices',
    myPricesDesc: 'Customize for accurate costs',
    premium: 'Premium Subscription',
    premiumDesc: 'Unlock all features',
    settings: 'Settings',
    settingsDesc: 'Profile and preferences',
    language: 'Language',
    languageDesc: 'Български / English',
    myRecipes: 'My Recipes',
    favoritesLabel: 'Favorites',
    daysActive: 'Days Active',
    appVersion: 'KetoCakr v1.0.0',
    madeWith: 'Made with 💜 for keto lovers',
  },

  recipeDetail: {
    servings: 'Servings',
    quantity: 'Quantity',
    intro: 'Intro',
    ingredients: 'Ingredients',
    steps: 'Steps',
    nutrition: 'Nutrition',
    totalWeight: 'Total weight',
    portionWeight: 'Per serving',
    price: 'Price',
    addToShoppingList: 'Add to shopping list',
    requiredProducts: 'Required ingredients',
    calories: 'Calories',
    protein: 'Protein',
    fat: 'Fat',
    carbs: 'Carbs',
    netCarbs: 'Net carbs',
    fiber: 'Fiber',
    perServing: 'per serving',
    timer: 'Timer',
    timerStarted: 'Started',
    minutes: 'min',
    textView: 'Text',
    galleryView: 'Gallery',
  },

  ingredientPrices: {
    title: 'Ingredient Prices',
    subtitle: 'ingredients in database',
    searchPlaceholder: 'Search ingredients...',
    price: 'Price',
    notSet: 'Not set',
    loading: 'Loading ingredients...',
  },

  shoppingList: {
    title: 'Shopping List',
    empty: 'List is empty',
    emptySubtitle: 'Add ingredients from recipes',
    clearAll: 'Clear all',
    clearConfirm: 'Are you sure you want to clear the list?',
    itemsCount: 'items',
    checked: 'Purchased',
    unchecked: 'To buy',
  },

  roles: {
    crust: 'Crust',
    cream: 'Cream',
    filling: 'Filling',
    decoration: 'Decoration',
    noCrust: 'No crust',
    noCream: 'No cream',
    noFilling: 'No filling',
    noDecoration: 'No decoration',
  },

  units: {
    g: 'g',
    ml: 'ml',
    pcs: 'pcs',
    tsp: 'tsp',
    tbsp: 'tbsp',
    cup: 'cup',
    minutes: 'min',
    celsius: '°C',
  },
};
```

### Файл: `constants/i18n/index.ts`

```typescript
import { bg, TranslationKeys } from './bg';
import { en } from './en';
import { useLanguageStore } from '../../store/useLanguageStore';

const translations: Record<string, TranslationKeys> = { bg, en };

/**
 * Hook за превод — използвай във всеки компонент:
 * 
 * const { t, language } = useTranslation();
 * <Text>{t('home.title')}</Text>
 */
export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  const dict = translations[language] || bg;

  /**
   * Достъп до превод по dot-notation ключ:
   * t('home.greeting') → 'Здравей!' или 'Hello!'
   * t('common.save') → 'Запази' или 'Save'
   */
  function t(key: string): string {
    const parts = key.split('.');
    let result: any = dict;
    for (const part of parts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        // Fallback: опитай на български
        let fallback: any = bg;
        for (const p of parts) {
          if (fallback && typeof fallback === 'object' && p in fallback) {
            fallback = fallback[p];
          } else {
            return key; // Връщай ключа ако нищо не е намерено
          }
        }
        return typeof fallback === 'string' ? fallback : key;
      }
    }
    return typeof result === 'string' ? result : key;
  }

  return { t, language };
}

/**
 * За Supabase данни с двуезични колони:
 * 
 * const name = localizedField(ingredient, 'name', language);
 * // → ingredient.name_bg или ingredient.name_en
 */
export function localizedField(
  obj: Record<string, any>,
  field: string,
  language: string
): string {
  const langField = `${field}_${language}`;
  const fallbackField = `${field}_bg`;
  return obj[langField] || obj[fallbackField] || obj[field] || '';
}

export { bg, en };
export type { TranslationKeys };
```

---

## 📝 СТЪПКА 3: Зареждане на езика при старт

### В `app/_layout.tsx` — добави зареждане на езика:

Намери `useEffect` или началото на компонента и добави:

```typescript
import { useLanguageStore } from '../store/useLanguageStore';

// Вътре в компонента:
const loadLanguage = useLanguageStore((state) => state.loadLanguage);

useEffect(() => {
  loadLanguage();
}, []);
```

---

## 📝 СТЪПКА 4: Превключвател на език в Profile екрана

### В `profile/index.tsx` — добави Language Switcher:

Добави нов menu item ПРЕДИ "Настройки":

```typescript
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useTranslation } from '../../../constants/i18n';

// Вътре в компонента:
const { t, language } = useTranslation();
const setLanguage = useLanguageStore((state) => state.setLanguage);
```

Добави визуален switcher като menu item:

```typescript
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
    <Ionicons name="language" size={20} color={Colors.primary.main} />
  </View>
  <View style={{ flex: 1 }}>
    <Text style={{
      fontSize: 15,
      fontWeight: '600',
      color: Colors.text.primary,
      marginBottom: 3,
    }}>
      {t('profile.language')}
    </Text>
    <Text style={{ fontSize: 13, color: Colors.text.secondary }}>
      {language === 'bg' ? 'Български' : 'English'}
    </Text>
  </View>
  {/* Flag/indicator */}
  <View style={{
    backgroundColor: Colors.primary.opacity[10],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  }}>
    <Text style={{
      fontSize: 14,
      fontWeight: '600',
      color: Colors.primary.main,
    }}>
      {language === 'bg' ? '🇧🇬 BG' : '🇬🇧 EN'}
    </Text>
  </View>
</TouchableOpacity>
```

---

## 📝 СТЪПКА 5: Миграция на екрани

### Ред на миграция (по приоритет):

**Приоритет 1 — Tab Bar:**
Файл: `app/(tabs)/_layout.tsx`
```typescript
// Замени hardcoded заглавия:
title: 'Начало',    → title: t('tabs.home'),
title: 'Търсене',   → title: t('tabs.search'),
title: 'Създай',    → title: t('tabs.create'),
title: 'Помощници', → title: t('tabs.tools'),
title: 'Профил',    → title: t('tabs.profile'),
```

**ВНИМАНИЕ:** В Expo Router `<Tabs.Screen>` не може да използва hooks директно.
Реши по един от двата начина:

**Вариант А:** Използвай `screenOptions` с function:
```typescript
<Tabs
  screenOptions={({ route }) => ({
    // ...
  })}
>
```

**Вариант Б:** Задай `title` като `options` prop и override-ни от самите екрани с `useNavigation().setOptions()`.

**Приоритет 2 — Profile Screen:**
Файл: `app/(tabs)/profile/index.tsx`
- Замени всички hardcoded текстове с `t('profile.xxx')`

**Приоритет 3 — Ingredient Prices:**
Файл: `app/ingredient-prices.tsx`
- Замени текстове с `t('ingredientPrices.xxx')`
- За имена на съставки: `localizedField(ingredient, 'name', language)`

**Приоритет 4 — Home Screen:**
Файл: `app/(tabs)/home/index.tsx`
- Замени текстове с `t('home.xxx')`

**Приоритет 5 — Search, Create, Tools:**
Файлове: `search/index.tsx`, `create/index.tsx`, `tools/index.tsx`

**Приоритет 6 — Recipe Detail:**
Файл: `app/recipe-detail/[id].tsx`
- Замени tab labels, бутони, nutrition labels
- За recipe данни от Supabase: `localizedField(step, 'step_description', language)`

**Приоритет 7 — Shopping List:**
Файл: `app/shopping-list/index.tsx` или `app/(tabs)/shopping-list.tsx`

---

## 📝 СТЪПКА 6: Supabase данни — двуезични полета

Базата вече има двуезични колони. Използвай `localizedField()`:

```typescript
import { localizedField, useTranslation } from '../../constants/i18n';

const { language } = useTranslation();

// Съставки:
localizedField(ingredient, 'name', language)
// → ingredient.name_bg (ако language='bg')
// → ingredient.name_en (ако language='en')

// Стъпки за приготвяне:
localizedField(step, 'step_description', language)
// → step.step_description_bg (ако language='bg')
// → step.step_description (ако language='en') — fallback към основното поле

// Dessert types:
localizedField(dessertType, 'name', language)
// ЗАБЕЛЕЖКА: Ако dessert_types няма name_bg/name_en — остави name
```

---

## 🔄 ПРИМЕР: Миграция на компонент

### ПРЕДИ (hardcoded):
```typescript
export default function ToolsScreen() {
  return (
    <View>
      <Text>Помощници</Text>
      <ToolCard title="Кето калкулатор" description="Изчисли дневните си макроси" />
      <ToolCard title="Конвертор на мерки" description="г ↔ oz, мл ↔ fl oz" />
    </View>
  );
}
```

### СЛЕД (двуезично):
```typescript
import { useTranslation } from '../../../constants/i18n';

export default function ToolsScreen() {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('tools.title')}</Text>
      <ToolCard title={t('tools.ketoCalculator')} description={t('tools.ketoCalculatorDesc')} />
      <ToolCard title={t('tools.converter')} description={t('tools.converterDesc')} />
    </View>
  );
}
```

---

## ⚠️ ВАЖНИ БЕЛЕЖКИ

### 1. AsyncStorage вече е инсталиран
Проектът го използва. НЕ инсталирай нов пакет.

### 2. Alert.alert текстове
```typescript
Alert.alert(
  t('profile.logout'),           // Заглавие
  t('profile.logoutConfirm'),    // Съобщение
  [
    { text: t('common.cancel'), style: 'cancel' },
    { text: t('profile.logout'), style: 'destructive', onPress: ... },
  ]
);
```

### 3. Placeholder текстове
```typescript
<TextInput placeholder={t('search.placeholder')} />
```

### 4. Динамични стойности
За текстове с числа, използвай template literals:
```typescript
<Text>{`${ingredients.length} ${t('ingredientPrices.subtitle')}`}</Text>
// → "156 съставки в базата данни" или "156 ingredients in database"
```

### 5. НЕ превеждай:
- Имена на рецепти (идват от Supabase с двуезични колони)
- Числа, мерки (г/g идват от units речника)
- Бранд: "KetoCakR", "BLAGO" — остават непроменени

---

## 🧪 ТЕСТВАНЕ

След всяка стъпка:
1. `npx expo start --clear`
2. Отвори Profile → натисни Language switcher
3. Провери дали ВСИЧКИ текстове се сменят
4. Провери дали езикът се запазва при restart
5. Провери дали Supabase данни (имена на съставки, стъпки) се показват на правилния език

---

## ✅ ДЕФИНИЦИЯ ЗА ГОТОВО

- [ ] `useLanguageStore` работи с persistent AsyncStorage
- [ ] `useTranslation` hook връща правилните преводи
- [ ] `localizedField` работи за Supabase двуезични колони
- [ ] Language switcher в Profile екрана превключва BG ↔ EN
- [ ] Tab bar labels се сменят при превключване
- [ ] ВСИЧКИ hardcoded текстове са заменени с t('key')
- [ ] Езикът се запазва между рестартирания
- [ ] Нула нови npm пакети инсталирани
- [ ] Нула hardcoded цветове — всичко от Colors.ts
- [ ] Тествано на физическо устройство

---

## 📋 КАК ДА ЗАПОЧНЕШ СЕСИЯТА

```
Прочети CLAUDE.md и CLAUDE_CODE_I18N_TASK.md.
Задача: Двуезична поддръжка (BG/EN).

Стъпка 1: Създай store/useLanguageStore.ts
Стъпка 2: Създай constants/i18n/bg.ts, en.ts, index.ts
Стъпка 3: Добави loadLanguage в app/_layout.tsx
Стъпка 4: Добави Language Switcher в profile/index.tsx
Стъпка 5: Мигрирай _layout.tsx (tab bar labels)
Стъпка 6: Мигрирай profile/index.tsx (всички текстове)
Стъпка 7: Мигрирай ingredient-prices.tsx
Стъпка 8: Мигрирай останалите екрани по приоритет

Първо направи план, НЕ пиши код.
```