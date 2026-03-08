# 🔧 ЗАДАЧА: Тествай и поправи ingredient-prices екрана

**Приоритет:** ВИСОК  
**Файлове:**
- `Mobile/app/ingredient-prices.tsx` — екран за потребителски цени
- `Mobile/store/useUserPricesStore.ts` — Zustand store за цени
- `Mobile/app/(tabs)/profile/index.tsx` — линк към prices екрана

---

## 📋 КОНТЕКСТ

Системата за цени работи на два нива:
1. **Admin цени** — `ingredients_database.default_price` (базови цени, зададени от администратора)
2. **Потребителски цени** — `user_ingredient_prices` таблица (всеки потребител може да override-не цената за своя регион/магазин)

Мобилното приложение трябва да позволява на потребителите да виждат и редактират своите цени за съставки.

**ВАЖНО:** Засега работим БЕЗ authentication. Потребителските цени може да не работят без user_id. Трябва да проверим и адаптираме.

---

## 🎯 КАКВО ТРЯБВА ДА НАПРАВИШ

### Стъпка 1: Прочети и разбери текущия код

Прочети тези файлове и обясни какво правят:
1. `Mobile/app/ingredient-prices.tsx`
2. `Mobile/store/useUserPricesStore.ts`

Обясни:
- Какви Supabase заявки се правят?
- Има ли dependency на user_id / authentication?
- Какъв UI се рендерира?

### Стъпка 2: Провери за проблеми

1. **Auth dependency:** Ако кодът изисква user_id за заявки — това няма да работи без auth.
   - Ако user_ingredient_prices изисква user_id → за сега показвай САМО default_price от ingredients_database
   - Добави коментар: `// TODO: Enable user prices when auth is implemented`

2. **Supabase заявки:** Провери дали таблица `user_ingredient_prices` съществува и дали RLS policies позволяват четене без auth.

3. **Navigation:** Провери дали линкът от Profile tab работи:
   - `router.push('/ingredient-prices')` или подобно
   - Провери дали route-ът е правилен

4. **UI:** Провери дали:
   - Списъкът със съставки се зарежда
   - Цените се показват (default_price)
   - Search/filter работи (ако има)
   - Стиловете използват Colors.ts и Theme.ts (не hardcoded)

### Стъпка 3: Адаптирай за работа без auth

Ако кодът изисква auth:

```typescript
// Вместо:
const { data } = await supabase
  .from('user_ingredient_prices')
  .select('*')
  .eq('user_id', userId);  // ← няма userId!

// Направи:
// Зареди default цени от ingredients_database
const { data } = await supabase
  .from('ingredients_database')
  .select('id, name_bg, name_en, category, default_price, price_unit')
  .order('name_bg');
```

Потребителят трябва да вижда:
- Име на съставката (BG)
- Категория
- Default цена (от admin)
- Поле за своя цена (disabled с tooltip "Влезте в акаунта си" — или просто скрито засега)

### Стъпка 4: Провери Zustand store

В `useUserPricesStore.ts`:
- Ако store-ът записва в `user_ingredient_prices` — адаптирай за работа без auth
- Ако се ползва за local state (цени в паметта) — трябва да е ОК
- Провери дали persist работи (AsyncStorage)

### Стъпка 5: Провери Profile tab линка

В `Mobile/app/(tabs)/profile/index.tsx`:
- Трябва да има menu item "Цени на съставки" или подобно
- При натискане → навигация към ingredient-prices екран
- Провери дали route-ът е правилен

### Стъпка 6: Fix hardcoded стилове

Ако намериш hardcoded цветове или размери — замени:
```typescript
// ❌ Забранено:
style={{ color: '#A80048', fontSize: 16 }}

// ✅ Правилно:
style={{ color: Colors.primary.main, ...Typography.body1 }}
```

---

## ⚠️ ПРАВИЛА

- Прочети CLAUDE.md преди промени
- Всички цветове от constants/Colors.ts
- Всички размери от constants/Theme.ts  
- За икони: САМО @expo/vector-icons
- НЕ инсталирай нови пакети
- НЕ добавяй authentication
- Направи backup преди промени

---

## 🧪 ТЕСТ

1. `npx expo start --clear`
2. Отвори Profile tab
3. Натисни "Цени на съставки" (или еквивалент)
4. Екранът трябва да се зареди без грешки
5. Списък със съставки трябва да се покаже
6. Default цени трябва да се виждат
7. Навигацията назад работи

---

## ✅ ГОТОВО КОГАТО

- [ ] ingredient-prices екран се зарежда без грешки
- [ ] Списъкът със съставки показва данни от Supabase
- [ ] Default цени се виждат
- [ ] Няма hardcoded стилове
- [ ] Profile → Prices навигация работи
- [ ] Код, който изисква auth е маркиран с TODO коментари
- [ ] Приложението стартира без грешки