import OpenAI from 'openai';
import type { ContentBlock, ParsedLabNote } from './types/labNotes';

const client = new OpenAI();

interface Item { id: string; text: string; context: string; }

async function batchTranslate(items: Item[]): Promise<Record<string, string>> {
  const filtered = items.filter(i => i.text?.trim());
  if (!filtered.length) return {};

  const prompt = filtered
    .map((item, i) => `${i}. [${item.context}] ${item.text}`)
    .join('\n');

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 4096,
    messages: [
      {
        role: 'system',
        content: `You are a professional Bulgarian translator for baking and pastry science content.
Translate each numbered item to Bulgarian.
- Keep technical terms like "ganache", "tempering", "emulsification", "Maillard" in original or use well-known Bulgarian equivalents
- Preserve formatting and paragraph breaks
- Do not add explanations or translator notes
- Return ONLY valid JSON array: [{"id": "0", "translated": "..."}, {"id": "1", "translated": "..."}, ...]`,
      },
      { role: 'user', content: `Translate to Bulgarian:\n\n${prompt}` },
    ],
  });

  const text = response.choices[0]?.message?.content ?? '';
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return {};

  try {
    const results: { id: string; translated: string }[] = JSON.parse(match[0]);
    const map: Record<string, string> = {};
    for (const r of results) {
      const idx = parseInt(r.id, 10);
      if (!isNaN(idx) && filtered[idx]) {
        map[filtered[idx].id] = r.translated ?? '';
      }
    }
    return map;
  } catch {
    return {};
  }
}

export async function translateParsedNote(note: ParsedLabNote): Promise<ParsedLabNote> {
  const items: Item[] = [];

  if (note.title_en) items.push({ id: 'title', text: note.title_en, context: 'lab note title' });
  if (note.subtitle_en) items.push({ id: 'subtitle', text: note.subtitle_en, context: 'subtitle tagline' });

  note.content_json.forEach((block, bi) => {
    if (block.type === 'intro' && block.text_en) {
      items.push({ id: `b${bi}_text`, text: block.text_en, context: 'intro paragraph' });
    } else if (block.type === 'lab_note') {
      if (block.label_en && block.label_en !== 'LAB NOTE') {
        items.push({ id: `b${bi}_label`, text: block.label_en, context: 'lab note label' });
      }
      if (block.text_en) items.push({ id: `b${bi}_text`, text: block.text_en, context: 'lab note explanation' });
    } else if (block.type === 'matrix' && block.title_en) {
      items.push({ id: `b${bi}_title`, text: block.title_en, context: 'matrix title' });
    } else if (block.type === 'critical_error' && block.text_en) {
      items.push({ id: `b${bi}_text`, text: block.text_en, context: 'critical error warning' });
    } else if (block.type === 'tip' && block.text_en) {
      items.push({ id: `b${bi}_text`, text: block.text_en, context: 'baking tip' });
    }
  });

  const t = await batchTranslate(items);

  return {
    ...note,
    title_bg: t['title'] ?? '',
    subtitle_bg: t['subtitle'] ?? '',
    content_json: note.content_json.map((block, bi) => {
      if (block.type === 'intro') return { ...block, text_bg: t[`b${bi}_text`] ?? '' };
      if (block.type === 'lab_note') return {
        ...block,
        label_bg: t[`b${bi}_label`] ?? (block.label_en === 'LAB NOTE' ? 'ЛАБ. БЕЛЕЖКА' : (block.label_en ?? '')),
        text_bg: t[`b${bi}_text`] ?? '',
      };
      if (block.type === 'matrix') return { ...block, title_bg: t[`b${bi}_title`] ?? '' };
      if (block.type === 'critical_error') return { ...block, text_bg: t[`b${bi}_text`] ?? '' };
      if (block.type === 'tip') return { ...block, text_bg: t[`b${bi}_text`] ?? '' };
      return block;
    }) as ContentBlock[],
  };
}

