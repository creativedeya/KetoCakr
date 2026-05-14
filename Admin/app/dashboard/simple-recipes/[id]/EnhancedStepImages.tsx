// =====================================================
// ENHANCED STEP IMAGES COMPONENT
// Add this to your page.tsx file
// =====================================================

'use client';

import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { GenerationSettings, DEFAULT_GENERATION_SETTINGS } from '@/lib/types/generationSettings';
import { GenerationSettingsModal } from '@/app/components/GenerationSettingsModal';

// Types
interface StepImageState {
  imageUrl: string | null;
  previousImageUrl: string | null; // For compare mode
  isSaved: boolean;
  isGenerating: boolean;
  isUploading: boolean;
  isUploadingReference?: boolean;
  customHints: string;
  refinement: string;
  referenceMode?: 'none' | 'previous' | 'specific' | 'upload';
  specificStep?: number;
  uploadedReferenceUrl?: string | null;
  source: 'ai' | 'upload' | 'existing' | null;
  aiInterpretation?: any;
  provider?: 'gemini' | 'replicate';
  cost?: number;
}

interface Step {
  id?: number | string;   // serial int from DB
  step_number: number;
  step_description: string;
  step_description_bg?: string | null;
  step_description_en?: string | null;
  step_image_url?: string | null;
  image_generation_hints?: string | null;
}

interface StepAIHint {
  stepId: string | number;
  aiPrompt: string;
  refinement: string;
  customInstructions: string;
  referenceMode?: 'none' | 'previous' | 'specific' | 'upload';
  specificStep?: number;
  uploadedReferenceUrl?: string | null;
}

// Component Props
interface EnhancedStepImagesProps {
  recipeId: string;
  steps: Step[];
  onStepsUpdate: () => void; // Callback to refresh steps from DB
  recipeName?: string;
  ingredients?: string;
  utensils?: string;
}

