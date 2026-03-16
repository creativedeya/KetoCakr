// =====================================================
// FILE: admin/components/ImageGenerationPanel.tsx
// UI Component for generating recipe step images
// =====================================================

'use client';

import { useState } from 'react';
import { 
  PhotoStyle, 
  LightingStyle, 
  BackgroundStyle,
  PHOTO_STYLE_OPTIONS,
  LIGHTING_STYLE_OPTIONS,
  BACKGROUND_STYLE_OPTIONS,
  GenerateStepImageResponse,
  GenerateRecipeImagesResponse
} from '../types/image-generation';

interface ImageGenerationPanelProps {
  recipeId: string;
  recipeName: string;
  steps: Array<{
    id: string;
    step_number: number;
    step_description: string;
    step_description_bg: string;
    step_description_en?: string;
    step_image_url?: string;
  }>;
  onImagesGenerated?: () => void;
}

export default function ImageGenerationPanel({ 
  recipeId, 
  recipeName, 
  steps,
  onImagesGenerated 
}: ImageGenerationPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    stepNumber?: number;
  } | null>(null);
  const [style, setStyle] = useState<PhotoStyle>('overhead');
  const [lighting, setLighting] = useState<LightingStyle>('natural');
  const [background, setBackground] = useState<BackgroundStyle>('marble');
  const [skipExisting, setSkipExisting] = useState(true);
  const [results, setResults] = useState<any>(null);

  const stepsWithoutImages = steps.filter(s => !s.step_image_url).length;

  const handleBatchGenerate = async () => {
    if (!confirm(`Generate images for ${skipExisting ? stepsWithoutImages : steps.length} steps?\n\nEstimated cost: ~$${(skipExisting ? stepsWithoutImages : steps.length) * 0.04} USD\nEstimated time: ~${Math.ceil((skipExisting ? stepsWithoutImages : steps.length) * 15 / 60)} minutes`)) {
      return;
    }

    setIsGenerating(true);
    setProgress({ current: 0, total: steps.length });
    setResults(null);

    try {
      const response = await fetch('/api/generate-recipe-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId,
          style,
          lighting,
          background,
          skipExisting
        })
      });

      const data: GenerateRecipeImagesResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setResults(data);
      
      if (onImagesGenerated) {
        onImagesGenerated();
      }

      alert(`✅ Generation complete!\n\n` +
        `Successful: ${data.summary.successful}\n` +
        `Failed: ${data.summary.failed}\n` +
        `Cost: ~$${data.summary.estimatedCost.toFixed(2)}`
      );

    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
      console.error('Batch generation error:', error);
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  };

  const handleSingleGenerate = async (step: typeof steps[0]) => {
    if (!confirm(`Generate image for Step ${step.step_number}?\n\nCost: ~$0.04 USD`)) {
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-step-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId,
          recipeName,
          stepNumber: step.step_number,
          stepDescription: step.step_description_bg,
          stepDescriptionEn: step.step_description_en,
          style,
          lighting,
          background
        })
      });

      const data: GenerateStepImageResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      alert(`✅ Image generated!\n\n${data.imageUrl}`);
      
      if (onImagesGenerated) {
        onImagesGenerated();
      }

    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
      console.error('Single generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">🎨 AI Image Generation</h3>
      
      {/* Style Options */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Photo Style</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as PhotoStyle)}
            className="w-full border rounded px-3 py-2"
            disabled={isGenerating}
          >
            {Object.entries(PHOTO_STYLE_OPTIONS).map(([key, { name, description }]) => (
              <option key={key} value={key}>
                {name} - {description}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Lighting</label>
          <select
            value={lighting}
            onChange={(e) => setLighting(e.target.value as LightingStyle)}
            className="w-full border rounded px-3 py-2"
            disabled={isGenerating}
          >
            {Object.entries(LIGHTING_STYLE_OPTIONS).map(([key, { name, description }]) => (
              <option key={key} value={key}>
                {name} - {description}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Background</label>
          <select
            value={background}
            onChange={(e) => setBackground(e.target.value as BackgroundStyle)}
            className="w-full border rounded px-3 py-2"
            disabled={isGenerating}
          >
            {Object.entries(BACKGROUND_STYLE_OPTIONS).map(([key, { name, description }]) => (
              <option key={key} value={key}>
                {name} - {description}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="skipExisting"
            checked={skipExisting}
            onChange={(e) => setSkipExisting(e.target.checked)}
            className="mr-2"
            disabled={isGenerating}
          />
          <label htmlFor="skipExisting" className="text-sm">
            Skip steps with existing images ({stepsWithoutImages} without images)
          </label>
        </div>
      </div>

      {/* Batch Generate Button */}
      <button
        onClick={handleBatchGenerate}
        disabled={isGenerating || steps.length === 0}
        className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating...
          </span>
        ) : (
          `🚀 Generate All Images (${skipExisting ? stepsWithoutImages : steps.length} steps)`
        )}
      </button>

      {/* Progress */}
      {progress && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{progress.current} / {progress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Results Summary */}
      {results && (
        <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
          <h4 className="font-semibold text-green-900 mb-2">✅ Generation Complete</h4>
          <div className="text-sm text-green-800 space-y-1">
            <p>Successful: {results.summary.successful}</p>
            <p>Failed: {results.summary.failed}</p>
            <p>Avg Time: {results.summary.avgTimeSeconds}s per image</p>
            <p>Total Cost: ~${results.summary.estimatedCost.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Individual Steps */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold mb-3">Individual Steps</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Step {step.step_number}</span>
                  {step.step_image_url && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                      ✓ Has image
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 truncate">
                  {step.step_description_en || step.step_description_bg}
                </p>
              </div>
              <button
                onClick={() => handleSingleGenerate(step)}
                disabled={isGenerating}
                className="ml-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step.step_image_url ? 'Regenerate' : 'Generate'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 text-xs text-gray-500 border-t pt-3">
        <p>💡 Using Google Imagen 4 via Replicate</p>
        <p>💰 Cost: ~$0.04 per image</p>
        <p>⏱️ Time: ~12-15 seconds per image (with rate limiting)</p>
        <p>📸 Style: Emma's Cake Studio aesthetic</p>
      </div>
    </div>
  );
}