# `@guidelight.id/mushaf-adapter-kfgqpc`

Hosted Madinah adapter intended for **KFGQPC / QPC-style** page packs served from your app after:

```bash
# when license matrix allows:
mushaf data pull --source kfgqpc --out ./public/mushaf
```

Until that source is enabled, use the **fixture** pull for local layout demos:

```bash
mushaf data pull --source fixture --out ./public/mushaf
```

```ts
import { createHostedMadinahAdapter } from '@guidelight.id/mushaf-adapter-kfgqpc';

const adapter = createHostedMadinahAdapter({ baseUrl: '/mushaf' });
```

**Code** is MIT. **Asset licenses** come from the pulled pack (`NOTICE` / `licenses.json`) — never assume MIT for real Madinah fonts/geometry.
