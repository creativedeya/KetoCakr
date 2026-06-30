'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import LabNoteForm from '@/components/lab-notes/LabNoteForm';
import type { LabNoteFormData } from '@/lib/types/labNotes';

const DRAFT_KEY = 'lab-notes-draft';

export default function CreateLabNotePage() {
  const [isSaving,    setIsSaving]    = useState(false);
  const [initialData, setInitialData] = useState<Partial<LabNoteFormData> | undefined>(undefined);
  const [fromImport,  setFromImport]  = useState(false);
  // Don't render the form until we've checked localStorage — otherwise
  // LabNoteForm's useState initializers run before the draft is loaded.
  const [ready,       setReady]       = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    const stored = localStorage.getItem(DRAFT_KEY);
    if (stored) {
      localStorage.removeItem(DRAFT_KEY);
      try {
        setInitialData(JSON.parse(stored));
        setFromImport(true);
      } catch {
        // malformed JSON — fall through to empty form
      }
    }
    setReady(true);
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) router.push('/login');
  }

  async function handleSave(data: LabNoteFormData) {
    setIsSaving(true);
    try {
      const res = await fetch('/api/lab-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create');
      }
      router.push('/dashboard/lab-notes');
    } finally {
      setIsSaving(false);
    }
  }

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
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/lab-notes')}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft size={15} /> Back to Lab Notes
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Create Lab Note</h2>
          {fromImport && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              <CheckCircle size={14} /> Pre-filled from HTML import
            </div>
          )}
        </div>

        {!ready ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#A80048]" />
          </div>
        ) : (
          <LabNoteForm
            key={fromImport ? 'import' : 'empty'}
            initialData={initialData}
            onSave={handleSave}
            isSaving={isSaving}
          />
        )}

        {/* Cancel */}
        <div className="flex justify-start mt-2 pb-8">
          <button
            onClick={() => router.push('/dashboard/lab-notes')}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Cancel
          </button>
        </div>
      </main>
    </div>
  );
}
