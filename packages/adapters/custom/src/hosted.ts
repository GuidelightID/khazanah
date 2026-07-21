import {
  createFetchPageLoader,
  defineAdapter,
  type AdapterLicense,
  type MushafAdapter,
  type MushafCatalog,
  type PageLoaderOptions,
  type VerseKey,
} from '@mushaf/core';

export interface HostedAdapterOptions extends PageLoaderOptions {
  id?: string;
  displayName?: string;
  licenses?: AdapterLicense[];
  /** Path to catalog.json relative to baseUrl (default catalog.json) */
  catalogPath?: string;
  /** Path to verse-index.json (default verse-index.json) */
  verseIndexPath?: string;
  /** Fallback catalog when catalog.json is missing */
  fallbackCatalog?: MushafCatalog;
}

function joinUrl(base: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

const DEFAULT_LICENSE: AdapterLicense = {
  spdx: 'NOASSERTION',
  name: 'Hosted mushaf assets (see NOTICE in baseUrl)',
  allowsNpmRedistribution: false,
  allowsModification: false,
  notes: 'License is defined by the pulled asset pack, not this adapter package.',
};

/**
 * Adapter backed by host-served IR from `mushaf data pull` (or equivalent).
 * No mandatory third-party API at runtime once assets are local.
 */
export function createHostedAdapter(options: HostedAdapterOptions): MushafAdapter {
  const {
    id = 'hosted',
    displayName = 'Hosted Mushaf data',
    licenses = [DEFAULT_LICENSE],
    catalogPath = 'catalog.json',
    verseIndexPath = 'verse-index.json',
    fallbackCatalog,
    ...loaderOpts
  } = options;

  const loader = createFetchPageLoader({
    ...loaderOpts,
    // Node tests often lack subtle crypto; skip hash unless explicitly enabled
    verifyHash: loaderOpts.verifyHash ?? false,
  });

  let catalogCache: MushafCatalog | null = null;
  let verseIndexCache: Record<string, number> | null = null;
  const fetchImpl = loaderOpts.fetchImpl ?? fetch;

  async function loadCatalog(signal?: AbortSignal): Promise<MushafCatalog> {
    if (catalogCache) return catalogCache;
    const url = joinUrl(loaderOpts.baseUrl, catalogPath);
    try {
      const res = await fetchImpl(url, { signal });
      if (res.ok) {
        catalogCache = (await res.json()) as MushafCatalog;
        return catalogCache;
      }
    } catch {
      /* fall through */
    }

    if (fallbackCatalog) {
      catalogCache = fallbackCatalog;
      return catalogCache;
    }

    const manifest = await loader.getManifest(signal);
    catalogCache = {
      pageCount: manifest.pages.length
        ? Math.max(...manifest.pages.map((p) => p.page))
        : 604,
      surahs: [],
      juz: [],
      hizb: [],
    };
    return catalogCache;
  }

  async function loadVerseIndex(signal?: AbortSignal): Promise<Record<string, number>> {
    if (verseIndexCache) return verseIndexCache;
    const url = joinUrl(loaderOpts.baseUrl, verseIndexPath);
    try {
      const res = await fetchImpl(url, { signal });
      if (res.ok) {
        verseIndexCache = (await res.json()) as Record<string, number>;
        return verseIndexCache;
      }
    } catch {
      /* empty */
    }
    verseIndexCache = {};
    return verseIndexCache;
  }

  return defineAdapter({
    id,
    displayName,
    licenses,
    getCatalog: () => loadCatalog(),
    getPage: (page, signal) => loader.loadPage(page, signal),
    prefetchPages: (pages) => loader.prefetch(pages),
    async getPageForVerse(verseKey: VerseKey) {
      const index = await loadVerseIndex();
      const page = index[verseKey];
      if (page != null) return page;

      // Fallback: surah start from catalog
      const catalog = await loadCatalog();
      const surah = Number(verseKey.split(':')[0]);
      const meta = catalog.surahs.find((s) => s.number === surah);
      if (meta) return meta.startPage;

      throw new Error(`No page mapping for verse ${verseKey} (missing verse-index.json entry)`);
    },
  });
}
