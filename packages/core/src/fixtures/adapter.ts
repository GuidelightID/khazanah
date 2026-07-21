import { defineAdapter } from '../adapter.js';
import { fixtureCatalog } from './catalog.js';
import { fixturePages } from './pages.js';

/** Explicit fixture adapter for tests / Storybook (KD-15 — not a silent default). */
export const fixtureAdapter = defineAdapter({
  id: 'fixture',
  displayName: 'Fixture Adapter',
  licenses: [
    {
      spdx: 'MIT',
      name: 'MIT',
      allowsNpmRedistribution: true,
      allowsModification: true,
      notes: 'Synthetic IR only',
    },
  ],
  getCatalog: () => fixtureCatalog,
  async getPage(page) {
    const ir = fixturePages[page];
    if (!ir) throw new Error(`Fixture has no page ${page}`);
    return structuredClone(ir);
  },
  getPageForVerse(verseKey) {
    if (verseKey.startsWith('1:')) return 1;
    // Map synthetic baqarah-ish keys on pages 2–5
    const m = /^2:(\d+)$/.exec(verseKey);
    if (m) {
      const ayah = Number(m[1]);
      if (ayah <= 2) return 2;
      if (ayah <= 6) return 3;
      if (ayah <= 11) return 4;
      return 5;
    }
    throw new Error(`Unknown verse in fixture: ${verseKey}`);
  },
});
