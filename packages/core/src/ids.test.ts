import { describe, expect, it } from 'vitest';
import {
  assertPageNumber,
  parseVerseKey,
  parseWordKey,
  verseKeyOf,
  wordKeyOf,
} from './ids.js';

describe('ids', () => {
  it('parses verse and word keys', () => {
    expect(parseVerseKey('12:86')).toBe('12:86');
    expect(parseWordKey('12:86:3')).toBe('12:86:3');
    expect(verseKeyOf(1, 1)).toBe('1:1');
    expect(wordKeyOf(1, 1, 1)).toBe('1:1:1');
  });

  it('rejects invalid keys', () => {
    expect(() => parseVerseKey('0:1')).toThrow();
    expect(() => parseVerseKey('abc')).toThrow();
    expect(() => parseWordKey('1:1')).toThrow();
  });

  it('validates page numbers', () => {
    expect(() => assertPageNumber(1)).not.toThrow();
    expect(() => assertPageNumber(604)).not.toThrow();
    expect(() => assertPageNumber(0)).toThrow();
    expect(() => assertPageNumber(605)).toThrow();
  });
});
