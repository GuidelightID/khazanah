import { describe, expect, it } from 'vitest';
import { createTanzilAdapter } from './create-adapter.js';
import { layoutVersesOnPage } from './layout.js';
import { sampleTanzilCorpus } from './sample-corpus.js';

describe('tanzil adapter', () => {
  it('layouts words as text-flow IR', () => {
    const ir = layoutVersesOnPage(1, sampleTanzilCorpus.verses.filter((v) => v.page === 1));
    expect(ir.metrics.mushaf).toBe('tanzil_textflow');
    expect(ir.metrics.fontModel).toBe('unicode_bbox');
    expect(Object.keys(ir.words).length).toBeGreaterThan(5);
    expect(ir.lines.length).toBeGreaterThan(0);
  });

  it('serves catalog and pages', async () => {
    const adapter = createTanzilAdapter({ corpus: sampleTanzilCorpus });
    const catalog = await adapter.getCatalog();
    expect(catalog.pageCount).toBe(2);
    expect(catalog.surahs[0]?.nameSimple).toBe('Al-Fatihah');

    const p1 = await adapter.getPage(1);
    expect(p1.page).toBe(1);
    expect(p1.verses.some((v) => v.verseKey === '1:1')).toBe(true);

    const page = await adapter.getPageForVerse?.('112:1');
    expect(page).toBe(2);
  });
});
