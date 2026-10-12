import {
  clientToLogical,
  hitTestWord,
  type WordKey,
} from '@guidelight.id/mushaf-core';
import { listFocusableWordKeys, renderPageToStaticMarkup } from '../html-markup.js';
import type { RenderFrame, RendererBackend } from '../types.js';

export interface HtmlGlyphRendererOptions {
  onWordClick?: (wordKey: WordKey, clientX: number, clientY: number) => void;
  onWordFocus?: (wordKey: WordKey | null) => void;
}

/**
 * Default HTML backend (ADR-002 / ADR-015).
 * SSR: renderToStaticMarkup is required.
 */
export class HtmlGlyphRenderer implements RendererBackend {
  readonly id = 'html' as const;
  readonly supportsSSR = true;

  private host: HTMLElement | null = null;
  private frame: RenderFrame | null = null;
  private focusedIndex = 0;
  private readonly opts: HtmlGlyphRendererOptions;
  private readonly onKeyDown: (e: KeyboardEvent) => void;
  private readonly onClick: (e: MouseEvent) => void;

  constructor(opts: HtmlGlyphRendererOptions = {}) {
    this.opts = opts;
    this.onKeyDown = (e) => this.handleKeyDown(e);
    this.onClick = (e) => this.handleClick(e);
  }

  mount(host: HTMLElement): void {
    this.host = host;
    host.tabIndex = 0;
    host.addEventListener('keydown', this.onKeyDown);
    host.addEventListener('click', this.onClick);
  }

  render(frame: RenderFrame): void {
    this.frame = frame;
    if (!this.host) return;
    this.host.innerHTML = renderPageToStaticMarkup(frame);
    this.applyRovingTabindex();
  }

  resize(cssWidth: number, cssHeight: number): void {
    if (!this.frame || !this.host) return;
    this.frame = {
      ...this.frame,
      viewMatrix: {
        ...this.frame.viewMatrix,
        cssWidth,
        cssHeight,
      },
    };
    // Caller should recompute viewMatrix.scale/offsets; this only stores size if they already did
    this.render(this.frame);
  }

  hitTest(clientX: number, clientY: number): WordKey | null {
    if (!this.frame || !this.host) return null;
    const rect = this.host.getBoundingClientRect();
    const logical = clientToLogical(clientX, clientY, rect, this.frame.viewMatrix);
    // Adjust for letterboxing already in matrix; surface is inside host
    return hitTestWord(this.frame.page, logical);
  }

  destroy(): void {
    if (this.host) {
      this.host.removeEventListener('keydown', this.onKeyDown);
      this.host.removeEventListener('click', this.onClick);
      this.host.innerHTML = '';
    }
    this.host = null;
    this.frame = null;
  }

  renderToStaticMarkup(frame: RenderFrame): string {
    return renderPageToStaticMarkup(frame);
  }

  private wordEls(): HTMLElement[] {
    if (!this.host) return [];
    return Array.from(this.host.querySelectorAll<HTMLElement>('[data-word]'));
  }

  private applyRovingTabindex(): void {
    const els = this.wordEls();
    if (!els.length) return;
    this.focusedIndex = Math.min(this.focusedIndex, els.length - 1);
    els.forEach((el, i) => {
      el.tabIndex = i === this.focusedIndex ? 0 : -1;
    });
  }

  private handleClick(e: MouseEvent): void {
    const target = (e.target as HTMLElement | null)?.closest?.('[data-word]') as
      | HTMLElement
      | null;
    if (!target) return;
    const key = target.getAttribute('data-word') as WordKey | null;
    if (!key) return;
    const els = this.wordEls();
    const idx = els.indexOf(target);
    if (idx >= 0) {
      this.focusedIndex = idx;
      this.applyRovingTabindex();
    }
    this.opts.onWordClick?.(key, e.clientX, e.clientY);
    this.opts.onWordFocus?.(key);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.frame) return;
    const keys = listFocusableWordKeys(this.frame.page);
    if (!keys.length) return;

    const max = keys.length - 1;
    let next = this.focusedIndex;

    switch (e.key) {
      case 'ArrowLeft': // RTL: left moves forward in reading order visually; use sequential keys
      case 'ArrowRight':
      case 'ArrowDown':
        next = Math.min(max, this.focusedIndex + 1);
        e.preventDefault();
        break;
      case 'ArrowUp':
        next = Math.max(0, this.focusedIndex - 1);
        e.preventDefault();
        break;
      case 'Home':
        next = 0;
        e.preventDefault();
        break;
      case 'End':
        next = max;
        e.preventDefault();
        break;
      case 'Enter':
      case ' ': {
        e.preventDefault();
        const key = keys[this.focusedIndex];
        if (key) this.opts.onWordClick?.(key, 0, 0);
        return;
      }
      default:
        return;
    }

    this.focusedIndex = next;
    this.applyRovingTabindex();
    const els = this.wordEls();
    els[this.focusedIndex]?.focus();
    const key = keys[this.focusedIndex];
    if (key) this.opts.onWordFocus?.(key);
  }
}

export function createHtmlBackend(opts?: HtmlGlyphRendererOptions): RendererBackend {
  return new HtmlGlyphRenderer(opts);
}
