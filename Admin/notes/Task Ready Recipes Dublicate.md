# TASK: Ready Recipes Admin — Add Serving/Baking Container Field

> Standalone admin form fix — a separate UI screen from the Simple Recipe
> wizard. Applies to ALL rows in `ready_recipes` (both Puzzle-assembled
> recipes and Simple Recipes), not just simple recipes.

---

## Problem

The Ready Recipes admin form lets you select "Тип на десерта"
(`dessert_type_id`) but has no field for "Съд за сервиране/печене"
(`serving_container_id`, FK → `equipment.id`) — even though the column
already exists on `ready_recipes`. Every ready recipe should have a
serving/baking container selected, the same way it already requires a
dessert type.

---

## Required Change

Add a "Съд за сервиране/печене" selector directly after the "Тип на
десерта" selector in the Ready Recipes admin form, available for every
recipe in this table — Puzzle-assembled or simple.

- Same dropdown source already used elsewhere for equipment selection.
  Phase 0: confirm whether the `equipment` table has a flag distinguishing
  serving containers/baking forms from general tools, or whether the full
  catalog is used as-is.
- Writes directly to `ready_recipes.serving_container_id` — the exact
  same column the Simple Recipe wizard's Tab 4 already reads/writes (see
  `TASK_SIMPLE_RECIPE_WIZARD_BUGFIXES_ROUND1.md` Bug 5 for that side of
  the fix). Both surfaces must use the same field, so a value set in one
  place is correctly visible in the other.

---

## Testing Checklist

- [ ] Open any existing `ready_recipes` row in this admin form — confirm
      "Тип на десерта" shows the saved value if one exists, and the new
      "Съд за сервиране/печене" field appears directly after it
- [ ] Select a container and save — confirm `serving_container_id`
      updates on the correct existing row, with no new row created
- [ ] For a Simple Recipe specifically: set the container here, then open
      the same recipe via the Simple Recipe wizard's Tab 4 — confirm the
      same container shows up there, and vice versa

---

## Out of Scope

- Any other Ready Recipes admin fields
- The Simple Recipe wizard itself — see
  `TASK_SIMPLE_RECIPE_WIZARD_BUGFIXES_ROUND1.md` (Bug 5) for the matching
  duplicate-row and hydration fix on that side