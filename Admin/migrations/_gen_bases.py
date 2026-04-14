"""
_gen_bases.py
Generates SQL migration files 50-55 for Base recipes (recipe_role_id = 1)
Source: Marketing/Recipes/Base.md
"""
import sys, re, json, os
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8')

# ─── Config ────────────────────────────────────────────────────────────────
ROOT = Path("C:/Dev/KetoCakr")
BASE_MD = ROOT / "Marketing/Recipes/Base.md"
ENV_FILE = ROOT / "Admin/.env.local"
OUT_DIR = ROOT / "Admin/migrations"
JSON_OUT = OUT_DIR / "bases_structured.json"
DATE = "2026-04-07"
ROLE_ID = 1

# ─── Load API key ───────────────────────────────────────────────────────────
api_key = None
for line in ENV_FILE.read_text(encoding='utf-8').splitlines():
    if line.startswith("OPENAI_API_KEY="):
        api_key = line.split("=", 1)[1].strip().strip('"')
        break
if not api_key:
    raise RuntimeError("OPENAI_API_KEY not found in Admin/.env.local")
print(f"✅ API key loaded (...{api_key[-6:]})")

from openai import OpenAI
client = OpenAI(api_key=api_key)

# ─── Load source ────────────────────────────────────────────────────────────
raw_lines = BASE_MD.read_text(encoding='utf-8').splitlines()
print(f"✅ Base.md loaded ({len(raw_lines)} lines)\n")

def get_lines(start, end):
    return '\n'.join(raw_lines[start-1:end])

# ─── Recipe definitions (from ACTIVE_TASK.md) ──────────────────────────────
recipes = [
    # GROUP 1: Airy bases + variants
    {"name": "Базов въздушен кето блат", "name_en": "Basic Airy Keto Base",
     "line_start": 1, "line_end": 52, "is_variant": False,
     "difficulty": 3, "prep": 25, "bake": 40},
    {"name": "Шоколадов пандишпан", "name_en": "Chocolate Sponge Cake",
     "line_start": 53, "line_end": 56, "is_variant": True,
     "variant_of": "Базов въздушен кето блат",
     "difficulty": 3, "prep": 25, "bake": 40},
    {"name": "Брауни пандишпан", "name_en": "Brownie Sponge",
     "line_start": 57, "line_end": 63, "is_variant": True,
     "variant_of": "Базов въздушен кето блат",
     "difficulty": 3, "prep": 25, "bake": 40},
    {"name": "Цитрусов пандишпан", "name_en": "Citrus Sponge Cake",
     "line_start": 64, "line_end": 67, "is_variant": True,
     "variant_of": "Базов въздушен кето блат",
     "difficulty": 2, "prep": 25, "bake": 40},
    {"name": "Пандишпан с горски плодове", "name_en": "Berry Sponge Cake",
     "line_start": 68, "line_end": 73, "is_variant": True,
     "variant_of": "Базов въздушен кето блат",
     "difficulty": 2, "prep": 30, "bake": 40},
    {"name": "Орехов пандишпан", "name_en": "Walnut Sponge Cake",
     "line_start": 74, "line_end": 77, "is_variant": True,
     "variant_of": "Базов въздушен кето блат",
     "difficulty": 2, "prep": 25, "bake": 40},

    # GROUP 2: Cake-style bases + variants
    {"name": "Базов кето кекс", "name_en": "Basic Keto Cake",
     "line_start": 81, "line_end": 119, "is_variant": False,
     "difficulty": 2, "prep": 20, "bake": 40},
    {"name": "Шоколадов кекс", "name_en": "Chocolate Cake",
     "line_start": 120, "line_end": 123, "is_variant": True,
     "variant_of": "Базов кето кекс",
     "difficulty": 2, "prep": 20, "bake": 40},
    {"name": "Брауни кекс", "name_en": "Brownie Cake",
     "line_start": 124, "line_end": 127, "is_variant": True,
     "variant_of": "Базов кето кекс",
     "difficulty": 2, "prep": 20, "bake": 40},
    {"name": "Кекс с горски плодове", "name_en": "Berry Cake",
     "line_start": 128, "line_end": 133, "is_variant": True,
     "variant_of": "Базов кето кекс",
     "difficulty": 2, "prep": 20, "bake": 40},
    {"name": "Цитрусов кекс", "name_en": "Citrus Cake",
     "line_start": 134, "line_end": 137, "is_variant": True,
     "variant_of": "Базов кето кекс",
     "difficulty": 2, "prep": 20, "bake": 40},
    {"name": "Орехов кекс", "name_en": "Walnut Cake",
     "line_start": 138, "line_end": 141, "is_variant": True,
     "variant_of": "Базов кето кекс",
     "difficulty": 2, "prep": 20, "bake": 40},

    # GROUP 3: Individual specialized recipes
    {"name": "Кокосов блат", "name_en": "Coconut Base",
     "line_start": 145, "line_end": 182, "is_variant": False,
     "difficulty": 2, "prep": 20, "bake": 28},
    {"name": "Ванилов блат", "name_en": "Vanilla Base",
     "line_start": 184, "line_end": 228, "is_variant": False,
     "difficulty": 2, "prep": 20, "bake": 33},
    {"name": "Лимонов блат", "name_en": "Lemon Base",
     "line_start": 229, "line_end": 274, "is_variant": False,
     "difficulty": 2, "prep": 20, "bake": 33},
    {"name": "Морковен блат", "name_en": "Carrot Base",
     "line_start": 275, "line_end": 323, "is_variant": False,
     "difficulty": 2, "prep": 25, "bake": 40},
    # NOTE: line_end 364 to avoid capturing Matcha/Red Velvet recipes
    {"name": "Маслен морковен блат", "name_en": "Butter Carrot Base",
     "line_start": 324, "line_end": 364, "is_variant": False,
     "difficulty": 2, "prep": 25, "bake": 45},
    {"name": "Шоколадов блат Rich", "name_en": "Rich Chocolate Base",
     "line_start": 498, "line_end": 543, "is_variant": False,
     "difficulty": 2, "prep": 20, "bake": 45},
    {"name": "Бадемов блат Swedish Style", "name_en": "Swedish Almond Base",
     "line_start": 582, "line_end": 615, "is_variant": False,
     "difficulty": 2, "prep": 20, "bake": 23},
    {"name": "Блат Гараш", "name_en": "Garash Base",
     "line_start": 616, "line_end": 652, "is_variant": False,
     "difficulty": 3, "prep": 20, "bake": 11},
    {"name": "Брауни блат без брашно", "name_en": "Flourless Brownie Base",
     "line_start": 653, "line_end": 688, "is_variant": False,
     "difficulty": 2, "prep": 20, "bake": 38},
    {"name": "Блат Сахер", "name_en": "Sacher Base",
     "line_start": 689, "line_end": 732, "is_variant": False,
     "difficulty": 3, "prep": 25, "bake": 38},
]


