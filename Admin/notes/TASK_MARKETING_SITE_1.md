# TASK D — Marketing Site (ketocakelab.com → Next.js 14)

> Executor: Claude Code at `C:\Dev\KetoCakR\`.
> Read CLAUDE.md first (stack, hard rules, DB schema, brand).
> This is STAGE D from ROADMAP.md — runs after Stage B (public API live) + Stage C (≥15 published recipes).
> Prerequisite: `/api/public/recipes` is live and returns results.

---

## Цел

Пренос на съществуващата `ketocakelab.com` landing страница в Next.js 14 home route,
**без загуба на нито една секция**, + добавяне на **Recipe Gallery** (витрина от публикувани рецепти).
Всичко останало е ADD-ONLY — не пипай мобилното приложение или admin panel.

---

## HARD RULES (не се нарушават)

1. Сайтът чете **само** `/api/public/recipes` (или `public_ready_recipes` view директно с anon key).
   **Никога** `ready_recipes` директно, **никога** steps/ingredients/quantities/cost на публична страница.
2. Едни и същи whitelist полета за сайта и MCP: `id, slug, name_en, name_bg, description_en, description_bg,
   hero_image_url, dessert_type_name, difficulty_level, is_free, total_servings, total_calories,
   total_net_carbs, published_at, app_url`.
3. Съществуващото съдържание на landing страницата се пренася **непокътнато**:
   Hero + waitlist форма, 4 модула, Ingredient deep-dive, Quote, Handbook, FAQ, Footer.
   Никоя секция не изчезва.
4. MailerLite API ключ и Group ID се взимат от env variables, не се хардкодват.
5. `export const dynamic = 'force-dynamic'` на всеки route, който прави fetch.
6. `export const revalidate = 300` на gallery компонента (ISR, 5 мин кеш) — галерията
   не трябва да блокира SSR при бавен API.

---

## PHASE 0 — Investigation (НЕ пиши код)

**0.1 — Провери дали public API работи:**
```
curl https://admin.ketocakelab.com/api/public/recipes?limit=3
```
Ако върне `{ results: [...], count: N }` с ≥1 рецепта → продължи.
Ако върне грешка или 0 рецепти → **СПРИ и докладвай**. Stage B трябва да завърши първо.

**0.2 — Провери текущата структура на Next.js сайта:**
```
ls C:\Dev\KetoCakR\Site\
```
(или каквото е пътя за marketing сайта — може да е отделно repo или `ketocakelab.com/` в монорепото)
Докладвай: има ли вече Next.js структура, или е чист HTML файл?

**0.3 — Провери env файловете:**
Трябват тези variables в `.env.local` на сайта:
```
MAILERLITE_API_KEY=...
MAILERLITE_GROUP_ID=182382638258980714
NEXT_PUBLIC_PUBLIC_API_URL=https://admin.ketocakelab.com
```
Докладвай кои липсват.

**Спри тук. Докладвай 0.1–0.3. Чакай потвърждение.**

---

## PHASE 1 — Design System (CSS Variables)

**File:** `Site/app/globals.css` (или `styles/globals.css`)

Пренеси точно CSS variables от landing страницата:
```css
:root {
  --ruby: #A80048;
  --ruby-light: #C4175F;
  --ruby-glow: rgba(168,0,72,.08);
  --cream: #FEF9F0;
  --cream-2: #F2EDE4;
  --cream-3: #E7E2D9;
  --sage: #5B6146;
  --sage-light: #C4CAA9;
  --gold: #B2AC88;
  --text: #1D1C16;
  --text-2: #594045;
  --text-3: #8D7074;
  --surface: #FEF9F0;
  --surface-card: #F8F3EA;
  --surface-dim: #DED9D1;
}
```

Шрифтове (Google Fonts в `layout.tsx`):
- `Cormorant Garamond` — serif, заглавия, italic акценти
- `Manrope` — sans-serif, body, labels, buttons

---

## PHASE 2 — Пренос на Landing секциите

**File:** `Site/app/page.tsx` (или `Site/app/(home)/page.tsx`)

Пренеси всяка секция от `ketocakelab-landing.html` в React компоненти.
**Ред на секциите (не мени):**

### 2.1 Nav
- Logo (SVG/PNG от assets), links (Recipes, About), CTA бутон → `#waitlist`
- Fixed, blur backdrop, `--cream` bg

### 2.2 Hero (секция `#waitlist`)
- H1: *"Build your keto* **masterpiece.**" (italic + ruby акцент)
- Subtitle: "625 sugar-free dessert combinations..."
- Waitlist форма → `/api/waitlist` (виж Phase 3)
- Hero image placeholder (square, `--surface-card` bg) ако няма реална снимка
- Hero card overlay: Recipe name + macro stat (декоративна, статична)

### 2.3 Modules Grid (4 колони)
- Crust | Cream | Filling | Decoration
- Всяка: number, italic name, description, list items, placeholder image

### 2.4 Recipe Gallery ← NEW (виж Phase 4)
Вмъкни тук, между Modules и Ingredient deep-dive.

### 2.5 Ingredient Deep-Dive
- 2-колонна grid: image + stats
- Almond Flour секция (от оригинала)

### 2.6 Quote/Philosophy
- Dark bg (`--ruby` или `#1D1C16`), italic цитат

### 2.7 Handbook Offer
- PDF guide CTA — "The Keto Alchemist's Handbook"
- Линк или секунден waitlist input

### 2.8 FAQ
- Accordion (6 въпроса от оригинала)
- `onclick` → `useState` toggle в React

### 2.9 Footer
- Logo, Instagram/TikTok links, Privacy, copyright

