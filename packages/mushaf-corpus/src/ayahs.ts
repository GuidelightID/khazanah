/**
 * Entry terpisah untuk korpus ayat lengkap (~3,9 MB).
 *
 * Sengaja TIDAK diekspor dari `index.ts`: entry utama dipakai juga di sisi
 * klien, dan menariknya ke sana akan mengirim seluruh mushaf ke browser.
 * Impor dari `@guidelightid/mushaf-corpus/ayahs` hanya di kode yang berjalan di
 * server.
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
 * Seluruh ayat sebuah juz, berurutan dan menyeberangi batas surah.
 * Batas juz mengikuti Standar Mushaf Indonesia (lihat `juz.ts`).
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
