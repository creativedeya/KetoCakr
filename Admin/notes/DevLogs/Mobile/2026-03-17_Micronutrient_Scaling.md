# 📝 DevLog: KetoCakR **Mobile** App
Дата: 2026-03-17
Проект: **Mobile** (C:\Dev\KetoCakr\Mobile)
Сесия: #02
Статус: ✅ Завършен
Продължителност: ~30 мин
Claude Code контекст: 0% → ~40%

---

## 🎯 Цел на сесията
- [x] Fix micronutrient per-serving scaling в `RecipeDetailView.tsx`
- [x] Добавяне на 5 нови микронутриента (sugar alcohol, zinc, витамини A/C/D)
- [x] Обновяване на Supabase SELECT заявки в двата Detail екрана

---

## ✅ Завършено
| # | Задача | Файл(ове) | Commit |
|---|--------|-----------|--------|
| 1 | Добавени 5 нови полета в `IngredientItem` интерфейс | `components/RecipeDetailView.tsx` | uncommitted |
| 2 | `microNutrition` useMemo изчислява всичките 14 микронутриента | `components/RecipeDetailView.tsx` | uncommitted |
| 3 | `displayValues` useMemo — всички 14 микронутриента с `* scaleFactor / s` | `components/RecipeDetailView.tsx` | uncommitted |
| 4 | SELECT заявка + mapping за 5 нови колони | `app/recipe-detail/[id].tsx` | uncommitted |
| 5 | SELECT заявка + mapping за 5 нови колони | `app/user-recipe/[id].tsx` | uncommitted |

---

## 🏗️ Промени по Кода

**Нови файлове:** Няма

**Променени файлове:**
- `components/RecipeDetailView.tsx` — 3 промени:
  - `IngredientItem` интерфейс: +5 полета (`sugarAlcoholPer100g`, `zincPer100g`, `vitaminAPer100g`, `vitaminCPer100g`, `vitaminDPer100g`)
  - `microNutrition` useMemo: изчислява 14 микронутриента вместо 9
  - `displayValues` useMemo: всички микронутриенти се scaling-ват с `* scaleFactor / s`
- `app/recipe-detail/[id].tsx` — SELECT заявка + result mapping за 5 нови колони
- `app/user-recipe/[id].tsx` — SELECT заявка + result mapping за 5 нови колони

**Спазване на дизайн система:**
- Brand цвят `#A80048`: ✅ (не е засегнато)
- Икони библиотека: `@expo/vector-icons` ✅ (не е засегнато)
- Styling framework: StyleSheet ✅ (не е засегнато)
- Hardcoded цветове: ✅ Няма

---

## 🗄️ Backend & Данни (Supabase)

**Таблици засегнати:**
- `ingredients_database` — четат се 5 нови колони (трябва да съществуват в схемата!)

**SQL изпълнен:** Не — колоните трябва да съществуват от migration-а в Admin сесията (2026-03-16). Ако migration-ът не е изпълнен, SELECT-ът ще върне грешка.

**Промени по схемата:** Няма (само четем от съществуващи или бъдещи колони)

**Нови SELECT колони:**
```
sugar_alcohol_per_100g, zinc_per_100g, vitamin_a_per_100g, vitamin_c_per_100g, vitamin_d_per_100g
```

---

## 🐛 Нови бъгове / Нерешени проблеми
| Бъг | Файл | Приоритет |
|-----|------|-----------|
| Ако `add_usda_nutrition_columns.sql` не е изпълнен в Supabase, SELECT-ът ще гърми | `recipe-detail/[id].tsx`, `user-recipe/[id].tsx` | 🔴 |
| Новите микронутриенти (zinc, витамини) не се показват в UI — добавени само в data layer | `components/RecipeDetailView.tsx` | 🟢 (planned) |

---

## ⚠️ Критични бележки за следващата сесия

> [!IMPORTANT] Всички промени са uncommitted — commit преди следваща сесия!
> Засегнати файлове: `components/RecipeDetailView.tsx`, `app/recipe-detail/[id].tsx`, `app/user-recipe/[id].tsx`

> [!WARNING] Неща за внимание:
> 1. **ЗАДЪЛЖИТЕЛНО** — изпълни `migrations/add_usda_nutrition_columns.sql` в Supabase Dashboard преди тестване (от Admin сесия 2026-03-16)
> 2. Sugar alcohol влияе на Net Carbs формулата: `net_carbs = carbs - fiber - sugar_alcohol` — провери дали UI показва правилно
> 3. `displayValues.sugarAlcohol` е налично, но не се показва в Nutrition таба — може да се добави при нужда

---

## 📋 To-Do за следващата сесия
- [ ] Изпълни SQL migration в Supabase Dashboard (ако не е направено)
- [ ] Commit промените с описателно съобщение
- [ ] Тествай Nutrition таб — фибри трябва да са ~4g при 8 порции, не 28g
- [ ] Обнови `PROJECT_STATUS.md` с новата функционалност
- [ ] (По желание) Покажи zinc / витамини в Nutrition таба в UI

---

## 💡 Идеи за бъдещо развитие
- Добавяне на zinc, витамини A/C/D в Nutrition таба (след като USDA Import ги попълни)
- Net Carbs tooltip: обяснение на формулата (carbs - fiber - sugar alcohol)
- % от дневна норма за микронутриенти (DV%)
