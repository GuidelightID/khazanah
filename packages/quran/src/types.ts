export interface QuranSurah {
  id: number;
  number: number;
  slug: string;
  name_arabic: string;
  name_latin: string;
  name_translation: string;
  /** "Mekah" | "Madinah", from equran.id's `tempatTurun`. */
  revelation?: string;
  /** equran.id's surah description; contains light HTML. */
  description?: string;
  total_ayahs: number;
}

export interface QuranAyah {
  id: number;
  surah_id: number;
  ayah_number: number;
  arabic_text: string;
  transliteration: string;
  translation: string;
  /**
   * equran.id's own juz number, which follows the Madinah division. For juz
   * navigation use `juzOfAyah()` instead: it applies the Standar Mushaf
   * Indonesia boundaries, which differ at 13 juz.
   */
  juz: number;
  page: number;
}

export interface PassageSelection {
  surah_id: number;
  start_ayah: number;
  end_ayah: number;
}
