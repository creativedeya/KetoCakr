'use client';

import { useState } from 'react';
import { X, Settings2, Zap } from 'lucide-react';
import { GenerationSettings, GENERATION_PRESETS } from '@/lib/types/generationSettings';

interface GenerationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GenerationSettings;
  onSave: (settings: GenerationSettings) => void;
}

export function GenerationSettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: GenerationSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<GenerationSettings>(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const isPresetActive = (preset: GenerationSettings) =>
    localSettings.backgroundColor === preset.backgroundColor &&
    localSettings.viewingAngle === preset.viewingAngle &&
    localSettings.lightingStyle === preset.lightingStyle &&
    localSettings.backgroundTexture === preset.backgroundTexture;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold">Generation Settings</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-600">Quick Presets</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(GENERATION_PRESETS).map(([name, preset]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setLocalSettings({ ...preset })}
                  className={`px-3 py-2 rounded-lg border-2 text-xs font-bold uppercase text-center transition-all ${
                    isPresetActive(preset)
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-600">Background</label>
            <div className="grid grid-cols-4 gap-2">
              {(['black', 'dark-slate', 'white', 'transparent'] as const).map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, backgroundColor: color })}
                  className={`p-3 rounded-lg border-2 font-bold text-[10px] uppercase text-center transition-all ${
                    localSettings.backgroundColor === color
                      ? 'border-blue-600 ring-2 ring-blue-200'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{
                    backgroundColor:
                      color === 'black' ? '#000' :
                      color === 'dark-slate' ? '#3a3f47' :
                      color === 'white' ? '#fff' :
                      '#f0f0f0',
                    color: ['black', 'dark-slate'].includes(color) ? 'white' : 'black',
                  }}
                >
                  {color.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Viewing Angle */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-600">Viewing Angle</label>
            <div className="grid grid-cols-2 gap-2">
              {(['overhead', '45-degree', 'side', 'close-up'] as const).map(angle => (
                <button
                  key={angle}
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, viewingAngle: angle })}
                  className={`px-3 py-2 rounded-lg border-2 font-bold text-xs uppercase transition-all ${
                    localSettings.viewingAngle === angle
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {angle === '45-degree' ? '45°' : angle === 'close-up' ? 'Close-up' : angle}
                </button>
              ))}
            </div>
          </div>

          {/* Lighting Style */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-600">Lighting</label>
            <div className="grid grid-cols-2 gap-2">
              {(['studio', 'natural', 'warm', 'cool', 'dramatic'] as const).map(light => (
                <button
                  key={light}
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, lightingStyle: light })}
                  className={`px-3 py-2 rounded-lg border-2 font-bold text-xs uppercase transition-all ${
                    localSettings.lightingStyle === light
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {light}
                </button>
              ))}
            </div>
          </div>

          {/* Background Texture */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-600">Texture</label>
            <div className="grid grid-cols-2 gap-2">
              {(['slate', 'wood', 'marble', 'plain', 'linen'] as const).map(texture => (
                <button
                  key={texture}
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, backgroundTexture: texture })}
                  className={`px-3 py-2 rounded-lg border-2 font-bold text-xs uppercase transition-all ${
                    localSettings.backgroundTexture === texture
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {texture}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50">
            <p className="text-[10px] text-gray-600 uppercase font-bold mb-2">Current Settings</p>
            <p className="text-xs text-gray-700 space-y-1">
              <span className="block"><strong>Background:</strong> {localSettings.backgroundColor}</span>
              <span className="block"><strong>Angle:</strong> {localSettings.viewingAngle}</span>
              <span className="block"><strong>Lighting:</strong> {localSettings.lightingStyle}</span>
              <span className="block"><strong>Texture:</strong> {localSettings.backgroundTexture}</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-bold text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
}
