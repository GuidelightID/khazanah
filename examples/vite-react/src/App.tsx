import { useEffect, useMemo, useRef, useState } from 'react';
import {
  annotationsPlugin,
  createMemoryAnnotationStore,
  type AnnotationsPlugin,
} from '@guidelight.id/mushaf-annotations';
import { createHostedMadinahAdapter } from '@guidelight.id/mushaf-adapter-kfgqpc';
import { fixtureAdapter, type MushafAdapter, type WordIR, type WordKey } from '@guidelight.id/mushaf-core';
import {
  QuranPage,
  QuranProvider,
  QuranReader,
  QuranViewer,
  useAnnotations,
  useSearch,
  useSelection,
} from '@guidelight.id/mushaf-react';
import { tajweedPlugin } from '@guidelight.id/mushaf-tajwid';
import { createDemoAudioPlugin, demoTimingsForVerse } from './demoAudio';

type Mode = 'page' | 'viewer' | 'reader' | 'search' | 'audio' | 'notes';
type AdapterKind = 'memory' | 'hosted';

function SinglePageDemo() {
  const [lastWord, setLastWord] = useState('');
  const [highlight, setHighlight] = useState(true);
  const { selection, selectAyah, clear } = useSelection(1);

  return (
    <>
      <div className="toolbar">
        <label className="row">
          <input
            type="checkbox"
            checked={highlight}
            onChange={(e) => setHighlight(e.target.checked)}
          />
          Highlight 1:1
        </label>
        <button type="button" onClick={() => selectAyah('1:1')}>
          Select ayah 1:1
        </button>
        <button type="button" onClick={() => clear()} disabled={!selection}>
          Clear selection
        </button>
      </div>
      {lastWord ? <p className="click">Last word: {lastWord}</p> : null}
      {selection ? (
        <p className="click">
          Selection: {selection.verseKeys.join(', ')} — {selection.text}
        </p>
      ) : null}
      <QuranPage
        page={1}
        width="min(100%, 420px)"
        fontFamily='Amiri, "Times New Roman", serif'
        highlightedAyahs={highlight ? ['1:1'] : []}
        selection={selection}
        onWordClick={(word: WordIR) => {
          setLastWord(`${word.key} — ${word.text}`);
        }}
      />
    </>
  );
}

function ViewerDemo() {
  const [active, setActive] = useState(1);

  return (
    <>
      <p className="muted">Active page: {active} (scroll — nearby pages only)</p>
      <QuranViewer
        pages={[1, 5]}
        initialPage={1}
        estimatedPageHeight={520}
        style={{ height: '65vh', borderRadius: 8, border: '1px solid #ddd' }}
        onPageChange={setActive}
        pageProps={{
          width: 'min(100%, 420px)',
          fontFamily: 'Amiri, "Times New Roman", serif',
        }}
      />
    </>
  );
}

function ReaderDemo() {
  return (
    <QuranReader
      initialPage={1}
      viewerProps={{
        pages: [1, 5],
        estimatedPageHeight: 520,
        style: { height: '60vh', borderRadius: 8, border: '1px solid #ddd' },
        pageProps: {
          width: 'min(100%, 420px)',
          fontFamily: 'Amiri, "Times New Roman", serif',
        },
      }}
    />
  );
}

function SearchDemo() {
  const { query, isIndexing, isReady } = useSearch({ pages: [1, 2, 3, 4, 5] });
  const [q, setQ] = useState('بسم');
  const [hits, setHits] = useState<string[]>([]);

  return (
    <div>
      <p className="muted">
        Offline MiniSearch. Try: <code>بسم</code>, <code>Fatihah</code>, <code>1:2</code>,{' '}
        <code>3</code>
      </p>
      <div className="toolbar">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search"
          style={{ flex: 1, minWidth: 160, padding: '0.35rem 0.5rem' }}
        />
        <button
          type="button"
          disabled={isIndexing}
          onClick={async () => {
            const results = await query(q, { limit: 10 });
            setHits(
              results.map(
                (r) =>
                  `${r.type} score=${r.score.toFixed(2)} ${r.verseKey ?? ''} p${r.page ?? r.surah ?? ''} ${r.snippet ?? ''}`,
              ),
            );
          }}
        >
          {isIndexing ? 'Indexing…' : isReady ? 'Search' : 'Index & search'}
        </button>
      </div>
      <ul className="click">
        {hits.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
    </div>
  );
}

function AudioDemo({
  audio,
}: {
  audio: ReturnType<typeof createDemoAudioPlugin>;
}) {
  const [status, setStatus] = useState('Idle — press Play (user gesture)');
  const [activeWord, setActiveWord] = useState<WordKey | undefined>();
  const timerRef = useRef<number | null>(null);

  const stop = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    audio.controls.stop();
    setActiveWord(undefined);
    setStatus('Stopped');
  };

  const playDemo = () => {
    stop();
    const timings = demoTimingsForVerse('1:1');
    setStatus('Playing 1:1 (synthetic timings)…');
    void audio.controls.playVerse('1:1').catch(() => {
      /* silent wav may reject; highlights still driven below */
    });

    let i = 0;
    const step = () => {
      if (i >= timings.length) {
        audio.controls.setActiveWord(null);
        setActiveWord(undefined);
        setStatus('Done');
        return;
      }
      const w = timings[i]!;
      audio.controls.setActiveWord(w.wordKey, '1:1');
      setActiveWord(w.wordKey);
      setStatus(`Word ${w.wordKey}`);
      i += 1;
      timerRef.current = window.setTimeout(step, 450);
    };
    step();
  };

  useEffect(() => () => stop(), [audio]);

  return (
    <>
      <p className="muted">
        <code>@guidelight.id/mushaf-audio</code> demo with synthetic word timings.
      </p>
      <div className="toolbar">
        <button type="button" onClick={playDemo}>
          Play 1:1
        </button>
        <button type="button" onClick={stop}>
          Stop
        </button>
      </div>
      <p className="click">{status}</p>
      <QuranPage
        page={1}
        width="min(100%, 420px)"
        fontFamily='Amiri, "Times New Roman", serif'
        highlightedWords={activeWord ? [activeWord] : []}
        onWordClick={(word) => setStatus(`Clicked ${word.key}`)}
      />
    </>
  );
}

