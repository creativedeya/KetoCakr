# 🏆 Статус на проект KetoCakR (BLAGO)
Последна актуализация: 2026-03-13
Версия: 0.9.0-beta (pre-launch)

---

## ✅ ЗАВЪРШЕНО

### 🏗️ Основна архитектура
- [x] Localization: BG/EN двуезична система (useTranslation, localizedField)
- [x] Units: Metric/Imperial конверсия на съставки (oz/fl oz)
- [x] Currency: Автоматично €/$ по език с ръчен override в Settings
- [x] Pan System: BakingPans.ts (7 кръгли + 2 правоъгълни форми)
- [x] Image Upload: expo-image-picker + Supabase Storage (FormData подход за Android)

### 📱 Мобилно приложение (Екрани)
- [x] Home (Таб 1): Десерт на деня, Hero image с gradient, 4×2 Grid + "Виж всички"
- [x] Search (Таб 2): Филтри по тип, калории диапазони, net carbs + Debounced търсене
- [x] Create (Таб 3): Recipe Builder, Nutrition per serving, Image upload, FAB бутон + търсене
- [x] Tools (Таб 4): Конвертор инч↔см, Таймер (паралелни), Конвертор тави (2 режима), Макро калкулатор (Кето/LCHF/Custom)
- [x] Recipe Detail: Unified View, Servings +/-, Price mode с inline editing, Assembly mode
- [x] Shopping List: Групиране по категории (ingredient_categories), двуезични имена
- [x] Settings: Език, Мерни единици, Валута

### 💰 Price система
- [x] Цена per kg/L/бр с правилна формула (qty/1000 × price/kg)
- [x] Imperial pricing ($/lb, $/fl oz)
- [x] Inline editing на цени в recipe detail
- [x] useUserPricesStore с AsyncStorage persistence

### 🔗 Database поправки
- [x] Split queries за recipe_instruction_steps (няма FK)
- [x] hero_image_url вместо image_url в ready_recipes
- [x] name_bg/name_en вместо name в ready_recipes
- [x] category_id + JOIN към ingredient_categories (не category)
- [x] Explicit select колони в base_recipes (без bake_temp_celsius)
- [x] RLS + FK constraint премахнати за development без auth

---

## 🐛 ИЗВЕСТНИ БЪГОВЕ
- [ ] "Encountered two..." грешка в Builder-а при смяна на роли (React key duplicate)
- [ ] Splash screen лого не се вижда в Expo Go (нормално — изисква production build)
- [ ] Assembly template fallback показва грешен шаблон при множество съвпадения

---

## 🚀 ОСТАВАЩО (To-Do)

### 🛠️ Административен панел & Backend
- [ ] Batch Translation: Превод на 111 стъпки на английски (Admin + OpenAI)
- [ ] Data Cleanup: Инструмент за дедупликация на съставки (задание подготвено)
- [ ] Batch Generation: AI генериране на стъпки за 12 рецепти с малко стъпки
- [ ] SQL Fix: Замяна на "18 см" в 23 стъпки (SQL подготвен, preview направен)

### 🧪 Тестване & Полиране
- [ ] Localization: Превод на 5-те assembly_templates на БГ (instructions_bg)
- [ ] Image Picker: Тестване на upload в builder при създаване на рецепта
- [ ] Profile Screen: Почистване на hardcoded цветове и auth логика

### 🚀 Launch подготовка
- [ ] Google Developer акаунт ($25)
- [ ] Apple Developer акаунт ($99/год)
- [ ] Домейн: blagocake.app ($19/год) — КУПЕН
- [ ] Privacy Policy страница
- [ ] Landing page на blagocake.app
- [ ] Скрийншоти за Store (5-8 броя)
- [ ] Икона 512×512 от Logo-Blago.png
- [ ] Описание BG + EN за Store
- [ ] EAS Build setup (eas build --platform android)
- [ ] Vercel deploy за Admin панел + Landing page

---

## 📊 Ключови числа
- base_recipes: 73
- recipe_instruction_steps: 660 (549 с EN, 111 без)
- ingredients_database: 156
- ready_recipes: 10 (3 published + 7 draft)
- assembly_templates: 5
- ingredient_categories: 11