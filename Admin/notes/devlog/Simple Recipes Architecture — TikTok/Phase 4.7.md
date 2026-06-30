# Phase 4.7: Mobile Cooking Mode - Logo Placeholder Instead of Camera Icon

## Problem
When step has no generated image:
- ❌ Shows camera icon (suggests something is missing/broken)
- ❌ Feels like an error state
- ✅ Should show app logo (normal, not broken)

## Solution
Show app logo (BLAGO logo) as placeholder when no step image exists.

---

## TASK: Find & Update Cooking Mode Component

### Step 1: Locate Cooking Mode

Search for cooking mode screen:

```bash
find /home/claude/KetoCakr/Mobile -name "*cooking*" -o -name "*cook*" -o -name "*instruction*" | grep -i "\.(tsx|ts)$"
```

Expected locations:
- `Mobile/app/recipe-detail/CookingMode.tsx`
- `Mobile/screens/CookingMode.tsx`
- `Mobile/components/CookingMode.tsx`
- `Mobile/app/(tabs)/recipes/[id]/cooking.tsx`

### Step 2: Find Image Display Logic

Look for this pattern:

```typescript
// Current (WRONG):
<Image
  source={step.step_image_url ? { uri: step.step_image_url } : require('...camera-icon...')}
  style={styles.stepImage}
/>

// OR:
{step.step_image_url ? (
  <Image source={{ uri: step.step_image_url }} />
) : (
  <CameraIcon />  // ❌ BAD
)}
```

### Step 3: Replace with Logo

```typescript
// NEW (CORRECT):
import { Image } from 'react-native';

// At top of component:
const BLAGO_LOGO = require('../assets/logo-blago.png');  // or .svg/.webp

// In JSX:
<Image
  source={step.step_image_url ? { uri: step.step_image_url } : BLAGO_LOGO}
  style={{
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    resizeMode: 'contain'
  }}
/>

// OR with Image component from Expo:
import { Image as ExpoImage } from 'expo-image';

<ExpoImage
  source={step.step_image_url || BLAGO_LOGO}
  style={{
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#f5f5f5'
  }}
  contentFit="contain"
/>
```

---

## TASK 2: Update if using conditional rendering

If code looks like:

```typescript
{step.step_image_url ? (
  <Image source={{ uri: step.step_image_url }} style={styles.image} />
) : (
  <View style={styles.placeholderContainer}>
    <CameraIcon size={48} color="gray" />  // ❌ CAMERA ICON
    <Text>No image yet</Text>
  </View>
)}
```

Change to:

```typescript
{step.step_image_url ? (
  <Image 
    source={{ uri: step.step_image_url }} 
    style={styles.image}
  />
) : (
  <View style={styles.placeholderContainer}>
    <Image
      source={require('../assets/logo-blago.png')}  // ✅ LOGO
      style={styles.logoPlaceholder}
    />
  </View>
)}

// Add to styles:
const styles = StyleSheet.create({
  logoPlaceholder: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    opacity: 0.6,
    tintColor: '#999'
  }
});
```

---

## TASK 3: Logo Asset Preparation

### If you have BLAGO logo:

1. **Copy logo to mobile assets:**
```bash
cp /path/to/blago-logo.png Mobile/assets/logo-blago.png
```

2. **Recommended logo formats:**
- Square shape (1:1 aspect ratio)
- Size: 256x256px or 512x512px
- Format: PNG (with transparency)
- Color: Can be full color OR desaturated (40% opacity looks good)

3. **Alternative: Use app icon:**
```typescript
import appIcon from '../assets/app-icon.png';  // Use existing icon

<Image
  source={step.step_image_url || appIcon}
  style={styles.stepImage}
/>
```

### If you don't have logo yet:

Use a simple placeholder:

```typescript
<Image
  source={step.step_image_url ? { uri: step.step_image_url } : null}
  style={styles.stepImage}
/>

{!step.step_image_url && (
  <View style={styles.placeholderBox}>
    <Text style={styles.placeholderText}>📷</Text>
  </View>
)}

// Styles:
const styles = StyleSheet.create({
  placeholderBox: {
    width: '100%',
    height: 300,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed'
  },
  placeholderText: {
    fontSize: 48,
    opacity: 0.4
  }
});
```

---

## TASK 4: Update All Step Image References

Search for all places where step image is displayed:

```bash
grep -r "step_image_url\|stepImage\|step.*image" /home/claude/KetoCakr/Mobile --include="*.tsx" --include="*.ts" | grep -v node_modules
```

Update each one to show logo instead of camera.

---

## Testing Checklist

- [ ] Build mobile app
- [ ] Navigate to recipe with step that has NO image
- [ ] See BLAGO logo (not camera icon)
- [ ] Logo appears with proper opacity/sizing
- [ ] Generate image for that step
- [ ] Image displays properly (replacing logo)
- [ ] Delete generated image
- [ ] Logo shows again
- [ ] Looks natural, not like error ✓

---

## Comparison

### BEFORE:
```
📷 ← feels broken
No image yet
```

### AFTER:
```
[BLAGO LOGO] ← normal placeholder
(faded out, doesn't feel like error)
```

---

## Notes

- Logo should be 40-60% opacity so it's visible but not distracting
- Use desaturated color (grayscale) or light version
- Square aspect ratio works best
- Keep it subtle - it's just a placeholder

---

Good luck! 🎯