import { describe, expect, it } from 'vitest';
import {
  estimateWordWidth,
  layoutLineRtl,
  isBismillahText,
} from './layout-unicode.js';

describe('estimateWordWidth', () => {
  it('gives longer words more width than short ones', () => {
    const short = estimateWordWidth('بِسْمِ');
    const long = estimateWordWidth('ٱلرَّحْمَٰنِ');
    expect(long).toBeGreaterThan(short);
  });

  it('gives end markers a minimum width and scales with content', () => {
    const one = estimateWordWidth('1', 'end_marker');
    const two = estimateWordWidth('12', 'end_marker');
    expect(one).toBeGreaterThanOrEqual(42);
    expect(two).toBeGreaterThan(one);
  });

  it('ignores harakat for packing weight', () => {
    const base = estimateWordWidth('بسم');
    const withMarks = estimateWordWidth('بِسْمِ');
    expect(Math.abs(base - withMarks)).toBeLessThan(8);
  });
});

describe('layoutLineRtl', () => {
  const base = {
    contentWidth: 880,
    y: 100,
    lineHeight: 92,
    contentLeft: 60,
  };

  it('places first word rightmost (RTL)', () => {
    const { bboxes } = layoutLineRtl(
      [{ text: 'AAA' }, { text: 'B' }, { text: 'CC' }],
      base,
    );
    expect(bboxes).toHaveLength(3);
    // index 0 further right than index 2
    expect(bboxes[0]!.x).toBeGreaterThan(bboxes[2]!.x);
  });

  it('uses proportional widths not equal slots', () => {
    const { bboxes } = layoutLineRtl(
      [
        { text: 'بِسْمِ' },
        { text: 'ٱللَّهِ' },
        { text: 'ٱلرَّحْمَٰنِ' },
        { text: 'ٱلرَّحِيمِ', charType: 'end_marker' },
      ],
      base,
    );
    const widths = bboxes.map((b) => b.w);
    const unique = new Set(widths.map((w) => Math.round(w)));
    expect(unique.size).toBeGreaterThan(1);
  });

  it('justifies full lines within content band', () => {
    const items = Array.from({ length: 8 }, (_, i) => ({
      text: i % 2 === 0 ? 'كلمة' : 'طويلةجداً',
    }));
    const { bboxes, centered } = layoutLineRtl(items, base);
    expect(centered).toBe(false);
    const minX = Math.min(...bboxes.map((b) => b.x));
    const maxX = Math.max(...bboxes.map((b) => b.x + b.w));
    expect(minX).toBeGreaterThanOrEqual(base.contentLeft - 0.5);
    expect(maxX).toBeLessThanOrEqual(
      base.contentLeft + base.contentWidth + 0.5,
    );
    // near full width when many words
    expect(maxX - minX).toBeGreaterThan(base.contentWidth * 0.85);
  });

  it('centers short lines', () => {
    const { bboxes, centered } = layoutLineRtl(
      [{ text: 'الحمد' }, { text: 'لله' }],
      base,
    );
    expect(centered).toBe(true);
    const minX = Math.min(...bboxes.map((b) => b.x));
    const maxX = Math.max(...bboxes.map((b) => b.x + b.w));
    const mid = (minX + maxX) / 2;
    const contentMid = base.contentLeft + base.contentWidth / 2;
    expect(Math.abs(mid - contentMid)).toBeLessThan(5);
  });

  it('force-centers bismillah-style lines', () => {
    const { centered } = layoutLineRtl(
      [
        { text: 'بِسْمِ' },
        { text: 'ٱللَّهِ' },
        { text: 'ٱلرَّحْمَٰنِ' },
        { text: 'ٱلرَّحِيمِ' },
      ],
      { ...base, centered: true },
    );
    expect(centered).toBe(true);
  });

  it('clamps overflow lines into content width', () => {
    const items = Array.from({ length: 20 }, () => ({
      text: 'كلمةطويلةجداًللغاية',
    }));
    const { bboxes } = layoutLineRtl(items, base);
    const minX = Math.min(...bboxes.map((b) => b.x));
    const maxX = Math.max(...bboxes.map((b) => b.x + b.w));
    expect(minX).toBeGreaterThanOrEqual(base.contentLeft - 1);
    expect(maxX).toBeLessThanOrEqual(
      base.contentLeft + base.contentWidth + 1,
    );
  });
});

describe('isBismillahText', () => {
  it('detects common forms', () => {
    expect(isBismillahText('بِسْمِ ٱللَّهِ')).toBe(true);
    expect(isBismillahText('الحمد لله')).toBe(false);
  });
});
