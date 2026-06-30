'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft, Code2, ChevronRight, Zap, CheckCircle2,
  Loader2, AlertCircle, Languages, Pencil,
} from 'lucide-react';
import { parseLabNoteHTML, parseSinglePostHTML } from '@/lib/parseLabNoteHTML';
import type { ParsedLabNote, LabNoteCategory, LabNoteFormData } from '@/lib/types/labNotes';

const CATEGORY_BADGE: Record<LabNoteCategory, string> = {
  chocolate:  'bg-amber-900 text-white',
  flours:     'bg-yellow-100 text-yellow-800',
  sweeteners: 'bg-pink-100 text-pink-800',
  assembly:   'bg-blue-100 text-blue-800',
  mistakes:   'bg-red-100 text-red-800',
  general:    'bg-gray-100 text-gray-800',
};

const BLOCK_LABEL: Record<string, string> = {
  intro:          'Intro',
  lab_note:       'Lab Note',
  matrix:         'Matrix',
  critical_error: 'Critical Error',
  tip:            'Tip',
};

export default function ImportLabNotePage() {
  const [html,             setHtml]             = useState('');
  const [parsed,           setParsed]           = useState<ParsedLabNote[]>([]);
  const [selectedIndex,    setSelectedIndex]    = useState<number | null>(null);
  const [parseError,       setParseError]       = useState('');
  const [translatedNotes,  setTranslatedNotes]  = useState<Record<number, ParsedLabNote>>({});
  const [translatingIndex, setTranslatingIndex] = useState<number | null>(null);
  const [translateError,   setTranslateError]   = useState('');
  const [saving,           setSaving]           = useState(false);
  const [savedId,          setSavedId]          = useState<number | null>(null);
  const [saveError,        setSaveError]        = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) router.push('/login');
  }

  function handleParse() {
    setParseError('');
    setParsed([]);
    setSelectedIndex(null);
    setTranslatedNotes({});
    setSavedId(null);
    setSaveError('');
    setTranslateError('');

    if (!html.trim()) {
      setParseError('Paste HTML content first.');
      return;
    }

    let results = parseLabNoteHTML(html);
    if (results.length === 0) {
      const single = parseSinglePostHTML(html);
      if (single) results = [single];
    }
    if (results.length === 0) {
      setParseError('Could not parse any posts. Make sure you paste valid KetoCakeLab HTML (contains post-title + caption-text divs).');
      return;
    }

    setParsed(results);
    setSelectedIndex(0);
    void doTranslate(0, results[0]);
  }

  async function doTranslate(index: number, note: ParsedLabNote) {
    if (translatedNotes[index]) return;
    setTranslatingIndex(index);
    setTranslateError('');
    try {
      const res = await fetch('/api/lab-notes/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Translation failed');
      }
      const translated: ParsedLabNote = await res.json();
      setTranslatedNotes(prev => ({ ...prev, [index]: translated }));
    } catch (err: any) {
      setTranslateError(err.message ?? 'Translation failed. Try again?');
    } finally {
      setTranslatingIndex(null);
    }
  }

  function handleSelectNote(index: number) {
    setSelectedIndex(index);
    setSavedId(null);
    setSaveError('');
    setTranslateError('');
    if (!translatedNotes[index]) {
      void doTranslate(index, parsed[index]);
    }
  }

  async function handleSave() {
    if (selectedIndex === null) return;
    const note = translatedNotes[selectedIndex] ?? parsed[selectedIndex];

    setSaving(true);
    setSaveError('');
    try {
      const body: LabNoteFormData = {
        category:      note.category,
        icon:          note.icon,
        title_en:      note.title_en,
        title_bg:      note.title_bg   ?? null,
        subtitle_en:   note.subtitle_en || null,
        subtitle_bg:   note.subtitle_bg ?? null,
        content_json:  note.content_json,
        display_order: 0,
        is_active:     true,
        recipe_id:     null,
      };

      const res = await fetch('/api/lab-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Save failed');
      }
      const created = await res.json();
      setSavedId(created.id);
    } catch (err: any) {
      setSaveError(err.message ?? 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleCreateAnother() {
    setSavedId(null);
    setSaveError('');
    setSelectedIndex(null);
    setParsed([]);
    setTranslatedNotes({});
    setHtml('');
    setParseError('');
    setTranslateError('');
  }

  const selectedNote    = selectedIndex !== null ? (translatedNotes[selectedIndex] ?? parsed[selectedIndex]) : null;
  const isTranslating   = translatingIndex === selectedIndex && selectedIndex !== null;
  const isTranslated    = selectedIndex !== null && !!translatedNotes[selectedIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#A80048]">🎂 KetoCakr Admin</h1>
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
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/lab-notes')}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft size={15} /> Back to Lab Notes
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Import from HTML</h2>
          <p className="text-gray-500 text-sm mt-1">
            Paste KetoCakeLab HTML. Posts are auto-translated to Bulgarian before saving.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Left: input + post list ─────────────────────────────── */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Code2 size={15} /> Paste HTML
              </label>
              <textarea
                value={html}
                onChange={e => setHtml(e.target.value)}
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#A80048] focus:border-transparent resize-y"
                placeholder={'<!-- Paste full KetoCakeLab captions file or single post -->\n<div class="post" id="p1">\n  ...\n</div>'}
                spellCheck={false}
              />

              {parseError && (
                <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-lg flex items-center gap-2">
                  <AlertCircle size={14} className="flex-shrink-0" /> {parseError}
                </div>
              )}

              <button
                onClick={handleParse}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#A80048] text-white rounded-lg hover:bg-[#8a003c] font-medium"
              >
                <Zap size={15} /> Parse HTML
              </button>
            </div>

            {/* Post list */}
            {parsed.length > 0 && (
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Found {parsed.length} post{parsed.length !== 1 ? 's' : ''}
                </p>
                <div className="space-y-1">
                  {parsed.map((note, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectNote(i)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3 transition-colors ${
                        selectedIndex === i
                          ? 'bg-[#FFF5F8] border border-[#A80048]/20 text-[#A80048]'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-xl leading-none flex-shrink-0">{note.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{note.title_en}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${CATEGORY_BADGE[note.category]}`}>
                            {note.category}
                          </span>
                          {translatedNotes[i] && (
                            <span className="text-xs text-green-600 flex items-center gap-0.5">
                              <Languages size={11} /> BG
                            </span>
                          )}
                          {translatingIndex === i && (
                            <Loader2 size={11} className="animate-spin text-gray-400" />
                          )}
                        </div>
                      </div>
                      <ChevronRight size={13} className="text-gray-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: preview ──────────────────────────────────────── */}
          <div>
            {!selectedNote ? (
              <div className="bg-white rounded-lg shadow h-80 flex flex-col items-center justify-center text-gray-400 gap-2">
                <Code2 size={32} strokeWidth={1} />
                <p className="text-sm">Parse HTML to see a preview here</p>
              </div>

            ) : savedId !== null ? (
              /* ── Success card ────────────────────────────────────── */
              <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Lab Note Created!</h3>
                  <p className="text-sm text-gray-500 mt-1">ID: {savedId}</p>
                  <p className="text-sm text-gray-600 mt-1 font-medium">{selectedNote.title_en}</p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
                  <button
                    onClick={() => router.push('/dashboard/lab-notes')}
                    className="w-full px-4 py-2.5 bg-[#A80048] text-white rounded-lg hover:bg-[#8a003c] text-sm font-medium"
                  >
                    ← Back to List
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/lab-notes/${savedId}`)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 inline-flex items-center justify-center gap-2"
                  >
                    <Pencil size={14} /> Edit This Note
                  </button>
                  <button
                    onClick={handleCreateAnother}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
                  >
                    + Create Another
                  </button>
                </div>
              </div>

            ) : (
              /* ── Preview panel ───────────────────────────────────── */
              <div className="bg-white rounded-lg shadow sticky top-6">
                {/* Meta */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-4xl mb-2 leading-none">{selectedNote.icon}</div>

                      {/* Title EN */}
                      <h3 className="text-lg font-bold text-gray-900 leading-snug">{selectedNote.title_en}</h3>

                      {/* Title BG */}
                      {isTranslating ? (
                        <div className="mt-1 h-4 bg-gray-100 animate-pulse rounded w-48" />
                      ) : selectedNote.title_bg ? (
                        <p className="text-sm text-gray-400 mt-0.5">{selectedNote.title_bg}</p>
                      ) : null}
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${CATEGORY_BADGE[selectedNote.category]}`}>
                      {selectedNote.category}
                    </span>
                  </div>

                  {selectedNote.subtitle_en && (
                    <div className="mt-3 space-y-1">
                      {/* Subtitle EN */}
                      <p className="text-sm text-gray-600">{selectedNote.subtitle_en}</p>
                      {/* Subtitle BG */}
                      {isTranslating ? (
                        <div className="h-3.5 bg-gray-100 animate-pulse rounded w-64" />
                      ) : selectedNote.subtitle_bg ? (
                        <p className="text-sm text-gray-400">{selectedNote.subtitle_bg}</p>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Content + actions */}
                <div className="p-6">
                  {isTranslating ? (
                    <div className="flex flex-col items-center gap-3 py-10 text-gray-500">
                      <Loader2 size={28} className="animate-spin text-[#A80048]" />
                      <p className="text-sm font-medium">Translating to Bulgarian…</p>
                      <p className="text-xs text-gray-400">(~30s)</p>
                    </div>
                  ) : (
                    <>
                      {translateError && (
                        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-lg flex items-center gap-2">
                          <AlertCircle size={14} className="flex-shrink-0" />
                          <span className="flex-1">{translateError}</span>
                          <button
                            onClick={() => {
                              setTranslateError('');
                              void doTranslate(selectedIndex!, parsed[selectedIndex!]);
                            }}
                            className="ml-auto underline text-xs whitespace-nowrap"
                          >
                            Retry
                          </button>
                        </div>
                      )}

                      {/* Content blocks preview */}
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Content Blocks ({selectedNote.content_json.length})
                      </p>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {selectedNote.content_json.slice(0, 4).map((block, bi) => (
                          <div key={bi} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                            <div className="text-xs font-bold text-gray-400 uppercase mb-1">
                              {BLOCK_LABEL[block.type] ?? block.type}
                            </div>
                            {'label_en' in block && block.label_en && (
                              <p className="text-xs font-semibold text-amber-700 mb-0.5">{block.label_en}</p>
                            )}
                            {'text_en' in block && block.text_en && (
                              <p className="text-xs text-gray-700 line-clamp-2">{block.text_en}</p>
                            )}
                            {'title_en' in block && block.title_en && (
                              <p className="text-xs font-semibold text-gray-700">{block.title_en}</p>
                            )}
                            {'text_bg' in block && block.text_bg && (
                              <p className="text-xs text-gray-400 line-clamp-2 mt-0.5 italic">{block.text_bg}</p>
                            )}
                            {'rows' in block && block.rows && block.rows.length > 0 && (
                              <p className="text-xs text-gray-400 mt-0.5">{block.rows.length} row{block.rows.length !== 1 ? 's' : ''}</p>
                            )}
                          </div>
                        ))}
                        {selectedNote.content_json.length > 4 && (
                          <p className="text-xs text-gray-400 text-center py-1.5">
                            + {selectedNote.content_json.length - 4} more block{selectedNote.content_json.length - 4 !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>

                      {/* Translation badge */}
                      {isTranslated && (
                        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-green-600">
                          <Languages size={12} /> Translated to Bulgarian
                        </div>
                      )}

                      {/* Save error */}
                      {saveError && (
                        <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-lg flex items-center gap-2">
                          <AlertCircle size={14} /> {saveError}
                        </div>
                      )}

                      {/* Save button */}
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#A80048] text-white rounded-lg hover:bg-[#8a003c] disabled:opacity-60 font-medium"
                      >
                        {saving ? (
                          <><Loader2 size={15} className="animate-spin" /> Saving…</>
                        ) : (
                          <><CheckCircle2 size={15} /> Save to Database</>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
