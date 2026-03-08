# 🔧 ЗАДАЧА: Активирай custom prices (Pro режим) за тестване

**Приоритет:** ВИСОК  
**Файлове:**
- `Mobile/app/ingredient-prices.tsx` — основен екран
- `Mobile/store/useUserPricesStore.ts` — Zustand store
- `Mobile/app/(tabs)/profile/index.tsx` — валута в настройки

---

## 📋 КОНТЕКСТ

Системата за цени има две нива:
1. **Default цени** — от `ingredients_database.default_price` (зададени от admin)
2. **Custom цени** — потребителят може да override-не цена за своя регион/магазин

Засега работим **БЕЗ authentication**. За тестване вдигаме всички Pro функции. Когато добавим auth, ще сложим съответните ограничения.

**Валута:** Само EUR (€). България вече е в еврозоната. Не е нужен currency selector засега, но кодът трябва да е готов за лесно добавяне на други валути в бъдеще.

**Съхранение на custom цени:** Без auth не можем да пишем в `user_ingredient_prices` таблицата (изисква user_id). Затова custom цените се пазят **локално** в Zustand store с AsyncStorage persist. Когато добавим auth — ще синхронизираме с базата.

---

## 🎯 КАКВО ТРЯБВА ДА СЕ НАПРАВИ

### Промяна 1: ingredient-prices.tsx — Пълна функционалност

Екранът трябва да има:

**Header:**
- Заглавие: "Цени на съставки"
- Подзаглавие: "Валута: EUR (€)"
- Без Crown badge, без Pro restrictions

**Search bar:**
- Търсене по име (BG и EN)
- Филтър по категория (chips/pills)

**Списък със съставки — ВСЯКА КАРТА показва:**
- Име на български (primary)
- Име на английски (secondary, по-малък шрифт)
- Категория
- **Default цена:** XX.XX € (от базата, readonly, сив текст)
- **Моята цена:** XX.XX € (editable, или "Не е зададена")
- **Edit бутон** (Ionicons: "create-outline") — отваря inline edit или modal
- Ако потребителят е задал custom цена → показвай я с акцент (Colors.primary.main)
- Ако няма custom цена → показвай default цената

**Edit функционалност (за всяка съставка):**
- При натискане на Edit → покажи TextInput за цена
- Numeric keyboard
- Save бутон (Ionicons: "checkmark-circle")
- Cancel бутон (Ionicons: "close-circle")  
- Delete custom price бутон (Ionicons: "trash-outline") — връща към default
- Цената се записва в Zustand store (локално)

**Статистика (top bar или header):**
- Общо съставки: XX
- С custom цена: XX

### Промяна 2: useUserPricesStore.ts — Пълен store

```typescript
interface UserPrice {
  ingredientId: string;  // UUID от ingredients_database
  price: number;
  currency: string;      // 'EUR' засега
  updatedAt: string;     // ISO date
}

interface UserPricesState {
  // Data
  ingredients: IngredientWithPrice[];  // от Supabase
  customPrices: Record<string, UserPrice>;  // ingredientId → UserPrice
  currency: string;  // default 'EUR'
  
  // Loading
  isLoading: boolean;
  
  // Actions
  loadIngredients: () => Promise<void>;
  setCustomPrice: (ingredientId: string, price: number) => void;
  removeCustomPrice: (ingredientId: string) => void;
  getEffectivePrice: (ingredientId: string) => number;  // custom || default
  setCurrency: (currency: string) => void;
  
  // Stats
  getCustomPricesCount: () => number;
}
```

**Persist:** Използвай Zustand persist с AsyncStorage:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

// customPrices и currency се пазят между сесии
// ingredients се зареждат от Supabase при всяко отваряне
```

**loadIngredients:**
```typescript
const { data } = await supabase
  .from('ingredients_database')
  .select('id, name_bg, name_en, category, default_price, price_unit')
  .order('category')
  .order('name_bg');
```

**getEffectivePrice:**
```typescript
// Връща custom price ако има, иначе default
const custom = customPrices[ingredientId];
if (custom) return custom.price;
const ingredient = ingredients.find(i => i.id === ingredientId);
return ingredient?.default_price || 0;
```

### Промяна 3: Profile — Валута секция

В `Mobile/app/(tabs)/profile/index.tsx`:

Добави в менюто (под "Цени на съставки"):
- **"Валута"** — показва текущата валута (EUR €)
- При натискане → засега Alert: "Текущо се поддържа само EUR (€)"
- Или просто показвай като info ред (не е натискаем)

```typescript
// Menu item пример:
{
  icon: "cash-outline",
  label: "Валута",
  value: "EUR (€)",  // показва се вдясно
  onPress: () => Alert.alert('Валута', 'Текущо се поддържа само EUR (€)')
}
```

---

## ⚠️ ПРАВИЛА

- Прочети CLAUDE.md
- Всички цветове от constants/Colors.ts
- Всички размери от constants/Theme.ts
- За икони: САМО @expo/vector-icons (Ionicons, MaterialCommunityIcons, Feather)
- НЕ инсталирай нови пакети
- НЕ добавяй authentication
- НЕ записвай в Supabase user_ingredient_prices (няма user_id)
- Custom цени → САМО локално в Zustand + AsyncStorage
- Направи backup преди промени

---

## 📊 ingredients_database КОЛОНИ ЗА REFERENCE

```
id (uuid), name_bg, name_en, category,
default_price (numeric), price_unit (text),
calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g,
unit_weight_grams
```

---

## 🧪 ТЕСТ

1. `npx expo start --clear`
2. Profile → "Цени на съставки"
3. Списъкът зарежда всички съставки с default цени
4. Натисни Edit на "Бадемово брашно"
5. Въведи custom цена: 18.50
6. Save → цената се показва с акцент
7. Затвори приложението, отвори отново → custom цената е запазена
8. Натисни Delete custom price → връща към default
9. Profile → "Валута" → показва EUR

---

## ✅ ГОТОВО КОГАТО

- [ ] Списъкът зарежда всички съставки от Supabase
- [ ] Default цени се показват
- [ ] Edit custom price работи (inline или modal)
- [ ] Custom цени се пазят локално (persist между сесии)
- [ ] Delete custom price връща към default
- [ ] Search/filter работи
- [ ] Статистика показва брой custom цени
- [ ] Profile показва валута EUR
- [ ] Нула hardcoded стилове
- [ ] Нула lucide-react-native
- [ ] Приложението стартира без грешки