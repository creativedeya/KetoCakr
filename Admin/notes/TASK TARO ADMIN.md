# TASK: Tarot Admin — Major/Minor Image Source Split (Corrected)

> Supersedes `TASK_TAROT_IMAGE_FIELD_FIX.md` (do NOT apply that file if not already done —
> this is the correct version). Also corrects a schema assumption from the original
> `TASK_TAROT_ADMIN_AND_DB.md`: Major Arcana's `linked_recipe_id` should reference
> `ready_recipes` (complete, assembled cakes), NOT `base_recipes` (individual components).
> This matches the project's existing Puzzle Model: `ready_recipes` = full showcase cake,
> `base_recipes` = base/cream/filling/decor component.

---

## PHASE 0 — Investigation (mandatory, report back first)

1. Check current state of `tarot_cards` table — confirm whether `linked_recipe_id`'s foreign
   key currently points to `base_recipes(id)` (per the original task file) or has already been
   corrected. Report the actual constraint as it exists in the DB right now.
2. Check `ready_recipes` columns — confirm `hero_image_url` and `hero_image_reference_url` exist,
   and clarify (by checking existing admin code that uses these fields, e.g. wherever recipes are
   published/edited) whether `hero_image_reference_url` is:
   (a) an alternate displayable photo of the same cake, or
   (b) an AI-generation reference image (e.g. for consistent styling when generating step images),
   NOT meant to be shown to end users as a "second photo option".
   Report which it is — this determines whether Major Arcana's picker shows 1 or 2 thumbnail options.
3. Check the current Major Arcana recipe-picker implementation in
   `admin/app/dashboard/tarot-cards/[id]/page.tsx` — does it currently search `base_recipes` or
   `ready_recipes`? Report current state before changing.
4. Wait for confirmation before Phase 1.

---

## PHASE 1 — Schema correction

If `tarot_cards.linked_recipe_id` currently has a foreign key to `base_recipes(id)`, run this
migration to correct it:

```sql
alter table public.tarot_cards
  drop constraint if exists tarot_cards_linked_recipe_id_fkey;

alter table public.tarot_cards
  add constraint tarot_cards_linked_recipe_id_fkey
  foreign key (linked_recipe_id) references public.ready_recipes(id);
```

(If Phase 0 finds it's already correctly pointing to `ready_recipes`, skip this — report that
instead.)

---

## PHASE 2 — Admin form logic (the actual split)

### When `arcana_type === 'major'`:
- Recipe picker searches **`ready_recipes`** (not `base_recipes`) — search by `name`/`name_en`,
  show thumbnail using `hero_image_url`, filter to `status = 'draft'` or whatever published-state
  column is used elsewhere (check how the existing recipe list/picker components elsewhere in
  admin filter for "real, usable" ready recipes — mirror that, don't invent a new filter)
- Once a `ready_recipes` row is selected as `linked_recipe_id`:
  - If Phase 0 confirms `hero_image_reference_url` is a genuine alternate display photo: show
    both `hero_image_url` and `hero_image_reference_url` as selectable thumbnails (skip nulls)
  - If Phase 0 confirms it's an AI-generation reference only (not for display): show ONLY
    `hero_image_url` as the (auto-selected, single) thumbnail — no picker needed in that case,
    just confirm visually which image will be used
  - Selected thumbnail's URL → stored in `tarot_cards.card_image_url`
- Caption under thumbnail(s): "Снимката идва от готовата рецепта" (bg)

### When `arcana_type === 'minor'`:
- Keep this linked to **`base_recipes`** via `recipe_role_id` (unchanged from original task —
  Minor Arcana represents a component category like "база"/"крем", not one specific recipe)
- Since Minor Arcana isn't tied to one specific `base_recipes` row (it's a *role*, not a recipe),
  there's no single recipe to auto-pull an image from. Keep the standalone `ImageUpload` component
  for these cards (manual upload), using whatever bucket the rest of admin's `ImageUpload` already
  defaults to (e.g. `recipe-images`) — no new bucket needed.

---

## Constraints
- Use `str_replace` on existing files — these are corrections to already-built code, not a rewrite.
- If Phase 0 reveals the picker already correctly queries `ready_recipes` and only
  `TASK_TAROT_IMAGE_FIELD_FIX.md`'s thumbnail-selection UI is missing, just add that part —
  don't redo work that's already correct.

## Session start
Read `CLAUDE.md`, `CLAUDE_CODE_TASK.md`, and report Phase 0 findings before making any changes.