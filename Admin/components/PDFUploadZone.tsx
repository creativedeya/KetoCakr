'use client';

import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';

interface PDFUploadZoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export function PDFUploadZone({ onFileSelect, isLoading }: PDFUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
        dragActive
          ? 'border-[#A80048] bg-[#FFF5F8]'
          : 'border-gray-300 bg-gray-50 hover:border-gray-400'
      } ${isLoading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
    >
      <input
        type="file"
        accept=".pdf"
        onChange={handleChange}
        disabled={isLoading}
        className="hidden"
        id="pdf-input"
      />
      <label htmlFor="pdf-input" className="block cursor-pointer">
        <Upload
          size={40}
          className={`mx-auto mb-3 ${dragActive ? 'text-[#A80048]' : 'text-gray-400'}`}
          strokeWidth={1.5}
        />
        <p className="font-semibold text-gray-800 text-lg">
          {dragActive ? 'Drop PDF here' : 'Drop PDF or click to select'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Spanish Keto PDF cookbook — Table of Contents on page 2
        </p>
      </label>
    </div>
  );
}
