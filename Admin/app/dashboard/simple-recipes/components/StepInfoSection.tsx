'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { StepIngredientsFromRecipe } from './StepIngredientsFromRecipe';
import { EquipmentSelectorImproved } from './EquipmentSelectorImproved';

interface RecipeStep {
  id: string;
  step_number: number;
  step_description: string;
  step_description_bg?: string;
  step_description_en?: string;
  step_duration_minutes?: number;
  ingredient_ids?: number[];
  equipment_needed?: number[];
}

interface StepInfoSectionProps {
  recipeId: string;
  step: RecipeStep;
  stepIndex: number;
  onStepChanged: (stepId: string, ingredientIds: number[], equipmentIds: number[]) => void;
}

export function StepInfoSection({ recipeId, step, stepIndex, onStepChanged }: StepInfoSectionProps) {
  const [isExpanded, setIsExpanded] = useState(stepIndex === 0);
  const [ingredientIds, setIngredientIds] = useState<number[]>(step.ingredient_ids || []);
  const [equipmentMap, setEquipmentMap] = useState<Map<number, string>>(
    new Map(step.equipment_needed?.map(id => [id, '']) || [])
  );

  function handleIngredientsChange(ids: number[]) {
    setIngredientIds(ids);
    onStepChanged(step.id, ids, Array.from(equipmentMap.keys()));
  }

  function handleEquipmentChange(equip: Map<number, string>) {
    setEquipmentMap(equip);
    onStepChanged(step.id, ingredientIds, Array.from(equip.keys()));
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-start justify-between p-4 hover:bg-gray-50 transition"
      >
        <div className="text-left flex-1">
          <h3 className="text-lg font-semibold text-gray-900">Step {step.step_number}</h3>
          <p className="text-gray-700 mt-1 line-clamp-2">
            {step.step_description_bg || step.step_description}
          </p>
          {step.step_duration_minutes && (
            <div className="text-xs text-gray-500 mt-1">⏱️ {step.step_duration_minutes} min</div>
          )}
          <div className="flex gap-4 mt-2 text-xs">
            {ingredientIds.length > 0 && (
              <span className="text-green-600">✓ {ingredientIds.length} ingredients</span>
            )}
            {Array.from(equipmentMap.keys()).length > 0 && (
              <span className="text-blue-600">✓ {Array.from(equipmentMap.keys()).length} equipment</span>
            )}
          </div>
        </div>
        <div className="text-gray-400 ml-4">
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t p-4 space-y-6 bg-gray-50">
          {step.step_description_bg && (
            <div>
              <label className="text-xs font-medium text-gray-700">Описание (Български)</label>
              <p className="text-sm text-gray-800 mt-1">{step.step_description_bg}</p>
            </div>
          )}
          {step.step_description_en && (
            <div>
              <label className="text-xs font-medium text-gray-700">Description (English)</label>
              <p className="text-sm text-gray-800 mt-1">{step.step_description_en}</p>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">🥄 Съставки</h4>
            <StepIngredientsFromRecipe
              stepNumber={step.step_number}
              recipeId={recipeId}
              selectedIngredientIds={ingredientIds}
              onIngredientsChange={handleIngredientsChange}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">🍳 Посуда & Уреди</h4>
            <EquipmentSelectorImproved
              stepNumber={step.step_number}
              selectedEquipment={equipmentMap}
              onEquipmentChange={handleEquipmentChange}
            />
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 text-center">
              💡 Changes saved when you click "Save All Steps" above
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
