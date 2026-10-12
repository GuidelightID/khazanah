import {
  defineAdapter,
  type MushafAdapter,
  type MushafCatalog,
  type VerseKey,
} from '@mushaf/core';
import { assignPages, layoutVersesOnPage } from './layout.js';
import type { TanzilCorpus } from './types.js';
import { sampleTanzilCorpus } from './sample-corpus.js';

export interface TanzilAdapterOptions {
  corpus?: TanzilCorpus;
  id?: string;
  displayName?: string;
}

export function createTanzilAdapter(options: TanzilAdapterOptions = {}): MushafAdapter {
  const corpus = options.corpus ?? sampleTanzilCorpus;
  const wordsPerPage = corpus.wordsPerPage ?? 80;
  const byPage = assignPages(corpus.verses, wordsPerPage);
  const pageCount =
    corpus.pageCount ??
    (byPage.size ? Math.max(...byPage.keys()) : 1);

  const verseToPage = new Map<string, number>();
  for (const [page, verses] of byPage) {
    for (const v of verses) verseToPage.set(v.verseKey, page);
  }

  const catalog: MushafCatalog = {
    pageCount,
    surahs: corpus.surahs.map((s) => ({
      number: s.number,
      nameArabic: s.nameArabic,
      nameSimple: s.nameSimple,
      ayahCount: s.ayahCount,
      revelationType: s.revelationType,
      startPage: verseToPage.get(`${s.number}:1`) ?? 1,
    })),
    juz: [{ number: 1, start: '1:1', startPage: 1 }],
    hizb: [{ number: 1, start: '1:1', startPage: 1 }],
  };

  const pageCache = new Map<number, ReturnType<typeof layoutVersesOnPage>>();

  return defineAdapter({
    id: options.id ?? 'tanzil',
    displayName: options.displayName ?? 'Tanzil text-flow',
    licenses: [
      {
        spdx: 'LicenseRef-Corpus-See-App',
        name: 'Corpus license (Tanzil or app-provided)',
        allowsNpmRedistribution: false,
        allowsModification: false,
        notes:
          'Adapter code is MIT. Quran text is not redistributed by this package beyond optional sample corpus.',
      },
    ],
    getCatalog: () => catalog,
    async getPage(page) {
      const hit = pageCache.get(page);
      if (hit) return structuredClone(hit);
      const verses = byPage.get(page) ?? [];
      if (!verses.length) {
        throw new Error(`Tanzil adapter has no content for page ${page}`);
      }
      const ir = layoutVersesOnPage(page, verses);
      pageCache.set(page, ir);
      return structuredClone(ir);
    },
    getPageForVerse(verseKey: VerseKey) {
      const p = verseToPage.get(verseKey);
      if (p == null) throw new Error(`Unknown verse ${verseKey}`);
      return p;
    },
  });
}
