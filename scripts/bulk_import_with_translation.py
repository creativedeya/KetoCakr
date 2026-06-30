#!/usr/bin/env python3
"""
Bulk Recipe Import with OpenAI Translation
Loads recipes from JSON, cleans data, translates names to English,
generates SQL INSERT statements for base_recipes.

Usage:
    python bulk_import_with_translation.py

Requires:
    $env:OPENAI_API_KEY = "sk-..."   (PowerShell)
    export OPENAI_API_KEY="sk-..."   (bash)

Outputs:
    scripts/output/recipes_translated.json
    scripts/output/recipes_complete_with_translations.sql
"""

import json
import os
import re
import sys
import uuid
from datetime import datetime
from pathlib import Path

# ─── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR       = Path(__file__).parent
JSON_INPUT       = SCRIPT_DIR / "output" / "recipes_bulk_import.json"
SQL_OUTPUT       = SCRIPT_DIR / "output" / "recipes_complete_with_translations.sql"
JSON_TRANSLATED  = SCRIPT_DIR / "output" / "recipes_translated.json"

# ─── OpenAI ───────────────────────────────────────────────────────────────────
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
if not OPENAI_API_KEY:
    print("ERROR: OPENAI_API_KEY environment variable not set.")
    print("  PowerShell: $env:OPENAI_API_KEY = 'sk-...'")
    print("  bash:       export OPENAI_API_KEY='sk-...'")
    sys.exit(1)

try:
    from openai import OpenAI
except ImportError:
    print("Installing openai package...")
    os.system("pip install openai")
    from openai import OpenAI

client = OpenAI(api_key=OPENAI_API_KEY)


# ─────────────────────────────────────────────────────────────────────────────
# DATA CLEANING
# ─────────────────────────────────────────────────────────────────────────────

# Patterns that indicate a line is NOT a recipe title
_JUNK_PATTERNS = [
    re.compile(r"^ingredients\s+directions$", re.IGNORECASE),
    re.compile(r"^directions$", re.IGNORECASE),
    re.compile(r"^ingredients$", re.IGNORECASE),
    re.compile(r"\)$"),           # ends with closing paren  → fragment
    re.compile(r"\.$"),           # ends with dot            → sentence fragment
    re.compile(r"^[а-яА-Я]{2,12}$"),  # single short Cyrillic word (Орехи, Сметана…)
]

# Trailing page-number suffix like "Торта Матилда 96"  or "Лимонов ĸърд 48"
_PAGE_SUFFIX = re.compile(r"\s+\d{1,3}$")


def _is_junk(name: str) -> bool:
    """Return True if the name looks like a parsing artifact, not a recipe."""
    s = name.strip()
    if not s:
        return True
    for pattern in _JUNK_PATTERNS:
        if pattern.search(s):
            return True
    # Very short (≤3 chars) — almost certainly a fragment
    if len(s) <= 3:
        return True
    return False


def _clean_name(name: str) -> str:
    """Strip trailing page numbers and normalise whitespace."""
    return _PAGE_SUFFIX.sub("", name.strip()).strip()


def clean_and_deduplicate(recipes: list[dict]) -> list[dict]:
    """Remove junk entries and deduplicate by cleaned name."""
    seen: set[str] = set()
    cleaned: list[dict] = []

    for r in recipes:
        raw_name = r.get("name_bg") or ""
        if _is_junk(raw_name):
            continue
        clean = _clean_name(raw_name)
        if clean in seen:
            continue
        seen.add(clean)
        cleaned.append({**r, "name_bg": clean})

    return cleaned


# ─────────────────────────────────────────────────────────────────────────────
# TRANSLATION
# ─────────────────────────────────────────────────────────────────────────────

def translate_name(name_bg: str) -> str:
    """Translate a single Bulgarian recipe name to English via gpt-4o-mini."""
    if not name_bg:
        return ""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.3,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a culinary translator. Translate the Bulgarian keto dessert "
                        "recipe name to English. Keep it short and natural. "
                        "Reply with ONLY the translation — no explanations, no punctuation added."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Translate to English: {name_bg}",
                },
            ],
            max_tokens=60,
        )
        return response.choices[0].message.content.strip()
    except Exception as exc:
        print(f"  [WARN] Translation error for '{name_bg}': {exc}")
        return name_bg  # fall back to BG name rather than crashing


# ─────────────────────────────────────────────────────────────────────────────
# SQL GENERATION
# ─────────────────────────────────────────────────────────────────────────────

def _sql_str(value: str) -> str:
    """Wrap a Python string in SQL single-quotes, escaping inner quotes."""
    return "'" + value.replace("'", "''") + "'"


