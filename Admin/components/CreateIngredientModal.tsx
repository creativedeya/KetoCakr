'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface NewIngredient {
  id: string;
  name_bg: string;
  name_en: string;
}

export function CreateIngredientModal({
  initialName,
  onSuccess,
  onCancel,
}: {
  initialName: string;
  onSuccess: (newIngredient: NewIngredient) => void;
  onCancel: () => void;
}) {
  const [nameBg, setNameBg] = useState(initialName);
  const [nameEn, setNameEn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!nameBg.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ingredients/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name_bg: nameBg, name_en: nameEn }),
      });

      const data = await res.json();

      if (data.success) {
        onSuccess(data.ingredient);
      } else {
        setError(data.error || 'Failed to create ingredient');
      }
    } catch {
      setError('Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
        <h3 className="text-lg font-bold mb-4">Create New Ingredient</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Name (Bulgarian) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nameBg}
              onChange={(e) => setNameBg(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#A80048]"
              placeholder="Еритритол на пудра"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Name (English)
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#A80048]"
              placeholder="Powdered erythritol"
            />
          </div>

          <p className="text-sm text-gray-500">
            Nutrition values will be set to 0. Edit them later in Ingredients Database.
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
            {loading ? 'Creating...' : 'Create & Link'}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border rounded hover:bg-gray-50 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
