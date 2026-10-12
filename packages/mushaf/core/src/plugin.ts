import type { Highlight } from './types/highlights.js';
import type { MushafPageIR } from './types/ir.js';
import type { SelectionState } from './types/highlights.js';
import type { WordIR } from './types/ir.js';
import type { MushafEvent } from './types/events.js';
import type { MushafAdapter } from './types/adapter.js';
import type { WordPointerEvent } from './pointer.js';

export interface MushafPluginContext {
  adapter: MushafAdapter;
  emit: (event: MushafEvent) => void;
  log: Pick<Console, 'debug' | 'info' | 'warn' | 'error'>;
  host: 'server' | 'client';
}

export interface PluginCommand {
  id: string;
  label: string;
  run: () => void | Promise<void>;
}

/**
 * Framework-agnostic plugin contract (ADR-007).
 * React overlays: extend in @guidelight/mushaf-react via MushafReactPlugin.
 */
export interface MushafPlugin {
  name: string;
  version: string;
  highlightTier?: number;
  /** Default true for UI/audio plugins — skipped on server */
  clientOnly?: boolean;
  onInit?(ctx: MushafPluginContext): void | Promise<void>;
  onDestroy?(): void;
  onPageLoad?(page: MushafPageIR): void;
  onWordClick?(word: WordIR, event: WordPointerEvent): void;
  onWordHover?(word: WordIR | null): void;
  onSelectionChange?(selection: SelectionState | null): void;
  provideHighlights?(): Highlight[];
  provideCommands?(): PluginCommand[];
  renderOverlayDom?(container: HTMLElement, page: number): void | (() => void);
}

/** Highlight merge tiers (low → high; higher replaces overlapping lower fill) */
export const HIGHLIGHT_TIERS = {
  ambient: 0,
  tajweed: 10,
  audio: 20,
  props: 30,
  selection: 40,
} as const;

/**
 * Merge highlights by tier then priority then source name.
 * Last write wins per word key for fill; underlines can stack later in renderer.
 */
export function mergeHighlights(groups: Highlight[][]): Highlight[] {
  const expanded = groups.flat();
  return [...expanded].sort((a, b) => {
    const ta = a.priority ?? 0;
    const tb = b.priority ?? 0;
    if (ta !== tb) return ta - tb;
    return (a.source ?? '').localeCompare(b.source ?? '');
  });
}

export function safeCallPlugin(
  plugin: MushafPlugin,
  fn: () => void,
  onError: (plugin: string, error: Error) => void,
): void {
  try {
    fn();
  } catch (e) {
    onError(plugin.name, e instanceof Error ? e : new Error(String(e)));
  }
}
