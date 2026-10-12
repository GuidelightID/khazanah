# @guidelightid/doa

Doa and dzikir collections in **Indonesian** and **English**: morning and
evening dhikr, daily dua, selected dua, and dhikr after salah. Each item has
Arabic text, Latin transliteration, translation, hadith reference, virtues
(*fawaid*) and notes. **No UI**: only data, types and helpers.

Used by [guidelight.id](https://guidelight.id) for its Doa module.

```bash
npm install @guidelightid/doa
```

```ts
import { getDuaCategory } from '@guidelightid/doa';

const harian = getDuaCategory('daily-dua');          // Indonesian by default
const daily = getDuaCategory('daily-dua', 'en');    // English
harian?.items.forEach((dua) => console.log(dua.title, dua.arabic, dua.source));
```

### One language only

The main entry loads both languages. In a browser bundle, import just one:

```ts
import { DUA_CATEGORIES, getDuaCategory } from '@guidelightid/doa/id';
```

## API

| Export | Purpose |
|---|---|
| `getDuaCategories(language?)` | all categories in `'id'` (default) or `'en'` |
| `getDuaCategory(slug, language?)` | one category |
| `DUA_CATEGORY_SLUGS`, `DUA_LANGUAGES` | the allowed values |
| `isDuaCategorySlug(s)` | narrow a string (e.g. a URL param) |
| `@guidelightid/doa/id`, `/en` | `DUA_CATEGORIES` and `getDuaCategory(slug)` for one language |
| `@guidelightid/doa/provenance` | source repo, commit, SHA-256 per file, changes made |

| Category (`slug`) | Indonesian | English | Items |
|---|---|---|---|
| `morning-dhikr` | Dzikir Pagi | Morning Dhikr | 19 |
| `evening-dhikr` | Dzikir Petang | Evening Dhikr | 19 |
| `daily-dua` | Doa Harian | Daily Dua | 38 |
| `selected-dua` | Doa Pilihan | Selected Dua | 8 |
| `dhikr-after-salah` | Dzikir Setelah Shalat | Dhikr After Salah | 13 |

## License and source

MIT, code and data. The data comes from
[fitrahive/dua-dhikr](https://github.com/fitrahive/dua-dhikr) (MIT, © 2023
Fitrahive); see [NOTICE.md](./NOTICE.md) for the pinned commit and the small
changes made on import.
