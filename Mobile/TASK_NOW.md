# 🔧 ЗАДАНИЕ ЗА CLAUDE CODE — User Recipe Image Upload

> **Проект:** KetoCakR Mobile App
> **Дата:** 07.03.2026

---

## ⚠️ КРИТИЧНИ ПРАВИЛА

1. Прочети `CLAUDE.md`
2. НИКОГА hardcoded цветове — `constants/Colors.ts`
3. `expo-image-picker` Е ИНСТАЛИРАН — просто го импортирай
4. `git add . && git commit -m "WIP before image upload"` ПРЕДИ да започнеш

---

## 📊 ВЕЧЕ НАПРАВЕНО В БАЗАТА

```sql
-- Колона в user_recipes:
user_image_url TEXT NULL

-- Supabase Storage bucket:
-- Име: user-recipe-images
-- Public: true
-- Policies: anonymous upload + public read
```

---

## 📋 ЗАДАЧИ (3 задачи)

---

### ЗАДАЧА 1: Image Upload helper

**Създай файл:** `lib/imageUpload.ts`

```typescript
import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';

export async function pickImage(source: 'camera' | 'gallery'): Promise<string | null> {
  if (source === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return null;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (result.canceled) return null;
    return result.assets[0].uri;
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return null;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (result.canceled) return null;
    return result.assets[0].uri;
  }
}

export async function uploadRecipeImage(uri: string, recipeId: string): Promise<string | null> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileExt = uri.split('.').pop() || 'jpg';
    const fileName = `${recipeId}_${Date.now()}.${fileExt}`;
    const filePath = `recipes/${fileName}`;

    const { error } = await supabase.storage
      .from('user-recipe-images')
      .upload(filePath, blob, { contentType: `image/${fileExt}`, upsert: true });

    if (error) {
      console.error('Upload error:', error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('user-recipe-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (err) {
    console.error('Upload failed:', err);
    return null;
  }
}

export async function updateRecipeImage(recipeId: string, imageUrl: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_recipes')
    .update({ user_image_url: imageUrl })
    .eq('id', recipeId);
  return !error;
}
```

---

### ЗАДАЧА 2: Бутон за снимка в User Recipe Detail

**Файл:** `app/user-recipe/[id].tsx` и/или `components/RecipeDetailView.tsx`

Когато рецептата е **user_recipe** (НЕ ready_recipe), добави малък floating бутон за снимка върху hero image:

```
┌─────────────────────────────────┐
│                                 │
│   [Hero Image]                  │
│                        [📷]     │  ← бутон горе-дясно
│                                 │
└─────────────────────────────────┘
```

**При натискане на 📷:** Покажи Alert с 3 опции:
- "Камера" / "Camera"
- "Галерия" / "Gallery"  
- "Откажи" / "Cancel"

**След избор на снимка:**
1. Покажи loading indicator
2. `uploadRecipeImage(uri, recipeId)` → качва в Supabase Storage
3. `updateRecipeImage(recipeId, publicUrl)` → записва URL в базата
4. Refresh данните (invalidate React Query)
5. Новата снимка се показва като hero image

**Как RecipeDetailView разбира дали е user_recipe:**
- Добави prop `allowImageUpload?: boolean`
- `user-recipe/[id].tsx` подава `allowImageUpload={true}`
- `recipe-detail/[id].tsx` подава `allowImageUpload={false}` (или не подава)

**Стил на бутона:**
- Позиция: absolute, top-right на hero image
- Background: `rgba(0,0,0,0.5)` с `BorderRadius.round`
- Икона: `Ionicons camera`, бяла, `IconSize.md`
- Размер: 40×40

**Двуезичност:**
- BG: "Добави снимка", "Камера", "Галерия", "Откажи", "Снимката е качена!"
- EN: "Add photo", "Camera", "Gallery", "Cancel", "Photo uploaded!"

---

### ЗАДАЧА 3: Снимка при създаване в Recipe Builder

**Файл:** `app/(modals)/visual-recipe-builder.tsx`

Добави **опционална** стъпка за снимка СЛЕД избора на компоненти, ПРЕДИ финалния запис:

```
┌─────────────────────────────────┐
│   [Снимка placeholder]          │
│                                 │
│   📷 Камера    🖼️ Галерия      │
│                                 │
│   Можеш да добавиш снимка      │
│   и по-късно                    │
└─────────────────────────────────┘
```

**Логика:**
1. Потребителят избира снимка (или пропуска)
2. При запис на рецептата:
   - Ако има снимка → качи в Storage → запиши URL в `user_image_url`
   - Ако няма → `user_image_url` остава NULL
3. Текстът "Можеш да добавиш снимка и по-късно" успокоява потребителя

**Двуезичност:** Добави ключове в bg.ts и en.ts.

---

## ✅ КРИТЕРИИ ЗА ГОТОВО

- [ ] `lib/imageUpload.ts` създаден
- [ ] User recipe detail: 📷 бутон върху hero image
- [ ] Camera и Gallery работят
- [ ] Снимка се качва в Supabase Storage
- [ ] `user_image_url` се обновява в базата
- [ ] Hero image се обновява след upload
- [ ] 📷 бутон НЕ се показва за ready_recipes
- [ ] Builder: опционална стъпка за снимка
- [ ] Двуезичност
- [ ] Git commit

---

## 🔍 СЛЕД ПРИКЛЮЧВАНЕ КАЖИ МИ:

1. expo-image-picker работи ли без проблеми?
2. Upload към Supabase Storage успешен ли е?
3. Какви файлове създаде/промени?