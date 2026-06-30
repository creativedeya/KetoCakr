# TASK: Simple Recipe Wizard — Round 1 Bug Fixes (found during live testing)

> Found while testing the already-implemented Phase 1 + Phase 2 wizard
> (`TASK_SIMPLE_RECIPE_FLOW_REDESIGN.md`,
> `TASK_SIMPLE_RECIPE_EDIT_MODE_AND_EQUIPMENT_NOTES.md`). Fix these before
> continuing to the Base Recipe wizard task.

---

## Bug 1 — "Step Images" section leaking into Tabs 1, 2, 3

**Observed**: the "Изображения по Стъпки" (per-step image generation)
block renders at the bottom of Tab 1, Tab 2, and Tab 3 — not just Tab 5.

**Required**: this section must render ONLY inside Tab 5, positioned
*after* the per-step ingredient/equipment association checklist (per the
original Tab 5 spec: associate ingredients/equipment first, generate
images after).

**Likely cause**: the component is mounted at a shared/parent wizard
level that renders on every tab, instead of being conditionally rendered
only when the active tab is Tab 5. Phase 0: locate where the step-images
component is mounted and scope it to Tab 5 only.

---

## Bug 2 — "Resources" (Ресурси) section repeating on every tab

**Observed**: same kind of leak — the "+ Добави Ресурс" / Resources block
appears on every tab instead of once.

**Required**: move it into Tab 4, positioned directly after the Lab Notes
section. It must render exactly once, only on Tab 4.

**Likely cause**: same root cause as Bug 1 — check whether both
components were mounted at the wizard-shell level instead of inside the
correct tab's content area.

---

## Bug 3 — Tab 4 Equipment UX regression: manual entry instead of catalog checkboxes

Deyana wants the previous, faster workflow back: a checkbox list of
equipment sourced from the `equipment` catalog table, grouped by
category — check the items used, instead of typing each one manually
every time.

**Required**:
- Phase 0: confirm the `equipment` table's grouping field (likely
  `category` — verify exact column name) and locate any existing
  categorized equipment-picker component already used elsewhere in the
  admin (e.g. the standalone Equipment CRUD section, or the legacy
  pre-wizard correction form) — reuse it rather than rebuilding from
  scratch.
- Tab 4 equipment UI: render catalog items grouped by category, each with
  a checkbox. Checking an item creates a `recipe_equipment` row with
  `equipment_id` set and `item` / `item_bg` copied from the catalog entry
  (default `quantity = 1`, `essential = true`, `reusable` per the
  catalog's own default if one exists). Allow optional inline
  quantity/notes editing per checked item, but the primary interaction is
  checkbox selection, not manual typing.
- Manual entry (typing a custom item not in the catalog) may remain as a
  secondary fallback below the checklist for one-off items — but it must
  not be the default/required flow.

---

## Bug 4 — Tab 5 Associations: save does not persist; confusing two-button flow

**Most critical bug.** Reproduction:
1. Open Tab 5, check several ingredients used in a given step.
2. Click "Запази асоциации" (Save Associations).
3. Click "Завършване" (Finish).
4. Reopen the same recipe — the checkboxes are unchecked; the
   associations were not saved.

**Investigate first, in this order of likelihood**:
1. The edit-mode hydration/load function was never updated to read
   `ingredients_used[]` / `equipment_used[]` back into checkbox state —
   the write path may work fine, but the read-back path on reopen was
   never wired up. This is the most likely explanation given the symptom
   (looks correct during the session, gone on reopen).
2. "Завършване" navigates away immediately without waiting for the
   "Запази асоциации" request to resolve — a race condition where
   clicking both buttons back-to-back effectively cancels the save before
   it completes.
3. The PATCH writes using the wrong step identifier (mismatched id
   mapping) and silently no-ops without surfacing an error.

Report findings before fixing, so we know which of these (possibly more
than one) is the actual cause.

**Consolidate to one button.** Two separate buttons for what should be
one action is confusing, and there is no clear reason Tab 5 needs both
"Запази асоциации" and a separate "Завършване". Unless investigation
finds a genuinely distinct, necessary purpose for "Завършване" (report
this back before deciding), default to merging them into a single
button — e.g. "Запази асоциации", which on success performs both the
PATCH save and whatever navigation/close behavior "Завършване" currently
does. Remove the redundant second button.

Add the same request-in-flight guard already used elsewhere in the
wizard (disable the button while the save is pending) so the single
remaining button can't be double-fired either.

---

## Testing Checklist (this round)

- [ ] Step Images section appears ONLY on Tab 5, after the associations UI
- [ ] Resources section appears ONLY on Tab 4, after Lab Notes
- [ ] Tab 4 equipment: catalog items shown as checkboxes grouped by
      category; checking one creates a correctly-linked `recipe_equipment`
      row; manual entry still available as a fallback, not the default
- [ ] Tab 5: check ingredients/equipment per step, save once (one button),
      close and reopen the recipe — confirm the same items are still
      checked
- [ ] Confirm only ONE button exists on Tab 5 for saving associations

---

## Out of Scope

- Base Recipe wizard (separate task, not yet started)
- Any new features beyond fixing the four bugs above