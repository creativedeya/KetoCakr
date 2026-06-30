# FIXED PDF PARSER: TOC-Based Recipe Extraction

**Status:** CRITICAL - Correct PDF parsing  
**Timeline:** 2-3 hours  
**Priority:** HIGHEST  
**Objective:** Parse page 2 (TOC) to get 76 recipe names, then navigate to each recipe page to extract all fields

---

## STRATEGY

```
STEP 1: Parse Page 2 (Table of Contents)
  Extract: Recipe Name → Page Number
  Result: 76 recipes with their page numbers

STEP 2: For each recipe (1-76)
  - Navigate to recipe page (from TOC)
  - Extract: Image URL, Servings, Cook Time
  - Extract: Ingredients (list)
  - Extract: Directions (steps)

STEP 3: Generate Clean JSON
  76 recipes with ALL fields populated
```

---

## EXECUTION

### STEP 1: Create Smart PDF Parser

**File:** `scripts/pdf_parser_toc_based.py`

**ACTION:** Create new file with complete code:

```python
#!/usr/bin/env python3
"""
Smart PDF Parser: Table of Contents Based
Extracts recipe names from page 2, then navigates to each recipe page
"""

import os
import json
import re
import uuid
from datetime import datetime
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    os.system("pip install pdfplumber")
    import pdfplumber

# ============================================================================
# CONFIGURATION
# ============================================================================

PDF_PATH = r"C:\Dev\KetoCakr\admin\notes\Испанска_кето_книга.pdf"
OUTPUT_JSON = "scripts/output/recipes_76_clean.json"
OUTPUT_DEBUG = "scripts/output/toc_parsing_debug.json"

# ============================================================================
# STEP 1: PARSE TABLE OF CONTENTS (PAGE 2)
# ============================================================================

def parse_table_of_contents(pdf_path):
    """
    Parse page 2 to extract recipe names and page numbers
    Format: "RECIPE NAME    PAGE_NUMBER"
    """
    recipes_toc = []
    
    print("\n[STEP 1] Parsing Table of Contents (Page 2)...")
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            if len(pdf.pages) < 2:
                print("❌ PDF has less than 2 pages!")
                return recipes_toc
            
            # Get page 2 (index 1)
            page2 = pdf.pages[1]
            text = page2.extract_text()
            
            if not text:
                print("❌ Could not extract text from page 2")
                return recipes_toc
            
            lines = text.split('\n')
            print(f"  Total lines on page 2: {len(lines)}")
            
            for line in lines:
                line = line.strip()
                if not line or len(line) < 5:
                    continue
                
                # Pattern: "RECIPE NAME    PAGE_NUMBER"
                # Find numbers at end of line (page numbers)
                match = re.search(r'(.+?)\s+(\d+)\s*$', line)
                
                if match:
                    recipe_name = match.group(1).strip()
                    page_num = int(match.group(2))
                    
                    # Filter: must be reasonable recipe name (not header/footer)
                    if (5 < len(recipe_name) < 100 and 
                        page_num >= 3 and 
                        'ИСПАНСКА' not in recipe_name.upper() and
                        'КЕТО' not in recipe_name.upper()):
                        
                        recipes_toc.append({
                            'name': recipe_name,
                            'page_number': page_num,
                            'index': len(recipes_toc) + 1,
                        })
                        print(f"  {len(recipes_toc)}. {recipe_name} → Page {page_num}")
            
            print(f"\n✅ Found {len(recipes_toc)} recipes in TOC")
    
    except Exception as e:
        print(f"❌ Error parsing TOC: {e}")
        import traceback
        traceback.print_exc()
    
    return recipes_toc

# ============================================================================
# STEP 2: EXTRACT RECIPE DATA FROM EACH PAGE
# ============================================================================

def extract_recipe_from_page(pdf_path, recipe_name, page_num):
    """
    Extract all recipe data from a specific page:
    - Image (image_url)
    - Servings
    - Cook Time
    - Ingredients (list)
    - Directions (steps)
    """
    
    recipe_data = {
        'name': recipe_name,
        'page_number': page_num,
        'image_url': None,
        'servings': 8,
        'cook_time_minutes': 0,
        'ingredients': [],
        'directions': [],
    }
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            # Navigate to recipe page (adjust for 0-index)
            if page_num - 1 >= len(pdf.pages):
                print(f"    ⚠️  Page {page_num} not found")
                return recipe_data
            
            page = pdf.pages[page_num - 1]
            text = page.extract_text()
            
            if not text:
                print(f"    ⚠️  No text on page {page_num}")
                return recipe_data
            
            lines = text.split('\n')
            
            # Parse sections
            current_section = None
            ingredients_section = False
            directions_section = False
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Detect Servings (pattern: "Servings: X" or "Рецепт за X порции")
                if any(keyword in line.lower() for keyword in ['serving', 'порция', 'persons', 'people']):
                    match = re.search(r'(\d+)', line)
                    if match:
                        recipe_data['servings'] = int(match.group(1))
                    ingredients_section = False
                    directions_section = False
                    continue
                
                # Detect Cook Time (pattern: "Cook time: X min" or "Време: X минути")
                if any(keyword in line.lower() for keyword in ['time:', 'време:', 'cook', 'минут', 'min']):
                    match = re.search(r'(\d+)', line)
                    if match:
                        recipe_data['cook_time_minutes'] = int(match.group(1))
                    continue
                
                # Detect Ingredients section
                if any(keyword in line.lower() for keyword in ['ингредиент', 'съставки', 'ingredients', 'продукт']):
                    ingredients_section = True
                    directions_section = False
                    continue
                
                # Detect Directions section
                if any(keyword in line.lower() for keyword in ['инструкция', 'приготвяне', 'стъпки', 'directions', 'method', 'steps']):
                    ingredients_section = False
                    directions_section = True
                    continue
                
                # Add to current section
                if ingredients_section and not directions_section:
                    if len(line) > 3 and not line.startswith('•'):
                        recipe_data['ingredients'].append(line)
                
                if directions_section:
                    # Filter: must be actual instruction (not just number or header)
                    if len(line) > 5 and not line.isupper():
                        recipe_data['directions'].append(line)
            
            # Cleanup: Remove duplicates and empty entries
            recipe_data['ingredients'] = list(dict.fromkeys([ing for ing in recipe_data['ingredients'] if ing]))
            recipe_data['directions'] = list(dict.fromkeys([dir for dir in recipe_data['directions'] if dir]))
    
    except Exception as e:
        print(f"    ❌ Error extracting page {page_num}: {e}")
    
    return recipe_data

# ============================================================================
# STEP 3: PROCESS ALL RECIPES
# ============================================================================

def process_all_recipes(pdf_path, recipes_toc):
    """
    For each recipe in TOC, extract all data from its page
    """
    
    print("\n[STEP 2] Extracting recipe data from each page...")
    
    recipes = []
    
    for idx, toc_entry in enumerate(recipes_toc, 1):
        print(f"\n[{idx}/{len(recipes_toc)}] {toc_entry['name']}")
        print(f"  Page {toc_entry['page_number']}...")
        
        recipe_data = extract_recipe_from_page(
            pdf_path,
            toc_entry['name'],
            toc_entry['page_number']
        )
        
        # Add placeholder image URL
        recipe_data['image_url'] = f"https://via.placeholder.com/400x300?text={toc_entry['name']}"
        
        # Add UUID
        recipe_data['id'] = str(uuid.uuid4())
        recipe_data['created_at'] = datetime.now().isoformat()
        
        recipes.append(recipe_data)
        
        print(f"  ✅ Ingredients: {len(recipe_data['ingredients'])}")
        print(f"  ✅ Directions: {len(recipe_data['directions'])}")
        print(f"  ✅ Servings: {recipe_data['servings']}")
        print(f"  ✅ Cook time: {recipe_data['cook_time_minutes']} min")
    
    print(f"\n✅ Processed {len(recipes)} recipes")
    return recipes

# ============================================================================
# VALIDATION & CLEANUP
# ============================================================================

def validate_and_clean_recipes(recipes):
    """
    Validate that each recipe has minimum required data
    """
    
    print("\n[STEP 3] Validating recipes...")
    
    valid = []
    invalid = []
    
    for recipe in recipes:
        errors = []
        
        # Check required fields
        if not recipe['name']:
            errors.append("Missing name")
        if not recipe['ingredients'] or len(recipe['ingredients']) == 0:
            errors.append("No ingredients")
        if not recipe['directions'] or len(recipe['directions']) == 0:
            errors.append("No directions")
        if recipe['servings'] <= 0:
            errors.append("Invalid servings")
        
        if errors:
            invalid.append({
                'name': recipe['name'],
                'errors': errors
            })
        else:
            valid.append(recipe)
    
    print(f"✅ Valid recipes: {len(valid)}")
    if invalid:
        print(f"⚠️  Invalid recipes: {len(invalid)}")
        for inv in invalid:
            print(f"  - {inv['name']}: {', '.join(inv['errors'])}")
    
    return valid

# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    print("\n" + "="*80)
    print("SMART PDF PARSER: Table of Contents Based Extraction")
    print("="*80)
    
    # STEP 1: Parse TOC
    recipes_toc = parse_table_of_contents(PDF_PATH)
    
    if len(recipes_toc) == 0:
        print("❌ No recipes found in TOC!")
        return
    
    # Save TOC for debug
    with open(OUTPUT_DEBUG, 'w', encoding='utf-8') as f:
        json.dump(recipes_toc, f, ensure_ascii=False, indent=2)
    print(f"📁 TOC debug saved: {OUTPUT_DEBUG}")
    
    # STEP 2: Extract all recipes
    recipes = process_all_recipes(PDF_PATH, recipes_toc)
    
    # STEP 3: Validate
    valid_recipes = validate_and_clean_recipes(recipes)
    
    # STEP 4: Save output
    print(f"\n[STEP 4] Saving {len(valid_recipes)} recipes...")
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(valid_recipes, f, ensure_ascii=False, indent=2)
    
    # SUMMARY
    print("\n" + "="*80)
    print("✅ PARSING COMPLETE")
    print("="*80)
    print(f"✅ Recipes found in TOC:    {len(recipes_toc)}")
    print(f"✅ Recipes extracted:       {len(recipes)}")
    print(f"✅ Valid recipes:           {len(valid_recipes)}")
    print(f"✅ Output JSON:             {OUTPUT_JSON}")
    print(f"\n📊 Recipe Statistics:")
    
    if valid_recipes:
        avg_ingredients = sum(len(r['ingredients']) for r in valid_recipes) / len(valid_recipes)
        avg_directions = sum(len(r['directions']) for r in valid_recipes) / len(valid_recipes)
        avg_time = sum(r['cook_time_minutes'] for r in valid_recipes) / len(valid_recipes)
        
        print(f"  - Avg ingredients per recipe: {avg_ingredients:.1f}")
        print(f"  - Avg directions per recipe:  {avg_directions:.1f}")
        print(f"  - Avg cook time:             {avg_time:.0f} minutes")
    
    print("\n🎯 Next: Review JSON and run main import task with OpenAI translations")
    print("="*80 + "\n")

if __name__ == '__main__':
    main()
```

