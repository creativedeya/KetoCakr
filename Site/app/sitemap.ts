import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ketocakelab.com';

  let recipeEntries: MetadataRoute.Sitemap = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_PUBLIC_API_URL;
    const res = await fetch(`${apiUrl}/api/public/recipes?limit=50`);
    const { results } = await res.json();
    recipeEntries = (results ?? []).map((r: { slug: string; published_at: string }) => ({
      url: `${baseUrl}/recipe/${r.slug}`,
      lastModified: r.published_at,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));
  } catch {
    // return home only
  }

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    ...recipeEntries,
  ];
}
