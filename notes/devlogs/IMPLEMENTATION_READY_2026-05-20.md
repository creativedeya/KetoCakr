# Ready-to-Execute Tasks — Session 2026-05-20

Last Updated: 2026-05-20

## ✅ Completed & Merged
- [x] Simply recipes step ingredients fix (SQL + Code)
  - Database: recipe_instruction_steps updated (Barry Pana Cotta)
  - Code: Mobile/app/recipe-detail/[id].tsx lines 232-247
  - Status: Tested & verified working

- [x] Complex recipes UUID mapping fix
  - Code: Added buildIngredientUuidMap() helper
  - Handles ingredient_database UUID → recipe_ingredients.id conversion
  - Status: Tested with Tropical recipe

- [x] Equipment display in Cooking Mode
  - Code: Added equipmentNeeded field to allSteps
  - Status: Shows correctly in TEXT and GALLERY modes

- [x] Recipe title missing (SQL)
  - Database: ready_recipes.name_bg populated
  - Status: Barry Pana Cotta now shows "Ягодова панакота" on Home

## ⏳ Prepared & Ready to Execute

### Avatar Enhancement in Cooking Mode
- **Task File:** `/home/claude/CLAUDE_CODE_AVATARS_COOKING_MODE.md`
- **Description:** Replace text-only component headers with image avatars + reduce font sizes
- **Files to Modify:**
  - `Mobile/app/recipe-detail/[id].tsx` (add imageUrl to components)
  - `Mobile/components/RecipeDetailView.tsx` (update interface + JSX + styles)
- **Estimated Time:** 20-25 minutes
- **Priority:** Medium (UX improvement)
- **Steps:** 4 (add field, update interface, replace JSX, add CSS)

## 📋 Analysis Complete (Ready for Next Session)

### Lab Notes in Cooking Mode
- Requires extracting labNotes from transformedData
- Display relevant lab notes per step/component
- Est. time: 30-40 min

### Duplicate Base Recipes Cleanup
- 5 dual-role frosting/filling recipes need manual admin panel removal
- Context: Some recipes serve as both filling and frosting
- Est. time: 10-15 min (manual)

### Pan Size Dynamic Templating
- Replace hardcoded "18 см" in recipe steps
- Use formula: diameter = servings + 10
- SQL UPDATE with CASE statement required
- Est. time: 15-20 min

## Statistics

| Metric | Value |
|--------|-------|
| Session Date | 2026-05-20 |
| Bugs Fixed | 4 |
| Code Files Modified | 1 |
| DB Queries Executed | 5 |
| Tests Verified | 2 |
| Enhancements Prepared | 1 |
| Issues Remaining | 0 |

## Next Actions

1. **Immediate (Next 30 min):** Execute avatar enhancement task
2. **Short-term (Next session):** Lab notes + duplicate cleanup
3. **Medium-term:** AI-generated step images (Recraft V4)
4. **Long-term:** Multi-diet support + sweetener calculator

---

Generated: 2026-05-20
