import { describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { fixtureAdapter } from '@guidelightid/mushaf-core';
import { QuranProvider } from './context.js';
import { QuranViewer } from './QuranViewer.js';

describe('QuranViewer', () => {
  it('virtualizes and mounts pages in range', async () => {
    const onPageChange = vi.fn();
    render(
      <QuranProvider adapter={fixtureAdapter}>
        <QuranViewer
          pages={[1, 5]}
          initialPage={1}
          estimatedPageHeight={400}
          style={{ height: 500 }}
          onPageChange={onPageChange}
          pageProps={{ width: 320 }}
        />
      </QuranProvider>,
    );

    await waitFor(() => {
      expect(document.querySelector('[data-viewer-page="1"]')).toBeTruthy();
    });

    // With virtualization, not all 5 need to be in DOM at once for a short viewport,
    // but page 1 should paint content.
    await waitFor(() => {
      expect(document.querySelector('[data-page="1"]')).toBeTruthy();
    });

    expect(document.querySelector('.mushaf-viewer')?.getAttribute('data-virtualized')).toBe(
      'true',
    );
  });

  it('can disable virtualization and mount all pages', async () => {
    render(
      <QuranProvider adapter={fixtureAdapter}>
        <QuranViewer
          pages={[1, 3]}
          virtualized={false}
          estimatedPageHeight={200}
          style={{ height: 600 }}
          pageProps={{ width: 280 }}
        />
      </QuranProvider>,
    );

    await waitFor(() => {
      expect(document.querySelector('[data-viewer-page="1"]')).toBeTruthy();
      expect(document.querySelector('[data-viewer-page="2"]')).toBeTruthy();
      expect(document.querySelector('[data-viewer-page="3"]')).toBeTruthy();
    });
  });
});
