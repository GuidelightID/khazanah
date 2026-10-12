import { describe, expect, it } from 'vitest';
import {
  annotationsPlugin,
  createMemoryAnnotationStore,
} from './index.js';

describe('annotationsPlugin', () => {
  it('adds and highlights annotations', async () => {
    const store = createMemoryAnnotationStore();
    const plugin = annotationsPlugin({ store });
    await plugin.onInit?.({
      adapter: {} as never,
      emit: () => {},
      log: console,
      host: 'client',
    });

    const ann = await plugin.api.add({
      target: { type: 'verse', verseKey: '1:1' },
      note: 'test',
    });
    expect(ann.id).toBeTruthy();
    expect(plugin.api.list()).toHaveLength(1);

    const hs = plugin.provideHighlights?.() ?? [];
    expect(hs).toHaveLength(1);
    expect(hs[0]?.target).toEqual({ type: 'verse', verseKey: '1:1' });

    await plugin.api.remove(ann.id);
    expect(plugin.api.list()).toHaveLength(0);
    plugin.onDestroy?.();
  });

  it('persists via store', async () => {
    const store = createMemoryAnnotationStore();
    const a = annotationsPlugin({ store });
    await a.onInit?.({
      adapter: {} as never,
      emit: () => {},
      log: console,
      host: 'client',
    });
    await a.api.add({ target: { type: 'word', wordKey: '1:1:1' } });

    const b = annotationsPlugin({ store });
    await b.onInit?.({
      adapter: {} as never,
      emit: () => {},
      log: console,
      host: 'client',
    });
    expect(b.api.list()).toHaveLength(1);
  });
});
