# TASK: Tarot "Card of the Day" — Home Section + Daily Ritual Modal

> Phase 1 of 3 for the "Кето Магия Таро" feature.
> This phase uses MOCK data only (no DB table yet — that's Phase 2).
> Goal: validate the UI/UX with hardcoded sample cards before building the real data layer.

---

## PHASE 0 — Investigation (do this first, no code yet)

1. Read `Mobile/app/(tabs)/home/index.tsx` fully — understand section structure/spacing patterns (`SectionHeader`, `Colors`, `Theme` usage).
2. Read `Mobile/constants/Colors.ts` and `Mobile/constants/Theme.ts` — confirm available tokens (don't introduce new hardcoded values).
3. Read `Mobile/constants/i18n.ts` (or wherever translations live) — confirm how `t()` and `useTranslation` work, and where translation keys are defined (e.g. `Mobile/constants/translations/bg.json` or similar).
4. Report back: file structure findings, confirm where new components should live (suggest `Mobile/components/TarotCardOfDay.tsx` + `Mobile/components/TarotRitualModal.tsx`), and propose translation key names before writing any code.

**Do NOT write code in this phase. Wait for confirmation.**

---

## Background — Design Spec (from project's design doc)

### Visual identity (already finalized in design)
- Light, clean, modern style — matches the app (NOT dark/mystical)
- Brand primary: `#A80048` (raspberry) — Major Arcana frame + gold accents
- Suit colors (for Minor Arcana, used later in Phase 2/3 — not needed yet for the deck-back tease):
  - Pentacles (Base/Земя): `#1AA88B` green
  - Cups (Decoration/Вода): `#4F9DC4` blue
  - Swords (Cream/Въздух): `#7C8090` slate
  - Wands (Filling/Огън): `#E2553B` coral
- Gold accent: `#C9A24B` (fine lines only)
- Card back: cream `#FBF7F0` background, thin gold border, heart logo, text "КЕТО МАГИЯ ТАРО"

### Card structure (2 screens per card, per CLAUDE.md)
1. **Card face** — frame + cake illustration + numeral + title
2. **Daily ritual screen** (cream background):
   - Энергия на деня (Energy word)
   - Daily phrase (italic quote)
   - Morning tip
   - Daily trap
   - Evening question
   - CTA toward recipes

---

## PHASE 1 — Build with mock data

### 1.1 Mock data file

Create `Mobile/constants/mockTarotCards.ts` with 3 sample cards (1 Major + 2 Minor, different suits) matching this shape:

```ts
export interface TarotCardMock {
  id: string;
  arcanaType: 'major' | 'minor';
  suit: 'pentacles' | 'cups' | 'swords' | 'wands' | null; // null for major
  cardNumber: number; // 0-21 major, 1-14 minor
  cardName: string; // bg
  cardNameEn: string;
  subtitle: string; // bg, e.g. "Майсторството на блата"
  subtitleEn: string;
  energyWord: string;
  energyWordEn: string;
  dailyPhrase: string;
  dailyPhraseEn: string;
  morningTip: string;
  morningTipEn: string;
  dailyTrap: string;
  dailyTrapEn: string;
  eveningQuestion: string;
  eveningQuestionEn: string;
  cardImageUrl: string | null; // placeholder ok for now
  recipeRoleId?: number | null; // for minor — null is fine in mock
  linkedRecipeId?: string | null; // for major — null is fine in mock
}

export const MOCK_TAROT_CARDS: TarotCardMock[] = [
  // Major Arcana example — Дявол / "Devil"
  {
    id: 'mock-major-15',
    arcanaType: 'major',
    suit: null,
    cardNumber: 15,
    cardName: 'Дяволът',
    cardNameEn: 'The Devil',
    subtitle: 'Емоционалният глад',
    subtitleEn: 'The Emotional Hunger',
    energyWord: 'Осъзнаване на импулса',
    energyWordEn: 'Awareness of Impulse',
    dailyPhrase: 'Аз контролирам десерта, а не той мен. Сладкото е за радост, а не за утеха.',
    dailyPhraseEn: 'I control the dessert, not the other way around. Sweetness is for joy, not for comfort.',
    morningTip: 'Днес улови момента, в който ти се доядва сладко. Попитай се: "Гладен ли съм, тъжен ли съм, или просто ми е скучно?"',
    morningTipEn: 'Today, catch the moment you crave something sweet. Ask yourself: "Am I hungry, sad, or just bored?"',
    dailyTrap: 'Да хапваш импулсивно вместо да избереш съзнателно.',
    dailyTrapEn: 'Snacking impulsively instead of choosing consciously.',
    eveningQuestion: 'Какво наистина търсех днес, когато посегнах към сладко?',
    eveningQuestionEn: 'What was I really looking for today when I reached for something sweet?',
    cardImageUrl: null,
    linkedRecipeId: null,
  },
  // Minor Arcana example — Pentacles (Base)
  {
    id: 'mock-minor-pentacles-8',
    arcanaType: 'minor',
    suit: 'pentacles',
    cardNumber: 8,
    cardName: 'Осмица Пентакли',
    cardNameEn: 'Eight of Pentacles',
    subtitle: 'Майсторството на блата',
    subtitleEn: 'Mastery of the Base',
    energyWord: 'Търпеливо майсторство',
    energyWordEn: 'Patient Mastery',
    dailyPhrase: 'Перфектният блат не се ражда от раз. Всяко изпичане ме прави по-добър майстор.',
    dailyPhraseEn: 'The perfect base isn\\'t born on the first try. Every bake makes me a better baker.',
    morningTip: 'Днес се съсредоточи върху един-единствен детайл от блата — температурата на маслото, времето на разбиване или дебелината на сместа.',
    morningTipEn: 'Today, focus on a single detail of the base — butter temperature, mixing time, or batter thickness.',
    dailyTrap: 'Да прескачаш стъпки, защото "вече знаеш как се прави".',
    dailyTrapEn: 'Skipping steps because you "already know how".',
    eveningQuestion: 'Кой малък детайл подобрих днес в техниката си?',
    eveningQuestionEn: 'What small detail did I improve in my technique today?',
    cardImageUrl: null,
    recipeRoleId: 1,
  },
  // Minor Arcana example — Cups (Decoration)
  {
    id: 'mock-minor-cups-3',
    arcanaType: 'minor',
    suit: 'cups',
    cardNumber: 3,
    cardName: 'Тройка Чаши',
    cardNameEn: 'Three of Cups',
    subtitle: 'Радостта на декора',
    subtitleEn: 'The Joy of Decoration',
    energyWord: 'Споделена радост',
    energyWordEn: 'Shared Joy',
    dailyPhrase: 'Десертът става истински подарък, когато е направен за споделяне.',
    dailyPhraseEn: 'A dessert becomes a true gift when made to be shared.',
    morningTip: 'Помисли за кого би изпекъл нещо днес — дори ако е само за себе си, украси го като за празник.',
    morningTipEn: 'Think about who you\\'d bake for today — even if just for yourself, decorate it like a celebration.',
    dailyTrap: 'Да подценяваш декора като "просто финален щрих".',
    dailyTrapEn: 'Underestimating decoration as "just a final touch".',
    eveningQuestion: 'С кого споделих радостта от десерта днес — пряко или чрез снимка?',
    eveningQuestionEn: 'With whom did I share dessert joy today — directly or through a photo?',
    cardImageUrl: null,
    recipeRoleId: 4,
  },
];

export function getCardOfTheDay(): TarotCardMock {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const idx = seed % MOCK_TAROT_CARDS.length;
  return MOCK_TAROT_CARDS[idx];
}
```

### 1.2 Card-of-the-day teaser component

Create `Mobile/components/TarotCardOfDay.tsx`:

- Props: `onPress: () => void`
- Renders the card BACK (tease state) — NOT the card face:
  - Cream background `#FBF7F0`
  - Thin gold border (`#C9A24B`, 1-1.5px)
  - Rounded corners (use `BorderRadius.xl` or similar from Theme)
  - Centered heart logo placeholder (use an Ionicons heart icon in raspberry `#A80048` for now — real logo PNG comes later)
  - Text below logo: "КЕТО МАГИЯ ТАРО" (bg) / "KETO MAGIC TAROT" (en) — small caps, gold or muted text color
  - Below that: subtle CTA text — bg: "Изтегли картата на деня" / en: "Draw your card of the day"
  - Card should have a fixed aspect ratio resembling a tarot card (roughly 2:3, e.g. width 140, height 210) — but responsive to container width is fine too; use your judgment matching the screenshot reference (cream card with gold frame, centered logo)
  - On press: trigger a subtle scale/rotate animation (use `Animated` API — simple scale 1 → 1.05 → 1 spring, ~200ms) then call `onPress`

### 1.3 Daily ritual modal/bottom sheet

Create `Mobile/components/TarotRitualModal.tsx`:

- Props: `visible: boolean`, `card: TarotCardMock`, `onClose: () => void`, `onSeeRecipes?: () => void` (only relevant for minor arcana — wire it as a no-op for now, log to console)
- Use React Native's built-in `Modal` component (`animationType="slide"`, `transparent`) OR `@gorhom/bottom-sheet` if it's already a dependency in the project (check `package.json` first — report which one you used and why)
- Layout (cream background `#FBF7F0` or `Colors.background.primary` if that's already cream-toned — check Colors.ts first):
  1. Close button (X) top-right
  2. Small card thumbnail + title + subtitle at top (title = `cardName`/`cardNameEn` per language, subtitle below in muted color)
  3. "ЕНЕРГИЯ НА ДЕНЯ" label (small caps, muted) + energy word (bold, larger)
  4. Daily phrase as an italic blockquote with a left accent bar (raspberry `#A80048` for major, suit color for minor — but since suit colors aren't needed in mock yet, default to raspberry for all in this phase)
  5. "✦ СУТРЕШНА ПОДСКАЗКА" label + morning tip text
  6. "⚠ КАПАН НА ДЕНЯ" label + daily trap text
  7. Evening question section (can be simpler styling — label + text)
  8. CTA button at bottom:
     - If `arcanaType === 'major'`: button text bg "Виж рецептата" / en "View recipe" — onPress: console.log('[Tarot] would navigate to linked recipe', card.linkedRecipeId)
     - If `arcanaType === 'minor'`: button text bg "Избери рецепта" / en "Choose a recipe" — onPress: call `onSeeRecipes?.()`
- Use `useTranslation()` hook for language switching (bg/en fields already in mock data — pick based on `language` from the hook)
- All spacing/colors must come from `Theme.ts`/`Colors.ts` — no new hardcoded magic numbers beyond what's needed for the card aspect ratio

### 1.4 Wire into Home screen

In `Mobile/app/(tabs)/home/index.tsx`:

1. Import `TarotCardOfDay`, `TarotRitualModal`, `getCardOfTheDay` from mock data
2. Add local state: `const [tarotModalVisible, setTarotModalVisible] = useState(false);`
3. Add `const cardOfDay = useMemo(() => getCardOfTheDay(), []);`
4. Insert a new section **immediately after** the "Твоите рецепти" (`userRecipes`) section and **before** the "Готови рецепти по тип" section — find this comment marker:
   ```
   {/* ─── СЕКЦИЯ 5: ГОТОВИ РЕЦЕПТИ ПО ТИП ─── */}
   ```
   Insert the new section BEFORE it, structured like the other sections (use `SectionHeader` with a title like bg: "Карта на деня" / en: "Card of the Day" — add translation key, don't hardcode):
   ```tsx
   {/* ─── СЕКЦИЯ 4.5: ТАРО КАРТА НА ДЕНЯ ─── */}
   <View style={styles.section}>
     <SectionHeader title={t('home.tarot.title')} />
     <TarotCardOfDay onPress={() => setTarotModalVisible(true)} />
   </View>
   ```
5. Render the modal near the end of the component's JSX return (sibling to the ScrollView, not inside it):
   ```tsx
   <TarotRitualModal
     visible={tarotModalVisible}
     card={cardOfDay}
     onClose={() => setTarotModalVisible(false)}
   />
   ```
6. Add translation keys for `home.tarot.title` (bg: "Карта на деня", en: "Card of the Day") to the translations file you found in Phase 0.

---

## Constraints (apply throughout)
- Zero hardcoded colors outside the documented brand palette above — use `Colors.ts` tokens wherever an equivalent exists; only introduce new color constants for the tarot-specific palette (raspberry/gold/cream) if they don't already exist, and put them in `Colors.ts` under a clearly named `tarot` key, not inline in components.
- Zero hardcoded sizes — use `Theme.ts` `Spacing`/`BorderRadius`/`Typography` tokens.
- This is mock-data only. Do NOT create any Supabase queries, tables, or API routes in this phase.
- Test on physical device via Expo Go before reporting done.

## Out of scope (future phases — do not build now)
- Phase 2: `tarot_cards` DB table + real 78-card data import + Supabase queries replacing mock data
- Phase 3: "Избери рецепта" → filtered recipe list by `recipe_role_id`, "Сглоби пълна торта" puzzle entry point, card image generation/upload, social share, draw history/streak tracking

## Session start reminder
Read `CLAUDE.md` and `CLAUDE_CODE_TASK.md` first as usual. Make a plan after Phase 0 investigation and confirm before writing Phase 1 code.