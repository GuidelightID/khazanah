'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import type { VerseKey } from '@guidelight.id/mushaf-core';
import { useQuran } from './hooks.js';
import { QuranViewer, type QuranViewerProps } from './QuranViewer.js';

export interface ReaderChromeAPI {
  page: number;
  setPage: (page: number) => void;
  goNext: () => void;
  goPrev: () => void;
  catalog: ReturnType<typeof useQuran>['catalog'];
  jumpToVerse: (verseKey: VerseKey) => Promise<void>;
  jumpToSurah: (surah: number) => void;
}

export interface QuranReaderProps {
  initialPage?: number;
  initialVerse?: VerseKey;
  showChrome?: boolean;
  renderChrome?: (api: ReaderChromeAPI) => ReactNode;
  /** i18n strings for default chrome */
  labels?: {
    page?: string;
    prev?: string;
    next?: string;
    surah?: string;
    go?: string;
  };
  viewerProps?: Omit<QuranViewerProps, 'initialPage' | 'onPageChange'>;
}

const DEFAULT_LABELS = {
  page: 'Page',
  prev: 'Previous',
  next: 'Next',
  surah: 'Surah',
  go: 'Go',
};

/**
 * Opinionated reader shell: chrome + virtualized QuranViewer.
 * Tree-shakeable via `@guidelight.id/mushaf-react/reader` or main export.
 */
export function QuranReader({
  initialPage = 1,
  initialVerse,
  showChrome = true,
  renderChrome,
  labels: labelsProp,
  viewerProps,
}: QuranReaderProps) {
  const { catalog, runtime } = useQuran();
  const pageCount = useMemo(() => {
    if (catalog?.pageCount) return catalog.pageCount;
    const p = viewerProps?.pages;
    if (Array.isArray(p)) return Math.max(p[0], p[1]);
    if (typeof p === 'number') return p;
    return 604;
  }, [catalog?.pageCount, viewerProps?.pages]);

  const [page, setPageState] = useState(initialPage);
  const [input, setInput] = useState(String(initialPage));
  const labels = { ...DEFAULT_LABELS, ...labelsProp };

  const setPage = useCallback(
    (p: number) => {
      const next = Math.min(Math.max(1, Math.trunc(p)), pageCount);
      setPageState(next);
      setInput(String(next));
    },
    [pageCount],
  );

  const goNext = useCallback(() => setPage(page + 1), [page, setPage]);
  const goPrev = useCallback(() => setPage(page - 1), [page, setPage]);

  const jumpToSurah = useCallback(
    (surah: number) => {
      const meta = catalog?.surahs.find((s) => s.number === surah);
      if (meta) setPage(meta.startPage);
    },
    [catalog, setPage],
  );

  const jumpToVerse = useCallback(
    async (verseKey: VerseKey) => {
      const p = await runtime.adapter.getPageForVerse?.(verseKey);
      if (p != null) setPage(p);
    },
    [runtime, setPage],
  );

  useEffect(() => {
    if (!initialVerse) return;
    void jumpToVerse(initialVerse);
  }, [initialVerse, jumpToVerse]);

  const api: ReaderChromeAPI = useMemo(
    () => ({
      page,
      setPage,
      goNext,
      goPrev,
      catalog,
      jumpToVerse,
      jumpToSurah,
    }),
    [page, setPage, goNext, goPrev, catalog, jumpToVerse, jumpToSurah],
  );

  const defaultChrome = (
    <div className="mushaf-reader-chrome" dir="ltr" style={chromeStyle}>
      <button type="button" onClick={goPrev} disabled={page <= 1} aria-label={labels.prev}>
        {labels.prev}
      </button>
      <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
        <span>{labels.page}</span>
        <input
          type="number"
          min={1}
          max={pageCount}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setPage(Number(input) || page);
          }}
          style={{ width: 64 }}
          aria-label={labels.page}
        />
        <span>/ {pageCount}</span>
      </label>
      <button type="button" onClick={() => setPage(Number(input) || page)}>
        {labels.go}
      </button>
      <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
        <span>{labels.surah}</span>
        <select
          aria-label={labels.surah}
          value=""
          onChange={(e) => {
            const n = Number(e.target.value);
            if (n) jumpToSurah(n);
            e.target.value = '';
          }}
        >
          <option value="">—</option>
          {catalog?.surahs.map((s) => (
            <option key={s.number} value={s.number}>
              {s.number}. {s.nameSimple}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={goNext}
        disabled={page >= pageCount}
        aria-label={labels.next}
      >
        {labels.next}
      </button>
    </div>
  );

  return (
    <div className="mushaf-reader" data-page={page}>
      {showChrome ? (renderChrome ? renderChrome(api) : defaultChrome) : null}
      <QuranViewer
        {...viewerProps}
        // Remount when chrome jumps so the scroller recenters on the target page
        key={`viewer-${page}`}
        initialPage={page}
        onPageChange={(p) => {
          setPageState(p);
          setInput(String(p));
        }}
      />
    </div>
  );
}

const chromeStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  alignItems: 'center',
  padding: '8px 0',
  marginBottom: 8,
};
