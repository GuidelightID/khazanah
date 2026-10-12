import type { VerseKey, WordKey } from '@guidelightid/mushaf-core';

export interface WordTiming {
  wordKey: WordKey;
  /** seconds */
  start: number;
  end: number;
}

export interface AyahTiming {
  verseKey: VerseKey;
  start: number;
  end: number;
  words?: WordTiming[];
}

/** Pick active word for a playback time (seconds). */
export function wordAtTime(
  timings: WordTiming[],
  timeSec: number,
): WordKey | null {
  for (const t of timings) {
    if (timeSec >= t.start && timeSec < t.end) return t.wordKey;
  }
  // nearest previous if between gaps
  let best: WordTiming | null = null;
  for (const t of timings) {
    if (t.start <= timeSec && (!best || t.start > best.start)) best = t;
  }
  return best?.wordKey ?? null;
}
