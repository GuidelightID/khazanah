'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SearchOptions, SearchResult } from '@guidelight/mushaf-core';
import {
  corpusFromPages,
  createSearchEngine,
  type SearchEngine,
} from '@guidelight/mushaf-search';
import { useQuranContext } from './context.js';

export interface UseSearchOptions {
  /** Prebuilt engine; default creates MiniSearch engine */
  engine?: SearchEngine;
  locale?: string;
  /** Page numbers to index from the adapter (default 1..min(pageCount, 5) for demos) */
  pages?: number[];
  /** Auto-index on mount (default true) */
  autoIndex?: boolean;
}

/**
 * Offline search over adapter pages (builds corpus client-side).
 * For large corpora, prebuild an index and pass a custom engine.
 */
export function useSearch(opts: UseSearchOptions = {}): {
  query: (q: string, searchOpts?: SearchOptions) => Promise<SearchResult[]>;
  isIndexing: boolean;
  error: Error | undefined;
  isReady: boolean;
  reindex: () => Promise<void>;
} {
  const { runtime } = useQuranContext();
  const engineRef = useRef<SearchEngine>(opts.engine ?? createSearchEngine());
  const [isIndexing, setIsIndexing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const locale = opts.locale ?? 'ar';
  const autoIndex = opts.autoIndex !== false;

  // Stabilize pages identity to avoid reindex loops
  const pagesKey = opts.pages?.join(',') ?? '';
  const pages = useMemo(
    () => (pagesKey ? pagesKey.split(',').map(Number) : undefined),
    [pagesKey],
  );

  const reindex = useCallback(async () => {
    setIsIndexing(true);
    setError(undefined);
    try {
      const catalog = await runtime.getCatalog();
      const pageCount = catalog.pageCount;
      const list =
        pages ?? Array.from({ length: Math.min(pageCount, 5) }, (_, i) => i + 1);

      const irs = await Promise.all(list.map((p) => runtime.getPage(p)));
      const corpus = corpusFromPages(irs, {
        locale,
        surahs: catalog.surahs,
      });
      await engineRef.current.ensureIndex(locale, corpus);
      setIsReady(true);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setIsReady(false);
    } finally {
      setIsIndexing(false);
    }
  }, [runtime, pages, locale]);

  useEffect(() => {
    if (!autoIndex) return;
    void reindex();
  }, [reindex, autoIndex]);

  const query = useCallback(
    async (q: string, searchOpts?: SearchOptions) => {
      if (!engineRef.current.isReady(locale)) {
        await reindex();
      }
      return engineRef.current.search(q, { locale, ...searchOpts });
    },
    [locale, reindex],
  );

  return { query, isIndexing, error, isReady, reindex };
}
