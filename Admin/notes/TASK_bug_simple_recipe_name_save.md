# TASK (BUG): Simple Recipe Edit — Name Change Not Persisted on Save

**Symptom:** In the simple-recipe edit mode (admin panel), changing the recipe name (name_bg and/or name_en) and saving reports success, but the name remains unchanged afterwards.

**Scope:** Admin panel — simple recipe editor (the steps CRUD editor for simple/imported recipes) and its save path (client → API route → `ready_recipes`).

> **INVESTIGATION FIRST.** Do not patch blindly — reproduce the data flow, identify the actual cause among the ranked hypotheses below, report it, then fix surgically. Do NOT remove existing functionality.

---

## Phase 0 — Trace the save path

1. Locate the simple recipe edit page/component and its save handler:
   - `grep -rn "is_simple\|simple_recipe\|simply" Admin/app --include=*.tsx -il`
   - Identify: does save call `supabase.from('ready_recipes').update(...)` client-side, or POST to an API route (service role)?
2. Log/inspect the exact payload sent on save — does it contain `name_bg` / `name_en` with the NEW values?
3. Check what the update is keyed on: `.eq('id', ...)` or a name-based lookup?

---

## Ranked Hypotheses (verify in this order)

### H1 — Upsert-by-name logic re-targets by the OLD name ⭐ most likely
The PDF-import upsert pattern looks up `ready_recipes` by `name_bg` to prevent duplicates. If the **edit save path reuses this pattern**, then:
- User changes `name_bg` → lookup by the NEW name finds nothing → code inserts a NEW record (duplicate) and the original keeps the old name, **or**
- Lookup/update is keyed `.eq('name_bg', originalName)` and the payload omits the name fields → name never changes.

**Fix:** the EDIT path must always update by **`id`** (primary key), never by name. Name-based upsert is correct ONLY for import, not for editing an existing record:
```ts
await supabaseAdmin.from('ready_recipes')
  .update({ name_bg, name_en, ...rest, updated_at: new Date().toISOString() })
  .eq('id', recipeId)
  .select();
```

### H2 — RLS silently blocks the update (0 rows, no error)
If save runs client-side with the anon key, RLS on `ready_recipes` may permit nothing → `update` returns no error but affects 0 rows. Established project rule: **all privileged writes go through API routes with `SUPABASE_SERVICE_ROLE_KEY`**.

**Check:** append `.select()` to the update and verify `data.length > 0`. If 0 rows:
**Fix:** route the save through an API route with the service role key (same pattern as existing storage/RLS fixes). Add a guard so this class of bug surfaces instead of failing silently:
```ts
if (!data || data.length === 0) throw new Error('Update failed — no rows affected (RLS?)');
```

### H3 — Payload omits the name fields
The save handler may persist steps/ingredients but build the recipe-level payload from a different state object that isn't synced with the name input (e.g., name lives in a header component's local state).

**Fix:** include `name_bg` / `name_en` from the live form state in the update payload.

### H4 — Stale cache masks a successful save
The save works, but the reload fetch hits a cached API response. Established rule: API routes need `export const dynamic = 'force-dynamic'`.

**Check:** after "failed" save, query the row directly in Supabase SQL Editor:
```sql
SELECT id, name_bg, name_en, updated_at FROM ready_recipes WHERE id = '<recipe_id>';
```
If the DB HAS the new name → cache problem.
**Fix:** add `export const dynamic = 'force-dynamic'` to the GET route (and/or `cache: 'no-store'` on the client fetch), and refetch/invalidate after save.

### H5 — Duplicate record created (side effect of H1)
If H1 confirmed, also check for an orphan duplicate created during the failed attempts:
```sql
SELECT id, name_bg, status, created_at FROM ready_recipes ORDER BY created_at DESC LIMIT 10;
```
Clean up any accidental duplicate (confirm with user before deleting).

---

## Required outcome
- Editing the name of a simple recipe persists `name_bg` and `name_en` on the SAME record (same `id`).
- Save reports an explicit error if 0 rows were affected — no more silent "success".
- Import upsert-by-name behavior remains UNCHANGED (it is correct for import).

## Testing Checklist
- [ ] Change name_bg only → persists after reload
- [ ] Change name_en only → persists after reload
- [ ] Change both + edit a step in the same save → all persist
- [ ] Verify in Supabase SQL Editor that `id` is unchanged and no duplicate row appeared
- [ ] Re-run a PDF import of the same recipe → upsert still matches by name_bg (no regression)
- [ ] Session report saved to `Admin/logs/` with the confirmed root cause
