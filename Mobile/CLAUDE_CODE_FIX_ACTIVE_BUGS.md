# 🔧 ЗАДАНИЕ ЗА CLAUDE CODE — Поправка на активни проблеми

> **Проект:** KetoCakR Mobile App
> **Дата:** 03.03.2026
> **Приоритет:** Висок — тези проблеми блокират по-нататъшна работа

---

## ⚠️ КРИТИЧНИ ПРАВИЛА (прочети преди да пишеш код)

1. Прочети `CLAUDE.md` преди всичко
2. НИКОГА hardcoded цветове — винаги от `constants/Colors.ts`
3. НИКОГА hardcoded размери — винаги от `constants/Theme.ts`
4. НИКОГА `lucide-react-native` — само `@expo/vector-icons`
5. НИКОГА нови npm пакети без одобрение
6. НИКОГА `localStorage` или `EventTarget` — това е React Native, НЕ web!
7. Използвай `AsyncStorage` за persistence, `Zustand` за state
8. Първо покажи план за всяка задача, НЕ пиши код веднага

---

## 📋 ЗАДАЧИ (изпълни в този ред)

---

### ЗАДАЧА 1: Split queries в `recipe-detail/[id].tsx`

**Проблем:** `recipe_instruction_steps` НЯМА Foreign Key constraint към `base_recipes`. Supabase PostgREST не може да направи JOIN и хвърля грешка `PGRST200`.

**Файл:** `app/recipe-detail/[id].tsx`

**Провери:** Отвори файла и виж дали заявката за данни опитва да зареди `recipe_instruction_steps` в СЪЩАТА заявка с `base_recipes` (чрез вложен select).

**Ако заявката е ЕДИНИЧНА (грешен вариант):**
```typescript
// ❌ ГРЕШНО — няма FK, PostgREST не може JOIN:
const { data } = await supabase
  .from('base_recipes')
  .select('*, recipe_ingredients(*), recipe_instruction_steps(*)')
  .in('id', componentIds);
```

**Поправи на ДВЕ ОТДЕЛНИ заявки (правилен вариант):**
```typescript
// ✅ ПРАВИЛНО — Заявка 1: base_recipes + ingredients
const { data: recipes, error: recipesError } = await supabase
  .from('base_recipes')
  .select('*, recipe_ingredients(*)')
  .in('id', componentIds);

// ✅ ПРАВИЛНО — Заявка 2: instruction_steps отделно
const { data: steps, error: stepsError } = await supabase
  .from('recipe_instruction_steps')
  .select('*')
  .in('recipe_id', componentIds)
  .order('step_number');
```

**Важно:** Файлът `app/user-recipe/[id].tsx` ВЕЧЕ е поправен с тази схема. Използвай го като референция.

**Провери също:** `components/RecipeDetailView.tsx` — дали приема `steps` като отделен prop или очаква да ги намери вътре в recipe обекта. Ако трябва, адаптирай prop interface-а.

---

### ЗАДАЧА 2: Ready Recipes не се показват в Home Screen

**Проблем:** Секцията с готови рецепти в Home екрана показва "Няма резултати" въпреки 10+ записа в `ready_recipes` таблицата.

**Файл:** `app/(tabs)/home/index.tsx`

**Стъпки:**

1. **Намери заявката** към `ready_recipes` в този файл
2. **Провери филтрите** — вероятно има `.eq('status', 'published')` или `.not('published_at', 'is', null)` или подобен филтър
3. **Махни временно филтъра** за `status` и `published_at` — повечето записи в базата нямат тези стойности
4. **Добави console.log** ВРЕМЕННО за дебъг:
```typescript
console.log('🏠 Ready recipes query result:', { data, error });
```
5. **Ако заявката е OK но данните не се показват** — провери условието за рендериране (може да проверява `data?.length > 0` но data е null)

**Очакван резултат:** Готовите рецепти се показват в Home Screen.

**Бележка:** Ако проблемът се окаже в базата данни (всички записи имат `published_at = NULL`), кажи ми — ще го поправя директно в Supabase.

---

### ЗАДАЧА 3: Почисти debug console.log-ове

**Проблем:** В няколко файла има debug логове с 📖 prefix, които трябва да се махнат.

**Файлове за почистване:**
- `app/user-recipe/[id].tsx`
- `app/recipe-detail/[id].tsx`
- `components/RecipeDetailView.tsx`

**Действие:** Намери и ИЗТРИЙ всички редове, които съдържат:
- `console.log('📖` 
- `console.log("📖`
- Всякакви други debug console.log-ове добавени за тестване

**НЕ трий** console.error редове — те са полезни за production debugging.

---

### ЗАДАЧА 4: Провери RecipeDetailView props

**Файл:** `components/RecipeDetailView.tsx`

**Провери:** Как компонентът получава instruction steps?

**Вариант А — Steps идват вложени в recipe обекта:**
```typescript
// Ако props изглежда така:
interface Props {
  recipe: RecipeWithComponents; // steps са вътре в recipe.components[].recipe_instruction_steps
}
```
→ Това НЯМА да работи заради FK проблема. Трябва да се промени.

**Вариант Б — Steps идват като отделен prop:**
```typescript
// Ако props изглежда така:
interface Props {
  recipe: RecipeWithComponents;
  instructionSteps: InstructionStep[]; // ✅ Отделно — ПРАВИЛНО
}
```
→ Това е правилно. Провери дали и двата wrapper файла (`recipe-detail/[id].tsx` и `user-recipe/[id].tsx`) подават steps.

**Ако трябва промяна:** Добави `instructionSteps` prop и адаптирай компонента да го използва вместо вложени steps.

---

## ✅ КРИТЕРИИ ЗА ГОТОВО

- [ ] `recipe-detail/[id].tsx` зарежда instruction_steps ОТДЕЛНО (не в JOIN)
- [ ] `user-recipe/[id].tsx` продължава да работи (не го чупи)
- [ ] `RecipeDetailView.tsx` приема steps правилно от двата wrapper-а
- [ ] Ready recipes се показват в Home Screen
- [ ] Няма debug console.log-ове (с 📖 или подобни)
- [ ] Всичко компилира без грешки
- [ ] Тествано — recipe detail screen зарежда ingredients И steps

---

## 🔍 СЛЕД ПРИКЛЮЧВАНЕ

Кажи ми:
1. Какво точно промени във всеки файл (кратко)
2. Дали ready_recipes проблемът беше във филтъра или в друго
3. Дали RecipeDetailView имаше нужда от промяна на props
4. Има ли нещо, което изисква промяна в Supabase базата

---

## 📁 ФАЙЛОВЕ ЗА РЕФЕРЕНЦИЯ

Тези файлове НЕ трябва да се променят, но ги прочети за контекст:
- `CLAUDE.md` — правила на проекта
- `store/useLanguageStore.ts` — езикова система
- `constants/i18n/index.ts` — useTranslation() hook
- `constants/Colors.ts` — цветова система
- `constants/Theme.ts` — типография и spacing