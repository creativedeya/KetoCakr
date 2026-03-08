# 🔄 ЗАДАНИЕ ЗА CLAUDE CODE — Унифициране на Recipe Detail

> **Проект:** KetoCakR Mobile App
> **Задача:** Обедини recipe-detail и user-recipe в един споделен компонент
> **Дата:** 02.03.2026
> **Приоритет:** Висок

---

## 📋 ОБЩА ЦЕЛ

В момента имаме ДВА различни екрана за показване на рецепти:
- `app/recipe-detail/[id].tsx` — за ready_recipes (от администратора) — КРАСИВ дизайн
- `app/user-recipe/[id].tsx` — за user_recipes (от потребителя) — БЕДЕН дизайн

Потребителят трябва да вижда **ИДЕНТИЧЕН екран** независимо от източника.

**Стратегия:** Извлечи UI-а от recipe-detail/[id].tsx в споделен компонент,
и двата екрана го използват, като подават различни данни.

---

## ⚠️ КРИТИЧНИ ПРАВИЛА (от CLAUDE.md)

1. ВИНАГИ цветове от `constants/Colors.ts` — НЕ hardcoded #A80048
2. ВИНАГИ размери от `constants/Theme.ts`
3. Икони: САМО `@expo/vector-icons` — НЕ lucide-react-native
4. Стилове: САМО `StyleSheet` — НЕ NativeWind className
5. НЕ инсталирай нови npm пакети
6. Двуезичност: Използвай `useTranslation()` за всички текстове

---

## 🏗️ ПЛАН НА ИЗПЪЛНЕНИЕ

### ФАЗА 1: Анализ на текущия recipe-detail/[id].tsx

ПРЕДИ да пишеш код — прочети ЦЕЛИЯ файл `app/recipe-detail/[id].tsx`.
Той е "красивият" дизайн с:
- ✅ Hero image с nutrition overlay
- ✅ Контроли за Порции/Количество (mode switcher)
- ✅ Табове: Увод / Съставки / Стъпки / Хранителна стойност
- ✅ Съставки с кръгли аватари (снимки от ingredients_database)
- ✅ Text/Gallery превключвател в Стъпки таба
- ✅ Timer ON/OFF бутон
- ✅ Multiplier бутони (÷3, ÷2, x1, x1.5, x2, x5)
- ✅ Shopping list бутон (вишнев)

ЗАБЕЛЕЖКА: Файлът има нарушения — използва lucide-react-native 
и NativeWind className. Тези ТРЯБВА да се поправят при миграцията.

---

### ФАЗА 2: Създай споделен компонент

#### Файл: `components/RecipeDetailView.tsx`

Този компонент получава ГОТОВИ ДАННИ като props — не знае откъде идват.

```typescript
// Props интерфейс:
interface RecipeDetailViewProps {
  // Основна информация
  name: string;
  description?: string;
  heroImageUrl?: string;
  
  // Компоненти (base recipes в рецептата)
  components: Array<{
    id: string;
    name: string;
    roleName: string;           // "Блат" / "Crust" (вече преведено)
    totalWeightGrams?: number;
    totalCalories?: number;
    totalProtein?: number;
    totalFat?: number;
    totalCarbs?: number;
    totalNetCarbs?: number;
    bakeTemp?: number;
    bakeTime?: number;
  }>;
  
  // Съставки (от recipe_ingredients + ingredients_database)
  ingredients: Array<{
    id: string;
    name: string;               // Вече преведено (bg/en)
    quantity: number;
    unit: string;
    imageUrl?: string;
    unitWeightGrams?: number;   // За конвертиране бр→грамове
    componentName?: string;     // Към кой компонент принадлежи
  }>;
  
  // Стъпки (от recipe_instruction_steps)
  steps: Array<{
    id: string;
    stepNumber: number;
    description: string;        // Вече преведено (bg/en)
    imageUrl?: string;
    durationMinutes?: number;
    componentName?: string;     // Към кой компонент
  }>;
  
  // Хранителна информация (сумарна)
  nutrition: {
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
    totalNetCarbs: number;
    totalFiber?: number;
  };
  
  // Настройки
  totalServings: number;
  totalWeightGrams: number;
  
  // Intro текст (опционално)
  introText?: string;
  
  // Callbacks
  onBack?: () => void;
  onShare?: () => void;
  onAddToShoppingList?: (ingredients: any[]) => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  
  // Loading state
  isLoading?: boolean;
}
```

