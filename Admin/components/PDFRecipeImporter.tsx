'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { PDFUploadZone } from './PDFUploadZone';
import { RecipePreview } from './RecipePreview';
import type { ParsedRecipe } from '@/app/api/pdf-import/parse/route';

type Step = 'upload' | 'parsing' | 'preview' | 'executing' | 'complete';

const STEPS: { key: Step; label: string }[] = [
  { key: 'upload', label: 'Upload' },
  { key: 'parsing', label: 'Parse' },
  { key: 'preview', label: 'Preview' },
  { key: 'executing', label: 'Import' },
];

function stepIndex(s: Step) {
  return STEPS.findIndex((x) => x.key === s);
}

export function PDFRecipeImporter() {
  const [step, setStep] = useState<Step>('upload');
  const [recipes, setRecipes] = useState<ParsedRecipe[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [importedCount, setImportedCount] = useState(0);
  const [chunkProgress, setChunkProgress] = useState<{ current: number; total: number } | null>(null);

  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk

  async function handleFileSelect(file: File) {
    setIsLoading(true);
    setStep('parsing');
    setErrors([]);
    setChunkProgress(null);

    const sessionId = crypto.randomUUID();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    try {
      // Upload in 5MB chunks — each chunk is small enough for FormData
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        setChunkProgress({ current: i + 1, total: totalChunks });
        setMessage(`Качване: ${i + 1}/${totalChunks} (${(file.size / 1024 / 1024).toFixed(1)} MB общо)...`);

        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('chunkIndex', String(i));
        formData.append('totalChunks', String(totalChunks));
        formData.append('filename', file.name);
        formData.append('sessionId', sessionId);

        const res = await fetch('/api/pdf-import/upload-chunk', { method: 'POST', body: formData });
        const data = await res.json();

        if (!data.success) {
          setErrors([data.error || `Грешка при качване на чанк ${i + 1}`]);
          setStep('upload');
          return;
        }
      }

      // All chunks uploaded — trigger Claude parse
      setChunkProgress(null);
      setMessage('Claude AI анализира PDF...');

      const parseRes = await fetch('/api/pdf-import/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, sessionId }),
      });
      const parseData = await parseRes.json();

      if (!parseData.success) {
        setErrors(parseData.errors || [parseData.error || 'Parse failed']);
        setStep('upload');
        return;
      }

      setRecipes(parseData.recipes);
      setErrors(parseData.errors || []);
      setMessage(`Намерени ${parseData.stats.parsed} рецепти`);
      setStep('preview');
    } catch (err: any) {
      setErrors([err.message || 'Unknown error']);
      setStep('upload');
    } finally {
      setIsLoading(false);
      setChunkProgress(null);
    }
  }

  async function handleExecute() {
    setIsLoading(true);
    setStep('executing');
    setMessage('Записване в базата данни...');

    try {
      const res = await fetch('/api/pdf-import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipes }),
      });
      const data = await res.json();

      if (!data.success) {
        setErrors([data.error || 'Execute failed']);
        setStep('preview');
        return;
      }

      setImportedCount(data.imported);
      if (data.errors?.length) setErrors(data.errors);
      setMessage(`Успешно импортирани ${data.imported} рецепти!`);
      setStep('complete');
    } catch (err: any) {
      setErrors([err.message || 'Unknown error']);
      setStep('preview');
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setStep('upload');
    setRecipes([]);
    setErrors([]);
    setMessage('');
    setImportedCount(0);
  }

  const currentStepIdx = stepIndex(step === 'executing' ? 'executing' : step);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">PDF Recipe Importer</h1>
        <p className="text-sm text-gray-500 mt-1">
          Качи PDF готварска книга — Claude AI извлича рецептите автоматично
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, idx) => (
          <div key={s.key} className="flex items-center gap-2 flex-1 last:flex-none">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                idx <= currentStepIdx
                  ? 'bg-[#A80048] text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {idx < currentStepIdx ? <CheckCircle2 size={16} /> : idx + 1}
            </div>
            <span className={`text-sm ${idx <= currentStepIdx ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
              {s.label}
            </span>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-px ${idx < currentStepIdx ? 'bg-[#A80048]' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Status message */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm font-medium ${
            step === 'complete'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : isLoading
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-gray-50 text-gray-700 border border-gray-200'
          }`}
        >
          {isLoading && <Loader2 size={14} className="inline animate-spin mr-2" />}
          {message}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
            <AlertCircle size={15} /> {errors.length > 1 ? `${errors.length} грешки` : 'Грешка'}
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((e, i) => (
              <li key={i}>• {e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Step: Upload */}
      {step === 'upload' && (
        <PDFUploadZone onFileSelect={handleFileSelect} isLoading={isLoading} />
      )}

      {/* Step: Parsing */}
      {step === 'parsing' && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 size={40} className="animate-spin text-[#A80048]" />
          {chunkProgress ? (
            <>
              <p className="text-gray-600 font-medium">
                Качване на PDF — чанк {chunkProgress.current}/{chunkProgress.total}
              </p>
              <div className="w-64 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#A80048] h-2 rounded-full transition-all"
                  style={{ width: `${(chunkProgress.current / chunkProgress.total) * 100}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 font-medium">⚡ Бързо парсиране с pdf-parse...</p>
              <p className="text-sm text-gray-400">Очаквано време: 30-60 секунди</p>
            </>
          )}
        </div>
      )}

      {/* Step: Preview */}
      {(step === 'preview' || step === 'executing') && recipes.length > 0 && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-700 font-semibold">
              <CheckCircle2 size={15} className="inline mr-1" />
              {recipes.length} рецепти готови за импорт
            </p>
          </div>

          <RecipePreview recipes={recipes} maxDisplay={3} />

          <button
            onClick={handleExecute}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-[#A80048] text-white rounded-xl hover:bg-[#8a003c] disabled:opacity-50 font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Записване...
              </>
            ) : (
              `Импортирай ${recipes.length} рецепти в базата данни`
            )}
          </button>

          {!isLoading && (
            <button
              onClick={handleReset}
              className="w-full px-4 py-2 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} /> Назад
            </button>
          )}
        </div>
      )}

      {/* Step: Complete */}
      {step === 'complete' && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center">
          <CheckCircle2 size={48} className="mx-auto mb-3 text-green-600" />
          <h3 className="text-xl font-bold text-green-900 mb-1">Импортът е успешен!</h3>
          <p className="text-green-700 mb-1">{importedCount} рецепти добавени в базата данни</p>
          {errors.length > 0 && (
            <p className="text-amber-600 text-sm mb-3">{errors.length} предупреждения — виж по-горе</p>
          )}
          <div className="flex gap-3 justify-center mt-4">
            <a
              href="/dashboard/simple-recipes"
              className="px-4 py-2 bg-[#A80048] text-white rounded-lg hover:bg-[#8a003c] text-sm font-medium"
            >
              Виж Simple Recipes
            </a>
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
            >
              Импортирай друг PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
