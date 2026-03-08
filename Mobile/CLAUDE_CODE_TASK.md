# 🎯 ЗАДАНИЕ ЗА CLAUDE CODE — KetoCakR Mobile App

> **Проект:** KetoCakR — мобилно приложение за кето десерти
> **Бранд:** BLAGO (Благо)
> **Дата:** 23.02.2026
> **Автор на заданието:** Deyana

---

## 📋 ОБЩА ЦЕЛ

Изгради стабилна, работеща основа на мобилното приложение KetoCakR. Всички екрани трябва да използват **централизирани дизайн файлове** (`constants/Colors.ts` и `constants/Theme.ts`), така че промяна на цвят или размер на шрифт да се случва **само на едно място** — а не във всеки файл поотделно.

**НИКОГА не пиши hardcoded цветове** като `'#A80048'` или `'#333333'` в компоненти — винаги import-вай от `Colors` и `Theme`.

---

## ⚠️ КРИТИЧНИ ПРАВИЛА

### 1. Дизайн система — ЗАДЪЛЖИТЕЛНО
```typescript
// ✅ ПРАВИЛНО — винаги така:
import { Colors } from '../../../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadows, IconSize } from '../../../constants/Theme';

<View style={{ backgroundColor: Colors.background.primary, padding: Spacing.xl }}>
  <Text style={{ ...Typography.h2, color: Colors.text.primary }}>Заглавие</Text>
</View>

// ❌ ЗАБРАНЕНО — никога hardcoded стойности:
<View style={{ backgroundColor: '#FFFFFF', padding: 24 }}>
  <Text style={{ fontSize: 28, fontWeight: '700', color: '#333333' }}>Заглавие</Text>
</View>
```

### 2. Икони — @expo/vector-icons
Използвай **САМО** `@expo/vector-icons` (вграден в Expo, нулев риск от dependency конфликти):
```typescript
// ✅ ПРАВИЛНО:
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
<Ionicons name="home" size={IconSize.md} color={Colors.primary.main} />

// ❌ ЗАБРАНЕНО — НЕ използвай lucide-react-native (има dependency проблеми):
import { Home } from 'lucide-react-native'; // НЕ!
```

### 3. Не инсталирай нови пакети без разрешение
Работи САМО с вече инсталираните dependencies. Ако ти трябва нов пакет — СПРИ и попитай.

### 4. Expo SDK 54 + React Native 0.81 + React 19
Проектът използва New Architecture. Не добавяй код, който е несъвместим.

### 5. Supabase заявки — винаги с error handling
```typescript
const { data, error } = await supabase.from('table').select('*');
if (error) throw error;
return data;
```

### 6. Файлова организация
- Импорти от constants/ — относителни пътища (`../../../constants/Colors`)
- Споделени компоненти → `components/` папката
- Екранен код → `app/` папката
- State management → `store/` с Zustand
- Supabase client → `lib/supabase.ts`

---

## 🏗️ TECH STACK

| Компонент | Технология |
|-----------|------------|
| Framework | React Native 0.81 + Expo SDK 54 |
| Навигация | Expo Router (file-based) |
| Стилизация | StyleSheet + централизирани Colors/Theme |
| Данни | Supabase (PostgreSQL) |
| Заявки | @tanstack/react-query |
| State | Zustand |
| Икони | @expo/vector-icons |
| Animations | react-native-reanimated |

---

## 🗄️ DATABASE SCHEMA (Supabase)

### Ключови таблици:

**dessert_types** — Типове десерти (Торти, Чийзкейкове, Тарти...)
- id, name, description, image_url, serves_count

**recipe_roles** — Роли на компоненти
- id=1: Блат (Crust/Base)
- id=2: Крем (Cream/Frosting)
- id=3: Плънка (Filling)
- id=4: Декор (Decoration)

**base_recipes** — Базови рецепти (компоненти)
- id, name, description, recipe_role_id (FK→recipe_roles), dessert_type_id (FK→dessert_types)
- image_url, bake_temp_celsius, bake_time_minutes
- total_servings, total_weight_grams
- total_calories, total_protein, total_fat, total_carbs, total_net_carbs

