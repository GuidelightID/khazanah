import {
  computeViewMatrix,
  type Highlight,
  type MushafPageIR,
  type QuranPaintMode,
  type SelectionState,
} from '@guidelight/mushaf-core';
import type { RenderFrame, RendererBackend } from './types.js';

export interface ComposeFrameInput {
  page: MushafPageIR;
  cssWidth: number;
  cssHeight: number;
  dpr?: number;
  theme?: RenderFrame['theme'];
  highlights?: Highlight[];
  selection?: SelectionState | null;
  mode?: QuranPaintMode;
  fontFamily?: string;
}

export function composeFrame(input: ComposeFrameInput): RenderFrame {
  const viewMatrix = computeViewMatrix({
    logicalWidth: input.page.metrics.width,
    logicalHeight: input.page.metrics.height,
    cssWidth: input.cssWidth,
    cssHeight: input.cssHeight,
    dpr: input.dpr ?? 1,
  });

  return {
    page: input.page,
    viewMatrix,
    theme: input.theme ?? 'light',
    highlights: input.highlights ?? [],
    selection: input.selection ?? null,
    mode: input.mode ?? 'plain',
    fontFamily: input.fontFamily ?? 'Amiri, "Times New Roman", serif',
  };
}

export function paint(backend: RendererBackend, frame: RenderFrame): void {
  backend.render(frame);
}
