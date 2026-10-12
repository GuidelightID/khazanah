import { describe, expect, it, afterEach } from 'vitest';
import { renderHook, waitFor, cleanup, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { fixtureAdapter } from '@guidelight.id/mushaf-core';
import { QuranProvider } from './context.js';
import { useSearch } from './useSearch.js';

afterEach(() => cleanup());

function wrapper({ children }: { children: ReactNode }) {
  return <QuranProvider adapter={fixtureAdapter}>{children}</QuranProvider>;
}

describe('useSearch', () => {
  it('indexes fixture pages and returns hits', async () => {
    const { result } = renderHook(() => useSearch({ pages: [1, 2] }), { wrapper });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    let hits: Awaited<ReturnType<typeof result.current.query>> = [];
    await act(async () => {
      hits = await result.current.query('بسم');
    });
    expect(hits.length).toBeGreaterThan(0);
  });
});
