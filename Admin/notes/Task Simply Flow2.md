# TASK: Simple Recipe — Edit Mode, Equipment & Lab Notes Integration (Phase 2)

> Depends on `C:\Dev\KetoCakr\admin\notes\Task Simply Flow.md` (Phase 1) — the single
> 4-tab wizard with exactly one write point, at Tab 4. This task extends
> that same wizard to (a) fully support editing an existing simple recipe
> with correct data hydration, (b) add the missing Equipment and Lab Notes
> management, and (c) retire the old long-scroll, multi-button correction
> form.

---

## Problems Observed (with evidence from screenshots + live data)

1. **No hydration on edit.** Re-opening a published simple recipe for
   correction does not load the already-saved `Тип десерт` /
   `Съд за сервиране` / `Ниво на трудност`. The dropdowns reset to
   placeholders, and `Ниво на трудност` shows a hardcoded default
   ("2 - Лесно") instead of the actual saved value. The confirm button
   stays disabled ("Избери тип първо") until the user re-selects a type
   that is already saved in the database.
2. **Too many save buttons.** The current correction form has at least 7
   separate Save actions spread across one long scrolling page: Запази
   Информацията, Запази Съставките, (тип/форма/трудност), Запази Видео,
   Запази Бележки, Запази стъпките, Save All Unsaved Steps. Confusing for
   the user and inconsistent with the single-write-point architecture
   established in Phase 1.
3. **Equipment ("Посуда") and Lab Notes ("Бележки") are not properly
   wired** to their dedicated relational tables anywhere in the current
   UI (see confirmed schema below), and are missing entirely from the new
   Phase 1 wizard spec.
4. **Image-generation scroll jump.** Generating an image for a step causes
   the page to jump/scroll to an unexpected position, disorienting the
   editor mid-task.
5. **Excessive scrolling at scale.** Editing a recipe with many steps on
   one long page does not scale across 200+ recipes × ~10 steps each.

---

## Confirmed Schema — Equipment & Lab Notes

```sql
-- recipe_equipment: one row per equipment item used in a recipe
recipe_equipment (
  id serial primary key,
  recipe_id uuid references base_recipes(id) on delete cascade,
  item varchar(100) not null,        -- EN name
  item_bg varchar(100) not null,     -- BG name
  quantity integer default 1,
  reusable boolean default true,
  size varchar(50),
  specs varchar(255),
  essential boolean default true,
  notes text,
  display_order integer default 0,
  equipment_id integer references equipment(id),  -- optional catalog link
  image_url text,
  reference_image_url text
)

-- lab_notes: one row per note entry for a recipe (categorized, multiple per recipe)
lab_notes (
  id serial primary key,
  recipe_id uuid references base_recipes(id) on delete cascade,
  category varchar(50) not null,
  title varchar(255) not null,
  title_bg varchar(255),
  content text not null default '',
  content_bg text default '',
  content_json jsonb default '[]',
  icon text default '🧪',
  subtitle_en text,
  subtitle_bg text,
  image_url text,
  image_alt text,
  display_order integer default 0,
  is_active boolean default true
)
```

Both have `ON DELETE CASCADE` on `recipe_id → base_recipes.id` — **no
manual delete step is needed for these two tables** when a recipe is
deleted (unlike `recipe_ingredients` / `recipe_instruction_steps`, which
have no FK and must still be deleted manually — Phase 1's cascade-delete
rule is unchanged for those two).

⚠️ `base_recipes` also has legacy columns `equipment_notes`,
`equipment_notes_en` (text), and `lab_notes` (jsonb) directly on it —
predating the two relational tables above, likely dead/duplicate storage.
**Recommendation (confirm before deploying): stop writing to these three
legacy columns for Simple Recipes going forward; treat `recipe_equipment`
and `lab_notes` tables as the sole source of truth.** Do not delete the
legacy columns yet — flag for a future cleanup migration; out of scope
here.

---

## Required Changes

### 1. Edit mode = the same wizard, fully hydrated
Editing an existing simple recipe must open the same 4-tab wizard from
Phase 1 — not a separate form. On mount with a known `recipeId`:
- Tabs 1–3 fields pre-filled from `base_recipes` (name, name_en, servings,
  ingredients, steps).
