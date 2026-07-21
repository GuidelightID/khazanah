import type { Annotation, AnnotationStore } from './types.js';

export function createMemoryAnnotationStore(
  initial: Annotation[] = [],
): AnnotationStore {
  let data = [...initial];
  return {
    async load() {
      return [...data];
    },
    async save(annotations) {
      data = [...annotations];
    },
  };
}

export function createLocalStorageAnnotationStore(
  key = 'mushaf.annotations',
): AnnotationStore {
  return {
    async load() {
      if (typeof localStorage === 'undefined') return [];
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as Annotation[];
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    },
    async save(annotations) {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(key, JSON.stringify(annotations));
    },
  };
}
