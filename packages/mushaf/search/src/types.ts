import type { SearchCorpus, SearchOptions, SearchResult, VerseKey } from '@guidelight.id/mushaf-core';

export type { SearchCorpus, SearchOptions, SearchResult, VerseKey };

export interface SearchEngine {
  ensureIndex(locale: string, corpus?: SearchCorpus): Promise<void>;
  search(query: string, opts?: SearchOptions): Promise<SearchResult[]>;
  isReady(locale?: string): boolean;
}