export async function batchTranslateToEnglish(
  items: Array<{ id: string; text: string }>,
): Promise<Record<string, string>> {
  const filtered = items.filter(i => i.text?.trim());
  if (!filtered.length) return {};

  const prompt = filtered
    .map((item, i) => `${i}. ${item.text}`)
    .join('\n\n---\n\n');

  console.log(`[batchTranslateToEnglish] Sending ${filtered.length} items to OpenAI`);

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 4096,
    messages: [
      {
        role: 'system',
        content: `You are a professional translator. Your task is to translate Bulgarian text into English.
Rules:
- Translate FROM Bulgarian TO English (output must be English)
- Keep technical baking terms (ganache, tempering, emulsification, etc.) as-is
- Preserve paragraph structure and formatting
- Do not add explanations or translator notes
- Return ONLY valid JSON array: [{"id": "0", "translated": "..."}, {"id": "1", "translated": "..."}, ...]`,
      },
      {
        role: 'user',
        content: `Translate each item FROM Bulgarian TO English. Return JSON array.\n\n${prompt}`,
      },
    ],
  });

  const finishReason = response.choices[0]?.finish_reason;
  const rawText = response.choices[0]?.message?.content ?? '';

  console.log(`[batchTranslateToEnglish] finish_reason=${finishReason}, response length=${rawText.length}`);
  console.log(`[batchTranslateToEnglish] raw response (first 300 chars): ${rawText.slice(0, 300)}`);

  if (finishReason === 'length') {
    console.warn('[batchTranslateToEnglish] WARNING: response was truncated (hit max_tokens). Reduce batch size.');
  }

  const match = rawText.match(/\[[\s\S]*\]/);
  if (!match) {
    console.warn('[batchTranslateToEnglish] No JSON array found in response');
    return {};
  }

  try {
    const results: { id: string; translated: string }[] = JSON.parse(match[0]);
    const map: Record<string, string> = {};
    for (const r of results) {
      const idx = parseInt(r.id, 10);
      if (!isNaN(idx) && filtered[idx]) {
        map[filtered[idx].id] = r.translated ?? '';
      }
    }
    console.log(`[batchTranslateToEnglish] Parsed ${Object.keys(map).length}/${filtered.length} translations`);
    // Log first translation to verify direction
    const firstKey = Object.keys(map)[0];
    if (firstKey) console.log(`[batchTranslateToEnglish] Sample [${firstKey}]: ${map[firstKey].slice(0, 100)}`);
    return map;
  } catch (e) {
    console.error('[batchTranslateToEnglish] JSON.parse failed:', e);
    return {};
  }
}

export async function autoTranslateMissing(
  title_en: string,
  title_bg: string | null | undefined,
  subtitle_en: string | null | undefined,
  subtitle_bg: string | null | undefined,
  content_json: ContentBlock[],
): Promise<{ title_bg: string; subtitle_bg: string; content_json: ContentBlock[] }> {
  const items: Item[] = [];

  if (!title_bg && title_en) items.push({ id: 'title', text: title_en, context: 'lab note title' });
  if (!subtitle_bg && subtitle_en) items.push({ id: 'subtitle', text: subtitle_en, context: 'subtitle tagline' });

  content_json.forEach((block, bi) => {
    if (block.type === 'intro' && block.text_en && !block.text_bg) {
      items.push({ id: `b${bi}_text`, text: block.text_en, context: 'intro paragraph' });
    } else if (block.type === 'lab_note') {
      if (block.label_en && block.label_en !== 'LAB NOTE' && !block.label_bg) {
        items.push({ id: `b${bi}_label`, text: block.label_en, context: 'lab note label' });
      }
      if (block.text_en && !block.text_bg) {
        items.push({ id: `b${bi}_text`, text: block.text_en, context: 'lab note explanation' });
      }
    } else if (block.type === 'matrix' && block.title_en && !block.title_bg) {
      items.push({ id: `b${bi}_title`, text: block.title_en, context: 'matrix title' });
    } else if (block.type === 'critical_error' && block.text_en && !block.text_bg) {
      items.push({ id: `b${bi}_text`, text: block.text_en, context: 'critical error warning' });
    } else if (block.type === 'tip' && block.text_en && !block.text_bg) {
      items.push({ id: `b${bi}_text`, text: block.text_en, context: 'baking tip' });
    }
  });

  if (!items.length) {
    return { title_bg: title_bg ?? '', subtitle_bg: subtitle_bg ?? '', content_json };
  }

  const t = await batchTranslate(items);

  return {
    title_bg: t['title'] ?? title_bg ?? '',
    subtitle_bg: t['subtitle'] ?? subtitle_bg ?? '',
    content_json: content_json.map((block, bi) => {
      if (block.type === 'intro') return { ...block, text_bg: block.text_bg || t[`b${bi}_text`] || '' };
      if (block.type === 'lab_note') return {
        ...block,
        label_bg: block.label_bg || t[`b${bi}_label`] || (block.label_en === 'LAB NOTE' ? 'ЛАБ. БЕЛЕЖКА' : ''),
        text_bg: block.text_bg || t[`b${bi}_text`] || '',
      };
      if (block.type === 'matrix') return { ...block, title_bg: block.title_bg || t[`b${bi}_title`] || '' };
      if (block.type === 'critical_error') return { ...block, text_bg: block.text_bg || t[`b${bi}_text`] || '' };
      if (block.type === 'tip') return { ...block, text_bg: block.text_bg || t[`b${bi}_text`] || '' };
      return block;
    }) as ContentBlock[],
  };
}
