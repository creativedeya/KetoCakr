# 🔧 ЗАДАНИЕ ЗА CLAUDE CODE — Builder поправки

> **Проект:** KetoCakR Mobile App
> **Дата:** 16.03.2026

---

## ⚠️ КРИТИЧНИ ПРАВИЛА

1. Прочети `CLAUDE.md` — ОСОБЕНО секция "Известни DB особености"
2. НИКОГА hardcoded цветове — `constants/Colors.ts`
3. НИКОГА нови npm пакети
4. `git add . && git commit -m "WIP before builder fix"` ПРЕДИ да започнеш

---

## 📋 ЗАДАЧИ
# 🔧 ЗАДАНИЕ ЗА CLAUDE CODE — USDA Nutrition Data Import (Admin Panel)

> **Проект:** KetoCakR Admin Panel (Next.js)
> **Дата:** 13.03.2026
> **Приоритет:** Критичен — коректността на базата е основата на целия проект

---

## ⚠️ КРИТИЧНИ ПРАВИЛА

1. Прочети `CLAUDE.md` в admin/ директорията
2. API ключът е в `.env.local`: `USDA_API_KEY=qGOXIYNg3aXvpZuFJBnHeZRUni2NSnCdvaQE4IOB`
3. НЕ инсталирай нови npm пакети
4. `git add . && git commit -m "WIP before USDA import"` ПРЕДИ да започнеш
5. Това е Admin Panel — Next.js, Tailwind, lucide-react (НЕ React Native!)

---

## 📐 КОНТЕКСТ

### Проблем:
Данните за нутриенти в `ingredients_database` са въведени ръчно и имат грешки — особено `fiber_per_100g`, който на места съдържа net carbs вместо реален fiber. Трябва да заменим с верифицирани данни от USDA FoodData Central.

### USDA FoodData Central API:
- **Endpoint:** `https://api.nal.usda.gov/fdc/v1/foods/search`
- **Метод:** GET или POST
- **Auth:** Query param `api_key`
- **Rate limit:** 1000 заявки/час
- **Data types:** `Foundation` и `SR Legacy` са най-надеждни за generic foods

### Пример заявка:
```
GET https://api.nal.usda.gov/fdc/v1/foods/search?api_key=YOUR_KEY&query=Almond%20Flour&dataType=Foundation,SR%20Legacy&pageSize=3
```

### Пример отговор (nutrient IDs):
```
Nutrient ID 1008 = Energy (kcal)
Nutrient ID 1003 = Protein (g)
Nutrient ID 1004 = Total lipid/fat (g)
Nutrient ID 1005 = Carbohydrate, by difference (g)
Nutrient ID 1079 = Fiber, total dietary (g)
Nutrient ID 1093 = Sodium, Na (mg)
Nutrient ID 1087 = Calcium, Ca (mg)
Nutrient ID 1089 = Iron, Fe (mg)
Nutrient ID 1090 = Magnesium, Mg (mg)
Nutrient ID 1092 = Potassium, K (mg)
Nutrient ID 2000 = Sugars, total (g)
Nutrient ID 1253 = Cholesterol (mg)
Nutrient ID 1258 = Saturated fatty acids (g)
```

---

## 📋 ЗАДАЧИ

---

### ЗАДАЧА 1: Добави нови колони в ingredients_database

**Изпълни SQL в Supabase** (или създай migration файл):

```sql
-- Нови колони за разширени нутриенти
ALTER TABLE ingredients_database ADD COLUMN IF NOT EXISTS sodium_per_100g NUMERIC(10,2);
ALTER TABLE ingredients_database ADD COLUMN IF NOT EXISTS calcium_per_100g NUMERIC(10,2);
ALTER TABLE ingredients_database ADD COLUMN IF NOT EXISTS iron_per_100g NUMERIC(10,2);
ALTER TABLE ingredients_database ADD COLUMN IF NOT EXISTS magnesium_per_100g NUMERIC(10,2);
ALTER TABLE ingredients_database ADD COLUMN IF NOT EXISTS potassium_per_100g NUMERIC(10,2);
ALTER TABLE ingredients_database ADD COLUMN IF NOT EXISTS sugar_per_100g NUMERIC(10,2);
ALTER TABLE ingredients_database ADD COLUMN IF NOT EXISTS cholesterol_per_100g NUMERIC(10,2);
ALTER TABLE ingredients_database ADD COLUMN IF NOT EXISTS saturated_fat_per_100g NUMERIC(10,2);

-- Колона за USDA reference
ALTER TABLE ingredients_database ADD COLUMN IF NOT EXISTS usda_fdc_id INTEGER;
ALTER TABLE ingredients_database ADD COLUMN IF NOT EXISTS nutrition_source TEXT DEFAULT 'manual';
ALTER TABLE ingredients_database ADD COLUMN IF NOT EXISTS nutrition_verified_at TIMESTAMPTZ;
```

