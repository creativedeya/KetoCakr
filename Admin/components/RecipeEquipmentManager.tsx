'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import EquipmentAutocomplete from '@/components/EquipmentAutocomplete';

interface EquipmentRow {
  id?: number;
  name: string;
  name_bg: string;
  quantity: number;
  size: string;
  essential: boolean;
  equipment_id: number | null;
  image_url: string | null;
}

interface RecipeEquipmentManagerProps {
  recipeId?: string | null;
  onUpdate?: () => void;
}

export default function RecipeEquipmentManager({ recipeId, onUpdate }: RecipeEquipmentManagerProps) {
  const [rows, setRows] = useState<EquipmentRow[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (recipeId) loadEquipment();
  }, [recipeId]);

  async function loadEquipment() {
    try {
      const { data } = await supabase
        .from('recipe_equipment')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('display_order', { ascending: true });

      setRows((data || []).map(e => ({
        id: e.id,
        name: e.item,
        name_bg: e.item_bg,
        quantity: e.quantity,
        size: e.size || '',
        essential: e.essential,
        equipment_id: e.equipment_id,
        image_url: e.image_url,
      })));
    } catch (error) {
      console.error('Error loading equipment:', error);
    }
  }

  async function handleSaveAll() {
    if (!recipeId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/save-recipe-equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId, rows: rows.filter(r => r.name.trim()) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      await loadEquipment();
      onUpdate?.();
    } catch (err: any) {
      alert(`Грешка: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (!recipeId) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">💡 Създай рецептата първо, после ще можеш да добавиш оборудване</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">🍳 Посуда и Оборудване</h3>
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Запазване...' : '💾 Запази'}
        </button>
      </div>

      {/* Equipment rows */}
      {rows.map((row, index) => (
        <div key={index} className="flex items-center gap-2">
          {/* Avatar of linked equipment */}
          {row.image_url && (
            <div className="w-8 h-8 rounded overflow-hidden shrink-0 border border-gray-200">
              <img src={row.image_url} alt={row.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1">
            <EquipmentAutocomplete
              value={row.name}
              quantity={row.quantity}
              size={row.size}
              onChange={(name, nameEn, qty, size, eqId, imgUrl) => {
                const updated = [...rows];
                updated[index] = {
                  ...updated[index],
                  name,
                  name_bg: nameEn || name,
                  quantity: qty,
                  size,
                  equipment_id: eqId,
                  image_url: imgUrl,
                };
                setRows(updated);
              }}
              onRemove={() => {
                const updated = rows.filter((_, i) => i !== index);
                setRows(updated);
              }}
            />
          </div>
          {/* Essential toggle */}
          <label className="flex items-center gap-1 text-xs text-gray-600 shrink-0">
            <input
              type="checkbox"
              checked={row.essential}
              onChange={(e) => {
                const updated = [...rows];
                updated[index].essential = e.target.checked;
                setRows(updated);
              }}
              className="w-3 h-3"
            />
            Задължително
          </label>
        </div>
      ))}

      {/* Add row button */}
      <button
        type="button"
        onClick={() => setRows([...rows, {
          name: '', name_bg: '', quantity: 1, size: '',
          essential: true, equipment_id: null, image_url: null
        }])}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        + Добави посуда
      </button>
    </div>
  );
}
