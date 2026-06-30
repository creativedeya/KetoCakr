import { getBlogPosts } from '@/lib/notion';
import Link from 'next/link';
import BlogSearchPage from '@/components/BlogSearchPage';

export const revalidate = 300;

export const metadata = {
  title: 'Blog — KetoCake Lab',
  description: 'Keto baking tips, ingredient deep-dives, and app updates from the KetoCake Lab.',
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 32px 80px' }}>
      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--ruby)',
          textDecoration: 'none',
          marginBottom: 32,
        }}
      >
        ← Home
      </Link>
      <div style={{ marginBottom: 48 }}>
        <div className="lab-label" style={{ marginBottom: 10 }}>
          From the Lab
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(32px,5vw,56px)',
            fontWeight: 400,
          }}
        >
          Keto Baking Intelligence
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-2)', marginTop: 12, maxWidth: 520 }}>
          Ingredient science, recipe tips, and updates from the KetoCake Lab.
        </p>
      </div>

      <BlogSearchPage posts={posts} />
    </main>
  );
}
