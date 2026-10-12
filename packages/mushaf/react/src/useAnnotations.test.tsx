import { describe, expect, it, afterEach } from 'vitest';
import { renderHook, waitFor, act, cleanup } from '@testing-library/react';
import type { ReactNode } from 'react';
import { fixtureAdapter } from '@guidelightid/mushaf-core';
import { annotationsPlugin, createMemoryAnnotationStore } from '@guidelightid/mushaf-annotations';
import { QuranProvider } from './context.js';
import { useAnnotations } from './useAnnotations.js';

afterEach(() => cleanup());

describe('useAnnotations', () => {
  it('lists and adds via registered plugin', async () => {
    const plugin = annotationsPlugin({ store: createMemoryAnnotationStore() });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QuranProvider adapter={fixtureAdapter} plugins={[plugin]}>
        {children}
      </QuranProvider>
    );

    const { result } = renderHook(() => useAnnotations(), { wrapper });

    await waitFor(() => {
      expect(result.current.api).toBeTruthy();
    });

    await act(async () => {
      await result.current.api!.add({
        target: { type: 'verse', verseKey: '1:1' },
        note: 'hello',
      });
    });

    await waitFor(() => {
      expect(result.current.annotations).toHaveLength(1);
      expect(result.current.annotations[0]?.note).toBe('hello');
    });
  });
});
