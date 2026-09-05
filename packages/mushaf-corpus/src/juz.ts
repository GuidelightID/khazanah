import { getSurah } from './surahs.js';
import type { PassageSelection } from './types.js';

/**
 * Juz boundaries follow the **Standar Mushaf Indonesia** (Kemenag), not the
 * Madinah division. The two differ at 13 juz — juz 23 opens at Yasin 22 in the
 * Indonesian mushaf and at Yasin 28 in the Madinah one. Each ayah's own `juz`
 * field in the equran.id corpus follows the Madinah division, so this table is
 * the source of truth instead, matching the printed Indonesian mushaf.
 */
const JUZ_BOUNDS: Record<number, { start: [number, number]; end: [number, number] }> = {
  1: { start: [1, 1], end: [2, 141] },
  2: { start: [2, 142], end: [2, 252] },
  3: { start: [2, 253], end: [3, 91] },
  4: { start: [3, 92], end: [4, 23] },
  5: { start: [4, 24], end: [4, 147] },
  6: { start: [4, 148], end: [5, 82] },
  7: { start: [5, 83], end: [6, 110] },
  8: { start: [6, 111], end: [7, 87] },
  9: { start: [7, 88], end: [8, 40] },
  10: { start: [8, 41], end: [9, 93] },
  11: { start: [9, 94], end: [11, 5] },
  12: { start: [11, 6], end: [12, 52] },
  13: { start: [12, 53], end: [15, 1] },
  14: { start: [15, 2], end: [16, 128] },
  15: { start: [17, 1], end: [18, 74] },
  16: { start: [18, 75], end: [20, 135] },
  17: { start: [21, 1], end: [22, 78] },
  18: { start: [23, 1], end: [25, 20] },
  19: { start: [25, 21], end: [27, 59] },
  20: { start: [27, 60], end: [29, 44] },
  21: { start: [29, 45], end: [33, 30] },
  22: { start: [33, 31], end: [36, 21] },
  23: { start: [36, 22], end: [39, 31] },
  24: { start: [39, 32], end: [41, 46] },
  25: { start: [41, 47], end: [45, 37] },
  26: { start: [46, 1], end: [51, 30] },
  27: { start: [51, 31], end: [57, 29] },
  28: { start: [58, 1], end: [66, 12] },
  29: { start: [67, 1], end: [77, 50] },
  30: { start: [78, 1], end: [114, 6] },
};

/** Juz names follow their opening words, as printed Indonesian mushafs do. */
const JUZ_NAMES: Record<number, string> = {
  1: 'Alif Lam Mim',
  2: 'Sayaqul',
  3: 'Tilkar Rusul',
  4: 'Lan Tanalul Birra',
  5: 'Wal Muhsanat',
  6: 'La Yuhibbullah',
  7: "Wa Iza Sami'u",
  8: 'Wa Lau Annana',
  9: "Qalal Mala'u",
  10: "Wa'lamu",
  11: "Ya'tazirun",
  12: 'Wa Ma Min Dabbah',
  13: "Wa Ma Ubarri'u",
  14: 'Rubama',
  15: 'Subhanalladzi',
  16: 'Qala Alam',
  17: 'Iqtaraba',
  18: 'Qad Aflaha',
  19: 'Wa Qalalladzina',
  20: "A'man Khalaq",
  21: 'Utlu Ma Uhiya',
  22: 'Wa Manyaqnut',
  23: 'Wa Mali',
  24: 'Faman Azlam',
  25: 'Ilaihi Yuraddu',
  26: 'Ha Mim',
  27: 'Qala Fama Khatbukum',
  28: "Qad Sami'allah",
  29: 'Tabarakalladzi',
  30: 'Amma',
};

export interface JuzSurahRange extends PassageSelection {
  surah_slug: string;
  surah_name: string;
  /** True when the juz covers this surah from its first ayah to its last. */
  complete: boolean;
}

export interface JuzInfo {
  number: number;
  name: string;
  start: { surah_id: number; ayah_number: number };
  end: { surah_id: number; ayah_number: number };
  ranges: JuzSurahRange[];
  total_ayahs: number;
  /** Compact label from the opening surah to the closing one. */
  span: string;
}

function buildJuz(number: number): JuzInfo {
  const bounds = JUZ_BOUNDS[number];
  if (!bounds) throw new Error(`Juz ${number} is absent from the boundary table.`);
  const [startSurah, startAyah] = bounds.start;
  const [endSurah, endAyah] = bounds.end;

  const ranges: JuzSurahRange[] = [];
  for (let surahId = startSurah; surahId <= endSurah; surahId++) {
    const surah = getSurah(surahId);
    if (!surah) continue;
    const start = surahId === startSurah ? startAyah : 1;
    const end = surahId === endSurah ? endAyah : surah.total_ayahs;
    ranges.push({
      surah_id: surahId,
      start_ayah: start,
      end_ayah: end,
      surah_slug: surah.slug,
      surah_name: surah.name_latin,
      complete: start === 1 && end === surah.total_ayahs,
    });
  }

  const total = ranges.reduce((sum, r) => sum + (r.end_ayah - r.start_ayah + 1), 0);
  const first = ranges[0];
  const last = ranges[ranges.length - 1];
  if (!first || !last) throw new Error(`Juz ${number} covers no surah at all.`);

  return {
    number,
    name: JUZ_NAMES[number] ?? `Juz ${number}`,
    start: { surah_id: startSurah, ayah_number: startAyah },
    end: { surah_id: endSurah, ayah_number: endAyah },
    ranges,
    total_ayahs: total,
    span:
      first.surah_id === last.surah_id
        ? `${first.surah_name} ${first.start_ayah}–${last.end_ayah}`
        : `${first.surah_name} ${first.start_ayah} – ${last.surah_name} ${last.end_ayah}`,
  };
}

const JUZ_LIST: JuzInfo[] = Array.from({ length: 30 }, (_, index) => buildJuz(index + 1));

export function getJuzList(): JuzInfo[] {
  return JUZ_LIST;
}

export function getJuz(number: number): JuzInfo | undefined {
  if (!Number.isInteger(number) || number < 1 || number > 30) return undefined;
  return JUZ_LIST[number - 1];
}

/** The juz an ayah belongs to, per the Standar Mushaf Indonesia. */
export function juzOfAyah(surahId: number, ayahNumber: number): number {
  for (const juz of JUZ_LIST) {
    const afterStart =
      surahId > juz.start.surah_id ||
      (surahId === juz.start.surah_id && ayahNumber >= juz.start.ayah_number);
    const beforeEnd =
      surahId < juz.end.surah_id ||
      (surahId === juz.end.surah_id && ayahNumber <= juz.end.ayah_number);
    if (afterStart && beforeEnd) return juz.number;
  }
  return 1;
}

/** The juz a surah spans, for compact labels on cards. */
export function juzOfSurah(surahId: number): number[] {
  const surah = getSurah(surahId);
  if (!surah) return [];
  const first = juzOfAyah(surahId, 1);
  const last = juzOfAyah(surahId, surah.total_ayahs);
  const list: number[] = [];
  for (let n = first; n <= last; n++) list.push(n);
  return list;
}

/** Ayahs covered by all 30 juz; must equal the mushaf total. */
export function juzCoverageTotal(): number {
  return JUZ_LIST.reduce((sum, juz) => sum + juz.total_ayahs, 0);
}
