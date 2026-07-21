import { describe, expect, it } from 'vitest';
import { hitTestWord } from './hit-test.js';
import { fixturePage1 } from './fixtures/page1.js';

describe('hitTestWord', () => {
  it('finds word by containment', () => {
    // center of 1:1:1 bbox
    const key = hitTestWord(fixturePage1, { x: 840, y: 145 }, { nearestFallback: false });
    expect(key).toBe('1:1:1');
  });

  it('uses nearest fallback within slop', () => {
    const key = hitTestWord(fixturePage1, { x: 900, y: 145 }, { slop: 20 });
    expect(key).toBe('1:1:1');
  });

  it('returns null far away without match', () => {
    const key = hitTestWord(fixturePage1, { x: 10, y: 10 }, { slop: 1, nearestFallback: false });
    expect(key).toBeNull();
  });
});