---

### ЗАДАЧА 2: Създай API route за USDA search

**Файл:** `admin/app/api/usda-search/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const USDA_API_KEY = process.env.USDA_API_KEY;
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query');
  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${USDA_BASE_URL}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&dataType=Foundation,SR%20Legacy&pageSize=5`
    );
    const data = await response.json();
    
    // Извлечи само нужните нутриенти от всеки резултат
    const results = (data.foods || []).map((food: any) => {
      const nutrients = food.foodNutrients || [];
      
      const getNutrient = (id: number): number | null => {
        const n = nutrients.find((n: any) => n.nutrientId === id);
        return n ? Math.round(n.value * 100) / 100 : null;
      };
      
      return {
        fdcId: food.fdcId,
        description: food.description,
        dataType: food.dataType,
        calories_per_100g: getNutrient(1008),
        protein_per_100g: getNutrient(1003),
        fat_per_100g: getNutrient(1004),
        carbs_per_100g: getNutrient(1005),
        fiber_per_100g: getNutrient(1079),
        net_carbs_per_100g: (getNutrient(1005) || 0) - (getNutrient(1079) || 0),
        sodium_per_100g: getNutrient(1093),
        calcium_per_100g: getNutrient(1087),
        iron_per_100g: getNutrient(1089),
        magnesium_per_100g: getNutrient(1090),
        potassium_per_100g: getNutrient(1092),
        sugar_per_100g: getNutrient(2000),
        cholesterol_per_100g: getNutrient(1253),
        saturated_fat_per_100g: getNutrient(1258),
      };
    });
    
    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

### ЗАДАЧА 3: Създай Admin страница за USDA Import

**Файл:** `admin/app/dashboard/ingredients/usda-import/page.tsx`

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔬 USDA Nutrition Import                                        │
│ Верифициране на нутриенти от USDA FoodData Central              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Прогрес: 0 / 156 верифицирани    [Batch Import All]             │
│ ████░░░░░░░░░░░░░░░░ 0%                                        │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│ 🔍 Филтър: [Всички ▼] [Неверифицирани ▼] [С разлики ▼]        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🥚 Бадемово брашно / Almond Flour                          │ │
│ │                                                             │ │
│ │ Текущо (ръчно):          USDA данни:          Разлика:     │ │
│ │ Calories: 579            Calories: 571         -8 ⚠️       │ │
│ │ Protein:  21.0           Protein:  21.2        +0.2        │ │
│ │ Fat:      50.6           Fat:      49.9        -0.7        │ │
│ │ Carbs:    17.0           Carbs:    19.9        +2.9 ⚠️     │ │
│ │ Fiber:    7.0            Fiber:    10.7        +3.7 ⚠️     │ │
│ │ Net Carbs: 10.0          Net Carbs: 9.2        -0.8        │ │
│ │                                                             │ │
│ │ + Нови нутриенти: Sodium: 1mg, Calcium: 236mg, Iron: 3.7mg│ │
│ │                                                             │ │
│ │ USDA: "Almonds, flour" (Foundation, FDC ID: 2344723)       │ │
│ │                                                             │ │
│ │ [🔍 Търси друг USDA match]  [✅ Приеми USDA]  [❌ Запази] │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🥛 Течна сметана / Heavy Cream                              │ │
│ │ ...                                                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Функционалност:**

#### 3.1: Списък на всички ingredients
- Зареди от `ingredients_database`
- Покажи: name_bg, name_en, текущи nutrition стойности
- Маркирай верифицирани (nutrition_source = 'usda') с ✅
- Маркирай неверифицирани с ⚠️

#### 3.2: Автоматично USDA търсене
За всяка съставка:
1. Търси по `name_en` в USDA API (чрез `/api/usda-search`)
2. Вземи първия резултат от Foundation или SR Legacy
3. Покажи сравнение: текущо vs USDA
4. Маркирай РАЗЛИКИ >10% в жълто/червено

#### 3.3: Ръчно търсене
Бутон "Търси друг USDA match" — отваря search dialog:
- TextInput за търсене
- Показва до 5 резултата от USDA
- При избор — попълва USDA данните за сравнение

