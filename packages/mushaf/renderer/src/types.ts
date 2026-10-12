import type {
  Highlight,
  MushafPageIR,
  QuranPaintMode,
  SelectionState,
  ViewMatrix,
  WordKey,
} from '@guidelight/mushaf-core';

export interface RenderFrame {
  page: MushafPageIR;
  viewMatrix: ViewMatrix;
  theme: 'light' | 'dark' | 'auto';
  highlights: Highlight[];
  selection: SelectionState | null;
  mode: QuranPaintMode;
  fontFamily: string;
}

export interface RendererBackend {
  readonly id: 'html' | 'svg' | 'canvas' | string;
  readonly supportsSSR: boolean;
  mount(host: HTMLElement): void;
  render(frame: RenderFrame): void;
  resize(cssWidth: number, cssHeight: number): void;
  hitTest(clientX: number, clientY: number): WordKey | null;
  destroy(): void;
  renderToStaticMarkup?(frame: RenderFrame): string;
}

export interface WordStyle {
  wordKey: WordKey;
  className: string;
  background?: string;
  underline?: boolean;
}