#### Какво прави компонентът:

1. **Hero Section:**
   - Голямо изображение (героImageUrl)
   - Back бутон (горе ляво)
   - Heart + Share бутони (горе дясно)
   - Nutrition overlay (calories, protein, fat, carbs) — в долната част
   - Порции/Количество mode switcher
   - Multiplier бутони

2. **Action Buttons Row** (под hero):
   - 🛒 Shopping List (вишнев, Colors.primary.main)
   - Text/Gallery toggle
   - Timer ON/OFF toggle

3. **Табове:**
   - **УВОД** / **INTRO** — introText или description
   - **СЪСТАВКИ** / **INGREDIENTS** — списък с аватари, групирани по компонент
   - **СТЪПКИ** / **STEPS** — text или gallery mode, timer бутони при стъпки с duration
   - **ХРАН. СТОЙ.** / **NUTRITION** — детайлна хранителна информация

4. **Всички текстове** през `useTranslation()`:
   ```typescript
   const { t, language } = useTranslation();
   // t('recipeDetail.servings'), t('recipeDetail.ingredients'), etc.
   ```

5. **Всички стилове** с `StyleSheet.create()` — НЕ className

6. **Всички икони** с `@expo/vector-icons`:
   ```typescript
   // Замени lucide-react-native:
   // ChevronLeft → <Ionicons name="chevron-back" />
   // Heart → <Ionicons name="heart" /> / <Ionicons name="heart-outline" />
   // Share2 → <Ionicons name="share-outline" />
   // Plus → <Ionicons name="add" />
   // Minus → <Ionicons name="remove" />
   // ShoppingCart → <Ionicons name="cart" />
   // FileText → <Ionicons name="document-text-outline" />
   // ImageIcon → <Ionicons name="images-outline" />
   // Clock → <Ionicons name="timer-outline" />
   ```

7. **Всички цветове** от Colors.ts — замени hardcoded стойности:
   ```typescript
   // '#A80048' → Colors.primary.main
   // '#B2AC88' → Colors.secondary.main
   // '#333333' → Colors.text.primary
   // '#666666' → Colors.text.secondary
   // '#FFFFFF' → Colors.background.primary
   // '#F5F5F5' → Colors.background.secondary
   ```

---

### ФАЗА 3: Рефакторирай recipe-detail/[id].tsx

Този файл САМО зарежда данни от `ready_recipes` и ги подава на компонента.

