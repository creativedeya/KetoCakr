# TASK B — Public View + Public API Routes

> Executor: Claude Code at `C:\Dev\KetoCakR\`.
> Read CLAUDE.md first for stack, hard rules, DB schema.
> This is STAGE B from ROADMAP.md — the zero-risk public backend layer.
> HARD RULE: ADD-ONLY. Never touch the mobile app's anon access to
> `ready_recipes`. Never REVOKE anything from anon. Existing functionality
> must never disappear.

---

## Цел
Изграждане на public showcase слой — един източник на истина (DB view) +
два API route-а върху него. Витрината (marketing site) и MCP сървърът после
четат само оттук. **Никога** steps / ingredients / quantities / cost на
публична повърхност.

Обхват на тази задача: САМО Phase 0 + Phase 1 (view + API routes).
НЕ прави MCP сървъра и НЕ прави marketing сайта — те са отделни задачи.

```
External agent ─▶ MCP server ─▶ public API route (service_role)
                                     └▶ public_ready_recipes (view)
Mobile app ─▶ anon key ─▶ ready_recipes (UNCHANGED)
Marketing site ─▶ public API route OR view via anon (showcase only)
```

---

## PHASE 0 — Investigation (НЕ пиши код още)

Изпълни тези заявки в Supabase SQL Editor и докладвай резултатите.
От тях зависят имената на колоните във view-то.

**0.1 — `dessert_types` колони (КРИТИЧНО)**
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'dessert_types' ORDER BY ordinal_position;
```
Memory казва, че таблицата ползва `name` (не `name_bg`). ПОТВЪРДИ.
- Ако има само `name` + `name_en` → използвай `dt.name AS dessert_type_name_bg,
  dt.name_en AS dessert_type_name_en` във view-то.
- Ако има `name_bg` + `name_en` → използвай тях.
- Докладвай реалните колони ПРЕДИ да продължиш.

**0.2 — `ready_recipes` колони (потвърди whitelist полетата съществуват)**
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'ready_recipes' ORDER BY ordinal_position;
```
Потвърди че съществуват ВСИЧКИ от whitelist-а долу. Ако някоя липсва или е
с друго име (напр. `image_url` вместо `hero_image_url`, или `servings`
вместо `total_servings`) — докладвай и НЕ гадай.

**0.3 — slug populated за публикуваните редове**
```sql
SELECT id, slug, status, published_at FROM ready_recipes
WHERE status = 'published' AND published_at IS NOT NULL;
```
- Ако някой публикуван ред има NULL slug → докладвай. НЕ генерирай slug-ове
  на сляпо (deep links зависят от тях, трябва да са уникални).

**0.4 — провери дали `public_ready_recipes` вече съществува**
```sql
SELECT viewname FROM pg_views WHERE viewname = 'public_ready_recipes';
```

**Спри тук. Докладвай 0.1–0.4. Чакай потвърждение преди Phase 1.**

---

## PHASE 1: Database view

**File:** `Supabase/migrations/10_public_ready_recipes_view.sql`

Базов вариант (коригирай имената на колоните според Phase 0):
```sql
-- Public showcase view. ONLY whitelisted columns. No steps/ingredients/cost.
CREATE OR REPLACE VIEW public_ready_recipes AS
SELECT
  r.id, r.slug,
  r.name_en, r.name_bg,
  r.description_en, r.description_bg,
  r.hero_image_url,
  r.dessert_type_id,
  dt.name AS dessert_type_name,        -- adjust per Phase 0.1
  r.difficulty_level, r.is_free,
  r.total_servings, r.total_weight_grams,
  r.total_calories, r.total_protein, r.total_fat,
  r.total_carbs, r.total_net_carbs,
  r.tags, r.serving_container, r.published_at
FROM ready_recipes r
LEFT JOIN dessert_types dt ON dt.id = r.dessert_type_id
WHERE r.status = 'published'
  AND r.published_at IS NOT NULL;

