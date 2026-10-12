'use client';

import { useCallback, useEffect, useState } from 'react';
import type { MushafPageIR, SurahMeta, VerseKey, WordIR, WordKey } from '@guidelight.id/mushaf-core';
import { useQuranContext } from './context.js';

export function useQuran() {
  const ctx = useQuranContext();
  const [catalog, setCatalog] = useState<Awaited<
    ReturnType<typeof ctx.runtime.getCatalog>
  > | null>(null);

  useEffect(() => {
    let cancelled = false;
    void ctx.runtime.getCatalog().then((c) => {
      if (!cancelled) setCatalog(c);
    });
    return () => {
      cancelled = true;
    };
  }, [ctx.runtime]);

  return {
    runtime: ctx.runtime,
    catalog: catalog ?? undefined,
    theme: ctx.theme,
    setTheme: ctx.setTheme,
    plugins: ctx.plugins,
  };
}

export function usePage(
  page: number,
  opts?: { initialData?: MushafPageIR },
): {
  data: MushafPageIR | undefined;
  error: Error | undefined;
  isLoading: boolean;
  refetch: () => void;
} {
  const { runtime } = useQuranContext();
  const [data, setData] = useState<MushafPageIR | undefined>(opts?.initialData);
  const [error, setError] = useState<Error | undefined>();
  const [isLoading, setIsLoading] = useState(!opts?.initialData);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (opts?.initialData && opts.initialData.page === page && tick === 0) {
      setData(opts.initialData);
      setIsLoading(false);
      setError(undefined);
      return;
    }

    const ac = new AbortController();
    setIsLoading(true);
    setError(undefined);

    void runtime
      .getPage(page, ac.signal)
      .then((ir) => {
        if (!ac.signal.aborted) {
          setData(ir);
          setIsLoading(false);
        }
      })
      .catch((e: unknown) => {
        if (!ac.signal.aborted) {
          setError(e instanceof Error ? e : new Error(String(e)));
          setIsLoading(false);
        }
      });

    return () => ac.abort();
  }, [runtime, page, opts?.initialData, tick]);

  return { data, error, isLoading, refetch };
}

export function useSurah(surah: number): {
  meta: SurahMeta | undefined;
  startPage: number | undefined;
  ayahCount: number | undefined;
} {
  const { catalog } = useQuran();
  const meta = catalog?.surahs.find((s) => s.number === surah);
  return {
    meta,
    startPage: meta?.startPage,
    ayahCount: meta?.ayahCount,
  };
}

export function useAyah(verseKey: VerseKey): {
  verseKey: VerseKey;
  page: number | undefined;
  words: WordIR[] | undefined;
  text: string | undefined;
} {
  const { runtime } = useQuranContext();
  const [page, setPage] = useState<number | undefined>();
  const [words, setWords] = useState<WordIR[] | undefined>();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const p = await runtime.adapter.getPageForVerse?.(verseKey);
      if (cancelled || p == null) return;
      setPage(p);
      const ir = await runtime.getPage(p);
      if (cancelled) return;
      const span = ir.verses.find((v) => v.verseKey === verseKey);
      const ws = span?.wordKeys.map((k) => ir.words[k]).filter(Boolean) as WordIR[] | undefined;
      setWords(ws);
    })();
    return () => {
      cancelled = true;
    };
  }, [runtime, verseKey]);

  return {
    verseKey,
    page,
    words,
    text: words?.map((w) => w.text).join(' '),
  };
}

export function useWord(wordKey: WordKey): {
  word: WordIR | undefined;
  page: number | undefined;
} {
  const { runtime } = useQuranContext();
  const [word, setWord] = useState<WordIR | undefined>();
  const [page, setPage] = useState<number | undefined>();

  useEffect(() => {
    const [s, a] = wordKey.split(':');
    const verseKey = `${s}:${a}` as VerseKey;
    let cancelled = false;
    void (async () => {
      const p = await runtime.adapter.getPageForVerse?.(verseKey);
      if (cancelled || p == null) return;
      setPage(p);
      const ir = await runtime.getPage(p);
      if (!cancelled) setWord(ir.words[wordKey]);
    })();
    return () => {
      cancelled = true;
    };
  }, [runtime, wordKey]);

  return { word, page };
}
