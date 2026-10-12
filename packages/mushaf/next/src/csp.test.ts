import { describe, expect, it } from 'vitest';
import { formatCspFragment, mushafCspDirectives } from './csp.js';

describe('mushafCspDirectives', () => {
  it('includes self and optional google fonts', () => {
    const d = mushafCspDirectives({
      connectSrc: ['https://api.quran.com'],
    });
    expect(d['font-src']).toContain("'self'");
    expect(d['font-src']).toContain('https://fonts.gstatic.com');
    expect(d['connect-src']).toContain('https://api.quran.com');
    expect(formatCspFragment(d)).toContain("font-src 'self'");
  });

  it('can disable google fonts', () => {
    const d = mushafCspDirectives({ googleFonts: false });
    expect(d['font-src']).not.toContain('https://fonts.gstatic.com');
  });
});
