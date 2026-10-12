# @guidelight.id/quran

Quran structure and helpers for apps built for Indonesian readers:

- the **114-surah index** (slug, Latin and Arabic name, ayah count, place of revelation),
- the **juz table of the Standar Mushaf Indonesia** (Kemenag), which differs
  from the Madinah division at 13 juz,
- passage helpers: parse `"1-10"`, label `QS. Al-'Alaq: 1–10`, normalize search input,
- an adapter that loads verse text, Indonesian translation and transliteration
  from **[EQuran.id](https://equran.id)** through its official SDK.

The package bundles **no verse text or translation** (see [NOTICE.md](./NOTICE.md)),
so it is small, client-safe, and MIT.

Used by [guidelight.id](https://guidelight.id) for the Al-Qur'an & Tadabbur module.

```bash
npm install @guidelight.id/quran
npm install equran   # only if you use @guidelight.id/quran/equran
```

## Structure and helpers (sync, no network)

```ts
import { getSurah, getJuz, juzOfAyah, parseAyahRange, passageLabel } from '@guidelight.id/quran';

getSurah('al-kahf');            // { number: 18, name_latin: 'Al-Kahf', total_ayahs: 110, ... }
juzOfAyah(36, 22);              // 23 (Standar Mushaf Indonesia; Madinah would say 22)
getJuz(30)?.span;               // "An-Naba' 1 – An-Nas 6"
parseAyahRange('1-10', 19);     // { start_ayah: 1, end_ayah: 10 }
passageLabel({ surah_id: 96, start_ayah: 1, end_ayah: 5 }); // "QS. Al-'Alaq: 1–5"
```

| Function | Purpose |
|---|---|
| `getSurahs()` | all 114 surahs |
| `getSurah(number \| slug)` | one surah; accepts aliases such as `ash-sharh` |
| `totalAyahs()` | 6236 |
| `ayahOffset(surah)` | global ayah number before a surah (for ids 1..6236) |
| `getJuzList()` / `getJuz(n)` | 30 juz with names, surah ranges, ayah counts |
| `juzOfAyah(surah, ayah)` / `juzOfSurah(surah)` | juz per the Standar Mushaf Indonesia |
| `juzCoverageTotal()` | ayahs covered by all 30 juz; must be 6236 |
| `parseAyahRange(text, totalAyahs)` | parses `"7"`, `"1-10"`, `"1–10"`; `null` when out of range |
| `passageLabel(passage)` | `"QS. Al-'Alaq: 1–10"` |
| `normalizeQuranSearch(text)` | folds case, diacritics and curly apostrophes |
| `plainSurahDescription(html)` | strips the light HTML in surah descriptions |

## Verse text from EQuran.id

```ts
import { EQuran } from 'equran';
import { createEquranSource } from '@guidelight.id/quran/equran';

const quran = createEquranSource(new EQuran());

await quran.getPassageAyahs({ surah_id: 2, start_ayah: 255, end_ayah: 255 });
// [{ id: 262, surah_id: 2, ayah_number: 255, arabic_text, transliteration, translation, juz: 3 }]
await quran.getJuzAyahs(30);   // all of juz 30, in order across surahs
await quran.getSurahs();       // the index + name_translation and description from EQuran.id
```

Results are cached per surah for the life of the source; failed requests are
retried on the next call. Each request goes to EQuran.id, so on a server add
your own caching (for example Next.js `unstable_cache` / `"use cache"`).

The content comes from EQuran.id under [its terms](https://equran.id/terms).
Show the attribution:

> Teks Al-Qur'an, terjemahan, dan transliterasi: Kementerian Agama RI, melalui EQuran.id.

Any other source works too: produce `QuranAyah` objects and keep using the
helpers above.

## Juz boundaries

Juz navigation follows the **Standar Mushaf Indonesia** (Kemenag), not the
Madinah division. The two differ at 13 juz: juz 23 opens at Yasin 22 in the
Indonesian mushaf and at Yasin 28 in the Madinah one. The table is tested to be
contiguous and to cover all 6236 ayahs exactly once.

## License

MIT. See [NOTICE.md](./NOTICE.md) for what is and is not included.
