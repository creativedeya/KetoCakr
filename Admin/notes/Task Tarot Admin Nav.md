# TASK: Tarot Admin — Navigation Link + Minor Arcana Component Linkage (Final)

> Two fixes to the already-built Tarot Cards admin section + mobile screen.
> Supersedes any earlier draft of this same fix — this is the confirmed final version.

---

## PHASE 0 — Investigation (mandatory, report back first)

1. Locate the admin sidebar/navigation component (check `admin/app/dashboard/layout.tsx` or
   `admin/components/Sidebar.tsx`/similar — wherever nav links to "Simple Recipes", "Base
   Recipes" etc. are defined). Report exact file + structure of existing nav items.
2. Open `admin/app/dashboard/tarot-cards/[id]/page.tsx` — locate the current "🔗 Свързване с
   Рецепта" section for Minor Arcana. Report current implementation (currently shows a
   `recipe_role_id` dropdown with no further selection, per earlier session).
3. Confirm `recipe_roles` table's actual `name` values for база/крем/плънка/декор (exact strings
   as stored, e.g. "База" vs "Блат" — check actual rows).
4. Confirm `ready_recipes.selected_components` JSONB shape — re-confirm the exact key name used
   for the base recipe reference inside each array element (per earlier session's code it's
   `base_recipe_id` — verify this is still accurate by checking a live row or the
   `recipe-detail/[id].tsx` code that already parses this column).
5. Wait for confirmation before Phase 1.

---

## FIX 1 — Admin sidebar navigation link

Add a "Таро Карти" nav item to the admin sidebar, positioned near other content-management
sections (e.g. near "Simple Recipes"/"Base Recipes"/"Lab Notes" — use judgment on exact
placement). Match the existing icon library/pattern used by other nav items.

```tsx
{ label: 'Таро Карти', href: '/dashboard/tarot-cards', icon: <SomeIcon /> } // match exact pattern
```

---

## FIX 2 — Minor Arcana: auto-derive role from suit, then pick ONE specific component recipe

### Confirmed suit → role mapping:
```ts
const SUIT_TO_ROLE_NAME: Record<string, string> = {
  pentacles: 'База',  // блат
  cups:      'Декор',
  swords:    'Крем',
  wands:     'Плънка',
};
```
Fetch `recipe_roles` once and resolve the actual `id` by matching `name` against this map
(adjust key strings if Phase 0 finds slightly different actual values, e.g. "Блат" instead of
"База" — match what's really in the DB, don't assume).

### Schema addition

```sql
alter table public.tarot_cards
  add column if not exists linked_base_recipe_id uuid null
  references public.base_recipes(id);
```

- **Major Arcana** → `linked_recipe_id` → `ready_recipes(id)` (unchanged, already correct)
- **Minor Arcana** → new `linked_base_recipe_id` → `base_recipes(id)` (this fix)
- `recipe_role_id` stays populated too (auto-derived from suit, useful as a fallback/display
  field even though the recommended-recipe-search below makes it less critical)

### New "🔗 Свързване с Рецепта" section behavior for Minor Arcana:

1. When `suit` is selected, auto-resolve `recipe_role_id` from the mapping above — show as
   **read-only context**, not an editable dropdown:
   ```
   Тип компонент: База (определено от боята Пентакли)
   ```
2. Below that, a **searchable recipe picker** querying `base_recipes` filtered by the resolved
   role, letting the admin choose ONE specific component recipe (e.g. "Орехов блат"):
   ```ts
   const { data } = await supabase
     .from('base_recipes')
     .select('id, name, name_en, image_url')
     .eq('recipe_role_id', resolvedRoleId)
     .order('name');
   ```
   Render as searchable dropdown/autocomplete, mirroring the UX pattern already built for the
   Major Arcana `ready_recipes` picker.
3. Selected recipe's `id` → stored in `tarot_cards.linked_base_recipe_id`.

---

## FIX 3 — Mobile: "Виж рецепти" for Minor Arcana queries `ready_recipes` by component, not by role

This is the corrected behavior (confirmed): tapping "Виж рецепти" on a Minor Arcana card (e.g.
linked to "Орехов блат") should show all **complete, ready-made cakes** that use that specific
component — e.g. "Класическа орехова торта", "Орехова торта с шоколадов крем" — NOT a generic
list of all base/cream/filling/decor options.

### Rework `Mobile/app/tarot/recipes-by-role.tsx`

Rename conceptually (file can keep its name or be renamed to `recipes-using-component.tsx` —
your call, but update the route reference in `ritual.tsx` accordingly if renamed) to query
`ready_recipes` filtered by JSONB containment instead of `base_recipes` filtered by role:

```ts
// Param now passed: linkedBaseRecipeId (the specific base_recipes.id), not roleId
const { data, error } = await supabase
  .from('ready_recipes')
  .select('id, name, name_en, hero_image_url, total_calories, total_net_carbs, total_servings, selected_components')
  .eq('status', 'draft') // or whatever "publicly visible" filter is used elsewhere — confirm in Phase 0
  .order('name');

// Then client-side filter (since JSONB array containment by nested key needs either a Postgres
// containment query or client-side filtering — prefer a proper Postgres query if straightforward,
// otherwise filter client-side as a pragmatic first pass):
const filtered = (data || []).filter((recipe) => {
  const components = recipe.selected_components as any[];
  return components?.some((c) => c.base_recipe_id === linkedBaseRecipeId);
});
```

If a more efficient server-side query is straightforward with Supabase's JSONB operators (e.g.
`@>` containment operator via `.contains()` or a raw filter), prefer that over client-side
filtering — check Supabase JS client docs/existing usage in the codebase for JSONB filtering
patterns before deciding; client-side filtering is an acceptable fallback if the dataset size is
small (currently ~1 published recipe, will grow to 15-25 per the project roadmap — not large
enough to require optimization urgency, but note this as a "revisit if the catalog grows much
larger" comment in the code).

### Update `Mobile/app/tarot/ritual.tsx`

Change the Minor Arcana CTA navigation to pass the component id instead of role id:
```ts
router.push({
  pathname: '/tarot/recipes-by-role', // or renamed path
  params: { linkedBaseRecipeId: card.linked_base_recipe_id, componentName: card.theme },
});
```

### Screen header/empty state

- Title: e.g. "Торти с {componentName}" (bg: "Торти с Орехов блат")
- Empty state (if zero `ready_recipes` currently use this component): friendly message, e.g.
  "Все още няма публикувани торти с този компонент — ще се появят тук съвсем скоро." — this is a
  realistic case given the project's current low published-recipe count (~1), so handle it
  gracefully, not as an error state.

---

## Constraints
- Use `str_replace` for all changes to existing files.
- Update admin API routes (`admin/app/api/tarot-cards/route.ts` and `[id]/route.ts`) to
  include `linked_base_recipe_id` in select/insert/update field lists.
- Report Phase 0 findings (especially the exact `selected_components` key name and `recipe_roles`
  name strings) before writing Phase 1+ code, since incorrect assumptions here would silently
  break the filter.

## Session start
Read `CLAUDE.md`, `CLAUDE_CODE_TASK.md`. Complete Phase 0, report findings, wait for go-ahead.