import json
import re
import os
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

# ─── Load API key ────────────────────────────────────────────────────────────
with open(r'C:\Dev\KetoCakr\Admin\.env.local', 'r', encoding='utf-8') as f:
    api_key = None
    for line in f:
        if line.startswith('OPENAI_API_KEY='):
            api_key = line.strip().split('=', 1)[1].strip('"\'')
            break

print(f"✅ API key loaded (...{api_key[-6:]})")

from openai import OpenAI
client = OpenAI(api_key=api_key)

# ─── Read Decor.md ───────────────────────────────────────────────────────────
with open(r'C:\Dev\KetoCakr\Marketing\Recipes\Decor.md', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
print(f"✅ Decor.md loaded ({len(lines)} lines)")

# ─── Decoration definitions ───────────────────────────────────────────────────
decorations = [
    {"name": "Горски венец",             "name_en": "Forest Wreath",           "start": 6,   "end": 42,  "materials": "fresh berries",                    "diff": 1},
    {"name": "Кралски Сахер",            "name_en": "Royal Sacher",            "start": 44,  "end": 83,  "materials": "chocolate glaze + writing",        "diff": 2},
    {"name": "Хрупкав Орех",             "name_en": "Crunchy Nut",             "start": 85,  "end": 114, "materials": "toasted walnuts",                  "diff": 1},
    {"name": "Класически Гараш",         "name_en": "Classic Garash",          "start": 116, "end": 143, "materials": "ganache + pistachio border",       "diff": 2},
    {"name": "Бадемов облак",            "name_en": "Almond Cloud",            "start": 145, "end": 174, "materials": "sliced toasted almonds",           "diff": 1},
    {"name": "Черна гора",               "name_en": "Black Mountain",          "start": 176, "end": 205, "materials": "cream rosettes + cherries",        "diff": 2},
    {"name": "Шоколадов дует",           "name_en": "Chocolate Duet",          "start": 207, "end": 240, "materials": "dark + white chocolate shavings",  "diff": 2},
    {"name": "Цъфтяща нощ",              "name_en": "Blooming Night",          "start": 242, "end": 276, "materials": "edible flowers",                   "diff": 1},
    {"name": "Натурална дъга",           "name_en": "Natural Rainbow",         "start": 278, "end": 321, "materials": "5 colorful fresh fruits",          "diff": 2},
    {"name": "Празнични балони",         "name_en": "Party Balloons",          "start": 323, "end": 357, "materials": "colored meringue drops",           "diff": 3},
    {"name": "Кадифени трохи",           "name_en": "Velvet Crumbs",           "start": 359, "end": 388, "materials": "red velvet or chocolate crumbs",   "diff": 1},
    {"name": "Кадифени трохи с Кармин", "name_en": "Velvet Crumbs Carmine",   "start": 390, "end": 421, "materials": "crumbs + carmine red dye",         "diff": 2},
    {"name": "Снежни розети",            "name_en": "Snowy Rosettes",          "start": 423, "end": 453, "materials": "mascarpone cream + powdered erythritol", "diff": 2},
]

# ─── Helpers ─────────────────────────────────────────────────────────────────
def esc(text):
    return str(text).replace("'", "''") if text else ''

def is_material_line(line):
    line = line.strip()
    if len(line) > 200: return False
    if re.match(r'^(За |Начин|Стъпка|Шеф |##|Визуален)', line): return False
    return True

def parse_material(line):
    line = line.rstrip(';,').strip()
    # Range: "6-8 броя" → 7
    m = re.match(r'^(\d+)[-–](\d+)\s+([^\d].+)', line)
    if m:
        qty = (int(m.group(1)) + int(m.group(2))) / 2
        rest = m.group(3).strip()
        parts = rest.split(None, 1)
        unit = parts[0] if parts else None
        name = parts[1] if len(parts) > 1 else rest
        return qty, unit[:20], name[:200]
    # Normal: "50 г нещо"
    m = re.match(r'^(\d+(?:[.,]\d+)?)\s*([а-яА-Яa-zA-Z\.]+\.?)\s+(.+)', line)
    if m:
        try: qty = float(m.group(1).replace(',', '.'))
        except: qty = None
        return qty, m.group(2).strip('.')[:20], m.group(3).strip()[:200]
    return None, None, line[:200]

# ─── Phase 1: Extract ────────────────────────────────────────────────────────
print("\n📋 Phase 1: Extracting from Decor.md...")

for d in decorations:
    start_idx = d['start'] - 1
    end_idx = min(d['end'], len(lines))
    text = '\n'.join(lines[start_idx:end_idx])

    # Description: intro before section "1."
    desc_m = re.search(r'^([\s\S]*?)(?=1\.\s*Необходими|\Z)', text)
    if desc_m:
        desc_lines = [l.strip() for l in desc_m.group(1).split('\n')
                      if l.strip() and not re.match(r'^(Кето Декорация|##|\*)', l.strip())]
        d['description_bg'] = ' '.join(desc_lines)[:300].strip()
    else:
        d['description_bg'] = ''

    if len(d['description_bg']) < 20:
        d['description_bg'] = f"Декоративна техника за украса на торта с {d['materials']}."

    # Materials (section 1)
    mat_m = re.search(r'1\.\s*Необходими[^:]*:(.*?)(?=2\.|3\.|4\.|\Z)', text, re.DOTALL)
    if mat_m:
        mat_lines = [l.strip() for l in mat_m.group(1).split('\n')
                     if l.strip() and len(l.strip()) > 5
                     and not re.match(r'^(За |##)', l.strip())]
        d['materials_list'] = mat_lines
        d['ingredients_text_bg'] = '\n'.join(mat_lines)
    else:
        d['materials_list'] = []
        d['ingredients_text_bg'] = ''

    # Steps (section 3 or 4)
    steps_m = re.search(r'(?:3|4)\.\s*Стъпки[^:]*:(.*?)(?=Шеф съвет|5\.|\Z)', text, re.DOTALL)
    d['technique_steps'] = []
    if steps_m:
        steps_text = steps_m.group(1)
        for sm in re.finditer(r'Стъпка\s*\d+[^:]*:(.*?)(?=Стъпка\s*\d+|$)', steps_text, re.DOTALL):
            step = sm.group(1).strip()
            if len(step) > 20:
                d['technique_steps'].append(step[:600])
        # Fallback: numbered lines
        if not d['technique_steps']:
            for line in steps_text.split('\n'):
                line = line.strip()
                if len(line) > 20 and re.match(r'^\d+\.', line):
                    d['technique_steps'].append(re.sub(r'^\d+\.\s*', '', line)[:600])

    # Chef tips (lab notes)
    d['chef_tips'] = []
    for tm in re.finditer(r'Шеф съвет[^:]*:(.*?)(?=\n\n\n|\Z)', text, re.DOTALL):
        tip = tm.group(1).strip()
        if len(tip) > 30:
            d['chef_tips'].append(tip[:500])

    print(f"  {d['name']}: desc={len(d['description_bg'])}ch, "
          f"{len(d['materials_list'])} mat, "
          f"{len(d['technique_steps'])} steps, "
          f"{len(d['chef_tips'])} tips")

# ─── Phase 2: Translate ───────────────────────────────────────────────────────
print("\n🌐 Phase 2: Translating with OpenAI...")

def translate(texts_bg):
    if not texts_bg or all(not t.strip() for t in texts_bg):
        return [''] * len(texts_bg)
    numbered = '\n'.join(f"{i+1}. {t}" for i, t in enumerate(texts_bg))
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a professional cake decorator translator. Translate Bulgarian to English accurately, maintaining all decorating techniques and measurements."},
            {"role": "user", "content": f"Translate the following Bulgarian cake decoration texts to English. Return ONLY the translations, numbered the same way.\n\n{numbered}"}
        ],
        temperature=0.3
    )
    result = resp.choices[0].message.content.strip()
    cleaned = [re.sub(r'^\d+\.\s*', '', l).strip() for l in result.split('\n') if l.strip()]
    while len(cleaned) < len(texts_bg): cleaned.append('')
    return cleaned[:len(texts_bg)]

