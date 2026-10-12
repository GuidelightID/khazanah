import type { MushafCatalog } from '../types/catalog.js';
import { FIXTURE_PAGE_COUNT } from './pages.js';

/** Minimal catalog for tests / demos */
export const fixtureCatalog: MushafCatalog = {
  pageCount: FIXTURE_PAGE_COUNT,
  surahs: [
    {
      number: 1,
      nameArabic: 'الفاتحة',
      nameSimple: 'Al-Fatihah',
      ayahCount: 7,
      revelationType: 'meccan',
      startPage: 1,
    },
    {
      number: 2,
      nameArabic: 'البقرة',
      nameSimple: 'Al-Baqarah',
      ayahCount: 286,
      revelationType: 'medinan',
      startPage: 2,
    },
  ],
  juz: [{ number: 1, start: '1:1', startPage: 1 }],
  hizb: [{ number: 1, start: '1:1', startPage: 1 }],
};
