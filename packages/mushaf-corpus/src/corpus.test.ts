import { describe, expect, it } from 'vitest';
import surahsData from './data/surahs.json';
import { getCorpusStats, getJuzAyahs, getPassageAyahs, getSurahAyahs } from './ayahs.js';
import { getJuz, getJuzList, juzCoverageTotal, juzOfAyah, juzOfSurah } from './juz.js';
import {
  normalizeQuranSearch,
  parseAyahRange,
  passageLabel,
  plainSurahDescription,
} from './passage.js';
import { getSurah, getSurahs, totalAyahs } from './surahs.js';
import type { QuranSurah } from './types.js';

const SURAHS = surahsData as QuranSurah[];

describe('corpus', () => {
  it('holds 114 surahs and 6236 ayahs with contiguous ids', () => {
    expect(getSurahs()).toHaveLength(114);
    expect(totalAyahs()).toBe(6236);
    const stats = getCorpusStats();
    expect(stats).toEqual({ surahs: 114, ayahs: 6236 });
  });

  it('numbers every surah 1..n with no gaps', () => {
    for (const surah of SURAHS) {
      const numbers = getSurahAyahs(surah.id).map((a) => a.ayah_number);
      expect(numbers).toEqual(Array.from({ length: surah.total_ayahs }, (_, i) => i + 1));
    }
  });

  it('preserves Arabic, translation, and transliteration verbatim', () => {
    const [first] = getPassageAyahs({ surah_id: 96, start_ayah: 1, end_ayah: 1 });
    expect(first?.arabic_text).toContain('قْرَأْ');
    expect(first?.translation.length).toBeGreaterThan(0);
    expect(first?.transliteration.length).toBeGreaterThan(0);
  });

  it('rejects ranges outside the surah', () => {
    expect(getPassageAyahs({ surah_id: 96, start_ayah: 1, end_ayah: 999 })).toEqual([]);
    expect(getPassageAyahs({ surah_id: 96, start_ayah: 10, end_ayah: 1 })).toEqual([]);
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

  it('assembles a juz in order across surah boundaries', () => {
    const juz30 = getJuz(30);
    const ayahs = getJuzAyahs(30);
    expect(ayahs).toHaveLength(juz30?.total_ayahs ?? -1);
    expect(ayahs[0]).toMatchObject({ surah_id: 78, ayah_number: 1 });
    expect(ayahs[ayahs.length - 1]).toMatchObject({ surah_id: 114, ayah_number: 6 });
    expect(getJuzAyahs(31)).toEqual([]);
  });
});