#### 3.4: Приеми или отхвърли
- **"Приеми USDA"** → обновява `ingredients_database` с USDA стойности:
  ```typescript
  await supabase.from('ingredients_database').update({
    calories_per_100g: usdaData.calories_per_100g,
    protein_per_100g: usdaData.protein_per_100g,
    fat_per_100g: usdaData.fat_per_100g,
    carbs_per_100g: usdaData.carbs_per_100g,
    fiber_per_100g: usdaData.fiber_per_100g,
    sodium_per_100g: usdaData.sodium_per_100g,
    calcium_per_100g: usdaData.calcium_per_100g,
    iron_per_100g: usdaData.iron_per_100g,
    magnesium_per_100g: usdaData.magnesium_per_100g,
    potassium_per_100g: usdaData.potassium_per_100g,
    sugar_per_100g: usdaData.sugar_per_100g,
    cholesterol_per_100g: usdaData.cholesterol_per_100g,
    saturated_fat_per_100g: usdaData.saturated_fat_per_100g,
    usda_fdc_id: usdaData.fdcId,
    nutrition_source: 'usda',
    nutrition_verified_at: new Date().toISOString(),
  }).eq('id', ingredientId);
  ```

- **"Запази текущо"** → не променя нищо, само маркира като прегледано

#### 3.5: Batch Import
Бутон "Batch Import All":
1. Обхожда ВСИЧКИ неверифицирани съставки
2. За всяка търси в USDA по name_en
3. Ако разликата в калории е <15% → автоматично приема
4. Ако разликата е >15% → маркира за ръчен преглед
5. Показва progress bar
6. В края: "Автоматично обновени: 120, За ръчен преглед: 36"

**ВАЖНО:** Между заявките добави 100ms delay за да не надвишиш rate limit:
```typescript
await new Promise(resolve => setTimeout(resolve, 100));
```

---

### ЗАДАЧА 4: Преизчисли total_net_carbs за base_recipes

След обновяване на ingredients_database, trigger-ът в base_recipes трябва да се задейства. Но за да е сигурно, добави бутон "Преизчисли всички рецепти":

```typescript
// За всяка base_recipe — trigger fake update на recipe_ingredients
const { data: recipes } = await supabase.from('base_recipes').select('id');
for (const recipe of recipes) {
  // Вземи първия ingredient
  const { data: ing } = await supabase
    .from('recipe_ingredients')
    .select('id, quantity')
    .eq('recipe_id', recipe.id)
    .limit(1)
    .single();
  
  if (ing) {
    // Update с текущата стойност — trigger ще преизчисли nutrition
    await supabase
      .from('recipe_ingredients')
      .update({ quantity: ing.quantity })
      .eq('id', ing.id);
  }
  
  await new Promise(resolve => setTimeout(resolve, 50));
}
```

---

## ⚠️ СПЕЦИАЛНИ СЛУЧАИ

### Еритритол / Ксилитол / Алулоза:
USDA може да не ги разпознае добре или да покаже carbs=100g (технически вярно, но net carbs=0). За sugar alcohols:
- carbs_per_100g = стойност от USDA
- fiber_per_100g = тук трябва РЕАЛЕН fiber (обикновено 0 за подсладители)
- Net carbs за подсладители = 0 (sugar alcohols не се броят)

**Ръчно провери подсладителите след batch import!**

### Съставки, които USDA не познава:
Някои специфични кето продукти (psyllium husk, xanthan gum, specific brands) може да нямат точен match. Маркирай ги за ръчен преглед.

---

## ✅ КРИТЕРИИ ЗА ГОТОВО

- [ ] Нови колони добавени в ingredients_database
- [ ] API route за USDA search работи
- [ ] Admin страница показва списък с ingredients
- [ ] Сравнение текущо vs USDA за всяка съставка
- [ ] Разлики >10% маркирани визуално
- [ ] "Приеми USDA" обновява базата
- [ ] "Търси друг match" работи
- [ ] Batch import с progress bar
- [ ] Автоматично приемане при <15% разлика
- [ ] Подсладителите маркирани за ръчен преглед
- [ ] Бутон "Преизчисли рецепти" работи
- [ ] Git commit

---

## 🔍 СЛЕД ПРИКЛЮЧВАНЕ КАЖИ МИ:

1. Колко съставки бяха автоматично обновени?
2. Колко останаха за ръчен преглед?
3. Кои съставки USDA не разпозна?
4. Какви са най-големите разлики между текущо и USDA?
5. Какви файлове създаде/промени?