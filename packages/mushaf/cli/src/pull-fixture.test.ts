import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pullFixtureSource } from './pull-fixture.js';

describe('pullFixtureSource', () => {
  it('writes pages, manifest, notice', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'mushaf-pull-'));
    try {
      const result = await pullFixtureSource(dir);
      expect(result.pagesWritten).toBe(5);
      const manifest = JSON.parse(await readFile(result.manifestPath, 'utf8')) as {
        pages: unknown[];
        mushaf: string;
      };
      expect(manifest.mushaf).toBe('fixture');
      expect(manifest.pages).toHaveLength(5);
      const page1 = JSON.parse(
        await readFile(path.join(dir, 'pages', '0001.json'), 'utf8'),
      ) as { page: number };
      expect(page1.page).toBe(1);
      const notice = await readFile(result.noticePath, 'utf8');
      expect(notice).toContain('MIT');
      const verseIndex = JSON.parse(
        await readFile(path.join(dir, 'verse-index.json'), 'utf8'),
      ) as Record<string, number>;
      expect(verseIndex['1:1']).toBe(1);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
