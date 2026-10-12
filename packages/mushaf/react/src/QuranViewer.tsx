'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import type { MushafPageIR } from '@guidelight/mushaf-core';
import { useQuran } from './hooks.js';
import { QuranPage, type QuranPageProps } from './QuranPage.js';

export interface QuranViewerProps {
  initialPage?: number;
  /** Total pages or inclusive [from, to] range. Defaults to catalog.pageCount or 604. */
  pages?: number | [number, number];
  virtualized?: boolean;
  /** Extra pages mounted above/below viewport (default 1) */
  overscan?: number;
  direction?: 'vertical' | 'horizontal';
  onPageChange?: (page: number) => void;
  pageProps?: Omit<QuranPageProps, 'page' | 'initialData'>;
  /** Optional SSR map of page → IR for the initial window */
  initialPagesData?: Record<number, MushafPageIR>;
  /** Estimated page height in CSS px before measure (default 620) */
  estimatedPageHeight?: number;
  className?: string;
  style?: CSSProperties;
  empty?: ReactNode;
}

function resolveRange(
  pages: QuranViewerProps['pages'],
  catalogCount: number | undefined,
): { from: number; to: number } {
  if (Array.isArray(pages)) {
    const [a, b] = pages;
    return { from: Math.min(a, b), to: Math.max(a, b) };
  }
  if (typeof pages === 'number') {
    return { from: 1, to: Math.max(1, pages) };
  }
  return { from: 1, to: Math.max(1, catalogCount ?? 604) };
}

/**
 * Multi-page scroller with windowed mounting (virtualization default on).
 */
export function QuranViewer({
  initialPage = 1,
  pages,
  virtualized = true,
  overscan = 1,
  direction = 'vertical',
  onPageChange,
  pageProps,
  initialPagesData,
  estimatedPageHeight = 620,
  className,
  style,
  empty,
}: QuranViewerProps) {
  const { catalog } = useQuran();
  const { from, to } = useMemo(
    () => resolveRange(pages, catalog?.pageCount),
    [pages, catalog?.pageCount],
  );

  const pageList = useMemo(() => {
    const list: number[] = [];
    for (let p = from; p <= to; p++) list.push(p);
    return list;
  }, [from, to]);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [viewportSize, setViewportSize] = useState(estimatedPageHeight);
  const [heights, setHeights] = useState<Record<number, number>>({});
  const [activePage, setActivePage] = useState(
    Math.min(Math.max(initialPage, from), to),
  );
  const onPageChangeRef = useRef(onPageChange);
  onPageChangeRef.current = onPageChange;

  const gap = 16;

  const offsets = useMemo(() => {
    const map = new Map<number, number>();
    let y = 0;
    for (const p of pageList) {
      map.set(p, y);
      y += (heights[p] ?? estimatedPageHeight) + gap;
    }
    return { map, total: y };
  }, [pageList, heights, estimatedPageHeight]);

  const isHorizontal = direction === 'horizontal';

  // Scroll to initial page once
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const y = offsets.map.get(Math.min(Math.max(initialPage, from), to)) ?? 0;
    if (isHorizontal) el.scrollLeft = y;
    else el.scrollTop = y;
    setScrollOffset(y);
    // only on mount / range change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, initialPage, isHorizontal]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setViewportSize(
        (isHorizontal ? el.clientWidth : el.clientHeight) || estimatedPageHeight,
      );
    });
    ro.observe(el);
    setViewportSize(
      (isHorizontal ? el.clientWidth : el.clientHeight) || estimatedPageHeight,
    );
    return () => ro.disconnect();
  }, [estimatedPageHeight, isHorizontal]);

  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const top = isHorizontal ? el.scrollLeft : el.scrollTop;
    setScrollOffset(top);

    // Active page = last page whose offset <= scroll mid
    const mid = top + (isHorizontal ? el.clientWidth : el.clientHeight) / 2;
    let current = pageList[0] ?? from;
    for (const p of pageList) {
      const off = offsets.map.get(p) ?? 0;
      if (off <= mid) current = p;
      else break;
    }
    setActivePage((prev) => {
      if (prev !== current) onPageChangeRef.current?.(current);
      return current;
    });
  }, [pageList, offsets.map, from, isHorizontal]);

  const visible = useMemo(() => {
    if (!virtualized) {
      return { start: 0, end: pageList.length - 1 };
    }
    const startY = Math.max(0, scrollOffset - overscan * estimatedPageHeight);
    const endY = scrollOffset + viewportSize + overscan * estimatedPageHeight;
    let start = 0;
    let end = pageList.length - 1;
    for (let i = 0; i < pageList.length; i++) {
      const p = pageList[i]!;
      const off = offsets.map.get(p) ?? 0;
      const h = heights[p] ?? estimatedPageHeight;
      if (off + h >= startY) {
        start = i;
        break;
      }
    }
    for (let i = pageList.length - 1; i >= 0; i--) {
      const p = pageList[i]!;
      const off = offsets.map.get(p) ?? 0;
      if (off <= endY) {
        end = i;
        break;
      }
    }
    return { start, end };
  }, [
    virtualized,
    scrollOffset,
    viewportSize,
    overscan,
    estimatedPageHeight,
    pageList,
    offsets.map,
    heights,
  ]);

  const measurePage = useCallback((page: number, el: HTMLElement | null) => {
    if (!el) return;
    const h = el.getBoundingClientRect().height;
    if (h <= 0) return;
    setHeights((prev) => (prev[page] === h ? prev : { ...prev, [page]: h }));
  }, []);

  if (pageList.length === 0) {
    return <>{empty ?? <div className="mushaf-viewer-empty">No pages</div>}</>;
  }

  return (
    <div
      ref={scrollerRef}
      className={['mushaf-viewer', className].filter(Boolean).join(' ')}
      data-active-page={activePage}
      data-virtualized={virtualized ? 'true' : 'false'}
      data-direction={direction}
      onScroll={onScroll}
      style={{
        overflow: 'auto',
        height: style?.height ?? '70vh',
        width: '100%',
        position: 'relative',
        ...style,
      }}
      role="feed"
      aria-label="Quran pages"
    >
      <div
        className="mushaf-viewer-spacer"
        style={
          isHorizontal
            ? {
                width: offsets.total,
                height: '100%',
                position: 'relative',
                display: 'flex',
              }
            : {
                height: offsets.total,
                position: 'relative',
                width: '100%',
              }
        }
      >
        {pageList.slice(visible.start, visible.end + 1).map((pageNum) => {
          const off = offsets.map.get(pageNum) ?? 0;
          return (
            <div
              key={pageNum}
              ref={(el) => measurePage(pageNum, el)}
              className="mushaf-viewer-item"
              data-viewer-page={pageNum}
              style={
                isHorizontal
                  ? {
                      position: 'absolute',
                      left: off,
                      top: 0,
                      width: 'min(100%, 480px)',
                    }
                  : {
                      position: 'absolute',
                      top: off,
                      left: 0,
                      right: 0,
                      paddingBottom: gap,
                    }
              }
            >
              <QuranPage
                {...pageProps}
                page={pageNum}
                initialData={initialPagesData?.[pageNum]}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Imperative helper for apps that hold a scroller ref externally */
export function scrollViewerToPage(
  scroller: HTMLElement,
  pageOffsetPx: number,
): void {
  scroller.scrollTo({ top: pageOffsetPx, behavior: 'smooth' });
}
