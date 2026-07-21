import { describe, expect, it, vi } from 'vitest';
import { createMushafRuntime } from './runtime.js';
import { fixtureAdapter } from './fixtures/adapter.js';
import type { MushafPlugin } from './plugin.js';

describe('createMushafRuntime', () => {
  it('loads a page from the adapter', async () => {
    const events: string[] = [];
    const runtime = createMushafRuntime({
      adapter: fixtureAdapter,
      onEvent: (e) => events.push(e.type),
    });
    const page = await runtime.getPage(1);
    expect(page.page).toBe(1);
    expect(events).toContain('page:loaded');
    runtime.destroy();
  });

  it('isolates plugin errors', async () => {
    const bad: MushafPlugin = {
      name: 'bad',
      version: '0.0.0',
      onPageLoad() {
        throw new Error('boom');
      },
    };
    const onEvent = vi.fn();
    const runtime = createMushafRuntime({
      adapter: fixtureAdapter,
      plugins: [bad],
      onEvent,
    });
    await runtime.getPage(1);
    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'plugin:error', plugin: 'bad' }),
    );
    runtime.destroy();
  });

  it('merges prop highlights', () => {
    const runtime = createMushafRuntime({ adapter: fixtureAdapter });
    runtime.setHighlights([
      { id: '1', target: { type: 'verse', verseKey: '1:1' }, priority: 30 },
    ]);
    expect(runtime.getMergedHighlights()).toHaveLength(1);
    runtime.destroy();
  });
});