# ─── Helpers ────────────────────────────────────────────────────────────────
def esc(text):
    return str(text).replace("'", "''") if text else ''

def clean(text):
    text = re.sub(r'[*_#`]', '', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

ING_STOP_PATTERNS = [
    r'^Начин на приготвяне', r'^Професионален начин', r'^👨',
    r'^Шеф трик', r'^Шеф съвет', r'^Важно:', r'^Шеф Техника',
    r'^\*\*', r'^##', r'^  \*', r'^-\s*Рецепта', r'^\s*Рецепта:',
    r'^💡', r'^🛠', r'^📝'
]

def is_ingredient_line(line):
    stripped = line.strip()
    if not stripped or len(stripped) < 4:
        return False
    if len(stripped) > 200:
        return False
    for pat in ING_STOP_PATTERNS:
        if re.match(pat, stripped):
            return False
    return True

def extract_ingredients(text):
    # Find "Продукти:" section
    m = re.search(r'Продукти:\s*\n(.*?)(?=Начин на приготвяне|Професионален начин|👨|$)',
                  text, re.DOTALL | re.IGNORECASE)
    if not m:
        return []
    raw = m.group(1)
    lines = []
    for line in raw.splitlines():
        stripped = line.strip()
        if is_ingredient_line(stripped):
            # Skip sub-headers like "За белтъчния сняг (Меренг):"
            if re.match(r'^За [А-Я].*:$', stripped) and len(stripped) < 60:
                continue
            if re.match(r'^Сухи съставки \(', stripped):
                continue
            lines.append(stripped)
    return lines

def extract_steps(text):
    # Try multiple step section headers
    m = re.search(
        r'(?:👨‍🍳\s*Професионални стъпки за приготвяне|Начин на приготвяне|Професионален начин на приготвяне)\s*:\s*\n(.*?)(?=\*\*Варианти|Шеф трик|💡|🛠|📝|$)',
        text, re.DOTALL | re.IGNORECASE
    )
    if not m:
        return []
    raw = m.group(1).strip()
    # Split on blank lines → each paragraph is a step
    paragraphs = [p.strip() for p in re.split(r'\n{2,}', raw) if p.strip() and len(p.strip()) > 15]
    # Clean markdown
    steps = [clean(p) for p in paragraphs if not re.match(r'^\s*\*\*', p)]
    return steps[:12]  # max 12 steps

def extract_notes(text):
    notes = []
    # Шеф трик / Шеф съвет / Важно / Текстура / Логика / App Advice
    patterns = [
        r'(Шеф трик[^:]*|Шеф съвет[^:]*|Шеф Техника[^:]*|Важно[^:]*|Текстура[^:]*|Класическата комбинация[^:]*)\s*:\s*(.*?)(?=\n\n[А-ЯЁЪA-Z📝💡🛠]|\Z)',
        r'(💡[^:]*(?:App Advice|Логика|Корекция)[^:]*|📝[^:]*)\s*:\s*\n?(.*?)(?=\n\n[А-ЯЁЪA-Z📝💡🛠]|\Z)',
    ]
    for pat in patterns:
        for m in re.finditer(pat, text, re.DOTALL | re.IGNORECASE):
            title = clean(m.group(1)).strip()[:100]
            content = clean(m.group(2)).strip()[:500]
            if len(content) > 30 and content not in [n['content'] for n in notes]:
                notes.append({"title_bg": title, "content": content})
    return notes[:4]


# ─── Phase 1: Extract ───────────────────────────────────────────────────────
print("📋 Phase 1: Extracting from Base.md...")
for r in recipes:
    text = get_lines(r['line_start'], r['line_end'])

    if r['is_variant']:
        # Variant: short modification text
        body = clean(text)
        r['description_bg'] = f"Вариант на {r['variant_of']}: {body[:200]}"
        r['ingredients_list'] = []
        r['ingredients_text_bg'] = body[:300]
        r['instruction_steps'] = [body.strip()[:500]] if len(body.strip()) > 20 else []
        r['lab_notes'] = []
    else:
        # Full recipe extraction
        # Description: first non-empty paragraph before "Продукти:"
        pre_match = re.search(r'^(.*?)(?=Продукти:)', text, re.DOTALL)
        desc = clean(pre_match.group(1)) if pre_match else ''
        # Use header line if desc is empty
        if len(desc) < 20:
            first_line = [l.strip() for l in text.splitlines() if l.strip()]
            desc = first_line[0] if first_line else r['name']
        r['description_bg'] = desc[:300]

        r['ingredients_list'] = extract_ingredients(text)
        r['ingredients_text_bg'] = '\n'.join(r['ingredients_list'])
        r['instruction_steps'] = extract_steps(text)
        r['lab_notes'] = extract_notes(text)

    n_ing = len(r.get('ingredients_list', []))
    n_steps = len(r.get('instruction_steps', []))
    n_notes = len(r.get('lab_notes', []))
    variant_tag = " [VARIANT]" if r['is_variant'] else ""
    print(f"  {r['name']}{variant_tag}: desc={len(r['description_bg'])}ch, {n_ing} ing, {n_steps} steps, {n_notes} notes")


# ─── Phase 2: Translate ─────────────────────────────────────────────────────
print("\n🌐 Phase 2: Translating with OpenAI...")

def translate(texts_bg):
    if not texts_bg:
        return []
    texts_bg = [t for t in texts_bg if t and t.strip()]
    if not texts_bg:
        return []
    numbered = '\n'.join(f"{i+1}. {t}" for i, t in enumerate(texts_bg))
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a professional recipe translator specializing in keto baking. Translate Bulgarian to English accurately, maintaining all measurements, baking techniques, and ingredient names."},
            {"role": "user", "content": f"Translate the following Bulgarian keto baking texts to English. Return ONLY the translations, one per line, numbered.\n\n{numbered}"}
        ],
        temperature=0.3
    )
    result = resp.choices[0].message.content.strip()
    cleaned = [re.sub(r'^\d+[\.\)]\s*', '', l).strip() for l in result.split('\n') if l.strip()]
    # Pad if fewer returned
    while len(cleaned) < len(texts_bg):
        cleaned.append(cleaned[-1] if cleaned else '')
    return cleaned[:len(texts_bg)]