**ingredients_database** — База с 156 съставки
- id, name_en, name_bg, category
- unit_weight_grams, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g

**recipe_ingredients** — Съставки в рецепта
- id, recipe_id (FK→base_recipes), ingredient_name, quantity, unit (g, ml, бр, ч.л., с.л.), order_index

**recipe_instruction_steps** — Стъпки за приготвяне
- id, recipe_id (FK→base_recipes), step_number, step_description, step_description_bg, step_duration_minutes

**user_recipes** — Потребителски комбинации (пъзел)
- id, user_id, name, dessert_type_id, assembly_template_id
- selected_components (jsonb): [{ recipe_role_id: 1, base_recipe_id: 5 }, ...]
- total_servings, intro_text

---

## 🎨 ДИЗАЙН СИСТЕМА

### Цветова палитра (от `constants/Colors.ts`):
- **Primary:** #A80048 (Ruby Red) — акценти, бутони, активни елементи
- **Secondary:** #B2AC88 (Warm Beige) — фонове, второстепенни елементи
- **Background:** #FFFFFF (primary), #F8F9FA (secondary), #FFF5F8 (accent/розов)
- **Text:** #333333 (primary), #666666 (secondary), #999999 (tertiary)
- **Nutrition цветове:** calories=#FF6B6B, protein=#4ECDC4, fat=#FFE66D, carbs=#A8E6CF

### Типография (от `constants/Theme.ts`):
- h1: 32px/700, h2: 28px/700, h3: 24px/600, h4: 20px/600
- body1: 16px/400, body2: 14px/400, caption: 12px/400
- button: 16px/600

### Spacing система:
- xs=4, sm=8, md=12, base=16, lg=20, xl=24, 2xl=32, 3xl=40, 4xl=48

### Border Radius:
- sm=8, md=12, lg=16, xl=20, 2xl=24, round=999

---

## 📁 ТЕКУЩА ФАЙЛОВА СТРУКТУРА

```
Mobile/app/
├── _layout.tsx                    ← Root layout (QueryClientProvider)
├── index.tsx                      ← Entry redirect
├── (auth)/
│   ├── signin.tsx
│   └── signup.tsx
├── (tabs)/
│   ├── _layout.tsx                ← Tab bar navigation
│   ├── home/index.tsx             ← TAB 1: Home
│   ├── search/index.tsx           ← TAB 2: Search
│   ├── create/index.tsx           ← TAB 3: Create/My Recipes
│   ├── tools/index.tsx            ← TAB 4: Tools
│   ├── profile/index.tsx          ← TAB 5: Profile
│   ├── recipes/index.tsx          ← Recipes list
│   └── shopping-list.tsx          ← Shopping list
├── (modals)/
│   ├── recipe-generator.tsx
│   └── visual-recipe-builder.tsx
├── recipe-detail/[id].tsx         ← Recipe detail screen
├── user-recipe/[id].tsx           ← User recipe detail
├── favorites/index.tsx
├── settings/index.tsx
├── shopping-list/index.tsx
└── subscription/index.tsx
```

---

## 🔄 РЕД НА ИЗПЪЛНЕНИЕ

### ФАЗА 1: Централизиран дизайн + Tab навигация
**Цел:** Всички екрани да използват Colors/Theme, работещ tab bar.

