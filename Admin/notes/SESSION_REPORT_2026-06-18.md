# Доклад от сесия — Site Polish + Blog + Auth Planning
**Дата:** 2026-06-18
**Фокус:** Stage D (маркетинг сайт) полиране, Notion блог категории, mobile blog достъп, auth планиране

---

## 1. Изпълнени task файлове (готови за Claude Code / вече предадени)

### 1.1 `TASK_MIGRATE_IMAGES.md` (преразгледан в тази сесия)
Първоначалната задача (base64 → Supabase Storage) се оказа без работа за вършене —
разследването на Claude Code потвърди, че оригиналният `ketocakelab-landing.html` файл
никога не е бил пренесен в Site репото при scaffold-а. Нямаше base64 изображения за
мигриране. Истинският проблем се оказа друг (виж 1.2).

### 1.2 `TASK_FIX_HERO_IMAGE.md`
Hero секцията показваше празно сиво поле вместо снимка на тортата "Velvet Alchemy".
Снимката вече беше качена в Supabase Storage bucket `Site KetoCakeLab`, просто не беше
wire-ната в кода. Дадох конкретен URL и инструкции да не се пипа позицията на
floating spec card-а ("SPEC NO. 04 / Velvet Alchemy / NET CARBS 4.2g").

### 1.3 `TASK_WIRE_REMAINING_IMAGES.md`
Поредица от 6 липсващи снимки бяха идентифицирани и wire-нати:
- Pre-FAQ секция снимка
- 4 module снимки (Base→Frosting→Filling→Decoration, в точно този ред)
- Снимка на основателя (Деяна) до цитата за математиката — само правоъгълна снимка,
  без caption/overlay, в готово резервирано място в layout-а

### 1.4 `TASK_FIX_PHOTO_ROTATION_AND_HERO.md`
След изпълнение на 1.2 и 1.3, два проблема се появиха при визуална проверка:
- Снимката на Деяна се показваше странично (EXIF orientation проблем, типично за
  телефонни снимки) — дадени са 2 опции: CSS rotate бърз тест, или по-чист fix чрез
  re-export с коригиран EXIF
- Hero снимката на тортата изчезна отново (вероятен regression — следваща задача
  (1.3) е пипала близка секция в същия файл `page.tsx` и вероятно случайно е
  презаписала по-ранния fix)

### 1.5 `TASK_SITE_BROWSE_ALL.md`
Решени архитектурни въпроси чрез Q&A с потребителя:
- Home gallery ограничена до 6 рецепти (≈2 реда), бутон "See All Recipes →"
- Нова `/recipes` страница: search bar (debounce 300ms, mobile Tab 2 логика) +
  dessert-type filter chips (динамично от данните, Option A — без нов backend route)
- CTA поток решен: card → `/recipe/[slug]` (детайл на сайта) → бутон "Open in App"
  (deep link `blagocake://recipe/{slug}` с waitlist fallback)
- Blog search bar, същия debounce pattern, клиентско филтриране по title/summary

### 1.6 `TASK_BLOG_CATEGORIES.md`
4 категории за блог статиите: Продукт, Посуда, Техники, За начинаещи в кето диетата.
- Нова Notion колона `Category` (Select тип) — добавя се ръчно от потребителя
- Filter chips на blog index страницата (същия pattern като dessert-type chips)
- Category badge на всяка статийна картичка
- Филтър по категория + текстово търсене работят заедно (комбинирани условия)

### 1.7 `TASK_MOBILE_BLOG_ACCESS.md`
Достъп до блога вътре в мобилното приложение, за да не излизат потребителите към
външни източници за инфо:
- **WebView подход** (не нативни екрани) — преизползва вече построения сайт блог,
  без дублиране на логика/съдържание
- **Критично навигационно изискване:** back бутон (хардуерен Android + header) първо
  минава назад в историята на самия WebView; излиза от екрана само когато няма повече
  WebView история — потребителят никога не "изпада" към браузър или site контекст
  извън приложението
- Tab 4 (Tools): нова, напълно функционална карта "Blog" (за разлика от другите 4
  placeholder карти с "Coming soon!")
- Tab 1 (Home): нова секция "From the Blog" под recipe grid-а — вертикален списък с
  последните статии (cover, заглавие, category badge, резюме), "Виж повече" отваря
  пълния блог index с вече вградените search + category филтри
- Нов backend route: `Admin/app/api/public/blog-posts` — преизползва съществуващата
  Notion fetch логика от Site, защото мобилното приложение не трябва да носи Notion
  API ключ директно в себе си (client-distributed bundle риск)

