# BULK RECIPE IMPORT: JSON → Translate → Complete SQL with All Fields

**Status:** CRITICAL - Complete recipe data migration  
**Timeline:** 2-3 hours  
**Priority:** HIGHEST  
**Objective:** Parse recipes JSON, translate to English (OpenAI), generate SQL with all base_recipes fields populated

---

## OBJECTIVE

Convert 152 recipes from JSON into complete SQL INSERT statements:

```
INPUT (JSON):
├─ name (БГ)
├─ ingredients (список БГ)
└─ instructions (стъпки БГ)

PROCESSING:
├─ name → name_en (OpenAI translation)
├─ ingredients → ingredients_text_bg + ingredients_text_en
└─ instructions → description_bg + description_en

OUTPUT (SQL):
├─ base_recipes (с ВСЕ полета)
├─ recipe_ingredients (связъ с ingredients_database)
└─ recipe_instruction_steps
```

---

## REQUIREMENTS

### **OpenAI API Key Required**

Трябва ти `OPENAI_API_KEY` environment variable:

```bash
# Windows PowerShell
$env:OPENAI_API_KEY = "sk-..."

# Linux/Mac
export OPENAI_API_KEY="sk-..."
```

---

## STEP-BY-STEP EXECUTION

### STEP 1: Verify JSON File Exists (5 min)

**File:** `C:\Dev\KetoCakR\scripts\output\recipes_bulk_import.json`

**ACTION:** Check file exists:

```bash
ls -la C:\Dev\KetoCakR\scripts\output\recipes_bulk_import.json
```

**Expected:** File exists, size > 0

**Checklist:**
- [ ] JSON file exists
- [ ] File has content

---

### STEP 2: Create Enhanced Python Script (30 min)

**File:** `scripts/bulk_import_with_translation.py`

**ACTION:** Create new file with this complete code:

