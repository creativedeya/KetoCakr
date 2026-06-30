'use client';
import { useState, useMemo } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { SearchBar } from './SearchBar';
import type { BlogPost } from '@/lib/notion';

function chipStyle(active: boolean): CSSProperties {
  return {
    padding: '8px 20px',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '.15em',
    textTransform: 'uppercase',
    border: '1px solid var(--cream-3)',
    background: active ? 'var(--ruby)' : 'var(--surface-card)',
    color: active ? '#fff' : 'var(--text-2)',
    cursor: 'pointer',
    transition: 'all .2s',
    fontFamily: 'var(--font-manrope), sans-serif',
  };
}

export default function BlogSearchPage({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(posts.map((p) => p.category).filter(Boolean))) as string[],
    [posts]
  );

  const filtered = useMemo(() => {
    let result = posts;
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.summary?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [posts, query, selectedCategory]);

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <SearchBar onSearch={setQuery} placeholder="Search posts..." />
      </div>

      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
          <button onClick={() => setSelectedCategory(null)} style={chipStyle(selectedCategory === null)}>
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              style={chipStyle(selectedCategory === cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <p style={{ color: 'var(--text-3)' }}>No posts yet. Check back soon.</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text-3)', padding: '40px 0' }}>
          No posts match your search.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 32,
          }}
        >
          {filtered.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <article
                style={{
                  background: 'var(--surface-card)',
                  padding: 32,
                  transition: 'background .3s',
                  cursor: 'pointer',
                }}
              >
                {post.cover && (
                  <img
                    src={post.cover}
                    alt={post.title}
                    style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      objectFit: 'cover',
                      marginBottom: 24,
                    }}
                  />
                )}
                {post.category && (
                  <span className="blog-category-badge">{post.category}</span>
                )}
                {post.date && (
                  <div className="lab-label" style={{ marginBottom: 8 }}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                )}
                <h2
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: 24,
                    fontWeight: 600,
                    marginBottom: 12,
                  }}
                >
                  {post.title}
                </h2>
                {post.summary && (
                  <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
                    {post.summary}
                  </p>
                )}
                <div
                  style={{
                    marginTop: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'var(--ruby)',
                  }}
                >
                  Read more →
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
