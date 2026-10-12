import {
  normalizeArabic,
  type MushafPageIR,
  type SearchCorpus,
  type SearchCorpusVerse,
  type SurahMeta,
  type VerseKey,
} from '@guidelight.id/mushaf-core';

export interface CorpusFromPagesOptions {
  locale?: string;
  surahs?: SurahMeta[];
  /** Optional translation map verseKey → text for locale */
  translations?: Record<string, string>;
}

/** Build a SearchCorpus from page IR (offline indexes). */
export function corpusFromPages(
  pages: MushafPageIR[],
  opts: CorpusFromPagesOptions = {},
): SearchCorpus {
  const verses: SearchCorpusVerse[] = [];
  for (const page of pages) {
    for (const span of page.verses) {
      const textAr = span.wordKeys
        .map((k) => page.words[k]?.text ?? '')
        .join(' ')
        .trim();
      if (!textAr) continue;
      verses.push({
        verseKey: span.verseKey as VerseKey,
        page: page.page,
        textAr,
        textNormalizedAr: normalizeArabic(textAr),
        translations: opts.translations?.[span.verseKey]
          ? { [opts.locale ?? 'en']: opts.translations[span.verseKey]! }
          : undefined,
      });
    }
  }

  return {
    locale: opts.locale ?? 'ar',
    verses,
    surahNames: opts.surahs?.map((s) => ({
      number: s.number,
      names: [s.nameSimple, s.nameArabic, ...(s.nameTranslated ? Object.values(s.nameTranslated) : [])],
    })),
  };
}