GRANT SELECT ON public_ready_recipes TO anon, authenticated;
```

**Правила:**
- НЕ `REVOKE` нищо от anon на `ready_recipes`.
- Тези колони НЕ бива да попадат във view-то НИКОГА:
  `status`, `estimated_cost`, `cost_currency`, `selling_price`,
  `price_currency`, `cost_calculated_at`, `assembly_template_id`,
  `selected_components`, `custom_intro_text_bg/en`, `hero_image_reference_url`,
  `hero_image_prompt_notes`, `hero_image_corrections`, `serving_container_id`,
  `is_featured`, `created_at`, `updated_at`.

**Приложи миграцията в Supabase SQL Editor.**

**Acceptance Phase 1:**
```sql
SELECT * FROM public_ready_recipes LIMIT 1;
```
Връща САМО whitelisted колоните + `dessert_type_name` (или _bg/_en варианта).
Нула скрити колони.

---

## PHASE 2: Public API route (списък + търсене)

**File:** `Admin/app/api/public/recipes/route.ts`

Изисквания:
- `export const dynamic = 'force-dynamic'` (project rule).
- `SUPABASE_SERVICE_ROLE_KEY` (anon блокиран от RLS — established pattern).
- Чете `public_ready_recipes` САМО. Никога `ready_recipes`.
- Query params (всички optional): `query`, `dessert_type_id`, `max_net_carbs`,
  `is_free`, `limit` (default 20, cap 50), `offset` (default 0).
- Двуезично търсене: `name_en` ИЛИ `name_bg` (ilike).
- Инжектирай `app_url` на всеки ред: `https://ketocakelab.com/recipe/{slug}`.
- CORS headers + `OPTIONS` handler.
- Return shape: `{ results: [...], count, limit, offset }`.

```typescript
// Admin/app/api/public/recipes/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: cors });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const dessertTypeId = searchParams.get('dessert_type_id');
  const maxNetCarbs = searchParams.get('max_net_carbs');
  const isFree = searchParams.get('is_free');
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 50);
  const offset = Number(searchParams.get('offset') ?? 0);

  let q = supabase
    .from('public_ready_recipes')
    .select('*', { count: 'exact' });

  if (query) q = q.or(`name_en.ilike.%${query}%,name_bg.ilike.%${query}%`);
  if (dessertTypeId) q = q.eq('dessert_type_id', Number(dessertTypeId));
  if (maxNetCarbs) q = q.lte('total_net_carbs', Number(maxNetCarbs));
  if (isFree === 'true') q = q.eq('is_free', true);

  q = q.order('published_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await q;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: cors });
  }

  const results = (data ?? []).map((r) => ({
    ...r,
    app_url: `https://ketocakelab.com/recipe/${r.slug}`,
  }));

  return NextResponse.json({ results, count, limit, offset }, { headers: cors });
}
```

---

## PHASE 3: Single-recipe API route (за deep link + детайл страница)

**File:** `Admin/app/api/public/recipes/[slug]/route.ts`

Същият pattern:
- `export const dynamic = 'force-dynamic'`, service_role, CORS + OPTIONS.
- `.eq('slug', params.slug).single()` срещу `public_ready_recipes`.
- Връща един preview обект + `app_url`, или 404 ако няма.

```typescript
// Admin/app/api/public/recipes/[slug]/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: cors });
}

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { data, error } = await supabase
    .from('public_ready_recipes')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: cors });
  }

  return NextResponse.json(
    { ...data, app_url: `https://ketocakelab.com/recipe/${data.slug}` },
    { headers: cors }
  );
}
```

---

## Acceptance checklist (цялата задача)
- [ ] Phase 0 заявки докладвани; имената на колоните потвърдени.
- [ ] Migration 10 приложена; view връща само whitelisted колони (нула скрити).
- [ ] Mobile app още зарежда рецепти (anon достъп до `ready_recipes` непокътнат).
- [ ] `GET /api/public/recipes?max_net_carbs=5&limit=3` → ≤3 публикувани реда,
      всеки с `app_url`, без скрити колони.
- [ ] `GET /api/public/recipes?query=шоколад` → матчва български имена.
- [ ] `GET /api/public/recipes/<known-slug>` → една рецепта; непознат slug → 404.
- [ ] Никоя скрита колона (`selling_price`, `selected_components`, `status`,
      `estimated_cost` и т.н.) не е достижима през никой endpoint.
- [ ] Session report записан в `Admin/logs/`.

---

## Извън обхвата (НЕ прави в тази задача)
- MCP сървър (TASK_MCP_SERVER Phase 2–3) — отделна задача след съдържание.
- Marketing сайт (TASK_MARKETING_SITE) — отделна задача след съдържание.
- Deep links (TASK_DEEPLINK_EXPO) — последно, нужен е live сайт.
- Публикуване на рецепти — твоят ръчен workflow, паралелно.

---

## Session Start Template
```
Read CLAUDE.md and TASK_B_PUBLIC_VIEW_API.md.
Today's task: STAGE B — public view + public API routes (Phase 0 first).
Run Phase 0 investigation queries and report results.
Do NOT write code until I confirm the column names.
```