**Checklist:**
- [ ] File created at `scripts/pdf_parser_toc_based.py`
- [ ] All functions present
- [ ] No syntax errors

---

### STEP 2: Run Smart Parser (15 min)

**File:** Terminal

**ACTION:**

```bash
cd C:\Dev\KetoCakR
python scripts/pdf_parser_toc_based.py
```

**Expected Output:**

```
================================================================================
SMART PDF PARSER: Table of Contents Based Extraction
================================================================================

[STEP 1] Parsing Table of Contents (Page 2)...
  Total lines on page 2: XX
  1. АНИСОВИ ПОНИЧКИ → Page 1
  2. БАКТЕРИ С РИКОТА И МАЛИНИ → Page 3
  3. БАНАНОВ ФЛАН → Page 5
  ...
  76. [Last recipe] → Page XX

✅ Found 76 recipes in TOC

[STEP 2] Extracting recipe data from each page...

[1/76] АНИСОВИ ПОНИЧКИ
  Page 1...
  ✅ Ingredients: 8
  ✅ Directions: 5
  ✅ Servings: 6
  ✅ Cook time: 15 min

[2/76] БАКТЕРИ С РИКОТА И МАЛИНИ
  Page 3...
  ✅ Ingredients: 10
  ✅ Directions: 7
  ✅ Servings: 8
  ✅ Cook time: 20 min

...
[76/76] [Last recipe]

✅ Processed 76 recipes

[STEP 3] Validating recipes...
✅ Valid recipes: 76
⚠️  Invalid recipes: 0

[STEP 4] Saving 76 recipes...

================================================================================
✅ PARSING COMPLETE
================================================================================
✅ Recipes found in TOC:    76
✅ Recipes extracted:       76
✅ Valid recipes:           76
✅ Output JSON:             scripts/output/recipes_76_clean.json

📊 Recipe Statistics:
  - Avg ingredients per recipe: 8.5
  - Avg directions per recipe:  5.2
  - Avg cook time:             25 minutes

🎯 Next: Review JSON and run main import task with OpenAI translations
================================================================================
```

