# 🐛 Bug Report: Claude API JSON Truncation в PDF Parser

**Issue ID:** BUG-004  
**Severity:** HIGH  
**Status:** FIXED  
**Reported:** 2026-06-02  
**Last Updated:** 2026-06-02  

---

## Description

Claude API съкращава JSON отговора в средата на array при парсиране на рецепти. `JSON.parse()` хвърля SyntaxError и целият batch се губи.

---

## Steps to Reproduce

1. Изпрати batch текст с 3+ рецепти към Claude API
2. Claude връща JSON array, но съкращава последния обект наполовина
3. `JSON.parse(response)` хвърля SyntaxError

**Expected Result:** `[{recipe1}, {recipe2}, {recipe3}]`  
**Actual Result:** `[{recipe1}, {recipe2}, {recipe3: {name: "Торта", steps: [{step_num`

---

## Environment

- **Platform:** Admin (Next.js API route / pdfParser.ts)
- **Model:** claude-opus-4-5
- **Original max_tokens:** 8000

---

## Root Cause Analysis

Batch от 10000 chars текст може да генерира повече от 8000 токена JSON. Ако отговорът достигне max_tokens лимита, Claude спира на произволно място.

---

## Solution / Fix

Двустепенен fix:

**1. Увеличен max_tokens от 8000 → 16000:**
```typescript
max_tokens: 16000
```

**2. Многостепенен JSON fallback при truncation:**
```typescript
// Step 1: намери JSON array
let jsonStr = text.match(/\[[\s\S]*\]/)?.[0];

// Step 2: ако е truncated — recover само завършените обекти
if (!jsonStr || !isValidJSON(jsonStr)) {
  const objects = [...text.matchAll(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g)]
    .map(m => m[0])
    .filter(o => isValidJSON(o));
  jsonStr = `[${objects.join(',')}]`;
}
```

---

## Testing / Verification

- [x] Fix тестван с 20-рецепти PDF
- [x] Truncated batches се recover-ват частично вместо да се губят изцяло
- [x] JSON.parse грешки са елиминирани

---

## Related Issues

- Part of: FEAT-002 (PDF Recipe Importer)
- Related: BUG-003 (батч подход е причина за truncation риска)
- Related: BUG-005 (quantity parsing — следващ проблем след JSON fix)

---

*Template: KetoCakR DevLog System*