for i, d in enumerate(decorations):
    print(f"  [{i+1}/13] {d['name']}...", end=' ')
    texts = []
    idx = {}
    idx['desc'] = len(texts); texts.append(d['description_bg'])
    idx['mat_s'] = len(texts); texts.extend(d['materials_list']); idx['mat_e'] = len(texts)
    idx['stp_s'] = len(texts); texts.extend(d['technique_steps']); idx['stp_e'] = len(texts)
    idx['tip_s'] = len(texts); texts.extend(d['chef_tips']); idx['tip_e'] = len(texts)
    try:
        tr = translate(texts)
        d['description_en'] = tr[idx['desc']]
        d['ingredients_text_en'] = '\n'.join(tr[idx['mat_s']:idx['mat_e']])
        d['technique_steps_en'] = tr[idx['stp_s']:idx['stp_e']]
        d['chef_tips_en'] = tr[idx['tip_s']:idx['tip_e']]
        print("✅")
    except Exception as e:
        print(f"❌ {e}")
        d['description_en'] = d['description_bg']
        d['ingredients_text_en'] = d['ingredients_text_bg']
        d['technique_steps_en'] = d['technique_steps']
        d['chef_tips_en'] = d['chef_tips']
    time.sleep(0.3)

json_path = r'C:\Dev\KetoCakr\Admin\migrations\decorations_structured.json'
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(decorations, f, ensure_ascii=False, indent=2)
print(f"\n✅ JSON saved")

