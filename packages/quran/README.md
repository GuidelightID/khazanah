# @guidelight/quran

The Indonesian Quran corpus, its juz table, and passage helpers.
**No UI** — this package ships no components, styles, or fonts.

Used by `guidelight-id-next` for the Al-Qur'an & Tadabbur module.

## Why the scope is `@guidelightid`, not `@mushaf`

Every other package here is named `@guidelight/mushaf-*`. This one is not, and that is not
an inconsistency waiting to be tidied: **GitHub Packages requires the npm scope
to match the repository owner**, so anything published from
`github.com/GuidelightID/…` must be scoped `@guidelightid`.

The constraint cuts both ways — the ten `@guidelight/mushaf-*` packages in this repo
**cannot** be published to GitHub Packages under their current names; they are
aimed at public npm (see [`docs/npm-scope.md`](../../docs/npm-scope.md)). If
they ever move, they follow this package's pattern:
`@guidelightid/mushaf-<name>`.

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

This package publishes to **GitHub Packages**, not public npm. Consumers need
an `.npmrc`:

```
@guidelightid:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

The token is a classic PAT with the `read:packages` scope.

## Releasing

The tag and the `version` field must agree, and CI refuses to publish when they
do not. The ordering is the easy thing to get wrong: **bump and commit first,
tag second.**

The safest way is to let npm do both at once, so they cannot disagree:

```bash
pnpm --filter @guidelight/quran test

cd packages/mushaf-corpus
npm version patch --tag-version-prefix=mushaf-corpus-v   # bumps, commits, tags
cd ../..
git push --follow-tags
```

Doing it by hand works too, as long as the bump is committed before the tag:

```bash
# edit "version" in packages/mushaf-corpus/package.json, commit it, then:
git tag mushaf-corpus-v0.1.1 && git push origin mushaf-corpus-v0.1.1
```

`publish-mushaf-corpus.yml` verifies the tag matches the package version, runs
typecheck and tests, then publishes. A version that already exists on the
registry can never be republished — bump to a new one instead.

## Regenerating the corpus

This package is the corpus's **only home** — no other repo keeps a copy.

```bash
pnpm --filter @guidelight/quran import        # dry run, validate only
pnpm --filter @guidelight/quran import:write  # write src/data/* + CORPUS.md
pnpm --filter @guidelight/quran test
```

Review the diff to `src/data/*`, bump `version`, then publish. Consumers take
the corpus from a release, not from this repo.

Once the new version is installed in `guidelight-id-next`, regenerate its seed
migration there with `npm run quran:seed`.
