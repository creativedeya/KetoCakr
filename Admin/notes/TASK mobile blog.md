# TASK — Mobile App: Blog Access (Tab 1 Preview + Tab 4 Entry + WebView Screen)

> Executor: Claude Code at `C:\Dev\KetoCakR\Mobile\`.
> Goal: let users read blog articles without leaving the app. Reuses the existing
> Notion-backed blog already live on the marketing site (ketocakelab.com/blog) via WebView
> — no content duplication, no new CMS work, no new native blog UI to build/maintain twice.

---

## Why WebView (not native screens)

The blog already exists, fully built, on the Site (search, category filters, SEO,
Notion sync). Re-building it natively in RN would mean duplicating that logic and
keeping two implementations in sync forever. WebView reuses the live site as the
single source of truth — only the entry points and navigation behavior are native.

---

## PHASE 1 — Blog WebView Screen

**File:** `Mobile/app/blog/index.tsx` (new route, or `Mobile/app/(modals)/blog.tsx` if
it should present as a modal — pick whichever matches how `recipe-generator.tsx` /
`visual-recipe-builder.tsx` currently present, for consistency).

**1.1 — Base WebView setup**

Use `react-native-webview` (add as a dependency if not already present — check
`package.json` first).

```tsx
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { BackHandler } from 'react-native';

export default function BlogScreen() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: 'https://ketocakelab.com/blog' }}
      onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
      startInLoadingState
      // renderLoading -> use a simple branded spinner matching Colors.primary.main
    />
  );
}
```

**1.2 — Critical: in-app back navigation (this is the main point of this task)**

The back behavior must be: **navigate back within the WebView's own history first; only
exit to the native app once there's nowhere left to go back to inside the WebView.**
The user should never be bounced out to an external browser, and should never get stuck.

```tsx
useEffect(() => {
  const onBackPress = () => {
    if (canGoBack) {
      webViewRef.current?.goBack();
      return true; // handled, don't let the OS handle it (Android hardware back)
    }
    return false; // let default behavior happen (closes screen / goes to previous app screen)
  };

  const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
  return () => subscription.remove();
}, [canGoBack]);
```

For the in-app header back button (iOS/Android both), wire the same logic instead of
the default `router.back()`:
```tsx
// Header left button onPress:
() => {
  if (canGoBack) {
    webViewRef.current?.goBack();
  } else {
    router.back(); // exits the WebView screen, returns to wherever it was opened from
  }
}
```

**1.3 — Stay inside the app, no external browser escape**

Any link the user taps inside the blog (including links to other posts, the home page,
or anything under `ketocakelab.com`) should open inside this same WebView, not in an
external browser or a new WebView stack. Only genuinely external links (if any ever
appear in blog content — unlikely, but possible if a post links elsewhere) should open
externally; everything on `ketocakelab.com` stays inside.

```tsx
<WebView
  ref={webViewRef}
  source={{ uri: 'https://ketocakelab.com/blog' }}
  onShouldStartLoadWithRequest={(request) => {
    const isInternal = request.url.includes('ketocakelab.com');
    if (!isInternal) {
      Linking.openURL(request.url); // external links open in system browser, not WebView
      return false;
    }
    return true; // internal navigation stays in WebView
  }}
  onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
  startInLoadingState