for i, r in enumerate(recipes):
    print(f"  [{i+1}/{len(recipes)}] {r['name']}...", end=' ')

    r['description_en'] = translate([r['description_bg']])[0] if r['description_bg'] else ''

    if r.get('ingredients_list'):
        trans_ings = translate(r['ingredients_list'])
        r['ingredients_text_en'] = '\n'.join(trans_ings)
    else:
        r['ingredients_text_en'] = translate([r['ingredients_text_bg']])[0] if r['ingredients_text_bg'] else ''

    if r.get('instruction_steps'):
        r['instruction_steps_en'] = translate(r['instruction_steps'])
    else:
        r['instruction_steps_en'] = []

    for note in r.get('lab_notes', []):
        note['content_en'] = translate([note['content']])[0] if note['content'] else ''

    print('✅')

JSON_OUT.write_text(json.dumps(recipes, ensure_ascii=False, indent=2), encoding='utf-8')
print(f"\n✅ JSON saved → {JSON_OUT.name}")


# ─── Phase 3: Generate SQL ──────────────────────────────────────────────────
print("\n📄 Phase 3: Generating SQL files 50-55...")

def qty_unit(text):
    """Parse quantity and unit from ingredient text like '70 г бадемово брашно'"""
    text = text.strip()
    # Ranges like "6-8 броя" → average
    m = re.match(r'^(\d+)\s*[-–]\s*(\d+)\s*(г|мл|бр\.|броя|ч\.л\.|с\.л\.?|шт\.?|)', text)
    if m:
        avg = (float(m.group(1)) + float(m.group(2))) / 2
        return avg, m.group(3) or 'бр.'
    # Simple "70 г"
    m = re.match(r'^(\d+(?:[.,]\d+)?)\s*(г|мл|бр\.|броя|ч\.л\.|с\.л\.?|шт\.?|кг|л|)', text)
    if m and m.group(1):
        return float(m.group(1).replace(',', '.')), m.group(2) or None
    return None, None


