# Mushaf renderer — `@guidelightid/mushaf-*`

Layout-faithful **Madinah** mushaf page rendering for React & Next.js:
TypeScript-first, offline-capable, SSR-friendly, adapter-driven. The aim is to
be the default embeddable engine for Quran page rendering on the web (similar
to how `react-markdown` standardized Markdown).

Part of [Khazanah](../../README.md).

> **Status:** early **0.x**; APIs may change. Real Madinah fonts/geometry are
> **dual-distributed** (not silently MIT) — see
> [`LICENSES/matrix.md`](../../LICENSES/matrix.md).

## What works today

| Capability | Package / API |
|------------|----------------|
| Page IR, runtime, hit-test, validation | `@guidelightid/mushaf-core` |
| HTML paint + SSR markup | `@guidelightid/mushaf-renderer` |
| `QuranPage`, `QuranViewer`, `QuranReader`, hooks | `@guidelightid/mushaf-react` |
| Offline search | `@guidelightid/mushaf-search` + `useSearch` |
| Tajweed / audio / annotations plugins | `@guidelightid/mushaf-tajwid`, `@guidelightid/mushaf-audio`, `@guidelightid/mushaf-annotations` |
| Open Arabic font CSS helpers | `@guidelightid/mushaf-fonts` |
| Hosted data (`data pull` → `/mushaf`) | `@guidelightid/mushaf-cli`, `@guidelightid/mushaf-adapter-custom`, `@guidelightid/mushaf-adapter-kfgqpc` |
| Quran.com API adapter (approx layout) | `@guidelightid/mushaf-adapter-quran-foundation` |
| Text-flow (not plate-faithful) | `@guidelightid/mushaf-adapter-tanzil` |
| Next font/CSP helpers | `@guidelightid/mushaf-next` |
| Guidelight catalog spike notes | [`examples/guidelight-spike`](../../examples/guidelight-spike) |

## Quick start

### 1. Install repo deps

```bash
pnpm install
pnpm build
```

Requires **Node ≥ 20** and **pnpm 9**.

### 2. Run the Vite demo

```bash
pnpm --filter @guidelightid/example-vite-react pull-data   # optional hosted pack
pnpm --filter @guidelightid/example-vite-react dev
```

Demo modes: **QuranPage** · **Viewer** · **Reader** · **Search** · **Audio** · **Notes**  
Adapters: in-memory fixture · hosted `/mushaf` pack.

### 3. Minimal consumer code

```tsx
import { QuranProvider, QuranPage } from '@guidelightid/mushaf-react';
import { fixtureAdapter } from '@guidelightid/mushaf-core';
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
pnpm --filter @guidelightid/mushaf-cli build
node packages/mushaf/cli/dist/cli.js data sources
node packages/mushaf/cli/dist/cli.js data pull --source fixture --out ./public/mushaf
```

```ts
import { createHostedMadinahAdapter } from '@guidelightid/mushaf-adapter-kfgqpc';

const adapter = createHostedMadinahAdapter({ baseUrl: '/mushaf' });
```

Restricted sources (`kfgqpc` real plates) stay **disabled** until `LICENSES/matrix.md` is approved.

### 5. Next.js (App Router sketch)

```tsx
import { MushafFontLinks } from '@guidelightid/mushaf-next';
import { QuranProvider, QuranPage } from '@guidelightid/mushaf-react';

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
| `@guidelightid/mushaf-core` | Types, IR, runtime, adapters, hit-test |
| `@guidelightid/mushaf-renderer` | HTML (default) paint pipeline |
| `@guidelightid/mushaf-react` | Components & hooks (`./reader` entry) |
| `@guidelightid/mushaf-next` | Font links + CSP helpers |
| `@guidelightid/mushaf-cli` | `mushaf data pull` / `data sources` |
| `@guidelightid/mushaf-search` | MiniSearch + Arabic normalize |
| `@guidelightid/mushaf-tajwid` | Tajweed highlight plugin |
| `@guidelightid/mushaf-audio` | Audio word highlight plugin |
| `@guidelightid/mushaf-annotations` | Notes / bookmark highlights |
| `@guidelightid/mushaf-fonts` | Open Arabic CSS stack (no restricted page fonts) |
| `@guidelightid/mushaf-adapter-custom` | Hosted PageLoader adapter |
| `@guidelightid/mushaf-adapter-kfgqpc` | Hosted Madinah pack adapter |
| `@guidelightid/mushaf-adapter-quran-foundation` | API v4 → IR (approx) |
| `@guidelightid/mushaf-adapter-tanzil` | Text-flow fallback |

## Visual regression (Playwright)

Fixture HTML goldens for pages **1, 2, 5** (+ page 1 dark). Uses **system fonts only** (no Google Fonts) so CI stays offline-stable.

```bash
pnpm exec playwright install chromium   # first time
pnpm test:e2e                           # builds core+renderer, then compares
pnpm test:e2e:update                    # refresh baselines (commit e2e/**/*-snapshots/)
```

CI runs `pnpm test:e2e` after unit tests and `pnpm build`.

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
