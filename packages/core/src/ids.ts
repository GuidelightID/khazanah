/** Canonical verse key "12:86" */
export type VerseKey = `${number}:${number}`;

/** Word key "12:86:3" (surah:ayah:word) */
export type WordKey = `${number}:${number}:${number}`;

/** Branded numbers for internal APIs; public React props use plain number + validators */
export type SurahNumber = number & { readonly __brand: 'SurahNumber' };
export type AyahNumber = number & { readonly __brand: 'AyahNumber' };
export type PageNumber = number & { readonly __brand: 'PageNumber' };

export type WordId = string;

const VERSE_KEY_RE = /^([1-9]\d{0,2}):([1-9]\d{0,2})$/;
const WORD_KEY_RE = /^([1-9]\d{0,2}):([1-9]\d{0,2}):([1-9]\d{0,2})$/;

export function asPageNumber(n: number): PageNumber {
  assertPageNumber(n);
  return n as PageNumber;
}

export function asSurahNumber(n: number): SurahNumber {
  if (!Number.isInteger(n) || n < 1 || n > 114) {
    throw new RangeError(`Invalid surah number: ${n}`);
  }
  return n as SurahNumber;
}

export function parseVerseKey(s: string): VerseKey {
  const m = VERSE_KEY_RE.exec(s.trim());
  if (!m) {
    throw new SyntaxError(`Invalid verse key: ${s}`);
  }
  const surah = Number(m[1]);
  const ayah = Number(m[2]);
  if (surah < 1 || surah > 114 || ayah < 1) {
    throw new RangeError(`Out-of-range verse key: ${s}`);
  }
  return `${surah}:${ayah}` as VerseKey;
}

export function parseWordKey(s: string): WordKey {
  const m = WORD_KEY_RE.exec(s.trim());
  if (!m) {
    throw new SyntaxError(`Invalid word key: ${s}`);
  }
  const surah = Number(m[1]);
  const ayah = Number(m[2]);
  const word = Number(m[3]);
  if (surah < 1 || surah > 114 || ayah < 1 || word < 1) {
    throw new RangeError(`Out-of-range word key: ${s}`);
  }
  return `${surah}:${ayah}:${word}` as WordKey;
}

export function verseKeyOf(surah: number, ayah: number): VerseKey {
  return parseVerseKey(`${surah}:${ayah}`);
}

export function wordKeyOf(surah: number, ayah: number, word: number): WordKey {
  return parseWordKey(`${surah}:${ayah}:${word}`);
}

export function assertPageNumber(
  n: number,
  pageCount = 604,
): asserts n is PageNumber {
  if (!Number.isInteger(n) || n < 1 || n > pageCount) {
    throw new RangeError(`Invalid page number: ${n} (expected 1–${pageCount})`);
  }
}

export function splitVerseKey(key: VerseKey): { surah: number; ayah: number } {
  const [surah, ayah] = key.split(':').map(Number) as [number, number];
  return { surah, ayah };
}

export function splitWordKey(key: WordKey): {
  surah: number;
  ayah: number;
  word: number;
} {
  const [surah, ayah, word] = key.split(':').map(Number) as [number, number, number];
  return { surah, ayah, word };
}
