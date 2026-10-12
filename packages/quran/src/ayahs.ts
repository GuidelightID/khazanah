/**
 * Separate entry for the full verse corpus (~3.9 MB).
 *
 * Deliberately NOT re-exported from `index.ts`: the main entry is used on the
 * client too, and pulling this in there would ship the whole mushaf to the
 * browser. Import `@guidelight/quran/ayahs` only from server code.
 */
import ayahsData from './data/ayahs.json' with { type: 'json' };
import { getJuz } from './juz.js';
import { getSurah } from './surahs.js';
import type { PassageSelection, QuranAyah } from './types.js';

const AYAHS = ayahsData as QuranAyah[];

const bySurah = new Map<number, QuranAyah[]>();
for (const ayah of AYAHS) {
  const list = bySurah.get(ayah.surah_id);
  if (list) list.push(ayah);
  else bySurah.set(ayah.surah_id, [ayah]);
}
for (const list of bySurah.values()) list.sort((a, b) => a.ayah_number - b.ayah_number);

export function getSurahAyahs(surahId: number): QuranAyah[] {
  return bySurah.get(surahId) ?? [];
}

export function getPassageAyahs(passage: PassageSelection): QuranAyah[] {
  const surah = getSurah(passage.surah_id);
  if (!surah) return [];
  if (
    passage.start_ayah < 1 ||
    passage.end_ayah < passage.start_ayah ||
    passage.end_ayah > surah.total_ayahs
  ) {
    return [];
  }
  return getSurahAyahs(passage.surah_id).filter(
    (ayah) => ayah.ayah_number >= passage.start_ayah && ayah.ayah_number <= passage.end_ayah,
  );
}

/**
 * Every ayah in a juz, in order and across surah boundaries.
 * Boundaries follow the Standar Mushaf Indonesia (see `juz.ts`).
 */
export function getJuzAyahs(juzNumber: number): QuranAyah[] {
  const juz = getJuz(juzNumber);
  if (!juz) return [];
  return juz.ranges.flatMap((range) =>
    getPassageAyahs({
      surah_id: range.surah_id,
      start_ayah: range.start_ayah,
      end_ayah: range.end_ayah,
    }),
  );
}

export function getCorpusStats(): { surahs: number; ayahs: number } {
  return { surahs: bySurah.size, ayahs: AYAHS.length };
}
