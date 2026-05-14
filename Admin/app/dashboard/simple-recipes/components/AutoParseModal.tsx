'use client';

import { useState } from 'react';
import { Loader2, Wand2, AlertCircle, X } from 'lucide-react';

interface ParsedIngredient {
  name: string;
  name_bg?: string;
  name_en?: string;
  quantity: number;
  unit: string;
  confidence: number;
}

interface ParsedStep {
  step_number: number;
  step_description: string;
  step_description_bg?: string;
  step_description_en?: string;
  step_duration_minutes?: number;
}

interface AutoParseModalProps {
  isOpen: boolean;
  onClose: () => void;
  description: string;
  onIngredientsFound: (ingredients: ParsedIngredient[]) => void;
  onStepsFound: (steps: ParsedStep[]) => void;
}

export default function AutoParseModal({
  isOpen,
  onClose,
  description,
  onIngredientsFound,
  onStepsFound,
}: AutoParseModalProps) {
  const [isParsingIngredients, setIsParsingIngredients] = useState(false);
  const [isParsingSteps, setIsParsingSteps] = useState(false);
  const [parsedIngredients, setParsedIngredients] = useState<ParsedIngredient[] | null>(null);
  const [parsedSteps, setParsedSteps] = useState<ParsedStep[] | null>(null);
  const [ingredientError, setIngredientError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParseIngredients = async () => {
    if (!description.trim()) return;
    setIsParsingIngredients(true);
    setIngredientError(null);
    try {
      console.log('[Auto Parse] Parsing ingredients from description');
      const res = await fetch('/api/simple-recipes/parse-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse ingredients');
      console.log('[Auto Parse] Found', data.ingredients.length, 'ingredients');
      setParsedIngredients(data.ingredients);
    } catch (err: any) {
      setIngredientError(err.message);
    } finally {
      setIsParsingIngredients(false);
    }
  };

  const handleParseSteps = async () => {
    if (!description.trim()) return;
    setIsParsingSteps(true);
    setStepError(null);
    try {
      console.log('[Auto Parse] Parsing steps from description');
      const res = await fetch('/api/simple-recipes/parse-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse steps');
      console.log('[Auto Parse] Found', data.steps.length, 'steps');
      setParsedSteps(data.steps);
    } catch (err: any) {
      setStepError(err.message);
    } finally {
      setIsParsingSteps(false);
    }
  };

  const handleUseIngredients = () => {
    if (parsedIngredients) {
      onIngredientsFound(parsedIngredients);
      onClose();
    }
  };

  const handleUseSteps = () => {
    if (parsedSteps) {
      onStepsFound(parsedSteps);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Wand2 size={20} className="text-rose-600" />
            <h2 className="text-lg font-bold text-gray-900">Auto-Parse Recipe</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-500">
            Claude AI will analyze your recipe description and extract ingredients and steps.
            Review results before accepting.
          </p>

          {/* Description preview */}
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 max-h-24 overflow-y-auto">
            {description || <span className="italic text-gray-400">No description provided</span>}
          </div>

          {/* ── Ingredients ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-gray-700">Ingredients</h3>
              <button
                onClick={handleParseIngredients}
                disabled={isParsingIngredients || !description.trim()}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isParsingIngredients && <Loader2 size={14} className="animate-spin" />}
                {isParsingIngredients ? 'Parsing...' : 'Parse Ingredients'}
              </button>
            </div>

            {ingredientError && (
              <div className="flex gap-2 bg-red-50 border border-red-200 p-3 rounded-lg">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{ingredientError}</p>
              </div>
            )}

            {parsedIngredients && (
              <div className="space-y-2">
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-800 mb-2">
                    ✓ Found {parsedIngredients.length} ingredients
                  </p>
                  <ul className="text-sm text-green-700 space-y-0.5">
                    {parsedIngredients.slice(0, 6).map((ing, i) => (
                      <li key={i}>{ing.quantity} {ing.unit} {ing.name_bg || ing.name}</li>
                    ))}
                    {parsedIngredients.length > 6 && (
                      <li className="text-green-600">... and {parsedIngredients.length - 6} more</li>
                    )}
                  </ul>
                </div>
                <button
                  onClick={handleUseIngredients}
                  className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                >
                  Use These Ingredients
                </button>
              </div>
            )}
          </div>

          <hr />

          {/* ── Steps ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-gray-700">Steps</h3>
              <button
                onClick={handleParseSteps}
                disabled={isParsingSteps || !description.trim()}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isParsingSteps && <Loader2 size={14} className="animate-spin" />}
                {isParsingSteps ? 'Parsing...' : 'Parse Steps'}
              </button>
            </div>

            {stepError && (
              <div className="flex gap-2 bg-red-50 border border-red-200 p-3 rounded-lg">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{stepError}</p>
              </div>
            )}

            {parsedSteps && (
              <div className="space-y-2">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2">
                    ✓ Found {parsedSteps.length} steps
                  </p>
                  <ol className="text-sm text-blue-700 space-y-0.5">
                    {parsedSteps.slice(0, 5).map((step) => (
                      <li key={step.step_number}>
                        {step.step_number}. {(step.step_description_bg || step.step_description).substring(0, 60)}
                        {(step.step_description_bg || step.step_description).length > 60 ? '...' : ''}
                      </li>
                    ))}
                    {parsedSteps.length > 5 && (
                      <li className="text-blue-600">... and {parsedSteps.length - 5} more</li>
                    )}
                  </ol>
                </div>
                <button
                  onClick={handleUseSteps}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Use These Steps
                </button>
              </div>
            )}
          </div>

          {/* Tip */}
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>Tip:</strong> If parsing doesn&apos;t work well, you can always add ingredients and steps manually.
              Parsed results replace the current list.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
