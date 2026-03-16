'use client';

import { useState, useEffect } from 'react';

export interface Ingredient {
  id?: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
}

interface IngredientsEditorProps {
  ingredients: Ingredient[];
  onChange: (ingredients: Ingredient[]) => void;
  descriptionBg?: string;
  descriptionEn?: string;
  onDescriptionBgChange?: (value: string) => void;
  onDescriptionEnChange?: (value: string) => void;
}

export default function IngredientsEditor({ 
  ingredients, 
  onChange,
  descriptionBg = '',
  descriptionEn = '',
  onDescriptionBgChange,
  onDescriptionEnChange
}: IngredientsEditorProps) {
  const [text, setText] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Convert ingredients to text format
  function convertToText(ings: Ingredient[]): string {
    return ings
      .filter(ing => ing.ingredient_name && ing.ingredient_name.trim())
      .map(ing => `${ing.quantity} ${ing.unit} ${ing.ingredient_name}`)
      .join('\n');
  }

  // Initialize text from descriptionBg (ingredients_text_bg field from DB)
  useEffect(() => {
    if (!isInitialized && descriptionBg && descriptionBg.trim()) {
      setText(descriptionBg);
      setIsInitialized(true);
      
      // Also parse it to update ingredients array
      const parsed = parseFromText(descriptionBg);
      if (parsed.length > 0) {
        onChange(parsed);
      }
    } else if (!isInitialized && ingredients.length > 0 && ingredients[0].ingredient_name) {
      const textValue = convertToText(ingredients);
      if (textValue) {
        setText(textValue);
        setIsInitialized(true);
      }
    }
  }, [descriptionBg, ingredients, isInitialized]);

  // Parse ingredients from text
  function parseFromText(textInput: string): Ingredient[] {
    if (!textInput.trim()) return [];
    
    const lines = textInput.split('\n');
    const parsed: Ingredient[] = [];
    
    lines.forEach(line => {
      line = line.trim();
      if (!line) return;
      
      // Try to match: "50 g еритритол" or "3 бр яйца"
      const match = line.match(/^(\d+(?:[.,]\d+)?)\s*([а-яa-z.]+)\s+(.+)$/i);
      if (match) {
        const quantity = parseFloat(match[1].replace(',', '.'));
        parsed.push({
          quantity,
          unit: match[2],
          ingredient_name: match[3].trim()
        });
      } else {
        // If no match, try to salvage what we can
        parsed.push({
          quantity: 0,
          unit: 'g',
          ingredient_name: line
        });
      }
    });
    
    return parsed;
  }

  // Handle text change with real-time parsing
  function handleTextChange(value: string) {
    setText(value);
    
    // Update both the ingredients array AND the description field
    const parsed = parseFromText(value);
    if (parsed.length > 0) {
      onChange(parsed);
    } else if (value.trim() === '') {
      onChange([]);
    }
    
    // Also update the description field so it gets saved to DB
    if (onDescriptionBgChange) {
      onDescriptionBgChange(value);
    }
  }

  // Add ingredient line
  function addIngredientLine() {
    const newText = text + (text ? '\n' : '') + '0 g ';
    setText(newText);
    if (onDescriptionBgChange) {
      onDescriptionBgChange(newText);
    }
    setTimeout(() => {
      const textarea = document.querySelector('textarea[placeholder*="съставки"]') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }
    }, 10);
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Съставки</h2>
        <button
          type="button"
          onClick={addIngredientLine}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm transition-colors"
        >
          + Добави ред
        </button>
      </div>

      {/* Ingredients List */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Списък на съставките *
        </label>
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          rows={12}
          placeholder="50 г еритритол&#10;3 бр яйца&#10;100 г бадемово брашно&#10;1 ч.л. ванилия&#10;..."
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent font-mono text-sm"
          style={{ lineHeight: '1.6' }}
          required
        />
        
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="text-blue-800 font-medium mb-1">💡 Формат:</p>
          <p className="text-blue-700">количество мярка продукт</p>
          <p className="text-blue-600 text-xs mt-1">Всяка съставка на нов ред</p>
          <p className="text-blue-600 text-xs">Пример: 50 г какао</p>
        </div>
        
        {/* Live preview of parsed ingredients */}
        {text && parseFromText(text).length > 0 && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium text-sm mb-2">
              ✅ Разпознати {parseFromText(text).length} съставки:
            </p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {parseFromText(text).map((ing, i) => (
                <div key={i} className="text-xs text-green-700 flex items-start">
                  <span className="text-green-600 mr-2">{i + 1}.</span>
                  <span className="font-medium flex-1">{ing.ingredient_name}</span>
                  <span className="mx-2 text-green-500">→</span>
                  <span className="text-green-600">{ing.quantity} {ing.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Warning for empty or malformed */}
        {text && parseFromText(text).length === 0 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium text-sm">
              ⚠️ Не са разпознати съставки. Проверете формата!
            </p>
          </div>
        )}
      </div>

      {/* Description in Bulgarian */}
      {onDescriptionBgChange && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Описание на съставките (Български)
          </label>
          <textarea
            value={descriptionBg}
            onChange={(e) => onDescriptionBgChange(e.target.value)}
            rows={3}
            placeholder="Допълнителна информация за съставките, бележки, алтернативи..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Опционално: бележки за заместване, марки, съвети за покупка
          </p>
        </div>
      )}

      {/* Description in English */}
      {onDescriptionEnChange && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Описание на съставките (Английски)
          </label>
          <textarea
            value={descriptionEn}
            onChange={(e) => onDescriptionEnChange(e.target.value)}
            rows={3}
            placeholder="Additional information about ingredients, notes, alternatives..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional: substitution notes, brands, shopping tips
          </p>
        </div>
      )}
    </div>
  );
}
