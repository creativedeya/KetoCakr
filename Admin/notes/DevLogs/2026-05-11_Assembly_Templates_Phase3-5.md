# 📝 DevLog: KetoCakR — Assembly Templates Phase 3 → 5
Дата: 2026-05-11
Проект: Admin
Статус: ✅ Завършен
Продължителност: ~3 сесии (context compaction след Phase 3)
Claude Code контекст: 0% → ~90%

---

## 🎯 Цел на сесията

- [x] Phase 3: Edit page за assembly template + metadata form + steps CRUD manager
- [x] Phase 4: Ingredients & Equipment selectors в step form
- [x] Phase 5: Image upload + AI генерация на изображения за стъпки

---

## ✅ Завършено

| # | Задача | Файл(ове) |
|---|--------|-----------|
| 1 | Edit page с nav + auth + tabs | `app/dashboard/assembly-templates/[id]/page.tsx` |
| 2 | Metadata form (имена, intro text, инструкции, настройки) | `app/dashboard/assembly-templates/[id]/components/AssemblyTemplateForm.tsx` |
| 3 | Steps CRUD manager (list, add, edit, delete) | `app/dashboard/assembly-templates/[id]/components/AssemblyStepsManager.tsx` |
| 4 | Step form с modal overlay | `app/dashboard/assembly-templates/[id]/components/AssemblyStepForm.tsx` |
| 5 | Nav + auth fix за list page | `app/dashboard/assembly-templates/page.tsx` |
| 6 | Phase 4: Ingredients selector (търсене + pills + checkbox grid) | `app/dashboard/assembly-templates/[id]/components/AssemblyStepForm.tsx` |
| 7 | Phase 4: Equipment selector (търсене + pills + checkbox grid) | `app/dashboard/assembly-templates/[id]/components/AssemblyStepForm.tsx` |
| 8 | API route: ingredients-database | `app/api/ingredients-database/route.ts` |
| 9 | API route: equipment (статичен списък) | `app/api/equipment/route.ts` |
| 10 | Phase 5: Image upload (assembly-templates bucket) | `app/api/upload-assembly-step-image/route.ts` |
| 11 | Phase 5: AI image generation (Gemini via existing provider) | `app/api/assembly-templates/[id]/generate-step-image/route.ts` |
| 12 | Phase 5: Image section в step form | `app/dashboard/assembly-templates/[id]/components/AssemblyStepForm.tsx` |
| 13 | i18n keys за Phase 3 | `public/locales/bg.json`, `public/locales/en.json` |

---

## 🏗️ Промени по Кода

**Нови файлове:**
- `app/dashboard/assembly-templates/[id]/page.tsx` — пълна edit страница: nav + auth + logout, 2 tabs (Метаданни / Стъпки), PATCH към `/api/assembly-templates/${id}`, `handleStepsUpdated()` за рефреш на step count
- `app/dashboard/assembly-templates/[id]/components/AssemblyTemplateForm.tsx` — форма за template metadata: `name` (BG), `name_en` (EN), `intro_text_bg`, `intro_text_en`, `instructions_bg`, `instructions_en`, `soaking_required` checkbox. Tracks `hasChanges`, Save button disabled без промени. Validation за двете имена.
- `app/dashboard/assembly-templates/[id]/components/AssemblyStepsManager.tsx` — steps list: сортирани по `step_number`, DELETE с confirm, открива modal dialog с `AssemblyStepForm` за add/edit. Step card показва номер (purple badge), truncated text (80 chars), duration, брой съставки/оборудване, image indicator.
- `app/api/ingredients-database/route.ts` — `GET ingredients_database` с `id, name_en, name_bg` (NB: не `name` — проектът използва `name_en`!)
- `app/api/equipment/route.ts` — статичен списък от 12 kitchen equipment items с BG имена (нямa Supabase таблица за equipment — само hardcoded library в `lib/equipmentlibrary.ts`)
- `app/api/upload-assembly-step-image/route.ts` — upload към `assembly-templates` Supabase bucket (отделен от `recipe-images`). Параметри: `file, templateId, stepId?`. Връща `{ success, url }`.

**Обновени/Имплементирани файлове:**
- `app/dashboard/assembly-templates/page.tsx` — добавен nav bar + auth pattern (сравнен с `base-recipes/page.tsx` и коригиран)
- `app/dashboard/assembly-templates/[id]/components/AssemblyStepForm.tsx` — три итерации:
  - Phase 3: базова форма (step_number, BG/EN description, duration, modal buttons)
  - Phase 4: добавени ingredients + equipment selectors (search → pills → checkbox grid)
  - Phase 5: добавена image секция (preview + delete, file upload, AI generate button, hints textarea, inline status toast)
