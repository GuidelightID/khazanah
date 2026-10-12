import type { VerseKey } from '@guidelight/mushaf-core';

export interface TanzilVerse {
  verseKey: VerseKey;
  text: string;
  /** Optional explicit Madinah page; otherwise packed by wordsPerPage */
  page?: number;
}

export interface TanzilSurahMeta {
  number: number;
  nameArabic: string;
  nameSimple: string;
  ayahCount: number;
  revelationType: 'meccan' | 'medinan';
}

export interface TanzilCorpus {
  verses: TanzilVerse[];
  surahs: TanzilSurahMeta[];
  /** Default packing when verse.page is omitted */
  wordsPerPage?: number;
  pageCount?: number;
}
