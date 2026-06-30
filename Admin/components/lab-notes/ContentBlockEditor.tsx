'use client';

import { Trash2, Plus, GripVertical } from 'lucide-react';
import type { ContentBlock, MatrixRow } from '@/lib/types/labNotes';

interface Props {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

type BlockType = ContentBlock['type'];

const BLOCK_META: Record<BlockType, { label: string; badge: string }> = {
  intro:          { label: 'Intro',          badge: 'bg-blue-100 text-blue-800' },
  lab_note:       { label: 'Lab Note',       badge: 'bg-amber-100 text-amber-800' },
  matrix:         { label: 'Matrix',         badge: 'bg-purple-100 text-purple-800' },
  critical_error: { label: 'Critical Error', badge: 'bg-red-100 text-red-800' },
  tip:            { label: 'Tip',            badge: 'bg-green-100 text-green-800' },
};

const BLOCK_TYPES: BlockType[] = ['intro', 'lab_note', 'matrix', 'critical_error', 'tip'];

function createBlock(type: BlockType): ContentBlock {
  if (type === 'lab_note') return { type, label_en: 'LAB NOTE', text_en: '', text_bg: '' };
  if (type === 'matrix')   return { type, title_en: '', title_bg: '', rows: [] };
  return { type, text_en: '', text_bg: '' } as ContentBlock;
}

function FieldInput({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#A80048] focus:border-transparent"
      />
    </div>
  );
}

function FieldTextarea({
  label, value, onChange, rows = 3,
}: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#A80048] focus:border-transparent resize-y"
      />
    </div>
  );
}

function BlockEditor({
  block, index, onUpdate, onRemove,
}: {
  block: ContentBlock;
  index: number;
  onUpdate: (b: ContentBlock) => void;
  onRemove: () => void;
}) {
  const meta = BLOCK_META[block.type];

  // Type-safe field updater
  function patch(fields: Partial<Record<string, unknown>>) {
    onUpdate({ ...block, ...fields } as ContentBlock);
  }

  function updateRow(ri: number, rowPatch: Partial<MatrixRow>) {
    if (block.type !== 'matrix') return;
    const rows = [...(block.rows ?? [])];
    rows[ri] = { ...rows[ri], ...rowPatch } as MatrixRow;
    patch({ rows });
  }

  function addRow() {
    if (block.type !== 'matrix') return;
    patch({ rows: [...(block.rows ?? []), { label: '', value_en: '', value_bg: '' }] });
  }

  function removeRow(ri: number) {
    if (block.type !== 'matrix') return;
    patch({ rows: (block.rows ?? []).filter((_, i) => i !== ri) });
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GripVertical size={16} className="text-gray-400" />
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.badge}`}>
            {meta.label}
          </span>
          <span className="text-xs text-gray-400">#{index + 1}</span>
        </div>
        <button type="button" onClick={onRemove} className="p-1 text-red-400 hover:text-red-600">
          <Trash2 size={15} />
        </button>
      </div>

      <div className="space-y-3">
        {(block.type === 'intro' || block.type === 'critical_error' || block.type === 'tip') && (
          <>
            <FieldTextarea label="Text EN *" value={block.text_en ?? ''} onChange={v => patch({ text_en: v })} />
            <FieldTextarea label="Text BG"   value={block.text_bg ?? ''} onChange={v => patch({ text_bg: v })} />
          </>
        )}

        {block.type === 'lab_note' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <FieldInput label="Label EN" value={block.label_en ?? 'LAB NOTE'} onChange={v => patch({ label_en: v })} />
              <FieldInput label="Label BG" value={block.label_bg ?? ''}         onChange={v => patch({ label_bg: v })} />
            </div>
            <FieldTextarea label="Text EN *" value={block.text_en ?? ''} onChange={v => patch({ text_en: v })} />
            <FieldTextarea label="Text BG"   value={block.text_bg ?? ''} onChange={v => patch({ text_bg: v })} />
          </>
        )}

        {block.type === 'matrix' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <FieldInput label="Title EN" value={block.title_en ?? ''} onChange={v => patch({ title_en: v })} />
              <FieldInput label="Title BG" value={block.title_bg ?? ''} onChange={v => patch({ title_bg: v })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Rows</label>
              <div className="space-y-2">
                {(block.rows ?? []).map((row, ri) => (
                  <div key={ri} className="grid grid-cols-[1fr_1fr_1fr_28px] gap-2 items-center">
                    <input
                      type="text" placeholder="Label"    value={row.label}    onChange={e => updateRow(ri, { label: e.target.value })}
                      className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#A80048]"
                    />
                    <input
                      type="text" placeholder="Value EN" value={row.value_en} onChange={e => updateRow(ri, { value_en: e.target.value })}
                      className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#A80048]"
                    />
                    <input
                      type="text" placeholder="Value BG" value={row.value_bg ?? ''} onChange={e => updateRow(ri, { value_bg: e.target.value })}
                      className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#A80048]"
                    />
                    <button type="button" onClick={() => removeRow(ri)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button" onClick={addRow}
                className="mt-2 inline-flex items-center gap-1 text-xs text-[#A80048] hover:underline"
              >
                <Plus size={11} /> Add Row
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ContentBlockEditor({ blocks, onChange }: Props) {
  function addBlock(type: BlockType) {
    onChange([...blocks, createBlock(type)]);
  }
  function updateBlock(i: number, b: ContentBlock) {
    const next = [...blocks];
    next[i] = b;
    onChange(next);
  }
  function removeBlock(i: number) {
    onChange(blocks.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <div className="space-y-3">
        {blocks.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            No content blocks yet — add one below.
          </div>
        )}
        {blocks.map((block, i) => (
          <BlockEditor
            key={i}
            block={block}
            index={i}
            onUpdate={b => updateBlock(i, b)}
            onRemove={() => removeBlock(i)}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {BLOCK_TYPES.map(type => (
          <button
            key={type}
            type="button"
            onClick={() => addBlock(type)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            <Plus size={11} />
            {BLOCK_META[type].label}
          </button>
        ))}
      </div>
    </div>
  );
}