- `app/api/assembly-templates/[id]/generate-step-image/route.ts` — имплементиран предварително съществуващ stub. Ползва `generateImageWithGemini` от `lib/providers/gemini-image.ts`, upload към `assembly-templates` bucket, optional DB update ако е подаден `stepId`.

**Спазване на дизайн система:**
- Brand цвят: ✅ не е засегнат
- Икони: lucide-react ✅ (`Loader2, X, ImageIcon, Plus, Edit2, Trash2`)
- Styling: Tailwind CSS ✅
- Shadcn/sonner/react-i18next: ❌ НЕ са налични → заменени с inline translations + custom toast state

---

## 🗄️ Backend & Данни (Supabase)

**Таблици засегнати:**
- `assembly_templates` — четене + update (PATCH metadata)
- `assembly_template_steps` — четене + create + update + delete. `ingredients_used: string[]` (uuid refs), `equipment_needed: number[]` (static ids)
- `ingredients_database` — четене (`id, name_en, name_bg`) — NB: колоните са `name_en`/`name_bg`, не `name`/`name_bg`!

**Supabase Storage:**
- Bucket: `assembly-templates` — **трябва да се създаде ръчно** в Supabase Dashboard → Storage → New bucket → `assembly-templates` (Public)
- Структура: `assembly-steps/{templateId}/{timestamp}-step-{n}.png`

**SQL изпълнен:**
```sql
-- Нищо директно — всичко през Supabase client
```

**Важни gotchas:**
- `ingredients_database` → колоните са `name_en` и `name_bg`, НЕ `name`. ACTIVE_TASK.md грешно ги описва като `name`.
- `equipment` таблица в Supabase НЕ СЪЩЕСТВУВА за admin purposes. Само `lib/equipmentlibrary.ts` с string ключове. Equipment route връща статичен списък (id 1–12).
- `image_generation_hints` колона НЕ съществува в `assembly_template_steps` → пазена само в local form state, не се праща към DB при save.
- Step save payload е explicit (не `...formData` spread) за да се избегне изпращане на полета без DB колони.

**RLS Policies:**
- Без промени — всичко през service role key

**Промени по схемата:**
- Без промени в DB схемата

---

## ⚠️ Критични адаптации (vs. ACTIVE_TASK.md spec)

ACTIVE_TASK.md за Phases 3–5 препраща към библиотеки, **които НЕ са налични** в проекта:

| Spec казва | Реалност | Решение |
|---|---|---|
| `react-i18next` | НЕ е инсталиран | Inline `translations` object (BG/EN) |
| `sonner` toast | НЕ е инсталиран | Custom state `{ message, type }` + `setTimeout` auto-dismiss |
| `shadcn/ui Button/Input/Textarea` | НЕ е инсталиран | Plain HTML `<button>`, `<input>`, `<textarea>` |
| `Ingredient.name` | Колоната е `name_en` | Интерфейс с `name_en: string` |
| `equipment` Supabase table | Не съществува | Статичен масив в route handler |
| `onCancel` prop премахнат | `AssemblyStepsManager` го подава | Запазен в интерфейса |
| `image_generation_hints` в DB | Колоната не е в схемата | Local state only, не се записва |

---

## 🐛 Нови бъгове / Нерешени проблеми

| Бъг | Статус |
|-----|--------|
| Няма известни нови бъгове | — |

**Pending (не блокиращи):**
- `assembly-templates` Supabase bucket **трябва да се създаде ръчно** преди да работи upload/generation
- `GOOGLE_API_KEY` трябва да е конфигуриран в `.env.local` за AI генерация
- Ако Gemini не върне изображение (нова model behavior), генерацията ще фейлне без Replicate fallback (за разлика от `generate-step-image` route)

---

## 📋 To-Do за следващата сесия (Phase 6 / Mobile)

- [ ] Създай `assembly-templates` bucket в Supabase Dashboard (ако не е направено)
- [ ] Тествай upload → трябва bucket да съществува
- [ ] Тествай AI генерация → трябва `GOOGLE_API_KEY` в `.env.local`
- [ ] Mobile Assembly Mode UI (следваща фаза — отделен ACTIVE_TASK.md)

---

## 💡 Идеи за бъдещо развитие
- Reorder steps с drag & drop
- Bulk generate images за всички стъпки на template наведнъж
- Preview на assembly flow (read-only режим) директно в admin

---

## 🔗 Референции
- [ACTIVE_TASK.md](../devlog/ACTIVE_TASK.md)
- [AssemblyStepForm.tsx](../../app/dashboard/assembly-templates/[id]/components/AssemblyStepForm.tsx)
- [generate-step-image route](../../app/api/assembly-templates/[id]/generate-step-image/route.ts)
- [lib/providers/gemini-image.ts](../../lib/providers/gemini-image.ts)
