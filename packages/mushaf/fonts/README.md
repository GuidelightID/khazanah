# `@guidelightid/mushaf-fonts`

**Open** Arabic font helpers only. Restricted KFGQPC / QPC page fonts are **not** shipped here (ADR-013).

```ts
import { MUSHAF_OPEN_ARABIC_STACK, googleFontsCssUrl } from '@guidelightid/mushaf-fonts';
// or CSS:
import '@guidelightid/mushaf-fonts/css/arabic.css';
```

For production Madinah plate fonts, use `mushaf data pull` into the app (when license matrix allows) and self-host WOFF2 under your origin.
