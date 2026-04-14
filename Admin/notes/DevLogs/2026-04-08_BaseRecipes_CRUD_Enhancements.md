# 📝 DevLog: KetoCakR — Base Recipes CRUD Enhancements
Дата: 2026-04-08
Проект: Admin
Сесия: #09
Статус: ✅ Завършен
Продължителност: ~2ч
Claude Code контекст: 0% → ~85%

---

## 🎯 Цел на сесията
- [x] Task 1: Duplicate Base Recipe (с автоматично генериране на ново име)
- [x] Task 2: Delete with Cascade (проверка за употреба + многостепенно потвърждение)
- [x] Task 3: Ingredient Name Matching (fuzzy match + link към ingredients_database)

---

## ✅ Завършено

| # | Задача | Файл(ове) | Commit |
|---|--------|-----------|--------|
| 1 | Duplicate API route | `app/api/base-recipes/duplicate/route.ts` | — |
| 2 | Duplicate бутон в карта | `app/dashboard/base-recipes/page.tsx` | — |
| 3 | Delete with cascade API route | `app/api/base-recipes/delete/route.ts` | — |
| 4 | Delete бутон с двустепенно потвърждение | `app/dashboard/base-recipes/page.tsx` | — |
| 5 | Fuzzy match utility (Levenshtein) | `lib/fuzzyMatch.ts` | — |
| 6 | Suggest matches API route | `app/api/recipe-ingredients/suggest-matches/route.ts` | — |
| 7 | UnlinkedIngredients компонент | `app/dashboard/base-recipes/[id]/UnlinkedIngredients.tsx` | — |
| 8 | Интеграция в recipe edit page | `app/dashboard/base-recipes/[id]/page.tsx` | — |

---

## 🏗️ Промени по Кода

**Нови файлове:**
- `app/api/base-recipes/duplicate/route.ts` — POST: копира рецепта + ingredients + steps, генерира уникално име `{name} + 1/2/3...`, `image_url → null`
- `app/api/base-recipes/delete/route.ts` — DELETE: проверява употреба в ready/user recipe components, каскадно изтрива от 5 таблици при `?force=true`
- `lib/fuzzyMatch.ts` — Levenshtein similarity (0–1), `findBestMatches()` с дедупликация по id, праг 50%, топ 3
- `app/api/recipe-ingredients/suggest-matches/route.ts` — POST `{ ingredientName }` → fuzzy match срещу цяла `ingredients_database`, проверява name_bg и name_en
- `app/dashboard/base-recipes/[id]/UnlinkedIngredients.tsx` — компонент за масово свързване: зарежда `ingredient_database_id IS NULL` записи, показва топ 3 с цветни badge (зелено ≥80%, жълто ≥60%, оранжево <60%), Link бутон → update в Supabase

**Променени файлове:**
- `app/dashboard/base-recipes/page.tsx` — добавени: `Copy`, `Trash2` икони; `duplicatingId`, `deletingId` state; `handleDuplicate()` и `handleDelete()` функции; action footer на всяка карта
- `app/dashboard/base-recipes/[id]/page.tsx` — добавен `ingredient_database_id` в `Ingredient` интерфейс; зарежда полето при `loadAllData()`; рендерира `<UnlinkedIngredients>` между Ingredients и Instructions секциите

**Изтрити файлове:**
- няма

**Спазване на дизайн система:**
- Brand цвят `#A80048`: ✅ (не е засегнат — използваме Tailwind utility класове)
- Икони библиотека: lucide-react ✅
- Styling framework: Tailwind CSS ✅
- Hardcoded цветове: ✅ Няма

---

## 🗄️ Backend & Данни (Supabase)

**Таблици засегнати:**
- `base_recipes` — четене + дублиране + изтриване
- `recipe_ingredients` — четене + дублиране + изтриване + update `ingredient_database_id`
- `recipe_instruction_steps` — четене + дублиране + изтриване (БЕЗ FK constraint!)
- `ready_recipe_components` — проверка за употреба + каскадно изтриване
- `user_recipe_components` — проверка за употреба + каскадно изтриване
- `ingredients_database` — четене за fuzzy matching

**SQL изпълнен:**
```sql
-- Нищо директно — всичко през Supabase client
```

**Важни gotchas спазени:**
- `recipe_instruction_steps` НЯМА FK → изтриване и копиране само с `.eq('recipe_id', ...)`, без JOIN
- Duplicate: spread оператор за копиране на редове, пропускане на `id`, `image_url`, `created_at`, `updated_at`
- Delete: реда на изтриване е важен — child таблиците преди `base_recipes`

**RLS Policies:**
- Без промени

**Промени по схемата:**
- Без промени

---

## 🐛 Нови бъгове / Нерешени проблеми

| Бъг | Файл | Приоритет |
|-----|------|-----------|
| Няма известни нови бъгове | — | — |

**Pre-existing (не са засегнати):**
- Known DB issue: 147+ `recipe_ingredients` с `NULL ingredient_database_id` → решава се с новия Mass Link Tool (следваща задача)
- `ingredients_database` съдържа дубликати (Яйца/Яйце/Цели яйца) → fuzzy match ги показва всички, потребителят избира

---

## ⚠️ Критични бележки за следващата сесия

> [!IMPORTANT] Где спряхме:
> Завършихме Tasks 1, 2, 3 от ACTIVE_TASK.md. Файлът е обновен с нова задача: **Global Ingredient Normalize & Link Tool** (3-стъпков wizard). Архитектурата е напълно описана в новия ACTIVE_TASK.md.

> [!WARNING] Преди да започнеш следващата сесия:
> 1. `lib/fuzzyMatch.ts` и `app/api/recipe-ingredients/suggest-matches/route.ts` **ВЕЧЕ СЪЩЕСТВУВАТ** — не ги пресъздавай
> 2. Новата страница е на различна локация: `app/dashboard/ingredients/mass-link/page.tsx` (не `/admin/ingredients/...` — следвай структурата на проекта)
> 3. Admin панелът НЕ използва `react-hot-toast` — ACTIVE_TASK.md го споменава в псевдокода, но реалният код използва `alert()`. Или добави toast library с одобрение, или продължи с `alert()`

---

## 📋 To-Do за следващата сесия

- [ ] Прочети Admin/CLAUDE.md + Admin/notes/DevLogs/ACTIVE_TASK.md
- [ ] Step 1: `GET /api/ingredients/unlinked-summary` + UI за нормализиране на имена
- [ ] Step 2: `GET /api/ingredients/match-suggestions` + `POST /api/ingredients/auto-link` + UI
- [ ] Step 3: Manual review UI с edit name + re-search
- [ ] Добави навигация към новата страница от Ingredients секцията в dashboard
- [ ] Commit всичко от тази и следващата сесия

---

## 💡 Идеи за бъдещо развитие
- След масовото свързване → бутон "Recalculate all nutrition" за всички рецепти наведнъж
- Progress bar при масово свързване (Server-Sent Events или polling)
- Export на unlinked ingredients като CSV за ръчен преглед офлайн

---

## 🔗 Референции
- [ACTIVE_TASK.md — Mass Link Tool](./ACTIVE_TASK.md)
- [PROJECT_STATUS.md](./PROJECT_STATUS.md)
- [lib/fuzzyMatch.ts](../../lib/fuzzyMatch.ts)
