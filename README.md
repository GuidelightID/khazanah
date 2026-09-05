# Mushaf

[![CI](https://github.com/GuidelightID/mushaf/actions/workflows/ci.yml/badge.svg)](https://github.com/GuidelightID/mushaf/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Quran libraries for React & Next.js — libraries, not an app.

**Repo:** [github.com/GuidelightID/mushaf](https://github.com/GuidelightID/mushaf)

This monorepo holds two things that share a home but not a purpose. Read this
before adding a package, because they publish to different registries:

| | `@mushaf/*` — the renderer | `@guidelightid/mushaf-corpus` — the corpus |
|---|---|---|
| Does | Renders layout-faithful **Madinah** mushaf pages | Ships the Indonesian **Kemenag** corpus + juz map. Renders nothing |
| Data | KFGQPC plates, adapter-driven | equran.id, frozen as JSON |
| Status | early **0.x** scaffolding, unpublished | `0.1.0`, tested, **not yet published** |
| Registry | public npm (scope not yet claimed) | **GitHub Packages** — scope must be `@guidelightid` |
| Used by | nothing yet | `guidelight-id-next` depends on it (Al-Qur'an & Tadabbur) |

The renderer aims to be the default embeddable engine for Quran page rendering
on the web (similar to how `react-markdown` standardized Markdown):
TypeScript-first, offline-capable, SSR-friendly, adapter-driven.

> **Status:** the `@mushaf/*` renderer is early **0.x** scaffolding; APIs may
> change and nothing is published yet. Real Madinah fonts/geometry are
> **dual-distributed** (not silently MIT) — see
> [`LICENSES/matrix.md`](./LICENSES/matrix.md).
> `@guidelightid/mushaf-corpus` is separate: it carries no restricted assets,
> and its first release is tagged `mushaf-corpus-v0.1.0`.

## What works today

| Capability | Package / API |
|------------|----------------|
| Page IR, runtime, hit-test, validation | `@mushaf/core` |
| HTML paint + SSR markup | `@mushaf/renderer` |
| `QuranPage`, `QuranViewer`, `QuranReader`, hooks | `@mushaf/react` |
| Offline search | `@mushaf/search` + `useSearch` |
| Tajweed / audio / annotations plugins | `@mushaf/tajwid`, `@mushaf/audio`, `@mushaf/annotations` |
| Open Arabic font CSS helpers | `@mushaf/fonts` |
| Hosted data (`data pull` → `/mushaf`) | `@mushaf/cli`, `@mushaf/adapter-custom`, `@mushaf/adapter-kfgqpc` |
| Quran.com API adapter (approx layout) | `@mushaf/adapter-quran-foundation` |
| Text-flow (not plate-faithful) | `@mushaf/adapter-tanzil` |
| Next font/CSP helpers | `@mushaf/next` |
| Guidelight catalog spike notes | [`examples/guidelight-spike`](./examples/guidelight-spike) |
| **Indonesian corpus + Standar Mushaf Indonesia juz map** | **`@guidelightid/mushaf-corpus`** — see its [README](./packages/mushaf-corpus/README.md) |

## Quick start

### 1. Install monorepo deps

```bash
cd mushaf
pnpm install
pnpm build
```

Requires **Node ≥ 20** and **pnpm 9**.

### 2. Run the Vite demo

```bash
pnpm --filter @mushaf/example-vite-react pull-data   # optional hosted pack
pnpm --filter @mushaf/example-vite-react dev
```

Demo modes: **QuranPage** · **Viewer** · **Reader** · **Search** · **Audio** · **Notes**  
Adapters: in-memory fixture · hosted `/mushaf` pack.

### 3. Minimal consumer code

```tsx
import { QuranProvider, QuranPage } from '@mushaf/react';
import { fixtureAdapter } from '@mushaf/core';
// or: createHostedMadinahAdapter({ baseUrl: '/mushaf' })

export function Reader() {
  return (
    <QuranProvider adapter={fixtureAdapter}>
      <QuranPage page={1} />
    </QuranProvider>
  );
}
```

### 4. Offline pack (dual distribution)

```bash
pnpm --filter @mushaf/cli build
node packages/cli/dist/cli.js data sources
node packages/cli/dist/cli.js data pull --source fixture --out ./public/mushaf
```

```ts
import { createHostedMadinahAdapter } from '@mushaf/adapter-kfgqpc';

const adapter = createHostedMadinahAdapter({ baseUrl: '/mushaf' });
```

Restricted sources (`kfgqpc` real plates) stay **disabled** until `LICENSES/matrix.md` is approved.

### 5. Next.js (App Router sketch)

```tsx
import { MushafFontLinks } from '@mushaf/next';
import { QuranProvider, QuranPage } from '@mushaf/react';

// Server: const initialData = await adapter.getPage(page)
// Client island:
<>
  <MushafFontLinks />
  <QuranProvider adapter={adapter}>
    <QuranPage page={page} initialData={initialData} />
  </QuranProvider>
</>
```

## Packages

| Package | Description |
|---------|-------------|
| `@mushaf/core` | Types, IR, runtime, adapters, hit-test |
| `@mushaf/renderer` | HTML (default) paint pipeline |
| `@mushaf/react` | Components & hooks (`./reader` entry) |
| `@mushaf/next` | Font links + CSP helpers |
| `@mushaf/cli` | `mushaf data pull` / `data sources` |
| `@mushaf/search` | MiniSearch + Arabic normalize |
| `@mushaf/tajwid` | Tajweed highlight plugin |
| `@mushaf/audio` | Audio word highlight plugin |
| `@mushaf/annotations` | Notes / bookmark highlights |
| `@mushaf/fonts` | Open Arabic CSS stack (no restricted page fonts) |
| `@mushaf/adapter-custom` | Hosted PageLoader adapter |
| `@mushaf/adapter-kfgqpc` | Hosted Madinah pack adapter |
| `@mushaf/adapter-quran-foundation` | API v4 → IR (approx) |
| `@mushaf/adapter-tanzil` | Text-flow fallback |
| `@guidelightid/mushaf-corpus` | Indonesian Kemenag corpus, juz map, passage helpers — no UI |

### Naming and registries

Two scopes, because the registries force it:

- **`@mushaf/*`** targets public npm. The scope is not claimed yet — see
  [`docs/npm-scope.md`](./docs/npm-scope.md).
- **`@guidelightid/*`** targets **GitHub Packages**, which requires the npm
  scope to match the repository owner. Anything published from
  `github.com/GuidelightID/…` must carry that scope; `@mushaf/*` can never go
  there under its current name.

So a new package's name follows its destination. For GitHub Packages, use
`@guidelightid/mushaf-<name>`.

## Development

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

### Visual regression (Playwright)

Fixture HTML goldens for pages **1, 2, 5** (+ page 1 dark). Uses **system fonts only** (no Google Fonts) so CI stays offline-stable.

```bash
pnpm exec playwright install chromium   # first time
pnpm test:e2e                           # builds core+renderer, then compares
pnpm test:e2e:update                    # refresh baselines (commit e2e/**/*-snapshots/)
```

CI runs `pnpm test:e2e` after unit tests and `pnpm build`.

### Releases (Changesets)

```bash
pnpm changeset          # describe package bumps
pnpm version-packages   # apply versions + changelogs
pnpm release            # build + publish (when npm org is ready)
```

An initial changeset lives at `.changeset/initial-scaffold.md` for the first `0.0.1` cut.

## Design principles

1. **Library, not app** — no Quran.com clone  
2. **IR-centric** — adapters → `MushafPageIR` → renderer  
3. **Dual distribution** — MIT code; licensed assets via CLI/host  
4. **HTML default** — SSR + a11y; Canvas client-only  
5. **Explicit adapter** — no silent network defaults  
6. **No telemetry** in core  

## Fidelity note

v1 default is **layout-faithful unicode_bbox** geometry (word boxes in logical space).  
True glyph-level plate parity needs licensed page fonts + geometry (ADR-013/014).

## License

MIT for first-party code. Third-party assets: see [`LICENSES/`](./LICENSES/).
