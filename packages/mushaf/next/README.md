# `@guidelightid/mushaf-next`

Lightweight Next.js helpers for Mushaf (no hard dependency on `next` at build time).

```tsx
// app/layout.tsx or a page
import { MushafFontLinks, mushafCspDirectives } from '@guidelightid/mushaf-next';

export default function Layout({ children }) {
  return (
    <html>
      <head>
        <MushafFontLinks />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

SSR pattern (App Router):

```tsx
// app/quran/[page]/page.tsx
import { QuranProvider, QuranPage } from '@guidelightid/mushaf-react';
import { createHostedMadinahAdapter } from '@guidelightid/mushaf-adapter-kfgqpc';
import { MushafFontLinks } from '@guidelightid/mushaf-next';

const adapter = createHostedMadinahAdapter({
  baseUrl: process.env.MUSHAF_DATA_BASE ?? '/mushaf',
});

export default async function Page({ params }: { params: Promise<{ page: string }> }) {
  const { page: pageStr } = await params;
  const page = Number(pageStr);
  const initialData = await adapter.getPage(page);

  return (
    <>
      <MushafFontLinks />
      <QuranProvider adapter={adapter}>
        <QuranPage page={page} initialData={initialData} />
      </QuranProvider>
    </>
  );
}
```

CSP helper: `mushafCspDirectives({ connectSrc: ['https://api.quran.com'] })`.