- Tab 4 fields pre-filled from `ready_recipes` (`dessert_type_id`,
  `serving_container_id`, `difficulty_level` — reverse-mapped from the
  stored text format per the Phase 1 mapping table) **plus** the recipe's
  existing `recipe_equipment` rows and `lab_notes` rows, loaded into
  editable lists.
- Dropdowns must show the currently saved value selected, not a
  placeholder — this directly fixes Problem 1.
- Tab 4's Save action is the single UPDATE point for the whole recipe
  (already specified in Phase 1's insert-vs-update branching). No other
  tab has a save button, exactly as in create mode.

### 2. Equipment section (Tab 4, or new Tab 3.5)
Repeatable list editor for `recipe_equipment`:
- Add/remove rows; each row: `item_bg` (required), `item` (EN), quantity,
  size, specs, essential (toggle), reusable (toggle), notes, and an
  optional link to the catalog `equipment` table via search/autocomplete
  (sets `equipment_id`) — reuse the existing equipment search component
  if the admin already has one (it does, per the Equipment CRUD section).
- On Tab 4 save: replace all `recipe_equipment` rows for this `recipe_id`
  with the current list (delete-then-insert, or diff-based upsert —
  match whatever pattern the existing ingredients-list save already uses,
  for consistency).

### 3. Lab Notes section (Tab 4, or new Tab 3.5)
Repeatable list editor for `lab_notes`:
- Add/remove note entries; each entry: category (dropdown), `title_bg`,
  `title` (EN), `content_bg`, `content` (EN), icon (optional, default
  🧪), `display_order` (auto, by list position), `is_active` (default
  true).
- `content_json` and `subtitle_*`/image fields are out of scope for this
  pass — leave null/default; do not build rich-content editing now.
- On Tab 4 save: same replace-all-for-this-recipe-id pattern as Equipment.

### 4. Consolidate save buttons → one save point
Once the wizard fully replaces the legacy form, there is exactly one
Save/Publish action for the whole recipe, on Tab 4, covering:
`base_recipes`, `ready_recipes`, `recipe_ingredients`,
`recipe_instruction_steps`, `recipe_equipment`, `lab_notes`. Retire/hide
the old multi-button correction form for simple recipes once this is
verified working.

### 5. Fix the image-generation scroll jump (Tab 3 / Steps)
Phase 0 investigation required: identify what currently causes the page
to scroll away after triggering per-step image generation — likely a
re-render that remounts the steps list (losing scroll position) or an
unintended `scrollIntoView()`/focus call. Fix so the view stays anchored
on the step the user was working on while the image generates, with a
local loading indicator on just that step's image slot.

### 6. Reduce scrolling for multi-step recipes (Tab 3)
Make each step row collapsible: collapsed = title + order handle + quick
status; expanded = full editor for that step. Default: all collapsed
except the step currently being edited. Keeps the page short regardless
of step count — addresses Problem 5 at the scale of 200+ recipes.

---

### 7. NEW — Tab 5: Step-Level Associations (Ingredients + Equipment per step)

This resolves a structural tension created by Phase 1's "no persistence
until Tab 4" rule: per-step checkboxes — like the existing "Кои съставки
се използват в Стъпка 1?" UI already seen in the current correction form
— need REAL ids for ingredients, equipment, and steps, which simply do not
exist until Tab 4's write completes. Solution: add a 5th wizard stage,
gated behind a successful Tab 4 save.

- **Create mode**: Tab 5 is locked/hidden until Tab 4's save succeeds. The
  moment it succeeds, the wizard advances to Tab 5 automatically, now
  populated with the real, just-created `recipe_ingredients`,
  `recipe_equipment`, and `recipe_instruction_steps` rows.
- **Edit mode**: Tab 5 is available immediately — the recipe's
  ingredients/equipment/steps already exist from before.
- For each step, show two checkbox groups:
  - **Съставки** — checkbox per ingredient already in `recipe_ingredients`
    for this recipe (carries over today's existing UX, but finally wires
    it to the correct save target).
  - **Посуда** (new) — checkbox per equipment item already in
    `recipe_equipment` for this recipe.
- Tab 5's single Save action performs ONE PATCH updating, for every step,
  `recipe_instruction_steps.ingredients_used[]` and a new
  `recipe_instruction_steps.equipment_used[]` column. This also fixes
  **Known DB Issue #9** (`ingredients_used[]` empty for simple recipes) as
  a direct side effect.
- This is a deliberate, dependent second write — strictly sequenced after
  Tab 4, never before. It does not violate the single-write-point
  principle for *record creation*; it is a follow-up *association* step
  that can only exist once the rows it links already have real ids.

**Schema change required**: during Phase 0, confirm the exact column type
of the existing `recipe_instruction_steps.ingredients_used` (text[] of
ingredient names, vs an id-based array). Add the new `equipment_used`
column on `recipe_instruction_steps` mirroring that same convention — do
not introduce a second, inconsistent pattern (e.g. ids for one, names for
the other).

---

## Implementation Steps

1. **Phase 0 investigation** — trace the current image-generation handler
   in the Steps section to find the scroll-jump cause. Also trace the
   current "Lab Notes" textarea save handler to confirm whether it
   currently writes to `base_recipes.lab_notes` (jsonb), the `lab_notes`
   table, both, or neither — report findings before changing code.
2. Build a single `loadSimpleRecipeForEdit(recipeId)` function that fetches
   `base_recipes` + `ready_recipes` + `recipe_ingredients` +
   `recipe_instruction_steps` + `recipe_equipment` + `lab_notes` and
   populates wizard state. Reverse-map `difficulty_level` (integer →
   display value) using the Phase 1 mapping.
3. Add Equipment and Lab Notes list editors to Tab 4 (or a new Tab 3.5).
4. Extend the Tab 4 save handler (from Phase 1) to also write
   `recipe_equipment` and `lab_notes` (replace-all pattern), after the
   ingredients/steps writes.
5. Wire the simple-recipes list/detail page's "Edit" action to open the
   wizard in edit mode instead of the old form.
6. Fix the scroll-jump bug per the Phase 0 findings.
7. Add collapsible behavior to the Steps tab.
8. Confirm `recipe_instruction_steps.ingredients_used` column type; add a
   migration for the new `equipment_used` column mirroring that same
   type/convention.
9. Build Tab 5: gated behind Tab 4 success in create mode, always
   available in edit mode; render per-step checkboxes for ingredients and
   equipment (sourced from the recipe's own `recipe_ingredients` /
   `recipe_equipment` rows); single Save → one PATCH updating
   `ingredients_used[]` and `equipment_used[]` for every step at once.
10. Remove or clearly deprecate the old multi-button correction form's
    entry point for simple recipes once the above is verified working.

---

## Testing Checklist

- [ ] Open an existing published simple recipe for edit — confirm
      Тип десерт / Съд за сервиране / Ниво на трудност show the actual
      saved values, not placeholders/defaults
- [ ] Edit and save — confirm exactly one UPDATE per table, no new rows
      created anywhere
- [ ] Add 2 equipment items and 2 lab notes, save, reopen — confirm they
      persist and reload correctly
- [ ] Delete a simple recipe — confirm `recipe_equipment` and `lab_notes`
      rows disappear automatically (CASCADE) and `recipe_ingredients` /
      `recipe_instruction_steps` are removed via the existing manual
      cascade from Phase 1
- [ ] Generate an image for a step mid-list — confirm the page does not
      jump/scroll away from that step
- [ ] Open a recipe with 10 steps — confirm steps are collapsed by default
      and reaching Tab 4 does not require excessive scrolling
- [ ] Create a new recipe with 2 ingredients, 2 equipment items, 3 steps →
      complete Tab 4 → confirm Tab 5 unlocks automatically and shows the
      real, already-saved ingredients/equipment available to check per
      step
- [ ] Check different ingredients/equipment combinations per step in
      Tab 5, save → confirm `ingredients_used[]` and `equipment_used[]`
      are correctly populated per step in the database
- [ ] Open an existing recipe in edit mode → confirm Tab 5 is immediately
      accessible (no gating) and shows previously saved associations
      correctly pre-checked

---

## Out of Scope

- `content_json` rich-content editing for lab notes
- Bulk equipment catalog management (separate existing Admin section)
- Puzzle Model recipes, mobile app