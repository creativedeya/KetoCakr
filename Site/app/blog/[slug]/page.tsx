import { getBlogPosts, getBlogPost, getPageBlocks } from '@/lib/notion';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { NotionBlockRenderer } from '@/components/NotionBlockRenderer';

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const posts = await getBlogPosts();
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
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
      <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
        fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'var(--ruby)', textDecoration: 'none', marginBottom: 32 }}>
        ← All Posts
      </Link>
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
