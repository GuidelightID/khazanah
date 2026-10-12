# `@mushaf/tajwid`

Tajweed coloring plugin for Mushaf (`mode="tajweed"` sugar expects this or a compatible plugin).

```ts
import { tajweedPlugin } from '@mushaf/tajwid';
import { QuranProvider } from '@mushaf/react';

<QuranProvider adapter={adapter} plugins={[tajweedPlugin({ scheme: 'default' })]}>
  <QuranPage page={1} mode="tajweed" />
</QuranProvider>
```

Colors apply via `provideHighlights` from glyph/word `tajweed` tokens on IR when present. Without tajweed annotations on the page IR, the plugin is a no-op (plain paint).

**Contrast:** plain mode remains AA. Under `prefers-contrast: more`, hosts should force plain (document in a11y guide).
