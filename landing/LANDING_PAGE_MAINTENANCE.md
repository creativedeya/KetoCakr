# 🎯 CLAUDE CODE TASK - KetoCake Lab Landing Page Maintenance

> **Project:** KetoCake Lab Landing Page  
> **Location:** `C:\Dev\KetoCakr\landing\`  
> **Domain:** https://ketocakelab.com  
> **Date Created:** 2026-03-20  
> **Author:** Deyana

---

## 📋 PROJECT CONTEXT

**Landing page за KetoCake Lab** - waitlist page за мобилно приложение за keto десерти.

**Tech Stack:**
- Статичен HTML файл (`index.html`)
- Inline CSS + JavaScript
- MailerLite integration за email collection
- Deployed на Vercel

**Бранд:**
- Име: KetoCake Lab / Keto Cake Lab
- Tagline: "The Keto Dessert Constructor"
- Цветова схема: Ruby Red (#A80048), Cream (#FEF9F0), Sage (#5B6146), Gold (#B2AC88)
- Fonts: Cormorant Garamond (headings), Manrope (body)

---

## 🎨 DESIGN PRINCIPLES

**КРИТИЧНО ВАЖНИ ПРАВИЛА:**

1. **Запази минималистичния дизайн** - не добавяй излишни елементи
2. **Responsive design** - работи на mobile, tablet, desktop
3. **Fast loading** - inline CSS/JS, base64 images, no external dependencies
4. **MailerLite integration** - запази работещата форма
5. **SEO optimized** - запази meta tags, schema markup
6. **Accessibility** - semantic HTML, ARIA labels където е нужно

---

## 🔧 MAINTENANCE TASKS

### ЗАДАЧА 1: Актуализирай MailerLite API Key (ако е нужно)

**Когато:** Deyana даде нов API key

**Как:**
1. Отвори `index.html`
2. Намери реда ~404: `const MK='eyJ0eXA...'`
3. Замени стойността с новия API key
4. Запази файла
5. Commit: `git commit -m "chore: Update MailerLite API key"`

---

### ЗАДАЧА 2: Промени Social Media Links

**Когато:** Instagram/TikTok handles се променят

**Как:**
1. Намери Footer секцията (около ред 392)
2. Актуализирай URL-ите:
```html
<a href="https://instagram.com/NEW_HANDLE">Instagram</a>
<a href="https://tiktok.com/@NEW_HANDLE">TikTok</a>
```
3. Commit: `git commit -m "chore: Update social media links"`

---

### ЗАДАЧА 3: Добави нова секция "As Featured In" (ако има press coverage)

**Когато:** KetoCake Lab получи media coverage

**Как:**
1. Създай нова секция ПРЕДИ Footer:
```html
<section class="press" style="padding:80px 24px;background:var(--cream-2);text-align:center">
  <div class="module" style="max-width:1200px;margin:0 auto">
    <h2 style="font-size:32px;margin-bottom:48px;color:var(--ruby)">As Featured In</h2>
    <div style="display:flex;gap:48px;justify-content:center;align-items:center;flex-wrap:wrap">
      <!-- Добави logo-та на publications -->
      <img src="PUBLICATION_LOGO_BASE64" alt="Publication Name" style="height:40px;opacity:0.6">
    </div>
  </div>