# ── File 50: base_recipes ────────────────────────────────────────────────────
lines50 = [f"""-- ============================================================
-- File: 50_INSERT_ALL_BASE_RECIPES.sql
-- Project: KetoCakR | Date: {DATE}
-- Description: 22 cake base recipes (recipe_role_id = 1)
-- ============================================================

INSERT INTO base_recipes (
  recipe_role_id, name, name_en,
  description, description_en,
  ingredients_text_bg, ingredients_text_en,
  difficulty_level, prep_time_minutes, bake_time_minutes, servings
)
VALUES"""]

vals50 = []
for r in recipes:
    vals50.append(
        f"  ({ROLE_ID}, '{esc(r['name'])}', '{esc(r['name_en'])}',\n"
        f"   '{esc(r['description_bg'][:400])}',\n"
        f"   '{esc(r['description_en'][:400])}',\n"
        f"   '{esc(r['ingredients_text_bg'][:2000])}',\n"
        f"   '{esc(r['ingredients_text_en'][:2000])}',\n"
        f"   {r['difficulty']}, {r['prep']}, {r['bake']}, 8)"
    )

lines50.append(',\n'.join(vals50) + '\n;')
lines50.append(f'\n-- Total: {len(recipes)} base recipes')

(OUT_DIR / "50_INSERT_ALL_BASE_RECIPES.sql").write_text('\n'.join(lines50), encoding='utf-8')
print("✅ File 50 written")


# ── File 51: recipe_ingredients ──────────────────────────────────────────────
lines51 = [f"""-- ============================================================
-- File: 51_INSERT_ALL_BASE_INGREDIENTS.sql
-- Project: KetoCakR | Date: {DATE}
-- Description: Ingredients for 22 base recipes
-- ============================================================

INSERT INTO recipe_ingredients (
  recipe_id, ingredient_database_id, ingredient_name, quantity, unit, order_index
)
VALUES"""]

