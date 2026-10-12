# `@guidelightid/mushaf-adapter-quran-foundation`

Maps [Quran.com API v4](https://api.quran.com/api/v4) (Quran Foundation) resources to `MushafPageIR`.

## License note (ADR-013)

- This package’s **code** is MIT.
- API responses are subject to **Quran Foundation / Quran.com terms**.
- Cached IR is for local/app use — **not** republished as MIT npm data (`allowsNpmRedistribution: false`).

## Usage

```ts
import { createQuranFoundationAdapter } from '@guidelightid/mushaf-adapter-quran-foundation';

const adapter = createQuranFoundationAdapter({
  // optional: baseUrl, fetchImpl, language
});

const page = await adapter.getPage(1);
```

## Source → IR mapping

| IR field | API field |
|----------|-----------|
| `page` | route / `page_number` |
| `words[].text` | `word.text_uthmani` / `text` |
| `words[].key` | `{verse_key}:{position}` |
| `words[].line` | `word.line_number` |
| `words[].charType` | `word.char_type_name` |
| `words[].bbox` | derived line layout (unicode_bbox) |
| `words[].externalId` | `word.id` |
| `metrics.fontModel` | always `unicode_bbox` for this adapter |

Word bboxes are **layout approximations** from line grouping (not pixel-perfect Madinah plates). Use a KFGQPC/hosted geometry adapter for plate fidelity when licensed.
