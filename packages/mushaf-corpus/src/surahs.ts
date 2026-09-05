import surahsData from './data/surahs.json' with { type: 'json' };
import type { QuranSurah } from './types.js';

const SURAHS = surahsData as QuranSurah[];

const byId = new Map<number, QuranSurah>();
const bySlug = new Map<string, QuranSurah>();
for (const surah of SURAHS) {
  byId.set(surah.id, surah);
  bySlug.set(surah.slug, surah);
}

/** Nama alternatif yang mungkin diketik atau ditautkan; slug kanonik tetap. */
const ALIASES: Record<string, string> = {
  'ash-sharh': 'al-insyirah',
  'alam-nasyrah': 'al-insyirah',
  'al-fatiha': 'al-fatihah',
  'al-baqara': 'al-baqarah',
  "ali-'imran": 'ali-imran',
};

export function getSurahs(): QuranSurah[] {
  return SURAHS;
}

export function getSurah(value: number | string): QuranSurah | undefined {
  if (typeof value === 'number') return byId.get(value);
  const key = value.toLowerCase().trim();
  const direct = bySlug.get(key);
  if (direct) return direct;
  const alias = ALIASES[key];
  return alias ? bySlug.get(alias) : undefined;
}

/** Total ayat seluruh mushaf; 6236 pada korpus ini. */
export function totalAyahs(): number {
  return SURAHS.reduce((sum, surah) => sum + surah.total_ayahs, 0);
}