```typescript
// app/recipe-detail/[id].tsx
import RecipeDetailView from '../../components/RecipeDetailView';
import { useTranslation, localizedField } from '../../constants/i18n';

export default function ReadyRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language } = useTranslation();
  
  // 1. Зареди ready_recipe
  const { data: recipe, isLoading } = useQuery({
    queryKey: ['readyRecipe', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ready_recipes')
        .select(`
          *,
          dessert_type:dessert_types(*),
          crust:base_recipes!ready_recipes_crust_id_fkey(
            *, 
            ingredients:recipe_ingredients(
              *, ingredient:ingredients_database(*)
            ),
            steps:recipe_instruction_steps(*)
          ),
          cream:base_recipes!ready_recipes_cream_id_fkey(
            *, 
            ingredients:recipe_ingredients(
              *, ingredient:ingredients_database(*)
            ),
            steps:recipe_instruction_steps(*)
          ),
          filling:base_recipes!ready_recipes_filling_id_fkey(
            *, 
            ingredients:recipe_ingredients(
              *, ingredient:ingredients_database(*)
            ),
            steps:recipe_instruction_steps(*)
          ),
          decoration:base_recipes!ready_recipes_decoration_id_fkey(
            *, 
            ingredients:recipe_ingredients(
              *, ingredient:ingredients_database(*)
            ),
            steps:recipe_instruction_steps(*)
          )
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // 2. Трансформирай данните за компонента
  const transformedData = useMemo(() => {
    if (!recipe) return null;
    
    const roleNames = {
      crust: language === 'bg' ? 'Блат' : 'Crust',
      cream: language === 'bg' ? 'Крем' : 'Cream',
      filling: language === 'bg' ? 'Плънка' : 'Filling',
      decoration: language === 'bg' ? 'Декор' : 'Decoration',
    };
    
    // Събери компонентите
    const components = [];
    const allIngredients = [];
    const allSteps = [];
    
    for (const [key, roleName] of Object.entries(roleNames)) {
      const baseRecipe = recipe[key];
      if (!baseRecipe) continue;
      
      components.push({
        id: baseRecipe.id,
        name: baseRecipe.name,
        roleName,
        totalWeightGrams: baseRecipe.total_weight_grams,
        totalCalories: baseRecipe.total_calories,
        totalProtein: baseRecipe.total_protein,
        totalFat: baseRecipe.total_fat,
        totalCarbs: baseRecipe.total_carbs,
        totalNetCarbs: baseRecipe.total_net_carbs,
        bakeTemp: baseRecipe.bake_temp_celsius,
        bakeTime: baseRecipe.bake_time_minutes,
      });
      
      // Съставки
      if (baseRecipe.ingredients) {
        for (const ing of baseRecipe.ingredients) {
          allIngredients.push({
            id: ing.id,
            name: language === 'bg' 
              ? (ing.ingredient?.name_bg || ing.ingredient?.name_en || ing.ingredient_name)
              : (ing.ingredient?.name_en || ing.ingredient_name),
            quantity: ing.quantity,
            unit: ing.unit,
            imageUrl: ing.ingredient?.image_url,
            unitWeightGrams: ing.ingredient?.unit_weight_grams,
            componentName: roleName,
          });
        }
      }
      
      // Стъпки
      if (baseRecipe.steps) {
        for (const step of baseRecipe.steps) {
          allSteps.push({
            id: step.id,
            stepNumber: step.step_number,
            description: language === 'bg'
              ? (step.step_description_bg || step.step_description)
              : (step.step_description || step.step_description_bg),
            imageUrl: step.step_image_url,
            durationMinutes: step.step_duration_minutes,
            componentName: roleName,
          });
        }
      }
    }
    
    // Сумарна хранителна информация
    const nutrition = {
      totalCalories: components.reduce((s, c) => s + (c.totalCalories || 0), 0),
      totalProtein: components.reduce((s, c) => s + (c.totalProtein || 0), 0),
      totalFat: components.reduce((s, c) => s + (c.totalFat || 0), 0),
      totalCarbs: components.reduce((s, c) => s + (c.totalCarbs || 0), 0),
      totalNetCarbs: components.reduce((s, c) => s + (c.totalNetCarbs || 0), 0),
    };
    
    const totalWeight = components.reduce((s, c) => s + (c.totalWeightGrams || 0), 0);
    
    return {
      name: localizedField(recipe, 'name', language),
      description: localizedField(recipe, 'description', language),
      heroImageUrl: recipe.hero_image_url,
      introText: localizedField(recipe, 'description', language),
      components,
      ingredients: allIngredients,
      steps: allSteps,
      nutrition,
      totalServings: recipe.total_servings || 12,
      totalWeightGrams: totalWeight,
    };
  }, [recipe, language]);

  if (isLoading || !transformedData) {
    return <LoadingScreen />;
  }
  
  return (
    <RecipeDetailView
      {...transformedData}
      onBack={() => router.back()}
    />
  );
}
```

---

### ФАЗА 4: Рефакторирай user-recipe/[id].tsx

Същата логика, но четене от `user_recipes` + `selected_components`.

```typescript
// app/user-recipe/[id].tsx
import RecipeDetailView from '../../components/RecipeDetailView';

