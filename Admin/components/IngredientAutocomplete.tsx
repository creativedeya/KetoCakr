'use client';

import { useState, useEffect, useRef } from 'react';

interface IngredientOption {
  id: string;
  name_bg: string;
  name_en: string;
}

export function IngredientAutocomplete({
  value,
  onChange,
  onSelect,
  onCreateNew,
  onRemove,
  quantity,
  unit,
  onQuantityChange,
  onUnitChange,
  placeholder = 'Започни да пишеш...',
  className = '',
  autoFocus = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (ingredient: IngredientOption) => void;
  onCreateNew?: (name: string) => void;
  onRemove?: () => void;
  quantity?: number | null;
  unit?: string;
  onQuantityChange?: (qty: number | null) => void;
  onUnitChange?: (unit: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  const [suggestions, setSuggestions] = useState<IngredientOption[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  // Prevents re-fetching when value changes due to a selection (not user typing)
  const skipNextFetch = useRef(false);

  useEffect(() => {
    if (value.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        console.log('[Autocomplete] Searching for:', value);
        const res = await fetch(`/api/ingredients/search?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        console.log('[Autocomplete] API response:', data);
        console.log('[Autocomplete] Results count:', data.results?.length ?? 0);
        setSuggestions(data.results || []);
        setShowDropdown(true);
      } catch (err) {
        console.error('[Autocomplete] Fetch error:', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [value]);

  const handleSelect = (ing: IngredientOption) => {
    console.log('[Autocomplete] Selected:', ing.name_bg, '| id:', ing.id);
    skipNextFetch.current = true; // Prevent useEffect from re-fetching on value change
    onSelect?.(ing);              // Parent handles state update with full canonical name
    setShowDropdown(false);
  };

  const handleCreateNew = () => {
    setShowDropdown(false);
    onCreateNew?.(value);
  };

  const dropdownVisible = showDropdown && value.length >= 2;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Name with autocomplete */}
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.length >= 2 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          autoFocus={autoFocus}
        />

        {loading && (
          <div className="absolute right-3 top-2.5 text-xs text-gray-400">Търсене...</div>
        )}

        {dropdownVisible && (suggestions.length > 0 || onCreateNew) && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((ing) => (
              <button
                key={ing.id}
                type="button"
                onMouseDown={() => handleSelect(ing)}
                className="w-full text-left px-4 py-2 hover:bg-[#A80048] hover:text-white transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="text-sm font-medium">{ing.name_bg}</div>
                {ing.name_en && ing.name_en !== ing.name_bg && (
                  <div className="text-xs opacity-70">{ing.name_en}</div>
                )}
              </button>
            ))}

            {onCreateNew && (
              <>
                {suggestions.length > 0 && <div className="border-t border-gray-100" />}
                <button
                  type="button"
                  onMouseDown={handleCreateNew}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-600 text-sm font-medium"
                >
                  ➕ Create &ldquo;{value}&rdquo; as new ingredient
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Quantity */}
      {onQuantityChange !== undefined && (
        <input
          type="number"
          min={0}
          step={0.1}
          value={quantity ?? ''}
          onChange={(e) => onQuantityChange(e.target.value === '' ? null : parseFloat(e.target.value))}
          placeholder="qty"
          className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm"
        />
      )}

      {/* Unit */}
      {onUnitChange !== undefined && (
        <input
          type="text"
          value={unit ?? ''}
          onChange={(e) => onUnitChange(e.target.value)}
          placeholder="unit"
          className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm"
        />
      )}

      {/* Remove */}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-red-400 hover:text-red-600 px-1 text-lg leading-none flex-shrink-0"
        >
          ×
        </button>
      )}
    </div>
  );
}