#### Задача 1.1: Tab Bar Layout — `(tabs)/_layout.tsx`
Създай красив tab bar с 5 таба:
```
Home | Search | Create | Tools | Profile
```
- Използвай `@expo/vector-icons` (Ionicons или MaterialCommunityIcons)
- Active tab: Colors.primary.main (#A80048)
- Inactive tab: Colors.text.tertiary (#999999)
- Background: Colors.background.primary (#FFFFFF)
- Икони: home, search, plus-circle (или cake), construct (tools), person
- Размер на иконите: IconSize.md (24)
- Labels отдолу с caption размер

#### Задача 1.2: Root Layout — `_layout.tsx`
- QueryClientProvider обвивка
- Stack навигация за модални екрани
- Скриване на header за tabs

#### Задача 1.3: Рефакторинг на съществуващи екрани
Прегледай ВСИЧКИ .tsx файлове в app/ и замени:
- Всички hardcoded цветове → Colors.xxx
- Всички hardcoded размери → Typography.xxx / Spacing.xxx
- Всички lucide-react-native imports → @expo/vector-icons
- Увери се, че нищо не е счупено

---

### ФАЗА 2: Home Screen — `(tabs)/home/index.tsx`
**Цел:** Красив, функционален home screen с реални данни от Supabase.

Секции (отгоре надолу):

**2.1 Header:**
- „Здравей!" текст
- Notification bell icon (decorative засега)
- Background: Colors.background.primary

**2.2 Daily Delight (Десерт на деня):**
- Зарежда random base_recipe от Supabase
- Голямо изображение с gradient overlay
- Име на рецептата
- „ВИЖ РЕЦЕПТАТА" бутон → recipe-detail/[id]
- Ако няма image_url, покажи placeholder с Colors.background.accent

**2.3 Create Your Masterpiece (Създай шедьовър):**
- 2x2 grid с четирите роли: Блат, Крем, Плънка, Декор
- Всяка карта с икона и име
- „ЗАПОЧНИ СЪЗДАВАНЕ" бутон → visual-recipe-builder модал
- Използвай Colors.primary за акценти, Colors.secondary за фонове

**2.4 Your Creations (Твоите създания):**
- Хоризонтален ScrollView с user_recipes
- Първа карта: „+ Създай нова" (води към builder)
- Ако няма рецепти: empty state с текст и бутон
- Карти: image + name + servings badge

**2.5 Filter Pills + Recipe Grid:**
- Хоризонтални filter chips от dessert_types
- „Всички" е default active (Colors.primary.main background)
- Неактивни: Colors.background.secondary + Colors.text.secondary
- Grid с base_recipes, филтрирани по избран тип
- RecipeCard: image, name, nutrition badge

**Supabase заявки:**
```typescript
// Daily Delight
supabase.from('base_recipes').select('*').limit(1).order('created_at', { ascending: false })

// Popular/User Recipes
supabase.from('user_recipes').select('*, dessert_type:dessert_types(*)').order('created_at', { ascending: false }).limit(6)

// Dessert Types (for filter pills)
supabase.from('dessert_types').select('*').order('name')

// Filtered Recipes
supabase.from('base_recipes').select('*, recipe_role:recipe_roles(name)').eq('dessert_type_id', selectedTypeId)
```

---

### ФАЗА 3: Search Screen — `(tabs)/search/index.tsx`

**3.1 Search Bar:**
- TextInput с search icon
- Placeholder: „Търси рецепти..."
- Debounced search (300ms)

**3.2 Filter Chips:**
- По категория (dessert_types)
- По макро профил: „High Protein", „Low Carb", „Under 200 cal"

**3.3 Results:**
- Grid с RecipeCard компоненти
- Empty state при липса на резултати

**Supabase заявки:**
```typescript
supabase.from('base_recipes').select('*').ilike('name', `%${query}%`)
```

---

### ФАЗА 4: Create / My Recipes — `(tabs)/create/index.tsx`

**4.1 Header:** „Моите рецепти"

**4.2 Create New Button:**
- Голям accent бутон → visual-recipe-builder
- Colors.primary.main фон

**4.3 User Recipes List:**
- FlatList с user_recipes от Supabase
- Карта: image + name + components count + servings
- Tap → user-recipe/[id]

**4.4 Empty State:**
- Илюстрация/emoji + текст „Все още нямаш рецепти"
- CTA бутон „Създай първата си торта"

---

### ФАЗА 5: Tools Screen — `(tabs)/tools/index.tsx`

Grid с 4 инструмента (карти):

**5.1 Кето Калкулатор** (placeholder)
- Икона: calculator
- Описание: „Изчисли дневните си макроси"

**5.2 Конвертор на мерки** (placeholder)
- Икона: swap-horizontal
- Описание: „г ↔ oz, мл ↔ fl oz"

**5.3 AI Keto Асистент** (placeholder)
- Икона: chatbubbles
- Описание: „Попитай за кето съвети"

**5.4 Таймер за печене** (placeholder)
- Икона: timer
- Описание: „Прецизен таймер"

Всяка карта е TouchableOpacity с:
- Colors.background.primary фон
- Shadows.md сянка
- BorderRadius.xl ъгли
- Иконата в кръгъл фон с Colors.primary.opacity[10]

Засега при натискане показва Alert: „Очаквай скоро!"

---

### ФАЗА 6: Profile Screen — `(tabs)/profile/index.tsx`

**6.1 Avatar секция:**
- Placeholder кръг с инициали или emoji
- „Гост потребител" (без auth засега)

**6.2 Stats:**
- Брой рецепти, Любими (от Supabase или 0)

**6.3 Menu Items:**
- Настройки → settings/index
- Любими → favorites/index
- Списък за пазаруване → shopping-list/index
- Език (placeholder)
- За приложението (placeholder)

**6.4 Версия:**
- „KetoCakR v1.0.0" в дъното

---

## 🧩 СПОДЕЛЕНИ КОМПОНЕНТИ (components/)

Създай тези reusable компоненти:

### RecipeCard.tsx
```typescript
Props: { recipe: BaseRecipe; onPress: () => void; size?: 'small' | 'large' }
```
- Image (или placeholder)
- Име на рецептата
- Nutrition badge (calories)
- Използва Colors, Typography, Shadows

### SectionHeader.tsx
```typescript
Props: { title: string; actionText?: string; onAction?: () => void }
```
- Заглавие вляво, „Виж всички" вдясно

### FilterChip.tsx
```typescript
Props: { label: string; active: boolean; onPress: () => void }
```
- Active: Colors.primary.main фон, бял текст
- Inactive: Colors.background.secondary фон, Colors.text.secondary текст

### EmptyState.tsx
```typescript
Props: { icon?: string; title: string; subtitle?: string; actionLabel?: string; onAction?: () => void }
```
- Центрирано съдържание с emoji/icon, текст и CTA бутон

### NutritionBadge.tsx
```typescript
Props: { calories: number; protein?: number; fat?: number; carbs?: number; compact?: boolean }
```
- Compact: само калории
- Full: всички макроси с цветни индикатори (Colors.nutrition.xxx)

---

## 🧪 ТЕСТВАНЕ

След приключване на всяка фаза:
1. Стартирай: `npx expo start --clear`
2. Сканирай QR с Expo Go на Android
3. Провери: зареждат ли се данните от Supabase?
4. Провери: всички цветове ли идват от Colors.ts?
5. Провери: навигацията работи ли?

---

## 🚫 КАКВО ДА НЕ ПРАВИШ

1. **НЕ инсталирай нови npm пакети** без одобрение
2. **НЕ използвай lucide-react-native** — само @expo/vector-icons
3. **НЕ пиши hardcoded цветове/размери** — винаги от Colors/Theme
4. **НЕ използвай NativeWind/Tailwind** за стилизация — само StyleSheet
5. **НЕ трий съществуващи файлове** без одобрение (особено .backup файлове)
6. **НЕ добавяй user authentication** — засега работим без auth
7. **НЕ използвай `any` type** в TypeScript
8. **НЕ прави expo prebuild** или native builds — само Expo Go

---

## 📝 КАК ДА ЗАПОЧНЕШ ВСЯКА СЕСИЯ

```
Работя на KetoCakR мобилно приложение.
Прочети файла CLAUDE_CODE_TASK.md в root-а на Mobile папката.
Прочети constants/Colors.ts и constants/Theme.ts.
Днешната задача е: [ФАЗА X — описание]
```

---

## ✅ ДЕФИНИЦИЯ ЗА ГОТОВО

Фазата е завършена когато:
- [ ] Всички екрани се зареждат без грешки
- [ ] Нула hardcoded цветове — всичко от Colors.ts
- [ ] Нула hardcoded размери — всичко от Theme.ts
- [ ] Tab навигацията работи с правилни икони и цветове
- [ ] Supabase данни се зареждат (с loading/error states)
- [ ] Тествано на физически Android устройство чрез Expo Go
