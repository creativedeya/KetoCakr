'use client';

import { useState } from 'react';

interface RecipeLabNotesProps {
  notesBg: string;
  notesEn: string;
  onNotesChange: (notesBg: string, notesEn: string) => void;
}

export function RecipeLabNotes({ notesBg, notesEn, onNotesChange }: RecipeLabNotesProps) {
  const [activeTab, setActiveTab] = useState<'bg' | 'en'>('bg');

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900">📝 Lab Notes за Рецептата</span>
        <span className="text-xs text-gray-500">(само ако е необходимо уточнение)</span>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('bg')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'bg'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          На Български
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('en')}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'en'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          In English
        </button>
      </div>

      {activeTab === 'bg' && (
        <textarea
          value={notesBg}
          onChange={e => onNotesChange(e.target.value, notesEn)}
          placeholder="Напр: 'Яйцата трябва да са стайна температура за по-добра емулсификация. Внимание: НЕ миксирайте прекалено много - рискувате да развалите меренгата.'"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm font-mono resize-none"
        />
      )}

      {activeTab === 'en' && (
        <textarea
          value={notesEn}
          onChange={e => onNotesChange(notesBg, e.target.value)}
          placeholder="E.g: 'Eggs must be room temperature for better emulsification. Warning: Do not overmix - you risk breaking the meringue.'"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm font-mono resize-none"
        />
      )}

      <div className="text-xs text-gray-500">
        {activeTab === 'bg' ? notesBg.length : notesEn.length} символа
      </div>

      <div className="bg-blue-50 border border-blue-200 p-2 rounded text-xs text-blue-900">
        💡 Lab notes се показват в информацията за рецептата. Използвайте за:
        <br />• Уточнения за техниката
        <br />• Предупреждения (не миксирайте много, не прегрявайте, и т.н.)
        <br />• Алтернативи на съставки
        <br />• Съвети за съхранение
      </div>
    </div>
  );
}
