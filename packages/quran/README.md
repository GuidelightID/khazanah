# @guidelight/quran

The Indonesian Quran corpus, its juz table, and passage helpers.
**No UI** — this package ships no components, styles, or fonts.

Used by [guidelight.id](https://guidelight.id) for the Al-Qur'an & Tadabbur module.

## Status and license

**Not published to npm yet** (`"private": true`). The code is MIT, but the
Indonesian translation, transliteration and surah metadata come from Kemenag
via EQuran.id and have no written license for bulk redistribution. See
[NOTICE.md](./NOTICE.md) for sources, terms and the required attribution, and
[`LICENSES/matrix.md`](../../LICENSES/matrix.md) for the repo-wide gate.

## Data source

Arabic text, the Kemenag translation, transliteration, and surah metadata all
come from **equran.id API v2** (`teksArab`, `teksIndonesia`, `teksLatin`,
`namaLatin`, `arti`, `tempatTurun`, `deskripsi`). One provider for all three
texts, so they cannot drift out of alignment. The corpus is frozen as JSON, not
fetched at runtime.

Checked in CI on every build: 114 surahs, 6236 ayahs, every surah numbered
1..n with no gaps.

## Juz boundaries

Juz navigation follows the **Standar Mushaf Indonesia** (Kemenag), not the
Madinah division. The two differ at 13 juz — juz 23 opens at Yasin 22 in the
Indonesian mushaf and at Yasin 28 in the Madinah one.

The `juz` field on each ayah still carries equran.id's own value, which follows
the Madinah division. **Do not use that field for navigation**; use
`juzOfAyah()`. The boundary table is tested: contiguous, no gaps or overlaps,
covering all 6236 ayahs exactly once.

## Two entry points, on purpose

```ts
// Client-safe (~87 KB): surah catalog, juz table, types, helpers.
import { getSurah, getJuzList, parseAyahRange } from '@guidelight/quran';

// Server only (~3.9 MB): the verse text.
import { getPassageAyahs, getJuzAyahs } from '@guidelight/quran/ayahs';
```

Verse text is deliberately absent from the main entry. Pulling it in there
would ship the whole mushaf to the browser.

## API

### Main entry

| Function | Purpose |
|---|---|
| `getSurahs()` | all 114 surahs |
| `getSurah(number \| slug)` | one surah; accepts aliases such as `ash-sharh` |
| `totalAyahs()` | 6236 |
| `passageLabel(passage)` | `"QS. Al-'Alaq: 1–10"` |
| `parseAyahRange(text, totalAyahs)` | parses `"7"`, `"1-10"`, `"1–10"`; `null` when out of range |
| `normalizeQuranSearch(text)` | folds case, diacritics, and curly apostrophes |
| `plainSurahDescription(html)` | strips the light HTML in equran.id's `deskripsi` |
| `getJuzList()` / `getJuz(n)` | 30 juz with names, surah ranges, ayah counts |
| `juzOfAyah(surah, ayah)` | juz number per the Standar Mushaf Indonesia |
| `juzOfSurah(surah)` | the juz a surah spans |
| `juzCoverageTotal()` | ayahs covered by all 30 juz; must be 6236 |

### `/ayahs` entry

| Function | Purpose |
|---|---|
| `getSurahAyahs(surahId)` | one surah's ayahs, ordered |
| `getPassageAyahs(passage)` | ayahs in a range; `[]` when the range is invalid |
| `getJuzAyahs(n)` | one juz's ayahs, across surah boundaries |
| `getCorpusStats()` | `{ surahs, ayahs }` |

## Deliberately not here

- **Fonts.** LPMQ Isep Misbah is self-hosted from the consuming app's `public/`.
  Next.js does not serve assets out of `node_modules`, so shipping it here would
  only make consumers' lives harder.
- **Components and styles.** The reader UI is highly Guidelight-specific —
  Indonesian copy, reflections, recitation audio, night mode. Keeping it here
  would make every UI tweak require a release.
- **Routes.** Helpers like `passageHref()` build application URLs, so they stay
  in the application.

## Installing

Not on npm yet (see above). Inside this repository, depend on it with
`"@guidelight/quran": "workspace:*"`.

## Releasing

Releases go through [Changesets](../../README.md#releasing) like every other
package in this repo. Publishing this one additionally requires removing
`"private": true`, which must only happen once the data terms in NOTICE.md
are cleared.

## Regenerating the corpus

This package is the corpus's **only source** — other repos consume it, not copy it.

```bash
pnpm --filter @guidelight/quran import        # dry run, validate only
pnpm --filter @guidelight/quran import:write  # write src/data/* + CORPUS.md
pnpm --filter @guidelight/quran test
```

Review the diff to `src/data/*` and add a changeset. Consumers take the corpus
from a release, not from this repo.

Guidelight regenerates its seed migration from the installed version with
`pnpm --filter @guidelight/web quran:seed` (in the `guidelight` app repo).
