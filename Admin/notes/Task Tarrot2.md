# TASK: Tarot "Картата за деня" — Navigation Revision (supersedes inline/modal approach)

> Builds on top of `TASK_TAROT_HOME_FINAL.md` (the 5-card fan spec). This file changes ONLY:
> (1) the card-back visual to use the real project logo, and
> (2) the post-flip flow to use separate pushed screens instead of inline reveal / modal.
> Everything else from the prior task file (fan geometry §5, float animation §6, numeral
> formatting §2, suit colors §3, mock data §8) stays the same — implement this revision
> assuming that work is either already done or being done together with this file.

---

## PHASE 0 — Investigation (mandatory, report back before coding)

1. Locate the project's actual logo asset — check `Mobile/assets/` for files like `Logo-Blago.png`, `logo-heart.png`, or similar (the Home screen already references `require('../assets/Logo-Blago.png')` per `RecipeDetailView.tsx` — confirm this exact file and whether it's appropriate for the card-back, or whether a different/smaller logo mark exists).
2. Check `Mobile/app/` routing structure — confirm the Expo Router convention used elsewhere (e.g. how `recipe-detail/[id].tsx` is structured) so new tarot screens follow the same pattern.
3. Report back: exact logo file path to use, and proposed route paths for the two new screens (suggest `Mobile/app/tarot/card-face.tsx` and `Mobile/app/tarot/ritual.tsx`, or adjust to match existing conventions if `(modals)` group or similar is more appropriate — check how `(modals)/recipe-generator.tsx` etc. are structured and decide if these should be modals-group screens or top-level stack screens).
4. Wait for confirmation before Phase 1.

---

## §A — Card-back logo (revision to card-back visual spec)

Replace the placeholder Ionicons heart icon with the real project logo:

```tsx
<Image
  source={require('../assets/Logo-Blago.png')} // or correct path confirmed in Phase 0
  style={styles.cardBackLogo}
  resizeMode="contain"
/>
```

Size the logo appropriately for the card-back (roughly 40-50% of card width, centered) — keep the "КЕТО МАГИЯ ТАРО" text below it as before. If the located logo asset is full-color/full-detail (not a simple mark), consider whether a smaller/simpler version is more appropriate at this scale — use your best visual judgment, but prefer reusing the existing asset over creating a new one in this task.

---

## §B — Navigation flow (revision to §7 of the prior task file)

### New flow

1. **Home**: 5-card fan, only center card interactive + floating (unchanged from prior spec).
2. **Tap center card** →
   - Stop float animation
   - Play the flip animation (`rotateY 0→180deg`, ~600ms, `cubic-bezier(.2,.7,.2,1)`) **in place, in Home** — this is purely a visual transition cue, the user briefly sees the card "turn over"
   - Immediately after the flip animation completes (or slightly before its visual end, to feel snappy — test both and pick what feels better), call `markDrawnToday()` (persist via AsyncStorage as before) and `router.push('/tarot/card-face')` passing the drawn card's id as a param
   - Home's fan section, on return navigation (back button), should now reflect the drawn state — see §C below
3. **New screen — Card Face** (`Mobile/app/tarot/card-face.tsx`):
   - Standalone screen (own header with back chevron, consistent with `recipe-detail/[id].tsx` header pattern — check that file for the exact header style/back-button pattern to match)
   - Loads the card by id param from mock data (`Mobile/constants/mockTarotCards.ts`)
   - Renders the `CardFace` content as previously specified: frame, cake/placeholder image, suit chip, numeral badge, card name, theme, pagination dots, italic teaser line
   - Bottom CTA button: "Разкрий посланието →" → `router.push('/tarot/ritual')` with the same card id param
4. **New screen — Daily Ritual** (`Mobile/app/tarot/ritual.tsx`):
   - Standalone screen, same header pattern
   - Loads the same card by id param
   - Renders the `DailyRitual` content as previously specified: energy, phrase, morning tip, trap, evening question, final CTA ("Виж рецепти за декор →" or similar from `cta` field) — wire that final CTA to `console.log('[Tarot] would navigate to filtered recipes', card.suit)` for now (real recipe-filtering is a future phase)

### §C — Returning to Home after drawing

Per the mock-phase persistence logic (AsyncStorage key `tarot_drawn_${date}`):
- If the user navigates back to Home (via back button from either new screen, or app restart) and today's card was already drawn: Home's tarot section should render the drawn `CardFace` content directly inline in the Home section (NOT the fan) — same as specified in the prior task file's §"Once drawn for today" rule. Tapping that inline face again should `router.push('/tarot/card-face')` (or directly to `/tarot/ritual` — your call, but pushing to card-face first for consistency is simpler) to view it full-screen again.
- This means the Home section component (`TarotDailyCardSection`) has two render states:
  - **Undrawn**: the 5-card fan + white panel (as in prior spec)
  - **Drawn**: a compact preview of the drawn card (smaller card face, maybe just image+name+theme, tappable) — keep this compact since it's just a teaser-back-into-the-full-screen, not the full CardFace layout

---

## Constraints (in addition to prior task file's constraints)
- Use Expo Router's standard `router.push()` / `router.back()` — match whatever pattern is used for `recipe-detail/[id]` (e.g. if that uses `useLocalSearchParams` for the id, do the same here).
- The flip animation in Home must complete (or visually read as complete) before or right as the navigation happens — avoid a jarring cut where the flip is still mid-animation when the new screen pushes in. Test on device and adjust timing if needed.
- Keep the two new screens visually consistent with the rest of the app (use `Colors.ts`/`Theme.ts` tokens, same header component pattern as `recipe-detail`).

## Out of scope (still future phases)
- Real Supabase `tarot_cards` table
- Recipe-filtering from the ritual screen's final CTA
- Remaining 22 Major Arcana illustrations / AI generation pipeline

## Session start
Read `CLAUDE.md` and `CLAUDE_CODE_TASK.md` first, plus `TASK_TAROT_HOME_FINAL.md` from the same batch if it hasn't been implemented yet (this file assumes that work as a base). Complete Phase 0, report findings (logo asset path + proposed route structure), wait for go-ahead before Phase 1 code.