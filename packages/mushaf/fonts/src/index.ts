/** CSS font-family stack for open unicode_bbox demos */
export const MUSHAF_OPEN_ARABIC_STACK =
  'Amiri, "Scheherazade New", "Noto Naskh Arabic", "Times New Roman", serif';

/** Google Fonts CSS URL for Amiri (demo). Prefer self-host in production. */
export function googleFontsCssUrl(
  family = 'Amiri:wght@400;700',
): string {
  return `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}&display=swap`;
}

export const FONTS_NOTICE =
  'Restricted KFGQPC/QPC page fonts are not shipped in @guidelightid/mushaf-fonts. See NOTICE.md and LICENSES/matrix.md.';
