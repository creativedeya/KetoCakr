# 🔄 DevLog Synchronization Guide

Този документ обяснява как работи синхронизирането между разработките на проекта **KetoCakR** и Obsidian библиотеката.

---

## 📋 Структура

```
C:\Dev\KetoCakr/
├── admin/
│   └── notes/devlog/          # Admin devlog
│       ├── daily-logs/        # Дневни отчети
│       ├── bugs/              # Известни проблеми
│       ├── features/          # Нови функции в разработка
│       └── architecture/      # Технически решения
│
├── Mobile/
│   └── notes/devlog/          # Mobile devlog (идентично структуре)
│       ├── daily-logs/
│       ├── bugs/
│       ├── features/
│       └── architecture/
│
└── scripts/
    └── sync-devlog.js         # Синхронизационен скрипт
```

**Obsidian Vault:**
```
C:\Obsidian\Vault\02_Projects\KetoCakR\DevLogs/
```

---

## 🚀 Как да се ползва

### 1️⃣ Синхронизирай всичко (admin ↔ mobile ↔ obsidian)

```bash
# От admin папката
cd admin
npm run sync:devlog

# ИЛИ от mobile папката
cd Mobile
npm run sync:devlog
```

### 2️⃣ Пробен режим (без промени)

```bash
npm run sync:devlog:dry-run
```

Това показва кои файлове ще бъдат синхронизирани без да направи промени.

### 3️⃣ Само към Obsidian

```bash
npm run sync:obsidian
```

Синхронизира всички файлове в Obsidian Vault без да засяга admin/mobile директориите.

---

## 📝 Как да добавиш нов devlog

### За дневни отчети:

```
admin/notes/devlog/daily-logs/2026-04-21.md
Mobile/notes/devlog/daily-logs/2026-04-21.md
```

**Формат:**

```markdown
# 📅 Daily Log - 2026-04-21

## ✅ Завършено
- [ ] Задача 1
- [ ] Задача 2

## 🔄 В процес
- [ ] Текуща задача

## 🐛 Проблеми
- [ ] Известна грешка

## 📌 Бележки
Дни прогрес или забележки за деня.
```

### За bug отчети:

```
admin/notes/devlog/bugs/[issue-id]-brief-description.md
```

**Пример:**

```
bugs/BUG-001-duplicate-key-error.md
bugs/BUG-002-splash-screen-issue.md
```

### За feature requests:

```
admin/notes/devlog/features/FEAT-[id]-feature-name.md
```

### За архитектурни решения:

```
admin/notes/devlog/architecture/ARCH-[id]-decision.md
```

---

## ⚙️ Как работи синхронизирането

### Логика:

1. **Сравнение на файлове** - Скриптът ползва MD5 hash за сравнение
2. **Двупосочен синк** - Ако файлът е променен в един място, се копира в другото
3. **Конфликти** - Файлът с по-нова последна промяна (mtime) печели
4. **Orphaned файлове** - Файлове които съществуват само в едно място се маркират като предупреждения

### Процес:

```
1. Прочитай файловете в admin/notes/devlog
2. Копирай променените в Mobile/notes/devlog
3. Копирай променените от Mobile обратно в admin
4. Копирай всички файлове в Obsidian Vault
5. Покажи лог на всички действия
```

---

## 🔧 Интеграция с Git

### .gitignore не е необходимо

Файловете в `/notes/devlog` ТРЯБВА да се commitвам в Git, тъй като се използват за отчитане на прогрес.

### Best practices:

```bash
# Синхронизирай преди commit
npm run sync:devlog

# Направи commit с devlog промените
git add admin/notes/devlog Mobile/notes/devlog
git commit -m "Update devlogs"

# Push към remote
git push
```

---

## 📊 Примерен workflow

```bash
# 1. Работиш на admin, пиши notes
# в admin/notes/devlog/daily-logs/2026-04-21.md

# 2. Преди да излезеш от админ, синхронизирай
cd admin
npm run sync:devlog

# 3. Преминаваш на mobile разработка
cd ../Mobile

# 4. Синхронизирай отново
npm run sync:devlog

# 5. Твоите devlog файлове са вече видими в Mobile/notes/devlog
# И СЪЩО в Obsidian!

# 6. Направи нотатка в Obsidian
# (например в C:\Obsidian\Vault\02_Projects\KetoCakR\DevLogs\daily-logs\)

# 7. Синхронизирай отново за да го вземеш локално
npm run sync:devlog
```

---

## 🐛 Отстраняване на проблеми

### "Obsidian vault not found"

Проверете пътя:
```bash
# Windows PowerShell
Test-Path "C:\Obsidian\Vault\02_Projects\KetoCakR\DevLogs"
```

Ако пътят е различен, отворете `scripts/sync-devlog.js` и обновете `OBSIDIAN_PATH`.

### Некои файлове се дублират

Проблемът вероятно е конфликт. Проверете:
1. Която версия е по-нова (дата)
2. Ако са идентични, един може да се изтрие
3. Ако са различни, rename един и слей вручи

### Синхронизирането е бавно

Това е нормално с много файлове. Ако има хиляди файлове:
- Помисли дали наистина трябват всички
- Можеш да добавиш `.syncignore` файл (ако е необходимо)

---

## 📞 Автоматизация (Advanced)

### Ако искаш автоматична синхронизация при commit:

Създай файл `.git/hooks/post-commit`:

```bash
#!/bin/bash
cd "$(git rev-parse --show-toplevel)/admin"
npm run sync:devlog > /dev/null 2>&1
```

```bash
chmod +x .git/hooks/post-commit
```

Това ще синхронизира автоматично след всеки commit.

---

## 📌 Заб
ележки

- Синхронизирането е **быстро** за малък брой файлове (<1000)
- Файловете трябва да са **Markdown (.md)** за най-добро интегриране с Obsidian
- ИЗБЪРЗ всички промени преди синхронизация
- Ако синхронизирането не работи, пробвай `--dry-run` първо

---

## 🎯 Следващи стъпки

1. ✅ Синхронизационния скрипт е готов
2. Начало на писане на дневни отчети в `/notes/devlog/daily-logs`
3. Документиране на bugs и features по време на разработка
4. Регулярна синхронизация (поне 1x на ден)

Успешна разработка! 🚀
