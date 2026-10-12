import {
  HIGHLIGHT_TIERS,
  type Highlight,
  type MushafPageIR,
  type MushafPlugin,
  type WordKey,
} from '@guidelightid/mushaf-core';
import { SCHEMES, type TajweedScheme } from './schemes.js';

export interface TajweedPluginOptions {
  /** Named scheme key or custom color map */
  scheme?: string | TajweedScheme;
  /** Prefer plain colors when prefers-contrast: more (browser only) */
  respectPrefersContrast?: boolean;
}

function resolveScheme(scheme: TajweedPluginOptions['scheme']): TajweedScheme {
  if (!scheme || typeof scheme === 'string') {
    return SCHEMES[scheme ?? 'default'] ?? SCHEMES.default!;
  }
  return scheme;
}

function prefersMoreContrast(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-contrast: more)').matches;
}

/**
 * Collect word keys that have a tajweed token on any glyph or word-level meta.
 * IR may store token on glyphs[].tajweed.
 */
export function collectTajweedHighlights(
  page: MushafPageIR,
  scheme: TajweedScheme,
): Highlight[] {
  const byToken = new Map<string, WordKey[]>();

  for (const [key, word] of Object.entries(page.words)) {
    const tokens = new Set<string>();
    for (const g of word.glyphs ?? []) {
      if (g.tajweed) tokens.add(g.tajweed);
    }
    // Allow future word-level field via cast if adapters add it
    const wordToken = (word as { tajweed?: string }).tajweed;
    if (wordToken) tokens.add(wordToken);

    for (const token of tokens) {
      if (!scheme[token]) continue;
      const list = byToken.get(token) ?? [];
      list.push(key as WordKey);
      byToken.set(token, list);
    }
  }

  const highlights: Highlight[] = [];
  for (const [token, keys] of byToken) {
    for (const wordKey of keys) {
      highlights.push({
        id: `tajweed-${token}-${wordKey}`,
        target: { type: 'word', wordKey },
        style: {
          color: scheme[token],
          className: `mushaf-tajweed mushaf-tajweed-${token}`,
        },
        source: 'tajwid',
        priority: HIGHLIGHT_TIERS.tajweed,
      });
    }
  }
  return highlights;
}

export function tajweedPlugin(options: TajweedPluginOptions = {}): MushafPlugin {
  const scheme = resolveScheme(options.scheme);
  const respectContrast = options.respectPrefersContrast !== false;
  let lastPage: MushafPageIR | null = null;

  return {
    name: 'tajwid',
    version: '0.0.0',
    highlightTier: HIGHLIGHT_TIERS.tajweed,
    clientOnly: false,
    onPageLoad(page) {
      lastPage = page;
    },
    provideHighlights() {
      if (!lastPage) return [];
      if (respectContrast && prefersMoreContrast()) return [];
      return collectTajweedHighlights(lastPage, scheme);
    },
  };
}
