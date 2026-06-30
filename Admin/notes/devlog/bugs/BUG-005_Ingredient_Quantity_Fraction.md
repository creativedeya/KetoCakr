# 🐛 Bug Report: Ingredient Quantity Fraction Type Error

**Issue ID:** BUG-005  
**Severity:** HIGH  
**Status:** FIXED  
**Reported:** 2026-06-02  
**Last Updated:** 2026-06-02  

---

## Description

Claude API връща количества като текстови дроби ("1/4", "1 1/2", "½"). Supabase отхвърля insert в `recipe_ingredients.quantity` (numeric колона), защото стрингът не е валидно число. Всички съставки се вмъкват с NULL quantity или insert-ът се проваля изцяло.

---

## Steps to Reproduce

1. Импортирай рецепта с "1/4 ч.л. сол" от PDF
2. Claude връща `quantity: "1/4"`
3. Execute route прави insert: `quantity: "1/4" || ''` → `"1/4"`
4. Supabase отхвърля — numeric колона не приема string

**Expected Result:** `quantity: 0.25` в базата  
**Actual Result:** Insert грешка или `quantity: null`

---

## Environment

- **Platform:** Admin (Next.js API route — execute/route.ts)
- **Database column:** `recipe_ingredients.quantity` (numeric)
- **Claude model:** claude-opus-4-5

---

## Root Cause Analysis

Оригиналният код използваше `ing.quantity || ''` — при null/undefined quantity, стойността ставаше `''` (empty string), което numeric колоната отхвърля. Дори при валидна стойност като "1/4", JS не конвертира дроби автоматично.

---

## Solution / Fix

`parseQuantity()` helper функция в execute/route.ts:

```typescript
function parseQuantity(qty: string): number | null {
  if (!qty || qty.trim() === '') return null;
  const trimmed = qty.trim();

  // "1 1/2" → 1.5
  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    return parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3]);
  }

  // "1/4" → 0.25
  const fractionMatch = trimmed.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    return parseInt(fractionMatch[1]) / parseInt(fractionMatch[2]);
  }

  // "100" → 100
  const num = parseFloat(trimmed);
  return isNaN(num) ? null : num;
}

// Usage:
quantity: parseQuantity(ing.quantity),
```

---

## Testing / Verification

- [x] "1/4" → 0.25
- [x] "1 1/2" → 1.5
- [x] "" → null
- [x] "100" → 100
- [x] Insert в Supabase успешен за всички формати

---

## Related Issues

- Part of: FEAT-002 (PDF Recipe Importer)

---

*Template: KetoCakR DevLog System*