# ─── Phase 3: Generate SQL ────────────────────────────────────────────────────
OUT = r'C:\Dev\KetoCakr\Admin\migrations'
print("\n📄 Phase 3: Generating SQL files 40-45...")

# ── File 40: base_recipes ────────────────────────────────────────────────────
rows = []
for d in decorations:
    rows.append(
        f"  (4, '{esc(d['name'])}', '{esc(d['name_en'])}',\n"
        f"   '{esc(d['description_bg'][:200])}',\n"
        f"   '{esc(d.get('description_en','')[:200])}',\n"
        f"   '{esc(d['ingredients_text_bg'])}',\n"
        f"   '{esc(d.get('ingredients_text_en',''))}',\n"
        f"   {d['diff']}, 20, NULL, 8)"
    )

with open(os.path.join(OUT, '40_INSERT_DECORATION_BASE_RECIPES.sql'), 'w', encoding='utf-8') as f:
    f.write('\n'.join([
        "-- ============================================================",
        "-- File: 40_INSERT_DECORATION_BASE_RECIPES.sql",
        "-- Project: KetoCakR | Date: 2026-04-07",
        "-- Description: 13 decoration patterns (recipe_role_id = 4)",
        "-- ============================================================",
        "",
        "INSERT INTO base_recipes (",
        "  recipe_role_id, name, name_en,",
        "  description, description_en,",
        "  ingredients_text_bg, ingredients_text_en,",
        "  difficulty_level, prep_time_minutes, bake_time_minutes, servings",
        ")",
        "VALUES",
        ',\n'.join(rows),
        ";",
        "",
        f"-- Total: {len(decorations)} decoration patterns"
    ]))
print("✅ File 40 written")

# ── File 41: recipe_ingredients (materials) ───────────────────────────────────
mat_rows = []
total_mat = 0
for d in decorations:
    dname = esc(d['name'])
    order_idx = 1
    for line in d['materials_list']:
        if not is_material_line(line): continue
        qty, unit, name = parse_material(line)
        if not name: name = line[:200]
        qty_val = str(qty) if qty is not None else 'NULL'
        unit_val = f"'{esc(unit)}'" if unit else 'NULL'
        mat_rows.append(
            f"  (\n"
            f"    (SELECT id FROM base_recipes WHERE name = '{dname}' AND recipe_role_id = 4),\n"
            f"    NULL,\n"
            f"    '{esc(name)}',\n"
            f"    {qty_val},\n"
            f"    {unit_val},\n"
            f"    {order_idx}\n"
            f"  )"
        )
        total_mat += 1
        order_idx += 1

