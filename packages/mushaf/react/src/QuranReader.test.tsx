import { describe, expect, it, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { fixtureAdapter } from '@guidelight.id/mushaf-core';
import { QuranProvider } from './context.js';
import { QuranReader } from './QuranReader.js';

afterEach(() => {
  cleanup();
});

function renderReader(initialPage = 1) {
  return render(
    <QuranProvider adapter={fixtureAdapter}>
      <QuranReader
        initialPage={initialPage}
        viewerProps={{
          pages: [1, 5],
          estimatedPageHeight: 300,
          style: { height: 400 },
          pageProps: { width: 280 },
        }}
      />
    </QuranProvider>,
  );
}

describe('QuranReader', () => {
  it('renders chrome and a page', async () => {
    renderReader(1);

    expect(screen.getAllByLabelText('Page')[0]).toBeTruthy();
    await waitFor(() => {
      expect(document.querySelector('[data-page="1"]')).toBeTruthy();
    });
  });

  it('navigates with next button', async () => {
    renderReader(1);

    const next = screen.getAllByLabelText('Next')[0]!;
    fireEvent.click(next);
    await waitFor(() => {
      const readers = document.querySelectorAll('.mushaf-reader');
      const last = readers[readers.length - 1];
      expect(last?.getAttribute('data-page')).toBe('2');
    });
  });
});
