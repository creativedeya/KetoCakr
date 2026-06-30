'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Plus, Upload, Pencil, Trash2, BookOpen, FileText } from 'lucide-react';
import type { LabNote, LabNoteCategory } from '@/lib/types/labNotes';

type TypeFilter = 'all' | 'knowledge' | 'recipe';

const TYPE_TABS: { value: TypeFilter; label: string; icon: React.ReactNode }[] = [
  { value: 'all',       label: 'All Notes',     icon: null },
  { value: 'knowledge', label: 'Knowledge Base', icon: <BookOpen size={13} /> },
  { value: 'recipe',    label: 'Recipe Notes',   icon: <FileText size={13} /> },
];

const CATEGORY_TABS: { value: 'all' | LabNoteCategory; label: string }[] = [
  { value: 'all',        label: 'All'        },
  { value: 'chocolate',  label: 'Chocolate'  },
  { value: 'flours',     label: 'Flours'     },
  { value: 'sweeteners', label: 'Sweeteners' },
  { value: 'assembly',   label: 'Assembly'   },
  { value: 'mistakes',   label: 'Mistakes'   },
  { value: 'general',    label: 'General'    },
];

const CATEGORY_BADGE: Record<LabNoteCategory, string> = {
  chocolate:  'bg-amber-900 text-white',
  flours:     'bg-yellow-100 text-yellow-800',
  sweeteners: 'bg-pink-100 text-pink-800',
  assembly:   'bg-blue-100 text-blue-800',
  mistakes:   'bg-red-100 text-red-800',
  general:    'bg-gray-100 text-gray-800',
};

function kbBlockPreview(note: LabNote): string {
  const first = note.content_json?.[0];
  if (!first) return note.content?.slice(0, 120) ?? '';
  if ('text_en' in first && first.text_en) return first.text_en.slice(0, 120);
  if ('title_en' in first && first.title_en) return first.title_en.slice(0, 120);
  return '';
}

