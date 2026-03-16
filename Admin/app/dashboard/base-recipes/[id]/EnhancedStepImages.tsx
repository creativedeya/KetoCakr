// =====================================================
// ENHANCED STEP IMAGES COMPONENT
// Add this to your page.tsx file
// =====================================================

'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

// Types
interface StepImageState {
  imageUrl: string | null;
  previousImageUrl: string | null; // For compare mode
  isSaved: boolean;
  isGenerating: boolean;
  isUploading: boolean;
  customHints: string;
  source: 'ai' | 'upload' | 'existing' | null;
  aiInterpretation?: any;
}

interface Step {
  id?: string;
  step_number: number;
  step_description: string;
  step_description_bg?: string | null;
  step_description_en?: string | null;
  step_image_url?: string | null;
  image_generation_hints?: string | null;
}

// Component Props
interface EnhancedStepImagesProps {
  recipeId: string;
  steps: Step[];
  onStepsUpdate: () => void; // Callback to refresh steps from DB
}

export function EnhancedStepImages({ 
  recipeId, 
  steps,
  onStepsUpdate 
}: EnhancedStepImagesProps) {
  // State: per-step image management
  const [stepImages, setStepImages] = useState<{
    [stepNumber: number]: StepImageState
  }>(() => {
    // Initialize from existing step data
    const initial: { [key: number]: StepImageState } = {};
    steps.forEach(step => {
      initial[step.step_number] = {
        imageUrl: step.step_image_url || null,
        previousImageUrl: null,
        isSaved: !!step.step_image_url,
        isGenerating: false,
        isUploading: false,
        customHints: step.image_generation_hints || '',
        source: step.step_image_url ? 'existing' : null,
      };
    });
    return initial;
  });

  // State: UI mode per step
  const [selectedMode, setSelectedMode] = useState<{
    [stepNumber: number]: 'ai' | 'upload'
  }>({});

  // State: compare mode
  const [compareMode, setCompareMode] = useState<{
    [stepNumber: number]: boolean
  }>({});

  // ✅ State: Reference image for visual consistency
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<any>(null);

  // Load recipe and reference image on mount
  useState(() => {
    loadRecipeData();
  });

  async function loadRecipeData() {
    try {
      const { data, error } = await supabase
        .from('base_recipes')
        .select('reference_image_url')
        .eq('id', recipeId)
        .single();

      if (error) throw error;
      
      setRecipe(data);
      if (data?.reference_image_url) {
        setReferenceImageUrl(data.reference_image_url);
        console.log('📌 Reference image loaded:', data.reference_image_url);
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
    }
  }

  /**
   * Set current step image as reference for all future generations
   */
  async function setAsReferenceImage(stepNumber: number) {
    const imageUrl = stepImages[stepNumber]?.imageUrl;
    
    if (!imageUrl) {
      alert('No image to set as reference');
      return;
    }

    try {
      const { error } = await supabase
        .from('base_recipes')
        .update({ reference_image_url: imageUrl })
        .eq('id', recipeId);

      if (error) throw error;

      setReferenceImageUrl(imageUrl);
      alert('✅ Reference image set! All future step images will match this style, equipment, and person.');
    } catch (error: any) {
      console.error('Error setting reference:', error);
      alert(`Failed to set reference: ${error.message}`);
    }
  }

  /**
   * Clear reference image
   */
  async function clearReferenceImage() {
    if (!confirm('Clear reference image? Future generations will not have visual consistency.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('base_recipes')
        .update({ reference_image_url: null })
        .eq('id', recipeId);

      if (error) throw error;

      setReferenceImageUrl(null);
      alert('Reference image cleared');
    } catch (error: any) {
      console.error('Error clearing reference:', error);
      alert(`Failed to clear reference: ${error.message}`);
    }
  }

  /**
   * Generate single step with AI
   */
  async function generateSingleStep(stepNumber: number) {
    const step = steps.find(s => s.step_number === stepNumber);
    if (!step) return;

    const currentState = stepImages[stepNumber] || {};
    const hints = currentState.customHints || '';

    // Store previous image for comparison
    const previousImage = currentState.imageUrl;

    setStepImages(prev => ({
      ...prev,
      [stepNumber]: { 
        ...prev[stepNumber], 
        isGenerating: true,
        previousImageUrl: previousImage
      }
    }));

    try {
      const response = await fetch('/api/generate-step-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId,
          stepNumber,
          stepDescription: step.step_description_bg || step.step_description,
          stepDescriptionEn: step.step_description_en,
          customHints: hints || undefined,
          referenceImageUrl: referenceImageUrl  // ✅ Send reference for consistency!
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();

      setStepImages(prev => ({
        ...prev,
        [stepNumber]: {
          ...prev[stepNumber],
          imageUrl: data.imageUrl,
          isSaved: false,
          isGenerating: false,
          source: 'ai',
          aiInterpretation: data.interpretation
        }
      }));

      // Auto-enable compare mode if there was a previous image
      if (previousImage) {
        setCompareMode(prev => ({ ...prev, [stepNumber]: true }));
      }

    } catch (error: any) {
      console.error('Generate error:', error);
      alert(`❌ Failed to generate: ${error.message}`);
      
      setStepImages(prev => ({
        ...prev,
        [stepNumber]: { 
          ...prev[stepNumber], 
          isGenerating: false 
        }
      }));
    }
  }

  /**
   * Upload single step image via API (uses service role key)
   */
  async function uploadSingleStep(stepNumber: number, file: File) {
    setStepImages(prev => ({
      ...prev,
      [stepNumber]: { 
        ...prev[stepNumber], 
        isUploading: true 
      }
    }));

    try {
      // Use API route for upload (has service role permissions)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('recipeId', recipeId);
      formData.append('stepNumber', stepNumber.toString());

      const response = await fetch('/api/upload-step-image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();

      setStepImages(prev => ({
        ...prev,
        [stepNumber]: {
          ...prev[stepNumber],
          imageUrl: data.imageUrl,
          isSaved: false,
          isUploading: false,
          source: 'upload'
        }
      }));

    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`❌ Failed to upload: ${error.message}`);
      
      setStepImages(prev => ({
        ...prev,
        [stepNumber]: { 
          ...prev[stepNumber], 
          isUploading: false 
        }
      }));
    }
  }

  /**
   * Save single step to database
   */
  async function saveSingleStep(stepNumber: number) {
    const stepImage = stepImages[stepNumber];
    if (!stepImage?.imageUrl) return;

    try {
      const { error } = await supabase
        .from('recipe_instruction_steps')
        .update({
          step_image_url: stepImage.imageUrl,
          image_generation_hints: stepImage.customHints || null
        })
        .eq('recipe_id', recipeId)
        .eq('step_number', stepNumber);

      if (error) throw error;

      setStepImages(prev => ({
        ...prev,
        [stepNumber]: { 
          ...prev[stepNumber], 
          isSaved: true,
          source: 'existing'
        }
      }));

      alert(`✅ Step ${stepNumber} saved successfully!`);
      
      // Refresh steps from DB
      onStepsUpdate();

    } catch (error: any) {
      console.error('Save error:', error);
      alert(`❌ Failed to save: ${error.message}`);
    }
  }

  /**
   * Keep previous image (discard new one)
   */
  function keepPreviousImage(stepNumber: number) {
    const current = stepImages[stepNumber];
    if (!current?.previousImageUrl) return;

    setStepImages(prev => ({
      ...prev,
      [stepNumber]: {
        ...prev[stepNumber],
        imageUrl: current.previousImageUrl,
        previousImageUrl: null
      }
    }));

    setCompareMode(prev => ({ ...prev, [stepNumber]: false }));
  }

  /**
   * Keep new image (discard previous)
   */
  function keepNewImage(stepNumber: number) {
    setStepImages(prev => ({
      ...prev,
      [stepNumber]: {
        ...prev[stepNumber],
        previousImageUrl: null
      }
    }));

    setCompareMode(prev => ({ ...prev, [stepNumber]: false }));
  }

  return (
    <div className="space-y-8">
      {/* Reference Image Status */}
      {referenceImageUrl && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-purple-900 mb-1">
                <span className="text-lg">⭐</span>
                <span className="font-semibold">Reference Image Active</span>
              </div>
              <p className="text-sm text-purple-700">
                All generated images will match the reference for consistent equipment, person, and style.
              </p>
            </div>
            <button
              onClick={clearReferenceImage}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium"
            >
              Clear Reference
            </button>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          💡 Tips for Custom Hints:
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <code>no hands</code> - Hide hands completely (still life)</li>
          <li>• <code>top view</code> or <code>overhead</code> - Bird's eye view</li>
          <li>• <code>show vanilla extract</code> - Include specific items</li>
          <li>• <code>minimal</code> - Ultra minimalist (max 2 objects)</li>
          <li>• <code>dark</code> or <code>moody</code> - Dramatic lighting</li>
          <li>• <code>bright</code> or <code>airy</code> - High-key lighting</li>
        </ul>
      </div>

      {steps.map(step => {
        const state = stepImages[step.step_number] || {};
        const mode = selectedMode[step.step_number];
        const inCompareMode = compareMode[step.step_number];

        return (
          <div 
            key={step.step_number} 
            className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm"
          >
            {/* Step Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 mr-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Step {step.step_number}
                </h3>
                <p className="text-gray-700 mt-1">
                  {step.step_description_bg || step.step_description}
                </p>
                {step.step_description_en && (
                  <p className="text-gray-500 text-sm mt-1 italic">
                    {step.step_description_en}
                  </p>
                )}
              </div>
              
              {/* Status Badge */}
              {state.isSaved ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium whitespace-nowrap">
                  ✅ Saved
                </span>
              ) : state.imageUrl ? (
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium whitespace-nowrap">
                  ⚠️ Not Saved
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium whitespace-nowrap">
                  ⭕ No Image
                </span>
              )}
            </div>

            {/* Image Preview with Compare Mode */}
            {state.imageUrl && (
              <div className="mb-6">
                {inCompareMode && state.previousImageUrl ? (
                  // Compare Mode: Show both images
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Previous</p>
                        <img 
                          src={state.previousImageUrl}
                          className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                          alt={`Previous - Step ${step.step_number}`}
                        />
                        <button
                          onClick={() => keepPreviousImage(step.step_number)}
                          className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          ← Keep This
                        </button>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">New</p>
                        <img 
                          src={state.imageUrl}
                          className="w-full h-64 object-cover rounded-lg border-2 border-green-500"
                          alt={`New - Step ${step.step_number}`}
                        />
                        <button
                          onClick={() => keepNewImage(step.step_number)}
                          className="mt-2 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Keep This →
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Normal Mode: Show single image
                  <div>
                    <img 
                      src={state.imageUrl}
                      className="w-full max-w-md h-64 object-cover rounded-lg"
                      alt={`Step ${step.step_number}`}
                    />
                    {state.aiInterpretation && (
                      <details className="mt-2 text-xs text-gray-600">
                        <summary className="cursor-pointer hover:text-gray-900">
                          View AI Interpretation
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded overflow-auto">
                          {JSON.stringify(state.aiInterpretation, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Mode Selection */}
            <div className="space-y-4">
              {/* AI Generate Option */}
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="radio"
                    name={`mode-${step.step_number}`}
                    checked={mode === 'ai'}
                    onChange={() => setSelectedMode(prev => ({
                      ...prev, 
                      [step.step_number]: 'ai'
                    }))}
                    className="w-4 h-4"
                  />
                  <span className="font-medium text-gray-900">🎨 AI Generate</span>
                </label>
                
                {mode === 'ai' && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Custom Instructions (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 'no hands', 'top view', 'show vanilla extract'..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={state.customHints || ''}
                        onChange={(e) => setStepImages(prev => ({
                          ...prev,
                          [step.step_number]: {
                            ...prev[step.step_number],
                            customHints: e.target.value
                          }
                        }))}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Separate multiple hints with commas
                      </p>
                    </div>
                    
                    <button
                      onClick={() => generateSingleStep(step.step_number)}
                      disabled={state.isGenerating}
                      className={`w-full px-6 py-3 rounded-lg font-medium transition ${
                        state.isGenerating
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {state.isGenerating ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Generating...
                        </span>
                      ) : (
                        '🎨 Generate Image'
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Upload Option */}
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="radio"
                    name={`mode-${step.step_number}`}
                    checked={mode === 'upload'}
                    onChange={() => setSelectedMode(prev => ({
                      ...prev, 
                      [step.step_number]: 'upload'
                    }))}
                    className="w-4 h-4"
                  />
                  <span className="font-medium text-gray-900">📁 Upload Image</span>
                </label>
                
                {mode === 'upload' && (
                  <div className="mt-4">
                    <input
                      type="file"
                      accept="image/*"
                      disabled={state.isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadSingleStep(step.step_number, file);
                      }}
                      className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {state.isUploading && (
                      <p className="mt-2 text-sm text-gray-600">
                        ⏳ Uploading...
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {state.imageUrl && !inCompareMode && (
              <div className="mt-6 space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={() => saveSingleStep(step.step_number)}
                    disabled={state.isSaved}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition ${
                      state.isSaved
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {state.isSaved ? '✅ Saved' : '💾 Save This Step'}
                  </button>
                  
                  {!state.isSaved && (
                    <button
                      onClick={() => generateSingleStep(step.step_number)}
                      disabled={state.isGenerating}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
                    >
                      🔄 Regenerate
                    </button>
                  )}
                </div>

                {/* Reference Image Control */}
                {state.isSaved && (
                  <div>
                    {referenceImageUrl === state.imageUrl ? (
                      <div className="px-4 py-2 bg-purple-100 border border-purple-300 rounded-lg text-purple-900 text-sm font-medium flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span>⭐</span>
                          <span>This is the reference image (all steps match this)</span>
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAsReferenceImage(step.step_number)}
                        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        📌 Set as Reference Image
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Bulk Actions (Optional) */}
      <div className="border-t pt-6">
        <h4 className="font-semibold text-gray-900 mb-4">Bulk Actions</h4>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const unsavedSteps = steps.filter(
                s => stepImages[s.step_number]?.imageUrl && !stepImages[s.step_number]?.isSaved
              );
              unsavedSteps.forEach(s => saveSingleStep(s.step_number));
            }}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
          >
            💾 Save All Unsaved Steps
          </button>
        </div>
      </div>
    </div>
  );
}