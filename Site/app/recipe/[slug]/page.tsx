import type { Metadata } from 'next';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

interface RecipeDetail {
  id: string;
  slug: string;
  name_en: string;
  name_bg: string;
  description_en: string | null;
  description_bg: string | null;
  hero_image_url: string | null;
  dessert_type_name_en: string | null;
  total_calories: number | null;
  total_net_carbs: number | null;
  total_protein: number | null;
  total_fat: number | null;
  total_servings: number | null;
  is_free: boolean;
  app_url: string;
}

async function getRecipe(slug: string): Promise<RecipeDetail | null> {
  try {
    const url = process.env.NEXT_PUBLIC_PUBLIC_API_URL;
    const res = await fetch(`${url}/api/public/recipes/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const url = process.env.NEXT_PUBLIC_PUBLIC_API_URL;
    const res = await fetch(`${url}/api/public/recipes?limit=50`);
    const { results } = await res.json();
    return (results ?? []).map((r: { slug: string }) => ({ slug: r.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const recipe = await getRecipe(params.slug);
  if (!recipe) return { title: 'Recipe Not Found | KetoCake Lab' };
  return {
    title: `${recipe.name_en} | KetoCake Lab`,
    description: recipe.description_en ?? `${recipe.name_en} — keto dessert recipe with exact macros.`,
    openGraph: {
      title: recipe.name_en,
      description: recipe.description_en ?? '',
      images: recipe.hero_image_url ? [{ url: recipe.hero_image_url }] : [],
      type: 'article',
    },
  };
}

export default async function RecipePage({ params }: { params: { slug: string } }) {
  const recipe = await getRecipe(params.slug);

  if (!recipe) {
    return (
      <div style={{ padding: '120px 32px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 36 }}>Recipe not found</h1>
        <a href="/" style={{ color: 'var(--ruby)', fontSize: 14 }}>← Back to KetoCake Lab</a>
      </div>
    );
  }

  const hasServings = (recipe.total_servings ?? 0) > 0;
  const ps = (v: number | null) =>
    hasServings && v != null ? Math.round(v / recipe.total_servings!) : v;
  const macroLabel = hasServings ? 'per serving' : 'total';

  return (
    <>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(254,249,240,.85)', backdropFilter: 'blur(16px)' }}>
        <div className="nav-inner">
          <a href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
            <Image src="/logo.png" alt="KetoCake Lab" height={32} width={120} style={{ height: 32, width: 'auto' }} />
          </a>
          <a href="/#waitlist" className="nav-cta">Get Early Access</a>
        </div>
        <div className="nav-line" />
      </nav>

      <main style={{ paddingTop: 100, maxWidth: 900, margin: '0 auto', padding: '100px 32px 80px' }}>
        {recipe.dessert_type_name_en && (
          <div className="lab-label" style={{ marginBottom: 12 }}>{recipe.dessert_type_name_en}</div>
        )}
        <h1 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 'clamp(36px,5vw,60px)', fontWeight: 400, lineHeight: 1.1, marginBottom: 8 }}>
          {recipe.name_en}
        </h1>
        {recipe.name_bg && (
          <p style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 20, fontStyle: 'italic', color: 'var(--text-3)', marginBottom: 32 }}>
            {recipe.name_bg}
          </p>
        )}

        {recipe.hero_image_url ? (
          <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', marginBottom: 40, overflow: 'hidden' }}>
            <Image
              src={recipe.hero_image_url}
              alt={recipe.name_en}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        ) : (
          <div style={{ width: '100%', aspectRatio: '4/3', background: 'var(--surface-card)', marginBottom: 40 }} />
        )}

        {/* Macros */}
        <div style={{ border: '1px solid var(--cream-3)', marginBottom: 40, background: 'var(--surface-card)' }}>
          <div style={{ padding: '8px 32px', borderBottom: '1px solid var(--cream-3)', textAlign: 'right' }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--text-3)' }}>{macroLabel}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, padding: 32 }}>
            {[
              { label: 'Calories', value: ps(recipe.total_calories), unit: 'kcal' },
              { label: 'Net Carbs', value: ps(recipe.total_net_carbs), unit: 'g' },
              { label: 'Protein', value: ps(recipe.total_protein), unit: 'g' },
              { label: 'Fat', value: ps(recipe.total_fat), unit: 'g' },
            ].map(({ label, value, unit }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 32, fontWeight: 700, color: 'var(--ruby)' }}>
                  {value != null ? value : '—'}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{unit}</div>
              </div>
            ))}
          </div>
        </div>

        {recipe.description_en && (
          <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-2)', marginBottom: 40 }}>{recipe.description_en}</p>
        )}

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '48px 32px', background: 'var(--surface-card)', border: '1px solid var(--cream-3)' }}>
          <div className="lab-label" style={{ marginBottom: 12 }}>Full Recipe</div>
          <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 28, marginBottom: 8 }}>
            Open in KetoCake Lab App
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24 }}>
            Step-by-step instructions, exact quantities, and assembly guide — all in the app.
          </p>
          <a
            href={`blagocake://recipe/${recipe.slug}`}
            style={{ display: 'inline-block', background: 'var(--ruby)', color: '#fff', padding: '14px 40px', fontSize: 11, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', textDecoration: 'none' }}
          >
            Open in App →
          </a>
          <div style={{ marginTop: 16, display: 'flex', gap: 16, justifyContent: 'center' }}>
            <a href="#" style={{ fontSize: 11, color: 'var(--text-3)' }}>App Store</a>
            <a href="#" style={{ fontSize: 11, color: 'var(--text-3)' }}>Google Play</a>
          </div>
        </div>
      </main>

      <footer>
        <div className="footer-inner">
          <a href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
            <Image src="/logo.png" alt="KetoCake Lab" height={36} width={135} style={{ height: 36, width: 'auto' }} />
          </a>
          <div className="footer-copy">© 2026 KetoCake Lab</div>
        </div>
      </footer>
    </>
  );
}
