'use client';

interface StepLabNotesProps {
  stepNumber: number;
  notesBg: string;
  notesEn: string;
  onNotesChange: (notesBg: string, notesEn: string) => void;
}

export function StepLabNotes({
  stepNumber,
  notesBg,
  notesEn,
  onNotesChange,
}: StepLabNotesProps) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-900">
        📝 Lab Notes за Стъпка {stepNumber}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">
          На Български
        </label>
        <textarea
          value={notesBg}
          onChange={e => onNotesChange(e.target.value, notesEn)}
          placeholder="Съвети, трикове, наблюдения, предупреждения... (БГ)"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">
          In English
        </label>
        <textarea
          value={notesEn}
          onChange={e => onNotesChange(notesBg, e.target.value)}
          placeholder="Tips, tricks, observations, warnings... (EN)"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm resize-none"
        />
      </div>

      <p className="text-xs text-gray-400">
        💡 Lab notes ще бъдат видими в cooking mode в мобилното приложение.
      </p>
    </div>
  );
}
