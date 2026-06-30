'use client';
import { useState, useMemo } from 'react';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SearchBar } from './SearchBar';

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
  is_free: boolean;
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

export default function RecipeBrowser({ recipes }: { recipes: Recipe[] }) {
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState<string | null>(null);

  // Derive unique dessert types from recipe list (Option A — no backend change needed)
  // TODO: Switch to /api/public/dessert-types endpoint (Option B) if empty categories must be shown
  const dessertTypes = useMemo(() => {
    const seen = new Set<string>();
    return recipes
      .filter((r) => r.dessert_type_name_en)
      .reduce<string[]>((acc, r) => {
        if (!seen.has(r.dessert_type_name_en!)) {
          seen.add(r.dessert_type_name_en!);
          acc.push(r.dessert_type_name_en!);
        }
        return acc;
      }, []);
  }, [recipes]);

  const filtered = useMemo(() => {
    let result = recipes;
    if (activeType) {
      result = result.filter((r) => r.dessert_type_name_en === activeType);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (r) =>
          r.name_en.toLowerCase().includes(q) ||
          r.name_bg?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [recipes, query, activeType]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <SearchBar onSearch={setQuery} placeholder="Search recipes..." />
      </div>

      {dessertTypes.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
          <button onClick={() => setActiveType(null)} style={chipStyle(activeType === null)}>
            All
          </button>
          {dessertTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(activeType === type ? null : type)}
              style={chipStyle(activeType === type)}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {/* TODO: Add real pagination (offset param) once catalog exceeds ~50 recipes */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 32px',
            color: 'var(--text-3)',
            fontSize: 14,
          }}
        >
          No recipes match your search.
        </div>
      ) : (
        <div className="gallery-grid">
          {filtered.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      )}
    </div>
  );
}
