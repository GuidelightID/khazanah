import type {
  LineIR,
  MushafPageIR,
  VerseSpanIR,
  WordIR,
  WordKey,
  VerseKey,
} from '@mushaf/core';
import {
  UNICODE_PAGE,
  layoutLineRtl,
  isBismillahText,
} from '@mushaf/core';
import type { TanzilVerse } from './types.js';

const LOGICAL_W = UNICODE_PAGE.width;
const LOGICAL_H = UNICODE_PAGE.height;
const INSET = { top: 100, right: 70, bottom: 100, left: 70 };
const LINE_H = 95;
const WORDS_PER_LINE = 6;

/**
 * Flow Arabic words into a simple multi-line page (RTL measured packing).
 * Not Madinah plate geometry.
 */
export function layoutVersesOnPage(page: number, verses: TanzilVerse[]): MushafPageIR {
  const words: Record<string, WordIR> = {};
  const verseSpans: VerseSpanIR[] = [];
  type Pending = { key: WordKey; verseKey: VerseKey; text: string };
  const pending: Pending[] = [];

  for (const v of verses) {
    const tokens = v.text.trim().split(/\s+/).filter(Boolean);
    const wordKeys: WordKey[] = [];
    tokens.forEach((text, i) => {
      const key = `${v.verseKey}:${i + 1}` as WordKey;
      wordKeys.push(key);
      pending.push({ key, verseKey: v.verseKey, text });
    });
    const [s, a] = v.verseKey.split(':').map(Number) as [number, number];
    verseSpans.push({
      verseKey: v.verseKey,
      surah: s,
      ayah: a,
      wordKeys,
      bboxes: [],
    });
  }

  const lines: LineIR[] = [];
  const contentW = LOGICAL_W - INSET.left - INSET.right;
  let lineIndex = 1;

  for (let i = 0; i < pending.length; i += WORDS_PER_LINE) {
    const chunk = pending.slice(i, i + WORDS_PER_LINE);
    const y = INSET.top + (lineIndex - 1) * LINE_H;
    if (y + LINE_H > LOGICAL_H - INSET.bottom) break;

    const forceCentered = chunk.some((it) => isBismillahText(it.text));
    const { bboxes, centered } = layoutLineRtl(
      chunk.map((it) => ({ text: it.text, charType: 'word' as const })),
      {
        contentWidth: contentW,
        y,
        lineHeight: LINE_H,
        contentLeft: INSET.left,
        centered: forceCentered,
      },
    );

    const wordKeys: WordKey[] = [];
    chunk.forEach((item, j) => {
      const bbox = bboxes[j]!;
      words[item.key] = {
        key: item.key,
        verseKey: item.verseKey,
        text: item.text,
        line: lineIndex,
        bbox,
        glyphs: [],
        charType: 'word',
      };
      wordKeys.push(item.key);
    });

    lines.push({
      index: lineIndex,
      bbox: { x: INSET.left, y, w: contentW, h: LINE_H },
      wordKeys,
      isCentered: centered || undefined,
      isBismillah: forceCentered || undefined,
    });
    lineIndex += 1;
  }

  for (const span of verseSpans) {
    const boxes = span.wordKeys
      .map((k) => words[k]?.bbox)
      .filter((b): b is NonNullable<typeof b> => Boolean(b));
    if (!boxes.length) {
      span.wordKeys = span.wordKeys.filter((k) => words[k]);
      continue;
    }
    const minX = Math.min(...boxes.map((b) => b.x));
    const minY = Math.min(...boxes.map((b) => b.y));
    const maxX = Math.max(...boxes.map((b) => b.x + b.w));
    const maxY = Math.max(...boxes.map((b) => b.y + b.h));
    span.bboxes = [{ x: minX, y: minY, w: maxX - minX, h: maxY - minY }];
    span.wordKeys = span.wordKeys.filter((k) => words[k]);
  }

  return {
    version: 1,
    page,
    metrics: {
      width: LOGICAL_W,
      height: LOGICAL_H,
      contentInsets: { ...INSET },
      lineCount: lines.length,
      mushaf: 'tanzil_textflow',
      script: 'uthmani',
      fontModel: 'unicode_bbox',
    },
    lines,
    words,
    verses: verseSpans.filter((v) => v.wordKeys.length > 0),
    meta: {
      source: 'tanzil-textflow',
      licenseSpdx: 'LicenseRef-Corpus-See-App',
      licenseNotice:
        'Text-flow layout is approximate. Quran text license is the app corpus license (e.g. Tanzil).',
    },
  };
}

export function assignPages(
  verses: TanzilVerse[],
  wordsPerPage: number,
): Map<number, TanzilVerse[]> {
  const byPage = new Map<number, TanzilVerse[]>();
  let autoPage = 1;
  let wordsOnPage = 0;

  for (const v of verses) {
    const wc = v.text.trim().split(/\s+/).filter(Boolean).length;
    let page = v.page;
    if (page == null) {
      if (wordsOnPage + wc > wordsPerPage && wordsOnPage > 0) {
        autoPage += 1;
        wordsOnPage = 0;
      }
      page = autoPage;
      wordsOnPage += wc;
    } else {
      autoPage = Math.max(autoPage, page);
    }
    const list = byPage.get(page) ?? [];
    list.push(v);
    byPage.set(page, list);
  }
  return byPage;
}
