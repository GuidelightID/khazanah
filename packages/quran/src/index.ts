/**
 * Quran structure and helpers: the 114-surah index, the Standar Mushaf
 * Indonesia juz table, passage parsing and labels, search normalization.
 * No verse text is bundled; load it with `@guidelight.id/quran/equran` (or any
 * source that produces `QuranAyah`).
 */
export type { PassageSelection, QuranAyah, QuranSurah } from './types.js';
export { ayahOffset, getSurah, getSurahs, totalAyahs } from './surahs.js';
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