```python
#!/usr/bin/env python3
"""
Bulk Recipe Import with OpenAI Translation
Parses JSON recipes and translates to English
Generates complete SQL for base_recipes table
"""

import os
import json
import sys
import uuid
from datetime import datetime
from pathlib import Path

# Install OpenAI
try:
    from openai import OpenAI
except ImportError:
    print("Installing openai...")
    os.system("pip install openai")
    from openai import OpenAI

# ============================================================================
# CONFIGURATION
# ============================================================================

JSON_INPUT_PATH = "scripts/output/recipes_bulk_import.json"
SQL_OUTPUT_PATH = "scripts/output/recipes_complete_with_translations.sql"
JSON_TRANSLATED_PATH = "scripts/output/recipes_translated.json"

# OpenAI API Key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("❌ ERROR: OPENAI_API_KEY environment variable not set!")
    print("Set it with: $env:OPENAI_API_KEY = 'sk-...' (PowerShell)")
    sys.exit(1)

client = OpenAI(api_key=OPENAI_API_KEY)

# ============================================================================
# TRANSLATION FUNCTIONS
# ============================================================================

def translate_text(text_bg: str, context: str = "recipe") -> str:
    """
    Translate Bulgarian text to English using OpenAI gpt-4o-mini
    
    Args:
        text_bg: Bulgarian text to translate
        context: 'name' | 'ingredients' | 'instructions'
    
    Returns:
        English translation
    """
    if not text_bg or len(text_bg.strip()) == 0:
        return ""
    
    # System prompts for different contexts
    system_prompts = {
        'name': 'You are a culinary translator. Translate the Bulgarian recipe name to English. Keep it short and natural. Reply with ONLY the translation, no explanations.',
        'ingredients': 'You are a culinary translator. Translate the Bulgarian ingredient list to English. Keep ingredient names accurate and culinary. Reply with ONLY the translated list, preserving the format.',
        'instructions': 'You are a culinary translator. Translate the Bulgarian cooking instructions to English. Keep them clear and sequential. Reply with ONLY the translated instructions, preserving the step structure.',
    }
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.3,  # Low temperature for deterministic translation
            messages=[
                {
                    "role": "system",
                    "content": system_prompts.get(context, system_prompts['instructions'])
                },
                {
                    "role": "user",
                    "content": f"Translate to English:\n\n{text_bg}"
                }
            ],
            max_tokens=500,
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        print(f"⚠️  Translation error: {e}")
        return f"[TRANSLATION ERROR: {text_bg[:50]}...]"

# ============================================================================
# JSON PROCESSING
# ============================================================================

def load_recipes_json(json_path: str) -> list:
    """Load recipes from JSON file"""
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Error loading JSON: {e}")
        return []

def process_recipes_with_translation(recipes: list) -> list:
    """
    Process recipes:
    - Combine ingredients into text format
    - Combine instructions into description format
    - Translate all to English
    - Add nutritional defaults
    """
    processed = []
    
    for idx, recipe in enumerate(recipes):
        print(f"[{idx+1}/{len(recipes)}] Processing: {recipe.get('name', 'Unknown')}")
        
        # Extract fields
        name_bg = recipe.get('name', '').strip()
        ingredients_list = recipe.get('ingredients', [])
        instructions_list = recipe.get('instructions', [])
        image_url = recipe.get('image_url', '')
        recipe_id = recipe.get('id', str(uuid.uuid4()))
        
        # Convert ingredients list to text
        if isinstance(ingredients_list, list):
            ingredients_text_bg = '\n'.join([str(ing) for ing in ingredients_list if ing])
        else:
            ingredients_text_bg = str(ingredients_list) if ingredients_list else ''
        
        # Convert instructions list to text
        if isinstance(instructions_list, list):
            instructions_text_bg = '\n'.join([f"{i}. {str(step)}" for i, step in enumerate(instructions_list, 1) if step])
        else:
            instructions_text_bg = str(instructions_list) if instructions_list else ''
        
        # Translate to English
        print(f"  Translating name...")
        name_en = translate_text(name_bg, context='name')
        
        print(f"  Translating ingredients...")
        ingredients_text_en = translate_text(ingredients_text_bg, context='ingredients')
        
        print(f"  Translating instructions...")
        instructions_text_en = translate_text(instructions_text_bg, context='instructions')
        
        # Create processed recipe
        processed_recipe = {
            'id': recipe_id,
            'name_bg': name_bg,
            'name_en': name_en,
            'ingredients_text_bg': ingredients_text_bg,
            'ingredients_text_en': ingredients_text_en,
            'description_bg': instructions_text_bg,
            'description_en': instructions_text_en,
            'image_url': image_url,
            'ingredients_list': ingredients_list,
            'instructions_list': instructions_list,
            'created_at': datetime.now().isoformat(),
        }
        
        processed.append(processed_recipe)
    
    return processed

# ============================================================================
# SQL GENERATION
# ============================================================================

def generate_complete_sql(recipes: list) -> str:
    """
    Generate complete SQL INSERT for base_recipes table
    Includes all relevant fields
    """
    
    sql_statements = []
    sql_statements.append("-- ================================================================")
    sql_statements.append("-- COMPLETE RECIPE IMPORT: 152 Recipes with Full Translation")
    sql_statements.append(f"-- Generated: {datetime.now().isoformat()}")
    sql_statements.append("-- ================================================================")
    sql_statements.append("")
    sql_statements.append("BEGIN;")
    sql_statements.append("")
    sql_statements.append("-- STEP 1: Insert into base_recipes with all fields")
    sql_statements.append("-- ================================================================")
    sql_statements.append("")
    
    for recipe in recipes:
        recipe_id = recipe['id']
        name_bg = recipe['name_bg'].replace("'", "''")
        name_en = recipe['name_en'].replace("'", "''")
        ingredients_bg = recipe['ingredients_text_bg'].replace("'", "''")
        ingredients_en = recipe['ingredients_text_en'].replace("'", "''")
        description_bg = recipe['description_bg'].replace("'", "''")
        description_en = recipe['description_en'].replace("'", "''")
        image_url = recipe['image_url'].replace("'", "''") if recipe['image_url'] else ""
        
        sql = f"""
INSERT INTO base_recipes (
  id,
  name,
  name_en,
  ingredients_text_bg,
  ingredients_text_en,
  description,
  description_en,
  image_url,
  is_simple_recipe,
  is_visible_to_users,
  is_free,
  servings,
  created_at,
  updated_at
) VALUES (
  '{recipe_id}',
  E'{name_bg}',
  E'{name_en}',
  E'{ingredients_bg}',
  E'{ingredients_en}',
  E'{description_bg}',
  E'{description_en}',
  E'{image_url}',
  true,
  true,
  false,
  8,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;
"""
        sql_statements.append(sql)
    
    sql_statements.append("")
    sql_statements.append("-- STEP 2: Insert into recipe_ingredients")
    sql_statements.append("-- ================================================================")
    sql_statements.append("")
    
    for recipe in recipes:
        recipe_id = recipe['id']
        ingredients_list = recipe['ingredients_list']
        
        for idx, ingredient in enumerate(ingredients_list):
            if not ingredient or len(str(ingredient).strip()) == 0:
                continue
            
            ingredient_text = str(ingredient).replace("'", "''")
            
            sql = f"""
INSERT INTO recipe_ingredients (
  id,
  recipe_id,
  ingredient_name_text,
  order_index,
  created_at
) VALUES (
  '{str(uuid.uuid4())}',
  '{recipe_id}',
  E'{ingredient_text}',
  {idx},
  NOW()
) ON CONFLICT DO NOTHING;
"""
            sql_statements.append(sql)
    
    sql_statements.append("")
    sql_statements.append("-- STEP 3: Insert into recipe_instruction_steps")
    sql_statements.append("-- ================================================================")
    sql_statements.append("")
    
    for recipe in recipes:
        recipe_id = recipe['id']
        instructions_list = recipe['instructions_list']
        
        for step_num, instruction in enumerate(instructions_list, 1):
            if not instruction or len(str(instruction).strip()) == 0:
                continue
            
            instruction_text = str(instruction).replace("'", "''")
            
            sql = f"""
INSERT INTO recipe_instruction_steps (
  id,
  recipe_id,
  step_number,
  instruction,
  created_at
) VALUES (
  '{str(uuid.uuid4())}',
  '{recipe_id}',
  {step_num},
  E'{instruction_text}',
  NOW()
) ON CONFLICT DO NOTHING;
"""
            sql_statements.append(sql)
    
    sql_statements.append("")
    sql_statements.append("COMMIT;")
    
    return "\n".join(sql_statements)

# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    print("\n" + "="*80)
    print("BULK RECIPE IMPORT WITH OPENAI TRANSLATION")
    print("="*80 + "\n")
    
    # STEP 1: Load JSON
    print("[STEP 1] Loading recipes from JSON...")
    recipes = load_recipes_json(JSON_INPUT_PATH)
    print(f"✅ Loaded {len(recipes)} recipes\n")
    
    if len(recipes) == 0:
        print("❌ No recipes loaded!")
        sys.exit(1)
    
    # STEP 2: Process with translation
    print("[STEP 2] Processing recipes and translating to English...")
    print("⏳ This may take 2-5 minutes (152 recipes × 3 translations = ~456 API calls)\n")
    processed = process_recipes_with_translation(recipes)
    print(f"✅ Processed {len(processed)} recipes\n")
    
    # STEP 3: Save translated JSON
    print(f"[STEP 3] Saving translated recipes to {JSON_TRANSLATED_PATH}...")
    with open(JSON_TRANSLATED_PATH, 'w', encoding='utf-8') as f:
        json.dump(processed, f, ensure_ascii=False, indent=2)
    print(f"✅ Translated JSON saved\n")
    
    # STEP 4: Generate SQL
    print("[STEP 4] Generating complete SQL...")
    sql = generate_complete_sql(processed)
    
    # STEP 5: Save SQL
    print(f"[STEP 5] Saving SQL to {SQL_OUTPUT_PATH}...")
    with open(SQL_OUTPUT_PATH, 'w', encoding='utf-8') as f:
        f.write(sql)
    print(f"✅ SQL saved\n")
    
    # STEP 6: Summary
    print("="*80)
    print("IMPORT COMPLETE")
    print("="*80)
    print(f"✅ Recipes processed: {len(processed)}")
    print(f"✅ Translations completed: {len(processed) * 3}")
    print(f"✅ JSON file: {JSON_TRANSLATED_PATH}")
    print(f"✅ SQL file: {SQL_OUTPUT_PATH}")
    print(f"\nNext steps:")
    print(f"  1. Review SQL file: {SQL_OUTPUT_PATH}")
    print(f"  2. Copy entire SQL content")
    print(f"  3. Paste in Supabase SQL Editor")
    print(f"  4. Click Run")
    print("="*80 + "\n")

if __name__ == '__main__':
    main()
```

