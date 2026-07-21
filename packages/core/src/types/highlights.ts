import type { VerseKey, WordKey } from '../ids.js';

export type HighlightTarget =
  | { type: 'page'; page: number }
  | { type: 'verse'; verseKey: VerseKey }
  | { type: 'word'; wordKey: WordKey }
  | { type: 'range'; from: WordKey; to: WordKey };

export interface HighlightStyle {
  className?: string;
  color?: string;
  underline?: boolean;
  pulse?: boolean;
}

export interface Highlight {
  id: string;
  target: HighlightTarget;
  style?: HighlightStyle;
  source?: string;
  /** Higher wins within same tier; default 0 */
  priority?: number;
}

/** v0.x/v1: single-page only (KD-21) */
export interface SelectionState {
  page: number;
  from: WordKey;
  to: WordKey;
  verseKeys: VerseKey[];
  text: string;
}
