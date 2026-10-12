# Contributing to Khazanah

Thanks for your interest in contributing.

## Prerequisites

- Node.js ≥ 20
- pnpm 9 (`corepack enable && corepack prepare pnpm@9.15.0 --activate`)

## Setup

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

## Package boundaries (Mushaf renderer, `packages/mushaf/*`)

| Package | May depend on |
|---------|----------------|
| `core` | nothing (or tiny pure utils) |
| `renderer` | `core` |
| `react` | `core`, `renderer`, `react` |
| `next` | `react`, `next` |
| adapters / plugins | `core` (+ optional `react` peer for UI plugins) |
| `fonts` | nothing (open fonts only) |
| `cli` | `core`, Node |

Do not put React in `core` or `renderer`.

## IR changes

- Additive optional fields on `MushafPageIR` version `1` are OK.
- Renames/removals require a version bump and migration notes.
- Always update fixtures + validation tests.

## Licensing

- Do **not** commit restricted fonts, full Madinah corpora, or any third-party
  text (Quran translations, dzikir/doa collections) without a row in
  `LICENSES/matrix.md`. A package whose source is not ✅ there stays
  `"private": true`.
- Content packages keep `LICENSE`, `NOTICE.md` (source, terms, attribution) and
  `src/data/provenance.json` up to date. See "Adding a content package" in the
  README.
- Text or translation corrections: cite the source you corrected against.
- Synthetic fixtures are fine under MIT.

## Pull requests

1. Keep PRs reviewable (prefer the design doc PR plan slices).
2. Include tests for core logic.
3. Run `pnpm test`, `pnpm typecheck`, and (if you touch rendering) `pnpm test:e2e`.
4. If visual output changes intentionally: `pnpm test:e2e:update` and commit snapshot PNGs.
5. Add a Changeset for publishable package changes: `pnpm changeset`.

## Code of conduct

See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
