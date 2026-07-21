# Guidelight Phase A spike (catalog / page-index)

This is **not** a full Guidelight product integration. It documents how to replace the dual-API glue in Guardian of the Light with Mushaf **without** claiming layout fidelity validation.

## What Guidelight does today

| Hook | Source | Purpose |
|------|--------|---------|
| `useQuranData` | `api.alquran.cloud/v1/surah` | Surah list + ayah counts |
| `useQuranPages` | `api.quran.com/api/v4` | Ayah → Madinah page mapping |

GOTL uses these for **memorization progress / daily page ranges**, not mushaf rendering.

## Phase A goal

Replace both with a single `MushafAdapter`:

```ts
import { createQuranFoundationAdapter } from '@mushaf/adapter-quran-foundation';
// or hosted offline after data pull:
// import { createHostedMadinahAdapter } from '@mushaf/adapter-kfgqpc';

const adapter = createQuranFoundationAdapter();

// Surah list
const catalog = await adapter.getCatalog();
const surahs = catalog.surahs; // number, names, ayahCount, startPage

// Ayah → page (replaces useQuranPages.getAyahPage)
const page = await adapter.getPageForVerse?.('2:255');
```

### Mapping to Guidelight types

```ts
// Guidelight Surah ≈
catalog.surahs.map((s) => ({
  number: s.number,
  name: s.nameArabic,
  englishName: s.nameSimple,
  numberOfAyahs: s.ayahCount,
}));
```

### Offline path (preferred for PWA)

```bash
# from monorepo (fixture demo)
pnpm --filter @mushaf/cli build
node packages/cli/dist/cli.js data pull --source fixture --out ./public/mushaf
```

```ts
import { createHostedMadinahAdapter } from '@mushaf/adapter-kfgqpc';

const adapter = createHostedMadinahAdapter({ baseUrl: '/mushaf' });
// catalog.json + verse-index.json served from public/mushaf
```

## Phase B (optional)

Only if product wants a reader UI:

```tsx
import { QuranProvider, QuranPage } from '@mushaf/react';

<QuranProvider adapter={adapter}>
  <QuranPage page={page} />
</QuranProvider>
```

Phase B validates **rendering**, not Phase A.

## Acceptance criteria (Phase A)

- [ ] Surah list matches prior alquran.cloud counts (114 surahs)
- [ ] Spot-check ayah→page vs quran.com for: `1:1`, `2:255`, `18:1`, `114:6`
- [ ] No dual API calls in GOTL page-range path
- [ ] Offline catalog works when using hosted pack
- [ ] Does **not** require `@mushaf/react` for Phase A

## Non-goals

- Pixel-perfect Madinah in Guidelight
- Replacing Amiri body text site-wide
- Shipping restricted KFGQPC fonts without license matrix approval

## Minimal Node script (parity check)

See `parity-check.mjs` in this folder — run with network for QF adapter spot checks.
