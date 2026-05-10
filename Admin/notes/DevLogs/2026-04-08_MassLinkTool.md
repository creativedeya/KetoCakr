# 📝 DevLog: Global Ingredient Normalize & Link Tool
Дата: 2026-04-08
Проект: Admin
Сесия: #09
Статус: ✅ Завършен
Продължителност: ~1ч
Claude Code контекст: 0% → ~40%

---

## 🎯 Цел на сесията
- [x] Изгради 3-стъпков wizard за масово нормализиране и свързване на 147+ несвързани recipe_ingredients
- [x] API routes за всяка стъпка
- [x] Навигация от dashboard

---

## ✅ Завършено
| # | Задача | Файл(ове) | 
|---|--------|-----------|
| 1 | GET API — групира несвързани съставки по Levenshtein сходство (≥70%) | `app/api/ingredients/unlinked-summary/route.ts` |
| 2 | POST API — batch UPDATE на ingredient_name (нормализиране) | `app/api/ingredients/normalize-names/route.ts` |
| 3 | GET API — fuzzy match на уникални имена към ingredients_database | `app/api/ingredients/match-suggestions/route.ts` |
| 4 | POST API — UPDATE на ingredient_database_id (свързване) | `app/api/ingredients/auto-link/route.ts` |
| 5 | 3-стъпков wizard UI (Step1/Step2/Step3 + StepIndicator) | `app/dashboard/ingredients/mass-link/page.tsx` |
| 6 | Добавен бутон "🔗 Mass Link Tool" в dashboard | `app/dashboard/page.tsx` |

---

## 🏗️ Промени по Кода

**Нови файлове:**
- `app/api/ingredients/unlinked-summary/route.ts` — GET: взима всички recipe_ingredients с NULL ingredient_database_id, групира по Levenshtein сходство (≥70%), предлага canonical форма
- `app/api/ingredients/normalize-names/route.ts` — POST: приема масив от { from[], to } mappings, изпълнява UPDATE само на unlinked записи
- `app/api/ingredients/match-suggestions/route.ts` — GET: за всяко уникално несвързано име търси топ съвпадение в ingredients_database (BG + EN), маркира highConfidence ≥90%
- `app/api/ingredients/auto-link/route.ts` — POST: приема масив от { ingredientName, databaseId }, UPDATE ingredient_database_id само на unlinked записи
- `app/dashboard/ingredients/mass-link/page.tsx` — цялостен wizard с 3 стъпки

**Променени файлове:**
- `app/dashboard/page.tsx` — добавен Quick Action бутон за Mass Link Tool

**Вече съществуващи (от предишна сесия, не пресъздавани):**
- `lib/fuzzyMatch.ts` — `similarity()` + `findBestMatches()` (Levenshtein)
- `app/api/recipe-ingredients/suggest-matches/route.ts` — POST за единична съставка (използван в Step 3)

**Спазване на дизайн система:**
- Brand цвят `#A80048`: ✅ (бутони, checkboxes, focus rings)
- Икони библиотека: lucide-react ✅
- Styling framework: Tailwind CSS ✅
- Hardcoded цветове: ✅ Само brand `#A80048` и `#8a003c` (hover)

---

## 🗄️ Backend & Данни (Supabase)

**Таблици засегнати:**
- `recipe_ingredients` — UPDATE на `ingredient_name` (Step 1) и `ingredient_database_id` (Step 2/3)
- `ingredients_database` — SELECT за fuzzy matching (read-only)

**SQL изпълнен:** Нито един миграционен файл — само runtime Supabase queries.

**Важни детайли по заявките:**
- Всички UPDATE-и имат `.is('ingredient_database_id', null)` — никога не презаписват вече свързани записи
- normalize-names прескача mappings където `from === to` (без излишни UPDATE-и)

---

## 🐛 Нови бъгове / Нерешени проблеми
| Бъг | Файл | Приоритет |
|-----|------|-----------|
| Step 3 зарежда `match-suggestions` (всички) и филтрира client-side — при много данни може да е бавно | `mass-link/page.tsx` | 🟢 |
| `suggestNormalizedName` е проста евристика (shortest + strip digits) — може да предложи неочаквано за кирилица | `unlinked-summary/route.ts` | 🟢 |

---

## ⚠️ Критични бележки за следващата сесия

> [!IMPORTANT] Как да стартираш инструмента:
> Адрес: `/dashboard/ingredients/mass-link`
> Или от Dashboard → Quick Actions → "🔗 Mass Link Tool"

> [!WARNING] Преди употреба:
> 1. Направи ръчен backup на recipe_ingredients (или провери последния snapshot)
> 2. Step 1 нормализира само unlinked записи (ingredient_database_id IS NULL) — безопасно
> 3. Step 2 auto-link-ва само ако score ≥ 90% — провери дали праговете са адекватни за BG имена

---

## 📋 To-Do за следващата сесия
- [ ] Тествай с реални данни — провери дали Levenshtein grouping-ът работи добре за BG имена
- [ ] Добави прогрес индикатор при дълги batch операции
- [ ] Помисли за "Undo last normalize" functionality

---

## 💡 Идеи за бъдещо развитие
- Добавяне на `session log` — показва история на изпълнените нормализации
- Export на резултатите като CSV за review преди потвърждение
- Threshold slider за confidence (в момента хардкоднат на 90%)
