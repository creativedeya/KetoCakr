# COMPLETE: Admin PDF Simple Recipe Importer

**Status:** CRITICAL - Full feature build  
**Timeline:** 4-6 hours  
**Priority:** HIGHEST  
**Objective:** One-click PDF upload → auto-parse → preview → execute SQL → import 79+ recipes

---

## ARCHITECTURE

```
┌─────────────────────────────────────┐
│   Admin Dashboard                   │
│   → PDF Recipe Importer             │
└──────────┬──────────────────────────┘
           │
    ┌──────┴──────┬──────────┬──────────┐
    ↓             ↓          ↓          ↓
  Upload       Parse      Preview    Execute
   PDF      (pdfplumber) (UI show)  (Supabase)
```

---

## FILES TO CREATE

```
Admin/
├─ components/
│  ├─ PDFRecipeImporter.tsx           (Main UI component)
│  ├─ PDFUploadZone.tsx               (Dropzone)
│  ├─ RecipePreview.tsx               (Preview cards)
│  └─ ImportProgress.tsx              (Progress bar)
├─ app/
│  ├─ api/
│  │  └─ pdf-import/
│  │     ├─ parse/route.ts            (Parse PDF endpoint)
│  │     └─ execute/route.ts          (Execute SQL endpoint)
│  └─ dashboard/
│     └─ pdf-importer/
│        └─ page.tsx                  (Dashboard page)
└─ utils/
   ├─ pdfParser.ts                    (PDF parsing logic)
   └─ sqlGenerator.ts                 (SQL generation)
```

---

## STEP-BY-STEP EXECUTION

### STEP 1: Create Utility - PDF Parser (60 min)

**File:** `Admin/utils/pdfParser.ts`

