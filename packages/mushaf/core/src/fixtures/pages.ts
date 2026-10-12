import type { MushafPageIR, WordIR } from '../types/ir.js';
import type { VerseKey as VK, WordKey as WK } from '../ids.js';
import { fixturePage1 } from './page1.js';

function word(
  key: WK,
  verseKey: VK,
  text: string,
  line: number,
  bbox: WordIR['bbox'],
): WordIR {
  return { key, verseKey, text, line, bbox, glyphs: [] };
}

/** Build a simple synthetic page with two lines of placeholder Arabic. */
export function makeFixturePage(page: number, surah: number, startAyah: number): MushafPageIR {
  const w1 = `${surah}:${startAyah}:1` as WK;
  const w2 = `${surah}:${startAyah}:2` as WK;
  const w3 = `${surah}:${startAyah}:3` as WK;
  const w4 = `${surah}:${startAyah + 1}:1` as WK;
  const w5 = `${surah}:${startAyah + 1}:2` as WK;
  const w6 = `${surah}:${startAyah + 1}:3` as WK;
  const v1 = `${surah}:${startAyah}` as VK;
  const v2 = `${surah}:${startAyah + 1}` as VK;

  return {
    version: 1,
    page,
    metrics: {
      width: 1000,
      height: 1550,
      contentInsets: { top: 80, right: 60, bottom: 80, left: 60 },
      lineCount: 2,
      mushaf: 'fixture',
      script: 'uthmani',
      fontModel: 'unicode_bbox',
    },
    lines: [
      {
        index: 1,
        bbox: { x: 60, y: 100, w: 880, h: 90 },
        wordKeys: [w1, w2, w3],
      },
      {
        index: 2,
        bbox: { x: 60, y: 220, w: 880, h: 90 },
        wordKeys: [w4, w5, w6],
      },
    ],
    words: {
      [w1]: word(w1, v1, 'صَفْحَة', 1, { x: 760, y: 100, w: 140, h: 90 }),
      [w2]: word(w2, v1, String(page), 1, { x: 600, y: 100, w: 120, h: 90 }),
      [w3]: word(w3, v1, 'تَجْرِيبِيَّة', 1, { x: 380, y: 100, w: 180, h: 90 }),
      [w4]: word(w4, v2, 'سُورَة', 2, { x: 760, y: 220, w: 140, h: 90 }),
      [w5]: word(w5, v2, String(surah), 2, { x: 600, y: 220, w: 120, h: 90 }),
      [w6]: word(w6, v2, `آيَة ${startAyah + 1}`, 2, { x: 380, y: 220, w: 180, h: 90 }),
    },
    verses: [
      {
        verseKey: v1,
        surah,
        ayah: startAyah,
        wordKeys: [w1, w2, w3],
        bboxes: [{ x: 380, y: 100, w: 520, h: 90 }],
      },
      {
        verseKey: v2,
        surah,
        ayah: startAyah + 1,
        wordKeys: [w4, w5, w6],
        bboxes: [{ x: 380, y: 220, w: 520, h: 90 }],
      },
    ],
    meta: { source: 'fixture', licenseSpdx: 'MIT' },
  };
}

export const fixturePages: Record<number, MushafPageIR> = {
  1: fixturePage1,
  2: makeFixturePage(2, 2, 1),
  3: makeFixturePage(3, 2, 5),
  4: makeFixturePage(4, 2, 10),
  5: makeFixturePage(5, 2, 15),
};

/** Default fixture page count for viewer demos (not full 604). */
export const FIXTURE_PAGE_COUNT = 5;
