/**
 * Entry aman untuk klien: katalog surah (~87 KB), peta juz, tipe, dan utilitas
 * rentang ayat. Teks ayat lengkap ada di `@guidelightid/mushaf-corpus/ayahs` dan
 * sengaja dipisah supaya tidak ikut terkirim ke browser.
 */
export type { PassageSelection, QuranAyah, QuranSurah } from './types.js';
export { getSurah, getSurahs, totalAyahs } from './surahs.js';
export {
  normalizeQuranSearch,
  parseAyahRange,
  passageLabel,
  plainSurahDescription,
} from './passage.js';
export type { JuzInfo, JuzSurahRange } from './juz.js';
export {
  getJuz,
  getJuzList,
  juzCoverageTotal,
  juzOfAyah,
  juzOfSurah,
} from './juz.js';
