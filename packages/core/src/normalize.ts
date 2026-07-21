export interface NormalizeArabicOptions {
  /** Strip tashkeel / combining marks (default true) */
  stripTashkeel?: boolean;
  /** Unify alef forms to ا (default true) */
  unifyAlef?: boolean;
  /** ى → ي (default true) */
  unifyYa?: boolean;
  /** ة → ه (default false — often desired for search, optional) */
  taMarbutaToHa?: boolean;
  /** Remove tatweel ـ (default true) */
  stripTatweel?: boolean;
}

const TASHKEEL_RE = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const TATWEEL = /\u0640/g;
const ALEF_VARIANTS = /[\u0622\u0623\u0625\u0671]/g; // آ أ إ ٱ

/**
 * Arabic normalization for search and fuzzy matching.
 * Does not change display text on the page surface.
 */
export function normalizeArabic(
  input: string,
  opts: NormalizeArabicOptions = {},
): string {
  const {
    stripTashkeel = true,
    unifyAlef = true,
    unifyYa = true,
    taMarbutaToHa = false,
    stripTatweel = true,
  } = opts;

  let s = input.normalize('NFKC');
  if (stripTatweel) s = s.replace(TATWEEL, '');
  if (stripTashkeel) s = s.replace(TASHKEEL_RE, '');
  if (unifyAlef) s = s.replace(ALEF_VARIANTS, '\u0627');
  if (unifyYa) s = s.replace(/\u0649/g, '\u064A'); // ى → ي
  if (taMarbutaToHa) s = s.replace(/\u0629/g, '\u0647'); // ة → ه
  return s.trim();
}
