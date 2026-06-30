# 🐛 Bug Report: YouTube Error 153

**Issue ID:** BUG-001  
**Severity:** HIGH  
**Status:** FIXED  
**Reported:** 2026-05-22  
**Last Updated:** 2026-05-22

---

## Description

YouTube embed видеата не се зареждат в WebView — показват Error 153: "Configuration error configuring video player". Видеото не стартира изобщо; WebView показва черен екран или YouTube error page.

---

## Steps to Reproduce

1. Отвори recipe с YouTube URL в Mobile app
2. Натисни play бутона
3. Изчакай YouTubePlayerModal да се отвори
4. WebView зарежда embed URL без `Referer` header

**Expected Result:** Видеото се зарежда и започва да се пуска

**Actual Result:** Error 153 — "Configuration error configuring video player"; черен екран

---

## Environment

- **Platform:** Mobile
- **OS:** Android 12+
- **Version:** Expo SDK 54 (Expo Go)
- **Framework:** react-native-webview

---

## Error Message / Stack Trace

```
WebView ERROR:
  code: 153
  description: "Configuration error configuring video player"
```

Логвано чрез `onError` handler:
```typescript
onError={(syntheticEvent) => {
  const { nativeEvent } = syntheticEvent;
  // nativeEvent.code === 153
}}
```

---

## Root Cause Analysis

YouTube изисква HTTP `Referer` header при embed заявки. Без него YouTube смята заявката за unauthorized и връща Error 153.

Допълнителни причини:
1. `source={{ html: ... }}` (HTML wrapper) — embed-ване от `null` origin блокирано от YouTube
2. YouTube Shorts имат по-строги embedding ограничения
3. "Allow embedding" трябва да е включено в YouTube Studio за всяко видео

---

## Solution / Fix

```typescript
// Задължителен Referer header
const headers = {
  'Referer': 'https://ketocakelab.com',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 12; AppleWebKit/537.36)',
  'Accept-Language': 'bg-BG,bg;q=0.9',
};

// source={{ uri }} вместо source={{ html }}
<WebView
  source={{ uri: embedUrl, headers }}
  // ...
/>
```

Пълното решение:
1. ✅ Добавен `Referer: https://ketocakelab.com` header
2. ✅ Преминато от HTML wrapper към директен `uri` source
3. ✅ Опростени embed URL параметри (премахнати conflicting атрибути)
4. ✅ Верифицирано "Allow embedding" в YouTube Studio

---

## Testing / Verification

- [x] Fix тестван локално (Expo Go на Android 12)
- [x] Видео KEgbtMHoDKM зарежда успешно
- [x] Без регресии в останалите компоненти
- [x] Error 153 не се появява при нито един от следващите тестове

---

## Related Issues

- Related feature: FEAT-001 (YouTube Video Player)
- Related architecture: ARCH-001 (WebView Embedding Decision)

---

## Notes

- При повторна поява на Error 153: провери YouTube Studio → "Allow embedding" enabled?
- Test с известно работещо видео: ID `KEgbtMHoDKM`
- `npx expo start --clear` преди тест (cache може да скрие fix-а)
- `Referer` header е задължителен и в production build — не го премахвай

---

*Template: KetoCakR DevLog System | Created: 2026-05-22*
