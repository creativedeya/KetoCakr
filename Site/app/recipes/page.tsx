import Image from 'next/image';
import Link from 'next/link';
import RecipeBrowser from '@/components/RecipeBrowser';

export const revalidate = 300;

export const metadata = {
  title: 'All Recipes — KetoCake Lab',
  description: 'Browse the full collection of keto dessert recipes.',
};

async function getAllRecipes() {
  try {
    const url = process.env.NEXT_PUBLIC_PUBLIC_API_URL;
    const res = await fetch(`${url}/api/public/recipes?limit=50`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const { results } = await res.json();
    return results ?? [];
  } catch {
    return [];
  }
}

export default async function RecipesPage() {
  const recipes = await getAllRecipes();

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'rgba(254,249,240,.85)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="nav-inner">
          <a href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
            <Image
              src="/logo.png"
              alt="KetoCake Lab"
              height={32}
              width={120}
              style={{ height: 32, width: 'auto' }}
            />
          </a>
          <div className="nav-links">
            <a href="/blog">Blog</a>
          </div>
          <a href="/#waitlist" className="nav-cta">
            Get Early Access
          </a>
        </div>
        <div className="nav-line" />
      </nav>

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
            The Full Collection
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(32px,5vw,56px)',
              fontWeight: 400,
              marginBottom: 8,
            }}
          >
            All Recipes
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-2)', marginTop: 12, maxWidth: 520 }}>
            Search or filter by dessert type.
          </p>
        </div>

        <RecipeBrowser recipes={recipes} />
      </main>

      <footer>
        <div className="footer-inner">
          <a href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
            <Image
              src="/logo.png"
              alt="KetoCake Lab"
              height={36}
              width={135}
              style={{ height: 36, width: 'auto' }}
            />
          </a>
          <div className="footer-copy">© 2026 KetoCake Lab</div>
        </div>
      </footer>
    </>
  );
}
