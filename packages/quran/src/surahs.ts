import { SURAH_INDEX } from './surah-index.js';
import type { QuranSurah } from './types.js';

const SURAHS: QuranSurah[] = SURAH_INDEX.map(([number, slug, nameLatin, nameArabic, totalAyahs, revelation]) => ({
  id: number,
  number,
  slug,
  name_arabic: nameArabic,
  name_latin: nameLatin,
  total_ayahs: totalAyahs,
  revelation,
}));

const byId = new Map<number, QuranSurah>();
const bySlug = new Map<string, QuranSurah>();
for (const surah of SURAHS) {
  byId.set(surah.id, surah);
  bySlug.set(surah.slug, surah);
}

/** Common alternative spellings that should still resolve. */
const ALIASES: Record<string, string> = {
  'ash-sharh': 'al-insyirah',
  'alam-nasyrah': 'al-insyirah',
  'al-fatiha': 'al-fatihah',
  'al-baqara': 'al-baqarah',
  "ali-'imran": 'ali-imran',
};

/** All 114 surahs, from the bundled index (no translation or description). */
export function getSurahs(): QuranSurah[] {
  return SURAHS;
}

/** One surah by number, slug, or a known alias such as `ash-sharh`. */
export function getSurah(value: number | string): QuranSurah | undefined {
  if (typeof value === 'number') return byId.get(value);
  const key = value.toLowerCase().trim();
  const direct = bySlug.get(key);
  if (direct) return direct;
  const alias = ALIASES[key];
  return alias ? bySlug.get(alias) : undefined;
}

/** 6236. */
export function totalAyahs(): number {
  return SURAHS.reduce((sum, surah) => sum + surah.total_ayahs, 0);
}

/** Global ayah number (1..6236) of the first ayah of a surah, minus one. */
export function ayahOffset(surahId: number): number {
  let offset = 0;
  for (const surah of SURAHS) {
    if (surah.id >= surahId) break;
    offset += surah.total_ayahs;
  }
  return offset;
}
