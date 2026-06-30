# DEBUG TASK: Find Duplicate Recipes in PDF Parser

**Status:** DEBUG - Identify duplicates  
**Timeline:** 30 minutes  
**Priority:** HIGH  
**Objective:** Parse PDF, find duplicated recipes, show which ones appear 2x, generate clean deduplicated list

---

## OBJECTIVE

```
PDF contains: 76 unique recipes ✅
Parser outputs: 152 recipes ❌ (2x duplicates)

Task: Find and list the duplicates
```

---

## EXECUTION

### STEP 1: Create Debug Script

**File:** `scripts/debug_pdf_duplicates.py`

**ACTION:** Create new file:

```python
#!/usr/bin/env python3
"""
Debug Script: Find Duplicate Recipes in PDF
"""

import os
import json
from collections import defaultdict
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
OUTPUT_DEBUG_JSON = "scripts/output/debug_recipes_raw.json"
OUTPUT_DUPLICATES_JSON = "scripts/output/debug_duplicates.json"
OUTPUT_UNIQUE_JSON = "scripts/output/recipes_unique_76.json"

# ============================================================================
# PDF PARSING
# ============================================================================

def parse_pdf_simple(pdf_path):
    """Parse PDF and extract raw recipe data"""
    recipes = []
    
    print(f"Opening: {pdf_path}")
    
    if not os.path.exists(pdf_path):
        print(f"❌ File not found: {pdf_path}")
        return recipes
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            print(f"Total pages: {len(pdf.pages)}\n")
            
            current_recipe = None
            current_section = None
            
            for page_num, page in enumerate(pdf.pages):
                text = page.extract_text()
                
                if not text:
                    continue
                
                print(f"Page {page_num + 1}: Extracting text...")
                lines = text.split('\n')
                
                for line in lines:
                    line = line.strip()
                    if not line or len(line) < 2:
                        continue
                    
                    # Skip section headers
                    if any(keyword in line.lower() for keyword in ['ингредиент', 'съставки', 'инструкция', 'приготвяне', 'стъпки']):
                        continue
                    
                    # Detect recipe name (short, capital, new recipe)
                    if current_recipe is None and 3 < len(line) < 120:
                        if any(c.isupper() for c in line[:5]):
                            current_recipe = {
                                'name': line,
                                'page': page_num + 1,
                            }
                            print(f"  Found recipe: {line}")
                            recipes.append(current_recipe)
                            current_recipe = None
    
    except Exception as e:
        print(f"Error: {e}")
    
    return recipes

# ============================================================================
# DUPLICATE DETECTION
# ============================================================================

def find_duplicates(recipes):
    """Find duplicate recipe names"""
    
    name_count = defaultdict(int)
    duplicates = defaultdict(list)
    
    # Count occurrences
    for idx, recipe in enumerate(recipes):
        name = recipe['name']
        name_count[name] += 1
        duplicates[name].append(idx)
    
    # Filter to show only duplicates
    duplicate_recipes = {name: indices for name, indices in duplicates.items() if name_count[name] > 1}
    
    return name_count, duplicate_recipes

# ============================================================================
# DEDUPLICATION
# ============================================================================

def deduplicate_recipes(recipes):
    """Keep only first occurrence of each recipe"""
    
    seen = set()
    unique = []
    duplicates_removed = []
    
    for recipe in recipes:
        name = recipe['name']
        if name not in seen:
            unique.append(recipe)
            seen.add(name)
        else:
            duplicates_removed.append(recipe)
    
    return unique, duplicates_removed

# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    print("\n" + "="*80)
    print("DEBUG: Find Duplicate Recipes in PDF")
    print("="*80 + "\n")
    
    # STEP 1: Parse PDF
    print("[STEP 1] Parsing PDF...")
    recipes = parse_pdf_simple(PDF_PATH)
    print(f"✅ Found {len(recipes)} recipes\n")
    
    if len(recipes) == 0:
        print("❌ No recipes found!")
        return
    
    # STEP 2: Save raw data
    print("[STEP 2] Saving raw recipe data...")
    with open(OUTPUT_DEBUG_JSON, 'w', encoding='utf-8') as f:
        json.dump(recipes, f, ensure_ascii=False, indent=2)
    print(f"✅ Saved: {OUTPUT_DEBUG_JSON}\n")
    
    # STEP 3: Find duplicates
    print("[STEP 3] Analyzing for duplicates...")
    name_count, duplicate_recipes = find_duplicates(recipes)
    
    unique_count = len([name for name, count in name_count.items() if count == 1])
    duplicate_count = len(duplicate_recipes)
    
    print(f"✅ Unique recipes: {unique_count}")
    print(f"✅ Duplicated recipes: {duplicate_count}")
    print(f"✅ Total parsed: {len(recipes)}\n")
    
    # STEP 4: Display duplicates
    if duplicate_recipes:
        print("[STEP 4] DUPLICATED RECIPES:")
        print("="*80)
        for idx, (name, indices) in enumerate(sorted(duplicate_recipes.items()), 1):
            print(f"\n{idx}. {name}")
            for occurrence, recipe_idx in enumerate(indices, 1):
                print(f"   Occurrence {occurrence}: Page {recipes[recipe_idx]['page']}")
        print("\n" + "="*80 + "\n")
        
        # Save duplicates list
        duplicates_list = []
        for name, indices in duplicate_recipes.items():
            duplicates_list.append({
                'name': name,
                'occurrences': len(indices),
                'pages': [recipes[idx]['page'] for idx in indices],
                'indices': indices
            })
        
        with open(OUTPUT_DUPLICATES_JSON, 'w', encoding='utf-8') as f:
            json.dump(duplicates_list, f, ensure_ascii=False, indent=2)
        print(f"✅ Duplicates list saved: {OUTPUT_DUPLICATES_JSON}\n")
    else:
        print("✅ No duplicates found!\n")
    
    # STEP 5: Deduplicate
    print("[STEP 5] Deduplicating (keeping first occurrence)...")
    unique_recipes, removed = deduplicate_recipes(recipes)
    print(f"✅ Unique recipes: {len(unique_recipes)}")
    print(f"✅ Duplicates removed: {len(removed)}\n")
    
    # Save unique recipes
    print("[STEP 6] Saving deduplicated recipes...")
    with open(OUTPUT_UNIQUE_JSON, 'w', encoding='utf-8') as f:
        json.dump(unique_recipes, f, ensure_ascii=False, indent=2)
    print(f"✅ Saved: {OUTPUT_UNIQUE_JSON}\n")
    
    # SUMMARY
    print("="*80)
    print("DEBUG SUMMARY")
    print("="*80)
    print(f"✅ Total parsed from PDF:    {len(recipes)}")
    print(f"✅ Unique recipes found:     {len(unique_recipes)}")
    print(f"✅ Duplicates removed:       {len(removed)}")
    print(f"\n📁 Output files:")
    print(f"  1. Raw recipes:            {OUTPUT_DEBUG_JSON}")
    print(f"  2. Duplicates list:        {OUTPUT_DUPLICATES_JSON}")
    print(f"  3. Deduplicated (unique):  {OUTPUT_UNIQUE_JSON}")
    print(f"\n📝 Next steps:")
    print(f"  1. Review duplicates in:   {OUTPUT_DUPLICATES_JSON}")
    print(f"  2. Confirm deduplication correct")
    print(f"  3. Then run main import task with dedup recipes")
    print("="*80 + "\n")

if __name__ == '__main__':
    main()
```

