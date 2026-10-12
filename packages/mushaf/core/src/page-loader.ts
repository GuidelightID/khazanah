import { parsePageIRJson } from './validate.js';
import type { MushafPageIR } from './types/ir.js';

export interface PageManifestEntry {
  page: number;
  path: string;
  bytes: number;
  gzipBytes?: number;
  sha256: string;
}

export interface PageManifest {
  version: 1;
  mushaf: string;
  baseUrl?: string;
  pages: PageManifestEntry[];
  fontModel: 'unicode_bbox' | 'page_font' | 'hybrid';
  generatedAt?: string;
}

export interface PageLoaderOptions {
  baseUrl: string;
  manifestUrl?: string;
  fetchImpl?: typeof fetch;
  cache?: 'memory' | 'none';
  memoryLimitPages?: number;
  verifyHash?: boolean;
}

export interface PageLoader {
  getManifest(signal?: AbortSignal): Promise<PageManifest>;
  loadPage(page: number, signal?: AbortSignal): Promise<MushafPageIR>;
  prefetch(pages: number[], opts?: { priority?: 'high' | 'low' }): void;
  clearCache?(): void;
}

class LruCache<V> {
  private readonly map = new Map<number, V>();
  constructor(private readonly limit: number) {}

  get(key: number): V | undefined {
    const v = this.map.get(key);
    if (v === undefined) return undefined;
    this.map.delete(key);
    this.map.set(key, v);
    return v;
  }

  set(key: number, value: V): void {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    while (this.map.size > this.limit) {
      const first = this.map.keys().next().value as number | undefined;
      if (first === undefined) break;
      this.map.delete(first);
    }
  }

  clear(): void {
    this.map.clear();
  }
}

function joinUrl(base: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

async function sha256Hex(data: ArrayBuffer): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hash = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Node without subtle in rare envs — skip verification
  return '';
}

/**
 * Host-served page IR loader (ADR-006).
 * Do not statically import all 604 pages in the app bundle.
 */
export function createFetchPageLoader(opts: PageLoaderOptions): PageLoader {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const memoryLimit = opts.memoryLimitPages ?? 15;
  const cacheMode = opts.cache ?? 'memory';
  const pageCache = new LruCache<MushafPageIR>(memoryLimit);
  let manifestPromise: Promise<PageManifest> | null = null;

  const manifestUrl =
    opts.manifestUrl ?? joinUrl(opts.baseUrl, 'pages.manifest.json');

  async function getManifest(signal?: AbortSignal): Promise<PageManifest> {
    if (!manifestPromise) {
      manifestPromise = (async () => {
        const res = await fetchImpl(manifestUrl, { signal });
        if (!res.ok) throw new Error(`Failed to load manifest: ${res.status}`);
        return (await res.json()) as PageManifest;
      })().catch((err) => {
        manifestPromise = null;
        throw err;
      });
    }
    return manifestPromise;
  }

  async function loadPage(page: number, signal?: AbortSignal): Promise<MushafPageIR> {
    if (cacheMode === 'memory') {
      const hit = pageCache.get(page);
      if (hit) return hit;
    }

    const manifest = await getManifest(signal);
    const entry = manifest.pages.find((p) => p.page === page);
    if (!entry) throw new Error(`Page ${page} not found in manifest`);

    const base = manifest.baseUrl ?? opts.baseUrl;
    const url = joinUrl(base, entry.path);
    const res = await fetchImpl(url, { signal });
    if (!res.ok) throw new Error(`Failed to load page ${page}: ${res.status}`);

    const buf = await res.arrayBuffer();
    if (opts.verifyHash !== false && entry.sha256 && typeof crypto !== 'undefined') {
      const hex = await sha256Hex(buf);
      if (hex && hex !== entry.sha256.toLowerCase()) {
        throw new Error(`Hash mismatch for page ${page}`);
      }
    }

    const text = new TextDecoder().decode(buf);
    const ir = parsePageIRJson(text);
    if (ir.page !== page) {
      throw new Error(`IR page field ${ir.page} does not match requested ${page}`);
    }

    if (cacheMode === 'memory') pageCache.set(page, ir);
    return ir;
  }

  return {
    getManifest,
    loadPage,
    prefetch(pages: number[]) {
      for (const p of pages) {
        void loadPage(p).catch(() => {
          /* prefetch is best-effort */
        });
      }
    },
    clearCache() {
      pageCache.clear();
      manifestPromise = null;
    },
  };
}
