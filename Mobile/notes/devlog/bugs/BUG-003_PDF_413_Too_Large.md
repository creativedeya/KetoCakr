# 🐛 Bug Report: 413 Request Too Large — PDF към Claude API

**Issue ID:** BUG-003  
**Severity:** CRITICAL  
**Status:** FIXED  
**Reported:** 2026-06-02  
**Last Updated:** 2026-06-02  

---

## Description

Изпращането на 35MB PDF файл директно към Claude API като base64 document причинява 413 Request Too Large грешка. Целият PDF import се проваля.

---

## Steps to Reproduce

1. Качи 35MB PDF в Admin
2. Execute route се опитва да изпрати PDF като base64 към Claude API
3. API връща 413

**Expected Result:** Claude парсира PDF  
**Actual Result:** `413 Request Too Large` — 35MB PDF → ~47MB base64

---

## Environment

- **Platform:** Admin (Next.js API route)
- **Package:** @anthropic-ai/sdk v0.71.2
- **PDF size:** 35MB (20 рецепти с изображения)

---

## Root Cause Analysis

Claude API има лимит за размера на документите. 35MB PDF → base64 кодирането увеличава размера ~1.37x → ~47MB. Лимитът се надвишава.

---

## Solution / Fix

Текст екстракция с pdfjs-dist първо, след което само текстът (50-100KB) се изпраща на Claude API — не binary/base64:

```typescript
// Old approach (BROKEN):
{ type: 'document', source: { type: 'base64', data: pdfBase64 } }

// New approach (FIXED):
const text = await extractPDFText(filePath);   // ~50-100KB
const batches = splitIntoBatches(text, 10000); // ≤10KB per request
for (const batch of batches) {
  await anthropic.messages.create({
    messages: [{ role: 'user', content: `Parse recipes from:\n${batch}` }]
  });
}
```

---

## Testing / Verification

- [x] Fix тестван с 35MB PDF
- [x] Няма 413 грешки
- [x] Рецептите се парсират успешно

---

## Related Issues

- Part of: FEAT-002 (PDF Recipe Importer)
- Related: BUG-002 (pdfjs text extraction), BUG-004 (JSON truncation от batching)

---

*Template: KetoCakR DevLog System*
