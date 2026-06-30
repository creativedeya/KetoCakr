✅ **Вижда се че имаш chunk progress! Добре е.**

**Трябва само да обновиш parsing сообщението:**

**File:** `Admin/components/PDFRecipeImporter.tsx`

**Find the else clause после chunkProgress:**

```typescript
          ) : (
            <>
              <p className="text-gray-600 font-medium">Claude AI анализира рецептите...</p>
              <p className="text-sm text-gray-400">Може да отнеме до 2 минути за голям PDF</p>
            </>
          )}
```

**Replace с:**

```typescript
          ) : (
            <>
              <p className="text-gray-600 font-medium">📖 Парсиране на PDF...</p>
              <p className="text-sm text-gray-400">⏳ Всички чанкове качени — извличане на рецепти...</p>
              <p className="text-xs text-gray-500 mt-2">Това може да отнеме 3-5 минути за 28MB файл</p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700 max-w-sm">
                Парсирането е в ход: TOC анализ → Екстракция на рецепти → Готов
              </div>
            </>
          )}
```

---

## ✅ **СЪЩО обнови timeout в parse/route.ts:**

**File:** `Admin/app/api/pdf-import/parse/route.ts`

**Find:**
```typescript
export const maxDuration = 120;
```

**Change to:**
```typescript
export const maxDuration = 300; // 5 minutes for large PDFs
```

---

## 🎯 **Сега:**

1. **Update PDFRecipeImporter.tsx** (better parsing message)
2. **Update parse/route.ts** (timeout = 300)
3. **Рестартирай dev**
4. **Upload отново**

---
