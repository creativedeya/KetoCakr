

## 📝 **Содържание:**

Просто копирай този код в **Claude Code**:

```
"Създай файл Admin/utils/pdfParser.ts със следното съдържание:
[PASTE BELOW]"

```typescript
import pdfplumber from 'pdfplumber';
import { v4 as uuid } from 'uuid';

export interface ParsedRecipe {
  id: string;
  name: string;
  servings: number;
  cook_time_minutes: number;
  ingredients: string[];
  directions: string[];
  image_url: string;
  page_number: number;
}

export interface ParseResult {
  success: boolean;
  recipes: ParsedRecipe[];
  errors: string[];
  stats: {
    total: number;
    parsed: number;
    failed: number;
  };
}

/**
 * Parse PDF and extract recipes from Table of Contents strategy
 */
export async function parsePDFRecipes(filePath: string): Promise<ParseResult> {
  const recipes: ParsedRecipe[] = [];
  const errors: string[] = [];

  try {
    const pdf = await pdfplumber.open(filePath);
    console.log(`[PDF Parser] Total pages: ${pdf.pages.length}`);

    // STEP 1: Parse TOC from page 2
    if (pdf.pages.length < 2) {
      return {
        success: false,
        recipes: [],
        errors: ['PDF must have at least 2 pages (page 1 = cover, page 2 = TOC)'],
        stats: { total: 0, parsed: 0, failed: 0 },
      };
    }

    const page2 = pdf.pages[1];
    const tocText = await page2.extractText();

    if (!tocText) {
      return {
        success: false,
        recipes: [],
        errors: ['Could not extract text from page 2 (Table of Contents)'],
        stats: { total: 0, parsed: 0, failed: 0 },
      };
    }

    // Extract recipe names and page numbers from TOC
    const recipeTOC: Array<{ name: string; pageNum: number }> = [];
    const lines = tocText.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.length < 5) continue;

      // Pattern: "RECIPE NAME    PAGE_NUMBER"
      const match = trimmed.match(/(.+?)\s+(\d+)\s*$/);
      if (match) {
        const name = match[1].trim();
        const pageNum = parseInt(match[2], 10);

        // Filter: valid recipe name (not header/footer)
        if (
          name.length > 5 &&
          name.length < 100 &&
          pageNum >= 3 &&
          !name.toUpperCase().includes('ИСПАНСКА') &&
          !name.toUpperCase().includes('КЕТО')
        ) {
          recipeTOC.push({ name, pageNum });
        }
      }
    }

    console.log(`[PDF Parser] Found ${recipeTOC.length} recipes in TOC`);

    // STEP 2: Extract data from each recipe page
    for (const [idx, toc] of recipeTOC.entries()) {
      try {
        console.log(`[PDF Parser] Extracting recipe ${idx + 1}/${recipeTOC.length}: ${toc.name}`);

        const pageIndex = toc.pageNum - 1;
        if (pageIndex >= pdf.pages.length) {
          errors.push(`Page ${toc.pageNum} not found for recipe "${toc.name}"`);
          continue;
        }

        const recipePage = pdf.pages[pageIndex];
        const recipeText = await recipePage.extractText();

        if (!recipeText) {
          errors.push(`Could not extract text from page ${toc.pageNum} for "${toc.name}"`);
          continue;
        }

        // Parse recipe data
        const recipe = parseRecipePage(recipeText, toc.name, toc.pageNum);
        recipes.push(recipe);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        errors.push(`Error parsing "${toc.name}": ${errorMsg}`);
      }
    }

    await pdf.close();

    return {
      success: recipes.length > 0,
      recipes,
      errors,
      stats: {
        total: recipeTOC.length,
        parsed: recipes.length,
        failed: recipeTOC.length - recipes.length,
      },
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      recipes: [],
      errors: [`PDF parsing failed: ${errorMsg}`],
      stats: { total: 0, parsed: 0, failed: 0 },
    };
  }
}

/**
 * Parse individual recipe page
 */
function parseRecipePage(text: string, name: string, pageNum: number): ParsedRecipe {
  const recipe: ParsedRecipe = {
    id: uuid(),
    name: name.trim(),
    servings: 8,
    cook_time_minutes: 0,
    ingredients: [],
    directions: [],
    image_url: `https://via.placeholder.com/400x300?text=${encodeURIComponent(name)}`,
    page_number: pageNum,
  };

  const lines = text.split('\n');
  let inIngredients = false;
  let inDirections = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Servings
    if (/serving|portion|person|people|порция/i.test(trimmed)) {
      const match = trimmed.match(/(\d+)/);
      if (match) recipe.servings = parseInt(match[1], 10);
      inIngredients = false;
      inDirections = false;
      continue;
    }

    // Cook time
    if (/time|време|cook|min|minute/i.test(trimmed)) {
      const match = trimmed.match(/(\d+)/);
      if (match) recipe.cook_time_minutes = parseInt(match[1], 10);
      continue;
    }

    // Ingredients section
    if (/ingredient|съставк|product|продукт/i.test(trimmed)) {
      inIngredients = true;
      inDirections = false;
      continue;
    }

    // Directions section
    if (/direction|инструкц|приготв|step|стъп|method/i.test(trimmed)) {
      inIngredients = false;
      inDirections = true;
      continue;
    }

    // Add to section
    if (inIngredients && trimmed.length > 3 && !trimmed.startsWith('•')) {
      recipe.ingredients.push(trimmed);
    }

    if (inDirections && trimmed.length > 5 && !trimmed.match(/^\d+\s*$/)) {
      recipe.directions.push(trimmed);
    }
  }

  // Cleanup
  recipe.ingredients = [...new Set(recipe.ingredients)].filter((i) => i.length > 0);
  recipe.directions = [...new Set(recipe.directions)].filter((d) => d.length > 5);

  return recipe;
}
