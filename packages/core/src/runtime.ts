import type { MushafAdapter } from './types/adapter.js';
import type { MushafCatalog } from './types/catalog.js';
import type { Highlight } from './types/highlights.js';
import type { MushafPageIR } from './types/ir.js';
import type { MushafEvent, QuranPaintMode } from './types/events.js';
import {
  mergeHighlights,
  safeCallPlugin,
  type MushafPlugin,
  type MushafPluginContext,
} from './plugin.js';
import { validatePageIR } from './validate.js';
import type { PageLoader, PageLoaderOptions } from './page-loader.js';
import { createFetchPageLoader } from './page-loader.js';
import { assertPageNumber } from './ids.js';

export interface MushafRuntimeConfig {
  adapter: MushafAdapter;
  plugins?: MushafPlugin[];
  backend?: 'html' | 'svg' | 'canvas';
  theme?: 'light' | 'dark' | 'auto';
  pageLoader?: PageLoaderOptions;
  /** Opt-in observability — never default telemetry (KD-20) */
  onEvent?: (event: MushafEvent) => void;
  host?: 'server' | 'client';
}

export interface MushafRuntime {
  readonly adapter: MushafAdapter;
  getPage(page: number, signal?: AbortSignal): Promise<MushafPageIR>;
  getCatalog(): Promise<MushafCatalog>;
  setHighlights(highlights: Highlight[]): void;
  getHighlights(): Highlight[];
  getMergedHighlights(): Highlight[];
  subscribe(listener: () => void): () => void;
  registerPlugin(plugin: MushafPlugin): () => void;
  emit(event: MushafEvent): void;
  destroy(): void;
}

export function createMushafRuntime(config: MushafRuntimeConfig): MushafRuntime {
  const listeners = new Set<() => void>();
  const plugins: MushafPlugin[] = [];
  let propHighlights: Highlight[] = [];
  let destroyed = false;

  const pageLoader: PageLoader | null = config.pageLoader
    ? createFetchPageLoader(config.pageLoader)
    : null;

  const emit = (event: MushafEvent): void => {
    config.onEvent?.(event);
    // Plugin-driven UI (audio highlights, etc.) needs a store tick
    if (
      event.type === 'audio:timeupdate' ||
      event.type === 'selection:change' ||
      event.type === 'annotations:change' ||
      event.type === 'fonts:ready'
    ) {
      notify();
    }
  };

  const notify = (): void => {
    for (const l of listeners) l();
  };

  const onPluginError = (name: string, error: Error): void => {
    emit({ type: 'plugin:error', plugin: name, error });
  };

  const ctx = (): MushafPluginContext => ({
    adapter: config.adapter,
    emit,
    log: console,
    host: config.host ?? 'client',
  });

  const initPlugin = (plugin: MushafPlugin): void => {
    if (plugin.clientOnly !== false && (config.host ?? 'client') === 'server') {
      return;
    }
    if (plugin.onInit) {
      void Promise.resolve(plugin.onInit(ctx())).catch((e) => {
        onPluginError(plugin.name, e instanceof Error ? e : new Error(String(e)));
      });
    }
  };

  for (const p of config.plugins ?? []) {
    plugins.push(p);
    initPlugin(p);
  }

  const memoryPages = new Map<number, MushafPageIR>();

  const runtime: MushafRuntime = {
    adapter: config.adapter,

    async getPage(page: number, signal?: AbortSignal): Promise<MushafPageIR> {
      assertPageNumber(page);
      const t0 = Date.now();
      try {
        let ir = memoryPages.get(page);
        if (!ir) {
          const raw = await config.adapter.getPage(page, signal);
          ir = validatePageIR(raw);
          memoryPages.set(page, ir);
          if (memoryPages.size > 15) {
            const first = memoryPages.keys().next().value as number | undefined;
            if (first !== undefined) memoryPages.delete(first);
          }
        }
        for (const plugin of plugins) {
          safeCallPlugin(
            plugin,
            () => plugin.onPageLoad?.(ir!),
            onPluginError,
          );
        }
        emit({ type: 'page:loaded', page, ms: Date.now() - t0 });
        return ir;
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        emit({ type: 'page:error', page, error });
        throw error;
      }
    },

    async getCatalog(): Promise<MushafCatalog> {
      return config.adapter.getCatalog();
    },

    setHighlights(highlights: Highlight[]) {
      propHighlights = highlights;
      notify();
    },

    getHighlights() {
      return propHighlights;
    },

    getMergedHighlights() {
      const fromPlugins = plugins.map((p) => {
        try {
          return p.provideHighlights?.() ?? [];
        } catch (e) {
          onPluginError(p.name, e instanceof Error ? e : new Error(String(e)));
          return [];
        }
      });
      return mergeHighlights([...fromPlugins, propHighlights]);
    },

    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    registerPlugin(plugin: MushafPlugin) {
      plugins.push(plugin);
      initPlugin(plugin);
      notify();
      return () => {
        const i = plugins.indexOf(plugin);
        if (i >= 0) plugins.splice(i, 1);
        safeCallPlugin(plugin, () => plugin.onDestroy?.(), onPluginError);
        notify();
      };
    },

    emit,

    destroy() {
      if (destroyed) return;
      destroyed = true;
      for (const p of plugins) {
        safeCallPlugin(p, () => p.onDestroy?.(), onPluginError);
      }
      plugins.length = 0;
      listeners.clear();
      memoryPages.clear();
      pageLoader?.clearCache?.();
    },
  };

  return runtime;
}

// re-export mode type for consumers
export type { QuranPaintMode };
