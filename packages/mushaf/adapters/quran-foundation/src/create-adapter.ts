import {
  defineAdapter,
  type MushafAdapter,
  type MushafCatalog,
  type MushafPageIR,
  type VerseKey,
} from '@guidelight.id/mushaf-core';
import { mapChaptersToCatalog } from './map-catalog.js';
import { mapVersesToPageIR } from './map-page.js';
import type {
  QfChaptersResponse,
  QfVerseByKeyResponse,
  QfVersesByPageResponse,
} from './types.js';

export interface QuranFoundationAdapterOptions {
  /** Default https://api.quran.com/api/v4 */
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  /** Recitation/word language for translations on words (optional) */
  language?: string;
  /** In-memory page cache size (default 15) */
  cacheSize?: number;
}

const DEFAULT_BASE = 'https://api.quran.com/api/v4';

export function createQuranFoundationAdapter(
  options: QuranFoundationAdapterOptions = {},
): MushafAdapter {
  const baseUrl = (options.baseUrl ?? DEFAULT_BASE).replace(/\/$/, '');
  const fetchImpl = options.fetchImpl ?? fetch;
  const cacheSize = options.cacheSize ?? 15;
  const pageCache = new Map<number, MushafPageIR>();
  let catalogCache: MushafCatalog | null = null;

  async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
    const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const res = await fetchImpl(url, {
      signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Quran Foundation API ${res.status}: ${url}`);
    }
    return (await res.json()) as T;
  }

  function rememberPage(page: number, ir: MushafPageIR): MushafPageIR {
    pageCache.set(page, ir);
    if (pageCache.size > cacheSize) {
      const first = pageCache.keys().next().value as number | undefined;
      if (first !== undefined) pageCache.delete(first);
    }
    return ir;
  }

  async function loadPage(page: number, signal?: AbortSignal): Promise<MushafPageIR> {
    const hit = pageCache.get(page);
    if (hit) return structuredClone(hit);

    const q = new URLSearchParams({
      words: 'true',
      word_fields: 'text_uthmani,line_number,position,char_type_name,code_v1',
      fields: 'text_uthmani,page_number',
      per_page: '50',
    });
    if (options.language) q.set('language', options.language);

    const data = await getJson<QfVersesByPageResponse>(
      `/verses/by_page/${page}?${q.toString()}`,
      signal,
    );
    const ir = mapVersesToPageIR(page, data.verses ?? []);
    return structuredClone(rememberPage(page, ir));
  }

  return defineAdapter({
    id: 'quran-foundation',
    displayName: 'Quran Foundation (api.quran.com v4)',
    licenses: [
      {
        spdx: 'LicenseRef-QuranFoundation-ToS',
        name: 'Quran Foundation / Quran.com API Terms',
        url: 'https://quran.foundation/',
        allowsNpmRedistribution: false,
        allowsModification: false,
        notes:
          'Use for local/app caching only. Do not republish corpus as MIT. Code in this package is MIT.',
      },
    ],
    async getCatalog() {
      if (catalogCache) return catalogCache;
      const data = await getJson<QfChaptersResponse>('/chapters?language=en');
      catalogCache = mapChaptersToCatalog(data.chapters ?? []);
      return catalogCache;
    },
    getPage: loadPage,
    prefetchPages(pages) {
      for (const p of pages) {
        void loadPage(p).catch(() => {
          /* best-effort */
        });
      }
    },
    async getPageForVerse(verseKey: VerseKey) {
      // Keep colon unencoded — API paths use `1:1` form
      const data = await getJson<QfVerseByKeyResponse>(
        `/verses/by_key/${verseKey}?fields=page_number`,
      );
      const page = data.verse?.page_number;
      if (page == null) throw new Error(`No page for verse ${verseKey}`);
      return page;
    },
  });
}
