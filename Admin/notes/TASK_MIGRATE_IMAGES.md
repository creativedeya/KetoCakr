# TASK — Migrate Base64 Images to Supabase Storage

> Executor: Claude Code at `C:\Dev\KetoCakR\Site\`.
> Goal: replace inline base64 image data with real Supabase Storage URLs + next/image.
> Surgical, no visual regressions — same images, same positions, just lighter and faster.

---

## Problem

The original landing page (`ketocakelab-landing.html`) embeds images as base64 data URIs
directly in `<img src="data:image/...">` tags. When the Site was scaffolded, these were
carried over as-is into the React components. This causes:
- Massive component file sizes (each image is tens/hundreds of KB of text)
- No browser caching (base64 re-downloads on every page load as part of the HTML/JS)
- No Next.js Image optimization (resizing, lazy loading, WebP conversion)
- Slower build times and larger JS bundles

---

## PHASE 1 — Investigation

**1.1 — Find every base64 image in the Site codebase:**
```bash
grep -rl "data:image" Site/app Site/components
```
Report which files contain them and roughly how many images per file.

**1.2 — Check Supabase Storage buckets:**
List existing buckets and confirm whether a bucket for landing/marketing assets exists.
```sql
SELECT * FROM storage.buckets;
```
If no suitable bucket exists, plan to create one named `landing-assets` (public read).

**1.3 — Confirm Supabase credentials available to a one-off upload script:**
Check `Site/.env.local` (or `Admin/.env.local`) for `SUPABASE_SERVICE_ROLE_KEY` and
`NEXT_PUBLIC_SUPABASE_URL`. The upload script needs the service role key to write to
Storage (bypasses RLS, same established pattern as the rest of the project).

**Report findings before proceeding to Phase 2.**

---

## PHASE 2 — Create the `landing-assets` bucket (if missing)

```sql
-- Run in Supabase SQL editor, or via dashboard UI
insert into storage.buckets (id, name, public)
values ('landing-assets', 'landing-assets', true)
on conflict (id) do nothing;
```

Confirm public read access is enabled (anon can GET objects).

---

## PHASE 3 — Extraction + upload script

Write a one-off Node.js script (`Site/scripts/migrate-base64-images.mjs`) that:

1. Scans the target files (from Phase 1.1) for `data:image/(png|jpeg|jpg|webp);base64,...` patterns.
2. For each match:
   - Decodes the base64 into a Buffer.
   - Generates a stable filename: a short hash of the base64 content + correct extension
     (e.g. `hero-a1b2c3d4.jpg`) so re-running the script is idempotent (skips if already uploaded).
   - Uploads the buffer to the `landing-assets` bucket via `@supabase/supabase-js`
     `storage.from('landing-assets').upload(filename, buffer, { contentType, upsert: true })`.
   - Records the public URL: `storage.from('landing-assets').getPublicUrl(filename)`.
3. Replaces the base64 string in the source file with the public URL.
4. Writes a summary log: how many images replaced, total bytes saved, per file.

```javascript
// Site/scripts/migrate-base64-images.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { glob } from 'glob';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET = 'landing-assets';
const files = await glob('app/**/*.tsx', { cwd: process.cwd() });
// ... regex match data:image/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)
// ... for each match: hash -> upload -> getPublicUrl -> string replace
// ... writeFileSync back to the same file
// ... log summary
```

**Run it:**
```bash
cd Site
node scripts/migrate-base64-images.mjs
```

---

## PHASE 4 — Switch `<img>` to `next/image`

After URLs replace the base64 strings, convert plain `<img>` tags carrying these images to
Next.js `<Image>` for automatic optimization:

```tsx
import Image from 'next/image';

<Image
  src="https://<project>.supabase.co/storage/v1/object/public/landing-assets/hero-a1b2c3d4.jpg"
  alt="..."
  width={...}
  height={...}
  className="..."
/>
```

Preserve existing `alt` text, classNames, and dimensions/aspect-ratio as closely as the
original markup implies. If exact width/height aren't obtainable, use `fill` with a
positioned parent (match current CSS) rather than guessing wrong dimensions.

Add the Supabase Storage hostname to `next.config.js` `images.remotePatterns`:
```javascript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '<project-ref>.supabase.co', pathname: '/storage/v1/object/public/**' },
  ],
},
```

---

## Acceptance Checklist

- [ ] Phase 1 investigation reported: files + image count + bucket status.
- [ ] `landing-assets` bucket exists, public read confirmed.
- [ ] Migration script run successfully; summary log shows N images uploaded, 0 errors.
- [ ] No `data:image` strings remain in `Site/app` or `Site/components` (`grep -rl "data:image"` returns nothing).
- [ ] All affected `<img>` tags converted to `next/image` with correct `alt`, sizing.
- [ ] `next.config.js` updated with Supabase remote pattern.
- [ ] `npm run build` passes, zero errors.
- [ ] Visual check: every image still renders in the same position, same size, on `/`.
- [ ] Site bundle size reduced (note before/after `.next` build output size if visible).

---

## Note

Do not delete the original landing HTML file — it stays as historical reference only,
untouched.
