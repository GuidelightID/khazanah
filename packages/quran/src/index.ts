/**
 * Client-safe entry: the surah catalog (~87 KB), the juz table, types, and
 * passage helpers. The full verse text lives in
 * `@guidelightid/mushaf-corpus/ayahs` and is kept separate so it never reaches
 * the browser.
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
