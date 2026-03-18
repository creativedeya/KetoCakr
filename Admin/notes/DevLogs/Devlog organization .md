# 📂 DevLog Organization Guide — KetoCakR

> **Цел:** Ясна структура за DevLog файлове, разделени по проект (Admin / Mobile)
> **Дата:** 2026-03-16

---

## 📁 Файлова Структура

```
C:\Dev\KetoCakr\notes\
│
├── admin\                          # Admin Panel DevLogs
│   ├── 2026-03-16_USDA_Import.md
│   ├── 2026-03-15_Recipe_Builder.md
│   ├── 2026-03-10_AI_Integration.md
│   └── ...
│
├── mobile\                         # Mobile App DevLogs
│   ├── 2026-03-14_Home_Screen.md
│   ├── 2026-03-12_Tab_Navigation.md
│   ├── 2026-03-08_Shopping_List.md
│   └── ...
│
├── shared\                         # Cross-project (Database migrations, etc.)
│   ├── 2026-03-13_Database_Schema_Update.md
│   ├── 2026-03-05_Supabase_Setup.md
│   └── ...
│
├── archive\                        # Завършени/стари сесии
│   ├── 2026-02\
│   └── 2026-01\
│
├── DEVLOG_TEMPLATE.md              # Шаблон за нови DevLog-ове
└── README.md                       # Този файл
```

---

## 📝 Конвенция за Именуване

### **Формат:**
```
YYYY-MM-DD_Feature_Name.md
```

### **Примери:**

**Admin Panel:**
- `2026-03-16_USDA_Import.md`
- `2026-03-15_Recipe_Builder_Improvements.md`
- `2026-03-10_AI_Image_Generation.md`
- `2026-03-05_Batch_Translation.md`

**Mobile App:**
- `2026-03-14_Home_Screen_Redesign.md`
- `2026-03-12_Tab_Navigation.md`
- `2026-03-08_Shopping_List_Categories.md`
- `2026-03-01_Recipe_Detail_View.md`

**Shared/Backend:**
- `2026-03-13_Database_Schema_Update.md`
- `2026-03-05_Supabase_RLS_Setup.md`
- `2026-02-28_Ingredients_Table_Migration.md`

---

## 🏷️ Категоризация

Всеки DevLog файл трябва да започва с:

```markdown
# 📝 DevLog: KetoCakR [Admin | Mobile | Shared]
Дата: YYYY-MM-DD
Проект: [Admin Panel | Mobile App | Backend]
Сесия: #XX
```

Така в заглавието веднага се вижда за кой проект е.

---

## 🔗 Linking между DevLog-ове

Когато работата на една сесия се отнася до друга:

```markdown
> [!NOTE] Свързани сесии:
> - [Admin: Recipe Builder](./admin/2026-03-15_Recipe_Builder.md) — използва същите types
> - [Mobile: Recipe Detail](./mobile/2026-03-01_Recipe_Detail_View.md) — консумира API-то
```

---

## 📊 Index файл (опционално)

Можеш да поддържаш `notes/INDEX.md` с линкове към всички DevLog-ове:

```markdown
# 📚 DevLog Index — KetoCakR

## Admin Panel
- [2026-03-16 — USDA Import](./admin/2026-03-16_USDA_Import.md)
- [2026-03-15 — Recipe Builder](./admin/2026-03-15_Recipe_Builder.md)

## Mobile App
- [2026-03-14 — Home Screen](./mobile/2026-03-14_Home_Screen.md)
- [2026-03-12 — Tab Navigation](./mobile/2026-03-12_Tab_Navigation.md)

## Shared/Backend
- [2026-03-13 — Database Schema](./shared/2026-03-13_Database_Schema_Update.md)
```

---

## 🔄 Workflow

### При начало на нова сесия:

1. **Копирай шаблона:**
   ```powershell
   cp notes/DEVLOG_TEMPLATE.md notes/admin/2026-03-XX_Feature_Name.md
   ```

2. **Попълни header:**
   - Дата
   - Проект (Admin/Mobile/Shared)
   - Сесия номер
   - Цел

3. **Работи с Claude Code**

4. **Обновявай DevLog-а** по време на работа:
   - Завършени задачи → ✅
   - Нови проблеми → 🐛
   - Критични бележки → ⚠️

5. **При край на сесия:**
   - Попълни "Къде спряхме"
   - Добави commit hash-ове
   - Update To-Do секцията

---

## 🗂️ Archiving

След 1-2 месеца, преместете стари DevLog-ове в `archive/YYYY-MM/`:

```powershell
# Пример за архивиране на февруари
mkdir notes/archive/2026-02
mv notes/admin/2026-02-*.md notes/archive/2026-02/
mv notes/mobile/2026-02-*.md notes/archive/2026-02/
```

---

## 🎯 Предимства на тази структура

✅ **Ясно разделение** Admin vs Mobile сесии
✅ **Лесно търсене** по дата и feature
✅ **Избягва объркване** — не смесваш различни проекти
✅ **Scaling** — може да добавиш нови папки (backend, design, etc.)
✅ **Git-friendly** — всяка папка може да има собствен `.gitignore` ако трябва

---

## 🚀 Бърз старт

**Нова Admin сесия:**
```powershell
cd C:\Dev\KetoCakr\notes
cp DEVLOG_TEMPLATE.md admin/2026-03-XX_Feature_Name.md
code admin/2026-03-XX_Feature_Name.md
```

**Нова Mobile сесия:**
```powershell
cd C:\Dev\KetoCakr\notes
cp DEVLOG_TEMPLATE.md mobile/2026-03-XX_Feature_Name.md
code mobile/2026-03-XX_Feature_Name.md
```

---

**Готово!** 🎉

Сега DevLog-овете ще са организирани, лесни за намиране и няма да се объркват между Admin и Mobile работа.