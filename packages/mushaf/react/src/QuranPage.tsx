'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import type {
  Highlight,
  MushafAdapter,
  MushafPageIR,
  QuranPaintMode,
  SelectionState,
  VerseKey,
  WordIR,
  WordKey,
  WordPointerEvent,
} from '@guidelight.id/mushaf-core';
import { HIGHLIGHT_TIERS, mergeHighlights } from '@guidelight.id/mushaf-core';
import { composeFrame, createHtmlBackend, type RendererBackend } from '@guidelight.id/mushaf-renderer';
import { useQuranContext } from './context.js';
import { usePage } from './hooks.js';

export interface QuranPageProps {
  page: number;
  /** SSR/hydration: serializable IR; skips initial client fetch when set */
  initialData?: MushafPageIR;
  /** Override provider adapter for this page */
  adapter?: MushafAdapter;
  mode?: QuranPaintMode;
  scale?: number;
  width?: number | string;
  highlightedAyahs?: VerseKey[];
  highlightedWords?: WordKey[];
  highlights?: Highlight[];
  /** Single-page selection overlay (KD-21) */
  selection?: SelectionState | null;
  theme?: 'light' | 'dark' | 'auto';
  backend?: 'html' | 'svg' | 'canvas';
  fontFamily?: string;
  className?: string;
  style?: CSSProperties;
  loading?: ReactNode;
  error?: ReactNode | ((err: Error) => ReactNode);
  onPageLoad?: (page: MushafPageIR) => void;
  onWordClick?: (word: WordIR, e: WordPointerEvent) => void;
  onWordHover?: (word: WordIR | null) => void;
  onAyahClick?: (verseKey: VerseKey) => void;
  'aria-label'?: string;
}

function propHighlights(
  highlightedAyahs?: VerseKey[],
  highlightedWords?: WordKey[],
  highlights?: Highlight[],
): Highlight[] {
  const fromAyahs: Highlight[] =
    highlightedAyahs?.map((verseKey, i) => ({
      id: `ayah-${verseKey}-${i}`,
      target: { type: 'verse' as const, verseKey },
      priority: HIGHLIGHT_TIERS.props,
      source: 'props',
    })) ?? [];
  const fromWords: Highlight[] =
    highlightedWords?.map((wordKey, i) => ({
      id: `word-${wordKey}-${i}`,
      target: { type: 'word' as const, wordKey },
      priority: HIGHLIGHT_TIERS.props,
      source: 'props',
    })) ?? [];
  const custom =
    highlights?.map((h) => ({
      ...h,
      priority: h.priority ?? HIGHLIGHT_TIERS.props,
      source: h.source ?? 'props',
    })) ?? [];
  return mergeHighlights([fromAyahs, fromWords, custom]);
}

export function QuranPage(props: QuranPageProps) {
  const ctx = useQuranContext();
  const {
    page,
    initialData,
    mode = 'plain',
    width = '100%',
    highlightedAyahs,
    highlightedWords,
    highlights,
    selection = null,
    theme = ctx.theme,
    backend = 'html',
    fontFamily,
    className,
    style,
    loading = <div className="mushaf-loading">Loading page…</div>,
    error: errorSlot,
    onPageLoad,
    onWordClick,
    onWordHover,
    onAyahClick,
    'aria-label': ariaLabel,
  } = props;

  if (backend === 'canvas' && typeof window === 'undefined') {
    throw new Error('Canvas backend is client-only (ADR-015). Use dynamic import with ssr:false.');
  }

  const { data, error, isLoading } = usePage(page, { initialData });
  const hostRef = useRef<HTMLDivElement>(null);
  const backendRef = useRef<RendererBackend | null>(null);
  const [cssSize, setCssSize] = useState({ w: 400, h: 620 });
  // Bump when runtime emits audio/selection/etc. so plugin highlights re-merge
  const [runtimeTick, setRuntimeTick] = useState(0);

  useEffect(() => {
    return ctx.runtime.subscribe(() => {
      setRuntimeTick((t) => t + 1);
    });
  }, [ctx.runtime]);

  const highlightsResolved = useMemo(() => {
    const fromProps = propHighlights(highlightedAyahs, highlightedWords, highlights);
    const fromRuntime = ctx.runtime.getMergedHighlights();
    return mergeHighlights([fromRuntime, fromProps]);
  }, [highlightedAyahs, highlightedWords, highlights, ctx.runtime, data, runtimeTick]);

  useEffect(() => {
    if (data) onPageLoad?.(data);
  }, [data, onPageLoad]);

  // Measure host
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      const w = Math.max(1, cr.width);
      // Madinah-ish aspect from metrics when available
      const aspect = data
        ? data.metrics.height / data.metrics.width
        : 1.55;
      setCssSize({ w, h: w * aspect * (props.scale ?? 1) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [data, props.scale]);

  // Mount backend once
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    if (backend !== 'html') {
      host.textContent = `Backend "${backend}" is not available yet; use "html".`;
      return;
    }

    const b = createHtmlBackend({
      onWordClick: (wordKey, clientX, clientY) => {
        const word = data?.words[wordKey];
        if (!word) return;
        const evt: WordPointerEvent = {
          wordKey,
          clientX,
          clientY,
          logicalX: 0,
          logicalY: 0,
          pointerType: 'mouse',
        };
        onWordClick?.(word, evt);
        onAyahClick?.(word.verseKey);
        ctx.runtime.emit({ type: 'word:click', wordKey });
      },
      onWordFocus: (wordKey) => {
        if (!wordKey) {
          onWordHover?.(null);
          return;
        }
        const word = data?.words[wordKey];
        onWordHover?.(word ?? null);
      },
    });
    b.mount(host);
    backendRef.current = b;
    return () => {
      b.destroy();
      backendRef.current = null;
    };
    // Recreate when page data identity changes enough for click handlers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, backend]);

  // Paint
  useEffect(() => {
    if (!data || !backendRef.current) return;
    if (mode !== 'plain') {
      // KD-16: tajweed/wbw require plugins — warn in dev
      const isProd =
        typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
      if (!isProd) {
        const need = mode === 'tajweed' ? 'tajwid' : 'word_by_word';
        const has = ctx.plugins.some((p) => p.name.includes(need) || p.name.includes(mode));
        if (!has) {
          console.warn(
            `[mushaf] mode="${mode}" requires a registered plugin; painting plain geometry`,
          );
        }
      }
    }
    const frame = composeFrame({
      page: data,
      cssWidth: cssSize.w,
      cssHeight: cssSize.h,
      theme,
      highlights: highlightsResolved,
      selection,
      mode: mode === 'tajweed' || mode === 'word_by_word' ? mode : 'plain',
      fontFamily,
    });
    backendRef.current.render(frame);
  }, [data, cssSize, theme, highlightsResolved, selection, mode, fontFamily, ctx.plugins]);

  if (error) {
    if (typeof errorSlot === 'function') return <>{errorSlot(error)}</>;
    if (errorSlot) return <>{errorSlot}</>;
    return <div className="mushaf-error">Failed to load page {page}: {error.message}</div>;
  }

  return (
    <div
      className={['mushaf-page-host', className].filter(Boolean).join(' ')}
      style={{
        width,
        position: 'relative',
        minHeight: cssSize.h,
        ...style,
      }}
      aria-label={ariaLabel ?? `Quran page ${page}`}
    >
      {isLoading && !data ? loading : null}
      <div ref={hostRef} style={{ width: '100%', minHeight: cssSize.h }} />
    </div>
  );
}
