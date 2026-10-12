import type { CSSProperties, ReactElement } from 'react';

export interface MushafFontLinksProps {
  /**
   * Google Fonts family for unicode_bbox demos.
   * Production Madinah page fonts should be self-hosted after license clearance.
   */
  googleFamily?: string;
  /** Preload self-hosted woff2 URLs (open or app-pulled fonts) */
  preloadWoff2?: string[];
  /** Additional CSS class for consumers using next/font */
  className?: string;
  style?: CSSProperties;
}

/**
 * Drop-in head links for Arabic reading fonts.
 * Prefer self-hosted WOFF2 for production (ADR-013 dual distribution).
 */
export function MushafFontLinks({
  googleFamily = 'Amiri:wght@400;700',
  preloadWoff2 = [],
}: MushafFontLinksProps): ReactElement {
  const href = `https://fonts.googleapis.com/css2?family=${googleFamily.replace(/ /g, '+')}&display=swap`;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={href} />
      {preloadWoff2.map((url) => (
        <link key={url} rel="preload" href={url} as="font" type="font/woff2" crossOrigin="anonymous" />
      ))}
    </>
  );
}

/** Default CSS font-family stack for unicode_bbox mode */
export const MUSHAF_ARABIC_FONT_STACK =
  'Amiri, "Scheherazade New", "Noto Naskh Arabic", "Times New Roman", serif';
