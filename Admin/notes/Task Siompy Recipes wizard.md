# TASK: Simple Recipe Wizard — Round 1 Bug Fixes (found during live testing)

> Found while testing the already-implemented Phase 1 + Phase 2 wizard
> (`TASK_SIMPLE_RECIPE_FLOW_REDESIGN.md`,
> `TASK_SIMPLE_RECIPE_EDIT_MODE_AND_EQUIPMENT_NOTES.md`). Fix these before
> continuing to the Base Recipe wizard task.

---

## Bug 1 — "Step Images" section leaking into Tabs 1, 2, 3

**Observed**: the "Изображения по Стъпки" (per-step image generation)
block renders at the bottom of Tab 1, Tab 2, and Tab 3 — not just Tab 5.

**Required**: this section must render ONLY inside Tab 5, positioned
*after* the per-step ingredient/equipment association checklist (per the
original Tab 5 spec: associate ingredients/equipment first, generate
images after).

**Likely cause**: the component is mounted at a shared/parent wizard
level that renders on every tab, instead of being conditionally rendered
only when the active tab is Tab 5. Phase 0: locate where the step-images
component is mounted and scope it to Tab 5 only.

---

## Bug 2 — "Resources" (Ресурси) section repeating on every tab

**Observed**: same kind of leak — the "+ Добави Ресурс" / Resources block
appears on every tab instead of once.

**Required**: move it into Tab 4, positioned directly after the Lab Notes
section. It must render exactly once, only on Tab 4.

**Likely cause**: same root cause as Bug 1 — check whether both
components were mounted at the wizard-shell level instead of inside the
correct tab's content area.

---

## Bug 3 — Tab 4 Equipment UX regression: manual entry instead of catalog checkboxes

Deyana wants the previous, faster workflow back: a checkbox list of
equipment sourced from the `equipment` catalog table, grouped by
category — check the items used, instead of typing each one manually
every time.

**Required**:
- Phase 0: confirm the `equipment` table's grouping field (likely
  `category` — verify exact column name) and locate any existing
  categorized equipment-picker component already used elsewhere in the
  admin (e.g. the standalone Equipment CRUD section, or the legacy
  pre-wizard correction form) — reuse it rather than rebuilding from
  scratch.
- Tab 4 equipment UI: render catalog items grouped by category, each with
  a checkbox. Checking an item creates a `recipe_equipment` row with
  `equipment_id` set and `item` / `item_bg` copied from the catalog entry
  (default `quantity = 1`, `essential = true`, `reusable` per the
  catalog's own default if one exists). Allow optional inline
  quantity/notes editing per checked item, but the primary interaction is
  checkbox selection, not manual typing.
- Manual entry (typing a custom item not in the catalog) may remain as a
  secondary fallback below the checklist for one-off items — but it must
  not be the default/required flow.

---

## Bug 4 — Tab 5 Associations: `ingredients_used[]` does not persist (equipment confirmed working)

**Updated after further testing.** Equipment associations now work
correctly: checking equipment per step, saving, closing, and reopening the
recipe correctly shows the same equipment checked. **The bug is isolated
to ingredients specifically** — `recipe_instruction_steps.ingredients_used[]`
does not persist or does not reload correctly.

Reproduction:
1. Open Tab 5, check several ingredients used in a given step (do NOT
   touch equipment).
2. Save associations.
3. Close and reopen the same recipe.
4. The previously checked ingredients are unchecked — the equipment
   checkboxes, by contrast, correctly remain checked.

Since `equipment_used[]` works and was built fresh as part of this round,
while `ingredients_used[]` is the older, pre-existing column (this matches
**Known DB Issue #9** from PROJECT_STATUS: *"ingredients_used[] in
recipe_instruction_steps is empty for simple recipes"* — a bug that
predates this wizard), the fastest path to a fix is a **direct
line-by-line comparison** between the two implementations, since they were
specified to mirror the same convention:

1. Confirm the exact column type/format actually used by
   `ingredients_used[]` today (text[] of ingredient names? int[] of
   `recipe_ingredients.id`? something else?) versus what `equipment_used[]`
   actually uses now that it works. If they differ, that mismatch is
   likely the root cause — standardize `ingredients_used[]` onto the same
   pattern as the working `equipment_used[]`, not the reverse.
2. Check the frontend checkbox-rendering/matching logic for the
   Ingredients group in Tab 5 against the Equipment group: confirm both
   compare against the *same kind* of identifier (e.g. if Equipment
   matches by `recipe_equipment.id` or `equipment_id`, confirm Ingredients
   matches by the equivalent `recipe_ingredients.id`, not by name or by
   `ingredient_database_id`, or some other inconsistent field).
3. Confirm there isn't a second, older/legacy code path still attempting
   to write `ingredients_used[]` (left over from before this wizard, per
   Known Issue #9) that runs alongside or instead of the new Tab 5 save
   handler, silently overwriting or no-oping it.
4. Once the mismatch is found, fix `ingredients_used[]` to use the exact
   same read/write pattern as the now-working `equipment_used[]` — do not
   maintain two different conventions for what is structurally the same
   kind of array column.

Equipment-specific items from the original Bug 4 report (two-button
consolidation, request-in-flight guard) still apply if not already
addressed — re-verify them while fixing this, since the same Tab 5 save
handler covers both arrays.

---

## Testing Checklist (this round)

- [ ] Step Images section appears ONLY on Tab 5, after the associations UI
- [ ] Resources section appears ONLY on Tab 4, after Lab Notes
- [ ] Tab 4 equipment: catalog items shown as checkboxes grouped by
      category; checking one creates a correctly-linked `recipe_equipment`
      row; manual entry still available as a fallback, not the default
- [ ] Tab 5: check ingredients per step, save, close and reopen the
      recipe — confirm the same ingredients are still checked (this is
      the currently-failing case — equipment already confirmed working)
- [ ] Confirm only ONE button exists on Tab 5 for saving associations

---

## Out of Scope

- Base Recipe wizard (separate task, not yet started)
- Any new features beyond fixing the four bugs above