with open(os.path.join(OUT, '41_INSERT_DECORATION_MATERIALS.sql'), 'w', encoding='utf-8') as f:
    f.write('\n'.join([
        "-- ============================================================",
        "-- File: 41_INSERT_DECORATION_MATERIALS.sql",
        "-- Project: KetoCakR | Date: 2026-04-07",
        "-- Description: Decoration materials as recipe_ingredients",
        "-- NOTE: quantities are approximate (decorative, not precise)",
        "-- ============================================================",
        "",
        "INSERT INTO recipe_ingredients (",
        "  recipe_id, ingredient_database_id, ingredient_name, quantity, unit, order_index",
        ")",
        "VALUES",
        ',\n'.join(mat_rows),
        ";",
        "",
        f"-- Total: {total_mat} materials"
    ]))
print(f"✅ File 41 written ({total_mat} materials)")

# ── File 42: instruction_steps ────────────────────────────────────────────────
step_rows = []
total_steps = 0
for d in decorations:
    dname = esc(d['name'])
    steps_bg = d['technique_steps']
    steps_en = d.get('technique_steps_en', [])
    if not steps_bg:
        steps_bg = [f"Изпълни декорацията {d['name']} според описанието."]
        steps_en = [f"Execute the {d['name_en']} decoration according to the description."]
    for i, step in enumerate(steps_bg):
        en = steps_en[i] if i < len(steps_en) else ''
        step_rows.append(
            f"  (\n"
            f"    (SELECT id FROM base_recipes WHERE name = '{dname}' AND recipe_role_id = 4),\n"
            f"    {i+1},\n"
            f"    '{esc(step)}',\n"
            f"    '{esc(step)}',\n"
            f"    '{esc(en)}'\n"
            f"  )"
        )
        total_steps += 1

with open(os.path.join(OUT, '42_INSERT_DECORATION_STEPS_BILINGUAL.sql'), 'w', encoding='utf-8') as f:
    f.write('\n'.join([
        "-- ============================================================",
        "-- File: 42_INSERT_DECORATION_STEPS_BILINGUAL.sql",
        "-- Project: KetoCakR | Date: 2026-04-07",
        "-- ============================================================",
        "",
        "INSERT INTO recipe_instruction_steps (",
        "  recipe_id, step_number,",
        "  step_description, step_description_bg, step_description_en",
        ")",
        "VALUES",
        ',\n'.join(step_rows),
        ";",
        "",
        f"-- Total: {total_steps} steps"
    ]))
print(f"✅ File 42 written ({total_steps} steps)")

# ── File 43: lab_notes (chef tips) — NO content_en column! ───────────────────
tip_rows = []
total_tips = 0
for d in decorations:
    dname = esc(d['name'])
    tips = d['chef_tips']
    if not tips:
        tips = [f"Шеф съвет за декорацията {d['name']}."]
    for tip in tips:
        tip_rows.append(
            f"  (\n"
            f"    (SELECT id FROM base_recipes WHERE name = '{dname}' AND recipe_role_id = 4),\n"
            f"    'chef_trick',\n"
            f"    'Chef Tip',\n"
            f"    'Шеф съвет',\n"
            f"    '{esc(tip.strip())}',\n"
            f"    '{esc(tip.strip())}'\n"
            f"  )"
        )
        total_tips += 1

with open(os.path.join(OUT, '43_INSERT_DECORATION_TIPS.sql'), 'w', encoding='utf-8') as f:
    f.write('\n'.join([
        "-- ============================================================",
        "-- File: 43_INSERT_DECORATION_TIPS.sql",
        "-- Project: KetoCakR | Date: 2026-04-07",
        "-- Description: Chef tips as lab_notes for 13 decoration patterns",
        "-- NOTE: content_en column does NOT exist in lab_notes table",
        "-- ============================================================",
        "",
        "INSERT INTO lab_notes (",
        "  recipe_id, category, title, title_bg, content, content_bg",
        ")",
        "VALUES",
        ',\n'.join(tip_rows),
        ";",
        "",
        f"-- Total: {total_tips} tips"
    ]))
print(f"✅ File 43 written ({total_tips} tips)")

