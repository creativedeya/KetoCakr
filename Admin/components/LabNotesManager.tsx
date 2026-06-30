'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Edit2, Plus, ChevronUp, ChevronDown } from 'lucide-react';

interface LabNote {
  id: number;
  recipe_id: string | null;
  category: string;
  title: string;
  title_bg: string | null;
  content: string;
  content_bg: string | null;
  display_order: number;
  is_active: boolean;
  icon: string;
  subtitle_en: string | null;
  subtitle_bg: string | null;
  image_url: string | null;
  image_alt: string | null;
}

interface LabNotesManagerProps {
  recipeId?: string | null;  // If provided, shows per-recipe mode; if null/undefined, shows standalone mode
  onUpdate?: () => void;
}

export default function LabNotesManager({ recipeId, onUpdate }: LabNotesManagerProps) {
  const isStandaloneMode = recipeId === undefined || recipeId === null;
  const isPerRecipeMode = !!recipeId;

  const [notes, setNotes] = useState<LabNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form state for new/editing note
  const [formData, setFormData] = useState({
    category: 'observation',
    title: '',
    title_bg: '',
    content: '',
    content_bg: '',
    icon: '🧪',
    subtitle_en: '',
    subtitle_bg: '',
    image_url: '',
    image_alt: '',
    is_active: true,
  });

  useEffect(() => {
    loadNotes();
  }, [recipeId]);

  async function loadNotes() {
    setLoading(true);
    try {
      let query = supabase
        .from('lab_notes')
        .select('*')
        .order('display_order', { ascending: true });

      // If in per-recipe mode, filter by recipe_id
      if (isPerRecipeMode) {
        query = query.eq('recipe_id', recipeId);
      }
      // If in standalone mode, show only notes without recipe_id
      else if (isStandaloneMode) {
        query = query.is('recipe_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveNote() {
    // Per-recipe mode requires recipe_id to be set before creating recipe
    if (isPerRecipeMode && !recipeId) {
      alert('Трябва първо да създадеш рецептата');
      return;
    }

    if (!formData.title.trim()) {
      alert('Моля, въведи заглавие');
      return;
    }

    try {
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('lab_notes')
          .update({
            category: formData.category,
            title: formData.title,
            title_bg: formData.title_bg || null,
            content: formData.content,
            content_bg: formData.content_bg || null,
            icon: formData.icon,
            subtitle_en: formData.subtitle_en || null,
            subtitle_bg: formData.subtitle_bg || null,
            image_url: formData.image_url || null,
            image_alt: formData.image_alt || null,
            is_active: formData.is_active,
          })
          .eq('id', editingId);

        if (error) throw error;
        alert('✅ Бележка обновена');
      } else {
        // Create new
        const maxOrder = notes.length > 0 ? Math.max(...notes.map(n => n.display_order)) : 0;

        const { error } = await supabase
          .from('lab_notes')
          .insert({
            recipe_id: isPerRecipeMode ? recipeId : null,
            category: formData.category,
            title: formData.title,
            title_bg: formData.title_bg || null,
            content: formData.content,
            content_bg: formData.content_bg || null,
            icon: formData.icon,
            subtitle_en: formData.subtitle_en || null,
            subtitle_bg: formData.subtitle_bg || null,
            image_url: formData.image_url || null,
            image_alt: formData.image_alt || null,
            display_order: maxOrder + 1,
            is_active: formData.is_active,
          });

        if (error) throw error;
        alert('✅ Бележка добавена');
      }

      resetForm();
      setEditingId(null);
      setIsAdding(false);
      loadNotes();
      onUpdate?.();
    } catch (error: any) {
      console.error('Error saving note:', error);
      alert(`❌ Грешка: ${error.message}`);
    }
  }

  async function deleteNote(id: number) {
    if (!confirm('Сигурен ли си че искаш да изтриеш тази бележка?')) return;

    try {
      const { error } = await supabase
        .from('lab_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('✅ Бележка изтрита');
      loadNotes();
      onUpdate?.();
    } catch (error: any) {
      console.error('Error deleting note:', error);
      alert(`❌ Грешка: ${error.message}`);
    }
  }

  async function moveNote(id: number, direction: 'up' | 'down') {
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) return;

    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === notes.length - 1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const note1 = notes[index];
    const note2 = notes[swapIndex];

    try {
      await supabase
        .from('lab_notes')
        .update({ display_order: note2.display_order })
        .eq('id', note1.id);

      await supabase
        .from('lab_notes')
        .update({ display_order: note1.display_order })
        .eq('id', note2.id);

      loadNotes();
    } catch (error) {
      console.error('Error moving note:', error);
    }
  }

  function editNote(note: LabNote) {
    setFormData({
      category: note.category,
      title: note.title,
      title_bg: note.title_bg || '',
      content: note.content,
      content_bg: note.content_bg || '',
      icon: note.icon || '🧪',
      subtitle_en: note.subtitle_en || '',
      subtitle_bg: note.subtitle_bg || '',
      image_url: note.image_url || '',
      image_alt: note.image_alt || '',
      is_active: note.is_active,
    });
    setEditingId(note.id);
    setIsAdding(true);
  }

  function resetForm() {
    setFormData({
      category: 'observation',
      title: '',
      title_bg: '',
      content: '',
      content_bg: '',
      icon: '🧪',
      subtitle_en: '',
      subtitle_bg: '',
      image_url: '',
      image_alt: '',
      is_active: true,
    });
  }

  if (isPerRecipeMode && !recipeId) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">💡 Создай рецептата първо, после ще можеш да добавиш Lab Notes</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with mode indicator */}
      {isStandaloneMode && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p className="text-sm text-purple-700">📝 <strong>Режим:</strong> Самостоятелни Lab Notes (без привързка към конкретна рецепта)</p>
        </div>
      )}

      {isPerRecipeMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">📝 <strong>Режим:</strong> Lab Notes за рецепта (recipe_id: {recipeId})</p>
        </div>
      )}

      {/* Existing Notes List */}
      {notes.length > 0 && !isAdding && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">
            {isStandaloneMode ? 'Всички Lab Notes' : `Lab Notes за Рецептата`} ({notes.length})
          </h3>
          <div className="space-y-2">
            {notes.map((note, idx) => (
              <div
                key={note.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  note.is_active
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200 opacity-50'
                }`}
              >
                <div className="text-2xl">{note.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{note.title}</div>
                  {note.title_bg && (
                    <div className="text-xs text-gray-600">{note.title_bg}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {note.category}
                    {isStandaloneMode && note.recipe_id && (
                      <span className="ml-2 text-purple-600">📎 recipe_id: {note.recipe_id}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {idx > 0 && (
                    <button
                      onClick={() => moveNote(note.id, 'up')}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <ChevronUp size={16} />
                    </button>
                  )}
                  {idx < notes.length - 1 && (
                    <button
                      onClick={() => moveNote(note.id, 'down')}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <ChevronDown size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => editNote(note)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {notes.length === 0 && !isAdding && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-3">Няма Lab Notes</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {isAdding ? (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? '✏️ Редактирай' : '➕ Нова Бележка'}
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Категория
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="observation">Observation 🔍</option>
                  <option value="issue">Issue 🐛</option>
                  <option value="improvement">Improvement 💡</option>
                  <option value="variation">Variation 🔄</option>
                  <option value="test">Test 🧪</option>
                  <option value="note">Note 📝</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value.slice(0, 2) })}
                  placeholder="🧪"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (English) *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="e.g. Sugar substitute test"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (Bulgarian)
              </label>
              <input
                type="text"
                value={formData.title_bg}
                onChange={(e) => setFormData({ ...formData, title_bg: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="напр. Тест със заместител на захар"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle (English)
                </label>
                <input
                  type="text"
                  value={formData.subtitle_en}
                  onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle (Bulgarian)
                </label>
                <input
                  type="text"
                  value={formData.subtitle_bg}
                  onChange={(e) => setFormData({ ...formData, subtitle_bg: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content (English) *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Detailed notes..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content (Bulgarian)
              </label>
              <textarea
                value={formData.content_bg}
                onChange={(e) => setFormData({ ...formData, content_bg: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Подробни бележки..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image Alt Text
                </label>
                <input
                  type="text"
                  value={formData.image_alt}
                  onChange={(e) => setFormData({ ...formData, image_alt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                Active / Видима
              </label>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <button
                onClick={() => {
                  resetForm();
                  setEditingId(null);
                  setIsAdding(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveNote}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                {editingId ? 'Update' : 'Add'} Note
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Добави Lab Note
        </button>
      )}
    </div>
  );
}
