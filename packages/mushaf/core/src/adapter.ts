import type { MushafAdapter, AdapterLicense } from './types/adapter.js';
import type { MushafCatalog } from './types/catalog.js';
import type { MushafPageIR } from './types/ir.js';
import type { VerseKey } from './ids.js';
import { validatePageIR } from './validate.js';

export interface DefineAdapterInput {
  id: string;
  displayName: string;
  licenses: AdapterLicense[];
  getCatalog: () => Promise<MushafCatalog> | MushafCatalog;
  getPage: (page: number, signal?: AbortSignal) => Promise<MushafPageIR>;
  prefetchPages?: (pages: number[]) => void;
  getPageForVerse?: (verseKey: VerseKey) => Promise<number> | number;
}

/** Helper to build a typed adapter with IR validation on getPage. */
export function defineAdapter(input: DefineAdapterInput): MushafAdapter {
  return {
    id: input.id,
    displayName: input.displayName,
    licenses: input.licenses,
    getCatalog: input.getCatalog,
    async getPage(page, signal) {
      const ir = await input.getPage(page, signal);
      return validatePageIR(ir);
    },
    prefetchPages: input.prefetchPages,
    getPageForVerse: input.getPageForVerse,
  };
}
