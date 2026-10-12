# @guidelightid/almatsurat

Dzikir **Al-Ma'tsurat** compiled by Imam Hasan Al-Banna: the short (*sugro*)
and long (*kubro*) collections, for morning (*pagi*) and evening (*petang*).
Each item has Arabic text, Latin transliteration, Indonesian translation and the
recommended number of repetitions. **No UI**, only data, types and helpers.

Used by [guidelight.id](https://guidelight.id) for the Light Journey dzikir module.

```bash
npm install @guidelightid/almatsurat
```

```ts
import { getAlMatsurat } from '@guidelightid/almatsurat';

const pagi = getAlMatsurat('sugro', 'pagi');
for (const item of pagi.data) {
  console.log(item.title, `${item.repeat}x`, item.arabic);
}
```

### Smaller bundles

The main entry loads all four collections. In a browser bundle, import only
the variant you use:

```ts
import { getAlMatsuratSugro } from '@guidelightid/almatsurat/sugro';

const petang = getAlMatsuratSugro('petang');
```

`@guidelightid/almatsurat/kubro` works the same way (`getAlMatsuratKubro`).

## API

| Export | Purpose |
|---|---|
| `getAlMatsurat(variant, time)` | one collection: `variant` is `'sugro' \| 'kubro'`, `time` is `'pagi' \| 'petang'` |
| `ALMATSURAT_VARIANTS`, `ALMATSURAT_TIMES` | the allowed values, for building selectors |
| `isAlMatsuratVariant(s)`, `isAlMatsuratTime(s)` | narrow a string (e.g. a URL param) |
| `@guidelightid/almatsurat/sugro`, `/kubro` | one variant only: `ALMATSURAT_SUGRO` / `getAlMatsuratSugro(time)`, and the kubro equivalents |
| `@guidelightid/almatsurat/provenance` | source repo, commit and SHA-256 of each file |

Types: `AlMatsuratCollection`, `AlMatsuratItem` (`type: 'single' \| 'parent'`;
a `parent` item such as a surah lists its verses in `data`), `AlMatsuratSubItem`.

| Collection | Items |
|---|---|
| sugro pagi / petang | 32 |
| kubro pagi / petang | 40 |

## License and source

MIT, code and data. The data comes from
[aliifam/almatsurat](https://github.com/aliifam/almatsurat) (MIT, © 2024 Aliif
Arief); see [NOTICE.md](./NOTICE.md) for the pinned commit and a note on the
translations.
