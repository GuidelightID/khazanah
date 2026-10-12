import { describe, expect, it } from 'vitest';
import { fixturePage1 } from '@guidelight.id/mushaf-core';
import { composeFrame } from '../pipeline.js';
import { createHtmlBackend } from './html.js';

describe('HtmlGlyphRenderer', () => {
  it('mounts, paints, and hit-tests', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    Object.defineProperty(host, 'getBoundingClientRect', {
      value: () => ({ left: 0, top: 0, width: 400, height: 620, right: 400, bottom: 620 }),
    });

    let clicked: string | null = null;
    const backend = createHtmlBackend({
      onWordClick: (k) => {
        clicked = k;
      },
    });
    backend.mount(host);

    const frame = composeFrame({
      page: fixturePage1,
      cssWidth: 400,
      cssHeight: 620,
    });
    backend.render(frame);

    expect(host.querySelector('[data-word="1:1:1"]')).toBeTruthy();
    expect(backend.supportsSSR).toBe(true);
    expect(backend.renderToStaticMarkup?.(frame)).toContain('data-page="1"');

    const el = host.querySelector('[data-word="1:1:1"]') as HTMLElement;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 10, clientY: 10 }));
    expect(clicked).toBe('1:1:1');

    backend.destroy();
    expect(host.innerHTML).toBe('');
    host.remove();
  });
});