/>
```

**1.4 — Header**

Simple header with: back button (per 1.2), title "Blog" / "Статии" (localized via
existing `useTranslation`), no other actions needed for v1.

---

## PHASE 2 — Tab 4 (Tools) Entry Card

**File:** `Mobile/app/(tabs)/tools/index.tsx`

Add a 5th card to the existing tools grid (alongside Keto Calculator, Unit Converter,
AI Keto Assistant, Baking Timer — per `CLAUDE_CODE_TASK.md` Phase 5), styled identically
(`Colors.background.primary`, `Shadows.md`, `BorderRadius.xl`, icon in circle with
`Colors.primary.opacity[10]`).

- Icon: `Ionicons` `book-outline` or `newspaper-outline` (pick whichever renders better
  alongside the existing icon set — `book-outline` likely fits the "Lab/Journal" framing
  used on the site).
- Label: "Blog" / "Статии" (localized).
- Unlike the other 4 placeholder cards (which show an "Coming soon!" alert), this one is
  **fully functional** — `onPress` navigates to the blog screen from Phase 1.

```tsx
{
  icon: 'book-outline',
  label: t('tools.blog'), // add translation key
  onPress: () => router.push('/blog'),
}
```

---

## PHASE 3 — Tab 1 (Home) Blog Preview Section

**File:** `Mobile/app/(tabs)/home/index.tsx`

New section, placed **below the existing Filter Pills + Recipe Grid section** (per
`CLAUDE_CODE_TASK.md` Phase 2.5 — this is the last section currently on Home, so the
blog preview becomes the new final section).

### 3.1 — Data source

The mobile app has no direct Notion access today (that logic lives in `Site/lib/notion.ts`
only). Two options:

**Option A (recommended, no new backend work):** Mobile fetches blog post previews from
the **Site's own pages** isn't feasible for structured data (HTML, not JSON) — so instead,
add a small public API route on the **Admin** project (same place `/api/public/recipes`
already lives) that proxies Notion: `Admin/app/api/public/blog-posts/route.ts`, calling
the same `getBlogPosts()` logic Site already has (or a copied/shared minimal version —
title, slug, summary, cover, category, date). Returns JSON. Mobile fetches this like any
other public API call.

**Option B:** Duplicate Notion client logic directly into the Mobile app (own `notion.ts`,
own API key handling). Not recommended — splits the Notion integration into two codebases
that can drift, and exposes a Notion API key in Mobile (Mobile is a client-distributed bundle, unlike a server-rendered Next.js app, so server-side secrets like Notion keys must NOT ship inside the app — go with Option A for ).

**Go with Option A.** This is a small additive API route, same shape/auth pattern as
existing public routes (read-only, no service-role writes needed, CORS open like the
recipes endpoint).

```typescript
// Admin/app/api/public/blog-posts/route.ts
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const posts = await getBlogPosts(); // reuse/import existing Notion fetch logic
  const preview = posts
    .slice(0, 5) // most recent 5, already sorted by Date in existing logic
    .map(p => ({ title: p.title, slug: p.slug, summary: p.summary, cover: p.cover, category: p.category, date: p.date }));
  return NextResponse.json({ results: preview }, { headers: corsHeaders });
}
```

(If `getBlogPosts()` lives in Site's `lib/notion.ts` and isn't easily importable into
Admin, copy the minimal fetch logic into a new `Admin/lib/notion.ts` — small, read-only,
same Notion integration token, separate env var entry if needed.)

### 3.2 — Section UI

```
SectionHeader: title="From the Blog" / "От Блога", actionText="See all →", onAction=() => router.push('/blog')
[Vertical list, max 3-5 items]:
  - Cover image (small, left or top depending on card layout)
  - Title
  - Category badge (reuse the same visual treatment as the Site's blog category badge — small ruby/beige tag)
  - Short summary (1-2 lines, truncated)
[Empty state]: if 0 posts returned, hide the entire section (same pattern as Site's home page blog preview, which hides if 0 posts)
```

Tapping any item in the list opens the WebView screen (Phase 1) directly at that post's
URL: `https://ketocakelab.com/blog/${slug}` instead of the generic `/blog` index, so the
user lands straight on the article.

```tsx
onPress={() => router.push({ pathname: '/blog', params: { initialUrl: `https://ketocakelab.com/blog/${post.slug}` } })}
```

Update the WebView screen (Phase 1) to accept an optional `initialUrl` param, defaulting
to `https://ketocakelab.com/blog` when not provided (so both the Tab 4 entry — generic
index — and Tab 1 previews — specific article — reuse the same screen).

### 3.3 — "See all" → search

"See all →" navigates to the **same WebView screen**, pointed at the blog index
(`https://ketocakelab.com/blog`), where the search bar and category chips built in
`TASK_BLOG_CATEGORIES.md` / `TASK_SITE_BROWSE_ALL.md` are already live on the site —
no native search needed, it's already there inside the WebView.

---

## Acceptance Checklist

- [ ] New WebView blog screen exists, loads `ketocakelab.com/blog` (or a specific post URL when passed `initialUrl`).
- [ ] Back navigation (hardware back + header back button) goes back through WebView history first, only exits the screen when there's no more WebView history.
- [ ] Internal links (ketocakelab.com/*) stay inside the WebView; genuinely external links open in system browser.
- [ ] Tab 4 (Tools) has a 5th card, "Blog", fully functional (not a placeholder alert), navigates to the WebView screen.
- [ ] Tab 1 (Home) has a new "From the Blog" section below the recipe grid, showing latest posts (title, category badge, summary, cover).
- [ ] Tapping a Tab 1 blog preview item opens that specific article directly in the WebView.
- [ ] "See all" in the Tab 1 section opens the blog index (with site's existing search + category filters available inside the WebView).
- [ ] Section hides entirely if the blog-posts API returns 0 posts.
- [ ] New `Admin/app/api/public/blog-posts` route added, read-only, reuses existing Notion fetch logic, same CORS/public pattern as `/api/public/recipes`.
- [ ] No changes to existing Site blog code — Site continues to own the actual blog UI; Mobile only links into it.
- [ ] Localized strings added for new labels (`Blog`/`Статии`, `From the Blog`/`От Блога`, `See all`/`Виж всички`) via existing `useTranslation` system.

---

## Deferred (not in this task)

- Native blog reading experience (no WebView) — explicitly rejected in favor of reusing the live site.
- Push notifications for new blog posts.
- Offline caching of blog content inside the app.