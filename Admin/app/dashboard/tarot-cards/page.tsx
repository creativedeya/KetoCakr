'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface TarotCard {
  id: string;
  card_number: number;
  suit: string | null;
  arcana_type: 'major' | 'minor';
  card_name: string;
  card_name_en: string | null;
  theme: string | null;
  recipe_role_id: number | null;
  linked_recipe_id: string | null;
  is_published: boolean;
  card_image_url: string | null;
  energy_word: string;
  daily_phrase: string;
  morning_tip: string;
  daily_trap: string;
  evening_question: string;
}

const SUIT_LABELS: Record<string, string> = {
  pentacles: 'Пентакли',
  cups: 'Чаши',
  swords: 'Мечове',
  wands: 'Жезли',
};

const SUIT_COLORS: Record<string, string> = {
  pentacles: 'bg-yellow-100 text-yellow-800',
  cups: 'bg-blue-100 text-blue-800',
  swords: 'bg-gray-100 text-gray-800',
  wands: 'bg-orange-100 text-orange-800',
};

function formatCardNumber(card: TarotCard): string {
  if (card.arcana_type === 'major') {
    const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
      'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];
    return ROMAN[card.card_number] ?? String(card.card_number);
  }
  const MINOR_LABELS: Record<number, string> = { 11: 'Пажа', 12: 'Рицаря', 13: 'Кралицата', 14: 'Краля' };
  if (card.card_number === 1) return 'Асо';
  return MINOR_LABELS[card.card_number] ?? String(card.card_number);
}

function isCardComplete(card: TarotCard): boolean {
  return !!(
    card.card_name &&
    card.daily_phrase &&
    card.energy_word &&
    card.morning_tip &&
    card.daily_trap &&
    card.evening_question
  );
}

type FilterType = 'all' | 'major' | 'pentacles' | 'cups' | 'swords' | 'wands';

export default function TarotCardsPage() {
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/tarot-cards');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setCards(json.data || []);
    } catch (err: any) {
      setLoadError(err.message);
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = cards.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'major') return c.arcana_type === 'major';
    return c.suit === filter;
  });

  const completedCount = cards.filter(isCardComplete).length;

  async function deleteCard(id: string, name: string) {
    if (!confirm(`Изтрий "${name}"? Това не може да се отмени.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/tarot-cards/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setCards(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert('Грешка: ' + err.message);
    } finally {
      setDeleting(null);
    }
  }

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Всички' },
    { key: 'major', label: 'Major Arcana' },
    { key: 'pentacles', label: 'Пентакли' },
    { key: 'cups', label: 'Чаши' },
    { key: 'swords', label: 'Мечове' },
    { key: 'wands', label: 'Жезли' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">🃏 Tarot Cards</h1>
          <p className="text-sm text-gray-500 mt-1">Управление на 78-те карти</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/tarot-cards/import"
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium text-sm transition"
          >
            📥 Bulk Import
          </Link>
          <Link
            href="/dashboard/tarot-cards/new"
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium text-sm transition"
          >
            + Добави Карта
          </Link>
        </div>
      </div>

      {/* Progress + Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="col-span-2 bg-white rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Прогрес на попълване</span>
            <span className="text-sm font-bold text-gray-900">{completedCount} от 78 карти попълнени</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-rose-600 h-2 rounded-full transition-all"
              style={{ width: `${(completedCount / 78) * 100}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border text-center">
          <div className="text-2xl font-bold text-gray-900">{cards.length}</div>
          <div className="text-xs text-gray-500">Общо</div>
        </div>
        <div className="bg-white rounded-lg p-4 border text-center">
          <div className="text-2xl font-bold text-green-600">{cards.filter(c => c.is_published).length}</div>
          <div className="text-xs text-gray-500">Публикувани</div>
        </div>
      </div>

      {/* Error */}
      {loadError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <strong>Грешка при зареждане:</strong> {loadError}
        </div>
      )}

      {/* Filter chips */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              filter === f.key
                ? 'bg-rose-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:border-rose-400'
            }`}
          >
            {f.label}
            <span className="ml-1.5 text-xs opacity-70">
              ({f.key === 'all' ? cards.length
                : f.key === 'major' ? cards.filter(c => c.arcana_type === 'major').length
                : cards.filter(c => c.suit === f.key).length})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Зареждане...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">🃏</div>
            <p className="text-gray-500 font-medium">Няма карти.</p>
            <Link href="/dashboard/tarot-cards/new"
              className="inline-block mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm hover:bg-rose-700 transition">
              + Добави Карта
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-600">Карта</th>
                <th className="px-4 py-3 font-medium text-gray-600">Масть / Тип</th>
                <th className="px-4 py-3 font-medium text-gray-600">Тема</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-center">Рецепта</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-center">Статус</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-center">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(card => {
                const complete = isCardComplete(card);
                const hasRecipeLink = !!(card.linked_recipe_id || card.recipe_role_id);
                return (
                  <tr key={card.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {card.card_image_url ? (
                          <img
                            src={card.card_image_url}
                            alt={card.card_name}
                            style={{ width: 36, height: 56, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{
                            width: 36, height: 56, borderRadius: 4, flexShrink: 0,
                            backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: 16
                          }}>🃏</div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900 text-xs text-gray-400 mb-0.5">
                            {formatCardNumber(card)}
                          </div>
                          <div className="font-medium text-gray-900">{card.card_name}</div>
                          {card.card_name_en && (
                            <div className="text-xs text-gray-400">{card.card_name_en}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {card.arcana_type === 'major' ? (
                        <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          Major Arcana
                        </span>
                      ) : (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${SUIT_COLORS[card.suit || ''] || 'bg-gray-100 text-gray-800'}`}>
                          {SUIT_LABELS[card.suit || ''] || card.suit}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm max-w-[200px] truncate">
                      {card.theme || <span className="text-gray-300 italic">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hasRecipeLink ? (
                        <span title={card.linked_recipe_id ? 'Linked recipe' : 'Recipe role'}>✅</span>
                      ) : (
                        <span title="No recipe link">⚠️</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {card.is_published ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            ✓ Публикувана
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                            Draft
                          </span>
                        )}
                        {!complete && (
                          <span className="text-xs text-amber-600">⚠️ непълна</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/dashboard/tarot-cards/${card.id}`}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 transition font-medium"
                        >
                          ✏️ Редактирай
                        </Link>
                        <button
                          onClick={() => deleteCard(card.id, card.card_name)}
                          disabled={deleting === card.id}
                          className="px-3 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100 transition font-medium disabled:opacity-50"
                        >
                          {deleting === card.id ? '...' : '🗑'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 mt-2 text-right">{filtered.length} карт(и)</p>
      )}
    </div>
  );
}
