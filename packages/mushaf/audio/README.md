# `@guidelightid/mushaf-audio`

Word/ayah highlight sync plugin. **Client-only**. Strict Mode safe (abortable lifecycle).

```ts
import { audioPlugin } from '@guidelightid/mushaf-audio';

const plugin = audioPlugin({
  getAudioUrl: (verseKey) => `/audio/${verseKey}.mp3`,
  // optional word timings in seconds
  getWordTimings: async (verseKey) => [
    { wordKey: `${verseKey}:1`, start: 0, end: 0.4 },
    { wordKey: `${verseKey}:2`, start: 0.4, end: 0.9 },
  ],
});

// control from the app:
plugin.controls.playVerse('1:1');
plugin.controls.pause();
```

Highlights use tier `audio` (priority 20). Autoplay is **not** triggered without a user gesture — call `playVerse` from a click handler.
