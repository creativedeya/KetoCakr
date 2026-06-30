# TASK — Fix Blog Route 404 + Missing Tab 1 Blog Section

> Executor: Claude Code at `C:\Dev\KetoCakR\Mobile\` and `C:\Dev\KetoCakR\Admin\`.
> Follow-up after the previous blog-access implementation. Symptom persists after
> restarting the Admin dev server, so this is a real code/routing issue, not a stale
> cache problem. Investigate first, then fix.

---

## Symptom 1 — Tab 4 "Blog" card → 404

Tapping the Blog card in Tab 4 (Tools) navigates to a 404 screen instead of the blog
WebView.

### Investigation steps

**1.1 — Confirm the actual file path and route name:**
```bash
find Mobile/app -iname "*blog*"
```
Expo Router (file-based routing) requires the route file to exist at an exact path
matching the navigation call. Confirm whether the blog screen file is at:
- `Mobile/app/blog/index.tsx` (→ route `/blog`), or
- `Mobile/app/(modals)/blog.tsx` (→ route `/blog` only if grouped correctly, group
  folders in parentheses don't appear in the URL but DO need correct nesting), or
- somewhere else entirely.

**1.2 — Confirm what the Tab 4 card's `onPress` actually navigates to:**
```bash
grep -n "router.push" Mobile/app/\(tabs\)/tools/index.tsx
```
Confirm the exact string passed to `router.push(...)` matches the real route path from
1.1 exactly (case-sensitive, correct leading slash, no typo like `/Blog` vs `/blog`).

**1.3 — Confirm the route is registered / no typo in the Stack:**
If `_layout.tsx` (root or any relevant nested layout) explicitly lists screens (some
Expo Router setups do, especially if migrating from React Navigation patterns), check
whether the blog route was added there. If using pure file-based routing with no
explicit Stack.Screen list, this step doesn't apply — skip it.

**Report which mismatch (if any) was found before fixing.**

### Fix
Correct whichever mismatch was found — either move/rename the blog screen file to match
the navigation call, or fix the navigation call to match the real file path. Don't
silently change both without confirming which one is "correct" per the original task's
intended file structure (`Mobile/app/blog/index.tsx` was the originally specified path
in `TASK_MOBILE_BLOG_ACCESS.md` Phase 1).

---

## Symptom 2 — Tab 1 "From the Blog" Section Not Appearing

Even after restarting the Admin dev server, the Home screen shows no blog preview
section at all.

### Investigation steps

**2.1 — Confirm the section code exists and isn't conditionally hidden:**
```bash
grep -n "fromTheBlog\|From the Blog\|От блога" Mobile/app/\(tabs\)/home/index.tsx
```

**2.2 — Confirm the empty-state hide condition isn't firing incorrectly:**
The original spec said: hide the section entirely if the blog-posts API returns 0 posts.
Check the actual fetch call and condition:
```bash
grep -n -A 5 "blog-posts" Mobile/app/\(tabs\)/home/index.tsx
```
Confirm:
- The fetch URL is correct and points to the right host/port for the Admin API in the
  current dev setup (check whatever env var holds the Admin API base URL — e.g.
  `NEXT_PUBLIC_PUBLIC_API_URL` equivalent on the Mobile side, likely a different env
  var name since this is Expo, not Next.js — search for how other Home screen queries
  already reach the Admin API, per `CLAUDE_CODE_TASK.md` Phase 2 query examples, and
  confirm the blog fetch follows the same base URL pattern).
- The response shape matches what the code expects (`{ results: [...] }` per the route's
  actual return shape — confirm field names line up exactly, including the `category`
  field after the earlier `multi_select` fix).

**2.3 — Manually test the Admin API endpoint directly:**
With the Admin dev server running, fetch the endpoint directly (e.g. via curl, Postman,
or browser) to confirm it actually returns posts with data, independent of the Mobile
app:
```bash
curl http://localhost:3000/api/public/blog-posts
```
(Adjust port to whatever the Admin dev server is actually running on — check terminal
output, may not be 3000 per earlier port-conflict history in this project.)

If this returns 0 results or an error, the bug is server-side (Admin), not Mobile — fix
there. If this returns valid posts but Mobile still shows nothing, the bug is in how
Mobile fetches/renders, not in the data source.

**Report which side (Admin API vs Mobile fetch/render) is the actual failure point.**

### Fix
Based on 2.1–2.3 findings:
- If the Admin API itself returns empty/broken — debug the Notion fetch logic there.
- If the Admin API is fine but Mobile isn't reaching it — check the base URL config
  Mobile uses to reach Admin in dev (this project's local dev setup involves multiple
  ports per `PROJECT_STATUS.md`/session history — confirm Mobile is pointed at the
  correct currently-running Admin port).
- If data reaches Mobile but the section still doesn't render — check the section's
  JSX is actually mounted (not commented out, not behind a feature flag, not throwing a
  silent error swallowed by a try/catch with no logging).

---

## Acceptance Checklist

- [ ] Root cause of Tab 4 404 identified and reported.
- [ ] Tab 4 "Blog" card navigates successfully to the WebView screen, loads `ketocakelab.com/blog`.
- [ ] Root cause of missing Tab 1 section identified and reported (Admin API vs Mobile-side).
- [ ] Tab 1 "From the Blog" section renders with real post data (cover, title, category badge, summary).
- [ ] Tapping a Tab 1 preview item opens that specific article in the WebView.
- [ ] Both fixes verified working on a real device/emulator, not just code review.