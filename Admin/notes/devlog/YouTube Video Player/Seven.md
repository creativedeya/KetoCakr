# KetoCakR Mobile — PRECISE Task: Fix YouTube Regex to Support Shorts URLs

## PROBLEM

VideoButton component is receiving the `sourceUrl` correctly:
```
sourceUrl: https://youtube.com/shorts/3ifCfSIOyZY?si=LnfWKkTSmdnebUg1
```

But the video button is NOT showing because the `extractYouTubeId` function doesn't support YouTube Shorts format.

**Current regex only handles:**
- ❌ `youtube.com/watch?v=ID` ✅
- ❌ `youtu.be/ID` ✅
- ❌ `youtube.com/embed/ID` ✅
- ❌ `youtube.com/shorts/ID` ❌ NOT SUPPORTED!

**Result:** `extractYouTubeId()` returns `null`, thumbnail URL fails, button doesn't render.

---

## SOLUTION: Update YouTube ID Extraction Regex

### Step 1: Find the Code

**File:** `Mobile/components/VideoButton.tsx`

**Find:** The `extractYouTubeId` function

**Look for:**
```typescript
const extractYouTubeId = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  );
  return match ? match[1] : null;
};
```

### Step 2: REPLACE with Updated Regex

**Current (WRONG):**
```typescript
const extractYouTubeId = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  );
  return match ? match[1] : null;
};
```

**New (CORRECT):**
```typescript
const extractYouTubeId = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&\n?#]+)/
  );
  return match ? match[1] : null;
};
```

### Step 3: Explanation of Change

**Old regex breakdown:**
```
youtube\.com\/watch\?v=       ← matches: youtube.com/watch?v=
|                              ← OR
youtu\.be\/                    ← matches: youtu.be/
|                              ← OR
youtube\.com\/embed\/          ← matches: youtube.com/embed/
```

**Missing:** `youtube\.com\/shorts\/`

**New regex breakdown:**
```
youtube\.com\/(?:watch\?v=|shorts\/|embed\/)  ← matches ANY of: /watch?v=, /shorts/, /embed/
|
youtu\.be\/                                     ← matches: youtu.be/
```

The `(?:...)` is a non-capturing group that matches ANY of the three patterns.

### Step 4: Verify Fix

After replacing the regex, the function should:

1. Extract ID from: `https://youtube.com/shorts/3ifCfSIOyZY?si=LnfWKkTSmdnebUg1`
   - Result: `3ifCfSIOyZY` ✅

2. Extract ID from: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Result: `dQw4w9WgXcQ` ✅

3. Extract ID from: `https://youtu.be/dQw4w9WgXcQ`
   - Result: `dQw4w9WgXcQ` ✅

4. Extract ID from: `https://www.youtube.com/embed/dQw4w9WgXcQ`
   - Result: `dQw4w9WgXcQ` ✅

---

## TESTING

After making the change:

1. **Clear app cache** (Expo Go: Shake device → Reload)
2. **Open Mobile app**
3. **Navigate to Ягодова панакота**
4. **Should see:**
   - ✅ Video button with YouTube thumbnail
   - ✅ Play button overlay
   - ✅ "WATCH VIDEO" text
5. **Click button**
6. **Should see:**
   - ✅ Modal opens
   - ✅ YouTube player loads
   - ✅ Video plays
   - ✅ Close button (X) works

---

## VERIFICATION CHECKLIST

- [ ] Find extractYouTubeId function in VideoButton.tsx
- [ ] Replace regex pattern with new one
- [ ] Verify NEW regex includes: `shorts\/`
- [ ] Verify syntax is correct (no missing slashes or parentheses)
- [ ] NO TypeScript errors
- [ ] Test with Ягодова панакота shorts URL
- [ ] Video button appears below hero image
- [ ] Thumbnail loads correctly
- [ ] Play button is visible
- [ ] Click opens YouTube player
- [ ] Video plays with subtitles
- [ ] Close button works

---

## IF STILL NOT WORKING

Add debug log to verify ID extraction:

```typescript
const extractYouTubeId = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&\n?#]+)/
  );
  console.log('🎬 extractYouTubeId - url:', url, '| extracted ID:', match?.[1]);
  return match ? match[1] : null;
};
```

Then check Expo console log. Should show:
```
🎬 extractYouTubeId - url: https://youtube.com/shorts/3ifCfSIOyZY?si=... | extracted ID: 3ifCfSIOyZY
```

---

## FILE SUMMARY

**Only ONE file needs modification:**
- `Mobile/components/VideoButton.tsx`

**Only ONE function needs update:**
- `extractYouTubeId()`

**Only ONE line changes:**
- The regex pattern inside `.match()`

---

Generated: 2026-05-21
Priority: BLOCKING (video button won't show without fix)
Complexity: TRIVIAL (single line regex update)
Time: 2 minutes