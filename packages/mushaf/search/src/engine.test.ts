import { describe, expect, it } from 'vitest';
import { fixtureCatalog, fixturePages } from '@guidelightid/mushaf-core';
import { corpusFromPages } from './corpus.js';
import { createSearchEngine } from './engine.js';

describe('createSearchEngine', () => {
  it('indexes fixture pages and finds Arabic text', async () => {
    const engine = createSearchEngine();
    const corpus = corpusFromPages(Object.values(fixturePages), {
      locale: 'ar',
      surahs: fixtureCatalog.surahs,
    });
    await engine.ensureIndex('ar', corpus);
    expect(engine.isReady('ar')).toBe(true);

    const hits = await engine.search('بسم', { locale: 'ar', limit: 5 });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.some((h) => h.verseKey === '1:1' || h.snippet?.includes('ب'))).toBe(true);
  });

  it('resolves page and verse key queries', async () => {
    const engine = createSearchEngine();
    await engine.ensureIndex(
      'ar',
      corpusFromPages(Object.values(fixturePages), { locale: 'ar' }),
    );

    const pageHits = await engine.search('3', { types: ['page'] });
    expect(pageHits[0]?.type).toBe('page');
    expect(pageHits[0]?.page).toBe(3);

    const verseHits = await engine.search('1:2', { types: ['verse'] });
    expect(verseHits[0]?.verseKey).toBe('1:2');
  });

  it('finds surah by English name', async () => {
    const engine = createSearchEngine();
    await engine.ensureIndex(
      'ar',
      corpusFromPages(Object.values(fixturePages), {
        locale: 'ar',
        surahs: fixtureCatalog.surahs,
      }),
    );
    const hits = await engine.search('Fatihah', { types: ['surah'], limit: 5 });
    expect(hits.some((h) => h.type === 'surah' && h.surah === 1)).toBe(true);
  });
});
