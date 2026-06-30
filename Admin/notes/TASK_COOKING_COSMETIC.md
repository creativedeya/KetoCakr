# Task: CookingModeComponentSelector — Cosmetic Fixes

## Context
KetoCakR mobile app. Stack: React Native / Expo SDK 54, Expo Router, React Query, Supabase.
Brand: Ruby Red #A80048. Files in C:\Dev\KetoCakR\Mobile\

## Problems (confirmed from screenshots)

### Problem 1: Step count number overlaps recipe name
In `CookingModeComponentSelector`, the step count number (e.g. "13") overlaps with the recipe name text.
The card layout needs fixing so name and step count don't collide.

### Problem 2: Missing avatars in ComponentSelector
When `comp.imageUrl` is null/undefined, shows emoji icon (🍰 ✨ etc).
For ready_recipes components, the image should come from base_recipes.image_url.
For simple recipes, from base_recipes.image_url.
For user_recipes, from the component image.

The fix has TWO parts:
1. CSS layout fix in CookingModeComponentSelector
2. Ensure imageUrl is passed correctly from [id].tsx for ALL recipe types

---

## Fix 1: Layout in CookingModeComponentSelector

**File:** `Mobile/app/recipe-detail/components/CookingModeComponentSelector.tsx`

Find the card JSX:
```typescript
          <TouchableOpacity
            key={comp.id}
            style={[styles.card, { borderColor: comp.color }]}
            onPress={() => onSelectComponent(comp)}
            activeOpacity={0.8}
          >
            <View style={styles.cardLeft}>
              {comp.imageUrl ? (
                <Image source={{ uri: comp.imageUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.icon}>{comp.icon}</Text>
                </View>
              )}
              <View>
                <Text style={[styles.compName, { color: comp.color }]}>
                  {comp.name}
                </Text>
                <Text style={styles.roleName}>{comp.roleName}</Text>
              </View>
            </View>
            <View style={styles.cardRight}>
              <Text style={[styles.stepCount, { color: comp.color }]}>
                {comp.steps.length}
              </Text>
              <Text style={styles.stepLabel}>{t('cookingMode.steps')}</Text>
            </View>
          </TouchableOpacity>
```

Replace with:
```typescript
          <TouchableOpacity
            key={comp.id}
            style={[styles.card, { borderColor: comp.color }]}
            onPress={() => onSelectComponent(comp)}
            activeOpacity={0.8}
          >
            <View style={styles.cardLeft}>
              {comp.imageUrl ? (
                <Image source={{ uri: comp.imageUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.icon}>{comp.icon}</Text>
                </View>
              )}
              <View style={styles.cardNameBlock}>
                <Text style={[styles.compName, { color: comp.color }]} numberOfLines={2}>
                  {comp.name}
                </Text>
                <Text style={styles.roleName} numberOfLines={1}>{comp.roleName}</Text>
              </View>
            </View>
            <View style={styles.cardRight}>
              <Text style={[styles.stepCount, { color: comp.color }]}>
                {comp.steps.length}
              </Text>
              <Text style={styles.stepLabel}>{t('cookingMode.steps')}</Text>
            </View>
          </TouchableOpacity>
```

Also update styles — find the cardLeft style and add cardNameBlock:

Find:
```typescript
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
```

Replace with:
```typescript
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
    minWidth: 0, // allows text to shrink
  },
  cardNameBlock: {
    flex: 1,
    minWidth: 0, // allows text to truncate properly
  },
```

Also update cardRight to have a fixed minimum width so it never gets squeezed:

Find:
```typescript
  cardRight: {
    alignItems: 'center',
    minWidth: 48,
  },
```

Replace with:
```typescript
  cardRight: {
    alignItems: 'center',
    minWidth: 52,
    flexShrink: 0, // never shrink — always show step count
  },
```

---

## Fix 2: Ensure imageUrl is passed for ALL recipe types

**File:** `Mobile/app/recipe-detail/[id].tsx`

### 2a: Ready recipes path
In the `transformedData` useMemo, ready recipe path, find where components are built:
```typescript
      components.push({
        id: componentId,
        name: language === 'en' ? (br.name_en || br.name) : br.name,
        roleName,
        imageUrl: (br as any).image_url || null,
```

This already passes `imageUrl` — verify it's there. If missing, add `imageUrl: (br as any).image_url || null`.

### 2b: Simple recipes path
Find `simpleComponent` definition:
```typescript
      const simpleComponent = {
        id: 'simple-main',
        name: ...,
        roleName: '',
        imageUrl: simpleRecipe.image_url || null,  // ← should already be here from previous fix
```

Verify `imageUrl` is present. If missing, add it.

### 2c: User recipes path (user-recipe/[id].tsx)
**File:** `Mobile/app/user-recipe/[id].tsx`

Read this file and find where components are built for user recipes.
Check if `imageUrl` is included in the component objects.
If not, add `imageUrl: component.image_url || null` to each component.

---

## Fix 3: Steps text mode — component header avatar

**File:** `Mobile/components/RecipeDetailView.tsx`

In the STEPS tab, TEXT mode, find the component header:
```typescript
                            <View style={styles.componentHeader}>
                              {component.imageUrl ? (
                                <Image
                                  source={{ uri: component.imageUrl }}
                                  style={styles.componentAvatar}
                                  resizeMode="cover"
                                />
                              ) : (
                                <View style={styles.componentAvatarFallback}>
                                  <Text style={styles.componentAvatarEmoji}>🍰</Text>
                                </View>
                              )}
```

This is already correct — shows image if available, fallback emoji if not.
No change needed here IF Fix 2 is applied correctly (imageUrl will be populated).

---

## Execution Order
1. Fix 1 — layout in CookingModeComponentSelector (step count overlap)
2. Fix 2c — check user-recipe/[id].tsx for imageUrl
3. Fix 2a/2b — verify ready + simple paths have imageUrl (likely already done)
4. Test all three recipe types

## Verification
- Open ready recipe (Морковена торта) → Готвя mode → all components show avatars, step count doesn't overlap
- Open simple recipe (Бисквитки) → Готвя mode → avatar shows, "11 стъпки" fits
- Open user recipe (Моя Торта) → Готвя mode → "Блат Червено кадифе" shows avatar instead of ✨

## Rules
- Surgical edits only
- Do NOT rewrite entire files
- Do NOT change cooking mode behavior, only layout/styling
