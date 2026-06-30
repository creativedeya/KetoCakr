# TASK: Tarot Feature — Visual & Functional Fixes (Round 1)

> Based on tested screenshots after initial implementation. 5 issues found, listed by priority.
> Read this whole file before making any changes — some fixes affect the same files.

---

## ISSUE 1 — Fan never appears (highest priority, investigate first)

**Symptom:** Home shows the static drawn "Тройка Чаши" card directly. The 5-card fan (per `TASK_TAROT_HOME_FINAL.md` §5) was never seen by the user.

**Investigation steps (do this first, report findings before fixing):**
1. Check `AsyncStorage` — is there a stale `tarot_drawn_${date}` key left over from development/testing that's causing the "already drawn today" branch to render on every load? Add a temporary debug `console.log` at the point where `TarotDailyCardSection` checks `drawnToday` to print the actual stored value and today's computed key.
2. Check the component's render logic — is there a bug where the "drawn" branch is unconditionally rendered regardless of the AsyncStorage check (e.g. a default state of `true` instead of `null`/`false`, or a missing `await` causing a race condition where the check resolves after first paint but the UI doesn't update)?
3. Report what you find before fixing — this could be a simple state bug, not a logic design flaw.

**Fix:** Once root cause is identified, fix it. Confirm the fan renders on a genuinely fresh state (clear AsyncStorage for the relevant key, or test on first install) and confirm tapping the center card transitions correctly into the flip → navigation flow.

---

## ISSUE 2 — Card Face screen: too small / too much empty space