**Checklist:**
- [ ] File created at `scripts/bulk_import_with_translation.py`
- [ ] All imports present
- [ ] OpenAI integration correct
- [ ] No syntax errors

---

### STEP 3: Set OpenAI API Key (5 min)

**File:** PowerShell / Terminal

**ACTION:** Set environment variable:

```powershell
# PowerShell (Windows)
$env:OPENAI_API_KEY = "sk-your-actual-key-here"

# OR in cmd.exe
set OPENAI_API_KEY=sk-your-actual-key-here

# OR Linux/Mac
export OPENAI_API_KEY="sk-your-actual-key-here"
```

**Verify it's set:**
```powershell
$env:OPENAI_API_KEY
```

**Checklist:**
- [ ] API key set correctly
- [ ] Can verify with echo command

---

### STEP 4: Run Translation Script (10-20 min)

**File:** Terminal

**ACTION:** Execute:

```bash
cd C:\Dev\KetoCakR
python scripts/bulk_import_with_translation.py
```

**Expected Output:**
```
================================================================================
BULK RECIPE IMPORT WITH OPENAI TRANSLATION
================================================================================

[STEP 1] Loading recipes from JSON...
✅ Loaded 152 recipes

[STEP 2] Processing recipes and translating to English...
⏳ This may take 2-5 minutes...

[1/152] Processing: Ягодова панакота
  Translating name...
  Translating ingredients...
  Translating instructions...
...
[152/152] Processing: [Last recipe]

✅ Processed 152 recipes

[STEP 3] Saving translated recipes...
✅ Translated JSON saved

[STEP 4] Generating complete SQL...
[STEP 5] Saving SQL...
✅ SQL saved

================================================================================
IMPORT COMPLETE
================================================================================
✅ Recipes processed: 152
✅ Translations completed: 456
✅ JSON file: scripts/output/recipes_translated.json
✅ SQL file: scripts/output/recipes_complete_with_translations.sql

Next steps:
  1. Review SQL file
  2. Copy entire SQL content
  3. Paste in Supabase SQL Editor
  4. Click Run
================================================================================
```

