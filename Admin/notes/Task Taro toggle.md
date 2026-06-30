# TASK: Tarot Admin — Image Source Toggle (Recipe Photo vs. Custom Upload)

> Adds a toggle to the image field in the Tarot Cards admin form, for BOTH Major and Minor
> Arcana. Default: auto-pull from the linked recipe. Toggle option: manual custom upload instead.

---

## PHASE 0 — Investigation (mandatory, report back first)

1. Open `admin/app/dashboard/tarot-cards/[id]/page.tsx` — locate the current image field
   implementation for both Major Arcana (picks from `ready_recipes.hero_image_url`) and Minor
   Arcana (per the most recent fix, now linked to a specific `base_recipes` row via
   `linked_base_recipe_id` — confirm whether that fix's image-handling was already specified to
   auto-show that recipe's `image_url`, or whether Minor Arcana currently still uses plain manual
   `ImageUpload` with no auto-pull; report exactly what exists right now for both before changing
   anything).
2. Confirm `tarot_cards.card_image_url` is the single field both modes write to (per original
   schema) — no new column should be needed, just a UI-level toggle controlling how that one
   field gets populated.
3. Report findings, wait for confirmation before Phase 1.

---

## PHASE 1 — Implementation

### Add a mode toggle, shared structure for both arcana types

```tsx
const [imageSourceMode, setImageSourceMode] = useState<'recipe' | 'custom'>('recipe');
```

Render as a simple two-option toggle/segmented control above the image area, e.g.:
```tsx
<View style={styles.toggleRow}>
  <TouchableOpacity
    onPress={() => setImageSourceMode('recipe')}
    style={[styles.toggleBtn, imageSourceMode === 'recipe' && styles.toggleBtnActive]}
  >
    <Text>От рецептата</Text>
  </TouchableOpacity>
  <TouchableOpacity
    onPress={() => setImageSourceMode('custom')}
    style={[styles.toggleBtn, imageSourceMode === 'custom' && styles.toggleBtnActive]}
  >
    <Text>Друга снимка</Text>
  </TouchableOpacity>
</View>
```
(Adjust to whatever existing toggle/segmented-control pattern already exists in the admin
codebase — check `SOURCE_TYPES` dropdown or any existing toggle UI in `SimpleRecipeForm.tsx` or
similar for a component to reuse rather than building a new one from scratch.)

### Major Arcana behavior

- **Mode = "От рецептата" (default):** show the thumbnail(s) auto-pulled from the linked
  `ready_recipes.hero_image_url` (per the already-built logic) — `card_image_url` auto-set to
  that URL, field is read-only/auto in this mode.
- **Mode = "Друга снимка":** show the standard `ImageUpload` component, letting the admin upload
  a custom image. `card_image_url` is set from that upload instead, overriding the recipe-derived
  default.

### Minor Arcana behavior

- **Mode = "От рецептата" (default):** show the thumbnail auto-pulled from the linked
  `base_recipes.image_url` (the specific component recipe selected via `linked_base_recipe_id`,
  per the prior fix) — `card_image_url` auto-set to that URL.
- **Mode = "Друга снимка":** show the standard `ImageUpload` component for manual override, same
  as Major Arcana's custom mode.

### Persisting the mode choice

Add this to the schema so the admin's toggle choice is remembered when reopening a card for
editing (otherwise every reload would default back to "От рецептата" even if a custom image was
previously chosen):

```sql
alter table public.tarot_cards
  add column if not exists image_source_mode character varying(10) not null default 'recipe';
  -- values: 'recipe' | 'custom'
```

On form load: initialize `imageSourceMode` state from this column's saved value (default
`'recipe'` for cards created before this fix, which is the correct fallback since that's the
current/only behavior they had).

On save: include `image_source_mode` in the PATCH/POST payload alongside `card_image_url`.

### When switching modes, don't lose data unnecessarily

- Switching FROM "custom" TO "От рецептата": re-fetch and re-set the recipe's image
  automatically — don't require the admin to re-select anything.
- Switching FROM "От рецептата" TO "custom": leave `card_image_url` as whatever it currently is
  (the recipe's image) until the admin actually uploads something new via `ImageUpload` — don't
  blank it out preemptively, so an accidental toggle-click doesn't lose the working state.

---

## Constraints
- Use `str_replace` on the existing form file — this is an addition to working code, not a
  rewrite.
- Update API routes (`admin/app/api/tarot-cards/route.ts`, `[id]/route.ts`) to include
  `image_source_mode` in select/insert/update field lists.
- This is admin-only — no mobile-side changes needed (mobile just reads whatever
  `card_image_url` ends up being, regardless of how the admin arrived at that value).

## Session start
Read `CLAUDE.md`, `CLAUDE_CODE_TASK.md`. Complete Phase 0, report current image-field state for
both arcana types, wait for go-ahead before Phase 1.