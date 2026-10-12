import type {
  LineIR,
  MushafPageIR,
  VerseSpanIR,
  WordIR,
  WordKey,
  VerseKey,
} from '@guidelight/mushaf-core';
import {
  UNICODE_PAGE,
  layoutLineRtl,
  isBismillahText,
} from '@guidelight/mushaf-core';
import type { QfVerse } from './types.js';
import { mapCharType } from './map-char-type.js';

const LOGICAL_W = UNICODE_PAGE.width;
const LOGICAL_H = UNICODE_PAGE.height;
const INSET = { ...UNICODE_PAGE.inset };
const LINE_HEIGHT = UNICODE_PAGE.lineHeight;

/**
 * Convert QF verses-by-page payload into MushafPageIR (unicode_bbox).
 * Bboxes use measured RTL packing (not official plate coordinates).
 */
export function mapVersesToPageIR(page: number, verses: QfVerse[]): MushafPageIR {
  const words: Record<string, WordIR> = {};
  const verseSpans: VerseSpanIR[] = [];

  type Pending = {
    key: WordKey;
    verseKey: VerseKey;
    text: string;
    line: number;
    charType: WordIR['charType'];
    externalId?: string;
    translation?: string;
  };

  const pending: Pending[] = [];
  let autoLine = 1;
  let wordsOnAutoLine = 0;

  for (const verse of verses) {
    const verseKey = verse.verse_key as VerseKey;
    const [surahStr, ayahStr] = verse.verse_key.split(':');
    const surah = Number(surahStr);
    const ayah = Number(ayahStr);
    const wordKeys: WordKey[] = [];

    for (const w of verse.words ?? []) {
      const text = (w.text_uthmani ?? w.text ?? '').trim();
      if (!text) continue;

      let line = w.line_number;
      if (line == null || line < 1) {
        if (wordsOnAutoLine >= 8) {
          autoLine += 1;
          wordsOnAutoLine = 0;
        }
        line = autoLine;
        wordsOnAutoLine += 1;
      } else {
        autoLine = Math.max(autoLine, line);
      }

      const key = `${verse.verse_key}:${w.position}` as WordKey;
      wordKeys.push(key);
      pending.push({
        key,
        verseKey,
        text,
        line,
        charType: mapCharType(w.char_type_name),
        externalId: w.id != null ? String(w.id) : undefined,
        translation: w.translation?.text,
      });
    }

    if (wordKeys.length) {
      verseSpans.push({
        verseKey,
        surah,
        ayah,
        wordKeys,
        bboxes: [],
      });
    }
  }

  const byLine = new Map<number, Pending[]>();
  for (const p of pending) {
    const list = byLine.get(p.line) ?? [];
    list.push(p);
    byLine.set(p.line, list);
  }

  const lineIndexes = [...byLine.keys()].sort((a, b) => a - b);
  const contentWidth = LOGICAL_W - INSET.left - INSET.right;
  const lines: LineIR[] = [];

  for (const lineIndex of lineIndexes) {
    const items = byLine.get(lineIndex) ?? [];
    const y = INSET.top + (lineIndex - 1) * LINE_HEIGHT;

    const forceCentered = items.some(
      (it) =>
        it.charType === 'bismillah' ||
        it.charType === 'header' ||
        isBismillahText(it.text),
    );
    const isHeader = items.some((it) => it.charType === 'header');
    const isBismillah =
      !isHeader &&
      items.some(
        (it) => it.charType === 'bismillah' || isBismillahText(it.text),
      );

    const { bboxes, centered } = layoutLineRtl(
      items.map((it) => ({ text: it.text, charType: it.charType })),
      {
        contentWidth,
        y,
        lineHeight: LINE_HEIGHT,
        contentLeft: INSET.left,
        centered: forceCentered,
      },
    );

    const wordKeys: WordKey[] = [];
    items.forEach((item, i) => {
      const bbox = bboxes[i]!;
      words[item.key] = {
        key: item.key,
        verseKey: item.verseKey,
        text: item.text,
        line: lineIndex,
        bbox,
        glyphs: [],
        charType: item.charType,
        externalId: item.externalId,
        translation: item.translation,
      };
      wordKeys.push(item.key);
    });

    lines.push({
      index: lineIndex,
      bbox: {
        x: INSET.left,
        y,
        w: contentWidth,
        h: LINE_HEIGHT,
      },
      wordKeys,
      isCentered: centered || undefined,
      isSurahHeader: isHeader || undefined,
      isBismillah: isBismillah || undefined,
    });
  }

  for (const span of verseSpans) {
    const boxes = span.wordKeys
      .map((k) => words[k]?.bbox)
      .filter((b): b is NonNullable<typeof b> => Boolean(b));
    if (!boxes.length) continue;
    const minX = Math.min(...boxes.map((b) => b.x));
    const minY = Math.min(...boxes.map((b) => b.y));
    const maxX = Math.max(...boxes.map((b) => b.x + b.w));
    const maxY = Math.max(...boxes.map((b) => b.y + b.h));
    span.bboxes = [{ x: minX, y: minY, w: maxX - minX, h: maxY - minY }];
  }

  const surahStarts: Array<{ surah: number; line: number }> = [];
  for (const v of verseSpans) {
    if (v.ayah === 1) {
      const first = words[v.wordKeys[0]!];
      if (first) surahStarts.push({ surah: v.surah, line: first.line });
    }
  }

  return {
    version: 1,
    page,
    metrics: {
      width: LOGICAL_W,
      height: LOGICAL_H,
      contentInsets: { ...INSET },
      lineCount: Math.max(lines.length, 15),
      mushaf: 'madinah_v2',
      script: 'uthmani',
      fontModel: 'unicode_bbox',
    },
    lines,
    words,
    verses: verseSpans,
    surahStarts: surahStarts.length ? surahStarts : undefined,
    meta: {
      source: 'quran-foundation-api-v4',
      licenseSpdx: 'LicenseRef-QuranFoundation-ToS',
      licenseNotice:
        'Derived from Quran.com API. Not redistributable as MIT. See QF terms.',
      generatedAt: new Date().toISOString(),
    },
  };
}
