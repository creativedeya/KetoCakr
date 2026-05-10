/**
 * Levenshtein distance-based string similarity.
 * Returns a score between 0 (no match) and 1 (exact match).
 */
export function similarity(a: string, b: string): number {
  const aLen = a.length;
  const bLen = b.length;
  if (aLen === 0 && bLen === 0) return 1;
  if (aLen === 0 || bLen === 0) return 0;

  // matrix[i][j] = edit distance between b[0..i] and a[0..j]
  const matrix: number[][] = [];
  for (let i = 0; i <= bLen; i++) matrix[i] = [i];
  for (let j = 0; j <= aLen; j++) matrix[0][j] = j;

  for (let i = 1; i <= bLen; i++) {
    for (let j = 1; j <= aLen; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitute
          matrix[i][j - 1] + 1,     // insert
          matrix[i - 1][j] + 1      // delete
        );
      }
    }
  }

  const distance = matrix[bLen][aLen];
  return 1 - distance / Math.max(aLen, bLen);
}

export interface IngredientMatch {
  id: string;
  name: string;
  score: number;
}

/**
 * Finds the top N matches for a search name against a list of ingredients.
 * Checks both name_bg and name_en, deduplicates by id (keeps best score).
 */
export function findBestMatches(
  searchName: string,
  ingredients: Array<{ id: string; name_bg: string; name_en: string }>,
  threshold = 0.5,
  topN = 3
): IngredientMatch[] {
  const normalized = searchName.toLowerCase().trim();

  // Score each ingredient against both language names, keep best score per id
  const bestByID = new Map<string, IngredientMatch>();

  for (const ing of ingredients) {
    const scoreBg = similarity(normalized, (ing.name_bg || '').toLowerCase().trim());
    const scoreEn = similarity(normalized, (ing.name_en || '').toLowerCase().trim());
    const bestScore = Math.max(scoreBg, scoreEn);
    const bestName = scoreBg >= scoreEn ? ing.name_bg : ing.name_en;

    const existing = bestByID.get(ing.id);
    if (!existing || bestScore > existing.score) {
      bestByID.set(ing.id, { id: ing.id, name: bestName, score: bestScore });
    }
  }

  return Array.from(bestByID.values())
    .filter((m) => m.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
