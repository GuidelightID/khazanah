/**
 * Load verse text, translation and surah details from EQuran.id through its
 * official SDK (`npm install equran`), mapped to this package's types.
 *
 * This package does not bundle that content: it is fetched by your app from
 * EQuran.id, under EQuran.id's terms (https://equran.id/terms). Show the
 * attribution "Teks Al-Qur'an, terjemahan, dan transliterasi: Kementerian Agama
 * RI, melalui EQuran.id" wherever you display it.
 *
 * ```ts
 * import { EQuran } from 'equran';
 * import { createEquranSource } from '@guidelight.id/quran/equran';
 *
 * const quran = createEquranSource(new EQuran());
 * const ayahs = await quran.getPassageAyahs({ surah_id: 2, start_ayah: 255, end_ayah: 255 });
 * ```
 */
import { getJuz, juzOfAyah } from './juz.js';
import { ayahOffset, getSurah, getSurahs } from './surahs.js';
import type { PassageSelection, QuranAyah, QuranSurah } from './types.js';

/** The parts of the `equran` SDK's `EQuran` client this module uses. */
export interface EquranClient {
  getAllSurat(): Promise<EquranSurat[]>;
  getSurat(nomor: number): Promise<EquranSuratDetail>;
}

export interface EquranSurat {
  nomor: number;
  arti: string;
  deskripsi: string;
}

export interface EquranAyat {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
}

export interface EquranSuratDetail extends EquranSurat {
  ayat: EquranAyat[];
}

export interface QuranSource {
  /** All surahs, with `name_translation` and `description` from EQuran.id. */
  getSurahs(): Promise<QuranSurah[]>;
  getSurahAyahs(surahId: number): Promise<QuranAyah[]>;
  /** Ayahs in a range; `[]` when the range is invalid. */
  getPassageAyahs(passage: PassageSelection): Promise<QuranAyah[]>;
  /** One juz (Standar Mushaf Indonesia), across surah boundaries. */
  getJuzAyahs(juzNumber: number): Promise<QuranAyah[]>;
}

export function createEquranSource(client: EquranClient): QuranSource {
  const ayahCache = new Map<number, Promise<QuranAyah[]>>();
  let surahsCache: Promise<QuranSurah[]> | undefined;

  function getSurahAyahs(surahId: number): Promise<QuranAyah[]> {
    if (!getSurah(surahId)) return Promise.resolve([]);
    let pending = ayahCache.get(surahId);
    if (!pending) {
      const offset = ayahOffset(surahId);
      pending = client.getSurat(surahId).then((detail) =>
        detail.ayat
          .map((ayat) => ({
            id: offset + ayat.nomorAyat,
            surah_id: surahId,
            ayah_number: ayat.nomorAyat,
            arabic_text: ayat.teksArab,
            transliteration: ayat.teksLatin,
            translation: ayat.teksIndonesia,
            juz: juzOfAyah(surahId, ayat.nomorAyat),
          }))
          .sort((a, b) => a.ayah_number - b.ayah_number),
      );
      // Do not cache failures: the next call retries.
      pending.catch(() => ayahCache.delete(surahId));
      ayahCache.set(surahId, pending);
    }
    return pending;
  }

  async function getPassageAyahs(passage: PassageSelection): Promise<QuranAyah[]> {
    const surah = getSurah(passage.surah_id);
    if (
      !surah ||
      passage.start_ayah < 1 ||
      passage.end_ayah < passage.start_ayah ||
      passage.end_ayah > surah.total_ayahs
    ) {
      return [];
    }
    const ayahs = await getSurahAyahs(passage.surah_id);
    return ayahs.filter(
      (ayah) => ayah.ayah_number >= passage.start_ayah && ayah.ayah_number <= passage.end_ayah,
    );
  }

  return {
    getSurahs() {
      if (!surahsCache) {
        surahsCache = client.getAllSurat().then((list) => {
          const extra = new Map(list.map((s) => [s.nomor, s]));
          return getSurahs().map((surah) => {
            const fromEquran = extra.get(surah.id);
            return fromEquran
              ? { ...surah, name_translation: fromEquran.arti, description: fromEquran.deskripsi }
              : surah;
          });
        });
        surahsCache.catch(() => {
          surahsCache = undefined;
        });
      }
      return surahsCache;
    },
    getSurahAyahs,
    getPassageAyahs,
    async getJuzAyahs(juzNumber) {
      const juz = getJuz(juzNumber);
      if (!juz) return [];
      const parts = await Promise.all(
        juz.ranges.map((range) =>
          getPassageAyahs({
            surah_id: range.surah_id,
            start_ayah: range.start_ayah,
            end_ayah: range.end_ayah,
          }),
        ),
      );
      return parts.flat();
    },
  };
}