# ── File 44: equipment ────────────────────────────────────────────────────────
equipment = [
    ("Offset spatula",           "Палета за измазване",             1, "NULL", "true"),
    ("Cake turntable",           "Въртяща се поставка за торти",    1, "NULL", "false"),
    ("Piping bag with tips",     "Пош за шприцоване с накрайници",  1, "NULL", "false"),
]
sql44_lines = [
    "-- ============================================================",
    "-- File: 44_INSERT_DECORATION_EQUIPMENT.sql",
    "-- Project: KetoCakR | Date: 2026-04-07",
    f"-- Total: {len(decorations) * len(equipment)} rows (13 × 3 items)",
    "-- ============================================================",
    "",
]
for item_en, item_bg, qty, size, essential in equipment:
    sql44_lines.append(
        f"INSERT INTO recipe_equipment (recipe_id, item, item_bg, quantity, size, essential)\n"
        f"SELECT id, '{item_en}', '{item_bg}', {qty}, {size}, {essential}\n"
        f"FROM base_recipes WHERE recipe_role_id = 4;\n"
    )
sql44_lines.append(f"-- Total: {len(decorations)*len(equipment)} rows")
with open(os.path.join(OUT, '44_INSERT_DECORATION_EQUIPMENT.sql'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql44_lines))
print(f"✅ File 44 written ({len(decorations)*len(equipment)} rows)")

# ── File 45: rollback ─────────────────────────────────────────────────────────
with open(os.path.join(OUT, '45_ROLLBACK_DECORATIONS.sql'), 'w', encoding='utf-8') as f:
    f.write("""-- ============================================================
-- File: 45_ROLLBACK_DECORATIONS.sql
-- Project: KetoCakR | Date: 2026-04-07
-- Description: Rollback all decoration data (recipe_role_id = 4)
-- ============================================================

DELETE FROM recipe_equipment
WHERE recipe_id IN (SELECT id FROM base_recipes WHERE recipe_role_id = 4);

DELETE FROM lab_notes
WHERE recipe_id IN (SELECT id FROM base_recipes WHERE recipe_role_id = 4);

DELETE FROM recipe_instruction_steps
WHERE recipe_id IN (SELECT id FROM base_recipes WHERE recipe_role_id = 4);

DELETE FROM recipe_ingredients
WHERE recipe_id IN (SELECT id FROM base_recipes WHERE recipe_role_id = 4);

DELETE FROM base_recipes WHERE recipe_role_id = 4;

-- Verify (all should be 0)
SELECT 'base_recipes' AS table_name, COUNT(*) AS remaining FROM base_recipes WHERE recipe_role_id = 4
UNION ALL
SELECT 'recipe_instruction_steps', COUNT(*) FROM recipe_instruction_steps
  WHERE recipe_id IN (SELECT id FROM base_recipes WHERE recipe_role_id = 4)
UNION ALL
SELECT 'lab_notes', COUNT(*) FROM lab_notes
  WHERE recipe_id IN (SELECT id FROM base_recipes WHERE recipe_role_id = 4)
UNION ALL
SELECT 'recipe_equipment', COUNT(*) FROM recipe_equipment
  WHERE recipe_id IN (SELECT id FROM base_recipes WHERE recipe_role_id = 4)
UNION ALL
SELECT 'recipe_ingredients', COUNT(*) FROM recipe_ingredients
  WHERE recipe_id IN (SELECT id FROM base_recipes WHERE recipe_role_id = 4);

-- Expected: All counts = 0
""")
print("✅ File 45 written (rollback)")

print(f"""
🎉 DONE! Files 40-45 generated in {OUT}

  40_INSERT_DECORATION_BASE_RECIPES.sql  — {len(decorations)} patterns
  41_INSERT_DECORATION_MATERIALS.sql     — {total_mat} materials
  42_INSERT_DECORATION_STEPS_BILINGUAL.sql — {total_steps} steps (BG+EN)
  43_INSERT_DECORATION_TIPS.sql          — {total_tips} chef tips
  44_INSERT_DECORATION_EQUIPMENT.sql     — {len(decorations)*len(equipment)} rows
  45_ROLLBACK_DECORATIONS.sql            — rollback script
""")
