# KetoCakR Mobile App

## Проект
Мобилно приложение за кето десерти. Бранд: BLAGO.

## Tech Stack
- React Native 0.81 + Expo SDK 54 + TypeScript
- Expo Router (file-based navigation)
- Supabase (PostgreSQL backend)
- @tanstack/react-query за data fetching
- Zustand за state management
- @expo/vector-icons за икони (НЕ lucide-react-native!)

## Критични правила
- ВИНАГИ импортирай цветове от constants/Colors.ts
- ВИНАГИ импортирай Typography/Spacing/BorderRadius/Shadows/IconSize от constants/Theme.ts
- НИКОГА не пиши hardcoded цветове (#A80048) в компоненти
- НИКОГА не инсталирай нови npm пакети без одобрение
- Използвай --legacy-peer-deps при npm install
- За икони: САМО @expo/vector-icons (Ionicons, MaterialCommunityIcons, Feather)
- НЕ използвай NativeWind/Tailwind — само StyleSheet
- НЕ използвай lucide-react-native (dependency конфликти)
- НЕ добавяй user authentication — засега работим без auth
- НЕ прави expo prebuild или native builds — само Expo Go

## Структура
- app/ — екрани (Expo Router)
- components/ — споделени компоненти
- constants/ — Colors.ts, Theme.ts (дизайн система)
- lib/ — supabase.ts client
- store/ — Zustand stores

## Supabase ключови таблици
- base_recipes — базови рецепти (компоненти на торти)
- user_recipes — потребителски комбинации (пъзел от компоненти)
- dessert_types — типове десерти (Торти, Чийзкейкове, Тарти...)
- recipe_roles — роли: Блат(1), Крем(2), Плънка(3), Декор(4)
- ingredients_database — 156 съставки с nutritional data
- recipe_ingredients — съставки в рецепта (FK→base_recipes)
- recipe_instruction_steps — стъпки за приготвяне (BG + EN)
- - ready_recipes — готови рецепти от администратора (status: draft/published/archived, is_featured, hero_image_url, name_bg/name_en, nutritional data)

## Бранд цветове (от Colors.ts)
- Primary: #A80048 (Ruby Red) — акценти, бутони
- Secondary: #B2AC88 (Warm Beige) — второстепенни елементи
- Background: #FFFFFF (primary), #F8F9FA (secondary), #FFF5F8 (accent)
- Text: #333333 (primary), #666666 (secondary)

## Пълно задание
Виж CLAUDE_CODE_TASK.md за детайлно описание на всички фази и екрани.
