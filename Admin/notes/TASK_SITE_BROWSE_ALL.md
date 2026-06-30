# TASK — Site Polish: Browse-All Recipes Page + CTA Fix + Blog Search

> Executor: Claude Code at `C:\Dev\KetoCakR\Site\`.
> Surgical changes. No existing functionality removed. Public API only — never `ready_recipes` directly.

---

## CHANGE 1 — Home Gallery: Limit to 2 Rows + "See All" Link

**File:** `Site/app/page.tsx` (and/or `Site/components/RecipeGallery.tsx`)

Currently the home page Recipe Gallery section fetches/displays recipes without a row cap.

- Limit the home page gallery to **2 rows** of cards. Since the grid is responsive
  (3-col desktop / 2-col tablet / 1-col mobile), calculate the cap as `columns * 2`,
  or simpler: just request `limit=6` from the public API (assumes 3-col desktop as the
  baseline) — on smaller screens it'll naturally wrap to more visual rows but the dataset
  stays the same 6 items. Acceptable tradeoff, matches common patterns.
- Add a "See All Recipes →" link/button below the grid, styled consistent with other
  CTAs (ruby bg or ruby text + uppercase, letter-spacing — match `.nav-cta` or
  the "View Recipe" link style already in the codebase).
- Link target: `/recipes` (new page, built in Change 2).

```tsx
// Site/app/page.tsx — gallery fetch
const res = await fetch(`${process.env.NEXT_PUBLIC_PUBLIC_API_URL}/api/public/recipes?limit=6`, {
  next: { revalidate: 300 }
});
```

```tsx
<div style={{ textAlign: 'center', marginTop: 40 }}>
  <Link href="/recipes" className="nav-cta" style={{ display: 'inline-block' }}>
    See All Recipes →
  </Link>
</div>
```

---

## CHANGE 2 — New `/recipes` Page (Browse All)

**File:** `Site/app/recipes/page.tsx`

Full catalog browse page. This is the site's equivalent of Mobile Tab 2 (Search) —
reuse the same mental model: search bar + dessert type filter chips + results grid.

### 2.1 Layout
```
LAB LABEL: "The Full Collection"
H1: "All Recipes"
Sub: "Search or filter by dessert type."

[Search input]  (full width or prominent, debounced)

[Filter chips row]: "All" (default active) + one chip per dessert_type_name
  (fetched dynamically from public API — see 2.3)

[Results grid]: same RecipeCard component used on home page
[Empty state]: "No recipes match your search." when 0 results
[Pagination or "Load More"]: see 2.4
```

### 2.2 Search bar (Client Component)

**File:** `Site/components/RecipeSearchBar.tsx`

```tsx
'use client';
import { useState, useEffect } from 'react';

export function RecipeSearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => onSearch(value), 300); // debounce, matches mobile Tab 2 pattern
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      type="text"
      placeholder="Search recipes..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      style={{ /* match site input styling, full-width, generous padding */ }}
    />
  );
}
```

This calls `/api/public/recipes?query=...` (already supports bilingual `name_en`/`name_bg`
ilike search per `TASK_B_PUBLIC_VIEW_API.md` Phase 2 — no backend changes needed).

### 2.3 Dessert type filter chips (dynamic)

The public API doesn't currently expose a dedicated dessert-types list endpoint —
only `dessert_type_name` embedded per recipe row in `/api/public/recipes`.

**Two options, pick based on what's fastest to ship:**

**Option A (no backend change, recommended for speed):** fetch a larger page of recipes
(`limit=50`) once on page load, derive the **unique set** of `dessert_type_name` +
`dessert_type_id` pairs client-side, render as chips. Works because dessert types are
a small, slow-changing list (per project memory, low cardinality).

**Option B (cleaner, small backend addition):** add a new public route
`Admin/app/api/public/dessert-types/route.ts` that does
`SELECT id, name, name_en FROM dessert_types ORDER BY name` via service_role, returns
`{ results: [...] }`. Slightly more correct (works even if a type has 0 recipes yet),
but is a new endpoint — flag this as an optional follow-up if Option A ships faster.

**Go with Option A first** unless dessert_types needs to show empty categories too.

```tsx
// Client-side derivation (Option A)
const uniqueTypes = Array.from(
  new Map(recipes.map(r => [r.dessert_type_id, r.dessert_type_name])).entries()
);
```

Chip behavior: clicking a chip filters the grid by `dessert_type_id` (re-fetch with
`?dessert_type_id=X` or client-side filter if Option A's initial 50-item fetch already
has everything — pick whichever avoids extra round-trips for this dataset size, ~15-25
recipes total per ROADMAP Stage C target).

### 2.4 Pagination / Load More

Given the current target of 15–25 published recipes (ROADMAP Stage C), a single
`limit=50` fetch covers the whole catalog — **no pagination needed yet**. Just fetch
everything once, filter/search client-side OR re-fetch on search/filter change (either
is fine at this volume). Leave a comment in the code flagging that real pagination
(`offset` param, already supported by the API) should be added once the catalog exceeds
~50 recipes.

### 2.5 generateMetadata

```tsx
export const metadata = {
  title: 'All Recipes — KetoCake Lab',
  description: 'Browse the full collection of keto dessert recipes.',
};
```

---

## CHANGE 3 — Recipe Card CTA: Site Detail → App Deep Link

**Files:** `Site/components/RecipeGallery.tsx` (or wherever `RecipeCard` lives),
`Site/app/recipe/[slug]/page.tsx`

Decision: the card's CTA goes to the **site's own detail page** (`/recipe/{slug}`),
not directly to a placeholder. The detail page itself has the "Open in App" button.

**3.1 — Recipe card CTA (in gallery/grid):**
```tsx
<Link href={`/recipe/${recipe.slug}`} className="recipe-card-cta">
  View Recipe →
