'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface Equipment {
  id: number;
  slug: string;
  name: string;
  name_en: string | null;
  icon: string | null;
  category: string | null;
  reference_image_url?: string | null;
}

interface EquipmentSelectorProps {
  stepNumber: number;
  selectedEquipment: Map<number, string>;
  onEquipmentChange: (equipment: Map<number, string>) => void;
}

export function EquipmentSelector({
  stepNumber,
  selectedEquipment,
  onEquipmentChange,
}: EquipmentSelectorProps) {
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

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
      setAllEquipment(data || []);
      console.log('[EquipmentSelector] Loaded', data?.length, 'items');
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

  const groupedEquipment = allEquipment.reduce((acc, equip) => {
    const category = equip.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(equip);
    return acc;
  }, {} as Record<string, Equipment[]>);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Loader2 className="animate-spin" size={16} />
        <span>Loading equipment...</span>
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
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-900">
        Equipment Used in Step {stepNumber}
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-3">
        {Object.entries(groupedEquipment).map(([category, items]) => (
          <div key={category}>
            <button
              type="button"
              onClick={() =>
                setExpandedCategory(
                  expandedCategory === category ? null : category
                )
              }
              className="w-full text-left flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded text-sm font-medium text-gray-700"
            >
              <span>{expandedCategory === category ? '▼' : '▶'}</span>
              <span className="capitalize">{category}</span>
              <span className="text-xs text-gray-500 ml-auto">
                ({items.filter((i) => selectedEquipment.has(i.id)).length}/
                {items.length})
              </span>
            </button>

            {expandedCategory === category && (
              <div className="ml-4 space-y-2 py-1">
                {items.map((equip) => (
                  <div key={equip.id} className="space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEquipment.has(equip.id)}
                        onChange={() => toggleEquipment(equip.id)}
                        className="w-4 h-4 rounded text-green-600"
                      />
                      <span className="text-sm text-gray-900">
                        {equip.icon && (
                          <span className="mr-1">{equip.icon}</span>
                        )}
                        {equip.name}
                      </span>
                      {equip.reference_image_url && (
                        <img
                          src={equip.reference_image_url}
                          alt={equip.name}
                          className="w-5 h-5 rounded object-cover"
                          title={equip.name}
                        />
                      )}
                    </label>

                    {selectedEquipment.has(equip.id) && (
                      <input
                        type="text"
                        value={selectedEquipment.get(equip.id) || ''}
                        onChange={(e) =>
                          updateEquipmentNotes(equip.id, e.target.value)
                        }
                        placeholder="e.g. 20cm, electric, optional..."
                        className="ml-6 w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {allEquipment.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No equipment in database. Add items to the equipment table first.
          </div>
        )}
      </div>

      {selectedEquipment.size > 0 && (
        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
          <div className="text-sm font-medium text-green-900 mb-2">
            ✓ {selectedEquipment.size} item
            {selectedEquipment.size !== 1 ? 's' : ''} selected
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedEquipment.entries()).map(([equipId, notes]) => {
              const equip = allEquipment.find((e) => e.id === equipId);
              return (
                <div
                  key={equipId}
                  className="bg-white px-2 py-1 rounded text-xs text-gray-700 border border-green-200"
                >
                  {equip?.icon && <span className="mr-1">{equip.icon}</span>}
                  {equip?.name}
                  {notes && (
                    <span className="text-gray-500"> ({notes})</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
