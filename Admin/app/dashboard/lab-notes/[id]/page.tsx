'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import LabNoteForm from '@/components/lab-notes/LabNoteForm';
import type { LabNote, LabNoteFormData } from '@/lib/types/labNotes';

export default function EditLabNotePage({ params }: { params: { id: string } }) {
  const [note,          setNote]          = useState<LabNote | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [isSaving,      setIsSaving]      = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting,    setIsDeleting]    = useState(false);
  const [deleteError,   setDeleteError]   = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadNote();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) router.push('/login');
  }

  async function loadNote() {
    try {
      const res = await fetch(`/api/lab-notes/${params.id}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Not found');
      }
      setNote(await res.json());
    } catch (err: any) {
      alert(`Could not load lab note: ${err.message}`);
      router.push('/dashboard/lab-notes');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/lab-notes/${params.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Delete failed');
      }
      router.push('/dashboard/lab-notes');
    } catch (err: any) {
      setDeleteError(err.message);
      setIsDeleting(false);
    }
  }

  async function handleSave(data: LabNoteFormData) {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/lab-notes/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update');
      }
      router.push('/dashboard/lab-notes');
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A80048]" />
      </div>
    );
  }

  const initialData: Partial<LabNoteFormData> | undefined = note
    ? {
        recipe_id:     note.recipe_id,
        category:      note.category,
        icon:          note.icon,
        title_en:      note.title_en,
        title_bg:      note.title_bg     ?? '',
        subtitle_en:   note.subtitle_en  ?? '',
        subtitle_bg:   note.subtitle_bg  ?? '',
        content_json:  note.content_json ?? [],
        display_order: note.display_order,
        is_active:     note.is_active,
        image_url:     note.image_url    ?? null,
        image_alt:     note.image_alt    ?? '',
      }
    : undefined;

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

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/lab-notes')}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft size={15} /> Back to Lab Notes
          </button>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Edit Lab Note{note ? `: ${note.title_en}` : ''}
            </h2>
            {note && (
              <button
                onClick={() => { setDeleteConfirm(true); setDeleteError(''); }}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
              >
                <Trash2 size={14} /> Delete Note
              </button>
            )}
          </div>
        </div>

        {initialData && (
          <LabNoteForm
            noteId={note?.id}
            initialData={initialData}
            onSave={handleSave}
            isSaving={isSaving}
          />
        )}

        <div className="flex justify-start mt-2 pb-8">
          <button
            onClick={() => router.push('/dashboard/lab-notes')}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Cancel
          </button>
        </div>
      </main>

      {/* ── Delete Confirmation ─────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Lab Note?</h3>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">{note?.title_en}</span>
            </p>
            <p className="text-sm text-gray-500 mb-4">This cannot be undone.</p>
            {deleteError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded mb-4">{deleteError}</p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
              >
                {isDeleting ? <><Loader2 size={14} className="animate-spin" /> Deleting…</> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
