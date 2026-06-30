'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface EquipmentItem {
  id: number;
  slug: string;
  name: string;
  name_en: string | null;
  icon: string | null;
  image_url: string | null;
  category: string | null;
}

interface EquipmentAutocompleteProps {
  value: string;
  quantity: number;
  size: string;
  onChange: (
    name_bg: string,
    name_en: string,
    quantity: number,
    size: string,
    equipmentId: number | null,
    imageUrl: string | null
  ) => void;
  onRemove: () => void;
}

export default function EquipmentAutocomplete({
  value,
  quantity,
  size,
  onChange,
  onRemove,
}: EquipmentAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<EquipmentItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Search equipment on input change (debounced 300ms)
  useEffect(() => {
    const search = async () => {
      if (inputValue.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      const term = inputValue.trim().toLowerCase();
      const { data } = await supabase
        .from('equipment')
        .select('id, slug, name, name_en, icon, image_url, category')
        .or(`name.ilike.%${term}%,name_en.ilike.%${term}%`)
        .order('name')
        .limit(8);
      setSuggestions(data || []);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    };
    const t = setTimeout(search, 300);
    return () => clearTimeout(t);
  }, [inputValue]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!showSuggestions || suggestions.length === 0) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(p => Math.min(p + 1, suggestions.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(p => Math.max(p - 1, -1)); }
      if (e.key === 'Enter' && selectedIndex >= 0) { e.preventDefault(); selectItem(suggestions[selectedIndex]); }
      if (e.key === 'Escape') setShowSuggestions(false);
    };
    if (showSuggestions) {
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [showSuggestions, selectedIndex, suggestions]);

  function selectItem(item: EquipmentItem) {
    setInputValue(item.name);
    setShowSuggestions(false);
    onChange(item.name, item.name_en || '', quantity, size, item.id, item.image_url);
  }

  return (
    <div className="flex gap-2 items-center">
      {/* Name input with autocomplete */}
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value, '', quantity, size, null, null);
          }}
          onFocus={() => inputValue.trim().length >= 2 && setShowSuggestions(true)}
          placeholder="Потърси посуда... (напр. касерола, форма)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Dropdown */}
        {showSuggestions && (
          <div
            ref={suggestionsRef}
            className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            {suggestions.length > 0 ? suggestions.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectItem(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-3 transition-colors ${
                  idx === selectedIndex ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'
                }`}
              >
                {/* Avatar: image_url or icon emoji */}
                <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 bg-gray-100 overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg">{item.icon || '🍳'}</span>
                  )}
                </div>
                <div>
                  <div className="font-medium">{item.name}</div>
                  {item.name_en && (
                    <div className={`text-xs ${idx === selectedIndex ? 'text-blue-100' : 'text-gray-500'}`}>
                      {item.name_en}{item.category ? ` · ${item.category}` : ''}
                    </div>
                  )}
                </div>
              </button>
            )) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                Не намерена посуда с "{inputValue}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quantity */}
      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => onChange(inputValue, '', Number(e.target.value), size, null, null)}
        className="w-14 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center"
        title="Количество"
      />

      {/* Size */}
      <input
        type="text"
        value={size}
        onChange={(e) => onChange(inputValue, '', quantity, e.target.value, null, null)}
        placeholder="Размер"
        className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm"
        title="Размер (напр. 20cm)"
      />

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="px-2 py-2 text-red-500 hover:bg-red-50 rounded-lg"
      >
        ✕
      </button>
    </div>
  );
}
