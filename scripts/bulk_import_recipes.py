#!/usr/bin/env python3
"""
Bulk import recipes from a Spanish Keto PDF book into KetoCakR.

Usage:
    python bulk_import_recipes.py [path/to/book.pdf]

Outputs:
    scripts/output/recipes_bulk_import.sql   — SQL INSERT statements
    scripts/output/recipes_bulk_import.json  — Structured JSON data

Target schema:
    base_recipes (is_simple_recipe=True)
    recipe_ingredients
    recipe_instruction_steps
"""

import json
import os
import re
import sys
import uuid
from pathlib import Path
from typing import Optional

# ─── Output paths ────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR / "output"
OUTPUT_SQL  = OUTPUT_DIR / "recipes_bulk_import.sql"
OUTPUT_JSON = OUTPUT_DIR / "recipes_bulk_import.json"

# ─── PDF path (from arg or default) ──────────────────────────────────────────
PDF_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else SCRIPT_DIR / "Испанска_кето_книга.pdf"

# ─── Bulgarian section keywords ───────────────────────────────────────────────
BG_INGREDIENTS_KEYWORDS = [
    "Съставки:", "СЪСТАВКИ:", "Продукти:", "ПРОДУКТИ:",
    "Ingredientes:", "Ingrediënten:",
]
BG_STEPS_KEYWORDS = [
    "Приготвяне:", "ПРИГОТВЯНЕ:", "Начин на приготвяне:",
    "Инструкции:", "ИНСТРУКЦИИ:", "Приготовление:",
    "Elaboración:", "Preparación:", "Elaboration:",
]


# ─────────────────────────────────────────────────────────────────────────────
# PDF PARSER
# ─────────────────────────────────────────────────────────────────────────────

def parse_pdf(pdf_path: Path) -> list[dict]:
    """Extract recipe data from PDF using pdfplumber."""
    try:
        import pdfplumber
    except ImportError:
        print("ERROR: pdfplumber not installed. Run: pip install pdfplumber")
        sys.exit(1)

    recipes: list[dict] = []

    with pdfplumber.open(pdf_path) as pdf:
        full_text = ""
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n\n--- PAGE BREAK ---\n\n"

    recipes = split_recipes_from_text(full_text)
    print(f"  Parsed {len(recipes)} recipes from PDF")
    return recipes


def split_recipes_from_text(text: str) -> list[dict]:
    """
    Split raw PDF text into individual recipe blocks.
    Heuristic: a new recipe starts with a line that is ALL-CAPS or Title Case
    and is NOT a section header keyword.
    """
    lines = text.split("\n")
    recipe_blocks: list[list[str]] = []
    current_block: list[str] = []

    SKIP_LINES = {"--- PAGE BREAK ---", ""}

    for line in lines:
        stripped = line.strip()
        if stripped in SKIP_LINES:
            continue

        # Detect recipe title: stands alone, title-cased or all-caps, no colon
        is_title = (
            len(stripped) > 4
            and ":" not in stripped
            and not stripped.startswith("•")
            and not stripped.startswith("-")
            and not stripped[0].isdigit()
            and (stripped == stripped.upper() or stripped == stripped.title())
            and not any(stripped.startswith(kw.rstrip(":")) for kw in BG_INGREDIENTS_KEYWORDS + BG_STEPS_KEYWORDS)
        )

        if is_title and current_block:
            recipe_blocks.append(current_block)
            current_block = [stripped]
        else:
            current_block.append(stripped)

    if current_block:
        recipe_blocks.append(current_block)

    return [parse_recipe_block(block) for block in recipe_blocks if len(block) >= 3]


def parse_recipe_block(lines: list[str]) -> dict:
    """Parse a single recipe block into structured data."""
    title = lines[0].strip().title()

    ingredients: list[dict] = []
    steps: list[str] = []

    mode = "preamble"
    nutrition = {}

    for line in lines[1:]:
        stripped = line.strip()
        if not stripped:
            continue

        if any(stripped.startswith(kw) for kw in BG_INGREDIENTS_KEYWORDS):
            mode = "ingredients"
            rest = stripped.split(":", 1)[1].strip() if ":" in stripped else ""
            if rest:
                ing = parse_ingredient_line(rest)
                if ing:
                    ingredients.append(ing)
            continue

        if any(stripped.startswith(kw) for kw in BG_STEPS_KEYWORDS):
            mode = "steps"
            rest = stripped.split(":", 1)[1].strip() if ":" in stripped else ""
            if rest:
                steps.append(rest)
            continue

        if mode == "ingredients":
            if stripped[0].isdigit() and any(stripped.startswith(kw) for kw in BG_STEPS_KEYWORDS):
                mode = "steps"
                steps.append(stripped)
                continue
            ing = parse_ingredient_line(stripped)
            if ing:
                ingredients.append(ing)

        elif mode == "steps":
            # Strip leading step numbers like "1." "1)" etc.
            clean = re.sub(r"^\d+[\.\)]\s*", "", stripped)
            if clean:
                steps.append(clean)

        # Nutrition hints (informal, best-effort)
        cal_match = re.search(r"(\d+)\s*(?:kcal|cal|калории)", stripped, re.IGNORECASE)
        if cal_match:
            nutrition["total_calories"] = int(cal_match.group(1))

    return {
        "name_bg": title,
        "name_en": "",
        "servings": 8,
        "prep_time_minutes": 20,
        "bake_time_minutes": 30,
        "ingredients": ingredients,
        "steps": steps,
        "total_calories": nutrition.get("total_calories"),
        "source_type": "book",
    }