**Symptom:** `Mobile/app/tarot/card-face.tsx` (Image 2 in user's report) shows the card occupying maybe 60% of screen width, with large empty margins left/right and excess whitespace top/bottom. Hard to read comfortably.

**Fix:**
- Increase the card's width to use most of the screen (e.g. `width: '92%'` or `Spacing`-based horizontal margin of just `Spacing.md`/`Spacing.lg` on each side, not a fixed narrow width).
- Increase the internal image/placeholder area height proportionally (currently looks small relative to card — should be the dominant visual element, roughly 45-55% of the card's total height).
- Reduce dead vertical space above/below the card — center it with reasonable padding, not excessive margin. If there's a fixed-height container causing the gap, make it `flex`-based instead so the card naturally sizes to content + reasonable screen padding.
- Re-check `Typography` tokens are used for "Тройка Чаши" (title) and "РАДОСТТА НА ДЕКОРА" (subtitle) — increase if currently using a smaller-than-appropriate token (compare visually against e.g. `recipe-detail` screen's similar title sizing).

---

## ISSUE 3 — Ritual screen: cramped header, no card thumbnail, text too small

**Symptom:** `Mobile/app/tarot/ritual.tsx` (Image 3 in user's report):
- Header row ("← Дневен ритуал ♡ ⬆") feels cramped/squished
- No small visual thumbnail of the card shown on this screen (user wants a small image/copy of the card they drew, for context, near the top)
- All body text (energy word, quote, morning tip, trap, evening question) renders smaller than the rest of the app's standard text sizing — hard to read

**Fixes:**

### 3a — Header spacing
Check the header row's padding/height against other screens with a similar back-button + title + icons header (e.g. `recipe-detail/[id].tsx`'s header, or `RecipeDetailView.tsx`'s `headerBar`/`headerRow` styles). Match the same `paddingTop`, `paddingHorizontal`, `paddingVertical`, and icon sizes — don't invent new spacing values for this screen.

### 3b — Add card thumbnail
Below the header, before the suit chip + card name, add a small horizontal row:
```tsx
<View style={styles.cardThumbnailRow}>
  <Image source={{ uri: card.image || undefined }} style={styles.cardThumbnail} />
  {/* or placeholder matching CardFace's placeholder style if image is null */}
  <View style={styles.cardThumbnailText}>
    <Text style={styles.cardThumbnailName}>{card.title}</Text>
    <Text style={styles.cardThumbnailMeta}>Кето магия · {card.theme}</Text>
  </View>
</View>
```
Thumbnail size: roughly 48-56px square or small-rect, rounded corners, matching the suit color background tint if no image present (use the suit's color from `TAROT_SUIT_COLORS` at low opacity as background for the placeholder sparkle icon, scaled down from the full CardFace placeholder).

### 3c — Text sizing — use app-standard typography
This is the most important fix. Go through every text element on this screen and replace with the correct `Typography` token from `Mobile/constants/Theme.ts` (check that file's exact token names first, e.g. `Typography.h3`, `Typography.body1`, `Typography.body2`, `Typography.caption` — match what's actually defined):

- "ЕНЕРГИЯ НА ДЕНЯ" label → `Typography.caption` (small caps label style), NOT smaller than what's used for similar labels elsewhere (e.g. compare to `RecipeDetailView.tsx`'s `nutritionSectionTitle` or `introInfoLabel` styles for the right caption size)
- Energy word itself (e.g. "Споделена радост") → should be prominent — `Typography.h3` or similar, bold, colored with the suit color
- Quote/phrase (italic blockquote) → `Typography.body1` at minimum, NOT `caption` or `body2` — this is a key readable line, give it generous `lineHeight`
- "✦ СУТРЕШНА ПОДСКАЗКА" / "⚠ КАПАН НА ДЕНЯ" / "↻ ВЕЧЕРЕН ВЪПРОС" labels → same caption-label treatment as the energy label, consistent sizing across all three
- Body paragraphs under each of those labels → `Typography.body2` or `Typography.body1` (check what `RecipeDetailView.tsx` uses for its similar descriptive paragraphs, e.g. `introBody` style, and match that)
- Final CTA button text → `Typography.button` (check existing button text styles elsewhere for consistency)

After this fix, the screen's text should look visually consistent in scale with `RecipeDetailView.tsx`'s Intro tab — not smaller/cramped in comparison.

---

## ISSUE 4 — Share button (heart + share icons in ritual header) — not functional

**Symptom:** The ♡ and ⬆ icons in the ritual screen header are decorative/non-functional.

**Fix — implement the share icon only (skip heart/favorite for now, that's unrelated to tarot):**

1. Check if `expo-sharing` or React Native's built-in `Share` API is already used elsewhere in the project (search for `from 'react-native'` imports of `Share`, or `expo-sharing` in `package.json`). Use whichever is already a pattern in the codebase; if neither exists, use React Native's built-in `Share.share()` API (zero new dependency) as the default choice.

2. Wire the share icon's `onPress`:
```tsx
import { Share } from 'react-native';

async function handleShareCard() {
  try {
    await Share.share({
      message: `${card.title} — ${card.theme}\n"${card.phrase}"\n\nИзтегли своята карта на деня в KetoCakR! 🔮🍰`,
      // url: card.image || undefined, // only if Share.share supports url on iOS meaningfully — test, iOS Share sheet can take both message+url
    });
  } catch (error) {
    console.error('[Tarot] Share error:', error);
  }
}
```

3. **On Instagram Stories specifically:** Note for the user (report this back, don't try to build a custom Instagram Stories API integration in this task — that requires `react-native-share` with Instagram-specific intent extras, or a static image export + the `instagram-stories://` URL scheme, which is a more involved feature). For THIS task, implement the **generic native share sheet** (`Share.share()`), which already includes "Instagram" as one of the share targets the OS offers — covers the user's actual need ("сподели... в Инстаграм. Или където иска") without the complexity of a dedicated Stories-only deep integration. If the user wants the fancier dedicated-Stories-image-export flow later, that's a separate, larger future task — say so in your report.

---

## ISSUE 5 — Card-back logo missing (confirm fix from prior task landed correctly)

**Symptom:** Per user's report, the card backs in the (currently-not-appearing, per Issue 1) fan don't show the project logo.

**Fix:** Once Issue 1 is resolved and the fan is actually visible for testing, confirm `Mobile/components/TarotCardBack.tsx` correctly renders the logo image (per `TASK_TAROT_NAVIGATION_REVISION.md` §A) and isn't falling back to a missing-asset blank state. If the logo asset path was wrong or the `require()` failed silently, fix the path. Test visually once the fan is confirmed visible.

---

## Testing checklist before reporting done
- [ ] Clear `tarot_drawn_${today}` AsyncStorage key (or use a fresh simulator/device state) and confirm the 5-card fan renders correctly on Home, with the project logo visible on all 5 backs
- [ ] Tap the center card, confirm float stops, flip plays, navigation to card-face happens
- [ ] Card Face screen now fills most of the screen width comfortably, no excessive whitespace
- [ ] Tap "Разкрий посланието" → Ritual screen shows: proper header spacing, small card thumbnail near top, all text matching app-standard sizing (visually compare side-by-side with `RecipeDetailView.tsx`'s Intro tab)
- [ ] Tap the share icon → native share sheet opens with card title/phrase text
- [ ] Force-quit and reopen the app same day → Home shows the compact drawn-card preview (not the fan) — confirms persistence still works correctly after the Issue 1 fix

## Session start
Read `CLAUDE.md`, `CLAUDE_CODE_TASK.md`, and the two prior tarot task files (`TASK_TAROT_HOME_FINAL.md`, `TASK_TAROT_NAVIGATION_REVISION.md`) for context on what was originally specified. Start with Issue 1's investigation and report back before proceeding to fixes.