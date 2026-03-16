// Tag Input Component for Ready Recipes
'use client';

import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

// Suggested tags for recipes
export const SUGGESTED_TAGS = [
  // Bulgarian
  'шоколад', 'рожден-ден', 'празнично', 'бързо', 'без-печене', 
  'лятно', 'зимно', 'класика', 'луксозно', 'детско', 'плодове',
  'ягоди', 'череши', 'банани', 'кокос', 'ванилия', 'кафе',
  'веган', 'без-глутен', 'кето', 'протеиново', 'нискокалорично',
  
  // English
  'chocolate', 'birthday', 'celebration', 'quick', 'no-bake',
  'summer', 'winter', 'classic', 'luxury', 'kids', 'fruit',
  'strawberry', 'cherry', 'banana', 'coconut', 'vanilla', 'coffee',
  'vegan', 'gluten-free', 'keto', 'protein', 'low-calorie',
];

export default function TagInput({ tags, onChange, suggestions = SUGGESTED_TAGS, placeholder = 'Добави тагове...' }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestions
    .filter(s => 
      !tags.includes(s) && 
      s.toLowerCase().includes(inputValue.toLowerCase())
    )
    .slice(0, 10);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="relative">
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:bg-purple-200 rounded-full p-0.5"
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowSuggestions(true);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.map(suggestion => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="w-full text-left px-4 py-2 hover:bg-purple-50 text-sm"
            >
              #{suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Popular Tags */}
      {tags.length === 0 && !inputValue && (
        <div className="mt-2">
          <div className="text-xs text-gray-500 mb-2">Популярни тагове:</div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TAGS.slice(0, 10).map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-1 text-xs text-gray-500">
        💡 Натисни Enter за добавяне • {tags.length} таг{tags.length !== 1 ? 'а' : ''}
      </div>
    </div>
  );
}