vals51 = []
total_ing = 0
for r in recipes:
    ings = r.get('ingredients_list', [])
    if not ings and r['ingredients_text_bg']:
        ings = [l.strip() for l in r['ingredients_text_bg'].splitlines() if l.strip() and len(l.strip()) > 3]

    for idx, ing_text in enumerate(ings, 1):
        if len(ing_text) > 250:
            continue
        name = ing_text[:200]
        qty, unit = qty_unit(ing_text)
        qty_val = str(qty) if qty is not None else 'NULL'
        unit_val = f"'{esc(unit)}'" if unit else 'NULL'
        recipe_sel = f"SELECT id FROM base_recipes WHERE name = '{esc(r['name'])}' AND recipe_role_id = {ROLE_ID}"
        vals51.append(
            f"  (\n"
            f"    ({recipe_sel}),\n"
            f"    NULL,\n"
            f"    '{esc(name)}',\n"
            f"    {qty_val},\n"
            f"    {unit_val},\n"
            f"    {idx}\n"
            f"  )"
        )
        total_ing += 1

lines51.append(',\n'.join(vals51) + '\n;')
lines51.append(f'\n-- Total: {total_ing} ingredients')

(OUT_DIR / "51_INSERT_ALL_BASE_INGREDIENTS.sql").write_text('\n'.join(lines51), encoding='utf-8')
print(f"✅ File 51 written ({total_ing} ingredients)")


# ── File 52: recipe_instruction_steps ───────────────────────────────────────
lines52 = [f"""-- ============================================================
-- File: 52_INSERT_ALL_BASE_STEPS_BILINGUAL.sql
-- Project: KetoCakR | Date: {DATE}
-- Description: Bilingual instruction steps for 22 base recipes
-- ============================================================

INSERT INTO recipe_instruction_steps (
  recipe_id, step_number,
  step_description, step_description_bg, step_description_en
)
VALUES"""]

vals52 = []
total_steps = 0
for r in recipes:
    steps_bg = r.get('instruction_steps', [])
    steps_en = r.get('instruction_steps_en', [])
    if not steps_bg:
        # Fallback: single step from description
        steps_bg = [r['description_bg'][:300]]
        steps_en = [r['description_en'][:300]]

    for i, (bg, en) in enumerate(zip(steps_bg, steps_en), 1):
        if not bg.strip():
            continue
        recipe_sel = f"SELECT id FROM base_recipes WHERE name = '{esc(r['name'])}' AND recipe_role_id = {ROLE_ID}"
        vals52.append(
            f"  (\n"
            f"    ({recipe_sel}),\n"
            f"    {i},\n"
            f"    '{esc(bg[:1000])}',\n"
            f"    '{esc(bg[:1000])}',\n"
            f"    '{esc(en[:1000])}'\n"
            f"  )"
        )
        total_steps += 1

lines52.append(',\n'.join(vals52) + '\n;')
lines52.append(f'\n-- Total: {total_steps} steps')

(OUT_DIR / "52_INSERT_ALL_BASE_STEPS_BILINGUAL.sql").write_text('\n'.join(lines52), encoding='utf-8')
print(f"✅ File 52 written ({total_steps} steps)")


# ── File 53: lab_notes ────────────────────────────────────────────────────────
lines53 = [f"""-- ============================================================
-- File: 53_INSERT_ALL_BASE_LAB_NOTES.sql
-- Project: KetoCakR | Date: {DATE}
-- Description: Chef tips / lab notes for base recipes
-- NOTE: no content_en column in lab_notes table
-- ============================================================

INSERT INTO lab_notes (
  recipe_id, category, title, title_bg, content, content_bg
)
VALUES"""]

vals53 = []
total_notes = 0
for r in recipes:
    notes = r.get('lab_notes', [])
    if not notes:
        continue
    for note in notes:
        bg = note.get('content', '')
        if not bg.strip():
            continue
        title = note.get('title_bg', 'Шеф съвет')[:100]
        recipe_sel = f"SELECT id FROM base_recipes WHERE name = '{esc(r['name'])}' AND recipe_role_id = {ROLE_ID}"
        vals53.append(
            f"  (\n"
            f"    ({recipe_sel}),\n"
            f"    'baking_tip',\n"
            f"    'Chef Tip',\n"
            f"    '{esc(title)}',\n"
            f"    '{esc(bg[:800])}',\n"
            f"    '{esc(bg[:800])}'\n"
            f"  )"
        )
        total_notes += 1

if vals53:
    lines53.append(',\n'.join(vals53) + '\n;')
