# TASK — Blog Categories (Filter Chips + Card Labels)

> Executor: Claude Code at `C:\Dev\KetoCakR\Site\`.
> Surgical addition. Reuses the existing search bar / filter-chip pattern already built
> for `/recipes` (per `TASK_SITE_BROWSE_ALL.md`) — same visual language, same component
> shape, just driven by category instead of dessert type.

---

## Prerequisite (Deyana — manual, not code)

A new column **`Category`** has been added to the Notion blog database (Select type),
with these 4 options:
- Продукт (Product)
- Посуда (Equipment/Cookware)
- Техники (Techniques)
- За начинаещи в кето диетата (Keto Basics for Beginners)

Confirm this column exists and has at least one post tagged, before testing — otherwise
the UI will just show "All" with nothing to filter.

---

## PHASE 1 — Read Category from Notion

**File:** `Site/lib/notion.ts`

1. Find the `BlogPost` type/interface and the `getBlogPosts()` / `getBlogPost()` functions.
2. Add `category: string | null` to the type.
3. In the mapping logic (wherever `title`, `slug`, `summary`, `cover` etc. are extracted
   from `page.properties`), add extraction for the new Select field:
   ```typescript
   category: page.properties.Category?.select?.name ?? null,
   ```
4. Handle posts that don't have a category set yet (older posts) — `category` should be
   `null`, not throw or break rendering. These posts simply won't match any filter chip
   except "All".

---

## PHASE 2 — Filter Chips on Blog Index

**File:** `Site/app/blog/page.tsx`

Reuse the same chip pattern from `/recipes` (dessert-type chips). Visually identical
treatment — active state, spacing, typography — just a different source list.

1. Derive the unique set of categories present in the fetched posts (client-side, same
   approach as Option A for dessert types):
   ```typescript
   const categories = Array.from(new Set(posts.map(p => p.category).filter(Boolean)));
   ```
2. Render chip row: "All" (default active) + one chip per category found.
3. Clicking a chip filters the currently-displayed posts by `post.category === selected`.
   "All" shows everything.
4. **Combine with the existing search bar** (from `TASK_SITE_BROWSE_ALL.md` Change 4):
   category filter and text search both apply together — i.e. show posts matching the
   active category AND matching the search query (if any). Keep both pieces of state
   (`selectedCategory`, `searchQuery`) and filter the list against both conditions.
5. Empty state when the combined filter yields 0 results: "No posts match your search."
   (reuse existing empty-state copy/style, just make sure it triggers correctly when
   category + search combine to zero matches too, not only on search alone).

---

## PHASE 3 — Category Label on Blog Post Cards

**Files:** wherever the blog post card markup lives — likely inline in
`Site/app/blog/page.tsx` and possibly duplicated/shared with the home page "From the
Blog" preview section in `Site/app/page.tsx`.

Add a small category label/badge on each card (top of card, or near the title — match
whatever placement looks natural given the existing card layout; don't force a specific
pixel position, use judgment matching the card's current style).

```tsx
{post.category && (
  <span className="blog-category-badge">{post.category}</span>
)}
```

Suggested style (adapt to match existing design tokens/CSS vars already used elsewhere
in the site — ruby/beige palette, small caps or uppercase treatment consistent with
other badges like "SPEC NO. 04" on the hero):
```css
.blog-category-badge {
  display: inline-block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ruby, #A80048);
  background: rgba(168, 0, 72, 0.08);
  padding: 4px 10px;
  border-radius: 4px;
  margin-bottom: 8px;
}
```

If the card currently has no category and `post.category` is `null`, simply don't render
the badge for that card (no "Uncategorized" placeholder needed).

---

## Acceptance Checklist

- [ ] `lib/notion.ts` reads `Category` Select field into `BlogPost.category` (nullable).
- [ ] Blog index page shows filter chips: "All" + one per category actually present in the data.
- [ ] Clicking a chip filters posts by category.
- [ ] Category filter and text search combine correctly (both conditions apply together).
- [ ] Empty state shows correctly when filters yield 0 results.
- [ ] Each post card shows a small category badge/label (when category is set; hidden when null).
- [ ] No changes to post detail pages (`/blog/[slug]`) required for this task — category is index/card-level only, unless Deyana later asks to show it on the detail page too.
- [ ] `npm run build` passes, zero errors.
- [ ] No existing blog functionality (search, back-links, SEO metadata) broken.

---

## Deferred (not in this task)

- Showing category on the individual post detail page (`/blog/[slug]`) — only mentioned
  here as a possible future addition, not requested yet.
- Dedicated category landing pages (e.g. `/blog/category/tehniki`) — current scope is
  client-side filtering on the index page only.
