import {
  HIGHLIGHT_TIERS,
  type Highlight,
  type MushafPlugin,
  type MushafPluginContext,
  type VerseKey,
  type WordKey,
} from '@mushaf/core';
import { wordAtTime, type WordTiming } from './timings.js';

export interface AudioPluginOptions {
  getAudioUrl: (verseKey: VerseKey) => string;
  getWordTimings?: (verseKey: VerseKey) => Promise<WordTiming[]> | WordTiming[];
  highlightColor?: string;
}

export interface AudioPluginControls {
  playVerse: (verseKey: VerseKey) => Promise<void>;
  pause: () => void;
  stop: () => void;
  getCurrentVerse: () => VerseKey | null;
  getCurrentWord: () => WordKey | null;
  /** For demos / external clocks — sets highlight word and emits audio:timeupdate */
  setActiveWord: (wordKey: WordKey | null, verseKey?: VerseKey) => void;
}

export interface AudioPlugin extends MushafPlugin {
  controls: AudioPluginControls;
}

/**
 * Client-only audio highlight plugin.
 * Abortable setup for React Strict Mode double-mount.
 */
export function audioPlugin(options: AudioPluginOptions): AudioPlugin {
  let ctx: MushafPluginContext | null = null;
  let audio: HTMLAudioElement | null = null;
  let generation = 0;
  let currentVerse: VerseKey | null = null;
  let currentWord: WordKey | null = null;
  let timings: WordTiming[] = [];
  let onTimeUpdate: (() => void) | null = null;
  let onEnded: (() => void) | null = null;

  const color = options.highlightColor ?? 'rgba(80, 160, 255, 0.4)';

  function clearAudioListeners() {
    if (audio && onTimeUpdate) audio.removeEventListener('timeupdate', onTimeUpdate);
    if (audio && onEnded) audio.removeEventListener('ended', onEnded);
    onTimeUpdate = null;
    onEnded = null;
  }

  function destroyAudio() {
    clearAudioListeners();
    if (audio) {
      audio.pause();
      audio.src = '';
      audio = null;
    }
  }

  function setWord(wordKey: WordKey | null) {
    currentWord = wordKey;
    // Always emit so React can clear highlights when word becomes null
    ctx?.emit({
      type: 'audio:timeupdate',
      verseKey: currentVerse ?? ('0:0' as VerseKey),
      wordKey: wordKey ?? undefined,
    });
  }

  const controls: AudioPluginControls = {
    async playVerse(verseKey) {
      if (typeof Audio === 'undefined') {
        throw new Error('HTMLAudioElement not available (server?)');
      }
      const gen = ++generation;
      destroyAudio();
      currentVerse = verseKey;
      timings = (await options.getWordTimings?.(verseKey)) ?? [];
      if (gen !== generation) return;

      const el = new Audio(options.getAudioUrl(verseKey));
      audio = el;

      onTimeUpdate = () => {
        if (gen !== generation || !audio) return;
        const w = wordAtTime(timings, audio.currentTime);
        if (w !== currentWord) setWord(w);
        if (currentVerse) {
          ctx?.emit({
            type: 'audio:timeupdate',
            verseKey: currentVerse,
            wordKey: w ?? undefined,
          });
        }
      };
      onEnded = () => {
        if (gen !== generation) return;
        setWord(null);
        currentVerse = null;
      };
      el.addEventListener('timeupdate', onTimeUpdate);
      el.addEventListener('ended', onEnded);

      try {
        await el.play();
      } catch (e) {
        ctx?.log.warn('[mushaf/audio] play() failed — needs user gesture?', e);
        throw e;
      }
    },
    pause() {
      audio?.pause();
    },
    stop() {
      generation += 1;
      destroyAudio();
      setWord(null);
      currentVerse = null;
    },
    getCurrentVerse: () => currentVerse,
    getCurrentWord: () => currentWord,
    setActiveWord(wordKey, verseKey) {
      if (verseKey) currentVerse = verseKey;
      setWord(wordKey);
    },
  };

  const plugin: AudioPlugin = {
    name: 'audio',
    version: '0.0.0',
    clientOnly: true,
    highlightTier: HIGHLIGHT_TIERS.audio,
    controls,
    onInit(c) {
      ctx = c;
    },
    onDestroy() {
      generation += 1;
      destroyAudio();
      ctx = null;
      currentVerse = null;
      currentWord = null;
      timings = [];
    },
    provideHighlights(): Highlight[] {
      if (!currentWord) return [];
      return [
        {
          id: `audio-word-${currentWord}`,
          target: { type: 'word', wordKey: currentWord },
          style: { color, className: 'mushaf-audio-word', pulse: true },
          source: 'audio',
          priority: HIGHLIGHT_TIERS.audio,
        },
      ];
    },
    provideCommands: () => [
      {
        id: 'audio.pause',
        label: 'Pause audio',
        run: () => controls.pause(),
      },
      {
        id: 'audio.stop',
        label: 'Stop audio',
        run: () => controls.stop(),
      },
    ],
  };

  return plugin;
}
