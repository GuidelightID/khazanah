# `@guidelight.id/mushaf-adapter-tanzil`

**Text-flow** adapter — not layout-faithful Madinah geometry.

Use when you have Uthmani verse text (Tanzil-style) and need a readable page surface without plate IR.

```ts
import { createTanzilAdapter, sampleTanzilCorpus } from '@guidelight.id/mushaf-adapter-tanzil';

const adapter = createTanzilAdapter({ corpus: sampleTanzilCorpus });
```

## Licensing

- Package **code**: MIT  
- Quran text you supply: follow **Tanzil / source license** (document in your app).  
- `sampleTanzilCorpus` is a tiny demo subset for tests — not a full mushaf.

## Fidelity

| Capability | Status |
|------------|--------|
| Surah/ayah text | Yes |
| Page buckets | Approximate (words-per-page packing) |
| Madinah line geometry | **No** |
| Pixel-perfect plates | Use hosted KFGQPC pack instead |
