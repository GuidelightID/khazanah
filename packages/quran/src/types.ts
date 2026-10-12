export interface QuranSurah {
  id: number;
  number: number;
  slug: string;
  name_arabic: string;
  name_latin: string;
  total_ayahs: number;
  /** "Mekah" | "Madinah". */
  revelation: string;
  /** Meaning of the surah name. Filled in by a data source (e.g. EQuran.id `arti`). */
  name_translation?: string;
  /** Surah description; may contain light HTML. Filled in by a data source. */
  description?: string;
}

export interface QuranAyah {
  /** Global ayah number, 1..6236. */
  id: number;
  surah_id: number;
  ayah_number: number;
  arabic_text: string;
  transliteration: string;
  translation: string;
  /** Juz per the Standar Mushaf Indonesia (see `juzOfAyah`). */
  juz: number;
}

export interface PassageSelection {
  surah_id: number;
  start_ayah: number;
  end_ayah: number;
}
