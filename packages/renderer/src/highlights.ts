import type { Highlight, MushafPageIR, WordKey } from '@mushaf/core';
import type { WordStyle } from './types.js';

/** Expand highlight targets to word keys on a single page. */
export function expandHighlightToWords(
  page: MushafPageIR,
  highlight: Highlight,
): WordKey[] {
  const t = highlight.target;
  switch (t.type) {
    case 'page':
      return t.page === page.page ? (Object.keys(page.words) as WordKey[]) : [];
    case 'verse':
      return page.verses
        .filter((v) => v.verseKey === t.verseKey)
        .flatMap((v) => v.wordKeys);
    case 'word':
      return page.words[t.wordKey] ? [t.wordKey] : [];
    case 'range': {
      // Inclusive range over words that appear on this page, by document order
      const keys = page.lines.flatMap((l) => l.wordKeys);
      const from = keys.indexOf(t.from);
      const to = keys.indexOf(t.to);
      if (from < 0 || to < 0) return [];
      const [a, b] = from <= to ? [from, to] : [to, from];
      return keys.slice(a, b + 1);
    }
    default:
      return [];
  }
}

/**
 * Resolve last-write-wins fill styles per word from merged highlights
 * (caller should already sort via mergeHighlights).
 */
export function resolveWordStyles(
  page: MushafPageIR,
  highlights: Highlight[],
): Map<WordKey, WordStyle> {
  const map = new Map<WordKey, WordStyle>();
  for (const h of highlights) {
    const words = expandHighlightToWords(page, h);
    for (const wordKey of words) {
      const prev = map.get(wordKey);
      map.set(wordKey, {
        wordKey,
        className: [prev?.className, h.style?.className, 'mushaf-highlight']
          .filter(Boolean)
          .join(' '),
        background: h.style?.color ?? prev?.background ?? 'rgba(255, 230, 0, 0.35)',
        underline: h.style?.underline || prev?.underline,
      });
    }
  }
  return map;
}
