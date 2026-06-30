import type { ContentBlock, LabNoteCategory, ParsedLabNote } from './types/labNotes';

function stripHtmlTags(html: string): string {
  return html
    .replace(/<span[^>]*class="lab-note"[^>]*>.*?<\/span>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function extractEmoji(text: string): string {
  const match = text.match(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/u);
  return match ? match[0] : '';
}

function inferCategory(pillClass: string, titleText: string): LabNoteCategory {
  const combined = (pillClass + ' ' + titleText).toLowerCase();
  if (/chocolate|ganache|cocoa|cacao/.test(combined)) return 'chocolate';
  if (/flour|almond|blanch/.test(combined)) return 'flours';
  if (/sweetener|erythritol|allulose|stevia|monk|maltitol/.test(combined)) return 'sweeteners';
  if (/assembly|layer|mascarpone/.test(combined)) return 'assembly';
  if (/mistake|error|wrong|avoid|fail/.test(combined)) return 'mistakes';
  return 'general';
}

const SKIP_PATTERNS = [
  /^#\w/,
  /^Comment LAB/,
  /^Full protocol/,
  /ketocakelab\.com/,
  /^𝑊|^𝑤/u,
];

function isSkippableLine(line: string): boolean {
  return SKIP_PATTERNS.some(p => p.test(line));
}

function parseCaptionIntoBlocks(captionHtml: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const LAB_NOTE_SPAN = '<span class="lab-note">LAB NOTE —</span>';
  const parts = captionHtml.split(LAB_NOTE_SPAN);

  // First segment → intro
  const introLines = (parts[0] || '')
    .split(/\n\n+/)
    .map(p => stripHtmlTags(p).trim())
    .filter(p => p.length > 0 && !isSkippableLine(p));

  if (introLines.length > 0) {
    blocks.push({ type: 'intro', text_en: introLines.join('\n\n'), text_bg: '' });
  }

  // Subsequent segments → each is a LAB NOTE block
  for (let i = 1; i < parts.length; i++) {
    // Take text up to the next double-newline as the lab note body
    const labText = parts[i]
      .split(/\n\n+/)[0]
      .replace(/\n/g, ' ')
      .trim();
    const cleaned = stripHtmlTags(labText).trim();
    if (cleaned) {
      blocks.push({ type: 'lab_note', label_en: 'LAB NOTE', label_bg: '', text_en: cleaned, text_bg: '' });
    }
  }

  return blocks;
}

function parsePostChunk(chunk: string): ParsedLabNote | null {
  // Title
  const titleStart = chunk.indexOf('<div class="post-title">');
  if (titleStart === -1) return null;
  const titleInner = chunk.slice(titleStart + 24, chunk.indexOf('</div>', titleStart));
  const title = stripHtmlTags(titleInner).trim();
  if (!title) return null;

  // Pill class (for category)
  const pillMatch = chunk.match(/<span class="(pill[^"]+)"/);
  const pillClass = pillMatch?.[1] ?? '';

  const category = inferCategory(pillClass, title);
  const icon = extractEmoji(title) || '🧪';

  // Caption text — find id="cap-pN" div content
  const capIdx = chunk.indexOf(' id="cap-p');
  if (capIdx === -1) return null;
  const capContentStart = chunk.indexOf('>', capIdx) + 1;
  const capContentEnd = chunk.indexOf('</div>', capContentStart);
  if (capContentStart === 0 || capContentEnd === -1) return null;

  const captionHtml = chunk.slice(capContentStart, capContentEnd);
  const blocks = parseCaptionIntoBlocks(captionHtml);

  const introText = (blocks.find(b => b.type === 'intro') as { type: 'intro'; text_en?: string } | undefined)?.text_en ?? '';
  const firstPara = introText.split('\n\n')[0] ?? '';
  const subtitle = firstPara.length > 160 ? firstPara.slice(0, 157) + '…' : firstPara;

  return { title_en: title, subtitle_en: subtitle, icon, category, content_json: blocks };
}

/**
 * Parse a full KetoCakeLab HTML file containing multiple posts.
 * Returns one ParsedLabNote per post found.
 */
export function parseLabNoteHTML(html: string): ParsedLabNote[] {
  // Split on each post div opening tag
  const chunks = html.split(/<div class="post" id="p\d+"/);
  const results: ParsedLabNote[] = [];
  for (let i = 1; i < chunks.length; i++) {
    const note = parsePostChunk(chunks[i]);
    if (note) results.push(note);
  }
  return results;
}

/**
 * Parse a single post HTML snippet (or fall back to full-file parse).
 */
export function parseSinglePostHTML(html: string): ParsedLabNote | null {
  const results = parseLabNoteHTML(html);
  if (results.length > 0) return results[0];
  return parsePostChunk(html);
}
