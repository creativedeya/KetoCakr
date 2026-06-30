# Fix: parse-ingredients route — name → name_bg

## File
`Admin/app/api/simple-recipes/parse-ingredients/route.ts`

## Problems
1. Query uses `name` but ingredients_database column is `name_bg`
2. "Лайм (сок)" parsed as бр instead of мл — Claude prompt needs better unit rules
3. Piece units like бр need default_piece_weight_grams to calculate weight

## str_replace

### Fix 1: Column name in Supabase query

OLD:
```typescript
      const { data: matches } = await supabase
        .from('ingredients_database')
        .select('id, name, name_en, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g, is_sugar_alcohol, default_piece_weight_grams')
        .or(`name.ilike.%${item.ingredient_name}%,name_en.ilike.%${item.ingredient_name_en || item.ingredient_name}%`)
        .limit(1);

      const match = matches?.[0] || null;

      return {
        ingredient_name: match?.name || item.ingredient_name,
```
NEW:
```typescript
      const { data: matches } = await supabase
        .from('ingredients_database')
        .select('id, name_bg, name_en, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g, is_sugar_alcohol, default_piece_weight_grams')
        .or(`name_bg.ilike.%${item.ingredient_name}%,name_en.ilike.%${item.ingredient_name_en || item.ingredient_name}%`)
        .limit(1);

      const match = matches?.[0] || null;

      return {
        ingredient_name: match?.name_bg || item.ingredient_name,
```

### Fix 2: Improve Claude prompt for better unit detection

OLD:
```typescript
        content: `Parse this ingredient list into structured JSON.
Input text:
${text}

Respond ONLY with a JSON array, no markdown, no explanation:
[
  {
    "ingredient_name": "Бадемово брашно",
    "ingredient_name_en": "Almond flour",
    "quantity": 100,
    "unit": "g"
  }
]

Rules:
- ingredient_name: Bulgarian name (translate if needed)
- ingredient_name_en: English name (translate if needed)  
- quantity: numeric value only
- unit: normalize to one of: g, г, ml, мл, бр, tsp, ч.л., tbsp, с.л., cup, kg, l
- If unit is unclear, default to "g"
- If quantity is unclear, default to 100
- Split combined entries into separate items`
```
NEW:
```typescript
        content: `Parse this ingredient list into structured JSON.
Input text:
${text}

Respond ONLY with a JSON array, no markdown, no explanation:
[
  {
    "ingredient_name": "Бадемово брашно",
    "ingredient_name_en": "Almond flour",
    "quantity": 100,
    "unit": "g"
  }
]

Rules:
- ingredient_name: Bulgarian name (translate if needed)
- ingredient_name_en: English name (translate if needed)
- quantity: numeric value only (no fractions like 1.5 for pieces — round to nearest whole number for бр)
- unit: normalize using these rules:
  * weights (г, грама, грам, g, гр) → "g"
  * liquids (мл, ml, милилитра) → "ml"
  * teaspoon (ч.л., ч.л, чаена лъжица, tsp) → "tsp"
  * tablespoon (с.л., с.л, супена лъжица, tbsp) → "tbsp"
  * cup (чаша, cup) → "cup"
  * kg/л → "kg" or "l"
  * pieces/whole items (бр, броя, бройки, piece, шт) → "бр" ONLY for whole countable items like eggs, avocados, lemons
  * liquids/juices/extracts should NEVER be "бр" — use ml or tsp instead
  * "сок от лайм" or "лимонов сок" → use ml, not бр
  * If unit mentions "на вкус" or "по желание" → use "g" with quantity 1
- If unit is unclear, default to "g"
- If quantity is unclear, default to 100
- Split combined entries into separate items
- IMPORTANT: juice, extract, oil, sauce = liquid unit (ml/tsp/tbsp), never бр`
```

---

## Also fix: SQL migration for default_piece_weight_grams

If not already run, execute in Supabase SQL Editor:

```sql
-- Add column if not exists
ALTER TABLE ingredients_database
ADD COLUMN IF NOT EXISTS default_piece_weight_grams numeric(8,2) null;

-- Populate common ingredients (uses name_bg column)
UPDATE ingredients_database SET default_piece_weight_grams = 50  WHERE name_bg ILIKE '%яйц%';
UPDATE ingredients_database SET default_piece_weight_grams = 200 WHERE name_bg ILIKE '%авокадо%';
UPDATE ingredients_database SET default_piece_weight_grams = 150 WHERE name_bg ILIKE '%лук%' AND name_bg NOT ILIKE '%праз%' AND name_bg NOT ILIKE '%зелен%';
UPDATE ingredients_database SET default_piece_weight_grams = 80  WHERE name_bg ILIKE '%праз%';
UPDATE ingredients_database SET default_piece_weight_grams = 100 WHERE name_bg ILIKE '%ябълк%';
UPDATE ingredients_database SET default_piece_weight_grams = 120 WHERE name_bg ILIKE '%банан%';
UPDATE ingredients_database SET default_piece_weight_grams = 200 WHERE name_bg ILIKE '%портокал%';
UPDATE ingredients_database SET default_piece_weight_grams = 60  WHERE name_bg ILIKE '%лимон%' AND name_bg NOT ILIKE '%сок%';
UPDATE ingredients_database SET default_piece_weight_grams = 50  WHERE name_bg ILIKE '%лайм%' AND name_bg NOT ILIKE '%сок%' AND name_bg NOT ILIKE '%кор%';
UPDATE ingredients_database SET default_piece_weight_grams = 5   WHERE name_bg ILIKE '%скилидк%';
UPDATE ingredients_database SET default_piece_weight_grams = 30  WHERE name_bg ILIKE '%чесн%' AND name_bg NOT ILIKE '%скилид%';

-- Verify
SELECT name_bg, default_piece_weight_grams
FROM ingredients_database
WHERE default_piece_weight_grams IS NOT NULL
ORDER BY name_bg;
```

---

## Verify after fix

Paste this text in Bulk Parse:
```
- 2 авокадо
- 250 мл течна сметана
- 70г еритритол на прах
- сок от 1.5 лайма
- 1 връзка мента
- щипка сол
```

Expected results:
- Авокадо → 2 бр, matched ✅, shows piece weight
- Течна сметана → 250 ml, matched ✅
- Еритритол → 70 g, matched ✅
- Лайм (сок) → ~30 ml (NOT бр), matched or unmatched
- Мента → 1 бр или g, matched ✅
- Сол → 1 g, matched ✅
