'use client';

import { useState } from 'react';
import { useRecipeResources, RecipeResource } from '@/hooks/useRecipeResources';

const RESOURCE_TYPES = [
  { id: 'youtube',      label: 'YouTube',      icon: '📹' },
  { id: 'instagram',   label: 'Instagram',    icon: '📷' },
  { id: 'tiktok',      label: 'TikTok',       icon: '🎵' },
  { id: 'pinterest',   label: 'Pinterest',    icon: '📌' },
  { id: 'blog',        label: 'Blog',         icon: '📝' },
  { id: 'idea_source', label: 'Idea Source',  icon: '💡' },
] as const;

interface Props {
  recipeId: string;
  recipeType: 'base' | 'ready' | 'simple';
  extraTypes?: Array<'base' | 'ready' | 'simple'>;
}

export default function RecipeResourcesManager({ recipeId, recipeType, extraTypes }: Props) {
  const { resources, loading, addResource, deleteResource } = useRecipeResources(recipeId, recipeType, extraTypes);

  const [isAdding, setIsAdding] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!selectedType || !url.trim()) {
      alert('Попълни тип и URL');
      return;
    }
    setSaving(true);
    try {
      await addResource({
        recipe_id: recipeId,
        recipe_type: recipeType,
        resource_type: selectedType as RecipeResource['resource_type'],
        url: url.trim(),
        title: title.trim() || undefined,
        description: description.trim() || undefined,
      });
      setUrl('');
      setTitle('');
      setDescription('');
      setSelectedType('');
      setIsAdding(false);
    } catch (err: any) {
      alert(`Грешка: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Изтрий ресурса?')) return;
    try {
      await deleteResource(id);
    } catch (err: any) {
      alert(`Грешка: ${err.message}`);
    }
  }

  const getIcon = (type: string) => RESOURCE_TYPES.find(r => r.id === type)?.icon ?? '🔗';
  const getLabel = (type: string) => RESOURCE_TYPES.find(r => r.id === type)?.label ?? type;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">🔗 Ресурси</h2>

      {loading && <p className="text-sm text-gray-500">Зареждане...</p>}

      {resources.length > 0 && (
        <div className="space-y-2 mb-4">
          {resources.map(r => (
            <div key={r.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <span className="text-xl">{getIcon(r.resource_type)}</span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-purple-700 uppercase">{getLabel(r.resource_type)}</span>
                {r.title && <p className="text-sm font-medium text-gray-800 truncate">{r.title}</p>}
                <a href={r.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline truncate block">
                  {r.url}
                </a>
                {r.description && <p className="text-xs text-gray-500 mt-1 italic">{r.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(r.id)}
                className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {!isAdding ? (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
        >
          + Добави Ресурс
        </button>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Тип</label>
            <div className="flex flex-wrap gap-2">
              {RESOURCE_TYPES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedType(t.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    selectedType === t.id
                      ? 'bg-purple-100 border-purple-500 text-purple-800 font-medium'
                      : 'border-gray-300 text-gray-600 hover:border-purple-400'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Заглавие (по избор)</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Заглавие..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание (по избор)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Описание..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setIsAdding(false); setSelectedType(''); setUrl(''); setTitle(''); setDescription(''); }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              Отмяна
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? 'Добавяне...' : 'Добави'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
