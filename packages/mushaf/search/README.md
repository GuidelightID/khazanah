# `@guidelight.id/mushaf-search`

Offline search over a `SearchCorpus` using [MiniSearch](https://lucaong.github.io/minisearch/), with Arabic normalization from `@guidelight.id/mushaf-core`.

```ts
import { createSearchEngine, corpusFromPages } from '@guidelight.id/mushaf-search';
import { fixturePages, fixtureCatalog } from '@guidelight.id/mushaf-core';

const engine = createSearchEngine();
const corpus = corpusFromPages(Object.values(fixturePages), {
  locale: 'ar',
  surahs: fixtureCatalog.surahs,
});
await engine.ensureIndex('ar', corpus);
const hits = await engine.search('بسم', { locale: 'ar', limit: 10 });
```

Supports verse text, page number, surah name, and verse-key queries (`2:255`).
