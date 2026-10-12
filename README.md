# Khazanah

[![CI](https://github.com/GuidelightID/khazanah/actions/workflows/ci.yml/badge.svg)](https://github.com/GuidelightID/khazanah/actions/workflows/ci.yml)
[![Code: MIT](https://img.shields.io/badge/code-MIT-yellow.svg)](./LICENSE)

Islamic content for JavaScript and TypeScript: the Quran, dzikir such as
**Al-Ma'tsurat**, doa, and a layout-faithful **Mushaf** page renderer. Each piece
is a separate npm package under the `@guidelightid` scope. They ship data, types
and helpers, with no app attached.

Maintained by [Guidelight](https://guidelight.id), which uses these packages in
production. Contributions are welcome.

## Packages

| Package | What it is | npm |
|---|---|---|
| [`@guidelightid/almatsurat`](./packages/almatsurat) | Dzikir Al-Ma'tsurat, sugro & kubro, pagi & petang | [![npm](https://img.shields.io/npm/v/@guidelightid/almatsurat.svg)](https://www.npmjs.com/package/@guidelightid/almatsurat) |
| [`@guidelightid/quran`](./packages/quran) | 114-surah index, Standar Mushaf Indonesia juz table, passage helpers, and an adapter that loads verse text & Indonesian translation from EQuran.id via its official SDK | [![npm](https://img.shields.io/npm/v/@guidelightid/quran.svg)](https://www.npmjs.com/package/@guidelightid/quran) |
| [`@guidelightid/mushaf-*`](./packages/mushaf) | Madinah mushaf page renderer for React & Next.js: core, renderer, react, next, search, tajwid, audio, annotations, fonts, cli and data adapters | early 0.0.x, **not published yet** |
| [`@guidelightid/doa`](./packages/doa) | Doa & dzikir: morning/evening dhikr, daily dua, selected dua, dhikr after salah, in Indonesian and English | [![npm](https://img.shields.io/npm/v/@guidelightid/doa.svg)](https://www.npmjs.com/package/@guidelightid/doa) |

```ts
import { getAlMatsurat } from '@guidelightid/almatsurat';

const pagi = getAlMatsurat('sugro', 'pagi');
pagi.data.forEach((item) => console.log(item.title, `${item.repeat}x`));
```

Each package's README covers its API.

## Licensing

Code and content have different owners, so this repo keeps them apart:

- **Code** (TypeScript sources, helpers, components) is **MIT**.
- **Content** (Quran text, translations, dzikir and doa collections, fonts,
  page geometry) keeps its **source's license**. Every content package has a
  `LICENSE` and a `NOTICE.md` naming the source, its terms and the required
  attribution, plus a `provenance.json` recording exactly what was imported.
- [`LICENSES/matrix.md`](./LICENSES/matrix.md) lists every source and whether it
  may be redistributed through npm. A package whose source is not cleared there
  stays `"private": true` and is never published.

## Repository layout

```
packages/
├── almatsurat/          @guidelightid/almatsurat
├── doa/                 @guidelightid/doa
├── quran/               @guidelightid/quran
└── mushaf/              @guidelightid/mushaf-* (renderer family)
    ├── core, renderer, react, next, search, tajwid, audio, annotations, fonts, cli
    └── adapters/        custom, kfgqpc, quran-foundation, tanzil
examples/                vite-react demo, guidelight-spike
e2e/                     Playwright visual tests for the renderer
LICENSES/matrix.md       redistribution gate per source
```

## Development

Requires **Node ≥ 20** (22 recommended) and **pnpm 9** (`corepack enable`).

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e      # renderer visual tests (Playwright, Chromium)
```

## Releasing

Releases are automated with [Changesets](https://github.com/changesets/changesets)
and published to npmjs.com:

1. In your PR, run `pnpm changeset` and describe the change for each affected
   package.
2. After merge, the **Release** workflow opens a "chore: release packages" PR
   that bumps versions and writes changelogs.
3. Merging that PR publishes the new versions to npm through npm trusted
   publishing (no tokens), with provenance.

Details and one-time setup: [docs/releasing.md](./docs/releasing.md).

## Adding a content package

For example a new `@guidelightid/<name>` package:

1. Add a row for the source to `LICENSES/matrix.md`. If redistribution through
   npm is not clearly allowed, mark it ⬜ and keep the package `"private": true`.
2. Copy the data verbatim and record it in `src/data/provenance.json` (source
   URL, commit or snapshot date, SHA-256 per file).
3. Write `LICENSE` and `NOTICE.md` with the source, its license or terms, and
   the attribution users must show.
4. Add types, small helpers and tests that check the data's shape (counts,
   non-empty text, no duplicated translations).
5. Add a changeset.

`packages/almatsurat` is the reference example.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) and the
[Code of Conduct](./CODE_OF_CONDUCT.md). Corrections to text or translations
are welcome. Please cite the source you are correcting against.

This repository was previously named `mushaf`; old links redirect here.