**Checklist:**
- [ ] File created at `scripts/debug_pdf_duplicates.py`
- [ ] All imports present
- [ ] No syntax errors

---

### STEP 2: Run Debug Script (10 min)

**File:** Terminal

**ACTION:**

```bash
cd C:\Dev\KetoCakR
python scripts/debug_pdf_duplicates.py
```

**Expected Output:**

```
================================================================================
DEBUG: Find Duplicate Recipes in PDF
================================================================================

[STEP 1] Parsing PDF...
✅ Found 152 recipes

[STEP 2] Saving raw recipe data...
✅ Saved: scripts/output/debug_recipes_raw.json

[STEP 3] Analyzing for duplicates...
✅ Unique recipes: 76
✅ Duplicated recipes: XX

[STEP 4] DUPLICATED RECIPES:
1. Ягодова панакота
   Occurrence 1: Page 5
   Occurrence 2: Page 25
...

✅ Duplicates list saved: scripts/output/debug_duplicates.json

[STEP 5] Deduplicating...
✅ Unique recipes: 76
✅ Duplicates removed: 76

[STEP 6] Saving deduplicated recipes...
✅ Saved: scripts/output/recipes_unique_76.json

================================================================================
DEBUG SUMMARY
================================================================================
✅ Total parsed from PDF:    152
✅ Unique recipes found:     76
✅ Duplicates removed:       76
```

**Checklist:**
- [ ] Script runs without errors
- [ ] Shows 152 parsed
- [ ] Shows 76 unique
- [ ] Lists all duplicates
- [ ] Creates 3 JSON files

---

### STEP 3: Review Duplicates (10 min)

**File:** `scripts/output/debug_duplicates.json`

**ACTION:**

```bash
Get-Content -Path "scripts/output/debug_duplicates.json"
```

**Checklist:**
- [ ] Can see which recipes are duplicated
- [ ] Can see on which pages they appear 2x

---

### STEP 4: Verify Unique Recipes (5 min)

**File:** `scripts/output/recipes_unique_76.json`

**ACTION:**

```bash
(Get-Content -Path "scripts/output/recipes_unique_76.json" | ConvertFrom-Json).Count
```

**Should show:** 76

**Checklist:**
- [ ] File contains exactly 76 recipes

---

## SUCCESS CRITERIA

✅ **Debug complete when:**

1. ✅ Script finds 152 recipes from PDF
2. ✅ Identifies 76 are unique, 76 are duplicates
3. ✅ Shows which recipes are duplicated
4. ✅ Shows pages where duplicates appear
5. ✅ Creates deduplicated list (76 recipes)

---

**ПУСНИ СКРИПТА СЕГА и кажи ми какво видиш в дубликата листа!** 🔍