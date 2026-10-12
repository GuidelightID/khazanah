import type { VerseKey } from '../ids.js';
import type { MushafCatalog } from './catalog.js';
import type { MushafPageIR } from './ir.js';

export interface AdapterLicense {
  spdx: string;
  name: string;
  url?: string;
  allowsNpmRedistribution: boolean;
  allowsModification: boolean;
  notes?: string;
}

export interface SearchCorpusVerse {
  verseKey: VerseKey;
  page: number;
  textAr: string;
  textNormalizedAr: string;
  translations?: Record<string, string>;
}

export interface SearchCorpus {
  locale: string;
  verses: SearchCorpusVerse[];
  surahNames?: Array<{ number: number; names: string[] }>;
}

export interface MushafAdapter {
  readonly id: string;
  readonly displayName: string;
  readonly licenses: AdapterLicense[];

  getCatalog(): Promise<MushafCatalog> | MushafCatalog;
  getPage(page: number, signal?: AbortSignal): Promise<MushafPageIR>;
  prefetchPages?(pages: number[]): void;
  getPageForVerse?(verseKey: VerseKey): Promise<number> | number;
  getSearchCorpus?(locale: string): Promise<SearchCorpus> | SearchCorpus;
}
