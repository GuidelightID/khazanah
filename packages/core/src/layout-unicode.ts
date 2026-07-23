import type { BBox, CharType } from './types/ir.js';

/** Default logical page metrics (Madinah-like aspect). */
export const UNICODE_PAGE = {
  width: 1000,
  height: 1550,
  inset: { top: 80, right: 60, bottom: 80, left: 60 },
  /** ~15 lines in content band: (1550-160)/15 ≈ 92.7 */
  lineHeight: 92,
} as const;

const MARKER_MIN = 42;
const WORD_MIN = 18;
const CENTER_OCCUPANCY = 0.55;

/** Arabic combining marks / harakat — zero advance for packing. */
const HARAKAT_RE =
  /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08FF]/u;

/** Base Arabic letters and presentation forms. */
const ARABIC_LETTER_RE =
  /[\u0621-\u064A\u066E-\u066F\u0671-\u06D3\u06D5\u06EE-\u06EF\u06FA-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/u;

const DIGIT_RE = /[\u0660-\u0669\u06F0-\u06F90-9]/u; // 0-9 + Arabic-Indic

/**
 * Estimate relative ink width for unicode_bbox packing (Amiri-ish).
 * Deterministic, no Canvas — server-safe.
 */
export function estimateWordWidth(
  text: string,
  charType: CharType = 'word',
): number {
  if (charType === 'end_marker') {
    // Circle/ayah markers: room for digits + ornament padding (grows with digit count)
    const raw = estimateRawWidth(text);
    return Math.max(MARKER_MIN, raw + 28 + Math.max(0, raw - 12) * 0.35);
  }
  if (charType === 'header' || charType === 'bismillah') {
    return Math.max(WORD_MIN, estimateRawWidth(text) * 1.05);
  }

  return Math.max(WORD_MIN, estimateRawWidth(text));
}

function estimateRawWidth(text: string): number {
  let w = 0;
  for (const ch of text) {
    if (HARAKAT_RE.test(ch) || ch === '\u200C' || ch === '\u200D') {
      continue;
    }
    if (ch === '\u0640') {
      // tatweel
      w += 14;
      continue;
    }
    if (DIGIT_RE.test(ch)) {
      w += 12;
      continue;
    }
    if (ch === ' ' || ch === '\u00A0') {
      w += 8;
      continue;
    }
    if (ARABIC_LETTER_RE.test(ch)) {
      // wide letters slightly more
      if (/[اأإآلالىىو]/u.test(ch)) {
        w += 18;
      } else if (/[مصضسش]/u.test(ch)) {
        w += 22;
      } else {
        w += 16;
      }
      continue;
    }
    // punctuation / ayah ornaments
    if (/[۝ۣ۟۠ۡۢۤۥۦۧۨ۩]/u.test(ch)) {
      w += 20;
      continue;
    }
    w += 12;
  }
  return w;
}

export interface LayoutWordInput {
  text: string;
  charType?: CharType;
}

export interface LayoutLineOptions {
  contentWidth: number;
  y: number;
  lineHeight: number;
  contentLeft: number;
  /** Force centered cluster (bismillah / short line). */
  centered?: boolean;
  /** Auto-center when total width / contentWidth < this (default 0.55). */
  centerOccupancy?: number;
}

export interface LaidOutWord {
  bbox: BBox;
  width: number;
}

/**
 * RTL pack: index 0 is rightmost. Justify with inter-word gaps when full;
 * center short / flagged lines.
 */
export function layoutLineRtl(
  items: LayoutWordInput[],
  opts: LayoutLineOptions,
): { bboxes: BBox[]; centered: boolean; totalWidth: number } {
  const n = items.length;
  const contentWidth = opts.contentWidth;
  const left = opts.contentLeft;
  const y = opts.y;
  const h = opts.lineHeight * 0.9;
  const occupancyThreshold = opts.centerOccupancy ?? CENTER_OCCUPANCY;

  if (n === 0) {
    return { bboxes: [], centered: false, totalWidth: 0 };
  }

  let widths = items.map((it) =>
    estimateWordWidth(it.text, it.charType ?? 'word'),
  );
  let total = widths.reduce((a, b) => a + b, 0);

  if (total > contentWidth && total > 0) {
    const scale = contentWidth / total;
    widths = widths.map((w) => Math.max(WORD_MIN * 0.75, w * scale));
    total = widths.reduce((a, b) => a + b, 0);
    // final clamp if mins pushed over
    if (total > contentWidth) {
      const s2 = contentWidth / total;
      widths = widths.map((w) => w * s2);
      total = contentWidth;
    }
  }

  const forceCentered = Boolean(opts.centered);
  const shortLine = total / contentWidth < occupancyThreshold;
  const centered = forceCentered || shortLine;

  let gaps = 0;
  if (!centered && n > 1 && total < contentWidth) {
    gaps = (contentWidth - total) / (n - 1);
  }

  const clusterWidth = total + gaps * Math.max(0, n - 1);
  let xCursor = centered
    ? left + (contentWidth + clusterWidth) / 2
    : left + contentWidth;

  const bboxes: BBox[] = [];
  for (let i = 0; i < n; i++) {
    const w = widths[i]!;
    xCursor -= w;
    bboxes.push({ x: xCursor, y, w, h });
    if (i < n - 1) {
      xCursor -= gaps;
    }
  }

  return { bboxes, centered, totalWidth: clusterWidth };
}

export function isBismillahText(text: string): boolean {
  const stripped = text.replace(HARAKAT_RE, '').replace(/\s+/g, '');
  return (
    stripped.includes('بسم') ||
    stripped.includes('بسما') ||
    /بِسْمِ|بسم\s*الله|بسمالله/.test(text)
  );
}
