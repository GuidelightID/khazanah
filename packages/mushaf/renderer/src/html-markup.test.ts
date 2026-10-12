import { describe, expect, it } from 'vitest';
import { fixturePage1, computeViewMatrix } from '@guidelight/mushaf-core';
import { renderPageToStaticMarkup } from './html-markup.js';
import type { RenderFrame } from './types.js';

function frame(over: Partial<RenderFrame> = {}): RenderFrame {
  const viewMatrix = computeViewMatrix({
    logicalWidth: fixturePage1.metrics.width,
    logicalHeight: fixturePage1.metrics.height,
    cssWidth: 400,
    cssHeight: 620,
  });
  return {
    page: fixturePage1,
    viewMatrix,
    theme: 'light',
    highlights: [],
    selection: null,
    mode: 'plain',
    fontFamily: 'Amiri, serif',
    ...over,
  };
}

describe('renderPageToStaticMarkup', () => {
  it('emits accessible page structure', () => {
    const html = renderPageToStaticMarkup(frame());
    expect(html).toContain('role="document"');
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('lang="ar"');
    expect(html).toContain('data-page="1"');
    expect(html).toContain('data-word="1:1:1"');
    expect(html).toContain('mushaf-sr-verses');
    expect(html).toContain('data-mushaf-overlay-root');
  });

  it('applies verse highlights', () => {
    const html = renderPageToStaticMarkup(
      frame({
        highlights: [
          {
            id: 'h1',
            target: { type: 'verse', verseKey: '1:1' },
            style: { color: 'rgba(255,0,0,0.3)' },
            priority: 30,
          },
        ],
      }),
    );
    expect(html).toContain('mushaf-highlight');
    expect(html).toContain('rgba(255,0,0,0.3)');
  });

  it('is a pure function of the frame (stable structure)', () => {
    const a = renderPageToStaticMarkup(frame());
    const b = renderPageToStaticMarkup(frame());
    expect(a).toBe(b);
  });

  it('honors line flags and char types in markup', () => {
    const html = renderPageToStaticMarkup(frame());
    expect(html).toContain('mushaf-line--bismillah');
    expect(html).toContain('data-char-type=');
    expect(html).toContain('align-items:baseline');
    expect(html).not.toMatch(/font-size:48/);
  });
});
