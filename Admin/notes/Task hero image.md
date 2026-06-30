# Task: Fix Layer-Count & Flavor/Color Accuracy in Hero Image Generation

> Read CLAUDE.md first for stack, hard rules, DB schema, brand colors.
> Builds on `TASK_REVE_REMIX_FIX.md`, `TASK_REVE_EDIT_FIX.md`, `TASK_VISUAL_SETTINGS_HERO_IMAGE.md`.
> Schema is now confirmed (see below) — this is no longer a blind investigation task, but the
> migration + backfill must still happen carefully and in order.
> Make a plan first, do NOT write generation code until Phase 0 (migration) and Phase 1
> (backfill) are actually done in the database.

---

## Goal
Generated hero images don't reliably match the actual recipe construction:
- **Layer count mismatch:** many recipes use 4 base/sponge layers (2 base recipes, each split
  horizontally into 2), but generated images often show only 3.
- **Flavor/color mismatch:** if a selected base-layer component is e.g. "Малинов блат" (raspberry
  sponge), the generated sponge color/tone should reflect that — not a generic chocolate-brown
  sponge.

---

## CONFIRMED SCHEMA (do not re-investigate — this is the real, current schema)

```sql
create table public.assembly_templates (
  id serial primary key,
  template_key varchar(100) not null unique,
  name varchar(200) not null,
  instructions text not null,           -- free text, NOT structured layer data
  compatible_dessert_types integer[] null,  -- category-level only, no link to a specific recipe
  name_en text null,
  description text null,
  soaking_required boolean null default false,
  intro_text / intro_text_bg / intro_text_en text null,
  instructions_bg text null,            -- known issue: currently in English, needs translation
  instructions_en text null             -- known issue: currently NULL
);

create table public.assembly_template_steps (
  id serial primary key,
  assembly_template_id integer not null references assembly_templates(id) on delete cascade,
  step_number integer not null,         -- gives exact ORDER of the assembly sequence
  step_description text not null,
  step_description_bg / step_description_en text null,
  step_image_url text null,
  primary_image_url text null,
  image_generation_hints text null,     -- !! already exists for exactly this purpose, currently unused
  step_duration_minutes integer null default 5,
  ingredients_used text[] null default '{}',
  equipment_needed integer[] null default '{}',
  unique (assembly_template_id, step_number)
);
```

