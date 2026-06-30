#!/usr/bin/env python3
"""
PDF Parser v2: Column-aware extraction with correct page offset
- TOC parsed from both PDF pages 2 and 3
- Page offset: PDF page = book_page + 3 (cover + 2 TOC pages)
- 2-column layout: ingredients LEFT, directions RIGHT via bbox crop
"""

import os
import json
import re
import uuid
from datetime import datetime

try:
    import pdfplumber
except ImportError:
    os.system("pip install pdfplumber")
    import pdfplumber

PDF_PATH = r"C:\Dev\KetoCakr\admin\notes\Испанска_кето_книга.pdf"
OUTPUT_JSON = "scripts/output/recipes_76_clean.json"
OUTPUT_DEBUG = "scripts/output/toc_v2_debug.json"

# PDF page (1-indexed) = book_page + PAGE_OFFSET
PAGE_OFFSET = 3

# ============================================================================
# TOC PARSING
# ============================================================================

def parse_toc(pdf_path):
    """Parse TOC from PDF pages 2 and 3 (indices 1 and 2)."""
    recipes = []

    with pdfplumber.open(pdf_path) as pdf:
        for toc_idx in [1, 2]:
            page = pdf.pages[toc_idx]
            text = page.extract_text() or ""
            for line in text.split('\n'):
                line = line.strip()
                if not line:
                    continue
                m = re.search(r'^(.+?)\s+(\d+)\s*$', line)
                if not m:
                    continue
                name = m.group(1).strip()
                book_page = int(m.group(2))
                # Skip header lines
                if len(name) <= 3 or name in ('Contents',):
                    continue
                recipes.append({
                    'name': name,
                    'book_page': book_page,
                    'pdf_page': book_page + PAGE_OFFSET,
                    'index': len(recipes) + 1,
                })

    return recipes

# ============================================================================
# RECIPE EXTRACTION
# ============================================================================

def extract_recipe(pdf, name, book_page):
    """
    Extract recipe data using column-aware crop.
    PDF uses 2-column layout: ingredients LEFT, directions RIGHT.
    """
    pdf_idx = book_page + PAGE_OFFSET - 1  # 0-indexed

    result = {
        'name': name,
        'book_page': book_page,
        'servings': 8,
        'cook_time_minutes': 0,
        'ingredients': [],
        'directions': [],
    }

    if pdf_idx >= len(pdf.pages):
        print(f"    ⚠️  Page {book_page} (PDF {pdf_idx+1}) out of range")
        return result

    # Try the main page, then also the next page if content is missing
    for page_attempt in [pdf_idx, pdf_idx + 1]:
        if page_attempt >= len(pdf.pages):
            break

        page = pdf.pages[page_attempt]
        width = page.width
        height = page.height

        text = page.extract_text() or ""
        if not text:
            continue

        # --- Parse serving size and cook time ---
        m = re.search(r'Serving size[:\s]*([^\|]+)', text, re.IGNORECASE)
        if m:
            sm = re.search(r'(\d+)', m.group(1))
            if sm:
                result['servings'] = int(sm.group(1))

        m = re.search(r'Cook time[:\s]*(\d+)', text, re.IGNORECASE)
        if m:
            result['cook_time_minutes'] = int(m.group(1))

        # --- Find Y position of the "Ingredients Directions" header ---
        words = page.extract_words()
        col_y = None
        for w in words:
            if w['text'] in ('Ingredients', 'Directions', 'Съставки',
                             'Ingredientes', 'Preparación', 'Elaboración'):
                col_y = w['top']
                break

        if col_y is None:
            # Fallback: skip the top 25% (title + meta)
            col_y = height * 0.25

        y_start = col_y + 6
        y_end = height - 30   # exclude page-number footer

        # Left half → ingredients
        left = page.crop((0, y_start, width * 0.46, y_end))
        # Right half → directions
        right = page.crop((width * 0.46, y_start, width, y_end))

        left_text = left.extract_text() or ""
        right_text = right.extract_text() or ""

        ingredients = [
            ln.strip() for ln in left_text.split('\n')
            if ln.strip() and len(ln.strip()) > 2
        ]
        directions = [
            ln.strip() for ln in right_text.split('\n')
            if ln.strip() and len(ln.strip()) > 5
        ]

        if ingredients:
            result['ingredients'] = ingredients
        if directions:
            result['directions'] = directions

        # Stop if both found
        if result['ingredients'] and result['directions']:
            break

    return result

