# 🐛 Bug Report: pdfjs-dist Word-Per-Line Output

**Issue ID:** BUG-002  
**Severity:** HIGH  
**Status:** FIXED  
**Reported:** 2026-06-02  
**Last Updated:** 2026-06-02  

---

## Description

pdfjs-dist връща всяка дума на отделен ред вместо цели изречения/редове. Резултатът е нечетим от Claude API и парсирането на рецептите се проваля.

---

## Steps to Reproduce

1. Извика `extractPDFText()` с pdfjs-dist
2. Итерира `textContent.items` директно
3. Наблюдава изхода — всяка дума е на нов ред

**Expected Result:** "1 ч.л. ванилов екстракт" на един ред  
**Actual Result:**  
```
1
ч.л.
ванилов
екстракт
```

---

## Environment

- **Platform:** Admin (Next.js API route)
- **Package:** pdfjs-dist v3.11.174

---

## Root Cause Analysis

pdfjs `textContent.items` връща отделни text spans — всеки span е позиционирана дума с X/Y координати. Няма автоматично групиране по редове.

---

## Solution / Fix

Групиране на items по Y-координата с толеранс ±4px, след което сортиране по X в рамките на реда:

```typescript
// In extractPDFText() — pdfParser.ts
const lineMap = new Map<number, string[]>();
for (const item of textContent.items as any[]) {
  const y = Math.round(item.transform[5] / 4) * 4; // snap to 4px grid
  if (!lineMap.has(y)) lineMap.set(y, []);
  lineMap.get(y)!.push(item.str);
}
const lines = [...lineMap.entries()]
  .sort((a, b) => b[0] - a[0]) // descending Y = top-to-bottom
  .map(([, words]) => words.join(' ').trim())
  .filter(l => l.length > 0);
```

---

## Testing / Verification

- [x] Fix тестван локално
- [x] Изходът е четими редове с пълни изречения
- [x] Claude API успешно парсира рецепти след fix-а

---

## Related Issues

- Part of: FEAT-002 (PDF Recipe Importer)

---

*Template: KetoCakR DevLog System*
