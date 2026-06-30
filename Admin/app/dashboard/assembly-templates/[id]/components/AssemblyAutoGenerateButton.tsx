'use client';

import { useState } from 'react';
import { Wand2, Loader2, X } from 'lucide-react';

interface Props {
  templateId: number;
  instructions_bg: string;
  instructions_en: string;
  onSuccess: () => void;
}

interface GeneratedStep {
  step_number: number;
  step_description_bg: string;
  step_description_en: string;
}

export default function AssemblyAutoGenerateButton({
  templateId,
  instructions_bg,
  instructions_en,
  onSuccess,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewSteps, setPreviewSteps] = useState<GeneratedStep[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpen = () => {
    if (!instructions_bg && !instructions_en) {
      showNotification('Добавете инструкции на поне един език преди да генерирате стъпки.', 'error');
      return;
    }
    setPreviewSteps([]);
    setIsOpen(true);
  };

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      console.log('[Auto Generate] Parsing instructions for template:', templateId);

      const response = await fetch(
        `/api/assembly-templates/${templateId}/parse-instructions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instructions_bg, instructions_en }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to parse instructions');
      }

      const data = await response.json();
      console.log('[Auto Generate] Created', data.stepsCreated, 'steps');

      setPreviewSteps(data.steps);
      showNotification(`Генерирани ${data.stepsCreated} стъпки успешно!`, 'success');

      setTimeout(() => {
        setIsOpen(false);
        setPreviewSteps([]);
        onSuccess();
      }, 1800);
    } catch (error) {
      console.error('[Auto Generate] Error:', error);
      showNotification(
        error instanceof Error ? error.message : 'Грешка при генериране на стъпки',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setIsOpen(false);
    setPreviewSteps([]);
  };

  return (
    <>
      {/* Inline notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded-lg text-white font-medium z-50 shadow-lg ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {notification.message}
        </div>
      )}

      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 font-medium text-sm transition-colors"
      >
        <Wand2 size={16} />
        Авто-генерирай стъпки от инструкции
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handleClose}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Авто-генериране на стъпки
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Claude ще анализира инструкциите и ще създаде отделни стъпки. Съществуващите стъпки ще бъдат заменени.
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Preview */}
              {previewSteps.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-gray-900">
                    Генерирани стъпки ({previewSteps.length}):
                  </h3>
                  <div className="max-h-64 overflow-y-auto space-y-2 bg-gray-50 p-4 rounded-lg">
                    {previewSteps.map((step) => (
                      <div
                        key={step.step_number}
                        className="bg-white p-3 rounded border border-gray-200 text-sm"
                      >
                        <div className="font-semibold text-gray-900 mb-1">
                          Стъпка {step.step_number}
                        </div>
                        <div className="text-gray-700 mb-1">
                          <span className="font-medium">BG:</span> {step.step_description_bg}
                        </div>
                        <div className="text-gray-600">
                          <span className="font-medium">EN:</span> {step.step_description_en}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info when no preview yet */}
              {previewSteps.length === 0 && (
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm text-blue-900">Какво ще се случи:</h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Claude ще анализира инструкциите (BG и/или EN)</li>
                    <li>Ще ги раздели на индивидуални стъпки</li>
                    <li>Ще създаде двуезични описания (BG/EN)</li>
                    <li>Ще замени съществуващите стъпки</li>
                    <li>След това можете да редактирате всяка стъпка — да добавите снимки, съставки, оборудване</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-2 justify-end px-6 pb-6 pt-2 border-t">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm disabled:opacity-50"
              >
                Отказ
              </button>
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                {isLoading ? 'Генерира се...' : 'Генерирай стъпки'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
