# `@guidelight/mushaf-annotations`

User notes / bookmarks as a Mushaf plugin. Highlights use the **props** tier by default so notes sit above tajweed/audio ambient colors when desired.

```ts
import { annotationsPlugin, createMemoryAnnotationStore } from '@guidelight/mushaf-annotations';

const store = createMemoryAnnotationStore();
const plugin = annotationsPlugin({ store });

await plugin.api.add({
  target: { type: 'verse', verseKey: '1:1' },
  note: 'Opening of the Book',
  color: 'rgba(255, 200, 0, 0.35)',
});
```

Persistence is pluggable (`AnnotationStore`). Ships with in-memory and `localStorage` stores (browser).
