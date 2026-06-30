'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface Props {
  noteId?: number;
  imageUrl?: string | null;
  imageAlt?: string | null;
  onImageChange: (url: string | null, alt: string) => void;
}

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function ImageUploadPanel({ noteId, imageUrl, imageAlt, onImageChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [error,     setError]     = useState('');
  const [alt,       setAlt]       = useState(imageAlt ?? '');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Само JPG, PNG или WEBP файлове са разрешени');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('Файлът не може да е по-голям от 5MB');
      return;
    }

    try {
      setUploading(true);
      setProgress(15);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', String(noteId ?? `temp-${Date.now()}`));

      setProgress(30);

      const res = await fetch('/api/lab-notes/upload', { method: 'POST', body: formData });

      setProgress(85);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }

      const { publicUrl } = await res.json();

      setProgress(100);
      onImageChange(publicUrl, alt);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 600);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
    e.target.value = '';
  }

  function handleRemove() {
    onImageChange(null, '');
    setAlt('');
  }

  function handleAltChange(value: string) {
    setAlt(value);
    if (imageUrl) onImageChange(imageUrl, value);
  }

  return (
    <div className="space-y-4">
      {/* Preview */}
      {imageUrl && (
        <div className="relative">
          <img
            src={imageUrl}
            alt={alt || 'Lab note image'}
            className="w-full max-h-64 object-cover rounded-lg border border-gray-200 shadow-sm"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 shadow-lg"
            title="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Upload zone (only when no image) */}
      {!imageUrl && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#A80048] hover:bg-[#FFF5F8] transition-colors"
        >
          <ImageIcon size={32} className="mx-auto mb-3 text-gray-400" />
          <p className="text-sm font-medium text-gray-700">Select Image</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · max 5MB</p>
        </button>
      )}

      {/* Replace button (when image exists) */}
      {imageUrl && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:border-[#A80048] hover:text-[#A80048] transition-colors"
        >
          <Upload size={14} />
          Replace Image
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Progress bar */}
      {uploading && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-[#A80048] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      {/* Alt text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
        <input
          type="text"
          value={alt}
          onChange={e => handleAltChange(e.target.value)}
          placeholder="Describe the image for accessibility"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A80048] focus:border-transparent text-sm"
        />
      </div>
    </div>
  );
}
