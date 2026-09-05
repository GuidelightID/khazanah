export interface QuranSurah {
  id: number;
  number: number;
  slug: string;
  name_arabic: string;
  name_latin: string;
  name_translation: string;
  /** "Mekah" | "Madinah" — dari `tempatTurun` equran.id. */
  revelation?: string;
  /** Deskripsi surah equran.id; memuat HTML sederhana. */
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
   * Nomor juz bawaan korpus equran.id, yang mengikuti pembagian mushaf
   * Madinah. Untuk penelusuran per juz gunakan `juzOfAyah()`, yang memakai
   * batas Standar Mushaf Indonesia dan berbeda di 13 juz.
   */
  juz: number;
  page: number;
}

export interface PassageSelection {
  surah_id: number;
  start_ayah: number;
  end_ayah: number;
}
