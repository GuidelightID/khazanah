import { getSurah } from './surahs.js';
import type { PassageSelection } from './types.js';

/** "QS. Al-'Alaq: 1–10" for a range, "QS. Al-'Alaq: 7" for a single ayah. */
export function passageLabel(passage: PassageSelection): string {
  const surah = getSurah(passage.surah_id);
  const name = surah ? surah.name_latin : `Surah ${passage.surah_id}`;
  if (passage.start_ayah === passage.end_ayah) return `QS. ${name}: ${passage.start_ayah}`;
  return `QS. ${name}: ${passage.start_ayah}–${passage.end_ayah}`;
}

/** Folds case, diacritics, curly apostrophes, and dash variants. */
export function normalizeQuranSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’‘`]/g, '')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Accepts "1", "1-10", "1–10" (en dash), and "1 - 10".
 * Returns null when the range falls outside the surah.
 */
export function parseAyahRange(
  value: string,
  totalAyahs: number,
): { start_ayah: number; end_ayah: number } | null {
  const cleaned = value.trim().replace(/[–—]/g, '-').replace(/\s+/g, '');

  const single = /^(\d{1,3})$/.exec(cleaned);
  if (single?.[1]) {
    const ayah = Number(single[1]);
    if (ayah >= 1 && ayah <= totalAyahs) return { start_ayah: ayah, end_ayah: ayah };
    return null;
  }

  const range = /^(\d{1,3})-(\d{1,3})$/.exec(cleaned);
  if (range?.[1] && range[2]) {
    const start = Number(range[1]);
    const end = Number(range[2]);
    if (start >= 1 && end >= start && end <= totalAyahs) {
      return { start_ayah: start, end_ayah: end };
    }
  }
  return null;
}

/**
 * equran.id's surah description carries light HTML (`<i>`, `<br>`). The text is
 * used as plain prose, so tags are stripped and basic entities decoded — no
 * HTML ever needs to be injected into a page.
 */
export function plainSurahDescription(html: string | undefined): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