---

## 2. Решение, отложено за по-късна фаза: Скрити обучителни статии + Auth

### 2.1 Първоначална идея
Потребителят предложи категория обучителни статии (подробно обяснение на функции в
приложението), видима само за регистрирани потребители на приложението — за разлика
от целия останал публичен блог.

### 2.2 Защо не се изпълни директно
Приложението в момента няма auth система (`Profile` таб = "Guest User", без login).
Скритите статии изискват реална автентикация, която по `ROADMAP.md` вече е маркирана
като отделна, по-рискова архитектурна фаза (Stage A.1, "higher-risk architectural
work — reserve Opus-class model").

### 2.3 Решения, взети чрез Q&A
- Скритите статии **никога** не се показват на публичния сайт (`ketocakelab.com/blog`)
  — дори в Notion да не са видими публично
- Изисква се реална регистрация/login (не просто "всеки отвори app-а")
- Отделна Notion база за скритото съдържание (физическо разделяне от публичния блог,
  елиминира риска от случайно изтичане чрез грешка във филтър)
- **Launch стратегия: Soft gate**, не Hard gate. Гости продължават да ползват
  приложението напълно както сега (browse/search/Recipe Builder/Tools) без login wall
  при отваряне. Login се изисква само локално, за конкретни заключени функции
  (скритите статии + бъдещи account-bound фичъри: favorites, saved recipes, premium)
- Auth providers, по приоритет: 1) Sign in with Apple (задължително за iOS App Store
  compliance когато се предлагат и други social login опции), 2) Google Sign-In,
  3) Email + magic link като универсален fallback (без пароли)

### 2.4 Резултат
Създаден е `SPEC_MOBILE_AUTH.md` — **планов документ**, не executable task. Покрива:
Supabase Auth setup (providers, `user_profiles` таблица с RLS, auto-create trigger),
mobile integration (Zustand auth store, попълване на съществуващите stub auth екрани,
soft-gate UI pattern чрез bottom sheet prompt вместо fullscreen interruption), и план
за скритите статии (отделен gated API route с Bearer token проверка, препоръка за
нативно рендиране на съдържанието вместо authenticated WebView).

**Следваща стъпка, когато потребителят реши да продължи:** разделяне на
`SPEC_MOBILE_AUTH.md` на отделни executable task файлове (Phase 1-2: auth foundation;
Phase 3: скрити статии), вероятно с по-внимателно, поетапно изпълнение предвид
архитектурния риск.

---

## 3. Открити проблеми извън кода (за информация)

- Локален Windows dev environment проблем: `EPERM` грешка при writing в `.next\trace`
  + port conflict (3000→3003) при стартиране на Admin dev server. Решено с ръчни
  стъпки (kill orphaned Node процеси + изтриване на `.next` папка) — не е свързано с
  кода на проекта.
- Забелязан (но не поправен) leftover проблем в `next.config.mjs`: невалиден `api` key,
  остатък от стар Pages Router синтаксис, който App Router вече не разпознава. Не
  чупи нищо в момента, но трябва почистване в бъдещ polish task.

---

## 4. Статус на чакащи задачи (към края на сесията)

| Задача | Статус |
|---|---|
| TASK_FIX_HERO_IMAGE.md | Изпратена, после се появи regression — виж TASK_FIX_PHOTO_ROTATION_AND_HERO.md |
| TASK_WIRE_REMAINING_IMAGES.md | Изпратена |
| TASK_FIX_PHOTO_ROTATION_AND_HERO.md | Изпратена, чака изпълнение |
| TASK_SITE_BROWSE_ALL.md | Изпратена, чака изпълнение |
| TASK_BLOG_CATEGORIES.md | Изпратена, чака потребителя да добави Notion колона ръчно преди тест |
| TASK_MOBILE_BLOG_ACCESS.md | Изпратена, чака изпълнение |
| SPEC_MOBILE_AUTH.md | Планов документ само — не е executable, чака решение кога да започне изпълнение |

---

## 5. Препоръка за следваща сесия

Предвид обема чакащи задачи, препоръчително е да се изпълнят в реда:
1. Photo rotation + hero regression fix (малък, бърз)
2. Blog categories (изисква ръчна Notion стъпка от потребителя първо)
3. Browse-all страница
4. Mobile blog access (зависи концептуално от blog categories, но не технически —
   може паралелно)
5. Auth foundation (Stage A.1.5) — когато потребителят е готов да отдели фокус само
   за това, вероятно отделна сесия с Opus-class модел предвид риска
