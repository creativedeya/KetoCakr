'use client';

import { useState } from 'react';
import Link from 'next/link';

const EXAMPLE = JSON.stringify([
  {
    arcana_type: 'major',
    card_number: 0,
    card_name: 'Луд',
    card_name_en: 'The Fool',
    theme: 'Лек чийзкейк без печене',
    theme_en: 'Light no-bake cheesecake',
    daily_phrase: 'Всеки нов ден е чиста страница.',
    daily_phrase_en: 'Every new day is a blank page.',
    energy_word: 'Свобода',
    energy_word_en: 'Freedom',
    morning_tip: 'Опитай нова кето рецепта.',
    morning_tip_en: 'Try a new keto recipe.',
    daily_trap: 'Не прескачай подготовката.',
    daily_trap_en: "Don't skip preparation.",
    evening_question: 'Какво ново научих днес?',
    evening_question_en: 'What new thing did I learn today?',
    linked_recipe_id: null,
    card_image_url: null,
    is_published: false,
  },
], null, 2);

interface ImportResult {
  success?: boolean;
  imported?: number;
  error?: string;
  details?: string[];
  data?: any[];
}

export default function TarotBulkImportPage() {
  const [json, setJson] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleImport() {
    setResult(null);

    let parsed: any[];
    try {
      parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) throw new Error('JSON трябва да е масив ([ ... ])');
    } catch (err: any) {
      setResult({ error: 'Невалиден JSON: ' + err.message });
      return;
    }

    setImporting(true);
    try {
      const res = await fetch('/api/tarot-cards/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const data: ImportResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <Link href="/dashboard/tarot-cards" className="text-sm text-gray-400 hover:text-gray-600 mb-3 inline-block">
          ← Tarot Cards
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">📥 Bulk Import — Tarot Cards</h1>
        <p className="text-sm text-gray-500 mt-1">
          Постави JSON масив с карти. Ако картата вече съществува (по <code>arcana_type + suit + card_number</code>), данните ще бъдат обновени (upsert).
        </p>
      </div>

      {/* JSON schema reference */}
      <section className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-sm">
        <p className="font-semibold text-gray-700 mb-2">Задължителни полета:</p>
        <ul className="list-disc list-inside text-gray-600 space-y-0.5 mb-3">
          <li><code>arcana_type</code> — <code>"major"</code> или <code>"minor"</code></li>
          <li><code>card_number</code> — число (Major: 0–21, Minor: 1–14)</li>
          <li><code>card_name</code> — BG</li>
          <li><code>daily_phrase</code>, <code>energy_word</code>, <code>morning_tip</code>, <code>daily_trap</code>, <code>evening_question</code></li>
          <li>При Minor Arcana: <code>suit</code> — <code>"pentacles"</code> / <code>"cups"</code> / <code>"swords"</code> / <code>"wands"</code></li>
        </ul>
        <details>
          <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
            Виж примерен JSON за 1 карта
          </summary>
          <pre className="mt-2 p-3 bg-white border border-gray-200 rounded text-xs overflow-x-auto">
            {EXAMPLE}
          </pre>
        </details>
      </section>

      {/* JSON textarea */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          JSON масив с карти
        </label>
        <textarea
          value={json}
          onChange={e => setJson(e.target.value)}
          rows={20}
          placeholder={'[\n  { ... },\n  { ... }\n]'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-500 resize-y"
        />
        <p className="text-xs text-gray-400 mt-1">
          {json.trim() ? `${json.trim().length} символа` : 'Paste JSON тук...'}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleImport}
          disabled={importing || !json.trim()}
          className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 text-white rounded-lg font-medium text-sm transition"
        >
          {importing ? '⟳ Импортиране...' : '📥 Импортирай'}
        </button>
        <button
          onClick={() => { setJson(''); setResult(null); }}
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition"
        >
          Изчисти
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-lg p-4 border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          {result.success ? (
            <div>
              <p className="font-semibold text-green-800 text-sm">
                ✅ Успешно импортирани {result.imported} карт(и)!
              </p>
              {result.data && result.data.length > 0 && (
                <ul className="mt-2 text-xs text-green-700 space-y-0.5 max-h-40 overflow-y-auto">
                  {result.data.map((c: any, i: number) => (
                    <li key={i}>
                      {c.arcana_type} · {c.suit || '—'} · #{c.card_number} — {c.card_name}
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/dashboard/tarot-cards"
                className="inline-block mt-3 text-sm text-green-700 underline hover:text-green-900"
              >
                Виж всички карти →
              </Link>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-red-800 text-sm">❌ {result.error}</p>
              {result.details && result.details.length > 0 && (
                <ul className="mt-2 text-xs text-red-700 space-y-0.5 max-h-60 overflow-y-auto list-disc list-inside">
                  {result.details.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
