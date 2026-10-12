import { describe, expect, it } from 'vitest';
import { wordAtTime, type WordTiming } from './timings.js';
import { audioPlugin } from './plugin.js';

const timings: WordTiming[] = [
  { wordKey: '1:1:1', start: 0, end: 0.5 },
  { wordKey: '1:1:2', start: 0.5, end: 1.0 },
  { wordKey: '1:1:3', start: 1.0, end: 1.5 },
];

describe('wordAtTime', () => {
  it('returns active word', () => {
    expect(wordAtTime(timings, 0.2)).toBe('1:1:1');
    expect(wordAtTime(timings, 0.7)).toBe('1:1:2');
    expect(wordAtTime(timings, 1.2)).toBe('1:1:3');
  });
});

describe('audioPlugin', () => {
  it('is clientOnly and exposes controls', () => {
    const p = audioPlugin({
      getAudioUrl: (v) => `/a/${v}.mp3`,
    });
    expect(p.clientOnly).toBe(true);
    expect(p.name).toBe('audio');
    expect(typeof p.controls.playVerse).toBe('function');
    expect(typeof p.controls.setActiveWord).toBe('function');
    expect(p.provideHighlights?.()).toEqual([]);
    p.controls.setActiveWord('1:1:1', '1:1');
    expect(p.controls.getCurrentWord()).toBe('1:1:1');
    expect(p.provideHighlights?.()).toHaveLength(1);
    p.onDestroy?.();
  });
});
