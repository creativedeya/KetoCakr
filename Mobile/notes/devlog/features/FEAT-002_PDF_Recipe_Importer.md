# ✨ Feature: PDF Recipe Importer

**Feature ID:** FEAT-002  
**Priority:** HIGH  
**Status:** COMPLETED  
**Started:** 2026-06-02  
**Target:** v1.0.0

---

## Overview

Пълен pipeline за импортиране на рецепти от PDF файл директно в KetoCakR базата данни. PDF се качва на Admin панела, текстът се екстрактира с pdfjs-dist, изпраща се на Claude API за парсиране, и рецептите автоматично се добавят в `base_recipes`, `recipe_instruction_steps`, `recipe_ingredients` с автоматично линкване на съставки и изчисляване на хранителни стойности.

---

## User Story

As an **Admin**, I want **to import a PDF cookbook**, so that **recipes are automatically available in the mobile app without manual data entry**.

---

## Requirements

- [x] Chunked PDF upload (5MB chunks) — без 413 грешки
- [x] Text extraction от PDF с pdfjs-dist (v3.11.174, legacy build)
- [x] Y-позиция групиране за реконструкция на визуални редове
- [x] Claude API парсиране (claude-opus-4-5, max_tokens 16000) — поддръжка на кирилица
- [x] Batch processing — PDF текст → 10000-char батчове по page boundaries
- [x] Robust JSON parsing — regex екстракция + truncated fallback
- [x] `parseQuantity()` — конвертира "1/4", "1 1/2", "" → numeric
- [x] Insert в `base_recipes`, `recipe_instruction_steps`, `recipe_ingredients`
- [x] Auto ingredient matching (fuzzy, Levenshtein threshold 0.35)
- [x] Auto nutrition calculation + `ready_recipes` създаване

---

## Technical Details

### Architecture

```
PDF Upload (chunks) → pdfjs-dist text extraction → splitIntoBatches(10000 chars)
→ Claude API (per batch) → JSON parse + truncation recovery
→ base_recipes insert → recipe_instruction_steps insert → recipe_ingredients insert
→ /api/simple-recipes/[id]/match-ingredients → /api/simple-recipes/[id]/publish
```

### Components

- `Admin/utils/pdfParser.ts` — PDF текст екстракция + Claude API парсиране
- `Admin/app/api/pdf-import/upload-chunk/route.ts` — chunked upload handler
- `Admin/app/api/pdf-import/parse/route.ts` — извиква parsePDFRecipes()
- `Admin/app/api/pdf-import/execute/route.ts` — DB insert + auto-match + auto-publish
- `Admin/app/api/simple-recipes/[id]/match-ingredients/route.ts` — fuzzy ingredient linking
- `Admin/app/api/simple-recipes/[id]/publish/route.ts` — nutrition calc + ready_recipes

### Database Changes

Без schema промени. Попълва съществуващи таблици:
- `base_recipes` — is_simple_recipe: true
- `recipe_instruction_steps`
- `recipe_ingredients`
- `ready_recipes` — auto-created, status: 'draft'

---

## Tasks

- [x] PDF upload (chunked)
- [x] Text extraction (pdfjs-dist)
- [x] Claude API парсиране + JSON robustness
- [x] DB populate (3 таблици)
- [x] Ingredient matching route
- [x] Nutrition + ready_recipes publish route
- [ ] Тест с 20+ рецепти PDF
- [ ] Error recovery UI (partial import feedback)

---

## Related Issues

- Fixes: BUG-002 (pdfjs word-per-line), BUG-003 (413 Too Large), BUG-004 (JSON truncation), BUG-005 (fraction quantities)

---

## Known Limitations

- `image_url` е празен за всички импортирани рецепти — добавя се ръчно
- `dessert_type_id` е NULL — задава се ръчно
- `status` = 'draft' в ready_recipes — публикува се ръчно
- OCR артефакти (ĸ вместо к) — Claude поправя повечето, не всички
- Fuzzy match може да линкне грешна съставка — ръчна корекция в edit page

---

*Template: KetoCakR DevLog System*