export function EnhancedStepImages({
  recipeId,
  steps,
  onStepsUpdate,
  recipeName,
  ingredients,
  utensils,
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
        isUploadingReference: false,
        customHints: step.image_generation_hints || '',
        refinement: '',
        referenceMode: step.step_number > 1 ? 'previous' : 'none',
        specificStep: step.step_number > 1 ? step.step_number - 1 : 1,
        uploadedReferenceUrl: null,
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

  // State: selected image provider
  const [selectedProvider, setSelectedProvider] = useState<'auto' | 'gemini' | 'replicate'>('auto');

  // State: inline description editing
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [editTexts, setEditTexts] = useState<{ [stepNumber: number]: string }>({});
  const [savingDescription, setSavingDescription] = useState<number | null>(null);

  // State: Generation visual settings — persisted in localStorage
  const [generationSettings, setGenerationSettings] = useState<GenerationSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('keto-generation-settings');
        if (saved) return JSON.parse(saved) as GenerationSettings;
      } catch {}
    }
    return DEFAULT_GENERATION_SETTINGS;
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // State: Temporary AI hints (not saved to DB)
  const [stepAIHints, setStepAIHints] = useState<Record<string, StepAIHint>>({});

  // ✅ State: Reference image for visual consistency
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<any>(null);

  // Load recipe and reference image on mount
  useState(() => {
    loadRecipeData();
  });

  // Warn on beforeunload if there are unsaved AI hints
  useState(() => {
    const hasUnsavedHints = Object.keys(stepAIHints).length > 0;
    if (!hasUnsavedHints) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
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
  async function generateSingleStep(stepNumber: number, descriptionOverride?: string) {
    const step = steps.find(s => s.step_number === stepNumber);
    if (!step) return;

    // Check for saved AI hint first
    const aiHint = stepAIHints[step.id || stepNumber];

    // Determine which prompt, hints, refinement to use
    const currentState = stepImages[stepNumber] || {};
    const stepDescription = descriptionOverride || step.step_description_bg || step.step_description;

    // Use AI hint if available, otherwise use current state
    const finalDescription = aiHint?.aiPrompt || stepDescription;
    const hints = aiHint?.customInstructions || currentState.customHints || '';
    const refinement = aiHint?.refinement || currentState.refinement || '';
    const refMode = aiHint?.referenceMode || currentState.referenceMode || 'none';
    const selectedSpecificStep = aiHint?.specificStep || currentState.specificStep || (stepNumber > 1 ? stepNumber - 1 : 1);
    const uploadedRefUrl = aiHint?.uploadedReferenceUrl || currentState.uploadedReferenceUrl || null;

    const prevStepNum = stepNumber - 1;
    const previousStepUrl = prevStepNum >= 1
      ? (stepImages[prevStepNum]?.imageUrl || steps.find(s => s.step_number === prevStepNum)?.step_image_url || null)
      : null;
    const specificStepUrl = selectedSpecificStep
      ? (stepImages[selectedSpecificStep]?.imageUrl || steps.find(s => s.step_number === selectedSpecificStep)?.step_image_url || null)
      : null;
    const referenceImageUrl = refMode === 'previous'
      ? previousStepUrl
      : refMode === 'specific'
        ? specificStepUrl
        : refMode === 'upload'
          ? uploadedRefUrl
          : undefined;

    if (aiHint) {
      console.log(`💡 Using AI hint for step ${stepNumber}:`, aiHint.aiPrompt.substring(0, 60) + '...');
    }
    if (referenceImageUrl) {
      console.log(`🖼️ Reference (${refMode}): ${referenceImageUrl.slice(-40)}`);
    }

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
      const response = await fetch(`/api/generate-step-image?provider=${selectedProvider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId,
          recipeName: recipeName || undefined,
          stepId: step.id ?? null,
          stepNumber,
          stepDescription: finalDescription,
          stepDescriptionEn: step.step_description_en,
          customHints: hints || undefined,
          aiHint: aiHint?.aiPrompt || undefined,
          refinement: refinement || undefined,
          referenceImageUrl: referenceImageUrl || undefined,
          ingredients: ingredients || undefined,
          utensils: utensils || undefined,
          generationSettings,
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
          isSaved: data.savedToDb === true,
          isGenerating: false,
          source: 'ai',
          aiInterpretation: data.interpretation,
          provider: data.provider,
          cost: data.cost,
        }
      }));

      // Refresh savedSteps in parent if already saved to DB
      if (data.savedToDb) {
        onStepsUpdate();
      }

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
   * Upload custom reference image and store its public URL for generation
   */
  async function uploadReferenceImage(stepNumber: number, file: File) {
    setStepImages(prev => ({
      ...prev,
      [stepNumber]: {
        ...prev[stepNumber],
        isUploadingReference: true
      }
    }));

    try {
      const hintKey = steps.find(s => s.step_number === stepNumber)?.id || stepNumber;
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
      const uploadedUrl = data.imageUrl;

      setStepAIHints(prev => ({
        ...prev,
        [hintKey]: {
          stepId: hintKey,
          aiPrompt: prev[hintKey]?.aiPrompt || (steps.find(s => s.step_number === stepNumber)?.step_description_bg || steps.find(s => s.step_number === stepNumber)?.step_description || ''),
          refinement: prev[hintKey]?.refinement || '',
          customInstructions: prev[hintKey]?.customInstructions || '',
          referenceMode: 'upload',
          specificStep: prev[hintKey]?.specificStep || (stepNumber > 1 ? stepNumber - 1 : 1),
          uploadedReferenceUrl: uploadedUrl
        }
      }));

      setStepImages(prev => ({
        ...prev,
        [stepNumber]: {
          ...prev[stepNumber],
          isUploadingReference: false,
          uploadedReferenceUrl: uploadedUrl
        }
      }));
    } catch (error: any) {
      console.error('Reference upload error:', error);
      alert(`❌ Failed to upload reference: ${error.message}`);
      setStepImages(prev => ({
        ...prev,
        [stepNumber]: {
          ...prev[stepNumber],
          isUploadingReference: false
        }
      }));
    }
  }

  /**
   * Upload step image file to storage and optionally save it for this step
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
      const stepRow = steps.find(s => s.step_number === stepNumber);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('recipeId', recipeId);
      formData.append('stepNumber', stepNumber.toString());
      if (stepRow?.id) {
        formData.append('stepId', stepRow.id.toString());
      }

      const response = await fetch('/api/upload-step-image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      console.log('Step upload response:', data);

      setStepImages(prev => ({
        ...prev,
        [stepNumber]: {
          ...prev[stepNumber],
          imageUrl: data.imageUrl,
          isSaved: data.savedToDb === true,
          isUploading: false,
          source: data.savedToDb === true ? 'existing' : 'upload'
        }
      }));

      if (data.savedToDb) {
        onStepsUpdate();
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`❌ Failed to upload image: ${error.message}`);
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

    const stepRow = steps.find(s => s.step_number === stepNumber);
    if (!stepRow?.id) {
      alert(`❌ Cannot save: step ${stepNumber} has no DB id. Save the recipe first.`);
      return;
    }

    try {
      const res = await fetch('/api/save-step-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId: stepRow.id,
          imageUrl: stepImage.imageUrl,
          imageHints: stepImage.customHints || null,
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStepImages(prev => ({
        ...prev,
        [stepNumber]: {
          ...prev[stepNumber],
          isSaved: true,
          source: 'existing'
        }
      }));

      alert(`✅ Step ${stepNumber} saved!`);
      onStepsUpdate();

    } catch (error: any) {
      console.error('Save error:', error);
      alert(`❌ Failed to save: ${error.message}`);
    }
  }

  /**
   * Save edited description to DB, then close edit mode
   */
  async function saveDescription(stepNumber: number) {
    const step = steps.find(s => s.step_number === stepNumber);
    const newText = editTexts[stepNumber]?.trim();
    if (!newText || !step?.id) return;

    setSavingDescription(stepNumber);
    try {
      const res = await fetch('/api/save-step-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId: step.id, description: newText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEditingStep(null);
      onStepsUpdate(); // refresh parent so step props get updated description
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    } finally {
      setSavingDescription(null);
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
              type="button"
              onClick={clearReferenceImage}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium"
            >
              Clear Reference
            </button>
          </div>
        </div>
      )}

      {/* Provider Selector */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Image Provider</h3>
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" />
            Visual Settings
            <span className="ml-1 px-1.5 py-0.5 bg-blue-200 text-blue-800 rounded text-[10px] uppercase font-bold">
              {generationSettings.lightingStyle}
            </span>
          </button>
        </div>
        <div className="flex gap-3">
          {([
            { value: 'auto',      label: 'Auto (Smart)',    sub: 'Gemini → Replicate fallback' },
            { value: 'gemini',    label: 'Gemini',          sub: '~$0.015' },
            { value: 'replicate', label: 'Replicate',       sub: '~$0.04' },
          ] as const).map(opt => (
            <label
              key={opt.value}
              className={`flex-1 flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition ${
                selectedProvider === opt.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                name="provider"
                value={opt.value}
                checked={selectedProvider === opt.value}
                onChange={() => setSelectedProvider(opt.value)}
              />
              <span className="font-medium text-gray-900 text-sm">{opt.label}</span>
              <span className="text-xs text-gray-500 mt-0.5">{opt.sub}</span>
            </label>
          ))}
        </div>
      </div>

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
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Step {step.step_number}
                </h3>

                {editingStep === step.step_number ? (
                  /* ── Inline edit mode ── */
                  <div className="space-y-2">
                    <textarea
                      autoFocus
                      rows={3}
                      value={editTexts[step.step_number] ?? (step.step_description_bg || step.step_description)}
                      onChange={(e) => setEditTexts(prev => ({ ...prev, [step.step_number]: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-blue-400 rounded-lg text-sm focus:outline-none focus:border-blue-600 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => saveDescription(step.step_number)}
                        disabled={savingDescription === step.step_number || !editTexts[step.step_number]?.trim()}
                        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                      >
                        {savingDescription === step.step_number ? '⏳ Saving...' : '💾 Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingStep(null); setEditTexts(prev => ({ ...prev, [step.step_number]: '' })); }}
                        className="px-4 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 text-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── View mode ── */
                  <div className="group flex items-start gap-2">
                    <p className="text-gray-700 text-sm flex-1">
                      {step.step_description_bg || step.step_description}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditTexts(prev => ({ ...prev, [step.step_number]: step.step_description_bg || step.step_description }));
                        setEditingStep(step.step_number);
                      }}
                      className="shrink-0 px-2 py-1 text-xs text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200 transition-colors"
                      title="Edit description"
                    >
                      ✏️ Edit
                    </button>
                  </div>
                )}

                {step.step_description_en && editingStep !== step.step_number && (
                  <p className="text-gray-400 text-xs mt-1 italic">
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
                          type="button"
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
                          type="button"
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
                    <div className="relative inline-block w-full max-w-md">
                      <img
                        src={state.imageUrl}
                        className="w-full h-64 object-cover rounded-lg"
                        alt={`Step ${step.step_number}`}
                      />
                      {state.provider && (
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold text-white ${
                          state.provider === 'gemini' ? 'bg-blue-600' : 'bg-orange-500'
                        }`}>
                          {state.provider === 'gemini' ? '✨ Gemini' : '⚙️ Replicate'}
                          {state.cost != null && ` · $${state.cost.toFixed(3)}`}
                        </div>
                      )}
                    </div>
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

            {/* Refinement Panel — shown after image is generated */}
            {state.imageUrl && !inCompareMode && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <label className="block text-sm font-semibold text-amber-900 mb-2">
                  🔧 Refinement / Adjustments
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., 'Add more chocolate', 'warmer light', 'rustic style', 'darker background'..."
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none bg-white"
                  value={state.refinement || ''}
                  onChange={(e) => setStepImages(prev => ({
                    ...prev,
                    [step.step_number]: {
                      ...prev[step.step_number],
                      refinement: e.target.value
                    }
                  }))}
                />
                {state.refinement?.trim() && (
                  <button
                    type="button"
                    onClick={() => generateSingleStep(step.step_number)}
                    disabled={state.isGenerating}
                    className={`mt-2 w-full px-4 py-2 rounded-lg font-medium text-sm transition ${
                      state.isGenerating
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    {state.isGenerating ? '⏳ Regenerating...' : '🔧 Regenerate with Refinement'}
                  </button>
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
                  <div className="mt-4 space-y-4">
                    {/* AI Hint Editor: Dual Textareas */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700 uppercase">AI Prompt Editor</label>
                      <div className="grid grid-cols-2 gap-3">
                        {/* LEFT: User Instruction (read-only) */}
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-gray-600 uppercase">User Instruction</div>
                          <textarea
                            readOnly
                            value={step.step_description_bg || step.step_description}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700"
                            rows={4}
                          />
                        </div>

                        {/* RIGHT: AI Prompt (editable) */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold text-gray-600 uppercase">AI Prompt for Gemini</div>
                            <button
                              type="button"
                              onClick={() => {
                                const hint = stepAIHints[step.id || step.step_number];
                                const current = hint?.aiPrompt || (step.step_description_bg || step.step_description);
                                const edited = prompt('Edit AI Prompt:', current);
                                if (edited !== null && edited !== current) {
                                  setStepAIHints(prev => ({
                                    ...prev,
                                    [step.id || step.step_number]: {
                                      stepId: step.id || step.step_number,
                                      aiPrompt: edited,
                                      refinement: hint?.refinement || '',
                                      customInstructions: hint?.customInstructions || '',
                                      referenceMode: hint?.referenceMode || (step.step_number > 1 ? 'previous' : 'none'),
                                      specificStep: hint?.specificStep || (step.step_number > 1 ? step.step_number - 1 : 1),
                                      uploadedReferenceUrl: hint?.uploadedReferenceUrl || null
                                    }
                                  }));
                                }
                              }}
                              className="px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50 rounded border border-blue-200 hover:border-blue-400"
                            >
                              ✏️ Edit
                            </button>
                          </div>
                          <div className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-white text-sm text-gray-700 min-h-[100px] p-2 whitespace-pre-wrap break-words">
                            {stepAIHints[step.id || step.step_number]?.aiPrompt || (step.step_description_bg || step.step_description)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Refinement + Custom Instructions + Toggle */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Refinement (optional)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="e.g., 'Add more chocolate', 'warmer light', 'rustic style'..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          value={stepAIHints[step.id || step.step_number]?.refinement || ''}
                          onChange={(e) => setStepAIHints(prev => ({
                            ...prev,
                            [step.id || step.step_number]: {
                              stepId: step.id || step.step_number,
                              aiPrompt: prev[step.id || step.step_number]?.aiPrompt || (step.step_description_bg || step.step_description),
                              refinement: e.target.value,
                              customInstructions: prev[step.id || step.step_number]?.customInstructions || '',
                              referenceMode: prev[step.id || step.step_number]?.referenceMode || (step.step_number > 1 ? 'previous' : 'none'),
                              specificStep: prev[step.id || step.step_number]?.specificStep || (step.step_number > 1 ? step.step_number - 1 : 1),
                              uploadedReferenceUrl: prev[step.id || step.step_number]?.uploadedReferenceUrl || null
                            }
                          }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Custom Instructions (optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 'no hands', 'top view', 'show vanilla extract'..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={stepAIHints[step.id || step.step_number]?.customInstructions || ''}
                          onChange={(e) => setStepAIHints(prev => ({
                            ...prev,
                            [step.id || step.step_number]: {
                              stepId: step.id || step.step_number,
                              aiPrompt: prev[step.id || step.step_number]?.aiPrompt || (step.step_description_bg || step.step_description),
                              refinement: prev[step.id || step.step_number]?.refinement || '',
                              customInstructions: e.target.value,
                              referenceMode: prev[step.id || step.step_number]?.referenceMode || (step.step_number > 1 ? 'previous' : 'none'),
                              specificStep: prev[step.id || step.step_number]?.specificStep || (step.step_number > 1 ? step.step_number - 1 : 1),
                              uploadedReferenceUrl: prev[step.id || step.step_number]?.uploadedReferenceUrl || null
                            }
                          }))}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Separate multiple hints with commas
                        </p>
                      </div>

                      <div className="space-y-3 pt-2">
                        <label className="block text-sm font-semibold text-gray-800">Reference Image</label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`reference-mode-${step.step_number}`}
                              value="none"
                              checked={(stepAIHints[step.id || step.step_number]?.referenceMode || 'none') === 'none'}
                              onChange={() => setStepAIHints(prev => ({
                                ...prev,
                                [step.id || step.step_number]: {
                                  stepId: step.id || step.step_number,
                                  aiPrompt: prev[step.id || step.step_number]?.aiPrompt || (step.step_description_bg || step.step_description),
                                  refinement: prev[step.id || step.step_number]?.refinement || '',
                                  customInstructions: prev[step.id || step.step_number]?.customInstructions || '',
                                  referenceMode: 'none',
                                  specificStep: prev[step.id || step.step_number]?.specificStep || (step.step_number > 1 ? step.step_number - 1 : 1),
                                  uploadedReferenceUrl: prev[step.id || step.step_number]?.uploadedReferenceUrl || null
                                }
                              }))}
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-gray-700">None (no reference)</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`reference-mode-${step.step_number}`}
                              value="previous"
                              checked={(stepAIHints[step.id || step.step_number]?.referenceMode || (step.step_number > 1 ? 'previous' : 'none')) === 'previous'}
                              onChange={() => setStepAIHints(prev => ({
                                ...prev,
                                [step.id || step.step_number]: {
                                  stepId: step.id || step.step_number,
                                  aiPrompt: prev[step.id || step.step_number]?.aiPrompt || (step.step_description_bg || step.step_description),
                                  refinement: prev[step.id || step.step_number]?.refinement || '',
                                  customInstructions: prev[step.id || step.step_number]?.customInstructions || '',
                                  referenceMode: step.step_number > 1 ? 'previous' : 'none',
                                  specificStep: step.step_number > 1 ? step.step_number - 1 : 1,
                                  uploadedReferenceUrl: prev[step.id || step.step_number]?.uploadedReferenceUrl || null
                                }
                              }))}
                              disabled={step.step_number <= 1}
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-gray-700">
                              Previous step only{step.step_number > 1 ? ` (Step ${step.step_number - 1})` : ' (not available)'}
                            </span>
                          </label>

                          <div className="space-y-2 pl-5">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`reference-mode-${step.step_number}`}
                                value="specific"
                                checked={(stepAIHints[step.id || step.step_number]?.referenceMode) === 'specific'}
                                onChange={() => setStepAIHints(prev => ({
                                  ...prev,
                                  [step.id || step.step_number]: {
                                    stepId: step.id || step.step_number,
                                    aiPrompt: prev[step.id || step.step_number]?.aiPrompt || (step.step_description_bg || step.step_description),
                                    refinement: prev[step.id || step.step_number]?.refinement || '',
                                    customInstructions: prev[step.id || step.step_number]?.customInstructions || '',
                                    referenceMode: 'specific',
                                    specificStep: prev[step.id || step.step_number]?.specificStep || (step.step_number > 1 ? step.step_number - 1 : 1),
                                    uploadedReferenceUrl: prev[step.id || step.step_number]?.uploadedReferenceUrl || null
                                  }
                                }))}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-gray-700">Specific step</span>
                            </label>
                            <select
                              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              value={stepAIHints[step.id || step.step_number]?.specificStep || (step.step_number > 1 ? step.step_number - 1 : 1)}
                              disabled={(stepAIHints[step.id || step.step_number]?.referenceMode) !== 'specific'}
                              onChange={(e) => setStepAIHints(prev => ({
                                ...prev,
                                [step.id || step.step_number]: {
                                  stepId: step.id || step.step_number,
                                  aiPrompt: prev[step.id || step.step_number]?.aiPrompt || (step.step_description_bg || step.step_description),
                                  refinement: prev[step.id || step.step_number]?.refinement || '',
                                  customInstructions: prev[step.id || step.step_number]?.customInstructions || '',
                                  referenceMode: 'specific',
                                  specificStep: Number(e.target.value),
                                  uploadedReferenceUrl: prev[step.id || step.step_number]?.uploadedReferenceUrl || null
                                }
                              }))}
                            >
                              {steps.filter(s => s.step_number !== step.step_number).map(s => (
                                <option key={s.step_number} value={s.step_number}>
                                  Step {s.step_number}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2 pl-5">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`reference-mode-${step.step_number}`}
                                value="upload"
                                checked={(stepAIHints[step.id || step.step_number]?.referenceMode) === 'upload'}
                                onChange={() => setStepAIHints(prev => ({
                                  ...prev,
                                  [step.id || step.step_number]: {
                                    stepId: step.id || step.step_number,
                                    aiPrompt: prev[step.id || step.step_number]?.aiPrompt || (step.step_description_bg || step.step_description),
                                    refinement: prev[step.id || step.step_number]?.refinement || '',
                                    customInstructions: prev[step.id || step.step_number]?.customInstructions || '',
                                    referenceMode: 'upload',
                                    specificStep: prev[step.id || step.step_number]?.specificStep || (step.step_number > 1 ? step.step_number - 1 : 1),
                                    uploadedReferenceUrl: prev[step.id || step.step_number]?.uploadedReferenceUrl || null
                                  }
                                }))}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-gray-700">Upload custom image</span>
                            </label>
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                disabled={(stepAIHints[step.id || step.step_number]?.referenceMode) !== 'upload' || state.isUploadingReference}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) uploadReferenceImage(step.step_number, file);
                                }}
                                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              />
                              {state.isUploadingReference && (
                                <p className="mt-2 text-sm text-gray-600">⏳ Uploading reference image...</p>
                              )}
                              {stepAIHints[step.id || step.step_number]?.uploadedReferenceUrl && (
                                <p className="mt-2 text-sm text-green-600">Reference uploaded and ready.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Save AI Hint Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const hint = stepAIHints[step.id || step.step_number];
                        if (!hint) {
                          alert('⚠️ No changes to save');
                          return;
                        }
                        alert(`✅ AI Hint saved (temporary - will be cleared when recipe is saved)`);
                      }}
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition"
                    >
                      💾 Save AI Hint (Temporary)
                    </button>

                    {/* Generate Image Button */}
                    <button
                      type="button"
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
                    type="button"
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
                      type="button"
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
                        type="button"
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
            type="button"
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

      {/* Generation Settings Modal */}
      <GenerationSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={generationSettings}
        onSave={(newSettings) => {
          setGenerationSettings(newSettings);
          try {
            localStorage.setItem('keto-generation-settings', JSON.stringify(newSettings));
          } catch {}
        }}
      />
    </div>
  );
}