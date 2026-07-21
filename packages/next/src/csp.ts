export interface MushafCspOptions {
  /** Extra connect-src hosts (e.g. Quran Foundation API) */
  connectSrc?: string[];
  /** Extra font-src hosts */
  fontSrc?: string[];
  /** Allow Google Fonts (default true for demos) */
  googleFonts?: boolean;
}

/**
 * Suggested CSP fragments for Next headers / middleware.
 * Apps should merge with their own policy.
 */
export function mushafCspDirectives(opts: MushafCspOptions = {}): {
  'font-src': string[];
  'connect-src': string[];
  'style-src': string[];
} {
  const google = opts.googleFonts !== false;
  return {
    'font-src': [
      "'self'",
      'data:',
      ...(google ? ['https://fonts.gstatic.com'] : []),
      ...(opts.fontSrc ?? []),
    ],
    'connect-src': ["'self'", ...(opts.connectSrc ?? [])],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      ...(google ? ['https://fonts.googleapis.com'] : []),
    ],
  };
}

/** Serialize directive map to a CSP header fragment string */
export function formatCspFragment(
  directives: Record<string, string[]>,
): string {
  return Object.entries(directives)
    .map(([k, v]) => `${k} ${v.join(' ')}`)
    .join('; ');
}
