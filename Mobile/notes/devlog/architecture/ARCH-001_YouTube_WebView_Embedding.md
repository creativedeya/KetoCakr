# 🏗️ Architecture Decision Record (ADR)

**Decision ID:** ARCH-001  
**Title:** WebView-Based YouTube Embedding с Injected JavaScript  
**Date:** 2026-05-22  
**Status:** ACCEPTED  
**Affects:** Mobile

---

## Problem Statement

Как да вградим YouTube видеа в мобилното приложение KetoCakR по начин, който:
1. Работи надеждно на Android и iOS
2. Не позволява на потребителя да напусне приложението
3. Показва KetoCakR branding по време на зареждане
4. Поддържа двуезични субтитри

---

## Context

KetoCakR Mobile е Expo/React Native приложение. Нужни са recipe demonstration видеа директно в app-а. Видеата се хостват в YouTube (канал @ketocakelab). Трябва да се избегне Error 153 (YouTube embedding restriction) и да се предотврати навигация извън приложението.

---

## Decision

Използваме **`react-native-webview`** за зареждане на YouTube embed URL директно (не чрез HTML wrapper), с:
- Кастомни HTTP headers (`Referer`, `User-Agent`, `Accept-Language`)
- Injected JavaScript за прихващане на link clicks
- Animated logo overlay по KetoCakR branding
- `language` prop за bilingual поддръжка

---

## Rationale

**Pros:**
- Пълен контрол върху WebView lifecycle (onLoadStart, onLoadEnd, onError)
- Injected JavaScript позволява прихващане на произволни browser events
- `source={{ uri }}` (не HTML string) = по-малко CORS проблеми
- `react-native-webview` е battle-tested за YouTube в Expo проекти
- Работи на Android и iOS с едни и същи параметри

**Cons:**
- WebView консумира повече памет (~20-40 MB при отворен modal)
- YouTube промени могат да нарушат embedding (но Referer header митигира риска)
- Не може напълно да скрие YouTube branding (YouTube ToS)

---

## Consequences

**Positive Impact:**
- Error 153 е решен чрез `Referer: https://ketocakelab.com` header
- Link blocking работи без нужда от `onShouldStartLoadWithRequest` (injected JS е по-надеждно)
- Logo overlay замества YouTube intro frame seamlessly

**Negative Impact:**
- Видеото не може да тръгне преди WebView да се инициализира (~2-3 сек)
- Fullscreen управление е ограничено на Android

---

## Implementation

### Ключови параметри

```typescript
// Задължителен header — без него YouTube връща Error 153
const headers = {
  'Referer': 'https://ketocakelab.com',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 12; AppleWebKit/537.36)',
  'Accept-Language': language === 'bg' ? 'bg-BG,bg;q=0.9' : 'en-US,en;q=0.9',
};

// Link blocking — извън компонента (const) за да не се рекреира
const injectedJavaScript = `
  (function() {
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (link) {
        const href = link.getAttribute('href');
        if (href && (href.includes('youtube.com') || href.includes('youtu.be'))) {
          e.preventDefault();
          e.stopPropagation();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'LINK_BLOCKED', url: href
          }));
          return false;
        }
      }
    }, true);
  })();
  true;
`;
```

### Key Files Modified

- `Mobile/components/YouTubePlayerModal.tsx` — главна имплементация
- `Mobile/components/VideoButton.tsx` — trigger компонент
- `Mobile/components/RecipeDetailView.tsx` — integration point

---

## Alternatives Considered

### Option 1: `react-native-youtube-iframe`
- Pros: Специализирана библиотека, по-прост API
- Cons: Допълнителна зависимост, по-малко контрол върху link blocking
- Why rejected: Injected JS не е лесен в тази библиотека; не дава контрол върху `Referer` header

### Option 2: HTML String в WebView (`source={{ html }}`)
- Pros: Пълен контрол върху HTML структурата
- Cons: CORS проблеми; YouTube блокира embed-ване от `null` origin
- Why rejected: Предизвика Error 153 при тестване

### Option 3: Deep link към YouTube app
- Pros: Нативен YouTube experience
- Cons: Потребителят напуска приложението — директно противоречи на изискванията
- Why rejected: Изискване е потребителят да остане в app-а

---

## Related ADRs

- Related: FEAT-001 (YouTube Video Player Feature)
- Related: BUG-001 (Error 153 Fix)

---

## Sign-Off

- Proposed by: @creativedeya
- Reviewed by: Claude (AI Development Assistant)
- Approved by: @creativedeya
- Date: 2026-05-22

---

*Template: KetoCakR DevLog System | Created: 2026-05-22*
