# 🔧 ЗАДАЧА: Провери и поправи Mobile app четенето от ready_recipes

**Приоритет:** КРИТИЧЕН  
**Папка:** `Mobile/`

---

## 📋 КОНТЕКСТ

Вчера направихме промени в базата данни:
1. **Премахнахме колоните** `crust_id`, `cream_id`, `filling_id`, `decoration_id` от таблицата `ready_recipes`
2. **Единственият източник** за компоненти на рецепта е `selected_components` (JSONB)
3. **Поправихме role mapping:** role 2 = Frosting (Крем), role 3 = Filling (Плънка)

Мобилното приложение може все още да реферира старите колони или да чете данните неправилно.

---

## 🎯 КАКВО ТРЯБВА ДА НАПРАВИШ

### Стъпка 1: Търси references към старите колони

```bash
cd /workspace/Mobile
grep -rn "crust_id\|cream_id\|filling_id\|decoration_id" --include="*.tsx" --include="*.ts"
```

За всеки намерен резултат — замени с четене от `selected_components`.

### Стъпка 2: Търси всички Supabase заявки към ready_recipes

```bash
cd /workspace/Mobile
grep -rn "ready_recipes" --include="*.tsx" --include="*.ts"
```

За всяка заявка провери:
- Дали select() включва `selected_components`
- Дали НЕ реферира премахнатите колони
- Дали правилно парсва JSONB масива

### Стъпка 3: Провери TypeScript типовете

Потърси в:
- `Mobile/types/` или `Shared/types/`
- Всякакви interface/type дефиниции за ReadyRecipe, UserRecipe и т.н.

```bash
grep -rn "crust_id\|cream_id\|filling_id\|decoration_id\|ReadyRecipe\|ready_recipe" --include="*.ts" --include="*.tsx" /workspace/Mobile /workspace/Shared
```

Ако има type definition с тези полета — премахни ги и добави:
```typescript
selected_components: {
  recipe_role_id: number;
  base_recipe_id: string;
  multiplier: number;
  order_index: number;
}[] | null;
```

### Стъпка 4: Провери как се визуализират компонентите

Намери екрани, които показват ready recipe детайли:
- `Mobile/app/recipe-detail/[id].tsx`
- `Mobile/app/user-recipe/[id].tsx`
- Всеки друг екран, който зарежда ready_recipes

Провери дали кодът:
1. Чете компонентите от `selected_components`
2. Групира ги по `recipe_role_id` (1=Блат, 2=Крем, 3=Плънка, 4=Декор)
3. За всеки компонент зарежда base_recipe данните (име, съставки, стъпки)
4. Поддържа множество компоненти от една роля (напр. два блата)

**Правилен подход за зареждане:**
```typescript
// 1. Зареди ready recipe
const { data: recipe } = await supabase
  .from('ready_recipes')
  .select('*, dessert_type:dessert_types(*)')
  .eq('id', recipeId)
  .single();

// 2. Извлечи base_recipe IDs от selected_components
const componentIds = recipe.selected_components?.map(c => c.base_recipe_id) || [];

// 3. Зареди всички base recipes с техните данни
const { data: baseRecipes } = await supabase
  .from('base_recipes')
  .select(`
    *,
    recipe_role:recipe_roles(id, name, name_en),
    ingredients:recipe_ingredients(*),
    steps:recipe_instruction_steps(*)
  `)
  .in('id', componentIds);

// 4. Групирай по роля за визуализация
const componentsByRole = recipe.selected_components
  ?.sort((a, b) => a.order_index - b.order_index)
  .map(comp => ({
    ...comp,
    baseRecipe: baseRecipes?.find(br => br.id === comp.base_recipe_id)
  }));
```

### Стъпка 5: Провери Home screen (ако зарежда ready_recipes)

Файл: `Mobile/app/(tabs)/home/index.tsx`

Ако "Рецепта на деня" или друга секция зарежда от `ready_recipes`:
- Увери се че select() е коректен
- Увери се че не реферира старите колони

### Стъпка 6: Провери recipe cards и списъци

Ако RecipeCard или подобен компонент показва информация от ready_recipes:
- Увери се че не чете от старите колони за показване на брой компоненти или имена

---

## ⚠️ ПРАВИЛА

- Прочети CLAUDE.md преди да започнеш
- Всички цветове от constants/Colors.ts
- Всички размери от constants/Theme.ts
- За икони: САМО @expo/vector-icons
- НЕ инсталирай нови пакети
- НЕ модифицирай database schema
- Направи backup на всеки файл преди промяна

---

## 📊 ROLE MAPPING REFERENCE

```
recipe_role_id = 1 → Блат (Crust/Base)
recipe_role_id = 2 → Крем (Frosting)
recipe_role_id = 3 → Плънка (Filling)
recipe_role_id = 4 → Декор (Decoration)
```

## 📊 ready_recipes ТЕКУЩИ КОЛОНИ

```
id, dessert_type_id, name_en, name_bg, description_en, description_bg,
hero_image_url, is_featured, created_at, published_at, assembly_template_id,
custom_intro_text_bg, custom_intro_text_en, tags, selected_components,
difficulty_level, is_free, total_servings, total_weight_grams,
total_calories, total_protein, total_fat, total_carbs, total_net_carbs,
status, slug, updated_at, estimated_cost, cost_currency, selling_price,
price_currency, cost_calculated_at
```

**НЯМА:** crust_id, cream_id, filling_id, decoration_id

---

## 🧪 ТЕСТ

1. `grep -rn "crust_id\|cream_id\|filling_id\|decoration_id" --include="*.tsx" --include="*.ts"` в Mobile/ → 0 резултата
2. `npx expo start --clear` → без грешки
3. Приложението се зарежда на телефона
4. Ако има екран с ready recipes — зарежда данните правилно

---

## ✅ ГОТОВО КОГАТО

- [ ] Нула references към crust_id/cream_id/filling_id/decoration_id в Mobile/
- [ ] TypeScript типове обновени
- [ ] Supabase заявки коректни
- [ ] Приложението стартира без грешки
- [ ] Запиши списък с всички променени файлове