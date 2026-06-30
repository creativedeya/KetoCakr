# KetoCakR Mobile — Simplify: Video Button Icon Only

## CHANGE

Remove "YouTube" text - keep ONLY the white play icon on ruby red background.

### Current (With text)
```
┌─────────────────────┐
│ ▶ YouTube           │
└─────────────────────┘
```

### Desired (Icon only)
```
┌─────────┐
│   [▶]   │
└─────────┘
Ruby Red background
```

---

## SOLUTION

### File: `Mobile/components/VideoButton.tsx`

### REPLACE component with SIMPLIFIED version:

```typescript
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { YouTubePlayerModal } from './YouTubePlayerModal';
import Colors from '@/constants/Colors';

interface VideoButtonProps {
  sourceUrl: string;
}

export const VideoButton = ({ sourceUrl }: VideoButtonProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const extractYouTubeId = (url: string): string | null => {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&\n?#]+)/
    );
    return match ? match[1] : null;
  };

  const videoId = extractYouTubeId(sourceUrl);
  if (!videoId) return null;

  return (
    <>
      {/* Play Icon Button - Brand Red */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: Colors.primary.main, // Ruby Red #A80048
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.3,
          shadowRadius: 2,
          elevation: 3,
        }}
      >
        {/* White Play Icon */}
        <Ionicons name="play" size={24} color="white" />
      </TouchableOpacity>

      {/* Modal */}
      <YouTubePlayerModal
        visible={modalVisible}
        videoId={videoId}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};
```

---

## SPECIFICATIONS

| Property | Value |
|----------|-------|
| Shape | Circle |
| Size | 48x48px |
| Border Radius | 24 (fully rounded) |
| Background | Colors.primary.main (#A80048) |
| Icon | play (24px, white) |
| Shadow | Subtle |

---

## VISUAL RESULT

```
┌─────────┐
│   [▶]   │  ← Clean, simple, iconic
└─────────┘
Ruby Red (#A80048)
White play icon
No text
```

---

## VERIFICATION CHECKLIST

- [ ] Remove "YouTube" text from component
- [ ] Keep ONLY play icon
- [ ] Button is 48x48px circle
- [ ] Background is Ruby Red
- [ ] Icon is 24px white
- [ ] Positioned in top-right of price section
- [ ] Clean and minimal look
- [ ] Click opens video player

---

## TESTING

1. **Open Mobile app**
2. **Go to Ягодова панакота**
3. **Look at price section top-right**
4. **Should see:** Small red circle with white play icon
5. **NO "YouTube" text**
6. **Click icon**
7. **Video plays**

---

Generated: 2026-05-21
Priority: LOW (visual polish)
Complexity: TRIVIAL (remove text)
Time: 2 minutes