import { describe, expect, it } from 'vitest';
import { fixturePage1, type MushafPageIR } from '@guidelight.id/mushaf-core';
import { collectTajweedHighlights, tajweedPlugin } from './plugin.js';

describe('tajweedPlugin', () => {
  it('returns no highlights when IR has no tajweed tokens', () => {
    const hs = collectTajweedHighlights(fixturePage1, {
      ghunnah: 'red',
    });
    expect(hs).toHaveLength(0);
  });

  it('highlights words with glyph tajweed tokens', () => {
    const page: MushafPageIR = structuredClone(fixturePage1);
    page.words['1:1:1']!.glyphs = [{ tajweed: 'ghunnah' }];
    const hs = collectTajweedHighlights(page, { ghunnah: 'rgba(1,2,3,0.3)' });
    expect(hs).toHaveLength(1);
    expect(hs[0]?.target).toEqual({ type: 'word', wordKey: '1:1:1' });
    expect(hs[0]?.style?.color).toContain('rgba');
  });

  it('plugin tracks last page via onPageLoad', () => {
    const plugin = tajweedPlugin({ scheme: 'default' });
    const page: MushafPageIR = structuredClone(fixturePage1);
    page.words['1:1:2']!.glyphs = [{ tajweed: 'idgham' }];
    plugin.onPageLoad?.(page);
    const hs = plugin.provideHighlights?.() ?? [];
    expect(hs.some((h) => h.id.includes('idgham'))).toBe(true);
  });
});
