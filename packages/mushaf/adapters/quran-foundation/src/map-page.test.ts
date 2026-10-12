import { describe, expect, it } from 'vitest';
import { mapVersesToPageIR } from './map-page.js';
import type { QfVerse } from './types.js';
import { createQuranFoundationAdapter } from './create-adapter.js';
import { mapChaptersToCatalog } from './map-catalog.js';

const sampleVerses: QfVerse[] = [
  {
    id: 1,
    verse_key: '1:1',
    verse_number: 1,
    page_number: 1,
    words: [
      {
        id: 1,
        position: 1,
        text_uthmani: 'بِسْمِ',
        line_number: 2,
        char_type_name: 'word',
      },
      {
        id: 2,
        position: 2,
        text_uthmani: 'ٱللَّهِ',
        line_number: 2,
        char_type_name: 'word',
      },
      {
        id: 3,
        position: 3,
        text_uthmani: 'ٱلرَّحْمَٰنِ',
        line_number: 2,
        char_type_name: 'word',
      },
      {
        id: 4,
        position: 4,
        text_uthmani: 'ٱلرَّحِيمِ',
        line_number: 2,
        char_type_name: 'end',
      },
    ],
  },
];

const bismillahTyped: QfVerse[] = [
  {
    id: 1,
    verse_key: '1:1',
    verse_number: 1,
    page_number: 1,
    words: [
      {
        id: 1,
        position: 1,
        text_uthmani: 'بِسْمِ',
        line_number: 1,
        char_type_name: 'basmallah',
      },
      {
        id: 2,
        position: 2,
        text_uthmani: 'ٱللَّهِ',
        line_number: 1,
        char_type_name: 'basmallah',
      },
    ],
  },
];

describe('mapVersesToPageIR', () => {
  it('builds unicode_bbox IR with word keys and lines', () => {
    const ir = mapVersesToPageIR(1, sampleVerses);
    expect(ir.version).toBe(1);
    expect(ir.page).toBe(1);
    expect(ir.metrics.fontModel).toBe('unicode_bbox');
    expect(ir.words['1:1:1']?.text).toBe('بِسْمِ');
    expect(ir.words['1:1:4']?.charType).toBe('end_marker');
    expect(ir.lines.some((l) => l.index === 2)).toBe(true);
    expect(ir.verses[0]?.verseKey).toBe('1:1');
    expect(ir.meta?.source).toContain('quran-foundation');
  });

  it('uses unequal proportional widths (not equal slots)', () => {
    const ir = mapVersesToPageIR(1, sampleVerses);
    const line = ir.lines.find((l) => l.index === 2)!;
    const widths = line.wordKeys.map((k) => ir.words[k]!.bbox.w);
    expect(widths[0]).not.toBeCloseTo(widths[2]!, 0);
    expect(widths[2]!).toBeGreaterThan(widths[0]!);
  });

  it('places words RTL (first word rightmost)', () => {
    const ir = mapVersesToPageIR(1, sampleVerses);
    const a = ir.words['1:1:1']!.bbox;
    const b = ir.words['1:1:2']!.bbox;
    expect(a.x).toBeGreaterThan(b.x);
  });

  it('centers bismillah-typed lines', () => {
    const ir = mapVersesToPageIR(1, bismillahTyped);
    const line = ir.lines.find((l) => l.index === 1)!;
    expect(line.isBismillah).toBe(true);
    expect(line.isCentered).toBe(true);
    const boxes = line.wordKeys.map((k) => ir.words[k]!.bbox);
    const minX = Math.min(...boxes.map((b) => b.x));
    const maxX = Math.max(...boxes.map((b) => b.x + b.w));
    const mid = (minX + maxX) / 2;
    const contentMid = ir.metrics.contentInsets.left + line.bbox.w / 2;
    expect(Math.abs(mid - contentMid)).toBeLessThan(3);
  });

  it('keeps word keys and order stable', () => {
    const ir = mapVersesToPageIR(1, sampleVerses);
    expect(ir.lines[0]?.wordKeys).toEqual(['1:1:1', '1:1:2', '1:1:3', '1:1:4']);
  });
});

describe('mapChaptersToCatalog', () => {
  it('maps chapters', () => {
    const catalog = mapChaptersToCatalog([
      {
        id: 1,
        name_arabic: 'الفاتحة',
        name_simple: 'Al-Fatihah',
        verses_count: 7,
        revelation_place: 'makkah',
        pages: [1, 1],
      },
    ]);
    expect(catalog.pageCount).toBe(604);
    expect(catalog.surahs[0]?.startPage).toBe(1);
    expect(catalog.surahs[0]?.revelationType).toBe('meccan');
  });
});

describe('createQuranFoundationAdapter', () => {
  it('uses injected fetch and caches pages', async () => {
    let calls = 0;
    const fetchImpl: typeof fetch = async (input) => {
      calls += 1;
      const url = String(input);
      if (url.includes('/chapters')) {
        return new Response(
          JSON.stringify({
            chapters: [
              {
                id: 1,
                name_arabic: 'الفاتحة',
                name_simple: 'Al-Fatihah',
                verses_count: 7,
                revelation_place: 'makkah',
                pages: [1, 1],
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }
      if (url.includes('/verses/by_page/1')) {
        return new Response(JSON.stringify({ verses: sampleVerses }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (url.includes('/verses/by_key/1:1')) {
        return new Response(
          JSON.stringify({ verse: { verse_key: '1:1', page_number: 1 } }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }
      return new Response('not found', { status: 404 });
    };

    const adapter = createQuranFoundationAdapter({ fetchImpl });
    const catalog = await adapter.getCatalog();
    expect(catalog.surahs).toHaveLength(1);

    const p1 = await adapter.getPage(1);
    const p1b = await adapter.getPage(1);
    expect(p1.page).toBe(1);
    expect(p1b.words['1:1:1']?.text).toBe('بِسْمِ');
    const pageCalls = calls;
    await adapter.getPage(1);
    expect(calls).toBe(pageCalls);

    const page = await adapter.getPageForVerse?.('1:1');
    expect(page).toBe(1);

    expect(adapter.licenses[0]?.allowsNpmRedistribution).toBe(false);
  });
});