def parse_ingredient_line(line: str) -> Optional[dict]:
    """
    Parse a line like '200 г краве масло' or '2 супени лъжици захарин'
    into {ingredient_name, quantity, unit}.
    """
    line = line.lstrip("•-–—* ").strip()
    if not line:
        return None

    # Match: <number> <unit> <name>  OR  <name> - <number> <unit>
    pattern = r"^([\d½¼¾.,/]+)\s*([a-zа-яА-ЯA-Z]+\.?)?\s+(.+)$"
    m = re.match(pattern, line)
    if m:
        qty_str, unit, name = m.group(1), m.group(2) or "", m.group(3)
        try:
            qty = float(qty_str.replace(",", ".").replace("½", "0.5").replace("¼", "0.25").replace("¾", "0.75"))
        except ValueError:
            qty = 1.0
        return {"ingredient_name": name.strip(), "quantity": qty, "unit": unit.strip()}

    # No quantity found — return just the name
    return {"ingredient_name": line, "quantity": 1.0, "unit": "бр"}


# ─────────────────────────────────────────────────────────────────────────────
# FALLBACK SAMPLE DATA (when PDF not available)
# ─────────────────────────────────────────────────────────────────────────────

SAMPLE_RECIPES = [
    {
        "name_bg": "Кето Шоколадова Торта",
        "name_en": "Keto Chocolate Cake",
        "servings": 12,
        "prep_time_minutes": 20,
        "bake_time_minutes": 35,
        "total_calories": 2400,
        "source_type": "book",
        "ingredients": [
            {"ingredient_name": "бадемово брашно", "quantity": 200, "unit": "г"},
            {"ingredient_name": "какао на прах", "quantity": 50, "unit": "г"},
            {"ingredient_name": "еритритол", "quantity": 120, "unit": "г"},
            {"ingredient_name": "яйца", "quantity": 4, "unit": "бр"},
            {"ingredient_name": "масло", "quantity": 100, "unit": "г"},
            {"ingredient_name": "бакпулвер", "quantity": 1, "unit": "ч.л."},
        ],
        "steps": [
            "Загрейте фурната до 180°C.",
            "Разбъркайте сухите съставки — бадемово брашно, какао, еритритол и бакпулвер.",
            "Разбийте яйцата с разтопеното масло.",
            "Смесете мокрите и сухите съставки до хомогенна смес.",
            "Изсипете в намаслена форма и печете 35 минути.",
            "Оставете да изстине напълно преди да нарежете.",
        ],
    },
    {
        "name_bg": "Кето Чийзкейк с Ягоди",
        "name_en": "Keto Strawberry Cheesecake",
        "servings": 10,
        "prep_time_minutes": 30,
        "bake_time_minutes": 0,
        "total_calories": 2100,
        "source_type": "book",
        "ingredients": [
            {"ingredient_name": "крим сирене", "quantity": 500, "unit": "г"},
            {"ingredient_name": "сметана", "quantity": 200, "unit": "мл"},
            {"ingredient_name": "еритритол", "quantity": 80, "unit": "г"},
            {"ingredient_name": "ягоди", "quantity": 150, "unit": "г"},
            {"ingredient_name": "желатин", "quantity": 10, "unit": "г"},
            {"ingredient_name": "бадемово брашно", "quantity": 150, "unit": "г"},
            {"ingredient_name": "масло", "quantity": 60, "unit": "г"},
        ],
        "steps": [
            "Смесете бадемовото брашно с разтопеното масло за основата.",
            "Натиснете сместа в дъното на форма и приберете в хладилника.",
            "Разтворете желатина в 3 с.л. топла вода.",
            "Разбийте крим сиренето с еритритола до кремообразна консистенция.",
            "Добавете сметаната и желатина, разбъркайте добре.",
            "Нарежете ягодите и ги наредете върху основата.",
            "Изсипете крем сиреното върху ягодите и охладете 4 часа.",
        ],
    },
    {
        "name_bg": "Кето Ванилови Мъфини",
        "name_en": "Keto Vanilla Muffins",
        "servings": 12,
        "prep_time_minutes": 15,
        "bake_time_minutes": 25,
        "total_calories": 1800,
        "source_type": "book",
        "ingredients": [
            {"ingredient_name": "бадемово брашно", "quantity": 250, "unit": "г"},
            {"ingredient_name": "еритритол", "quantity": 100, "unit": "г"},
            {"ingredient_name": "яйца", "quantity": 3, "unit": "бр"},
            {"ingredient_name": "ванилов екстракт", "quantity": 1, "unit": "ч.л."},
            {"ingredient_name": "масло", "quantity": 80, "unit": "г"},
            {"ingredient_name": "бакпулвер", "quantity": 1, "unit": "ч.л."},
            {"ingredient_name": "щипка сол", "quantity": 1, "unit": "бр"},
        ],
        "steps": [
            "Загрейте фурната до 175°C.",
            "Разбийте яйцата с еритритола и ванилия.",
            "Добавете разтопеното масло и разбъркайте.",
            "Прибавете бадемовото брашно, бакпулвера и солта.",
            "Разпределете в намаслени мъфин форми.",
            "Печете 22-25 минути до златисто-кафяв цвят.",
        ],
    },
]


