# ФАЗА 2: Home Screen — КОРИГИРАНО ЗАД

## ВАЖНО: Прочети CLAUDE.md преди да започнеш!

## Обща цел
Създай красив, функционален Home Screen с реални данни от Supabase.
Всички цветове от constants/Colors.ts, всички размери от constants/Theme.ts.
Икони: САМО @expo/vector-icons.

---

## КРИТИЧНА КОРЕКЦИЯ: Таблица за рецепти

НЕ използвай `base_recipes` за показване на рецепти на потребителя!
`base_recipes` са СКРИТИ компоненти (блат, крем, плънка, декор) — потребителят НЕ ги вижда директно.

Използвай **`ready_recipes`** — това са готови рецепти, създадени от администратора.

### Схема на ready_recipes:
```sql
- id: uuid (PK)
- name_en: text (име на английски)
- name_bg: text (име на български) ← ПОКАЗВАЙ ТОВА
- description_en: text
- description_bg: text ← ПОКАЗВАЙ ТОВА
- dessert_type_id: integer (FK → dessert_types)
- hero_image_url: text ← ГЛАВНО ИЗОБРАЖЕНИЕ
- is_featured: boolean (дали е "рецепта на деня")
- status: text ('draft' | 'published' | 'archived')
- difficulty_level: integer (1-5)
- is_free: boolean
- total_servings: integer
- total_weight_grams: integer
- total_calories: numeric
- total_protein: numeric
- total_fat: numeric
- total_carbs: numeric
- total_net_carbs: numeric
- tags: text[]
- selected_components: jsonb
- crust_id, cream_id, filling_id, decoration_id: uuid
- created_at, published_at, updated_at: timestamp
- slug: text (unique)
```

### Правила за заявки:
- ВИНАГИ филтрирай по `status = 'published'`
- За "Рецепта на деня": `is_featured = true` И `status = 'published'`
- Показвай `name_bg` (български език), fallback към `name_en`
- Изображение: `hero_image_url`
- При натискане на рецепта → навигация към `/recipe-detail/{id}`

---

## Секции на Home Screen (app/(tabs)/home/index.tsx)

### Секция 1: Header
- Текст: "Здравей!" (или "Добре дошъл!")
- Дясно: notification bell icon (Ionicons: notifications-outline)
- Декоративен — без функционалност засега
- Background: Colors.background.primary

### Секция 2: Десерт на деня (Daily Delight)
Зарежда featured рецепта от ready_recipes.

**Supabase заявка:**
```typescript
const { data, error } = await supabase
  .from('ready_recipes')
  .select('*, dessert_type:dessert_types(*)')
  .eq('status', 'published')
  .eq('is_featured', true)
  .limit(1)
  .single();

// Fallback ако няма featured — вземи random published:
if (!data) {
  const { data: random } = await supabase
    .from('ready_recipes')
    .select('*, dessert_type:dessert_types(*)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
}
```

**UI елементи:**
- Голямо изображение (hero_image_url) с gradient overlay
- Badge "ДЕСЕРТ НА ДЕНЯ" с Sparkles-подобна икона (Ionicons: sparkles)
- Име: `recipe.name_bg || recipe.name_en`
- Описание: `recipe.description_bg || recipe.description_en` (max 2 реда)
- Бутон "ВИЖ РЕЦЕПТАТА" → `router.push(/recipe-detail/${recipe.id})`
- Ако няма hero_image_url → placeholder с Colors.background.accent фон и emoji 🎂
- Loading state: skeleton/shimmer placeholder
- Цветове: overlay с Colors.primary.main opacity 0.85, бутон Colors.secondary.main

### Секция 3: Създай шедьовър (Create Your Masterpiece)
2x2 grid показващ четирите роли на компонентите.

**Карти:**
| Икона (Ionicons) | Текст | role_id |
|---|---|---|
| layers-outline | Блат | 1 |
| color-palette-outline | Крем | 2 |
| heart-outline | Плънка | 3 |
| sparkles-outline | Декор | 4 |

**UI:**
- Всяка карта: Colors.background.primary фон, Shadows.sm, BorderRadius.lg
- Икона в кръгъл фон с Colors.primary.opacity[10]
- Текст: Typography.body1, Colors.text.primary
- Бутон "ЗАПОЧНИ СЪЗДАВАНЕ" отдолу → router.push('/(modals)/visual-recipe-builder')
- Бутон цвят: Colors.primary.main, текст Colors.text.inverse