</Link>
```
Remove/replace any current "Coming to the App" placeholder text on the card itself —
that messaging now lives one level deeper, on the detail page.

**3.2 — Detail page CTA (already scaffolded in Phase 5 of `TASK_MARKETING_SITE.md`):**
Confirm `/recipe/[slug]/page.tsx` has the "Open in KetoCake Lab App →" button pointing
to `blagocake://recipe/{slug}`, with a fallback note/link for users without the app
installed (App Store / Play Store links — placeholder URLs are fine until Stage E ships).

If that CTA is missing or still says "Coming to the App", add/fix it now:
```tsx
<a
  href={`blagocake://recipe/${recipe.slug}`}
  className="nav-cta"
>
  Open in KetoCake Lab App →
</a>
<p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
  Don't have the app yet? <a href="#waitlist">Join the waitlist</a> for early access.
</p>
```

(App Store/Play Store badge links can replace the waitlist fallback once the app is
published — not blocking for this task.)

---

## CHANGE 4 — Blog Search

**File:** `Site/app/blog/page.tsx`

Reuse the same search pattern as Change 2.2 (matches the mobile app's Tab 2 / Search
search-bar logic, per the request — same debounce, same input styling).

### 4.1 Add search input above the post grid
```tsx
<RecipeSearchBar onSearch={setQuery} /> {/* reuse the component, generic enough for both */}
```
Consider renaming the shared component to something topic-neutral if reused across both
recipes and blog, e.g. `Site/components/SearchBar.tsx` instead of `RecipeSearchBar.tsx`,
since it's now used for two different content types.

### 4.2 Filter logic
Blog posts are fetched from Notion (`lib/notion.ts` `getBlogPosts()`). At current/expected
volume (a handful of posts), filter **client-side** by title/summary substring match —
no need to hit Notion's API per keystroke.

```tsx
const filtered = posts.filter(p =>
  p.title.toLowerCase().includes(query.toLowerCase()) ||
  p.summary.toLowerCase().includes(query.toLowerCase())
);
```

### 4.3 Empty state
"No posts match your search." when `filtered.length === 0` and `query !== ''`.

---

## Acceptance Checklist

- [ ] Home page gallery shows ≤6 recipes (2 visual rows on desktop), with "See All Recipes →" link to `/recipes`.
- [ ] `/recipes` page: search bar (debounced) + dynamic dessert-type filter chips + results grid.
- [ ] `/recipes` empty state when search/filter yields 0 results.
- [ ] Recipe card CTA (home + `/recipes`) → `/recipe/[slug]` (site detail page).
- [ ] `/recipe/[slug]` → "Open in App" deep link CTA present (or fixed if previously a dead/placeholder button).
- [ ] Blog page has working search bar filtering posts client-side by title/summary.
- [ ] No new direct access to `ready_recipes` — only `/api/public/recipes` used.
- [ ] `npm run build` passes, zero errors.
- [ ] No existing sections/pages removed or broken.

---

## Deferred (not in this task)

- Real pagination once catalog exceeds ~50 recipes (API already supports `offset`).
- Dedicated `/api/public/dessert-types` endpoint (Option B in 2.3) — only if Option A
  proves insufficient.
- App Store / Play Store badges (need published app first).
- Deep link testing (needs native EAS build — Stage E).
