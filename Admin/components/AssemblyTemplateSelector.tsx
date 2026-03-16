'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AssemblyTemplate {
  id: number;
  template_key: string;
  name: string;
  name_en: string;
  description?: string;
  instructions: string;
  soaking_required: boolean;
}

interface AssemblyTemplateSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function AssemblyTemplateSelector({ value, onChange, disabled }: AssemblyTemplateSelectorProps) {
  const [templates, setTemplates] = useState<AssemblyTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  
  const [newTemplate, setNewTemplate] = useState({
    template_key: '',
    name: '',
    name_en: '',
    description: '',
    instructions: '',
    soaking_required: false
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      const { data, error } = await supabase
        .from('assembly_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading assembly templates:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTemplate() {
    if (!newTemplate.template_key || !newTemplate.name || !newTemplate.instructions) {
      alert('Моля попълнете Template Key, Име и Инструкции!');
      return;
    }

    setAdding(true);
    try {
      const { data, error } = await supabase
        .from('assembly_templates')
        .insert([newTemplate])
        .select()
        .single();

      if (error) throw error;

      setTemplates([...templates, data]);
      onChange(data.template_key);
      setShowAddModal(false);
      setNewTemplate({
        template_key: '',
        name: '',
        name_en: '',
        description: '',
        instructions: '',
        soaking_required: false
      });
      alert('Шаблонът беше добавен успешно!');
    } catch (error: any) {
      console.error('Error adding template:', error);
      alert(`Грешка: ${error.message}`);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        {/* Dropdown */}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
        >
          <option value="">-- Изберете шаблон --</option>
          {templates.map(template => (
            <option key={template.id} value={template.template_key}>
              {template.name} / {template.name_en}
              {template.soaking_required ? ' 💧' : ''}
            </option>
          ))}
        </select>

        {/* Add New Button */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap"
        >
          + Нов
        </button>
      </div>

      {/* Selected Template Info */}
      {value && templates.find(t => t.template_key === value) && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="text-blue-800 font-medium">
            {templates.find(t => t.template_key === value)?.description || 'Няма описание'}
          </p>
          <p className="text-blue-700 mt-2 text-xs">
            📋 {templates.find(t => t.template_key === value)?.instructions}
          </p>
          {templates.find(t => t.template_key === value)?.soaking_required && (
            <p className="text-blue-600 mt-1 font-medium">💧 Изисква накисване</p>
          )}
        </div>
      )}

      {/* Add Template Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Добави Нов Шаблон</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Key (уникален) *
                </label>
                <input
                  type="text"
                  value={newTemplate.template_key}
                  onChange={(e) => setNewTemplate({ ...newTemplate, template_key: e.target.value })}
                  placeholder="sponge_soaked"
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Използвай само английски букви, цифри и _</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Име (Български) *
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="Пандишпан (накиснат)"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Име (Английски)
                </label>
                <input
                  type="text"
                  value={newTemplate.name_en}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name_en: e.target.value })}
                  placeholder="Sponge Cake (soaked)"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  rows={2}
                  placeholder="Кратко описание на шаблона..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Инструкции *
                </label>
                <textarea
                  value={newTemplate.instructions}
                  onChange={(e) => setNewTemplate({ ...newTemplate, instructions: e.target.value })}
                  rows={3}
                  placeholder="Как да се използва този шаблон..."
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newTemplate.soaking_required}
                    onChange={(e) => setNewTemplate({ ...newTemplate, soaking_required: e.target.checked })}
                    className="rounded text-purple-600"
                  />
                  <span className="text-sm">💧 Изисква накисване</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Отказ
              </button>
              <button
                type="button"
                onClick={handleAddTemplate}
                disabled={adding}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {adding ? 'Добавяне...' : 'Добави'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
