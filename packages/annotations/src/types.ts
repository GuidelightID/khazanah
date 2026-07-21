import type { HighlightTarget } from '@mushaf/core';

export interface Annotation {
  id: string;
  target: HighlightTarget;
  note?: string;
  color?: string;
  label?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AnnotationInput {
  target: HighlightTarget;
  note?: string;
  color?: string;
  label?: string;
  id?: string;
}

export interface AnnotationStore {
  load(): Promise<Annotation[]>;
  save(annotations: Annotation[]): Promise<void>;
}