# ============================================================================
# MAIN
# ============================================================================

def main():
    print("\n" + "="*80)
    print("PDF PARSER v2: Column-Aware Extraction")
    print("="*80)

    # Step 1: Parse TOC
    print("\n[STEP 1] Parsing TOC (PDF pages 2-3)...")
    with pdfplumber.open(PDF_PATH) as pdf:
        total_pages = len(pdf.pages)
        print(f"  PDF total pages: {total_pages}")

    recipes_toc = parse_toc(PDF_PATH)
    print(f"\n✅ Found {len(recipes_toc)} recipes in TOC\n")
    for r in recipes_toc:
        print(f"  {r['index']:3}. {r['name']} → book p.{r['book_page']} (PDF p.{r['pdf_page']})")

    with open(OUTPUT_DEBUG, 'w', encoding='utf-8') as f:
        json.dump(recipes_toc, f, ensure_ascii=False, indent=2)
    print(f"\n📁 TOC debug saved: {OUTPUT_DEBUG}")

    # Step 2: Extract each recipe
    print(f"\n[STEP 2] Extracting {len(recipes_toc)} recipes...")
    recipes = []

    with pdfplumber.open(PDF_PATH) as pdf:
        for i, toc in enumerate(recipes_toc, 1):
            print(f"\n[{i}/{len(recipes_toc)}] {toc['name']} (book p.{toc['book_page']})")
            data = extract_recipe(pdf, toc['name'], toc['book_page'])
            data['id'] = str(uuid.uuid4())
            data['created_at'] = datetime.now().isoformat()
            recipes.append(data)
            print(f"  Ingredients: {len(data['ingredients'])}  |  "
                  f"Directions: {len(data['directions'])}  |  "
                  f"Servings: {data['servings']}  |  "
                  f"Cook time: {data['cook_time_minutes']} min")

    # Step 3: Validate
    print(f"\n[STEP 3] Validation...")
    valid, invalid = [], []
    for r in recipes:
        errs = []
        if not r['ingredients']:
            errs.append("no ingredients")
        if not r['directions']:
            errs.append("no directions")
        if errs:
            invalid.append((r['name'], errs))
        else:
            valid.append(r)

    print(f"✅ Valid:   {len(valid)}")
    print(f"⚠️  Invalid: {len(invalid)}")
    for name, errs in invalid:
        print(f"  - {name}: {', '.join(errs)}")

    # Step 4: Save all (valid + invalid) so nothing is lost
    all_output = recipes  # save all, flag invalid ones
    for r in all_output:
        r['parse_errors'] = []
    for name, errs in invalid:
        for r in all_output:
            if r['name'] == name:
                r['parse_errors'] = errs

    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(all_output, f, ensure_ascii=False, indent=2)

    # Summary
    print("\n" + "="*80)
    print("PARSE COMPLETE")
    print("="*80)
    print(f"✅ Total in TOC:     {len(recipes_toc)}")
    print(f"✅ Total extracted:  {len(recipes)}")
    print(f"✅ Fully valid:      {len(valid)}")
    print(f"⚠️  Missing data:     {len(invalid)}")

    if valid:
        avg_ing = sum(len(r['ingredients']) for r in valid) / len(valid)
        avg_dir = sum(len(r['directions']) for r in valid) / len(valid)
        avg_ct  = sum(r['cook_time_minutes'] for r in valid) / len(valid)
        print(f"\n📊 Stats (valid recipes):")
        print(f"  Avg ingredients:  {avg_ing:.1f}")
        print(f"  Avg directions:   {avg_dir:.1f}")
        print(f"  Avg cook time:    {avg_ct:.0f} min")

    print(f"\n📁 Output: {OUTPUT_JSON}")
    print("="*80)

if __name__ == '__main__':
    main()
