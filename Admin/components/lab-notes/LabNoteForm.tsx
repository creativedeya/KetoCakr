'use client';

import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import ContentBlockEditor from './ContentBlockEditor';
import ImageUploadPanel from './ImageUploadPanel';
import type { ContentBlock, LabNoteCategory, LabNoteFormData } from '@/lib/types/labNotes';

interface Props {
  noteId?: number;
  initialData?: Partial<LabNoteFormData>;
  onSave: (data: LabNoteFormData) => Promise<void>;
  isSaving: boolean;
}

const CATEGORIES: { value: LabNoteCategory; label: string }[] = [
  { value: 'chocolate',  label: 'Chocolate'  },
  { value: 'flours',     label: 'Flours'     },
  { value: 'sweeteners', label: 'Sweeteners' },
  { value: 'assembly',   label: 'Assembly'   },
  { value: 'mistakes',   label: 'Mistakes'   },
  { value: 'general',    label: 'General'    },
];

export default function LabNoteForm({ noteId, initialData, onSave, isSaving }: Props) {
  const [category,     setCategory]     = useState<LabNoteCategory>(initialData?.category     ?? 'general');
  const [icon,         setIcon]         = useState(initialData?.icon          ?? '🧪');
  const [titleEn,      setTitleEn]      = useState(initialData?.title_en      ?? '');
  const [titleBg,      setTitleBg]      = useState(initialData?.title_bg      ?? '');
  const [subtitleEn,   setSubtitleEn]   = useState(initialData?.subtitle_en   ?? '');
  const [subtitleBg,   setSubtitleBg]   = useState(initialData?.subtitle_bg   ?? '');
  const [contentJson,  setContentJson]  = useState<ContentBlock[]>(initialData?.content_json  ?? []);
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order ?? 0);
  const [isActive,     setIsActive]     = useState(initialData?.is_active     ?? true);
  const [imageUrl,     setImageUrl]     = useState<string | null>(initialData?.image_url      ?? null);
  const [imageAlt,     setImageAlt]     = useState(initialData?.image_alt     ?? '');
  const [formError,    setFormError]    = useState('');

  function handleImageChange(url: string | null, alt: string) {
    setImageUrl(url);
    setImageAlt(alt);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!titleEn.trim()) { setFormError('Title EN is required'); return; }
    if (!category) { setFormError('Please select a category'); return; }

    try {
      await onSave({
        recipe_id: initialData?.recipe_id ?? null,
        category: (category || 'general') as LabNoteCategory,
        icon: icon || '🧪',
        title_en:      titleEn.trim(),
        title_bg:      titleBg.trim()    || null,
        subtitle_en:   subtitleEn.trim() || null,
        subtitle_bg:   subtitleBg.trim() || null,
        content_json:  contentJson,
        display_order: displayOrder,
        is_active:     isActive,
        image_url:     imageUrl  || null,
        image_alt:     imageAlt.trim() || null,
      });
    } catch (err: any) {
      setFormError(err.message || 'Failed to save');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {formError}
        </div>
      )}

      {/* ── Basic Info ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Basic Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as LabNoteCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A80048] focus:border-transparent"
            >
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
            <input
              type="text"
              value={icon}
              onChange={e => setIcon(e.target.value)}
              maxLength={4}
              placeholder="🧪"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A80048] focus:border-transparent text-2xl leading-tight"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
            <input
              type="number"
              value={displayOrder}
              onChange={e => setDisplayOrder(Number(e.target.value))}
              min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A80048] focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <input
            type="checkbox"
            id="is_active"
            checked={isActive}
            onChange={e => setIsActive(e.target.checked)}
            className="w-4 h-4 text-[#A80048] border-gray-300 rounded focus:ring-[#A80048]"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active (visible in app)</label>
        </div>
      </div>

      {/* ── English Content ─────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4">English Content</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title EN *</label>
            <input
              type="text"
              value={titleEn}
              onChange={e => setTitleEn(e.target.value)}
              required
              placeholder="e.g. Chocolate State Matrix"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A80048] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle EN</label>
            <input
              type="text"
              value={subtitleEn}
              onChange={e => setSubtitleEn(e.target.value)}
              placeholder="Short tagline or opening line"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A80048] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* ── Bulgarian Content ────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Bulgarian Content</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title BG</label>
            <input
              type="text"
              value={titleBg}
              onChange={e => setTitleBg(e.target.value)}
              placeholder="BG превод на заглавието"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A80048] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle BG</label>
            <input
              type="text"
              value={subtitleBg}
              onChange={e => setSubtitleBg(e.target.value)}
              placeholder="BG превод на субтитъла"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A80048] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* ── Image Upload ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Image Upload</h3>
        <ImageUploadPanel
          noteId={noteId}
          imageUrl={imageUrl}
          imageAlt={imageAlt}
          onImageChange={handleImageChange}
        />
      </div>

      {/* ── Content Blocks ───────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Content Blocks</h3>
        <ContentBlockEditor blocks={contentJson} onChange={setContentJson} />
      </div>

      {/* ── Save ─────────────────────────────────────────────────────── */}
      <div className="flex justify-end pb-6">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#A80048] text-white rounded-lg hover:bg-[#8a003c] disabled:opacity-60 font-medium shadow"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? 'Saving…' : 'Save Lab Note'}
        </button>
      </div>
    </form>
  );
}