# ─────────────────────────────────────────────────────────────────────────────
# SQL GENERATOR
# ─────────────────────────────────────────────────────────────────────────────

def escape_sql(value: str) -> str:
    """Escape single quotes for SQL string literals."""
    return value.replace("'", "''")


def generate_sql(recipes: list[dict]) -> str:
    lines: list[str] = [
        "-- ============================================================",
        "-- KetoCakR Bulk Import — Simple Recipes (is_simple_recipe=true)",
        f"-- Generated: {__import__('datetime').datetime.now().isoformat()}",
        f"-- Total recipes: {len(recipes)}",
        "-- ============================================================",
        "",
        "BEGIN;",
        "",
    ]

    for recipe in recipes:
        recipe_id = str(uuid.uuid4())
        recipe["_id"] = recipe_id

        name_bg = escape_sql(recipe.get("name_bg") or "")
        name_en = escape_sql(recipe.get("name_en") or "")
        servings = recipe.get("servings") or 8
        prep_time = recipe.get("prep_time_minutes") or 0
        bake_time = recipe.get("bake_time_minutes") or 0
        source_type = recipe.get("source_type") or "book"
        total_cal = recipe.get("total_calories")
        cal_sql = str(total_cal) if total_cal is not None else "NULL"

        lines += [
            f"-- ── {name_bg} ──",
            "INSERT INTO base_recipes (",
            "  id, name, name_bg, name_en, is_simple_recipe,",
            "  source_type, servings, prep_time_minutes, bake_time_minutes, total_calories",
            ") VALUES (",
            f"  '{recipe_id}',",
            f"  '{name_bg}',",
            f"  '{name_bg}',",
            f"  '{name_en}',",
            "  TRUE,",
            f"  '{source_type}',",
            f"  {servings},",
            f"  {prep_time},",
            f"  {bake_time},",
            f"  {cal_sql}",
            ") ON CONFLICT (id) DO NOTHING;",
            "",
        ]

        for idx, ing in enumerate(recipe.get("ingredients") or []):
            ing_name = escape_sql(ing.get("ingredient_name") or "")
            qty = ing.get("quantity") or 1.0
            unit = escape_sql(ing.get("unit") or "")
            lines += [
                "INSERT INTO recipe_ingredients (",
                "  id, recipe_id, ingredient_name, ingredient_database_id, quantity, unit, order_index",
                ") VALUES (",
                f"  '{uuid.uuid4()}',",
                f"  '{recipe_id}',",
                f"  '{ing_name}',",
                "  NULL,",
                f"  {qty},",
                f"  '{unit}',",
                f"  {idx}",
                ") ON CONFLICT (id) DO NOTHING;",
                "",
            ]

        for idx, step_text in enumerate(recipe.get("steps") or []):
            step_desc = escape_sql(step_text)
            lines += [
                "INSERT INTO recipe_instruction_steps (",
                "  id, recipe_id, step_number, step_description,",
                "  step_description_bg, step_description_en, step_duration_minutes",
                ") VALUES (",
                f"  '{uuid.uuid4()}',",
                f"  '{recipe_id}',",
                f"  {idx + 1},",
                f"  '{step_desc}',",
                f"  '{step_desc}',",
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
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    if PDF_PATH.exists():
        print(f"Parsing PDF: {PDF_PATH}")
        recipes = parse_pdf(PDF_PATH)
    else:
        print(f"PDF not found at: {PDF_PATH}")
        print("Using sample data (3 recipes). Pass PDF path as argument to import real data.")
        recipes = SAMPLE_RECIPES

    print(f"Processing {len(recipes)} recipes...")

    sql = generate_sql(recipes)
    OUTPUT_SQL.write_text(sql, encoding="utf-8")
    print(f"SQL written to: {OUTPUT_SQL}")

    # Strip internal _id before saving JSON
    json_recipes = [{k: v for k, v in r.items() if k != "_id"} for r in recipes]
    OUTPUT_JSON.write_text(json.dumps(json_recipes, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"JSON written to: {OUTPUT_JSON}")

    # Summary
    total_ing = sum(len(r.get("ingredients") or []) for r in recipes)
    total_steps = sum(len(r.get("steps") or []) for r in recipes)
    print()
    print("── Summary ───────────────────────────────────────")
    print(f"  Recipes  : {len(recipes)}")
    print(f"  Ingredients: {total_ing}")
    print(f"  Steps      : {total_steps}")
    print("──────────────────────────────────────────────────")
    print("Done. Review the SQL file before running against the database.")


if __name__ == "__main__":
    main()
