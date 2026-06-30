'use client';
import { useState } from 'react';

interface Step {
  id?: string;
  step_number: number;
  step_description?: string;
  step_description_bg: string;
  step_description_en: string;
  step_duration_minutes?: number;
  step_image_url?: string | null;
  ingredient_ids?: number[] | null;
  equipment_needed?: number[] | null;
}

interface StepsEditorProps {
  recipeId: string;
  initialSteps: Step[];
  onSaved?: () => void;
}

export default function StepsEditor({ recipeId, initialSteps, onSaved }: StepsEditorProps) {
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const updateStep = (index: number, field: 'step_description_bg' | 'step_description_en', value: string) => {
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const updateStepDuration = (index: number, value: number) => {
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, step_duration_minutes: value } : s));
  };

  const addStep = (afterIndex?: number) => {
    const newStep: Step = {
      step_number: 0,
      step_description_bg: '',
      step_description_en: '',
      step_duration_minutes: 0,
    };
    setSteps(prev => {
      const next = [...prev];
      const insertAt = afterIndex !== undefined ? afterIndex + 1 : next.length;
      next.splice(insertAt, 0, newStep);
      return next.map((s, i) => ({ ...s, step_number: i + 1 }));
    });
  };

  const deleteStep = (index: number) => {
    if (!confirm('Изтрий тази стъпка?')) return;
    setSteps(prev => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, step_number: i + 1 })));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    setSteps(prev => {
      const next = [...prev];
      const swapWith = direction === 'up' ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= next.length) return prev;
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return next.map((s, i) => ({ ...s, step_number: i + 1 }));
    });
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/simple-recipes/${recipeId}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage('✅ Запазено успешно');
      onSaved?.();
    } catch (err: any) {
      setMessage(`❌ Грешка: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginTop: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>
          Стъпки ({steps.length})
        </h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {message && <span style={{ fontSize: 14 }}>{message}</span>}
          <button
            onClick={() => addStep()}
            style={{ padding: '8px 16px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            + Добави стъпка
          </button>
          <button
            onClick={save}
            disabled={saving}
            style={{ padding: '8px 16px', backgroundColor: '#A80048', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Запазване...' : 'Запази стъпките'}
          </button>
        </div>
      </div>

      {steps.length === 0 && (
        <p style={{ color: '#9ca3af', textAlign: 'center', padding: 32 }}>
          Няма стъпки. Добави първата стъпка.
        </p>
      )}

      {steps.map((step, index) => (
        <div key={index} style={{
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          backgroundColor: '#fafafa',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 600, color: '#A80048' }}>Стъпка {index + 1}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => moveStep(index, 'up')} disabled={index === 0}
                style={{ padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', backgroundColor: 'white', opacity: index === 0 ? 0.4 : 1 }}>
                ↑
              </button>
              <button onClick={() => moveStep(index, 'down')} disabled={index === steps.length - 1}
                style={{ padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', backgroundColor: 'white', opacity: index === steps.length - 1 ? 0.4 : 1 }}>
                ↓
              </button>
              <button onClick={() => addStep(index)}
                style={{ padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', backgroundColor: 'white', fontSize: 12 }}>
                + след
              </button>
              <button onClick={() => deleteStep(index)}
                style={{ padding: '4px 10px', border: '1px solid #fca5a5', borderRadius: 6, cursor: 'pointer', backgroundColor: '#fff5f5', color: '#dc2626' }}>
                ✕
              </button>
            </div>
          </div>

          <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>
            Инструкция (BG)
          </label>
          <textarea
            value={step.step_description_bg}
            onChange={e => updateStep(index, 'step_description_bg', e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box', marginBottom: 8 }}
          />

          <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>
            Инструкция (EN)
          </label>
          <textarea
            value={step.step_description_en || ''}
            onChange={e => updateStep(index, 'step_description_en', e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }}
            placeholder="English translation (optional)"
          />

          {/* Timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <label style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>
              ⏱ Таймер (минути)
            </label>
            <input
              type="number"
              min={0}
              max={180}
              value={step.step_duration_minutes ?? 0}
              onChange={e => updateStepDuration(index, parseInt(e.target.value) || 0)}
              style={{
                width: 80,
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14,
                textAlign: 'center',
              }}
            />
            <span style={{ fontSize: 12, color: '#9ca3af' }}>
              {(step.step_duration_minutes ?? 0) === 0 ? '(без таймер)' : `= ${step.step_duration_minutes} мин`}
            </span>
          </div>
        </div>
      ))}

      {steps.length > 0 && (
        <div style={{ textAlign: 'right', marginTop: 8 }}>
          <button
            onClick={save}
            disabled={saving}
            style={{ padding: '10px 24px', backgroundColor: '#A80048', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Запазване...' : 'Запази стъпките'}
          </button>
          {message && <span style={{ marginLeft: 12, fontSize: 14 }}>{message}</span>}
        </div>
      )}
    </div>
  );
}
