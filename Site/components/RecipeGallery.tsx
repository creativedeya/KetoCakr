import Image from 'next/image';
import Link from 'next/link';

interface Recipe {
  id: string;
  slug: string;
  name_en: string;
  name_bg: string;
  hero_image_url: string | null;
  total_calories: number | null;
  total_net_carbs: number | null;
  total_servings: number | null;
  dessert_type_name_en: string | null;
  dessert_type_name_bg: string | null;
  is_free: boolean;
  app_url: string;
}

interface RecipeGalleryProps {
  recipes: Recipe[];
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const hasServings = (recipe.total_servings ?? 0) > 0;
  const perServing = (value: number | null) =>
    hasServings && value != null ? Math.round(value / recipe.total_servings!) : value;
  const calDisplay = perServing(recipe.total_calories);
  const carbsDisplay = perServing(recipe.total_net_carbs);
  const macroLabel = hasServings ? 'per serving' : 'total';

  return (
    <div className="recipe-card">
      <div className="recipe-card-img">
        {recipe.hero_image_url ? (
          <Image
            src={recipe.hero_image_url}
            alt={recipe.name_en}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
          />
        ) : null}
        {recipe.dessert_type_name_en && (
          <span className="recipe-card-type">{recipe.dessert_type_name_en}</span>
        )}
        {recipe.is_free && <span className="recipe-card-free">Free</span>}
      </div>
      <div className="recipe-card-body">
        <div className="recipe-card-name">{recipe.name_en}</div>
        {recipe.name_bg && <div className="recipe-card-sub">{recipe.name_bg}</div>}
        <div className="recipe-card-macros">
          {calDisplay != null && `${calDisplay} kcal`}
          {calDisplay != null && carbsDisplay != null && ' · '}
          {carbsDisplay != null && `${carbsDisplay}g net carbs`}
        </div>
        <div className="recipe-card-macro-label">{macroLabel}</div>
        <Link href={`/recipe/${recipe.slug}`} className="recipe-card-cta">
          View Recipe →
        </Link>
      </div>
    </div>
  );
}

export default function RecipeGallery({ recipes }: RecipeGalleryProps) {
  if (!recipes.length) return null;

  return (
    <section className="gallery-section">
      <div className="lab-label" style={{ marginBottom: '10px' }}>From the Lab</div>
      <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 'clamp(28px,4vw,40px)', marginBottom: '8px' }}>
        Ready to Eat. Macro-Perfect.
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-2)', maxWidth: '500px', lineHeight: 1.7 }}>
        Explore our keto dessert collection — free recipes inside.
      </p>
      <div className="gallery-grid">
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <Link href="/recipes" className="nav-cta" style={{ display: 'inline-block' }}>
          See All Recipes →
        </Link>
      </div>
    </section>
  );
}
