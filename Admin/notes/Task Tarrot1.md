# TASK: Tarot "Картата за деня" — Home Section (FINAL SPEC, per official tech report)

> This is the authoritative version, based on "Кето Таро - Доклад за Claude Code" (v1, юни 2026).
> It REPLACES all previous attempts at this Home section. Read this file fully before coding.
> Source of truth for card content/props: `Кето Таро Карта.dc.html` component (already exists in the
> design handoff — locate it in the project files; do NOT rewrite its internals, only consume it).

---

## PHASE 0 — Investigation (mandatory, report back before coding)

1. Locate `Кето Таро Карта.dc.html` (or its React/TS equivalent if already ported) in the project. Confirm its exact prop interface matches §1 below. If it only exists as a `.dc.html` design-handoff file and has NOT been ported to a React Native component yet, report this clearly — porting it is part of this task (see §1).
2. Locate `Кето Таро - Шаблон.dc.html` (example board with 5 sample cards) if present — useful as reference for prop values, not to be shipped as-is.
3. Check whether `react-native-reanimated` is already a dependency in `Mobile/package.json`.
   - If YES → use `useSharedValue`, `withRepeat`, `withTiming`, `useAnimatedStyle` for both the float and flip animations (matches report §7.6 exactly).
   - If NO → use React Native's built-in `Animated` API (`Animated.Value`, `Animated.loop`, `Animated.timing`, `interpolate`) — functionally equivalent, slightly less smooth, zero new dependency.
   - Report which path you're taking and why before writing Phase 1 code.
4. Check `Mobile/constants/mockTarotCards.ts` from prior sessions — this will need restructuring to match the report's exact prop shape (§1). Report current shape vs. needed shape.
5. Check `Mobile/app/(tabs)/home/index.tsx` for any remnants of previous tarot section attempts — these will be fully replaced.
6. Report all findings. Wait for confirmation before Phase 1.

---

## §1 — Card component prop interface (source of truth)

If `Кето Таро Карта.dc.html` needs porting to a React Native component (`Mobile/components/KetoTarotCard.tsx`), it must accept these props exactly:

| Prop | Type | Description |
|---|---|---|
| `suit` | `'major' \| 'pentacles' \| 'cups' \| 'swords' \| 'wands'` | determines color, element, shape |
| `numeral` | `string` | raw value in ANY format — component auto-formats (see §2) |
| `pips` | `number` (0-14) | dot/symbol count — rendered ONLY for Minor Arcana number cards (0 for Major Arcana and for court/person cards) |
| `title` | `string` | card name. **IMPORTANT: prop is `title`, NOT `name`** (name is reserved by dc-import tooling) |
| `theme` | `string` | keto sub-theme / subtitle under the name |
| `image` | `string` | URL or local path to the cake photo (Supabase link) |
| `energy` | `string` | "Energy of the day" — short phrase |
| `phrase` | `string` | quote/affirmation (large italic) |
| `morning` | `string` | Morning tip (paragraph) |
| `trap` | `string` | Trap of the day (warning) |
| `evening` | `string` | Evening question (reflection) |
| `cta` | `string` | text for the button linking to recipes |
| `dateText` | `string` | date shown on the face screen |

### §2 — Numeral auto-formatting (component internal logic)

The component receives `numeral` in ANY input format and renders it correctly per card type — caller does NOT pre-format:

- **Major Arcana**: render as Roman numerals (I, II ... XXI) inside a gold-bordered circular medallion
- **Minor — number cards (pips)**: render as Arabic numerals (1-10) inside a plain disc colored per suit
- **Minor — court cards (persons)**: render as a single Latin letter inside a disc:
  - Paje/Page → accepts `"паж"` / `"page"` / `"P"` / `"11"` → renders `"P"`
  - Рицар/Knight → accepts `"рицар"` / `"knight"` / `"R"` / `"12"` → renders `"R"`
  - Дама/Queen → accepts `"дама"` / `"queen"` / `"D"` / `"13"` → renders `"D"`
  - Крал/King → accepts `"крал"` / `"king"` / `"K"` / `"14"` → renders `"K"`

Implement a small internal `formatNumeral(suit, numeral)` helper inside the component that handles all these input variants and returns the correctly formatted display string + determines badge style (medallion vs. plain disc).

### §3 — Suit → color mapping

```ts
export const TAROT_SUIT_COLORS = {
  pentacles: '#1AA88B', // Земя · Блат
  cups:      '#4F9DC4', // Вода · Декор
  swords:    '#7C8090', // Въздух · Крем
  wands:     '#E2553B', // Огън · Плънка
  major:     { accent: '#A80048', gold: '#C9A24B' }, // медальон + злато
} as const;
```