**Checklist:**
- [ ] Script runs without errors
- [ ] 152 recipes processed
- [ ] 456 translations completed
- [ ] SQL file created
- [ ] JSON file created

---

### STEP 5: Review Generated SQL (20 min)

**File:** `scripts/output/recipes_complete_with_translations.sql`

**ACTION:** Verify SQL structure:

```bash
# Check first 200 lines
Get-Content -Path "scripts/output/recipes_complete_with_translations.sql" -Head 200
```

**Should see:**
```sql
BEGIN;

INSERT INTO base_recipes (
  id,
  name,
  name_en,
  ingredients_text_bg,
  ingredients_text_en,
  description,
  description_en,
  image_url,
  ...
) VALUES (
  'uuid-here',
  E'Ягодова панакота',
  E'Berry Panna Cotta',
  E'200 мл сливки...',
  E'200 ml cream...',
  ...
);
```

**Checklist:**
- [ ] SQL properly formatted
- [ ] name_en filled
- [ ] ingredients_text_en filled
- [ ] description_en filled
- [ ] All quotes escaped
- [ ] No obvious errors

---

### STEP 6: Execute SQL in Supabase (30 min)

**File:** Supabase Console → SQL Editor

**ACTION 1:** Get SQL content:

```bash
Get-Content -Path "scripts/output/recipes_complete_with_translations.sql" | Set-Clipboard
```

**ACTION 2:** Open Supabase SQL Editor:
- Go to https://supabase.com
- Select your project
- → SQL Editor
- Paste entire SQL

**ACTION 3:** Click "Run"

**Expected:**
```
Query executed successfully
Rows affected: 152+
```