**Two confirmed gaps** (both being closed by this task's migration):
1. No column on `assembly_template_steps` to classify each step by layer role (base/cream/
   filling/decoration/prep) → layer count isn't programmatically derivable, only guessable from
   free text.
2. No FK from `ready_recipes` to a specific `assembly_template` → we don't know which template's
   step sequence actually applies to a given recipe (only category-level
   `compatible_dessert_types`).

---

## ADDITIONAL GAP — disambiguating multiple same-role components (confirmed real)

**Confirmed via direct question to the user:** the admin panel already allows selecting **more
than one component for the same role** in a single recipe (e.g. two different fillings: a
cheesecake filling AND a raspberry filling, both `recipe_role_id = 3`).

**Concrete example that exposes the gap** (carrot cake style):
```
Блат за морковена торта, плънка от чийзкейк, плънка от малини, блат за морковена торта
→ Base(carrot), Filling(cheesecake), Filling(raspberry), Base(carrot)
```
The template's `assembly_template_steps` for this case would have **two consecutive
`recipe_role_id = 3, step_type = 'layer'` rows** (no role alternation in between) — which the
schema already represents fine. **The actual problem:** when a specific recipe has two different
`recipe_role_id = 3` entries in `selected_components` (cheesecake + raspberry), we don't yet know
which one maps to the *first* плънка-layer step in the template sequence and which to the
*second*. Template steps only say "role=3, layer" generically — they don't know in advance which
two specific components a given recipe will assign to those two слот positions.

**Investigate as part of Phase 0:**
1. Is `selected_components` (JSON/JSONB on `ready_recipes`) currently stored as an array whose
   **order is reliably preserved** end-to-end (admin UI add-order → JSON serialization → DB
   storage → retrieval), and is that order **intended** by the existing UI to represent stacking
   sequence when multiple same-role components are selected? Or is order incidental/not
   guaranteed (e.g. could get reordered by a sort somewhere in the fetch/display path)?
2. If order is already reliable and intentional → **no schema change needed** for this specific
   gap. The prompt-builder (Phase 2) can zip same-role `selected_components` entries (in their
   stored array order) against same-role `'layer'` steps from the template (in `step_number`
   order) positionally — 1st плънка component ↔ 1st плънка-layer step, 2nd ↔ 2nd, etc.
3. If order is **not** reliable/intentional today → propose adding an explicit ordering field
   inside each `selected_components` entry (e.g. `{ recipe_role_id, base_recipe_id, stack_order
   }`), and flag to the user that the admin UI for picking multiple same-role components may also
   need a way to let the user set/confirm that order — this would be a larger change than just
   the image-generation fix, and should be scoped/confirmed separately before implementing rather
   than bundled silently into this task.

**Do not assume either answer — confirm via Phase 0 investigation of the actual current code/data
before deciding which path applies.**

---

## ADDITIONAL GAP #2 — actual layer count is not derivable from template steps at all
## (confirmed via real data dump — read carefully, this overrides earlier assumptions)

**Confirmed via direct inspection of real `assembly_template_steps` data** (template id=3,
`dense-cake-layer` / "Торта с пандишпанови блатове", already backfilled with
`recipe_role_id`/`step_type` as of this writing):

```
Step 1: "Place the first dense cake layer..."                role=1 (база), type=layer
Step 2: "Spread an even layer of cream..."                   role=2 (крем), type=layer
Step 3: "If using a filling, distribute it..."                role=3 (плънка), type=layer
Step 4: "Pipe a border of cream... for stability"             role=2 (крем), type=other
Step 5: "Place the second cake layer... REPEAT with cream..."  role=1 (база), type=layer
Step 6: "Finish by placing the LAST cake layer..."             role=1 (база), type=layer
Step 7: "Coat all sides and top with cream"                   role=2 (крем), type=outer_coating
Step 8: "Chill..."                                            role=NULL, type=rest
Step 9: "Decorate..."                                         role=NULL, type=decoration
```

This template is **generic/procedural**, not a literal per-layer enumeration — step 5 explicitly
says "repeat", meaning the template describes an algorithm (first layer → cream → optional
filling → [repeat for middle layers] → last layer → outer coat) applicable to **any** actual
layer count. Counting `role=1 AND step_type='layer'` rows here gives a fixed **3** (steps 1, 5,
6) regardless of whether the real cake has 2, 4, or 6 physical base layers.

**Confirmed directly by the user:** the actual number of physical base layers for a specific
published recipe is a **manual creative choice made per recipe**, not derivable from
`selected_components` (which always has exactly 1 entry for the "база" role, representing one
*type* of base recipe — e.g. "carrot sponge" — regardless of how many physical layers it's split
into) nor from the template (which only encodes the generic minimum pattern). E.g. one carrot
sponge base recipe might be baked as 2 sponges cut into 4, or baked as 1 sponge cut into 3,
depending entirely on what the admin decides for that specific published recipe.

**Also confirmed by the user:** this layering concept does **not** apply universally — muffins,
cheesecake, and tart-style desserts have exactly **one** base/crust, with no "repeat for more
layers" concept at all. A generic default (e.g. always defaulting to 4) would be wrong for those
dessert types.

### Fix: add an explicit override field, with template-driven detection of when it's relevant

The `layer_count_override` column (added in PHASE 0's migration SQL below) covers this:
- NULL (default) = use the template's natural count of role=1 AND step_type='layer' rows. For
  muffins/cheesecake/tart templates, this natural count is already 1 (single base/crust) — no
  override needed, and the admin UI doesn't need to show a control at all for those.
- Explicit integer (2, 3, 4, 6, ...) = manual override for cake-style templates where this
  specific published recipe uses a different physical layer count than the template's generic
  minimum.

**Detecting whether a template even supports multiple layers (no new field needed for this —
derive it from already-backfilled data):** count `assembly_template_steps` rows for the template
where `recipe_role_id = 1 AND step_type = 'layer'`.
- **Count > 1** (e.g. `dense-cake-layer` = 3) → this is a "repeatable/multi-layer" template type.
  Show a "Брой блатове" (layer count) input in the admin UI for recipes using this template,
  allowing `layer_count_override` to be set; if left unset, fall back to the template's natural
  count (acceptable generic default, e.g. 3 for `dense-cake-layer`, even if not perfectly
  accurate until the admin explicitly sets the real number).
- **Count = 1** (expected for muffin/cheesecake/tart templates, to be confirmed once those
  templates' steps are populated/backfilled the same way) → this is a "single-base" template
  type. Do not show any layer-count control in the admin UI; always treat as exactly 1, ignore
  `layer_count_override` even if somehow set.

**Action needed before Phase 1 implementation:** confirm with the user whether
`assembly_template_steps` has been populated/backfilled yet for the other templates (ids 1, 2, 4,
5, 6, 7, 12–18) the same way it has for id=3 — if not, those templates still need their
`instructions` text manually split into discrete step rows with `recipe_role_id`/`step_type`
before this logic can apply to recipes using them. Do not assume this has happened; check.

---

## PHASE 0 — Migration (run once, directly in Supabase SQL Editor — confirm with the user
## before executing, per established practice for schema changes)

```sql
-- 1. Two-dimensional classification per step: WHICH component + WHAT KIND of action.
-- Confirmed necessary from a real template walkthrough (sponge cake example):
--   - Cutting baked sponges in half before layering is a PREP step, not a layer placement —
--     must not be counted toward layer count even though it relates to role 1 (база/блат).
--   - The same "крем" component is used BOTH as thin between-layer cream (counts as layers)
--     AND as the thick outer coating around the whole cake (a separate, non-layer application)
--     — these must be distinguishable or the layer count will be wrong.
ALTER TABLE public.assembly_template_steps
  ADD COLUMN recipe_role_id integer NULL,   -- which component: 1=база/блат, 2=крем, 3=плънка, 4=декор; NULL=none
  ADD COLUMN step_type varchar(20) NULL
    CHECK (step_type IN ('layer', 'outer_coating', 'prep', 'rest', 'decoration', 'other'));
    -- 'layer'         = an actual structural layer placed in the stack (THIS is what gets counted)
    -- 'outer_coating' = applying the same component around the cake's exterior (not a stack layer)
    -- 'prep'          = cutting/preparing a component before assembly (e.g. splitting sponges)
    -- 'rest'          = waiting/chilling/freezing steps (e.g. "wrap and refrigerate 6 hours")
    -- 'decoration'    = final garnish/decoration steps
    -- 'other'         = anything not fitting the above

-- 2. Link ready_recipes to the specific assembly_template actually used.
ALTER TABLE public.ready_recipes
  ADD COLUMN assembly_template_id integer NULL
  REFERENCES public.assembly_templates(id);

CREATE INDEX IF NOT EXISTS idx_ready_recipes_assembly_template_id
  ON public.ready_recipes (assembly_template_id);

-- 3. Manual override for the actual number of physical base layers in THIS published recipe.
-- Confirmed necessary: one base_recipe ("blat") always appears as exactly 1 entry in
-- selected_components regardless of how many physical layers it's split into when baked — the
-- real count is a creative choice made per published recipe, not derivable from existing data.
-- NULL = use the template's natural role=1/layer step count (already 1 for single-base
-- templates like muffins/cheesecake/tart — no override ever needed for those).
ALTER TABLE public.ready_recipes
  ADD COLUMN layer_count_override integer NULL;
```

**Exact layer stack extraction, once backfilled:**
```sql
-- Step 1: get the template's natural role sequence (which roles, in what order)
SELECT recipe_role_id FROM assembly_template_steps
WHERE assembly_template_id = X AND step_type = 'layer'
ORDER BY step_number;
-- e.g. dense-cake-layer → 1, 2, 3, 1, 1  (Base, Cream, Filling, Base, Base — natural count = 3 base layers)

-- Step 2: check this specific recipe's override
SELECT layer_count_override FROM ready_recipes WHERE id = recipe_id;
-- NULL → use natural count from Step 1 as-is
-- e.g. 4 → repeat the "base" portion of the sequence to reach 4 total base layers when building
--          the prompt (the application code does this expansion, not SQL)
```
The outer coating (`step_type = 'outer_coating'`) and decoration (`step_type = 'decoration'`) are
queried separately and described separately in the prompt — they are not part of the layer count
and are not affected by `layer_count_override`.

⚠️ Before adding an FK constraint on `recipe_role_id` itself (optional, not included above):
confirm the exact name of the table holding the 1=base/2=cream/3=filling/4=decoration role
definitions (referenced elsewhere in code as `recipe_role_id`) before adding
`REFERENCES <that_table>(id)`. Don't guess the table name — check `selected_components` usage
or existing FK constraints first.

---

## PHASE 1 — Backfill (semi-automated, needs manual review — do not blindly auto-UPDATE)

**1a. Classify existing `assembly_template_steps` rows — TWO dimensions per step:**
- Write a script (Python, consistent with project convention for batch SQL generation) that reads
  every step's `step_description` / `step_description_bg` / `step_description_en` and attempts
  keyword-based classification into BOTH `recipe_role_id` AND `step_type`:
  - **`recipe_role_id`** (which component, if any):
    - 1 (Base): "блат", "sponge"
    - 2 (Cream): "крем", "cream", "ganache"/"ганаш" if used as a coating
    - 3 (Filling): "плънка", "filling"
    - 4 (Decoration): "декор", "decoration", "topping", "garnish"
    - NULL for steps with no specific component (e.g. generic chilling)
  - **`step_type`** (what kind of action — this is what determines layer counting):
    - `'layer'` — placing one structural layer in the stack (e.g. "сложете блата", "сложете
      крема" *between* layers) — **only these rows count toward layer sequence/count**
    - `'outer_coating'` — applying a component around the cake's exterior (e.g. "сложете крема
      около тортата") — same component, NOT a stack layer, must not be double-counted
    - `'prep'` — cutting/preparing a component before assembly (e.g. "разрежете блатовете на
      две") — relates to a role but is NOT itself a layer
    - `'rest'` — waiting/chilling/freezing (e.g. "опаковайте с фолио и оставете в хладилника")
    - `'decoration'` — final garnish/decoration steps
    - `'other'` — anything not fitting the above
  - **Be conservative about `'layer'`** — a step only gets this type if it unambiguously places a
    distinct structural layer in the stack. When in doubt, classify as `'other'` and flag for
    manual review rather than guessing `'layer'` (a false positive directly corrupts the layer
    count, which is the whole point of this fix).
- Output a review list (CSV or printed table) of: rows confidently classified (both columns),
  rows ambiguous/unmatched (need manual decision), and rows left NULL with the reasoning — **do
  not run UPDATE statements until the user has reviewed and confirmed the list.**

**1b. Link existing `ready_recipes` to their `assembly_template`:**
- For each `ready_recipe`, list its `dessert_type_id` and the candidate `assembly_templates`
  whose `compatible_dessert_types` array includes that type.
- If exactly one candidate template matches → still surface it for confirmation rather than
  auto-assigning (multiple templates can share a dessert_type, e.g. a 4-layer sponge cake vs a
  6-layer mille crêpe under the same dessert_type).
- If multiple candidates match → flag for manual assignment, do not guess.
- This will likely need the user's direct input recipe-by-recipe — present the list, do not
  attempt full automation here.

**1c. Admin UI — conditional "Брой блатове" (layer count) input:**
- On the `ready_recipe` edit form, add a numeric input bound to `layer_count_override`, but only
  **show** it when the recipe's `assembly_template` is a "multi-layer" type — detected as: that
  template has `COUNT(*) WHERE recipe_role_id = 1 AND step_type = 'layer'` > 1 (per Additional
  Gap #2 above). For single-base templates (muffins, cheesecake, tart — to be confirmed once
  those templates are backfilled), hide this control entirely; never show it just because
  `assembly_template_id` happens to be set.
- Leaving the input empty stores `NULL` (use template's natural count) — do not default the
  input to any specific number client-side.

---

## PHASE 2 — Use the structured data in prompt construction

Once Phase 1 backfill is confirmed for at least the recipe(s) being tested:

1. For a `ready_recipe` with `assembly_template_id` set, derive the **template's natural unit
   structure** from `assembly_template_steps WHERE assembly_template_id = X AND step_type =
   'layer' ORDER BY step_number` (e.g. for `dense-cake-layer`: Base, Cream, [optional Filling],
   Base, Base — natural role=1 count = 3):
   - Identify the **"between-layers" unit** = the `'layer'`-type steps that occur between the
     *first* and *second* role=1 (base) step in that sequence (e.g. Cream, optional Filling).
   - Identify the **edge steps** = the first base step and the final base step.
   - Check `ready_recipes.layer_count_override` for this recipe:
     - **NULL** → use the natural sequence as-is (e.g. 3 base layers for `dense-cake-layer`).
     - **Explicit N** → construct: `Base, [between-unit], Base, [between-unit], ..., Base` with
       exactly N base occurrences total (N−1 repetitions of the between-unit). This is
       application logic (TypeScript), not a single SQL query — the SQL above only supplies the
       template's natural unit shape; the repetition count comes from `layer_count_override`.
2. Separately query rows with `step_type = 'outer_coating'` and `step_type = 'decoration'` for
   that template — describe these in the prompt as the cake's exterior finish, distinct from the
   internal layer stack and **unaffected by `layer_count_override`** (the existing prompt
   builders already conceptually separate "layer structure" from "outer coating/decoration" —
   wire this confirmed data into that existing structure rather than rewriting it from scratch).
3. Map each `'layer'` step to the recipe's actual selected component for that role (from
   `selected_components`):
   - If a role appears **only once** among the recipe's selected components → direct 1:1 mapping
     (no ambiguity).
   - If a role appears **multiple times** (e.g. two different fillings) → zip the same-role
     `selected_components` entries (in their array order) against the same-role `'layer'` steps
     from the template (in `step_number` order), per whichever approach Phase 0's investigation
     confirmed (reliable existing array order, or an added `stack_order` field).
   - Use the mapped component's `name_en` / `description_en` for flavor/color in that specific
     layer's prompt description (e.g. "Filling layer 2: Raspberry Filling — bright red-pink
     color" vs "Filling layer 1: Cheesecake Filling — pale cream color", correctly distinguished,
     not both described identically).
4. Incorporate `image_generation_hints` (already exists on each step, currently unused) directly
   into that layer's prompt text when present.
5. Replace `buildNanoBananaPrompt`'s current **hardcoded, generic** 10-step layer structure
   (same template used for every recipe regardless of actual structure) with this dynamically
   generated sequence. Apply the same dynamic sequence to `buildReveRemixPrompt` /
   `buildReveCreatePrompt`, which currently describe roles generically without an explicit count.
6. **Fallback:** if a recipe has no `assembly_template_id` set yet (not backfilled), keep the
   current generic prompt behavior and log a clear warning — do not error out or block
   generation.

---

## PHASE 3 — Test

1. Generate a hero image for a recipe with a confirmed 4-base-layer template (per Phase 1
   backfill, sponge cake example) — confirm the result shows 4 distinct base layers, not 3.
2. Generate for a recipe with a clearly flavored component (e.g. raspberry sponge) — confirm
   rendered color/tone matches.
3. **Sacher-torte-style edge case:** generate for a 2-base-layer template where the same role
   (e.g. плънка/filling) is used both as an inner layer AND as a separate `outer_coating` step
   (apricot jam between layers + apricot glaze over the whole cake, then a second
   `outer_coating` step in a different role — chocolate ganache over that). Confirm the prompt
   correctly describes: exactly 2 base layers with filling between them, AND a two-stage exterior
   finish (glaze, then ganache on top) — not 4 filling layers, and not a single merged coating
   description that loses the sequence.
4. **Carrot-cake-style edge case (two different fillings, same role):** generate for a recipe
   with two consecutive плънка-layer steps in the template AND two different
   `recipe_role_id = 3` entries in `selected_components` (e.g. cheesecake + raspberry). Confirm
   the prompt correctly distinguishes which filling appears in which position (not the same
   filling described twice, not the two fillings swapped).
5. **`layer_count_override` expansion:** generate the same recipe three times with
   `layer_count_override` set to `NULL`, then `3`, then `6`. Confirm the prompt's described base
   layer count changes accordingly each time (not stuck at the template's natural count of 3
   regardless of the override), and that the between-layers unit (cream/filling) is repeated the
   correct number of times in each case, not just the base count alone.
6. **Single-base template regression:** generate for a recipe using a single-base template
   (muffin/cheesecake/tart, once backfilled) — confirm no layer-count control appears in the
   admin UI for it, and the prompt correctly describes a single base/crust regardless of whether
   `layer_count_override` happens to have a stray value set (it should be ignored for these
   template types per Additional Gap #2).
7. Confirm this works for **both** the Remix path (component images present) and the Create
   fallback path (component images missing) — the text prompt itself needs to be accurate for
   the Create fallback case too, not just rely on reference photos.
8. Regression: confirm a recipe with no `assembly_template_id` set still generates using the
   prior generic behavior, no errors.
9. Regression: confirm Visual Settings and the pre-generation notes panel (if
   `TASK_HERO_IMAGE_PREGEN_PANEL.md` has landed) still work unchanged.

---

## NOTE — same applies to `user_recipes` (future, currently deferred — do not implement now)

`user_recipes` (client-generated recipes, analogous structure to `ready_recipes`) will need the
**same** `assembly_template_id` + `layer_count_override` columns and the same Phase 2 prompt
logic, once AI hero-image generation is extended to that table. This is tracked as a deferred
feature in `ROADMAP_STATUS_ADDITIONS.md` ("AI image generation for user_recipes" — gated behind
RevenueCat premium, rate-limited, not yet started).

**Do not add these columns to `user_recipes` as part of this task.** That table isn't touched by
any active code yet, and adding schema ahead of an unbuilt, deferred feature risks drifting out of
sync with whatever that feature's actual implementation ends up needing. When that feature is
eventually scoped, point back to this task file (`TASK_HERO_IMAGE_LAYER_ACCURACY.md`) as the
reference for the same migration + Phase 2 logic, applied to `user_recipes` instead of
`ready_recipes`.

---
- The two `ALTER TABLE` statements in Phase 0 are pre-approved — run them, but confirm with the
  user immediately before executing in case anything changed since this task was written.
- Do NOT auto-run backfill UPDATEs without presenting the classification list for review first.
- Do NOT guess the `recipe_role_id` FK target table name — confirm before adding any FK
  constraint beyond the plain column.
- Reuse existing per-component data (`nameEn`, `descriptionEn`, `imageUrl`) already fetched in
  the route rather than adding new queries beyond what Phase 2 requires.
- Keep verbose `console.log` step-tracing.
- Prefer `str_replace`-style surgical edits over full file rewrites.

---

## Session Start Template
```
Read CLAUDE.md and this file (TASK_HERO_IMAGE_LAYER_ACCURACY.md).
Schema is confirmed — do not re-investigate assembly_templates/assembly_template_steps structure.
Today's task: PHASE 0 — confirm the two ALTER TABLE statements with the user, then run them.
Make a plan first, do NOT write generation code yet.
```