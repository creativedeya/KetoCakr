# KetoCakR — Master Sequencing Roadmap

> Planning doc (not an execution task). Orders the three distribution tasks
> (MCP, marketing site, deep links) against existing to-dos from
> PROJECT_STATUS.md. Read with: TASK_MCP_SERVER.md, TASK_MARKETING_SITE.md,
> TASK_DEEPLINK_EXPO.md.

---

## Mental model
Two parallel layers, do NOT confuse them:
- **Product layer** = mobile app + admin panel (the existing prototype work).
- **Distribution layer** = view + MCP server + marketing site + deep links.

The distribution layer is showcase-only and additive. It NEVER touches product
functionality. But it is **worthless without content** — it can only show what
exists in published `ready_recipes`. Today: ~1 ready recipe. That is the real
gate, not code.

---

## The hard dependency chain
```
[CONTENT]  publish ready_recipes (images, macros, slugs, dessert_type_id)
    │            (this is the true blocker for the whole showcase)
    ▼
[1] view + public API  (TASK_MCP_SERVER Phase 0–1)   ── safe, zero-risk, can start now
    ├──▶ [1b] MCP server (TASK_MCP_SERVER Phase 2–3)
    └──▶ [2] marketing site (TASK_MARKETING_SITE)     ── needs view + content
              │
              ▼
         [3] deep links (TASK_DEEPLINK_EXPO)          ── needs site live on ketocakelab.com
```

Order: **content → 1 → (1b + 2) → 3.** 1b and 2 can run in parallel once the
view exists.

---

## STAGE 0 — Stabilize prototype (do first, mostly already in flight)
From PROJECT_STATUS "To-Do — Mobile App":
- [ ] Fix "Encountered two..." error in Builder when switching roles
- [ ] Test expo-image-picker on real device
These don't block the showcase but block a credible launch. Keep going.

---

## STAGE 1 — Content readiness (THE real gate for the showcase)
The showcase shows nothing useful until these exist. Pull from existing to-dos:
- [ ] Publish `ready_recipes` from draft (move beyond 1 recipe)
- [ ] Add recipe images manually post-import (hero_image_url must be set)
- [ ] Set `dessert_type_id` on imported recipes
- [ ] Confirm/generate `slug` for every published recipe (deep links + URLs)
- [ ] Verify macros populated (total_calories / net carbs etc.) via triggers
Target: enough published recipes with image + macros + slug that a catalog page
looks alive (rule of thumb: 15–25+).

Can run fully in parallel with Stage 2 below.

---

## STAGE 2 — Backend public layer (start NOW, zero risk)
**TASK_MCP_SERVER.md Phase 0–1.**
- [ ] Migration 10: `public_ready_recipes` view (verify dessert_types columns)
- [ ] Public API routes `/api/public/recipes` + `/[slug]` (force-dynamic, CORS)
This is safe to do immediately even with little content — it doesn't depend on
volume and breaks nothing. Doing it early de-risks Stages 3–4.

Checkpoint: mobile app still loads recipes (anon untouched); no hidden column
reachable.

---

## STAGE 3 — Showcase + agent channel (after Stage 1 content + Stage 2 layer)
Run these two in parallel:
- [ ] **MCP server** — TASK_MCP_SERVER.md Phase 2–3 (1b)
- [ ] **Marketing site** — TASK_MARKETING_SITE.md (Next.js, ketocakelab.com)
Both consume the same view. The site needs real content to be worth shipping;
the MCP server can be tested with whatever exists but should launch with content
too.

---

## STAGE 4 — Deep links (last, needs site live)
**TASK_DEEPLINK_EXPO.md.**
- [ ] Scheme + linking + slug→id resolver route in the app
- [ ] Host `.well-known/apple-app-site-association` + `assetlinks.json` on the
      live site (needs real Apple Team ID + Android signing fingerprint)
- [ ] Requires a native EAS build (not Expo Go) to test universal links
Do alongside or right after the site goes live.

---

## What you can hand to Claude Code RIGHT NOW
1. **Stage 2 (view + API)** — safe immediately, no content dependency.
2. **Stage 1 content tasks** — in parallel, your existing publishing workflow.

Hold Stages 3–4 until Stage 1 has enough published recipes to make a showcase
look credible. A site with 1 recipe undersells the project.

---

## Non-negotiables across all stages
- Never REVOKE anon on `ready_recipes` (mobile depends on it).
- One whitelist, two channels: site + MCP return identical preview fields.
- No steps / ingredients / quantities / cost on any public surface.
- Surgical, additive changes; existing functionality never disappears.