**Checklist:**
- [ ] SQL copied
- [ ] Pasted in Supabase
- [ ] No errors
- [ ] Rows affected > 0

---

### STEP 7: Verify in Database (20 min)

**File:** Supabase SQL Editor

**ACTION 1:** Count recipes:

```sql
SELECT COUNT(*) as total, 
       COUNT(CASE WHEN is_simple_recipe=true THEN 1 END) as simple_recipes
FROM base_recipes 
WHERE name NOT IN (SELECT name FROM base_recipes LIMIT 10); -- Exclude old test data
```

**ACTION 2:** Check translations:

```sql
SELECT name, name_en, ingredients_text_en, description_en 
FROM base_recipes 
WHERE is_simple_recipe=true 
LIMIT 1;
```

**Should show:** Name in BG and EN, ingredients and description in both languages

**ACTION 3:** Count instructions:

```sql
SELECT COUNT(*) FROM recipe_instruction_steps 
WHERE recipe_id IN (SELECT id FROM base_recipes WHERE is_simple_recipe=true);
```

**Checklist:**
- [ ] 152 simple recipes inserted
- [ ] name_en populated
- [ ] ingredients_text_en populated
- [ ] description_en populated
- [ ] Instructions inserted

---

### STEP 8: Test on Mobile App (30 min)

**File:** Mobile App

**ACTION 1:** Restart app:

```bash
npx expo start --clear
```

**ACTION 2:** Navigate to recipes:

- [ ] New recipes visible in search
- [ ] Recipe names show (BG)
- [ ] Open recipe detail
- [ ] Ingredients display
- [ ] Instructions display
- [ ] Images load

**ACTION 3:** Test filter:

- [ ] Filter by language (if implemented)
- [ ] All recipes appear

**Checklist:**
- [ ] Recipes visible
- [ ] Data displays correctly
- [ ] No errors
- [ ] Both languages work (if tested)

---

## VERIFICATION CHECKLIST

### Code:
- [ ] Python script created and runs
- [ ] OpenAI translations successful (456 translations)
- [ ] SQL generated without errors
- [ ] JSON output valid

### Database:
- [ ] 152 recipes in base_recipes
- [ ] All name_en populated
- [ ] All ingredients_text_en populated
- [ ] All description_en populated
- [ ] Recipe_instruction_steps populated

### Mobile:
- [ ] New recipes visible
- [ ] All details display
- [ ] No console errors
- [ ] Images load

---

## COST ANALYSIS

```
OpenAI gpt-4o-mini Translation Cost:
  - 152 recipes × 3 translations = 456 API calls
  - Average tokens per translation: ~100 input + ~100 output = 200 tokens
  - Total tokens: 456 × 200 = ~91,200 tokens
  - Cost: 91,200 tokens / 1M × $0.15 = ~$0.0137 (LESS THAN 2 CENTS!)

Total script execution: ~3-5 minutes
Total cost: < $0.02
Total recipes: 152 ✅
Total translations: 456 ✅
```

---

## TIMELINE

| Step | Task | Time |
|------|------|------|
| 1 | Verify JSON | 5m |
| 2 | Create script | 30m |
| 3 | Set API key | 5m |
| 4 | Run translation | 10-20m |
| 5 | Review SQL | 20m |
| 6 | Execute in Supabase | 30m |
| 7 | Verify in DB | 20m |
| 8 | Test on mobile | 30m |
| **TOTAL** | **Complete** | **2.5-3h** |

---

## SUCCESS CRITERIA

✅ **Task complete when:**

1. ✅ 152 recipes loaded from JSON
2. ✅ 456 OpenAI translations completed
3. ✅ SQL generated with all fields populated
4. ✅ SQL executed in Supabase
5. ✅ name_en field populated for all recipes
6. ✅ ingredients_text_en field populated
7. ✅ description_en field populated
8. ✅ 152 recipes visible in base_recipes table
9. ✅ Mobile app shows all recipes
10. ✅ Total cost < $0.02 USD

---

**EXECUTE STEPS 1-8 IN ORDER. This will create complete, translated recipes!** 🚀

Generated: 2026-05-23
Priority: CRITICAL
Status: READY FOR EXECUTION
Estimated Cost: < $0.02 USD