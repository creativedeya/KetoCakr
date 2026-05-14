'use client';

import { useState } from 'react';
import { Loader2, Wand2 } from 'lucide-react';

interface GenerateStepImageButtonProps {
  recipe_id: string | undefined;
  step_number: number;
  step_description: string;
  recipe_name?: string;
  onImageGenerated: (url: string) => void;
}

export default function GenerateStepImageButton({
  recipe_id,
  step_number,
  step_description,
  recipe_name,
  onImageGenerated,
}: GenerateStepImageButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!step_description.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      console.log('[Generate Step Image] Generating for step:', step_number);

      const res = await fetch('/api/simple-recipes/generate-step-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe_id: recipe_id || 'new',
          step_number,
          step_description,
          recipe_name,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      console.log('[Generate Step Image] Success:', data.url);
      onImageGenerated(data.url);
    } catch (err: any) {
      console.error('[Generate Step Image] Error:', err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating || !step_description.trim()}
        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isGenerating ? (
          <>
            <Loader2 size={13} className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 size={13} />
            Generate with AI
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
