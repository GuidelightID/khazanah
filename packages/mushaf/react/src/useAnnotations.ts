'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { HighlightTarget } from '@guidelight.id/mushaf-core';
import { useQuranContext } from './context.js';

/** Duck-typed API from @guidelight.id/mushaf-annotations (avoid hard package cycle) */
export interface AnnotationRecord {
  id: string;
  target: HighlightTarget;
  note?: string;
  color?: string;
  label?: string;
  createdAt: string;
}

export interface AnnotationsApiLike {
  list: () => AnnotationRecord[];
  add: (input: {
    target: HighlightTarget;
    note?: string;
    color?: string;
    label?: string;
    id?: string;
  }) => Promise<AnnotationRecord>;
  update: (
    id: string,
    patch: Partial<{ target: HighlightTarget; note?: string; color?: string; label?: string }>,
  ) => Promise<AnnotationRecord | null>;
  remove: (id: string) => Promise<boolean>;
  clear: () => Promise<void>;
  reload: () => Promise<void>;
}

function findApi(plugins: Array<{ name: string; api?: unknown }>): AnnotationsApiLike | null {
  const p = plugins.find((x) => x.name === 'annotations');
  if (!p || !p.api || typeof (p.api as AnnotationsApiLike).list !== 'function') {
    return null;
  }
  return p.api as AnnotationsApiLike;
}

/**
 * React binding for `@guidelight.id/mushaf-annotations` when registered on QuranProvider.
 * Returns null api if the plugin is not installed.
 */
export function useAnnotations(): {
  api: AnnotationsApiLike | null;
  annotations: AnnotationRecord[];
  refresh: () => void;
} {
  const { runtime, plugins } = useQuranContext();
  const api = useMemo(() => findApi(plugins as Array<{ name: string; api?: unknown }>), [plugins]);
  const [annotations, setAnnotations] = useState<AnnotationRecord[]>(() => api?.list() ?? []);

  const refresh = useCallback(() => {
    setAnnotations(api?.list() ?? []);
  }, [api]);

  useEffect(() => {
    refresh();
    return runtime.subscribe(() => {
      refresh();
    });
  }, [runtime, refresh]);

  return { api, annotations, refresh };
}
