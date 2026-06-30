# KetoCakR Mobile — Remove Serving Container Text - Show ONLY Number

## PROBLEM

Servings section shows:
```
4
винна чаша     ← REMOVE THIS
3 × 1.3        ← REMOVE THIS
```

Should show ONLY:
```
4
```

---

## SOLUTION

### File: `Mobile/components/RecipeDetailView.tsx`

### STEP 1: Find Servings Display

Search for code that shows servings. Look for something like:

```typescript
{/* Servings / Serving Container */}
<View style={styles.servingContainer}>
  <Text>{totalServings}</Text>
  <Text>{servingContainer?.name}</Text>
  {/* or */}
  <Text>{servingContainer}</Text>
</View>
```

### STEP 2: REPLACE with ONLY the number

**CHANGE FROM:**
```typescript
<View style={styles.servingContainer}>
  <Text>{totalServings}</Text>
  <Text>{servingContainer?.name}</Text>
  <Text>{servingContainer?.serving_container_type}</Text>
</View>
```

**CHANGE TO:**
```typescript
<View style={styles.servingContainer}>
  <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
    {totalServings}
  </Text>
</View>
```

Or if there's more complex code, just DELETE these lines:

```typescript
// DELETE THESE:
<Text>{servingContainer?.name}</Text>
<Text>{servingContainer?.name_en}</Text>
<Text>{servingContainer?.serving_container_type}</Text>
<Text>{servingContainer?.calculation}</Text>
{/* Any other servingContainer properties */}
```

**KEEP ONLY:**
```typescript
<Text>{totalServings}</Text>
```

---

## STEP 3: Verify

After change, servings section should show ONLY the number:
```
4
```

NOT:
```
4
винна чаша
3 × 1.3
```

---

## VERIFICATION CHECKLIST

- [ ] Find servings display code
- [ ] Remove ALL servingContainer text/name
- [ ] Remove calculation text
- [ ] Keep ONLY totalServings number
- [ ] Test on recipe
- [ ] Servings shows: just the number (2, 3, 4, etc.)
- [ ] NO container name (винна чаша)
- [ ] NO calculations (3 × 1.3)

---

## TESTING

1. **Open Mobile app**
2. **Go to Ягодова панакота**
3. **Look at servings section (middle of price bar)**
4. **Should show ONLY:** The number (2, 3, 4)
5. **Should NOT show:**
   - винна чаша
   - 3 × 1.3
   - Any other text

---

Generated: 2026-05-21
Priority: HIGH (UI cleanup)
Complexity: TRIVIAL (remove text)
Time: 5 minutes