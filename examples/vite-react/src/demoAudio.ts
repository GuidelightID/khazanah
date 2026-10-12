import { audioPlugin, type WordTiming } from '@guidelight.id/mushaf-audio';
import type { VerseKey } from '@guidelight.id/mushaf-core';
import { fixturePage1 } from '@guidelight.id/mushaf-core';

/** Build fake sequential timings from fixture page words (demo only). */
export function demoTimingsForVerse(verseKey: VerseKey): WordTiming[] {
  const span = fixturePage1.verses.find((v) => v.verseKey === verseKey);
  if (!span) return [];
  const step = 0.45;
  return span.wordKeys.map((wordKey, i) => ({
    wordKey,
    start: i * step,
    end: (i + 1) * step,
  }));
}

/**
 * Silent WAV data URI so play() works without network (user-gesture only).
 * Duration is short; we still drive highlights from our timing map + rAF clock fallback.
 */
export const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

/**
 * Demo audio plugin: uses silent audio + synthetic word timings for 1:1.
 * Real apps pass CDN URLs + real timings.
 */
export function createDemoAudioPlugin() {
  return audioPlugin({
    getAudioUrl: () => SILENT_WAV,
    getWordTimings: (verseKey) => demoTimingsForVerse(verseKey),
    highlightColor: 'rgba(56, 132, 255, 0.45)',
  });
}
