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

describe('korpus', () => {
  it('memuat 114 surah dan 6236 ayat dengan id berurutan', () => {
    expect(getSurahs()).toHaveLength(114);
    expect(totalAyahs()).toBe(6236);
    const stats = getCorpusStats();
    expect(stats).toEqual({ surahs: 114, ayahs: 6236 });
  });

  it('setiap surah punya ayat 1..n tanpa bolong', () => {
    for (const surah of SURAHS) {
      const numbers = getSurahAyahs(surah.id).map((a) => a.ayah_number);
      expect(numbers).toEqual(Array.from({ length: surah.total_ayahs }, (_, i) => i + 1));
    }
  });

  it('mempertahankan teks Arab, terjemahan, dan transliterasi apa adanya', () => {
    const [first] = getPassageAyahs({ surah_id: 96, start_ayah: 1, end_ayah: 1 });
    expect(first?.arabic_text).toContain('قْرَأْ');
    expect(first?.translation.length).toBeGreaterThan(0);
    expect(first?.transliteration.length).toBeGreaterThan(0);
  });

  it('menolak rentang di luar jangkauan surah', () => {
    expect(getPassageAyahs({ surah_id: 96, start_ayah: 1, end_ayah: 999 })).toEqual([]);
    expect(getPassageAyahs({ surah_id: 96, start_ayah: 10, end_ayah: 1 })).toEqual([]);
  });
});

describe('surah & rentang', () => {
  it('mencari surah lewat nomor, slug, dan alias', () => {
    expect(getSurah(96)?.slug).toBe('al-alaq');
    expect(getSurah('al-alaq')?.id).toBe(96);
    expect(getSurah('ash-sharh')?.id).toBe(94);
    expect(getSurah('tidak-ada')).toBeUndefined();
  });

  it('memberi label rentang dan ayat tunggal', () => {
    expect(passageLabel({ surah_id: 96, start_ayah: 1, end_ayah: 10 })).toBe("QS. Al-'Alaq: 1–10");
    expect(passageLabel({ surah_id: 96, start_ayah: 7, end_ayah: 7 })).toBe("QS. Al-'Alaq: 7");
  });

  it('menormalkan pencarian dan mengurai rentang', () => {
    expect(normalizeQuranSearch("Al-'Alaq")).toBe('al-alaq');
    expect(normalizeQuranSearch('Al ‘Alaq')).toBe('al alaq');
    expect(parseAyahRange('1-10', 19)).toEqual({ start_ayah: 1, end_ayah: 10 });
    expect(parseAyahRange('1–10', 19)).toEqual({ start_ayah: 1, end_ayah: 10 });
    expect(parseAyahRange('7', 19)).toEqual({ start_ayah: 7, end_ayah: 7 });
    expect(parseAyahRange('10-1', 19)).toBeNull();
    expect(parseAyahRange('0', 19)).toBeNull();
    expect(parseAyahRange('20', 19)).toBeNull();
  });

  it('membersihkan HTML dari deskripsi surah', () => {
    expect(plainSurahDescription('Surat <i>Al Faatihah</i><br>yang<br/>dibuka.')).toBe(
      'Surat Al Faatihah yang dibuka.',
    );
    expect(plainSurahDescription(undefined)).toBe('');
  });
});

describe('juz — Standar Mushaf Indonesia', () => {
  it('mencakup seluruh mushaf tepat satu kali', () => {
    expect(getJuzList()).toHaveLength(30);
    expect(juzCoverageTotal()).toBe(totalAyahs());
    expect(juzCoverageTotal()).toBe(6236);
  });

  it('bersambung tanpa celah maupun tumpang tindih', () => {
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

  it('memakai batas Indonesia, bukan Madinah', () => {
    // Pembeda paling terkenal: juz 23 dibuka Yasin 22 di mushaf Indonesia,
    // Yasin 28 di mushaf Madinah.
    expect(juzOfAyah(36, 22)).toBe(23);
    expect(juzOfAyah(36, 21)).toBe(22);
    expect(juzOfAyah(1, 1)).toBe(1);
    expect(juzOfAyah(114, 6)).toBe(30);
    expect(juzOfSurah(1)).toEqual([1]);
    expect(juzOfSurah(2)).toEqual([1, 2, 3]);
  });

  it('menolak nomor juz di luar 1..30', () => {
    expect(getJuz(0)).toBeUndefined();
    expect(getJuz(31)).toBeUndefined();
    expect(getJuz(1.5)).toBeUndefined();
  });

  it('menyusun ayat juz berurutan lintas surah', () => {
    const juz30 = getJuz(30);
    const ayahs = getJuzAyahs(30);
    expect(ayahs).toHaveLength(juz30?.total_ayahs ?? -1);
    expect(ayahs[0]).toMatchObject({ surah_id: 78, ayah_number: 1 });
    expect(ayahs[ayahs.length - 1]).toMatchObject({ surah_id: 114, ayah_number: 6 });
    expect(getJuzAyahs(31)).toEqual([]);
  });
});