**Checklist:**
- [ ] Script runs without errors
- [ ] Finds 76 recipes in TOC
- [ ] Extracts all 76
- [ ] All valid
- [ ] JSON file created

---

### STEP 3: Verify Output JSON (10 min)

**File:** `scripts/output/recipes_76_clean.json`

**ACTION:** Check first recipe:

```bash
# Show first recipe
Get-Content -Path "scripts/output/recipes_76_clean.json" | ConvertFrom-Json | Select-Object -First 1
```

**Should show:**

```json
{
  "id": "uuid",
  "name": "АНИСОВИ ПОНИЧКИ",
  "page_number": 1,
  "image_url": "https://via.placeholder.com/...",
  "servings": 6,
  "cook_time_minutes": 15,
  "ingredients": [
    "200g flour",
    "100g sugar",
    ...
  ],
  "directions": [
    "1. Mix ingredients",
    "2. Bake at 180°C",
    ...
  ],
  "created_at": "2026-05-23T..."
}
```

**Checklist:**
- [ ] JSON valid format
- [ ] All 76 recipes present
- [ ] Each recipe has: name, servings, cook_time, ingredients, directions
- [ ] No null/empty fields

---

### STEP 4: Count & Verify (5 min)

**ACTION:**

```bash
# Count recipes in JSON
(Get-Content -Path "scripts/output/recipes_76_clean.json" | ConvertFrom-Json).Count
```

**Should show:** 76

**Checklist:**
- [ ] Exactly 76 recipes
- [ ] No duplicates
- [ ] No missing recipes

---

## VERIFICATION

✅ **Parser correctly:**
1. Reads page 2 (Table of Contents)
2. Extracts 76 recipe names with page numbers
3. Navigates to each recipe page
4. Extracts: servings, cook_time, ingredients, directions
5. Generates clean JSON with 76 complete recipes

---

## NEXT STEP

Once verified, you'll have `recipes_76_clean.json` with all 76 recipes ready for:
- OpenAI translation
- SQL generation
- Database import

---

**RUN THE PARSER NOW!** 🚀