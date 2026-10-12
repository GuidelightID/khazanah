import { describe, expect, it } from 'vitest';
import { normalizeArabic } from './normalize.js';

describe('normalizeArabic', () => {
  it('strips tashkeel', () => {
    expect(normalizeArabic('بِسْمِ')).toBe('بسم');
  });

  it('unifies alef forms', () => {
    expect(normalizeArabic('أإآ')).toBe('ااا');
  });

  it('unifies alif maqsura to ya', () => {
    expect(normalizeArabic('على')).toBe('علي');
  });
});