**ACTION:** Create new file:

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
    console.log(`[PDF] Total pages: ${pdf.pages.length}`);

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

    console.log(`[PDF] Found ${recipeTOC.length} recipes in TOC`);

    // STEP 2: Extract data from each recipe page
    for (const [idx, toc] of recipeTOC.entries()) {
      try {
        console.log(`[PDF] Extracting recipe ${idx + 1}/${recipeTOC.length}: ${toc.name}`);

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
```

**Checklist:**
- [ ] File created at `Admin/utils/pdfParser.ts`
- [ ] All functions exported
- [ ] Types defined
- [ ] No syntax errors

---

### STEP 2: Create Utility - SQL Generator (45 min)

**File:** `Admin/utils/sqlGenerator.ts`

**ACTION:** Create new file:

```typescript
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
  name_en?: string;
  ingredients_text_en?: string;
  directions_en?: string;
}

/**
 * Generate complete SQL for all 4 tables
 */
export function generateSQL(recipes: ParsedRecipe[]): string {
  const statements: string[] = [];

  statements.push('-- ================================================================');
  statements.push('-- PDF SIMPLE RECIPE IMPORT - Auto-Generated SQL');
  statements.push(`-- Generated: ${new Date().toISOString()}`);
  statements.push(`-- Recipes: ${recipes.length}`);
  statements.push('-- ================================================================\n');
  statements.push('BEGIN;\n');

  // TABLE 1: base_recipes
  statements.push('-- TABLE 1: Insert into base_recipes (is_simple_recipe=true)');
  statements.push('-- ================================================================\n');

  for (const recipe of recipes) {
    const nameBg = escapeSQL(recipe.name);
    const nameEn = escapeSQL(recipe.name_en || recipe.name);
    const ingredientsBg = escapeSQL(recipe.ingredients.join('\n'));
    const ingredientsEn = escapeSQL(recipe.ingredients_text_en || ingredientsBg);
    const directionsBg = escapeSQL(recipe.directions.join('\n'));
    const directionsEn = escapeSQL(recipe.directions_en || directionsBg);
    const imageUrl = escapeSQL(recipe.image_url);

    statements.push(`INSERT INTO base_recipes (
  id, name, name_en, servings, bake_time_minutes,
  ingredients_text_bg, ingredients_text_en,
  description, description_en,
  image_url, is_simple_recipe, is_visible_to_users, is_free,
  created_at, updated_at
) VALUES (
  '${recipe.id}',
  E'${nameBg}',
  E'${nameEn}',
  ${recipe.servings},
  ${recipe.cook_time_minutes},
  E'${ingredientsBg}',
  E'${ingredientsEn}',
  E'${directionsBg}',
  E'${directionsEn}',
  E'${imageUrl}',
  true, true, false,
  NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;\n`);
  }

  // TABLE 2: ready_recipes
  statements.push('-- TABLE 2: Insert into ready_recipes');
  statements.push('-- ================================================================\n');

  for (const recipe of recipes) {
    const nameBg = escapeSQL(recipe.name);
    const nameEn = escapeSQL(recipe.name_en || recipe.name);
    const imageUrl = escapeSQL(recipe.image_url);
    const readyRecipeId = uuid();

    statements.push(`INSERT INTO ready_recipes (
  id, base_recipe_id, name, name_en, image_url,
  created_at, updated_at
) VALUES (
  '${readyRecipeId}',
  '${recipe.id}',
  E'${nameBg}',
  E'${nameEn}',
  E'${imageUrl}',
  NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;\n`);
  }

  // TABLE 3: recipe_ingredients
  statements.push('-- TABLE 3: Insert into recipe_ingredients');
  statements.push('-- ================================================================\n');

  for (const recipe of recipes) {
    for (const [idx, ingredient] of recipe.ingredients.entries()) {
      const ingredientText = escapeSQL(ingredient);
      statements.push(`INSERT INTO recipe_ingredients (
  id, recipe_id, ingredient_name_text, order_index, created_at
) VALUES (
  '${uuid()}',
  '${recipe.id}',
  E'${ingredientText}',
  ${idx},
  NOW()
) ON CONFLICT DO NOTHING;\n`);
    }
  }

  // TABLE 4: recipe_instruction_steps
  statements.push('-- TABLE 4: Insert into recipe_instruction_steps');
  statements.push('-- ================================================================\n');

  for (const recipe of recipes) {
    for (const [idx, direction] of recipe.directions.entries()) {
      const directionText = escapeSQL(direction);
      statements.push(`INSERT INTO recipe_instruction_steps (
  id, recipe_id, step_number, instruction, created_at
) VALUES (
  '${uuid()}',
  '${recipe.id}',
  ${idx + 1},
  E'${directionText}',
  NOW()
) ON CONFLICT DO NOTHING;\n`);
    }
  }

  statements.push('COMMIT;');

  return statements.join('\n');
}

/**
 * Escape SQL string
 */
function escapeSQL(str: string): string {
  return str.replace(/'/g, "''");
}
```

**Checklist:**
- [ ] File created at `Admin/utils/sqlGenerator.ts`
- [ ] All functions exported
- [ ] No syntax errors

---

### STEP 3: Create API Routes (90 min)

**File A:** `Admin/app/api/pdf-import/parse/route.ts`

**ACTION:** Create new file:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { parsePDFRecipes } from '@/utils/pdfParser';
import os from 'os';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Save file to temp directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = join(os.tmpdir(), `pdf-import-${Date.now()}.pdf`);

    await writeFile(tempPath, buffer);

    // Parse PDF
    const result = await parsePDFRecipes(tempPath);

    // Cleanup
    await unlink(tempPath);

    return NextResponse.json({
      success: result.success,
      recipes: result.recipes,
      stats: result.stats,
      errors: result.errors,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
```

**File B:** `Admin/app/api/pdf-import/execute/route.ts`

**ACTION:** Create new file:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRole);

export async function POST(request: NextRequest) {
  try {
    const { sql } = await request.json();

    if (!sql) {
      return NextResponse.json(
        { success: false, error: 'No SQL provided' },
        { status: 400 }
      );
    }

    // Execute SQL
    const { error } = await supabase.rpc('exec_sql', { sql_statement: sql });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'SQL executed successfully',
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
```

**Checklist:**
- [ ] Both files created
- [ ] Supabase client configured
- [ ] No syntax errors

---

### STEP 4: Create Frontend Components (120 min)

**File A:** `Admin/components/PDFUploadZone.tsx`

**ACTION:** Create new file:

```typescript
import { useCallback, useState } from 'react';

interface PDFUploadZoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export function PDFUploadZone({ onFileSelect, isLoading }: PDFUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        onFileSelect(e.target.files[0]);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition ${
        dragActive ? 'border-rose-500 bg-rose-50' : 'border-gray-300 bg-gray-50'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <input
        type="file"
        accept=".pdf"
        onChange={handleChange}
        disabled={isLoading}
        className="hidden"
        id="pdf-input"
      />

      <label htmlFor="pdf-input" className="block cursor-pointer">
        <div className="text-4xl mb-2">📄</div>
        <div className="font-medium text-gray-900">Drop PDF here or click to select</div>
        <div className="text-sm text-gray-500 mt-1">Supports Table of Contents format (page 2 = TOC)</div>
      </label>
    </div>
  );
}
```

**File B:** `Admin/components/RecipePreview.tsx`

**ACTION:** Create new file:

```typescript
interface Recipe {
  id: string;
  name: string;
  servings: number;
  cook_time_minutes: number;
  ingredients: string[];
  directions: string[];
}

interface RecipePreviewProps {
  recipes: Recipe[];
  maxDisplay?: number;
}

export function RecipePreview({ recipes, maxDisplay = 3 }: RecipePreviewProps) {
  const displayed = recipes.slice(0, maxDisplay);

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-900">
        Preview ({displayed.length} of {recipes.length})
      </h3>

      {displayed.map((recipe) => (
        <div key={recipe.id} className="bg-white border rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-gray-900">{recipe.name}</h4>
            <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded">
              {recipe.servings} servings
            </span>
          </div>

          <div className="text-sm text-gray-600 mb-2">
            ⏱️ {recipe.cook_time_minutes} min · 🥘 {recipe.ingredients.length} ingredients · 📝{' '}
            {recipe.directions.length} steps
          </div>

          <div className="text-xs text-gray-500">
            <p className="font-medium mb-1">Ingredients:</p>
            <p className="line-clamp-2">{recipe.ingredients.slice(0, 2).join(' • ')}</p>
          </div>
        </div>
      ))}

      {recipes.length > maxDisplay && (
        <div className="text-sm text-gray-500 italic">
          + {recipes.length - maxDisplay} more recipes...
        </div>
      )}
    </div>
  );
}
```

**File C:** `Admin/components/PDFRecipeImporter.tsx` (MAIN)

**ACTION:** Create new file:

```typescript
'use client';

import { useState } from 'react';
import { PDFUploadZone } from './PDFUploadZone';
import { RecipePreview } from './RecipePreview';
import { generateSQL } from '@/utils/sqlGenerator';

interface ParsedRecipe {
  id: string;
  name: string;
  servings: number;
  cook_time_minutes: number;
  ingredients: string[];
  directions: string[];
  image_url: string;
  page_number: number;
}

type Step = 'upload' | 'parsing' | 'preview' | 'executing' | 'complete';

export function PDFRecipeImporter() {
  const [step, setStep] = useState<Step>('upload');
  const [recipes, setRecipes] = useState<ParsedRecipe[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [sql, setSQL] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setStep('parsing');
    setMessage('Parsing PDF...');
    setErrors([]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/pdf-import/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        setErrors(data.errors || ['Parse failed']);
        setStep('upload');
        return;
      }

      setRecipes(data.recipes);
      setErrors(data.errors || []);

      // Generate SQL
      const generatedSQL = generateSQL(data.recipes);
      setSQL(generatedSQL);

      setMessage(`✅ Parsed ${data.stats.parsed} recipes`);
      setStep('preview');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setErrors([errorMsg]);
      setStep('upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteSQL = async () => {
    setIsLoading(true);
    setStep('executing');
    setMessage('Importing to database...');

    try {
      const res = await fetch('/api/pdf-import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql }),
      });

      const data = await res.json();

      if (!data.success) {
        setErrors([data.error]);
        setStep('preview');
        return;
      }

      setMessage(`✅ Successfully imported ${recipes.length} recipes!`);
      setStep('complete');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setErrors([errorMsg]);
      setStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📄 PDF Simple Recipe Importer</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload a Spanish Keto PDF with Table of Contents on page 2
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
          ['upload', 'parsing', 'preview', 'executing', 'complete'].indexOf(step) >= 0
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          1
        </div>
        <div className="text-gray-500">Upload</div>

        <div className="flex-1 h-px bg-gray-300"></div>

        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
          ['parsing', 'preview', 'executing', 'complete'].indexOf(step) >= 0
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          2
        </div>
        <div className="text-gray-500">Parse</div>

        <div className="flex-1 h-px bg-gray-300"></div>

        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
          ['preview', 'executing', 'complete'].indexOf(step) >= 0
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          3
        </div>
        <div className="text-gray-500">Preview</div>

        <div className="flex-1 h-px bg-gray-300"></div>

        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
          ['executing', 'complete'].indexOf(step) >= 0
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          4
        </div>
        <div className="text-gray-500">Import</div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-3 rounded-lg ${
          step === 'complete'
            ? 'bg-green-50 text-green-700'
            : isLoading
            ? 'bg-blue-50 text-blue-700'
            : 'bg-gray-50 text-gray-700'
        }`}>
          {message}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-900 mb-2">⚠️ Errors:</h3>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, idx) => (
              <li key={idx}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <PDFUploadZone onFileSelect={handleFileSelect} isLoading={isLoading} />
      )}

      {/* Step 2: Parsing */}
      {step === 'parsing' && (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="inline-block animate-spin">⏳</div>
            <p className="text-gray-600 mt-2">Parsing PDF...</p>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 'preview' && recipes.length > 0 && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 font-medium">
              ✅ Parsed {recipes.length} recipes from PDF
            </p>
          </div>

          <RecipePreview recipes={recipes} />

          <div className="bg-gray-50 border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">📝 SQL Ready ({sql.split('\n').length} lines):</p>
            <pre className="text-xs overflow-auto max-h-40 bg-white border rounded p-2 text-gray-600">
              {sql.substring(0, 300)}...
            </pre>
          </div>

          <button
            onClick={handleExecuteSQL}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {isLoading ? 'Importing...' : '✅ CONFIRM & IMPORT'}
          </button>

          <button
            onClick={() => {
              setStep('upload');
              setRecipes([]);
              setErrors([]);
            }}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Step 4: Complete */}
      {step === 'complete' && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-lg font-bold text-green-900 mb-1">Import Successful!</h3>
          <p className="text-green-700 mb-4">{recipes.length} recipes added to database</p>
          <button
            onClick={() => {
              setStep('upload');
              setRecipes([]);
              setErrors([]);
              setSQL('');
              setMessage('');
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Import Another PDF
          </button>
        </div>
      )}
    </div>
  );
}
```

**Checklist:**
- [ ] All 3 component files created
- [ ] State management correct
- [ ] All imports working
- [ ] No syntax errors

---

### STEP 5: Create Dashboard Page (30 min)

**File:** `Admin/app/dashboard/pdf-importer/page.tsx`

**ACTION:** Create new file:

```typescript
'use client';

import { PDFRecipeImporter } from '@/components/PDFRecipeImporter';

export default function PDFImporterPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <PDFRecipeImporter />
      </div>
    </div>
  );
}
```

**Checklist:**
- [ ] File created at correct path
- [ ] Component imported
- [ ] No syntax errors

---

### STEP 6: Update Navigation (10 min)

**File:** `Admin/components/Sidebar.tsx` (or wherever navigation is)

**ACTION:** Add link:

```typescript
<Link href="/dashboard/pdf-importer" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100">
  <span>📄</span>
  <span>PDF Importer</span>
</Link>
```

**Checklist:**
- [ ] Navigation updated
- [ ] Link working

---

### STEP 7: Configure Supabase RPC (20 min)

**File:** Supabase → SQL Editor

**ACTION:** Execute this function for SQL execution:

```sql
CREATE OR REPLACE FUNCTION exec_sql(sql_statement text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_statement;
END;
$$;
```

**Checklist:**
- [ ] Function created in Supabase
- [ ] No errors

---

### STEP 8: Test Complete Workflow (60 min)

**ACTION 1:** Navigate to http://localhost:3000/dashboard/pdf-importer

**ACTION 2:** Upload your PDF

**ACTION 3:** Verify:
- [ ] File uploads
- [ ] Parsing starts
- [ ] Shows 79 recipes parsed
- [ ] Preview displays 3 recipes
- [ ] SQL generated
- [ ] "CONFIRM & IMPORT" button works
- [ ] SQL executes
- [ ] "Success" message shows
- [ ] Recipes visible in Admin panel

**Checklist:**
- [ ] All steps work
- [ ] No errors
- [ ] 79 recipes imported to database

---

## TIMELINE

| Step | Task | Time |
|------|------|------|
| 1 | PDF Parser utility | 60m |
| 2 | SQL Generator utility | 45m |
| 3 | API routes | 90m |
| 4 | Frontend components | 120m |
| 5 | Dashboard page | 30m |
| 6 | Navigation | 10m |
| 7 | Supabase function | 20m |
| 8 | Testing & debugging | 60m |
| **TOTAL** | **Complete importer** | **4-6h** |

---

## SUCCESS CRITERIA

✅ **Complete when:**

1. ✅ PDF upload works in Admin panel
2. ✅ Parsing shows progress
3. ✅ Preview displays recipes
4. ✅ SQL generated correctly
5. ✅ SQL executes in Supabase
6. ✅ 79 recipes in base_recipes (is_simple_recipe=true)
7. ✅ 79 recipes in ready_recipes
8. ✅ recipe_ingredients populated
9. ✅ recipe_instruction_steps populated
10. ✅ Mobile app shows new recipes
11. ✅ Works for ANY PDF with same structure

---

**EXECUTE STEPS 1-8 IN ORDER. This is a complete feature build!** 🚀

Generated: 2026-05-23
Priority: CRITICAL
Status: READY FOR EXECUTION
Timeline: 4-6 hours
Complexity: HIGH (Full-stack build)