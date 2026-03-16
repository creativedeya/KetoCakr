// admin/lib/ingredientParser.ts

export interface ParsedIngredient {
  amount: number;
  unit: string;
  name: string;
  originalText: string;
  matchedIngredient?: {
    id: string;
    name_bg: string;
    name_en: string;
  };
}

export function parseIngredientsText(text: string): ParsedIngredient[] {
  if (!text.trim()) return [];

  // Split by comma or newline
  const lines = text
    .split(/[,\n]/)
    .map(l => l.trim())
    .filter(Boolean);

  const parsed: ParsedIngredient[] = [];

  for (const line of lines) {
    // Regex patterns
    // Pattern 1: "50 гр бадемово брашно"
    // Pattern 2: "6 бр яйца"
    // Pattern 3: "90 гр еритритол"
    
    const pattern = /^(\d+(?:[.,]\d+)?)\s*(гр|г|грама?|бр|броя?|мл|ml|ч\.?л\.?|с\.?л\.?|tsp|tbsp|cup|чаша?)\s+(.+)$/i;
    const match = line.match(pattern);

    if (match) {
      const [, amountStr, unit, name] = match;
      
      parsed.push({
        amount: parseFloat(amountStr.replace(',', '.')),
        unit: normalizeUnit(unit),
        name: name.trim(),
        originalText: line
      });
    } else {
      // Fallback: може би липсва количество
      console.warn('Could not parse:', line);
      parsed.push({
        amount: 0,
        unit: 'g',
        name: line,
        originalText: line
      });
    }
  }

  return parsed;
}

export function normalizeUnit(unit: string): string {
  const unitMap: Record<string, string> = {
    // Грамове
    'гр': 'g',
    'г': 'g',
    'грам': 'g',
    'грама': 'g',
    
    // Броя
    'бр': 'pcs',
    'брой': 'pcs',
    'броя': 'pcs',
    
    // Милилитри
    'мл': 'ml',
    
    // Лъжици
    'ч.л.': 'tsp',
    'чл': 'tsp',
    'ч.л': 'tsp',
    'tsp': 'tsp',
    
    'с.л.': 'tbsp',
    'сл': 'tbsp',
    'с.л': 'tbsp',
    'tbsp': 'tbsp',
    
    // Чаши
    'чаша': 'cup',
    'чаши': 'cup',
    'cup': 'cup'
  };

  const normalized = unitMap[unit.toLowerCase().trim()];
  return normalized || unit;
}

export async function matchIngredients(
  parsed: ParsedIngredient[],
  database: any[]
): Promise<ParsedIngredient[]> {
  return parsed.map(item => {
    const matched = findBestMatch(item.name, database);
    return {
      ...item,
      matchedIngredient: matched
    };
  });
}

function findBestMatch(searchText: string, database: any[]) {
  const lower = searchText.toLowerCase().trim();

  // 1. Exact match на name_bg
  let match = database.find(ing => 
    ing.name_bg?.toLowerCase() === lower
  );
  if (match) return match;

  // 2. Exact match на name_en
  match = database.find(ing => 
    ing.name_en?.toLowerCase() === lower
  );
  if (match) return match;

  // 3. Partial match на name_bg
  match = database.find(ing => 
    ing.name_bg?.toLowerCase().includes(lower) ||
    lower.includes(ing.name_bg?.toLowerCase())
  );
  if (match) return match;

  // 4. Aliases match
  match = database.find(ing => 
    ing.aliases?.some((alias: string) => 
      alias.toLowerCase().includes(lower) ||
      lower.includes(alias.toLowerCase())
    )
  );
  if (match) return match;

  return null;
}

export function parseInstructionsText(text: string): string[] {
  if (!text.trim()) return [];

  // Split by newline or numbered patterns
  return text
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      // Remove leading numbers like "1. ", "2) ", etc.
      return line.replace(/^\d+[\.\)]\s*/, '');
    });
}