</section>
```
2. Конвертирай logos в base64: https://www.base64-image.de/
3. Commit: `git commit -m "feat: Add press coverage section"`

---

### ЗАДАЧА 4: Актуализирай Stats (625 combinations, waitlist count)

**Когато:** Цифрите се променят

**Как:**
1. Намери Hero section (около ред 45-60)
2. Актуализирай:
```html
<div class="stat-val">625</div> <!-- Брой комбинации -->
<div class="stat-val">500+</div> <!-- Брой users в waitlist -->
```
3. Commit: `git commit -m "chore: Update statistics"`

---

### ЗАДАЧА 5: Добави Testimonials секция (когато има users)

**Когато:** Има реални user testimonials

**Как:**
1. Добави нова секция СЛЕД "How It Works":
```html
<section class="testimonials" style="padding:80px 24px;background:var(--surface)">
  <div class="module" style="max-width:900px;margin:0 auto">
    <h2 style="text-align:center;margin-bottom:48px">What Bakers Say</h2>
    <div style="display:grid;gap:24px">
      <!-- Testimonial card -->
      <div style="padding:32px;background:white;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05)">
        <p style="font-style:italic;margin-bottom:16px;color:var(--text-2)">"Quote from user..."</p>
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--ruby-glow)"></div>
          <div>
            <strong>User Name</strong>
            <div style="font-size:14px;color:var(--text-3)">Keto Baker</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```
2. Commit: `git commit -m "feat: Add testimonials section"`

---

### ЗАДАЧА 6: Актуализирай App Screenshots (когато app-ът е ready)

**Когато:** Мобилното приложение е готово с production screenshots

**Как:**
1. Вземи screenshots от iPhone/Android
2. Конвертирай в base64 или качи в `/landing/images/`
3. Замени placeholder images в Hero section
4. Commit: `git commit -m "feat: Update app screenshots"`

---

### ЗАДАЧА 7: Добави Privacy Policy & Terms

**Когато:** Преди official launch

**Как:**
1. Създай `privacy.html` и `terms.html` файлове в `/landing/`
2. Актуализирай Footer links:
```html
<a href="privacy.html">Privacy</a>
<a href="terms.html">Terms</a>
```
3. Commit: `git commit -m "feat: Add privacy policy and terms"`

---

### ЗАДАЧА 8: A/B Testing Variants (advanced)

**Когато:** Искаш да тестваш different headlines/CTA

**Как:**
1. Създай `index-variant-b.html`
2. Промени само headline или CTA button text
3. Deploy и тествай с 50/50 traffic split (Vercel Edge Functions)
4. Избери winning variant

---

## 🚫 КАКВО ДА НЕ ПРАВИШ

1. **НЕ добавяй external dependencies** (jQuery, Bootstrap, etc.)
2. **НЕ променяй цветовата схема** без одобрение
3. **НЕ трий MailerLite integration кода**
4. **НЕ добавяй analytics tracking** (Google Analytics) без одобрение - може да забави page load
5. **НЕ променяй font family** - Cormorant + Manrope са част от brand identity
6. **НЕ добавяй автоматични pop-ups** - дразнят users
7. **НЕ премахвай accessibility features** (alt tags, ARIA labels)

---

## 📊 PERFORMANCE BENCHMARKS

Landing page-ът трябва да спазва:
- **Lighthouse Score:** 90+ (Performance)
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s
- **Total Size:** < 500KB

Преди всеки commit провери с:
```powershell
# Test локално:
cd C:\Dev\KetoCakr\landing
python -m http.server 8000
# Отвори http://localhost:8000 и провери в Chrome DevTools
```

---

## 🔍 TESTING CHECKLIST

Преди deploy на промени:

- [ ] Mobile view (375px width) изглежда добре
- [ ] Tablet view (768px width) изглежда добре
- [ ] Desktop view (1440px width) изглежда добре
- [ ] Waitlist форма работи (въведи test email)
- [ ] Всички links работят
- [ ] Images се зареждат
- [ ] Scroll animations работят
- [ ] No console errors в DevTools

---

## 🚀 DEPLOYMENT PROCESS

### Локални промени:
```powershell
cd C:\Dev\KetoCakr

# Edit index.html:
code landing/index.html

# Test локално (optional):
cd landing
python -m http.server 8000

# Commit:
git add landing/index.html
git commit -m "TYPE: DESCRIPTION"
git push origin main
```

### Vercel Auto-Deploy:
- Push към `main` branch автоматично trigger-ва deploy
- Check status: https://vercel.com/dashboard
- Live на: https://ketocakelab.com (след 1-2 минути)

---

## 🎯 ROADMAP - БЪДЕЩИ ПОДОБРЕНИЯ

### Фаза 1 (Launch - сега):
- [x] Waitlist форма
- [x] Hero section с value proposition
- [x] How It Works секция
- [x] Benefits секция
- [ ] Privacy Policy & Terms

### Фаза 2 (1-2 месеца):
- [ ] Testimonials секция (реални users)
- [ ] App screenshots (production app)
- [ ] Press mentions секция
- [ ] Video demo на app-а

### Фаза 3 (3-6 месеца):
- [ ] Blog за keto recipes
- [ ] Email onboarding sequence
- [ ] Affiliate program landing
- [ ] Multi-language support (English priority)

---

## 📞 CONTACT & QUESTIONS

При проблеми или въпроси:
1. Check GitHub Issues: https://github.com/creativedeya/KetoCakr/issues
2. Попитай Deyana директно
3. Провери Vercel deployment logs

---

## 📚 ПОЛЕЗНИ РЕСУРСИ

- **Base64 Image Converter:** https://www.base64-image.de/
- **Color Palette:** Coolors.co (запази Ruby/Cream/Sage/Gold scheme)
- **Favicon Generator:** https://realfavicongenerator.net/
- **Meta Tags Validator:** https://metatags.io/
- **Lighthouse Test:** Chrome DevTools → Lighthouse tab

---

## ✅ DEFINITION OF DONE

Промяната е готова когато:
- [ ] Кодът работи локално
- [ ] Commit message е ясен
- [ ] Push към GitHub е успешен
- [ ] Vercel deployment е Ready ✅
- [ ] Live site се зарежда без грешки
- [ ] Mobile + Desktop views са тествани
- [ ] Waitlist форма все още работи

---

**Край на документа. Запази този файл като `LANDING_PAGE_MAINTENANCE.md` в `/landing/` папката!** 🚀