import type { WordKey } from './ids.js';
import type { BBox, MushafPageIR } from './types/ir.js';
import type { LogicalPoint } from './view-matrix.js';

export interface HitTestOptions {
  /** Logical-unit slop for touch (default 12) */
  slop?: number;
  /** Prefer nearest word center if no containment */
  nearestFallback?: boolean;
}

function inflate(b: BBox, s: number): BBox {
  return { x: b.x - s, y: b.y - s, w: b.w + 2 * s, h: b.h + 2 * s };
}

function contains(b: BBox, p: LogicalPoint): boolean {
  return p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
}

function center(b: BBox): LogicalPoint {
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
}

function dist2(a: LogicalPoint, b: LogicalPoint): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

/**
 * Hit-test a logical point against page IR words.
 * Ownership: backends convert client → logical via viewMatrix, then call this.
 */
export function hitTestWord(
  page: MushafPageIR,
  pt: LogicalPoint,
  opts: HitTestOptions = {},
): WordKey | null {
  const slop = opts.slop ?? 12;
  const nearestFallback = opts.nearestFallback ?? true;

  for (const line of page.lines) {
    if (!contains(inflate(line.bbox, slop), pt)) continue;
    for (const key of line.wordKeys) {
      const w = page.words[key];
      if (w && contains(inflate(w.bbox, slop), pt)) {
        return key as WordKey;
      }
    }
  }

  if (!nearestFallback) return null;

  let best: { key: WordKey; d: number } | null = null;
  const maxD = (2 * slop) ** 2;
  for (const [key, word] of Object.entries(page.words)) {
    const d = dist2(pt, center(word.bbox));
    if (d <= maxD && (!best || d < best.d)) {
      best = { key: key as WordKey, d };
    }
  }
  return best?.key ?? null;
}
