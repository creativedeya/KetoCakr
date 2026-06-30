'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import AssemblyStepForm from './AssemblyStepForm';

interface AssemblyStep {
  id: number;
  assembly_template_id: number;
  step_number: number;
  step_description: string;
  step_description_bg: string;
  step_description_en: string;
  step_duration_minutes: number;
  ingredients_used: string[];
  equipment_needed: number[];
  step_image_url: string | null;
}

interface Props {
  templateId: number;
  steps: AssemblyStep[];
  onStepsUpdated: () => Promise<void>;
}

export default function AssemblyStepsManager({ templateId, steps: initialSteps, onStepsUpdated }: Props) {
  const [steps, setSteps] = useState<AssemblyStep[]>(initialSteps);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<AssemblyStep | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setSteps(initialSteps);
  }, [initialSteps]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleDeleteStep = async (stepId: number) => {
    if (!confirm('Are you sure you want to delete this step?')) return;

    try {
      setIsLoading(true);
      console.log('[Steps Manager] Deleting step:', stepId);

      const response = await fetch(
        `/api/assembly-templates/${templateId}/steps/${stepId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete step');

      console.log('[Steps Manager] Deleted step:', stepId);
      await onStepsUpdated();
      showToast('Стъпката е изтрита', 'success');
    } catch (error) {
      console.error('[Steps Manager] Delete error:', error);
      showToast('Грешка при изтриване', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepSaved = async () => {
    setIsDialogOpen(false);
    setEditingStep(null);
    await onStepsUpdated();
  };

  const openAddDialog = () => {
    setEditingStep(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (step: AssemblyStep) => {
    setEditingStep(step);
    setIsDialogOpen(true);
  };

  const getDisplayText = (step: AssemblyStep): string => {
    return step.step_description_bg || step.step_description_en || step.step_description || '';
  };

  return (
    <div className="bg-white rounded-lg shadow p-8 space-y-6">

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded-lg text-white font-medium z-50 ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Стъпки ({steps.length})
        </h2>
        <button
          onClick={openAddDialog}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
        >
          <Plus size={20} />
          Добави стъпка
        </button>
      </div>

      {/* Steps List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : steps.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Няма стъпки</p>
          <button
            onClick={openAddDialog}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            Добави първа стъпка
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {[...steps]
            .sort((a, b) => a.step_number - b.step_number)
            .map((step) => {
              const text = getDisplayText(step);
              return (
                <div
                  key={step.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold">
                          {step.step_number}
                        </span>
                        <p className="font-semibold text-gray-900 text-sm">
                          {text.length > 80 ? text.substring(0, 80) + '...' : text || '(без текст)'}
                        </p>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1 ml-8">
                        <p>
                          <span className="font-medium">Продължителност:</span>{' '}
                          {step.step_duration_minutes} мин
                        </p>
                        {step.ingredients_used?.length > 0 && (
                          <p>
                            <span className="font-medium">Съставки:</span>{' '}
                            {step.ingredients_used.length}
                          </p>
                        )}
                        {step.equipment_needed?.length > 0 && (
                          <p>
                            <span className="font-medium">Оборудване:</span>{' '}
                            {step.equipment_needed.length}
                          </p>
                        )}
                        {step.step_image_url && (
                          <p className="text-green-600 font-medium">✓ Има изображение</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditDialog(step)}
                        className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteStep(step.id)}
                        disabled={isLoading}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Step Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <AssemblyStepForm
              templateId={templateId}
              step={editingStep}
              totalSteps={steps.length}
              onSave={handleStepSaved}
              onCancel={() => { setIsDialogOpen(false); setEditingStep(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
