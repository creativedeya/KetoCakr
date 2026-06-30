'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  recipeId?: string;
  bucket?: string;
  pathPrefix?: string;
  uploadApiRoute?: string;
}

export default function ImageUpload({ value, onChange, recipeId, bucket = 'recipe-images', pathPrefix, uploadApiRoute }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(file: File) {
    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const folder = pathPrefix || bucket;
      const filePath = `${folder}/${recipeId || Date.now()}-${Date.now()}.${fileExt}`;

      if (uploadApiRoute) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('fileName', filePath);

        const res = await fetch(uploadApiRoute, { method: 'POST', body: fd });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);

        onChange(result.url);
      } else {
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        onChange(publicUrl);
      }

      alert('Изображението беше качено успешно!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Грешка при качване на изображението');
    } finally {
      setUploading(false);
    }
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  }

  return (
    <div>
      {/* Drag & Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-purple-600 bg-purple-50' : 'border-gray-300 bg-white'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        {uploading ? (
          <div className="text-purple-600">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p>Качване...</p>
          </div>
        ) : (
          <>
            <div className="text-5xl mb-4">📸</div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              Влачете изображение тук
            </p>
            <p className="text-sm text-gray-500 mb-4">или</p>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Изберете файл
            </button>
            <p className="text-xs text-gray-400 mt-3">
              PNG, JPG, WEBP до 5MB
            </p>
          </>
        )}
      </div>

      {/* URL Input (alternative) */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Или въведете URL
        </label>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
        />
      </div>
      
      {/* Preview */}
      {value && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Преглед:</p>
          <div className="relative inline-block">
            <img
              src={value}
              alt="Preview"
              className="max-w-sm rounded-lg border shadow-sm"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Invalid+Image';
              }}
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg"
              title="Премахни изображение"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
