# TASK — Site Quick Improvements

> Executor: Claude Code at `C:\Dev\KetoCakR\Site\`.
> Surgical edits only. Zero new dependencies. Existing functionality must not disappear.

---

## CHANGE 1 — "How it Works" Section

**File:** `Site/app/page.tsx`

Insert a new section **between the Modules grid and the Recipe Gallery**.

Content:
```
LAB LABEL: "The Process"
H2: "From Ingredients to Masterpiece"
Sub: "Three steps to your perfect keto dessert."

Step 1 — Choose Your Dessert Type
       Icon: cake/dessert (emoji or Heroicon)
       Text: "Cake, cheesecake, tart, mousse — pick your canvas."

Step 2 — Combine Components
       Icon: puzzle piece
       Text: "Mix and match crusts, creams, fillings, and decorations. The app calculates everything."

Step 3 — Get Exact Macros
       Icon: chart/calculator
       Text: "Calories, protein, fat, and net carbs per serving — precise to the gram."
```

Style: 3-column grid (desktop), stacked (mobile). Each step: number (large, ruby, Cormorant Garamond), title, text. Consistent with existing CSS variables — no hardcoded colors.

---

## CHANGE 2 — Hero Copy: Early Access Positioning

**File:** `Site/app/page.tsx` (or `Site/components/WaitlistForm.tsx`)

Find and replace these specific strings:

| From | To |
|------|----|
| `Join the Waitlist` | `Get Early Access` |
| `Join the Waitlist — Free` | `Get Early Access — Free` |
| `join the waitlist` (lowercase variants) | `get early access` |
| Button text `Join` or `Join Waitlist` | `Get Early Access` |
| Hero note (small text under form) | `Free forever tier available. Early members get founding discount.` |

Do NOT change the MailerLite integration logic — only visible text strings.

---

## CHANGE 3 — Nav CTA Button

**File:** `Site/app/layout.tsx` or wherever the `<nav>` is defined.

Add a CTA button in the navigation bar (right side, after nav links):

```tsx
<a href="#waitlist" className="nav-cta">
  🚀 Get Early Access
</a>
```

Style: match `.nav-cta` from globals.css (ruby bg, white text, uppercase, letter-spacing).
Mobile: hide on screens < 640px (avoid nav overflow).

---

## CHANGE 4 — Recipe Cards: Per-Serving Macros

**File:** `Site/components/RecipeGallery.tsx` (or wherever RecipeCard is defined)

Currently the macro badge shows total recipe values. Fix to show **per serving**.

The public API returns: `total_calories`, `total_net_carbs`, `total_servings`.

Calculate per serving before rendering:

```typescript
const perServing = (value: number | null, servings: number | null) => {
  if (!value || !servings || servings === 0) return null;
  return Math.round(value / servings);
};

// Usage in card:
const cal = perServing(recipe.total_calories, recipe.total_servings);
const carbs = perServing(recipe.total_net_carbs, recipe.total_servings);
```

Display format:
```
{cal} kcal · {carbs}g net carbs
```
Add label below or above: `per serving` (small, --text-3 color, 10px, uppercase, letter-spacing).

If `total_servings` is null or 0 → show total values with label `total` instead of `per serving`.

Also apply the same fix to `Site/app/recipe/[slug]/page.tsx` if it shows macro values.

---

## Acceptance Checklist

- [ ] "How it Works" section appears between Modules and Recipe Gallery.
- [ ] All "Join the Waitlist" strings replaced with "Get Early Access".
- [ ] Nav has a "🚀 Get Early Access" button linking to `#waitlist`.
- [ ] Recipe cards show per-serving macros with "per serving" label.
- [ ] Recipe detail page also shows per-serving macros.
- [ ] `npm run build` passes with zero errors.
- [ ] No hardcoded colors — all from CSS variables.
- [ ] No existing sections removed or broken.
