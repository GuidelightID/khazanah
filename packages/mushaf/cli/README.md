# `@guidelight.id/mushaf-cli`

Dual-distribution helper for Mushaf assets (ADR-013).

```bash
# list allowlisted sources
pnpm exec mushaf data sources

# write MIT synthetic fixtures for local PageLoader demos
pnpm exec mushaf data pull --source fixture --out ./public/mushaf
```

Restricted sources (`kfgqpc`, full QF corpus republish) remain **disabled** until `LICENSES/matrix.md` is approved.

Then point an adapter at the output:

```ts
import { createHostedAdapter } from '@guidelight.id/mushaf-adapter-custom';
// or: import { createHostedMadinahAdapter } from '@guidelight.id/mushaf-adapter-kfgqpc';

const adapter = createHostedAdapter({ baseUrl: '/mushaf' });
```

Pull writes: `pages/*.json`, `pages.manifest.json`, `catalog.json`, `verse-index.json`, `NOTICE`, `licenses.json`.
