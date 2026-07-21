import type { VerseKey, WordKey } from '../ids.js';
import type { SelectionState } from './highlights.js';

export type MushafEvent =
  | { type: 'page:loaded'; page: number; ms?: number }
  | { type: 'page:error'; page: number; error: Error }
  | { type: 'word:click'; wordKey: WordKey }
  | { type: 'word:hover'; wordKey: WordKey | null }
  | { type: 'selection:change'; selection: SelectionState | null }
  | { type: 'audio:timeupdate'; verseKey: VerseKey; wordKey?: WordKey }
  | { type: 'annotations:change'; count: number }
  | { type: 'plugin:error'; plugin: string; error: Error }
  | { type: 'fonts:ready' };

export type QuranPaintMode = 'plain' | 'tajweed' | 'word_by_word';