else:
    lines53.append('-- No notes extracted')
lines53.append(f'\n-- Total: {total_notes} notes')

(OUT_DIR / "53_INSERT_ALL_BASE_LAB_NOTES.sql").write_text('\n'.join(lines53), encoding='utf-8')
print(f"✅ File 53 written ({total_notes} notes)")


# ── File 54: recipe_equipment ─────────────────────────────────────────────────
# 4 standard items for all 22 recipes
lines54 = [f"""-- ============================================================
-- File: 54_INSERT_ALL_BASE_EQUIPMENT.sql
-- Project: KetoCakR | Date: {DATE}
-- Description: Standard baking equipment for all 22 base recipes
-- Total: 4 items × 22 recipes = 88 rows
-- ============================================================

INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, size, essential)
SELECT id, 'Electric mixer', 'Електрически миксер', 1, NULL, true
FROM base_recipes WHERE recipe_role_id = {ROLE_ID}
UNION ALL
SELECT id, 'Baking pan', 'Форма за печене', 1, '18cm', true
FROM base_recipes WHERE recipe_role_id = {ROLE_ID}
UNION ALL
SELECT id, 'Silicone spatula', 'Силиконова шпатула', 1, NULL, true
FROM base_recipes WHERE recipe_role_id = {ROLE_ID}
UNION ALL
SELECT id, 'Parchment paper', 'Хартия за печене', 1, NULL, true
FROM base_recipes WHERE recipe_role_id = {ROLE_ID};

-- Expected: {len(recipes) * 4} rows
"""]

(OUT_DIR / "54_INSERT_ALL_BASE_EQUIPMENT.sql").write_text('\n'.join(lines54), encoding='utf-8')
print(f"✅ File 54 written ({len(recipes)*4} rows)")


# ── File 55: rollback ─────────────────────────────────────────────────────────
name_list = ',\n    '.join(f"'{esc(r['name'])}'" for r in recipes)

lines55 = [f"""-- ============================================================
-- File: 55_ROLLBACK_NEW_BASES.sql
-- Project: KetoCakR | Date: {DATE}
-- Description: Remove the 22 NEW base recipes inserted by migration 50-54
--              Does NOT touch any pre-existing recipe_role_id = 1 records
-- ============================================================

DELETE FROM recipe_equipment
WHERE recipe_id IN (
  SELECT id FROM base_recipes
  WHERE recipe_role_id = {ROLE_ID}
    AND name IN (
    {name_list}
  )
);

DELETE FROM lab_notes
WHERE recipe_id IN (
  SELECT id FROM base_recipes
  WHERE recipe_role_id = {ROLE_ID}
    AND name IN (
    {name_list}
  )
);

DELETE FROM recipe_instruction_steps
WHERE recipe_id IN (
  SELECT id FROM base_recipes
  WHERE recipe_role_id = {ROLE_ID}
    AND name IN (
    {name_list}
  )
);

DELETE FROM recipe_ingredients
WHERE recipe_id IN (
  SELECT id FROM base_recipes
  WHERE recipe_role_id = {ROLE_ID}
    AND name IN (
    {name_list}
  )
);

DELETE FROM base_recipes
WHERE recipe_role_id = {ROLE_ID}
  AND name IN (
  {name_list}
);

-- Verify: should show remaining count (pre-existing only)
SELECT COUNT(*) as remaining_bases FROM base_recipes WHERE recipe_role_id = {ROLE_ID};
"""]

(OUT_DIR / "55_ROLLBACK_NEW_BASES.sql").write_text('\n'.join(lines55), encoding='utf-8')
print("✅ File 55 written (rollback)")


print(f"""
🎉 DONE! Files 50-55 generated in {OUT_DIR}

  50_INSERT_ALL_BASE_RECIPES.sql       — {len(recipes)} base recipes
  51_INSERT_ALL_BASE_INGREDIENTS.sql   — {total_ing} ingredients
  52_INSERT_ALL_BASE_STEPS_BILINGUAL.sql — {total_steps} steps (BG+EN)
  53_INSERT_ALL_BASE_LAB_NOTES.sql     — {total_notes} chef notes
  54_INSERT_ALL_BASE_EQUIPMENT.sql     — {len(recipes)*4} rows
  55_ROLLBACK_NEW_BASES.sql            — rollback script
""")
