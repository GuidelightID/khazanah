import { describe, expect, it } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { fixtureAdapter } from '@guidelight/mushaf-core';
import { QuranProvider } from './context.js';
import { useSelection } from './useSelection.js';

function wrapper({ children }: { children: ReactNode }) {
  return <QuranProvider adapter={fixtureAdapter}>{children}</QuranProvider>;
}

describe('useSelection', () => {
  it('selects an ayah on the page', async () => {
    const { result } = renderHook(() => useSelection(1), { wrapper });

    // Retry until page IR is available (selectAyah no-ops before load)
    await waitFor(() => {
      act(() => {
        result.current.selectAyah('1:1');
      });
      expect(result.current.selection?.verseKeys).toContain('1:1');
    });

    expect(result.current.selection?.from).toBe('1:1:1');
    expect(result.current.selection?.text.length).toBeGreaterThan(0);

    act(() => {
      result.current.clear();
    });
    expect(result.current.selection).toBeNull();
  });
});
