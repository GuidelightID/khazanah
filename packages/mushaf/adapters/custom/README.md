# `@guidelightid/mushaf-adapter-custom`

Helpers for app-owned Mushaf data:

- `defineAdapter` — re-export from `@guidelightid/mushaf-core`
- `createHostedAdapter` — load `pages.manifest.json` + per-page IR from a host/CDN base URL (output of `mushaf data pull`)

```ts
import { createHostedAdapter } from '@guidelightid/mushaf-adapter-custom';

const adapter = createHostedAdapter({
  baseUrl: '/mushaf', // after: mushaf data pull --source fixture --out ./public/mushaf
});
```

Expected layout:

```text
/mushaf/
  pages.manifest.json
  pages/0001.json
  catalog.json          (optional)
  verse-index.json      (optional: { "1:1": 1, ... })
  NOTICE
  licenses.json
```
