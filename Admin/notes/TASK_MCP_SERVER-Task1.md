# KetoCakR — MCP Server + Public API Task Spec

> Executor: Claude Code at local project path.
> Read CLAUDE.md first for stack, hard rules, DB schema, brand.
> HARD RULE: Never remove existing functionality. Do NOT touch the mobile
> app's anon access to `ready_recipes`. This task is ADD-ONLY.

---

## Goal
Expose the curated recipe catalog to external AI agents as a remote MCP
server, returning **preview/showcase data only** (name, macros, image,
deep-link). No steps, no ingredients, no quantities, no cost, no Puzzle
component data ever leaves this layer.

Two channels share ONE source of truth (a DB view):
1. Public API route (Next.js, admin panel) — consumed by the MCP server AND
   the marketing website (see TASK_MARKETING_SITE.md).
2. MCP server (standalone TypeScript) — calls the API route, never Supabase.

```
External AI agent ─▶ MCP server ─▶ public API route (service_role)
                                        └▶ public_ready_recipes (view)
Mobile app ─▶ anon key ─▶ ready_recipes (UNCHANGED, full access)
Marketing site ─▶ public API route OR view via anon (showcase only)
```

---

## PHASE 0: Database — the public view (source of truth)

**File:** `Supabase/migrations/10_public_ready_recipes_view.sql`

```sql
-- Public showcase view. ONLY whitelisted columns. No steps/ingredients/cost.
CREATE OR REPLACE VIEW public_ready_recipes AS
SELECT
  r.id, r.slug,
  r.name_en, r.name_bg,
  r.description_en, r.description_bg,
  r.hero_image_url,
  r.dessert_type_id,
  dt.name AS dessert_type_name,
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

**Rules / verification BEFORE running:**
- Do NOT `REVOKE` anything from `anon` on `ready_recipes`. Mobile depends on it.
- Verify `dessert_types` column for the localized name. Memory says it uses
  `name`. If it actually has `name_en`/`name_bg`, expose
  `dt.name_en AS dessert_type_name_en, dt.name_bg AS dessert_type_name_bg`
  instead and update the API route mapping. Query the real schema first:
  `SELECT column_name FROM information_schema.columns WHERE table_name='dessert_types';`
- Confirm `slug` is populated for all published rows (deep-links depend on it).
  If any published row has NULL slug, report it — do not generate slugs blindly.
- HIDDEN columns that must NEVER appear in the view: `status`, `estimated_cost`,
  `cost_currency`, `selling_price`, `price_currency`, `cost_calculated_at`,
  `assembly_template_id`, `selected_components`, `custom_intro_text_bg/en`,
  `hero_image_reference_url`, `hero_image_prompt_notes`, `hero_image_corrections`,
  `serving_container_id`, `is_featured`, `created_at`, `updated_at`.

**Acceptance:** `SELECT * FROM public_ready_recipes LIMIT 1;` returns only the
21 whitelisted columns + `dessert_type_name`.

---

## PHASE 1: Public API route (admin panel, Next.js App Router)

**File:** `Admin/app/api/public/recipes/route.ts`

Requirements:
- `export const dynamic = 'force-dynamic'` (prevent stale cache — project rule).
- Use `SUPABASE_SERVICE_ROLE_KEY` (established privileged-access pattern). The
  view is anon-safe, but routing the agent channel through service_role keeps
  agents fully off direct Supabase access.
- Reads `public_ready_recipes` ONLY. Never `ready_recipes`.
- Query params (all optional): `query`, `dessert_type_id`, `max_net_carbs`,
  `is_free`, `limit` (default 20, cap 50), `offset` (default 0, for pagination).
- Bilingual search: `name_en` OR `name_bg` (ilike).
- Inject `app_url` deep-link per row: `https://ketocakelab.com/recipe/{slug}`.
- Add permissive CORS headers so the marketing site / agents can call it:
  `Access-Control-Allow-Origin: *`, `GET, OPTIONS`. Add an `OPTIONS` handler.
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

Also add a single-recipe route for deep linking and the website detail page:

**File:** `Admin/app/api/public/recipes/[slug]/route.ts`
- Same pattern, `.eq('slug', params.slug).single()`, returns one preview object
  + `app_url`, or 404 if not found.

**Acceptance:**
- `GET /api/public/recipes?max_net_carbs=5&limit=3` returns ≤3 published rows,
  each with `app_url` and no hidden columns.
