# TASK — Integrate Session Report into Project Documentation

> Executor: Claude Code at `C:\Dev\KetoCakR\` (repo root, wherever project docs live —
> same location as `CLAUDE_CODE_TASK.md`, `PROJECT_STATUS.md`, `ROADMAP.md`).
> Documentation-only task. No application code changes.

---

## Input

A session report has been written (in Bulgarian, for Deyana's own reading) covering:
site polish fixes (hero/module images), blog categories, mobile blog access via WebView,
and a deferred auth planning spec. File provided separately: `SESSION_REPORT_2026-06-18.md`.

---

## Steps

1. **Copy the report into the project docs folder** alongside the existing docs
   (`CLAUDE_CODE_TASK.md`, `PROJECT_STATUS.md`, `ROADMAP.md`). Suggested location:
   a new `docs/sessions/` subfolder if one doesn't exist yet, or repo root if that's
   where the other three already live — match existing convention, don't invent a new
   structure if one is already implied by the repo layout.

2. **Update `PROJECT_STATUS.md`:**
   - Add a new `## To-Do — Mobile App (Auth & Gated Content)` section (or append to the
     existing `## To-Do — Mobile App` section) listing, as not-yet-started items:
     - Supabase Auth setup (Apple Sign-In, Google Sign-In, email magic link)
     - `user_profiles` table + RLS policies + auto-create trigger
     - Mobile auth store (Zustand) + soft-gate UI pattern
     - Hidden training articles (separate Notion DB + gated API route)
   - Add a `## Known Issues` entry (or append to existing list) for the leftover
     `next.config.mjs` invalid `api` key (Pages Router leftover, not yet cleaned up).
   - Mark Site image fixes (Hero, module images, founder photo, pre-FAQ image) as
     completed once confirmed — cross-check against actual current file state before
     marking done; if the photo-rotation regression task hasn't been verified fixed yet,
     leave that one as in-progress, not done.

3. **Update `ROADMAP.md`:**
   - Add a note under Stage A (or as a new "Stage A.1.5") referencing the auth/gated-content
     plan, pointing to the full spec file `SPEC_MOBILE_AUTH.md` for details rather than
     duplicating its content inline. Keep this addition short — a few lines, not a copy
     of the full spec.

4. **Do not duplicate full content.** `PROJECT_STATUS.md` and `ROADMAP.md` should
   reference the session report and the auth spec by filename/section, not paste their
   full contents in — keep both docs lean per the existing "CLAUDE.md under 200 lines"
   token-discipline principle already established for this project.

---

## Acceptance Checklist

- [ ] `SESSION_REPORT_2026-06-18.md` is saved in the project docs location.
- [ ] `PROJECT_STATUS.md` has new to-do entries for auth/gated content work.
- [ ] `PROJECT_STATUS.md` has a known-issue entry for the `next.config.mjs` `api` key leftover.
- [ ] `ROADMAP.md` has a short pointer to the auth spec under Stage A.
- [ ] No full duplication of report/spec content inside the two summary docs — references only.
- [ ] No application code touched — this is a docs-only task.