export default function UserRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language } = useTranslation();
  
  // 1. Зареди user_recipe
  const { data: recipe, isLoading } = useQuery({
    queryKey: ['myRecipe', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_recipes')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // 2. Зареди base_recipes за всеки компонент
  const baseRecipeIds = useMemo(() => {
    if (!recipe?.selected_components) return [];
    return recipe.selected_components
      .map((c: any) => c.base_recipe_id)
      .filter(Boolean);
  }, [recipe]);

  const { data: baseRecipes } = useQuery({
    queryKey: ['baseRecipesForUser', baseRecipeIds],
    queryFn: async () => {
      if (baseRecipeIds.length === 0) return [];
      const { data, error } = await supabase
        .from('base_recipes')
        .select(`
          *,
          role:recipe_roles(id, name, name_en),
          ingredients:recipe_ingredients(
            *, ingredient:ingredients_database(*)
          ),
          steps:recipe_instruction_steps(*)
        `)
        .in('id', baseRecipeIds);
      if (error) throw error;
      return data || [];
    },
    enabled: baseRecipeIds.length > 0,
  });

  // 3. Трансформирай по СЪЩИЯ начин като ready_recipe
  const transformedData = useMemo(() => {
    if (!recipe || !baseRecipes) return null;
    
    const components = [];
    const allIngredients = [];
    const allSteps = [];
    
    for (const br of baseRecipes) {
      const roleName = language === 'bg' 
        ? (br.role?.name || 'Компонент')
        : (br.role?.name_en || br.role?.name || 'Component');
      
      components.push({
        id: br.id,
        name: br.name,
        roleName,
        totalWeightGrams: br.total_weight_grams,
        totalCalories: br.total_calories,
        totalProtein: br.total_protein,
        totalFat: br.total_fat,
        totalCarbs: br.total_carbs,
        totalNetCarbs: br.total_net_carbs,
        bakeTemp: br.bake_temp_celsius,
        bakeTime: br.bake_time_minutes,
      });
      
      if (br.ingredients) {
        for (const ing of br.ingredients) {
          allIngredients.push({
            id: ing.id,
            name: language === 'bg'
              ? (ing.ingredient?.name_bg || ing.ingredient?.name_en || ing.ingredient_name)
              : (ing.ingredient?.name_en || ing.ingredient_name),
            quantity: ing.quantity,
            unit: ing.unit,
            imageUrl: ing.ingredient?.image_url,
            unitWeightGrams: ing.ingredient?.unit_weight_grams,
            componentName: roleName,
          });
        }
      }
      
      if (br.steps) {
        for (const step of br.steps) {
          allSteps.push({
            id: step.id,
            stepNumber: step.step_number,
            description: language === 'bg'
              ? (step.step_description_bg || step.step_description)
              : (step.step_description || step.step_description_bg),
            imageUrl: step.step_image_url,
            durationMinutes: step.step_duration_minutes,
            componentName: roleName,
          });
        }
      }
    }
    
    const nutrition = {
      totalCalories: components.reduce((s, c) => s + (c.totalCalories || 0), 0),
      totalProtein: components.reduce((s, c) => s + (c.totalProtein || 0), 0),
      totalFat: components.reduce((s, c) => s + (c.totalFat || 0), 0),
      totalCarbs: components.reduce((s, c) => s + (c.totalCarbs || 0), 0),
      totalNetCarbs: components.reduce((s, c) => s + (c.totalNetCarbs || 0), 0),
    };
    
    const totalWeight = components.reduce((s, c) => s + (c.totalWeightGrams || 0), 0);
    
    // Hero image: използвай decoration компонента или първия наличен
    const decorationBR = baseRecipes.find(br => br.role?.id === 4);
    const heroImage = decorationBR?.image_url || baseRecipes[0]?.image_url;
    
    return {
      name: recipe.name || 'Моята рецепта',
      description: recipe.intro_text,
      heroImageUrl: heroImage,
      introText: recipe.intro_text,
      components,
      ingredients: allIngredients,
      steps: allSteps,
      nutrition,
      totalServings: recipe.total_servings || 12,
      totalWeightGrams: totalWeight,
    };
  }, [recipe, baseRecipes, language]);

  if (isLoading || !transformedData) {
    return <LoadingScreen />;
  }
  
  return (
    <RecipeDetailView
      {...transformedData}
      onBack={() => router.back()}
    />
  );
}
```

---

## 🔄 МИГРАЦИЯ НА СТИЛОВЕТЕ В RecipeDetailView

При създаването на `components/RecipeDetailView.tsx`, ЗАДЪЛЖИТЕЛНО замени:

### lucide-react-native → @expo/vector-icons:
```typescript
// ❌ СТАРО:
import { ChevronLeft, Heart, Share2, Plus, Minus, ShoppingCart, 
         FileText, ImageIcon, Clock } from 'lucide-react-native';

// ✅ НОВО:
import { Ionicons } from '@expo/vector-icons';
// ChevronLeft → <Ionicons name="chevron-back" size={24} />
// Heart → <Ionicons name="heart" /> или name="heart-outline"
// Share2 → <Ionicons name="share-outline" />
// Plus → <Ionicons name="add" />
// Minus → <Ionicons name="remove" />
// ShoppingCart → <Ionicons name="cart" />
// FileText → <Ionicons name="document-text-outline" />
// ImageIcon → <Ionicons name="images-outline" />
// Clock → <Ionicons name="timer-outline" />
```

### NativeWind className → StyleSheet:
```typescript
// ❌ СТАРО:
<View className="flex-row items-center gap-2 mb-6">
<Text className="text-white text-2xl font-bold">

// ✅ НОВО:
<View style={styles.actionRow}>
<Text style={styles.heroTitle}>
```

### Hardcoded цветове → Colors.ts:
```typescript
// ❌ СТАРО:
const COLORS = { primary: '#A80048', secondary: '#B2AC88', ... };

// ✅ НОВО:
import { Colors } from '../constants/Colors';
// Използвай Colors.primary.main, Colors.secondary.main, etc.
```

---

## 🔤 ДВУЕЗИЧНОСТ

### Tab labels:
```typescript
const { t, language } = useTranslation();

// Tab names:
t('recipeDetail.intro')        // "Увод" / "Intro"
t('recipeDetail.ingredients')  // "Съставки" / "Ingredients"
t('recipeDetail.steps')        // "Стъпки" / "Steps"
t('recipeDetail.nutrition')    // "Хран. стой." / "Nutrition"
```

### Мерни единици:
```typescript
// В компонента добави функция за превод на единици:
function translateUnit(unit: string): string {
  if (language === 'en') return unit; // English as-is
  
  const bgUnits: Record<string, string> = {
    'g': 'г', 'ml': 'мл', 'pcs': 'бр',
    'tsp': 'ч.л.', 'tbsp': 'с.л.', 'cup': 'чаша',
    'kg': 'кг', 'l': 'л',
  };
  return bgUnits[unit.toLowerCase()] || unit;
}
```

### Ingredient names:
- Вече идват преведени от parent компонента (name prop)

### Step descriptions:
- Вече идват преведени от parent компонента (description prop)

---

## 🧪 ТЕСТВАНЕ

След всяка фаза:
1. `npx expo start --clear`
2. Отвори ready recipe → провери всичко работи
3. Отвори user recipe → провери СЪЩИЯТ дизайн
4. Превключи език BG→EN → провери преводите
5. Провери: avatars на съставки, Text/Gallery toggle, Timer

---

## ✅ ДЕФИНИЦИЯ ЗА ГОТОВО

- [ ] `components/RecipeDetailView.tsx` създаден с ПЪЛНИЯ красив дизайн
- [ ] `recipe-detail/[id].tsx` рефакториран — само зарежда данни + подава на компонента
- [ ] `user-recipe/[id].tsx` рефакториран — СЪЩИЯТ компонент, различен data source
- [ ] Нула lucide-react-native imports — само @expo/vector-icons
- [ ] Нула NativeWind className — само StyleSheet
- [ ] Нула hardcoded цветове — всичко от Colors.ts
- [ ] Всички текстове през useTranslation()
- [ ] Мерни единици преведени (г/ml → г/мл на БГ)
- [ ] Ingredient avatars работят
- [ ] Text/Gallery toggle работи
- [ ] Timer ON/OFF работи
- [ ] Тествано с ready_recipe И user_recipe

---

## 📋 КАК ДА ЗАПОЧНЕШ СЕСИЯТА

```
Прочети CLAUDE.md и CLAUDE_CODE_UNIFY_RECIPE.md.
Задача: Унифициране на recipe detail екраните.

Стъпка 1: Прочети ЦЕЛИЯ app/recipe-detail/[id].tsx
Стъпка 2: Създай components/RecipeDetailView.tsx (извлечи UI-а)
Стъпка 3: Рефакторирай recipe-detail/[id].tsx (само data loading)
Стъпка 4: Рефакторирай user-recipe/[id].tsx (същия компонент)
Стъпка 5: Тествай и двата екрана

ВАЖНО: Запази ЦЕЛИЯ красив дизайн от recipe-detail/[id].tsx!
Само замени lucide→@expo/vector-icons, className→StyleSheet, 
hardcoded цветове→Colors.ts.

Първо направи план, НЕ пиши код.
```