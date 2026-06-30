# TASK — Notion Blog + How It Works Fix

> Executor: Claude Code at `C:\Dev\KetoCakR\Site\`.
> Surgical edits only. Zero breaking changes. Existing functionality must not disappear.

---

## CHANGE 1 — Remove Icons from "How It Works" Section

**File:** `Site/app/page.tsx`

Find the "How it Works" / "The Process" section with 3 steps.
Remove all icons and emojis from the step cards.
Keep: step number, title, description text.
No other changes to layout or styling.

---

## CHANGE 2 — Notion Blog

### 2.1 Install dependency

```bash
cd Site
npm install @notionhq/client
```

### 2.2 Notion client utility

**File:** `Site/lib/notion.ts`

```typescript
import { Client } from '@notionhq/client';

export const notion = new Client({
  auth: process.env.NOTION_API_KEY!,
});

const DATABASE_ID = process.env.NOTION_BLOG_DATABASE_ID!;

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  date: string;
  cover: string | null;
  published: boolean;
};

export async function getBlogPosts(): Promise<BlogPost[]> {
  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: {
      property: 'Published',
      checkbox: { equals: true },
    },
    sorts: [{ property: 'Date', direction: 'descending' }],
  });

  return response.results.map((page: any) => ({
    id: page.id,
    slug: page.properties.Slug?.rich_text?.[0]?.plain_text ?? page.id,
    title: page.properties.Title?.title?.[0]?.plain_text ?? 'Untitled',
    summary: page.properties.Summary?.rich_text?.[0]?.plain_text ?? '',
    date: page.properties.Date?.date?.start ?? '',
    cover: page.cover?.external?.url ?? page.cover?.file?.url ?? null,
    published: page.properties.Published?.checkbox ?? false,
  }));
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getPageBlocks(pageId: string) {
  const response = await notion.blocks.children.list({ block_id: pageId });
  return response.results;
}
```

### 2.3 Blog index page

**File:** `Site/app/blog/page.tsx`

```typescript
import { getBlogPosts } from '@/lib/notion';
import Link from 'next/link';

export const revalidate = 300;

export const metadata = {
  title: 'Blog — KetoCake Lab',
  description: 'Keto baking tips, ingredient deep-dives, and app updates from the KetoCake Lab.',
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 32px 80px' }}>
      <div style={{ marginBottom: 48 }}>
        <div className="lab-label" style={{ marginBottom: 10 }}>From the Lab</div>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 400 }}>
          Keto Baking Intelligence
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-2)', marginTop: 12, maxWidth: 520 }}>
          Ingredient science, recipe tips, and updates from the KetoCake Lab.
        </p>
      </div>

      {posts.length === 0 ? (
        <p style={{ color: 'var(--text-3)' }}>No posts yet. Check back soon.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 32 }}>
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <article style={{
                background: 'var(--surface-card)',
                padding: 32,
                transition: 'background .3s',
                cursor: 'pointer',
              }}>
                {post.cover && (
                  <img src={post.cover} alt={post.title}
                    style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', marginBottom: 24 }} />
                )}
                {post.date && (
                  <div className="lab-label" style={{ marginBottom: 8 }}>
                    {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                )}
                <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 24, fontWeight: 600, marginBottom: 12 }}>
                  {post.title}
                </h2>
                {post.summary && (
                  <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>{post.summary}</p>
                )}
                <div style={{ marginTop: 20, fontSize: 12, fontWeight: 700, letterSpacing: '0.15em',
                  textTransform: 'uppercase', color: 'var(--ruby)' }}>
                  Read more →
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
```

### 2.4 Blog post page

**File:** `Site/app/blog/[slug]/page.tsx`

```typescript
import { getBlogPosts, getBlogPost, getPageBlocks } from '@/lib/notion';
import { notFound } from 'next/navigation';
import { NotionBlockRenderer } from '@/components/NotionBlockRenderer';

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);
  if (!post) return {};
  return {
    title: `${post.title} — KetoCake Lab Blog`,
    description: post.summary,
    openGraph: { title: post.title, description: post.summary, images: post.cover ? [post.cover] : [] },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);
  if (!post) notFound();

  const blocks = await getPageBlocks(post.id);

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '120px 32px 80px' }}>
      {post.cover && (
        <img src={post.cover} alt={post.title}
          style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', marginBottom: 40 }} />
      )}
      {post.date && (
        <div className="lab-label" style={{ marginBottom: 12 }}>
          {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      )}
      <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(28px,4vw,48px)',
        fontWeight: 400, marginBottom: 40, lineHeight: 1.15 }}>
        {post.title}
      </h1>
      <div style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-2)' }}>
        <NotionBlockRenderer blocks={blocks} />
      </div>
    </main>
  );
}
```

### 2.5 Notion Block Renderer component

**File:** `Site/components/NotionBlockRenderer.tsx`

Renders the most common Notion block types. Covers: paragraph, heading_1/2/3, bulleted_list_item, numbered_list_item, image, divider, quote.

```typescript
'use client';

