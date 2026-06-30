'use client';

import { useState, useEffect } from 'react';
import { Loader2, X, ImageIcon } from 'lucide-react';

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

interface Ingredient {
  id: string;
  name_en: string;
  name_bg: string;
}

interface Equipment {
  id: number;
  name: string;
  name_en: string;
  name_bg?: string;
  category?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  appliance: 'Уреди',
  accessory: 'Аксесоари',
  container: 'Съдове',
  consumable: 'Консумативи',
  cookware: 'Съдове за готвене',
  pan: 'Тигани и форми',
  tool: 'Инструменти',
  other: 'Други',
};

interface Props {
  templateId: number;
  step: AssemblyStep | null;
  totalSteps: number;
  onSave: () => Promise<void>;
  onCancel: () => void;
}

export default function AssemblyStepForm({ templateId, step, totalSteps, onSave, onCancel }: Props) {
  const [formData, setFormData] = useState({
    step_number: step?.step_number ?? totalSteps + 1,
    step_description: step?.step_description || '',
    step_description_bg: step?.step_description_bg || '',
    step_description_en: step?.step_description_en || '',
    step_duration_minutes: step?.step_duration_minutes ?? 5,
    ingredients_used: step?.ingredients_used || [],
    equipment_needed: step?.equipment_needed || [],
    step_image_url: step?.step_image_url || null,
  });

  const [imageHints, setImageHints] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [equipmentCategory, setEquipmentCategory] = useState<string | null>(null);

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    if (statusMessage) {
      const t = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [statusMessage]);

  const loadOptions = async () => {
    try {
      setIsLoadingOptions(true);
      console.log('[Step Form] Loading ingredients and equipment...');

      const [ingResponse, eqResponse] = await Promise.all([
        fetch('/api/ingredients-database'),
        fetch('/api/equipment'),
      ]);

      if (!ingResponse.ok) throw new Error('Failed to load ingredients');
      if (!eqResponse.ok) throw new Error('Failed to load equipment');

      const ingData = await ingResponse.json();
      const eqData = await eqResponse.json();

      setIngredients(ingData.data || []);
      setEquipment(eqData.data || []);

      console.log('[Step Form] Loaded', ingData.data?.length, 'ingredients and', eqData.data?.length, 'equipment');
    } catch (error: any) {
      console.error('[Step Form] Load options error:', error);
      setValidationError('Грешка при зареждане на опциите');
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationError('');
  };

  const toggleIngredient = (ingredientId: string) => {
    setFormData((prev) => ({
      ...prev,
      ingredients_used: prev.ingredients_used.includes(ingredientId)
        ? prev.ingredients_used.filter((id) => id !== ingredientId)
        : [...prev.ingredients_used, ingredientId],
    }));
  };

  const toggleEquipment = (equipmentId: number) => {
    setFormData((prev) => ({
      ...prev,
      equipment_needed: prev.equipment_needed.includes(equipmentId)
        ? prev.equipment_needed.filter((id) => id !== equipmentId)
        : [...prev.equipment_needed, equipmentId],
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      console.log('[Step Form] Uploading image:', file.name);

      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('templateId', String(templateId));
      if (step?.id) uploadData.append('stepId', String(step.id));

      const response = await fetch('/api/upload-assembly-step-image', {
        method: 'POST',
        body: uploadData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Upload failed');
      }

      const data = await response.json();
      console.log('[Step Form] Image uploaded:', data.url);
      handleChange('step_image_url', data.url);
      setStatusMessage({ text: 'Изображението е качено успешно', type: 'success' });
    } catch (error: any) {
      console.error('[Step Form] Upload error:', error);
      setStatusMessage({ text: error.message || 'Грешка при качване', type: 'error' });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleGenerateImage = async () => {
    const description = formData.step_description_bg || formData.step_description;
    if (!description.trim()) {
      setValidationError('Нужно е описание за генерация на изображение');
      return;
    }

    try {
      setIsGenerating(true);
      console.log('[Step Form] Generating image for step:', formData.step_number);

      const response = await fetch(`/api/assembly-templates/${templateId}/generate-step-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepNumber: formData.step_number,
          description,
          hints: imageHints,
          stepId: step?.id,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Generation failed');
      }

      const data = await response.json();
      console.log('[Step Form] Image generated:', data.url);
      handleChange('step_image_url', data.url);
      setStatusMessage({ text: 'Изображението е генерирано успешно', type: 'success' });
    } catch (error: any) {
      console.error('[Step Form] Generation error:', error);
      setStatusMessage({ text: error.message || 'Грешка при генерация', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!formData.step_description_bg.trim() && !formData.step_description.trim()) {
      setValidationError('Нужно е описание на стъпката');
      return;
    }

    try {
      setIsSaving(true);
      console.log('[Step Form] Saving step:', formData.step_number);

      const payload = {
        step_number: formData.step_number,
        step_description: formData.step_description || formData.step_description_bg,
        step_description_bg: formData.step_description_bg,
        step_description_en: formData.step_description_en,
        step_duration_minutes: formData.step_duration_minutes,
        ingredients_used: formData.ingredients_used,
        equipment_needed: formData.equipment_needed,
        step_image_url: formData.step_image_url,
      };

      const url = step
        ? `/api/assembly-templates/${templateId}/steps/${step.id}`
        : `/api/assembly-templates/${templateId}/steps`;

      const response = await fetch(url, {
        method: step ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save step');
      }

      console.log('[Step Form] Saved step');
      await onSave();
    } catch (error: any) {
      console.error('[Step Form] Save error:', error);
      setValidationError(error.message || 'Грешка при запазване');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredIngredients = ingredients.filter((ing) =>
    [ing.name_en, ing.name_bg].some((n) =>
      n?.toLowerCase().includes(ingredientSearch.toLowerCase())
    )
  );

  const filteredEquipment = equipment.filter((eq) => {
    const matchesSearch = [eq.name_bg, eq.name_en, eq.name].some((n) =>
      n?.toLowerCase().includes(equipmentSearch.toLowerCase())
    );
    const matchesCategory = !equipmentCategory || eq.category === equipmentCategory;
    return matchesSearch && matchesCategory;
  });

  const equipmentCategories = [...new Set(
    equipment.map((eq) => eq.category).filter((c): c is string => Boolean(c))
  )].sort();

  const groupedEquipment = filteredEquipment.reduce((acc, eq) => {
    const cat = eq.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(eq);
    return acc;
  }, {} as Record<string, Equipment[]>);

  if (isLoadingOptions) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Status toast */}
      {statusMessage && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded-lg text-white font-medium z-[60] ${
            statusMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Title */}
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {step ? `Редактирай стъпка ${step.step_number}` : 'Нова стъпка'}
        </h2>
      </div>

      {/* Step Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Номер на стъпката
        </label>
        <input
          type="number"
          min="1"
          value={formData.step_number}
          onChange={(e) => handleChange('step_number', parseInt(e.target.value) || 1)}
          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Description BG */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Описание (Български) *
        </label>
        <textarea
          value={formData.step_description_bg}
          onChange={(e) => handleChange('step_description_bg', e.target.value)}
          placeholder="Описание на стъпката..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Description EN */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (English)
        </label>
        <textarea
          value={formData.step_description_en}
          onChange={(e) => handleChange('step_description_en', e.target.value)}
          placeholder="Step description..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Продължителност (минути)
        </label>
        <input
          type="number"
          min="0"
          max="120"
          value={formData.step_duration_minutes}
          onChange={(e) => handleChange('step_duration_minutes', parseInt(e.target.value) || 0)}
          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Ingredients Selector */}
      <div className="border-t pt-5 space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Съставки ({formData.ingredients_used.length} избрани)
        </label>

        {formData.ingredients_used.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.ingredients_used.map((ingId) => {
              const ing = ingredients.find((i) => i.id === ingId);
              return ing ? (
                <div key={ingId} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  <span>{ing.name_bg || ing.name_en}</span>
                  <button type="button" onClick={() => toggleIngredient(ingId)} className="hover:text-blue-600 ml-1">
                    <X size={13} />
                  </button>
                </div>
              ) : null;
            })}
          </div>
        )}

        <input
          type="text"
          placeholder="Търсене на съставки..."
          value={ingredientSearch}
          onChange={(e) => setIngredientSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
        />

        <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
          {filteredIngredients.length === 0 ? (
            <p className="text-sm text-gray-500 col-span-2">Няма намерени съставки</p>
          ) : (
            filteredIngredients.map((ing) => (
              <label
                key={ing.id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors text-sm ${
                  formData.ingredients_used.includes(ing.id) ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.ingredients_used.includes(ing.id)}
                  onChange={() => toggleIngredient(ing.id)}
                  className="h-4 w-4 shrink-0"
                />
                <span className="truncate">{ing.name_bg || ing.name_en}</span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Equipment Selector */}
      <div className="border-t pt-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Оборудване ({formData.equipment_needed.length} избрани / {equipment.length} общо)
          </label>
        </div>

        {formData.equipment_needed.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.equipment_needed.map((eqId) => {
              const eq = equipment.find((e) => e.id === eqId);
              return eq ? (
                <div key={eqId} className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  <span>{eq.name_bg || eq.name_en || eq.name}</span>
                  <button type="button" onClick={() => toggleEquipment(eqId)} className="hover:text-green-600 ml-1">
                    <X size={13} />
                  </button>
                </div>
              ) : null;
            })}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Търсене на оборудване..."
            value={equipmentSearch}
            onChange={(e) => setEquipmentSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
          <select
            value={equipmentCategory || ''}
            onChange={(e) => setEquipmentCategory(e.target.value || null)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white"
          >
            <option value="">Всички</option>
            {equipmentCategories.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat] || cat}
              </option>
            ))}
          </select>
        </div>

        <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg bg-gray-50">
          {Object.keys(groupedEquipment).length === 0 ? (
            <p className="text-sm text-gray-500 p-3">Няма намерено оборудване</p>
          ) : (
            Object.entries(groupedEquipment).map(([cat, items]) => (
              <div key={cat}>
                <div className="sticky top-0 bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide border-b border-gray-200">
                  {CATEGORY_LABELS[cat] || cat} ({items.length})
                </div>
                <div className="grid grid-cols-2 gap-1 p-2">
                  {items.map((eq) => (
                    <label
                      key={eq.id}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors text-sm ${
                        formData.equipment_needed.includes(eq.id) ? 'bg-green-100 text-green-900' : 'hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.equipment_needed.includes(eq.id)}
                        onChange={() => toggleEquipment(eq.id)}
                        className="h-4 w-4 shrink-0"
                      />
                      <span className="truncate">{eq.name_bg || eq.name_en || eq.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Image Section */}
      <div className="border-t pt-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <ImageIcon size={16} />
          Изображение на стъпката
        </h3>

        {/* Current image */}
        {formData.step_image_url ? (
          <div className="relative">
            <img
              src={formData.step_image_url}
              alt={`Стъпка ${formData.step_number}`}
              className="h-48 w-full object-cover rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={() => handleChange('step_image_url', null)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
            Няма изображение
          </div>
        )}

        {/* Upload + Generate grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Качи изображение
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading || isGenerating}
              className="block w-full text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50"
            />
            {isUploading && (
              <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                <Loader2 size={12} className="animate-spin" /> Качване...
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Генерирай с AI
            </label>
            <button
              type="button"
              onClick={handleGenerateImage}
              disabled={isGenerating || isUploading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Генериране...
                </>
              ) : (
                <>
                  <ImageIcon size={14} />
                  Генерирай
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI hints */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Подсказки за AI генерация (опционално)
          </label>
          <textarea
            value={imageHints}
            onChange={(e) => setImageHints(e.target.value)}
            placeholder="напр. 'покажи смесване в купа с бъркалка, естествена светлина'"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Validation error */}
      {validationError && (
        <p className="text-sm text-red-600">{validationError}</p>
      )}

      {/* Buttons */}
      <div className="flex gap-3 border-t pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:bg-purple-400"
        >
          {isSaving && <Loader2 size={16} className="animate-spin" />}
          {step ? 'Запази стъпката' : 'Създай стъпка'}
        </button>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
        >
          Отмени
        </button>
      </div>
    </div>
  );
}