Add this to `Mobile/constants/Colors.ts` under a `tarot` key if not already present from a prior session (check first, don't duplicate).

### §4 — The component's two screens

The `KetoTarotCard` component (or whatever it's named after porting) renders/supports TWO screens, used at different points in the flow:

1. **Card face** (`CardFace`): frame, cake photo, suit chip top-left (e.g. "● ЧАШИ · ВОДА"), numeral badge top-right, card name (bold, centered), theme/subtitle (small, centered, uppercase tracking), 3 pagination dots, italic teaser line ("Една подсказка те очаква днес."), and a primary CTA button "Разкрий посланието →"
2. **Daily ritual** (`DailyRitual`): header (back chevron, "Дневен ритуал" title, heart/share icons), suit chip + card name + theme again (smaller, as context header), "ЕНЕРГИЯ НА ДЕНЯ" label + energy phrase, italic large quote (`phrase`), "✦ СУТРЕШНА ПОДСКАЗКА" section (`morning`), "⚠ КАПАН НА ДЕНЯ" section (`trap`), "↻ ВЕЧЕРЕН ВЪПРОС" section (`evening`), CTA button at bottom (`cta` text, e.g. "Виж рецепти за декор →")

These map to what was previously built as separate components (`TarotCardOfDay`'s drawn-state + `TarotRitualModal`) — if those already exist from prior sessions, REFACTOR them to be internal screens of the unified `KetoTarotCard` component rather than separate files, matching the report's "one component, two screens" model. Use your judgment on internal file splitting (e.g. `KetoTarotCard/CardFace.tsx` + `KetoTarotCard/DailyRitual.tsx` + `KetoTarotCard/index.tsx` is fine) as long as the public API is the single component described in §1.

---

## §5 — Home section: the 5-card fan

This is the NEW Home behavior, replacing all prior attempts.

### Layered structure (z-order, per report §7.1)

```
z: 3-4   Fan of 5 card-backs (decorative, pointer-events: none on the container)
z: 2     White panel — title, subtitle, primary "Изтегли карта" button, shuffle/reset button
   -     Header + tab bar (standard app nav, unaffected)
```

The white panel sits BEHIND the fan visually (fan overlaps the top of the panel), with the panel's top padding (~84px equivalent — adjust for RN by testing, this is a CSS px value from a web prototype) reserved so the peeking cards have room above the panel content.

### Fan geometry (per report §7.2 — EXACT values, adapt px→RN points 1:1 unless testing shows visual issues)

Each card-back is absolutely positioned with `left: 50%`, transform-origin at bottom-center, arranged via `translateX` + `rotate`, symmetric around center:

| Position | translateX | rotate | z-index | bottom offset |
|---|---|---|---|---|
| far-left | -156 | -28deg | 1 | 2 |
| inner-left | -107 | -14deg | 2 | 9 |
| **center** | -66 | 0deg | 4 | 18 |
| inner-right | -13 | 14deg | 2 | 9 |
| far-right | 40 | 28deg | 1 | 2 |

> Rule: `translateX = -(card_width/2) + offset`; each card's center is symmetric about the container's horizontal middle. The center card is slightly larger than the other 4 and has zero rotation, plus the float animation (see §6).

In React Native, implement this as a `<View style={{ position: 'relative', height: <enough for fan + peek> }}>` container holding 5 absolutely-positioned `<CardBack>` views, each with the table's `translateX`/`rotate`/`zIndex` baked in via a `position` prop (`'far-left' | 'inner-left' | 'center' | 'inner-right' | 'far-right'`).

### Card back design (one shared component, per report §7.3)

Create `Mobile/components/TarotCardBack.tsx`:
- Props: `position` (one of the 5 above, determines transform/z-index), `isCenter?: boolean` (drives float animation + interactivity), `onPress?: () => void`
- Visual: cream background `#FBF7F0`, double gold border `#C9A24B` (outer thin border + inner thin border with small gap, OR a single border with a subtle inset shadow line — use your best visual judgment to approximate "double gold кант"), centered heart-with-dots logo icon (raspberry `#A80048` — use an Ionicons `heart` as placeholder if no logo asset exists yet, check `Mobile/assets/` for a heart logo PNG first and use it if present), text below: "КЕТО МАГИЯ ТАРО" (small caps, gold/muted)
- Only the CENTER card has `pointer-events: auto` + is `TouchableOpacity`-wrapped; the other 4 are purely decorative (no touch handling, `pointerEvents="none"` on their wrapper)

### §6 — Center card "breathing" float animation (per report §7.6-A)

Continuous, infinite, while in the "undrawn" (fan) state:
```
translateY: 0 → -5 → 0, duration 5000ms total, ease-in-out, infinite loop
```
Respect reduced-motion: check `AccessibilityInfo.isReduceMotionEnabled()` on mount; if true, skip the float animation entirely (static center card).

Stop the float animation the moment the user taps the center card (transitions into the flip).

### §7 — Tap → flip → reveal flow (per report §7.5/§7.6-B/§9 pseudocode)

```ts
// Conceptual logic — adapt to chosen animation lib from Phase 0
function onTapCenter() {
  if (drawnToday) return; // only once per day — see §8 persistence
  const card = pickCardOfTheDay(); // §8
  stopFloatAnimation();
  startFlip(); // rotateY 0 → 180deg, 600ms, cubic-bezier(.2,.7,.2,1) — backface-visibility hidden on both faces
  // after flip completes (~600ms):
  //   → hold revealed CardFace briefly (~900ms) — OR show it persistently, see UX note below
  //   → user can then tap "Разкрий посланието →" to see DailyRitual screen
  markDrawnToday();
}
```

**UX clarification (resolves report's slight ambiguity between "auto-navigate after 900ms" vs. "wait for explicit CTA tap"):** After the flip completes, show the `CardFace` screen and WAIT for the user to tap "Разкрий посланието →" — do NOT auto-navigate. This matches the user's explicit prior instruction in this project: the reveal of the ritual content should be a deliberate second tap, not automatic. The "~900ms hold" from the report is satisfied by the flip's own settle time; no additional auto-advance timer is needed.

**Once drawn for today:** The Home section should show the `CardFace` directly (no fan, no flip) — per report §"Картата за деня се избира от бекенда... Флаг drawnToday — пази, че рефрешът не сменя картата." The fan ONLY appears once per day, before the user has drawn.

### §8 — Card-of-the-day selection + persistence (mock phase — no backend yet)

Since we don't have a backend/Supabase table yet (that's a future phase), implement this in `Mobile/constants/mockTarotCards.ts`:

```ts
// Deterministic by date (matches report's "дата + userId" intent, simplified to date-only for mock phase)
export function pickCardOfTheDay(): TarotCardData {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return MOCK_TAROT_DECK[seed % MOCK_TAROT_DECK.length];
}
```

Persistence of `drawnToday` + which card was drawn: use `AsyncStorage` with a key like `tarot_drawn_${YYYY-MM-DD}` storing the drawn card's id. On Home mount, check today's key:
- If present → skip the fan entirely, render `CardFace` (and allow tap-through to `DailyRitual`) using the stored card id
- If absent → render the fan, awaiting the draw

Reset at local midnight is handled naturally since the key is date-based — no explicit reset logic needed beyond checking "today's" key.

### Mock deck data shape

Restructure `Mobile/constants/mockTarotCards.ts` to match §1's prop shape exactly (rename fields if the prior session used different names — e.g. `cardName`→`title`, `energyWord`→`energy`, `dailyPhrase`→`phrase`, `morningTip`→`morning`, `dailyTrap`→`trap`, `eveningQuestion`→`evening`). Provide at least 5 mock cards: 1 Major Arcana, and one each from `pentacles`/`cups`/`swords`/`wands` (to visually verify all 4 suit colors + the major medallion style work). Each needs bilingual content (`*_bg` / keep base fields as bg per existing project convention — check how other bilingual content is structured elsewhere in `Mobile/constants/` first and match that pattern, e.g. if other mocks use `nameBg`/`nameEn` pairs, mirror that here rather than inventing a new convention).

`image` field: leave `null`/empty for all mock cards (no real cake photos wired yet) — `CardFace` should gracefully show a placeholder (soft gradient block with a sparkle icon) when `image` is falsy.

---

## §9 — Wire into `Mobile/app/(tabs)/home/index.tsx`

1. Remove all previous tarot section code/imports from prior sessions (the simple teaser, the two-card version) — full replacement.
2. Add the new section in the same location as before: after "Твоите рецепти" (`userRecipes`), before "Готови рецепти по тип". Use `SectionHeader` for consistency with other Home sections, title key `home.tarot.title` (bg: "Картата за деня", en: "Card of the Day") — reuse if already added, else add to translations file.
3. The new section is a single component, e.g. `<TarotDailyCardSection />`, that internally handles: checking `drawnToday` state, rendering either the fan+panel OR the drawn `CardFace`, and the flip transition between them. Keep this orchestration logic inside one container component (`Mobile/components/TarotDailyCardSection.tsx`) rather than spreading state across `home/index.tsx` — Home should just render `<TarotDailyCardSection />` and nothing more.

---

## Constraints
- Zero hardcoded colors/sizes outside `Colors.ts`/`Theme.ts` tokens, except the fan's precise `translateX`/`rotate` values from the table in §5 (those are intentionally exact pixel/degree values from the design spec — keep them as named constants in the component file, e.g. `FAN_POSITIONS`, not scattered magic numbers).
- Mock data only — no Supabase queries/tables in this task. `AsyncStorage` for the daily-draw persistence is fine (it's local device state, not backend).
- Test on physical device via Expo Go. Confirm: (a) fan renders correctly with proper overlap/symmetry, (b) center card floats smoothly and is the only tappable one, (c) flip animation is smooth, (d) after drawing, closing and reopening the app same day shows the drawn card directly (no fan), (e) reduced-motion setting disables the float.

## Out of scope (future phases)
- Real `tarot_cards` Supabase table + 56 existing card image imports + remaining 22 Major Arcana illustration generation
- "Виж рецепти" → filtered recipe list by suit/`recipe_role_id`, puzzle entry point, social share, draw streak/history

## Session start
Read `CLAUDE.md` and `CLAUDE_CODE_TASK.md` first. Complete Phase 0 investigation, report findings (especially: does `Кето Таро Карта.dc.html` exist ported or not, and reanimated availability), wait for go-ahead before writing Phase 1 code.