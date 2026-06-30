'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import AssemblyAutoGenerateButton from './AssemblyAutoGenerateButton';

interface AssemblyTemplate {
  id: number;
  template_key: string;
  name: string;
  name_en: string;
  intro_text: string;
  intro_text_bg: string;
  intro_text_en: string;
  instructions: string;
  instructions_bg: string;
  instructions_en: string;
  soaking_required: boolean;
  compatible_dessert_types: number[];
}

interface Props {
  template: AssemblyTemplate;
  onSave: (data: Partial<AssemblyTemplate>) => Promise<void>;
  isSaving: boolean;
  onStepsGenerated?: () => void;
}

export default function AssemblyTemplateForm({ template, onSave, isSaving, onStepsGenerated }: Props) {
  const [formData, setFormData] = useState(template);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setFormData(template);
    setHasChanges(false);
    setValidationError('');
  }, [template]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setValidationError('');
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setValidationError('Bulgarian name is required');
      return;
    }
    if (!formData.name_en.trim()) {
      setValidationError('English name is required');
      return;
    }

    await onSave({
      name: formData.name,
      name_en: formData.name_en,
      intro_text: formData.intro_text,
      intro_text_bg: formData.intro_text_bg,
      intro_text_en: formData.intro_text_en,
      instructions: formData.instructions,
      instructions_bg: formData.instructions_bg,
      instructions_en: formData.instructions_en,
      soaking_required: formData.soaking_required,
      compatible_dessert_types: formData.compatible_dessert_types,
    });
    setHasChanges(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-8 space-y-6 max-w-4xl">

      {/* Names */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Имена</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Име (Български) *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ime na шаблона..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name (English) *
          </label>
          <input
            type="text"
            value={formData.name_en}
            onChange={(e) => handleChange('name_en', e.target.value)}
            placeholder="Template name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Intro Text */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-lg font-semibold text-gray-900">Вводен текст</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Вводен текст (Български)
          </label>
          <textarea
            value={formData.intro_text_bg || ''}
            onChange={(e) => handleChange('intro_text_bg', e.target.value)}
            placeholder="Вводен текст за асамблажа..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Intro Text (English)
          </label>
          <textarea
            value={formData.intro_text_en || ''}
            onChange={(e) => handleChange('intro_text_en', e.target.value)}
            placeholder="Intro text for the assembly..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-lg font-semibold text-gray-900">Инструкции</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Инструкции (Български)
          </label>
          <textarea
            value={formData.instructions_bg || ''}
            onChange={(e) => handleChange('instructions_bg', e.target.value)}
            placeholder="Инструкции за асамблажа..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instructions (English)
          </label>
          <textarea
            value={formData.instructions_en || ''}
            onChange={(e) => handleChange('instructions_en', e.target.value)}
            placeholder="Instructions for the assembly..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-lg font-semibold text-gray-900">Настройки</h2>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="soaking"
            checked={formData.soaking_required}
            onChange={(e) => handleChange('soaking_required', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="soaking" className="text-sm font-medium text-gray-700">
            Необходимо намокряне
          </label>
        </div>
      </div>

      {/* Save */}
      <div className="border-t pt-6 flex items-center gap-4">
        {validationError && (
          <p className="text-sm text-red-600">{validationError}</p>
        )}
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSaving && <Loader2 size={16} className="animate-spin" />}
          Запази промените
        </button>
        {!hasChanges && !validationError && (
          <span className="text-sm text-gray-500">Без промени</span>
        )}
      </div>

      {/* Auto-generate steps from instructions */}
      <div className="border-t pt-6">
        <AssemblyAutoGenerateButton
          templateId={template.id}
          instructions_bg={formData.instructions_bg || ''}
          instructions_en={formData.instructions_en || ''}
          onSuccess={onStepsGenerated ?? (() => {})}
        />
      </div>
    </div>
  );
}
