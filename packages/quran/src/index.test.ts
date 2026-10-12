import { describe, expect, it } from 'vitest';
import { getJuz, getJuzList, juzCoverageTotal, juzOfAyah, juzOfSurah } from './juz.js';
import {
  normalizeQuranSearch,
  parseAyahRange,
  passageLabel,
  plainSurahDescription,
} from './passage.js';
import { ayahOffset, getSurah, getSurahs, totalAyahs } from './surahs.js';

describe('surah index', () => {
  it('lists 114 surahs numbered 1..114 with 6236 ayahs', () => {
    const surahs = getSurahs();
    expect(surahs).toHaveLength(114);
    surahs.forEach((surah, index) => {
      expect(surah.id).toBe(index + 1);
      expect(surah.number).toBe(index + 1);
      expect(surah.total_ayahs).toBeGreaterThan(0);
      expect(['Mekah', 'Madinah']).toContain(surah.revelation);
    });
    expect(totalAyahs()).toBe(6236);
    expect(new Set(surahs.map((s) => s.slug)).size).toBe(114);
  });

  it('computes global ayah offsets', () => {
    expect(ayahOffset(1)).toBe(0);
    expect(ayahOffset(2)).toBe(7);
    expect(ayahOffset(114) + 6).toBe(6236);
  });

  it('bundles no translation or description', () => {
    for (const surah of getSurahs()) {
      expect(surah.name_translation).toBeUndefined();
      expect(surah.description).toBeUndefined();
    }
  });
});

describe('surahs and passages', () => {
  it('finds surahs by number, slug, and alias', () => {
    expect(getSurah(96)?.slug).toBe('al-alaq');
    expect(getSurah('al-alaq')?.id).toBe(96);
    expect(getSurah('ash-sharh')?.id).toBe(94);
    expect(getSurah('tidak-ada')).toBeUndefined();
  });

  it('labels both ranges and single ayahs', () => {
    expect(passageLabel({ surah_id: 96, start_ayah: 1, end_ayah: 10 })).toBe("QS. Al-'Alaq: 1–10");
    expect(passageLabel({ surah_id: 96, start_ayah: 7, end_ayah: 7 })).toBe("QS. Al-'Alaq: 7");
  });

  it('normalizes search input and parses ranges', () => {
    expect(normalizeQuranSearch("Al-'Alaq")).toBe('al-alaq');
    expect(normalizeQuranSearch('Al ‘Alaq')).toBe('al alaq');
    expect(parseAyahRange('1-10', 19)).toEqual({ start_ayah: 1, end_ayah: 10 });
    expect(parseAyahRange('1–10', 19)).toEqual({ start_ayah: 1, end_ayah: 10 });
    expect(parseAyahRange('7', 19)).toEqual({ start_ayah: 7, end_ayah: 7 });
    expect(parseAyahRange('10-1', 19)).toBeNull();
    expect(parseAyahRange('0', 19)).toBeNull();
    expect(parseAyahRange('20', 19)).toBeNull();
  });

  it('strips HTML from the surah description', () => {
    expect(plainSurahDescription('Surat <i>Al Faatihah</i><br>yang<br/>dibuka.')).toBe(
      'Surat Al Faatihah yang dibuka.',
    );
    expect(plainSurahDescription(undefined)).toBe('');
  });
});

describe('juz — Standar Mushaf Indonesia', () => {
  it('covers the whole mushaf exactly once', () => {
    expect(getJuzList()).toHaveLength(30);
    expect(juzCoverageTotal()).toBe(totalAyahs());
    expect(juzCoverageTotal()).toBe(6236);
  });

  it('runs contiguously with no gaps or overlaps', () => {
    let prev: { surah_id: number; ayah_number: number } | null = null;
    for (const juz of getJuzList()) {
      expect(juz.ranges.length).toBeGreaterThan(0);
      if (prev) {
        const prevSurah = getSurah(prev.surah_id);
        const expected =
          prev.ayah_number < (prevSurah?.total_ayahs ?? 0)
            ? { surah_id: prev.surah_id, ayah_number: prev.ayah_number + 1 }
            : { surah_id: prev.surah_id + 1, ayah_number: 1 };
        expect(juz.start).toEqual(expected);
      }
      prev = juz.end;
    }
    expect(getJuzList()[0]?.start).toEqual({ surah_id: 1, ayah_number: 1 });
    expect(prev).toEqual({ surah_id: 114, ayah_number: 6 });
  });

  it('uses the Indonesian boundaries, not the Madinah ones', () => {
    // The best-known difference: juz 23 opens at Yasin 22 in the Indonesian
    // mushaf and at Yasin 28 in the Madinah one.
    expect(juzOfAyah(36, 22)).toBe(23);
    expect(juzOfAyah(36, 21)).toBe(22);
    expect(juzOfAyah(1, 1)).toBe(1);
    expect(juzOfAyah(114, 6)).toBe(30);
    expect(juzOfSurah(1)).toEqual([1]);
    expect(juzOfSurah(2)).toEqual([1, 2, 3]);
  });

  it('rejects juz numbers outside 1..30', () => {
    expect(getJuz(0)).toBeUndefined();
    expect(getJuz(31)).toBeUndefined();
    expect(getJuz(1.5)).toBeUndefined();
  });
});
