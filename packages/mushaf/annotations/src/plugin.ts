import {
  HIGHLIGHT_TIERS,
  type Highlight,
  type MushafPlugin,
  type MushafPluginContext,
} from '@guidelight/mushaf-core';
import type { Annotation, AnnotationInput, AnnotationStore } from './types.js';
import { createMemoryAnnotationStore } from './store.js';

export interface AnnotationsPluginOptions {
  store?: AnnotationStore;
  /** Default highlight color for notes */
  defaultColor?: string;
  /** Highlight priority (default props tier) */
  priority?: number;
}

export interface AnnotationsApi {
  list: () => Annotation[];
  add: (input: AnnotationInput) => Promise<Annotation>;
  update: (id: string, patch: Partial<AnnotationInput>) => Promise<Annotation | null>;
  remove: (id: string) => Promise<boolean>;
  clear: () => Promise<void>;
  reload: () => Promise<void>;
}

export interface AnnotationsPlugin extends MushafPlugin {
  api: AnnotationsApi;
}

function newId(): string {
  return `ann_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function annotationsPlugin(
  options: AnnotationsPluginOptions = {},
): AnnotationsPlugin {
  const store = options.store ?? createMemoryAnnotationStore();
  const defaultColor = options.defaultColor ?? 'rgba(255, 214, 10, 0.35)';
  const priority = options.priority ?? HIGHLIGHT_TIERS.props;

  let annotations: Annotation[] = [];
  let ctx: MushafPluginContext | null = null;
  let ready: Promise<void> | null = null;

  async function persist() {
    await store.save(annotations);
    ctx?.emit({ type: 'annotations:change', count: annotations.length });
  }

  const api: AnnotationsApi = {
    list: () => [...annotations],
    async add(input) {
      await ready;
      const now = new Date().toISOString();
      const ann: Annotation = {
        id: input.id ?? newId(),
        target: input.target,
        note: input.note,
        color: input.color ?? defaultColor,
        label: input.label,
        createdAt: now,
      };
      annotations = [...annotations, ann];
      await persist();
      return ann;
    },
    async update(id, patch) {
      await ready;
      const idx = annotations.findIndex((a) => a.id === id);
      if (idx < 0) return null;
      const prev = annotations[idx]!;
      const next: Annotation = {
        ...prev,
        ...patch,
        target: patch.target ?? prev.target,
        updatedAt: new Date().toISOString(),
      };
      annotations = annotations.map((a) => (a.id === id ? next : a));
      await persist();
      return next;
    },
    async remove(id) {
      await ready;
      const before = annotations.length;
      annotations = annotations.filter((a) => a.id !== id);
      if (annotations.length === before) return false;
      await persist();
      return true;
    },
    async clear() {
      await ready;
      annotations = [];
      await persist();
    },
    async reload() {
      annotations = await store.load();
      ctx?.emit({ type: 'annotations:change', count: annotations.length });
    },
  };

  const plugin: AnnotationsPlugin = {
    name: 'annotations',
    version: '0.0.0',
    clientOnly: false,
    highlightTier: priority,
    api,
    onInit(c) {
      ctx = c;
      ready = store.load().then((list) => {
        annotations = list;
      });
      return ready;
    },
    onDestroy() {
      ctx = null;
      annotations = [];
      ready = null;
    },
    provideHighlights(): Highlight[] {
      return annotations.map((a) => ({
        id: `annotation-${a.id}`,
        target: a.target,
        style: {
          color: a.color ?? defaultColor,
          underline: true,
          className: 'mushaf-annotation',
        },
        source: 'annotations',
        priority,
      }));
    },
    provideCommands: () => [
      {
        id: 'annotations.clear',
        label: 'Clear annotations',
        run: () => {
          void api.clear();
        },
      },
    ],
  };

  return plugin;
}
