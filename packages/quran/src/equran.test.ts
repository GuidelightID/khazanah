import { describe, expect, it, vi } from 'vitest';
import { createEquranSource, type EquranClient } from './equran.js';
import { getJuz } from './juz.js';
import { getSurah } from './surahs.js';

/** A fake EQuran client: no network, deterministic text per ayah. */
function fakeClient(): EquranClient & { getSurat: ReturnType<typeof vi.fn> } {
  const getSurat = vi.fn(async (nomor: number) => {
    const surah = getSurah(nomor);
    if (!surah) throw new Error(`no surah ${nomor}`);
    return {
      nomor,
      arti: `arti ${nomor}`,
      deskripsi: `<p>deskripsi ${nomor}</p>`,
      // Out of order on purpose: the source must sort.
      ayat: Array.from({ length: surah.total_ayahs }, (_, i) => surah.total_ayahs - i).map((n) => ({
        nomorAyat: n,
        teksArab: `arab ${nomor}:${n}`,
        teksLatin: `latin ${nomor}:${n}`,
        teksIndonesia: `indo ${nomor}:${n}`,
      })),
    };
  });
  return {
    getSurat,
    getAllSurat: async () =>
      Array.from({ length: 114 }, (_, i) => ({ nomor: i + 1, arti: `arti ${i + 1}`, deskripsi: `d${i + 1}` })),
  };
}

describe('createEquranSource', () => {
  it('maps EQuran ayat to QuranAyah with global ids and Indonesian juz', async () => {
    const quran = createEquranSource(fakeClient());
    const [ayatKursi] = await quran.getPassageAyahs({ surah_id: 2, start_ayah: 255, end_ayah: 255 });
    expect(ayatKursi).toEqual({
      id: 262,
      surah_id: 2,
      ayah_number: 255,
      arabic_text: 'arab 2:255',
      transliteration: 'latin 2:255',
      translation: 'indo 2:255',
      juz: 3,
    });
    const yasin = await quran.getPassageAyahs({ surah_id: 36, start_ayah: 21, end_ayah: 22 });
    expect(yasin.map((a) => a.juz)).toEqual([22, 23]);
  });

  it('returns ayahs in order and caches per surah', async () => {
    const client = fakeClient();
    const quran = createEquranSource(client);
    const first = await quran.getSurahAyahs(1);
    expect(first.map((a) => a.ayah_number)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    await quran.getPassageAyahs({ surah_id: 1, start_ayah: 2, end_ayah: 3 });
    expect(client.getSurat).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid passages without calling the API', async () => {
    const client = fakeClient();
    const quran = createEquranSource(client);
    expect(await quran.getPassageAyahs({ surah_id: 1, start_ayah: 0, end_ayah: 3 })).toEqual([]);
    expect(await quran.getPassageAyahs({ surah_id: 1, start_ayah: 5, end_ayah: 8 })).toEqual([]);
    expect(await quran.getPassageAyahs({ surah_id: 115, start_ayah: 1, end_ayah: 1 })).toEqual([]);
    expect(client.getSurat).not.toHaveBeenCalled();
  });

  it('assembles a juz in order across surah boundaries', async () => {
    const quran = createEquranSource(fakeClient());
    const ayahs = await quran.getJuzAyahs(30);
    expect(ayahs).toHaveLength(getJuz(30)?.total_ayahs ?? -1);
    expect(ayahs[0]).toMatchObject({ surah_id: 78, ayah_number: 1 });
    expect(ayahs[ayahs.length - 1]).toMatchObject({ surah_id: 114, ayah_number: 6 });
    expect(await quran.getJuzAyahs(31)).toEqual([]);
  });

  it('adds name_translation and description from EQuran to the surah list', async () => {
    const surahs = await createEquranSource(fakeClient()).getSurahs();
    expect(surahs).toHaveLength(114);
    expect(surahs[0]).toMatchObject({ slug: 'al-fatihah', name_translation: 'arti 1', description: 'd1' });
  });

  it('retries after a failed request instead of caching the failure', async () => {
    const client = fakeClient();
    client.getSurat.mockRejectedValueOnce(new Error('network'));
    const quran = createEquranSource(client);
    await expect(quran.getSurahAyahs(1)).rejects.toThrow('network');
    expect(await quran.getSurahAyahs(1)).toHaveLength(7);
  });
});