### Секция 4: Готови рецепти (Ready Recipes)
Хоризонтален ScrollView с published ready_recipes.

**Supabase заявка:**
```typescript
const { data, error } = await supabase
  .from('ready_recipes')
  .select('*, dessert_type:dessert_types(*)')
  .eq('status', 'published')
  .order('published_at', { ascending: false })
  .limit(8);
```

**UI:**
- Първа карта: "+ Създай нова" (води към visual-recipe-builder)
  - Colors.primary.opacity[10] фон, Ionicons: add-circle, Colors.primary.main
- Останалите карти:
  - hero_image_url (или placeholder emoji 🎂)
  - name_bg (или name_en)
  - Badge с калории: `${recipe.total_calories} kcal`
  - Badge с порции: `${recipe.total_servings} порц.`
  - При tap → router.push(`/recipe-detail/${recipe.id}`)
- Размер на карта: width 180, height 240
- "Виж всички" link горе вдясно → router.push('/(tabs)/recipes')
- Цветове: Colors.background.primary фон, Shadows.md, BorderRadius.lg

### Секция 5: Филтър по тип десерт
Хоризонтални filter pills + grid с филтрирани рецепти.

**Supabase заявки:**
```typescript
// Типове десерти за pills:
const { data: types } = await supabase
  .from('dessert_types')
  .select('*')
  .order('name');

// Филтрирани рецепти (по избран тип):
const query = supabase
  .from('ready_recipes')
  .select('*, dessert_type:dessert_types(*)')
  .eq('status', 'published');

if (selectedTypeId) {
  query.eq('dessert_type_id', selectedTypeId);
}

const { data: filtered } = await query
  .order('published_at', { ascending: false })
  .limit(6);
```

**UI:**
- Pills: ScrollView хоризонтален
  - "Всички" е default active
  - Active pill: Colors.primary.main фон, Colors.text.inverse текст
  - Inactive pill: Colors.background.secondary фон, Colors.text.secondary текст
  - BorderRadius.round
- Grid: 2 колони с RecipeCard компоненти
  - hero_image_url, name_bg, калории badge
  - При tap → recipe-detail/[id]

---

## Споделени компоненти (създай в components/)

### components/RecipeCard.tsx
```typescript
interface RecipeCardProps {
  recipe: {
    id: string;
    name_bg?: string;
    name_en: string;
    hero_image_url?: string;
    total_calories?: number;
    total_servings?: number;
    difficulty_level?: number;
    dessert_type?: { name: string; image_url?: string };
  };
  onPress: () => void;
  size?: 'small' | 'large';
}
```
- Image с BorderRadius.lg горе
- Име (name_bg || name_en)
- Калории badge с Colors.nutrition.calories
- Shadows.md, Colors.background.primary фон

### components/SectionHeader.tsx
```typescript
interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onAction?: () => void;
}
```
- Заглавие вляво (Typography.h3, Colors.text.primary)
- Action текст вдясно (Typography.body2, Colors.primary.main)

### components/FilterChip.tsx
```typescript
interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}
```
- Active: Colors.primary.main фон, Colors.text.inverse текст
- Inactive: Colors.background.secondary фон, Colors.text.secondary текст

### components/EmptyState.tsx
```typescript
interface EmptyStateProps {
  emoji?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

---

## Правила (повтарям за яснота)

1. ВСИЧКИ цветове от constants/Colors.ts — НУЛА hardcoded hex стойности
2. ВСИЧКИ размери от constants/Theme.ts
3. Икони: САМО @expo/vector-icons (Ionicons, MaterialCommunityIcons)
4. Data fetching: useQuery от @tanstack/react-query
5. Loading states: skeleton/placeholder за всяка секция
6. Error states: показвай EmptyState компонент с "Опитай отново" бутон
7. Езикова логика: показвай name_bg, fallback към name_en
8. НЕ инсталирай нови пакети
9. Тествай с `npx expo start --clear`

---

## Тестване

След завършване:
1. Home screen се зарежда без грешки
2. "Десерт на деня" показва ready_recipe (ако има published)
3. "Готови рецепти" показва списък от published ready_recipes
4. Filter pills зареждат dessert_types
5. Tap на рецепта → отваря recipe-detail/[id] без crash
6. Всички цветове са от Blago палитрата (Ruby Red + Warm Beige)
7. Няма hardcoded цветове никъде