**Placeholder images:** ако оригиналът ползва `<img src="...">` с реални URL-и,
замени с `<div style="background:var(--surface-card);aspect-ratio:1">` докато
нямаш реални Supabase Storage изображения. НЕ блокирай заради снимки.

---

## PHASE 3 — Waitlist API Route

**File:** `Site/app/api/waitlist/route.ts`

```typescript
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const MK = process.env.MAILERLITE_API_KEY!;
  const MG = process.env.MAILERLITE_GROUP_ID!;

  try {
    const r = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MK}`,
      },
      body: JSON.stringify({ email, groups: [MG] }),
    });
    if (!r.ok) throw new Error('MailerLite error');
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
```

Hero формата вика `/api/waitlist` с `fetch` POST от клиента.
При успех: скрий формата, покажи "You're in the Lab. ✓".

---

## PHASE 4 — Recipe Gallery Component

**File:** `Site/components/RecipeGallery.tsx`

Цел: показва публикуваните рецепти от public API. Витрина само, без детайли.

```typescript
// Site/components/RecipeGallery.tsx
// Fetch от public API. Показва: hero_image_url, name_en/name_bg, total_calories,
// total_net_carbs, dessert_type_name, app_url (бъдещ deep link).
// НЕ показва: ingredients, steps, cost, quantities.
```

**Layout:** 3-колонна grid (desktop), 2-col (tablet), 1-col (mobile).

**Card дизайн (всеки `RecipeCard`):**
- `hero_image_url` → `<Image>` с `object-fit: cover`, aspect-ratio 3/4
  Ако `null` → placeholder `--surface-card` bg с лого watermark
- Name: `name_en` (primary) / `name_bg` (sub-label)
- Macro badge: `{total_calories} kcal · {total_net_carbs}g net carbs`
- Dessert type pill: `dessert_type_name` (малък label горе вляво)
- `is_free` badge: "FREE" tag ако true
- CTA: бутон "View Recipe →" → `app_url` (external link, `_blank`)
  Placeholder текст докато deep links не са live: "Coming to the App →"

**Fetch логика:**
```typescript
// В page.tsx (Server Component) — fetch на build time с revalidate
const res = await fetch(`${process.env.NEXT_PUBLIC_PUBLIC_API_URL}/api/public/recipes?limit=12`, {
  next: { revalidate: 300 }
});
const { results } = await res.json();
// Подай results на <RecipeGallery recipes={results} />
```

**Empty state:** ако `results.length === 0` → скрий цялата секция (не показвай empty grid).

**Section header:**
```
LAB LABEL: "From the Lab"
H2: "Ready to Eat. Macro-Perfect."
Sub: "Explore our keto dessert collection — free recipes inside."
```

---

## PHASE 5 — Recipe Detail Page (статична, минимална)

**File:** `Site/app/recipe/[slug]/page.tsx`

Минимална страница за SEO и future deep links.

```typescript
// generateStaticParams → fetch всички slug-ове от public API
// generateMetadata → OG tags от name_en + description_en + hero_image_url
// Page → показва: hero image, name, macros, dessert_type, CTA "Open in App"
// НЕ показва: ingredients, steps, cost
```

CTA: "Open in KetoCake Lab App →" → `blagocake://recipe/{slug}` (deep link scheme).
Ако app не е инсталиран → App Store / Google Play линк (placeholder засега).

**`generateStaticParams`:**
```typescript
export async function generateStaticParams() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_PUBLIC_API_URL}/api/public/recipes?limit=50`);
  const { results } = await res.json();
  return results.map((r: { slug: string }) => ({ slug: r.slug }));
}
```

---

## PHASE 6 — SEO + Meta

**File:** `Site/app/layout.tsx`

```typescript
export const metadata = {
  title: 'KetoCake Lab — The Keto Dessert Constructor',
  description: 'Build custom keto cakes with exact macros. 625+ sugar-free dessert combinations.',
  openGraph: {
    title: 'KetoCake Lab',
    description: '625+ keto dessert combinations. One modular system.',
    url: 'https://ketocakelab.com',
    siteName: 'KetoCake Lab',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};
```

**`robots.txt`:** allow all, sitemap: `https://ketocakelab.com/sitemap.xml`

**`sitemap.ts`:** генерира entries за `/` + всеки `/recipe/[slug]` от public API.

---

## Acceptance Checklist

- [ ] Phase 0 потвърден: public API връща ≥1 рецепта.
- [ ] Всички секции от оригиналната landing страница присъстват непокътнати.
- [ ] Waitlist форма работи (MailerLite signup, success state).
- [ ] Recipe Gallery зарежда рецепти от public API.
- [ ] Нито една скрита колона (ingredients, steps, cost, status) не е видима на никоя страница.
- [ ] `/recipe/[slug]` → корректни OG tags, CTA към app.
- [ ] Сайтът се deploy-ва на Vercel без build errors.
- [ ] Мобилното приложение и admin panel работят непроменени.
- [ ] Session report записан в `Site/logs/` или `Admin/logs/`.

---

## Извън обхвата (НЕ прави в тази задача)

- MCP сървър — отделна задача (TASK_MCP_SERVER Phase 2–3)
- Deep links (TASK_DEEPLINK_EXPO) — нужен е Apple Team ID + Android fingerprint
- MailerLite drip sequence — отделен маркетинг workflow
- Реални recipe снимки — ръчно качване след task-а
- Sweetener calculator, multi-language toggle — deferred

---

## Session Start Template за Claude Code

```
Read CLAUDE.md and TASK_MARKETING_SITE.md.
Today's task: STAGE D — Marketing site migration (Phase 0 first).
Run Phase 0 investigation and report results.
Do NOT write code until I confirm public API is live.
```