- `GET /api/public/recipes?query=шоколад` matches Bulgarian names.
- `GET /api/public/recipes/<known-slug>` returns one recipe; unknown slug → 404.

---

## PHASE 2: MCP server (standalone TypeScript)

**New project dir:** `mcp-server/` at repo root (sibling of Admin/ and Mobile/).
Server name: `ketocakr-mcp-server`. Transport: **Streamable HTTP, stateless
JSON** (remote server agents can reach). Provide stdio entry too for local test.

Use the MCP TypeScript SDK with **modern APIs only**:
`server.registerTool()` — NOT `server.tool()` or manual handlers.

### 2.1 Project setup
```
mcp-server/
├── package.json          # type: module; deps: @modelcontextprotocol/sdk, zod, express
├── tsconfig.json         # NodeNext, strict
├── README.md
└── src/
    ├── index.ts          # McpServer init + StreamableHTTP transport + express
    ├── constants.ts      # API_BASE_URL, default limits
    ├── services/api.ts    # fetch wrapper around the public API route
    └── tools/recipes.ts   # tool registrations
```
- `API_BASE_URL` from env (`KETOCAKR_API_BASE_URL`), default
  `https://admin.ketocakelab.com/api/public`.
- No Supabase client, no service keys in this project. It only does HTTP `fetch`
  against the public API route. Keep it dumb and stateless.

### 2.2 Tools (snake_case, service-prefixed, read-only)

**Tool A — `ketocakr_search_recipes`**
- Description (concise, agent-facing): "Search the KetoCakR catalog of curated
  keto desserts by name, dessert type, or max net carbs. Returns PREVIEW data
  only (name, macros, image, app link). Full recipe steps and ingredients are
  available only in the KetoCakR app — always give the user the app_url."
- Zod inputSchema:
  - `query` string optional, 2–200 chars, "search term (English or Bulgarian)"
  - `dessert_type_id` number int optional
  - `max_net_carbs` number optional, ">= 0, grams per serving"
  - `is_free` boolean optional
  - `limit` number int 1–50 default 10
- outputSchema: `{ results: [...], count }` with each result typed (id, slug,
  names, macros, dessert_type_name, hero_image_url, app_url).
- annotations: `readOnlyHint: true`, `openWorldHint: true`,
  `destructiveHint: false`, `idempotentHint: true`.
- Handler: call `GET {API_BASE_URL}/recipes?...`; return BOTH
  `content:[{type:'text', text: JSON.stringify(output)}]` and
  `structuredContent: output`.

**Tool B — `ketocakr_get_recipe`**
- Description: "Get preview details for one KetoCakR recipe by slug. Returns
  macros, image, and the app_url where the full recipe can be opened. Does not
  return cooking steps or ingredient quantities."
- inputSchema: `{ slug: z.string().min(1) }`
- Handler: `GET {API_BASE_URL}/recipes/{slug}`; 404 → actionable error message:
  "No published recipe with that slug. Use ketocakr_search_recipes to find valid
  slugs."
- Same read-only annotations.

### 2.3 Guardrails baked into descriptions
Every tool description must state plainly that this is preview-only data and the
agent should direct the user to `app_url` for the full recipe. This is both UX
(drives traffic back to the app) and a soft signal that the value lives in-app.

### 2.4 Error handling
- Wrap fetch in try/catch; on network/5xx return a text error block with a clear
  next step, not a thrown exception.
- Validate inputs via Zod (SDK does this automatically from inputSchema).

---

## PHASE 3: Build, test, document

- `npm run build` in `mcp-server/` must compile clean (strict TS).
- Manual test of API route locally against the deployed/staging Supabase.
- MCP Inspector: `npx @modelcontextprotocol/inspector` → load the server →
  call both tools → confirm structuredContent returns and NO hidden field
  (cost/components/status) appears anywhere.
- `mcp-server/README.md`: how to run (stdio + HTTP), env vars, the two tools,
  and an explicit note: "Returns showcase data only by design."

---

## Final acceptance checklist
- [ ] Migration 10 applied; view returns only whitelisted columns.
- [ ] Mobile app still loads recipes (anon access to `ready_recipes` untouched).
- [ ] `/api/public/recipes` + `/[slug]` live, CORS works, deep-links present.
- [ ] No hidden column (`selling_price`, `selected_components`, `status`,
      `estimated_cost`, etc.) reachable through any public endpoint or tool.
- [ ] MCP server builds, both tools work in Inspector, return structuredContent.
- [ ] Session report saved to `Admin/logs/`.
