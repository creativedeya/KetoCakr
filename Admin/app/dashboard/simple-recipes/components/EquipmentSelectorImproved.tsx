'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Grid3x3, List } from 'lucide-react';

interface Equipment {
  id: number;
  slug: string;
  name: string;
  name_en: string | null;
  icon: string | null;
  category: string | null;
  category_bg: string | null;
  reference_image_url?: string | null;
}

interface EquipmentSelectorImprovedProps {
  stepNumber: number;
  selectedEquipment: Map<number, string>;
  onEquipmentChange: (equipment: Map<number, string>) => void;
}

export function EquipmentSelectorImproved({
  stepNumber,
  selectedEquipment,
  onEquipmentChange,
}: EquipmentSelectorImprovedProps) {
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEquipment();
  }, []);

  async function loadEquipment() {
    try {
      setLoading(true);
      setLoadError(null);
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      const uniqueData = Array.from(
        new Map((data || []).map(item => [item.id, item])).values()
      );
      setAllEquipment(uniqueData);

      // Auto-expand first 2 categories for quick access
      const cats = Array.from(
        new Set(uniqueData.map(e => e.category).filter(Boolean))
      ) as string[];
      setExpandedCategories(new Set(cats.slice(0, 2)));

      console.log(
        '[EquipmentSelector] Loaded',
        uniqueData.length,
        'items,',
        cats.length,
        'categories'
      );
    } catch (error: any) {
      console.error('[EquipmentSelector] Error:', error);
      setLoadError(error.message || 'Failed to load equipment');
    } finally {
      setLoading(false);
    }
  }

  function toggleEquipment(equipmentId: number) {
    const newMap = new Map(selectedEquipment);
    if (newMap.has(equipmentId)) {
      newMap.delete(equipmentId);
    } else {
      newMap.set(equipmentId, '');
    }
    onEquipmentChange(newMap);
  }

  function updateEquipmentNotes(equipmentId: number, notes: string) {
    const newMap = new Map(selectedEquipment);
    newMap.set(equipmentId, notes);
    onEquipmentChange(newMap);
  }

  function toggleCategory(category: string) {
    const newSet = new Set(expandedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setExpandedCategories(newSet);
  }

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(allEquipment.map(e => e.category).filter(Boolean)))
      .sort() as string[];
  }, [allEquipment]);

  const categoryMeta = useMemo(() => {
    return uniqueCategories.map(cat => {
      const sample = allEquipment.find(e => e.category === cat);
      return {
        english: cat,
        label: sample?.category_bg || cat,
        count: allEquipment.filter(e => e.category === cat).length,
      };
    });
  }, [allEquipment, uniqueCategories]);

  function toggleAllCategories() {
    if (expandedCategories.size === uniqueCategories.length) {
      setExpandedCategories(new Set());
    } else {
      setExpandedCategories(new Set(uniqueCategories));
    }
  }

  const groupedEquipment = useMemo(() => {
    const grouped = allEquipment.reduce((acc, equip) => {
      const cat = equip.category || 'other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(equip);
      return acc;
    }, {} as Record<string, Equipment[]>);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      for (const cat of Object.keys(grouped)) {
        grouped[cat] = grouped[cat].filter(
          e =>
            e.name.toLowerCase().includes(q) ||
            (e.name_en && e.name_en.toLowerCase().includes(q))
        );
        if (grouped[cat].length === 0) delete grouped[cat];
      }
    }

    return grouped;
  }, [allEquipment, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Loader2 className="animate-spin" size={16} />
        <span>Зарежда уреди...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
        {loadError}
        <button
          type="button"
          onClick={loadEquipment}
          className="ml-2 underline hover:no-underline"
        >
          Опитай пак
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium text-gray-900">
          Уреди за Стъпка {stepNumber}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${
              viewMode === 'grid'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title="Grid изглед"
          >
            <Grid3x3 size={15} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${
              viewMode === 'list'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title="Списък изглед"
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Търси уред... (купа, блендер, форма...)"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm"
      />

      {/* Expand all / count */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleAllCategories}
          className="text-xs px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          {expandedCategories.size === uniqueCategories.length
            ? 'Свий всички'
            : 'Разгъни всички'}
        </button>
        <span className="text-xs text-gray-500">
          {selectedEquipment.size} избрани от {allEquipment.length}
        </span>
      </div>

      {/* Equipment list */}
      <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
        {categoryMeta.length === 0 && (
          <div className="text-center py-6 text-gray-500 text-sm">
            Няма уреди в базата данни.
          </div>
        )}

        {categoryMeta.map(cat => {
          const items = groupedEquipment[cat.english] || [];
          if (items.length === 0) return null;

          const isExpanded = expandedCategories.has(cat.english);
          const selectedCount = items.filter(i => selectedEquipment.has(i.id)).length;

          return (
            <div
              key={cat.english}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleCategory(cat.english)}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {cat.label}
                  </span>
                  <span className="text-xs text-gray-400">({items.length})</span>
                </div>
                {selectedCount > 0 && (
                  <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    {selectedCount}/{items.length}
                  </span>
                )}
              </button>

              {isExpanded && (
                <div
                  className={`p-3 border-t border-gray-100 ${
                    viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'
                  }`}
                >
                  {items.map(equip => {
                    const isSelected = selectedEquipment.has(equip.id);
                    return (
                      <div
                        key={equip.id}
                        className={`p-2 rounded border transition-colors ${
                          isSelected
                            ? 'border-purple-300 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleEquipment(equip.id)}
                            className="w-4 h-4 rounded text-purple-600 cursor-pointer"
                          />
                          <div className="flex items-center gap-1 flex-1 min-w-0">
                            {equip.icon && (
                              <span className="text-base leading-none">
                                {equip.icon}
                              </span>
                            )}
                            <span className="text-sm text-gray-900 truncate">
                              {equip.name}
                            </span>
                          </div>
                          {equip.reference_image_url && (
                            <img
                              src={equip.reference_image_url}
                              alt={equip.name}
                              className="w-6 h-6 rounded object-cover border border-gray-200 shrink-0"
                              title={equip.name}
                            />
                          )}
                        </label>

                        {isSelected && (
                          <input
                            type="text"
                            value={selectedEquipment.get(equip.id) || ''}
                            onChange={e =>
                              updateEquipmentNotes(equip.id, e.target.value)
                            }
                            placeholder="напр. 20см, електрически..."
                            className="mt-1.5 w-full text-xs px-2 py-1 border border-purple-200 rounded focus:ring-1 focus:ring-purple-400"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected summary */}
      {selectedEquipment.size > 0 && (
        <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
          <div className="text-xs font-semibold text-purple-900 mb-2">
            ✓ Избрано: {selectedEquipment.size}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Array.from(selectedEquipment.entries()).map(([equipId, notes]) => {
              const equip = allEquipment.find(e => e.id === equipId);
              return (
                <span
                  key={equipId}
                  className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded text-xs text-gray-700 border border-purple-200"
                >
                  {equip?.icon && <span>{equip.icon}</span>}
                  {equip?.name}
                  {notes && (
                    <span className="text-gray-400">({notes})</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400">
        💡 Разгъни всички → избери → запази
      </p>
    </div>
  );
}
