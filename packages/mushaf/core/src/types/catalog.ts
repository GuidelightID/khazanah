import type { VerseKey } from '../ids.js';

export interface SurahMeta {
  number: number;
  nameArabic: string;
  nameSimple: string;
  nameTranslated?: Record<string, string>;
  ayahCount: number;
  revelationType: 'meccan' | 'medinan';
  startPage: number;
}

export interface JuzMeta {
  number: number;
  start: VerseKey;
  startPage: number;
}

export interface HizbMeta {
  number: number;
  start: VerseKey;
  startPage: number;
}

export interface MushafCatalog {
  surahs: SurahMeta[];
  juz: JuzMeta[];
  hizb: HizbMeta[];
  pageCount: number;
}
