import type { VerseKey, WordKey } from '../ids.js';

export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PageMetrics {
  /** Logical width (default 1000) */
  width: number;
  /** Logical height (e.g. 1550) */
  height: number;
  contentInsets: { top: number; right: number; bottom: number; left: number };
  lineCount: number;
  mushaf: 'madinah_v1' | 'madinah_v2' | 'indopak_15' | 'indopak_16' | string;
  script: 'uthmani' | 'indopak' | 'warsh' | string;
  /** Font model hint for backends */
  fontModel: 'unicode_bbox' | 'page_font' | 'hybrid';
}

export interface GlyphIR {
  /** Font codepoint / ligature id when fontModel uses page fonts; optional for unicode_bbox */
  code?: string;
  advance?: number;
  xOffset?: number;
  yOffset?: number;
  bbox?: BBox;
  tajweed?: string;
}

export type CharType =
  | 'word'
  | 'end_marker'
  | 'sajdah'
  | 'ruku'
  | 'hizb'
  | 'juz'
  | 'pause'
  | 'header'
  | 'bismillah'
  | 'other';

export interface WordIR {
  key: WordKey;
  verseKey: VerseKey;
  text: string;
  line: number;
  bbox: BBox;
  glyphs: GlyphIR[];
  charType?: CharType;
  translation?: string;
  /** Upstream stable id (e.g. QF location) */
  externalId?: string;
}

export interface LineIR {
  index: number;
  bbox: BBox;
  wordKeys: WordKey[];
  isCentered?: boolean;
  isSurahHeader?: boolean;
  isBismillah?: boolean;
}

export interface VerseSpanIR {
  verseKey: VerseKey;
  surah: number;
  ayah: number;
  wordKeys: WordKey[];
  bboxes: BBox[];
}

/**
 * Canonical page intermediate representation.
 * Compatibility (KD-19): additive optional fields OK on same version; renames require bump.
 */
export interface MushafPageIR {
  version: 1;
  page: number;
  metrics: PageMetrics;
  lines: LineIR[];
  words: Record<string, WordIR>;
  verses: VerseSpanIR[];
  surahStarts?: Array<{ surah: number; line: number }>;
  meta?: {
    source: string;
    licenseSpdx?: string;
    licenseNotice?: string;
    generatedAt?: string;
    sourceRevision?: string;
  };
}

/** Hard safety caps for validation / DoS prevention */
export const IR_LIMITS = {
  maxLines: 20,
  maxWordsPerPage: 400,
  maxGlyphsPerWord: 64,
  maxTextLengthPerWord: 64,
  maxJsonBytes: 500_000,
} as const;
