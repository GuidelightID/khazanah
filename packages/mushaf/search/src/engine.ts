import MiniSearch from 'minisearch';
import { normalizeArabic, type SearchCorpus, type SearchOptions, type SearchResult } from '@guidelightid/mushaf-core';
import type { SearchEngine } from './types.js';

interface Doc {
  id: string;
  verseKey: string;
  page: number;
  surah: number;
  textAr: string;
  textNormalizedAr: string;
  translation: string;
  surahNames: string;
}

function verseDocs(corpus: SearchCorpus): Doc[] {
  const surahNameByNum = new Map<number, string>();
  for (const s of corpus.surahNames ?? []) {
    surahNameByNum.set(s.number, s.names.join(' '));
  }

  return corpus.verses.map((v) => {
    const surah = Number(v.verseKey.split(':')[0]);
    return {
      id: v.verseKey,
      verseKey: v.verseKey,
      page: v.page,
      surah,
      textAr: v.textAr,
      textNormalizedAr: v.textNormalizedAr || normalizeArabic(v.textAr),
      translation: v.translations
        ? Object.values(v.translations).join(' ')
        : '',
      surahNames: surahNameByNum.get(surah) ?? '',
    };
  });
}

function parseSpecialQuery(q: string): SearchResult[] | null {
  const trimmed = q.trim();
  // page number only
  if (/^\d{1,3}$/.test(trimmed)) {
    const page = Number(trimmed);
    if (page >= 1 && page <= 604) {
      return [{ type: 'page', score: 1, page, snippet: `Page ${page}` }];
    }
  }
  // verse key 2:255
  if (/^\d{1,3}:\d{1,3}$/.test(trimmed)) {
    return [
      {
        type: 'verse',
        score: 1,
        verseKey: trimmed as `${number}:${number}`,
        snippet: trimmed,
      },
    ];
  }
  return null;
}

export function createSearchEngine(): SearchEngine {
  const indexes = new Map<string, MiniSearch<Doc>>();
  const corpora = new Map<string, SearchCorpus>();

  return {
    async ensureIndex(locale: string, corpus?: SearchCorpus) {
      if (indexes.has(locale) && !corpus) return;
      if (!corpus && !corpora.has(locale)) {
        throw new Error(
          `No search corpus for locale "${locale}". Pass corpus to ensureIndex().`,
        );
      }
      if (corpus) corpora.set(locale, corpus);
      const c = corpora.get(locale)!;
      const mini = new MiniSearch<Doc>({
        fields: ['textNormalizedAr', 'textAr', 'translation', 'surahNames', 'verseKey'],
        storeFields: ['verseKey', 'page', 'surah', 'textAr', 'translation'],
        searchOptions: {
          boost: { textNormalizedAr: 3, textAr: 2, surahNames: 2, verseKey: 4 },
          fuzzy: 0.2,
          prefix: true,
        },
        processTerm: (term) => {
          // Normalize Arabic terms; leave Latin as lowercase
          if (/[\u0600-\u06FF]/.test(term)) return normalizeArabic(term);
          return term.toLowerCase();
        },
      });
      mini.addAll(verseDocs(c));
      indexes.set(locale, mini);
    },

    isReady(locale = 'ar') {
      return indexes.has(locale);
    },

    async search(query: string, opts: SearchOptions = {}) {
      const locale = opts.locale ?? 'ar';
      const limit = opts.limit ?? 20;
      const types = opts.types ?? ['verse', 'page', 'surah'];

      const special = parseSpecialQuery(query);
      if (special) {
        return special
          .filter((r) => types.includes(r.type))
          .slice(0, limit);
      }

      const mini = indexes.get(locale);
      if (!mini) {
        throw new Error(`Search index not ready for locale "${locale}". Call ensureIndex first.`);
      }

      const q = /[\u0600-\u06FF]/.test(query)
        ? normalizeArabic(query)
        : query.trim().toLowerCase();

      const hits = mini.search(q, {
        fuzzy: opts.fuzzy === false ? false : 0.2,
        prefix: true,
      });

      const results: SearchResult[] = [];
      const seenSurah = new Set<number>();

      for (const hit of hits) {
        if (results.length >= limit) break;
        if (types.includes('verse')) {
          results.push({
            type: 'verse',
            score: hit.score,
            verseKey: hit.verseKey as `${number}:${number}`,
            page: hit.page as number,
            surah: hit.surah as number,
            snippet: (hit.textAr as string) || (hit.translation as string),
          });
        }
        if (types.includes('surah') && typeof hit.surah === 'number') {
          if (!seenSurah.has(hit.surah)) {
            seenSurah.add(hit.surah);
            // surah hit only when query matches names well — lightweight: add once
            if (q.length >= 3) {
              results.push({
                type: 'surah',
                score: hit.score * 0.5,
                surah: hit.surah,
                page: hit.page as number,
                snippet: `Surah ${hit.surah}`,
              });
            }
          }
        }
      }

      // Surah name direct match
      if (types.includes('surah')) {
        const corpus = corpora.get(locale);
        for (const s of corpus?.surahNames ?? []) {
          const joined = s.names.map((n) => normalizeArabic(n).toLowerCase()).join(' ');
          if (joined.includes(q) || s.names.some((n) => n.toLowerCase().includes(query.trim().toLowerCase()))) {
            results.unshift({
              type: 'surah',
              score: 10,
              surah: s.number,
              snippet: s.names[0],
            });
          }
        }
      }

      return results.slice(0, limit);
    },
  };
}
