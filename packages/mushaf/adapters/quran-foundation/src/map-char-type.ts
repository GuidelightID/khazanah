import type { CharType } from '@mushaf/core';

export function mapCharType(name: string | undefined): CharType {
  if (!name) return 'word';
  const n = name.toLowerCase();
  if (n.includes('end')) return 'end_marker';
  if (n.includes('sajdah') || n.includes('sajda')) return 'sajdah';
  if (n.includes('ruku') || n.includes('rukū')) return 'ruku';
  if (n.includes('hizb')) return 'hizb';
  if (n.includes('juz')) return 'juz';
  if (n.includes('pause') || n.includes('rub')) return 'pause';
  if (n.includes('header') || n.includes('surah')) return 'header';
  if (n.includes('basm') || n.includes('bism')) return 'bismillah';
  return 'word';
}
