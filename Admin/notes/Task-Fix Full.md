# TASK — Fix Full Regression: All Blog Entry Points Now 404

> Executor: Claude Code at `C:\Dev\KetoCakR\Mobile\`.
> Critical regression. Previously working: Tab 4 Blog card, individual article taps
> from Tab 1. Now ALL THREE entry points 404 (Tab 4 card, Tab 1 article taps, Tab 1
> "See All"). Since all three converge on the same `/blog` route, this points to one
> shared root cause, not three separate breaks — investigate the shared point first.

---

## PHASE 1 — Investigation (find the ONE shared cause)

**1.1 — Confirm the blog screen file still exists and is unchanged in location:**
```bash
find Mobile/app -iname "*blog*"
```
Compare against the path confirmed working in the previous fix session
(`Mobile/app/blog/index.tsx`). If a recent edit moved, renamed, or deleted this file,
that alone would 404 every navigation call that targets `/blog`.

**1.2 — Confirm the route registration in root `_layout.tsx` is still intact:**
```bash
grep -n "blog" Mobile/app/_layout.tsx
```
The earlier fix added `<Stack.Screen name="blog/index" />`. Confirm this line is still
present and wasn't accidentally removed/reverted by a subsequent edit (e.g. if the
"See All" fix task touched `_layout.tsx` for any reason, or if a merge/save conflict
overwrote it).

**1.3 — Check for a syntax error or crash in the blog screen file itself:**
```bash
cat Mobile/app/blog/index.tsx
```
A 404 on every navigation attempt (rather than a crash screen) usually means the route
genuinely isn't registered/resolvable — but also check there isn't a build-time error
being silently swallowed. Run:
```bash
cd Mobile
npx tsc --noEmit
```
to catch any TypeScript error in this file or its imports that might prevent the route
from registering correctly at runtime.

**1.4 — Check Metro bundler cache:**
After the previous "See All" fix, was `npx expo start --clear` run again? If not, it's
possible the previous fix's changes to `_layout.tsx` or the blog screen haven't actually
been picked up yet, and what's being tested is stale. Confirm with Deyana whether a
fresh `--clear` restart happened after the most recent code change, before assuming the
code itself is broken.

**Report which of 1.1–1.4 explains the regression before applying a fix.**

---

## PHASE 2 — Fix

Based on findings:
- If the file was moved/deleted — restore it at `Mobile/app/blog/index.tsx`.
- If the `_layout.tsx` registration line was removed — re-add
  `<Stack.Screen name="blog/index" />` (or the correct name matching the actual route
  group structure confirmed in 1.1).
- If a TypeScript/syntax error exists — fix it.
- If it's a stale Metro cache issue — no code fix needed, just confirm
  `npx expo start --clear` resolves it, and note this clearly to Deyana so she knows to
  always do a clear restart after route-related changes going forward.

---

## Acceptance Checklist

- [ ] Single shared root cause identified and reported.
- [ ] Tab 4 "Blog" card → opens WebView, no 404.
- [ ] Tab 1 article card tap → opens specific article in WebView, no 404.
- [ ] Tab 1 "See All" → opens blog index in WebView, no 404.
- [ ] All three re-tested together in the same session, on a real device/emulator, after a fresh `--clear` restart.