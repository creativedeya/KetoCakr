# Task: Find and Fix Missing Dashboard Navigation Items

## Context
The admin dashboard at admin.ketocakelab.com is missing several navigation cards.
Currently visible: Ingredients, Base Recipes, Equipment Manager, Sweeteners, Lab Notes, USDA Import, Simple Recipes, User Recipes, Settings
Missing: Ready Recipes, Dessert Types, Assembly Templates, PDF Importer, Analytics, Users

## Step 1: Find the nav/sidebar file

Run these commands to locate the correct files:

```bash
# Find all layout and sidebar files
find C:/Dev/KetoCakR/Admin -name "layout.tsx" | head -20
find C:/Dev/KetoCakR/Admin -name "Sidebar*" -o -name "sidebar*" -o -name "Nav*" -o -name "nav*" | head -20

# Search for the card grid that shows the dashboard tiles
grep -r "Equipment Manager" C:/Dev/KetoCakR/Admin --include="*.tsx" -l
grep -r "Simple Recipes" C:/Dev/KetoCakR/Admin --include="*.tsx" -l
grep -r "ready-recipes" C:/Dev/KetoCakR/Admin --include="*.tsx" -l
```

## Step 2: Once you find the file with the dashboard cards

Read it fully, then restore ALL missing navigation items. The complete list must include:

| Card | Route | Emoji/Icon |
|------|-------|-----------|
| Ingredients | /dashboard/ingredients | 🥑 |
| Base Recipes | /dashboard/base-recipes | 🎂 |
| Equipment Manager | /dashboard/equipment | 🔧 |
| Sweeteners | /dashboard/sweeteners | 🍬 |
| Lab Notes | /dashboard/lab-notes | 🧪 |
| USDA Import | /dashboard/usda-import | 📊 |
| Simple Recipes | /dashboard/simple-recipes | ⚡ |
| User Recipes | /dashboard/users | 👥 |
| Settings | /dashboard/settings | ⚙️ |
| **Ready Recipes** | /dashboard/ready-recipes | 🎂 |
| **Dessert Types** | /dashboard/dessert-types | 🏷️ |
| **Assembly Templates** | /dashboard/assembly-templates | 📋 |
| **PDF Importer** | /dashboard/pdf-importer | 📄 |
| **Analytics** | /dashboard/analytics | 📈 |

Bold = currently missing, must be restored.

## Step 3: Fix User Recipes page (loads nothing)

Find the User Recipes page file:
```bash
find C:/Dev/KetoCakR/Admin/app/dashboard/users -name "*.tsx" | head -10
# or
find C:/Dev/KetoCakR/Admin/app/dashboard/user-recipes -name "*.tsx" | head -10
```

Read the file and check:
- What Supabase query is it running?
- Is there an error being swallowed silently?
- Add console.log or fix the query

The page should load from `user_recipes` table joined with profiles.

## Step 4: Fix Delete for Simple Recipes

Find the DELETE handler:
```bash
find C:/Dev/KetoCakR/Admin/app/api/simple-recipes -name "route.ts" | head -10
```

Read the DELETE method. It must delete from ALL related tables in this order:
1. `recipe_instruction_steps` WHERE recipe_id = id
2. `recipe_ingredients` WHERE recipe_id = id  
3. `ready_recipes` WHERE id = id
4. `base_recipes` WHERE id = id (last)

If `ready_recipes` delete is missing — add it.

## Step 5: Fix Cooking Mode — ingredients not showing

Find CookingMode component:
```bash
find C:/Dev/KetoCakR/Mobile -name "CookingMode*" | head -5
```

Read the file and check:
- How does it match `ingredientsUsedIds` to the `ingredients` array?
- What field does it use for matching? (`id`, `ingredientDatabaseId`, index?)

Then read `Mobile/app/recipe-detail/[id].tsx` and check the simple recipe path:
- What values are stored in `step.ingredient_ids` in the DB?
- What values are in `ingredientsUsedIds` after mapping?
- What values are in `cookingIngredients[].id`?

The fix must ensure the IDs match. Report what you find before changing anything.

## Rules
- Surgical edits only — do NOT rewrite entire files
- Do NOT remove any existing functionality
- Report findings before making changes