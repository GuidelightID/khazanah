import type { WordKey } from './ids.js';

export interface WordPointerEvent {
  wordKey: WordKey;
  clientX: number;
  clientY: number;
  logicalX: number;
  logicalY: number;
  originalEvent?: Event;
  pointerType?: 'mouse' | 'touch' | 'pen' | 'keyboard';
}