export default function LabNotesPage() {
  const [notes,          setNotes]          = useState<LabNote[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [typeFilter,     setTypeFilter]     = useState<TypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | LabNoteCategory>('all');
  const [togglingId,     setTogglingId]     = useState<number | null>(null);
  const [deleteId,       setDeleteId]       = useState<number | null>(null);
  const [deleteError,    setDeleteError]    = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadNotes();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) router.push('/login');
  }

  async function loadNotes() {
    setLoading(true);
    try {
      const res = await fetch('/api/lab-notes');
      if (!res.ok) throw new Error(await res.text());
      setNotes(await res.json());
    } catch (err: any) {
      alert(`Failed to load lab notes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(note: LabNote) {
    setTogglingId(note.id);
    try {
      const res = await fetch(`/api/lab-notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !note.is_active }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated: LabNote = await res.json();
      setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
    } catch (err: any) {
      alert(`Toggle failed: ${err.message}`);
    } finally {
      setTogglingId(null);
    }
  }

  async function confirmDelete() {
    if (deleteId === null) return;
    setDeleteError('');
    try {
      const res = await fetch(`/api/lab-notes/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      setNotes(prev => prev.filter(n => n.id !== deleteId));
      setDeleteId(null);
    } catch (err: any) {
      setDeleteError(err.message);
    }
  }

  function selectType(t: TypeFilter) {
    setTypeFilter(t);
    setCategoryFilter('all');
  }

  // Two-level filter: type → category
  const typeFiltered =
    typeFilter === 'knowledge' ? notes.filter(n => !n.recipe_id) :
    typeFilter === 'recipe'    ? notes.filter(n =>  !!n.recipe_id) :
    notes;

  const displayed = categoryFilter === 'all'
    ? typeFiltered
    : typeFiltered.filter(n => n.category === categoryFilter);

  const kbCount     = notes.filter(n => !n.recipe_id).length;
  const recipeCount = notes.filter(n =>  !!n.recipe_id).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A80048]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-[#A80048]">🎂 KetoCakr Admin</h1>
              <div className="flex space-x-4 text-sm">
                <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-900">Dashboard</button>
                <span className="text-[#A80048] font-semibold">Lab Notes</span>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Lab Notes</h2>
            <p className="text-gray-500 mt-1 text-sm">Baking science education content</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard/lab-notes/import')}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              <Upload size={15} /> Import HTML
            </button>
            <button
              onClick={() => router.push('/dashboard/lab-notes/create')}
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#A80048] text-white rounded-lg hover:bg-[#8a003c] text-sm font-medium shadow"
            >
              <Plus size={15} /> New Note
            </button>
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Knowledge Base', value: kbCount,            color: 'text-[#A80048]' },
            { label: 'Recipe Notes',   value: recipeCount,         color: 'text-blue-600'  },
            { label: 'Active',         value: typeFiltered.filter(n => n.is_active).length, color: 'text-green-600' },
            { label: 'Showing',        value: displayed.length,    color: 'text-gray-700'  },
          ].map(s => (
            <div key={s.label} className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">{s.label}</div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Type Filter ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex gap-2">
            {TYPE_TABS.map(tab => {
              const count =
                tab.value === 'all'       ? notes.length :
                tab.value === 'knowledge' ? kbCount :
                recipeCount;
              return (
                <button
                  key={tab.value}
                  onClick={() => selectType(tab.value)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    typeFilter === tab.value
                      ? 'bg-[#A80048] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.icon} {tab.label}
                  <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                    typeFilter === tab.value ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          {typeFilter === 'knowledge' && (
            <p className="text-xs text-gray-400 mt-2">Public notes visible in the mobile app (recipe_id IS NULL)</p>
          )}
          {typeFilter === 'recipe' && (
            <p className="text-xs text-gray-400 mt-2">Legacy notes tied to specific recipes (recipe_id IS NOT NULL) — not shown in Knowledge Base</p>
          )}
        </div>

        {/* ── Category Filter ──────────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {CATEGORY_TABS.map(tab => {
              const count = tab.value === 'all'
                ? typeFiltered.length
                : typeFiltered.filter(n => n.category === tab.value).length;
              return (
                <button
                  key={tab.value}
                  onClick={() => setCategoryFilter(tab.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    categoryFilter === tab.value
                      ? 'bg-[#A80048] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Table ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {displayed.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              {typeFilter === 'knowledge' && categoryFilter === 'all'
                ? 'No Knowledge Base notes yet — import from HTML or create one.'
                : typeFilter === 'recipe' && categoryFilter === 'all'
                ? 'No Recipe Notes found.'
                : `No notes matching the current filters.`}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Note', 'Category', 'Active', 'Order', 'Actions'].map(h => (
                    <th
                      key={h}
                      className={`text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 ${
                        h === 'Actions' ? 'text-right' : h === 'Active' || h === 'Order' ? 'text-center' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayed.map(note => {
                  const isKB = !note.recipe_id;
                  return (
                    <tr key={note.id} className="hover:bg-gray-50 transition-colors">

                      {/* ── Note cell ─────────────────────────────────── */}
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl leading-none mt-0.5 flex-shrink-0">{note.icon}</span>
                          <div className="min-w-0">
                            <button
                              onClick={() => router.push(`/dashboard/lab-notes/${note.id}`)}
                              className="font-medium text-gray-900 hover:text-[#A80048] text-left leading-snug"
                            >
                              {note.title_en}
                            </button>

                            {isKB ? (
                              /* Knowledge Base: show BG title + first block preview */
                              <>
                                {note.title_bg && (
                                  <div className="text-xs text-gray-400 mt-0.5">{note.title_bg}</div>
                                )}
                                {kbBlockPreview(note) && (
                                  <div className="text-xs text-gray-500 mt-1 max-w-lg line-clamp-2">
                                    {kbBlockPreview(note)}
                                  </div>
                                )}
                              </>
                            ) : (
                              /* Recipe Note: show plain content EN + BG snippets */
                              <>
                                {note.content && (
                                  <div className="text-xs text-gray-500 mt-0.5 max-w-lg truncate">
                                    {note.content}
                                  </div>
                                )}
                                {note.content_bg && (
                                  <div className="text-xs text-gray-400 mt-0.5 max-w-lg truncate italic">
                                    {note.content_bg}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${CATEGORY_BADGE[note.category]}`}>
                          {note.category}
                        </span>
                      </td>

                      {/* Active toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleActive(note)}
                          disabled={togglingId === note.id}
                          title={note.is_active ? 'Click to deactivate' : 'Click to activate'}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                            note.is_active ? 'bg-[#A80048]' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                            note.is_active ? 'translate-x-4' : 'translate-x-1'
                          }`} />
                        </button>
                      </td>

                      {/* Display order */}
                      <td className="px-4 py-3 text-center text-sm text-gray-500">
                        {note.display_order}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => router.push(`/dashboard/lab-notes/${note.id}`)}
                            className="p-1.5 text-gray-400 hover:text-[#A80048] hover:bg-[#FFF5F8] rounded"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => { setDeleteId(note.id); setDeleteError(''); }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 size={14} />
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
      </main>

      {/* ── Delete Confirmation ─────────────────────────────────────── */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Lab Note?</h3>
            <p className="text-sm text-gray-600 mb-4">This cannot be undone.</p>
            {deleteError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded mb-4">{deleteError}</p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
