'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronDown, ChevronRight, Save, Timer, Soup, Wrench } from 'lucide-react';

interface Step {
  id?: string | number;
  step_number: number;
  step_description: string;
  step_duration_minutes?: number | null;
  ingredients_used?: string[] | null;
  equipment_needed?: number[] | null;
}

interface IngredientOption {
  id: string;
  name_bg: string;
  name_en: string;
}

interface EquipmentOption {
  id: number;
  name: string;
  name_en: string | null;
  icon: string | null;
}

interface StepIngredientEditorProps {
  recipeId: string;
  steps: Step[];
  onStepsUpdate: () => void;
}

export function StepIngredientEditor({ recipeId, steps, onStepsUpdate }: StepIngredientEditorProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [allIngredients, setAllIngredients] = useState<IngredientOption[]>([]);
  const [allEquipment, setAllEquipment] = useState<EquipmentOption[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  // Per-step edit state
  const [editState, setEditState] = useState<
    Record<string, { ingredients: string[]; equipment: number[]; duration: string }>
  >({});

  useEffect(() => {
    if (recipeId) loadOptions();
  }, [recipeId]);

  // Initialize edit state when steps change — keyed by step_number (stable, avoids id format issues)
  useEffect(() => {
    console.log('[SIE] steps prop changed, re-initializing editState. steps count:', steps.length);
    const initial: typeof editState = {};
    steps.forEach(step => {
      console.log(`[SIE]   step ${step.step_number}: ingredients_used=${JSON.stringify(step.ingredients_used)}, equipment_needed=${JSON.stringify(step.equipment_needed)}`);
      initial[String(step.step_number)] = {
        ingredients: step.ingredients_used ?? [],
        equipment: step.equipment_needed ?? [],
        duration: String(step.step_duration_minutes ?? ''),
      };
    });
    setEditState(initial);
  }, [steps]);

  // Debug: log whenever editState changes (shows result after toggle)
  useEffect(() => {
    const summary = Object.entries(editState).map(([k, v]) => `step${k}: [${v.ingredients.join(', ')}]`);
    console.log('[SIE] editState updated:', summary.join(' | ') || '(empty)');
  }, [editState]);

  async function loadOptions() {
    console.log('[SIE] loadOptions called. recipeId:', recipeId);

    // Load only ingredients used in this recipe
    const { data: riData, error: riError } = await supabase
      .from('recipe_ingredients')
      .select('ingredient_database_id')
      .eq('recipe_id', recipeId)
      .not('ingredient_database_id', 'is', null);

    console.log('[SIE] recipe_ingredients query → riData:', riData, '| error:', riError);

    const ingIds = (riData ?? []).map((r: any) => r.ingredient_database_id).filter(Boolean);
    console.log('[SIE] ingIds to fetch from ingredients_database:', ingIds);

    const [ingsResult, eqsResult] = await Promise.all([
      ingIds.length > 0
        ? supabase.from('ingredients_database').select('id, name_bg, name_en').in('id', ingIds).order('name_bg')
        : Promise.resolve({ data: [] }),
      supabase
        .from('equipment')
        .select('id, name, name_en, icon')
        .order('name'),
    ]);

    console.log('[SIE] ingredients_database result:', ingsResult.data, '| error:', (ingsResult as any).error);
    console.log('[SIE] equipment result:', eqsResult.data, '| error:', eqsResult.error);

    if (ingsResult.data) setAllIngredients(ingsResult.data);

    if (eqsResult.data) {
      setAllEquipment(eqsResult.data as EquipmentOption[]);
    }
  }

  function toggleIngredient(stepId: string, ingId: string) {
    const before = editState[stepId]?.ingredients ?? [];
    console.log(`[SIE] toggleIngredient stepId="${stepId}" ingId="${ingId}"`);
    console.log(`[SIE]   before: [${before.join(', ')}] (${before.length} items)`);
    setEditState(prev => {
      const cur = prev[stepId]?.ingredients ?? [];
      const next = cur.includes(ingId) ? cur.filter(id => id !== ingId) : [...cur, ingId];
      console.log(`[SIE]   after:  [${next.join(', ')}] (${next.length} items)`);
      return {
        ...prev,
        [stepId]: {
          ...prev[stepId],
          ingredients: next,
        },
      };
    });
  }

  function toggleEquipment(stepId: string, eqId: number) {
    console.log('Toggle equipment:', eqId, 'Current:', editState[stepId]?.equipment);
    setEditState(prev => {
      const cur = prev[stepId]?.equipment ?? [];
      return {
        ...prev,
        [stepId]: {
          ...prev[stepId],
          equipment: cur.includes(eqId) ? cur.filter(id => id !== eqId) : [...cur, eqId],
        },
      };
    });
  }

  function setDuration(stepId: string, value: string) {
    setEditState(prev => ({
      ...prev,
      [stepId]: { ...prev[stepId], duration: value },
    }));
  }

  async function saveStep(stepKey: string) {
    const state = editState[stepKey];
    console.log('[SIE] ========= saveStep called =========');
    console.log('[SIE] stepKey:', stepKey, '→ step_number:', parseInt(stepKey));
    console.log('[SIE] recipeId:', recipeId);
    if (!state) {
      console.error('[SIE] ERROR: no state for stepKey', stepKey, '— editState keys:', Object.keys(editState));
      return;
    }
    console.log('[SIE] state.ingredients:', state.ingredients, `(${state.ingredients.length} items, type: ${typeof state.ingredients[0]})`);
    console.log('[SIE] state.equipment:', state.equipment, `(${state.equipment.length} items)`);
    console.log('[SIE] state.duration:', state.duration);
    setSaving(stepKey);
    try {
      const payload = {
        ingredients_used: state.ingredients,
        equipment_needed: state.equipment,
        step_duration_minutes: state.duration ? parseInt(state.duration) : null,
      };
      console.log('[SIE] Supabase UPDATE payload:', JSON.stringify(payload));
      const { data: updateData, error } = await supabase
        .from('recipe_instruction_steps')
        .update(payload)
        .eq('recipe_id', recipeId)
        .eq('step_number', parseInt(stepKey))
        .select();
      console.log('[SIE] Supabase UPDATE result → data:', updateData, '| error:', error);
      if (updateData) {
        console.log('[SIE] Updated row ingredients_used:', updateData[0]?.ingredients_used);
      }
      if (error) throw error;
      onStepsUpdate();
      setExpandedStep(null);
    } catch (e) {
      alert('Грешка при запазване');
      console.error('[SIE] saveStep exception:', e);
    } finally {
      setSaving(null);
    }
  }

  if (steps.length === 0) {
    return <p className="text-sm text-gray-500 italic">Няма запазени стъпки.</p>;
  }

  return (
    <div className="space-y-2">
      {steps.map(step => {
        const stepKey = String(step.step_number);
        const state = editState[stepKey];
        const isOpen = expandedStep === stepKey;
        const ingCount = state?.ingredients.length ?? 0;
        const eqCount = state?.equipment.length ?? 0;

        return (
          <div key={step.step_number} className="border rounded-lg overflow-hidden">
            {/* Step header row */}
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left"
              onClick={() => setExpandedStep(isOpen ? null : stepKey)}
            >
              {isOpen ? (
                <ChevronDown size={16} className="text-gray-500 shrink-0" />
              ) : (
                <ChevronRight size={16} className="text-gray-500 shrink-0" />
              )}
              <span className="font-semibold text-sm text-gray-700 w-6 shrink-0">
                {step.step_number}.
              </span>
              <span className="text-sm text-gray-600 flex-1 truncate">
                {step.step_description?.substring(0, 80)}
                {(step.step_description?.length ?? 0) > 80 ? '…' : ''}
              </span>
              <div className="flex gap-3 shrink-0 text-xs text-gray-400">
                {ingCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Soup size={12} /> {ingCount}
                  </span>
                )}
                {eqCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Wrench size={12} /> {eqCount}
                  </span>
                )}
                {state?.duration && (
                  <span className="flex items-center gap-1">
                    <Timer size={12} /> {state.duration} мин
                  </span>
                )}
              </div>
            </button>

            {/* Expanded editor */}
            {isOpen && state && (
              <div className="p-4 border-t bg-white space-y-4">
                {/* Duration */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Време (минути)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={state.duration}
                    onChange={e => setDuration(stepKey, e.target.value)}
                    className="w-24 border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A80048]"
                    placeholder="—"
                  />
                </div>

                {/* Ingredients */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                    Съставки за тази стъпка
                  </label>
                  {allIngredients.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Добави съставки в рецептата първо.</p>
                  ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-48 overflow-y-auto">
                    {allIngredients.map(ing => (
                      <label
                        key={ing.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer border border-gray-200 bg-gray-50 hover:bg-gray-100 has-[:checked]:bg-[#ffd9e0] has-[:checked]:border-[#A80048] has-[:checked]:text-[#A80048] has-[:checked]:font-medium"
                      >
                        <input
                          type="checkbox"
                          className="accent-[#A80048] shrink-0"
                          checked={editState[stepKey]?.ingredients?.includes(ing.id) || false}
                          onChange={() => toggleIngredient(stepKey, ing.id)}
                        />
                        <span className="truncate">{ing.name_bg}</span>
                      </label>
                    ))}
                  </div>
                  )}
                </div>

                {/* Equipment */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                    Оборудване за тази стъпка
                  </label>
                  {allEquipment.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Добави оборудване в рецептата първо.</p>
                  ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-40 overflow-y-auto">
                    {allEquipment.map(eq => (
                      <label
                        key={eq.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer border border-gray-200 bg-gray-50 hover:bg-gray-100 has-[:checked]:bg-[#ffd9e0] has-[:checked]:border-[#A80048] has-[:checked]:text-[#A80048] has-[:checked]:font-medium"
                      >
                        <input
                          type="checkbox"
                          className="accent-[#A80048] shrink-0"
                          checked={editState[stepKey]?.equipment?.includes(eq.id) || false}
                          onChange={() => toggleEquipment(stepKey, eq.id)}
                        />
                        {eq.icon && <span>{eq.icon}</span>}
                        <span className="truncate">{eq.name}</span>
                      </label>
                    ))}
                  </div>
                  )}
                </div>

                {/* Save button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => saveStep(stepKey)}
                    disabled={saving === stepKey}
                    className="flex items-center gap-2 px-4 py-2 bg-[#A80048] text-white rounded-lg text-sm font-medium hover:bg-[#8a003b] disabled:opacity-50"
                  >
                    <Save size={14} />
                    {saving === stepKey ? 'Запазва...' : 'Запази стъпката'}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
