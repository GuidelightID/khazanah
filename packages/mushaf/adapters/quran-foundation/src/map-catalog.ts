import type { MushafCatalog, SurahMeta } from '@mushaf/core';
import type { QfChapter } from './types.js';

export function mapChaptersToCatalog(chapters: QfChapter[]): MushafCatalog {
  const surahs: SurahMeta[] = chapters.map((c) => ({
    number: c.id,
    nameArabic: c.name_arabic,
    nameSimple: c.name_simple,
    nameTranslated: c.translated_name?.name
      ? { en: c.translated_name.name }
      : undefined,
    ayahCount: c.verses_count,
    revelationType: c.revelation_place?.toLowerCase().includes('madin')
      ? 'medinan'
      : 'meccan',
    startPage: c.pages?.[0] ?? 1,
  }));

  // Lightweight juz stubs (start pages approximate; apps can refine)
  const juz = Array.from({ length: 30 }, (_, i) => ({
    number: i + 1,
    start: '1:1' as const,
    startPage: Math.min(604, 1 + i * 20),
  }));

  return {
    surahs,
    juz,
    hizb: juz.flatMap((j) => [
      { number: j.number * 2 - 1, start: j.start, startPage: j.startPage },
      {
        number: j.number * 2,
        start: j.start,
        startPage: Math.min(604, j.startPage + 10),
      },
    ]),
    pageCount: 604,
  };
}
