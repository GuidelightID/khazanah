import { describe, expect, it } from 'vitest';
import { fixtureCatalog, fixturePages, type PageManifest } from '@guidelight/mushaf-core';
import { createHostedAdapter } from './hosted.js';

function makeFetch(files: Record<string, unknown>): typeof fetch {
  return async (input) => {
    const url = String(input);
    const path = url.replace(/^https?:\/\/[^/]+/, '').replace(/^\//, '');
    // baseUrl http://test/mushaf → paths like mushaf/pages.manifest.json
    const key = path.includes('mushaf/')
      ? path.slice(path.indexOf('mushaf/') + 'mushaf/'.length)
      : path;
    const body = files[key];
    if (body === undefined) {
      return new Response('missing', { status: 404 });
    }
    if (typeof body === 'string') {
      return new Response(body, { status: 200 });
    }
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}

describe('createHostedAdapter', () => {
  it('loads catalog, page IR, and verse index from host', async () => {
    const manifest: PageManifest = {
      version: 1,
      mushaf: 'fixture',
      pages: [
        {
          page: 1,
          path: 'pages/0001.json',
          bytes: 100,
          sha256: 'abc',
        },
      ],
      fontModel: 'unicode_bbox',
    };

    const fetchImpl = makeFetch({
      'pages.manifest.json': manifest,
      'pages/0001.json': fixturePages[1],
      'catalog.json': fixtureCatalog,
      'verse-index.json': { '1:1': 1, '1:2': 1 },
    });

    const adapter = createHostedAdapter({
      baseUrl: 'http://test/mushaf',
      fetchImpl,
      verifyHash: false,
    });

    const catalog = await adapter.getCatalog();
    expect(catalog.pageCount).toBe(fixtureCatalog.pageCount);

    const page = await adapter.getPage(1);
    expect(page.page).toBe(1);
    expect(page.words['1:1:1']?.text).toBeTruthy();

    const p = await adapter.getPageForVerse?.('1:1');
    expect(p).toBe(1);
  });
});
