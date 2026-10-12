import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { fixtureAdapter, fixturePage1 } from '@guidelight.id/mushaf-core';
import { QuranProvider } from './context.js';
import { QuranPage } from './QuranPage.js';

describe('QuranPage', () => {
  it('renders fixture page via provider', async () => {
    render(
      <QuranProvider adapter={fixtureAdapter}>
        <QuranPage page={1} width={400} />
      </QuranProvider>,
    );

    await waitFor(() => {
      expect(document.querySelector('[data-page="1"]')).toBeTruthy();
    });
    expect(document.querySelector('[data-word="1:1:1"]')).toBeTruthy();
  });

  it('hydrates from initialData without waiting on adapter errors', async () => {
    render(
      <QuranProvider adapter={fixtureAdapter}>
        <QuranPage page={1} initialData={fixturePage1} width={400} />
      </QuranProvider>,
    );

    await waitFor(() => {
      expect(document.querySelector('[data-word="1:1:1"]')).toBeTruthy();
    });
  });

  it('throws outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<QuranPage page={1} />)).toThrow(/QuranProvider/);
    spy.mockRestore();
  });

  it('shows error UI for missing page', async () => {
    render(
      <QuranProvider adapter={fixtureAdapter}>
        <QuranPage page={99} width={400} />
      </QuranProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText(/Failed to load page 99/i)).toBeTruthy();
    });
  });
});
