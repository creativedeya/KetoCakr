# KetoCakR Mobile — Deep Link Configuration Task Spec

> Executor: Claude Code at local project path (Mobile/).
> Read CLAUDE.md first for stack, hard rules.
> Stack: React Native / Expo SDK 54, Expo Router.
> HARD RULE: Never remove existing functionality. This is ADD-ONLY config.
> PURPOSE: Make the website CTA "Open in the KetoCakR app" work. The site links
> to https://ketocakelab.com/recipe/{slug}; the app must open that recipe.

---

## Goal
Two link types resolve to the in-app recipe detail screen:
1. **Custom scheme** `blagocake://recipe/{slug}` — always works if app installed.
2. **Universal / App Links** `https://ketocakelab.com/recipe/{slug}` — opens the
   app if installed, falls back to the website (the showcase page) if not.

The target screen is the existing recipe detail route. Note: the route today is
`recipe-detail/[id].tsx` keyed by **id**, but website links use **slug**. This
task bridges slug → recipe.

---

## PHASE 1: Scheme + linking config

**1.1 `app.json` / `app.config.*`**
- Set `"scheme": "blagocake"` (single scheme; confirm not already set to
  something the app relies on — if a scheme exists, do NOT rename it without
  checking; report and ask).
- iOS `associatedDomains`: `["applinks:ketocakelab.com"]`.
- Android `intentFilters` for `https` + host `ketocakelab.com`, path prefix
  `/recipe`, `autoVerify: true`.

**1.2 Expo Router linking**
- Expo Router auto-derives linking from the file routes, but add an explicit
  `linking` mapping so `recipe/:slug` resolves regardless of the internal
  `[id]` param naming. Map incoming path `recipe/:slug` to a handler route.

---

## PHASE 2: Slug → recipe resolution

The detail screen is keyed by `id`; links carry `slug`. Two clean options —
implement **Option A** (preferred, least churn):

**Option A — resolver route**
- Create `app/recipe/[slug].tsx` (new, additive). On mount:
  - Query Supabase (anon, existing client): `ready_recipes` (or the published
    view) `.eq('slug', slug).select('id').single()`.
  - On success → `router.replace('/recipe-detail/' + id)` (reuse existing
    detail screen untouched).
  - On not-found / unpublished → friendly empty state + button to open the
    catalog or website.
- This keeps `recipe-detail/[id].tsx` exactly as-is (hard rule respected).

**Option B (only if slug already available on detail screen)** — accept slug
directly in the existing screen. Skip unless trivial.

Verify `ready_recipes.slug` is populated and unique for published rows before
relying on it.

---

## PHASE 3: Universal Links domain files (coordinate with website task)

These must be hosted on ketocakelab.com (the Next.js site from
TASK_MARKETING_SITE.md). Provide the file contents here; the website task / you
must serve them at the exact paths:

**3.1 iOS — `https://ketocakelab.com/.well-known/apple-app-site-association`**
(served as `application/json`, NO file extension):
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.com.magisoft.ketocakr",
        "paths": ["/recipe/*"]
      }
    ]
  }
}
```
- Replace `TEAMID` with the Apple Developer Team ID and confirm the real bundle
  identifier from `app.json` (`ios.bundleIdentifier`). Do NOT guess the bundle
  id — read it from config.

**3.2 Android — `https://ketocakelab.com/.well-known/assetlinks.json`**:
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.magisoft.ketocakr",
      "sha256_cert_fingerprints": ["<SHA256_FROM_SIGNING_KEY>"]
    }
  }
]
```
- `package_name` from `android.package` in config (confirm, don't guess).
- `sha256_cert_fingerprints`: get from the EAS / Play signing key. If using EAS
  Build managed credentials, retrieve via `eas credentials`. Report the value;
  do not fabricate.

For Next.js, these are served by placing them in `public/.well-known/` (Next
serves `public/` at root). Note the iOS file must have NO extension — add a
header rule / route so it's served as `application/json`.

---

## PHASE 4: Fallback behavior
- If the app is NOT installed, the OS falls back to the URL → the website's
  `/recipe/[slug]` showcase page (already built). No extra work, but verify the
  website route exists and matches.
- Add an in-app handler for cold start vs warm start (Expo Router handles both,
  but test a killed-app launch from a link).

---

## PHASE 5: Test matrix
- [ ] `blagocake://recipe/<valid-slug>` opens correct recipe (app foreground).
- [ ] Same from killed state (cold start).
- [ ] `https://ketocakelab.com/recipe/<valid-slug>` opens app when installed
      (after domain files deployed + app rebuilt — universal links need a
      native build, not Expo Go).
- [ ] Same URL opens website when app NOT installed.
- [ ] Invalid / unpublished slug → graceful empty state, no crash.
- [ ] Existing `recipe-detail/[id]` navigation still works unchanged.

---

## Notes / sequencing
- Universal links require a **development/production native build** (EAS), NOT
  Expo Go. The custom scheme can be tested in a dev build sooner.
- The `.well-known` files depend on the website being live on ketocakelab.com →
  do this AFTER (or alongside) TASK_MARKETING_SITE.md.
- Session report saved to `Admin/logs/`.
