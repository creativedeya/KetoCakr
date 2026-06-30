import Image from 'next/image';
import WaitlistForm from '@/components/WaitlistForm';
import FaqAccordion from '@/components/FaqAccordion';
import RecipeGallery from '@/components/RecipeGallery';
import { getBlogPosts, type BlogPost } from '@/lib/notion';

export const revalidate = 300;

async function getRecipes() {
  try {
    const url = process.env.NEXT_PUBLIC_PUBLIC_API_URL;
    const res = await fetch(`${url}/api/public/recipes?limit=6`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const { results } = await res.json();
    return results ?? [];
  } catch {
    return [];
  }
}

async function getLatestBlogPosts(): Promise<BlogPost[]> {
  try {
    const posts = await getBlogPosts();
    return posts.slice(0, 2);
  } catch {
    return [];
  }
}

export default async function Home() {
  const recipes = await getRecipes();
  const blogPosts = await getLatestBlogPosts();

  return (
    <>
      {/* NAV */}
      <nav>
        <div className="nav-inner">
          <div className="nav-logo">
            <Image src="/logo.png" alt="KetoCake Lab" height={32} width={120} style={{ height: 32, width: 'auto' }} />
          </div>
          <div className="nav-links">
            <a href="#modules">The Laboratory</a>
            <a href="#philosophy">Philosophy</a>
            <a href="#journal">Journal</a>
            <a href="/blog">Blog</a>
          </div>
          <a href="#waitlist" className="nav-cta">🚀 Get Early Access</a>
        </div>
        <div className="nav-line" />
      </nav>

      {/* HERO */}
      <section className="hero" id="top">
        <div className="hero-grid">
          <div className="fu">
            <div className="lab-label fu fu1" style={{ marginBottom: 20 }}>The Science of Sweetness</div>
            <h1 className="fu fu2">
              Beautiful keto desserts,<br />
              <em>built like a <span className="ruby">puzzle.</span></em>
            </h1>
            <p className="hero-sub fu fu3">
              At KetoCake Lab, we decode the chemistry of indulgence. Every component is precision-engineered
              for metabolic harmony — so you can build the keto dessert of your dreams without leaving ketosis.
            </p>
            <div className="fu fu4">
              <WaitlistForm variant="hero" />
            </div>
          </div>
          <div className="hero-img-wrap fu fu5">
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1', overflow: 'hidden' }}>
              <Image
                src="https://bvnmsiritbqypnnxadnl.supabase.co/storage/v1/object/public/Site%20KetoCakeLab/e4c8db18-7215-41ca-bc37-212efcca4bb7.jpg"
                alt="Velvet Alchemy keto cake, layered with cream and edible flowers"
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
            <div className="hero-card">
              <span className="lab-label">Spec No. 04</span>
              <div className="hero-card-title">Velvet Alchemy</div>
              <div className="hero-card-line" />
              <div className="hero-card-stat">
                <span>Net Carbs</span>
                <span>4.2g</span>
              </div>
            </div>
            <div className="hero-deco" />
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className="section-bg" id="modules">
        <div className="section-inner">
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 36, marginBottom: 12 }}>
              The Laboratory Logic
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-2)', maxWidth: 500, lineHeight: 1.7 }}>
              Every dessert is an equation. Choose your modules to build your perfect metabolic profile.
            </p>
          </div>
          <div className="modules">
            {[
              {
                num: '01', name: 'The Base Layer',
                image: 'https://bvnmsiritbqypnnxadnl.supabase.co/storage/v1/object/public/Site%20KetoCakeLab/Base.jpg',
                desc: 'Almond sponge, brownie, or shortbread — structural foundations designed for crunch and density.',
                items: [['Almond Sponge', true], ['Brownie Base', false], ['Shortbread Crust', false]],
              },
              {
                num: '02', name: 'The Cream',
                image: 'https://bvnmsiritbqypnnxadnl.supabase.co/storage/v1/object/public/Site%20KetoCakeLab/Frosting.jpg',
                desc: 'Aerated mascarpone silks and ganache that define the palate\'s weight and richness.',
                items: [['Mascarpone Silk', true], ['Chocolate Ganache', false], ['Coconut Whip', false]],
              },
              {
                num: '03', name: 'The Core',
                image: 'https://bvnmsiritbqypnnxadnl.supabase.co/storage/v1/object/public/Site%20KetoCakeLab/Filling.jpg',
                desc: 'Concentrated essence — molecular fruit reductions and sugar-free caramels.',
                items: [['Raspberry Reduction', true], ['Lemon Curd', false], ['Salted Caramel', false]],
              },
              {
                num: '04', name: 'The Finish',
                image: 'https://bvnmsiritbqypnnxadnl.supabase.co/storage/v1/object/public/Site%20KetoCakeLab/cake.jpg',
                desc: 'Final chromatic elements and micro-textures. Berries, tempered shards, botanical dust.',
                items: [['Fresh Berries', true], ['Chocolate Shavings', false], ['Gold Dust', false]],
              },
            ].map((m) => (
              <div key={m.num} className="module">
                <div className="module-head">
                  <span className="lab-label">Module {m.num}</span>
                </div>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1', marginBottom: 16, overflow: 'hidden' }}>
                  <Image src={m.image} alt={m.name} fill style={{ objectFit: 'cover' }} />
                </div>
                <h3>{m.name}</h3>
                <p>{m.desc}</p>
                <ul className="module-list">
                  {(m.items as [string, boolean][]).map(([label, active]) => (
                    <li key={label}>
                      <span className={`dot${active ? '' : ' dim'}`} />
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="combo-text">625 Possible Combinations</div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <div style={{ marginBottom: 48 }}>
          <div className="lab-label" style={{ marginBottom: 10 }}>The Process</div>
          <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 32, marginBottom: 12 }}>
            From Ingredients to Masterpiece
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-2)', maxWidth: 500, lineHeight: 1.7 }}>
            Three steps to your perfect keto dessert.
          </p>
        </div>
        <div className="how-it-works-steps">
          {[
            { num: '01', title: 'Choose Your Dessert Type', text: 'Cake, cheesecake, tart, mousse — pick your canvas.' },
            { num: '02', title: 'Combine Components', text: 'Mix and match crusts, creams, fillings, and decorations. The app calculates everything.' },
            { num: '03', title: 'Get Exact Macros', text: 'Calories, protein, fat, and net carbs per serving — precise to the gram.' },
          ].map((s) => (
            <div key={s.num} className="how-step">
              <div className="how-step-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RECIPE GALLERY */}
      <RecipeGallery recipes={recipes} />

      {/* WHY JOIN */}
      <section className="section">
        <div style={{ marginBottom: 32 }}>
          <div className="lab-label" style={{ marginBottom: 10 }}>Why Get Early Access</div>
          <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 32, fontStyle: 'italic' }}>
            Every layer optimized for keto.
          </h2>
        </div>
        <div className="benefits">
          {[
            { n: '01', title: 'Early Access', desc: 'Be the first to use KetoCake Lab when it launches. Before anyone else.' },
            { n: '02', title: 'Shape the Product', desc: 'Your feedback as a beta tester directly influences features and components.' },
            { n: '03', title: 'Free Cheat Sheet', desc: 'Get the Keto Baking Cheat Sheet instantly — sweetener conversions, flour ratios, binding agents.' },
          ].map((b) => (
            <div key={b.n} className="benefit">
              <div className="lab-label lab-label-ruby" style={{ marginBottom: 16 }}>{b.n}</div>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PHILOSOPHY / QUOTE */}
      <section
        id="philosophy"
        style={{ background: 'var(--ruby)', padding: '100px 32px', position: 'relative', overflow: 'hidden' }}
      >
        <div className="philosophy-inner" style={{ maxWidth: 1060, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 48, alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 72, color: 'rgba(255,177,192,.25)', lineHeight: 1, marginBottom: 16 }}>&ldquo;</div>
            <div style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 'clamp(20px,2.8vw,32px)', fontStyle: 'italic', fontWeight: 400, lineHeight: 1.5, color: '#fff', marginBottom: 28 }}>
              Mathematics isn&apos;t just for textbooks — it&apos;s the silent architecture of flavor. By solving the metabolic equation, we free the palate to experience sweetness in its purest form.
            </div>
            <div style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 20, fontWeight: 700, color: '#fff' }}>Deyana</div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase', color: 'rgba(255,177,192,.6)', marginTop: 4 }}>
              Keto Pastry Chef · Creator of KetoCake Lab
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <div style={{ position: 'relative', width: 280, height: 360, borderRadius: '4px 24px 4px 24px', overflow: 'hidden' }}>
              <Image
                src="https://bvnmsiritbqypnnxadnl.supabase.co/storage/v1/object/public/Site%20KetoCakeLab/Deyana.jpg"
                alt="Deyana, founder of KetoCake Lab"
                fill
                style={{ objectFit: 'cover', transform: 'rotate(90deg) scale(1.286)', transformOrigin: 'center' }}
              />
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: -200, left: -200, width: 400, height: 400, border: '1px solid rgba(255,177,192,.08)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: -200, right: -200, width: 400, height: 400, border: '1px solid rgba(255,177,192,.08)', borderRadius: '50%' }} />
      </section>

      {/* JOURNAL / CHEAT SHEET */}
      <section className="section" id="journal">
        <div className="journal">
          <div>
            <div className="lab-label" style={{ marginBottom: 10 }}>The Alchemist&apos;s Journal</div>
            <h2>Keto Baking Cheat Sheet</h2>
            <p>A technical guide to natural sweeteners, molecular flour substitutions, and the 10 rules every keto baker needs. Free with your waitlist signup.</p>
          </div>
          <div>
            <WaitlistForm variant="journal" />
          </div>
        </div>
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 900, aspectRatio: '16/9', margin: '0 auto', borderRadius: 4, overflow: 'hidden' }}>
            <Image
              src="https://bvnmsiritbqypnnxadnl.supabase.co/storage/v1/object/public/Site%20KetoCakeLab/F670AEED-A95C-471C-8698-CBC0E3B48CEF.jpg"
              alt="Keto Baking Cheat Sheet preview"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          <p style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 16, fontStyle: 'italic', color: 'var(--text-3)', marginTop: 16 }}>
            Your next keto masterpiece is a few clicks away.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{ borderTop: '1px solid rgba(231,226,217,.3)' }}>
        <div style={{ marginBottom: 40 }}>
          <div className="lab-label" style={{ marginBottom: 10 }}>Assistance</div>
          <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 32 }}>Queries from the Lab</h2>
        </div>
        <FaqAccordion />
      </section>

      {/* FROM THE BLOG */}
      {blogPosts.length > 0 && (
        <section className="section" style={{ borderTop: '1px solid rgba(231,226,217,.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="lab-label" style={{ marginBottom: 10 }}>From the Blog</div>
              <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 32 }}>Keto Baking Intelligence</h2>
            </div>
            <a href="/blog" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ruby)', textDecoration: 'none', whiteSpace: 'nowrap' }}>View all posts →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32 }}>
            {blogPosts.map((post) => (
              <a key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: 'var(--surface-card)', padding: 32, height: '100%' }}>
                  {post.cover && <img src={post.cover} alt={post.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', marginBottom: 20 }} />}
                  {post.category && <span className="blog-category-badge">{post.category}</span>}
                  {post.date && <div className="lab-label" style={{ marginBottom: 8 }}>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>}
                  <h3 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 22, fontWeight: 600, marginBottom: 12 }}>{post.title}</h3>
                  {post.summary && <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>{post.summary}</p>}
                  <div style={{ marginTop: 20, fontSize: 11, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ruby)' }}>Read more →</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="nav-logo">
            <Image src="/logo.png" alt="KetoCake Lab" height={36} width={135} style={{ height: 36, width: 'auto' }} />
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="https://www.instagram.com/ketocakelab/" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.tiktok.com/@ketocakelab" target="_blank" rel="noopener noreferrer">TikTok</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>
          <div className="footer-copy">© 2026 KetoCake Lab. The Gastronomic Alchemist.</div>
        </div>
      </footer>

      {/* FLOATING MOBILE CTA */}
      <div className="fcta">
        <a href="#waitlist">Get Early Access — Free</a>
      </div>
    </>
  );
}
