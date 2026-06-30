# KetoCakR Mobile — PRECISE Fix: Video Button Position (Below Nutrition Badge)

## PROBLEM

Current position: Button is above nutrition badge
Desired position: Button BELOW nutrition badge

### Visual Layout (WRONG - current)
```
┌─────────────────────────────┐
│  [HERO IMAGE]               │
├─────────────────────────────┤
│  [▶ WATCH VIDEO]            │ ← WRONG: Above nutrition
├─────────────────────────────┤
│  195 kcal | 1g | 16g | 11g  │
└─────────────────────────────┘
```

### Visual Layout (CORRECT - desired)
```
┌─────────────────────────────┐
│  [HERO IMAGE]               │
├─────────────────────────────┤
│  195 kcal | 1g | 16g | 11g  │ ← Nutrition badge
├─────────────────────────────┤
│  [▶ WATCH VIDEO]            │ ← CORRECT: Below nutrition
├─────────────────────────────┤
│  1140g    3 винна чаша   ... │
└─────────────────────────────┘
```

---

## SOLUTION

### File: `Mobile/components/RecipeDetailView.tsx`

### STEP 1: FIND nutrition badge section

Search for code that renders nutrition (calories, protein, fat, carbs).

Look for something like:
```typescript
{/* Nutrition Badge */}
<View style={styles.nutritionBadge}>
  <View style={styles.nutritionItem}>
    <Text>{totalCalories}</Text>
    <Text>kcal</Text>
  </View>
  {/* ... more nutrition items ... */}
</View>
```

### STEP 2: FIND where video button currently is

Should find code like:
```typescript
{sourceUrl && (
  <View style={{ 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    backgroundColor: 'white',
    alignItems: 'center'
  }}>
    <VideoButton sourceUrl={sourceUrl} />
  </View>
)}
```

### STEP 3: MOVE video button code

**MOVE the entire video button section** to AFTER nutrition badge.

**Order should be:**
1. Hero image
2. Nutrition badge (← stays in original position)
3. Video button (← MOVE here, after nutrition)
4. Servings/Price section
5. Ingredients
6. etc.

### EXACT CODE PLACEMENT

Find this section:
```typescript
{/* Hero Image */}
<Image ... />

{/* Video Button - MOVE FROM HERE */}
{sourceUrl && (
  <View ...>
    <VideoButton ... />
  </View>
)}

{/* Nutrition Badge */}
<View style={styles.nutritionBadge}>
  ...
</View>
```

**CHANGE TO:**
```typescript
{/* Hero Image */}
<Image ... />

{/* Nutrition Badge */}
<View style={styles.nutritionBadge}>
  ...
</View>

{/* Video Button - MOVED HERE, BELOW nutrition */}
{sourceUrl && (
  <View style={{ 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    backgroundColor: 'white',
    alignItems: 'center'
  }}>
    <VideoButton sourceUrl={sourceUrl} />
  </View>
)}

{/* Rest of content below */}
```

---

## VERIFICATION CHECKLIST

- [ ] Find nutrition badge section
- [ ] Find video button code
- [ ] Cut video button code
- [ ] Paste AFTER nutrition badge closing tag
- [ ] Verify order: Image → Nutrition → Video Button
- [ ] No duplicate video button code
- [ ] No syntax errors
- [ ] Test on simply recipe

---

## TESTING

1. **Open Mobile app**
2. **Go to Ягодова панакота**
3. **Verify layout from top to bottom:**
   - Hero image ✅
   - Nutrition badge (195 kcal | 1g | 16g | 11g) ✅
   - Video button with thumbnail ✅
   - Servings/Price section ✅
   - Ingredients ✅

---

## IF YOU CAN'T FIND THE SECTIONS

Use VS Code Find:
- `Ctrl+F` → Search: `nutritionBadge`
- `Ctrl+F` → Search: `sourceUrl`

These will help locate the exact lines to modify.

---

Generated: 2026-05-21
Priority: HIGH (UI layout fix)
Complexity: TRIVIAL (just move code block)
Time: 5 minutes