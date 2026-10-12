import type { VerseKey } from '../ids.js';

export interface SearchOptions {
  locale?: 'ar' | 'en' | 'id' | string;
  fuzzy?: boolean;
  limit?: number;
  types?: Array<'verse' | 'page' | 'surah'>;
}

export interface SearchResult {
  type: 'verse' | 'page' | 'surah';
  score: number;
  verseKey?: VerseKey;
  page?: number;
  surah?: number;
  snippet?: string;
  matchRanges?: Array<{ start: number; end: number }>;
}