def generate_sql(recipes: list[dict]) -> str:
    lines: list[str] = [
        "-- ================================================================",
        "-- KetoCakR Bulk Import — base_recipes (is_simple_recipe = true)",
        f"-- Generated : {datetime.now().isoformat()}",
        f"-- Recipes   : {len(recipes)}",
        "-- ================================================================",
        "",
        "BEGIN;",
        "",
    ]

    for r in recipes:
        rid       = r["_id"]
        name_bg   = r["name_bg"]
        name_en   = r.get("name_en") or name_bg
        servings  = r.get("servings") or 8
        prep_time = r.get("prep_time_minutes") or 20
        bake_time = r.get("bake_time_minutes") or 30
        cal       = r.get("total_calories")
        cal_sql   = str(cal) if cal is not None else "NULL"

        lines += [
            f"-- {name_bg}",
            "INSERT INTO base_recipes (",
            "  id, name, name_en, is_simple_recipe,",
            "   servings, prep_time_minutes, bake_time_minutes, total_calories",
            ") VALUES (",
            f"  {_sql_str(rid)},",
            f"  {_sql_str(name_bg)},",
            f"  {_sql_str(name_en)},",
            "  TRUE,",
            f"  {servings},",
            f"  {prep_time},",
            f"  {bake_time},",
            f"  {cal_sql}",
            ") ON CONFLICT (id) DO NOTHING;",
            "",
        ]

        # Ingredients — only if present in the source data
        for idx, ing in enumerate(r.get("ingredients") or []):
            ing_name = ing.get("ingredient_name") or str(ing)
            qty      = ing.get("quantity") or 1.0
            unit     = ing.get("unit") or ""
            lines += [
                "INSERT INTO recipe_ingredients (",
                "  id, recipe_id, ingredient_name, ingredient_database_id, quantity, unit, order_index",
                ") VALUES (",
                f"  {_sql_str(str(uuid.uuid4()))},",
                f"  {_sql_str(rid)},",
                f"  {_sql_str(ing_name)},",
                "  NULL,",
                f"  {qty},",
                f"  {_sql_str(unit)},",
                f"  {idx}",
                ") ON CONFLICT (id) DO NOTHING;",
                "",
            ]

        # Steps — only if present in the source data
        for idx, step in enumerate(r.get("steps") or []):
            step_text = str(step) if not isinstance(step, dict) else (step.get("step_description_bg") or "")
            lines += [
                "INSERT INTO recipe_instruction_steps (",
                "  id, recipe_id, step_number,",
                "  step_description, step_description_bg, step_description_en, step_duration_minutes",
                ") VALUES (",
                f"  {_sql_str(str(uuid.uuid4()))},",
                f"  {_sql_str(rid)},",
                f"  {idx + 1},",
                f"  {_sql_str(step_text)},",
                f"  {_sql_str(step_text)},",
                "  '',",
                "  5",
                ") ON CONFLICT (id) DO NOTHING;",
                "",
            ]

    lines += ["COMMIT;", ""]
    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

def main():
    print("=" * 72)
    print("BULK RECIPE IMPORT WITH OPENAI TRANSLATION")
    print("=" * 72)

    # STEP 1 — Load JSON
    print(f"\n[STEP 1] Loading recipes from {JSON_INPUT} ...")
    if not JSON_INPUT.exists():
        print(f"  ERROR: File not found: {JSON_INPUT}")
        print("  Run scripts/bulk_import_recipes.py first.")
        sys.exit(1)

    with open(JSON_INPUT, encoding="utf-8") as f:
        raw_recipes = json.load(f)
    print(f"  Loaded {len(raw_recipes)} raw entries")

    # STEP 2 — Clean + deduplicate
    print("\n[STEP 2] Cleaning data ...")
    recipes = clean_and_deduplicate(raw_recipes)
    dropped = len(raw_recipes) - len(recipes)
    print(f"  Kept {len(recipes)} valid recipes  (dropped {dropped} junk/duplicates)")

    # STEP 3 — Translate names
    print(f"\n[STEP 3] Translating {len(recipes)} recipe names via OpenAI gpt-4o-mini ...")
    print(f"  Estimated cost: {len(recipes)} × ~40 tokens ≈ ${len(recipes) * 40 / 1_000_000 * 0.15:.4f}\n")

    for i, recipe in enumerate(recipes):
        name_bg = recipe["name_bg"]
        print(f"  [{i+1:3}/{len(recipes)}] {name_bg}")
        name_en = translate_name(name_bg)
        print(f"          → {name_en}")
        recipe["_id"] = str(uuid.uuid4())
        recipe["name_en"] = name_en

    # STEP 4 — Save translated JSON
    json_out = [{k: v for k, v in r.items() if k != "_id"} for r in recipes]
    SCRIPT_DIR.joinpath("output").mkdir(parents=True, exist_ok=True)
    with open(JSON_TRANSLATED, "w", encoding="utf-8") as f:
        json.dump(json_out, f, ensure_ascii=False, indent=2)
    print(f"\n  Translated JSON saved: {JSON_TRANSLATED}")

    # STEP 5 — Generate + save SQL
    print("\n[STEP 4] Generating SQL ...")
    sql = generate_sql(recipes)
    with open(SQL_OUTPUT, "w", encoding="utf-8") as f:
        f.write(sql)
    print(f"  SQL saved: {SQL_OUTPUT}")

    # Summary
    print()
    print("=" * 72)
    print("IMPORT COMPLETE")
    print("=" * 72)
    print(f"  Recipes processed   : {len(recipes)}")
    print(f"  Translations done   : {len(recipes)}")
    print(f"  Junk entries dropped: {dropped}")
    print(f"  JSON  -> {JSON_TRANSLATED}")
    print(f"  SQL   -> {SQL_OUTPUT}")
    print()
    print("Next steps:")
    print("  1. Review SQL file above")
    print("  2. Open Supabase -> SQL Editor")
    print("  3. Paste full SQL content and click Run")
    print("=" * 72)


if __name__ == "__main__":
    main()
