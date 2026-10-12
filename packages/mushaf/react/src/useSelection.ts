'use client';

import { useCallback, useMemo, useState } from 'react';
import type { SelectionState, VerseKey, WordKey } from '@guidelight/mushaf-core';
import { useQuranContext } from './context.js';
import { usePage } from './hooks.js';

/**
 * Single-page selection (KD-21). Cross-page ranges are out of scope for v0.x.
 */
export function useSelection(page: number): {
  selection: SelectionState | null;
  setSelection: (s: SelectionState | null) => void;
  clear: () => void;
  selectAyah: (verseKey: VerseKey) => void;
  selectWords: (from: WordKey, to: WordKey) => void;
} {
  const { runtime } = useQuranContext();
  const { data } = usePage(page);
  const [selection, setSelectionState] = useState<SelectionState | null>(null);

  const setSelection = useCallback(
    (s: SelectionState | null) => {
      setSelectionState(s);
      runtime.emit({ type: 'selection:change', selection: s });
    },
    [runtime],
  );

  const clear = useCallback(() => setSelection(null), [setSelection]);

  const selectAyah = useCallback(
    (verseKey: VerseKey) => {
      if (!data) return;
      const span = data.verses.find((v) => v.verseKey === verseKey);
      if (!span || span.wordKeys.length === 0) return;
      const from = span.wordKeys[0]!;
      const to = span.wordKeys[span.wordKeys.length - 1]!;
      const text = span.wordKeys.map((k) => data.words[k]?.text ?? '').join(' ');
      setSelection({
        page: data.page,
        from,
        to,
        verseKeys: [verseKey],
        text,
      });
    },
    [data, setSelection],
  );

  const selectWords = useCallback(
    (from: WordKey, to: WordKey) => {
      if (!data) return;
      const keys = data.lines.flatMap((l) => l.wordKeys);
      const a = keys.indexOf(from);
      const b = keys.indexOf(to);
      if (a < 0 || b < 0) return;
      const [lo, hi] = a <= b ? [a, b] : [b, a];
      const slice = keys.slice(lo, hi + 1);
      const verseKeys = [
        ...new Set(
          slice
            .map((k) => data.words[k]?.verseKey)
            .filter((v): v is VerseKey => Boolean(v)),
        ),
      ];
      const text = slice.map((k) => data.words[k]?.text ?? '').join(' ');
      setSelection({
        page: data.page,
        from: keys[lo]!,
        to: keys[hi]!,
        verseKeys,
        text,
      });
    },
    [data, setSelection],
  );

  return useMemo(
    () => ({ selection, setSelection, clear, selectAyah, selectWords }),
    [selection, setSelection, clear, selectAyah, selectWords],
  );
}
