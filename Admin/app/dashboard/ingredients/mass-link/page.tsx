'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Link2, ChevronRight, ChevronLeft, CheckCircle2, Loader2 } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UnlinkedGroup {
  canonical: string;
  variations: string[];
  count: number;
  suggested: string;
  hasVariations: boolean;
}

interface Suggestion {
  ingredientName: string;
  recordCount: number;
  match: { id: string; name: string; score: number } | null;
  allMatches: { id: string; name: string; score: number }[];
  highConfidence: boolean;
}

// ─── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  const steps = ['Предв. почистване', 'Нормализиране', 'Авто-линкване', 'Ръчен преглед'];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => {
        const done = current > i;
        const active = current === i;
        return (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${done ? 'bg-green-500 text-white' : active ? 'bg-[#A80048] text-white' : 'bg-gray-200 text-gray-500'}`}
            >
              {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-sm ${active ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
              {label}
            </span>
            {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 0: Pre-Cleanup ─────────────────────────────────────────────────────

interface CleanupCandidate {
  id: number;
  originalName: string;
  cleanedName: string;
  recipeId: string;
}

function Step0PreCleanup({ onNext }: { onNext: () => void }) {
  const [candidates, setCandidates] = useState<CleanupCandidate[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ingredients/needs-cleanup');
      const data = await res.json();
      setCandidates(data.candidates);
      setSelected(new Set(data.candidates.map((_: CleanupCandidate, idx: number) => idx)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  const handleApplyCleanup = async () => {
    setSaving(true);
    try {
      const cleanups = Array.from(selected).map((idx) => candidates[idx]);
      console.log('🚀 Sending pre-cleanup request:', cleanups.length, 'items');
      const res = await fetch('/api/ingredients/pre-cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cleanups }),
      });
      const data = await res.json();
      console.log('✅ Pre-cleanup response:', data);
      if (data.success) {
        alert(`Успешно! Почистени ${data.updatedRecords} имена на съставки.`);
        onNext();
      } else {
        alert(data.error || 'Грешка при почистване.');
      }
    } catch (error) {
      console.error('❌ Pre-cleanup error:', error);
      alert('Грешка при почистване на имената.');
    } finally {
      setSaving(false);
    }
  };

  const toggleSelect = (idx: number) => {
    const next = new Set(selected);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelected(next);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 py-12">
        <Loader2 className="w-5 h-5 animate-spin" /> Зареждане...
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✨</div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Имената са чисти!</h2>
        <p className="text-gray-600 mb-6">Няма скоби в имената на несвързаните съставки.</p>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-[#A80048] text-white rounded hover:bg-[#8a003c]"
        >
          Продължи към Стъпка 2 →
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        Намерени <strong>{candidates.length}</strong> имена на съставки със скоби, които могат да попречат на съвпадението.
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setSelected(new Set(candidates.map((_, idx) => idx)))}
          className="px-4 py-2 border rounded hover:bg-gray-50 text-sm"
        >
          Избери всички
        </button>
        <button
          onClick={() => setSelected(new Set())}
          className="px-4 py-2 border rounded hover:bg-gray-50 text-sm"
        >
          Премахни избора
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3 w-12 text-left">Избор</th>
              <th className="p-3 text-left">Оригинално име</th>
              <th className="p-3 text-left">Почистено име</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {candidates.map((candidate, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={selected.has(idx)}
                    onChange={() => toggleSelect(idx)}
                    className="h-5 w-5 accent-[#A80048]"
                  />
                </td>
                <td className="p-3 text-gray-500 text-sm">{candidate.originalName}</td>
                <td className="p-3 font-medium text-sm">{candidate.cleanedName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleApplyCleanup}
          disabled={saving || selected.size === 0}
          className="px-5 py-2 bg-[#A80048] text-white rounded hover:bg-[#8a003c] disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Прилагане...' : `Приложи почистване (${selected.size} имена)`}
        </button>
        <button
          onClick={onNext}
          className="px-5 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
        >
          Пропусни <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 1: Normalize ───────────────────────────────────────────────────────

function Step1Normalize({ onNext }: { onNext: () => void }) {
  const [groups, setGroups] = useState<UnlinkedGroup[]>([]);
  const [totalUnlinked, setTotalUnlinked] = useState(0);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showOnlyVariations, setShowOnlyVariations] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ingredients/unlinked-summary');
      const data = await res.json();
      setGroups(data.groups || []);
      setTotalUnlinked(data.totalUnlinked || 0);

      // Pre-check groups with variations
      const preChecked = new Set<string>();
      for (const g of data.groups || []) {
        if (g.hasVariations) preChecked.add(g.canonical);
      }
      setChecked(preChecked);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getTargetName = (g: UnlinkedGroup) =>
    overrides[g.canonical] !== undefined ? overrides[g.canonical] : g.suggested;

  const selectedCount = checked.size;
  const selectedRecords = groups
    .filter((g) => checked.has(g.canonical))
    .reduce((sum, g) => sum + g.count, 0);

  const handleNormalize = async () => {
    setSaving(true);
    try {
      const mappings = groups
        .filter((g) => checked.has(g.canonical))
        .map((g) => ({
          from: g.variations,
          to: getTargetName(g),
        }))
        .filter((m) => m.to.trim() !== '');

      console.log('🚀 Sending normalize request:', mappings.length, 'mappings');
      const res = await fetch('/api/ingredients/normalize-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mappings }),
      });
      const data = await res.json();
      console.log('✅ Normalize response:', data);
      alert(`Успешно! Обновени ${data.totalUpdated} записа.`);
      onNext();
    } catch (error) {
      console.error('❌ Normalize error:', error);
      alert('Грешка при нормализиране.');
    } finally {
      setSaving(false);
    }
  };

  const displayed = showOnlyVariations ? groups.filter((g) => g.hasVariations) : groups;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 py-12">
        <Loader2 className="w-5 h-5 animate-spin" /> Зареждане...
      </div>
    );
  }

  return (
    <div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between">
        <div>
          Намерени <strong>{totalUnlinked}</strong> несвързани записа с{' '}
          <strong>{groups.length}</strong> уникални имена
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowOnlyVariations(false)}
            className={`px-3 py-1 rounded text-sm ${!showOnlyVariations ? 'bg-blue-600 text-white' : 'border text-gray-600 hover:bg-gray-50'}`}
          >
            Всички ({groups.length})
          </button>
          <button
            onClick={() => setShowOnlyVariations(true)}
            className={`px-3 py-1 rounded text-sm ${showOnlyVariations ? 'bg-blue-600 text-white' : 'border text-gray-600 hover:bg-gray-50'}`}
          >
            Само вариации ({groups.filter((g) => g.hasVariations).length})
          </button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3 w-8"></th>
              <th className="p-3 text-left">Текущо име / вариации</th>
              <th className="p-3 text-center w-20">Брой</th>
              <th className="p-3 text-left">Нормализирай до</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayed.map((g) => (
              <tr
                key={g.canonical}
                className={g.hasVariations ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-gray-50'}
              >
                <td className="p-3 text-center">
                  {g.hasVariations && (
                    <input
                      type="checkbox"
                      checked={checked.has(g.canonical)}
                      onChange={(e) => {
                        const next = new Set(checked);
                        if (e.target.checked) next.add(g.canonical);
                        else next.delete(g.canonical);
                        setChecked(next);
                      }}
                      className="h-4 w-4 accent-[#A80048]"
                    />
                  )}
                </td>
                <td className="p-3">
                  <div className="font-medium text-gray-800">{g.canonical}</div>
                  {g.hasVariations && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      + {g.variations.filter((v) => v !== g.canonical).join(', ')}
                    </div>
                  )}
                </td>
                <td className="p-3 text-center text-gray-600">{g.count} ×</td>
                <td className="p-3">
                  {g.hasVariations ? (
                    <input
                      type="text"
                      value={getTargetName(g)}
                      onChange={(e) =>
                        setOverrides({ ...overrides, [g.canonical]: e.target.value })
                      }
                      className="border rounded px-2 py-1 w-full text-sm focus:outline-none focus:ring-1 focus:ring-[#A80048]"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs">— без промяна —</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Избрани: <strong>{selectedCount}</strong> групи ({selectedRecords} записа)
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleNormalize}
            disabled={saving || selectedCount === 0}
            className="px-5 py-2 bg-[#A80048] text-white rounded hover:bg-[#8a003c] disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Обработка...' : `Нормализирай (${selectedRecords} записа)`}
          </button>
          <button
            onClick={onNext}
            className="px-5 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
          >
            Пропусни <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Auto-link ───────────────────────────────────────────────────────

function Step2AutoLink({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ingredients/match-suggestions');
      const data = await res.json();
      const sugs: Suggestion[] = data.suggestions || [];
      setSuggestions(sugs);

      const preSelected = new Set(
        sugs.filter((s) => s.highConfidence && s.match).map((s) => s.ingredientName)
      );
      setSelected(preSelected);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const highConf = suggestions.filter((s) => s.highConfidence);
  const lowConf = suggestions.filter((s) => !s.highConfidence);

  const selectedRecords = suggestions
    .filter((s) => selected.has(s.ingredientName))
    .reduce((sum, s) => sum + s.recordCount, 0);

  const handleAutoLink = async () => {
    setSaving(true);
    try {
      const matches = suggestions
        .filter((s) => selected.has(s.ingredientName) && s.match)
        .map((s) => ({ ingredientName: s.ingredientName, databaseId: s.match!.id }));

      console.log('🚀 Sending auto-link request:', matches.length, 'matches');
      const res = await fetch('/api/ingredients/auto-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matches }),
      });
      const data = await res.json();
      console.log('✅ Auto-link response:', data);
      alert(`Успешно! Свързани ${data.totalLinked} записа.`);
      onNext();
    } catch (error) {
      console.error('❌ Auto-link error:', error);
      alert('Грешка при авато-линкване.');
    } finally {
      setSaving(false);
    }
  };

  const toggle = (name: string) => {
    const next = new Set(selected);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setSelected(next);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 py-12">
        <Loader2 className="w-5 h-5 animate-spin" /> Зареждане на съвпадения...
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-700">{highConf.length}</div>
          <div className="text-sm text-green-600">Висока увереност (&gt;90%) — готови за авто-линкване</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-700">{lowConf.length}</div>
          <div className="text-sm text-yellow-600">Ниска увереност (&lt;90%) — ръчен преглед</div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3 w-8"></th>
              <th className="p-3 text-left">Съставка</th>
              <th className="p-3 text-center w-20">Записа</th>
              <th className="p-3 text-left">Най-добро съвпадение</th>
              <th className="p-3 text-center w-20">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {suggestions.map((s) => (
              <tr
                key={s.ingredientName}
                className={s.highConfidence ? 'bg-green-50 hover:bg-green-100' : 'bg-yellow-50 hover:bg-yellow-100'}
              >
                <td className="p-3 text-center">
                  {s.match && (
                    <input
                      type="checkbox"
                      checked={selected.has(s.ingredientName)}
                      onChange={() => toggle(s.ingredientName)}
                      className="h-4 w-4 accent-[#A80048]"
                    />
                  )}
                </td>
                <td className="p-3 font-medium text-gray-800">{s.ingredientName}</td>
                <td className="p-3 text-center text-gray-600">{s.recordCount} ×</td>
                <td className="p-3 text-gray-700">{s.match?.name ?? <span className="text-gray-400">— няма съвпадение —</span>}</td>
                <td className="p-3 text-center">
                  {s.match && (
                    <span
                      className={`font-semibold ${s.highConfidence ? 'text-green-600' : 'text-yellow-600'}`}
                    >
                      {s.match.score}%
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button onClick={onBack} className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Назад
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleAutoLink}
            disabled={saving || selected.size === 0}
            className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Свързване...' : `Свържи избраните (${selectedRecords} записа)`}
          </button>
          <button onClick={onNext} className="px-5 py-2 border rounded hover:bg-gray-50 flex items-center gap-1">
            Пропусни <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Manual Review ───────────────────────────────────────────────────

function CreateNewIngredientModal({
  currentName,
  onSuccess,
  onCancel,
}: {
  currentName: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [nameBg, setNameBg] = useState(currentName);
  const [nameEn, setNameEn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ingredients/create-and-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredientName: currentName,
          canonicalNameBg: nameBg,
          canonicalNameEn: nameEn,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || 'Грешка при създаване.');
      }
    } catch {
      setError('Заявката неуспешна.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
        <h3 className="text-lg font-bold mb-4">Създай нова съставка</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Име (Български)</label>
            <input
              type="text"
              value={nameBg}
              onChange={(e) => setNameBg(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#A80048]"
              placeholder="Яйчен белтък"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Име (English) — незадължително</label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#A80048]"
              placeholder="Egg white"
            />
          </div>
          <p className="text-sm text-gray-500">
            Хранителните стойности ще са 0 — можеш да ги редактираш после в Ingredients Database.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleCreate}
            disabled={loading || !nameBg.trim()}
            className="flex-1 px-4 py-2 bg-[#A80048] text-white rounded hover:bg-[#8a003c] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Създава се...' : 'Създай & Свържи'}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-50 text-sm"
          >
            Откажи
          </button>
        </div>
      </div>
    </div>
  );
}

function ManualReviewItem({
  item,
  index,
  onLinked,
}: {
  item: Suggestion;
  index: number;
  onLinked: () => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(item.ingredientName);
  const [extraMatches, setExtraMatches] = useState(item.allMatches);
  const [linking, setLinking] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleLink = async (databaseId: string) => {
    setLinking(databaseId);
    try {
      await fetch('/api/ingredients/auto-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matches: [{ ingredientName: item.ingredientName, databaseId }],
        }),
      });
      onLinked();
    } finally {
      setLinking(null);
    }
  };

  const handleSearch = async () => {
    setSearching(true);
    try {
      // Normalize name first
      await fetch('/api/ingredients/normalize-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mappings: [{ from: [item.ingredientName], to: editName }] }),
      });
      // Fetch new matches for new name
      const res = await fetch('/api/recipe-ingredients/suggest-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredientName: editName }),
      });
      const data = await res.json();
      setExtraMatches(
        (data.matches || []).map((m: any) => ({ ...m, score: Math.round(m.score * 100) }))
      );
      setEditMode(false);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="font-semibold text-lg mb-3 text-gray-800">
        {index}. {item.ingredientName}{' '}
        <span className="text-sm font-normal text-gray-500">({item.recordCount} записа)</span>
      </div>

      <div className="space-y-2 mb-3">
        {extraMatches.map((match) => (
          <div
            key={match.id}
            className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded border"
          >
            <span className="text-sm">
              {match.name}{' '}
              <span className="text-gray-400 text-xs">({match.score}%)</span>
            </span>
            <button
              onClick={() => handleLink(match.id)}
              disabled={!!linking}
              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
            >
              {linking === match.id && <Loader2 className="w-3 h-3 animate-spin" />}
              Свържи {item.recordCount} записа
            </button>
          </div>
        ))}
        {extraMatches.length === 0 && (
          <div className="text-sm text-gray-400 italic">Няма съвпадения</div>
        )}
      </div>

      {editMode ? (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="flex-1 border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#A80048]"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-3 py-1.5 bg-[#A80048] text-white text-sm rounded hover:bg-[#8a003c] disabled:opacity-50 flex items-center gap-1"
          >
            {searching && <Loader2 className="w-3 h-3 animate-spin" />}
            Търси
          </button>
          <button
            onClick={() => setEditMode(false)}
            className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50"
          >
            Отказ
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditMode(true)}
          className="text-sm text-[#A80048] hover:underline"
        >
          ✏️ Промени името и търси отново
        </button>
      )}

      <div className="mt-3 pt-3 border-t">
        <button
          onClick={() => setShowCreateModal(true)}
          className="text-sm text-[#A80048] hover:underline"
        >
          ➕ Няма подходящо съвпадение? Създай нова съставка
        </button>
      </div>

      {showCreateModal && (
        <CreateNewIngredientModal
          currentName={item.ingredientName}
          onSuccess={() => {
            setShowCreateModal(false);
            onLinked();
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

function Step3ManualReview({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ingredients/match-suggestions');
      const data = await res.json();
      setItems((data.suggestions || []).filter((s: Suggestion) => !s.highConfidence));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 py-12">
        <Loader2 className="w-5 h-5 animate-spin" /> Зареждане...
      </div>
    );
  }

  return (
    <div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        Оставащи несвързани: <strong>{items.length}</strong> съставки,{' '}
        <strong>{items.reduce((sum, i) => sum + i.recordCount, 0)}</strong> записа
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-green-600 mb-2">Готово!</h2>
          <p className="text-gray-500">Всички съставки са свързани с базата данни.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => (
            <ManualReviewItem
              key={item.ingredientName}
              item={item}
              index={idx + 1}
              onLinked={fetchData}
            />
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button onClick={onBack} className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Назад
        </button>
        <button
          onClick={() => router.push('/dashboard/ingredients')}
          className="px-6 py-2 bg-[#A80048] text-white rounded hover:bg-[#8a003c]"
        >
          Готово — към съставки
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MassLinkPage() {
  const [step, setStep] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const goToStep = (nextStep: number) => {
    setStep(nextStep);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-2">
        <Link2 className="w-6 h-6 text-[#A80048]" />
        <h1 className="text-2xl font-bold text-gray-900">Global Ingredient Tool</h1>
      </div>
      <p className="text-gray-500 mb-6 text-sm">
        Масово нормализиране и свързване на несвързани съставки в рецептите.
      </p>

      <StepIndicator current={step} />

      {step === 0 && <Step0PreCleanup key={`step0-${refreshKey}`} onNext={() => goToStep(1)} />}
      {step === 1 && <Step1Normalize key={`step1-${refreshKey}`} onNext={() => goToStep(2)} />}
      {step === 2 && <Step2AutoLink key={`step2-${refreshKey}`} onNext={() => goToStep(3)} onBack={() => goToStep(1)} />}
      {step === 3 && <Step3ManualReview key={`step3-${refreshKey}`} onBack={() => goToStep(2)} />}
    </div>
  );
}
