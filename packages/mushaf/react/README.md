# `@guidelight.id/mushaf-react`

React bindings for Mushaf: `QuranProvider`, `QuranPage`, and hooks.

```tsx
import { QuranProvider, QuranPage, QuranViewer } from '@guidelight.id/mushaf-react';
import { fixtureAdapter } from '@guidelight.id/mushaf-core';

export function App() {
  return (
    <QuranProvider adapter={fixtureAdapter}>
      <QuranPage page={1} />
      {/* or multi-page virtualized scroller */}
      <QuranViewer pages={[1, 5]} initialPage={1} style={{ height: '70vh' }} />
    </QuranProvider>
  );
}
```

Requires an explicit `adapter` (KD-15). For SSR, pass `initialData` from a Server Component.

Hooks: `useQuran`, `usePage`, `useSurah`, `useAyah`, `useWord`, `useSelection` (single-page).