function NotesDemo() {
  const { api, annotations } = useAnnotations();
  const [note, setNote] = useState('My note on 1:1');
  const [status, setStatus] = useState('');

  if (!api) {
    return <p className="muted">Annotations plugin not registered.</p>;
  }

  return (
    <>
      <p className="muted">
        <code>@guidelight.id/mushaf-annotations</code> + <code>useAnnotations</code>. Add a note on ayah 1:1;
        underline highlight appears on the page.
      </p>
      <div className="toolbar">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          aria-label="Note text"
          style={{ flex: 1, minWidth: 160, padding: '0.35rem 0.5rem' }}
        />
        <button
          type="button"
          onClick={async () => {
            await api.add({
              target: { type: 'verse', verseKey: '1:1' },
              note,
              color: 'rgba(255, 200, 50, 0.4)',
            });
            setStatus('Added note on 1:1');
          }}
        >
          Add note 1:1
        </button>
        <button
          type="button"
          onClick={async () => {
            await api.clear();
            setStatus('Cleared all notes');
          }}
          disabled={annotations.length === 0}
        >
          Clear all
        </button>
      </div>
      {status ? <p className="click">{status}</p> : null}
      <ul className="click">
        {annotations.map((a) => (
          <li key={a.id}>
            {a.target.type === 'verse' ? a.target.verseKey : a.target.type}: {a.note ?? '(no text)'}{' '}
            <button type="button" onClick={() => void api.remove(a.id)}>
              remove
            </button>
          </li>
        ))}
      </ul>
      <QuranPage
        page={1}
        width="min(100%, 420px)"
        fontFamily='Amiri, "Times New Roman", serif'
        onWordClick={async (word) => {
          await api.add({
            target: { type: 'word', wordKey: word.key },
            note: `Marked ${word.key}`,
            color: 'rgba(120, 200, 120, 0.4)',
          });
          setStatus(`Annotated word ${word.key}`);
        }}
      />
      <p className="muted">Tip: click a word to annotate it.</p>
    </>
  );
}

export function App() {
  const [mode, setMode] = useState<Mode>('page');
  const [adapterKind, setAdapterKind] = useState<AdapterKind>('memory');
  const [hostedOk, setHostedOk] = useState<boolean | null>(null);
  const [hostedError, setHostedError] = useState<string>('');

  const audio = useMemo(() => createDemoAudioPlugin(), []);
  const tajweed = useMemo(() => tajweedPlugin({ scheme: 'default' }), []);
  const notesPlugin: AnnotationsPlugin = useMemo(
    () => annotationsPlugin({ store: createMemoryAnnotationStore() }),
    [],
  );

  const hostedAdapter = useMemo(
    () =>
      createHostedMadinahAdapter({
        baseUrl: '/mushaf',
        verifyHash: false,
      }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/mushaf/pages.manifest.json');
        if (!cancelled) {
          setHostedOk(res.ok);
          if (!res.ok) setHostedError('Run: pnpm --filter @guidelight.id/example-vite-react pull-data');
        }
      } catch {
        if (!cancelled) {
          setHostedOk(false);
          setHostedError('Hosted pack not reachable at /mushaf');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const adapter: MushafAdapter =
    adapterKind === 'hosted' && hostedOk ? hostedAdapter : fixtureAdapter;

  return (
    <div className="app">
      <header className="header">
        <h1>Mushaf</h1>
        <p className="muted">
          Open-source Quran page renderer for React — fixture demo (not printed Madinah plates).
        </p>
        <div className="toolbar">
          <button
            type="button"
            className={adapterKind === 'memory' ? 'active' : ''}
            onClick={() => setAdapterKind('memory')}
          >
            Memory fixture
          </button>
          <button
            type="button"
            className={adapterKind === 'hosted' ? 'active' : ''}
            onClick={() => setAdapterKind('hosted')}
            disabled={hostedOk === false}
            title={hostedError || 'Load /mushaf pack'}
          >
            Hosted /mushaf
          </button>
        </div>
        {adapterKind === 'hosted' && hostedOk === false ? (
          <p className="muted">{hostedError}</p>
        ) : null}

        <div className="toolbar">
          {(
            [
              ['page', 'QuranPage'],
              ['viewer', 'Viewer'],
              ['reader', 'Reader'],
              ['search', 'Search'],
              ['audio', 'Audio'],
              ['notes', 'Notes'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={mode === id ? 'active' : ''}
              onClick={() => setMode(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <QuranProvider
        key={adapterKind + String(hostedOk)}
        adapter={adapter}
        plugins={[tajweed, audio, notesPlugin]}
      >
        {mode === 'page' ? (
          <SinglePageDemo />
        ) : mode === 'viewer' ? (
          <ViewerDemo />
        ) : mode === 'reader' ? (
          <ReaderDemo />
        ) : mode === 'search' ? (
          <SearchDemo />
        ) : mode === 'audio' ? (
          <AudioDemo audio={audio} />
        ) : (
          <NotesDemo />
        )}
      </QuranProvider>
    </div>
  );
}