export function NotionBlockRenderer({ blocks }: { blocks: any[] }) {
  return (
    <>
      {blocks.map((block) => {
        const { type, id } = block;
        const value = block[type];
        const text = value?.rich_text?.map((t: any) => t.plain_text).join('') ?? '';

        switch (type) {
          case 'paragraph':
            return <p key={id} style={{ marginBottom: 20 }}>{text}</p>;
          case 'heading_1':
            return <h2 key={id} style={{ fontFamily: 'var(--font-cormorant)', fontSize: 36,
              fontWeight: 600, margin: '40px 0 16px' }}>{text}</h2>;
          case 'heading_2':
            return <h3 key={id} style={{ fontFamily: 'var(--font-cormorant)', fontSize: 28,
              fontWeight: 600, margin: '32px 0 12px' }}>{text}</h3>;
          case 'heading_3':
            return <h4 key={id} style={{ fontSize: 18, fontWeight: 700,
              margin: '24px 0 8px', letterSpacing: '0.05em' }}>{text}</h4>;
          case 'bulleted_list_item':
            return <li key={id} style={{ marginBottom: 8, marginLeft: 20 }}>{text}</li>;
          case 'numbered_list_item':
            return <li key={id} style={{ marginBottom: 8, marginLeft: 20 }}>{text}</li>;
          case 'quote':
            return <blockquote key={id} style={{ borderLeft: '3px solid var(--ruby)',
              paddingLeft: 20, fontStyle: 'italic', color: 'var(--text-2)',
              margin: '24px 0' }}>{text}</blockquote>;
          case 'divider':
            return <hr key={id} style={{ border: 'none', borderTop: '1px solid var(--cream-3)',
              margin: '32px 0' }} />;
          case 'image':
            const src = value?.external?.url ?? value?.file?.url;
            return src ? <img key={id} src={src} alt=""
              style={{ width: '100%', borderRadius: 2, margin: '24px 0' }} /> : null;
          default:
            return null;
        }
      })}
    </>
  );
}
```

### 2.6 Add Blog link to Nav

**File:** `Site/app/layout.tsx` (or wherever nav links are)

Add `Blog` link in the navigation alongside existing links (Recipes, About etc.):

```tsx
<a href="/blog">Blog</a>
```

Same style as existing nav links.

### 2.7 Add Blog preview section to Home page

**File:** `Site/app/page.tsx`

At the bottom of the page, before the Footer, add a "From the Blog" section.
Fetch the latest 2 published posts and show them as cards.
Add "View all posts →" link to `/blog`.

If `posts.length === 0` → skip the section entirely (don't show empty state on home).

---

## CHANGE 3 — Env variables check

Confirm `Site/.env.local` contains:
```
NOTION_API_KEY=ntn_...
NOTION_BLOG_DATABASE_ID=381a9d34a056806d9ba4e313e176f263
```

If missing → add them and report.

---

## Acceptance Checklist

- [ ] Icons removed from "How it Works" steps.
- [ ] `npm install @notionhq/client` complete.
- [ ] `/blog` page loads (empty state if no published posts yet).
- [ ] Blog link appears in nav.
- [ ] "From the Blog" section appears on home page (or is hidden if 0 posts).
- [ ] `/blog/[slug]` renders Notion blocks correctly.
- [ ] OG tags generated per post.
- [ ] `npm run build` passes with zero errors.
- [ ] No existing sections removed or broken.

---

## Note on testing

To see blog posts: go to your Notion database, create a test entry, check the
**Published** checkbox, add a Slug (e.g. `test-post`), save.
Then restart the dev server and visit `/blog`.
ISR revalidates every 300s on prod — for local dev, restart server to see changes.
